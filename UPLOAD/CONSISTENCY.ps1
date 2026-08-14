# =====================================================================
#  Two contradictions the site was making with itself.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\CONSISTENCY.ps1"
#
#  Safe to re-run. Whole-file replacement.
#
#  Everything from the last pass is live and correct. I checked all of it:
#    - /anything-fake now shows YOUR 404 page, not Vercel's
#    - /tax redirects to /project#tax instead of dying
#    - /timeline opens with the May 2, 2024 land purchase
#    - the dashed PROJECTED divider sits above the Q4 2027 row
#    - /actions shows 13 actions with the case under 19th Judicial Circuit
#
#  Then I read the rest of the site as a reporter would, and found two places
#  where the site contradicts itself in the same viewport.
#
#  ---------------------------------------------------------------------
#  1. THE FUSED RANGE WAS NEVER ACTUALLY FIXED
#  ---------------------------------------------------------------------
#
#  I fixed the homepage card by hardcoding the split. That was the wrong
#  layer. The fused string is produced in src/data/keyFigures.js:
#
#      value: `$${project.costLow}-${project.costHigh}B`     ->  "$8.5-18B"
#
#  and three lines below it, the same object says:
#
#      detail: 'Two figures from two people, not a range anyone calculated.'
#
#  So the data file states the rule and breaks it in the same object, and
#  every consumer inherits the broken version. On the live site right now:
#
#      /project header    "An $8.5 billion to $18 billion hyperscale facility"
#      /project stat card "$8.5-18B"
#      /project accordion "$8.5-18B"
#      /figures fact sheet "$8.5-18B"   <- the page built FOR REPORTERS
#
#  That last one matters most. The reporters' fact sheet exists to be copied
#  into a story. A journalist lifting "$8.5-18B" from it publishes a range
#  nobody ever calculated, with your site as the attribution.
#
#  Worse, the homepage now says "Two estimates, not a range" and links to The
#  Project with "Fiscal range on The Project ->", where the reader is handed
#  the fused number. The link promises the breakdown and delivers the mistake.
#
#  Fixed at the source: value becomes "$8.5B / $18B" and all four pages
#  inherit the split automatically. The /project subtitle prose is rewritten
#  to name both speakers instead of spanning them.
#
#  ---------------------------------------------------------------------
#  2. THE SITE NAMES A TAXING DISTRICT THE VILLAGE DOES NOT
#  ---------------------------------------------------------------------
#
#  On /project#tax the summary line reads:
#
#      8 Taxing Districts
#      including Grayslake CHSD 127 & CCSD 46
#
#  Roughly two hundred pixels below it, the page lists all eight districts
#  the Village FAQ actually names. CCSD 46 is not one of them. The eight are
#  the Village, Grayslake CHSD 127, Grayslake Fire, Grayslake Park, Round Lake
#  Area Park, Fremont Elementary 79, Mundelein HS 120 and Fremont Library.
#
#  So the page names a ninth district, sourced to a FAQ that does not contain
#  it, immediately above the correct list drawn from that same FAQ. This is
#  the same error I removed from the levy table in the first audit - it
#  survived in a one-line qualifier string in keyFigures.js.
#
#  A Village trustee checking your work would find this one fast, and it is
#  exactly the kind of thing that gets a whole site dismissed as sloppy
#  regardless of how good the other 200 citations are.
#
#  The qualifier now reads "four of the eight are not Grayslake districts",
#  which is true, is the FAQ's own framing, and matches what /agreement
#  already says.
#
#  ---------------------------------------------------------------------
#  3. A NOTE-TO-SELF WAS COMMITTED INTO THE DATA FILE
#  ---------------------------------------------------------------------
#
#  keyFigures.js line 131 read:
#
#      // Add this entry to the keyFigures array in src/data/keyFigures.js
#
#  sitting inside src/data/keyFigures.js, above an entry indented two spaces
#  off from every other entry in the file. Harmless to run, but anyone who
#  opens your repo - and reporters do open repos when a site claims to show
#  its work - sees an instruction that was never cleaned up. Removed, and the
#  entry re-indented to match its neighbours.
#
#  Verified in a clean Linux build: npm run build clean, eslint clean on all
#  three changed files, and the built JS bundle checked directly - it now
#  contains "$8.5B / $18B", zero occurrences of "CCSD 46", and zero
#  occurrences of "8.5 billion to".
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo  = 'C:\Users\Quentin\grayslake-data-center-tracker'
$app   = Join-Path $repo 'grayslake-impact'
$stage = Join-Path $repo 'UPLOAD\stage'
$fail  = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Two self-contradictions' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

# Only these three. The stage folder still holds last round's files, which are
# already committed; copying them again would be a no-op, but naming exactly
# what changes is the point of doing it this way.
$files = @(
  'src\data\keyFigures.js',
  'src\pages\Project.jsx',
  'src\pages\Reporters.jsx'
)

foreach ($f in $files) {
  if (-not (Test-Path (Join-Path $stage $f))) {
    Say "Missing staged file: UPLOAD\stage\$f" 'Red'; Read-Host 'Press Enter to close'; exit 1
  }
}
Say '[1/5] All 3 staged files present'

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
& git config --local user.name  'quentin conkle jr' | Out-Null
& git config --local user.email 'qconkle2@illinois.edu' | Out-Null
& git pull --rebase origin main 2>&1 | Out-Null
Say "[2/5] Synced. Commit email: $(& git config user.email)"

foreach ($f in $files) { Copy-Item (Join-Path $stage $f) (Join-Path $app $f) -Force }
Say '[3/5] Replaced 3 files'

# --- verify ---------------------------------------------------------------
Write-Host ''
Say '[4/5] Verifying what is actually on disk...' 'Cyan'

function BodyOf($rel) {
  $raw = [IO.File]::ReadAllText((Join-Path $app $rel))
  $raw = [regex]::Replace($raw, '\{/\*.*?\*/\}', '', 'Singleline')
  return [regex]::Replace($raw, '(?m)^\s*//.*$', '')
}

$kf   = BodyOf 'src\data\keyFigures.js'
$proj = BodyOf 'src\pages\Project.jsx'
$rep  = BodyOf 'src\pages\Reporters.jsx'

foreach ($c in @(
  @{ t = $kf;   n = 'B / $';                        want = $true;  label = 'investment value split at the source' },
  @{ t = $kf;   n = 'costLow}–${project.costHigh}'; want = $false; label = 'fused template gone' },
  @{ t = $kf;   n = 'CCSD 46';                      want = $false; label = 'the ninth district is gone' },
  @{ t = $kf;   n = 'four of the eight are not';    want = $true;  label = 'qualifier matches the FAQ list' },
  @{ t = $kf;   n = 'Add this entry to the';        want = $false; label = 'note-to-self removed' },
  @{ t = $proj; n = '8.5 billion to';               want = $false; label = 'subtitle no longer spans the two figures' },
  @{ t = $proj; n = 'chief executive said up to';   want = $true;  label = 'subtitle names both speakers' },
  @{ t = $rep;  n = '$8.5–18B';                     want = $false; label = 'reporters fact sheet no longer fuses' }
)) {
  $has = $c.t.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  $($c.label)" }
  else { Say "      !   $($c.label)" 'Red'; $script:fail = $true }
}

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
$lintOut  = & npx eslint src/data/keyFigures.js src/pages/Project.jsx src/pages/Reporters.jsx 2>&1
$lintRc   = $LASTEXITCODE
Pop-Location

if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if ($lintRc -ne 0) {
  Write-Host ''; Say 'LINT FAILED. Nothing committed:' 'Red'
  $lintOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

# Check the built bundle, not just the source. This is the artifact that ships.
$bundle = (Get-ChildItem (Join-Path $app 'dist\assets') -Filter *.js | ForEach-Object { [IO.File]::ReadAllText($_.FullName) }) -join ''
if ($bundle -match 'CCSD 46')       { Say '      !   built bundle still contains CCSD 46' 'Red'; $fail = $true }
if ($bundle -match '8\.5 billion to') { Say '      !   built bundle still contains the fused prose' 'Red'; $fail = $true }
if (-not ($bundle -match 'B / \$'))  { Say '      !   built bundle does not contain the split value' 'Red'; $fail = $true }
if ($fail) { Write-Host ''; Say 'Bundle check failed. Nothing committed.' 'Red'; Read-Host 'Press Enter to close'; exit 1 }
Say '      Build, lint and bundle checks OK'

# --- commit ---------------------------------------------------------------
& git add -A 2>&1 | Out-Null
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Split the investment figure at the source; drop a district the Village never named

keyFigures.js built the investment value as `$${costLow}-${costHigh}B` and, in
the same object, described that figure as "two figures from two people, not a
range anyone calculated". The data layer stated the rule and broke it in one
breath, and every consumer inherited the broken version: The Project header
prose, its stat card, its accordion summary, and the reporters' fact sheet at
/figures. Fixing the homepage card alone had left four other places asserting a
span nobody calculated - including the page built to be copied into stories.

Value is now "$8.5B / $18B" and all consumers inherit the split. The Project
subtitle names the Village and T5's chief executive rather than spanning them.

The school-funding qualifier read "including Grayslake CHSD 127 & CCSD 46".
CCSD 46 is not among the eight districts the Village FAQ names, and the tax
section lists all eight correctly a few hundred pixels below that line - so the
page contradicted its own source inside one viewport. The qualifier now reads
"four of the eight are not Grayslake districts", which is the FAQ's framing and
matches what /agreement already says.

Also removes an "Add this entry to the keyFigures array" note-to-self that had
been committed inside keyFigures.js, and re-indents the entry below it.
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
  Say ' PUSHED. Once it goes green, check /project:'
  Write-Host ''
  Write-Host '   Header    A hyperscale facility under construction'  -ForegroundColor White
  Write-Host '             in Grayslake, IL. The Village put the'     -ForegroundColor White
  Write-Host '             cost at $8.5 billion; T5''s chief'         -ForegroundColor White
  Write-Host '             executive said up to $18 billion.'         -ForegroundColor White
  Write-Host ''
  Write-Host '   Tax card  $8.5B / $18B'                              -ForegroundColor Yellow
  Write-Host '   Summary   8 Taxing Districts'                        -ForegroundColor White
  Write-Host '             four of the eight are not Grayslake'       -ForegroundColor Yellow
  Write-Host '             districts'                                 -ForegroundColor Yellow
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
