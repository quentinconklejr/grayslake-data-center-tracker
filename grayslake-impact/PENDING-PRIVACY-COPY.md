# Pending — Privacy page "Fonts" section rewrite

The Privacy page at `src/pages/Privacy.jsx` currently contains this
paragraph (lines 89-93):

> **Fonts.** Every page loads two typefaces from Google Fonts, which
> means your browser makes a request to Google on each visit and Google
> can see your IP address in doing so. This is the one outside request
> you cannot avoid by staying off a particular page.

That paragraph is **factually inaccurate as of commit `f834354`**.
Google Fonts was removed from the site; typefaces are now self-hosted
via `@fontsource` (see `src/fonts.css`). A Privacy page that publishes
a false claim about what leaves the reader's browser is a merge blocker
on this site — it is authoritative disclosure, not descriptive
opinion — and the wording is your call.

## Proposed replacement

Same voice, no hedging, one factual claim per sentence, matches the
surrounding bullets' cadence:

```jsx
<p>
  <strong>Fonts.</strong> The site's typefaces &mdash; Source Serif 4,
  IBM Plex Sans, and IBM Plex Mono &mdash; are served from this origin.
  No request goes to Google or any other font service on your behalf.
</p>
```

Rendered:

> **Fonts.** The site's typefaces — Source Serif 4, IBM Plex Sans, and
> IBM Plex Mono — are served from this origin. No request goes to
> Google or any other font service on your behalf.

## What was checked

Every other Privacy-page claim about what leaves the reader's browser
was re-verified against the current codebase:

| Claim | Status |
|---|---|
| No cookies, no accounts, no advertising, nothing sold | Still true |
| Web3Forms delivers signups | Still true (UpdatesSignup unchanged) |
| Plausible analytics loaded from plausible.io | Still true (index.html unchanged on this point) |
| Map is Leaflet + Esri tiles + CARTO labels | Still true |
| Hosted on Vercel | Still true |
| Outbound sources link elsewhere | Still true |

Only the Fonts bullet needs rewriting.

## Also stale (code comment, not user-facing copy)

The docstring at `src/pages/Privacy.jsx:9-25` lists "It never mentioned
Google Fonts, which every page loads" as historical drift the earlier
rewrite fixed. That history note is now half-moot with the self-host
switch. Comment, not copy — not blocking.

## Instructions when you're ready to land this

Replace the paragraph at `src/pages/Privacy.jsx:89-93` (currently three
lines of copy about Google Fonts) with the proposed replacement above.
No other change needed. Update the review date `LAST_VERIFIED` in
`src/data/siteConfig.js` if you want the change to bump it.
