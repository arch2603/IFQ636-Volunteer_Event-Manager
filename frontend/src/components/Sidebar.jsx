import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/events', label: 'My Events', roles: ['organiser'] },
  { to: '/create-event', label: 'Create Event', roles: ['organiser'] },
  { to: '/browse-events', label: 'Events', roles: ['volunteer'] }
]

const Sidebar = () => {
  const { user } = useAuth()
  const linksVisible = links.filter(link => link.roles.includes(user?.role))

  return (
    <nav className='flex flex-col bg-gray-800 text-white w-48 shrink-0 p-4 '>
      <div className='mt-6 flex flex-col items-center gap-12'>
        {linksVisible.map(({ to, label }) => (
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
}

export default Sidebar
