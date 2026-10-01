<#
.SYNOPSIS
  Registers (or removes) the Windows Task Scheduler job that runs the
  Grayslake tracker research pipeline. Run it by hand; nothing else runs it.

.DESCRIPTION
  One task, "GrayslakeTracker-ResearchJob", starts every 30 minutes and runs

      node --use-system-ca <repo>\grayslake-impact\pipeline\scripts\run-job.mjs [--live]

  The job itself decides which fetchers are due (config/pipeline.yaml,
  job.cadence_minutes), so one task covers every cadence.

  Why Task Scheduler: it is built into Windows, survives reboots, needs no
  always-running process or global npm package, and has the two settings this
  job needs: "StartWhenAvailable" (a start missed while the machine slept or
  was off runs as soon as it is back, which together with the job's own
  catch-up covers missed runs) and "RunOnlyIfNetworkAvailable".

  The task runs only while you are logged on, so no password is stored. It
  does not wake the computer. It inherits your user environment variables
  (IA_S3_ACCESS, IA_S3_SECRET, NTFY_TOPIC, NTFY_TOKEN).

.PARAMETER Preview
  Print what would be registered and change nothing.

.PARAMETER Live
  Pass --live to the job. Real PRs and ntfy pushes also need job.live: true
  in config/pipeline.yaml; without it the job stays a dry run either way.

.PARAMETER Unregister
  Remove the task.

.EXAMPLE
  .\setup-task-scheduler.ps1 -Preview
  .\setup-task-scheduler.ps1             # dry-run job every 30 minutes
  .\setup-task-scheduler.ps1 -Live       # after setting job.live: true
  .\setup-task-scheduler.ps1 -Unregister
#>
[CmdletBinding()]
param(
  [string]$RepoDir = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path,
  [int]$IntervalMinutes = 30,
  [switch]$Live,
  [switch]$Preview,
  [switch]$Unregister
)
$ErrorActionPreference = 'Stop'
$TaskName = 'GrayslakeTracker-ResearchJob'

if ($Unregister) {
  if ($Preview) { "Would unregister task $TaskName"; return }
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  "Unregistered $TaskName"
  return
}

$node = (Get-Command node -ErrorAction Stop).Source
$appDir = Join-Path $RepoDir 'grayslake-impact'
$script = Join-Path $appDir 'pipeline\scripts\run-job.mjs'
if (-not (Test-Path $script)) { throw "run-job.mjs not found at $script" }

$argList = @('--use-system-ca', "`"$script`"")
if ($Live) { $argList += '--live' }
$arguments = $argList -join ' '

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

if ($Preview) {
  "Task:        $TaskName"
  "Program:     $node"
  "Arguments:   $arguments"
  "Working dir: $appDir"
  "Every:       $IntervalMinutes minutes, starting 2 minutes after registration"
  "Settings:    StartWhenAvailable, RunOnlyIfNetworkAvailable, IgnoreNew, 2 h limit, runs on battery"
  "Runs as:     $env:USERDOMAIN\$env:USERNAME, only while logged on (no stored password)"
  "Mode:        $(if ($Live) { 'live flag passed (still a dry run unless job.live: true)' } else { 'dry run' })"
  'Nothing was registered (-Preview).'
  return
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'Grayslake Data Center Tracker research pipeline (pipeline/scripts/run-job.mjs). Opens draft PRs only; nothing publishes without a merge.' | Out-Null
"Registered $TaskName. First run in about 2 minutes; logs in private-info\logs\job\."
