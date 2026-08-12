# =====================================================================
#  Rewrite the "In plain language" box on the homepage.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\PLAINTEXT.ps1"
#
#  Safe to re-run.
#
#  WHAT IT SAID
#  ------------
#    "In plain language: a very large computing facility. Two figures have been
#     put on its cost: the mayor of Grayslake said $8.5B, T5 chief executive
#     said up to $18B."
#
#  Four problems, and they compound:
#
#    1. "In plain language:" announces that plain language is coming. A person
#       just writes plainly. Labelling it is the tell, same family as "Simply
#       put" and "To be clear".
#    2. "a very large computing facility" is a definition that defines nothing.
#       "Very large" is a non-measurement sitting on a page covered in real
#       ones: 1,200 MW, 287.8 acres, 472 acres.
#    3. "Two figures have been put on its cost" is passive with no actor, then
#       names both actors in the same breath. Throat-clearing.
#    4. It repeated the investment card 200 pixels below it. A highlighted blue
#       box - visual furniture promising importance - delivered a vague
#       definition plus a duplicate. That mismatch is what the eye catches.
#
#  WHAT IT SAYS NOW
#  ----------------
#    "Warehouses full of computers, rented out to other companies. The
#     approvals allow up to 10.1 million square feet of them on farm fields at
#     Peterson and Alleghany roads, roughly 175 football fields of floor space.
#     The approval document gives no building count; reporting puts it at 18."
#
#  Every figure checked before writing it:
#    - 10,100,000 sq ft is the Village FAQ approval figure, already cited on
#      the site as the buildable-area key figure.
#    - 175 football fields is that figure divided by 57,600 sq ft, a field
#      including end zones. 10,100,000 / 57,600 = 175.3.
#    - The building count is attributed rather than asserted, because the FAQ
#      says "several individual buildings" and gives no number. 18 comes from
#      Daily Herald and Government Technology; Marin has said up to 20. That
#      distinction between the document and the reporting is the site's whole
#      method, so the sentence makes it.
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
Say ' Homepage: plain-language box' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$newHome = Join-Path $upload '_Home.jsx'
if (-not (Test-Path $newHome)) { Say "Missing _Home.jsx in UPLOAD" 'Red'; Read-Host 'Enter'; exit 1 }

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
# NOT $home. That is a read-only PowerShell automatic variable holding the
# user profile path, so assigning to it fails and the variable keeps pointing
# at C:\Users\... - which is what made the previous run report four false
# failures while the file on disk was perfectly correct.
$homeText = [IO.File]::ReadAllText((Join-Path $src 'pages\Home.jsx'))
# strip the explanatory JSX comment so the check reads what renders, not what
# the comment says was wrong. Getting this backwards is how a page keeps a
# claim while a naive grep says it was removed.
$body = [regex]::Replace($homeText, '\{/\*.*?\*/\}', '', 'Singleline')

foreach ($c in @(
  @{ n = 'In plain language';        want = $false; label = 'no "In plain language:" label' },
  @{ n = 'very large';               want = $false; label = 'no vague quantifier' },
  @{ n = 'have been put on';         want = $false; label = 'no agentless passive' },
  @{ n = 'Warehouses full of';       want = $true;  label = 'new opening line present' },
  @{ n = '10.1 million square feet'; want = $true;  label = 'approval figure present' },
  @{ n = '175 football fields';      want = $true;  label = 'size comparison present' },
  @{ n = 'gives no building count';  want = $true;  label = 'count attributed, not asserted' }
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

& git add -A 2>&1 | Out-Null

# The message goes to a file and git reads it with -F.
#
# Passing it with -m breaks: this message quotes the old copy, and PowerShell
# splits native-command arguments on embedded double quotes, so git received
# "In, plain, language:, a, very ... as separate pathspecs and refused the
# commit. -F sidesteps argument parsing completely, which also means the
# message can contain quotes, apostrophes and en dashes without a second
# thought.
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Rewrite the plain-language box to say something the page does not already say

The box read "In plain language: a very large computing facility. Two figures
have been put on its cost: the mayor of Grayslake said $8.5B, T5 chief
executive said up to $18B."

Four problems. Announcing that plain language is coming is a tell; a person
just writes plainly. "Very large" is a non-measurement on a page covered in
real ones. "Two figures have been put on its cost" is passive with no actor and
names both actors in the same breath. And it repeated the investment card two
hundred pixels below it, so a highlighted box delivered a vague definition plus
a duplicate.

It now answers what a neighbour actually pictures: what the buildings are,
where they go, and how much floor space the approvals allow. The square footage
is the Village FAQ approval figure. The football-field comparison is that
figure divided by 57,600. The building count is attributed rather than asserted
because the approval document gives no number, which is the distinction this
site exists to make.
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
  Say ' PUSHED. Homepage box, in about 2 minutes:'
  Write-Host ''
  Write-Host '   Warehouses full of computers, rented out to other'   -ForegroundColor White
  Write-Host '   companies. The approvals allow up to 10.1 million'   -ForegroundColor White
  Write-Host '   square feet of them on farm fields at Peterson and'  -ForegroundColor White
  Write-Host '   Alleghany roads, roughly 175 football fields of'     -ForegroundColor White
  Write-Host '   floor space. The approval document gives no building'-ForegroundColor White
  Write-Host '   count; reporting puts it at 18.'                     -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
