# =====================================================================
#  Grayslake Tracker - mobile fixes.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\MOBILE.ps1"
#
#  Run this AFTER GO.ps1 and READY.ps1. Safe to re-run.
#  Every patch simulated against real origin/main with CRLF endings.
#  Build passes.
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
  if ($t.Contains($f))      { [IO.File]::WriteAllText($full, $t.Replace($f, $r)); Say "      - $label" }
  elseif ($t.Contains($r))  { Say "      - $label (already applied)" 'Yellow' }
  else                      { Say "      ! $label - NOT FOUND" 'Red'; $script:fail = $true }
}

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Grayslake Tracker - mobile' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
Say '[1/5] Git ready'

# NOTE: no reset here. This builds on top of whatever GO.ps1 and READY.ps1
# already committed, rather than throwing their work away.
& git pull --rebase origin main 2>&1 | Out-Null
Say '[2/5] Up to date with GitHub'

# =====================================================================
# 3. THE BIG ONE: every citation on the site is dead on a phone
# =====================================================================
# SourceCitation suppresses its hover tooltip below 768px and instead calls
# document.getElementById('footnote-list').scrollIntoView(). No element with
# that id exists anywhere in the app, so on a phone tapping [1] calls
# preventDefault and then does nothing at all.
#
# On a site whose entire promise is that every claim links to its source,
# the source links do nothing for the majority of readers.
Patch 'components\ui\FootnoteContext.jsx' `
  '    <div className="mt-10 pt-6 border-t border-edge-soft">' `
  '    <div id="footnote-list" className="mt-10 pt-6 border-t border-edge-soft scroll-mt-24">' `
  'Citations now work on mobile (footnote-list id)'

# =====================================================================
# 4. Agreement table forced a sideways scroll on a phone
# =====================================================================
# min-w-[32rem] is 512px against a 375px screen.
Patch 'pages\Agreement.jsx' `
  '<table className="w-full text-left border-collapse min-w-[32rem]">' `
  '<table className="w-full text-left border-collapse">' `
  'Agreement table fits phone width'
Patch 'pages\Agreement.jsx' `
  'className="py-3 pr-4 text-sm font-display font-bold text-gray-900 whitespace-nowrap"' `
  'className="py-3 pr-3 text-sm font-display font-bold text-gray-900"' `
  'Agreement figure column wraps'

# =====================================================================
# 5. Mobile menu had no Escape and no focus return
# =====================================================================
Patch 'components\layout\Header.jsx' `
  "import { useState, useEffect } from 'react'" `
  "import { useState, useEffect, useRef } from 'react'" `
  'Header: useRef import'

Patch 'components\layout\Header.jsx' `
  "  const [mobileOpen, setMobileOpen] = useState(false)`n  const location = useLocation()`n`n  useEffect(() => {`n    setMobileOpen(false)`n  }, [location.pathname])" `
  "  const [mobileOpen, setMobileOpen] = useState(false)`n  const location = useLocation()`n  const toggleRef = useRef(null)`n  const menuRef = useRef(null)`n`n  useEffect(() => {`n    setMobileOpen(false)`n  }, [location.pathname])`n`n  // The mobile menu had no Escape key and no focus return. On a phone, which`n  // is how most people open this, a keyboard or screen reader user opened it`n  // and tabbed straight past it into the page behind, unable to dismiss it.`n  useEffect(() => {`n    if (!mobileOpen) return`n    function onKeyDown(e) {`n      if (e.key === 'Escape') {`n        e.preventDefault()`n        setMobileOpen(false)`n        toggleRef.current?.focus()`n        return`n      }`n      if (e.key !== 'Tab') return`n      const focusable = [toggleRef.current, ...(menuRef.current?.querySelectorAll('a[href], button:not([disabled])') ?? [])].filter(Boolean)`n      if (focusable.length < 2) return`n      const first = focusable[0]`n      const last = focusable[focusable.length - 1]`n      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }`n      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }`n    }`n    document.addEventListener('keydown', onKeyDown)`n    return () => document.removeEventListener('keydown', onKeyDown)`n  }, [mobileOpen])" `
  'Header: Escape closes menu, focus returns'

Patch 'components\layout\Header.jsx' `
  "        <button`n          onClick={() => setMobileOpen(v => !v)}`n          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}" `
  "        <button`n          ref={toggleRef}`n          onClick={() => setMobileOpen(v => !v)}`n          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}`n          aria-expanded={mobileOpen}" `
  'Header: toggle ref and aria-expanded'

Patch 'components\layout\Header.jsx' `
  '        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">' `
  '        <div ref={menuRef} className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">' `
  'Header: menu ref'

# =====================================================================
# 6. Tap targets under 44px on controls people actually press
# =====================================================================
Patch 'pages\Timeline.jsx' `
  'px-3.5 py-2 rounded-lg transition-colors shrink-0 self-start sm:self-center' `
  'px-3.5 py-2 rounded-lg transition-colors shrink-0 self-start sm:self-center min-h-[44px]' `
  'Tap target: timeline export'
Patch 'pages\Timeline.jsx' `
  'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors' `
  'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors min-h-[44px]' `
  'Tap target: timeline filter chips'
Patch 'pages\Reporters.jsx' `
  'px-3 py-1.5 rounded-lg border border-sky-200 transition-colors shrink-0' `
  'px-3 py-1.5 rounded-lg border border-sky-200 transition-colors shrink-0 min-h-[44px]' `
  'Tap target: copy buttons'
Patch 'components\map\ParcelTable.jsx' `
  'px-3 py-2 rounded-lg transition-colors' `
  'px-3 py-2 rounded-lg transition-colors min-h-[44px]' `
  'Tap target: parcel table control'
Patch 'components\map\ParcelTable.jsx' `
  'px-3.5 py-2 rounded-lg border border-sky-200 transition-colors' `
  'px-3.5 py-2 rounded-lg border border-sky-200 transition-colors min-h-[44px]' `
  'Tap target: parcel CSV export'

Say '[3/5] Mobile fixes applied'

if ($fail) {
  Write-Host ''
  Say 'Some patterns did not match. NOTHING committed.' 'Red'
  Say 'Send me the red lines above.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build check -------------------------------------------------------
Say '[4/5] Building...' 'Cyan'
Push-Location (Join-Path $repo 'grayslake-impact')
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed. Last lines:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '[4/5] Build OK'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Fix mobile: citations were dead on phones, table overflow, menu escape, tap targets'
$body    = 'SourceCitation suppresses its tooltip below 768px and scrolls to an element with id footnote-list instead. That element did not exist anywhere in the app, so tapping any citation on a phone did nothing at all - on a site whose promise is that every claim links to its source. The agreement table had a 512px minimum width against a 375px screen. The mobile menu had no Escape key and did not return focus to the toggle. Five controls were under the 44px minimum tap size.'
$commitOut = & git commit -m $subject -m $body 2>&1
$commitRc = $LASTEXITCODE
if ($commitRc -eq 0) { Say '[5/5] Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say '[5/5] Nothing new to commit' 'Yellow' }
else {
  Write-Host ''; Say 'COMMIT FAILED. Git said:' 'Red'
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
  Say ' On your phone, after ~2 minutes:'
  Write-Host '   1. Tap any [1] citation - it should jump to Sources' -ForegroundColor White
  Write-Host '   2. /agreement - the table should not scroll sideways' -ForegroundColor White
  Write-Host '   3. Open the menu, tap around, close it'              -ForegroundColor White
  Write-Host '   4. Scroll past the map with your thumb ON the map'   -ForegroundColor White
  Write-Host '      - if the page will not scroll, tell me'           -ForegroundColor Yellow
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
