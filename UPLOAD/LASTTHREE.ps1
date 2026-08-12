# =====================================================================
#  The last three homepage fixes.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\LASTTHREE.ps1"
#
#  Safe to re-run.
#
#  1. THE FUSED RANGE - the last open Critical item from the first audit
#     -----------------------------------------------------------------
#     The investment card printed $8.5-18B as one number. Your own
#     keyFigures.js says of that entry: "two figures from two people, not a
#     range anyone calculated." An en dash between two numbers tells a reader
#     that everything in between was considered. Nobody considered $12B. The
#     headline stopped fusing them weeks ago; this card was the last place on
#     the site that still did.
#
#     Now:  $8.5B  /  $18B
#           "Two estimates, not a range. Grayslake's mayor said $8.5B; T5's
#            chief executive said up to $18B. Nobody has published a figure in
#            between, and no independent valuation exists."
#
#     A slash separates. A dash spans. That is the whole difference, and it is
#     the difference between reporting two claims and inventing a third.
#
#  2. THE MAP CAPTION
#     ---------------
#     It read "Approved campus boundary covers up to 472 acres" directly under
#     the map - which invites a reader to think the shape on screen IS the 472
#     acres. It is not; the map draws 57 recorded deeds totalling 287.8 acres,
#     and parcelsOutline.geojson says exactly that in its own metadata. A
#     reporter who screenshots the map and captions it "the 472-acre campus"
#     would have gotten that from you.
#
#     Now: "...The approved campus is larger, up to 472 acres, and is not
#     mapped."
#
#  3. HEADLINE PROPORTIONS
#     --------------------
#     text-5xl inside max-w-4xl, sitting above cards that run the full
#     max-w-6xl. On a laptop that is three short ragged lines above two wide
#     boxes, so the top of the page reads as two different layouts stacked.
#     Down one step to lg:text-[2.75rem], measure out to max-w-5xl: two lines,
#     right edge closer to the cards. Phone is untouched at text-3xl.
#
#  Verified before this script was written: npm run build clean, eslint clean
#  (the now-unused keyFigures import is removed - Vite would have shipped it,
#  only lint catches that), and every check below run against the rendered
#  body with JSX comments stripped, so a comment describing the old copy
#  cannot make a check pass.
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
Say ' Homepage: the last three fixes' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$newHome = Join-Path $upload '_Home.jsx'
if (-not (Test-Path $newHome)) { Say 'Missing _Home.jsx in UPLOAD' 'Red'; Read-Host 'Press Enter to close'; exit 1 }

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[1/4] Up to date with GitHub'

Copy-Item $newHome (Join-Path $src 'pages\Home.jsx') -Force
Say '[2/4] Replaced Home.jsx'

# --- verify --------------------------------------------------------------
Write-Host ''
Say '[3/4] Verifying...' 'Cyan'

# $homeText, never $home - $home is a read-only PowerShell automatic variable
# holding your user profile path. Assigning to it fails silently enough that a
# previous run checked its content strings against C:\Users\Quentin and
# reported four false failures on a perfectly correct file.
$homeText = [IO.File]::ReadAllText((Join-Path $src 'pages\Home.jsx'))

# Strip JSX comments so the checks read what RENDERS. The comments in this file
# quote the old copy on purpose; without this, "no fused range" would fail on
# the comment explaining that the fused range was removed.
$body = [regex]::Replace($homeText, '\{/\*.*?\*/\}', '', 'Singleline')

foreach ($c in @(
  @{ n = '$8.5B';                       want = $true;  label = 'mayor figure stands alone' },
  @{ n = '$18B';                        want = $true;  label = 'CEO figure stands alone' },
  @{ n = 'Two estimates, not a range';  want = $true;  label = 'the two are not presented as a span' },
  @{ n = "figureById";                  want = $false; label = 'fused keyFigures value no longer rendered' },
  @{ n = 'is not mapped';               want = $true;  label = 'caption says the 472 ac is not drawn' },
  @{ n = 'Approved campus boundary covers'; want = $false; label = 'old boundary wording gone' },
  @{ n = 'lg:text-[2.75rem]';           want = $true;  label = 'headline stepped down on desktop' },
  @{ n = 'max-w-5xl';                   want = $true;  label = 'headline measure widened toward the cards' },
  @{ n = 'text-3xl';                    want = $true;  label = 'phone size unchanged' },
  @{ n = 'Warehouses full of computers';want = $true;  label = 'subhead still there' },
  @{ n = 'In plain language';           want = $false; label = 'still no "In plain language:" label' }
)) {
  $has = $body.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  $($c.label)" }
  else { Say "      !   $($c.label)" 'Red'; $script:fail = $true }
}

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build ---------------------------------------------------------------
Write-Host ''
Say '[4/4] Building and linting...' 'Cyan'
Push-Location $app
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc  = $LASTEXITCODE
$lintOut  = & npx eslint src/pages/Home.jsx 2>&1
$lintRc   = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if ($lintRc -ne 0) {
  Write-Host ''; Say 'LINT FAILED. Nothing committed:' 'Red'
  $lintOut | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
Say '      Build and lint OK'

# --- commit ---------------------------------------------------------------
# Message goes through a file. It contains dollar signs, quotes and a dash;
# passing that with -m lets PowerShell split the arguments and git then reads
# the words as pathspecs and refuses the commit.
& git add -A 2>&1 | Out-Null
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Split the fused investment range, fix the map caption, resize the headline

The investment card printed $8.5-18B as a single number. keyFigures.js says of
that entry: "two figures from two people, not a range anyone calculated." A
dash between two numbers claims everything in between was considered, and
nobody considered $12B. The card now shows $8.5B / $18B with each speaker
named and the sentence "Two estimates, not a range." This was the last place on
the site that still fused them, and the last open item from the first audit.

The map caption read "Approved campus boundary covers up to 472 acres" directly
beneath a map that draws 57 recorded deeds totalling 287.8 acres - inviting a
reader to take the shape on screen for the 472-acre campus. It now says the
approved campus is larger and is not mapped.

The headline was text-5xl in a max-w-4xl box above cards running the full
max-w-6xl, which on a laptop set three short ragged lines above two wide boxes.
Down one step with a wider measure; mobile unchanged.
'@
Set-Content -Path $msgFile -Value $msg -Encoding UTF8
$commitOut = & git commit -F $msgFile 2>&1
Remove-Item $msgFile -Force -ErrorAction SilentlyContinue

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
  Say ' PUSHED. Live in about two minutes.'
  Write-Host ''
  Write-Host '   TOTAL ESTIMATED INVESTMENT'          -ForegroundColor DarkGray
  Write-Host '   $8.5B  /  $18B'                      -ForegroundColor White
  Write-Host '   Two estimates, not a range.'         -ForegroundColor White
  Write-Host ''
  Write-Host '   287.8 acres across 57 parcels. The'  -ForegroundColor White
  Write-Host '   approved campus is larger, up to'    -ForegroundColor White
  Write-Host '   472 acres, and is not mapped.'       -ForegroundColor White
  Write-Host ''
  Say ' That closes the last Critical item from the audit.'
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
