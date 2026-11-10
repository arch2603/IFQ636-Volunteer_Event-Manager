import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../axiosConfig'
import {Navigate, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const initForm = {
  title: '',
  date: '',
  location: '',
  purpose: '',
  startTime: '',
  finishTime: '',
  maxVolunteers: ''
}

const todaysDate = () => {
  const today = new Date()
  const pad = num => String(num).padStart(2, '0')
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`
}

const inputClass =
  'w-full p-2 border border-gray-300 bg-white text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 '
const labelClass = 'text-xs font-semibold text-gray-800'

const CreateEvent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axiosInstance.post(
        '/api/events',
        { ...formData, maxVolunteers: Number(formData.maxVolunteers) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setFormData(initForm)
      navigate(`/events/`)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not create event. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }
  if (!user) {
    return <Navigate to='/login' replace />
  }

  if(user?.role !== 'organiser') {
    return <p role='alert'>Access denied. Only organisers can create events.</p>
  }
  return (
    <div className='flex gap-8 max-w-7xl px-4 pb-2 pt-16'>
      <Sidebar />
      <main className='flex-1'>
        <form
          onSubmit={handleSubmit}
          className='bg-gray-100 p-4 py-5 shadow-md'
        >
          <div className='bg-gray-200 p-4'>
            <h1 className='bg-white text-3xl font-bold text-center py-4 mx-12 mb-5'>
              Create Event
            </h1>
            <div className='bg-gray-100 p-4 py-5'>
              {error && (
                <p role='alert' className='text-red-500 text-center mb-4'>
                  {error}
                </p>
              )}

              <div className='grid grid-cols-[7rem_1fr] gap-x-4 gap-y-4 items-center pr-8'>
                <label htmlFor='title' className={labelClass}>
                  Title:*
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <label htmlFor='date' className={labelClass}>
                  Date:*
                </label>
                <input
                  type='date'
                  id='date'
                  name='date'
                  min={todaysDate()}
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <label htmlFor='location' className={labelClass}>
                  Location:*
                </label>
                <input
                  type='text'
                  id='location'
                  name='location'
                  value={formData.location}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <label htmlFor='purpose' className={labelClass}>
                  Purpose:*
                </label>
                <input
                  type='text'
                  id='purpose'
                  name='purpose'
                  value={formData.purpose}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <span className='text-xs font-semibold text-gray-800'>
                  Start &amp; Finish Time:*
                </span>
                <div className='grid grid-cols-2 gap-16'>
                  <div>
                    <label
                      htmlFor='startTime'
                      className='block text-center text-sm font-semibold mb-1'
                    >
                      Start:
                    </label>
                    <input
                      type='time'
                      id='startTime'
                      name='startTime'
                      value={formData.startTime}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='finishTime'
                      className='block text-center text-sm font-semibold mb-1'
                    >
                      Finish:
                    </label>
                    <input
                      type='time'
                      id='finishTime'
                      name='finishTime'
                      value={formData.finishTime}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <label htmlFor='maxVolunteers' className={labelClass}>
                  Max Volunteers:*
                </label>
                <input
                  type='number'
                  id='maxVolunteers'
                  name='maxVolunteers'
                  min='1'
                  step='1'
                  value={formData.maxVolunteers}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>
          <div className='flex justify-end mt-4 gap-4'>
            <button
              type='button'
              className='w-40 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4'
              onClick={() => navigate('/events')}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='w-40 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4'
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateEvent
