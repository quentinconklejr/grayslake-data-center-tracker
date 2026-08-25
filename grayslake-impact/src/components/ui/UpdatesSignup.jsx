import { useState } from 'react'
import { NEWSLETTER, SITE_CONTACT } from '../../data/siteConfig'

/**
 * Email updates signup.
 *
 * Replaces EnterpriseLeadBanner, which took an address, discarded it, and told
 * the visitor "Subscription request received."
 *
 * The rule here is narrow and absolute: the success message is set in exactly
 * one place in this file, inside a check on the server's response. Everything
 * else - a missing key, a rejected address, a network failure - says what went
 * wrong and offers a way through. There is no code path that reports success
 * without one.
 *
 * Beyond that it behaves like any normal signup: type an address, press a
 * button, done. No mail client, no copying an address by hand.
 *
 * SETUP - about two minutes, needed once
 * --------------------------------------
 * Web3Forms is the quickest because it does not make you create an account.
 *
 *   1. Go to web3forms.com
 *   2. Type the email address where you want submissions delivered
 *   3. They email you an access key
 *   4. Paste it into siteConfig.js:
 *
 *        export const NEWSLETTER = { web3formsKey: 'the-key-they-emailed' }
 *
 * Formspree works too if you would rather use it - create a form, take the id
 * out of the endpoint URL, and set `formspreeId` instead.
 *
 * Until one of those is set the form still renders, because a visitor should
 * see the same thing either way, but submitting says the signup is not
 * connected yet rather than pretending it worked.
 */
export default function UpdatesSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const key = NEWSLETTER?.web3formsKey
  const formspree = NEWSLETTER?.formspreeId
  const configured = Boolean(key || formspree)

  const mailto =
    `mailto:${SITE_CONTACT.email}` +
    `?subject=${encodeURIComponent('Subscribe to tracker updates')}` +
    `&body=${encodeURIComponent('Please add me to the list for updates on the Grayslake data center tracker.')}`

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.includes('@') || email.length < 5) {
      setError('That does not look like an email address.')
      setState('error')
      return
    }

    if (!configured) {
      setError('The signup is not connected yet, so nothing was stored.')
      setState('error')
      return
    }

    setState('sending')
    setError('')

    try {
      let res
      if (key) {
        res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key,
            subject: 'New tracker subscriber',
            from_name: 'Grayslake Data Center Tracker',
            email,
            message: `${email} asked to be added to the updates list.`,
          }),
        })
        const body = await res.json().catch(() => null)
        // Web3Forms returns 200 with success:false on a bad key, so the body
        // has to be checked, not just the status.
        if (res.ok && body?.success) { setState('done'); return }
        setError(body?.message || 'The signup service rejected that.')
        setState('error')
        return
      }

      res = await fetch(`https://formspree.io/f/${formspree}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'grayslakedatacentertracker.org' }),
      })
      if (res.ok) { setState('done'); return }
      const body = await res.json().catch(() => null)
      setError(body?.errors?.[0]?.message || 'The signup service rejected that.')
      setState('error')
    } catch {
      setError('Could not reach the signup service.')
      setState('error')
    }
  }

  return (
    <section aria-label="Email updates" className="border-t border-rule pt-8 my-8">
      <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">
        Stay on the record
      </p>
      <h2 className="text-2xl font-display text-ink-900 tracking-tight leading-snug">
        Get an email when something changes
      </h2>
      <p className="text-base font-sans text-ink-700 leading-relaxed mt-2 max-w-2xl">
        {/* Was "Sent when there is something worth sending, which is not
            often." Litotes - saying "not often" instead of "rarely" - and
            the one place on the site doing it. It reads as arch rather than
            plain, which is the wrong register for the only box on the page
            asking a stranger for their email address. "Some months there is
            nothing to send" says the same thing as a fact about the record
            rather than a wry aside about the newsletter, and it promises a
            frequency that can actually be kept. */}
        New filings, new documents, corrections to figures already published. Some months there is
        nothing to send. Your address is used for this and nothing else, and one line in reply
        takes you off the list.
      </p>

      {state === 'done' ? (
        <p
          role="status"
          className="mt-5 text-sm font-sans text-status-stated border-l-[3px] border-status-stated bg-status-stated-soft px-4 py-3"
        >
          You&rsquo;re on the list. <strong className="font-semibold">{email}</strong> will get
          updates when the record changes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-lg">
          <label htmlFor="updates-email" className="sr-only">Email address</label>
          <input
            id="updates-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            placeholder="you@example.com"
            className="flex-1 min-h-[44px] px-3 py-2.5 border-b border-rule bg-transparent text-base sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="min-h-[44px] px-6 py-2.5 bg-accent text-paper-raised text-sm font-sans font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors shrink-0"
          >
            {state === 'sending' ? 'Adding…' : 'Subscribe'}
          </button>
        </form>
      )}

      {state === 'error' && (
        <p
          role="alert"
          className="mt-3 text-sm font-sans text-status-legal border-l-[3px] border-status-legal bg-status-legal-soft px-4 py-3"
        >
          {error}{' '}
          <a href={mailto} className="underline underline-offset-4 font-semibold">
            Email me and I&rsquo;ll add you
          </a>
          .
        </p>
      )}

      <p className="text-xs font-sans text-ink-500 mt-3">
        No tracking, no sharing, no other mail. See{' '}
        <a href="/privacy" className="underline underline-offset-4 decoration-rule hover:decoration-accent hover:text-ink-700">
          Privacy
        </a>
        .
      </p>
    </section>
  )
}
