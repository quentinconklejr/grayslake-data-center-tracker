import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import BackToTop from '../components/ui/BackToTop'
import { LAST_VERIFIED, SITE_CONTACT } from '../data/siteConfig'

/**
 * Privacy page.
 *
 * Rewritten because it had drifted out of true in four ways, and a privacy
 * page that is wrong is worse than none:
 *
 *   1. It said the map is served by Mapbox. It is not. The map is Leaflet,
 *      with satellite tiles from Esri and street labels from CARTO.
 *   2. It said "I do not run a mailing list, and I will not add you to one",
 *      three paragraphs below the section describing the mailing list.
 *   3. It never mentioned Google Fonts, which every page loads, and which is
 *      the one third-party request a reader cannot avoid.
 *   4. The contact address was a personal gmail, while every other page used
 *      the university address.
 *
 * The contact address is imported rather than hardcoded so it cannot drift
 * again.
 */

const CONTACT = SITE_CONTACT.email

function Section({ title, children }) {
  return (
    <FadeIn className="border-t border-edge-soft pt-8 pb-9">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-base text-gray-700 leading-relaxed max-w-3xl">{children}</div>
    </FadeIn>
  )
}

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageTitle {...pageMeta['/privacy']} />

      <FadeIn className="mb-10 pb-8 border-b border-edge-soft">
        <p className="text-2xs font-mono text-blue-700 uppercase tracking-[0.15em] mb-4">Privacy</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 tracking-tight break-words mb-4">
          What this site collects
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
          Almost nothing. No cookies, no accounts, no advertising, nothing sold to anyone. Unless you
          type your email into the signup box, I have no idea who you are and no way to find out.
        </p>
        <p className="text-2xs font-mono text-gray-600 mt-4">Last reviewed {LAST_VERIFIED}</p>
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
          <strong>Fonts.</strong> Every page loads two typefaces from Google Fonts, which means your
          browser makes a request to Google on each visit and Google can see your IP address in doing
          so. This is the one outside request you cannot avoid by staying off a particular page.
        </p>
        <p>
          <strong>The map.</strong> The map is built with Leaflet, an open-source library that runs
          in your browser. Its satellite imagery comes from Esri and its street labels from CARTO, so
          opening the map or the front page requests image tiles from both. Their terms apply to
          those requests rather than mine. The parcel data itself is a file served from this site,
          not a live call to the county.
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
            className="text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium"
          >
            {CONTACT}
          </a>.
        </p>
      </Section>

      <BackToTop />
    </div>
  )
}
