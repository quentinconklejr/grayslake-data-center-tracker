import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',           label: 'Home',       end: true },
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
                ? 'text-blue-600 bg-blue-50 shadow-[inset_0_0_0_1px_rgba(2,132,199,0.18)]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
