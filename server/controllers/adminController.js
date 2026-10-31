const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Admin login verification
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  const { passcode } = req.body;
  const expectedKey = process.env.ADMIN_KEY || 'admin2026';

  if (!passcode || passcode.trim() !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative passcode. Please verify and try again.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Admin access granted.',
    token: expectedKey,
  });
};

// @desc    Get dashboard summary metrics (Module 3)
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Fetch all active non-deleted events for registration counting
    const activeEvents = await Event.find({ isDeleted: false }).select('_id');
    const activeEventIds = activeEvents.map((e) => e._id);

    const [
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      pastEvents,
      fullEvents,
      culturalEvents,
      technicalEvents,
      sportsEvents,
      deletedEvents,
    ] = await Promise.all([
      Event.countDocuments({ isDeleted: false }),
      Registration.countDocuments({ event: { $in: activeEventIds } }),
      Event.countDocuments({ isDeleted: false, dateTime: { $gte: now } }),
      Event.countDocuments({ isDeleted: false, dateTime: { $lt: now } }),
      Event.countDocuments({
        isDeleted: false,
        $expr: { $gte: ['$registeredCount', '$capacity'] },
      }),
      Event.countDocuments({ isDeleted: false, category: 'Cultural' }),
      Event.countDocuments({ isDeleted: false, category: 'Technical' }),
      Event.countDocuments({ isDeleted: false, category: 'Sports' }),
      Event.countDocuments({ isDeleted: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        upcomingEvents,
        pastEvents,
        fullEvents,
        deletedEvents,
        categories: {
          cultural: culturalEvents,
          technical: technicalEvents,
          sports: sportsEvents,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin events with soft-delete filter support (Module 4)
// @route   GET /api/admin/events
// @access  Private (Admin)
exports.getAdminEvents = async (req, res, next) => {
  try {
    const { showDeleted, category, search, status } = req.query;
    let query = {};

    if (showDeleted === 'true') {
      // Show all events including soft-deleted for audit
    } else if (showDeleted === 'only') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { venue: searchRegex }, { description: searchRegex }];
    }

    const now = new Date();
    if (status === 'upcoming') {
      query.dateTime = { $gte: now };
    } else if (status === 'past') {
      query.dateTime = { $lt: now };
    } else if (status === 'cancelled') {
      query.isDeleted = true;
    }

    const events = await Event.find(query).sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event (Module 4)
// @route   POST /api/admin/events
// @access  Private (Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, dateTime, venue, capacity, imageUrl, category } = req.body;

    // Field presence & whitespace validation
    if (!title || !title.trim() || !description || !description.trim() || !dateTime || !venue || !venue.trim() || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date & time, venue, and capacity are all required and cannot be empty.',
      });
    }

    // Length constraints (120 for title, 1000 for description)
    if (title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Event title cannot exceed 120 characters.',
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Event description cannot exceed 1000 characters.',
      });
    }

    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time.',
      });
    }

    // Date must be in the future for new events
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future. Past dates cannot be scheduled.',
      });
    }

    // Capacity must be positive integer
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive integer (at least 1 seat).',
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      dateTime: eventDate,
      venue: venue.trim(),
      capacity: parsedCapacity,
      category: category && ['Cultural', 'Technical', 'Sports', 'Other'].includes(category) ? category : 'Cultural',
      imageUrl:
        imageUrl && imageUrl.trim() !== ''
          ? imageUrl.trim()
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing event (Module 4)
// @route   PUT /api/admin/events/:id
// @access  Private (Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const { title, description, dateTime, venue, capacity, imageUrl, category } = req.body;
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    // Length constraints
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Event title cannot be empty.' });
      }
      if (title.trim().length > 120) {
        return res.status(400).json({ success: false, message: 'Event title cannot exceed 120 characters.' });
      }
      event.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ success: false, message: 'Event description cannot be empty.' });
      }
      if (description.trim().length > 1000) {
        return res.status(400).json({ success: false, message: 'Event description cannot exceed 1000 characters.' });
      }
      event.description = description.trim();
    }

    // Validate capacity: must be integer and cannot be less than current registrations
    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a positive integer.',
        });
      }
      if (parsedCapacity < (event.registeredCount || 0)) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below existing registered attendees (${event.registeredCount || 0}).`,
        });
      }
      event.capacity = parsedCapacity;
    }

    if (dateTime) {
      const eventDate = new Date(dateTime);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date and time.',
        });
      }
      event.dateTime = eventDate;
    }

    if (venue) {
      if (!venue.trim()) {
        return res.status(400).json({ success: false, message: 'Campus venue location cannot be empty.' });
      }
      event.venue = venue.trim();
    }

    if (category && ['Cultural', 'Technical', 'Sports', 'Other'].includes(category)) {
      event.category = category;
    }

    if (imageUrl !== undefined) {
      event.imageUrl = imageUrl.trim() !== '' ? imageUrl.trim() : event.imageUrl;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete an event (Module 4 & 5)
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or already deleted.',
      });
    }

    // Soft delete to ensure registration data remains consistent and intact for audits
    event.isDeleted = true;
    event.deletedAt = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" has been deleted. ${event.registeredCount || 0} registrations preserved in archive.`,
      data: {
        id: event._id,
        affectedRegistrations: event.registeredCount || 0,
        deletedAt: event.deletedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a soft-deleted event (Module 4)
// @route   POST /api/admin/events/:id/restore
// @access  Private (Admin)
exports.restoreEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: true });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Soft-deleted event not found or is already active.',
      });
    }

    event.isDeleted = false;
    event.deletedAt = null;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" has been restored successfully.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations with event details & search (Module 5)
// @route   GET /api/admin/registrations
// @access  Private (Admin)
exports.getRegistrations = async (req, res, next) => {
  try {
    const { eventId, search } = req.query;

    let query = {};
    if (eventId) {
      query.event = eventId;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { contactNumber: regex }];
    }

    const registrations = await Registration.find(query)
      .populate('event', 'title dateTime venue isDeleted category capacity registeredCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for a single event (Module 5)
// @route   GET /api/admin/events/:id/registrations
// @access  Private (Admin)
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { search } = req.query;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    let query = { event: eventId };
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { contactNumber: regex }];
    }

    const registrations = await Registration.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        _id: event._id,
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        category: event.category,
        venue: event.venue,
        dateTime: event.dateTime,
        seatsLeft: event.seatsLeft,
        status: event.status,
      },
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
