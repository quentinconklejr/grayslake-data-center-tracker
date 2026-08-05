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
      'A civic data dashboard tracking the T5 @ Chicago IV hyperscale AI data center development in Grayslake, Illinois — jobs, taxes, energy, water, and legal challenges, all sourced.',
    ogImage: '/og/home.png',
  },
  '/project': {
    title: 'The Project',
    description:
      'Energy, employment, tax and school-funding figures for the T5 @ Chicago IV data center campus in Grayslake, Illinois — each with its source and the condition attached to it.',
    ogImage: '/og/project.png',
  },
  '/tax-impact': {
    title: 'Tax Impact',
    description:
      'Sourced data on developer fees, property tax projections, and Illinois incentive changes for the T5 @ Chicago IV data center in Grayslake.',
    ogImage: '/og/tax-impact.png',
  },
  '/jobs': {
    title: 'Job Creation',
    description:
      'Employment projections for the T5 @ Chicago IV campus in Grayslake — 1,500 to 1,680 permanent positions, the upper figure conditional on full 10.1M sq ft build-out, plus construction-phase workforce estimates.',
    ogImage: '/og/jobs.png',
  },
  '/energy': {
    title: 'Energy Draw',
    description:
      'Energy capacity and utility rate analysis for T5 @ Chicago IV: 1.55 GW secured from ComEd, 1,200 MW of it leasable IT capacity, and Illinois rate structure context.',
    ogImage: '/og/energy.png',
  },
  '/schools': {
    title: 'School Funding',
    description:
      'School district funding analysis for T5 @ Chicago IV in Grayslake, using the Meta/DeKalb precedent — the closest comparable Illinois data center on file.',
    ogImage: '/og/schools.png',
  },
  '/timeline': {
    title: 'Timeline',
    description:
      'Sourced chronological record of T5 @ Chicago IV — village approvals, construction milestones, community response, legal challenges, and state policy changes.',
    ogImage: '/og/timeline.png',
  },
  '/questions': {
    title: 'Open Questions',
    description:
      'Unresolved disputes and data gaps around T5 @ Chicago IV: water sourcing, energy rate impacts, campus scale, tax projections, and approval process adequacy.',
    ogImage: '/og/questions.png',
  },
  '/map': {
    title: 'Site Map',
    description:
      'Interactive site map showing the 472-acre T5 @ Chicago IV campus location at Peterson Road and Route 83 in Grayslake, Illinois.',
    ogImage: '/og/map.png',
  },
  '/documents': {
    title: 'Sources',
    description:
      'Full citation list for the T5 @ Chicago IV tracker — primary sources, press coverage, and official documents behind every claim on this site.',
    ogImage: '/og/sources.png',
  },
  '/about': {
    title: 'About',
    description:
      'About the Grayslake Data Center Tracker — an independent, resident-built resource collecting public records on T5 @ Chicago IV.',
    ogImage: '/og/about.png',
  },
  '/residents': {
    title: 'For Residents',
    description:
      'Plain-language summary of what T5 @ Chicago IV means for Grayslake residents — water, electric bills, campus scale, jobs, taxes, and the approval process.',
    ogImage: '/og/residents.png',
  },
  '/reporters': {
    title: 'For Reporters',
    description:
      'Key figures, citations, and press contact reference for T5 @ Chicago IV — among the largest developments in Lake County history.',
    ogImage: '/og/reporters.png',
  },
  '/officials': {
    title: 'For Officials',
    description:
      'Approvals, legal challenges, and policy actions related to T5 @ Chicago IV — a sourced record for municipal, county, and state officials.',
    ogImage: '/og/officials.png',
  },
  '/actions': {
    title: 'Jurisdictional Actions',
    description:
      'Cross-jurisdictional action tracker for T5 @ Chicago IV — filterable record of permit applications, legal challenges, resolutions, and policy changes across Village, County, State, and Federal bodies.',
    ogImage: '/og/actions.png',
  },
}
