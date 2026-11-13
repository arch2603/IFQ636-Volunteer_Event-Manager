import { useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MessageBox from '../components/MessageBox'
import { formatTime } from '../utils/formatTime'
import { formatDate } from '../utils/formatDate'

const EventDetails = () => {
  const { user } = useAuth()
  const [event, setEvent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState(location.state?.message || '')
  const { eventid } = useParams()

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
        const response = await axiosInstance.get(`/api/events/${eventid}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setEvent(response.data.event ?? [])
      } catch (err) {
        setError('Event not found.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [eventid, user])

  if (!user)
    return (
      <p role='alert' className='p-6'>
        Please log in to view your events.
      </p>
    ) // If user is not logged in

  const renderContent = () => {
    if (loading) return <MessageBox>Loading your events...</MessageBox>
    if (error) return <MessageBox role='alert'>{error}</MessageBox>

    const details = [
      ['Title:', event.title],
      ['Date/Time:', `${formatDate(event.date)} ${event.startTime}`],
      ['Location:', event.location],
      ['Purpose:', event.purpose],
      ['Available places:', event.availablePlaces],
      [
        'Start & Finish Times:',
        `${formatTime(event.startTime)} - ${formatTime(event.finishTime)}`
      ]
    ]

    return (
      <div className='bg-white p-4 min-h-[18rem]'>
        {event.availablePlaces === 0 && (
          <p
            role='status'
            className='mb-4 bg-amber-100 p-2 text-decoration-color: var(--color-orange-300)'
          >
            This is event is full. No places available
          </p>
        )}
        <dl className='grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-[10rem_1fr] sm:gap-y-3'>
          {details.map(([label, value]) => (
            <div className='contents' key={label}>
              <dt className='font-semibold p-4'>{label}</dt>
              <dd className='bg-gray-200 p-4 text-center'>{value}</dd>
            </div>
          ))}
        </dl>
        <div className='mt-4 flex justify-end'>
          <Link
            to='/browse-events'
            className='font-semibold px-6 py-2 bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700'
          >
            Back
          </Link>
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
            Event Details
          </h2>
          {renderContent()}
        </section>
      </main>
    </div>
  )
}

export default EventDetails
