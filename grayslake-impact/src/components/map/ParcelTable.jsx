import { useState, useMemo } from 'react'
import parcelsGeoJSON from '../../data/parcels.geojson'

/*
 * Recorded parcel directory — presented as a public-records table, not a
 * dashboard panel. Card wrapper, shadow, and rounded corners are gone;
 * the table sits directly on the page ground with hairlines above and
 * below.
 *
 * Source attribution has been pulled into the composition rather than
 * relegated to the map legend. Where a parcel came from and when it was
 * retrieved is a credibility statement, not chrome; the county source
 * line reads like the top of a county assessor's printed export.
 *
 * Functional behaviour is untouched — filter, sort, Show All, Export
 * CSV all preserved. Only the chrome around them has been retyped.
 */
export default function ParcelTable({ parcels }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('acres')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isExpanded, setIsExpanded] = useState(false)

  const META = parcelsGeoJSON?.metadata ?? {}

  const filteredParcels = useMemo(() => {
    return (parcels || [])
      .filter(p => {
        const query = search.toLowerCase().trim()
        if (!query) return true
        return (
          p.pin?.toLowerCase().includes(query) ||
          p.date?.toLowerCase().includes(query) ||
          p.salePrice?.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        let valA = a[sortField]
        let valB = b[sortField]
        if (sortField === 'acres') {
          valA = parseFloat(valA) || 0
          valB = parseFloat(valB) || 0
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
  }, [parcels, search, sortField, sortOrder])

  const totalAcres = useMemo(() => {
    return filteredParcels.reduce((acc, p) => acc + (parseFloat(p.acres) || 0), 0).toFixed(2)
  }, [filteredParcels])

  const displayedParcels = (isExpanded || search.trim().length > 0)
    ? filteredParcels
    : filteredParcels.slice(0, 10)

  function handleExportCSV() {
    const headers = ['PIN', 'Acres', 'Recorded Sale Price', 'Recorded Date']
    const rows = filteredParcels.map(p => [
      `"${p.pin}"`,
      p.acres,
      `"${p.salePrice || '—'}"`,
      `"${p.date || '—'}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Grayslake_T5_Parcels_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section aria-label="Recorded parcel directory" className="border-t border-rule pt-6">
      {/* ── Table header ─────────────────────────────────────────────
          Records-style caption: name, filtered totals, retrieval date. */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-display text-ink-900 tracking-tight">
            Recorded Parcel Directory
          </h3>
          <p className="mt-1 text-sm font-sans text-ink-600">
            {filteredParcels.length} parcels &middot; <span className="font-mono text-ink-700">{totalAcres}</span> acres filtered
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]"
          >
            Export CSV
          </button>
          {filteredParcels.length > 10 && !search.trim() && (
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="text-sm font-sans text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent min-h-[44px]"
            >
              {isExpanded ? 'Collapse directory' : `Show all ${filteredParcels.length} parcels`}
            </button>
          )}
        </div>
      </div>

      {/* ── Search / filter ───────────────────────────────────────────
          Quiet single-line input with a bottom rule that becomes the
          accent when focused. No pill, no fill, no leading icon. */}
      <div className="relative pb-4">
        <label htmlFor="parcel-filter" className="sr-only">Filter parcels</label>
        <input
          id="parcel-filter"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by PIN, sale price, or date"
          className="w-full text-sm font-sans px-0 py-2 pr-8 bg-transparent border-0 border-b border-rule-strong text-ink-900 placeholder:text-ink-500 focus:outline-none focus:border-accent focus:ring-0"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear filter"
            className="absolute right-0 top-1/2 -translate-y-[calc(50%+8px)] text-ink-500 hover:text-ink-800 font-mono text-base leading-none min-h-[44px] min-w-[44px]"
          >
            ×
          </button>
        )}
      </div>

      {/* Records table — hairline rules, tabular numerals, PIN as the
          row header, paper-sunk on zebra rows. */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-max text-left border-collapse text-sm font-mono">
          <caption className="sr-only">
            Recorded parcels showing PIN, acres, recorded sale price, and recorded sale date.
          </caption>
          <thead>
            <tr className="border-y border-rule text-ink-700 text-xs font-sans font-semibold uppercase tracking-wide">
              <th scope="col" className="py-2.5 px-4 sm:px-3 text-left">PIN</th>
              <th
                scope="col"
                className="py-2.5 px-4 sm:px-3 cursor-pointer hover:text-ink-900 text-right"
                onClick={() => {
                  setSortField('acres')
                  setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                }}
              >
                Acres <span aria-hidden="true">{sortField === 'acres' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
              </th>
              <th scope="col" className="py-2.5 px-4 sm:px-3 text-right">Recorded sale price</th>
              <th scope="col" className="py-2.5 px-4 sm:px-3 text-left">Sale date</th>
            </tr>
          </thead>
          {/* Zebra tint (bg-paper-sunk/50) removed — carried a Tailwind
              alpha utility on a structural boundary. Rows now separate
              by a divide-y hairline in rule-strong, matching the
              parsing-work convention used elsewhere on the site. */}
          <tbody className="divide-y divide-rule-strong">
            {displayedParcels.length > 0 ? (
              displayedParcels.map(p => (
                <tr key={p.pin}>
                  <th scope="row" className="py-2 px-4 sm:px-3 font-mono font-semibold text-ink-900 text-left">
                    {p.pin}
                  </th>
                  <td className="py-2 px-4 sm:px-3 text-ink-700 text-right tabular-nums">{p.acres}</td>
                  <td className={`py-2 px-4 sm:px-3 text-ink-700 tabular-nums ${p.salePrice ? 'text-right' : 'text-center'}`}>
                    {p.salePrice || '—'}
                  </td>
                  <td className={`py-2 px-4 sm:px-3 text-ink-700 ${p.date ? 'text-left' : 'text-center'}`}>
                    {p.date || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-ink-500 font-sans">
                  No matching parcels found for &ldquo;{search}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Source attribution ────────────────────────────────────────
          Deliberately given more weight than in the old design. This is
          the credibility line — reads like the footer of a county
          records printout. The ArcGIS query lives on its own row in a
          horizontally scrollable mono block: a reporter can reproduce
          the parcel list from it, and at 375px it must not wrap
          mid-token, so whitespace-pre + overflow-x-auto rather than
          letting it break across lines in the middle of an identifier
          or a quoted string. */}
      {META.source && (
        <div className="mt-5 pt-4 border-t border-rule-soft text-sm font-sans text-ink-600 leading-relaxed">
          <p>
            <span className="font-semibold text-ink-800">Source: </span>
            {META.sourceUrl ? (
              <a href={META.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent">
                {META.source}
              </a>
            ) : (
              META.source
            )}
            {META.retrieved && (
              <>. Retrieved <span className="font-mono">{META.retrieved}</span>.</>
            )}
          </p>
          {META.query && (
            <div className="mt-2">
              <p className="text-2xs font-sans font-semibold uppercase tracking-wide text-ink-600">
                Reproducing query
              </p>
              <pre className="mt-1 font-mono text-xs text-ink-700 overflow-x-auto whitespace-pre max-w-full leading-relaxed">
                <code>{META.query}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
