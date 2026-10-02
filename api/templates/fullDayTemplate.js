export const getFullDayTemplate = (data) => {
  const { name, date, workingHours } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Full-Day Attendance Confirmation</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 2.5rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.1rem; opacity: 0.9; margin-top: 5px; }
        .content { padding: 40px 30px; text-align: center; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #15803d; margin-bottom: 20px; }
        .congrats-icon { font-size: 3rem; margin: 20px 0; }
        .stat-box { display: inline-block; background-color: #f0fdf4; border: 1px dashed #22c55e; border-radius: 12px; padding: 15px 30px; margin: 15px 0 25px; }
        .stat-value { font-size: 1.8rem; font-weight: 800; color: #15803d; }
        .stat-label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; margin-top: 5px; }
        .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">🎉</div>
            <div class="company-name">APARAITECH SOFTWARE</div>
            <div class="header-title">Full-Day Attendance Confirmation</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Great Job, ${name}!</div>
            <div class="congrats-icon">🌟</div>
            <p>We are pleased to confirm that you have completed your full-day working hours requirement today. Thank you for your dedication, focus, and valuable contributions today!</p>
            
            <div class="stat-box">
              <div class="stat-value">${workingHours}</div>
              <div class="stat-label">Total Time Logged</div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #64748b; text-align: left;">Date</td>
                <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f2b3d; font-weight: 700; text-align: right;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #64748b; text-align: left;">Attendance Status</td>
                <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #16a34a; font-weight: 700; text-align: right;">FULL DAY</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p><strong>Aparaitech HRMS 2.0</strong> | Intelligent Enterprise Attendance Portal</p>
            <p>This is an automated notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
