const getRegistrationDeclinedTemplate = (email, reason) => {
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Registration Request Declined',
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
        }
      }
    </style>
  </head>
  <body style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
    <table width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;">
      <tbody>
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" style="margin:auto;border-radius:6px;border:1px solid #dddddd;padding:32px;">
              <tbody>
                <tr>
                  <td align="center">
                    <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="width: 161px;">
                    <h2 style="font-family:'Montserrat';color:#000000;font-weight:600;text-align:center;padding-top:32px;padding-bottom:3px;">Registration Status Update</h2>
                    <div style="padding: 32px;">
                      <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-weight:600;text-align:left;">
                        Hello,
                      </p>
                      <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align:left;">
                        We regret to inform you that your registration request has been declined.
                      </p>
                      <div style="background-color:#f8f8f8;border-radius:4px;padding:20px;margin:20px 0;">
                        <p style="margin:0;padding:0;line-height:1.6;font-family:'Open Sans';color:#666666;">
                          Reason for decline:
                        </p>
                        <p style="margin:0;padding:10px 0 0;line-height:1.6;font-family:'Open Sans';color:#000000;font-weight:600;">
                          ${reason}
                        </p>
                      </div>
                      <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size:14px;padding-top:32px;">
                        This message was sent to <span style="color:#000000;">${email}</span>
                      </p>
                      <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size:14px;">
                        For any concerns, please contact <a href="mailto:support@example.com" style="color:#000000;text-decoration:underline;">support</a>.
                      </p>
                    </div>
                    <p style="text-align:center;font-size:14px;color:#000000;font-family:'Open Sans';">
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
  </body>
</html>`
  };
};

module.exports = getRegistrationDeclinedTemplate;