const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          const raw = (v || '').replace(/[\s\-()+]/g, '');
          let core = raw;
          if (raw.startsWith('91') && raw.length === 12) core = raw.slice(2);
          else if (raw.startsWith('0') && raw.length === 11) core = raw.slice(1);
          return /^[6-9]\d{9}$/.test(core);
        },
        message: 'Please provide a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee no duplicate registration for the same event by email
RegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
