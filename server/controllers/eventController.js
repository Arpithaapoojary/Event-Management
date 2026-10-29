const Event = require('../models/Event');

// @desc    Get all events with optional status filtering and search
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const now = new Date();

    // Base query: exclude soft-deleted events
    let query = { isDeleted: false };

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
