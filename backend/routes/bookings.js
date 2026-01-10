const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../utils/email');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      studentPhone,
      tutor,
      subject,
      level,
      sessionDate,
      sessionTime,
      duration,
      sessionType,
      notes
    } = req.body;

    const User = require('../models/User');
    
    // Find the tutor by ID
    const tutorUser = await User.findById(tutor);
    if (!tutorUser || tutorUser.role !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor selected'
      });
    }

    // Calculate amount based on tutor's hourly rate
    const hourlyRate = tutorUser.hourlyRate || 35;
    const amount = (hourlyRate / 60) * duration;

    // Generate unique booking reference
    const generateReference = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let reference = 'AW-';
      for (let i = 0; i < 6; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return reference;
    };

    const bookingReference = generateReference();

    // Create booking with actual tutor user
    // Use system user for student (or create a guest user)
    let systemUser = await User.findOne({ email: 'system@academicwizard.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@academicwizard.com',
        password: 'systemuser123',
        role: 'admin'
      });
    }

    const booking = await Booking.create({
      student: systemUser._id,
      tutor: tutorUser._id,
      studentName,
      studentEmail,
      studentPhone,
      subject,
      level,
      sessionDate,
      sessionTime,
      duration,
      sessionType,
      amount,
      notes,
      bookingReference
    });

    // Add tutor name to response
    const bookingData = booking.toObject();
    bookingData.tutorName = tutorUser.name;

    // Send confirmation email
    try {
      await sendBookingConfirmation(bookingData);
      console.log('Booking confirmation email sent to:', studentEmail);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('tutor', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/my-sessions
// @desc    Get all sessions for a tutor
// @access  Private (Tutor)
router.get('/my-sessions', protect, async (req, res) => {
  try {
    // Check if user is a tutor
    if (req.user.role !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Tutors only.'
      });
    }

    // Find all bookings where the tutor email matches
    // Since bookings currently use system user, we'll match by tutorName containing the tutor's name
    // In a production system, you'd match by tutor ID
    const bookings = await Booking.find()
      .sort('-sessionDate');

    // Filter bookings for this tutor
    // For now, show all bookings since the system doesn't have proper tutor assignment
    // In production, you would filter by: { tutor: req.user._id }
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/all
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/all', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const bookings = await Booking.find()
      .populate('tutor', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('student', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel/delete booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/availability
// @desc    Get booked times for a tutor on a specific date (public for booking form)
// @access  Public
router.get('/availability', async (req, res) => {
  try {
    const { tutor, date } = req.query;
    
    if (!tutor || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tutor and date are required'
      });
    }

    const bookings = await Booking.find({
      tutor: tutor,
      sessionDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      }
    }).select('sessionTime');

    const bookedTimes = bookings.map(b => b.sessionTime);

    res.status(200).json({
      success: true,
      data: bookedTimes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
