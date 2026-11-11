const Event = require('../models/Event');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM in 24-hour format
const TEXT_FIELDS = ['title', 'location', 'purpose'];

const validateEventData = (data) => {
    const { date, startTime, finishTime, maxVolunteers } = data;

    //Ac2: Required fields
    for (const field of [...TEXT_FIELDS, 'date', 'startTime', 'finishTime', 'maxVolunteers']) {
        const value = data[field];

        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            return { error: `${field} is required` };
        }
    }

    for (const field of TEXT_FIELDS) {
        if (typeof data[field] !== 'string') {
            return { error: `${field} must be a text` };
        }
    }

    // AC3: Positive whole number
    if (!Number.isInteger(maxVolunteers) || maxVolunteers <= 0) {
        return { error: 'Maximum volunteers must be a positive integer' };
    }


    // Date:format + real calebdar date
    if (!DATE_PATTERN.test(date) || typeof date !== 'string') {
        return { error: 'Date must use YYYY-MM-DD' };
    }

    const eventDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(eventDate.getTime()) || eventDate.toISOString().slice(0, 10) !== date) {
        return { error: 'Invalid event date' };
    }

    // AC4: Time format + ordering (string compare is safe because HH:mm is zero-padded)
    if (typeof startTime !== 'string' || typeof finishTime !== 'string' || !TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(finishTime)) {
        return { error: 'Start and finish times must use HH:MM format' };
    }

    if (finishTime <= startTime) {
        return { error: 'Finish time must be after start time' };
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

    const { error, data } = validateEventData(req.body);
    //return validation eerors
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        //AC1: Authenticated user is the owner (field name must match the schema)
        const event = await Event.create({
            ...data,
            organiser: req.user._id
        });
        return res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organiser: req.user._id });
        return res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ "message": "Could not load your events" });
    }
}

module.exports = { createEvent, validateEventData, getMyEvents };