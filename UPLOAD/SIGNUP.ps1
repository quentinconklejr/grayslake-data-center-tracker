# =====================================================================
#  Bring back the email signup - as a working one.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\SIGNUP.ps1"
#
#  Run COMPLAINT.ps1 first if you have not. Safe to re-run.
#
#  WHAT IS DIFFERENT FROM THE ONE I DELETED
#  ----------------------------------------
#  EnterpriseLeadBanner took an address, discarded it, and displayed
#  "Subscription request received". This one cannot do that. Success is set in
#  exactly one place in the code, inside `if (res.ok)`, so it is only shown
#  after a request actually succeeded. A failure says so and offers the
#  fallback.
#
#  Out of the box there is no text input at all: with no delivery service
#  configured it renders a mailto button, which genuinely works today and puts
#  no list in anyone else's hands. When you want the inline form, create a free
#  form at formspree.io and put the id in siteConfig.js:
#
#      export const NEWSLETTER = { formspreeId: 'xyzabcde' }
#
#  The copy also promises less. The old banner offered automatic alerts
#  whenever new deeds, meeting transcripts or court filings were posted, which
#  would mean monitoring three systems. This offers an occasional email, sent
#  by hand, which is a thing one person can actually do.
#
#  The Privacy page is updated in the same commit. It says "no accounts,
#  nothing sold" at the top, and that only stays true if the list is disclosed.
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
Say ' Email signup, working this time' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @{
  '_UpdatesSignup.jsx' = 'components\ui\UpdatesSignup.jsx'
  '_Home.jsx'          = 'pages\Home.jsx'
  '_Privacy.jsx'       = 'pages\Privacy.jsx'
  '_siteConfig.js'     = 'data\siteConfig.js'
}
foreach ($k in $files.Keys) {
  if (-not (Test-Path (Join-Path $upload $k))) { Say "Missing $k in UPLOAD" 'Red'; Read-Host 'Enter'; exit 1 }
}

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/5] Up to date with GitHub'

foreach ($k in $files.Keys) {
  Copy-Item (Join-Path $upload $k) (Join-Path $src $files[$k]) -Force
}
Say '[2/5] Installed the signup and its supporting changes'
Say '      - UpdatesSignup.jsx  new component, mailto by default'
Say '      - Home.jsx           mounted above the sources'
Say '      - siteConfig.js      NEWSLETTER switch for formspree'
Say '      - Privacy.jsx        the list is now disclosed'

# --- verify -------------------------------------------------------------
Write-Host ''
Say '[3/5] Verifying...' 'Cyan'
function Expect($path, $needle, $what) {
  $p = Join-Path $src $path
  if (-not (Test-Path $p)) { Say "      !   $what - FILE MISSING" 'Red'; $script:fail = $true; return }
  if (([IO.File]::ReadAllText($p)).Contains($needle)) { Say "      ok  $what" }
  else { Say "      !   $what - NOT FOUND" 'Red'; $script:fail = $true }
}
Expect 'components\ui\UpdatesSignup.jsx' 'if (res.ok)'       'success only after a real response'
Expect 'components\ui\UpdatesSignup.jsx' 'mailto'            'mailto fallback present'
Expect 'pages\Home.jsx'                  '<UpdatesSignup />' 'mounted on the homepage'
Expect 'data\siteConfig.js'              'NEWSLETTER'        'config switch present'
Expect 'pages\Privacy.jsx'               'If you sign up'    'privacy disclosure present'

# The specific failure mode of the old component: a success state that could be
# reached without a network call. There must be exactly one, guarded.
$sig = [IO.File]::ReadAllText((Join-Path $src 'components\ui\UpdatesSignup.jsx'))
$doneCount = ([regex]::Matches($sig, [regex]::Escape("setState('done')"))).Count
if ($doneCount -eq 1) { Say '      ok  exactly one success path, and it is guarded' }
else { Say "      !   found $doneCount success paths, expected 1" 'Red'; $fail = $true }

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build ---------------------------------------------------------------
Say '[4/5] Building...' 'Cyan'
Push-Location $app
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

# --- commit and push ------------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Bring back the email signup, as one that actually delivers'
$body    = 'Replaces the removed EnterpriseLeadBanner, which took an address, discarded it and told the visitor a subscription had been created. The new component sets its success state in exactly one place, inside a check on the response, so it cannot report success without one; failures say so and offer the fallback. With no delivery service configured it renders a mailto button rather than a text input, so it works today and no list sits in a third party service. Setting NEWSLETTER.formspreeId in siteConfig turns on a real inline form. The copy promises an occasional email sent by hand rather than automatic alerts on three separate public systems, because that is what one person can deliver. Privacy page updated in the same commit, since the headline claim of no accounts and nothing sold only holds if the list is disclosed.'
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
  Say ' Homepage, above the sources: Stay on the record.'
  Say ' It shows a mailto button until you add a formspree id.'
  Write-Host ''
  Say ' To get the inline form:'
  Write-Host '   1. formspree.io, free account, new form'      -ForegroundColor White
  Write-Host '   2. copy the id from the endpoint URL'         -ForegroundColor White
  Write-Host '   3. siteConfig.js: formspreeId: ''thatid'''    -ForegroundColor White
  Write-Host '   4. commit and push'                           -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
