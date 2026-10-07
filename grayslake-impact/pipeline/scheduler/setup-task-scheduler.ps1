<#
.SYNOPSIS
  Registers (or removes) the Windows Task Scheduler job that runs the
  Grayslake tracker research pipeline, IN DRY-RUN MODE ONLY. Run it by hand;
  nothing else runs it.

.DESCRIPTION
  One task, "GrayslakeTracker-ResearchJob", starts every 30 minutes and runs

      node --use-system-ca <repo>\grayslake-impact\pipeline\scripts\run-job.mjs

  Dry run only (owner decision, 2026-10-01): the task never passes --live, and
  this script refuses to register while config/pipeline.yaml has
  job.live: true. Drafts become PR files in private-info\reports\dry-run\;
  nothing is opened on the site repo. ntfy pushes are real when
  notify.ntfy.send_in_dry_run is true and NTFY_TOPIC is set; each links to the
  dry-run PR file in the private repo.

  The job decides which fetchers are due (config/pipeline.yaml,
  job.cadence_minutes), so one task covers every cadence.

  Why Task Scheduler: built into Windows, survives reboots, needs no
  always-running process or global npm package, and has the two settings this
  job needs: "StartWhenAvailable" (a start missed while the machine slept or
  was off runs as soon as it is back; the job's own catch-up covers the rest)
  and "RunOnlyIfNetworkAvailable".

  The task runs only while you are logged on, so no password is stored. It
  does not wake the computer. It reads your user environment variables
  (NTFY_TOPIC, NTFY_TOKEN, IA_S3_ACCESS, IA_S3_SECRET) at each start.

.PARAMETER RepoDir
  The site repository folder (the one holding grayslake-impact). Defaults to
  the repository this script sits in, found from the script's own path, so
  the current folder does not matter.

.PARAMETER Preview
  Print what would be registered and change nothing.

.PARAMETER Unregister
  Remove the task.

.EXAMPLE
  .\setup-task-scheduler.ps1 -Preview
  .\setup-task-scheduler.ps1             # dry-run job every 30 minutes
  .\setup-task-scheduler.ps1 -Unregister
#>
[CmdletBinding()]
param(
  [string]$RepoDir,
  [int]$IntervalMinutes = 30,
  [switch]$Preview,
  [switch]$Unregister
)
$ErrorActionPreference = 'Stop'
$TaskName = 'GrayslakeTracker-ResearchJob'

# Every path below is absolute and comes from this script's own location (or
# -RepoDir), never from the current folder. Not in the param block: Windows
# PowerShell 5.1 leaves $PSScriptRoot empty while evaluating param defaults
# under -File.
$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { $MyInvocation.MyCommand.Path }
if (-not $scriptPath) { throw 'Cannot tell where setup-task-scheduler.ps1 is; run it with -File <path>, or pass -RepoDir' }
if ($RepoDir) {
  $RepoDir = (Resolve-Path -LiteralPath $RepoDir).Path
} else {
  $RepoDir = (Resolve-Path -LiteralPath (Join-Path (Split-Path -Parent $scriptPath) '..\..\..')).Path
}

if ($Unregister) {
  if ($Preview) { "Would unregister task $TaskName"; return }
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  "Unregistered $TaskName"
  return
}

$node = (Get-Command node -ErrorAction Stop).Source
$appDir = Join-Path $RepoDir 'grayslake-impact'
$script = Join-Path $appDir 'pipeline\scripts\run-job.mjs'
if (-not (Test-Path -LiteralPath $script)) { throw "run-job.mjs not found at $script" }

# Dry run only: refuse if the config would make the job live.
$config = Get-Content -LiteralPath (Join-Path $appDir 'config\pipeline.yaml') -Raw
if ($config -match '(?m)^\s+live:\s*true') { throw 'config/pipeline.yaml has job.live: true; this script registers the dry-run job only' }

$arguments = "--use-system-ca `"$script`""
$action = New-ScheduledTaskAction -Execute $node -Argument $arguments -WorkingDirectory $appDir
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

# The task reads your user environment variables, so that is the one that
# counts; only whether NTFY_TOPIC is set is printed, never its value.
$ntfy = if ([Environment]::GetEnvironmentVariable('NTFY_TOPIC', 'User')) { 'set (user environment)' }
  elseif ($env:NTFY_TOPIC) { 'set in this session only; the task will not see it (set it as a user environment variable)' }
  else { 'not set (notifications written to files only)' }

if ($Preview) {
  "Task:        $TaskName"
  "Command:     `"$node`" $arguments"
  "Working dir: $appDir"
  "Schedule:    every $IntervalMinutes minutes, starting 2 minutes after registration"
  "Settings:    StartWhenAvailable, RunOnlyIfNetworkAvailable, IgnoreNew, 2 h limit, runs on battery"
  "Runs as:     $env:USERDOMAIN\$env:USERNAME, only while logged on (no stored password)"
  "Mode:        dry run (no --live; config job.live is false). ntfy pushes are real if NTFY_TOPIC is set."
  "NTFY_TOPIC:  $ntfy"
  'Nothing was registered (-Preview).'
  return
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'Grayslake Data Center Tracker research pipeline, dry run (pipeline/scripts/run-job.mjs). Writes dry-run PR files to private-info; opens nothing on the site repo.' | Out-Null
"Registered $TaskName (dry run). First run in about 2 minutes; logs in private-info\logs\job\, PR files in private-info\reports\dry-run\."
