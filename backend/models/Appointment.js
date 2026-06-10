const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String, // stored as 'HH:MM' e.g. '10:00'
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Snapshot of service price at booking time
    pricePaid: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index: prevent double-booking the same slot for the same service
appointmentSchema.index({ service: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
