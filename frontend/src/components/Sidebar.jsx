import { NavLink } from 'react-router-dom'

const links = [
  { to: '/events', label: 'My Events' },
  { to: '/create-event', label: 'Create Event' }
]

const Sidebar = () => (
  <nav className='flex flex-col bg-gray-800 text-white w-48 shrink-0 p-4 '>
    <div className='mt-6 flex flex-col items-center gap-12'>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `block w-36 bg-blue-600 py-3 text-sm text-white text-center font-semibold py-4 hover:bg-blue-700 ${
              isActive ? 'ring-2 ring-white ' : ''
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  </nav>
)

export default Sidebar
