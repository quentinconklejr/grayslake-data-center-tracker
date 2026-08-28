/**
 * Content-width primitive.
 *
 * Three sizes match the three kinds of content the site actually holds:
 *
 *   prose    ~65ch, for text-heavy pages (About, Privacy, Accessibility,
 *            Agreement) where reading comfort matters more than fitting
 *            wide data blocks
 *   default  56rem (~896px), the general-purpose measure for pages that
 *            mix prose with records tables, timelines, and key-figure
 *            lists
 *   wide     72rem (~1152px), reserved for the Home dashboard, the
 *            Project overview, and the standalone Map — anything that
 *            needs to fit the parcel table or the map surface at width
 *
 * All three carry the same horizontal padding. They are centred, so
 * switching size between pages does shift the visible left edge of the
 * text against the fixed header and footer measure; that is the tradeoff
 * for keeping each kind of content at its own comfortable width.
 */
export default function Container({
  as: Tag = 'div',
  size = 'default',
  className = '',
  children,
  ...rest
}) {
  const width =
    size === 'prose' ? 'max-w-[65ch]'
    : size === 'wide' ? 'max-w-6xl'
    : 'max-w-4xl'

  return (
    <Tag className={`${width} mx-auto px-4 sm:px-6 ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
