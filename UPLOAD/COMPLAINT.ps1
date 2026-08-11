# =====================================================================
#  Publish the complaint, fix the map labels, tidy the Deal page.
#
#  Run with:
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Quentin\grayslake-data-center-tracker\UPLOAD\COMPLAINT.ps1"
#
#  Safe to re-run. Replaces whole files, verifies on disk, builds, and only
#  then commits.
#
#  YOU MAY NEED TO DO ONE THING FIRST
#  ----------------------------------
#  The PDF has to be on this computer. The script looks in Downloads, Desktop,
#  Documents and this repo folder for a file starting "T5_Grayslake_Complaint".
#  If it cannot find it, it will say so and stop - just save the PDF into your
#  Downloads folder and run this again.
#
#  WHAT THE MAP BUG WAS
#  --------------------
#  The acreage written on each of the four ownership groups was assigned by
#  nearest centroid, which is wrong for groups that are close together or oddly
#  shaped. The main block should read 135.1 ac / 50 parcels and was labelled
#  79.9 / 47; the east strip should read 18.8 / 2 and was labelled 74.0 / 5.
#  All four labels were wrong while still summing to 287.8, so nothing looked
#  broken. Now assigned by point-in-polygon against the ownership outline.
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
Say ' Publish the complaint + fix map labels' 'Cyan'
Say '=====================================================' 'Cyan'
Write-Host ''

Set-Location $repo

# --- locate the PDF ----------------------------------------------------
$targetName = 't5-grayslake-complaint-2026ch00000171.pdf'
$docsDir    = Join-Path $app 'public\docs'
$target     = Join-Path $docsDir $targetName

if (-not (Test-Path $target)) {
  $searchDirs = @(
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents",
    $repo, $upload
  ) | Where-Object { Test-Path $_ }

  $found = $null
  foreach ($d in $searchDirs) {
    $hit = Get-ChildItem -Path $d -Filter 'T5_Grayslake_Complaint*.pdf' -File -ErrorAction SilentlyContinue |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($hit) { $found = $hit.FullName; break }
  }

  if (-not $found) {
    Say 'Could not find the complaint PDF.' 'Red'
    Write-Host ''
    Say 'Save it into your Downloads folder, keeping a name that starts with' 'Red'
    Say '"T5_Grayslake_Complaint", then run this script again.' 'Red'
    Write-Host ''
    Say 'Looked in:' 'Yellow'
    $searchDirs | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    Read-Host 'Press Enter to close'; exit 1
  }

  New-Item -ItemType Directory -Force -Path $docsDir | Out-Null
  Copy-Item $found $target -Force
  Say "[1/6] Copied the complaint PDF from $found"
} else {
  Say '[1/6] Complaint PDF already in public\docs' 'Yellow'
}

# --- verify it is the right document -----------------------------------
$size = (Get-Item $target).Length
if ($size -lt 300000) {
  Say "      ! That PDF is only $size bytes. Expected around 551,000." 'Red'
  Say '      Check you saved the right file.' 'Red'
  $fail = $true
} else {
  Say "      ok  $([math]::Round($size/1KB)) KB"
}

# --- git ---------------------------------------------------------------
$lock = Join-Path $repo '.git\index.lock'
if (Test-Path $lock) { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
if ([string]::IsNullOrWhiteSpace((& git config user.name)))  { & git config user.name  'Quentin Conkle Jr' | Out-Null }
if ([string]::IsNullOrWhiteSpace((& git config user.email))) { & git config user.email 'qconkle2@illinois.edu' | Out-Null }
& git pull --rebase origin main 2>&1 | Out-Null
Say '[2/6] Up to date with GitHub'

# --- replace whole files -----------------------------------------------
foreach ($f in @('_SiteMap.jsx', '_Agreement.jsx')) {
  if (-not (Test-Path (Join-Path $upload $f))) { Say "Missing $f in UPLOAD" 'Red'; Read-Host 'Enter'; exit 1 }
}
Copy-Item (Join-Path $upload '_SiteMap.jsx')   (Join-Path $src 'components\map\SiteMap.jsx') -Force
Copy-Item (Join-Path $upload '_Agreement.jsx') (Join-Path $src 'pages\Agreement.jsx')        -Force
Say '[3/6] Replaced SiteMap.jsx and Agreement.jsx'

# --- sources.js: register the complaint --------------------------------
$sourcesFile = Join-Path $src 'data\sources.js'
$s = [IO.File]::ReadAllText($sourcesFile) -replace "`r`n", "`n"
if ($s.Contains('complaint2026:')) {
  Say '      - sources.js: complaint2026 (already present)' 'Yellow'
} else {
  $entry = @'
export const sources = {
  // The filed complaint itself, file-stamped by the Clerk and mirrored here so
  // the record does not depend on a shared Drive link staying alive. A copy was
  // circulating in community Facebook groups; this one was checked against the
  // stamp, the case number and the Clerk's name before being published.
  complaint2026: {
    title: "Preservation of Community Well-being Collective LLC et al. v. Village of Grayslake, T5 Data Centers LLC, and Alter Asset Management Company - Complaint for Declaratory and Injunctive Relief",
    publisher: "Circuit Court of the 19th Judicial Circuit, Lake County, Illinois, Chancery Division",
    date: "Filed July 31, 2026",
    caseNumber: "2026CH00000171",
    url: "/docs/t5-grayslake-complaint-2026ch00000171.pdf",
    localCopy: "/docs/t5-grayslake-complaint-2026ch00000171.pdf",
    localCopySha256: "db19911916483bc704d0ca85499bacea36e2f72ea8b91f2976ed9bccb55e1207",
    note: "37 pages, file-stamped 7/31/2026 6:29 PM by Clerk Erin Cartwright Weinstein. Four counts: ultra vires municipal action, substantive due process, procedural due process, and the Illinois Open Meetings Act. Allegations, not findings.",
    verified: "Aug 10, 2026",
    tier: "primary",
  },
'@
  $s = $s.Replace('export const sources = {', $entry)
  [IO.File]::WriteAllText($sourcesFile, $s)
  Say '      - sources.js: complaint2026 added, with case number and SHA-256'
}

# --- homepage: stop stacking two captions on the map -------------------
$homeFile = Join-Path $src 'pages\Home.jsx'
$h = [IO.File]::ReadAllText($homeFile) -replace "`r`n", "`n"
if ($h.Contains('<SiteMap />')) {
  [IO.File]::WriteAllText($homeFile, $h.Replace('<SiteMap />', '<SiteMap showCaption={false} />'))
  Say '      - Home.jsx: map caption suppressed (the page already has a heading)'
} else {
  Say '      - Home.jsx: caption already suppressed' 'Yellow'
}

# --- verify on disk ----------------------------------------------------
Write-Host ''
Say '[4/6] Verifying...' 'Cyan'
function Expect($path, $needle, $what) {
  $p = Join-Path $src $path
  if (([IO.File]::ReadAllText($p)).Contains($needle)) { Say "      ok  $what" }
  else { Say "      !   $what - NOT FOUND" 'Red'; $script:fail = $true }
}
Expect 'components\map\SiteMap.jsx' 'pointInRing'      'map: labels use point-in-polygon'
Expect 'components\map\SiteMap.jsx' 'showCaption'      'map: caption is optional'
Expect 'components\map\SiteMap.jsx' 'not drawn'        'map: 472-acre caveat intact'
Expect 'pages\Agreement.jsx'        '2026CH00000171'   'deal: case number present'
Expect 'pages\Agreement.jsx'        'Ultra vires'      'deal: four counts present'
Expect 'pages\Agreement.jsx'        'Read the complaint' 'deal: PDF link present'
Expect 'data\sources.js'            'complaint2026'    'sources: complaint registered'
if (-not (Test-Path $target)) { Say '      !   PDF missing from public\docs' 'Red'; $fail = $true }
else { Say '      ok  PDF in public\docs' }

if ($fail) {
  Write-Host ''; Say 'Verification failed. NOTHING committed.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}

# --- build -------------------------------------------------------------
Say '[5/6] Building...' 'Cyan'
Push-Location $app
if (Test-Path 'dist') { Remove-Item 'dist' -Recurse -Force -ErrorAction SilentlyContinue }
$buildOut = & npm run build 2>&1
$buildRc = $LASTEXITCODE
Pop-Location
if ($buildRc -ne 0) {
  Write-Host ''; Say 'BUILD FAILED. Nothing committed:' 'Red'
  $buildOut | Select-Object -Last 25 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
  Read-Host 'Press Enter to close'; exit 1
}
if (-not (Test-Path (Join-Path $app "dist\docs\$targetName"))) {
  Say 'BUILD OK but the PDF did not reach dist\docs. Stopping.' 'Red'
  Read-Host 'Press Enter to close'; exit 1
}
Say '[5/6] Build OK, PDF present in the build output'

# --- commit and push ---------------------------------------------------
& git add -A 2>&1 | Out-Null
$subject = 'Publish the filed complaint; fix wrong acreage labels on the map'
$body    = 'Adds the file-stamped complaint as a hosted primary document, case number 2026CH00000171, filed 31 July 2026 at 6:29 PM, 37 pages, with its SHA-256 recorded in sources.js. The Deal page now carries the case number, the parties, the four counts as they are actually headed in the filing (ultra vires, substantive due process, procedural due process, Open Meetings Act, which is not quite how the news coverage described them) and the relief sought, above a link to the full PDF, marked clearly as allegations rather than findings. Map: the acreage written on each ownership group was assigned by nearest centroid, which mislabelled every group while still summing to the correct total - the main block read 79.9 acres over 47 parcels when it is 135.1 over 50. Now assigned by point-in-polygon against the ownership outline, verified to reproduce 287.8 acres across 57 parcels. Homepage no longer stacks two captions above the map.'
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
  Say ' In about 2 minutes:'
  Write-Host '   /agreement  case number, four counts, PDF download' -ForegroundColor White
  Write-Host '   /map        labels read 135.1 / 69.9 / 64 / 18.8'   -ForegroundColor White
  Write-Host '   /           only one caption above the map'         -ForegroundColor White
  Say '====================================================='
} else {
  Say 'PUSH FAILED. Sign in to GitHub if prompted and re-run.' 'Red'
}
Write-Host ''
Read-Host 'Press Enter to close'
