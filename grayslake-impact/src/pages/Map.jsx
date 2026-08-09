import { useState, useMemo } from 'react'
import { PARCELS_DATA } from '../../data/parcels'
import SourceCitation from '../ui/SourceCitation'

export default function SiteMap({ className = '' }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('acres')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort parcels live
  const filteredParcels = useMemo(() => {
    return PARCELS_DATA.filter(p => {
      const q = search.toLowerCase().trim()
      if (!q) return true
      return (
        p.pin.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q) ||
        p.salePrice.toLowerCase().includes(q)
      )
    }).sort((a, b) => {
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
  }, [search, sortField, sortOrder])

  function handleExportCSV() {
    const headers = ['PIN', 'Acres', 'Recorded Sale Price', 'Recorded Date']
    const rows = filteredParcels.map(p => [
      `"${p.pin}"`,
      p.acres,
      `"${p.salePrice}"`,
      `"${p.date}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Grayslake_T5_Parcels.csv'
    a.click()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <iframe
          title="T5 Grayslake GIS Parcel Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2953.284201389803!2d-88.0645!3d42.3485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDIwJzU0LjYiTiA4OMKwMDMnNTIuMiJX!5e0!3m2!1sen!2sus!4v1700000000000"
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
        />
      </div>

      {/* Single Searchable Parcel Directory */}
      <div className="newsroom-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                GIS TAX DIRECTORY
              </span>
              <SourceCitation sourceKey="gisParcels2026" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">
              57 Recorded Parcels ({filteredParcels.length} Showing)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-300 transition-colors shrink-0"
          >
            <svg className="w-4 h-4 text-slate-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 10v3.5a1 1 0 001 1h9a1 1 0 001-1V10M8 1.5v8.5M4.5 7L8 10.5 11.5 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Live Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search parcels by PIN, sale price, or date..."
            className="w-full text-sm font-sans px-4 py-2.5 rounded-lg border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-mono uppercase text-slate-500 bg-slate-50">
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
              {filteredParcels.map(p => (
                <tr key={p.pin} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{p.pin}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{p.acres}</td>
                  <td className="py-2.5 px-3 text-slate-700">{p.salePrice}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
