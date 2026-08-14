import { useState, useMemo } from 'react'

export default function ParcelTable({ parcels }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('acres')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isExpanded, setIsExpanded] = useState(false)

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
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            GIS Tax Record
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Recorded Parcel Directory ({filteredParcels.length} Parcels)
          </h3>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Total Filtered Area: <span className="text-slate-800 font-semibold">{totalAcres} Acres</span>
          </p>
        </div>

        {/* Single Right-Aligned Action Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors min-h-[44px]"
          >
            Export CSV
          </button>
          {filteredParcels.length > 10 && !search.trim() && (
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-lg border border-sky-200 transition-colors min-h-[44px]"
            >
              {isExpanded ? 'Collapse Directory ▲' : `Show All ${filteredParcels.length} Parcels ▼`}
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by PIN, sale price, or date..."
          className="w-full text-sm font-sans px-4 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ×
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-3">PIN</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                onClick={() => {
                  setSortField('acres')
                  setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                }}
              >
                Acres {sortField === 'acres' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2.5 px-3">Recorded Sale Price</th>
              <th className="py-2.5 px-3">Sale Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {displayedParcels.length > 0 ? (
              displayedParcels.map(p => (
                <tr key={p.pin} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{p.pin}</td>
                  <td className="py-2.5 px-3">{p.acres}</td>
                  <td className="py-2.5 px-3">{p.salePrice || '—'}</td>
                  <td className="py-2.5 px-3">{p.date || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No matching parcels found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
