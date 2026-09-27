// Home is not a nav item: the logo links home, which is universal convention
// and buys back a slot for free.
//
// Two tiers. The primary five are the reading path plus the two reference
// destinations people search for by name (the map and the documents). The
// secondary three are reference pages set lighter beside them. Still flat,
// still one link per destination, no dropdowns: a dropdown previously
// created two paths to /questions and had to be removed.
//
// Records is not its own item. /documents is the hub for every source,
// including the FOIA records, and `also` keeps Documents marked active
// while the reader is inside /records.
export const NAV_LINKS = [
  { to: '/project',   label: 'The Project', end: false, group: 'primary' },
  { to: '/agreement', label: 'The Deal',    end: false, group: 'primary' },
  { to: '/timeline',  label: 'Timeline',    end: false, group: 'primary' },
  { to: '/map',       label: 'Map',         end: false, group: 'primary' },
  { to: '/documents', label: 'Documents',   end: false, group: 'primary', also: ['/records'] },

  { to: '/questions', label: 'Questions',   end: false, group: 'secondary' },
  { to: '/figures',   label: 'Key Figures', end: false, group: 'secondary' },
  { to: '/about',     label: 'About',       end: false, group: 'secondary' },
]

export const NAV_PRIMARY   = NAV_LINKS.filter(l => l.group === 'primary')
export const NAV_SECONDARY = NAV_LINKS.filter(l => l.group === 'secondary')
