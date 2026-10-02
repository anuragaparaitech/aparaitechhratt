export const getEarlyCheckoutTemplate = (data) => {
  const { name, date, actualOut, expectedOut = '18:30', diffMin, status } = data
  const statusFormatted = status.replace('-', ' ').toUpperCase()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Early Check-Out Notification</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 2.5rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.1rem; opacity: 0.9; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #ea580c; margin-bottom: 20px; }
        .alert-box { background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 0.9rem; color: #c2410c; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table tr { border-bottom: 1px solid #f1f5f9; }
        .data-table td { padding: 15px 10px; font-size: 0.95rem; }
        .label { font-weight: 700; color: #64748b; width: 50%; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
        .value { color: #0f2b3d; font-weight: 500; text-align: right; }
        .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">⏰</div>
            <div class="company-name">APARAITECH SOFTWARE</div>
            <div class="header-title">Early Check-Out Notification</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Hello, ${name}</div>
            
            <div class="alert-box">
              <strong>Early Exit Detected:</strong> You have checked out before the standard office closing time of <strong>${expectedOut}</strong>.
            </div>
            
            <table class="data-table">
              <tr>
                <td class="label">Date</td>
                <td class="value"><strong>${date}</strong></td>
              </tr>
              <tr>
                <td class="label">Actual Check-Out</td>
                <td class="value" style="color: #ef4444; font-weight: 700;">${actualOut}</td>
              </tr>
              <tr>
                <td class="label">Expected Closing Time</td>
                <td class="value">${expectedOut}</td>
              </tr>
              <tr>
                <td class="label">Time Difference</td>
                <td class="value" style="color: #ea580c; font-weight: 700;">${diffMin} minutes early</td>
              </tr>
              <tr>
                <td class="label">Attendance Classified As</td>
                <td class="value"><strong style="color: #f97316;">${statusFormatted}</strong></td>
              </tr>
            </table>
            
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 15px;">Please make sure early checkouts are pre-approved by your supervisor. If this checkout was logged in error, contact the HR administrator.</p>
          </div>
          <div class="footer">
            <p><strong>Aparaitech HRMS 2.0</strong> | Intelligent Enterprise Attendance Portal</p>
            <p>This is an automated tracking notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
