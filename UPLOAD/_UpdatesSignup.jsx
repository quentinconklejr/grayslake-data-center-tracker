import { useState } from 'react'
import { NEWSLETTER, SITE_CONTACT } from '../../data/siteConfig'

/**
 * Email updates signup.
 *
 * Replaces EnterpriseLeadBanner, which was removed because it took an address,
 * threw it away, and told the visitor "Subscription request received." On a
 * site whose whole claim is that what it says is true, a form that lies about
 * what it did is worse than no form.
 *
 * Two rules this one follows:
 *
 * 1. IT NEVER CLAIMS SOMETHING HAPPENED THAT DID NOT. Success is only shown
 *    after a request actually succeeded. A failure says so and offers the
 *    fallback. If no delivery endpoint is configured, there is no text input
 *    at all - it renders a mailto link, which genuinely works with zero setup.
 *
 * 2. IT ONLY PROMISES WHAT ONE PERSON CAN DELIVER. The old copy promised
 *    automatic alerts "whenever new Lake County GIS parcel deeds, Village Board
 *    meeting transcripts, or court filings are posted", which would require
 *    monitoring three systems. This says what is actually true: an occasional
 *    email, sent by hand, when something on the record changes.
 *
 * TO TURN ON THE INLINE FORM
 * -------------------------
 * Create a free form at formspree.io, then put its id in siteConfig.js:
 *
 *     export const NEWSLETTER = { formspreeId: 'xyzabcde' }
 *
 * Until then the mailto fallback is what visitors get, and it works.
 */
export default function UpdatesSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const endpoint = NEWSLETTER?.formspreeId
    ? `https://formspree.io/f/${NEWSLETTER.formspreeId}`
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) { setError('That does not look like an email address.'); setState('error'); return }
    setState('sending'); setError('')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'grayslakedatacentertracker.org' }),
      })
      if (res.ok) { setState('done') }
      else {
        const body = await res.json().catch(() => null)
        setError(body?.errors?.[0]?.message || 'The signup service rejected that. Try emailing me instead.')
        setState('error')
      }
    } catch {
      setError('Could not reach the signup service. Try emailing me instead.')
      setState('error')
    }
  }

  const mailto =
    `mailto:${SITE_CONTACT.email}` +
    `?subject=${encodeURIComponent('Subscribe to tracker updates')}` +
    `&body=${encodeURIComponent('Please add me to the list for updates on the Grayslake data center tracker.')}`

  return (
    <section className="border border-slate-300 rounded-xl bg-slate-50 overflow-hidden my-8">
      <div className="px-5 sm:px-6 py-5">
        <p className="text-2xs font-mono font-bold uppercase tracking-widest text-sky-800 mb-1">
          Stay on the record
        </p>
        <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug">
          Get an email when something changes
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed mt-1.5 max-w-2xl">
          New filings, new documents, corrections to figures already published. Sent by hand when
          there is something worth sending, which is not often. No other use, no sharing, and one
          line in reply gets you off it.
        </p>

        {/* Real form only when there is somewhere for it to go. */}
        {endpoint && state !== 'done' && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5 max-w-lg">
            <label htmlFor="updates-email" className="sr-only">Email address</label>
            <input
              id="updates-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-sky-800 text-white text-sm font-semibold hover:bg-sky-900 disabled:opacity-60 transition-colors shrink-0"
            >
              {state === 'sending' ? 'Sending…' : 'Subscribe'}
            </button>
          </form>
        )}

        {/* No endpoint configured: a link that actually does something. */}
        {!endpoint && (
          <div className="mt-4">
            <a
              href={mailto}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-sky-800 text-white text-sm font-semibold hover:bg-sky-900 transition-colors"
            >
              Email me to be added
              <span aria-hidden="true">&rarr;</span>
            </a>
            <p className="text-xs text-slate-600 mt-2">
              Opens your mail app. I add addresses by hand, so there is no list living in a service
              somewhere.
            </p>
          </div>
        )}

        {state === 'done' && (
          <p
            role="status"
            className="mt-4 text-sm text-emerald-900 bg-emerald-50 border border-emerald-300 rounded-lg px-3.5 py-2.5"
          >
            Sent. <strong className="font-semibold">{email}</strong> is on the list. Reply to any
            email to come off it.
          </p>
        )}

        {state === 'error' && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-900 bg-red-50 border border-red-300 rounded-lg px-3.5 py-2.5"
          >
            {error}{' '}
            <a href={mailto} className="underline underline-offset-2 font-medium">
              Email me instead
            </a>
            .
          </p>
        )}
      </div>
    </section>
  )
}
