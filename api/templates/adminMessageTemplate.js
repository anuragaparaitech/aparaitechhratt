export const getAdminMessageTemplate = (data) => {
  const { employeeName, subject, message, dateTime, adminName, portalUrl } = data
  const formattedMessage = message.replace(/\n/g, '<br />')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .wrapper { width: 100%; padding: 40px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f2b3d, #1e5a7a); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 2.2rem; line-height: 1; margin-bottom: 8px; }
        .company-name { font-size: 1.4rem; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
        .company-tagline { font-size: 0.85rem; opacity: 0.85; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .banner { background-color: #eff6ff; border-bottom: 1px solid #dbeafe; padding: 15px 25px; text-align: center; font-size: 0.95rem; font-weight: 700; color: #1e40af; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .content { padding: 35px 30px; }
        .greeting { font-size: 1.05rem; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 15px; }
        .intro-text { font-size: 0.95rem; color: #475569; line-height: 1.6; margin-bottom: 25px; }
        .message-card { background-color: #f8fafc; border-left: 4px solid #1e5a7a; border-radius: 8px; padding: 24px; margin-bottom: 30px; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .info-row { margin-bottom: 14px; font-size: 0.9rem; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; display: inline-block; width: 100px; }
        .info-value { color: #1e293b; font-weight: 600; }
        .message-body { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0; font-size: 0.98rem; color: #334155; line-height: 1.6; word-break: break-word; }

        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer-links { margin-bottom: 12px; }
        .footer-link { color: #1e5a7a; text-decoration: none; margin: 0 8px; font-weight: 600; }
        .copyright { margin: 8px 0 0 0; opacity: 0.85; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <!-- Branding Section -->
          <div class="header">
            <div class="logo">⚡</div>
            <h1 class="company-name">APARAITECH SOFTWARE</h1>
            <div class="company-tagline">Employee Management System</div>
          </div>
          
          <!-- Welcome Banner -->
          <div class="banner">
            <span>📢</span> New Message From Administration
          </div>
          
          <!-- Content Section -->
          <div class="content">
            <div class="greeting">Hello ${employeeName},</div>
            <div class="intro-text">
              You have received a new official communication from the Administration Team. Please review the details below:
            </div>
            
            <!-- Message Information Card -->
            <div class="message-card">
              <div class="info-row">
                <span class="info-label">Subject:</span>
                <span class="info-value" style="color: #0f172a; font-size: 0.95rem;">${subject}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Sent By:</span>
                <span class="info-value">${adminName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date & Time:</span>
                <span class="info-value">${dateTime}</span>
              </div>
              
              <!-- Highlighted Message Area -->
              <div class="message-body">
                ${formattedMessage}
              </div>
            </div>
            

          </div>
          
          <!-- Footer Section -->
          <div class="footer">
            <div class="footer-links">
              <a href="https://aparaitech.com" class="footer-link" target="_blank">Website</a>
              <span style="color: #cbd5e1;">•</span>
              <a href="mailto:support@aparaitech.com" class="footer-link">Support Email</a>
            </div>
            <p class="copyright">
              © 2026 APARAITECH SOFTWARE. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
