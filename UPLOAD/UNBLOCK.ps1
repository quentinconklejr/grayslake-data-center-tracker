# =====================================================================
#  Unblock the deployment.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\UNBLOCK.ps1"
#
#  Safe to re-run.
#
#  WHAT ACTUALLY HAPPENED
#  ----------------------
#  Nothing was wrong with git, and nothing is wrong with the code. The commit
#  ae753b3 is on GitHub right now with all four fixes in it. I checked.
#
#  Vercel refused to build it. Its exact words:
#
#      Deployment Blocked
#      The deployment was blocked because the commit email
#      walterjr.quentin@gmail.com could not be matched to a GitHub account.
#      Ensure your git email matches your GitHub account.
#
#  Your GitHub account has exactly one verified email on it:
#  qconkle2@illinois.edu. The gmail address has never been on that account.
#  Every commit you have ever pushed to this repo was authored with the gmail,
#  which is why this is not something you broke today - Vercel simply started
#  enforcing the match, and the first commit to land after that was yours.
#
#  So: the push worked, the build never ran, and the site is still serving
#  yesterday's copy. That is the whole story.
#
#  THE FIX
#  -------
#  Set this repo's commit email to the address that IS on your GitHub account,
#  then push one commit so Vercel has something authored correctly to build.
#
#  This is set per-repository, so it cannot disturb anything else on your
#  machine, and it overrides whatever your global config says. Every future
#  commit from this folder will carry the right address, so this should be the
#  last time you see that error.
#
#  WHAT THIS SCRIPT DOES NOT DO
#  ----------------------------
#  It does not rewrite ae753b3 or force-push anything. Rewriting published
#  history to fix a build trigger is a large hammer for a small nail, and this
#  repo has already had one near-miss with 99 commits. The new commit sits on
#  top; ae753b3 and its changes stay exactly where they are.
#
#  IF YOU WOULD RATHER FIX IT THE OTHER WAY
#  ----------------------------------------
#  Add walterjr.quentin@gmail.com to your GitHub account at
#  https://github.com/settings/emails, verify it from your inbox, then hit
#  Redeploy on Vercel. Same result, no new commit, but you have to go find a
#  verification email. This script is the faster path.
#
#  Separately, and unrelated to this: Vercel is showing "The billing address on
#  your payment method is missing or incomplete." That is not what blocked the
#  build, and I have not touched it. Worth clearing when you have a minute so
#  it cannot become a problem later - that one is yours to do, not mine.
# =====================================================================

$ErrorActionPreference = 'Continue'
$repo = 'C:\Users\Quentin\grayslake-data-center-tracker'
$app  = Join-Path $repo 'grayslake-impact'

function Say($m, $c = 'Green') { Write-Host $m -ForegroundColor $c }

Write-Host ''
Say '=====================================================' 'Cyan'
Say ' Unblock the Vercel deployment' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }

# --- 1. the actual fix ----------------------------------------------------
# --local, not --global: scoped to this repo, overrides the global setting,
# cannot affect your other projects.
& git config --local user.name  'quentin conkle jr' | Out-Null
& git config --local user.email 'qconkle2@illinois.edu' | Out-Null

$who = & git config user.email
Say "[1/4] Commit email for this repo is now: $who"
if ($who -ne 'qconkle2@illinois.edu') {
  Say '      That is not what it should be. Stopping.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- 2. make sure the fixes are actually in the tree ----------------------
Write-Host ''
Say '[2/4] Confirming the four fixes are present...' 'Cyan'

$homeText = [IO.File]::ReadAllText((Join-Path $app 'src\pages\Home.jsx'))
$body = [regex]::Replace($homeText, '\{/\*.*?\*/\}', '', 'Singleline')
$fail = $false

foreach ($c in @(
  @{ n = '$8.5B';                        want = $true;  label = 'investment split into two figures' },
  @{ n = 'Two estimates, not a range';   want = $true;  label = 'and labelled as two estimates' },
  @{ n = 'is not mapped';                want = $true;  label = 'map caption corrected' },
  @{ n = 'lg:text-[2.75rem]';            want = $true;  label = 'headline resized' },
  @{ n = 'Farm fields at Peterson and Alleghany roads.'; want = $true; label = 'subhead cut to the location' },
  @{ n = 'Warehouses full of computers'; want = $false; label = 'editorial subhead gone' }
)) {
  $has = $body.Contains($c.n)
  if ($has -eq $c.want) { Say "      ok  $($c.label)" }
  else { Say "      !   $($c.label)" 'Red'; $script:fail = $true }
}

if ($fail) {
  Write-Host ''
  Say 'The fixes are not in your working tree. Run LASTTHREE.ps1 first.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- 3. sync, then push a correctly-authored commit -----------------------
Write-Host ''
Say '[3/4] Syncing and committing...' 'Cyan'
& git pull --rebase origin main 2>&1 | Out-Null

& git add -A 2>&1 | Out-Null

# WriteAllText with a no-BOM encoder, not Set-Content -Encoding UTF8.
# PowerShell 5.1 writes a byte-order mark, and git keeps it - which is why the
# last four commit titles on GitHub all start with an invisible character.
$msgFile = Join-Path $env:TEMP 'grayslake-commit-msg.txt'
$msg = @'
Rebuild: ae753b3 was authored with an email not on the GitHub account

Vercel blocked the previous deployment because the commit email
walterjr.quentin@gmail.com does not match any address on this GitHub account,
which has only qconkle2@illinois.edu verified. The code in ae753b3 was fine and
is unchanged; it simply never got built, so the site kept serving the older
copy.

This repo's commit email is now set locally to qconkle2@illinois.edu, and this
commit exists to give Vercel something correctly authored to build.
'@
[IO.File]::WriteAllText($msgFile, $msg, (New-Object Text.UTF8Encoding $false))

$commitOut = & git commit --allow-empty -F $msgFile 2>&1
Remove-Item $msgFile -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
  Write-Host ''; Say 'COMMIT FAILED:' 'Red'
  $commitOut | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}

$newAuthor = & git log -1 --pretty='%ae'
Say "      Committed, authored by $newAuthor"
if ($newAuthor -ne 'qconkle2@illinois.edu') {
  Say '      Wrong author on the new commit. Not pushing.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- 4. push --------------------------------------------------------------
Write-Host ''
Say '[4/4] Pushing...' 'Cyan'
& git push origin main
Write-Host ''

if ($LASTEXITCODE -eq 0) {
  Say '====================================================='
  Say ' PUSHED with the correct author.'
  Write-Host ''
  Write-Host '   Watch it build here:' -ForegroundColor White
  Write-Host '   https://vercel.com/quentin16/grayslake-data-center-tracker/deployments' -ForegroundColor Cyan
  Write-Host ''
  Write-Host '   The top row should go Building -> Ready in about'  -ForegroundColor White
  Write-Host '   a minute. If it says Blocked again, tell me and'   -ForegroundColor White
  Write-Host '   send the reason it gives.'                         -ForegroundColor White
  Write-Host ''
  Write-Host '   Then hard-refresh the site (Ctrl+Shift+R) and the' -ForegroundColor White
  Write-Host '   subhead should read:'                              -ForegroundColor White
  Write-Host ''
  Write-Host '     Farm fields at Peterson and Alleghany roads.'    -ForegroundColor Yellow
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
