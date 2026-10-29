const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  registerForEvent,
} = require('../controllers/eventController');

// Public routes for Module 1 & 2
router.route('/').get(getEvents);
router.route('/:id').get(getEventById);
router.route('/:id/register').post(registerForEvent);

module.exports = router;

