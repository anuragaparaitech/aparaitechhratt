export const getAdminTemplate = (data) => {
  const { name, empId, department, checkIn, checkOut, workingHours, status, isEarly } = data
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
      <title>Employee Checkout Report</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f2b3d, #1e5a7a); padding: 25px; text-align: center; color: #ffffff; }
        .company-name { font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; }
        .header-title { font-size: 1rem; opacity: 0.9; margin-top: 5px; }
        .content { padding: 35px 25px; }
        .alert-bar { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 10px; margin-bottom: 25px; font-size: 0.95rem; color: #0f2b3d; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .data-table tr { border-bottom: 1px solid #f1f5f9; }
        .data-table td { padding: 12px 10px; font-size: 0.9rem; }
        .label { font-weight: 700; color: #64748b; width: 45%; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px; }
        .value { color: #0f2b3d; font-weight: 600; text-align: right; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="company-name">⚡ APARAITECH SOFTWARE</div>
            <div class="header-title">HR Activity Log – Employee Checkout Report</div>
          </div>
          <div class="content">
            <div class="alert-bar">
              ⚙️ <strong>Activity Alert:</strong> Employee <strong>${name}</strong> has checked out for today.
            </div>
            
            <table class="data-table">
              <tr>
                <td class="label">Employee Name</td>
                <td class="value">${name}</td>
              </tr>
              <tr>
                <td class="label">Employee ID</td>
                <td class="value"><strong>${empId}</strong></td>
              </tr>
              <tr>
                <td class="label">Department</td>
                <td class="value">${department}</td>
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
                <td class="label">Total Working Hours</td>
                <td class="value"><strong>${workingHours}</strong></td>
              </tr>
              <tr>
                <td class="label">Attendance Status</td>
                <td class="value"><span style="color: ${statusColor};">${statusFormatted}</span></td>
              </tr>
              <tr>
                <td class="label">Early Checkout?</td>
                <td class="value">
                  ${isEarly 
                    ? '<span style="color: #ef4444; font-weight: 700; background-color: #fee2e2; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem;">YES</span>' 
                    : '<span style="color: #22c55e; font-weight: 700; background-color: #dcfce7; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem;">NO</span>'}
                </td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p><strong>Aparaitech HRMS 2.0</strong> | HR Administration & Analytics Engine</p>
            <p>This is a system audit notification. Please do not reply directly to this message.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
