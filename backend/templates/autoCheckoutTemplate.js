export const getAutoCheckoutTemplate = (data) => {
  const { name } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Automatic Check-Out Completed</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a, #0f172a); padding: 35px 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 3rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.2rem; font-weight: 700; margin-top: 10px; }
        .content { padding: 40px 30px; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #0f2b3d; margin-bottom: 15px; }
        .info-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0; font-size: 0.95rem; line-height: 1.6; color: #15803d; }
        .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">⚙️</div>
            <div class="company-name">APARAITECH SOFTWARE</div>
            <div class="header-title">Automatic Check-Out Completed</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Dear ${name},</div>
            <p>Your attendance record shows that you did not complete the checkout process today. Since no manual checkout was performed, the system has automatically completed your checkout at 8:00 PM.</p>
            
            <div class="info-box">
              <strong>Checkout Type:</strong> System Auto Checkout<br />
              <strong>Checkout Time:</strong> 8:00 PM (20:00)<br />
              <strong>Status:</strong> Present (Hours compiled)
            </div>
            
            <p>Please ensure that you complete your checkout every working day to maintain accurate attendance records.</p>
            
            <p style="margin-top: 25px;">Regards,<br /><strong>HR Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>Aparaitech HRMS 2.0</strong> | Intelligent Enterprise Attendance Portal</p>
            <p>This is an automated policy notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
