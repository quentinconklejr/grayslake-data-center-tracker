import { sources } from '../../data/sources'
import { useFootnoteNumber } from './FootnoteContext'

export default function SourceCitation({ sourceKey }) {
  const num = useFootnoteNumber(sourceKey)
  const source = sources[sourceKey]

  if (!source) return null

  return (
    <sup>
      <a
        href={`#fn-${num}`}
        className="font-mono text-blue-600 hover:text-blue-800 transition-colors"
        title={source.title}
      >
        [{num}]
      </a>
    </sup>
  )
}
