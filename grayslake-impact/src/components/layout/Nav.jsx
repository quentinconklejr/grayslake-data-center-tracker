import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',           label: 'Home',       end: true },
  { to: '/about',      label: 'About',      end: false },
  { to: '/tax-impact', label: 'Tax',        end: false },
  { to: '/jobs',       label: 'Jobs',       end: false },
  { to: '/energy',     label: 'Energy',     end: false },
  { to: '/schools',    label: 'Schools',    end: false },
  { to: '/timeline',   label: 'Timeline',   end: false },
  { to: '/questions',  label: 'Questions',  end: false },
  { to: '/map',        label: 'Map',        end: false },
  { to: '/sources',    label: 'Sources',    end: false },
]

export default function Nav() {
  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto">
      {LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded text-xs font-medium tracking-wide transition-all duration-150 whitespace-nowrap ${
              isActive
                ? 'text-blue-400 bg-blue-500/10 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.2)]'
                : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/60'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
