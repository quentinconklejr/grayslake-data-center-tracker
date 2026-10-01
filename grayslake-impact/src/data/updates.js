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
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Land acquisition entry: acreage corrected, totals labeled as calculated, sources added',
    description:
      'The May 2, 2024 land acquisition entry now gives the January 2025 parcels as 89.4 acres (it said 89.3; the county parcel acreages sum to 89.35), says that its acreage and dollar totals are calculated from county parcel records, takes the approval dates from the Village FAQ, and cites Crain\u2019s Chicago Business for the \u201c$29.4 million for 134 acres\u201d figure it discusses.',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Wetland permit entry no longer says \u201cSection 404\u201d',
    description:
      'The July 31, 2026 wetland permit entry now describes T5\u2019s application as one to the U.S. Army Corps of Engineers to fill 15.75 acres of wetlands, as the cited Daily Herald and Chicago Tribune reporting does; neither names Section 404. The Village\u2019s words are now given as the Daily Herald reported them: the mitigation was not necessary for the project \u201cto move forward.\u201d',
    link: '/timeline',
    linkLabel: 'See the timeline',
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: 'Public comment session entry now gives the days as reported',
    description:
      'The August 19, 2026 entry on the extended public comment session no longer gives August 17 and August 19 as the dates of the announcement and the postponement. The cited report gives them as Monday and Wednesday of that week, and the entry now attributes them to it. The Village\u2019s statement is quoted as written, and the session is described as postponed, the word the Village used.',
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
