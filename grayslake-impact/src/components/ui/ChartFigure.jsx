/**
 * Accessible wrapper for the bar charts.
 *
 * These charts are div/CSS bars, not SVG, and the headline numbers are already
 * rendered as real text — so the bars themselves are a second, visual encoding
 * of values that are stated nearby. That makes the bars decoration: they get
 * aria-hidden at the call site, and this wrapper supplies the accessible name
 * plus a table carrying every value the chart encodes.
 *
 * The table is sr-only rather than visible because most of these numbers do
 * appear in the surrounding copy; it exists so nothing is reachable only by
 * looking at a bar. Where a proportion or split is encoded solely by bar
 * width, the table is the only place it exists as text.
 */
export default function ChartFigure({ caption, description, rows, children }) {
  const id = `chart-${caption.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <figure role="group" aria-labelledby={`${id}-cap`} aria-describedby={rows ? `${id}-tbl` : undefined}>
      <figcaption id={`${id}-cap`} className="sr-only">
        {caption}
        {description ? `. ${description}` : ''}
      </figcaption>

      {children}

      {rows && (
        <table id={`${id}-tbl`} className="sr-only">
          <caption>Underlying values for: {caption}</caption>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  )
}
