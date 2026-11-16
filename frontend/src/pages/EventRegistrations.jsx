import { useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'
import { useAuth } from '../context/AuthContext'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MessageBox from '../components/MessageBox'
import { formatTime } from '../utils/formatTime'


const EventRegistrations = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { eventid } = useParams()


  useEffect(() => {
    if (!user) return // If user not an organiser or volunteer, do not fetch events
    setLoading(true)
    setError(null)

    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/events/${eventid}/registrations`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        )
        setData(response.data ?? [])
      } catch (err) {
        if (err.response?.status === 403) {
          setError(err.response.data?.message || 'Access denied')
        }
        else if (err.response?.status === 404) {
          setError('Event not found.')
        }else{
          setError('Could not load registrations.')
        }
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
      ['Title:', data.event.title],
      ['Maximum places:', data.event.maxVolunteers],
      ['Available places:', data.event.availablePlaces],
      ['Volunteers Registered:', data.totalRegistrations],
      [
        'Start & Finish Times:',
        `${formatTime(data.event.startTime)} - ${formatTime(
          data.event.finishTime
        )}`
      ]
    ]

    return (
      <div className='bg-white p-4 min-h-[18rem]'>
        <dl className='grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-[10rem_1fr] sm:gap-y-3'>
          {details.map(([label, value]) => (
            <div className='contents' key={label}>
              <dt className='font-semibold p-4'>{label}</dt>
              <dd className='bg-gray-200 p-4 text-center'>{value}</dd>
            </div>
          ))}
        </dl>
        <div>
          {data.registrations.length === 0 && (
            <p
              role='status'
              className='mb-4 text-amber-800 p-2 text-decoration-color: var(--color-orange-300)'
            >
              No volunteers have registered yet.
            </p>
          )}
          {data.registrations.length !== 0 && (
            <div className='bg-white p-4 min-h-[18rem]'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr>
                      {[
                        'Volunteer Name',
                        'Email',
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
                    {data.registrations.map(r=> (
                      <tr key={r.email}>
                        <td className='p-2 font-semibold'>{r.name}</td>
                        <td className='p-2 font-semibold text-center'>
                          {r.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className='mt-4 flex justify-end gap-4'>
          <Link
            to='/events'
            className='font-semibold px-6 py-2 bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700'
          >
            Back to my events
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
            Volunteer Registrations
          </h2>
          {renderContent()}
        </section>
      </main>
    </div>
  )
}

export default EventRegistrations
