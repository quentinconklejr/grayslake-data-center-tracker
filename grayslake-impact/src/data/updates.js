/**
 * What changed on this site and when.
 *
 * A tracker that quietly rewrites itself is not a record. Anything that
 * changes what the site asserts — a new document, a corrected figure, a
 * claim withdrawn — gets a dated line here. Layout and typography changes
 * do not.
 *
 * Newest first. `date` is ISO; `kind` is one of added, corrected, removed.
 */
export const updates = [
  {
    date: '2026-10-06',
    kind: 'corrected',
    title: 'Three news articles relabeled Tier 3 until their reporters are confirmed',
    description:
      'An article from an established outlet now counts as Tier 2 only when a named reporter is confirmed on that article from its archived copy. Three cited articles have no archived copy yet, so the Documents page now labels them \u201cTier 3 \u00b7 news report (byline unconfirmed)\u201d: the Daily Herald\u2019s June 8, 2026 and October 11, 2025 articles and the Capitol News Illinois article. The reporters of the Chicago Tribune\u2019s June 5 and July 2 articles, the Daily Herald\u2019s July 31 and September 1 articles and the 2024 Crain\u2019s Chicago Business article are now recorded.',
    link: 'C:/Program Files/Git/documents',
    linkLabel: 'See the documents',
  },
  {
    date: '2026-10-06',
    kind: 'corrected',
    title: 'Village statements labeled as party statements',
    description:
      'On the Documents page, the Village of Grayslake\u2019s press releases, the Mayor\u2019s statement on the POWER Act and the Village\u2019s project FAQ are now labeled \u201cTier 1 \u00b7 party statement,\u201d the same as T5\u2019s own statements, because the Village is a defendant in the pending lawsuit. The Village\u2019s agendas, minutes, ordinances and permits stay labeled as public records.',
    link: 'C:/Program Files/Git/documents',
    linkLabel: 'See the documents',
  },
  {
    date: '2026-10-06',
    kind: 'corrected',
    title: 'Land acquisition entry: the 134.9-acre block\u2019s measure stated',
    description:
      'The May 2, 2024 land acquisition entry now says that the 134.9 acres of T5\u2019s largest contiguous block are calculated from the merged county parcel boundaries, and adds that the county\u2019s own acreage figures for the 50 parcels in that block sum to 135.10.',
    link: 'C:/Program Files/Git/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'July 2 wetland reporting now cited to the Chicago Tribune original',
    description:
      'The July 2, 2026 Chicago Tribune article by Joseph States on the wetland fill application and the September 2025 Stormwater Management Commission letter is now cited to the Tribune\u2019s own page, with an archived copy from the day it was published. It was cited to a republication by the Illinois Environmental Council, which carried only the first part of the article.',
    link: 'C:/Program Files/Git/actions',
    linkLabel: 'See the actions',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Documents page labels now show each source\u2019s tier',
    description:
      'The labels on the Documents page now come from the site\u2019s source registry and show each source\u2019s tier. The Lake and McHenry County Scanner and Chronicle Media, which were labeled \u201cprimary,\u201d are now labeled \u201cTier 3 \u00b7 news report\u201d; established outlets such as the Daily Herald and the Chicago Tribune are \u201cTier 2 \u00b7 established outlet\u201d; government records and court filings are \u201cTier 1 \u00b7 public record\u201d; trade publications, aggregators and advocacy groups are labeled as such at Tier 3.',
    link: 'C:/Program Files/Git/documents',
    linkLabel: 'See the documents',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Land acquisition entry: acreage corrected, totals labeled as calculated, reported acreages attributed',
    description:
      'The May 2, 2024 land acquisition entry now gives the January 2025 parcels as 89.4 acres (it said 89.3; the county parcel acreages sum to 89.35), says that its acreage and dollar totals are calculated from county parcel records, and takes the approval dates from the Village FAQ. It now attributes the larger acreages reported for the first purchase to where they came from: 160 acres (the planned project area) and \u201cmore than 134 acres\u201d to The Real Deal, which cited Lake County records for the 134, and both figures as Crain\u2019s Chicago Business reported them.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Wetland permit: \u201cSection 404\u201d and unsourced dates removed across the site',
    description:
      'The timeline entry, the two wetland actions, the wetland key figure and the related open question now describe T5\u2019s application as one to the U.S. Army Corps of Engineers to fill 15.75 acres of wetlands, as the cited Daily Herald and Chicago Tribune reporting does; none of the sources names Section 404. They no longer say the application was filed in June 2026 or suspended on July 31, 2026: the Tribune reported on June 5, 2026 that it was sent \u201cearlier this year\u201d, and the Daily Herald reported the suspension on July 31. The open question no longer says the Village approval process did not cover a federal permit; it now gives the Tribune\u2019s account of the Stormwater Management Commission letter and the complaint\u2019s allegation about that commission\u2019s review, attributed.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Public comment session: dates and wording now from the Village\u2019s own press releases',
    description:
      'The August 19, 2026 timeline entry and the matching action now cite the Village\u2019s August 17 and August 19 press releases. They give the dates the Village gives, say the session was postponed, the Village\u2019s word, and quote the Village\u2019s reasons as written. News reports that gave other days for the announcement are no longer relied on.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'County zoning hearing attendance corrected',
    description:
      'The August 18, 2026 County zoning board entry said Chronicle Media reported more than 225 people attended. Chronicle Media reported more than 125 people in the meeting room and another 100 in the hallway and stairwell; the entry now says that.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'State representative quotation corrected',
    description:
      'The August 30, 2026 entry quoted Rep. Daniel Didech as saying residents deserve answers on \u201cother relevant concerns.\u201d The quotation now reads as published: \u201cother relevant questions that may arise.\u201d',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: '\u201cPOWER Act\u201d now named with its House bill number',
    description:
      'The August 30, 2026 entry now gives the name in quotation marks with the House bill it is attached to, the so-called \u201cPOWER Act\u201d (HB5513), and says that the bill text does not use the name. It names SB4016 by number only, as the Senate bill with an identical synopsis. It cites both bills\u2019 status pages on ilga.gov and the Village\u2019s August 4 statement, which calls House Bill 5513 the \u201cIllinois POWER Act.\u201d',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'First building permit entry: foundation permit date removed',
    description:
      'The September 1, 2026 entry said the foundation permit was issued on July 31. No cited source gives that date; the Daily Herald reported in July that a foundation permit had already been issued. The entry now says that, and cites the complaint for the lawsuit\u2019s July 31 filing date.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-09-15',
    kind: 'corrected',
    title: 'Site-wide figures now lead with what the ordinances state',
    description:
      'Pages that give the size of the approved campus now lead with the figures in the signed ordinances, about 473.5 acres and a cap of 10,160,000 sq ft, each with a page citation, and give the Village FAQ figures of 472 acres and 10,100,000 sq ft and CLCJAWA\u2019s 470 acres after them, attributed; references to 18 buildings as an approved count now say that 18 is the number shown on the master site plan and that the ordinances set no building count.',
    link: '/records/t5',
    linkLabel: 'See the ordinance figures',
  },
  {
    date: '2026-09-15',
    kind: 'added',
    title: 'Added the signed T5 ordinances, agreements and site plans obtained through FOIA',
    description:
      'The Village of Grayslake records approving the T5@CHICAGO IV campus are now published in full at /records/t5: five ordinances passed between November 19, 2024 and May 6, 2025, the agreements attached to them, the Lake County zoning verification letter, the 2005 intergovernmental agreement and the master site plan. Every figure on the new pages links to the page of the packet it came from.',
    link: '/records/t5',
    linkLabel: 'Read the records',
  },
]
