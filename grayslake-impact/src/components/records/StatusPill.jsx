/*
 * Status chip for an open records request.
 *
 * Replaces a line of grey mono text reading "Status: Not yet asked", which
 * carried real information in the same weight as a caption and got skipped.
 *
 * Same chip the timeline uses for its category badges: square corners, a
 * status hue for text and border, the soft tint behind it. The status hues
 * are the site's classification palette and are used here the way they are
 * used everywhere else, as a rubber stamp rather than an alert.
 *
 * Colour is not the only cue. The label says the state in words, so the chip
 * works in greyscale and for anyone who cannot separate the hues.
 */
const TONE = {
  unasked:  'text-status-unknown  bg-status-unknown-soft  border-status-unknown',
  asked:    'text-status-approval bg-status-approval-soft border-status-approval',
  answered: 'text-status-stated   bg-status-stated-soft   border-status-stated',
}

export default function StatusPill({ tone = 'unasked', children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap px-2 py-0.5 border text-2xs font-sans font-semibold uppercase tracking-wide ${
        TONE[tone] ?? TONE.unasked
      }`}
    >
      {children}
    </span>
  )
}
