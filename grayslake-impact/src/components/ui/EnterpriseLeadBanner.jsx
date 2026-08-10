import { useState } from 'react'

export default function EnterpriseLeadBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubmitted(true)
  }

  return (
    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-4 my-8">
      <div>
        <div className="text-2xs font-mono font-bold uppercase tracking-wider text-sky-800 mb-1">
          RESEARCH & FILING ALERTS
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Subscribe to Public Record & Deed Updates
        </h3>
        <p className="text-xs font-sans text-slate-600 leading-relaxed max-w-2xl mt-1">
          Receive email updates whenever new Lake County GIS parcel deeds, Village Board meeting transcripts, or court filings are posted. No spam, unsubscribe at any time.
        </p>
      </div>

      {submitted ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-lg">
          ✓ Subscription request received for <strong className="font-bold">{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            required
            className="text-xs font-sans px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-sky-600 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none flex-1"
          />
          <button
            type="submit"
            className="text-xs font-mono font-semibold text-white bg-sky-800 hover:bg-sky-900 px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            Subscribe to Updates
          </button>
        </form>
      )}
    </div>
  )
}
