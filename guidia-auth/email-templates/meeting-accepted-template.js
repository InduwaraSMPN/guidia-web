const getMeetingAcceptedTemplate = (recipientEmail, acceptorName, meetingDate, startTime, endTime, meetingTitle, meetingDescription) => {
  // Format date for display
  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = `${startTime} - ${endTime}`;

  return {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Meeting Accepted by ${acceptorName}`,
    text: `${acceptorName} has accepted your meeting request for ${formattedDate} at ${formattedTime}. Title: ${meetingTitle}. Description: ${meetingDescription || 'No description provided'}. Please log in to your account to view the meeting details.`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:500,600,700|Open+Sans:400,600">
    <style type="text/css">
      @media screen {
        @font-face {
          font-family: 'Montserrat';
          font-style: normal;
          font-weight: 600;
          src: url(https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_bZF3gnD-w.woff) format('woff');
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0d.woff) format('woff');
        }
      }
      /* A simple css reset */
      @media only screen and (max-width: 620px) {
        .wrapper .section {
          width: 100%;
        }
        .wrapper .column {
          width: 100%;
          display: block;
        }
      }
    </style>
  </head>
  <body style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
    <table width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
      <tbody>
        <tr>
          <td class="wrapper" width="600" align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;padding-left:10px;padding-right:10px;">
            <table class="section header" cellpadding="0" cellspacing="0" width="600" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:initial;vertical-align:top;">
              <tr>
                <td class="column" style="padding:0;margin:0;border: 1px solid #c3cdc9;border-radius:8px;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                    <tbody>
                      <tr>
                        <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;padding-top: 64px;">
                          <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="width: 161px;">
                          <h2 style="font-family:'Montserrat';color:#000000;font-weight:600;text-align: center; padding-top: 32px; padding-bottom: 3px;">Meeting Accepted</h2>
                          <table style="margin-bottom: 48px;">
                            <tbody>
                              <tr>
                                <td style="padding: 32px;">
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-weight: 600;text-align: left;">
                                    Hello!
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                                    ${acceptorName} has accepted your meeting request.
                                  </p>
                                  <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                                    <tr>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';"><strong>Date:</strong></td>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';">${formattedDate}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';"><strong>Time:</strong></td>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';">${formattedTime}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';"><strong>Title:</strong></td>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';">${meetingTitle}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';"><strong>Description:</strong></td>
                                      <td style="padding:10px; border-bottom:1px solid #eee; font-family:'Open Sans';">${meetingDescription || 'No description provided'}</td>
                                    </tr>
                                  </table>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                                    Please log in to your account to view the meeting details.
                                  </p>
                                  <div style="text-align:center; margin-top:30px;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:1030'}/meetings/my-meetings" style="background-color:#800020; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; font-family:'Montserrat'; font-weight:600;">View Meeting Details</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width: 100%; border-bottom: 1px solid #c3cdc9;">
                    <tbody>
                      <tr>
                        <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-top: 32px;">This message was sent to <span style="font-family:'Open Sans';color:#000000;">${recipientEmail}</span></p>
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-bottom: 32px;">
                            For any concerns, please contact <a href="mailto:support@example.com" style="color:#000000;text-decoration:underline;">support</a>.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="column" style="padding: 0 135px;;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width: 100%; margin-top: 32px; margin-bottom: 14px;" align="center">
                    <tbody>
                      <tr>
                        <td width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;text-align: center;">
                          <a href="#" target="_blank"><img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="width: 122px; margin:auto;"/></a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width: 100%;">
                    <tbody>
                      <tr>
                        <td style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;text-align: center; font-size: 14px; padding-bottom: 32px;">
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;">© ${new Date().getFullYear()} Guidia. All rights reserved.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
  };
};

module.exports = getMeetingAcceptedTemplate;
