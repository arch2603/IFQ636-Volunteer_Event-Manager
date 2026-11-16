const { default: mongoose } = require('mongoose')
const Event = require('../models/Event')
const Registration = require('../models/Registration')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/ // HH:MM in 24-hour format
const TEXT_FIELDS = ['title', 'location', 'purpose']

const validateEventData = data => {
  const { date, startTime, finishTime, maxVolunteers } = data

  //Ac2: Required fields
  for (const field of [
    ...TEXT_FIELDS,
    'date',
    'startTime',
    'finishTime',
    'maxVolunteers'
  ]) {
    const value = data[field]

    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return { error: `${field} is required` }
    }
  }

  for (const field of TEXT_FIELDS) {
    if (typeof data[field] !== 'string') {
      return { error: `${field} must be a text` }
    }
  }

  // AC3: Positive whole number
  if (!Number.isInteger(maxVolunteers) || maxVolunteers <= 0) {
    return { error: 'Maximum volunteers must be a positive integer' }
  }

  // Date:format + real calebdar date
  if (!DATE_PATTERN.test(date) || typeof date !== 'string') {
    return { error: 'Date must use YYYY-MM-DD' }
  }

  const eventDate = new Date(`${date}T00:00:00.000Z`)
  if (
    Number.isNaN(eventDate.getTime()) ||
    eventDate.toISOString().slice(0, 10) !== date
  ) {
    return { error: 'Invalid event date' }
  }

  // AC4: Time format + ordering (string compare is safe because HH:mm is zero-padded)
  if (
    typeof startTime !== 'string' ||
    typeof finishTime !== 'string' ||
    !TIME_PATTERN.test(startTime) ||
    !TIME_PATTERN.test(finishTime)
  ) {
    return { error: 'Start and finish times must use HH:MM format' }
  }

  if (finishTime <= startTime) {
    return { error: 'Finish time must be after start time' }
  }

  return {
    data: {
      title: data.title.trim(),
      location: data.location.trim(),
      purpose: data.purpose.trim(),
      date: eventDate,
      startTime,
      finishTime,
      maxVolunteers
    }
  }
}

const createEvent = async (req, res) => {
  const { error, data } = validateEventData(req.body)
  //return validation eerors
  if (error) {
    return res.status(400).json({ message: error })
  }

  try {
    //AC1: Authenticated user is the owner (field name must match the schema)
    const event = await Event.create({
      ...data,
      organiser: req.user._id
    })
    return res
      .status(201)
      .json({ message: 'Event created successfully', event })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiser: req.user._id }).lean()
    return res.status(200).json({
      events: events.map(event =>
        placesAvailable(event, event.registeredCount ?? 0)
      )
    })
  } catch (error) {
    res.status(500).json({ message: 'Could not load your events' })
  }
}

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, startTime: 1 }).lean()
    return res.status(200).json({
      events: events.map(event =>
        placesAvailable(event, event.registeredCount ?? 0)
      )
    })
  } catch (error) {
    res.status(500).json({ message: 'Could not load events' })
  }
}

const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ message: 'Event not found' })
    const event = await Event.findById(req.params.id).lean()
    if (!event) return res.status(404).json({ message: 'Event not found' })
    return res
      .status(200)
      .json({ event: placesAvailable(event, event.registeredCount ?? 0) })
  } catch (error) {
    res.status(500).json({ message: 'Could not load event' })
  }
}

const placesAvailable = (event, regCount = 0) => ({
  ...event,
  availablePlaces: Math.max(event.maxVolunteers - regCount, 0)
})

const registerForEvent = async (req, res) => {
  const eventId = req.params.id
  const userId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(404).json({ message: 'Event not found' })
  }

  let event

  try {
    const alreadyRegistered = await Registration.findOne({
      event: eventId,
      volunteer: userId
    })
    if (alreadyRegistered) {
      return res
        .status(409)
        .json({ message: 'You have already registered for this event' })
    }

    event = await Event.oneSpotClaim(eventId)

    if (event === null) {
      const eventExists = await Event.exists({ _id: eventId })

      if (!eventExists) {
        return res.status(404).json({ message: 'Event not found' })
      }
      return res.status(409).json({ message: 'This event is full' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Could not register for event' })
  }

  try {
    await Registration.create({
      event: eventId,
      volunteer: userId
    })
    return res.status(201).json({
      message: 'Registration successful',
      event: placesAvailable(event.toObject(), event.registeredCount)
    })
  } catch (error) {
    await Event.releaseASpot(eventId)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: 'You have already registered for this event' })
    }
    return res.status(500).json({ message: 'Could not register for event' })
  }
}

const getMyEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const organiserEvent = await Event.findById(eventId).lean();
    if(!organiserEvent) {
      return res.status(404).json({ message: 'Event not found' })
    }

    //AC3: Organiser owns the event
    if(organiserEvent.organiser.toString() !== userId.toString()) {
      return res.status(403).json({message: 'Access denied. You can only view registrations for your own events'})
    }

    const registrations = await Registration.find({event: eventId})
    .populate('volunteer', 'name email')
    .sort({createdAt: 1})
    .lean()

    return res.status(200).json({
      event: placesAvailable(organiserEvent, organiserEvent.registeredCount?? 0),
      totalRegistrations: registrations.length,
      registrations: registrations.map(r => ({
        name: r.volunteer?.name,
        email: r.volunteer?.email,
        registeredAt: r.createdAt
      }))
    })
  } catch (error) {
    return res.status(500).json({message: 'Could not load registrations'})
  }
}

module.exports = {
  createEvent,
  validateEventData,
  getMyEvents,
  getEvents,
  getEventById,
  registerForEvent,
  getMyEventRegistrations
}
