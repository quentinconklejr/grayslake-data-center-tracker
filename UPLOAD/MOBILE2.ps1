# =====================================================================
#  Grayslake Tracker - mobile layout + map legibility
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\MOBILE2.ps1"
#
#  Safe to re-run. Builds before committing, refuses to push on failure.
#
#  Reads two new component files that sit beside this script:
#    UPLOAD\_SiteMap.jsx
#    UPLOAD\_AccordionSection.jsx
#
#  TWO THINGS, ONE OF THEM FACTUAL
#  -------------------------------
#  The dashed blue shape on the map was captioned "Approved 472-Acre
#  Boundary". It is drawn from parcelsOutline.geojson - the dissolved outline
#  of the same 57 parcels the green fill already shows, 287.8 acres - in a
#  file whose own metadata reads "This is NOT the approved campus boundary."
#  The map was drawing 287.8 acres and telling people it was 472.
#
#  And the squeeze: three nested layers of horizontal padding left about 271px
#  of usable width on a 375px screen. Over a quarter of the display was margin.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo   = 'C:\Users\Quentin\grayslake-data-center-tracker'
$src    = Join-Path $repo 'grayslake-impact\src'
$upload = Join-Path $repo 'UPLOAD'
$fail   = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

function Patch($path, $find, $replace, $label) {
  $full = Join-Path $src $path
  if (-not (Test-Path $full)) { Say "      ! $label - FILE MISSING" 'Red'; $script:fail = $true; return }
  $t = [IO.File]::ReadAllText($full) -replace "`r`n", "`n"
  $f = $find -replace "`r`n", "`n"
  $r = $replace -replace "`r`n", "`n"
  if ($t.Contains($f))     { [IO.File]::WriteAllText($full, $t.Replace($f, $r)); Say "      - $label" }
  elseif ($t.Contains($r)) { Say "      - $label (already applied)" 'Yellow' }
  else                     { Say "      ! $label - NOT FOUND" 'Red'; $script:fail = $true }
}

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Mobile layout + map legibility' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$newMap = Join-Path $upload '_SiteMap.jsx'
$newAcc = Join-Path $upload '_AccordionSection.jsx'
foreach ($f in @($newMap, $newAcc)) {
  if (-not (Test-Path $f)) {
    Say "Missing required file: $f" 'Red'
    Say 'Tell Claude the file is missing and it will be re-sent.' 'Red'
    Read-Host 'Press Enter to close'; exit 1
  }
}

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/6] Up to date with GitHub'

# --- new components ----------------------------------------------------
Copy-Item $newMap (Join-Path $src 'components\map\SiteMap.jsx') -Force
Say '[2/6] Rewrote SiteMap.jsx'
Say '      - Removed the layer captioned "Approved 472-Acre Boundary"'
Say '      - Legend moved below the map, with source and acreage'
Say '      - Parcels respond to tap, not only hover'
Say '      - One finger scrolls the page, two fingers pan the map'
Say '      - Scale bar added, map height scales with screen'

# Nothing ever imported this. Dead code that duplicated the legend.
$deadLegend = Join-Path $src 'components\map\MapLegend.jsx'
if (Test-Path $deadLegend) { Remove-Item $deadLegend -Force; Say '      - Deleted unused MapLegend.jsx' }

Copy-Item $newAcc (Join-Path $src 'components\ui\AccordionSection.jsx') -Force
Say '[3/6] Rewrote AccordionSection.jsx'
Say '      - Headline figure no longer pinned to the right edge on mobile'
Say '      - Accent bar stretches instead of a fixed height'
Say '      - Panel padding px-5 to px-4 on mobile'

# --- padding, density, and the TaxImpact panel bug ---------------------
Say '[4/6] Patching pages...'

Patch 'pages\Energy.jsx' `
  '`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`' `
  '`${asSection ? "pt-1 pb-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-12"}`' `
  'Energy: drops its own padding when embedded'
Patch 'pages\Jobs.jsx' `
  '`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`' `
  '`${asSection ? "pt-1 pb-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-12"}`' `
  'Jobs: drops its own padding when embedded'
Patch 'pages\Schools.jsx' `
  '`max-w-7xl mx-auto px-4 sm:px-6 ${asSection ? "pt-2 pb-10" : "py-12"}`' `
  '`${asSection ? "pt-1 pb-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-12"}`' `
  'Schools: drops its own padding when embedded'

# TaxImpact never accepted asSection, so inside a panel it rendered its own h1
# AND its own PageTitle - opening the Tax panel on /project rewrote the browser
# tab and the canonical URL to the Tax page.
$taxFile = Join-Path $src 'pages\TaxImpact.jsx'
$tax = [IO.File]::ReadAllText($taxFile) -replace "`r`n", "`n"
if ($tax.Contains('export default function TaxImpact() {')) {
  $tax = $tax.Replace(
    'export default function TaxImpact() {',
    "// asSection is how the other three impact pages render inside the /project`n// accordion. TaxImpact never accepted it, so inside a panel it rendered its`n// own h1 and its own PageTitle, which rewrote the browser tab to the Tax page.`nexport default function TaxImpact({ asSection = false }) {")
  $tax = $tax.Replace(
    '    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">' + "`n" + "      <PageTitle {...pageMeta['/tax-impact']} />",
    '    <div className={asSection ? ''pt-1 pb-8'' : ''max-w-7xl mx-auto px-4 sm:px-6 py-12''}>' + "`n" + "      {!asSection && <PageTitle {...pageMeta['/tax-impact']} />}")
  $tax = $tax.Replace(
    '        <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Tax Impact</h1>',
    "        {asSection ? (`n          <h3 className=`"text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight mb-3`">Tax Impact</h3>`n        ) : (`n          <h1 className=`"text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3`">Tax Impact</h1>`n        )}")
  [IO.File]::WriteAllText($taxFile, $tax)
  Say '      - TaxImpact: stops hijacking the page title inside a panel'
} elseif ($tax.Contains('function TaxImpact({ asSection')) {
  Say '      - TaxImpact: asSection (already applied)' 'Yellow'
} else {
  Say '      ! TaxImpact: signature NOT FOUND' 'Red'; $fail = $true
}

# Two columns with a 24px gutter at 375px left about 130px per card.
Patch 'pages\Energy.jsx'    'grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12' 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-12' 'Energy: stat grid breathes'
Patch 'pages\Jobs.jsx'      'grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12' 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-12' 'Jobs: stat grid breathes'
Patch 'pages\Schools.jsx'   'grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12' 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 mb-10 sm:mb-12' 'Schools: stat grid breathes'
Patch 'pages\TaxImpact.jsx' 'grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12' 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-12' 'Tax: stat grid breathes'

# 36px numerals inside a ~108px card is why the numbers looked crammed.
Patch 'components\ui\StatCard.jsx' `
  'text-3xl sm:text-4xl font-display font-bold leading-none tracking-tight mb-2' `
  'text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight tracking-tight mb-2' `
  'StatCard: value scales with screen'
Patch 'components\ui\StatCard.jsx' `
  'rounded-xl px-4 pt-4 pb-4 flex flex-col' `
  'rounded-xl px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-3.5 sm:pb-4 flex flex-col' `
  'StatCard: tighter padding on mobile'

Patch 'pages\Project.jsx' `
  '<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">' `
  '<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">' `
  'Project: vertical rhythm on mobile'

if ($fail) {
  Write-Host ''
  Say 'Some patterns did not match. NOTHING committed.' 'Red'
  Say 'Send me the red lines above.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build -------------------------------------------------------------
Say '[5/6] Building...' 'Cyan'
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
Say '[5/6] Build OK'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Map: remove mislabelled boundary, add a real legend. Fix mobile density in project sections'
$body    = 'The dashed layer captioned Approved 472-Acre Boundary was drawn from the dissolved outline of the same 57 recorded parcels the green fill already showed, 287.8 acres, from a file whose own metadata says it is not the approved boundary. Removed. The legend now states plainly that the approved campus is not drawn because the Village has never published it as a mappable shape, and it moved out of a small dark overlay into a panel below the map carrying source, retrieval date and acreage. Parcels respond to tap so they are no longer inert on a phone, one finger scrolls the page while two fingers pan, and a scale bar was added. On layout, three nested layers of horizontal padding left about 271px of usable width on a 375px screen; embedded sections now drop their own wrapper, which returns roughly 40px. TaxImpact never accepted asSection so opening the Tax panel rewrote the browser tab to the Tax page.'
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
$pushed = $LASTEXITCODE
Write-Host ''
if ($pushed -eq 0) {
  Say '====================================================='
  Say ' PUSHED.'
  Write-Host ''
  Say ' On your phone in about 2 minutes:'
  Write-Host '   1. /map      legend sits under the map and reads properly' -ForegroundColor White
  Write-Host '   2. /map      tap a parcel, details appear'                 -ForegroundColor White
  Write-Host '   3. /map      one finger scrolls past, two fingers pan'     -ForegroundColor White
  Write-Host '   4. /project  open a section, it should feel wider'         -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
