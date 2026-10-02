export const getAdminMarkedCheckInTemplate = (data) => {
  const { name, time, date } = data

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Attendance Marked - Check-In</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 2.5rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.1rem; opacity: 0.9; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #1e3a8a; margin-bottom: 20px; }
        .status-pill { display: inline-block; padding: 6px 16px; background-color: #dbeafe; color: #1e40af; border-radius: 50px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; margin-bottom: 25px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table tr { border-bottom: 1px solid #f1f5f9; }
        .data-table td { padding: 15px 10px; font-size: 0.95rem; }
        .label { font-weight: 700; color: #64748b; width: 40%; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">⚡</div>
            <div class="company-name">APARAITECH SOFTWARE</div>
            <div class="header-title">Attendance Marked - Check-In</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Hello, ${name} 👋</div>
            <p>Your attendance has been marked as <strong>CHECK-IN</strong> by the Administrator.</p>
            
            <div style="text-align: center;">
              <span class="status-pill">🟢 ADMIN ENTRY - CHECKED-IN</span>
            </div>
            
            <table class="data-table">
              <tr>
                <td class="label">Date</td>
                <td class="value">${date}</td>
              </tr>
              <tr>
                <td class="label">Check-In Time</td>
                <td class="value">${time}</td>
              </tr>
              <tr>
                <td class="label">Attendance Source</td>
                <td class="value">Admin Entry</td>
              </tr>
            </table>
            
            <p style="font-size: 0.9rem; color: #64748b; line-height: 1.5;">If you notice any discrepancy or have questions regarding this entry, please contact the administration team.</p>
          </div>
          <div class="footer">
            <p>Regards,</p>
            <p><strong>HR &amp; Administration Team</strong></p>
            <p>Aparaitech Software Company &copy; 2026</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
