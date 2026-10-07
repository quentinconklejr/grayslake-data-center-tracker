/**
 * The date of the most recent correction: the latest `date` among the
 * kind: 'corrected' lines in src/data/updates.js (ISO strings compare in
 * date order). Computed, so a page that shows it can never go stale.
 * Returns null when no correction has been logged.
 */
export function lastCorrectedDate(updates) {
  let latest = null
  for (const u of updates ?? []) {
    if (u?.kind !== 'corrected' || !/^\d{4}-\d{2}-\d{2}$/.test(u.date ?? '')) continue
    if (latest === null || u.date > latest) latest = u.date
  }
  return latest
}
