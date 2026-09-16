// Single source of truth for per-route title / description / OG image.
//
// Consumed twice:
//   1. At runtime by PageTitle, so in-app navigation updates the tab title.
//   2. At BUILD time by scripts/build-route-html.js, which writes a static
//      HTML shell per route with these values baked into the head.
//
// (2) is the one that matters for sharing: social crawlers do not execute
// JavaScript, so meta set by PageTitle alone is invisible to them. Keep this
// file as the only place these strings live — if they drift, previews lie.
export const SITE_ORIGIN = 'https://grayslakedatacentertracker.org'

export const pageMeta = {
  '/': {
    description:
      'Tracking the T5 @ Chicago IV data center in Grayslake, Illinois. Jobs, taxes, energy, water and the pending litigation, with a source behind every figure.',
    ogImage: '/og/home.png',
  },
  '/agreement': {
    title: 'What the Village Agreed To',
    description:
      'The development agreement between Grayslake and T5: what officials have stated about it, four competing revenue claims, what has never been published, and how to request the document under Illinois FOIA.',
    ogImage: '/og/project.png',
  },
  '/project': {
    title: 'The Project',
    description:
      'What the approvals permit and what has been built. Energy, jobs, tax and school funding for the T5 @ Chicago IV campus, each figure carrying the condition attached to it.',
    ogImage: '/og/project.png',
  },
  '/tax-impact': {
    title: 'Tax Impact',
    description:
      'Developer fees, property tax projections and the Illinois incentive suspension, for the T5 @ Chicago IV data center in Grayslake.',
    ogImage: '/og/tax-impact.png',
  },
  '/jobs': {
    title: 'Job Creation',
    description:
      'The T5 @ Chicago IV campus is projected to create 1,500 to 1,680 permanent jobs. The upper figure holds only if all 10 million sq ft is built.',
    ogImage: '/og/jobs.png',
  },
  '/energy': {
    title: 'Energy Draw',
    description:
      'T5 says it secured 1.55 GW from ComEd, of which 1,200 MW is leasable IT capacity. What that means for Illinois rates, and what is still not publicly filed.',
    ogImage: '/og/energy.png',
  },
  '/schools': {
    title: 'School Funding',
    description:
      'Eight taxing districts cover the T5 campus and four of them sit outside Grayslake. What the DeKalb precedent does and does not tell us about school funding here.',
    ogImage: '/og/schools.png',
  },
  '/timeline': {
    title: 'Timeline',
    description:
      'A dated record of the T5 @ Chicago IV project: village approvals, construction, legal challenges and state policy changes, each one sourced.',
    ogImage: '/og/timeline.png',
  },
  '/questions': {
    title: 'Open Questions',
    description:
      'What is settled, what is disputed, and what has no public answer yet. Water, electricity, campus scale, jobs, taxes and the approval process.',
    ogImage: '/og/questions.png',
  },
  '/map': {
    title: 'Site Map',
    description:
      'Land recorded to T5 in Grayslake: 57 parcels totalling 287.8 acres, mapped from Lake County GIS. The approved campus is larger and is not mapped.',
    ogImage: '/og/map.png',
  },
  '/documents': {
    title: 'Sources',
    description:
      'Every document and source behind the tracker, including the archived Village FAQ, Lake County parcel data and press coverage.',
    ogImage: '/og/sources.png',
  },
  '/accessibility': {
    title: 'Accessibility',
    description:
      'How this site handles accessibility: what meets WCAG 2.1 AA, where it falls short, and how to report a barrier.',
    ogImage: '/og/accessibility.png',
  },
  '/privacy': {
    title: 'Privacy',
    description:
      'What the Grayslake Data Center Tracker collects: no cookies, no accounts, no advertising, and cookieless visit counts.',
    ogImage: '/og/privacy.png',
  },
  '/about': {
    title: 'About',
    description:
      'Who builds the Grayslake Data Center Tracker, how figures get verified, and how to send a correction.',
    ogImage: '/og/about.png',
  },
  '/figures': {
    title: 'Key Figures',
    description:
      'Key figures with citations, contacts and source documents for reporters covering T5 @ Chicago IV in Grayslake, Illinois.',
    ogImage: '/og/reporters.png',
  },
  '/actions': {
    title: 'Jurisdictional Actions',
    description:
      'Permit applications, legal challenges and policy actions on T5 @ Chicago IV, filterable by jurisdiction across village, county, state and federal bodies.',
    ogImage: '/og/actions.png',
  },
  '/records': {
    title: 'Public Records',
    description:
      'Government records obtained by the Grayslake Data Center Tracker and published in full, with every figure linked to the page of the document it came from.',
    ogImage: '/og/records.png',
  },
  '/records/t5': {
    title: 'T5 Grayslake data center ordinances and site plans',
    description:
      'The five Village of Grayslake ordinances approving the T5 @ Chicago IV campus: about 473.5 acres, up to 10,160,000 sq ft of building floor area, passed between Nov 19, 2024 and May 6, 2025, with the signed agreements and site plans.',
    ogImage: '/og/records-t5.png',
  },
  '/records/t5/ord-2024-0-37': {
    title: 'Ordinance 2024-0-37, Third Amendment to the Cornerstone SUP Agreement',
    description:
      'Grayslake Ordinance 2024-0-37, passed Nov 19, 2024: about 135 acres north of Medline, a 2,570,000 sq ft floor area cap, and the development standards for the T5 campus plan.',
    ogImage: '/og/records-t5.png',
  },
  '/records/t5/ord-2024-0-38': {
    title: 'Ordinance 2024-0-38, T5 Phase 2 special use permit',
    description:
      'Grayslake Ordinance 2024-0-38, passed Nov 19, 2024: a special use permit for about 90 acres west of Route 83 on Peterson Road, with a 1,590,000 sq ft floor area cap later replaced.',
    ogImage: '/og/records-t5.png',
  },
  '/records/t5/ord-2025-0-05': {
    title: 'Ordinance 2025-0-05, Fourth Amendment to the Cornerstone SUP Agreement',
    description:
      'Grayslake Ordinance 2025-0-05, passed Feb 18, 2025: about 31.5 acres east of Cornerstone Parkway and a 1,060,000 sq ft floor area cap, signed by T5 on May 12, 2025.',
    ogImage: '/og/records-t5.png',
  },
  '/records/t5/ord-2025-0-06': {
    title: 'Ordinance 2025-0-06, First Amendment to the Phase 2 SUP Agreement',
    description:
      'Grayslake Ordinance 2025-0-06, passed Feb 18, 2025: about 33 acres added to the Phase 2 PUD and a combined floor area cap of 2,120,000 sq ft replacing the earlier 1,590,000.',
    ogImage: '/og/records-t5.png',
  },
  '/records/t5/ord-2025-0-21': {
    title: 'Ordinance 2025-0-21, Fifth Amendment to the Cornerstone SUP Agreement',
    description:
      'Grayslake Ordinance 2025-0-21, passed May 6, 2025: about 184 acres at Route 83 and Peterson Road, a 4,410,000 sq ft floor area cap, and a March 31, 2026 closing deadline.',
    ogImage: '/og/records-t5.png',
  },
  '/press': {
    title: 'For reporters',
    description:
      'A short briefing on the T5 @ Chicago IV public records for newsrooms: the key numbers with page citations, download links, a suggested citation and a contact.',
    ogImage: '/og/records-t5.png',
  },
  '/updates': {
    title: 'Updates',
    description:
      'A dated log of what has been added to or corrected on the Grayslake Data Center Tracker.',
    ogImage: '/og/home.png',
  },
}
