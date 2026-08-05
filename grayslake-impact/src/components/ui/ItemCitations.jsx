import SourceCitation from './SourceCitation'
import UnverifiedTag from './UnverifiedTag'
import { keysOf } from '../../lib/citationKeys'

// Renders every citation attached to an evidence item, supporting both the
// single `sourceKey` and the multi-source `sourceKeys` shapes, plus an
// `unverified` flag for claims whose only source is no longer reachable.
// Reading only `sourceKey` silently dropped citations from multi-sourced items.
export default function ItemCitations({ item }) {
  return (
    <>
      {keysOf(item).map(k => <SourceCitation key={k} sourceKey={k} />)}
      {item?.unverified && <UnverifiedTag />}
    </>
  )
}
