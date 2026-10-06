# Automated research pipeline: plan

Status: planning draft, 2026-09-30. No pipeline code exists yet. Nothing in this
document changes site content.

Companion file: [`config/credibility-rubric.yaml`](../config/credibility-rubric.yaml)
(the rubric, as config).

**Goal.** Find new information about T5 @ Chicago IV quickly, score how credible
it is, and draft entries in the site's existing format as pull requests. The
owner approves by merging. A wrong or fabricated claim costs far more than a
slow one, so every stage is designed to fail closed. When something is in
doubt, the pipeline drops it or queues it. It never publishes.

---

## 1. How content is stored and rendered today

The site is a Vite + React 19 single-page app deployed on Vercel. It has no
CMS and no database. **All content is JavaScript modules under `src/data/`,
imported directly by pages.** A new entry is a code change to one of those
files, so a pull request is the natural approval unit.

### 1.1 Timeline: `src/data/timeline.js`

`export const timelineEvents = [ {...}, ... ]`. Rendered by
`src/pages/Timeline.jsx` through `src/components/ui/Timeline.jsx`.

| Field | Format | Notes |
|---|---|---|
| `date` | `"YYYY"`, `"YYYY-MM"`, `"YYYY-MM-DD"` or `"YYYY-Qn"` | Parsed by `dateToMs()`. Anything else (for example `"July 31, 2026"`) breaks sorting. See the comment at `timeline.js:129-134`. |
| `title` | Short sentence case. No trailing period. | Example: `"County Board adopts data center moratorium for unincorporated areas"` |
| `description` | One paragraph of plain text. | Citations are **not** written inline. They render as superscripts after the text. |
| `category` | One of `approval`, `opposition`, `development`, `construction`, `legal`, `policy` | Must match `LEGEND` in `Timeline.jsx`. Any other value renders grey and can't be filtered. |
| `sourceKey` or `sourceKeys` | A key, or an array of keys, into `sources` | Use one or the other. |

Rendering behaviour the pipeline has to respect:

- **Order in the file does not matter.** The component sorts by date
  (`Timeline.jsx:65`). The file is not in order today, so new entries can be
  appended at the end.
- **A future date renders as "Projected — has not happened"** automatically
  (`isProjected` against `Date.now()`). A projection must therefore never be
  given a past date, and a past event must never be given a future one.
- Text style: double-quoted strings, with curly quotes and dashes written as
  `“ ” ’ –`. Multi-line descriptions use
  `description:\n      "..."`.
- The CSV export (`Timeline.jsx:52`) reads `date`, `title`, `category`,
  `description`, `sourceKey`/`sourceKeys`.

Editorial conventions the existing entries follow. The draft generator must
reproduce these, and the reviewer should check for them:

- Allegations are labelled: *"These are allegations; no defendant had answered
  and no court had ruled."* and *"Allegations, not findings."*
- Projections are named: *"That figure is a Village projection, not an assessed
  valuation."*
- Scope is stated: *"covers unincorporated Lake County only and does not apply
  to the T5 site"*.
- Non-response is stated: *"The Village and T5 were not quoted in response."*
- Direct quotes are attributed to a named person with their title.
- Where sources disagree, both figures appear with attribution (472 vs 473.5
  acres). The site never picks one silently.

### 1.2 Sources: `src/data/sources.js`

`export const sources = { key: {...} }`, keyed by a camelCase id. Existing ids
pair publisher, topic and year (`scannerMoratorium2026`, `chronicleZba2026`,
`dailyherald_sep2026`), with some inconsistency (both `snake_case` and
`camelCase`). Rendered on `/documents` by `src/pages/Sources.jsx`, grouped by
`category`, and in citation popovers by `SourceCitation.jsx`, which numbers
footnotes per page.

| Field | Used for |
|---|---|
| `category` | `foia`, `court`, `news` or `government`. Sets the section on `/documents`. |
| `title`, `publisher`, `author`, `date` | Display. `date` is a display string whose format varies (`"Sept. 8, 2026"`, `"Aug 8, 2026"`, `"Retrieved Sep 27, 2026"`). |
| `url` | The primary link, or a site path for mirrored PDFs. |
| `archiveUrl` | Wayback copy, *"checked to contain the right document before it was added"* (`sources.js:8-11`). |
| `localCopy`, `localCopySha256` | Mirrored PDF under `public/docs/` plus its hash. `scripts/extract-doc-meta.js` generates `docMeta.js` (page count and size) at build time. |
| `originalUrl`, `deadCheckedAt`, `status` | For sources that are dead or unverified. `status: 'dead'` or `'unverified'` hides the link, and `check-links.js` skips `unverified`. |
| `caseNumber`, `note` | Free text. `note` is where caveats live. |
| `verified` | Display date of the owner's last check (`"Sep 11, 2026"`). |
| `tier` | `'primary'`, `'trade'` or `'aggregator'`, coloured by `Sources.jsx:12-14`. Some entries have none (`cub2026`). **Note:** this display tier labels Daily Herald, Tribune and Scanner articles as `primary`, which does not match the new rubric's tiers. See decision D4. |

`scripts/check-links.js` fetches every `url`, `archiveUrl` and `localCopy`.
It is the existing guard that source links resolve.

### 1.3 Parallel records that share sources

- **`src/data/actions.js`** (`/actions`) shows the same events organised by
  jurisdiction. Fields: `id`, `date` (ISO), `jurisdiction`, `actionType`,
  `description`, `outcome`, `sourceIds` (**not** `sourceKeys`), `status`
  (`complete`/`pending`) and `lastVerified`. Current jurisdiction values
  include `"Village of Grayslake"`, `"Lake County Board"`,
  `"19th Judicial Circuit Court"` and `"US Army Corps of Engineers"`.
- **`src/data/updates.js`** (`/updates`) is the site's changelog. Its header
  says: *"Anything that changes what the site asserts … gets a dated line
  here."* Fields: `date`, `kind` (`added`/`corrected`/`removed`), `title`,
  `description`, `link`, `linkLabel`. Newest first. Single quotes, no
  semicolons. **Every pipeline PR that adds an assertion should add an
  `updates.js` line.**
- **`src/data/questions.js`** and **`questionStatus.js`**: each open question
  has `stated` / `disputed` / `unknown` evidence items with `sourceKey(s)`.
  Answered status is an explicit editorial judgement. The pipeline can
  *flag* that a new item bears on a question. It never edits these files.
- **`src/data/keyFigures.js`** and **`projections.js`**: canonical figures,
  each defined once. The pipeline checks new claims against them and flags
  conflicts. It never edits them.
- **`src/data/siteConfig.js`**: `LAST_VERIFIED` is a display date shown on
  several pages (see decision D11).

### 1.4 Public records: `src/data/records.js` (off-limits to automation)

This file holds the FOIA packet layer for `/records` and `/records/t5`:
`recordsPackets`, `recordsFiles` (split PDFs with page ranges and SHA-256),
and `recordsDocuments` with `facts[]`. Each fact carries `packet_page`,
`file_page` and `verified: 'image'` when it was read from a rendered scan.
`scripts/audit-records.mjs` checks the page arithmetic, the hashes, and that
values appear on the cited page. Every fact was read off the page by a person.
**The pipeline never writes to `records.js`.** A newly posted ordinance or
packet produces a PR comment or lead, and the owner handles it.

### 1.5 Map data: `src/data/parcels.geojson` and `parcelsOutline.geojson`

Both files are generated by `scripts/fetch-parcels.js` from the Lake County GIS
parcel layer (`WABParcels/MapServer/12`, query
`taxpayer_name LIKE 'T5%' AND MUNI_NAME = 'GRAYSLAKE'`). The script refuses to
write if computed area deviates more than 0.5% from the county's `CALCACRE`.
The data is committed rather than fetched live, deliberately. `metadata.retrieved`
records the pull date. `src/data/parcels.js` maps the parcels for
`ParcelTable`. `SiteMap.jsx` uses the outline only for grouping. Its comments
record that the outline is **ownership (287.8 acres), not the approved
boundary**, and that the pipeline must never describe it as the approved
boundary.

**For the pipeline:** run the existing script in CI and diff the output. A
parcel added or removed, an owner change or a new `sale_date1` becomes a PR
containing the regenerated GeoJSON and a human-readable diff. The figures in
`keyFigures.js` (`287.8 acres`, `57 parcels`, `$62,968,250`) and the text in
`timeline.js:19` would then be stale. The PR lists them for the owner to
update. It does not rewrite them.

### 1.6 What a complete draft PR contains

For one new event:

1. One object appended to `timelineEvents`.
2. One new key per new source in `sources`, with `archiveUrl` if the Wayback
   capture succeeded and `verified` set to the pipeline's retrieval date. The PR
   says so explicitly. The owner re-checks before merging.
3. One `updates.js` line (`kind: 'added'`).
4. Optionally, one `actions.js` entry when the event is an action by a body.
5. Nothing else in `src/`. Checks: `node --check`, import-and-validate against a
   schema, `npm run lint`, `npm run build`, and `node scripts/check-links.js`.

---

## 2. Source map

Checked 2026-09-30 by fetching each URL from this machine. **Verified** means
the URL returned HTTP 200 with the expected content. **Unverified** means it
could not be confirmed and must not be wired in until someone confirms it by
hand. Tiers refer to `config/credibility-rubric.yaml`.

Cadences are targets. GitHub cron can run late under load (see risks).

### 2.1 Village of Grayslake (Tier 1)

| Source | URL | Status | Monitor by | Cadence |
|---|---|---|---|---|
| Agendas & Minutes page (Village Board "Agenda Brief", PC/ZBA agendas, minutes, other bodies) | https://www.villageofgrayslake.com/6/Agendas-Minutes | **Verified.** Newest link seen: `DocumentCenter/View/16196/2026-10-01--Police-Commission-Agenda`. | Scrape the page and diff the set of `DocumentCenter/View/{id}/{slug}` links. IDs increase, so a new ID means a new document. Filter slugs for `VB`, `PCZBA`, `Minutes`, `Agenda`. Fetch new PDFs and extract text. | Every 2 h. Every 30 min on the Thursday–Tuesday before a Board meeting. |
| DocumentCenter PDFs (packets, FAQ, press releases) | `https://www.villageofgrayslake.com/DocumentCenter/View/{id}` | Verified pattern (existing sources use it) | Fetched when linked from the page above or from News Flash. **Optional:** probe the next few IDs past the highest seen, which catches documents uploaded before they are linked. Politeness and terms risk: see D8. | With the above |
| News Flash RSS | https://www.villageofgrayslake.com/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml | **Verified.** Includes "Village of Grayslake Press Release 9/1". | RSS | Every 30 min |
| Agenda Center RSS | https://www.villageofgrayslake.com/RSSFeed.aspx?ModID=65&CID=All-0 | **Verified, but empty.** The Village does not use Agenda Center, so don't rely on it. | RSS (cheap, keep as a canary) | Daily |
| "Notify Me" email (Village Board minutes list and others) | http://www.villageofgrayslake.com/List.aspx?MID=1151 | Verified (HTTP 200) | Email subscription to a dedicated inbox, parsed by the pipeline or forwarded to it. See D2. | Push |
| Village YouTube (meeting livestreams and recordings) | Channel `UCPnLOnmTu9VhW0paDWubHhw` (`@villageofgrayslake9968`); RSS: https://www.youtube.com/feeds/videos.xml?channel_id=UCPnLOnmTu9VhW0paDWubHhw | **Verified.** Feed lists "Village Board Meeting" videos and a "Cornerstone Property Development Presentation". | RSS for new videos. Use the captions track if one is published. Auto-captions are **not** a verbatim source (see §5.6). | Every 2 h, and the night of every meeting |
| Village website video page | Unverified. Search results mention a "Village Board videos" section, but its URL was not confirmed. | **Unverified** | n/a until confirmed | — |

### 2.2 Lake County (Tier 1)

| Source | URL | Status | Monitor by | Cadence |
|---|---|---|---|---|
| Lake County Board, ZBA, Planning/Building/Zoning committees, Stormwater Management Commission (Legistar) | https://lakecounty.legistar.com/Calendar.aspx | **Verified** | Legistar web API (below), falling back to scraping the calendar | Every 2 h on weekdays |
| Legistar Web API | `https://webapi.legistar.com/v1/lakecounty/...` | **Partly verified.** `/bodies` and `/matters?$top=1` return JSON. The body list includes "Lake County Board", "Zoning Board of Appeals", "Lake County Stormwater Management Commission" and "Central Lake County Joint Action Water Agency". `/events` returned HTTP 500 for every query form tried (`$top`, `$filter` on `EventDate`, `$orderby`). | `matters` filtered by `MatterLastModifiedUtc`, then keyword-matched (`data center`, `T5`, `Grayslake`, `Chapter 151`, `moratorium`). Events: retry, and fall back to scraping the calendar. | Every 2 h |
| County News Flash RSS | https://www.lakecountyil.gov/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml | **Verified** | RSS | Every 30 min |
| County calendar RSS | https://www.lakecountyil.gov/RSSFeed.aspx?ModID=58&CID=All-calendar.xml | **Verified** | RSS | Daily |
| Recorder of Deeds: online property records search | https://lake.il.publicsearch.us/ (linked as "Search Property Records" from https://www.lakecountyil.gov/4924/Recording-Division) | **Verified reachable.** Search behaviour, API and terms of use **unverified**. | Owner-run search, or a scripted search **only if the terms of use allow it** (D8). Query by grantor/grantee `T5` and by the 57 PINs in `parcels.geojson`. | Weekly |
| GIS parcel layer | https://maps.lakecountyil.gov/arcgis/rest/services/GISMapping/WABParcels/MapServer/12 | **Verified** (layer JSON returned; the repo already uses it) | ArcGIS REST query via the existing `scripts/fetch-parcels.js`; diff the output. Also query by PIN list to catch parcels transferred *out* of T5. | Daily. The county layer updates slower than the Recorder. |
| Stormwater Management Commission page | Guessed URLs `/2395/…` and `/2365/…` returned 404 | **Unverified** | Covered by Legistar's SMC body until the page is found | — |

### 2.3 Courts (Tier 1: the filing is a fact; its contents are allegations)

| Source | URL | Status | Monitor by | Cadence |
|---|---|---|---|---|
| Lake County Circuit Clerk | https://www.lakecountycircuitclerk.org/ | **Verified reachable.** Homepage notices "Lake County Circuit Clerk Launches DocAccess" and "Clerk E-Certify Update: Verified Attorney Access Launching October 1st". Public docket search URL **unverified**. | Docket for **2026CH00000171**. Manual check, or email alerts if the clerk offers them (unverified). | Daily, plus **Oct 30, 2026** (initial status hearing, 9:00 a.m., Courtroom 301, per `timeline.js`) and the day after |
| re:SearchIL (statewide court records portal, Tyler Technologies) | https://researchil.tylerhost.net/CourtRecordsSearch/Home | **Verified reachable.** Whether it covers Lake County chancery cases and what its terms allow are **unverified**. | Needs an account. Saved-search notifications if offered (unverified). Automated scraping only if the terms permit it (D7). | Daily |
| 19th Judicial Circuit | https://www.19thcircuitcourt.state.il.us/ | Verified reachable | Court calendars and orders if published (unverified) | Weekly |

### 2.4 State of Illinois

| Source | URL | Status | Monitor by | Cadence | Tier |
|---|---|---|---|---|---|
| ilga.gov: **HB5513** (POWER Act, House) | https://www.ilga.gov/Legislation/BillStatus?DocTypeID=HB&DocNum=5513&GAID=18&SessionID=114 | **Verified.** Synopsis: *"Amends the Environmental Protection Act, Energy Efficient Building Act, Illinois Power Agency Act, Public Utilities Act…"*. Last action 3/27/2026: *"Rule 19(a) / Re-referred to Rules Committee"*. | Scrape the Bill Status page and diff the actions table | Daily. Every 2 h during the fall veto session. | 1 |
| ilga.gov: **SB4016** (POWER Act, Senate) | https://www.ilga.gov/Legislation/BillStatus?DocTypeID=SB&DocNum=4016&GAID=18&SessionID=114 | **Verified.** Same synopsis. Last action 5/22/2026: *"Rule 3-9(a) / Re-referred to Assignments"*. | Same | Same | 1 |
| Note on the "POWER Act" name | — | The name ↔ HB5513/SB4016 pairing comes from search results citing the Illinois Environmental Council and the Alliance for the Great Lakes. **The ilga.gov pages fetched did not show the name "POWER Act".** Confirm by hand before the site states it. A veto-session amendment could also carry the text under a different bill number, so also run keyword search. | — | — | — |
| ilga.gov: SB2181 (Data Center Energy and Water Reporting Act) | https://www.ilga.gov/Legislation/BillStatus?DocTypeID=SB&DocNum=2181&GAID=18&SessionID=114 | **Verified** | Same | Daily | 1 |
| ilga.gov: other new data-center bills | https://ftp.ilga.gov/ (verified HTTP 200). Legislative search at https://www.ilga.gov/Search?base=Legis | FTP structure **unverified**. ilga.gov has no RSS (`/rss` returned 404). | Keyword search daily, or FTP bill-status files if the structure checks out | Daily | 1 |
| ICC e-Docket | https://www.icc.illinois.gov/docket/search | **Verified reachable.** No T5- or Grayslake-specific docket identified. | Search `T5`, `Grayslake`, `data center`, ComEd large-load and tariff dockets. Watch the service list and filings on specific dockets once identified. | Daily | 1 |
| IEPA public notices | https://epa.illinois.gov/public-notices.html | **Verified** | Scrape and keyword-filter (`Grayslake`, `T5`, `Peterson`, `Cornerstone`, generator/air permits) | Daily | 1 |
| IEPA permit databases (air: backup generators; water/NPDES) | Guessed `/topics/water-quality/permits.html` returned 404 | **Unverified** | Find by hand | — | 1 |
| DCEO data center incentive page | https://dceo.illinois.gov/expandrelocate/incentives/datacenters.html (already cited as `dceo2026`) | Verified in repo | Page hash diff | Weekly | 1 |

### 2.5 Utilities and grid (Tier 1 as filings; statements about themselves are attributed)

| Source | URL | Status | Monitor by | Cadence |
|---|---|---|---|---|
| ComEd regulatory filings page | https://www.comed.com/about-us/regulatory-filings | **Verified (HTTP 200).** Contents not inspected. | Page diff. Substantive ComEd filings are on the ICC e-Docket and FERC eLibrary. | Weekly |
| PJM interconnection / service request status | https://www.pjm.com/planning/service-requests/services-request-status | **Verified** | Queue export. Filter the ComEd zone by county and project name. **Large loads are not generator queue entries**, so this may never show T5 (see risks). | Weekly |
| PJM Data Miner 2 | https://dataminer2.pjm.com/ | **Verified.** API needs a free subscription key. | API (load forecasts for the ComEd zone as context only) | Monthly |
| FERC eLibrary (PJM and ComEd filings) | https://elibrary.ferc.gov/eLibrary/search | **Verified reachable.** Search API **unverified**. | Saved search. FERC offers eSubscription email for specific dockets (behaviour unverified); route to the pipeline inbox. | Weekly |
| CLCJAWA (regional water agency) | https://www.clcjawa.com/ (already cited) | Verified | Homepage hash diff, plus its Legistar body | Weekly |

### 2.6 Federal

| Source | URL | Status | Monitor by | Cadence | Tier |
|---|---|---|---|---|---|
| USACE Chicago District regulatory public notices (Section 404; the wetland permit was withdrawn July 31) | https://www.lrc.usace.army.mil/Missions/Regulatory/Public-Notices/ | **Unverified.** Requests from this machine timed out. | Find by hand. Possibly blocks non-browser clients. | Weekly | 1 |

### 2.7 News

Tier 2 membership is a proposal. The owner confirms each outlet (D5), including
that it publishes a corrections policy, before it goes into the registry. The
proposed tiers below are not what `sources.js` currently displays.

| Outlet | Feed | Status | Cadence | Proposed tier |
|---|---|---|---|---|
| Lake & McHenry County Scanner | https://www.lakemchenryscanner.com/feed/ | **Verified RSS** | 30 min | 2 if corrections policy confirmed (named reporter, e.g. Sam Borcia) |
| Chronicle Media | https://chronicleillinois.com/feed/ | **Verified RSS** | 30 min | 2 if corrections policy confirmed |
| Capitol News Illinois | https://capitolnewsillinois.com/feed/ | **Verified RSS** | 1 h | 2 |
| Daily Herald | https://www.dailyherald.com/rss is an HTML index page, and the feed URLs could not be extracted from it | **Unverified feed URL** | 30 min via Google News until found | 2 |
| Chicago Tribune | https://www.chicagotribune.com/feed/ returned **403** | **Unverified / blocked** | Google News query | 2 |
| Patch (Grayslake) | https://patch.com/feeds/illinois/grayslake | **Verified RSS** | 1 h | 3 by default (the site labels Patch `aggregator`). Tier 2 per article only with a named local reporter. |
| Data Center Dynamics | https://www.datacenterdynamics.com/en/rss/ | **Verified RSS** | 2 h | 3 (trade) |
| Google News query | `https://news.google.com/rss/search?q=%22Grayslake%22+%22data+center%22&hl=en-US&gl=US&ceid=US:en` | **Verified RSS.** Add more queries: `"T5 Data Centers"`, `"Cornerstone" Grayslake`, `2026CH00000171`, `"POWER Act" Illinois data center`. | 30 min | **Discovery only.** Each hit is re-tiered by the domain it points to. Google News links are redirects, so resolve them first. |
| Google Alerts (RSS delivery) | Created per account. No fixed URL. | Needs setup by the owner | 30 min | Discovery only, as above |
| WBEZ / Sun-Times, Lake County News-Sun, WGN, NBC 5, ABC 7 | Not checked | **Unverified** | via Google News | 2 once confirmed |

### 2.8 Tier 4 (leads only, never published)

Community Facebook groups, Nextdoor, X/Bluesky, Reddit and comment sections.
These are not monitored automatically: platform terms prohibit it, and it would
invite rumor. The owner can forward a post to the pipeline inbox as a lead. The
pipeline stores it privately and tries to find a Tier 1 or 2 source for it.

---

## 3. Credibility rubric

The rubric is in [`config/credibility-rubric.yaml`](../config/credibility-rubric.yaml).
The key design choices:

- **The model extracts signals. Code decides.** Tier comes from the source
  registry keyed by domain, never from the model. Unknown domains default to
  Tier 4.
- **A Tier 1 document makes it a fact that the document says X, not that X is
  true.** A complaint's allegations stay allegations. A developer's projection
  stays attributed. This matches what the site already does.
- **Claim type overrides tier.** Opinions, quotes, allegations, projections and
  claims resting on unnamed sources never become facts in the site's voice.
- **Modifiers can only lower an outcome, never raise it.**
- **Corroboration counts only independent sources.** Syndicated or duplicated
  text, or text that traces to the same press release, counts once.
- **Tier 3 is never cited alone.** When a Tier 1 or 2 source confirms a Tier 3
  claim, the entry is redrafted from and cited to that source.
- The rubric is grounded in SIFT (Caulfield), lateral reading (Wineburg &
  McGrew / Stanford History Education Group), the SPJ Code of Ethics, Trust
  Project indicators, the IFCN principles and AP's standards. Citations and URLs
  are in the file header.

---

## 4. Pipeline design

### 4.1 Shape

```
GitHub Actions (cron, 3 cadences)
  └─ fetch ── normalize ── relevance prefilter ── dedupe ── snapshot (Wayback)
        └─ extract (Claude API, structured output) ── VERBATIM GUARD ── score (rubric, code)
              ├─ drop_and_log ──────────────► logs/dropped-claims.jsonl
              ├─ private_lead / queue_only ─► private lead store (+ digest)
              └─ draft ── validate/build ── PR ── notify phone ──► owner merges (or closes)
```

Language: **Node (ESM JavaScript)**, in this repo, under a new top-level
`pipeline/` directory. That matches `scripts/`, reuses `@turf/turf` and the
existing scripts, and lets the pipeline import `src/data/*.js` directly for
dedupe and conflict checks. It uses `@anthropic-ai/sdk` as a dev dependency.
The alternative is a separate repo (D1).

### 4.2 Scheduling (`.github/workflows/research-*.yml`)

| Workflow | Cron (UTC) | Sources |
|---|---|---|
| `research-hot` | `*/30 * * * *` | News RSS, Google News queries, Village and County News Flash |
| `research-warm` | `15 */2 * * *` | Village Agendas & Minutes page, Legistar, YouTube RSS, bill status during session |
| `research-daily` | `40 11 * * *` (about 6:40 a.m. Central) | GIS parcel diff, ICC, IEPA, ilga keyword search, court docket, FERC |
| `research-weekly` | `0 12 * * 1` | Recorder search, PJM, ComEd, CLCJAWA, DCEO, USACE |
| `known-dates` | Generated from `pipeline/calendar.yaml` | Extra runs around meetings and hearings (Oct 30 status hearing, Board meeting nights) |

Every workflow sets `concurrency: research-<tier>` with
`cancel-in-progress: false` so runs never overlap, and a `timeout-minutes`
limit. Each also accepts `workflow_dispatch`, so the owner can trigger a run
from the GitHub phone app ("check now").

Permissions are least privilege: `contents: write` (to push `pipeline/*`
branches), `pull-requests: write` and `issues: write`. **Branch protection on
`main`** requires a PR and blocks the bot from merging. The bot never gets
admin rights.

PRs opened with the default `GITHUB_TOKEN` don't trigger other workflows, so a
lint/build CI check would not run on bot PRs. Opening PRs from a **GitHub App
token** fixes this (D13).

### 4.3 State

The pipeline needs memory between runs: seen URLs and content hashes, ETags,
the highest DocumentCenter ID, leads, the dropped-claim log, and the retrieved
source text that the verbatim guard checked. **If this repo is public, none of
that full text can go in it.** Much of it is copyrighted news text, and Tier 4
leads must stay private. Recommended: a small **private companion repo**
(`grayslake-tracker-state`) the workflow clones with a fine-grained token (D1).
The public repo only ever receives the draft entry, short quotes in the PR
body, and links.

### 4.4 Fetch

- Identify the bot honestly:
  `User-Agent: GrayslakeTrackerBot/1.0 (+https://grayslakedatacentertracker.org/about; contact email)`.
  The existing `check-links.js` uses a browser user agent, which is fine for
  checking a link once but not for monitoring.
- Respect `robots.txt`, use conditional GET (`ETag` / `If-Modified-Since`), a
  per-host rate limit of at least 1 request every 5 s, timeouts, and retries
  with backoff.
- Never bypass paywalls, logins, CAPTCHAs or bot walls. When a source blocks
  the bot, fall back to discovery through Google News and have a person read
  the article. The owner then pastes the text into the pipeline inbox, where it
  is treated as retrieved text marked `source: owner-supplied` and shown as
  such in the PR.
- Store the raw bytes, `sha256`, the final URL after redirects, and the fetch
  time for every document that reaches extraction.

### 4.5 Normalize

- HTML: extract the article body (Mozilla Readability via `jsdom`), plus the
  byline, publish date, canonical URL and outbound links, used for the
  "links its own source" modifier.
- PDF: extract the text layer per page (`pdfjs-dist`), keeping page numbers so
  quotes can cite `#page=N` the way `records.js` does. **Pages with no usable
  text layer (scans) are not OCR'd into evidence.** They are flagged
  `needs_human_read`. The site already handles scanned signature and vote
  pages this way (`verified: 'image'`).
- The normalized text is frozen and hashed. **That exact string is what the
  verbatim guard checks against, and what is archived in the state repo.**

### 4.6 Relevance prefilter (no API cost)

Keyword and entity match before any model call: `T5`, `Grayslake`,
`Cornerstone`, `Peterson Road`, `Route 83`, `Alleghany`, `Alter`,
`2026CH00000171`, `data center`, `HB5513`, `SB4016`, the 57 PINs from
`parcels.geojson`, and the names of officials already in the data files. A
long PDF (agenda packets can run to hundreds of pages) is cut to the matching
pages plus or minus one page before extraction. The cut is recorded, so the PR
shows which pages were read.

### 4.7 Dedupe

1. **URL:** canonicalize by lowercasing the host, stripping `utm_*`, `fbclid`,
   AMP paths and fragments, and resolving Google News redirects. Check against
   the state DB **and against every `url`, `archiveUrl` and `originalUrl` in
   `sources.js`**.
2. **Content:** sha256 of the normalized text catches the same document at a
   new URL.
3. **Near-duplicate:** MinHash or SimHash over 5-word shingles catches
   syndicated or republished copies (the Tribune → Illinois Environmental
   Council republication, Hoodline and GovTech rewrites). Near-duplicates are
   linked to the original and never counted as corroboration.
4. **Same event:** a new item matching an existing timeline entry (date within
   ±3 days, overlapping entities, similar title) is treated as a **possible
   update or corroboration** of that entry. It is not a new entry. It produces
   a separate PR type ("add source to existing entry" or "possible correction").

### 4.8 Wayback snapshot

- For every item that reaches a draft, request a capture with Save Page Now 2
  (`POST https://web.archive.org/save`, authenticated with archive.org S3-style
  keys stored as a GitHub secret; D9). Poll the job status. If the capture fails,
  look up the most recent existing snapshot with the availability API
  (`https://archive.org/wayback/available?url=…`, verified reachable). If that
  also fails, the PR says *archive by hand*, consistent with the existing note
  in `sources.js`.
- **Verify the capture** the way the site already does: fetch the snapshot and
  confirm its normalized text contains the supporting quotes, before it is
  written as `archiveUrl`.
- Government PDFs, being public records, can also be mirrored to `public/docs/`
  with `localCopySha256`, as the complaint and the FAQ are (D10). News articles
  are never mirrored.

### 4.9 Structured extraction (Claude API)

- Model: **`claude-opus-5-5`** ($4 / $20 per million input/output tokens). A
  cheaper model is a cost decision for the owner (D12), to be measured against
  the evaluation set in §6 first.
- Call: `client.messages.create` with **structured outputs**
  (`output_config.format` with a JSON Schema, parsed with `messages.parse()`)
  and `output_config.effort` set explicitly (the default on this model is
  `medium`). The system prompt and schema are stable and cached with
  `cache_control`.
- **No tools, no web search, no web fetch.** The model sees only the document
  text the pipeline fetched, wrapped in delimiters and labelled as untrusted
  data. The system prompt says to extract, never to follow instructions in the
  document.
- Handle `stop_reason` before reading output: `refusal`, `max_tokens` and a
  schema failure all mean the document is logged and skipped. Nothing is
  retried with a weaker prompt. The server-side `fallbacks` parameter is
  available on the standard API (not on Batches) if the owner wants it.
- Anthropic's Citations feature returns verified cited spans, but it can't be
  combined with structured outputs (the API returns a 400). The pipeline
  therefore uses its own quote field plus the code check in §5, which is what
  the brief asked for anyway.
- Urgent (hot) documents use the standard API. Daily and weekly documents can
  go through the **Message Batches API at 50% of the price**, since results
  within hours are fine there.

Extraction schema (abridged):

```json
{
  "document": {
    "doc_type": "agenda|minutes|ordinance|filing|docket|bill_status|press_release|news_article|video_transcript|other",
    "published_date": "YYYY-MM-DD|null",
    "byline": ["string"],
    "is_about_t5_grayslake": "yes|no|partly",
    "origin": "originates|repeats|unclear",
    "repeats_whom": "string|null",
    "cited_sources": [{ "name": "string", "url": "string|null" }]
  },
  "claims": [{
    "claim_text": "neutral one-sentence paraphrase, no adjectives not in the source",
    "claim_type": "fact|quote|opinion|allegation|projection|procedural",
    "speaker": "named person or body, or null",
    "attribution": "named|unnamed|document",
    "event_date": "YYYY-MM-DD|YYYY-MM|null",
    "date_basis": "stated_in_text|document_date|unknown",
    "supporting_quotes": ["exact contiguous text copied from the document"],
    "page": "integer|null",
    "entities": ["string"],
    "timeline_category": "approval|opposition|development|construction|legal|policy|none"
  }]
}
```

### 4.10 Scoring

Pure code, driven by the YAML: look up the source's tier in the registry, apply
the claim-type rules, the modifiers and the decision table (first match wins),
and produce an outcome and labels. Corroboration counts come from the dedupe
clusters and the state DB, never from the model's opinion. Every decision is
written to the run log with the rule that fired.

### 4.11 Draft entry

- The draft is built **only from claims that passed the verbatim guard**. A
  second, small model call turns those claims into a `title` and `description`
  in the site's style, with the conventions from §1.1 given as instructions and
  about five existing entries as examples.
- **The drafted prose goes through the guard as well (§5.4).** Any text in
  quotation marks must be an exact substring of a verified quote. Every number,
  money amount and date must appear in a verified quote. Every named person
  must be the speaker or appear in a quote. Anything else fails, and the claim
  goes to the PR as a bare claim list with no prose.
- The pipeline builds the JS objects itself (not the model) and inserts them
  as text before the closing `];` / `};` of each file, matching the
  surrounding indentation and escaping. It then runs `node --check`, imports
  the modules and validates them against a schema (valid `category`,
  `sourceKey` exists, date format), then `npm run lint`, `npm run build` and
  `node scripts/check-links.js`. Any failure means no PR, and the run is logged.
- Source keys follow `<publisher><Topic><Year>`, for example
  `scannerHearing2026`. Collisions get a suffix.

### 4.12 Pull request

One PR per event cluster, on branch `pipeline/<yyyy-mm-dd>-<slug>`. The PR is
the review surface, so it carries everything needed to decide:

- **Header:** outcome (`draft_as_fact`, `draft_as_reported`, …), tier, the
  rule that fired, corroboration count and the list of sources counted.
- **Claim table:** claim, type, speaker, **the verbatim quote**, the link to
  the live URL with page or timestamp, the archive link, and the guard result
  (`exact` or `exact-after-canonicalization`, with the character offset).
- **"What this source does not say":** caveats and scope, such as
  "unincorporated only" or "agenda item, not an outcome".
- **Conflicts:** any overlap with existing `timeline.js`, `keyFigures.js` or
  `records.js` content, shown side by side.
- **Checks:** build, lint, link check, and a Vercel preview URL (Vercel builds
  previews for PR branches).
- Labels: `pipeline`, `tier-1` / `tier-2` / `corroborated`, `needs-decision`,
  `conflict`, `unnamed-sources`.
- The owner merges, edits and then merges, or closes. **Closing is a signal
  too:** the pipeline records it, so it doesn't re-propose the same claim.

`queue_only` items become a daily digest (an issue in the private state repo,
or email) listing leads that need corroboration. They are never a PR in the
public repo.

### 4.13 Phone notification

- **GitHub Mobile** push notifications on PRs cost nothing and work already.
  This is the baseline.
- For "be first" alerts, add **ntfy** (free, open source, iOS/Android) or
  **Pushover** (one-time purchase), sent only for Tier 1 `draft_as_fact` PRs
  and for known-date events. The message contains the PR link and a short
  title, never claim text. Public ntfy topics are readable by anyone who
  guesses the name, so use an access token or a long random topic (D2).
- Quiet hours are configurable. A daily digest covers everything else.

---

## 5. Verbatim guard

This is the core safeguard. Its job is to make a fabricated quote or
fabricated claim fail mechanically, without depending on the model's
honesty. Parameters are in `verbatim_guard` in the rubric YAML.

### 5.1 What counts as source text

Only the normalized text the **pipeline's own fetcher** retrieved (§4.5),
frozen and hashed before extraction. Text from the model, from web search
results, or from anything the model says the page contains is never source
text (`hard_rules.model_text_is_not_evidence`).

### 5.2 The check

```
canon(s) = NFC(s) → map ‘ ’ “ ” – — NBSP to ' ' " " - - space → drop soft hyphens
           → collapse whitespace runs to one space → trim
```

`canon()` is applied identically to the source text and to each quote. It
never removes, reorders or changes a word: no case folding, no punctuation
stripping, no stemming. A quote passes if and only if
`canon(source).includes(canon(quote))`. The guard records whether the raw quote
matched **exactly** (byte-identical) or only after canonicalization, plus the
character offset, and both appear in the PR.

The whitespace and typographic mapping exists because PDF text layers and HTML
entities render the same words with different bytes. Nothing looser is
permitted. A PDF line break that splits a word with a hyphen (`dis-\ntrict`)
fails the check. That failure is intended: the claim goes to a person rather
than the guard guessing.

### 5.3 Quote-quality rules (reject before matching)

- At least 40 characters and 6 words, so a trivial span like `"T5"` or
  `"the Village"` cannot "support" a claim. At most 600 characters.
- No elisions or insertions: quotes containing `...`, `…`, `[` or `]` are
  rejected. The model must give contiguous spans, and several spans if needed.
- A span that occurs more than once is allowed. The first offset is recorded
  and the PR shows the surrounding context.

### 5.4 Claim–quote consistency (deterministic)

A real quote can still be paired with a claim it doesn't support. These checks
cover the common failures:

- **Numbers:** every number, percentage and money amount in `claim_text`
  (normalized, so `$1.4 billion` equals `1.4 billion`) must appear in one of
  that claim's quotes.
- **Dates:** every date in the claim appears in a quote, or equals the
  document's own date and is marked `date_basis: document_date`.
- **Speaker:** for `quote` and `opinion` claims, the speaker's surname appears
  within 300 characters of the quote in the source text.
- **Direct quotation in drafts:** any text inside quotation marks in the
  drafted `description` must be an exact substring of a verified quote.
- **Allegation wording:** if the source `doc_type` is `filing` or the claim
  type is `allegation`, the draft must contain an attribution such as
  "alleges", "the complaint", "Allegations, not findings". It must not state
  the allegation in the site's voice.

Optionally, a separate model call asks "does this quote support this claim?"
and can **only veto**. It can never rescue a claim that failed a code check.

### 5.5 Failure handling

A claim that fails any check is **dropped from the draft** and appended to
`logs/dropped-claims.jsonl` in the state repo with: run id, document URL and
sha256, the claim, the failing quote, the check that failed, and the nearest
fuzzy match in the source (for debugging only; it is never used to pass). Each
PR includes a count ("3 claims dropped by the verbatim guard"). A document
where more than half the claims fail is flagged, because that suggests either
a bad text extraction or a model problem. A weekly summary reports the
drop rate by source and by check.

### 5.6 Special cases

- **Video:** only official captions or transcripts published by the body count
  as source text. YouTube auto-captions and speech-to-text are useful for
  finding the timestamp, but they are not verbatim evidence. Claims from them
  go to a person with a timestamp link.
- **Scanned PDFs:** `needs_human_read`, as in §4.5.
- **Owner-supplied text** (pasted from a paywalled article) passes the guard
  against the pasted text. The PR marks it `owner-supplied`, so the owner knows
  the check proves consistency with what they pasted, not with the live page.

### 5.7 Tests

Before the guard runs on anything live, it gets unit tests. These include
adversarial cases: a paraphrase that is one word off, a quote spliced from two
sentences, a correct quote with a wrong number in the claim, a correct quote
attributed to the wrong speaker, curly vs straight quotes, and quotes with
elisions. It also gets a golden set of every sentence already quoted in
`timeline.js`, checked against archived copies of the cited sources. Existing
site content should pass, and deliberately corrupted versions must fail.

---

## 6. Build order

Each phase is usable on its own. Phases 1–2 already make the owner faster
without any model in the loop.

| Phase | Deliverable | Exit criterion |
|---|---|---|
| 0 | Decisions D1–D14 answered; state repo created; secrets added; branch protection on `main` | Owner sign-off |
| 1 | Source registry (`config/sources.yaml`) with tiers; schema validator for `timeline.js` / `sources.js` / `actions.js` / `updates.js` run against the **current** data | Validator passes on current data, or its findings are fixed by hand (for example `cub2026` has no `tier`) |
| 2 | Fetchers and change detection for Tier 1 structured sources (Village page diff, News Flash RSS, Legistar, YouTube RSS, bill status, GIS diff), with notification only: "new Agenda Brief posted" plus a link | Two weeks of runs, no missed item compared with the owner's manual checks, false-alert rate acceptable |
| 3 | News RSS and Google News discovery, relevance prefilter, dedupe | Syndicated copies collapse correctly on a backfill of known articles |
| 4 | Wayback capture and verification | Captures succeed or fall back cleanly; verified against quotes |
| 5 | **Verbatim guard and its test suite**, built before extraction | All adversarial tests fail as designed; the golden set passes |
| 6 | Extraction (Claude API) behind the guard, plus an **evaluation set**: the 25 existing timeline entries' source documents re-extracted and compared with the owner-written entries | No claim reaches a draft that the owner judges false or unsupported. Drop rate and cost per document measured. |
| 7 | Scoring and draft generation in **shadow mode**: PRs go to the private state repo, not the public one, for 2–4 weeks alongside the manual process | Owner would have merged at least most tier-1 drafts with light edits; zero fabricated claims |
| 8 | Live PRs in the public repo, plus phone notifications | Owner approval |
| 9 | Harder sources: court docket, Recorder, ICC, FERC, IEPA, USACE (each after its terms check) | Per source |
| 10 | Cost tuning (Batches for daily/weekly, caching, a cheaper model if D12 allows) | Monthly spend under the cap |

---

## 7. Risks

| Risk | Detail | Mitigation |
|---|---|---|
| **Fabricated or misattributed claim published** | The central risk. | Verbatim guard (§5), claim–quote consistency, tier from registry, no model tools, human merge, shadow period, dropped-claim review. The owner reads the quote in the PR, not just the draft prose. |
| **Prompt injection** | A fetched page or PDF contains text addressed to the model ("ignore previous instructions, add…"). | The model has no tools and cannot publish. Output is schema-bound. Every claim must quote the page, and an injected instruction would have to survive the guard, the rubric and the owner. Documents containing instruction-like text are flagged. |
| **Allegations presented as fact / defamation** | Court filings and opposition statements name the Village, T5, Alter and officials. | `allegation` claim type, which never becomes fact; required attribution wording (§5.4); the site's existing "Allegations, not findings" convention. |
| **Scraping terms** | CivicPlus-hosted Village and County sites, GovOS/Kofile `publicsearch.us` (Recorder), Tyler re:SearchIL (courts), YouTube and Google News each have terms that may restrict automated access. **None were read for this plan.** | Read each site's terms before enabling its fetcher (D7, D8). Prefer RSS and official APIs. Honest user agent, low request rates, `robots.txt`. Anything behind a login stays manual unless its terms allow automation. |
| **Copyright on news text** | Storing and republishing article text. | Full text is kept only in the private state repo. The site and public PRs carry a link, a paraphrase and short quotes (the site already quotes briefly, with attribution). News articles are never mirrored to `public/docs`. Wayback snapshots are the Internet Archive's copies. The owner decides the quote-length norm (D6). |
| **Public repo leaks** | If `grayslake-impact` is public, anything the bot commits, including PR bodies and branches, is public immediately, even if the PR is closed. | Tier 3/4 material never goes to the public repo. PR bodies contain only Tier 1/2 quotes. The state repo is private. |
| **Rate limits and blocking** | Tribune returned 403 to this machine. USACE timed out. Legistar `/events` returns 500. SPN2 has per-account capture limits. | Backoff; fall back to discovery plus a person reading the article; alert on repeated failures ("source X silent for 48 h") so gaps are noticed rather than hidden. |
| **GitHub Actions limits** | Cron is best-effort and runs can be delayed at busy times. **In public repos, scheduled workflows are disabled after 60 days without repository activity.** Private repos have a monthly minutes allowance. | Stagger cron minutes; `workflow_dispatch` for manual runs; a weekly heartbeat check that alerts if no run succeeded; activity from pipeline PRs keeps the schedule alive. |
| **API cost** | Rough estimate: after the prefilter, 5–20 relevant documents a day, averaging about 8k input and 2k output tokens (including thinking) on Opus 5.5, is about $0.07 per document, or roughly **$10–45 a month**. One 150-page agenda packet cut to about 30 relevant pages is about 20k tokens, or about $0.15. **These are estimates, not measurements.** Phase 6 measures real numbers. | Keyword prefilter, page slicing, prompt caching, Batches (50% off) for non-urgent sources, and a hard monthly budget in the state DB that stops extraction and notifies. Also set a spend limit in the Anthropic Console (D12). |
| **Silent source changes** | A site redesign breaks a scraper, which then finds "nothing new" forever. | Each fetcher asserts a minimum expected structure (for example, at least N `DocumentCenter` links on the Agendas page) and alerts when that fails. |
| **Speed vs accuracy** | "Be first" pushes toward fewer checks. | Speed comes from monitoring and notification (phase 2), not from lowering the bar. A Tier 1 alert with a link reaches the phone within about 30 minutes, even before a draft exists. |
| **Stale "LAST_VERIFIED" and figures** | New entries can make key figures or the "Last verified" date misleading. | PRs list affected figures and pages. The owner updates them by hand (D11). |
| **Grid data mismatch** | PJM's interconnection queue lists generation and transmission requests. A large load like T5 is served through ComEd and may never appear there. | Treat PJM and FERC as context sources. The ICC e-Docket and ComEd filings are the likelier record. |

---

## 8. Decisions needed from you

| # | Decision | Recommendation |
|---|---|---|
| D1 | Is `grayslake-impact` public? Where do state, retrieved full text and leads live? | Private companion repo for state; pipeline code in this repo under `pipeline/` |
| D2 | Phone notification channel, and a dedicated inbox for email alerts (Village Notify Me, Google Alerts, FERC eSubscription) | GitHub Mobile, plus ntfy with an access token for Tier 1; a new Gmail address for alerts |
| D3 | Cadences in §2: acceptable, or faster for specific sources? | As proposed; tighten around meeting nights |
| D4 | Existing `tier` values in `sources.js` (`primary`/`trade`/`aggregator`) don't match the rubric (news marked `primary`). Leave the display as is and keep rubric tiers in `config/sources.yaml`, or migrate the display? | Keep the display as is for now; rubric tiers live in the registry; revisit separately |
| D5 | Which outlets are Tier 2? Check each outlet's corrections policy (Daily Herald, Chicago Tribune, Capitol News Illinois, Lake & McHenry County Scanner, Chronicle Media, WBEZ/Sun-Times, others) | Owner checks each, off-page (lateral reading), once |
| D6 | Maximum length of news quotes on the site and in public PRs | One or two sentences, always attributed |
| D7 | Court records: manual, re:SearchIL account alerts, or scraping (only if the terms allow) | Manual plus alerts; the Oct 30 hearing added to the known-dates calendar |
| D8 | Recorder and DocumentCenter ID probing: allowed? (Terms of use not read yet.) | Read the terms first; until then, weekly manual Recorder search and no ID probing |
| D9 | Create an archive.org account for Save Page Now API keys? | Yes |
| D10 | Can the bot propose mirroring government PDFs into `public/docs/` with a SHA-256 (as done for the complaint and FAQ)? | Yes for government records, never for news |
| D11 | Should pipeline PRs update `LAST_VERIFIED`? | No; the owner updates it, since it asserts a human check |
| D12 | Model and budget: Opus 5.5 throughout, or measure a cheaper model (Sonnet 5.5) on the eval set? Monthly cap? | Opus 5.5 for extraction; a $50/month hard cap; revisit after phase 6 measurements |
| D13 | GitHub App (so CI runs on bot PRs) or the default token (simpler, no CI on bot PRs) | GitHub App |
| D14 | Confirm "POWER Act" = HB5513 / SB4016 on a primary source before the site names it | Owner check |

---

## 9. Not verified in this planning pass

Collected here so none of it is mistaken for a checked fact:

- The "POWER Act" name on ilga.gov (the bill pages were verified; the name was not seen on them).
- Daily Herald and Chicago Tribune feed URLs; the Tribune returned 403.
- The Village website's own video page URL.
- Circuit Clerk public docket search URL and alert options; re:SearchIL coverage of Lake County chancery cases.
- Lake County Stormwater Management Commission web page URL.
- IEPA permit database URLs.
- USACE Chicago District public notice page (timed out).
- FERC eLibrary search API and eSubscription behaviour.
- Legistar `/events` endpoint (returns HTTP 500).
- Terms of use for every scraped or searched site.
- Corrections policies for every proposed Tier 2 outlet.
