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

    const [
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      pastEvents,
      fullEvents,
    ] = await Promise.all([
      Event.countDocuments({ isDeleted: false }),
      Registration.countDocuments(),
      Event.countDocuments({ isDeleted: false, dateTime: { $gte: now } }),
      Event.countDocuments({ isDeleted: false, dateTime: { $lt: now } }),
      Event.countDocuments({
        isDeleted: false,
        $expr: { $gte: ['$registeredCount', '$capacity'] },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        upcomingEvents,
        pastEvents,
        fullEvents,
      },
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
    const { title, description, dateTime, venue, capacity, imageUrl } = req.body;

    // Field validations
    if (!title || !description || !dateTime || !venue || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date & time, venue, and capacity are all required.',
      });
    }

    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time.',
      });
    }

    if (Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1 seat.',
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      dateTime: eventDate,
      venue: venue.trim(),
      capacity: Number(capacity),
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
    const { title, description, dateTime, venue, capacity, imageUrl } = req.body;
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    // Validate capacity if changed: cannot be less than existing registrations
    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (parsedCapacity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be at least 1 seat.',
        });
      }
      if (parsedCapacity < event.registeredCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below existing registered attendees (${event.registeredCount}).`,
        });
      }
      event.capacity = parsedCapacity;
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
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
    if (venue) event.venue = venue.trim();
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
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event has been deleted successfully. Associated registrations are preserved.',
      data: { id: event._id },
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
      .populate('event', 'title dateTime venue isDeleted')
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
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
