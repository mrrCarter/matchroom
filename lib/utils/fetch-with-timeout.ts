const DEFAULT_TIMEOUT_MS = 8000;

export interface FetchWithTimeoutInit extends RequestInit {
  timeoutMs?: number;
}

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: FetchWithTimeoutInit = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = init;
  const controller = new AbortController();
  const abortFromParent = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    abortFromParent();
  } else {
    signal?.addEventListener("abort", abortFromParent, { once: true });
  }

  const timeoutId = globalThis.setTimeout(() => {
    controller.abort(new DOMException("Request timed out.", "TimeoutError"));
  }, timeoutMs);

  return fetch(input, { ...rest, signal: controller.signal }).finally(() => {
    globalThis.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortFromParent);
  });
}
