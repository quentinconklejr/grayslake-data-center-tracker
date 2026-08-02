export default function SourceArtifact({ publisher, date, pageRef, url, excerpts = [], annotation }) {
  return (
    <div className="border border-gray-300 rounded-sm bg-white overflow-hidden text-left shadow-sm">
      {/* Document header bar */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-mono text-gray-500 uppercase tracking-widest leading-none mb-0.5">
            {publisher}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {date && <span className="text-xs text-gray-500">{date}</span>}
            {pageRef && (
              <span className="text-2xs font-mono bg-white border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded-sm">
                {pageRef}
              </span>
            )}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-2xs font-mono text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-0.5 mt-0.5"
          >
            View ↗
          </a>
        )}
      </div>

      {/* Excerpts */}
      <div className="px-4 py-3 space-y-2.5 bg-[#fafaf8]">
        {excerpts.map((text, i) => (
          <blockquote
            key={i}
            className="text-xs leading-relaxed text-gray-700 pl-3 border-l-2 border-gray-300 italic"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            &ldquo;{text}&rdquo;
          </blockquote>
        ))}
        {annotation && (
          <p className="text-2xs font-mono text-gray-400 pt-1 border-t border-gray-200">{annotation}</p>
        )}
      </div>
    </div>
  )
}
