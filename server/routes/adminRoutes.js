const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  adminLogin,
  getAdminStats,
  createEvent,
  updateEvent,
  deleteEvent,
  getRegistrations,
  getEventRegistrations,
} = require('../controllers/adminController');

// Public admin login
router.post('/login', adminLogin);

// Protected routes (require x-admin-key or Bearer token)
router.use(adminAuth);

// Module 3: Summary stats
router.get('/stats', getAdminStats);

// Module 4: Event CRUD operations
router.route('/events').post(createEvent);
router.route('/events/:id').put(updateEvent).delete(deleteEvent);

// Module 5: Registration management
router.get('/registrations', getRegistrations);
router.get('/events/:id/registrations', getEventRegistrations);

module.exports = router;
