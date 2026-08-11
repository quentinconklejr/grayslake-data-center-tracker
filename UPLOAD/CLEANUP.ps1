# =====================================================================
#  Correct email address everywhere + an accurate privacy page.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\CLEANUP.ps1"
#
#  Run FINISH.ps1 first if you have not. Safe to re-run.
#
#  WHAT WAS WRONG
#  --------------
#  walterjr.quentin@gmail.com was hardcoded in three places while
#  siteConfig.js held qconkle2@illinois.edu. The report-an-error link in the
#  footer, the accessibility contact and the privacy contact all pointed at the
#  gmail. All three now import from siteConfig, so they cannot drift again.
#
#  The privacy page had four inaccuracies:
#    - "The map is served by Mapbox." It is not, and never was in this build.
#      The map is Leaflet, with satellite tiles from Esri and street labels
#      from CARTO.
#    - "I do not run a mailing list, and I will not add you to one" - printed
#      three paragraphs below the section describing the mailing list.
#    - No mention of Google Fonts, which every page loads, and which is the one
#      outside request a reader cannot avoid by skipping a page.
#    - The form service was described but not named, and the thirty-day
#      retention was not mentioned at all.
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
Say ' Contact address + privacy accuracy' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @{
  '_Privacy.jsx'         = (Join-Path $src 'pages\Privacy.jsx')
  '_Accessibility.jsx'   = (Join-Path $src 'pages\Accessibility.jsx')
  '_ReportErrorLink.jsx' = (Join-Path $src 'components\ui\ReportErrorLink.jsx')
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

foreach ($k in $files.Keys) { Copy-Item (Join-Path $upload $k) $files[$k] -Force }
Say '[2/5] Installed 3 corrected files'
Say '      ReportErrorLink.jsx  footer report-an-error link'
Say '      Accessibility.jsx    accessibility contact'
Say '      Privacy.jsx          rewritten for accuracy'

# --- verify -------------------------------------------------------------
Write-Host ''
Say '[3/5] Verifying...' 'Cyan'

# no personal gmail anywhere in the app
$gmailHits = Get-ChildItem -Path $src -Recurse -Include *.jsx, *.js |
  Select-String -Pattern 'walterjr\.quentin' -SimpleMatch
if ($gmailHits) {
  Say '      !   personal gmail still present in:' 'Red'
  $gmailHits | ForEach-Object { Write-Host "          $($_.Path)" -ForegroundColor Red }
  $fail = $true
} else {
  Say '      ok  no personal gmail anywhere in src'
}

# the university address is the one in config
$cfg = [IO.File]::ReadAllText((Join-Path $src 'data\siteConfig.js'))
if ($cfg -match 'qconkle2@illinois\.edu') { Say '      ok  siteConfig holds the illinois.edu address' }
else { Say '      !   siteConfig address is not qconkle2@illinois.edu' 'Red'; $fail = $true }

# all three surfaces import it rather than hardcoding
foreach ($f in @('pages\Privacy.jsx', 'pages\Accessibility.jsx', 'components\ui\ReportErrorLink.jsx')) {
  $t = [IO.File]::ReadAllText((Join-Path $src $f))
  if ($t -match 'SITE_CONTACT' -and $t -match 'siteConfig') { Say "      ok  $f imports the address" }
  else { Say "      !   $f does not import the address" 'Red'; $fail = $true }
}

# privacy page says only true things - checked against the rendered body,
# not the explanatory comment at the top of the file
$pv = [IO.File]::ReadAllText((Join-Path $src 'pages\Privacy.jsx'))
$body = $pv.Substring($pv.IndexOf('export default function'))
foreach ($c in @(
  @{ n = 'Mapbox';                     want = $false; label = 'no Mapbox claim' },
  @{ n = 'do not run a mailing list';  want = $false; label = 'no contradiction about the list' },
  @{ n = 'Google Fonts';               want = $true;  label = 'discloses Google Fonts' },
  @{ n = 'Web3Forms';                  want = $true;  label = 'names the form service' },
  @{ n = 'Leaflet';                    want = $true;  label = 'names Leaflet' },
  @{ n = 'Esri';                       want = $true;  label = 'names Esri' },
  @{ n = 'CARTO';                      want = $true;  label = 'names CARTO' },
  @{ n = 'thirty days';                want = $true;  label = 'discloses 30-day retention' }
)) {
  $has = $body.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  privacy: $($c.label)" }
  else { Say "      !   privacy: $($c.label)" 'Red'; $script:fail = $true }
}

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build ---------------------------------------------------------------
Say '[4/5] Building and linting...' 'Cyan'
Push-Location $app
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
# A missing import builds fine and crashes at runtime, so lint these three too.
$lintOut = & npx eslint src/pages/Privacy.jsx src/pages/Accessibility.jsx src/components/ui/ReportErrorLink.jsx 2>&1
$lintRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if ($lintRc -ne 0) {
  Write-Host ''; Say 'LINT FAILED on a changed file. Nothing committed:' 'Red'
  $lintOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/5] Build and lint OK'

# --- commit and push ------------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Use one contact address everywhere; correct the privacy page'
$body    = 'A personal gmail was hardcoded in the footer report-an-error link, the accessibility contact and the privacy contact, while siteConfig held the university address. All three now import from siteConfig so they cannot drift apart again. The privacy page carried four inaccuracies: it said the map is served by Mapbox when the map is Leaflet with satellite tiles from Esri and street labels from CARTO; it said I do not run a mailing list and will not add you to one, three paragraphs below the section describing the mailing list; it never mentioned Google Fonts, which every page loads and which is the one outside request a reader cannot avoid; and it described the form service without naming Web3Forms or mentioning that submissions are held for thirty days.'
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
Write-Host ''
if ($LASTEXITCODE -eq 0) {
  Say '====================================================='
  Say ' PUSHED.'
  Write-Host ''
  Say ' Check in about 2 minutes:'
  Write-Host '   /privacy   no Mapbox, names Leaflet/Esri/CARTO,'  -ForegroundColor White
  Write-Host '              discloses Google Fonts and Web3Forms'  -ForegroundColor White
  Write-Host '   footer     Report an error opens illinois.edu'    -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
