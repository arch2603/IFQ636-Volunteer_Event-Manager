import { useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const formatDate = isoDate =>
  new Date(isoDate).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Brisbane'
  })
const MessageBox = ({ children, role }) => (
  <div
    role={role}
    className='flex min-h-[18rem] items-center justify-center border-2 border-sky-500  bg-gray-100 p-6 text-center'
  >
    <p className='text-2xl font-semibold leading-snug text-slate-700'>
      {children}
    </p>
  </div>
)

const MyEvents = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.role !== 'organiser') return // If user not an organiser, do not fetch events
    setLoading(true)
    setError(null)
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/events/mine', {
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
  if (user.role !== 'organiser')
    return (
      <p role='alert' className='p-6'>
        Only organisers can view My Events.
      </p>
    ) // If not an organiser is logged in, do not fetch events

  const renderContent = () => {
    if (loading) return <MessageBox>Loading your events...</MessageBox>
    if (error) return <MessageBox role='alert'>{error}</MessageBox>
    if (events.length === 0)
      return (
        <MessageBox>
          No events yet. <br />
          Create your first event.
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
                  'View Registrations'
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
                    {formatDate(event.date)}
                  </td>
                  <td className='p-2 font-semibold text-center'>
                    {event.location}
                  </td>
                  <td className='p-2 font-semibold text-center'>
                    {event.availablePlaces ?? event.maxVolunteers}
                  </td>
                  <td className='p-2 text-center'>
                    <Link
                      to={`/events/${event._id}/registrations`}
                      className='inline-block bg-blue-600 text-white text-xs px-3 py-2 hover:bg-blue-700'
                      aria-label={`View registrations for ${event.title}`}
                    >
                      View Registrations
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
            My Events
          </h2>
          {renderContent()}
        </section>
      </main>
    </div>
  )
}

export default MyEvents
