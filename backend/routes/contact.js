const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailHelper');
const getContactThankYouTemplate = require('../email-templates/contact-thank-you-template');

/**
 * @route POST /api/contact
 * @desc Send a contact form message
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message, subject = 'Contact Form Submission' } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create email content
    const emailOptions = {
      to: process.env.EMAIL_USER, // Send to the configured email
      subject: `Guidia Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission
        ---------------------------
        From: ${name} (${email})
        Subject: ${subject}

        Message:
        ${message}
      `
    };

    // Send the email
    const info = await sendEmail(emailOptions);

    if (!info) {
      throw new Error('Failed to send email');
    }

    // Send auto-reply to the user using the template
    const autoReplyOptions = getContactThankYouTemplate(email, name, message);

    // Send auto-reply (don't wait for it to complete)
    sendEmail(autoReplyOptions).catch(error => {
      console.error('Error sending auto-reply:', error);
    });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.'
    });
  }
});

module.exports = router;
