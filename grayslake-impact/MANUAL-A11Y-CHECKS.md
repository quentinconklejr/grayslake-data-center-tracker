# Manual accessibility checks

`npm run a11y` (axe-core) and `npm run check-contrast` cover what a machine can
decide. That is roughly 40% of WCAG 2.1 AA. This is the rest — none of it can
be automated, and all of it needs a person.

Prerequisites: `npm i -D puppeteer axe-core`, then `npm run build && npm run a11y`.

## 1. Keyboard only — unplug the mouse

Tab through every page start to finish.

- [ ] "Skip to content" appears on the first Tab and works
- [ ] Focus is visible on **every** stop. Watch the citation markers `[1]` in
      particular — they are 0.6em superscripts and easy to lose
- [ ] **The map**: Tab reaches it, "Skip map, go to parcel list" appears and
      works, and focus is never trapped inside the Mapbox canvas
- [ ] Parcel detail panel closes on Escape and focus returns somewhere sensible
- [ ] Mobile menu (narrow the window first): opens, traps focus while open,
      closes on Escape, returns focus to the toggle
- [ ] Questions accordion: expands and collapses on Enter and Space
- [ ] Plain language / Full detail toggle is reachable and operable
- [ ] Filter chips on Actions and Questions are reachable in a sensible order

## 2. Screen reader

VoiceOver (Cmd+F5) or NVDA. You do not need to be fluent — listen for whether
the content makes sense with the screen off.

- [ ] **Map**: announces what it shows and the acreage, and does not read as an
      empty graphic. This is the single highest-risk item on the site
- [ ] **Parcel table**: navigable by rows, PIN column reads as a row header
- [ ] **Charts**: each announces its caption, then its values table. Confirm the
      percentage splits are reachable — those exist nowhere else as text
- [ ] **Filter chips**: state is announced as pressed / not pressed
- [ ] **Result counts** announce when a filter changes
- [ ] **Copy button**: "Figure and citation copied to clipboard" is announced
- [ ] **Citations**: `[1]` markers announce as links to a footnote, and the
      footnote back-references return you to the right place
- [ ] Headings alone give a usable outline of each page

## 3. Zoom and reflow (1.4.10, 1.4.4)

- [ ] 400% zoom at 1280px wide: no horizontal scrolling, nothing clipped
- [ ] 320px wide viewport: the parcel table and the Reporters key-figures table
      scroll horizontally within their container, not the whole page
- [ ] Text-only zoom to 200%: nothing overlaps or truncates

## 4. Motion (2.3.3)

- [ ] With OS "reduce motion" on, `FadeIn` and `AnimatedNumber` do not animate.
      A global `prefers-reduced-motion` rule is in `index.css`, so this should
      pass — confirm it actually does

## 5. Content judgement

Things only a human can decide.

- [ ] Link text makes sense out of context — no bare "here" or "read more"
- [ ] Every image has alt text that says what it conveys, or is `aria-hidden`
      if decorative
- [ ] The OG images have meaningful `og:image:alt`
- [ ] Error and empty states ("No actions on file for this filter") are
      announced, not just displayed

## 6. Known gaps

- **Mapbox internals.** The canvas gets `role="img"` with a description and a
  text equivalent beside it. The map's own pan and zoom controls come from
  Mapbox GL and are not fully keyboard-operable. The mitigation is that no
  information is map-only — everything the map shows is in the parcel table.
  If that stops being true, the map becomes an AA failure.
- **Colour-coded chart bars.** Hidden from assistive tech because the adjacent
  labels carry the meaning. If a chart is ever changed so a bar encodes
  something the text does not state, that exemption no longer holds.
