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
