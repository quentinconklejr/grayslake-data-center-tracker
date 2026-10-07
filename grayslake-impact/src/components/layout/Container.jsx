/**
 * Content-width primitive.
 *
 * Three sizes match the three kinds of content the site actually holds:
 *
 *   prose    ~65ch, for text-heavy pages (About, Privacy, Accessibility,
 *            Agreement) where reading comfort matters more than fitting
 *            wide data blocks
 *   reading  44rem (~656px of text), for a single reading column set at
 *            the larger 19px body size (Methodology): about 75 characters
 *            a line
 *   default  56rem (~896px), the general-purpose measure for pages that
 *            mix prose with records tables, timelines, and key-figure
 *            lists
 *   wide     72rem (~1152px), reserved for the Home dashboard and the
 *            Project overview
 *   map      wide below xl, then 100rem so /map can set the map and the
 *            parcel table side by side on a desktop screen
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
    : size === 'reading' ? 'max-w-[44rem]'
    : size === 'wide' ? 'max-w-6xl'
    : size === 'map' ? 'max-w-6xl xl:max-w-[100rem]'
    : 'max-w-4xl'

  return (
    <Tag className={`${width} mx-auto px-4 sm:px-6 ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
