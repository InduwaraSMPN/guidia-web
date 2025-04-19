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
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzk2IiBoZWlnaHQ9IjkyIiB2aWV3Qm94PSIwIDAgMzk2IDkyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTY2Ljk4IDY4VjYwLjA5QzE2Mi45OCA2NC41IDE1NC43NCA2OS4zMSAxNDEuODUgNjkuMzFDMTIxLjM3IDY5LjMxIDEwOC44OSA1NS4yIDEwOC44OSAzOS4wNEMxMDguODkgMjIuODggMTIyLjExIDkuMDIwMDIgMTQzLjMyIDkuMDIwMDJDMTU0LjgyIDkuMDIwMDIgMTY4LjI4IDEzLjQzIDE3My43NSAyNC4xOUwxNjUuNzYgMjYuNjRDMTYyLjMzIDIxLjU4IDE1NS40OCAxNi4wMyAxNDMuOSAxNi4wM0MxMjkuNzkgMTYuMDMgMTE3LjYzIDI0LjAzIDExNy42MyAzOC43MUMxMTcuNjMgNTQuMzcgMTMwLjAzIDYyLjQ1IDE0My42NSA2Mi40NUMxNTEuNjQgNjIuNDUgMTYwLjYyIDU5LjAyIDE2NC45NCA1MS45M0MxNjYuNDkgNDkuMzIgMTY2LjgyIDQ3LjM2IDE2Ny4yMiA0NC41MUgxNDEuODVWMzcuNjZIMTc0LjA3VjY4LjAxSDE2Ni45N0wxNjYuOTggNjhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0yMjQuODIgNjhWNjIuOTRDMjI0LjA5IDYzLjU5IDIyMi43OCA2NC43MyAyMjAuNjYgNjYuMDRDMjE1LjQ0IDY5LjIyIDIwOS4wOCA2OS4zOCAyMDcuMjggNjkuMzhDMjAyLjE0IDY5LjM4IDE5MS4yMSA2Ny45MSAxODcuNDYgNjAuMDhDMTg1LjgzIDU2Ljc0IDE4NS44MyA1Mi42NiAxODUuODMgNDkuMDdWMjguMTlIMTkzLjVWNDguMjZDMTkzLjUgNTIuMjYgMTkzLjgzIDU0LjMgMTk0LjU2IDU2LjA5QzE5Ny4yNSA2Mi4zNyAyMDYuNDcgNjIuNTQgMjA4LjAyIDYyLjU0QzIxNi40MiA2Mi41NCAyMjEuNjQgNTguNjIgMjIzLjQ0IDU1LjYxQzIyNC42NiA1My40OSAyMjQuNjYgNTEuNjEgMjI0LjY2IDQ5LjI1VjI4LjJIMjMyLjQxVjY4LjAxSDIyNC44MlY2OFoiIGZpbGw9IiM1RTA1MEMiLz4KPHBhdGggZD0iTTMwNC43NyA2OFY2Mi43QzMwMi44OSA2NC40MSAyOTcuNzUgNjguNzQgMjg2LjkgNjguNzRDMjg0LjQ1IDY4Ljc0IDI3Ny40NCA2OC41OCAyNzEuNDggNjQuMTdDMjY4Ljg3IDYyLjI5IDI2My4yNCA1Ni45OSAyNjMuMjQgNDcuNzdDMjYzLjI0IDQ1IDI2My44MSAzOC40NyAyNjkuNjggMzMuMjVDMjcyLjI5IDMwLjk3IDI3OC4xNiAyNy4yMSAyODcuMTQgMjcuMjFDMjkwIDI3LjIxIDI5OC4wNyAyNy42MiAzMDQuNzYgMzIuODRWMTAuNDFIMzEyLjUxVjY4LjAxSDMwNC43NkwzMDQuNzcgNjhaTTMwMS4xIDM3LjczQzI5Ni4zNyAzMy40OSAyODkuNiAzMy40MSAyODcuNjQgMzMuNDFDMjc4LjM0IDMzLjQxIDI3MS4zMiAzOC45NiAyNzEuMzIgNDguNDJDMjcxLjMyIDU2LjI1IDI3Ny4wMyA2Mi4zNyAyODcuODggNjIuMzdDMjk1LjMgNjIuMzcgMzA1LjE4IDU5LjYgMzA1LjE4IDQ3LjY5QzMwNS4xOCA0NS44MSAzMDUuMSA0MS4zMyAzMDEuMSAzNy43NFYzNy43M1oiIGZpbGw9IiM1RTA1MEMiLz4KPHBhdGggZD0iTTI1Mi43OCAyOC4xOEgyNDUuMDNWNjcuOTlIMjUyLjc4VjI4LjE4WiIgZmlsbD0iIzVFMDUwQyIvPgo8cGF0aCBkPSJNMjUyLjM4IDE0LjgzQzI1MS4xIDEzLjY4IDI0OS4yNyAxMy42NiAyNDguNzQgMTMuNjZDMjQ2LjIyIDEzLjY2IDI0NC4zMyAxNS4xNiAyNDQuMzMgMTcuNzJDMjQ0LjMzIDE5Ljg0IDI0NS44NyAyMS40OSAyNDguODEgMjEuNDlDMjUwLjgyIDIxLjQ5IDI1My40OSAyMC43NCAyNTMuNDkgMTcuNTJDMjUzLjQ5IDE3LjAxIDI1My40NyAxNS44IDI1Mi4zOSAxNC44M0gyNTIuMzhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0zMzIuMjUgMTQuODNDMzMwLjk3IDEzLjY4IDMyOS4xNCAxMy42NiAzMjguNjEgMTMuNjZDMzI2LjA5IDEzLjY2IDMyNC4yIDE1LjE2IDMyNC4yIDE3LjcyQzMyNC4yIDE5Ljg0IDMyNS43NCAyMS40OSAzMjguNjggMjEuNDlDMzMwLjY5IDIxLjQ5IDMzMy4zNiAyMC43NCAzMzMuMzYgMTcuNTJDMzMzLjM2IDE3LjAxIDMzMy4zNCAxNS44IDMzMi4yNiAxNC44M0gzMzIuMjVaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0zMzIuNjUgMjguMThIMzI0LjlWNjcuOTlIMzMyLjY1VjI4LjE4WiIgZmlsbD0iIzVFMDUwQyIvPgo8cGF0aCBkPSJNMzg4LjE1IDY4LjRDMzgxLjM4IDY4LjQgMzgwLjgxIDY0LjU3IDM4MC40OCA2MS42M0MzNzkuMDEgNjQuNTcgMzczLjIyIDY5LjQ2IDM2MS4zMSA2OS40NkMzNDYuMTQgNjkuNDYgMzQyLjYzIDYxLjMgMzQyLjYzIDU1Ljc1QzM0Mi42MyA0OC45IDM0Ny41MiA0NS45NiAzNDkuNjUgNDUuMDZDMzUzLjQ4IDQzLjM1IDM1OS42OCA0My4xOCAzNjkuMDcgNDMuMThIMzgwLjQxVjQyLjJDMzgwLjQxIDM3LjMxIDM4MC4zMyAzMi41NyAzNjcuMTkgMzIuNTdDMzYxLjIzIDMyLjU3IDM1NC43OSAzMy42MyAzNTMuMDggMzcuNzlMMzQ1LjI1IDM3LjA2QzM0NS4zMyAzNi43MyAzNDYuMDcgMzQuNjEgMzQ3LjA0IDMzLjE0QzM0OC41OSAzMC44NiAzNTIuMDIgMjYuOTQgMzY2Ljc4IDI2Ljk0QzM2Ny45MiAyNi45NCAzNzMuNTUgMjcuMDIgMzc4LjEyIDI4LjE2QzM3OS4xOCAyOC40IDM4My4zNCAyOS4zIDM4NS43MSAzMi40OEMzODcuNjcgMzUuMDkgMzg3LjY3IDM3Ljc4IDM4Ny42NyA0MC44VjU2LjcxQzM4Ny42NyA2MS4yOCAzODguNCA2Mi44MyAzOTIuMTYgNjIuODNDMzkyLjg5IDYyLjgzIDM5NS4wMiA2Mi41OSAzOTUuMDIgNjIuNTlWNjcuOTdDMzkyLjc0IDY4LjEzIDM5MC40NSA2OC4zOCAzODguMTcgNjguMzhMMzg4LjE1IDY4LjRaTTM2NS44OCA0OS4xNUMzNTguMDUgNDkuMTUgMzUwLjM4IDQ5LjE1IDM1MC4zOCA1NS42OEMzNTAuMzggNTkuNiAzNTMuOTcgNjMuNTEgMzYxLjg4IDYzLjUxQzM2Ni41MyA2My41MSAzNzUuMzQgNjIuNDUgMzc5LjAxIDU1LjY4QzM4MC40OCA1Mi45MSAzODAuNCA1MC4zIDM4MC40OCA0OS4xNUgzNjUuODhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0yOS4wNDk4IDg4LjI1QzI5LjMyOTggODYuNTEgMjkuNTk5OCA4NC43NyAyOS45MDk4IDgzLjA0QzI5LjkzOTggODIuODYgMzAuMTY5OCA4Mi42NCAzMC4zNDk4IDgyLjU4QzMyLjk4OTggODEuNzggMzUuMjQ5OCA4MC4zMyAzNy4xNzk4IDc4LjQyQzM4LjI5OTggNzcuMzEgMzkuMjE5NyA3Ni4wMSA0MC4yMzk3IDc0LjhDNDAuNDk5NyA3NC40OSA0MC4zNjk4IDc0LjI5IDQwLjA5OTggNzQuMTFDMzguNzc5OCA3My4yMSAzOC40MDk4IDcxLjggMzguMTU5OCA3MC4zNkMzOC4xMjk4IDcwLjIxIDM4LjMzOTggNjkuODkgMzguNDk5OCA2OS44NEM0MC41MTk4IDY5LjE3IDQyLjU1OTcgNjkuMTMgNDQuNTk5OCA2OS43OEM0NC43Mjk4IDY5LjgyIDQ0Ljg2OTggNzAuMDYgNDQuODc5NyA3MC4yMUM0NC45MTk4IDcxLjQ1IDQ0Ljc3OTggNzIuNzUgNDQuMDA5OCA3My42OEM0My40NTk4IDc0LjM0IDQzLjQ4OTggNzQuOTMgNDMuNDk5OCA3NS42QzQzLjU0OTggNzkuODQgNDIuMjM5OCA4My42NyAzOS45MDk4IDg3LjE0QzM4LjkyOTggODguNiAzNy41OTk4IDg5Ljg0IDM2LjM5OTggOTEuMTVDMzYuMjU5OCA5MS4zIDM1LjkxOTggOTEuMzcgMzUuNjk5NyA5MS4zM0MzMy42NTk3IDkxLjAzIDMxLjYwOTggOTAuNyAyOS41Nzk4IDkwLjM1QzI5LjQxOTggOTAuMzIgMjkuMjA5OCA5MC4wNyAyOS4xOTk4IDg5LjlDMjkuMTQ5OCA4OS4zNiAyOS4xNzk4IDg4LjgxIDI5LjE3OTggODguMjdDMjkuMTM5OCA4OC4yNyAyOS4wODk4IDg4LjI2IDI5LjA0OTggODguMjVaTTQyLjg4OTggNDUuNjJDNDIuMjE5OCA0NC41NSA0MS40Njk4IDQzLjU0OTkgNDAuMTM5OCA0My4xNkMzOC45Mjk4IDQyLjgxIDM3Ljk3OTggNDMuMjggMzcuNDY5OCA0NC40NEMzNi41MDk4IDQ2LjYzIDM4LjMxOTggNTAuNzIgNDAuNTM5OCA1MS43OEM0MS41Mzk4IDUyLjI1IDQyLjk2OTggNTIuMDEgNDMuMzE5OCA1MS4yOEM0My42Mjk4IDUwLjYyIDQzLjc5OTggNDkuOSA0My45NTk4IDQ5LjQyQzQzLjc5OTggNDcuOTIgNDMuNTY5OCA0Ni42OSA0Mi44OTk4IDQ1LjYzTDQyLjg4OTggNDUuNjJaTTUyLjA1OTcgNDEuMzhDNTEuNjU5NyA0MC44IDUxLjIzOTcgNDAuMjUgNTAuNDg5NyA0MC4xQzQ5LjgzOTcgMzkuOTcgNDkuNTc5OCA0MC4xNCA0OS41NDk4IDQwLjhDNDkuNDI5OCA0My4zNCA1MC40MDk4IDQ1LjQ1IDUyLjEzOTggNDcuMjVDNTIuNDc5OCA0Ny42IDUyLjk1OTggNDcuOTYgNTMuMzk5OCA0Ny42NUM1My42OTk4IDQ3LjQ0IDUzLjc2OTggNDYuODkgNTMuOTM5OCA0Ni40OUM1My45NTk4IDQ2LjQzIDUzLjkzOTggNDYuMzYgNTMuOTM5OCA0Ni4zQzUzLjc4OTggNDQuNDggNTMuMDg5NyA0Mi44NiA1Mi4wNTk3IDQxLjM4Wk05Mi43Nzk4IDU4LjU4QzkxLjczOTggNjEuNzggODkuNzg5OCA2NC4zMSA4Ny4xNTk4IDY2LjMyQzg1Ljc0OTggNjcuNCA4NC4xNTk4IDY4LjE5IDgyLjQzOTggNjguNzNDODEuMDA5OCA2OS4xOCA3OS42Mzk4IDY5Ljc4IDc4LjIzOTggNzAuMzFDNzcuMTU5OCA3MC43MSA3Ni4wNzk4IDcxLjEyIDc0Ljk5OTggNzEuNUM3My42Njk4IDcxLjk3IDcyLjMxOTggNzIuNCA3MC45ODk4IDcyLjg4QzY5LjQ5OTggNzMuNDIgNjguMDE5OCA3NCA2Ni41Mjk4IDc0LjU1QzY1LjUwOTggNzQuOTMgNjQuNDk5OCA3NS4zMSA2My40Njk4IDc1LjY3QzYyLjAyOTggNzYuMTcgNjAuNTc5OCA3Ni42NCA1OS4xNDk4IDc3LjE2QzU3LjY3OTggNzcuNjg5OSA1Ni4yMTk4IDc4LjI3IDU0Ljc1OTggNzguODJDNTQuNDk5OCA3OC45MiA1NC4yMzk3IDc5LjAxIDUzLjg3OTcgNzguOTlDNTQuMDU5NyA3OC43MiA1NC4yNTk4IDc4LjQ1IDU0LjQxOTggNzguMTdDNTYuNzg5NyA3NC4yMyA1OS45MTk4IDcwLjkzIDYzLjMwOTcgNjcuODhDNjYuMDQ5OCA2NS40MiA2OC41MDk4IDYyLjc1IDcwLjM0OTggNTkuNTVDNzEuODk5OCA1Ni44NiA3My4xNDk3IDU0LjA0IDc0LjA1OTggNTEuMDdDNzQuMTc5OCA1MC42OCA3NC4wNzk4IDUwLjUgNzMuNjk5OCA1MC40MUM3My4yMDk4IDUwLjI5IDcyLjcyOTggNTAuMTUgNzIuMTk5OCA1MC4wMUM3Mi40Mzk4IDQ5LjQ4IDcyLjY1OTggNDguOTUgNzIuOTA5OCA0OC40M0M3NC4yMTk4IDQ1LjcgNzQuOTI5NyA0Mi44MSA3NS4wODk4IDM5LjgxQzc1LjEzOTggMzguOTUgNzQuODQ5OCAzOC4wNiA3NC42NTk4IDM3LjJDNzQuNTk5OCAzNi45NSA3NC4zNzk4IDM2LjcxIDc0LjE3OTggMzYuNTNDNzMuNTk5OCAzNi4wMiA3My4wNTk4IDM2LjE2OTkgNzIuODU5OCAzNi45MUM3Mi41OTk4IDM3Ljg4IDcyLjQwOTggMzguODYgNzIuMTY5OCAzOS44M0M3Mi4xMjk4IDQwIDcxLjk3OTggNDAuMTQgNzEuODg5OCA0MC4yOUM3MS43Njk4IDQwLjEzIDcxLjU2OTggMzkuOTkgNzEuNTI5OCAzOS44MkM3MS4xOTk4IDM4LjUzIDcwLjkyOTcgMzcuMjMgNzAuNTg5OCAzNS45NUM3MC4yNDk4IDM0LjY5IDY5LjM0OTggMzMuOSA2OC4zNjk4IDMzLjg3QzY3LjgyOTggMzMuODUgNjcuNTM5OCAzNC4wMyA2Ny41Njk4IDM0LjYxQzY3LjY0OTggMzYuMDQgNjcuNzA5OCAzNy40OCA2Ny43Njk4IDM4LjkyQzY3Ljc2OTggMzkuMTMgNjcuNzY5OCAzOS4zNSA2Ny43Njk4IDM5LjU3QzY3LjI0OTggMzkuNzUgNjcuMDQ5OCAzOS41NiA2Ni45MDk4IDM5LjA0QzY2LjUxOTggMzcuNTkgNjYuMTQ5OCAzNi4xMSA2NS4wMDk4IDM1LjAyQzY0LjcyOTggMzQuNzUgNjQuMzg5OCAzNC41MyA2NC4wMzk4IDM0LjM4QzYzLjMxOTggMzQuMDggNjIuOTA5OCAzNC4zOCA2My4wMDk4IDM1LjE1QzYzLjE2OTggMzYuMjkgNjMuMzU5NyAzNy40MyA2My41OTk4IDM4LjU2QzY0LjIwOTggNDEuNSA2NC4xNzk3IDQ0LjQ1IDYzLjY2OTggNDcuMzlDNjMuNjQ5NyA0Ny40OSA2My42MDk3IDQ3LjU5IDYzLjU1OTcgNDcuNzRDNjMuMTM5OCA0Ny42NSA2Mi43MTk3IDQ3LjU5IDYyLjMzOTcgNDcuNDZDNjEuODQ5NyA0Ny4yOSA2MS43Mjk4IDQ3LjQzIDYxLjY0OTggNDcuOTRDNjEuMDA5OCA1Mi4yMyA1OS41Mjk4IDU2LjE4IDU2LjQ5OTggNTkuMzdDNTUuMTc5OCA2MC43NiA1My41NTk4IDYxLjg3IDUyLjA2OTggNjMuMUM1MS45Mjk4IDYzLjIxIDUxLjczOTcgNjMuMjYgNTEuNDg5NyA2My4yMUM1Mi4wNjk4IDYyLjc1IDUyLjY4OTggNjIuMzMgNTMuMjM5NyA2MS44M0M1NS41ODk3IDU5LjY4IDU2LjkyOTggNTcuMDQgNTcuMTM5OCA1My44M0M1Ny4zNzk4IDUwLjEyIDU2LjQ5OTggNDYuNjIgNTUuMjQ5OCA0My4xN0M1NC4yNzk4IDQwLjQ4IDUyLjU3OTggMzguMyA1MC41MTk3IDM2LjM4QzQ5LjkzOTcgMzUuODQgNDkuMjM5NyAzNS40MSA0OC41NTk3IDM0Ljk5QzQ4LjI0OTcgMzQuNzkgNDguMTQ5OCAzNC42NCA0OC4yNDk4IDM0LjI3QzQ4Ljk0OTggMzEuNTMgNDguNzk5OCAyOC44MyA0Ny43ODk4IDI2LjE5QzQ3LjUzOTggMjUuNTQgNDcuNDU5OCAyNS41NSA0Ni44Nzk3IDI1Ljk5QzQ1LjQ2OTcgMjcuMDYgNDQuMDQ5NyAyOC4xMSA0Mi42Mjk3IDI5LjE3QzQxLjUwOTggMzAuMDEgNDAuMzg5OCAzMC44NiAzOS4yOTk4IDMxLjY4QzM4LjkyOTggMzAuMTQgMzguNTQ5OCAyOC41OCAzOC4xMzk4IDI2Ljg3QzM3LjgyOTggMjcuMSAzNy42Nzk4IDI3LjIxIDM3LjUzOTggMjcuMzFDMzYuMjY5OCAyOC4yMyAzNC45ODk4IDI5LjE1IDMzLjcyOTggMzAuMDlDMzMuMTU5OCAzMC41MSAzMi42MTk4IDMwLjk5IDMyLjAzOTggMzEuNDFDMzAuMTc5OCAzMi43OSAyOC4yOTk4IDM0LjEzIDI2LjQ1OTggMzUuNTRDMjMuMjQ5OCAzOC4wMSAyMC44Njk4IDQxLjExIDE5LjYzOTggNDVDMTguOTc5OCA0Ny4wOSAxOC42Njk4IDQ5LjI0IDE4LjgzOTggNTEuNDVDMTguODc5OCA1MS45IDE4Ljc3OTggNTIuMTggMTguNDA5OCA1Mi41MUMxNy4xOTk4IDUzLjU1IDE2LjgxOTggNTUgMTYuODU5OCA1Ni41MkMxNi44OTk4IDU4LjAzIDE3LjQwOTggNTkuNDQgMTguMzU5OCA2MC42M0MxOS41Mzk4IDYyLjEgMjEuMTA5OCA2Mi43MiAyMi45Nzk4IDYyLjUxQzIzLjUwOTggNjIuNDUgMjMuODI5OCA2Mi41MSAyNC4yMTk4IDYzQzI0LjcxOTggNjMuNjUgMjUuNDg5OCA2NC4wOSAyNi4xNzk4IDY0LjU4QzI2LjczOTggNjQuOTggMjcuMzQ5OCA2NS4zMSAyNy45NDk4IDY1LjY2QzMxLjEwOTggNjcuNTcgMzQuNjA5OCA2Ny45OCAzOC4yMDk4IDY3LjkyQzM4LjM3OTcgNjcuOTIgMzguNTQ5OCA2Ny45MiAzOC43MDk4IDY3LjkyQzM4LjcxOTcgNjcuOTggMzguNzM5OCA2OC4wMyAzOC43NDk4IDY4LjA5QzM4LjM2OTggNjguMiAzNy45OTk4IDY4LjM0IDM3LjYxOTggNjguNDFDMzQuMzc5OCA2OC45OTk5IDMxLjExOTggNjkuMjYgMjcuODc5OCA2OC40OUMyNi41Mzk4IDY4LjE3IDI1LjI2OTggNjcuNTYgMjQuMDA5OCA2Ni45OEMyMy4yNDk4IDY2LjYzIDIyLjU3OTggNjYuMDkgMjEuODQ5OCA2NS42NkMyMS43Mjk4IDY1LjU5IDIxLjU0OTggNjUuNTUgMjEuNDE5OCA2NS41OUMxOS4zMDk4IDY2LjIgMTcuMjQ5OCA2Ni45MiAxNS4zNzk4IDY4LjFDMTMuNDE5OCA2OS4zMyAxMS42Mzk4IDcwLjc4OTkgMTAuMzQ5OCA3Mi43MTk5QzkuMjc5NzUgNzQuMzE5OSA4LjQwOTc1IDc2LjA1IDcuNTI5NzUgNzcuNThDNy4zNDk3NSA3NC42NiA3LjY3OTc1IDcxLjYxIDkuMTk5NzUgNjguNzdDOS4zMjk3NSA2OC41MyA5LjM3OTc1IDY4LjE1IDkuMjg5NzUgNjcuOUM3LjMxOTc1IDYyLjQ0IDUuMzA5NzUgNTYuOTkgMy4zMzk3NSA1MS41MkMyLjYwOTc1IDQ5LjUgMS43NTk3NSA0Ny40OCAxLjMzOTc1IDQ1LjM5QzAuMDk5NzUzMyAzOS4xNCAyLjExOTc1IDMzLjk2IDYuODg5NzUgMjkuNzlDOC42Nzk3NSAyOC4yMyAxMC43ODk3IDI3LjMgMTMuMDE5NyAyNi41N0MxNS4wNjk3IDI1LjkgMTcuMDg5OCAyNS4xNiAxOS4xMTk4IDI0LjQ0QzE5LjE3OTggMjQuNDIgMTkuMjE5OCAyNC4zNyAxOS4yNTk4IDI0LjM0QzE4Ljc1OTggMjIuOTcgMTguMzE5OCAyMS41OCAxNy43NDk4IDIwLjI1QzE1Ljg1OTggMTUuNzggMTcuMDk5OCAxMS4xOCAyMS4wNDk4IDguMzc5OThDMjEuNzg5OCA3Ljg1OTk4IDIyLjY0OTggNy40ODk5NyAyMy40OTk4IDcuMTc5OTdDMjUuOTY5OCA2LjI1OTk3IDI4LjQ2OTggNS40MzAwMSAzMC45NDk4IDQuNTMwMDFDMzQuMDk5OCAzLjM5MDAxIDM3LjIxOTggMi4xMjk5NSA0MC40MDk4IDEuMDk5OTVDNDIuMzA5OCAwLjQ4OTk1MyA0NC4yOTk4IDAuNTMwMDA2IDQ2LjIzOTcgMS4yODAwMUM0OS4xMjk3IDIuNDEwMDEgNTEuMDI5OCA0LjQyOTk2IDUxLjk5OTggNy4zNTk5NkM1Mi40Mzk4IDguNjc5OTYgNTIuOTY5OCA5Ljk3OTk2IDUzLjQyOTggMTEuMjlDNTMuNTU5OCAxMS42NiA1My43MTk3IDExLjc1IDU0LjA5OTggMTEuNjJDNTcuMTc5NyAxMC41MyA2MC4yMDk4IDkuMjg5OTggNjMuMzQ5OCA4LjQzOTk4QzY1LjkyOTcgNy43Mzk5OCA2OC41ODk4IDcuODc5OTYgNzEuMjE5OCA4LjY2OTk2Qzc0LjYxOTggOS42Nzk5NiA3Ny4zNzk4IDExLjU3IDc5LjU3OTggMTQuM0M4MC43Mzk4IDE1Ljc1IDgxLjU0OTggMTcuNDIgODIuMTY5OCAxOS4xOEM4My4zMzk4IDIyLjQ2IDg0LjU0OTggMjUuNzMgODUuNzM5OCAyOUM4Ni42Njk4IDMxLjU2IDg3LjU4OTggMzQuMTIgODguNTE5OCAzNi42OEM4OS42NDk4IDM5Ljc3IDkwLjc3OTggNDIuODUgOTEuOTE5OCA0NS45NEM5Mi43MTk4IDQ4LjExIDkzLjUzOTggNTAuMjcgOTMuNjI5OCA1Mi42MkM5My43MDk4IDU0LjY3IDkzLjM3OTggNTYuNjMgOTIuNzQ5OCA1OC41OUw5Mi43Nzk4IDU4LjU4Wk00Ni40Mzk4IDE0LjM5QzQ2LjIxOTggMTMuODYgNDYuMDM5NyAxMy40NCA0NS44Nzk3IDEzLjAyQzQ1LjQzOTggMTEuODYgNDUuMDI5OCAxMC42OSA0NC41Nzk4IDkuNTM5OTZDNDQuMTY5OCA4LjQ4OTk1IDQzLjMwOTcgOC4xOCA0Mi4yNzk4IDguNTlDNDEuMDQ5OCA5LjA4IDM5Ljc4OTggOS40OTk5OCAzOC41Mzk4IDkuOTM5OThDMzcuMDM5OCAxMC40NyAzNS41Mzk4IDEwLjk5IDM0LjA0OTggMTEuNTNDMzIuNTU5OCAxMi4wNyAzMS4wNzk4IDEyLjY0IDI5LjU4OTggMTMuMThDMjguMzE5NyAxMy42NCAyNy4wMjk4IDE0LjA0IDI1Ljc3OTggMTQuNTNDMjQuNjg5OCAxNC45NSAyNC4zNDk4IDE1Ljc1IDI0LjczOTggMTYuODRDMjUuMTc5OCAxOC4wOSAyNS42NDk4IDE5LjMzIDI2LjEzOTggMjAuNTdDMjYuNTY5OCAyMS42NiAyNi41Nzk4IDIxLjY0IDI3LjY5OTggMjEuMjNDMzAuNTE5OCAyMC4yIDMzLjM0OTggMTkuMiAzNi4xNjk4IDE4LjE4QzM3LjgyOTggMTcuNTggMzkuNDc5NyAxNi45NyA0MS4xMjk3IDE2LjM2QzQyLjg3OTcgMTUuNzEgNDQuNjI5OCAxNS4wNSA0Ni40Mzk4IDE0LjM4VjE0LjM5Wk03Mi45Njk4IDI0Ljk1QzcyLjk2OTggMjQuNzIgNzIuODU5OCAyNC41NyA3Mi42NDk4IDI0LjQ4QzcxLjk4OTggMjQuMjIgNzEuMzM5OCAyMy45MyA3MC42Nzk4IDIzLjY5QzY5Ljg5OTggMjMuNDIgNjkuNDI5OCAyMi45MiA2OS4yODk4IDIyLjFDNjkuMTY5OCAyMS4zOCA2OC45OTk4IDIwLjY3IDY4Ljg1OTggMTkuOTVDNjguODA5OCAxOS43IDY4LjY4OTggMTkuNTI5OSA2OC40Mjk4IDE5LjQ2OTlDNjguMTc5OCAxOS40MDk5IDY4LjAyOTggMTkuNTM5OSA2Ny44Nzk4IDE5LjcxOTlDNjcuMzc5OCAyMC4zMTk5IDY2Ljg2OTggMjAuOTEgNjYuMzY5OCAyMS41QzY1Ljk4OTggMjEuOTQgNjUuNTI5OCAyMi4xOSA2NC45Mjk4IDIyLjEzQzY0LjExOTggMjIuMDUgNjMuMjk5OCAyMS45NSA2Mi40ODk3IDIxLjg0QzYyLjIzOTcgMjEuODEgNjIuMDI5OCAyMS44NCA2MS44ODk4IDIyLjA4QzYxLjc1OTggMjIuMjkgNjEuNzk5OCAyMi40OCA2MS45Mjk4IDIyLjY5QzYyLjM2OTggMjMuMzggNjIuNzc5OCAyNC4wOCA2My4yMTk4IDI0Ljc3QzYzLjUyOTggMjUuMjYgNjMuNTg5OCAyNS43MyA2My4zMTk4IDI2LjI3QzYyLjk2OTggMjYuOTYgNjIuNjc5OCAyNy42OCA2Mi4zNDk4IDI4LjM5QzYyLjIxOTcgMjguNjYgNjIuMTU5NyAyOC45IDYyLjM3OTcgMjkuMTVDNjIuNTc5OCAyOS4zOCA2Mi44MDk3IDI5LjMgNjMuMDU5NyAyOS4yNEM2My45MTk4IDI5LjAzIDY0Ljc3OTggMjguODQgNjUuNjA5OCAyOC42NEM2Ni4wNTk4IDI4LjY4IDY2LjQzOTggMjguNzYgNjYuNzU5OCAyOS4wNkM2Ny4zNDk4IDI5LjYxIDY3Ljk0OTggMzAuMTQgNjguNTM5OCAzMC42OUM2OC43MTk4IDMwLjg2IDY4Ljg4OTggMzAuOTggNjkuMTU5OCAzMC44N0M2OS4zOTk4IDMwLjc2IDY5LjUwOTggMzAuNTkgNjkuNTE5OCAzMC4zM0M2OS41Njk4IDI5LjUzIDY5LjY2OTggMjguNzMgNjkuNjg5OCAyNy45MkM2OS43MDk4IDI3LjMyIDY5Ljk3OTggMjYuOTMgNzAuNDg5OCAyNi42NUM3MS4yMTk4IDI2LjI1IDcxLjkzOTggMjUuODMgNzIuNjU5OCAyNS40MkM3Mi44NTk4IDI1LjMxIDcyLjk2OTggMjUuMTcgNzIuOTU5OCAyNC45M0w3Mi45Njk4IDI0Ljk1Wk03Ny43Njk4IDMwLjEzQzc3Ljc1OTggMjkuOTQgNzcuNTE5OCAyOS45NSA3Ny40MDk4IDI5LjgzQzc3LjM3OTggMjkuOCA3Ny4zMTk4IDI5Ljc4IDc3LjI2OTggMjkuNzdDNzYuNDY5OCAyOS42MSA3Ni4xMTk4IDI5LjA4IDc2LjA3OTggMjguM0M3Ni4wNzk4IDI4LjI0IDc2LjA1OTggMjguMTcgNzYuMDQ5OCAyOC4xMUM3Ni4wMTk4IDI3Ljk4IDc2LjAxOTggMjcuODIgNzUuODM5OCAyNy43N0M3NS42NTk4IDI3LjcyIDc1LjU5OTggMjcuODggNzUuNTA5OCAyNy45OEM3NC41Nzk4IDI5LjAxIDc0LjkxOTggMjguOTkgNzMuNDM5OCAyOC44MkM3My40MDk4IDI4LjgyIDczLjM4OTggMjguODIgNzMuMzQ5OCAyOC44MkM3My4yMzk4IDI4LjgyIDczLjA5OTggMjguNzYgNzMuMDE5OCAyOC45MUM3Mi45Mzk4IDI5LjA0OTkgNzMuMDE5OCAyOS4xNiA3My4wODk4IDI5LjI3QzczLjI0OTggMjkuNTMgNzMuNDA5OCAyOS44IDczLjU3OTggMzAuMDZDNzMuNzE5OCAzMC4yOCA3My43NDk4IDMwLjUgNzMuNjE5OCAzMC43NUM3My40Njk4IDMxLjA1IDczLjMyOTggMzEuMzUgNzMuMjA5OCAzMS42NkM3My4wOTk4IDMxLjk0IDczLjIxOTcgMzIuMDcgNzMuNTE5OCAzMi4wMUM3My41OTk4IDMyIDczLjY3OTggMzEuOTkgNzMuNzM5OCAzMS45NkM3NC41Mjk4IDMxLjYxIDc1LjE3OTggMzEuNzg5OSA3NS42OTk4IDMyLjQ2OTlDNzUuNzE5NyAzMi40ODk5IDc1LjczOTggMzIuNTEgNzUuNzU5OCAzMi41MkM3NS44Nzk4IDMyLjYgNzUuOTU5NyAzMi43OCA3Ni4xNDk3IDMyLjcxQzc2LjM1OTcgMzIuNjMgNzYuMzI5OCAzMi40NCA3Ni4zMjk4IDMyLjI4Qzc2LjMyOTggMzEuNTUgNzYuNDA5OCAzMC44NyA3Ny4yMzk4IDMwLjU4Qzc3LjMxOTggMzAuNTUgNzcuMzg5OCAzMC40OSA3Ny40NTk4IDMwLjQ0Qzc3LjU3OTggMzAuMzUgNzcuODA5OCAzMC4zNCA3Ny43OTk4IDMwLjE0TDc3Ljc2OTggMzAuMTNaTTY5LjU2OTggNDcuOTVDNjkuNjM5OCA0Ny45NSA2OS43MDk4IDQ3Ljk1OTkgNjkuNzg5OCA0Ny45Njk5QzcwLjE5OTggNDYuMjE5OSA3MC45NDk4IDQ0LjUyIDcwLjUyOTggNDIuNjVDNzAuNDQ5OCA0Mi4zIDcwLjMyOTggNDEuODY5OSA3MC4wNjk4IDQxLjY2QzY5LjcwOTggNDEuMzY5OSA2OS4yMTk3IDQxLjEzIDY4Ljc2OTggNDEuMUM2OC41Njk4IDQxLjA5IDY4LjI0OTggNDEuNjEgNjguMTI5OCA0MS45NEM2Ny44Mjk4IDQyLjgyIDY3LjYyOTggNDMuNzMgNjcuMzc5OCA0NC42M0M2Ny40Mjk4IDQ0LjY1IDY3LjQ2OTcgNDQuNjcgNjcuNTE5OCA0NC42OUM2Ny41NTk4IDQ0LjYyIDY3LjYwOTggNDQuNTQ5OSA2Ny42Mzk4IDQ0LjQ2OTlDNjcuOTc5OCA0My42ODk5IDY4LjI5OTggNDIuOTEgNjguNjQ5OCA0Mi4xNEM2OC43Mjk4IDQxLjk2IDY4LjkwOTggNDEuNzcgNjkuMDc5OCA0MS43MUM2OS4xNjk4IDQxLjY4IDY5LjQxOTggNDEuOSA2OS40Nzk4IDQyLjA1QzY5LjY1OTggNDIuNDkgNjkuODg5OCA0Mi45NSA2OS44ODk4IDQzLjQxQzY5Ljg4OTggNDQuNCA2OS43Nzk4IDQ1LjQgNjkuNzA5OCA0Ni4zOUM2OS42Njk4IDQ2LjkxIDY5LjYwOTggNDcuNDIgNjkuNTU5OCA0Ny45NEw2OS41Njk4IDQ3Ljk1WiIgZmlsbD0iIzVFMDUwQyIvPgo8L3N2Zz4K" alt="Guidia Logo" width="120" style="display: block; border: 0; max-width: 120px; height: auto;">
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
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzk2IiBoZWlnaHQ9IjkyIiB2aWV3Qm94PSIwIDAgMzk2IDkyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTY2Ljk4IDY4VjYwLjA5QzE2Mi45OCA2NC41IDE1NC43NCA2OS4zMSAxNDEuODUgNjkuMzFDMTIxLjM3IDY5LjMxIDEwOC44OSA1NS4yIDEwOC44OSAzOS4wNEMxMDguODkgMjIuODggMTIyLjExIDkuMDIwMDIgMTQzLjMyIDkuMDIwMDJDMTU0LjgyIDkuMDIwMDIgMTY4LjI4IDEzLjQzIDE3My43NSAyNC4xOUwxNjUuNzYgMjYuNjRDMTYyLjMzIDIxLjU4IDE1NS40OCAxNi4wMyAxNDMuOSAxNi4wM0MxMjkuNzkgMTYuMDMgMTE3LjYzIDI0LjAzIDExNy42MyAzOC43MUMxMTcuNjMgNTQuMzcgMTMwLjAzIDYyLjQ1IDE0My42NSA2Mi40NUMxNTEuNjQgNjIuNDUgMTYwLjYyIDU5LjAyIDE2NC45NCA1MS45M0MxNjYuNDkgNDkuMzIgMTY2LjgyIDQ3LjM2IDE2Ny4yMiA0NC41MUgxNDEuODVWMzcuNjZIMTc0LjA3VjY4LjAxSDE2Ni45N0wxNjYuOTggNjhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0yMjQuODIgNjhWNjIuOTRDMjI0LjA5IDYzLjU5IDIyMi43OCA2NC43MyAyMjAuNjYgNjYuMDRDMjE1LjQ0IDY5LjIyIDIwOS4wOCA2OS4zOCAyMDcuMjggNjkuMzhDMjAyLjE0IDY5LjM4IDE5MS4yMSA2Ny45MSAxODcuNDYgNjAuMDhDMTg1LjgzIDU2Ljc0IDE4NS44MyA1Mi42NiAxODUuODMgNDkuMDdWMjguMTlIMTkzLjVWNDguMjZDMTkzLjUgNTIuMjYgMTkzLjgzIDU0LjMgMTk0LjU2IDU2LjA5QzE5Ny4yNSA2Mi4zNyAyMDYuNDcgNjIuNTQgMjA4LjAyIDYyLjU0QzIxNi40MiA2Mi41NCAyMjEuNjQgNTguNjIgMjIzLjQ0IDU1LjYxQzIyNC42NiA1My40OSAyMjQuNjYgNTEuNjEgMjI0LjY2IDQ5LjI1VjI4LjJIMjMyLjQxVjY4LjAxSDIyNC44MlY2OFoiIGZpbGw9IiM1RTA1MEMiLz4KPHBhdGggZD0iTTMwNC43NyA2OFY2Mi43QzMwMi44OSA2NC40MSAyOTcuNzUgNjguNzQgMjg2LjkgNjguNzRDMjg0LjQ1IDY4Ljc0IDI3Ny40NCA2OC41OCAyNzEuNDggNjQuMTdDMjY4Ljg3IDYyLjI5IDI2My4yNCA1Ni45OSAyNjMuMjQgNDcuNzdDMjYzLjI0IDQ1IDI2My44MSAzOC40NyAyNjkuNjggMzMuMjVDMjcyLjI5IDMwLjk3IDI3OC4xNiAyNy4yMSAyODcuMTQgMjcuMjFDMjkwIDI3LjIxIDI5OC4wNyAyNy42MiAzMDQuNzYgMzIuODRWMTAuNDFIMzEyLjUxVjY4LjAxSDMwNC43NkwzMDQuNzcgNjhaTTMwMS4xIDM3LjczQzI5Ni4zNyAzMy40OSAyODkuNiAzMy40MSAyODcuNjQgMzMuNDFDMjc4LjM0IDMzLjQxIDI3MS4zMiAzOC45NiAyNzEuMzIgNDguNDJDMjcxLjMyIDU2LjI1IDI3Ny4wMyA2Mi4zNyAyODcuODggNjIuMzdDMjk1LjMgNjIuMzcgMzA1LjE4IDU5LjYgMzA1LjE4IDQ3LjY5QzMwNS4xOCA0NS44MSAzMDUuMSA0MS4zMyAzMDEuMSAzNy43NFYzNy43M1oiIGZpbGw9IiM1RTA1MEMiLz4KPHBhdGggZD0iTTI1Mi43OCAyOC4xOEgyNDUuMDNWNjcuOTlIMjUyLjc4VjI4LjE4WiIgZmlsbD0iIzVFMDUwQyIvPgo8cGF0aCBkPSJNMjUyLjM4IDE0LjgzQzI1MS4xIDEzLjY4IDI0OS4yNyAxMy42NiAyNDguNzQgMTMuNjZDMjQ2LjIyIDEzLjY2IDI0NC4zMyAxNS4xNiAyNDQuMzMgMTcuNzJDMjQ0LjMzIDE5Ljg0IDI0NS44NyAyMS40OSAyNDguODEgMjEuNDlDMjUwLjgyIDIxLjQ5IDI1My40OSAyMC43NCAyNTMuNDkgMTcuNTJDMjUzLjQ5IDE3LjAxIDI1My40NyAxNS44IDI1Mi4zOSAxNC44M0gyNTIuMzhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0zMzIuMjUgMTQuODNDMzMwLjk3IDEzLjY4IDMyOS4xNCAxMy42NiAzMjguNjEgMTMuNjZDMzI2LjA5IDEzLjY2IDMyNC4yIDE1LjE2IDMyNC4yIDE3LjcyQzMyNC4yIDE5Ljg0IDMyNS43NCAyMS40OSAzMjguNjggMjEuNDlDMzMwLjY5IDIxLjQ5IDMzMy4zNiAyMC43NCAzMzMuMzYgMTcuNTJDMzMzLjM2IDE3LjAxIDMzMy4zNCAxNS44IDMzMi4yNiAxNC44M0gzMzIuMjVaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0zMzIuNjUgMjguMThIMzI0LjlWNjcuOTlIMzMyLjY1VjI4LjE4WiIgZmlsbD0iIzVFMDUwQyIvPgo8cGF0aCBkPSJNMzg4LjE1IDY4LjRDMzgxLjM4IDY4LjQgMzgwLjgxIDY0LjU3IDM4MC40OCA2MS42M0MzNzkuMDEgNjQuNTcgMzczLjIyIDY5LjQ2IDM2MS4zMSA2OS40NkMzNDYuMTQgNjkuNDYgMzQyLjYzIDYxLjMgMzQyLjYzIDU1Ljc1QzM0Mi42MyA0OC45IDM0Ny41MiA0NS45NiAzNDkuNjUgNDUuMDZDMzUzLjQ4IDQzLjM1IDM1OS42OCA0My4xOCAzNjkuMDcgNDMuMThIMzgwLjQxVjQyLjJDMzgwLjQxIDM3LjMxIDM4MC4zMyAzMi41NyAzNjcuMTkgMzIuNTdDMzYxLjIzIDMyLjU3IDM1NC43OSAzMy42MyAzNTMuMDggMzcuNzlMMzQ1LjI1IDM3LjA2QzM0NS4zMyAzNi43MyAzNDYuMDcgMzQuNjEgMzQ3LjA0IDMzLjE0QzM0OC41OSAzMC44NiAzNTIuMDIgMjYuOTQgMzY2Ljc4IDI2Ljk0QzM2Ny45MiAyNi45NCAzNzMuNTUgMjcuMDIgMzc4LjEyIDI4LjE2QzM3OS4xOCAyOC40IDM4My4zNCAyOS4zIDM4NS43MSAzMi40OEMzODcuNjcgMzUuMDkgMzg3LjY3IDM3Ljc4IDM4Ny42NyA0MC44VjU2LjcxQzM4Ny42NyA2MS4yOCAzODguNCA2Mi44MyAzOTIuMTYgNjIuODNDMzkyLjg5IDYyLjgzIDM5NS4wMiA2Mi41OSAzOTUuMDIgNjIuNTlWNjcuOTdDMzkyLjc0IDY4LjEzIDM5MC40NSA2OC4zOCAzODguMTcgNjguMzhMMzg4LjE1IDY4LjRaTTM2NS44OCA0OS4xNUMzNTguMDUgNDkuMTUgMzUwLjM4IDQ5LjE1IDM1MC4zOCA1NS42OEMzNTAuMzggNTkuNiAzNTMuOTcgNjMuNTEgMzYxLjg4IDYzLjUxQzM2Ni41MyA2My41MSAzNzUuMzQgNjIuNDUgMzc5LjAxIDU1LjY4QzM4MC40OCA1Mi45MSAzODAuNCA1MC4zIDM4MC40OCA0OS4xNUgzNjUuODhaIiBmaWxsPSIjNUUwNTBDIi8+CjxwYXRoIGQ9Ik0yOS4wNDk4IDg4LjI1QzI5LjMyOTggODYuNTEgMjkuNTk5OCA4NC43NyAyOS45MDk4IDgzLjA0QzI5LjkzOTggODIuODYgMzAuMTY5OCA4Mi42NCAzMC4zNDk4IDgyLjU4QzMyLjk4OTggODEuNzggMzUuMjQ5OCA4MC4zMyAzNy4xNzk4IDc4LjQyQzM4LjI5OTggNzcuMzEgMzkuMjE5NyA3Ni4wMSA0MC4yMzk3IDc0LjhDNDAuNDk5NyA3NC40OSA0MC4zNjk4IDc0LjI5IDQwLjA5OTggNzQuMTFDMzguNzc5OCA3My4yMSAzOC40MDk4IDcxLjggMzguMTU5OCA3MC4zNkMzOC4xMjk4IDcwLjIxIDM4LjMzOTggNjkuODkgMzguNDk5OCA2OS44NEM0MC41MTk4IDY5LjE3IDQyLjU1OTcgNjkuMTMgNDQuNTk5OCA2OS43OEM0NC43Mjk4IDY5LjgyIDQ0Ljg2OTggNzAuMDYgNDQuODc5NyA3MC4yMUM0NC45MTk4IDcxLjQ1IDQ0Ljc3OTggNzIuNzUgNDQuMDA5OCA3My42OEM0My40NTk4IDc0LjM0IDQzLjQ4OTggNzQuOTMgNDMuNDk5OCA3NS42QzQzLjU0OTggNzkuODQgNDIuMjM5OCA4My42NyAzOS45MDk4IDg3LjE0QzM4LjkyOTggODguNiAzNy41OTk4IDg5Ljg0IDM2LjM5OTggOTEuMTVDMzYuMjU5OCA5MS4zIDM1LjkxOTggOTEuMzcgMzUuNjk5NyA5MS4zM0MzMy42NTk3IDkxLjAzIDMxLjYwOTggOTAuNyAyOS41Nzk4IDkwLjM1QzI5LjQxOTggOTAuMzIgMjkuMjA5OCA5MC4wNyAyOS4xOTk4IDg5LjlDMjkuMTQ5OCA4OS4zNiAyOS4xNzk4IDg4LjgxIDI5LjE3OTggODguMjdDMjkuMTM5OCA4OC4yNyAyOS4wODk4IDg4LjI2IDI5LjA0OTggODguMjVaTTQyLjg4OTggNDUuNjJDNDIuMjE5OCA0NC41NSA0MS40Njk4IDQzLjU0OTkgNDAuMTM5OCA0My4xNkMzOC45Mjk4IDQyLjgxIDM3Ljk3OTggNDMuMjggMzcuNDY5OCA0NC40NEMzNi41MDk4IDQ2LjYzIDM4LjMxOTggNTAuNzIgNDAuNTM5OCA1MS43OEM0MS41Mzk4IDUyLjI1IDQyLjk2OTggNTIuMDEgNDMuMzE5OCA1MS4yOEM0My42Mjk4IDUwLjYyIDQzLjc5OTggNDkuOSA0My45NTk4IDQ5LjQyQzQzLjc5OTggNDcuOTIgNDMuNTY5OCA0Ni42OSA0Mi44OTk4IDQ1LjYzTDQyLjg4OTggNDUuNjJaTTUyLjA1OTcgNDEuMzhDNTEuNjU5NyA0MC44IDUxLjIzOTcgNDAuMjUgNTAuNDg5NyA0MC4xQzQ5LjgzOTcgMzkuOTcgNDkuNTc5OCA0MC4xNCA0OS41NDk4IDQwLjhDNDkuNDI5OCA0My4zNCA1MC40MDk4IDQ1LjQ1IDUyLjEzOTggNDcuMjVDNTIuNDc5OCA0Ny42IDUyLjk1OTggNDcuOTYgNTMuMzk5OCA0Ny42NUM1My42OTk4IDQ3LjQ0IDUzLjc2OTggNDYuODkgNTMuOTM5OCA0Ni40OUM1My45NTk4IDQ2LjQzIDUzLjkzOTggNDYuMzYgNTMuOTM5OCA0Ni4zQzUzLjc4OTggNDQuNDggNTMuMDg5NyA0Mi44NiA1Mi4wNTk3IDQxLjM4Wk05Mi43Nzk4IDU4LjU4QzkxLjczOTggNjEuNzggODkuNzg5OCA2NC4zMSA4Ny4xNTk4IDY2LjMyQzg1Ljc0OTggNjcuNCA4NC4xNTk4IDY4LjE5IDgyLjQzOTggNjguNzNDODEuMDA5OCA2OS4xOCA3OS42Mzk4IDY5Ljc4IDc4LjIzOTggNzAuMzFDNzcuMTU5OCA3MC43MSA3Ni4wNzk4IDcxLjEyIDc0Ljk5OTggNzEuNUM3My42Njk4IDcxLjk3IDcyLjMxOTggNzIuNCA3MC45ODk4IDcyLjg4QzY5LjQ5OTggNzMuNDIgNjguMDE5OCA3NCA2Ni41Mjk4IDc0LjU1QzY1LjUwOTggNzQuOTMgNjQuNDk5OCA3NS4zMSA2My40Njk4IDc1LjY3QzYyLjAyOTggNzYuMTcgNjAuNTc5OCA3Ni42NCA1OS4xNDk4IDc3LjE2QzU3LjY3OTggNzcuNjg5OSA1Ni4yMTk4IDc4LjI3IDU0Ljc1OTggNzguODJDNTQuNDk5OCA3OC45MiA1NC4yMzk3IDc5LjAxIDUzLjg3OTcgNzguOTlDNTQuMDU5NyA3OC43MiA1NC4yNTk4IDc4LjQ1IDU0LjQxOTggNzguMTdDNTYuNzg5NyA3NC4yMyA1OS45MTk4IDcwLjkzIDYzLjMwOTcgNjcuODhDNjYuMDQ5OCA2NS40MiA2OC41MDk4IDYyLjc1IDcwLjM0OTggNTkuNTVDNzEuODk5OCA1Ni44NiA3My4xNDk3IDU0LjA0IDc0LjA1OTggNTEuMDdDNzQuMTc5OCA1MC42OCA3NC4wNzk4IDUwLjUgNzMuNjk5OCA1MC40MUM3My4yMDk4IDUwLjI5IDcyLjcyOTggNTAuMTUgNzIuMTk5OCA1MC4wMUM3Mi40Mzk4IDQ5LjQ4IDcyLjY1OTggNDguOTUgNzIuOTA5OCA0OC40M0M3NC4yMTk4IDQ1LjcgNzQuOTI5NyA0Mi44MSA3NS4wODk4IDM5LjgxQzc1LjEzOTggMzguOTUgNzQuODQ5OCAzOC4wNiA3NC42NTk4IDM3LjJDNzQuNTk5OCAzNi45NSA3NC4zNzk4IDM2LjcxIDc0LjE3OTggMzYuNTNDNzMuNTk5OCAzNi4wMiA3My4wNTk4IDM2LjE2OTkgNzIuODU5OCAzNi45MUM3Mi41OTk4IDM3Ljg4IDcyLjQwOTggMzguODYgNzIuMTY5OCAzOS44M0M3Mi4xMjk4IDQwIDcxLjk3OTggNDAuMTQgNzEuODg5OCA0MC4yOUM3MS43Njk4IDQwLjEzIDcxLjU2OTggMzkuOTkgNzEuNTI5OCAzOS44MkM3MS4xOTk4IDM4LjUzIDcwLjkyOTcgMzcuMjMgNzAuNTg5OCAzNS45NUM3MC4yNDk4IDM0LjY5IDY5LjM0OTggMzMuOSA2OC4zNjk4IDMzLjg3QzY3LjgyOTggMzMuODUgNjcuNTM5OCAzNC4wMyA2Ny41Njk4IDM0LjYxQzY3LjY0OTggMzYuMDQgNjcuNzA5OCAzNy40OCA2Ny43Njk4IDM4LjkyQzY3Ljc2OTggMzkuMTMgNjcuNzY5OCAzOS4zNSA2Ny43Njk4IDM5LjU3QzY3LjI0OTggMzkuNzUgNjcuMDQ5OCAzOS41NiA2Ni45MDk4IDM5LjA0QzY2LjUxOTggMzcuNTkgNjYuMTQ5OCAzNi4xMSA2NS4wMDk4IDM1LjAyQzY0LjcyOTggMzQuNzUgNjQuMzg5OCAzNC41MyA2NC4wMzk4IDM0LjM4QzYzLjMxOTggMzQuMDggNjIuOTA5OCAzNC4zOCA2My4wMDk4IDM1LjE1QzYzLjE2OTggMzYuMjkgNjMuMzU5NyAzNy40MyA2My41OTk4IDM4LjU2QzY0LjIwOTggNDEuNSA2NC4xNzk3IDQ0LjQ1IDYzLjY2OTggNDcuMzlDNjMuNjQ5NyA0Ny40OSA2My42MDk3IDQ3LjU5IDYzLjU1OTcgNDcuNzRDNjMuMTM5OCA0Ny42NSA2Mi43MTk3IDQ3LjU5IDYyLjMzOTcgNDcuNDZDNjEuODQ5NyA0Ny4yOSA2MS43Mjk4IDQ3LjQzIDYxLjY0OTggNDcuOTRDNjEuMDA5OCA1Mi4yMyA1OS41Mjk4IDU2LjE4IDU2LjQ5OTggNTkuMzdDNTUuMTc5OCA2MC43NiA1My41NTk4IDYxLjg3IDUyLjA2OTggNjMuMUM1MS45Mjk4IDYzLjIxIDUxLjczOTcgNjMuMjYgNTEuNDg5NyA2My4yMUM1Mi4wNjk4IDYyLjc1IDUyLjY4OTggNjIuMzMgNTMuMjM5NyA2MS44M0M1NS41ODk3IDU5LjY4IDU2LjkyOTggNTcuMDQgNTcuMTM5OCA1My44M0M1Ny4zNzk4IDUwLjEyIDU2LjQ5OTggNDYuNjIgNTUuMjQ5OCA0My4xN0M1NC4yNzk4IDQwLjQ4IDUyLjU3OTggMzguMyA1MC41MTk3IDM2LjM4QzQ5LjkzOTcgMzUuODQgNDkuMjM5NyAzNS40MSA0OC41NTk3IDM0Ljk5QzQ4LjI0OTcgMzQuNzkgNDguMTQ5OCAzNC42NCA0OC4yNDk4IDM0LjI3QzQ4Ljk0OTggMzEuNTMgNDguNzk5OCAyOC44MyA0Ny43ODk4IDI2LjE5QzQ3LjUzOTggMjUuNTQgNDcuNDU5OCAyNS41NSA0Ni44Nzk3IDI1Ljk5QzQ1LjQ2OTcgMjcuMDYgNDQuMDQ5NyAyOC4xMSA0Mi42Mjk3IDI5LjE3QzQxLjUwOTggMzAuMDEgNDAuMzg5OCAzMC44NiAzOS4yOTk4IDMxLjY4QzM4LjkyOTggMzAuMTQgMzguNTQ5OCAyOC41OCAzOC4xMzk4IDI2Ljg3QzM3LjgyOTggMjcuMSAzNy42Nzk4IDI3LjIxIDM3LjUzOTggMjcuMzFDMzYuMjY5OCAyOC4yMyAzNC45ODk4IDI5LjE1IDMzLjcyOTggMzAuMDlDMzMuMTU5OCAzMC41MSAzMi42MTk4IDMwLjk5IDMyLjAzOTggMzEuNDFDMzAuMTc5OCAzMi43OSAyOC4yOTk4IDM0LjEzIDI2LjQ1OTggMzUuNTRDMjMuMjQ5OCAzOC4wMSAyMC44Njk4IDQxLjExIDE5LjYzOTggNDVDMTguOTc5OCA0Ny4wOSAxOC42Njk4IDQ5LjI0IDE4LjgzOTggNTEuNDVDMTguODc5OCA1MS45IDE4Ljc3OTggNTIuMTggMTguNDA5OCA1Mi41MUMxNy4xOTk4IDUzLjU1IDE2LjgxOTggNTUgMTYuODU5OCA1Ni41MkMxNi44OTk4IDU4LjAzIDE3LjQwOTggNTkuNDQgMTguMzU5OCA2MC42M0MxOS41Mzk4IDYyLjEgMjEuMTA5OCA2Mi43MiAyMi45Nzk4IDYyLjUxQzIzLjUwOTggNjIuNDUgMjMuODI5OCA2Mi41MSAyNC4yMTk4IDYzQzI0LjcxOTggNjMuNjUgMjUuNDg5OCA2NC4wOSAyNi4xNzk4IDY0LjU4QzI2LjczOTggNjQuOTggMjcuMzQ5OCA2NS4zMSAyNy45NDk4IDY1LjY2QzMxLjEwOTggNjcuNTcgMzQuNjA5OCA2Ny45OCAzOC4yMDk4IDY3LjkyQzM4LjM3OTcgNjcuOTIgMzguNTQ5OCA2Ny45MiAzOC43MDk4IDY3LjkyQzM4LjcxOTcgNjcuOTggMzguNzM5OCA2OC4wMyAzOC43NDk4IDY4LjA5QzM4LjM2OTggNjguMiAzNy45OTk4IDY4LjM0IDM3LjYxOTggNjguNDFDMzQuMzc5OCA2OC45OTk5IDMxLjExOTggNjkuMjYgMjcuODc5OCA2OC40OUMyNi41Mzk4IDY4LjE3IDI1LjI2OTggNjcuNTYgMjQuMDA5OCA2Ni45OEMyMy4yNDk4IDY2LjYzIDIyLjU3OTggNjYuMDkgMjEuODQ5OCA2NS42NkMyMS43Mjk4IDY1LjU5IDIxLjU0OTggNjUuNTUgMjEuNDE5OCA2NS41OUMxOS4zMDk4IDY2LjIgMTcuMjQ5OCA2Ni45MiAxNS4zNzk4IDY4LjFDMTMuNDE5OCA2OS4zMyAxMS42Mzk4IDcwLjc4OTkgMTAuMzQ5OCA3Mi43MTk5QzkuMjc5NzUgNzQuMzE5OSA4LjQwOTc1IDc2LjA1IDcuNTI5NzUgNzcuNThDNy4zNDk3NSA3NC42NiA3LjY3OTc1IDcxLjYxIDkuMTk5NzUgNjguNzdDOS4zMjk3NSA2OC41MyA5LjM3OTc1IDY4LjE1IDkuMjg5NzUgNjcuOUM3LjMxOTc1IDYyLjQ0IDUuMzA5NzUgNTYuOTkgMy4zMzk3NSA1MS41MkMyLjYwOTc1IDQ5LjUgMS43NTk3NSA0Ny40OCAxLjMzOTc1IDQ1LjM5QzAuMDk5NzUzMyAzOS4xNCAyLjExOTc1IDMzLjk2IDYuODg5NzUgMjkuNzlDOC42Nzk3NSAyOC4yMyAxMC43ODk3IDI3LjMgMTMuMDE5NyAyNi41N0MxNS4wNjk3IDI1LjkgMTcuMDg5OCAyNS4xNiAxOS4xMTk4IDI0LjQ0QzE5LjE3OTggMjQuNDIgMTkuMjE5OCAyNC4zNyAxOS4yNTk4IDI0LjM0QzE4Ljc1OTggMjIuOTcgMTguMzE5OCAyMS41OCAxNy43NDk4IDIwLjI1QzE1Ljg1OTggMTUuNzggMTcuMDk5OCAxMS4xOCAyMS4wNDk4IDguMzc5OThDMjEuNzg5OCA3Ljg1OTk4IDIyLjY0OTggNy40ODk5NyAyMy40OTk4IDcuMTc5OTdDMjUuOTY5OCA2LjI1OTk3IDI4LjQ2OTggNS40MzAwMSAzMC45NDk4IDQuNTMwMDFDMzQuMDk5OCAzLjM5MDAxIDM3LjIxOTggMi4xMjk5NSA0MC40MDk4IDEuMDk5OTVDNDIuMzA5OCAwLjQ4OTk1MyA0NC4yOTk4IDAuNTMwMDA2IDQ2LjIzOTcgMS4yODAwMUM0OS4xMjk3IDIuNDEwMDEgNTEuMDI5OCA0LjQyOTk2IDUxLjk5OTggNy4zNTk5NkM1Mi40Mzk4IDguNjc5OTYgNTIuOTY5OCA5Ljk3OTk2IDUzLjQyOTggMTEuMjlDNTMuNTU5OCAxMS42NiA1My43MTk3IDExLjc1IDU0LjA5OTggMTEuNjJDNTcuMTc5NyAxMC41MyA2MC4yMDk4IDkuMjg5OTggNjMuMzQ5OCA4LjQzOTk4QzY1LjkyOTcgNy43Mzk5OCA2OC41ODk4IDcuODc5OTYgNzEuMjE5OCA4LjY2OTk2Qzc0LjYxOTggOS42Nzk5NiA3Ny4zNzk4IDExLjU3IDc5LjU3OTggMTQuM0M4MC43Mzk4IDE1Ljc1IDgxLjU0OTggMTcuNDIgODIuMTY5OCAxOS4xOEM4My4zMzk4IDIyLjQ2IDg0LjU0OTggMjUuNzMgODUuNzM5OCAyOUM4Ni42Njk4IDMxLjU2IDg3LjU4OTggMzQuMTIgODguNTE5OCAzNi42OEM4OS42NDk4IDM5Ljc3IDkwLjc3OTggNDIuODUgOTEuOTE5OCA0NS45NEM5Mi43MTk4IDQ4LjExIDkzLjUzOTggNTAuMjcgOTMuNjI5OCA1Mi42MkM5My43MDk4IDU0LjY3IDkzLjM3OTggNTYuNjMgOTIuNzQ5OCA1OC41OUw5Mi43Nzk4IDU4LjU4Wk00Ni40Mzk4IDE0LjM5QzQ2LjIxOTggMTMuODYgNDYuMDM5NyAxMy40NCA0NS44Nzk3IDEzLjAyQzQ1LjQzOTggMTEuODYgNDUuMDI5OCAxMC42OSA0NC41Nzk4IDkuNTM5OTZDNDQuMTY5OCA4LjQ4OTk1IDQzLjMwOTcgOC4xOCA0Mi4yNzk4IDguNTlDNDEuMDQ5OCA5LjA4IDM5Ljc4OTggOS40OTk5OCAzOC41Mzk4IDkuOTM5OThDMzcuMDM5OCAxMC40NyAzNS41Mzk4IDEwLjk5IDM0LjA0OTggMTEuNTNDMzIuNTU5OCAxMi4wNyAzMS4wNzk4IDEyLjY0IDI5LjU4OTggMTMuMThDMjguMzE5NyAxMy42NCAyNy4wMjk4IDE0LjA0IDI1Ljc3OTggMTQuNTNDMjQuNjg5OCAxNC45NSAyNC4zNDk4IDE1Ljc1IDI0LjczOTggMTYuODRDMjUuMTc5OCAxOC4wOSAyNS42NDk4IDE5LjMzIDI2LjEzOTggMjAuNTdDMjYuNTY5OCAyMS42NiAyNi41Nzk4IDIxLjY0IDI3LjY5OTggMjEuMjNDMzAuNTE5OCAyMC4yIDMzLjM0OTggMTkuMiAzNi4xNjk4IDE4LjE4QzM3LjgyOTggMTcuNTggMzkuNDc5NyAxNi45NyA0MS4xMjk3IDE2LjM2QzQyLjg3OTcgMTUuNzEgNDQuNjI5OCAxNS4wNSA0Ni40Mzk4IDE0LjM4VjE0LjM5Wk03Mi45Njk4IDI0Ljk1QzcyLjk2OTggMjQuNzIgNzIuODU5OCAyNC41NyA3Mi42NDk4IDI0LjQ4QzcxLjk4OTggMjQuMjIgNzEuMzM5OCAyMy45MyA3MC42Nzk4IDIzLjY5QzY5Ljg5OTggMjMuNDIgNjkuNDI5OCAyMi45MiA2OS4yODk4IDIyLjFDNjkuMTY5OCAyMS4zOCA2OC45OTk4IDIwLjY3IDY4Ljg1OTggMTkuOTVDNjguODA5OCAxOS43IDY4LjY4OTggMTkuNTI5OSA2OC40Mjk4IDE5LjQ2OTlDNjguMTc5OCAxOS40MDk5IDY4LjAyOTggMTkuNTM5OSA2Ny44Nzk4IDE5LjcxOTlDNjcuMzc5OCAyMC4zMTk5IDY2Ljg2OTggMjAuOTEgNjYuMzY5OCAyMS41QzY1Ljk4OTggMjEuOTQgNjUuNTI5OCAyMi4xOSA2NC45Mjk4IDIyLjEzQzY0LjExOTggMjIuMDUgNjMuMjk5OCAyMS45NSA2Mi40ODk3IDIxLjg0QzYyLjIzOTcgMjEuODEgNjIuMDI5OCAyMS44NCA2MS44ODk4IDIyLjA4QzYxLjc1OTggMjIuMjkgNjEuNzk5OCAyMi40OCA2MS45Mjk4IDIyLjY5QzYyLjM2OTggMjMuMzggNjIuNzc5OCAyNC4wOCA2My4yMTk4IDI0Ljc3QzYzLjUyOTggMjUuMjYgNjMuNTg5OCAyNS43MyA2My4zMTk4IDI2LjI3QzYyLjk2OTggMjYuOTYgNjIuNjc5OCAyNy42OCA2Mi4zNDk4IDI4LjM5QzYyLjIxOTcgMjguNjYgNjIuMTU5NyAyOC45IDYyLjM3OTcgMjkuMTVDNjIuNTc5OCAyOS4zOCA2Mi44MDk3IDI5LjMgNjMuMDU5NyAyOS4yNEM2My45MTk4IDI5LjAzIDY0Ljc3OTggMjguODQgNjUuNjA5OCAyOC42NEM2Ni4wNTk4IDI4LjY4IDY2LjQzOTggMjguNzYgNjYuNzU5OCAyOS4wNkM2Ny4zNDk4IDI5LjYxIDY3Ljk0OTggMzAuMTQgNjguNTM5OCAzMC42OUM2OC43MTk4IDMwLjg2IDY4Ljg4OTggMzAuOTggNjkuMTU5OCAzMC44N0M2OS4zOTk4IDMwLjc2IDY5LjUwOTggMzAuNTkgNjkuNTE5OCAzMC4zM0M2OS41Njk4IDI5LjUzIDY5LjY2OTggMjguNzMgNjkuNjg5OCAyNy45MkM2OS43MDk4IDI3LjMyIDY5Ljk3OTggMjYuOTMgNzAuNDg5OCAyNi42NUM3MS4yMTk4IDI2LjI1IDcxLjkzOTggMjUuODMgNzIuNjU5OCAyNS40MkM3Mi44NTk4IDI1LjMxIDcyLjk2OTggMjUuMTcgNzIuOTU5OCAyNC45M0w3Mi45Njk4IDI0Ljk1Wk03Ny43Njk4IDMwLjEzQzc3Ljc1OTggMjkuOTQgNzcuNTE5OCAyOS45NSA3Ny40MDk4IDI5LjgzQzc3LjM3OTggMjkuOCA3Ny4zMTk4IDI5Ljc4IDc3LjI2OTggMjkuNzdDNzYuNDY5OCAyOS42MSA3Ni4xMTk4IDI5LjA4IDc2LjA3OTggMjguM0M3Ni4wNzk4IDI4LjI0IDc2LjA1OTggMjguMTcgNzYuMDQ5OCAyOC4xMUM3Ni4wMTk4IDI3Ljk4IDc2LjAxOTggMjcuODIgNzUuODM5OCAyNy43N0M3NS42NTk4IDI3LjcyIDc1LjU5OTggMjcuODggNzUuNTA5OCAyNy45OEM3NC41Nzk4IDI5LjAxIDc0LjkxOTggMjguOTkgNzMuNDM5OCAyOC44MkM3My40MDk4IDI4LjgyIDczLjM4OTggMjguODIgNzMuMzQ5OCAyOC44MkM3My4yMzk4IDI4LjgyIDczLjA5OTggMjguNzYgNzMuMDE5OCAyOC45MUM3Mi45Mzk4IDI5LjA0OTkgNzMuMDE5OCAyOS4xNiA3My4wODk4IDI5LjI3QzczLjI0OTggMjkuNTMgNzMuNDA5OCAyOS44IDczLjU3OTggMzAuMDZDNzMuNzE5OCAzMC4yOCA3My43NDk4IDMwLjUgNzMuNjE5OCAzMC43NUM3My40Njk4IDMxLjA1IDczLjMyOTggMzEuMzUgNzMuMjA5OCAzMS42NkM3My4wOTk4IDMxLjk0IDczLjIxOTcgMzIuMDcgNzMuNTE5OCAzMi4wMUM3My41OTk4IDMyIDczLjY3OTggMzEuOTkgNzMuNzM5OCAzMS45NkM3NC41Mjk4IDMxLjYxIDc1LjE3OTggMzEuNzg5OSA3NS42OTk4IDMyLjQ2OTlDNzUuNzE5NyAzMi40ODk5IDc1LjczOTggMzIuNTEgNzUuNzU5OCAzMi41MkM3NS44Nzk4IDMyLjYgNzUuOTU5NyAzMi43OCA3Ni4xNDk3IDMyLjcxQzc2LjM1OTcgMzIuNjMgNzYuMzI5OCAzMi40NCA3Ni4zMjk4IDMyLjI4Qzc2LjMyOTggMzEuNTUgNzYuNDA5OCAzMC44NyA3Ny4yMzk4IDMwLjU4Qzc3LjMxOTggMzAuNTUgNzcuMzg5OCAzMC40OSA3Ny40NTk4IDMwLjQ0Qzc3LjU3OTggMzAuMzUgNzcuODA5OCAzMC4zNCA3Ny43OTk4IDMwLjE0TDc3Ljc2OTggMzAuMTNaTTY5LjU2OTggNDcuOTVDNjkuNjM5OCA0Ny45NSA2OS43MDk4IDQ3Ljk1OTkgNjkuNzg5OCA0Ny45Njk5QzcwLjE5OTggNDYuMjE5OSA3MC45NDk4IDQ0LjUyIDcwLjUyOTggNDIuNjVDNzAuNDQ5OCA0Mi4zIDcwLjMyOTggNDEuODY5OSA3MC4wNjk4IDQxLjY2QzY5LjcwOTggNDEuMzY5OSA2OS4yMTk3IDQxLjEzIDY4Ljc2OTggNDEuMUM2OC41Njk4IDQxLjA5IDY4LjI0OTggNDEuNjEgNjguMTI5OCA0MS45NEM2Ny44Mjk4IDQyLjgyIDY3LjYyOTggNDMuNzMgNjcuMzc5OCA0NC42M0M2Ny40Mjk4IDQ0LjY1IDY3LjQ2OTcgNDQuNjcgNjcuNTE5OCA0NC42OUM2Ny41NTk4IDQ0LjYyIDY3LjYwOTggNDQuNTQ5OSA2Ny42Mzk4IDQ0LjQ2OTlDNjcuOTc5OCA0My42ODk5IDY4LjI5OTggNDIuOTEgNjguNjQ5OCA0Mi4xNEM2OC43Mjk4IDQxLjk2IDY4LjkwOTggNDEuNzcgNjkuMDc5OCA0MS43MUM2OS4xNjk4IDQxLjY4IDY5LjQxOTggNDEuOSA2OS40Nzk4IDQyLjA1QzY5LjY1OTggNDIuNDkgNjkuODg5OCA0Mi45NSA2OS44ODk4IDQzLjQxQzY5Ljg4OTggNDQuNCA2OS43Nzk4IDQ1LjQgNjkuNzA5OCA0Ni4zOUM2OS42Njk4IDQ2LjkxIDY5LjYwOTggNDcuNDIgNjkuNTU5OCA0Ny45NEw2OS41Njk4IDQ3Ljk1WiIgZmlsbD0iIzVFMDUwQyIvPgo8L3N2Zz4K" alt="Guidia Logo" height="32" style="display: inline-block; border: 0; height: 32px; width: auto;">
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
