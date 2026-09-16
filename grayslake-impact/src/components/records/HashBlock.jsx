/*
 * A checksum, presented as something to be used rather than read.
 *
 * `select-all` is the point: a 64-character hash is checked by copying it and
 * comparing, and a triple-click that grabs the whole string in one go is the
 * difference between that being a two-second job and a fiddly drag. The tinted
 * ground and the label mark it as machine data rather than prose.
 */
export default function HashBlock({ label, value, note }) {
  return (
    <div className="bg-paper-sunk border border-rule p-3 max-w-2xl">
      <p className="text-2xs font-mono uppercase tracking-wide text-ink-500 mb-1.5">{label}</p>
      <code className="block text-2xs font-mono text-ink-800 break-all select-all leading-relaxed">
        {value}
      </code>
      {note && <p className="mt-2 text-2xs font-sans text-ink-600 leading-snug">{note}</p>}
    </div>
  )
}
