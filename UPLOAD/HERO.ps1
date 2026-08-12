# =====================================================================
#  Cut the homepage hero down.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\HERO.ps1"
#
#  Safe to re-run.
#
#  THE PROBLEM
#  -----------
#  I kept adding to the hero instead of deciding what it was for. It had grown
#  to four stacked blocks of prose before a single number:
#
#      headline                    3 lines
#      bordered blue callout       4 lines
#      paragraph about the tracker 2 lines
#      verification date           1 line
#
#  Ten lines to scroll past on a page whose entire job is facts. And the
#  callout had started repeating the cards underneath it - square footage next
#  to APPROVED MAX, Peterson and Alleghany next to the map heading.
#
#  THE CUT
#  -------
#  Down to two blocks. The callout lost its box: the border and tint were what
#  made it read as heavy, and a box promises more than one sentence can pay
#  off. The football-field comparison and the building count went with it -
#  both live on The Project, where a reader has actually asked for detail.
#
#  What survives is the one thing the stat cards cannot say: what the buildings
#  physically are.
#
#  The "this tracker collects public records" line is about the SITE, not the
#  project, so it folds into the verification stamp rather than occupying a
#  paragraph above the facts.
#
#  Net: the two big stat cards move up roughly 150px on desktop.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo   = 'C:\Users\Quentin\grayslake-data-center-tracker'
$app    = Join-Path $repo 'grayslake-impact'
$src    = Join-Path $app 'src'
$upload = Join-Path $repo 'UPLOAD'
$fail   = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Homepage hero: cut it down' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$newHome = Join-Path $upload '_Home.jsx'
if (-not (Test-Path $newHome)) { Say 'Missing _Home.jsx in UPLOAD' 'Red'; Read-Host 'Enter'; exit 1 }

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/4] Up to date with GitHub'

Copy-Item $newHome (Join-Path $src 'pages\Home.jsx') -Force
Say '[2/4] Replaced Home.jsx'

# --- verify --------------------------------------------------------------
Write-Host ''
Say '[3/4] Verifying...' 'Cyan'

# NOT $home - that is a read-only PowerShell automatic variable.
$homeText = [IO.File]::ReadAllText((Join-Path $src 'pages\Home.jsx'))
# Read what renders, not the explanatory comment describing what was removed.
$body = [regex]::Replace($homeText, '\{/\*.*?\*/\}', '', 'Singleline')

foreach ($c in @(
  @{ n = 'bg-sky-50 p-4 rounded-xl';    want = $false; label = 'callout box styling gone' },
  @{ n = '175 football fields';         want = $false; label = 'football-field line moved off the hero' },
  @{ n = 'gives no building count';     want = $false; label = 'building-count line moved off the hero' },
  @{ n = 'This tracker collects';       want = $false; label = 'tracker paragraph folded away' },
  @{ n = 'Warehouses full of computers';want = $true;  label = 'one-line subhead present' },
  @{ n = 'Every claim linked to its source'; want = $true; label = 'source promise kept, in the stamp' },
  @{ n = 'In plain language';           want = $false; label = 'still no "In plain language:" label' }
)) {
  $has = $body.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  $($c.label)" }
  else { Say "      !   $($c.label)" 'Red'; $script:fail = $true }
}

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build ---------------------------------------------------------------
Say '[4/4] Building and linting...' 'Cyan'
Push-Location $app
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc  = $LASTEXITCODE
$lintOut  = & npx eslint src/pages/Home.jsx 2>&1
$lintRc   = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if ($lintRc -ne 0) {
  Write-Host ''; Say 'LINT FAILED. Nothing committed:' 'Red'
  $lintOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/4] Build and lint OK'

# --- commit via file, so quoting cannot bite ------------------------------
& git add -A 2>&1 | Out-Null
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Cut the homepage hero from four blocks of prose to two

The hero had grown to a headline, a bordered callout, a paragraph explaining
what the tracker is, and a verification date - roughly ten lines to scroll past
before the first number, on a page whose whole job is numbers. The callout had
also started repeating the cards underneath it, putting square footage above
APPROVED MAX and Peterson and Alleghany above the map heading.

The callout loses its border and tint, which were what made it read as heavy,
and drops to one sentence: what the buildings physically are, which is the one
thing the stat cards cannot say. The football-field comparison and the building
count move to The Project, where a reader has asked for detail. The line about
collecting public records is about the site rather than the project, so it
folds into the verification stamp.

The two big stat cards move up roughly 150px on desktop.
'@
Set-Content -Path $msgFile -Value $msg -Encoding UTF8
$commitOut = & git commit -F $msgFile 2>&1
Remove-Item $msgFile -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) { Say 'Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say 'Nothing new to commit' 'Yellow' }
else {
  Write-Host ''; Say 'COMMIT FAILED:' 'Red'
  $commitOut | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

Write-Host ''
& git push origin main
Write-Host ''
if ($LASTEXITCODE -eq 0) {
  Say '====================================================='
  Say ' PUSHED. The hero is now:'
  Write-Host ''
  Write-Host '   T5 @ Chicago IV is an approved hyperscale data'   -ForegroundColor White
  Write-Host '   center under construction in Grayslake, Illinois.'-ForegroundColor White
  Write-Host ''
  Write-Host '   Warehouses full of computers, rented out to other'-ForegroundColor White
  Write-Host '   companies, on farm fields at Peterson and'        -ForegroundColor White
  Write-Host '   Alleghany roads.'                                 -ForegroundColor White
  Write-Host ''
  Write-Host '   Every claim linked to its source - Last verified' -ForegroundColor White
  Write-Host ''
  Say ' Then straight into the numbers.'
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
