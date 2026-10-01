/**
 * Lake County Legistar web API: County Board, Zoning Board of Appeals,
 * Stormwater Management Commission and committees.
 *
 * Matters (ordinances, resolutions, zoning cases) modified since the last run
 * are items; a matter modified again is a new version of the same item, with
 * `update: true`. The county files every kind of business here, so most
 * matters are irrelevant; Stage C's keyword triage picks the ones that go
 * further, which is also when they are archived.
 *
 * The /events endpoint answered HTTP 500 to every query form on 2026-09-30
 * and 2026-10-01. It is tried each run; a failure is a warning, not an error.
 */
import { isoFromAny } from './common.mjs'

const API = 'https://webapi.legistar.com/v1/lakecounty'

function odataDate(iso) {
  return iso.replace(/\.\d+Z$|Z$/, '').slice(0, 19)
}

export function matterToCandidate(m) {
  return {
    key: `${m.MatterId}@${m.MatterLastModifiedUtc}`,
    url: `https://lakecounty.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}&GUID=${m.MatterGuid}`,
    tierUrl: `${API}/matters/${m.MatterId}`,
    title: `${m.MatterFile ?? ''} ${m.MatterName ?? m.MatterTitle ?? ''}`.trim(),
    published: isoFromAny(`${m.MatterLastModifiedUtc}Z`),
    meta: {
      matterId: m.MatterId,
      file: m.MatterFile,
      type: m.MatterTypeName,
      status: m.MatterStatusName,
      body: m.MatterBodyName,
      introDate: m.MatterIntroDate,
      agendaDate: m.MatterAgendaDate,
      passedDate: m.MatterPassedDate,
      enactmentNumber: m.MatterEnactmentNumber,
      name: m.MatterName,
      title: m.MatterTitle,
    },
  }
}

export default {
  name: 'lake-county-legistar',
  sourceUrl: `${API}/matters`,
  snapshot: 'after_triage',

  async discover(ctx) {
    const since = ctx.state.cursor?.matterModifiedSince ?? ctx.since.toISOString()
    const url = `${API}/matters?$filter=MatterLastModifiedUtc+ge+datetime'${odataDate(since)}'&$orderby=MatterLastModifiedUtc+desc`
    const res = await ctx.http(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status} for matters`)
    const matters = JSON.parse(res.bytes.toString('utf8'))
    if (!Array.isArray(matters)) throw new Error('matters response is not a list')

    const warnings = []
    const ev = await ctx.http(`${API}/events?$filter=EventDate+ge+datetime'${odataDate(since)}'`, { headers: { Accept: 'application/json' } })
    if (!ev.ok) warnings.push(`events endpoint HTTP ${ev.status}; meetings not checked this run`)

    const newest = matters.reduce((a, m) => (m.MatterLastModifiedUtc > a ? m.MatterLastModifiedUtc : a), since.replace(/Z$/, ''))
    return {
      candidates: matters.map(matterToCandidate),
      warnings,
      // Overlap a minute so a matter saved during the last query is not missed.
      cursor: { matterModifiedSince: new Date(Date.parse(`${newest.replace(/Z$/, '')}Z`) - 60_000).toISOString() },
    }
  },

  /** A second version of a known matter is an update, not a new matter. */
  isUpdate(state, cand) {
    return (state.matterIds ?? []).includes(cand.meta.matterId)
  },
  onNewItem(state, cand) {
    state.matterIds = [...new Set([...(state.matterIds ?? []), cand.meta.matterId])]
  },

  async fetchItem(ctx, cand) {
    const m = cand.meta
    const lines = [
      `${m.file ?? ''} ${m.name ?? ''}`.trim(),
      m.title,
      [m.type, m.status, m.body].filter(Boolean).join(' · '),
      m.introDate && `Introduced ${m.introDate.slice(0, 10)}`,
      m.agendaDate && `On agenda ${m.agendaDate.slice(0, 10)}`,
      m.passedDate && `Passed ${m.passedDate.slice(0, 10)}`,
      m.enactmentNumber && `Enactment ${m.enactmentNumber}`,
    ].filter(Boolean)
    return { kind: 'record', text: lines.join('\n') }
  },
}
