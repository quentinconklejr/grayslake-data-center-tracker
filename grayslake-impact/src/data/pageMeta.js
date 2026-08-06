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
  '/about': {
    title: 'About',
    description:
      'Who builds the Grayslake Data Center Tracker, how figures get verified, and how to send a correction.',
    ogImage: '/og/about.png',
  },
  '/reporters': {
    title: 'For Reporters',
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
}
