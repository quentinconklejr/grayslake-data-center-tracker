# Live audit — grayslakedatacentertracker.org

Audited in a browser against the deployed site, Aug 10 2026.
Every finding below was reproduced live, not inferred from code.

**Verdict: two blockers, then you're good to share.** Both are in `AUDITFIX.ps1`.

---

## Blockers

### 1. Four routes return Vercel's raw 404 page instead of your site

```
/tax          404: NOT_FOUND   Code: NOT_FOUND   ID: cle1::4bg5f-...
/residents    404: NOT_FOUND
/reporters    404: NOT_FOUND
/officials    404: NOT_FOUND
```

No branding, no navigation, no way back. Same for any mistyped URL and any
stale link anyone has ever shared.

**Cause.** `vercel.json` contains:

```json
{ "source": "/sitemap.xml", "destination": "/sitemap.xml" },
{ "source": "/robots.txt",  "destination": "/robots.txt"  },
{ "source": "/(.*)",        "destination": "/index.html"  }
```

The first two rewrite a path to itself. That's a loop, Vercel rejects the
entry, and one rejected entry stops the **whole** rewrites block applying —
including the catch-all that hands unknown paths to `index.html` so React
Router can render your `NotFound` page. Your `NotFound` component is currently
unreachable code.

The 16 routes that do work are only working because `build-route-html.js`
writes a static `.html` shell for each one. The four with no shell fall
straight through to the platform.

**Fix:** delete the two self-referential entries. Static files are served from
the filesystem before rewrites are consulted, so they were never doing
anything.

### 2. The lawsuit is broken on the timeline

It renders at the very bottom, **after the 2029 projection**, as a bare title
with no date badge, no category tag and no description:

```
July 31, 2026
Resident Lawsuit Filed Against Village & T5[15]
```

**Cause.** That entry was written with a different shape than every other one:

| every other entry | the lawsuit entry |
|---|---|
| `description:` | `desc:` |
| `category:` | `type:` + `status:` |
| `date: "2026-07-31"` | `date: 'July 31, 2026'` |

The component reads `event.description` and `event.category`, so both come out
blank. And `dateToMs("July 31, 2026")` returns `NaN`, so the sort puts it last.

It's also why the page header says **All (19)** while the category filters add
up to 18 — it belongs to no category, so no filter will ever show it.

This is the most important event on the page and it's the one that looks
broken. Rewritten to the standard schema, with the case number and the four
counts.

---

## Also fixed in the same script

- **Mojibake on the Schools panel.** "Archived copy â†—" and "PDF mirror â†“" —
  the arrow characters were written as double-encoded UTF-8 by one of my
  earlier scripts. Bytes confirmed: `c3a2 e280a0 e28094`.
- **Dead "Officials overview" link on `/actions`,** pointing at the deleted
  `/officials` route.

---

## Confirmed working

- **No JavaScript errors from your site on any page.** Every console error came
  from a browser extension (`chrome-extension://cndib...`), as did the `/api/v1/courses`
  and `/d2l/api/...` 404s — that's an extension probing for a learning
  management system, not your code.
- **The complaint PDF loads** at `/docs/t5-grayslake-complaint-2026ch00000171.pdf`.
- **Map labels are correct now** — 135.1 / 69.9 / 64 / 18.8, summing to 287.8
  across 57 parcels, matching the legend and the key figures.
- **`/agreement` renders completely** — case number, parties, four counts,
  relief sought, PDF link, and all five footnotes resolving.
- **Footnote citations resolve on every page checked.**
- **The signup renders** with an email field and a Subscribe button.
- Fonts, CSS, JS, webmanifest, Plausible all 200.

---

## Not blockers, but a reporter would notice

### The two "eight taxing districts" lists contradict each other

`/project` contains both of these, a few screens apart:

**Tax section** — no citation, invented-looking percentages:

> Grayslake CHSD 127 ~50-55% · Grayslake CCSD 46 ~25-30% · Grayslake Fire
> ~8-10% · College of Lake County ~4-6% · Grayslake Area Public Library ~3-4% ·
> Lake County Government ~3-5% · Avon Township ~1-2% · Lake County Forest
> Preserve ~1-2%

**Schools section** — cited to the Village FAQ, page 2:

> Fremont Elementary District 79 · Grayslake CHS 127 · Mundelein HS 120 ·
> Fremont Library · Round Lake Area Park · Grayslake Park · Grayslake Fire ·
> Village of Grayslake

Different districts, and the first list carries levy-share percentages with no
source at all. Five of its eight districts don't appear in the FAQ list. This
is the same category of problem as the trade-union list I removed earlier: a
precise-looking table nobody can check. **I'd delete the percentage table or
source it before a reporter gets to it.**

### "Buffer 400 MW" is still on the page

I removed the stat card, but `EnergyDrawChart` still computes and displays it —
"25% buffer", "BUFFER 400 MW", and a data table row. Same objection as before:
1,600 − 1,200 is arithmetic on two disclosures, not a published figure, and
using 1,550 instead gives 350.

### Oct vs Nov 2025, on the same site

- `/timeline`: "Site work begins — **Oct 2025**"
- `/project` jobs panel: "Site preparation and earthmoving active as of
  **November 2025**"

### Construction figure still attributed to "Village documents"

> "Construction headcount is estimated at approximately 400 positions based on
> Village documents."

The Village FAQ explicitly excludes construction employment. The sourced
description is "hundreds", from Government Technology.

### The lawsuit is missing from `/actions`

Twelve actions on file, none of them the filing. And the June 26 entry still
reads "Intent stated; no filings confirmed", which was true then and isn't now.

### Homepage caption is now ambiguous

> "287.8 acres across 57 parcels in Grayslake, IL. Approved campus boundary
> covers up to 472 acres."

Reads like the 472 acres is shown. The map legend directly below says it isn't
drawn. Suggest: "The approved campus is larger and is not mapped."

### "ComEd Supply Agreement: Executed"

Stronger than the FAQ supports — it says agreements are "already in place".
"Executed" implies you've seen the instrument.

---

## Still unverified

- **The Wayback snapshot.** archive.org is blocked from my environment. Open it
  yourself and confirm the SHA-256 in `sources.js` matches the PDF you host.
- **Real mobile.** I could not get a true mobile viewport out of the browser
  session. The code-level fixes are in, but open `/project` and `/map` on your
  actual phone.
- **The signup end to end.** Type an address into it and confirm the email
  reaches you. You've set a `web3formsKey`; nobody has proven a message
  arrives.
