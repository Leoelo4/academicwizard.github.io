const nodemailer = require('nodemailer');

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'leo.mills7777@gmail.com',
      pass: process.env.EMAIL_PASSWORD // App-specific password from Gmail
    }
  });
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  const transporter = createTransporter();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const mailOptions = {
    from: {
      name: 'Academic Wizard',
      address: process.env.EMAIL_USER || 'leo.mills7777@gmail.com'
    },
    to: booking.studentEmail,
    subject: `Booking Confirmation - ${booking.bookingReference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .booking-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #667eea;
          }
          .value {
            color: #333;
            text-align: right;
          }
          .reference {
            background: #667eea;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            letter-spacing: 2px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: #06b6d4;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✨ Academic Wizard</h1>
          <p style="margin: 10px 0 0 0;">Your Booking is Confirmed!</p>
        </div>
        
        <div class="content">
          <p>Dear ${booking.studentName},</p>
          
          <p>Thank you for booking a tutoring session with Academic Wizard! We're excited to help you achieve your academic goals.</p>
          
          <div class="reference">
            Booking Reference: ${booking.bookingReference}
          </div>
          
          <div class="booking-details">
            <h2 style="margin-top: 0; color: #667eea;">Session Details</h2>
            
            <div class="detail-row">
              <span class="label">Tutor:</span>
              <span class="value">${booking.tutorName || 'To be assigned'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${booking.subject}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Level:</span>
              <span class="value">${booking.level}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(booking.sessionDate)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${booking.sessionTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.duration} minutes</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Session Type:</span>
              <span class="value">${booking.sessionType === 'online' ? 'Online' : 'In-Person'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">£${booking.amount.toFixed(2)}</span>
            </div>
          </div>
          
          ${booking.notes ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Additional Notes:</strong>
            <p style="margin: 10px 0 0 0;">${booking.notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <p><strong>What's Next?</strong></p>
            <p>You will receive a reminder email 24 hours before your session. If you have any questions or need to make changes, please contact us.</p>
          </div>
          
          <div class="footer">
            <p><strong>Academic Wizard</strong></p>
            <p>Email: info@academicwizard.com | Phone: 020 1234 5678</p>
            <p style="font-size: 12px; margin-top: 15px;">
              Please save this email for your records. Your booking reference is required for any inquiries.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation
};
