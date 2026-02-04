const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Send contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'Academicwizard@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email to admin
    const adminMailOptions = {
      from: {
        name: 'Academic Wizard Contact Form',
        address: process.env.EMAIL_USER || 'Academicwizard@gmail.com'
      },
      to: process.env.EMAIL_USER || 'Academicwizard@gmail.com',
      subject: `Contact Form: ${subject || 'New Message'}`,
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
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: bold;
              color: #667eea;
              margin-bottom: 5px;
            }
            .field-value {
              background: white;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #667eea;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 5px;
              border-left: 4px solid #764ba2;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧙 New Contact Form Message</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">From:</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${subject ? `
            <div class="field">
              <div class="field-label">Subject:</div>
              <div class="field-value">${subject}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="field-label">Message:</div>
              <div class="message-box">${message}</div>
            </div>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              You can reply directly to this email to respond to ${name}.
            </p>
          </div>
        </body>
        </html>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;
