export const getCheckOutTemplate = (data) => {
  const { name, empId, date, checkIn, checkOut, workingHours, status } = data
  const statusFormatted = status.replace('-', ' ').toUpperCase()
  
  let statusColor = '#22c55e' // Green for full-day
  if (status === 'half-day') statusColor = '#f59e0b' // Orange
  if (status === 'quarter-day') statusColor = '#a855f7' // Purple

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-Out Successful</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e5a7a, #0f2b3d); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 2.5rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.1rem; opacity: 0.9; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #0f2b3d; margin-bottom: 20px; }
        .status-pill { display: inline-block; padding: 6px 16px; background-color: #fee2e2; color: #991b1b; border-radius: 50px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; margin-bottom: 25px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table tr { border-bottom: 1px solid #f1f5f9; }
        .data-table td { padding: 15px 10px; font-size: 0.95rem; }
        .label { font-weight: 700; color: #64748b; width: 40%; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
        .value { color: #0f2b3d; font-weight: 500; text-align: right; }
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
            <div class="header-title">Check-Out Successful – Attendance Summary</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Hello, ${name} 👋</div>
            <p>Your check-out has been logged successfully for today. Below is the summary of your attendance logs.</p>
            
            <div style="text-align: center;">
              <span class="status-pill">🔴 CHECKED-OUT</span>
            </div>
            
            <table class="data-table">
              <tr>
                <td class="label">Employee ID</td>
                <td class="value"><strong>${empId}</strong></td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">${date}</td>
              </tr>
              <tr>
                <td class="label">Check-In Time</td>
                <td class="value">${checkIn}</td>
              </tr>
              <tr>
                <td class="label">Check-Out Time</td>
                <td class="value">${checkOut}</td>
              </tr>
              <tr>
                <td class="label">Total Hours</td>
                <td class="value"><strong>${workingHours}</strong></td>
              </tr>
              <tr>
                <td class="label">Final Status</td>
                <td class="value"><span style="color: ${statusColor}; font-weight: 700;">${statusFormatted}</span></td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p><strong>Aparaitech HRMS 2.0</strong> | Intelligent Enterprise Attendance Portal</p>
            <p>This is an automated security notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
