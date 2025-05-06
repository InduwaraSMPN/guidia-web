const getWelcomeTemplate = (email, userName, userType, loginUrl) => {
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Guidia!',
    text: `Welcome to Guidia, ${userName || 'valued user'}! Your ${userType} account has been successfully created. You can now log in and start using our platform.`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Force IE/Edge rendering modes -->
  <title>Welcome to Guidia</title>
  <!--[if mso]>
  <style type="text/css">
    /* Outlook specific styles */
    body, table, td, p, a, h1, h2, h3 { font-family: Tahoma, Geneva, Verdana, sans-serif !important; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    .button a { padding: 8px 16px !important; } /* Fix button padding */
    .card-padding { padding: 30px !important; }
    .assistance-padding { padding: 30px !important; }
  </style>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <style type="text/css">
    /* Embedded CSS for clients that support it (like Gmail, Apple Mail) */
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap'); /* Web Font */
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap'); /* Web Font */

    /* Basic Reset - Applied via inline styles mostly, but good practice */
    body, table, td, div, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; max-width: 100%; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { word-wrap: break-word; }
    a { color: #800020; text-decoration: underline; }
    a:hover { color: #600018 !important; text-decoration: underline !important; } /* Hover effects */
    .login-btn:hover { background-color: #600018 !important; }
    .btn-primary:hover { background-color: #600018 !important; }

    /* Body Styles */
    body {
      font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fallback fonts */
      background-color: #f8fafc;
      line-height: 1.6;
      color: #1f2937;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Headings */
    h1, h2, h3 {
      font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fallback fonts */
      font-weight: 700;
      margin: 0;
      padding: 0;
      color: #000000;
    }

    /* Responsive Styles */
    @media only screen and (max-width: 619px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .content-cell { padding-left: 15px !important; padding-right: 15px !important; }
      .header-table { width: 100% !important; }
      .logo-cell img { width: 100px !important; }
      .login-btn-cell { text-align: right !important; }
      .main-content-cell { padding: 30px 15px !important; }
      .welcome-icon-cell img { width: 80px !important; height: 80px !important; }
      h1 { font-size: 28px !important; line-height: 1.3 !important; }
      h2 { font-size: 18px !important; line-height: 1.3 !important; }
      .intro-text-cell { padding: 0 0px !important; } /* Removed side padding for mobile */
      .setup-grid-table { width: 100% !important; }
      .setup-card-cell { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 25px !important; height: auto !important; }
      .setup-card-table { width: 100% !important; } /* Ensure card table fills cell */
      .card-padding { padding: 20px !important; }
      .assistance-cell { padding: 25px 15px !important; }
      .assistance-padding { padding: 20px !important; }
      .footer-cell { padding-left: 15px !important; padding-right: 15px !important; }
      .footer-logo img { height: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f8fafc; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937;">
  <!-- Extra wrapper for Outlook -->
  <!--[if mso | IE]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="960" align="center" style="width: 960px;">
  <tr>
  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
  <![endif]-->

  <!-- Main Container Table -->
  <table class="container-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 960px; margin: 0 auto;">
    <tr>
      <td class="content-cell" style="padding: 20px;">

        <!-- Header Table -->
        <table class="header-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
          <tr>
            <td class="logo-cell" valign="middle" style="width: 120px; padding: 0;">
              <img src="https://ik.imagekit.io/pasindunaduninduwara/logo.svg" alt="Guidia Logo" width="120" style="display: block; border: 0; max-width: 120px; height: auto;">
            </td>
            <td class="login-btn-cell" valign="middle" align="right" style="padding: 0;">
              <!-- Bulletproof Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="button" align="center" style="border-radius: 6px; background-color: #800020;">
                    <a href="http://localhost:1030/auth/login" target="_blank" class="login-btn" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 8px 16px; border: 1px solid #800020; border-radius: 6px; display: inline-block;">
                      Log in
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- End Header Table -->

        <!-- Main Content Table -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; -webkit-box-shadow: 0 4px 6px rgba(0,0,0,0.05); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td class="main-content-cell" align="center" style="padding: 40px 20px;">

              <!-- Welcome Icon -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 25px;">
                <tr>
                  <!-- Using an image for the icon as inline SVG is unreliable -->
                  <!-- Create a PNG/JPG version of your SVG checkmark icon with the pink circle background -->
                  <td class="welcome-icon-cell" align="center">
                     <div style="display: inline-block; border: 2px solid #eeeeee; border-radius: 50%; padding: 5px; background-color: #ffffff;">
                       <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNmOGVmZjEiLz48cGF0aCBkPSJNMzAgNTBMNDUgNjVMNzAgMzUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="Welcome Checkmark" width="100" height="100" style="display: block; width: 100px; height: 100px;">
                     </div>
                     <!-- Replace placeholder with actual image URL -->
                  </td>
                </tr>
              </table>

              <!-- Heading 1 -->
              <h1 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 700; font-size: 32px; color: #000000; margin: 0 0 12px 0; padding: 0; letter-spacing: -0.5px; text-align: center;">
                Welcome to Guidia!
              </h1>

              <!-- Heading 2 -->
              <h2 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; color: #6b7280; margin: 0 0 10px 0; padding: 0; text-align: center;">
                Complete Your Account Setup
              </h2>
              <!-- Replicating h2::after with a table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 30px auto;">
                <tr>
                  <td height="3" width="50" style="height: 3px; width: 50px; background-color: #800020; line-height: 3px; font-size: 3px; border-radius: 3px;"> </td>
                </tr>
              </table>


              <!-- Intro Text -->
              <!-- Replicating intro-text::before is hard. Option 1: Ignore it. Option 2: Use an image. Option 3: Use a styled table cell (less reliable). Let's ignore for robustness -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto 40px auto;">
                <tr>
                  <td class="intro-text-cell" align="center" style="padding: 0 20px;">
                      <p style="margin: 0; padding: 0; font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">
                        We're thrilled to have you join Guidia as a ${userType}. To get the most out of your account, please take a few moments to complete your setup. This will ensure you have full access to all our career development features and services.
                      </p>
                  </td>
                </tr>
              </table>


              <!-- Progress Indicator - Simplified Static Version -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 800px; margin: 0 auto 40px auto;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Step 1 (Active) -->
                        <td align="center" valign="top">
                          <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border: 3px solid #800020; border-radius: 50%; overflow: hidden; text-align: center; line-height: 40px; color: #800020; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: bold;">1</div>
                        </td>
                        <td width="30" style="width: 30px;"></td> <!-- Spacer -->
                        <!-- Step 2 -->
                        <td align="center" valign="top">
                          <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border: 3px solid #e5e7eb; border-radius: 50%; overflow: hidden; text-align: center; line-height: 40px; color: #9ca3af; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: bold;">2</div>
                        </td>
                        <td width="30" style="width: 30px;"></td> <!-- Spacer -->
                        <!-- Step 3 -->
                        <td align="center" valign="top">
                          <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border: 3px solid #e5e7eb; border-radius: 50%; overflow: hidden; text-align: center; line-height: 40px; color: #9ca3af; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: bold;">3</div>
                        </td>
                        <td width="30" style="width: 30px;"></td> <!-- Spacer -->
                        <!-- Step 4 -->
                        <td align="center" valign="top">
                          <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border: 3px solid #e5e7eb; border-radius: 50%; overflow: hidden; text-align: center; line-height: 40px; color: #9ca3af; font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: bold;">4</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>


              <!-- Setup Grid Table -->
              <!-- Using nested tables to simulate grid. Responsive handled by @media queries stacking cells. -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 800px; margin: 0 auto 50px auto;">
                <tr>
                  <td> <!-- Wrapper cell for spacing -->
                    <table class="setup-grid-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Card 1 -->
                        <td class="setup-card-cell" valign="top" width="48%" style="padding-right: 4%; height: 100%;"> <!-- Adjust width & padding for spacing -->
                          <table class="setup-card-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-radius: 16px; border: 2px solid #eeeeee; height: 100%; overflow: hidden;">
                            <tr>
                              <td class="card-padding" style="padding: 30px; text-align: left; border-radius: 16px;">
                                <!-- Card Icon - Needs image -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                   <tr>
                                     <td><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xNSAyMGgzMHYyMEgxNXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTE1IDIwbDE1IDEwIDE1LTEwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDAwMjAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==" alt="Profile Icon" width="60" height="60" style="display: block; border-radius: 50%; border: 0; width: 60px; height: 60px; background-color: #ffffff;"></td>
                                     <!-- Replace placeholder -->
                                   </tr>
                                </table>
                                <h3 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #000000;">Complete Your Profile</h3>
                                <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">Take a moment to complete your ${userType.toLowerCase()} profile...</p>
                                <!-- Bulletproof Button -->
                                <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td class="button" align="center" style="border-radius: 8px; background-color: #800020;">
                                      <a href="${userType === 'Student' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/welcome/profile` : userType === 'Counselor' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/welcome/counselor` : `${process.env.FRONTEND_URL || 'http://localhost:1030'}/welcome/company`}" target="_blank" class="btn btn-primary" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 110px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border: 1px solid #800020; border-radius: 8px; display: inline-block;">Update profile</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Card 2 -->
                        <td class="setup-card-cell" valign="top" width="48%" style="height: 100%;"> <!-- Adjust width for spacing -->
                           <table class="setup-card-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-radius: 16px; border: 2px solid #eeeeee; height: 100%; overflow: hidden;">
                             <tr>
                               <td class="card-padding" style="padding: 30px; text-align: left; border-radius: 16px;">
                                 <!-- Card Icon - Needs image -->
                                 <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                    <tr>
                                      <td><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHg9IjIwIiB5PSIyNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiByeD0iMiIgcnk9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTI1IDI1di01YTUgNSAwIDAxMTAgMHY1IiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDAwMjAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzIiIHI9IjIiIGZpbGw9IiM4MDAwMjAiLz48L3N2Zz4=" alt="Features Icon" width="60" height="60" style="display: block; border-radius: 50%; border: 0; width: 60px; height: 60px; background-color: #ffffff;"></td>
                                      <!-- Replace placeholder -->
                                    </tr>
                                 </table>
                                 <h3 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #000000;">Explore Features</h3>
                                 <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">Discover all the features Guidia offers...</p>
                                 <!-- Bulletproof Button -->
                                 <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                   <tr>
                                     <td class="button" align="center" style="border-radius: 8px; background-color: #800020;">
                                       <a href="${process.env.FRONTEND_URL || 'http://localhost:1030'}/features" target="_blank" class="btn btn-primary" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 110px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border: 1px solid #800020; border-radius: 8px; display: inline-block;">Explore now</a>
                                     </td>
                                   </tr>
                                 </table>
                               </td>
                             </tr>
                           </table>
                        </td>
                      </tr>
                      <!-- Spacer Row -->
                      <tr><td height="25" style="font-size: 0; line-height: 0;"> </td></tr>
                      <tr>
                         <!-- Card 3 -->
                         <td class="setup-card-cell" valign="top" width="48%" style="padding-right: 4%; height: 100%;"> <!-- Adjust width & padding for spacing -->
                           <table class="setup-card-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-radius: 16px; border: 2px solid #eeeeee; height: 100%; overflow: hidden;">
                             <tr>
                               <td class="card-padding" style="padding: 30px; text-align: left; border-radius: 16px;">
                                 <!-- Card Icon - Needs image -->
                                 <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                    <tr>
                                      <td><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0yMCAzMGM1LTggMTUtOCAyMCAwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDAwMjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwIDMwYy01IDggNSA4IDEwIDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDAgMzBjNSA4LTUgOC0xMCA4IiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDAwMjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+" alt="Connect Icon" width="60" height="60" style="display: block; border-radius: 50%; border: 0; width: 60px; height: 60px; background-color: #ffffff;"></td>
                                      <!-- Replace placeholder -->
                                    </tr>
                                 </table>
                                 <h3 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #000000;">${userType === 'Student' ? 'Connect with Counselors' : userType === 'Counselor' ? 'Connect with Students' : 'Post Job Opportunities'}</h3>
                                 <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">${userType === 'Student' ? 'Browse and connect with career counselors...' : userType === 'Counselor' ? 'Connect with students seeking career guidance...' : 'Post job opportunities and connect...'}</p>
                                 <!-- Bulletproof Button -->
                                 <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                   <tr>
                                     <td class="button" align="center" style="border-radius: 8px; background-color: #800020;">
                                       <a href="${userType === 'Student' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/counselors` : userType === 'Counselor' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/students` : `${process.env.FRONTEND_URL || 'http://localhost:1030'}/jobs/post`}" target="_blank" class="btn btn-primary" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 110px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border: 1px solid #800020; border-radius: 8px; display: inline-block;">${userType === 'Student' ? 'Find counselors' : userType === 'Counselor' ? 'Connect with students' : 'Post jobs'}</a>
                                     </td>
                                   </tr>
                                 </table>
                               </td>
                             </tr>
                           </table>
                         </td>

                         <!-- Card 4 -->
                         <td class="setup-card-cell" valign="top" width="48%" style="height: 100%;"> <!-- Adjust width for spacing -->
                            <table class="setup-card-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-radius: 16px; border: 2px solid #eeeeee; height: 100%; overflow: hidden;">
                              <tr>
                                <td class="card-padding" style="padding: 30px; text-align: left; border-radius: 16px;">
                                  <!-- Card Icon - Needs image -->
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                     <tr>
                                       <td><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iI2ZmZmZmZiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMjIiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTE1IDQ1YzAtOCAxNS04IDE1LTggMTUgMCAxNSA4IDE1IDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwMDAyMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=" alt="Jobs/Availability Icon" width="60" height="60" style="display: block; border-radius: 50%; border: 0; width: 60px; height: 60px; background-color: #ffffff;"></td>
                                       <!-- Replace placeholder -->
                                     </tr>
                                  </table>
                                  <h3 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #000000;">${userType === 'Student' ? 'Explore Job Listings' : userType === 'Counselor' ? 'Set Meeting Availability' : 'Browse Student Profiles'}</h3>
                                  <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">${userType === 'Student' ? 'Browse job listings from companies...' : userType === 'Counselor' ? 'Set your availability for meetings...' : 'Browse student profiles to find...'}</p>
                                  <!-- Bulletproof Button -->
                                  <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                      <td class="button" align="center" style="border-radius: 8px; background-color: #800020;">
                                        <a href="${userType === 'Student' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/jobs` : userType === 'Counselor' ? `${process.env.FRONTEND_URL || 'http://localhost:1030'}/meetings/set-availability` : `${process.env.FRONTEND_URL || 'http://localhost:1030'}/students`}" target="_blank" class="btn btn-primary" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 110px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border: 1px solid #800020; border-radius: 8px; display: inline-block;">${userType === 'Student' ? 'View jobs' : userType === 'Counselor' ? 'Set availability' : 'Browse students'}</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                         </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- End Setup Grid Table -->


              <!-- Assistance Section -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                 <tr>
                   <td class="assistance-cell" align="center" style="background-color: #f8f8f8; border-radius: 16px; padding: 30px; overflow: hidden;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                              <td class="assistance-padding" align="center">
                                 <h3 style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 22px; font-weight: 600; margin: 0 0 15px 0; color: #000000;">Need Assistance?</h3>
                                 <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0 0 25px 0; font-size: 16px; color: #6b7280; line-height: 1.7;">If you have any questions or need assistance... </p>
                                 <!-- Bulletproof Button -->
                                 <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                   <tr>
                                     <td class="button" align="center" style="border-radius: 8px; background-color: #800020;">
                                       <a href="mailto:support@guidia.com" target="_blank" class="btn btn-primary" style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 110px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border: 1px solid #800020; border-radius: 8px; display: inline-block;">Contact us</a>
                                     </td>
                                   </tr>
                                 </table>
                              </td>
                          </tr>
                      </table>
                   </td>
                 </tr>
              </table>
              <!-- End Assistance Section -->

            </td>
          </tr>
        </table>
        <!-- End Main Content Table -->

        <!-- Footer Table -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; padding-top: 20px;"> <!-- Added padding-top instead of py-12 class -->
          <tr>
            <td class="footer-cell" align="center" style="padding: 0 10px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                <tr>
                  <td align="center">
                    <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 5px 0;">
                      This message was sent to <span style="color: #1f2937; text-decoration: none;">${email}</span>.
                    </p>
                    <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
                      For any concerns, please contact <a href="mailto:support@guidia.com" target="_blank" style="color: #1f2937; text-decoration: underline;">support@guidia.com</a>.
                    </p>
                    <div class="footer-logo" style="margin-bottom: 20px;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:1030'}" target="_blank" style="text-decoration: none;">
                        <img src="https://ik.imagekit.io/pasindunaduninduwara/logo.svg" alt="Guidia Logo" height="32" style="display: inline-block; border: 0; height: 32px; width: auto;">
                      </a>
                    </div>
                    <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 5px 0;">
                      Guidia Inc. Anuradhapura, Sri Lanka.
                    </p>
                    <p style="font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
                      © ${new Date().getFullYear()} Guidia. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- End Footer Table -->

      </td>
    </tr>
  </table>
  <!-- End Main Container Table -->

  <!--[if mso | IE]>
  </td>
  </tr>
  </table>
  <![endif]-->

</body>
</html>`
  };
};

module.exports = getWelcomeTemplate;
