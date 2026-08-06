// All destinations shown flat — no dropdowns. The previous desktop nav hid
// Residents (/questions) and Reporters under a "Guides" dropdown, which
// also created a duplicate path to /questions (once as "Questions", once as
// "Guides → Residents"). Reporters is now a top-level link; the duplicate
// Residents→/questions entry is removed; the desktop and mobile navs match.
export const NAV_LINKS = [
  { to: '/',           label: 'Home',        end: true  },
  { to: '/project',   label: 'The Project', end: false },
  { to: '/timeline',  label: 'Timeline',    end: false },
  { to: '/questions', label: 'Questions',   end: false },
  { to: '/documents', label: 'Documents',   end: false },
  { to: '/map',       label: 'Map',         end: false },
  { to: '/figures',   label: 'Key Figures', end: false },
  { to: '/about',     label: 'About',       end: false },
]
