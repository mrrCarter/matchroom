#!/usr/bin/env python3
"""Run a Sentinelayer session listener for Codex coordination.

This intentionally wraps `sl session listen` so Sentinelayer owns delivery
cursoring, remote polling, and active/idle cadence.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import signal
import subprocess
import sys
from pathlib import Path


DEFAULT_SESSION_ID = "a9108816-8621-4efd-ae9e-65d83d70c734"
DEFAULT_AGENT_ID = "codex"
DEFAULT_LOG_FILE = ".sentinelayer/codex-listen.ndjson"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Listen for Sentinelayer session events and mirror them to a local log."
    )
    parser.add_argument("--session", default=DEFAULT_SESSION_ID, help="Sentinelayer session id.")
    parser.add_argument("--agent", default=DEFAULT_AGENT_ID, help="Agent id to listen as.")
    parser.add_argument("--interval", type=int, default=60, help="Idle poll interval in seconds.")
    parser.add_argument(
        "--active-interval",
        type=int,
        default=5,
        help="Poll interval after recent human activity, in seconds.",
    )
    parser.add_argument(
        "--emit",
        choices=("ndjson", "text"),
        default="ndjson",
        help="Output format passed through to Sentinelayer.",
    )
    parser.add_argument(
        "--log-file",
        default=DEFAULT_LOG_FILE,
        help="File that receives the listener output.",
    )
    parser.add_argument(
        "--from-now",
        action="store_true",
        help="Advance the listener cursor before polling future events.",
    )
    parser.add_argument(
        "--replay",
        action="store_true",
        help="Emit matching historical events on the first poll.",
    )
    parser.add_argument("--since", help="Override the persisted Sentinelayer listen cursor.")
    parser.add_argument("--max-polls", type=int, help="Stop after N poll cycles for smoke tests.")
    parser.add_argument(
        "--path",
        default=".",
        help="Workspace path passed through to Sentinelayer.",
    )
    parser.add_argument(
        "--print-command",
        action="store_true",
        help="Print the resolved Sentinelayer command before running.",
    )
    args = parser.parse_args()

    if args.from_now and args.replay:
        parser.error("--from-now and --replay are mutually exclusive")
    if args.interval < 1:
        parser.error("--interval must be at least 1 second")
    if args.active_interval < 1:
        parser.error("--active-interval must be at least 1 second")
    return args


def find_sl() -> str:
    names = ["sl.cmd", "sl"] if os.name == "nt" else ["sl", "sl.cmd"]
    for name in names:
        found = shutil.which(name)
        if found:
            return found
    raise SystemExit("Sentinelayer CLI was not found on PATH. Install it or add sl/sl.cmd to PATH.")


def build_command(args: argparse.Namespace) -> list[str]:
    cmd = [
        find_sl(),
        "session",
        "listen",
        "--session",
        args.session,
        "--agent",
        args.agent,
        "--interval",
        str(args.interval),
        "--active-interval",
        str(args.active_interval),
        "--emit",
        args.emit,
        "--path",
        str(Path(args.path).resolve()),
    ]
    if args.from_now:
        cmd.append("--from-now")
    if args.replay:
        cmd.append("--replay")
    if args.since:
        cmd.extend(["--since", args.since])
    if args.max_polls is not None:
        cmd.extend(["--max-polls", str(args.max_polls)])
    return cmd


def resolve_log_file(path: str) -> Path:
    log_file = Path(path)
    if not log_file.is_absolute():
        log_file = Path.cwd() / log_file
    log_file.parent.mkdir(parents=True, exist_ok=True)
    return log_file


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def write_meta(log_handle, event: str, **fields: object) -> None:
    payload = {"pollerEvent": event, "ts": now_iso(), **fields}
    log_handle.write(json.dumps(payload, separators=(",", ":")) + "\n")
    log_handle.flush()


def main() -> int:
    args = parse_args()
    cmd = build_command(args)
    log_file = resolve_log_file(args.log_file)

    if args.print_command:
        print(" ".join(cmd))

    process: subprocess.Popen[str] | None = None

    def stop(_signum, _frame) -> None:
        if process and process.poll() is None:
            process.terminate()

    signal.signal(signal.SIGTERM, stop)
    if hasattr(signal, "SIGINT"):
        signal.signal(signal.SIGINT, stop)

    with log_file.open("a", encoding="utf-8", buffering=1) as log_handle:
        write_meta(
            log_handle,
            "started",
            session=args.session,
            agent=args.agent,
            interval=args.interval,
            activeInterval=args.active_interval,
            command=cmd,
        )
        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )
            assert process.stdout is not None
            for line in process.stdout:
                sys.stdout.write(line)
                sys.stdout.flush()
                log_handle.write(line)
            return_code = process.wait()
        except KeyboardInterrupt:
            if process and process.poll() is None:
                process.terminate()
            return_code = 130
        except Exception as exc:
            write_meta(log_handle, "error", error=str(exc))
            raise
        finally:
            write_meta(log_handle, "stopped", returnCode=process.returncode if process else None)

    return int(return_code or 0)


if __name__ == "__main__":
    raise SystemExit(main())
