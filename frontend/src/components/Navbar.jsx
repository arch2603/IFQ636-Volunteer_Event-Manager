import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className='bg-gray-800 text-white text-center py-5'>
      <Link to='/' className='text-2xl font-bold'>
        Your apps name
      </Link>
      <div>
        {user?.role === 'organiser' && (
        <Link
          to='/create-event'
          className='bg-blue-500 px-4 py-2 rounded hover:bg-blue-700 mr-4'
        >
          Create Event
        </Link>
        )}

        {user?.role === 'volunteer' && (
          <Link
            to='/tasks'
            className='bg-blue-500 px-4 py-2 rounded hover:bg-blue-700 mr-4'
          >
            My Tasks
          </Link>
        )}
        {user ? (
          <>
            <Link to='/profile' className='mr-4'>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className='bg-red-500 px-4 py-2 rounded hover:bg-red-700'
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to='/login' className='mr-4'>
              Login
            </Link>
            <Link
              to='/register'
              className='bg-green-500 px-4 py-2 rounded hover:bg-green-700'
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
