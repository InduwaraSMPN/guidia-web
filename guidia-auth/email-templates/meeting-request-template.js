const getMeetingRequestTemplate = (
  recipientEmail,
  requestorName,
  meetingDate,
  startTime,
  endTime,
  meetingTitle,
  meetingDescription
) => {
  // Format date for display
  const formattedDate = new Date(meetingDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = `${startTime} - ${endTime}`;

  return {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `New Meeting Request from ${requestorName}`,
    text: `${requestorName} has requested a meeting with you on ${formattedDate} at ${formattedTime}. Title: ${meetingTitle}. Description: ${
      meetingDescription || "No description provided"
    }. Please log in to your account to accept or decline this meeting request.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Meeting Request</title>
  <style type="text/css">
    /* Basic Reset */
    body, table, td, a { margin: 0; padding: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    table { border-collapse: collapse !important; }
    body { width: 100% !important; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

    /* Responsive Styles */
    @media only screen and (max-width: 620px) {
      .wrapper { padding: 12px !important; }
      .content { padding: 24px !important; }
      .details-table td { padding: 12px !important; }
      .footer-logo-container { padding: 0 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table width="100%" style="background-color: #f8fafc; border-collapse: collapse;" role="presentation">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!-- Main Content Section -->
        <table width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; border-collapse: collapse;" role="presentation">
          <tr>
            <td style="padding: 48px;" class="content">
              <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" alt="Guidia Logo" style="width: 161px; display: block; margin: 0 auto 24px;">
              <h1 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 32px; color: #000000; margin: 0 0 24px; text-align: center;">New Meeting Request</h1>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px; font-weight: 600;">Hello!</p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px;">${requestorName} has requested a meeting with you. Please review the details below:</p>
              <h2 style="font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 22px; color: #000000; margin: 0 0 20px;">Meeting Details</h2>
              <table width="100%" style="margin-bottom: 32px; border-collapse: collapse;" class="details-table" role="presentation">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 16px; width: 30%; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600; color: #374151; vertical-align: top; border-bottom: 1px solid #e5e7eb;">Date:</td>
                  <td style="padding: 16px; font-family: 'Open Sans', sans-serif; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 16px; width: 30%; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600; color: #374151; vertical-align: top; border-bottom: 1px solid #e5e7eb;">Time:</td>
                  <td style="padding: 16px; font-family: 'Open Sans', sans-serif; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${formattedTime}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 16px; width: 30%; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600; color: #374151; vertical-align: top; border-bottom: 1px solid #e5e7eb;">Title:</td>
                  <td style="padding: 16px; font-family: 'Open Sans', sans-serif; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${meetingTitle}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 16px; width: 30%; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600; color: #374151; vertical-align: top; border-bottom: 1px solid #e5e7eb;">Description:</td>
                  <td style="padding: 16px; font-family: 'Open Sans', sans-serif; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${meetingDescription || 'No description provided'}</td>
                </tr>
              </table>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px;">Please log in to your account to accept or decline this meeting request.</p>
              <table width="100%" style="border-collapse: collapse;" role="presentation">
                <tr>
                  <td align="center" style="padding: 32px 0 0;">
                    <a href="${process.env.FRONTEND_URL || 'https://example.com'}/meetings/my-meetings" target="_blank" style="background-color: #800020; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 16px; display: inline-block;">View Meeting Request</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Footer Section -->
        <table width="100%" style="max-width: 640px; border-collapse: collapse; padding: 24px 0; border-top: 1px solid #e5e7eb;" role="presentation">
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #6b7280; margin: 0 0 8px;">This message was sent to <span style="color: #000000;">${recipientEmail}</span>.</p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #6b7280; margin: 0 0 8px;">For any concerns, please contact <a href="mailto:support@example.com" style="color: #000000; text-decoration: none; border-bottom: 1px solid #000000;">support</a>.</p>
              <table width="100%" style="border-collapse: collapse; padding: 24px 0;" role="presentation">
                <tr>
                  <td align="center" class="footer-logo-container">
                    <a href="https://example.com" target="_blank">
                      <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" alt="Guidia Logo" style="width: 122px; display: block; margin: 12px auto;">
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #6b7280; margin: 0;">Guidia Inc. Anuradhapura, Sri Lanka.</p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #6b7280; margin: 0;">© ${new Date().getFullYear()} Guidia. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

module.exports = getMeetingRequestTemplate;
