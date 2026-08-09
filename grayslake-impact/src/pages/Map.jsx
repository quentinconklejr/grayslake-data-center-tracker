import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import SiteMap from '../components/map/SiteMap'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { LAST_VERIFIED } from '../data/siteConfig'

function EnterpriseLeadBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubmitted(true)
  }

  return (
    <div className="newsroom-card p-6 my-6 border-l-4 border-l-sky-600 bg-gradient-to-r from-sky-50/60 to-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold uppercase text-sky-800 tracking-wider bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200">
              ENTERPRISE & RESEARCH ACCESS
            </span>
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900">
            Request PJM Grid Queue & Parcel Siting Analytics
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mt-1">
            Get automated updates on new Lake County GIS deed recordings, PJM interconnection queue filings, and Village hearing logs.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-center shrink-0 min-w-[280px]">
            <p className="text-sm font-semibold text-emerald-900">Request Submitted</p>
            <p className="text-xs text-emerald-700 mt-0.5">We will send dataset updates to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 shrink-0 min-w-[280px]">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter work email..."
              required
              className="text-sm font-sans px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="text-xs font-mono font-semibold text-white bg-sky-700 hover:bg-sky-800 px-4 py-2.5 rounded-lg transition-colors shadow-sm shrink-0"
            >
              Request Access
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function DataTransparencyFootnote() {
  return (
    <div className="newsroom-card p-5 my-8 border-t-2 border-t-slate-300 bg-slate-50/60">
      <p className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider mb-2">
        About the Data & Transparency Standards
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">
        All map geometry and ownership data originate from the Lake County GIS Tax Parcel Layer. Grid capacity and infrastructure metrics are drawn from Village of Grayslake public hearing transcripts, Central Lake County Joint Action Water Agency (CLCJAWA) presentations, and ComEd filings.
      </p>
    </div>
  )
}

export default function MapPage() {
  return (
    <FootnoteProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <PageTitle {...pageMeta['/map']} />

        <FadeIn className="mb-6 pb-6 border-b border-edge-soft">
          <p className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-[0.15em] mb-2">GIS Parcel Layer</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-3">Land Ownership Map</h1>
          <p className="text-base text-slate-700 max-w-2xl leading-relaxed">
            Interactive map displaying the 57 recorded Lake County tax parcels associated with T5 Data Centers in Grayslake, Illinois.
          </p>
          <p className="text-xs font-mono text-slate-600 mt-3 font-medium">Last verified {LAST_VERIFIED}</p>
        </FadeIn>

        <FadeIn>
          <EnterpriseLeadBanner />
        </FadeIn>

        <FadeIn className="mb-8">
          <SiteMap className="h-[520px] rounded-xl border border-slate-200 shadow-sm" />
        </FadeIn>

        <DataTransparencyFootnote />
        <FootnoteList />
      </div>
    </FootnoteProvider>
  )
}
