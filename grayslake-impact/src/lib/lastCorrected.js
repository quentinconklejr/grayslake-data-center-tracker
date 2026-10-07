/**
 * Dates computed from the Updates log (src/data/updates.js), so no page has
 * to carry a hand-typed date that can go stale.
 *
 *   lastUpdateDate(updates)     newest dated line of any kind (site-wide
 *                               "Last updated": footer, page headers, sitemap)
 *   lastCorrectedDate(updates)  newest kind: 'corrected' line (Methodology)
 *
 * Both return an ISO date (YYYY-MM-DD; ISO strings compare in date order),
 * or null when there is no matching line.
 */
function latestDate(updates, kind) {
  let latest = null
  for (const u of updates ?? []) {
    if (kind && u?.kind !== kind) continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(u?.date ?? '')) continue
    if (latest === null || u.date > latest) latest = u.date
  }
  return latest
}

export function lastUpdateDate(updates) {
  return latestDate(updates, null)
}

export function lastCorrectedDate(updates) {
  return latestDate(updates, 'corrected')
}

/** "2026-10-06" → "October 6, 2026" (the same in every time zone). */
export function formatLongDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
