export const getCheckInTemplate = (data) => {
  const { name, empId, date, time, department, status } = data
  const statusFormatted = status.replace('-', ' ').toUpperCase()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-In Successful</title>
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
        .status-pill { display: inline-block; padding: 6px 16px; background-color: #dbeafe; color: #1e40af; border-radius: 50px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; margin-bottom: 25px; }
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
            <div class="header-title">Check-In Successful – Attendance Recorded</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Hello, ${name} 👋</div>
            <p>Your check-in has been logged successfully for today. Have a productive day at work!</p>
            
            <div style="text-align: center;">
              <span class="status-pill">🟢 CHECKED-IN (PENDING CHECK-OUT)</span>
            </div>
            
            <table class="data-table">
              <tr>
                <td class="label">Employee ID</td>
                <td class="value"><strong>${empId}</strong></td>
              </tr>
              <tr>
                <td class="label">Department</td>
                <td class="value">${department}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">${date}</td>
              </tr>
              <tr>
                <td class="label">Check-In Time</td>
                <td class="value"><strong>${time}</strong></td>
              </tr>
              <tr>
                <td class="label">Initial Status</td>
                <td class="value"><span style="color: #22c55e; font-weight: 700;">${statusFormatted}</span></td>
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
