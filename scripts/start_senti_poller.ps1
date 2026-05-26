param(
    [string]$Session = "a9108816-8621-4efd-ae9e-65d83d70c734",
    [string]$Agent = "codex",
    [int]$Interval = 60,
    [int]$ActiveInterval = 5,
    [string]$LogFile = ".sentinelayer\codex-listen.ndjson",
    [switch]$Replay,
    [switch]$NoFromNow,
    [int]$MaxPolls = 0
)

$ErrorActionPreference = "Stop"

function Quote-Arg {
    param([string]$Value)
    if ($Value -notmatch '[\s"]') {
        return $Value
    }
    return '"' + ($Value -replace '"', '\"') + '"'
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = Resolve-Path (Join-Path $scriptDir "..")
$poller = Join-Path $scriptDir "senti_poller.py"

$python = Get-Command python -ErrorAction SilentlyContinue
$pythonArgs = @()
if ($python) {
    $pythonExe = $python.Source
} else {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if (-not $py) {
        throw "Python was not found. Install Python or add python/py to PATH."
    }
    $pythonExe = $py.Source
    $pythonArgs += "-3"
}

$listenerArgs = @(
    $poller,
    "--session", $Session,
    "--agent", $Agent,
    "--interval", "$Interval",
    "--active-interval", "$ActiveInterval",
    "--log-file", (Join-Path $workspace $LogFile),
    "--path", "$workspace"
)

if ($Replay) {
    $listenerArgs += "--replay"
} elseif (-not $NoFromNow) {
    $listenerArgs += "--from-now"
}

if ($MaxPolls -gt 0) {
    $listenerArgs += @("--max-polls", "$MaxPolls")
}

$allArgs = $pythonArgs + $listenerArgs
$argumentList = ($allArgs | ForEach-Object { Quote-Arg "$_" }) -join " "
$process = Start-Process -FilePath $pythonExe -ArgumentList $argumentList -WorkingDirectory $workspace -WindowStyle Hidden -PassThru

Write-Output "Started Senti poller pid=$($process.Id) session=$Session agent=$Agent log=$(Join-Path $workspace $LogFile)"
