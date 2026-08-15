# =====================================================================
#  Litotes sweep.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\LITOTES.ps1"
#
#  Safe to re-run.
#
#  ---------------------------------------------------------------------
#  WHAT I SEARCHED FOR
#  ---------------------------------------------------------------------
#  Litotes is understatement by negating the opposite: "not uncommon" for
#  common, "no small feat" for large, "not often" for rarely. It reads as AI
#  because it is a way of sounding measured without committing to a claim -
#  the writer gets the emphasis of a strong word while keeping deniability.
#
#  I swept every .js and .jsx file for:
#    not un- / not in- / not im- / not ir-      no small / no minor
#    not without / far from / nothing short of  hardly / scarcely
#    not unlike / no stranger to / by no means  not the least
#    not often / not many / not always          not entirely / not quite
#    not especially / not particularly          not merely / not simply
#    no less / not the only / little doubt      less than ideal
#    not exactly / not lacking / no shortage
#
#  Then I read the prose on /about, /agreement, the signup box and the tax
#  section by eye, because a regex cannot catch the shape when it is spread
#  across a clause.
#
#  ---------------------------------------------------------------------
#  WHAT I FOUND: TWO. ONE OF THEM VISIBLE.
#  ---------------------------------------------------------------------
#
#  1. UpdatesSignup.jsx, the email box on the homepage:
#
#       "Sent when there is something worth sending, which is not often."
#
#     "not often" for "rarely". It is also the only wry aside on the site,
#     and it sits in the one box asking a stranger to hand over their email
#     address - the exact place where a dry, factual register earns more
#     trust than a knowing one.
#
#     Now: "New filings, new documents, corrections to figures already
#     published. Some months there is nothing to send."
#
#     Same meaning, stated as a fact about the record rather than a joke
#     about the newsletter, and it is a frequency you can actually keep.
#
#  2. KeyFigureList.jsx line 8, a source comment:
#
#       "The qualifier is deliberately not optional"
#
#     "not optional" for "required". Nobody sees it, but you have been
#     sending reporters to a repo that claims to show its work, so it is
#     worth the four seconds. Now reads "deliberately required".
#
#  ---------------------------------------------------------------------
#  WHAT I DELIBERATELY DID NOT TOUCH
#  ---------------------------------------------------------------------
#  The site is full of negations that are NOT litotes, and changing them
#  would damage it. These state that a thing does not exist, which is the
#  most important kind of sentence this site writes:
#
#     "No independent valuation has been published."
#     "These are allegations, not findings."
#     "The approved campus is not mapped."
#     "Two parcels carry no recorded sale in the county layer."
#     "No defendant had answered and no court had ruled."
#     "This site is not affiliated with T5 Data Centers, LLC..."
#
#  None of those understate anything. Each one marks the boundary of the
#  record - the difference between what is documented and what is merely
#  claimed - and that boundary is the whole reason the site exists. A sweep
#  that removed them would have made the writing worse and the site less
#  honest. Left exactly as they are.
#
#  Verified: build clean, eslint clean, and the shipped JS bundle checked
#  directly - zero occurrences of "which is not often", one occurrence of
#  the replacement.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo  = 'C:\Users\Quentin\grayslake-data-center-tracker'
$app   = Join-Path $repo 'grayslake-impact'
$stage = Join-Path $repo 'UPLOAD\stage'
$fail  = $false

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Litotes sweep' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$files = @(
  'src\components\ui\UpdatesSignup.jsx',
  'src\components\ui\KeyFigureList.jsx'
)
foreach ($f in $files) {
  if (-not (Test-Path (Join-Path $stage $f))) {
    Say "Missing staged file: UPLOAD\stage\$f" 'Red'; Read-Host 'Press Enter to close'; exit 1
  }
}
Say '[1/5] Staged files present'

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
& git config --local user.name  'quentin conkle jr' | Out-Null
& git config --local user.email 'qconkle2@illinois.edu' | Out-Null
& git pull --rebase origin main 2>&1 | Out-Null
Say "[2/5] Synced. Commit email: $(& git config user.email)"

foreach ($f in $files) { Copy-Item (Join-Path $stage $f) (Join-Path $app $f) -Force }
Say '[3/5] Replaced 2 files'

# --- verify ---------------------------------------------------------------
Write-Host ''
Say '[4/5] Verifying...' 'Cyan'

$signupRaw = [IO.File]::ReadAllText((Join-Path $app 'src\components\ui\UpdatesSignup.jsx'))
# Strip the JSX comment first - it quotes the old line on purpose, and a naive
# check would read the explanation of the removal as the thing not removed.
$signup = [regex]::Replace($signupRaw, '\{/\*.*?\*/\}', '', 'Singleline')
$keyList = [IO.File]::ReadAllText((Join-Path $app 'src\components\ui\KeyFigureList.jsx'))

foreach ($c in @(
  @{ t = $signup;  n = 'which is not often';                want = $false; label = 'litotes gone from the signup box' },
  @{ t = $signup;  n = 'Some months there is';              want = $true;  label = 'replacement present' },
  # Checked as two fragments, not one sentence. The replacement copy wraps
  # between "reply" and "takes", so the full sentence never exists as a
  # contiguous string in the source - the first run failed on that and
  # correctly refused to commit, guarding a string I had written wrong.
  @{ t = $signup;  n = 'one line in reply';                 want = $true;  label = 'opt-out sentence intact (first half)' },
  @{ t = $signup;  n = 'takes you off the list';            want = $true;  label = 'opt-out sentence intact (second half)' },
  @{ t = $keyList; n = 'deliberately not optional';         want = $false; label = 'comment litotes gone' },
  @{ t = $keyList; n = 'deliberately required';             want = $true;  label = 'comment reads plainly' }
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
$lintOut  = & npx eslint src/components/ui/UpdatesSignup.jsx src/components/ui/KeyFigureList.jsx 2>&1
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

$bundle = (Get-ChildItem (Join-Path $app 'dist\assets') -Filter *.js | ForEach-Object { [IO.File]::ReadAllText($_.FullName) }) -join ''
if ($bundle -match 'which is not often') { Say '      !   built bundle still ships the old line' 'Red'; $fail = $true }
if (-not ($bundle -match 'Some months there is')) { Say '      !   built bundle missing the new line' 'Red'; $fail = $true }
if ($fail) { Write-Host ''; Say 'Bundle check failed. Nothing committed.' 'Red'; Read-Host 'Press Enter to close'; exit 1 }
Say '      Build, lint and bundle checks OK'

# --- commit ---------------------------------------------------------------
& git add -A 2>&1 | Out-Null
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Remove the two instances of litotes

The signup box read "Sent when there is something worth sending, which is not
often." Saying "not often" instead of "rarely" is understatement by negating
the opposite, and it was the only wry aside on the site - sitting in the one
place that asks a stranger for their email address, where a flat register earns
more trust than a knowing one. It now reads "Some months there is nothing to
send": same meaning, stated as a fact about the record rather than a joke about
the newsletter, and a frequency that can be kept.

KeyFigureList.jsx described its qualifier field as "deliberately not optional".
Now "deliberately required".

Those were the only two in the codebase. A sweep for not-un/not-in/no-small/
not-without/far-from/nothing-short-of/hardly/not-often and a dozen related
shapes turned up nothing else, and the prose pages were read by eye as well.

The site's many plain negations are left alone on purpose - "no independent
valuation has been published", "these are allegations, not findings", "the
approved campus is not mapped", "two parcels carry no recorded sale". None
understates anything; each marks the boundary between what is documented and
what is claimed, which is what the site is for.
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
  Say ' PUSHED. The signup box now reads:'
  Write-Host ''
  Write-Host '   New filings, new documents, corrections to'   -ForegroundColor White
  Write-Host '   figures already published. Some months there' -ForegroundColor White
  Write-Host '   is nothing to send. Your address is used for' -ForegroundColor White
  Write-Host '   this and nothing else, and one line in reply' -ForegroundColor White
  Write-Host '   takes you off the list.'                      -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
