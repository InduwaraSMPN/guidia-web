const getRegistrationPendingTemplate = (email, userType) => {
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Registration Under Review',
    text: `Your registration request as ${userType} is under verification. We will notify you once approved.`,
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
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2) format('woff2');
        }
      }
    </style>
  </head>
  <body style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
    <table width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
      <tbody>
        <tr>
          <td align="center">
            <table class="section header" cellpadding="0" cellspacing="0" width="600">
              <tr>
                <td class="column" style="padding:0;margin:0;border: 1px solid #c3cdc9;border-radius:8px;">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="center" style="padding-top: 64px;">
                          <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="width: 161px;">
                          <h2 style="font-family:'Montserrat';color:#000000;font-weight:600;text-align: center; padding-top: 32px; padding-bottom: 3px;">Registration Under Review</h2>
                          <table style="margin-bottom: 48px;">
                            <tbody>
                              <tr>
                                <td style="padding: 32px;">
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-weight: 600;text-align: left;">
                                    Hello!
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                                    Thank you for registering as a ${userType} on our platform.
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                                    Your registration request is currently under review by our team. We will carefully evaluate your application and notify you once it has been approved.
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                                    This process typically takes 1-2 business days. We appreciate your patience.
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-top: 32px;">
                                    This message was sent to <span style="font-family:'Open Sans';color:#000000;">${email}</span>
                                  </p>
                                  <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-bottom: 32px;">
                                    For any concerns, please contact <a href="mailto:support@example.com" style="color:#000000;text-decoration:underline;">support</a>.
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table width="100%">
                            <tbody>
                              <tr>
                                <td style="text-align: center; font-size: 14px; padding-bottom: 32px;">
                                  <p style="margin:0;padding:0;line-height:1.6;font-family:'Open Sans';color:#000000;">
                                    © ${new Date().getFullYear()} Gudia. All rights reserved.
                                  </p>
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
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
  };
};

module.exports = getRegistrationPendingTemplate;