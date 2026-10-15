/**
 * Generates Official Aparaitech ID Card Email Template
 * Content and layout strictly modeled after the official Aparaitech Offer Letter email format.
 * Sent exclusively via hr.aparaitechh@gmail.com
 */
export const getIdCardTemplate = (data) => {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    idCardNumber = 'APT-IN-7081',
    designation = 'Software Developer Intern',
    joinDate = '15/10/2026',
    expireDate = '15/04/2027',
    collegeName = '',
    candidatePhoto = '',
    barcodeNumber = '2431000320445474'
  } = data

  // Default professional avatar if none uploaded
  const photoSrc = candidatePhoto && candidatePhoto.startsWith('data:image')
    ? candidatePhoto
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Project Program ID Card & Credentials - Aparaitech Software</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 30px 12px;
      box-sizing: border-box;
    }
    .email-container {
      max-width: 660px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      box-sizing: border-box;
    }
    .content-block {
      color: #222222;
      font-size: 14.5px;
      line-height: 1.65;
    }
    .greeting {
      font-size: 15px;
      color: #111827;
      margin-bottom: 16px;
    }
    .cards-row {
      display: table;
      width: 100%;
      margin: 26px 0;
    }
    .card-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding: 8px;
      box-sizing: border-box;
    }
    @media screen and (max-width: 620px) {
      .email-container { padding: 24px 18px; }
      .card-col { display: block !important; width: 100% !important; padding: 0 0 20px 0 !important; }
    }
    .id-card {
      width: 100%;
      max-width: 275px;
      margin: 0 auto;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.12);
      border: 1px solid #cbd5e1;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
    }
    .section-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #111827;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .steps-list {
      margin: 6px 0 18px 0;
      padding-left: 20px;
      color: #334155;
    }
    .steps-list li {
      margin-bottom: 4px;
    }
    .highlights-list {
      margin: 6px 0 18px 0;
      padding-left: 18px;
      list-style-type: disc;
      color: #334155;
    }
    .highlights-list li {
      margin-bottom: 4px;
    }
    .signature-block {
      margin-top: 28px;
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      
      <div class="content-block">
        <div class="greeting">
          Dear <strong>${candidateName}</strong>,
        </div>

        <p style="margin: 0 0 14px 0;">
          Congratulations! You have been selected for the 3-Month Live Project Program at Aparaitech Software Company.
        </p>

        <p style="margin: 0 0 18px 0;">
          Please find your official Internship ID Card and credentials issued below.
        </p>

        <!-- ── DUAL-SIDED ID CARD SHOWCASE (FRONT & BACK) ── -->
        <div class="cards-row">
          
          <!-- 1. FRONT CARD -->
          <div class="card-col">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6d28d9; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">
              🪪 ID Card — Front View
            </div>

            <div class="id-card">
              <!-- Top Curve & Brand Header -->
              <div style="background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%); padding: 16px 12px 42px 12px; position: relative; text-align: center; border-radius: 17px 17px 42% 42% / 17px 17px 24px 24px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 7px;">
                  <!-- Isometric Cube -->
                  <div style="width: 22px; height: 22px; display: inline-block; vertical-align: middle;">
                    <svg viewBox="0 0 36 36" width="22" height="22" fill="none">
                      <path d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z" fill="#0D9488" stroke="#115E59" stroke-width="2" />
                      <path d="M18 2L33 10.5L18 19L3 10.5L18 2Z" fill="#14B8A6" />
                      <path d="M18 19V34L3 25.5V10.5L18 19Z" fill="#0F766E" />
                      <path d="M18 19L33 10.5V25.5L18 34V19Z" fill="#2DD4BF" />
                    </svg>
                  </div>
                  <span style="font-size: 15px; font-weight: 900; letter-spacing: 1.2px; color: #000000; vertical-align: middle; font-family: 'Arial Black', sans-serif;">
                    APARAITECH
                  </span>
                </div>
              </div>

              <!-- Candidate Photo (Overlapping curve) -->
              <div style="text-align: center; margin-top: -36px; position: relative; z-index: 2;">
                <img src="${photoSrc}" alt="${candidateName}" style="width: 82px; height: 82px; border-radius: 50%; object-fit: cover; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.18); display: inline-block;" />
              </div>

              <!-- Candidate Name -->
              <div style="text-align: center; padding: 6px 12px 2px 12px;">
                <div style="font-size: 15px; font-weight: 900; color: #0f172a; line-height: 1.2;">
                  ${candidateName}
                </div>
              </div>

              <!-- Designation Pill -->
              <div style="text-align: center; margin: 6px 14px;">
                <div style="background-color: #ddd6fe; color: #2e1065; font-size: 10.5px; font-weight: 800; padding: 4px 12px; border-radius: 20px; display: inline-block; letter-spacing: 0.2px;">
                  ${designation}
                </div>
              </div>

              <!-- Candidate Credentials Table with Blue Rubber Stamp -->
              <div style="padding: 10px 16px 6px 16px; font-size: 11px; position: relative;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <tr>
                    <td style="font-weight: 800; color: #000000; padding: 3px 0; width: 55px;">ID No</td>
                    <td style="color: #0f172a; font-weight: 700; padding: 3px 0;">${idCardNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 800; color: #000000; padding: 3px 0;">Email</td>
                    <td style="color: #0f172a; font-weight: 500; padding: 3px 0; word-break: break-all;">${candidateEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 800; color: #000000; padding: 3px 0;">Phone</td>
                    <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">${candidatePhone}</td>
                  </tr>
                </table>

                <!-- Official Blue Rubber Ink Stamp (Aparaitech Software - Pune 411057) -->
                <div style="position: absolute; right: 8px; bottom: -10px; width: 72px; height: 72px; transform: rotate(-8deg);">
                  <svg viewBox="0 0 320 320" width="72" height="72" style="display: block;">
                    <defs>
                      <path id="emailStampArcTop" d="M 44,160 A 116,116 0 1,1 276,160" fill="none" />
                      <path id="emailStampArcBottom" d="M 276,160 A 116,116 0 1,1 44,160" fill="none" />
                    </defs>
                    <circle cx="160" cy="160" r="154" fill="#ffffff" fill-opacity="0.92" stroke="#001b94" stroke-width="5" />
                    <circle cx="160" cy="160" r="145" fill="none" stroke="#001b94" stroke-width="2" />
                    <circle cx="160" cy="160" r="92" fill="none" stroke="#001b94" stroke-width="3.5" />
                    <text font-family="'Arial Black', Impact, sans-serif" font-size="30" font-weight="900" fill="#001b94">
                      <textPath href="#emailStampArcTop" startOffset="50%" text-anchor="middle">Aparaitech</textPath>
                    </text>
                    <text x="44" y="167" font-family="'Arial', sans-serif" font-size="24" text-anchor="middle" fill="#001b94">★</text>
                    <text x="276" y="167" font-family="'Arial', sans-serif" font-size="24" text-anchor="middle" fill="#001b94">★</text>
                    <text font-family="'Arial Black', Impact, sans-serif" font-size="28" font-weight="900" fill="#001b94">
                      <textPath href="#emailStampArcBottom" startOffset="50%" text-anchor="middle">Software</textPath>
                    </text>
                    <text x="160" y="146" font-family="'Arial Black', Impact, Georgia, sans-serif" font-size="52" font-weight="900" text-anchor="middle" fill="#001b94">Pune</text>
                    <text x="160" y="196" font-family="'Arial Black', Impact, sans-serif" font-size="34" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#001b94">411057</text>
                  </svg>
                </div>
              </div>

              <!-- Barcode & Lavender Corner Cutouts -->
              <div style="margin-top: 14px; background: #ffffff; text-align: center; padding: 6px 12px 14px 12px; position: relative;">
                <!-- Decorative corner cuts -->
                <div style="position: absolute; left: 0; bottom: 0; width: 28px; height: 28px; background: #c4b5fd; border-radius: 0 22px 0 16px;"></div>
                <div style="position: absolute; right: 0; bottom: 0; width: 28px; height: 28px; background: #c4b5fd; border-radius: 22px 0 16px 0;"></div>

                <!-- Crisp Barcode Lines -->
                <div style="letter-spacing: 2px; font-family: monospace; font-size: 19px; font-weight: 900; color: #000000; transform: scaleY(1.35); margin-bottom: 2px;">
                  ||| | |||| | ||| || ||| |
                </div>
              </div>
            </div>
          </div>

          <!-- 2. BACK CARD -->
          <div class="card-col">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6d28d9; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">
              🪪 ID Card — Back View
            </div>

            <div class="id-card" style="background: linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff;">
              <!-- Header & Serial -->
              <div style="padding: 16px 14px 4px 14px; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <div style="width: 18px; height: 18px; display: inline-block;">
                    <svg viewBox="0 0 36 36" width="18" height="18" fill="none">
                      <path d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z" fill="#5EEAD4" />
                      <path d="M18 2L33 10.5L18 19L3 10.5L18 2Z" fill="#2DD4BF" />
                      <path d="M18 19V34L3 25.5V10.5L18 19Z" fill="#0D9488" />
                      <path d="M18 19L33 10.5V25.5L18 34V19Z" fill="#99F6E4" />
                    </svg>
                  </div>
                  <span style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #ffffff; font-family: 'Arial Black', sans-serif;">
                    APARAITECH
                  </span>
                </div>
                <div style="font-size: 9px; color: #e9d5ff; font-family: monospace; margin-top: 3px; letter-spacing: 0.5px;">
                  ${barcodeNumber}
                </div>
              </div>

              <!-- Terms & Conditions Body -->
              <div style="padding: 6px 16px; font-size: 10px; line-height: 1.45;">
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; text-align: center; color: #ffffff;">
                  TERMS & CONDITIONS
                </div>
                
                <div style="margin-bottom: 6px;">
                  • <strong>Identification:</strong> Carry the ID card at all times during working hours for identification purposes.
                </div>
                <div style="margin-bottom: 8px;">
                  • <strong>Authorized Use:</strong> The ID card is strictly for official use and should not be shared or used for unauthorized purposes.
                </div>

                <!-- Dates Block -->
                <div style="background: rgba(255,255,255,0.14); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px;">
                  <div><strong>Join:</strong> ${joinDate}</div>
                  <div><strong>Expire:</strong> ${expireDate}</div>
                </div>

                <div style="font-size: 8px; color: #e0e7ff; line-height: 1.3; text-align: center;">
                  122, Gera Imperial Rise, Hinjewadi Phase 2, Wipro Circle, Pune - 411057
                </div>
              </div>

              <!-- White Chevron & Barcode Bottom (Matching exact card asset) -->
              <div style="background: #ffffff; color: #000000; text-align: center; padding: 10px 10px 8px 10px; clip-path: polygon(0 18%, 50% 0, 100% 18%, 100% 100%, 0 100%); margin-top: 8px;">
                <div style="letter-spacing: 2px; font-family: monospace; font-size: 17px; font-weight: 900; transform: scaleY(1.3); margin-top: 6px;">
                  |||| | ||| || |||| | |||
                </div>
                <div style="font-size: 9.5px; font-weight: 700; color: #475569; margin-top: 2px;">
                  info@ai.aparaitech.org
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ── SECTION: NEXT STEPS ── -->
        <div class="section-title">
          📋 NEXT STEPS:
        </div>
        <ol class="steps-list">
          <li>Download and save your digital ID Card</li>
          <li>Review all terms and conditions carefully</li>
          <li>Print a color laminated copy for physical campus / office verification</li>
          <li>Quote your ID Card Number (<strong>${idCardNumber}</strong>) in all project correspondence and attendance logs</li>
          <li>Carry your physical or digital ID card during all project reviews and mentor sessions</li>
          <li>Complete verification within 3 business days</li>
        </ol>

        <!-- ── SECTION: IMPORTANT NOTE ── -->
        <div class="section-title" style="margin-top: 20px;">
          IMPORTANT NOTE:
        </div>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px;">
          Before using this ID card, kindly go through the terms and conditions of Aparaitech Software at <a href="https://terms.aparaitech.org" style="color: #2563eb; text-decoration: underline;" target="_blank">https://terms.aparaitech.org</a>. By accepting this credential, you acknowledge that you have read, understood, and agree to abide by all the terms and conditions stated therein.
        </p>

        <!-- ── SECTION: PROGRAM HIGHLIGHTS ── -->
        <div class="section-title" style="margin-top: 20px;">
          Program Highlights:
        </div>
        <ul class="highlights-list">
          <li>Real-world industry projects</li>
          <li>Mentorship from senior developers</li>
          <li>Performance-based stipend</li>
          <li>Certificate upon successful completion</li>
        </ul>

        <!-- ── SECTION: SUPPORT & QUERIES ── -->
        <p style="margin: 20px 0 14px 0; color: #334155;">
          If you have any questions, please contact us at <a href="mailto:info@ai.aparaitech.org" style="color: #2563eb; text-decoration: none;">info@ai.aparaitech.org</a> or call +91-XXXXXXXXXX.
        </p>

        <p style="margin: 0 0 24px 0; color: #111827; font-weight: 600;">
          We look forward to having you on board!
        </p>

        <!-- ── SECTION: SIGNATURE BLOCK ── -->
        <div class="signature-block">
          <div>Warm regards,</div>
          <div style="font-weight: 700; color: #111827; margin-top: 2px;">HR Department</div>
          <div style="font-weight: 600; color: #111827;">Aparaitech Software Company</div>
          <div style="color: #64748b; font-size: 13px; margin-top: 2px;">
            122, Gera Imperial Rise, Hinjewadi Phase 2, Wipro Circle, Pune - 411057
          </div>
          <div style="margin-top: 3px;">
            <a href="mailto:info@ai.aparaitech.org" style="color: #2563eb; text-decoration: none; font-size: 13px;">info@ai.aparaitech.org</a>
            <span style="color: #94a3b8; margin: 0 5px;">|</span>
            <a href="https://www.aparaitech.org" style="color: #2563eb; text-decoration: none; font-size: 13px;" target="_blank">www.aparaitech.org</a>
          </div>
        </div>

      </div>

    </div>
  </div>
</body>
</html>
`
}
