# =====================================================================
#  Refinement pass: one real bug, two real content gaps, one honest
#  answer to the "pin the lawsuit" idea.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\REFINE.ps1"
#
#  Safe to re-run. Whole-file replacement, no patching.
#
#  ---------------------------------------------------------------------
#  ON THE THREE RECOMMENDATIONS YOU WERE SENT
#  ---------------------------------------------------------------------
#
#  (1) SPA rewrite in vercel.json - RIGHT ABOUT THE SYMPTOM, WRONG FIX.
#
#      The exact JSON it told you to add is already in your vercel.json,
#      character for character. And direct navigation is still broken: I
#      loaded /tax, /residents, /reporters, /officials and a made-up path
#      on the live site and every one returned Vercel's raw
#      "404: NOT_FOUND" instead of your own NotFound page.
#
#      Cause: "cleanUrls": true strips .html from every address, so
#      /index.html is no longer a servable path - Vercel 308-redirects it
#      to /. I verified that directly. The rewrite therefore points at an
#      address that does not exist, the chain dies, and you get the
#      platform 404. Pages with a generated shell (/project, /timeline,
#      /agreement) work only because the filesystem answers them first,
#      which is why this never looked broken.
#
#      Fix: destination "/index.html" -> "/". One character short of
#      nothing, and it turns every mistyped or stale link into your page
#      instead of Vercel's.
#
#  (2) Pin the lawsuit to the top of the Timeline - NO, AND HERE IS WHY.
#
#      The page's one promise is "chronological record". Pinning an item
#      breaks that promise, and picking which item to pin is an editorial
#      judgement - the exact thing a Village trustee would point at to
#      call this an advocacy site.
#
#      But the concern underneath it is real. Sorted by date, the lawsuit
#      is followed by "Q4 2027" and "2029", so a reader scrolling to the
#      bottom ends on two forecasts and the most consequential recorded
#      event sits mid-page looking like just another row.
#
#      Fixed by stating a fact instead of making a judgement: a dashed
#      divider labelled "PROJECTED - HAS NOT HAPPENED" now separates the
#      record from the forecasts. The lawsuit becomes the last real thing
#      on the page, chronology is untouched, and the 2027/2029 rows are
#      explicitly marked as not-yet-facts. That is better than pinning
#      even on its own terms.
#
#  (3) 44px tap targets on the map toggle - ALREADY DONE.
#
#      SiteMap.jsx line 243 already carries min-h-[44px] on both buttons.
#      Nothing to change.
#
#  ---------------------------------------------------------------------
#  WHAT I FOUND THAT WAS NOT ON THE LIST
#  ---------------------------------------------------------------------
#
#  (4) THE TIMELINE OPENED WITH A DATE THAT NEVER HAPPENED.
#
#      "Land acquisition" was dated September 2025. Your own parcel data
#      has exactly five recorded sale dates: 2024-05-02, 2025-01-17,
#      2025-04-25, 2025-04-28 and 2025-05-06. Nothing in September 2025.
#      The entry's own text says May 2024 to May 2025.
#
#      That misdating buried the single most newsworthy fact on the page.
#      Correctly dated to the first recorded sale, the purchase moves to
#      the TOP of the timeline - four months BEFORE T5 filed for village
#      approvals on September 23, 2024.
#
#      And the last recorded sale is May 6, 2025: the same day the Village
#      records the approval process as complete. Both facts are arithmetic
#      on sources you already cite - the county GIS layer and the Village
#      FAQ - so both are now stated flatly, with no adjective attached.
#      A reporter will find this within a minute of opening the page. It
#      should be your finding, not theirs.
#
#  (5) /ACTIONS DID NOT CONTAIN THE LAWSUIT.
#
#      A page headed "Jurisdictional Actions", with a "Legal Challenge"
#      filter, listed counsel being retained and intent being signalled -
#      and not the case that was actually filed. Case 2026CH00000171 is on
#      your Timeline, on your Deal page, and hosted as a PDF on your own
#      server, but the actions register omitted it. Now added, with all
#      four counts and the standard "allegations, not findings" line.
#
#  (6) TWO LEGAL ENTRIES WERE ATTRIBUTED TO THE WRONG BODY.
#
#      "Coalition retains counsel" and "coalition signals intent" were
#      both filed under jurisdiction "Lake County Board". The County Board
#      did neither of those things. On a page organised BY jurisdiction,
#      attributing a residents' group's actions to a county government is
#      the kind of error that costs you the benefit of the doubt on
#      everything else. Both now sit under "Residents & Opposition
#      Coalition", and the filed case sits under "19th Judicial Circuit
#      Court", with the intro copy updated to say the page covers the
#      court and the private parties as well as the agencies.
#
#  (7) FOUR DEAD SYMBOLS REMOVED.
#
#      Unused imports in Project.jsx and OpenQuestions.jsx, an unused
#      sourceKey prop on ParcelTable, an unused state setter on the
#      Timeline page. Repo lint errors go from 9 to 5.
#
#      The five that remain are two setState-in-effect warnings in
#      Header.jsx and SectionBar.jsx and three react-refresh notices. They
#      are all pre-existing, none affects what a visitor sees, and fixing
#      the header ones means touching the mobile menu and the sticky
#      section bar - which have both broken before. Left alone
#      deliberately, not missed.
#
#  Verified in a clean Linux build before this script was written:
#  npm run build clean, eslint clean on all nine changed files, and the
#  timeline re-sorted to confirm the land purchase now renders first.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo  = 'C:\Users\Quentin\grayslake-data-center-tracker'
$app   = Join-Path $repo 'grayslake-impact'
$stage = Join-Path $repo 'UPLOAD\stage'
$fail  = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Refinement pass' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @(
  'vercel.json',
  'src\data\timeline.js',
  'src\data\actions.js',
  'src\pages\Actions.jsx',
  'src\pages\Timeline.jsx',
  'src\pages\Project.jsx',
  'src\pages\OpenQuestions.jsx',
  'src\components\ui\Timeline.jsx',
  'src\components\map\ParcelTable.jsx'
)

foreach ($f in $files) {
  if (-not (Test-Path (Join-Path $stage $f))) {
    Say "Missing staged file: UPLOAD\stage\$f" 'Red'; Read-Host 'Press Enter to close'; exit 1
  }
}
Say "[1/5] All 9 staged files present"

# --- git identity ---------------------------------------------------------
# Set unconditionally. The earlier scripts only set this when it was blank,
# which is how a commit went out under walterjr.quentin@gmail.com - an address
# not on your GitHub account - and Vercel refused to build it.
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
& git config --local user.name  'quentin conkle jr' | Out-Null
& git config --local user.email 'qconkle2@illinois.edu' | Out-Null
& git pull --rebase origin main 2>&1 | Out-Null
Say "[2/5] Synced. Commit email: $(& git config user.email)"

# --- copy -----------------------------------------------------------------
foreach ($f in $files) {
  $dest = Join-Path $app $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item (Join-Path $stage $f) $dest -Force
}
Remove-Item (Join-Path $stage 'PROBE.txt') -Force -ErrorAction SilentlyContinue
Say '[3/5] Replaced 9 files'

# --- verify on disk -------------------------------------------------------
Write-Host ''
Say '[4/5] Verifying what is actually on disk...' 'Cyan'

function BodyOf($rel) {
  $raw = [IO.File]::ReadAllText((Join-Path $app $rel))
  # Strip JSX and block comments so a check reads what RENDERS, not a comment
  # that quotes the old text while explaining its removal.
  $raw = [regex]::Replace($raw, '\{/\*.*?\*/\}', '', 'Singleline')
  return [regex]::Replace($raw, '(?m)^\s*//.*$', '')
}

$vercel   = [IO.File]::ReadAllText((Join-Path $app 'vercel.json'))
$timeline = BodyOf 'src\data\timeline.js'
$actions  = BodyOf 'src\data\actions.js'
$actPage  = BodyOf 'src\pages\Actions.jsx'
$tlComp   = BodyOf 'src\components\ui\Timeline.jsx'

foreach ($c in @(
  @{ t = $vercel;   n = '"destination": "/"';                want = $true;  label = 'SPA fallback points at a path that exists' },
  @{ t = $vercel;   n = '/index.html';                       want = $false; label = 'no rewrite to the cleanUrls-stripped address' },
  @{ t = $timeline; n = 'date: "2024-05-02"';                want = $true;  label = 'land purchase dated to the first recorded sale' },
  @{ t = $timeline; n = 'Land acquisition begins';           want = $true;  label = 'and retitled' },
  @{ t = $timeline; n = 'date: "2025-09"';                   want = $false; label = 'the September 2025 date is gone' },
  @{ t = $timeline; n = 'predates the start of the Village'; want = $true;  label = 'sequence stated plainly' },
  @{ t = $actions;  n = '2026CH00000171';                    want = $true;  label = 'filed case now in the actions register' },
  @{ t = $actions;  n = '19th Judicial Circuit Court';       want = $true;  label = 'filed under the court' },
  @{ t = $actions;  n = 'Residents & Opposition Coalition';  want = $true;  label = 'coalition entries re-attributed' },
  @{ t = $actPage;  n = '19th Judicial Circuit Court';       want = $true;  label = 'court registered as a filter' },
  @{ t = $tlComp;   n = 'Projected';                         want = $true;  label = 'projected/recorded divider present' }
)) {
  $has = $c.t.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  $($c.label)" }
  else { Say "      !   $($c.label)" 'Red'; $script:fail = $true }
}

# The County Board should no longer own any Legal Challenge entry.
$badPair = [regex]::Matches($actions, 'jurisdiction:\s*"Lake County Board",\s*actionType:\s*"Legal Challenge"').Count
if ($badPair -eq 0) { Say '      ok  no legal challenge still attributed to the County Board' }
else { Say "      !   $badPair legal entries still under Lake County Board" 'Red'; $script:fail = $true }

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build + lint ---------------------------------------------------------
Write-Host ''
Say '[5/5] Building and linting...' 'Cyan'
Push-Location $app
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc  = $LASTEXITCODE
$lintOut  = & npx eslint src/data/actions.js src/data/timeline.js src/pages/Actions.jsx src/pages/Timeline.jsx src/pages/Project.jsx src/pages/OpenQuestions.jsx src/components/ui/Timeline.jsx src/components/map/ParcelTable.jsx 2>&1
$lintRc   = $LASTEXITCODE
Pop-Location

if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if ($lintRc -ne 0) {
  Write-Host ''; Say 'LINT FAILED on a changed file. Nothing committed:' 'Red'
  $lintOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '      Build and lint OK'

# --- commit ---------------------------------------------------------------
& git add -A 2>&1 | Out-Null

$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Fix the SPA fallback, correct the land-purchase date, add the filed case

The vercel.json rewrite sent unmatched paths to /index.html, but cleanUrls
strips .html and 308-redirects that address to /, so the destination was not
servable and every unmatched path fell through to Vercel's own 404 page. /tax,
/residents, /reporters, /officials and any mistyped URL returned the platform
404 instead of the site's NotFound. Destination is now "/". Routes with a
generated shell were unaffected, which is why this never looked broken.

The "Land acquisition" timeline entry was dated September 2025. The parcel data
has five recorded sale dates and none is in September 2025; the entry's own
text describes May 2024 to May 2025. Dated correctly to the first recorded
sale, it moves to the top of the timeline - four months before T5 filed for
village approvals on September 23, 2024 - and the last recorded sale falls on
May 6, 2025, the day the Village records the approval process as complete.
Both are arithmetic on already-cited sources and are now stated without
adjectives.

/actions listed counsel being retained and intent being signalled but not the
case that was actually filed. Case 2026CH00000171 is added with its four counts
and the allegations-not-findings caveat. Two entries about the residents'
coalition were attributed to jurisdiction "Lake County Board", which took
neither action; they now sit under "Residents & Opposition Coalition" and the
filed case under "19th Judicial Circuit Court".

The timeline gains a dashed "projected - has not happened" divider before the
2027 and 2029 rows, so the lawsuit is the last recorded event on the page
without pinning anything out of chronological order.

Also removes four unused symbols; repo lint errors drop from 9 to 5.
'@
[IO.File]::WriteAllText($msgFile, $msg, (New-Object Text.UTF8Encoding $false))
$commitOut = & git commit -F $msgFile 2>&1
Remove-Item $msgFile -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) { Say 'Committed' }
elseif ($commitOut -match 'nothing to commit|working tree clean') { Say 'Nothing new to commit' 'Yellow' }
else {
  Write-Host ''; Say 'COMMIT FAILED:' 'Red'
  $commitOut | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

$author = & git log -1 --pretty='%ae'
if ($author -ne 'qconkle2@illinois.edu') {
  Say "Commit author is $author, which Vercel will block. Not pushing." 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

Write-Host ''
& git push origin main
Write-Host ''
if ($LASTEXITCODE -eq 0) {
  Say '====================================================='
  Say ' PUSHED. Check these once it goes green:'
  Write-Host ''
  Write-Host '   1. grayslakedatacentertracker.org/anything-fake'  -ForegroundColor White
  Write-Host '      should now show YOUR 404, not Vercel''s.'      -ForegroundColor White
  Write-Host '   2. /timeline should OPEN with the May 2, 2024'    -ForegroundColor White
  Write-Host '      land purchase, and show a dashed PROJECTED'    -ForegroundColor White
  Write-Host '      divider above the 2027 row.'                   -ForegroundColor White
  Write-Host '   3. /actions should list 13 actions, with the'     -ForegroundColor White
  Write-Host '      filed case under 19th Judicial Circuit Court.' -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
