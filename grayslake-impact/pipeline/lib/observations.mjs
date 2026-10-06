/**
 * This site's own dated observations, for example "As of August 5, 2026,
 * this site could not reach the FAQ page on the Village website."
 *
 * The guard checks every date against the cited sources, and an observation
 * the site made itself has no source. Such a date passes only when its
 * sentence says it is this site's own observation: it opens with "As of
 * <date>," followed by "this site" and what the site did or found ("could
 * not reach", "found", "checked" ...). Anything else, including the same
 * date said as a plain fact ("The FAQ became unreachable by August 5,
 * 2026"), still fails.
 *
 * Used by the timeline audit of the owner's entries only. Drafted text never
 * gets this: the pipeline cannot make observations on the site's behalf.
 */
import { sentences } from './guard.mjs'

const MONTH = '(January|February|March|April|May|June|July|August|September|October|November|December)'
const OBSERVATION = new RegExp(`^As of (${MONTH} \\d{1,2}, \\d{4}), this site (could not|could|was unable to|was able to|found|checked|observed|confirmed|did not|saw|recorded)\\b`, 'i')

/** The dated site observations in a text: [{ date, sentence }]. */
export function siteObservations(text) {
  return sentences(text).map(s => ({ s, m: OBSERVATION.exec(s.trim()) })).filter(x => x.m).map(x => ({ date: x.m[1], sentence: x.s.trim() }))
}

/** Clears date failures that are this site's own labeled observations. */
export function applySiteObservations(prose, failures) {
  const obs = siteObservations(prose)
  const accepted = []
  const remaining = failures.filter(f => {
    if (f.check !== 'date') return true
    const o = obs.find(x => x.date.toLowerCase() === String(f.value).toLowerCase())
    if (!o) return true
    accepted.push({ date: o.date, sentence: o.sentence })
    return false
  })
  return { failures: remaining, accepted }
}
