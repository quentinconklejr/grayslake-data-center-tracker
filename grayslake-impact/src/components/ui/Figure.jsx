import SourceCitation from './SourceCitation'
import { figureById } from '../../data/keyFigures'

/**
 * Inline rendering of one canonical figure. Value and qualifier are emitted
 * together by construction, so a figure cannot end up on a page without the
 * condition attached to it — which is how 1,680 jobs, 1.55 GW and 472 acres
 * each came to be misstated here in the first place.
 *
 *   <Figure id="jobs-permanent" />              value + qualifier + citation
 *   <Figure id="jobs-permanent" qualifier={false} />   value + citation only,
 *       for contexts where the qualifier is already stated in adjacent prose
 */
export default function Figure({ id, qualifier = true, className = '' }) {
  const f = figureById[id]
  if (!f) return null
  const keys = [f.sourceKey, ...(f.sourceKeys ?? [])].filter(Boolean)
  return (
    <span className={className}>
      <strong className="font-semibold">{f.value}</strong>
      {qualifier && <span className="font-normal text-gray-600"> ({f.qualifier})</span>}
      {keys.map(k => <SourceCitation key={k} sourceKey={k} />)}
    </span>
  )
}
