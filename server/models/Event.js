const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1 seat'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    category: {
      type: String,
      enum: ['Cultural', 'Technical', 'Sports', 'Other'],
      default: 'Cultural',
      trim: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate dynamic status
EventSchema.virtual('status').get(function () {
  if (this.isDeleted) {
    return 'CANCELLED';
  }

  const now = new Date();
  const eventTime = new Date(this.dateTime);

  if (eventTime < now) {
    return 'PAST';
  }
  if (this.registeredCount >= this.capacity) {
    return 'FULL';
  }
  return 'UPCOMING';
});

// Virtual property for seats remaining
EventSchema.virtual('seatsLeft').get(function () {
  return Math.max(0, this.capacity - (this.registeredCount || 0));
});

module.exports = mongoose.model('Event', EventSchema);
