import { NavLink } from 'react-router-dom'

const links = [
  { to: '/events', label: 'My events' },
  { to: '/create-event', label: 'Create event' }
]

const Sidebar = () => (
  <nav className='flex flex-col bg-gray-800 text-white w-64 min-h-screen p-4 '>
    <div className='relative top-12 flex flex-col gap-16'>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `block bg-blue-600 text-white text-center font-semibold py-4 hover:bg-blue-700 ${
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
