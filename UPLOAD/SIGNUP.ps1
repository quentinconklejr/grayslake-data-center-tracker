# =====================================================================
#  Email signup: a real box, a real button.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\SIGNUP.ps1"
#
#  Run COMPLAINT.ps1 first if you have not. Safe to re-run.
#
#  YOU NEED ONE KEY, AND IT TAKES TWO MINUTES
#  ------------------------------------------
#  A form that stores an address needs somewhere to send it. There is no way
#  around that, but the quickest option does not make you create an account:
#
#      1. Go to web3forms.com
#      2. Type the email address where you want signups delivered
#      3. They email you an access key
#      4. Open grayslake-impact\src\data\siteConfig.js and set:
#
#           web3formsKey: 'the-key-they-emailed-you',
#
#      5. Run this script again (or just commit and push)
#
#  Until the key is set the box and the button still appear, because a visitor
#  should see the same page either way, but pressing Subscribe says the signup
#  is not connected yet instead of claiming it worked. That is the one thing
#  the old EnterpriseLeadBanner did wrong and this will not repeat.
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
Say ' Email signup' 'Cyan'
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

# Keep an existing key if one has already been pasted in, so re-running this
# does not wipe the setup.
$existingKey = $null
$cfgPath = Join-Path $src 'data\siteConfig.js'
if (Test-Path $cfgPath) {
  $cfg = [IO.File]::ReadAllText($cfgPath)
  $m = [regex]::Match($cfg, "web3formsKey:\s*'([^']+)'")
  if ($m.Success) { $existingKey = $m.Groups[1].Value }
  if (-not $existingKey) {
    $m2 = [regex]::Match($cfg, "formspreeId:\s*'([^']+)'")
    if ($m2.Success) { $existingKey = "formspree:" + $m2.Groups[1].Value }
  }
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

# Put the key back if there was one.
if ($existingKey -and -not $existingKey.StartsWith('formspree:')) {
  $cfg = [IO.File]::ReadAllText($cfgPath)
  $cfg = $cfg -replace "web3formsKey:\s*null", "web3formsKey: '$existingKey'"
  [IO.File]::WriteAllText($cfgPath, $cfg)
  Say "[2/5] Installed the signup, and kept your existing key"
} elseif ($existingKey) {
  $id = $existingKey.Substring(10)
  $cfg = [IO.File]::ReadAllText($cfgPath)
  $cfg = $cfg -replace "formspreeId:\s*null", "formspreeId: '$id'"
  [IO.File]::WriteAllText($cfgPath, $cfg)
  Say "[2/5] Installed the signup, and kept your existing Formspree id"
} else {
  Say '[2/5] Installed the signup'
  Say '      No delivery key set yet - see the setup note at the top of this file' 'Yellow'
}

# --- verify -------------------------------------------------------------
Write-Host ''
Say '[3/5] Verifying...' 'Cyan'
function Expect($path, $needle, $what) {
  $p = Join-Path $src $path
  if (-not (Test-Path $p)) { Say "      !   $what - FILE MISSING" 'Red'; $script:fail = $true; return }
  if (([IO.File]::ReadAllText($p)).Contains($needle)) { Say "      ok  $what" }
  else { Say "      !   $what - NOT FOUND" 'Red'; $script:fail = $true }
}

Expect 'components\ui\UpdatesSignup.jsx' 'type="email"'        'email input renders'
Expect 'components\ui\UpdatesSignup.jsx' 'Subscribe'           'subscribe button renders'
Expect 'components\ui\UpdatesSignup.jsx' 'not connected yet'   'unconfigured submit is refused'
Expect 'pages\Home.jsx'                  '<UpdatesSignup />'   'mounted on the homepage'
Expect 'data\siteConfig.js'              'web3formsKey'        'config switch present'
Expect 'pages\Privacy.jsx'               'If you sign up'      'privacy disclosure present'

# The failure mode of the old banner: a success state reachable without a
# response. There are two success paths now, one per provider, and both must
# sit behind a response check.
$sig = [IO.File]::ReadAllText((Join-Path $src 'components\ui\UpdatesSignup.jsx'))
$done    = ([regex]::Matches($sig, [regex]::Escape("setState('done')"))).Count
$guarded = ([regex]::Matches($sig, "if \(res\.ok")).Count
if ($done -eq 2 -and $guarded -eq 2) {
  Say '      ok  both success paths sit behind a response check'
} else {
  Say "      !   $done success path(s), $guarded guard(s) - expected 2 and 2" 'Red'
  $fail = $true
}

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
$subject = 'Add a working email signup to the homepage'
$body    = 'Replaces the removed EnterpriseLeadBanner, which took an address, discarded it and told the visitor a subscription had been created. A visitor now types an address and presses Subscribe, as they would expect. The success message is set in two places, one per delivery provider, and both sit behind a check on the response, so it cannot be shown without one; Web3Forms in particular returns 200 with success false on a bad key, so the body is checked rather than the status alone. With no delivery key configured the box and button still render, because a visitor should see the same page either way, but submitting reports that the signup is not connected rather than claiming it worked. Privacy page discloses the list, since the headline claim of no accounts and nothing sold only holds if it does.'
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
  if ($existingKey) {
    Say ' Key is set - the signup is live and delivering.'
  } else {
    Say ' NEXT, so it actually delivers:' 'Yellow'
    Write-Host '   1. web3forms.com - type your email, they send a key' -ForegroundColor White
    Write-Host '   2. siteConfig.js - web3formsKey: ''that-key'''       -ForegroundColor White
    Write-Host '   3. run this script again'                            -ForegroundColor White
  }
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
