const express = require('express');
const {protect, requireRole} = require('../middleware/authMiddleware');
const { createEvent, getMyEvents} = require('../controllers/eventController');

const router = express.Router();

router.post('/', protect, requireRole('organiser'), createEvent);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);

module.exports = router;
