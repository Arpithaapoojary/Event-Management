const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with optional status filtering and search
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const { status, search, category } = req.query;
    const now = new Date();

    // Base query: exclude soft-deleted events
    let query = { isDeleted: false };

    // Filter by category if specified
    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // Search by title, description, or venue
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
      ];
    }

    // Filter by status if specified
    if (status === 'upcoming') {
      query.dateTime = { $gte: now };
    } else if (status === 'past') {
      query.dateTime = { $lt: now };
    }

    // Fetch and sort: upcoming events soonest first, past events most recent first
    let sortOrder = { dateTime: 1 };
    if (status === 'past') {
      sortOrder = { dateTime: -1 };
    }

    const events = await Event.find(query).sort(sortOrder);

    // If client requested 'open' status (upcoming + seats available)
    let filteredEvents = events;
    if (status === 'open') {
      filteredEvents = events.filter((e) => e.status === 'UPCOMING');
    }

    res.status(200).json({
      success: true,
      count: filteredEvents.length,
      data: filteredEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register attendee for an event
// @route   POST /api/events/:id/register
// @access  Public
exports.registerForEvent = async (req, res, next) => {
  try {
    const { fullName, email, contactNumber } = req.body;
    const eventId = req.params.id;

    // 1. Validate required fields
    if (!fullName || !email || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and contact number are all required.',
      });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.',
      });
    }

    if (fullName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot exceed 100 characters.',
      });
    }

    // Basic format checks
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Indian 10-digit phone number check (allows optional +91, 91, or 0 prefix, must have 10 digits starting with 6, 7, 8, or 9)
    const rawDigits = contactNumber.trim().replace(/[\s\-()+]/g, '');
    let corePhone = rawDigits;
    if (rawDigits.startsWith('91') && rawDigits.length === 12) {
      corePhone = rawDigits.slice(2);
    } else if (rawDigits.startsWith('0') && rawDigits.length === 11) {
      corePhone = rawDigits.slice(1);
    }

    if (!/^[6-9]\d{9}$/.test(corePhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9).',
      });
    }

    // 2. Fetch event and check existence
    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or is no longer available.',
      });
    }

    const now = new Date();
    // 3. Prevent registration for past events
    if (new Date(event.dateTime) < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed. This event has already taken place.',
      });
    }

    // 4. Prevent registration if capacity reached
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed. This event has reached full capacity.',
      });
    }

    // 5. Prevent duplicate registration by email for this event
    const normalizedEmail = email.toLowerCase().trim();
    const existingRegistration = await Registration.findOne({
      event: event._id,
      email: normalizedEmail,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event with this email address.',
      });
    }

    // 6. Create registration record
    const registration = await Registration.create({
      event: event._id,
      fullName: fullName.trim(),
      email: normalizedEmail,
      contactNumber: contactNumber.trim(),
    });

    // 7. Increment registered count atomically
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully!',
      data: {
        registration,
        seatsLeft: event.seatsLeft,
        registeredCount: event.registeredCount,
        status: event.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
