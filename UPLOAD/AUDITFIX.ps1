# =====================================================================
#  Fixes from the live audit.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\AUDITFIX.ps1"
#
#  Safe to re-run.
#
#  WHY THE LAST VERSION FAILED
#  ---------------------------
#  It tried to swap the lawsuit timeline entry with a PowerShell here-string
#  containing an en dash and LF newlines, against a file with CRLF newlines and
#  a different encoding. The match silently failed - and the script printed
#  "rewritten to the standard schema" anyway before the verifier caught it.
#  Same class of bug as the plus sign and the ${buffer} interpolation.
#
#  So this one does no text surgery at all. Every change was made and built in
#  advance; this copies finished files into place and checks the result.
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
Say ' Fixes from the live audit' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @{
  '_timeline.js'    = (Join-Path $src 'data\timeline.js')
  '_TaxImpact.jsx'  = (Join-Path $src 'pages\TaxImpact.jsx')
  '_Schools.jsx'    = (Join-Path $src 'pages\Schools.jsx')
  '_Actions.jsx'    = (Join-Path $src 'pages\Actions.jsx')
  '_vercel.json'    = (Join-Path $app 'vercel.json')
}
foreach ($k in $files.Keys) {
  if (-not (Test-Path (Join-Path $upload $k))) { Say "Missing $k in UPLOAD" 'Red'; Read-Host 'Enter'; exit 1 }
}

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }

# Discard the partial edits the failed run left behind, so this starts clean.
& git checkout -- . 2>&1 | Out-Null
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/4] Reset to GitHub and up to date'

foreach ($k in $files.Keys) { Copy-Item (Join-Path $upload $k) $files[$k] -Force }
Say '[2/4] Installed 5 corrected files'
Say '      vercel.json    the two self-referential rewrites are gone, so'
Say '                     /tax /residents /reporters /officials resolve again'
Say '                     and your own 404 page becomes reachable'
Say '      timeline.js    lawsuit entry rebuilt on the standard schema, with'
Say '                     the case number; it now sorts into date order and'
Say '                     counts toward the Legal filter'
Say '      TaxImpact.jsx  the uncited Est. Levy Share table is gone, replaced'
Say '                     with the eight districts the Village FAQ names, cited'
Say '      Schools.jsx    mangled arrow characters removed'
Say '      Actions.jsx    dead Officials overview link removed'

# --- verify -------------------------------------------------------------
Write-Host ''
Say '[3/4] Verifying...' 'Cyan'
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

Check $vj  '"/sitemap.xml"'    'vercel: loop rewrites gone'         $false
Check $vj  '"/(.*)"'           'vercel: catch-all present'          $true
Check $tl  '2026CH00000171'    'timeline: lawsuit has case number'  $true
Check $tl  'desc:'             'timeline: no stray desc field'      $false
Check $tax 'TAX_DISTRICTS'     'tax: uncited levy table removed'    $false
Check $tax 'Est. Levy Share'   'tax: levy percentages gone'         $false
Check $tax 'taxingDistricts'   'tax: FAQ district list in use'      $true
Check $act '/officials'        'actions: dead link gone'            $false

$schText = [IO.File]::ReadAllText($sch)
if ($schText -match 'Archived copy\s*</a>') { Say '      ok  schools: arrows cleaned' }
else { Say '      !   schools: arrows still mangled' 'Red'; $fail = $true }

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Say 'Send me the red lines.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build ---------------------------------------------------------------
Say '[4/4] Building...' 'Cyan'
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
Say '[4/4] Build OK'

& git add -A 2>&1 | Out-Null
$subject = 'Fix broken SPA fallback, malformed lawsuit entry, uncited levy table, mojibake, dead link'
$body    = 'vercel.json rewrote sitemap.xml and robots.txt to themselves. A rewrite whose destination equals its source is a loop, Vercel rejects the entry, and one rejected entry stops the entire rewrites block applying including the catch-all that hands unknown paths to index.html. As a result /tax, /residents, /reporters and /officials returned the platform 404 page rather than the site, as did every mistyped or stale URL, and the NotFound component was unreachable. The July 31 lawsuit entry used desc, type and status with a display-string date while every other entry uses description, category and an ISO date, so it rendered as a bare title after the 2029 projection with no badge or text and belonged to no category, which is why the header counted 19 events while the filters summed to 18. Rebuilt on the standard schema with the case number. The tax section carried an eight-row table of Est. Levy Share percentages with no citation, listing districts that do not match the eight the Village FAQ names on page 2, so two contradictory lists of eight taxing districts sat a few screens apart on the same page. Replaced with the FAQ list, cited, and a plain statement that no per-district share has been published. Also removed double-encoded arrow characters on the Schools panel and the Officials overview link, which pointed at a deleted route.'
$commitOut = & git commit -m $subject -m $body 2>&1
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
  Say ' PUSHED.'
  Write-Host ''
  Say ' Check in about 2 minutes:'
  Write-Host '   /nope        your 404 page, not Vercel''s'            -ForegroundColor White
  Write-Host '   /reporters   lands on Key Figures'                    -ForegroundColor White
  Write-Host '   /timeline    lawsuit in date order, Legal (6)'        -ForegroundColor White
  Write-Host '   /project     tax section has no percentage table'     -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
