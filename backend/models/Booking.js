const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required']
  },
  studentEmail: {
    type: String,
    required: [true, 'Email is required']
  },
  studentPhone: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  level: {
    type: String,
    enum: ['KS3', 'GCSE', 'A-Level', 'University', 'Other'],
    required: true
  },
  sessionDate: {
    type: Date,
    required: [true, 'Session date is required']
  },
  sessionTime: {
    type: String,
    required: [true, 'Session time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    enum: [30, 60, 90, 120] // in minutes
  },
  sessionType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: null
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
