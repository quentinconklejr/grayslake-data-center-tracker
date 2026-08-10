# =====================================================================
#  HOTFIX - /project is crashing. This repairs it.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\HOTFIX.ps1"
#
#  Safe to re-run. The line removal is idempotent.
#
#  WHAT BROKE
#  ----------
#  READY.ps1 removed the derived "Power Buffer" figure: it deleted the
#  `const buffer = ...` declaration and the stat card, but a third line in
#  the technical metrics table still used the variable. That patch silently
#  failed - its search text was written in PowerShell double quotes, so the
#  ${buffer} inside it was interpolated to nothing before git saw it - and
#  the patch helper reported the failure as "already applied".
#
#  Energy renders as a section of /project, so an undefined variable throws
#  and blanks the page.
#
#  AND WHY THE FIRST HOTFIX ATTEMPT STOPPED
#  ----------------------------------------
#  It did remove the line correctly. Then the safety check searched for the
#  word "buffer" case-insensitively across the whole file and matched the
#  words "Power Buffer" inside the explanatory comment READY.ps1 left
#  behind. A false alarm on its own comment.
#
#  The check below ignores comment lines and matches case-sensitively, so
#  it tests for real code usage rather than prose.
# =====================================================================

$ErrorActionPreference = 'Continue'

$repo   = 'C:\Users\Quentin\grayslake-data-center-tracker'
$energy = Join-Path $repo 'grayslake-impact\src\pages\Energy.jsx'

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' HOTFIX - repair /project' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }

& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/5] Up to date with GitHub'

if (-not (Test-Path $energy)) { Say 'Energy.jsx not found. Stopping.' 'Red'; Read-Host 'Enter'; exit 1 }

# --- remove the orphaned line -----------------------------------------
# Matched on a plain single-quoted literal with no $ in it, so nothing can
# be interpolated out from under us.
$lines   = [IO.File]::ReadAllText($energy) -replace "`r`n", "`n" -split "`n"
$kept    = $lines | Where-Object { $_ -notlike "*'Power Buffer'*" }
$removed = $lines.Count - $kept.Count

if ($removed -gt 0) {
  [IO.File]::WriteAllText($energy, ($kept -join "`n"))
  Say "[2/5] Removed $removed orphaned line(s)"
} else {
  Say '[2/5] Line already removed' 'Yellow'
}

# --- verify, ignoring comments ----------------------------------------
$codeLines = ([IO.File]::ReadAllText($energy) -replace "`r`n", "`n" -split "`n") |
  Where-Object { $t = $_.Trim(); -not ($t.StartsWith('//') -or $t.StartsWith('*') -or $t.StartsWith('/*')) }

$stillUsed = $codeLines | Where-Object { $_ -cmatch '\bbuffer\b' }

if ($stillUsed) {
  Say '[3/5] Code still references buffer. Stopping before commit.' 'Red'
  Write-Host ''
  $stillUsed | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Write-Host ''
  Say 'Send me those lines.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}
Say '[3/5] Verified: no code references the deleted variable'

# --- build, which is the real proof -----------------------------------
Say '[4/5] Building...' 'Cyan'
Push-Location (Join-Path $repo 'grayslake-impact')
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc  = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/5] Build OK'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Hotfix: remove orphaned reference to deleted buffer variable, which crashed /project'
$body    = 'Removing the derived Power Buffer figure left one line in the technical metrics table still referencing the deleted const. Energy renders as a section of /project, so the undefined variable threw and blanked the page. The patch that should have removed this line failed silently because its search text was interpolated by the shell before it ran, and the patch helper reported that failure as a success.'
$commitOut = & git commit -m $subject -m $body 2>&1
$commitRc  = $LASTEXITCODE
if ($commitRc -eq 0) { Say '[5/5] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[5/5] Nothing to commit - already fixed and pushed' 'Yellow' }
else {
  Write-Host ''; Say 'COMMIT FAILED:' 'Red'
  $commitOut | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

Write-Host ''
& git push origin main
$pushed = $LASTEXITCODE

Write-Host ''
if ($pushed -eq 0) {
  Say '====================================================='
  Say ' PUSHED. /project should work in about 2 minutes.'
  Write-Host ''
  Say ' Check in a private window, phone and desktop:'
  Write-Host '   1. /project loads, all four sections open'      -ForegroundColor White
  Write-Host '   2. Energy Draw shows four stat cards'           -ForegroundColor White
  Write-Host '   3. Header: 8 links on desktop, menu on phone'   -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
