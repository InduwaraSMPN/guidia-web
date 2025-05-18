const getJobApplicationStatusTemplate = (
  recipientEmail,
  studentName,
  jobTitle,
  companyName,
  status,
  notes,
  applicationUrl
) => {
  // Get status-specific styling
  let statusColor = '';
  let statusIcon = '';
  let statusMessage = '';

  switch (status) {
    case 'pending':
      statusColor = '#6b7280'; // Gray
      statusMessage = 'Your application is pending review.';
      break;
    case 'reviewed':
      statusColor = '#3b82f6'; // Blue
      statusMessage = 'Your application has been reviewed.';
      break;
    case 'shortlisted':
      statusColor = '#6366f1'; // Indigo
      statusMessage = 'Congratulations! You have been shortlisted for this position.';
      break;
    case 'approved':
      statusColor = '#10b981'; // Green
      statusMessage = 'Congratulations! Your application has been approved.';
      break;
    case 'rejected':
      statusColor = '#ef4444'; // Red
      statusMessage = 'We regret to inform you that your application was not selected for this position.';
      break;
    default:
      statusColor = '#6b7280'; // Gray
      statusMessage = 'Your application status has been updated.';
  }

  return {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Job Application Status Update: ${jobTitle} at ${companyName}`,
    text: `Hello ${studentName},\n\nYour application for ${jobTitle} at ${companyName} has been updated to: ${status}.\n\n${statusMessage}\n\n${notes ? `Notes: ${notes}` : ''}\n\nYou can view your application details by clicking the link below or logging into your account and navigating to your job applications.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Application Status Update</title>
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
                            <img src="https://ik.imagekit.io/pasindunaduninduwara/logo.svg" alt="Guidia Logo" style="width: 161px; display: block; margin: 0 auto 24px;">
              <h1 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 32px; color: #000000; margin: 0 0 24px; text-align: center;">Application Status Update</h1>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px; font-weight: 600;">Hello ${studentName},</p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 24px;">Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>

              <!-- Status Badge - with dashed border like OTP -->
              <div style="margin:24px auto 32px; padding:16px; line-height:1.6; font-family:'Montserrat', sans-serif; color:${statusColor}; font-weight:600; font-size:24px; text-align:center; border:2px dashed ${statusColor}; border-radius:8px; width:fit-content;">
                <div style="font-size: 32px; margin-bottom: 8px;">${statusIcon}</div>
                <div style="text-transform: uppercase;">
                  ${status}
                </div>
              </div>

              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 24px; text-align: center;">
                ${statusMessage}
              </p>

              ${notes ? `
              <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #800020;">
                <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 18px; color: #000000; margin: 0 0 8px;">Notes from ${companyName}</h3>
                <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #4b5563; margin: 0;">${notes}</p>
              </div>
              ` : ''}

              <div style="margin: 32px 0; text-align: center;">
                <a href="${applicationUrl}" style="display: inline-block; background-color: #800020; color: #ffffff; font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 16px; text-decoration: none; padding: 12px 24px; border-radius: 6px;">View My Job Applications</a>
              </div>

              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px;">
                If you have any questions, please contact our support team or log in to your account to check your application status.
              </p>

              <p style="font-family: 'Open Sans', sans-serif; font-size: 16px; color: #1f2937; margin: 0 0 16px;">
                If you did not apply for this position, please disregard this email.
              </p>
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
                      <img src="https://ik.imagekit.io/pasindunaduninduwara/logo.svg" alt="Guidia Logo" style="width: 122px; display: block; margin: 12px auto;">
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
</html>`
  };
};

module.exports = getJobApplicationStatusTemplate;
