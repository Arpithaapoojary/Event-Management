const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const {
  adminLogin,
  getAdminStats,
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  restoreEvent,
  getRegistrations,
  getEventRegistrations,
} = require('../controllers/adminController');

// Public admin login
router.post('/login', adminLogin);

// Protected routes (require x-admin-key or Bearer token)
router.use(adminAuth);

// Local Folder Image Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully from local folder.',
    imageUrl: relativeUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// Module 3: Summary stats
router.get('/stats', getAdminStats);

// Module 4: Event CRUD operations
router.route('/events').get(getAdminEvents).post(createEvent);
router.route('/events/:id').put(updateEvent).delete(deleteEvent);
router.post('/events/:id/restore', restoreEvent);

// Module 5: Registration management
router.get('/registrations', getRegistrations);
router.get('/events/:id/registrations', getEventRegistrations);

module.exports = router;
