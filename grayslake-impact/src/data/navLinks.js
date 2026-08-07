// Home is not a nav item: the logo links home, which is universal convention
// and buys back a slot for free.
//
// The remaining seven are not peers, and rendering them as seven identical
// links is what made the bar feel long. They are grouped instead: the reading
// path first, then the reference tools, then About. Still flat, still one link
// per destination, no dropdowns — those previously created two paths to
// /questions and had to be removed.
export const NAV_LINKS = [
  { to: '/project',   label: 'The Project', end: false, group: 'story' },
  { to: '/timeline',  label: 'Timeline',    end: false, group: 'story' },
  { to: '/questions', label: 'Questions',   end: false, group: 'story' },

  { to: '/map',       label: 'Map',         end: false, group: 'tools' },
  { to: '/figures',   label: 'Key Figures', end: false, group: 'tools' },
  { to: '/documents', label: 'Documents',   end: false, group: 'tools' },

  { to: '/about',     label: 'About',       end: false, group: 'meta' },
]

export const NAV_STORY = NAV_LINKS.filter(l => l.group === 'story')
export const NAV_TOOLS = NAV_LINKS.filter(l => l.group === 'tools')
export const NAV_META  = NAV_LINKS.filter(l => l.group === 'meta')
