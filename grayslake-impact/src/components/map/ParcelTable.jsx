import { useState, useMemo } from 'react'
import SourceCitation from '../ui/SourceCitation'

export default function ParcelTable({ parcels, sourceKey = 'gisParcels2026' }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('acres')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort parcels in real time
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

  // Generate downloadable CSV file
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
    <div className="newsroom-card p-6 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-edge-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              GIS TAX RECORD
            </span>
            <SourceCitation sourceKey={sourceKey} />
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900">
            Recorded Parcel Directory ({filteredParcels.length} Parcels)
          </h3>
          <p className="text-sm font-mono text-slate-600 mt-1">
            Total Filtered Area: <span className="font-bold text-slate-900">{totalAcres} Acres</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-300 transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-slate-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 10v3.5a1 1 0 001 1h9a1 1 0 001-1V10M8 1.5v8.5M4.5 7L8 10.5 11.5 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by PIN, sale price, or date..."
          className="w-full text-sm font-sans px-4 py-2.5 rounded-lg border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Parcel Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-mono uppercase text-slate-500 bg-slate-50/80">
              <th className="py-2.5 px-3 font-semibold">PIN</th>
              <th 
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900"
                onClick={() => {
                  setSortField('acres')
                  setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                }}
              >
                Acres {sortField === 'acres' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2.5 px-3 font-semibold">Recorded Sale Price</th>
              <th className="py-2.5 px-3 font-semibold">Sale Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-sans">
            {filteredParcels.length > 0 ? (
              filteredParcels.map(p => (
                <tr key={p.pin} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{p.pin}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">{p.acres}</td>
                  <td className="py-2.5 px-3 text-slate-700">{p.salePrice || '—'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{p.date || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-slate-500 font-mono">
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
