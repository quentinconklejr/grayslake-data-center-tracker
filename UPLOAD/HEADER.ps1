# =====================================================================
#  Grayslake Tracker - fix the smooshed header.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\HEADER.ps1"
#
#  Run AFTER GO.ps1, READY.ps1 and MOBILE.ps1. Safe to re-run.
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
  $f = $find -replace "`r`n", "`n"
  $r = $replace -replace "`r`n", "`n"
  if ($t.Contains($f))      { [IO.File]::WriteAllText($full, ([regex]::Replace($t, [regex]::Escape($f), [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $r }, 1))); Say "      - $label" }
  elseif ($t.Contains($r))  { Say "      - $label (already applied)" 'Yellow' }
  else                      { Say "      ! $label - NOT FOUND" 'Red'; $script:fail = $true }
}

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Grayslake Tracker - header spacing' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/4] Up to date with GitHub'

# =====================================================================
# The problem, measured.
#
# The brand block is about 279px. The nav bar started at md (768px), which
# leaves roughly 425px for the links. Nine links plus two dividers need
# about 769px. So it overflowed by 344px at 768px wide, and still by 88px
# at 1024px. The container has overflow-hidden, so instead of wrapping it
# just clipped - which is the smooshed look.
#
# Three changes, and the arithmetic then works at 1024px and up:
#   8 links, gap-4, nav starts at lg.  657px needed, 681px available.
# =====================================================================

# 1. Actions comes back out of the nav. A ninth item never fits, and of the
#    nine it is the most reference-like. It gets a link on the Timeline page
#    instead, which is the same record organised by actor rather than date.
Patch 'data\navLinks.js' `
  "  { to: '/map',       label: 'Map',         end: false, group: 'tools' },`n  { to: '/actions',   label: 'Actions',     end: false, group: 'tools' }," `
  "  { to: '/map',       label: 'Map',         end: false, group: 'tools' }," `
  'Actions removed from nav (8 links now)'

# 2. Desktop nav starts at lg instead of md, with tighter gaps below xl.
Patch 'components\layout\Header.jsx' `
  '<nav className="hidden md:flex items-center gap-5 shrink-0">' `
  '<nav className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">' `
  'Desktop nav at lg, tighter gaps'

Patch 'components\layout\Header.jsx' `
  'className="md:hidden flex items-center justify-center p-2 rounded-lg' `
  'className="lg:hidden flex items-center justify-center p-2 rounded-lg' `
  'Hamburger now shows below lg'

Patch 'components\layout\Header.jsx' `
  'className="md:hidden bg-white border-b' `
  'className="lg:hidden bg-white border-b' `
  'Mobile menu now shows below lg'

# 3. Keep Actions reachable.
Patch 'pages\Timeline.jsx' `
  "import { useSearchParams } from 'react-router-dom'" `
  "import { Link, useSearchParams } from 'react-router-dom'" `
  'Timeline: Link import'

Patch 'pages\Timeline.jsx' `
  "        {/* Timeline Visualization */}`n        <TimelineUI events={visible} proportional={proportional} />`n`n        <FootnoteList />" `
  "        {/* Timeline Visualization */}`n        <TimelineUI events={visible} proportional={proportional} />`n`n        {/* Actions is the same record organised by who acted rather than when.`n            It was routed and linked from nowhere; it lives here rather than in`n            the nav, which could not hold a ninth item. */}`n        <div className=`"mt-10 pt-6 border-t border-edge-soft`">`n          <Link`n            to=`"/actions`"`n            className=`"inline-flex items-center gap-2 text-sm font-medium text-sky-800 hover:text-sky-900 min-h-[44px]`"`n          >`n            See the same events by jurisdiction, with verification dates`n            <span aria-hidden=`"true`">&rarr;</span>`n          </Link>`n        </div>`n`n        <FootnoteList />" `
  'Timeline: link to Actions'

Say '[2/4] Header fixes applied'

if ($fail) {
  Write-Host ''
  Say 'Some patterns did not match. NOTHING committed.' 'Red'
  Say 'Send me the red lines above.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build -------------------------------------------------------------
Say '[3/4] Building...' 'Cyan'
Push-Location (Join-Path $repo 'grayslake-impact')
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[3/4] Build OK'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Fix header crowding: 8 nav links, desktop bar starts at lg'
$body    = 'The brand block is about 279px and the nav bar started at 768px, leaving roughly 425px for links that needed about 769px. The container has overflow-hidden so it clipped rather than wrapped. Actions comes out of the nav and is linked from the Timeline page instead, the bar starts at lg with tighter gaps, and the arithmetic now works from 1024px up.'
$commitOut = & git commit -m $subject -m $body 2>&1
$commitRc = $LASTEXITCODE
if ($commitRc -eq 0) { Say '[4/4] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[4/4] Nothing new to commit' 'Yellow' }
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
  Say ' DONE. Pushed.'
  Write-Host ''
  Say ' Check after ~2 minutes:'
  Write-Host '   - Full screen: 8 links, evenly spaced, nothing clipped' -ForegroundColor White
  Write-Host '   - Drag the window narrower: hamburger appears at 1024' -ForegroundColor White
  Write-Host '   - Phone: hamburger, menu opens with all 8 plus Actions' -ForegroundColor White
  Write-Host '   - /timeline: link to Actions under the timeline'        -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
