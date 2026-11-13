import { useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MessageBox from '../components/MessageBox'
import { formatDate } from '../utils/formatDate'


const BrowseEvents = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    if (!user) return // If user not an organiser or volunteer, do not fetch events
    setLoading(true)
    setError(null)
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/events', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setEvents(response.data.events ?? [])
      } catch (err) {
        setError('Failed to fetch events.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  if (!user)
    return (
      <p role='alert' className='p-6'>
        Please log in to view your events.
      </p>
    ) // If user is not logged in

  const renderContent = () => {
    if (loading) return <MessageBox>Loading your events...</MessageBox>
    if (error) return <MessageBox role='alert'>{error}</MessageBox>
    if (events.length === 0)
      return (
        <MessageBox>
          No events available yet
        </MessageBox>
      )
    return (
      <div className='bg-white p-4 min-h-[18rem]'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr>
                {[
                  'Event Title',
                  'Date',
                  'Location',
                  'Available Places',
                  'View Details'
                ].map(heading => (
                  <th key={heading} scope='col' className='p-2'>
                    <span className='block bg-gray-100 px-3 py-2 font-semibold'>
                      {heading}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td className='p-2 font-semibold'>{event.title}</td>
                  <td className='p-2 font-semibold text-center'>
                    {formatDate(event.date)} <br /> {event.startTime} - {event.finishTime}
                  </td>
                  <td className='p-2 font-semibold text-center'>
                    {event.location}
                  </td>
                  <td className='p-2 font-semibold text-center'>
                    {event.availablePlaces === 0 ? '0 (Full)' : event.availablePlaces}
                  </td>
                  <td className='p-2 text-center'>
                    <Link
                      to={`/event-details/${event._id}`}
                      className='inline-block bg-blue-600 text-white text-xs px-3 py-2 hover:bg-blue-700'
                      aria-label={`View details for ${event.title}`}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  return (
    <div className='mx-auto flex max-w-7xl gap-8 p-8'>
      <Sidebar />
      <main className='min-w-0 flex-1'>
        {/* Grey panel — thinner padding, like the mockup */}
        <section className='bg-gray-200 p-2'>
          {/* Heading in its own white bar, centred */}
          <h2 className='mb-6 bg-white py-3 text-center text-xl font-bold'>
            Events
          </h2>
          {renderContent()}
        </section>
      </main>
    </div>
  )
}

export default BrowseEvents
