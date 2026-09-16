/**
 * Public records layer.
 *
 * One shape for every records packet the tracker publishes, so a second
 * project (another village, another developer) drops in beside T5 without
 * a new schema. Pages under /records read from here and nowhere else — no
 * number in page copy is typed by hand.
 *
 * Page numbering
 * --------------
 * Two numbers travel with every fact, and they are not interchangeable:
 *
 *   packet_page  position in the original FOIA packet, page 1 = first page
 *                of the file. This is what a reader cites, and what the
 *                site displays ("Packet p. 215").
 *   file_page    position inside the split PDF the link opens. Splitting
 *                restarts the count, so this is the only number that makes
 *                #page=N land on the right page.
 *
 * Neither is the printed page number stamped on the document itself, which
 * restarts at 1 inside every exhibit and agreement.
 *
 * Every fact below was read off the cited page of the packet. Where the
 * text layer was an unreadable scan — every signature and vote page — the
 * page was rendered and read as an image instead, and `verified: 'image'`
 * records that.
 */

/**
 * Provenance line for the packet. Deliberately does not name the requester:
 * she has not agreed to be named, and a FOIA response is a public record
 * whatever its route here, so the site can say how it arrived without
 * identifying who asked.
 */
export const RECORDS_CREDIT =
  'Obtained through an Illinois FOIA request by a Grayslake resident'

/**
 * The complete 242-page packet, hosted off-site. The repository carries the
 * six split files; the 48.4 MB original lives at the Internet Archive so the
 * record survives independently of this site.
 */
export const FULL_PDF_URL =
  'https://archive.org/details/t-5-signed-ordinances-and-master-site-plan'

export const recordsProjects = {
  t5: {
    id: 't5',
    name: 'T5@CHICAGO IV',
    jurisdiction: 'Village of Grayslake, Lake County, Illinois',
    blurb:
      'Five ordinances and the agreements attached to them, covering the data center campus at Peterson Road and Illinois Route 83.',
  },
}

export const recordsPackets = {
  't5-2024-2025': {
    id: 't5-2024-2025',
    projectId: 't5',
    title: 'T5@CHICAGO IV ordinances, agreements and site plans',
    jurisdiction: 'Village of Grayslake',
    pages: 242,
    sizeBytes: 50769066,
    sha256: '6c4f50a5879cfb7f4e01a3df5fd9911fff521fcf17ee21401ad7c033e78f8167',
    obtainedVia: 'Illinois Freedom of Information Act request',
    credit: RECORDS_CREDIT,
    receivedMonth: 'September 2026',
    fullPdfUrl: FULL_PDF_URL,
    fullPdfNote:
      'The complete packet is 242 pages and 48.4 MB. It is hosted off-site; the five ordinances and the master plan are hosted here as separate files.',
    approvalsFrom: '2024-11-19',
    approvalsTo: '2025-05-06',
    citation:
      'Village of Grayslake, T5@CHICAGO IV ordinances and agreements (2024-2025), obtained via Illinois FOIA, published by Grayslake Data Center Tracker.',
  },
}

/**
 * Splits of the packet. `packetStart` is the packet page the file begins on,
 * which is all `filePage()` needs to convert one number into the other.
 */
export const recordsFiles = {
  'ord-2024-0-37': { path: '/records/t5/ord-2024-0-37.pdf', packetStart: 1,   pages: 58, sizeBytes: 7452462,  sha256: 'c794da64271b73416ea6ea4c63004b5646cfe72a10e210e005dea124822d2654' },
  'ord-2024-0-38': { path: '/records/t5/ord-2024-0-38.pdf', packetStart: 59,  pages: 81, sizeBytes: 7795849,  sha256: '9882b008a00639149c139a917d8d6a7e6dc5cf260009121b45ff8b0f63e05911' },
  'ord-2025-0-05': { path: '/records/t5/ord-2025-0-05.pdf', packetStart: 140, pages: 28, sizeBytes: 25622802, sha256: '82e873db8d8f89d69fc51a9a0e614489dfff00e4fbaf06ced129f985cbe5ca0a' },
  'ord-2025-0-06': { path: '/records/t5/ord-2025-0-06.pdf', packetStart: 168, pages: 16, sizeBytes: 17107844, sha256: 'b058ce344c091d57121549ba9e9d87933076bbe90f51c2d58f3d05fa60354b6e' },
  'ord-2025-0-21': { path: '/records/t5/ord-2025-0-21.pdf', packetStart: 184, pages: 58, sizeBytes: 3652100,  sha256: 'e7815762c569f94f430ae531a1dc787a7d683827ddd05e1f382cb6cc1e56b426' },
  'master-plan':   { path: '/records/t5/t5-master-site-plan.pdf', packetStart: 242, pages: 1, sizeBytes: 942628, sha256: 'a8fd4d574d918424d38b9f4804012542c372aefb7f4fe852c1266908b32f7478' },
}

/** Packet page → page number inside the split file that holds it. */
export function filePage(fileKey, packetPage) {
  const f = recordsFiles[fileKey]
  if (!f || packetPage == null) return null
  const n = packetPage - f.packetStart + 1
  return n >= 1 && n <= f.pages ? n : null
}

/** Deep link to a packet page inside its split file. */
export function pageLink(fileKey, packetPage) {
  const f = recordsFiles[fileKey]
  if (!f) return null
  const n = filePage(fileKey, packetPage)
  return n ? `${f.path}#page=${n}` : f.path
}

/**
 * Facts. `text` is the sentence the site prints; `value` and `unit` carry the
 * same thing in a form a table or a total can use. A fact with no `value` is
 * a term rather than a measurement.
 */
export const recordsDocuments = [
  {
    id: 'ord-2024-0-37',
    projectId: 't5',
    jurisdiction: 'Village of Grayslake',
    docType: 'Ordinance and SUP agreement amendment',
    ordinance: '2024-0-37',
    shortTitle: 'Third Amendment to the Cornerstone SUP Agreement',
    title:
      'Ordinance amending Ordinance No. 2009-0-26 and approving the Third Amendment to the Cornerstone SUP Agreement (T5@CHICAGO IV Campus Plan)',
    file: 'ord-2024-0-37',
    packetPages: [1, 58],
    passed: '2024-11-19',
    publishedPamphlet: '2024-11-19',
    parties: ['Village of Grayslake', 'T5@CHICAGO IV LP'],
    villageSigner: 'Mayor Rhett Taylor',
    vote: {
      ayes: ['Waldenstrom', 'Davies', 'Kornit', 'Vogel'],
      nays: [],
      absent: ['Magnetta', 'Sahu'],
      packet_page: 5,
      verified: 'image',
    },
    acres: 135,
    acresText: 'about 135 acres',
    floorAreaCapSqft: 2570000,
    signatureStatus: 'not-in-packet',
    keyPages: {
      'Ordinance text': [1, 4],
      'Village signature and vote': [5, 5],
      'Third Amendment': [10, 24],
      'Third Amendment signature page': [25, 25],
      'Development standards': [12, 13],
    },
    summary: [
      'This ordinance folded a new plan for about 135 acres of the Cornerstone Business Park into the Village plan that already governed the land, and approved a Third Amendment to the 2010 Cornerstone special use permit agreement to go with it.',
      'The land sits immediately north of the Medline facility at 2200 Cornerstone Parkway. The ordinance records T5@CHICAGO IV LP as the owner of about 90 acres of it and the contract purchaser of about 45 more.',
      'The amendment caps total gross floor area on that land at 2,570,000 square feet and sets the development standards the campus is built to, including the parking, floor area ratio, impervious surface and fence terms that differ from the standard Cornerstone rules.',
      'The Board passed it on November 19, 2024. The ordinance states that the plan change takes effect once the Village has received the signed amendment from the developer along with evidence of ownership.',
    ],
    facts: [
      { text: 'The Village Board passed Ordinance 2024-0-37 on November 19, 2024, approved it and published it in pamphlet form the same day.', value: '2024-11-19', unit: 'date', source_doc: 'Ordinance 2024-0-37 signature page', packet_page: 5, file_page: 5, verified: 'image' },
      { text: 'Four trustees voted aye. No trustee voted nay. Trustees Magnetta and Sahu were absent and not voting.', value: '4-0', unit: 'vote', source_doc: 'Ordinance 2024-0-37 signature page', packet_page: 5, file_page: 5, verified: 'image' },
      // The ordinance states the two parts, not the total. 135 is their sum,
      // and the sum is what Ordinance 2025-0-21 later calls this land
      // (packet p. 185). Both components are carried so the arithmetic on
      // the page is the document's, not ours.
      { text: 'The ordinance covers the Cornerstone Property immediately north of the Medline facility at 2200 Cornerstone Parkway: about 90 acres T5@CHICAGO IV LP owned and about 45 acres it had under contract, about 135 acres together.', value: 135, unit: 'acres', components: [90, 45], source_doc: 'Ordinance 2024-0-37 recitals', packet_page: 2, file_page: 2 },
      { text: 'Notice of the Plan Commission and Zoning Board of Appeals public hearing was published in the Daily Herald on September 9, 2024.', value: '2024-09-09', unit: 'date', source_doc: 'Ordinance 2024-0-37 recitals', packet_page: 3, file_page: 3 },
      { text: 'Total gross floor area of buildings and structures on the subject property shall not exceed 2,570,000 square feet.', value: 2570000, unit: 'sq ft', source_doc: 'Third Amendment, Section 4.A', packet_page: 12, file_page: 12 },
      { text: 'The size, configuration and number of buildings shown in the Campus Plan may be adjusted to accommodate facility customer needs, provided the floor area cap and the Cornerstone Zoning Standards continue to apply.', source_doc: 'Third Amendment, Section 4.A', packet_page: 12, file_page: 12 },
      { text: 'The developer may build the property in phases it elects, subject to Village review and approval, with each phase independently meeting Village codes and able to operate on its own.', source_doc: 'Third Amendment, Section 4.I', packet_page: 13, file_page: 13 },
      { text: 'Water service is to be provided through the Village public water system, with the developer building the extensions and upgrades. No water volume appears in the agreement.', source_doc: 'Third Amendment, Section 5.B.iv', packet_page: 14, file_page: 14 },
      { text: 'Unless Village staff approve otherwise in advance, no construction is permitted before 6:00 a.m. or after 6:00 p.m. Monday through Friday, or before 8:00 a.m. or after 5:00 p.m. on Saturdays and Sundays.', source_doc: 'Third Amendment, Section 5.C', packet_page: 16, file_page: 16 },
      { text: 'The developer designs, constructs and installs all project improvements at its sole cost and expense.', source_doc: 'Third Amendment, Section 5.A', packet_page: 13, file_page: 13 },
      { text: 'Performance and payment security is set at 110% of the estimated cost of the improvements, with a $50,000 cash deposit where bonds are used.', source_doc: 'Third Amendment, Section 7', packet_page: 20, file_page: 20 },
      { text: 'The ordinance has no force or effect as to the plan change until the Village receives the signed Third Amendment from the developer together with evidence of ownership, and those documents are due within 180 days of passage unless the Board extends the time.', source_doc: 'Ordinance 2024-0-37, Section 3', packet_page: 4, file_page: 4 },
      { text: 'The Village signed the Third Amendment on November 19, 2024. The signature lines for T5@CHICAGO IV LP are blank in this copy.', source_doc: 'Third Amendment signature page', packet_page: 25, file_page: 25, verified: 'image' },
    ],
    signatureNote: {
      documentName: 'Third Amendment to the Cornerstone SUP Agreement',
      packetPage: 25,
      villageSignedOn: 'November 19, 2024',
    },
  },

  {
    id: 'ord-2024-0-38',
    projectId: 't5',
    jurisdiction: 'Village of Grayslake',
    docType: 'Ordinance, special use permit and SUP agreement',
    ordinance: '2024-0-38',
    shortTitle: 'T5@CHICAGO IV Phase 2 special use permit',
    title:
      'Ordinance granting a Special Use Permit for a Planned Unit Development and approving a General Development Plan for the T5@CHICAGO IV Phase 2 Property',
    file: 'ord-2024-0-38',
    packetPages: [59, 139],
    passed: '2024-11-19',
    publishedPamphlet: '2024-11-19',
    parties: ['Village of Grayslake', 'T5@CHICAGO IV LP'],
    villageSigner: 'Mayor Rhett Taylor',
    vote: {
      ayes: ['Waldenstrom', 'Davies', 'Kornit', 'Vogel'],
      nays: [],
      absent: ['Magnetta', 'Sahu'],
      packet_page: 64,
      verified: 'image',
    },
    acres: 90,
    acresText: 'about 90 acres',
    floorAreaCapSqft: 1590000,
    floorAreaCapSuperseded: true,
    floorAreaCapNote:
      'Replaced by the 2,120,000 sq ft combined cap in Ordinance 2025-0-06. The two caps are not added together.',
    signatureStatus: 'not-in-packet',
    keyPages: {
      'Ordinance text': [60, 63],
      'Village signature and vote': [64, 64],
      'Exhibit D unconditional agreement and consent': [68, 69],
      'Phase 2 SUP Agreement': [70, 98],
      'SUP Agreement signature page': [99, 99],
      'Development standards': [77, 78],
      '2005 intergovernmental agreement (Exhibit I)': [130, 139],
    },
    summary: [
      'This ordinance granted a special use permit for a planned unit development on about 90 acres west of Illinois Route 83 on Peterson Road, and approved a general development plan for it.',
      'The property was zoned Neighborhood Conservation / Suburban Estate. The Plan Commission opened its public hearing on the application on September 23, 2024.',
      'The attached SUP agreement caps total gross floor area on the property at 1,590,000 square feet. Ordinance 2025-0-06 later replaced that figure with a combined cap of 2,120,000 square feet covering this property plus 33 added acres.',
      'The ordinance does not take effect until three things happen: T5 files a signed unconditional agreement and consent, the SUP agreement is executed by all parties, and T5 acquires title and delivers evidence of it. If those are not done within 90 days, the Board may repeal the ordinance without notice or hearing.',
      'A 2005 intergovernmental agreement between the Village and Lake County covering the Central Range area of the Heartland property is attached to the ordinance as Exhibit I.',
    ],
    facts: [
      { text: 'The Village Board passed Ordinance 2024-0-38 on November 19, 2024 and published it in pamphlet form the same day.', value: '2024-11-19', unit: 'date', source_doc: 'Ordinance 2024-0-38 cover and signature page', packet_page: 64, file_page: 6, verified: 'image' },
      { text: 'Four trustees voted aye. No trustee voted nay. Trustees Magnetta and Sahu were absent.', value: '4-0', unit: 'vote', source_doc: 'Ordinance 2024-0-38 signature page', packet_page: 64, file_page: 6, verified: 'image' },
      { text: 'The ordinance covers approximately 90 acres generally located west of Illinois Route 83 on Peterson Road.', value: 90, unit: 'acres', source_doc: 'Ordinance 2024-0-38 recitals', packet_page: 60, file_page: 2 },
      { text: 'The property was zoned Neighborhood Conservation / Suburban Estate (NC/SE) within the Village.', source_doc: 'Ordinance 2024-0-38 recitals', packet_page: 60, file_page: 2 },
      { text: 'The Grayslake Plan Commission commenced its public hearing on the application on September 23, 2024.', value: '2024-09-23', unit: 'date', source_doc: 'Ordinance 2024-0-38 recitals', packet_page: 60, file_page: 2 },
      { text: 'Total gross floor area of buildings and structures on the property shall not exceed 1,590,000 square feet.', value: 1590000, unit: 'sq ft', source_doc: 'Phase 2 SUP Agreement, Section 6.E.i', packet_page: 77, file_page: 19 },
      { text: 'All substations, switchyards and equipment yards on the property must be located north of the rear elevation of the principal building closest to Peterson Road.', source_doc: 'Phase 2 SUP Agreement, Section 6.E', packet_page: 78, file_page: 20 },
      { text: 'The ordinance has no force or effect until T5 files the Exhibit D unconditional agreement and consent, the SUP agreement is executed by all parties, and T5 acquires title and delivers evidence of it. If that is not done within 90 days of passage, the Board may repeal the ordinance without public notice or hearing.', source_doc: 'Ordinance 2024-0-38, Sections Five', packet_page: 62, file_page: 4 },
      { text: 'The Exhibit D unconditional agreement and consent is unsigned in this copy.', source_doc: 'Ordinance 2024-0-38, Exhibit D', packet_page: 69, file_page: 11, verified: 'image' },
      { text: 'The Village signed the Phase 2 SUP Agreement. The signature and notary blocks for T5@CHICAGO IV LP are blank in this copy.', source_doc: 'Phase 2 SUP Agreement signature page', packet_page: 99, file_page: 41, verified: 'image' },
      { text: 'An intergovernmental agreement between the Village of Grayslake and the County of Lake regarding the Central Range area of the Heartland property, dated April 5, 2005, is attached to the ordinance as Exhibit I.', value: '2005-04-05', unit: 'date', source_doc: 'Exhibit I, intergovernmental agreement', packet_page: 130, file_page: 72, verified: 'image' },
      { text: 'The 2005 agreement recites that on October 16, 1986 the Village, the County and the then owners entered a settlement agreement and release covering approximately 2,100 acres known as the Heartland Property.', value: '1986-10-16', unit: 'date', source_doc: 'Exhibit I, intergovernmental agreement, Recital A', packet_page: 130, file_page: 72, verified: 'image' },
      { text: 'Under the 2005 agreement the County provides sanitary sewer service to the Central Range area, limited to non-residential uses only.', source_doc: 'Exhibit I, intergovernmental agreement, Section 4', packet_page: 133, file_page: 75, verified: 'image' },
    ],
    signatureNote: {
      documentName: 'T5@CHICAGO IV Phase 2 SUP Agreement',
      packetPage: 99,
      villageSignedOn: 'November 19, 2024',
    },
  },

  {
    id: 'ord-2025-0-05',
    projectId: 't5',
    jurisdiction: 'Village of Grayslake',
    docType: 'Ordinance and SUP agreement amendment',
    ordinance: '2025-0-05',
    shortTitle: 'Fourth Amendment to the Cornerstone SUP Agreement',
    title:
      'Ordinance amending Ordinance No. 2009-0-26 and approving the Fourth Amendment to the Cornerstone SUP Agreement (Second Campus Plan)',
    file: 'ord-2025-0-05',
    packetPages: [140, 167],
    passed: '2025-02-18',
    publishedPamphlet: '2025-02-18',
    parties: ['Village of Grayslake', 'T5@CHICAGO IV LP'],
    villageSigner: 'Mayor Rhett Taylor',
    vote: {
      ayes: ['Waldenstrom', 'Davies', 'Magnetta', 'Sahu', 'Kornit', 'Vogel'],
      nays: [],
      absent: [],
      packet_page: 145,
      verified: 'image',
    },
    acres: 31.5,
    acresText: 'about 31.5 acres',
    floorAreaCapSqft: 1060000,
    signatureStatus: 'in-packet',
    keyPages: {
      'Ordinance text': [140, 144],
      'Village signature and vote': [145, 145],
      'Fourth Amendment': [148, 155],
      'Signature pages': [156, 157],
      'Exhibit B, Second Campus Plan': [159, 159],
      'Exhibit D, basis of design elevations': [161, 167],
    },
    summary: [
      'This ordinance added a plan for about 31.5 acres immediately east of Cornerstone Parkway to the Village land use plan, through a Fourth Amendment to the Cornerstone special use permit agreement.',
      'The amendment caps total gross floor area on that land at 1,060,000 square feet.',
      'The Board passed it on February 18, 2025 by a vote of six ayes and no nays, with no trustee absent.',
      'This is one of two documents in the packet that carries a T5 signature. Two authorized officers signed it through DocuSign on May 12, 2025. An unsigned copy of the same page also appears in the packet.',
      'The ordinance requires the signed amendment and evidence of ownership within 180 days of passage unless the Board extends the time.',
    ],
    facts: [
      { text: 'The Village Board passed Ordinance 2025-0-05 on February 18, 2025, approved it and published it in pamphlet form the same day.', value: '2025-02-18', unit: 'date', source_doc: 'Ordinance 2025-0-05 signature page', packet_page: 145, file_page: 6, verified: 'image' },
      { text: 'Six trustees voted aye. No trustee voted nay and none was absent.', value: '6-0', unit: 'vote', source_doc: 'Ordinance 2025-0-05 signature page', packet_page: 145, file_page: 6, verified: 'image' },
      { text: 'The ordinance covers approximately 31.5 acres of the Cornerstone Property located immediately east of Cornerstone Parkway.', value: 31.5, unit: 'acres', source_doc: 'Ordinance 2025-0-05 recitals', packet_page: 142, file_page: 3 },
      { text: 'Notice of the public hearing was published in the Daily Herald on December 27, 2024.', value: '2024-12-27', unit: 'date', source_doc: 'Ordinance 2025-0-05 recitals', packet_page: 142, file_page: 3 },
      { text: 'Total gross floor area of buildings and structures on the subject property shall not exceed 1,060,000 square feet.', value: 1060000, unit: 'sq ft', source_doc: 'Fourth Amendment, Section 4.A', packet_page: 150, file_page: 11 },
      { text: 'The developer must deliver the signed amendment and evidence of ownership within 180 days after passage unless the Village Board extends the time.', source_doc: 'Ordinance 2025-0-05, Section 3', packet_page: 144, file_page: 5 },
      { text: 'Two authorized officers of T5@CHICAGO IV LP signed the Fourth Amendment through DocuSign on May 12, 2025. The Village signed on February 18, 2025.', value: '2025-05-12', unit: 'date', source_doc: 'Fourth Amendment signature page', packet_page: 156, file_page: 17, verified: 'image' },
      { text: 'An unsigned copy of the same signature page also appears in the packet, immediately after the signed one.', source_doc: 'Fourth Amendment signature page, unsigned copy', packet_page: 157, file_page: 18, verified: 'image' },
      { text: 'The Second Campus Plan is attached to the amendment as Exhibit B. The sheet is titled "Revised Campus Plan - T5@CHICAGO IV", drawn by Corgan at 1:5000 and dated 01.08.2025.', source_doc: 'Fourth Amendment, Exhibit B', packet_page: 159, file_page: 20, verified: 'image' },
    ],
  },

  {
    id: 'ord-2025-0-06',
    projectId: 't5',
    jurisdiction: 'Village of Grayslake',
    docType: 'Ordinance, special use permit and SUP agreement amendment',
    ordinance: '2025-0-06',
    shortTitle: 'First Amendment to the Phase 2 SUP Agreement',
    title:
      'Ordinance granting a Special Use Permit for an enlarged Planned Unit Development and approving the First Amendment to the T5@CHICAGO IV Phase 2 SUP Agreement',
    file: 'ord-2025-0-06',
    packetPages: [168, 183],
    passed: '2025-02-18',
    publishedPamphlet: '2025-02-18',
    parties: ['Village of Grayslake', 'T5@CHICAGO IV LP'],
    villageSigner: 'Mayor Rhett Taylor',
    vote: {
      ayes: ['Waldenstrom', 'Davies', 'Magnetta', 'Sahu', 'Kornit', 'Vogel'],
      nays: [],
      absent: [],
      packet_page: 172,
      verified: 'image',
    },
    acres: 33,
    acresText: 'about 33 acres added',
    floorAreaCapSqft: 2120000,
    floorAreaCapNote:
      'This figure replaces the 1,590,000 sq ft Phase 2 cap. It covers the Phase 2 property and the 33 added acres together, so the two are not added.',
    signatureStatus: 'in-packet',
    keyPages: {
      'Ordinance text': [169, 171],
      'Village signature and vote': [172, 172],
      'First Amendment': [177, 178],
      'Signature pages': [179, 180],
      'Exhibit A, legal description': [181, 181],
      'Exhibit B, revised general development plan': [182, 183],
    },
    summary: [
      'This ordinance enlarged the Phase 2 planned unit development by about 33 acres immediately east of it, and approved a First Amendment to the Phase 2 special use permit agreement.',
      'The amendment replaces the Phase 2 floor area cap of 1,590,000 square feet with a combined cap of 2,120,000 square feet covering the Phase 2 property and the added acres together.',
      'It also states that the added property is not subject to the 1986 Heartland settlement agreement, and that the Heartland provisions of the original agreement do not apply to it.',
      'The Board passed it on February 18, 2025 by a vote of six ayes and no nays.',
      'Two authorized officers of T5 signed it through DocuSign on May 12, 2025. An unsigned copy of the same page also appears in the packet.',
    ],
    facts: [
      { text: 'The Village Board passed Ordinance 2025-0-06 on February 18, 2025, approved it and published it in pamphlet form the same day.', value: '2025-02-18', unit: 'date', source_doc: 'Ordinance 2025-0-06 signature page', packet_page: 172, file_page: 5, verified: 'image' },
      { text: 'Six trustees voted aye. No trustee voted nay and none was absent.', value: '6-0', unit: 'vote', source_doc: 'Ordinance 2025-0-06 signature page', packet_page: 172, file_page: 5, verified: 'image' },
      { text: 'The ordinance adds approximately 33 acres located immediately east of the Phase 2 property.', value: 33, unit: 'acres', source_doc: 'Ordinance 2025-0-06 recitals', packet_page: 169, file_page: 2 },
      { text: 'Notice of the public hearing was published in the Daily Herald on December 27, 2024.', value: '2024-12-27', unit: 'date', source_doc: 'Ordinance 2025-0-06 recitals', packet_page: 169, file_page: 2 },
      { text: 'The combined gross floor area of buildings and structures on the Phase 2 property and the added property shall not exceed 2,120,000 square feet. The amendment strikes the earlier figure of 1,590,000 and writes this one in its place.', value: 2120000, unit: 'sq ft', source_doc: 'First Amendment, Section 3', packet_page: 178, file_page: 11 },
      { text: 'The added property is not and shall not be subject to any provisions of the Heartland Settlement Agreement and Release dated October 16, 1986, and the Heartland sections of the original agreement do not apply to it.', source_doc: 'First Amendment, Section 5', packet_page: 178, file_page: 11 },
      { text: 'The ordinance has no force or effect until the Village receives the signed First Amendment and evidence of ownership, and the owner must deliver those within 180 days after passage unless the Village Board extends the time.', source_doc: 'Ordinance 2025-0-06, Section 3', packet_page: 171, file_page: 4 },
      { text: 'Two authorized officers of T5@CHICAGO IV LP signed the First Amendment through DocuSign on May 12, 2025. The Village signed on February 18, 2025.', value: '2025-05-12', unit: 'date', source_doc: 'First Amendment signature page', packet_page: 179, file_page: 12, verified: 'image' },
      { text: 'An unsigned copy of the same signature page also appears in the packet, immediately after the signed one.', source_doc: 'First Amendment signature page, unsigned copy', packet_page: 180, file_page: 13, verified: 'image' },
    ],
  },

  {
    id: 'ord-2025-0-21',
    projectId: 't5',
    jurisdiction: 'Village of Grayslake',
    docType: 'Ordinance and SUP agreement amendment',
    ordinance: '2025-0-21',
    shortTitle: 'Fifth Amendment to the Cornerstone SUP Agreement',
    title:
      'Ordinance amending Ordinance No. 2009-0-26 and approving the Fifth Amendment to the Cornerstone SUP Agreement (Third Campus Plan)',
    file: 'ord-2025-0-21',
    packetPages: [184, 241],
    passed: '2025-05-06',
    publishedPamphlet: '2025-05-06',
    parties: ['Village of Grayslake', 'T5@CHICAGO IV LP'],
    villageSigner: 'Mayor Elizabeth Davies',
    vote: {
      ayes: ['Waldenstrom', 'Magnetta', 'Sahu', 'Kornit', 'Vogel'],
      nays: [],
      absent: [],
      packet_page: 190,
      verified: 'image',
    },
    acres: 184,
    acresText: 'about 184 acres',
    floorAreaCapSqft: 4410000,
    signatureStatus: 'not-in-packet',
    keyPages: {
      'Ordinance text': [184, 189],
      'Village signature and vote': [190, 190],
      'Fifth Amendment': [194, 209],
      'Signature pages': [210, 211],
      'Exhibit B, Third Campus Plan': [214, 214],
      'Exhibit C, Heartland Site Plan': [215, 215],
      'Exhibit D, Lake County verification letter': [216, 217],
      'Exhibit F, basis of design elevations': [219, 221],
      'Exhibit H, preliminary engineering': [223, 223],
    },
    summary: [
      'This ordinance added a plan for about 184 acres at the southwest corner of Illinois Route 83 and Peterson Road, through a Fifth Amendment to the Cornerstone special use permit agreement.',
      'The amendment caps total gross floor area on that land at 4,410,000 square feet, the largest cap in the packet.',
      'About 46.9 acres of it fall under the 1986 Heartland settlement agreement. Lake County Planning, Building and Development reviewed the Heartland site plan and wrote to the Village on April 24, 2025 confirming the proposed data center use meets both the Heartland agreement and the 1986 county zoning ordinance.',
      'The amendment requires T5 to pay the Village the amount due under the Central Lake County Area Transportation Improvement intergovernmental agreement at closing, and states that closing shall occur no later than March 31, 2026. The dollar amount does not appear in this packet.',
      'The Board passed it on May 6, 2025. Five trustees voted aye, none voted nay and none was absent.',
    ],
    facts: [
      { text: 'The Village Board passed Ordinance 2025-0-21 on May 6, 2025, approved it and published it in pamphlet form the same day.', value: '2025-05-06', unit: 'date', source_doc: 'Ordinance 2025-0-21 signature page', packet_page: 190, file_page: 7, verified: 'image' },
      { text: 'Five trustees voted aye. No trustee voted nay and none was absent.', value: '5-0', unit: 'vote', source_doc: 'Ordinance 2025-0-21 signature page', packet_page: 190, file_page: 7, verified: 'image' },
      { text: 'The ordinance covers approximately 184 acres of the Cornerstone Property at the southwest corner of Illinois Route 83 and Peterson Road.', value: 184, unit: 'acres', source_doc: 'Fifth Amendment, Recital G', packet_page: 195, file_page: 12 },
      { text: 'Notice of the public hearing was published in the Daily Herald on March 27, 2025.', value: '2025-03-27', unit: 'date', source_doc: 'Ordinance 2025-0-21 recitals', packet_page: 187, file_page: 4 },
      { text: 'Total gross floor area of buildings and structures on the subject property shall not exceed 4,410,000 square feet.', value: 4410000, unit: 'sq ft', source_doc: 'Fifth Amendment, Section 4', packet_page: 196, file_page: 13 },
      { text: 'Approximately 46.9 acres of the property are subject to the Heartland Settlement Agreement and Release dated October 16, 1986, recorded by the Lake County Recorder on October 2, 1987.', value: 46.9, unit: 'acres', source_doc: 'Fifth Amendment, Recital I', packet_page: 195, file_page: 12 },
      { text: 'Lake County Planning, Building and Development wrote to the Village on April 24, 2025 stating that a data center, office or certain other limited industrial uses on the Heartland portion would meet both the Heartland agreement and the 1986 Lake County zoning ordinance. The letter records the Heartland portion as three parcels totalling 46.9 acres, just over 25% of the site, and states that because less than half the campus lies within the Heartland area the Village handles plan review and permitting for the whole development.', value: '2025-04-24', unit: 'date', source_doc: 'Exhibit D, Lake County zoning verification letter', packet_page: 216, file_page: 33 },
      { text: 'The developer shall pay the Village the amount due under the Central Lake County Area Transportation Improvement intergovernmental agreement, payable at the developer closing on the purchase of the property, which shall occur no later than March 31, 2026. The amount is not stated in this packet.', value: '2026-03-31', unit: 'date', source_doc: 'Fifth Amendment, Section 5.B.v', packet_page: 199, file_page: 16 },
      { text: 'The developer must deliver the signed amendment and evidence of ownership within 180 days after passage unless the Village Board extends the time.', source_doc: 'Ordinance 2025-0-21, Section 3', packet_page: 189, file_page: 6 },
      { text: 'Mayor Elizabeth Davies signed the Fifth Amendment for the Village on May 6, 2025. The signature lines for T5@CHICAGO IV LP are blank in this copy.', source_doc: 'Fifth Amendment signature page', packet_page: 211, file_page: 28, verified: 'image' },
      { text: 'The Third Campus Plan is attached as Exhibit B. The sheet is drawn by Corgan at 1:4500, dated 04.25.2025, labels seven data center buildings at 630,000 sq ft each and 90 feet in height plus a T5 switchyard, and carries the note that square footage shall not exceed 4,410,000 sq ft.', source_doc: 'Fifth Amendment, Exhibit B', packet_page: 214, file_page: 31 },
      { text: 'The Heartland Site Plan is attached as Exhibit C. It is drawn on a Third Campus Plan sheet dated 04.10.2024 and outlines the Heartland agreement areas at about 46.9 acres across three parcel numbers.', source_doc: 'Fifth Amendment, Exhibit C', packet_page: 215, file_page: 32 },
    ],
    signatureNote: {
      documentName: 'Fifth Amendment to the Cornerstone SUP Agreement',
      packetPage: 211,
      villageSignedOn: 'May 6, 2025',
    },
  },
]

export const documentById = Object.fromEntries(recordsDocuments.map(d => [d.id, d]))

/** Standards the agreements set differently from the standard Cornerstone rules. */
export const modifiedStandards = {
  appliesTo:
    'The same set appears in the Third, Fourth and Fifth Amendments and in the Phase 2 SUP Agreement. Pages below cite the Third Amendment.',
  rows: [
    { standard: 'Floor area ratio',          normal: 'Maximum 0.6',                   granted: 'Maximum 1.0',                   file: 'ord-2024-0-37', packet_page: 12, file_page: 12 },
    { standard: 'Impervious surface',        normal: 'Maximum 85%',                   granted: 'Maximum 90%',                   file: 'ord-2024-0-37', packet_page: 12, file_page: 12 },
    { standard: 'Parking',                   normal: '1 space per 1,000 sq ft',       granted: '1 space per 5,300 sq ft',       file: 'ord-2024-0-37', packet_page: 12, file_page: 12 },
    { standard: 'Fence height',              normal: '6 feet',                        granted: '8 feet',                        file: 'ord-2024-0-37', packet_page: 12, file_page: 12 },
    { standard: 'Equipment yard screen wall', normal: 'No separate allowance stated',  granted: 'Up to 20 feet',                 file: 'ord-2024-0-37', packet_page: 12, file_page: 12 },
    { standard: 'Substation and switchyard screen wall', normal: 'No separate allowance stated', granted: 'Not less than 10 feet and not more than 20 feet', file: 'ord-2024-0-37', packet_page: 13, file_page: 13 },
  ],
  alsoInThisSection: [
    { text: 'Construction is limited to 6:00 a.m. to 6:00 p.m. Monday through Friday and 8:00 a.m. to 5:00 p.m. on Saturdays and Sundays, unless Village staff approve otherwise in advance.', file: 'ord-2024-0-37', packet_page: 16, file_page: 16 },
    { text: 'Water service is provided through the Village public water system, with the developer building the extensions and upgrades. No water volume appears anywhere in the packet.', file: 'ord-2024-0-37', packet_page: 14, file_page: 14 },
  ],
}

/** The master plan sheet, the last page of the packet. */
export const masterSitePlan = {
  file: 'master-plan',
  packet_page: 242,
  file_page: 1,
  title: 'T5 Overall Plan, T5@CHICAGO - Grayslake',
  drawnBy: 'Corgan',
  scale: '1 : 8000',
  sheetDate: '04.10.2025',
  image: '/records/t5/master-site-plan-p242.png',
  labelCounts: { '530,000 sq ft': 11, '630,000 sq ft': 7 },
  labelTotalSqft: 10240000,
  labels: [
    'Eleven buildings labelled 530,000 SF and seven labelled 630,000 SF, eighteen in total',
    'Every building labelled 90′ IN HEIGHT',
    'Three areas labelled T5 switchyard and one labelled substation',
    'Stormwater basins, a ComEd right-of-way, and a right-of-way marked as dedicated to the Village of Grayslake',
    'A future Cornerstone Parkway extension and a future William Alter Drive extension',
  ],
  caution:
    'These are labels on a concept plan, not approved limits. The approved limits are the floor area caps written into the agreements.',
  alt:
    'Site plan drawing of the T5@Chicago Grayslake campus showing eighteen rectangular data center buildings grouped in blocks between Alleghany Road, West Peterson Road and Illinois Route 83, with stormwater basins, switchyards and a substation between them.',
  longDescription:
    'The sheet is titled T5 Overall Plan and covers the whole campus. Buildings appear as rectangles in three clusters: a northern group along a future Cornerstone Parkway extension, a middle group either side of Cornerstone Parkway and the ComEd right-of-way, and a southern group below West Peterson Road reaching toward Winchester Road. Eleven rectangles carry the label 530,000 SF DATA CENTER and seven carry 630,000 SF DATA CENTER. Every one is labelled 90 feet in height. A large rectangle in the middle of the sheet is labelled substation, and three smaller ones are labelled T5 switchyard. Irregular shaded shapes throughout the drawing are labelled stormwater or stormwater basin. Illinois Route 83 runs down the right edge and Alleghany Road down the left.',
}

export const heartlandSitePlan = {
  file: 'ord-2025-0-21',
  packet_page: 215,
  file_page: 32,
  title: 'Exhibit C, Heartland Site Plan, drawn on the Third Campus Plan sheet',
  drawnBy: 'Corgan',
  scale: '1 : 4500',
  sheetDate: '04.10.2024',
  image: '/records/t5/heartland-site-plan-p215.png',
  labels: [
    'Seven buildings labelled 630,000 SF, each labelled 90′ IN HEIGHT',
    'One area labelled T5 switchyard',
    'A blue outline annotated "Heartland agreement areas ~ 46.9 acres" across three parcel numbers',
  ],
  caution:
    'The building labels are labels on a concept plan. The approved limit for this land is the 4,410,000 sq ft cap in the Fifth Amendment.',
  alt:
    'Site plan drawing of the southern part of the T5 campus with seven rectangular data center buildings, overlaid by a blue outline labelled Heartland agreement areas, about 46.9 acres.',
  longDescription:
    'The sheet is the Third Campus Plan drawing used as Exhibit C to the Fifth Amendment. Seven rectangles are labelled 630,000 SF DATA CENTER and 90 feet in height, arranged either side of a Cornerstone Parkway extension and a private roadway shown in red. A blue rectangle drawn over the upper right of the site is annotated Heartland agreement areas, about 46.9 acres, with callouts to parcel numbers 10-11-400-10, 10-11-400-40 and 10-11-400-41. A block labelled T5 switchyard sits at the centre left. Stormwater areas are shaded around the edges, with Illinois Route 83 on the right and West Peterson Road across the top.',
}

/** Totals. Every component is a cited fact above; the math is shown on the page. */
export const recordsTotals = {
  acres: {
    value: 473.5,
    parts: [
      { label: '2024-0-37', value: 135 },
      { label: '2024-0-38', value: 90 },
      { label: '2025-0-05', value: 31.5 },
      { label: '2025-0-06', value: 33 },
      { label: '2025-0-21', value: 184 },
    ],
    note: 'Each figure is the acreage the ordinance itself states, and each is approximate in the document.',
  },
  floorArea: {
    value: 10160000,
    parts: [
      { label: '2024-0-37', value: 2570000 },
      { label: '2025-0-06', value: 2120000 },
      { label: '2025-0-05', value: 1060000 },
      { label: '2025-0-21', value: 4410000 },
    ],
    note: 'Ordinance 2025-0-06 replaced the Phase 2 cap of 1,590,000 sq ft with a combined 2,120,000 sq ft, so only the later figure is counted.',
  },
  ordinances: {
    value: 5,
    from: 'November 19, 2024',
    to: 'May 6, 2025',
    note: 'Every recorded vote was unanimous among the trustees voting. No trustee voted nay on any of the five.',
  },
  masterPlanBuildings: {
    value: 18,
    note: 'A label on the master plan sheet, not a limit in any ordinance.',
  },
}

/** What the packet does not contain. */
export const notInPacket = [
  'Power capacity, megawatts, or any ComEd service terms',
  'Property tax, abatement or incentive terms',
  'Water volumes or the cooling method',
  'Noise limits or backup generator terms',
  'Deeds or closing documents',
  'T5-signed counterparts of the Third Amendment, the Phase 2 SUP Agreement and the Fifth Amendment',
  'A signed Exhibit D consent for Ordinance 2024-0-38',
  'The dollar amount due under the Transportation IGA',
  'The contents of several exhibits that appear only as blank cover pages, at packet pages 29, 30, 38, 109, 110, 160, 218 and 222',
]

/**
 * Questions put to the Village.
 *
 * `status` is the label on the chip and `tone` picks its hue: 'unasked',
 * 'asked' or 'answered'. The tone is stored rather than derived from the
 * label so the wording can change ("Asked Oct 3, no reply yet") without the
 * colour silently falling back to grey.
 */
export const openQuestionsForVillage = [
  {
    id: 'signed-counterparts',
    question:
      'Does the Village hold T5-executed counterparts of the Third Amendment, the Phase 2 SUP Agreement and the Fifth Amendment?',
    status: 'Not yet asked',
    tone: 'unasked',
    asked: null,
  },
  {
    id: 'exhibit-d-consent',
    question: 'Did T5 file the Exhibit D unconditional agreement and consent for Ordinance 2024-0-38, and on what date?',
    status: 'Not yet asked',
    tone: 'unasked',
    asked: null,
  },
  {
    id: 'fifth-closing',
    question:
      'Did T5 close on the Fifth Amendment property by March 31, 2026, and what payment was made under the Transportation IGA?',
    status: 'Not yet asked',
    tone: 'unasked',
    asked: null,
  },
  {
    id: 'blank-exhibits',
    question: 'Can the Village provide the exhibits that appear in this copy as blank cover pages?',
    status: 'Not yet asked',
    tone: 'unasked',
    asked: null,
  },
]

/**
 * Timeline entries drawn only from the packet. Separate from the site-wide
 * timeline, which draws on reporting as well.
 */
export const recordsTimeline = [
  { date: '1986-10-16', label: 'Heartland settlement agreement and release', text: 'The Village, Lake County and the then owners of about 2,100 acres settle litigation over the property. The agreement governs what can be built on parts of it, including 46.9 acres inside the later T5 campus.', file: 'ord-2024-0-38', packet_page: 130, file_page: 72 },
  { date: '2005-04-05', label: 'Intergovernmental agreement on the Central Range', text: 'The Village and Lake County agree on procedures for the Central Range area of the Heartland property. The County provides sanitary sewer service there, limited to non-residential uses.', file: 'ord-2024-0-38', packet_page: 130, file_page: 72 },
  { date: '2024-09-09', label: 'Hearing notice published', text: 'Notice of the Plan Commission hearing on the T5 campus plan is published in the Daily Herald.', file: 'ord-2024-0-37', packet_page: 3, file_page: 3 },
  { date: '2024-09-23', label: 'Plan Commission hearing opens', text: 'The Grayslake Plan Commission commences its public hearing on the Phase 2 special use permit application.', file: 'ord-2024-0-38', packet_page: 60, file_page: 2 },
  { date: '2024-11-19', label: 'Board passes 2024-0-37 and 2024-0-38', text: 'Four trustees vote aye on both, none votes nay, and trustees Magnetta and Sahu are absent. The Village signs the Third Amendment the same day.', file: 'ord-2024-0-37', packet_page: 5, file_page: 5 },
  { date: '2024-12-27', label: 'Hearing notice published', text: 'Notice of the hearings that lead to Ordinances 2025-0-05 and 2025-0-06 is published in the Daily Herald.', file: 'ord-2025-0-05', packet_page: 142, file_page: 3 },
  { date: '2025-02-18', label: 'Board passes 2025-0-05 and 2025-0-06', text: 'Six trustees vote aye on both, none votes nay and none is absent. The Village signs both amendments the same day.', file: 'ord-2025-0-05', packet_page: 145, file_page: 6 },
  { date: '2025-03-27', label: 'Hearing notice published', text: 'Notice of the hearing that leads to Ordinance 2025-0-21 is published in the Daily Herald.', file: 'ord-2025-0-21', packet_page: 187, file_page: 4 },
  { date: '2025-04-24', label: 'Lake County zoning verification letter', text: 'Lake County Planning, Building and Development writes to the Village confirming that the proposed data center use on the Heartland portion meets the Heartland agreement and the 1986 county zoning ordinance.', file: 'ord-2025-0-21', packet_page: 216, file_page: 33 },
  { date: '2025-05-06', label: 'Board passes 2025-0-21', text: 'Five trustees vote aye, none votes nay and none is absent. Mayor Elizabeth Davies signs the Fifth Amendment for the Village the same day.', file: 'ord-2025-0-21', packet_page: 190, file_page: 7 },
  { date: '2025-05-12', label: 'T5 signs two amendments', text: 'Two authorized officers of T5@CHICAGO IV LP sign the Fourth Amendment and the First Amendment through DocuSign.', file: 'ord-2025-0-05', packet_page: 156, file_page: 17 },
  { date: '2026-03-31', label: 'Closing deadline in the Fifth Amendment', text: 'The Fifth Amendment states that the developer closing on the purchase of the 184-acre property, and the Transportation IGA payment made at that closing, shall occur no later than this date.', file: 'ord-2025-0-21', packet_page: 199, file_page: 16 },
]
