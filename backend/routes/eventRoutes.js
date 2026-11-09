const express = require('express');
const {protect, requireRole} = require('../middleware/authMiddleware');
const { createEvent} = require('../controllers/eventController');

const router = express.Router();

router.post('/', protect, requireRole('organiser'), createEvent);

module.exports = router;
