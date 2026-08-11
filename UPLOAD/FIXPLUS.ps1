# =====================================================================
#  Remove the stray "+" on /project, and widen the accordion qualifier.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\FIXPLUS.ps1"
#
#  Safe to re-run.
#
#  WHERE THE + CAME FROM
#  ---------------------
#  READY.ps1 deleted the "Power Buffer" stat card with this call:
#
#      Patch 'pages\Energy.jsx' `
#        '<StatCard ... />' + "`n" `
#        '' `
#        'Removed derived Power Buffer (stat card)'
#
#  PowerShell has two parsing modes. In EXPRESSION mode `+` concatenates. In
#  COMMAND mode - which is what you get when calling a function like this -
#  every token is just an argument, and `+` is passed through as the literal
#  string "+". So the arguments landed as:
#
#      $find    = '<StatCard ... />'
#      $replace = '+'
#      $label   = "`n"
#
#  It replaced the stat card with a plus sign, and printed a newline where the
#  label should have been, so the failure looked like a blank line in the log.
#
#  That plus renders as a text node in the grid, taking the fourth slot and
#  pushing PJM Zone onto its own row. Hence three cards, a cross, and an
#  orphan.
#
#  This script removes the line by exact content match, then verifies.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo   = 'C:\Users\Quentin\grayslake-data-center-tracker'
$src    = Join-Path $repo 'grayslake-impact\src'
$energy = Join-Path $src 'pages\Energy.jsx'
$accord = Join-Path $src 'components\ui\AccordionSection.jsx'

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Remove stray + and polish the section header' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/5] Up to date with GitHub'

# --- remove the stray plus --------------------------------------------
$lines   = [IO.File]::ReadAllText($energy) -replace "`r`n", "`n" -split "`n"
$kept    = $lines | Where-Object { $_.Trim() -ne '+' }
$removed = $lines.Count - $kept.Count
if ($removed -gt 0) {
  [IO.File]::WriteAllText($energy, ($kept -join "`n"))
  Say "[2/5] Removed $removed stray line(s)"
} else {
  Say '[2/5] Already removed' 'Yellow'
}

# verify, rather than assume
$check = ([IO.File]::ReadAllText($energy) -replace "`r`n", "`n" -split "`n") | Where-Object { $_.Trim() -eq '+' }
if ($check) { Say '[3/5] A stray + is still present. Stopping.' 'Red'; Read-Host 'Enter'; exit 1 }
Say '[3/5] Verified: no stray operators left in Energy.jsx'

# --- desktop polish ----------------------------------------------------
# The qualifier beside the headline figure was capped at 260px, which broke
# "of which 1,200 MW is leasable IT capacity" across an awkward line.
$t = [IO.File]::ReadAllText($accord) -replace "`r`n", "`n"
if ($t.Contains('sm:max-w-[260px]')) {
  [IO.File]::WriteAllText($accord, $t.Replace('sm:max-w-[260px]', 'sm:max-w-[19rem]'))
  Say '      - Widened the qualifier column beside the headline figure'
} else {
  Say '      - Qualifier width (already applied)' 'Yellow'
}

# --- build -------------------------------------------------------------
Say '[4/5] Building...' 'Cyan'
Push-Location (Join-Path $repo 'grayslake-impact')
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/5] Build OK'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Remove stray plus sign left in the Energy stat grid; widen section qualifier'
$body    = 'A patch that was meant to delete the Power Buffer stat card replaced it with a literal plus sign instead. PowerShell parses a function call in command mode, where a bare + is an argument rather than a concatenation operator, so the replacement string became the plus and the label became a newline. The plus rendered as a text node occupying the fourth grid slot, pushing PJM Zone to its own row. Removed, so the four cards sit on one row at desktop width and two by two on a phone.'
$commitOut = & git commit -m $subject -m $body 2>&1
if ($LASTEXITCODE -eq 0) { Say '[5/5] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[5/5] Nothing new to commit' 'Yellow' }
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
  Say ' PUSHED.'
  Write-Host ''
  Say ' In about 2 minutes, /project - Energy Draw:'
  Write-Host '   desktop  four cards on one row, no cross'  -ForegroundColor White
  Write-Host '   phone    two by two, nothing orphaned'     -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
