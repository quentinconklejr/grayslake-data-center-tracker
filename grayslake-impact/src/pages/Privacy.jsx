import PageTitle from '../components/ui/PageTitle'
import Container from '../components/layout/Container'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

/**
 * Privacy page.
 *
 * The claims below describe what actually leaves the reader's browser.
 * A false claim on this page is worse than none: it's disclosure, not
 * marketing, and readers rely on it to decide whether to visit. Every
 * bullet in the "Other services that load in the page" section should
 * be re-verified against index.html and the running app whenever a
 * third-party dependency is added, removed, or changed. Previous drifts
 * that this file has had to correct include a mis-named map library, a
 * mailing-list contradiction, and a font-hosting misstatement.
 *
 * The contact address is imported from siteConfig rather than hardcoded
 * so it cannot drift out of sync with the About page.
 */

const CONTACT = SITE_CONTACT.email

function Section({ title, children }) {
  return (
    <FadeIn className="border-t border-rule pt-8 pb-2">
      <h2 className="text-2xl font-display text-ink-900 tracking-tight mb-4">{title}</h2>
      <div className="space-y-4 text-base font-sans text-ink-700 leading-relaxed">{children}</div>
    </FadeIn>
  )
}

export default function Privacy() {
  return (
    <Container size="prose" className="py-12 sm:py-16">
      <PageTitle {...pageMeta['/privacy']} />

      <FadeIn className="mb-12 pb-8 border-b border-rule">
        <p className="text-xs font-display italic text-ink-500 tracking-wide mb-2">Privacy</p>
        <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight leading-[1.05] break-words mb-4">
          What this site collects
        </h1>
        <p className="text-lg font-sans text-ink-700 leading-relaxed">
          Almost nothing. No cookies, no accounts, no advertising, nothing sold to anyone. Unless you
          type your email into the signup box, I have no idea who you are and no way to find out.
        </p>
        <p className="text-2xs font-mono text-ink-500 mt-4">Last reviewed {LAST_VERIFIED}</p>
      </FadeIn>

      <Section title="If you sign up for updates">
        <p>
          The signup on the front page is optional and every page works identically without it. If
          you use it, I keep your email address and nothing else. No name, no location, no record of
          which pages you read, because none of that is collected in the first place.
        </p>
        <p>
          It is used to send occasional updates about this project and for nothing else. It is not
          sold, not shared, and not used to advertise anything. Reply to any email and you come off
          the list.
        </p>
        <p>
          Submissions are delivered through <strong>Web3Forms</strong>, which passes the address to
          my inbox and holds a copy on their servers for thirty days before deleting it. They see the
          address and nothing else about you. If the service is ever unreachable the form says so
          rather than quietly dropping what you typed.
        </p>
      </Section>

      <Section title="Visitor numbers">
        <p>
          I use Plausible to count visits. It records the page you landed on, the country you
          arrived from, roughly what device you used, and the site that referred you if there was
          one. It does not set cookies, does not store an IP address, and cannot follow you to
          other sites. There is no profile of you anywhere, because there is nothing to build one
          from.
        </p>
        <p>
          I look at this to see whether anyone is reading, and which pages reporters and residents
          actually open. That is the whole use.
        </p>
      </Section>

      <Section title="Other services that load in the page">
        <p>
          <strong>The map.</strong> The map is built with Leaflet, an open-source library that runs
          in your browser. Its satellite imagery, plain basemap, and street labels all come from
          Esri, so opening the map or the front page requests image tiles from Esri. Their terms
          apply to those requests rather than mine. The parcel data itself is a file served from
          this site, not a live call to the county.
        </p>
        <p>
          <strong>Hosting.</strong> The site is hosted on Vercel, which keeps standard server logs
          the way any web host does.
        </p>
        <p>
          <strong>Outbound links.</strong> Sources link out to the Village of Grayslake, Lake County,
          the Internet Archive, the courts and various news sites. Once you follow a link you are on
          their terms rather than this page.
        </p>
      </Section>

      <Section title="If you email me">
        <p>
          Corrections and questions arrive in my inbox and stay there. Emailing me does not add you
          to the updates list; if you want to be on it, use the signup box or say so and I will add
          you by hand.
        </p>
        <p>
          If you send a correction and I publish a fix, the fix goes up without your name unless you
          ask me to credit you.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If what the site collects ever changes, this page changes with it and the review date at
          the top moves. Questions about any of it can go to{' '}
          <a
            href={`mailto:${CONTACT}?subject=${encodeURIComponent('Privacy question about grayslakedatacentertracker.org')}`}
            className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent font-semibold"
          >
            {CONTACT}
          </a>.
        </p>
      </Section>

      <BackToTop />
    </Container>
  )
}
