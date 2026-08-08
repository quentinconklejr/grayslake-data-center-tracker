export default function MapLegend() {
  const ITEMS = [
    { label: 'Recorded T5 Parcel (GIS)', color: 'bg-emerald-500', border: 'border-emerald-600', note: '287.82 Acres' },
    { label: 'Approved Campus Boundary', color: 'bg-sky-200/60', border: 'border-sky-500 border-dashed', note: 'Up to 472 Acres' },
    { label: 'Substation / Infrastructure', color: 'bg-amber-400', border: 'border-amber-600', note: 'ComEd Interconnect' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-white/95 rounded-lg border border-slate-200/90 text-xs font-mono my-3 shadow-sm">
      <span className="font-semibold uppercase text-slate-500 tracking-wider">Map Legend:</span>
      {ITEMS.map(({ label, color, border, note }) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`w-3.5 h-3.5 rounded ${color} border ${border} shrink-0`} />
          <span className="font-medium text-slate-800">{label}</span>
          <span className="text-slate-500">({note})</span>
        </div>
      ))}
    </div>
  )
}
