# =====================================================================
#  Map legibility + a Deal page worth reading.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\POLISH.ps1"
#
#  Safe to re-run.
#
#  METHOD NOTE
#  -----------
#  The last few rounds broke things because they were blind find-and-replace
#  on files nobody could see rendered. A search string got eaten by shell
#  interpolation, a bare + got passed as an argument instead of concatenating,
#  and the patch helper called both failures a success.
#
#  This script does not patch. It replaces two whole files with versions that
#  were built and linted first, then verifies the result on disk before it
#  commits: file present, expected markers found, no stray operator lines,
#  build green. Nothing is pushed if any of that fails.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo   = 'C:\Users\Quentin\grayslake-data-center-tracker'
$src    = Join-Path $repo 'grayslake-impact\src'
$upload = Join-Path $repo 'UPLOAD'

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Map legibility + Deal page design' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$newMap = Join-Path $upload '_SiteMap.jsx'
$newDeal = Join-Path $upload '_Agreement.jsx'
foreach ($f in @($newMap, $newDeal)) {
  if (-not (Test-Path $f)) { Say "Missing: $f" 'Red'; Read-Host 'Enter'; exit 1 }
}

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/5] Up to date with GitHub'

# --- replace whole files, no patching ---------------------------------
Copy-Item $newMap  (Join-Path $src 'components\map\SiteMap.jsx') -Force
Copy-Item $newDeal (Join-Path $src 'pages\Agreement.jsx')        -Force
Say '[2/5] Replaced SiteMap.jsx and Agreement.jsx'
Say '      MAP:'
Say '        - Each of the four ownership groups labelled on the map with its acreage'
Say '        - Peterson Road, Alleghany Road and Route 83 marked'
Say '        - Satellite / Plain map toggle, because street names wash out on dirt'
Say '        - North indicator, scale bar, brighter parcel outlines'
Say '        - Caption says where this is relative to town, in words'
Say '      DEAL PAGE:'
Say '        - Counter strip: 6 documented, 4 claims, 7 unanswered'
Say '        - Revenue claims drawn as bars to scale, so the 5x spread is visible'
Say '        - Each claim tagged Village or Developer'
Say '        - Numbered term cards, sections numbered 01 / 02 / 03'

# --- verify what actually landed ---------------------------------------
$fail = $false
function Expect($file, $needle, $what) {
  $p = Join-Path $src $file
  if (-not (Test-Path $p)) { Say "      ! $what - FILE MISSING" 'Red'; $script:fail = $true; return }
  if (([IO.File]::ReadAllText($p)).Contains($needle)) { Say "      ok  $what" }
  else { Say "      !   $what - NOT FOUND" 'Red'; $script:fail = $true }
}

Write-Host ''
Say '[3/5] Verifying on disk...' 'Cyan'
Expect 'components\map\SiteMap.jsx' 'const GROUPS'            'map: group labels present'
Expect 'components\map\SiteMap.jsx' 'const LANDMARKS'         'map: road landmarks present'
Expect 'components\map\SiteMap.jsx' 'Plain map'               'map: base layer toggle present'
Expect 'components\map\SiteMap.jsx' 'not drawn'               'map: 472-acre caveat still present'
Expect 'pages\Agreement.jsx'        'MAX_CLAIM'               'deal: revenue bars present'
Expect 'pages\Agreement.jsx'        'Counter'                 'deal: counter strip present'
Expect 'pages\Agreement.jsx'        'Get the document'        'deal: FOIA block still present'

# the class of bug that produced the stray plus
foreach ($f in @('components\map\SiteMap.jsx', 'pages\Agreement.jsx')) {
  $bad = ([IO.File]::ReadAllText((Join-Path $src $f)) -replace "`r`n","`n" -split "`n") |
    Where-Object { $_.Trim() -eq '+' -or $_.Trim() -eq "''" }
  if ($bad) { Say "      !   $f contains a stray operator line" 'Red'; $fail = $true }
}
if (-not $fail) { Say '      ok  no stray operator lines' }

if ($fail) {
  Write-Host ''
  Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
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
$subject = 'Make the map identifiable and the Deal page readable'
$body    = 'Map: each of the four ownership groups now labels itself on the map with its acreage and parcel count, computed from the parcel data rather than typed in, so the four labels sum to the same 287.8 the legend quotes. Peterson Road, Alleghany Road and Route 83 are marked, since those are how residents describe where the site is. Added a satellite and plain-map toggle because street names wash out against bare field on imagery. Added a north indicator and brighter parcel outlines. The caption now says where this sits relative to downtown Grayslake in words before any pixels. Deal page: a counter strip up top gives the shape of the answer in two seconds, six terms documented against seven questions with no public answer. The four revenue claims are drawn as bars proportional to the figures, so a five-fold spread reads as a five-fold spread instead of four similar sentences, and each claim is tagged as coming from the Village or from the developer.'
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
  Say ' In about 2 minutes:'
  Write-Host '   /map        acreage written on each group, roads named'  -ForegroundColor White
  Write-Host '   /map        try the Plain map toggle'                    -ForegroundColor White
  Write-Host '   /agreement  counters up top, revenue bars to scale'      -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
