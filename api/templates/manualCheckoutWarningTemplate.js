export const getManualCheckoutWarningTemplate = (data) => {
  const { name, date } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Manual Check-Out Completed</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #ea580c, #c2410c); padding: 35px 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 3rem; margin-bottom: 10px; }
        .company-name { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1.2rem; font-weight: 700; margin-top: 10px; }
        .content { padding: 40px 30px; }
        .welcome-msg { font-size: 1.2rem; font-weight: 700; color: #0f2b3d; margin-bottom: 15px; }
        .warning-box { background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; border-radius: 8px; margin: 25px 0; font-size: 0.95rem; line-height: 1.6; color: #c2410c; }
        .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">⚠️</div>
            <div class="company-name">APARAITECH SOFTWARE</div>
            <div class="header-title">Manual Check-Out Completed</div>
          </div>
          <div class="content">
            <div class="welcome-msg">Dear ${name},</div>
            <p>Our attendance records show that you forgot to check out today. Your attendance details have been updated by the Administrator.</p>
            
            <div class="warning-box">
              <strong>Notice Date:</strong> ${date}<br />
              <strong>Actions:</strong> A manual checkout has been recorded for you at <strong>7:30 PM</strong> by the HR Administrator.
            </div>
            
            <p>Please ensure that you complete both your check-in and check-out every working day. Repeated missed check-outs may result in further action as per the company attendance policy.</p>
            <p style="margin-top: 20px;">If you have any questions regarding this action, please contact the HR team.</p>
            
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
