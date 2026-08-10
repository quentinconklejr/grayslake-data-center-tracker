# =====================================================================
#  Grayslake Tracker - everything needed to be share-ready, in one run.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\READY.ps1"
#
#  Self-contained and idempotent. Every patch was simulated against the
#  real origin/main with CRLF endings; build and lint both pass.
# =====================================================================

$ErrorActionPreference = 'Continue'

$repo = 'C:\Users\Quentin\grayslake-data-center-tracker'
$src  = Join-Path $repo 'grayslake-impact\src'
$fail = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

function Patch($path, $find, $replace, $label) {
  $full = Join-Path $src $path
  if (-not (Test-Path $full)) { Say "      ! $label - FILE MISSING" 'Red'; $script:fail = $true; return }
  $t = [IO.File]::ReadAllText($full) -replace "`r`n", "`n"
  $f = $find    -replace "`r`n", "`n"
  $r = $replace -replace "`r`n", "`n"
  if ($t.Contains($f))      { [IO.File]::WriteAllText($full, $t.Replace($f, $r)); Say "      - $label" }
  elseif ($r -ne '' -and $t.Contains($r)) { Say "      - $label (already applied)" 'Yellow' }
  elseif ($r -eq '')        { Say "      - $label (already applied)" 'Yellow' }
  else                      { Say "      ! $label - NOT FOUND" 'Red'; $script:fail = $true }
}

function PatchBlock($path, $anchor, $startsWith, $endsWith, $replacement, $label) {
  $full = Join-Path $src $path
  $lines = [System.Collections.Generic.List[string]]([IO.File]::ReadAllText($full) -replace "`r`n","`n" -split "`n")
  $hit = -1
  for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like "*$anchor*") { $hit = $i; break } }
  if ($hit -lt 0) { Say "      - $label (already applied)" 'Yellow'; return }
  $s = $hit; while ($s -gt 0 -and $lines[$s] -notlike "*$startsWith*") { $s-- }
  $e = $hit; while ($e -lt $lines.Count - 1 -and $lines[$e] -notlike "*$endsWith*") { $e++ }
  if ($lines[$s] -notlike "*$startsWith*" -or $lines[$e] -notlike "*$endsWith*") {
    Say "      ! $label - BOUNDS NOT FOUND" 'Red'; $script:fail = $true; return
  }
  $lines.RemoveRange($s, $e - $s + 1)
  if ($replacement -ne '') { $lines.InsertRange($s, [string[]]($replacement -split "`n")) }
  [IO.File]::WriteAllText($full, ($lines -join "`n"))
  Say "      - $label"
}

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Grayslake Tracker - make it share-ready' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

# --- 1. housekeeping ---------------------------------------------------
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
Say '[1/6] Git ready'

& git branch -f backup-before-ready HEAD 2>&1 | Out-Null
& git fetch origin 2>&1 | Out-Null
& git reset --hard origin/main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Say '[2/6] Could not sync to origin/main. Stopping.' 'Red'; Read-Host 'Enter to close'; exit 1 }
Say '[2/6] Synced to live code (backup saved: backup-before-ready)'

# =====================================================================
# 3. THE BLOCKER: the subscribe form that does nothing
# =====================================================================
# EnterpriseLeadBanner sat on the homepage promising email alerts for new
# deeds, meeting transcripts and court filings. handleSubmit set a flag and
# discarded the address - no backend, no list - then told the visitor
# "Subscription request received". On a site whose whole premise is that
# what it says is true, that is the worst thing on it.
Patch 'pages\Home.jsx' "import EnterpriseLeadBanner from '../components/ui/EnterpriseLeadBanner'`n" '' 'Removed fake subscribe banner (import)'
Patch 'pages\Home.jsx' "        {/* Research Email Subscription Banner */}`n        <EnterpriseLeadBanner />`n`n" '' 'Removed fake subscribe banner (usage)'
$bannerFile = Join-Path $src 'components\ui\EnterpriseLeadBanner.jsx'
if (Test-Path $bannerFile) { Remove-Item $bannerFile -Force; Say '      - Deleted EnterpriseLeadBanner.jsx' }

# =====================================================================
# 4. Accuracy
# =====================================================================
# Verified against parcels.geojson directly: the arithmetic is right, but two
# parcels totalling 64.0 acres carry no recorded sale, so $62.9M covers 55 of
# 57 parcels and 223.8 of 287.8 acres. Also "four further deeds" was three.
Patch 'data\timeline.js' `
  'Four further deeds through May 2025 bring recorded consideration to $62,968,250 across 57 parcels and 287.8 acres.' `
  'Three further recordings in April and May 2025 bring recorded consideration to $62,968,250. That total covers 55 of the 57 parcels, or 223.8 of the 287.8 acres: two parcels totalling 64.0 acres carry no recorded sale in the county layer.' `
  'Recorded consideration corrected (timeline)'

Patch 'data\keyFigures.js' `
  "'Deeds recorded to T5 entities in Grayslake, totalling `$62,968,250 in recorded consideration through May 2025.'" `
  "'Deeds recorded to T5 entities in Grayslake. `$62,968,250 in consideration is recorded through May 2025, covering 55 of the 57 parcels; two parcels totalling 64.0 acres carry no recorded sale in the county layer.'" `
  'Recorded consideration corrected (key figures)'

# Fremont, not Freemont. The prose said Fremont and the list said Freemont,
# on the same screen, on the school funding page.
Patch 'data\projections.js' '"Freemont Elementary School District 79"' '"Fremont Elementary School District 79"' 'Fremont spelling (elementary)'
Patch 'data\projections.js' '"Freemont Library District"'            '"Fremont Library District"'            'Fremont spelling (library)'

# =====================================================================
# 5. Timeline chronological order
# =====================================================================
# The component rendered raw array order and the data had drifted - a June 26
# entry above a June 9 one. Sorting at render means the data file can stay
# grouped however is easiest to edit.
Patch 'components\ui\Timeline.jsx' `
  '  const timestamps = events.map(e => dateToMs(e.date))' `
  "  // Sorted here rather than trusting the order of the data file, which had`n  // drifted: a June 26 entry sat above a June 9 one. The proportional view`n  // also computed a negative gap across that pair and silently clamped it.`n  const sorted = [...events].sort((a, b) => (dateToMs(a.date) ?? 0) - (dateToMs(b.date) ?? 0))`n  const timestamps = sorted.map(e => dateToMs(e.date))" `
  'Timeline sorts chronologically'
Patch 'components\ui\Timeline.jsx' '        {events.map((event, i) => {' '        {sorted.map((event, i) => {' 'Timeline renders sorted'
Patch 'components\ui\Timeline.jsx' 'i < events.length - 1' 'i < sorted.length - 1' 'Timeline divider uses sorted'

# =====================================================================
# 6. The derived Power Buffer
# =====================================================================
# Subtracted two figures of different scope, and silently picked 1,600 over
# the 1,550 ComEd is elsewhere credited with - 1,550 minus 1,200 gives 350.
# No source publishes a headroom figure.
Patch 'pages\Energy.jsx' `
  "const buffer = project.securedPowerMW - project.totalCapacityMW`n" `
  "// A `"Power Buffer`" stat used to be derived here. It subtracted two figures`n// of different scope, and which answer you got depended on whether you used`n// 1,600 or the 1,550 ComEd is elsewhere credited with. No source publishes a`n// headroom figure, so the site should not manufacture one.`n" `
  'Removed derived Power Buffer (calculation)'
Patch 'pages\Energy.jsx' `
  '        <StatCard label="Power Buffer"      value={`${buffer} MW`}                                sub="Calculated: 1,600 minus 1,200 MW" accent="amber" badge="Derived" />' + "`n" `
  '' `
  'Removed derived Power Buffer (stat card)'
Patch 'pages\Energy.jsx' 'grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12' 'grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12' 'Energy stat grid now 4 wide'
Patch 'pages\Energy.jsx' `
  "              ['Power Buffer',          ``${buffer} MW``, null, '1,600 minus 1,200'],`n" `
  '' `
  'Removed derived Power Buffer (table row)'

# =====================================================================
# 7. Contrast - opacity modifiers fail AA and the checker cannot see them
# =====================================================================
Patch 'components\ui\FootnoteContext.jsx' 'text-amber-700/70' 'text-amber-800' 'Contrast: footnote notes'
Patch 'pages\NotFound.jsx'                'text-blue-600/60'  'text-blue-700'  'Contrast: not-found label'
Patch 'pages\Actions.jsx'                 'text-blue-600/60'  'text-blue-700'  'Contrast: actions label'

# =====================================================================
# 8. /actions was routed and linked from nowhere
# =====================================================================
Patch 'data\navLinks.js' `
  "  { to: '/map',       label: 'Map',         end: false, group: 'tools' }," `
  "  { to: '/map',       label: 'Map',         end: false, group: 'tools' },`n  { to: '/actions',   label: 'Actions',     end: false, group: 'tools' }," `
  'Actions page added to nav'

Say '[3/6] Fixes applied'

if ($fail) {
  Write-Host ''
  Say 'Some patterns did not match. NOTHING has been committed.' 'Red'
  Say 'Send me the red lines above.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- 4. build check ----------------------------------------------------
Say '[4/6] Building to check nothing broke...' 'Cyan'
Push-Location (Join-Path $repo 'grayslake-impact')
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''
  Say 'BUILD FAILED. Nothing committed. Last lines:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/6] Build OK'

# --- 5. commit ---------------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Remove non-functional subscribe form; fix parcel consideration, timeline order, derived power figure, contrast'
$body    = 'The homepage carried a subscribe form that discarded the address and told the visitor a subscription had been created. Removed. Recorded consideration of 62,968,250 dollars was presented as covering all 57 parcels; two parcels totalling 64 acres carry no recorded sale, so it covers 55 of 57. Timeline rendered in file order rather than date order. The derived Power Buffer subtracted two figures of different scope and no source publishes a headroom number. Fremont was spelled two ways on one screen. Opacity modifiers on text failed AA and are invisible to the contrast checker. The Actions page was routed but linked from nowhere.'
$commitOut = & git commit -m $subject -m $body 2>&1
$commitRc = $LASTEXITCODE
if ($commitRc -eq 0) { Say '[5/6] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[5/6] Nothing new to commit' 'Yellow' }
else {
  Write-Host ''; Say '[5/6] COMMIT FAILED. Git said:' 'Red'
  $commitOut | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

# --- 6. push -----------------------------------------------------------
Say '[6/6] Pushing...' 'Cyan'
Write-Host ''
& git push origin main
$pushed = $LASTEXITCODE

Write-Host ''
if ($pushed -eq 0) {
  Say '====================================================='
  Say ' DONE. Pushed.'
  Write-Host ''
  Say ' Wait about 2 minutes, then check in a private window:'
  Write-Host '   1. Homepage - no email subscribe box near the bottom' -ForegroundColor White
  Write-Host '   2. /timeline - dates run oldest to newest'            -ForegroundColor White
  Write-Host '   3. /agreement - loads'                                -ForegroundColor White
  Write-Host '   4. Nav has both The Deal and Actions'                 -ForegroundColor White
  Say '====================================================='
} else {
  Say '=====================================================' 'Red'
  Say ' PUSH FAILED. If GitHub asked you to sign in, do that' 'Red'
  Say ' and run this again. The commit is saved locally.' 'Red'
  Say '=====================================================' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
