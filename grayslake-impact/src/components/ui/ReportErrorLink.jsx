import { useLocation } from 'react-router-dom'

const TO = 'walterjr.quentin@gmail.com'
const SITE = 'https://grayslakedatacentertracker.org'

/**
 * "Report an error on this page" as a pre-filled email.
 *
 * Deliberately not a hosted form. A form needs a backend, a spam filter and
 * something that can quietly stop delivering; a broken correction form on a
 * site whose whole pitch is "tell me if a figure is wrong" is worse than none.
 * The mailto carries the page URL and a short template, so the report arrives
 * with the context needed to act on it.
 */
export default function ReportErrorLink({ className = '', label = 'Report an error' }) {
  const { pathname } = useLocation()
  const url = `${SITE}${pathname}`
  const subject = `Correction: ${pathname}`
  const body = [
    `Page: ${url}`,
    '',
    'What looks wrong:',
    '',
    '',
    'What it should say, if you know:',
    '',
    '',
    'Source or document that shows it (a link is ideal):',
    '',
    '',
  ].join('\n')

  return (
    <a
      href={`mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
      className={className}
    >
      {label}
    </a>
  )
}
