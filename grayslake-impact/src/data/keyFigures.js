import { projections } from './projections'
import { sources } from './sources'

const { project, jobs } = projections

/**
 * Canonical figures, defined once.
 *
 * Every repeated statistic on this site used to be retyped per page — the
 * 1,680 jobs caveat alone appeared in five places, which meant five edits per
 * correction and five chances to miss one. That is how the site drifted out of
 * date in the first place. Anything appearing on more than one page belongs
 * here.
 *
 *   id        stable key for referencing a figure from a page
 *   label     short name
 *   value     the headline string, already formatted
 *   qualifier REQUIRED where the number is conditional. Rendered adjacent to
 *             the value, never separated from it, so the figure cannot travel
 *             without its condition.
 *   detail    fuller explanation for reference contexts
 *   sourceKey primary citation; sourceKeys for multi-sourced figures
 */
export const keyFigures = [
  {
    id: 'acres-owned',
    label: 'Land recorded to T5',
    value: '287.8 acres',
    qualifier: '57 parcels, four non-contiguous groups',
    detail:
      'Deeds recorded to T5 entities in Grayslake, totalling $62,968,250 in recorded consideration through May 2025.',
    sourceKey: 'lakecountygis',
  },
  {
    id: 'acres-approved',
    label: 'Approved for development',
    value: `up to ${project.totalAcres} acres`,
    qualifier: 'maximum permitted, not a commitment',
    detail:
      'Village approvals permit development on up to 472 acres with no more than 10,100,000 sq ft of building, described as “several individual buildings” without a count.',
    sourceKey: 'villagefaq_archived',
  },
  {
    id: 'acres-controlled',
    label: 'Controlled developable land',
    value: 'more than 490 acres',
    qualifier: 'controlled, which is not the same as owned',
    detail:
      'Land T5 says it controls on either side of Peterson Road. Control can include options and contracts that are not recorded transfers.',
    sourceKey: 'dailyherald_oct2025',
  },
  {
    id: 'buildable-area',
    label: 'Total buildable area',
    value: '10,100,000 sq ft',
    qualifier: 'ceiling the approvals allow',
    detail: 'No more than 10,100,000 sq ft of data center space across the approved campus.',
    sourceKey: 'villagefaq_archived',
  },
  {
    id: 'buildings',
    label: 'Buildings',
    value: `${project.approvedBuildings} approved`,
    qualifier: `CEO cited up to ${project.maxBuildings} as an upper estimate`,
    detail:
      'The Village FAQ says “several individual buildings” and gives no count. The count of 18 comes from Daily Herald reporting; Pete Marin cited up to 20.',
    sourceKeys: ['dailyherald2026', 'govtech2025'],
  },
  {
    id: 'jobs-permanent',
    label: 'Permanent jobs',
    value: `1,500 – ${jobs.permanent.toLocaleString()}`,
    qualifier: 'upper figure only if all 10M sq ft is built',
    detail:
      'Mayor Davies cited 1,500 (Oct. 2025). CEO Marin cited “over 1,600” (Jul. 2026). The Village FAQ reaches 1,680 by estimating 50 jobs per 300,000 sq ft, hedges that estimate as subject to change, and excludes construction jobs.',
    sourceKeys: ['villagefaq_archived', 'govtech2025', 'dailyherald_jul2026'],
  },
  {
    id: 'capacity-comed',
    label: 'ComEd capacity secured',
    value: `${project.comEdCapacityGW} GW`,
    qualifier: `of which ${project.totalCapacityMW.toLocaleString()} MW is leasable IT capacity`,
    detail:
      'Total utility capacity secured from ComEd, per T5 CEO Pete Marin. The campus includes a ComEd-built substation. CLCJAWA separately records 1.6 GW available to Phase I.',
    sourceKey: 'govtech2025',
  },
  {
    id: 'investment',
    label: 'Estimated investment',
    value: `$${project.costLow}–${project.costHigh}B`,
    qualifier: 'Mayor Davies said $8.5B; T5 chief executive Pete Marin said up to $18B',
    detail: 'Two figures from two people, not a range anyone calculated. Grayslake Mayor Elizabeth Davies gave the lower number and T5 chief executive Pete Marin the higher one. No independent valuation has been published.',
    sourceKey: 'govtech2025',
  },
  {
    id: 'water',
    label: 'Water use at full buildout',
    value: '< 50,000 gal/day',
    qualifier: '4.0% of Village supply, or 0.25% of the CLCJAWA system',
    detail:
      'Same volume, two denominators. The Village FAQ scales it against Grayslake’s supply; CLCJAWA against its 14-member regional system. Both are accurate.',
    sourceKeys: ['villagefaq_archived', 'clcjawa2026'],
  },
  {
    id: 'water-flush',
    label: 'Commissioning flush',
    value: '~3.2M gal',
    qualifier: 'one-time, for one 200 MW building, staged over days',
    detail: 'Initial flush and fill of the closed-loop cooling system, per CLCJAWA.',
    sourceKey: 'clcjawa2026',
  },
  {
    id: 'buildout',
    label: 'Full buildout',
    value: '2029 at the earliest',
    qualifier: 'Daily Herald reported 7–10 years from Oct. 2025',
    detail:
      'Two horizons published three days apart: the Tribune reported buildout "could come as early as 2029"; the Daily Herald reported it "expected over the next seven to 10 years". The Village FAQ gives no date.',
    sourceKeys: ['govtech2025', 'dailyherald_oct2025'],
  },
  {
    id: 'wetlands',
    label: 'Wetland permit',
    value: 'Suspended indefinitely',
    qualifier: 'project itself not on hold',
    detail:
      'T5 voluntarily suspended its ~15.75-acre Section 404 application on July 31, 2026. The Village said it had advocated for withdrawal and that the mitigation was not necessary for the project to proceed.',
    sourceKey: 'dailyherald_jul2026',
  },
]

export const figureById = Object.fromEntries(keyFigures.map(f => [f.id, f]))

/** Look up figures by id, in the order requested. */
export const pick = (...ids) => ids.map(id => figureById[id]).filter(Boolean)

/**
 * The exact string a copy-to-clipboard button puts on the clipboard.
 *
 * Defined here rather than per page because this text travels further from its
 * context than anything else on the site — pasted into a story, an email, a
 * slide. It must carry the value, the qualifier and the citation together, and
 * it must preserve authored casing: proper nouns like ComEd, T5 and Peterson Rd
 * are not stylistic, and lowercasing them makes the paste look wrong.
 */
export function figureCopyText(id) {
  const f = figureById[id]
  if (!f) return ''
  const key = f.sourceKey ?? f.sourceKeys?.[0]
  const s = sources[key]
  const citation = s ? ` (${[s.publisher, s.date].filter(Boolean).join(', ')})` : ''
  return `${f.label}: ${f.value} — ${f.qualifier}${citation}`
}
