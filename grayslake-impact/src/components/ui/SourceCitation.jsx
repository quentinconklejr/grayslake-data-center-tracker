import { sources } from '../../data/sources'
import { useFootnoteNumber } from './FootnoteContext'

export default function SourceCitation({ sourceKey }) {
  const num = useFootnoteNumber(sourceKey)
  const source = sources[sourceKey]

  if (!source) return null

  return (
    <sup style={{ fontSize: '0.6em', verticalAlign: 'super', lineHeight: 0 }}>
      <a
        href={`#fn-${num}`}
        className="text-blue-400/70 hover:text-blue-600 transition-colors"
        title={source.title}
      >
        [{num}]
      </a>
    </sup>
  )
}
