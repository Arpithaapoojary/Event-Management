const express = require('express');
const router = express.Router();
const { getEvents, getEventById } = require('../controllers/eventController');

// Public routes for Module 1
router.route('/').get(getEvents);
router.route('/:id').get(getEventById);

module.exports = router;
