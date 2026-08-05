// Five destinations. The previous thirteen (ten nav plus three audience
// guides) forced a first-time visitor to guess whether Questions, Timeline and
// Actions were three things or one. Energy, Jobs, Tax and Schools are now
// sections of /project; Actions is merged into /timeline; the audience guides
// are entry points on the homepage rather than peers of the topic pages.
export const NAV_LINKS = [
  { to: '/project',   label: 'The Project', end: false },
  { to: '/timeline',  label: 'Timeline',    end: false },
  { to: '/questions', label: 'Questions',   end: false },
  { to: '/documents', label: 'Documents',   end: false },
  { to: '/map',       label: 'Map',         end: false },
  { to: '/about',     label: 'About',       end: false },
]

export const GUIDE_LINKS = [
  { to: '/residents', label: 'Residents' },
  { to: '/reporters', label: 'Reporters' },
]
