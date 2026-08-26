# Pending — citation flags awaiting hand-review

Four items in `src/data/questions.js` where the OpenQuestions
citation-surfacing bug fix (commit `a442201`) started rendering
`sourceKeys` that had never appeared on the live site. This file is
facts only — no fix has been applied, no recommendation is given
below. Merge is blocked until each item is resolved.

---

## 1. `questions.js` Q5 (approval-process), `disputed[0]`

### Item text (verbatim, lines 152-155)

> "The opposition lawsuit argues that public hearings were inadequate:
> that residents had no meaningful opportunity for cross-examination
> of expert witnesses, that the Village commissioned no independent
> third-party environmental or water studies before approval, and that
> the process did not comply with applicable procedural requirements."

**Framing the citation turns on:** "The opposition lawsuit argues" —
past-tense, referring to arguments made in a filed complaint.

**Complaint filing date:** July 31, 2026, 6:29 PM (per
`sources.js:complaint2026.date` and `caseNumber`).

**Current sourceKey:** `dailyherald2026`

### Source A — `dailyherald2026`

- Title: *"Despite village approvals, legal action expected against
  Grayslake data center"*
- Publisher: Daily Herald
- Date: **June 8, 2026** — 53 days *before* the complaint was filed
- URL: https://www.dailyherald.com/20260608/news/despite-village-approvals-legal-action-expected-against-grayslake-data-center/
- Title framing: future-tense ("legal action expected"), i.e. before
  the complaint existed
- **NOT read/verified for body content** during this audit

### Source B — `complaint2026` (file-stamped PDF, on-site at `/docs/`)

- Title: *"Preservation of Community Well-being Collective LLC et al.
  v. Village of Grayslake, T5 Data Centers LLC, and Alter Asset
  Management Company — Complaint for Declaratory and Injunctive Relief"*
- Filed: July 31, 2026, 6:29 PM
- Case number: 2026CH00000171
- Read fully via `pdftotext -layout` during this audit.

**¶ 114 (verbatim):**
> "Upon information and belief, those proceedings did not satisfy
> Klaeren's requirements in one or more of the following respects:
> (a) objectors were denied a meaningful opportunity to cross-examine
> the developer's witnesses; (b) speaking time and procedural
> opportunities were limited in ways inconsistent with a
> quasi-judicial proceeding; (c) the Village did not commission or
> rely upon independent third-party studies regarding the relevant
> categories of impact; (d) the Village did not apply any LEED-style
> sustainability evaluation criteria as required by its own 2017
> Sustainability Plan; and (e) the resulting record was inadequate to
> support discretionary land-use approvals of this magnitude."

**¶ 115 (verbatim):**
> "The absence of any independent third-party study cited in or
> attached to the Village's own published Approved T5 Data Center
> Campus FAQ regarding noise, air emissions, traffic, water
> consumption, fire suppression demands, or cumulative public-health
> impacts is evidence that the record before the Village was
> inadequate."

**¶ 117 (verbatim):**
> "These procedural failures, individually and collectively,
> constitute violations of the procedural due process protections of
> Article I, Section 2 of the Illinois Constitution and the common-law
> fair-hearing requirements of Klaeren and its progeny."

### Source C — `scannerLawsuit2026`

- Title: *"'Project of unprecedented scale': Lake County residents
  file lawsuit to block 472-acre data center campus in Grayslake"*
- Publisher: Lake & McHenry County Scanner
- Date: August 8, 2026 — 8 days after filing
- URL: https://www.lakemchenryscanner.com/2026/08/08/project-of-unprecedented-scale-lake-county-residents-file-lawsuit-to-block-472-acre-data-center-campus-in-grayslake/
- Read via WebFetch during this audit.

Coverage of the item's four claim components:
- Public hearings inadequate — **discussed** (agenda-title deception;
  6:02 → 6:03 September 9, 2024 hearing)
- Cross-examination of witnesses — **not discussed**
- Independent third-party environmental/water studies — **not discussed**
- Procedural non-compliance — **discussed** (Open Meetings Act,
  comp-plan departure, zoning inadequacy)

### Paraphrase note (fact, not recommendation)

The item says *"cross-examination of **expert** witnesses"*. The
complaint's ¶114(a) says *"cross-examine the **developer's** witnesses"*.
Expert witnesses are a subset of developer's witnesses; the item
narrows what the complaint says.

The item says *"no independent third-party **environmental or water**
studies"*. The complaint's ¶115 names a longer category list:
*"noise, air emissions, traffic, water consumption, fire suppression
demands, or cumulative public-health impacts"*. The item picks two
categories from that list.

---

## 2. `questions.js` Q1 (water-usage), `disputed[1]`

### Item text (verbatim, lines 30-33)

> "The Citizens Utility Board projected that the Meta data center in
> DeKalb would contribute to a local water deficit by 2030 under
> current draw rates. The DeKalb/Meta campus is the closest Illinois
> precedent at this scale."

**Current sourceKey:** `cub2026`

### Source

- Title: *"How data centers are raising our bills in Illinois — and
  what we should do about it"*
- Publisher: Citizens Utility Board (CUB)
- Date: August 19, 2025
- URL: https://www.citizensutilityboard.org/blog/2025/08/19/how-data-centers-are-raising-our-bills-in-illinois-and-what-we-should-do-about-it/
- **NOT read/verified for body content** during this audit.

### Concern (fact, not recommendation)

The article title is about **energy bills**. The item cites it for a
**water deficit projection** at Meta DeKalb by 2030. Either the CUB
article contains water-deficit analysis you know about but isn't
reflected in the title, or the sourceKey is wrong. Hand-check
required.

---

## 3. `questions.js` Q5 (approval-process), `disputed[1]`

### Item text (verbatim, lines 156-159)

> "T5's application to fill approximately 15.75 acres of wetlands
> raises a separate federal adequacy question: a September 2025
> Stormwater Management Commission letter reportedly indicates some
> of those wetlands may fall under US Army Corps of Engineers
> jurisdiction, which would require a federal Section 404 permit not
> obtained through the village approval process. Avon Township's
> board adopted a resolution calling for greater transparency and
> community engagement regarding the development."

**Current sourceKey:** `chitrib_june2026`

### Source

- Title: *"Legal challenge to Grayslake data center project likely:
  'The juice isn't worth the squeeze'"*
- Publisher: Chicago Tribune
- Date: June 5, 2026
- URL: https://www.chicagotribune.com/2026/06/05/grayslake-data-center-3/
- **NOT read/verified for body content** during this audit.

### Concern (fact, not recommendation)

The item makes **two distinct factual claims**:
1. T5's wetlands application, September 2025 SMC letter, USACE
   Section 404 jurisdiction question
2. Avon Township's board adopted a resolution calling for
   transparency

The single Chicago Tribune sourceKey likely backs claim 1 (matches
the article's framing about legal challenges). Whether it also backs
the Avon Township resolution is unclear from the title alone; that
may need a second sourceKey. Hand-check required.

---

## 4. `questions.js` Q4 (tax-revenue), `unknown[1]`

### Item text (verbatim, lines 129-132)

> "Whether T5 secured Illinois Data Center Investment Tax Exemption
> status before the suspension of new applications (effective July 1,
> 2026, per the Governor's June 5, 2026 directive) is not publicly
> confirmed. No stated duration for the suspension appears on the
> DCEO page."

**Current sourceKey:** `dceo2026`

### Source

- Title: *"Data Center Investment Tax Exemptions and Credits"*
- Publisher: Illinois DCEO
- URL: https://dceo.illinois.gov/expandrelocate/incentives/datacenters.html
- **No `date` field** in the `sources.js` entry, unlike every other
  source. Every other footnote in `FootnoteContext.jsx` renders a
  date; this one renders without one.

### Concern (fact, not recommendation)

Missing `date` field is a cosmetic/formatting issue — the footnote
will render without a date, breaking the visual convention. The claim
itself references specific dates (July 1, 2026 suspension; June 5,
2026 directive) that a reader may want to verify against the source.
Adding a snapshot date and note to the `sources.js` entry would
resolve the formatting issue.

---

## Instructions when you're ready

Each item resolves by editing `src/data/questions.js` (and, for #4,
optionally `src/data/sources.js`). Nothing needs to change in any
JSX file. Each item is independent — resolve one, some, or all
without cross-dependencies.
