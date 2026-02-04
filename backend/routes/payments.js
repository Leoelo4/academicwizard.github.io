const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// This would normally be initialized with your Stripe secret key
// For assignment purposes, this is a placeholder implementation
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create a Stripe checkout session for booking payment
 * @access  Private (Students)
 */
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { bookingId, amount, subject, tutorName, sessionDate } = req.body;

    // Validate required fields
    if (!bookingId || !amount || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, amount, and subject'
      });
    }

    // For demo purposes if Stripe is not configured, return a mock session
    if (!stripe) {
      console.log('Stripe not configured - returning mock session');
      return res.json({
        success: true,
        sessionId: 'mock_session_' + Date.now(),
        url: `/confirmation.html?bookingId=${bookingId}&payment=demo`,
        message: 'Demo mode - Stripe not configured'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${subject} Tutoring Session`,
              description: `Session with ${tutorName || 'Tutor'} on ${sessionDate || 'TBD'}`,
            },
            unit_amount: Math.round(amount * 100), // Convert pounds to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmation.html?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/book.html?cancelled=true`,
      metadata: {
        bookingId: bookingId,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe webhooks)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful for booking:', session.metadata.bookingId);
        
        // Here you would update the booking status in your database
        // const Booking = require('../models/Booking');
        // await Booking.findByIdAndUpdate(session.metadata.bookingId, {
        //   paymentStatus: 'paid',
        //   stripeSessionId: session.id
        // });
        
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

/**
 * @route   GET /api/payments/session/:sessionId
 * @desc    Retrieve payment session details
 * @access  Private
 */
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Mock session for demo
    if (!stripe || sessionId.startsWith('mock_')) {
      return res.json({
        success: true,
        session: {
          id: sessionId,
          payment_status: 'paid',
          amount_total: 3500,
          currency: 'gbp',
          metadata: {
            bookingId: req.query.bookingId || 'demo'
          }
        }
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata
      }
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: error.message
    });
  }
});

module.exports = router;
