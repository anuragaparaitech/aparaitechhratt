/**
 * Generates 7-Day Payment Due Reminder Email Template
 * Sent through hr.aparaitechh@gmail.com
 */
export const getPaymentDueReminderTemplate = (data) => {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    idCardNumber = 'APT-IN-7081',
    collegeName = '',
    onboardingDate = '',
    dueDate = '',
    paymentUtr = '',
    amount = 1500,
    dueAmount = 4500,
    daysElapsed = 7
  } = data

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Balance Due Reminder - Aparaitech</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 30px 10px; box-sizing: border-box; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #b45309 100%); padding: 25px; text-align: center; color: #ffffff; }
        .content { padding: 30px 25px; }
        .alert-pill { display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .data-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .label { font-weight: 700; color: #64748b; width: 45%; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .footer { background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">⚡ APARAITECH SOFTWARE</div>
            <div style="font-size: 11px; color: #fde68a; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 4px;">
              Accounts & Candidate Onboarding Verification
            </div>
          </div>
          <div class="content">
            <span class="alert-pill">⏳ 7-Day Payment Cycle Reminder</span>
            <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a; font-weight: 800;">
              Finalize Your Product Onboarding Balance (₹${dueAmount.toLocaleString('en-IN')})
            </h2>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
              Dear <strong>${candidateName}</strong> (${idCardNumber}),
            </p>

            <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
              This is a friendly reminder that your candidate onboarding 1st installment (₹${amount.toLocaleString('en-IN')}) was successfully logged on <strong>${onboardingDate}</strong>. As per the agreed 7-day milestone pipeline, the final balance payment is scheduled for completion.
            </p>

            <table class="data-table">
              <tr>
                <td class="label">Candidate Name</td>
                <td class="value">${candidateName}</td>
              </tr>
              <tr>
                <td class="label">College / Institute</td>
                <td class="value">${collegeName}</td>
              </tr>
              <tr>
                <td class="label">ID Card Number</td>
                <td class="value"><strong>${idCardNumber}</strong></td>
              </tr>
              <tr>
                <td class="label">1st Part Paid</td>
                <td class="value" style="color: #16a34a;">₹${amount.toLocaleString('en-IN')} (UTR: ${paymentUtr})</td>
              </tr>
              <tr>
                <td class="label">Balance Due</td>
                <td class="value" style="color: #dc2626; font-size: 15px; font-weight: 800;">₹${dueAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td class="label">Due Date</td>
                <td class="value"><strong>${dueDate}</strong> (${daysElapsed} days elapsed)</td>
              </tr>
            </table>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 4px;">
                Benefits Unlocked Upon Final Balance Clearance:
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #15803d; line-height: 1.55;">
                <li>Full production cloud repository push access & private team Discord/Slack.</li>
                <li>Official corporate completion certificate & recommendation letter eligibility.</li>
                <li>Overall performance-based stipend eligibility (₹8,000 – ₹15,000 tenure).</li>
              </ul>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
              Kindly complete the remaining payment of <strong>₹${dueAmount.toLocaleString('en-IN')}</strong> and reply directly to this email at <strong>hr.aparaitechh@gmail.com</strong> with your Transaction UTR number or receipt.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 4px 0;"><strong>Aparaitech Software Company</strong> | Accounts & HR Department</p>
            <p style="margin: 0 0 4px 0;">122, Gera Imperial Rise, Hinjewadi Phase 2, Wipro Circle, Pune - 411057</p>
            <p style="margin: 0;">Inquiries: info@ai.aparaitech.org | www.aparaitech.org</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
