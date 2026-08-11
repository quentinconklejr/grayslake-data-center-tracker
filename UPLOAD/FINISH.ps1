# =====================================================================
#  Everything outstanding, in one run:
#    - restores your Web3Forms key, which I overwrote
#    - applies the five fixes from the live audit
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\FINISH.ps1"
#
#  Safe to re-run. Replaces whole files, verifies, builds, then commits.
#
#  HOW I BROKE THE SIGNUP
#  ----------------------
#  You set web3formsKey in eb5b392 and fixed its quoting in bb8ac5a. My
#  SIGNUP.ps1 was supposed to preserve an existing key across the file copy -
#  but it read the key from your local siteConfig BEFORE running git pull, so
#  at that moment it was looking at a stale file, found nothing, and copied the
#  version with `web3formsKey: null` over the top. Hence "the signup is not
#  connected yet": the component was telling the exact truth about a config I
#  had blanked.
#
#  This script reads the key back out of your own git history rather than
#  trusting the working tree, so it cannot be fooled by ordering again.
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
Say ' Restore the signup key + live audit fixes' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @{
  '_timeline.js'   = (Join-Path $src 'data\timeline.js')
  '_TaxImpact.jsx' = (Join-Path $src 'pages\TaxImpact.jsx')
  '_Schools.jsx'   = (Join-Path $src 'pages\Schools.jsx')
  '_Actions.jsx'   = (Join-Path $src 'pages\Actions.jsx')
  '_vercel.json'   = (Join-Path $app 'vercel.json')
}
foreach ($k in $files.Keys) {
  if (-not (Test-Path (Join-Path $upload $k))) { Say "Missing $k in UPLOAD" 'Red'; Read-Host 'Enter'; exit 1 }
}

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }

& git checkout -- . 2>&1 | Out-Null
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/6] Synced with GitHub'

# --- 1. recover the key from history ------------------------------------
$cfgPath = Join-Path $src 'data\siteConfig.js'
$key = $null

# already set and valid? leave it alone
$cfgNow = [IO.File]::ReadAllText($cfgPath)
$m = [regex]::Match($cfgNow, "web3formsKey:\s*'([0-9a-fA-F-]{30,})'")
if ($m.Success) { $key = $m.Groups[1].Value; Say '[2/6] Key already present in siteConfig' 'Yellow' }

if (-not $key) {
  # search history, newest first, for a key in any form (quoted or not)
  $commits = & git log --format='%H' -30 -- 'grayslake-impact/src/data/siteConfig.js'
  foreach ($c in $commits) {
    $blob = & git show "${c}:grayslake-impact/src/data/siteConfig.js" 2>$null
    if (-not $blob) { continue }
    $mm = [regex]::Match(($blob -join "`n"), "web3formsKey:\s*'?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'?")
    if ($mm.Success) { $key = $mm.Groups[1].Value; break }
  }
  if ($key) {
    $masked = $key.Substring(0,4) + '...' + $key.Substring($key.Length-4)
    Say "[2/6] Recovered your key from git history ($masked)"
  }
}

if ($key) {
  $cfg = [IO.File]::ReadAllText($cfgPath)
  $cfg = [regex]::Replace($cfg, "web3formsKey:\s*[^,\r\n]+,", "web3formsKey: '$key',")
  [IO.File]::WriteAllText($cfgPath, $cfg)
} else {
  Say '[2/6] No key found anywhere. The signup will keep saying it is not connected.' 'Red'
  Say '      Get one at web3forms.com and set web3formsKey in siteConfig.js.' 'Red'
}

# --- 2. audit fixes ------------------------------------------------------
foreach ($k in $files.Keys) { Copy-Item (Join-Path $upload $k) $files[$k] -Force }
Say '[3/6] Applied the five audit fixes'
Say '      vercel.json    loop rewrites removed, so /tax /residents /reporters'
Say '                     /officials resolve and your 404 page is reachable'
Say '      timeline.js    lawsuit rebuilt on the standard schema, sorts by date'
Say '      TaxImpact.jsx  uncited levy-share table replaced with the FAQ list'
Say '      Schools.jsx    mangled arrow characters removed'
Say '      Actions.jsx    dead Officials overview link removed'

# --- 3. verify -----------------------------------------------------------
Write-Host ''
Say '[4/6] Verifying...' 'Cyan'
function Check($path, $needle, $what, $shouldExist = $true) {
  if (-not (Test-Path $path)) { Say "      !   $what - FILE MISSING" 'Red'; $script:fail = $true; return }
  $has = ([IO.File]::ReadAllText($path)).Contains($needle)
  if ($has -eq $shouldExist) { Say "      ok  $what" }
  else { Say "      !   $what" 'Red'; $script:fail = $true }
}
$tl  = Join-Path $src 'data\timeline.js'
$tax = Join-Path $src 'pages\TaxImpact.jsx'
$sch = Join-Path $src 'pages\Schools.jsx'
$act = Join-Path $src 'pages\Actions.jsx'
$vj  = Join-Path $app 'vercel.json'

# the whole point of this run
$cfgAfter = [IO.File]::ReadAllText($cfgPath)
if ($cfgAfter -match "web3formsKey:\s*'[0-9a-fA-F-]{30,}'") { Say '      ok  signup: key is set as a quoted string' }
else { Say '      !   signup: key still missing or malformed' 'Red'; $fail = $true }

Check $vj  '"/sitemap.xml"'  'vercel: loop rewrites gone'        $false
Check $vj  '"/(.*)"'         'vercel: catch-all present'         $true
Check $tl  '2026CH00000171'  'timeline: lawsuit has case number' $true
Check $tl  'desc:'           'timeline: no stray desc field'     $false
Check $tax 'TAX_DISTRICTS'   'tax: uncited levy table removed'   $false
Check $tax 'Est. Levy Share' 'tax: levy percentages gone'        $false
Check $tax 'taxingDistricts' 'tax: FAQ district list in use'     $true
Check $act '/officials'      'actions: dead link gone'           $false
if (([IO.File]::ReadAllText($sch)) -match 'Archived copy\s*</a>') { Say '      ok  schools: arrows cleaned' }
else { Say '      !   schools: arrows still mangled' 'Red'; $fail = $true }

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- 4. build ------------------------------------------------------------
Say '[5/6] Building...' 'Cyan'
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
Say '[5/6] Build OK'

# --- 5. commit and push --------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Restore the Web3Forms key; fix SPA fallback, lawsuit entry, uncited levy table, mojibake, dead link'
$body    = 'The signup was reporting that it was not connected because an earlier script overwrote web3formsKey with null: it read the existing key from the working tree before pulling, so it was looking at a stale file and found nothing to preserve. The key is recovered from git history here rather than from the working tree. Alongside that, vercel.json rewrote sitemap.xml and robots.txt to themselves; a rewrite whose destination equals its source is a loop, Vercel rejects the entry, and one rejected entry stops the whole rewrites block applying including the catch-all, so /tax, /residents, /reporters and /officials returned the platform 404 and the NotFound component was unreachable. The July 31 lawsuit entry used desc, type and status with a display-string date against a file where every other entry uses description, category and an ISO date, so it rendered as a bare title after the 2029 projection and belonged to no category, which is why the header counted 19 while the filters summed to 18. The tax section carried eight rows of Est. Levy Share percentages with no citation, naming districts that do not match the eight the Village FAQ lists on page 2; replaced with the FAQ list, cited, plus a statement that no per-district share has been published.'
$commitOut = & git commit -m $subject -m $body 2>&1
if ($LASTEXITCODE -eq 0) { Say '[6/6] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[6/6] Nothing new to commit' 'Yellow' }
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
  Say ' PUSHED.'
  Write-Host ''
  Say ' In about 2 minutes, test these four:'
  Write-Host '   1. Homepage - type YOUR email, press Subscribe.'      -ForegroundColor White
  Write-Host '      You should see a green confirmation, and an email' -ForegroundColor White
  Write-Host '      should arrive. If it does not, tell me.'           -ForegroundColor Yellow
  Write-Host '   2. /nope       your 404, not Vercel''s'               -ForegroundColor White
  Write-Host '   3. /timeline   lawsuit in date order, Legal (6)'      -ForegroundColor White
  Write-Host '   4. /project    tax section has no percentage table'   -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
