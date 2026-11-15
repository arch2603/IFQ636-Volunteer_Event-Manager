const express = require('express');
const {protect, requireRole} = require('../middleware/authMiddleware');
const { registerForEvent, createEvent, getMyEvents, getEvents, getEventById, getMyEventRegistrations} = require('../controllers/eventController');

const router = express.Router();

router.post('/', protect, requireRole('organiser'), createEvent);
router.post('/:id/register', protect, requireRole('volunteer'), registerForEvent);
router.get('/', protect, getEvents);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);
router.get('/:id/registrations', protect, requireRole('organiser'), getMyEventRegistrations);
router.get('/:id', protect, getEventById);

module.exports = router;
