import { Link } from 'react-router-dom'
import Container from '../layout/Container'

/**
 * End-of-page hand-off. Sized to be seen but not to shout — a text link
 * with a small rule above it, not a bordered card. The `prominent`
 * variant gives it more vertical air on pages where it is the main
 * exit ramp.
 */
export default function PageNext({
  to,
  label,
  desc,
  color = 'text-accent',
  prominent = false,
  // hoverBorder kept in the API surface so existing callers don't break;
  // the new visual treatment doesn't consume it.
  hoverBorder: _hoverBorder,
}) {
  return (
    <Container size="wide" className={prominent ? 'mt-20 mb-16' : 'mt-16 mb-8'}>
      <p className="text-xs font-display italic text-ink-500 tracking-wide mb-4 flex items-center gap-3">
        <span aria-hidden="true" className="inline-block w-8 h-px bg-rule" />
        Up next
      </p>
      <Link
        to={to}
        className={`group block border-t border-ink-900 pt-5 sm:pt-6 hover:bg-paper-sunk transition-colors ${
          prominent ? 'py-6 sm:py-8' : ''
        }`}
      >
        <p className={`text-xs font-sans font-semibold uppercase tracking-wide mb-2 ${color}`}>{label}</p>
        <p
          className={`font-display text-ink-900 leading-tight tracking-tight mb-2 ${
            prominent ? 'text-3xl sm:text-4xl' : 'text-2xl'
          }`}
        >
          {label === 'The Project' ? 'See what the approvals actually permit' : label}
        </p>
        <p className={`font-sans text-ink-700 leading-snug ${prominent ? 'text-base max-w-2xl' : 'text-sm'}`}>
          {desc}
          <span aria-hidden="true" className={`inline-block ml-2 ${color} group-hover:translate-x-1 transition-transform`}>→</span>
        </p>
      </Link>
    </Container>
  )
}
