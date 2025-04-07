const getOTPEmailTemplate = (email, otp) => {
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Registration OTP',
    text: `Your OTP for registration is: ${otp}. This code will expire in 10 minutes.`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Updated font imports to include Montserrat and Open Sans -->
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
    <!-- Updated all font-family references throughout the document -->
    <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;"></p>
    <table width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
      <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
          <td class="wrapper" width="600" align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;padding-left:10px;padding-right:10px;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
            <table class="section header" cellpadding="0" cellspacing="0" width="600" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:initial;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
              <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                <td class="column" style="padding:0;margin:0;border: 1px solid #c3cdc9;border-radius:8px;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                    <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                      <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;padding-top: 64px;">
                          <img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width:100%;display:block;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 161px;">
                          <!-- Updated to Montserrat for heading -->
                          <h2 style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Montserrat';color:#000000;font-weight:600;text-align: center; padding-top: 32px; padding-bottom: 3px;">One-Time Password (OTP)</h2>
                          <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;margin-bottom: 48px;">
                            <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                              <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <td align="left" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;border-top: 1px solid #c3cdc9;
                          padding: 46px 54px 64px;">
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-weight: 600;text-align: left;">
                            Hello!
                          </p>
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                            Enter the following OTP to complete your registration
                          </p>
                          <!-- OTP with Montserrat font, dashed border, and click-to-copy functionality -->
                          <div style="margin:15px auto;padding:12px;line-height:1.6;font-family:'Montserrat';color:#800020;font-weight:600;font-size:24px;text-align:center;border:2px dashed #800020;border-radius:8px;width:fit-content;cursor:pointer;user-select:all;" 
                               onclick="(function(otp){try{navigator.clipboard.writeText(otp).then(function(){alert('OTP copied to clipboard!')}).catch(function(err){console.error('Failed to copy',err);})}catch(e){}}('${otp}'))" 
                               title="Click to copy OTP">
                            ${otp}
                          </div>
                          <!-- Script for copy functionality -->
                          <script type="text/javascript">
                            function copyOTP(otp) {
                              navigator.clipboard.writeText(otp)
                                .then(() => {
                                  alert('OTP copied to clipboard!');
                                })
                                .catch(err => {
                                  console.error('Failed to copy OTP: ', err);
                                });
                            }
                          </script>
                          <!-- Fallback for email clients that strip scripts -->
                          <p style="margin:0;padding:10px 0;font-family:'Open Sans';color:#666;font-size:12px;text-align:center;">
                            Click on the code to copy it
                          </p>
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                            Your OTP is only valid for 10 minutes. Please do not share this code with anyone.
                          </p>
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;text-align: left;">
                            If you did not initiate this registration, please disregard this email.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%; border-bottom: 1px solid #c3cdc9;">
                    <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                      <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-top: 32px;">This message was sent to <span style="font-family:'Open Sans';color:#000000;">${email}</span></p>
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#666666;font-size: 14px; padding-bottom: 32px;">
                            For any concerns, please contact <a href="mailto:support@example.com" style="color:#000000;text-decoration:underline;">support</a>.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                <td class="column" style="padding: 0 135px;;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%; margin-top: 32px; margin-bottom: 14px;" align="center">
                    <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                      <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <td width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: center;">
                          <a href="#" target="_blank"><img src="https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width:100%;display:block;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 122px; margin:auto;"/></a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                  <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%;">
                    <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                      <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <td style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: center; font-size: 14px; padding-bottom: 32px;">
                          <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Open Sans';color:#000000;font-family:'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">© ${new Date().getFullYear()} Gudia. All rights reserved.</p>
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

module.exports = getOTPEmailTemplate;

