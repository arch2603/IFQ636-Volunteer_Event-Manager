const express = require('express');
const {protect, requireRole} = require('../middleware/authMiddleware');
const { createEvent, getMyEvents, getEvents, getEventById} = require('../controllers/eventController');

const router = express.Router();

router.post('/', protect, requireRole('organiser'), createEvent);
router.get('/', protect, getEvents);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);
router.get('/:id', protect, getEventById);

module.exports = router;
