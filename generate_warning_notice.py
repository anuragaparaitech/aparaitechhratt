import os
import base64
import subprocess
import pymupdf

base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
assets_dir = os.path.join(base_dir, "assets")

# 1. Load Logo
logo_path = os.path.join(base_dir, "frontend", "public", "aparaitech-logo.png")
with open(logo_path, "rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode("utf-8")

# 2. Load Anurag Nand Signature (Clean transparent PNG)
sig_path = os.path.join(assets_dir, "anurag_nand_signature_transparent.png")
with open(sig_path, "rb") as f:
    sig_b64 = base64.b64encode(f.read()).decode("utf-8")

# 3. Generate High-Fidelity Official Aparaitech Stamp SVG (Exact match with upright text & distress filter)
stamp_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <defs>
    <!-- Top arc: left to right over the top -->
    <path id="arcTop" d="M 44,160 A 116,116 0 0,1 276,160" fill="none" />
    <!-- Bottom arc: left to right curving down so text faces upwards -->
    <path id="arcBottom" d="M 48,160 A 112,112 0 0,0 272,160" fill="none" />
    
    <!-- Realistic rubber stamp ink texture -->
    <filter id="stampDistress" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <g filter="url(#stampDistress)" stroke="#221e68" fill="#221e68" opacity="0.90">
    <!-- Outer concentric rings -->
    <circle cx="160" cy="160" r="148" fill="none" stroke="#221e68" stroke-width="4.8" />
    <circle cx="160" cy="160" r="139" fill="none" stroke="#221e68" stroke-width="1.8" />
    <circle cx="160" cy="160" r="86" fill="none" stroke="#221e68" stroke-width="2.8" />

    <!-- Top Text: APARAITECH -->
    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="25" font-weight="900" letter-spacing="6" fill="#221e68">
      <textPath href="#arcTop" startOffset="50%" text-anchor="middle">APARAITECH</textPath>
    </text>

    <!-- Side Stars -->
    <text x="32" y="167" font-family="'Arial', sans-serif" font-size="22" text-anchor="middle" fill="#221e68">★</text>
    <text x="288" y="167" font-family="'Arial', sans-serif" font-size="22" text-anchor="middle" fill="#221e68">★</text>

    <!-- Bottom Text: BARAMATI (Upright curved along bottom) -->
    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="21" font-weight="900" letter-spacing="5.5" fill="#221e68">
      <textPath href="#arcBottom" startOffset="50%" text-anchor="middle">BARAMATI</textPath>
    </text>

    <!-- Center Text: PUNE & PINCODE -->
    <text x="160" y="142" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#221e68">PUNE</text>
    <line x1="110" y1="151" x2="210" y2="151" stroke="#221e68" stroke-width="2.4" />
    <text x="160" y="178" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" letter-spacing="3.5" text-anchor="middle" fill="#221e68">413102</text>
  </g>
</svg>"""

stamp_svg_b64 = base64.b64encode(stamp_svg.encode("utf-8")).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Final Warning Notice - Arman Momin - Aparaitech Software</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {{
      size: A4 portrait;
      margin: 0;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }}
    .page {{
      width: 210mm;
      height: 297mm;
      position: relative;
      background: #ffffff;
      padding: 13mm 16mm 11mm 16mm;
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
      overflow: hidden;
    }}

    /* Top Color Bar */
    .top-accent-bar {{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #dc2626 0%, #b91c1c 25%, #0f2b5c 50%, #1e3a8a 100%);
    }}

    /* Watermark */
    .watermark {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 74px;
      font-weight: 900;
      letter-spacing: 14px;
      color: rgba(220, 38, 38, 0.052);
      border: 6px dashed rgba(220, 38, 38, 0.075);
      padding: 16px 45px;
      border-radius: 16px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1;
      text-transform: uppercase;
      user-select: none;
    }}

    /* Content Wrapper */
    .content-wrapper {{
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }}

    /* Header Section */
    .header {{
      display: flex;
      align-items: center;
      justifyContent: space-between;
      border-bottom: 2px solid #0f2b5c;
      padding-bottom: 7px;
    }}
    .header-left {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .company-logo {{
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }}
    .company-info h1 {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f2b5c;
      line-height: 1.1;
    }}
    .company-info .subtitle {{
      font-size: 8.5px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 2px;
    }}
    .header-right {{
      text-align: right;
    }}
    .doc-ref-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 8.5px;
      line-height: 1.4;
    }}
    .doc-ref-box .ref-no {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      color: #0f2b5c;
    }}
    .doc-ref-box .date-text {{
      color: #475569;
      font-weight: 600;
    }}

    /* Notice Title Banner */
    .notice-banner {{
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%);
      color: #ffffff;
      padding: 6.5px 14px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justifyContent: space-between;
      box-shadow: 0 3px 8px rgba(185, 28, 28, 0.25);
    }}
    .notice-title-wrap {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .notice-title-wrap .icon {{
      font-size: 16px;
    }}
    .notice-title-wrap h2 {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }}
    .severity-badge {{
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }}

    /* Recipient Metadata Card */
    .recipient-card {{
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0f2b5c;
      border-radius: 6px;
      padding: 6px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5px 16px;
      font-size: 8.5px;
    }}
    .meta-item {{
      display: flex;
      align-items: baseline;
      gap: 6px;
    }}
    .meta-label {{
      font-weight: 700;
      color: #475569;
      min-width: 82px;
      text-transform: uppercase;
      font-size: 7.5px;
      letter-spacing: 0.4px;
    }}
    .meta-value {{
      font-weight: 600;
      color: #0f172a;
    }}
    .meta-value.highlight {{
      color: #0f2b5c;
      font-weight: 800;
    }}

    /* Subject Box */
    .subject-box {{
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      border-radius: 6px;
      padding: 5.5px 12px;
      font-size: 9px;
      line-height: 1.35;
    }}
    .subject-box strong {{
      color: #991b1b;
      font-weight: 800;
    }}
    .subject-text {{
      color: #7f1d1d;
      font-weight: 700;
    }}

    /* Preamble */
    .preamble {{
      font-size: 8.5px;
      line-height: 1.45;
      color: #334155;
      text-align: justify;
    }}

    /* Section Headers */
    .section-title {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }}
    .section-title.red {{
      color: #991b1b;
    }}
    .section-title::after {{
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
      margin-left: 6px;
    }}

    /* Issues Grid (5 items) */
    .issues-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 8px;
    }}
    .issue-card {{
      background: #ffffff;
      border: 1px solid #fecaca;
      border-radius: 5px;
      padding: 4.5px 8px;
      display: flex;
      gap: 6px;
      font-size: 8px;
      line-height: 1.35;
    }}
    .issue-card.full-width {{
      grid-column: span 2;
    }}
    .issue-num {{
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fee2e2;
      color: #b91c1c;
      font-weight: 800;
      font-size: 8.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }}
    .issue-text strong {{
      color: #991b1b;
      font-weight: 700;
      display: block;
      margin-bottom: 1px;
      font-size: 8.5px;
    }}
    .issue-text p {{
      color: #475569;
    }}

    /* Warning Clauses Box */
    .warning-box {{
      background: #fff7ed;
      border: 1px solid #ffedd5;
      border-left: 4px solid #ea580c;
      border-radius: 6px;
      padding: 5.5px 10px;
      font-size: 8px;
      line-height: 1.4;
    }}
    .warning-box h4 {{
      color: #9a3412;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2.5px;
    }}
    .warning-list {{
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5px 10px;
    }}
    .warning-list li {{
      position: relative;
      padding-left: 12px;
      color: #7c2d12;
    }}
    .warning-list li::before {{
      content: '⚠️';
      position: absolute;
      left: 0;
      font-size: 7px;
      top: 1px;
    }}
    .warning-list li strong {{
      color: #9a3412;
      font-weight: 700;
    }}

    /* Expectations Grid */
    .expectations-box {{
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-left: 4px solid #16a34a;
      border-radius: 6px;
      padding: 5.5px 10px;
      font-size: 8px;
      line-height: 1.4;
    }}
    .expectations-box h4 {{
      color: #166534;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2.5px;
    }}
    .expectations-list {{
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5px 10px;
    }}
    .expectations-list li {{
      position: relative;
      padding-left: 12px;
      color: #14532d;
    }}
    .expectations-list li::before {{
      content: '✓';
      position: absolute;
      left: 0;
      font-weight: 900;
      color: #16a34a;
      font-size: 9px;
    }}
    .expectations-list li strong {{
      color: #166534;
      font-weight: 700;
    }}

    /* Signatures & Seal Section */
    .signatures-section {{
      display: grid;
      grid-template-columns: 1.18fr 1fr;
      gap: 14px;
      margin-top: 1px;
      padding-top: 5px;
      border-top: 1px solid #e2e8f0;
    }}

    /* Authority Box */
    .authority-box {{
      position: relative;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 12px;
    }}
    .box-title {{
      font-size: 7.5px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }}
    .sig-seal-container {{
      position: relative;
      height: 52px;
      display: flex;
      align-items: center;
    }}
    .signature-img {{
      height: 48px;
      max-width: 140px;
      object-fit: contain;
      position: relative;
      z-index: 2;
    }}
    .official-stamp-img {{
      position: absolute;
      right: 14px;
      top: -12px;
      width: 78px;
      height: 78px;
      object-fit: contain;
      transform: rotate(-9deg);
      opacity: 0.88;
      z-index: 3;
      filter: drop-shadow(0 1px 3px rgba(34, 30, 104, 0.25));
    }}
    .signer-details {{
      margin-top: 3px;
      font-size: 8px;
      line-height: 1.3;
    }}
    .signer-name {{
      font-weight: 800;
      color: #0f2b5c;
      font-size: 9px;
    }}
    .signer-designation {{
      font-weight: 600;
      color: #475569;
    }}
    .signer-dept {{
      font-weight: 700;
      color: #0f2b5c;
    }}

    /* Employee Acknowledgement Box */
    .ack-box {{
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 12px;
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
    }}
    .ack-statement {{
      font-size: 7.5px;
      line-height: 1.35;
      color: #475569;
      margin-bottom: 6px;
      text-align: justify;
    }}
    .ack-sign-line {{
      display: flex;
      justifyContent: space-between;
      align-items: flex-end;
      padding-top: 12px;
      border-top: 1px dashed #94a3b8;
      font-size: 8px;
    }}
    .emp-name {{
      font-weight: 800;
      color: #0f172a;
    }}
    .emp-date {{
      color: #64748b;
      font-weight: 600;
    }}

    /* Footer */
    .footer {{
      border-top: 1.5px solid #0f2b5c;
      padding-top: 5px;
      display: flex;
      justifyContent: space-between;
      align-items: flex-end;
      font-size: 7.5px;
      color: #64748b;
      gap: 16px;
    }}
    .footer-left {{
      flex: 1;
      max-width: 62%;
      line-height: 1.4;
    }}
    .footer-left strong {{
      color: #0f2b5c;
      font-weight: 700;
    }}
    .footer-right {{
      flex-shrink: 0;
      text-align: right;
      line-height: 1.4;
    }}
    .footer-badge {{
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      font-size: 7px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }}
  </style>
</head>
<body>

  <div class="page">
    <div class="top-accent-bar"></div>
    <div class="watermark">FINAL WARNING</div>

    <div class="content-wrapper">
      <!-- 1. Header -->
      <div class="header">
        <div class="header-left">
          <img src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" class="company-logo" />
          <div class="company-info">
            <h1>APARAITECH SOFTWARE</h1>
            <div class="subtitle">Human Resources & Disciplinary Governance Board</div>
          </div>
        </div>
        <div class="header-right">
          <div class="doc-ref-box">
            <div><span class="ref-no">REF NO:</span> AP/HR/FWN/2026/AP7099-01</div>
            <div><span class="date-text">DATE OF ISSUANCE:</span> October 14, 2026</div>
          </div>
        </div>
      </div>

      <!-- 2. Notice Title Banner -->
      <div class="notice-banner">
        <div class="notice-title-wrap">
          <span class="icon">⚠️</span>
          <h2>FINAL WARNING NOTICE & PERFORMANCE REPRIMAND</h2>
        </div>
        <span class="severity-badge">Level 3 Disciplinary Escalation</span>
      </div>

      <!-- 3. Recipient Card -->
      <div class="recipient-card">
        <div class="meta-item">
          <span class="meta-label">Employee Name:</span>
          <span class="meta-value highlight">Arman Momin</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Employee ID:</span>
          <span class="meta-value highlight">AP7099</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Official Email:</span>
          <span class="meta-value">armanmomin202@gmail.com</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Department / Role:</span>
          <span class="meta-value">Business Development (BDA)</span>
        </div>
      </div>

      <!-- 4. Subject Box -->
      <div class="subject-box">
        <strong>SUBJECT: </strong>
        <span class="subject-text">FINAL WRITTEN WARNING FOR PERSISTENT LACK OF PROFESSIONALISM & REPEATED BREACH OF CODE OF CONDUCT</span>
      </div>

      <!-- 5. Formal Preamble -->
      <p class="preamble">
        This document serves as an official and final written reprimand issued under the Human Resources Disciplinary Policy of Aparaitech Software. Despite prior verbal notifications and supervisory counseling, your recent conduct, attendance, and reporting metrics have repeatedly fallen well below acceptable corporate benchmarks, adversely affecting operational continuity.
      </p>

      <!-- 6. Issues Breakdown -->
      <div>
        <div class="section-title red">SPECIFIC INFRACTIONS & ISSUES DOCUMENTED</div>
        <div class="issues-grid">
          <div class="issue-card">
            <div class="issue-num">1</div>
            <div class="issue-text">
              <strong>Unauthorized Leave (Absenteeism)</strong>
              <p>Repeated absence from scheduled duties without prior written approval or formal notice to the Team Lead and HR department.</p>
            </div>
          </div>
          <div class="issue-card">
            <div class="issue-num">2</div>
            <div class="issue-text">
              <strong>Late Login & Time Irregularity</strong>
              <p>Consistent failure to adhere to designated shift login timings and absence from mandatory morning briefings and team standups.</p>
            </div>
          </div>
          <div class="issue-card">
            <div class="issue-num">3</div>
            <div class="issue-text">
              <strong>Poor Daily Work Reports</strong>
              <p>Failure to submit timely daily performance sheets, unverified call logs, and negligence toward the mandatory 2-slot reporting framework.</p>
            </div>
          </div>
          <div class="issue-card">
            <div class="issue-num">4</div>
            <div class="issue-text">
              <strong>Lack of Workplace Discipline</strong>
              <p>Non-compliance with established organizational SOPs, inattentiveness during supervisory reviews, and disregard for team directives.</p>
            </div>
          </div>
          <div class="issue-card full-width">
            <div class="issue-num">5</div>
            <div class="issue-text">
              <strong>Unprofessional Behavior & Irresponsible Conduct</strong>
              <p>Exhibiting continuous indifference toward assigned targets, non-responsiveness on designated communication channels, and failure to uphold the professional conduct expected of an Aparaitech associate.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Final Warning & Consequences -->
      <div class="warning-box">
        <h4>FINAL WARNING TERMS & SEVERE CONSEQUENCES</h4>
        <ul class="warning-list">
          <li><strong>Personal Formal Notice:</strong> This warning is officially inscribed into your permanent HR dossier and employment file.</li>
          <li><strong>Immediate Impact on FTP:</strong> Consideration for Full-Time Placement (FTP) & certificate clearance is placed on immediate hold.</li>
          <li><strong>Disciplinary Supervision:</strong> You are placed under direct HR observation with zero tolerance for future procedural lapses.</li>
          <li><strong>Summary Termination:</strong> Any subsequent violation will lead to immediate employment termination without further warning or compensation.</li>
        </ul>
      </div>

      <!-- 8. Mandatory Expectations -->
      <div class="expectations-box">
        <h4>MANDATORY REQUISITES FOR IMMEDIATE COMPLIANCE</h4>
        <ul class="expectations-list">
          <li><strong>Report On Time:</strong> Mark punctuality daily at or before assigned shift login using portal verification.</li>
          <li><strong>Informative Leave Protocol:</strong> Never abandon duties or leave workstations without prior formal written sanction.</li>
          <li><strong>Submit Daily Reports:</strong> File complete, verified calling data and conversions on the portal before checkout.</li>
          <li><strong>Follow Rules & Regulations:</strong> Comply with all company guidelines, shift policies, and managerial instructions.</li>
          <li><strong>Maintain Professionalism:</strong> Demonstrate accountability, proactive communication, and ethical workplace conduct.</li>
          <li><strong>Performance Turnaround:</strong> Achieve required calling quotas and conversion targets during the review period.</li>
        </ul>
      </div>

      <!-- 9. Signatures & Stamp Section -->
      <div class="signatures-section">
        <!-- Authorized Signatory -->
        <div class="authority-box">
          <div class="box-title">ISSUED BY AUTHORIZED MANAGEMENT:</div>
          <div class="sig-seal-container">
            <img src="data:image/png;base64,{sig_b64}" alt="Anurag Nand Signature" class="signature-img" />
            <img src="data:image/svg+xml;base64,{stamp_svg_b64}" alt="Aparaitech Official Seal" class="official-stamp-img" />
          </div>
          <div class="signer-details">
            <div class="signer-name">Anurag Nand</div>
            <div class="signer-designation">Team Lead (TL) & Human Resources Department</div>
            <div class="signer-dept">Aparaitech Software Company</div>
          </div>
        </div>

        <!-- Employee Acknowledgement -->
        <div class="ack-box">
          <div class="box-title">EMPLOYEE ACKNOWLEDGEMENT & ACCEPTANCE:</div>
          <p class="ack-statement">
            "I, <strong>Arman Momin</strong>, hereby acknowledge receipt of this Final Warning Notice. I have read, understood, and fully accept the contents, expectations, and consequences stated herein, and commit to immediate compliance."
          </p>
          <div class="ack-sign-line">
            <div>
              <div style="color: #64748b; font-size: 7px; margin-bottom: 2px;">EMPLOYEE SIGNATURE</div>
              <div class="emp-name">Arman Momin (AP7099)</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #64748b; font-size: 7px; margin-bottom: 2px;">DATE ACKNOWLEDGED</div>
              <div class="emp-date">____ / ____ / 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 10. Footer -->
    <div class="footer">
      <div class="footer-left">
        <div><strong>HR Team, Aparaitech Software</strong> &bull; Corporate Governance & Talent Operations</div>
        <div>Corporate HQ: Gera's Imperium Rise, Hinjawadi Phase 2, Pune, Maharashtra 411057</div>
        <div>Regional Centre: Anand Nagar Colony, Baramati, Dist. Pune 413102 | Bengaluru: Electronic City Phase 1</div>
      </div>
      <div class="footer-right">
        <div><span class="footer-badge">STRICTLY CONFIDENTIAL</span></div>
        <div>Contact: +91 6364326342 | hr@aparaitech.com</div>
        <div>Web: www.aparaitech.org | portal.aparaitech.com</div>
      </div>
    </div>
  </div>

</body>
</html>"""

# Write HTML file
html_file = os.path.join(base_dir, "Final_Warning_Notice_Arman_Momin.html")
with open(html_file, "w", encoding="utf-8") as f:
    f.write(html_content)
print("Saved HTML Notice:", html_file)

# Render PDF using Headless Chrome
pdf_file = os.path.join(base_dir, "Final_Warning_Notice_Arman_Momin.pdf")
temp_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "chrome_pdf_warning")
os.makedirs(temp_dir, exist_ok=True)

chrome_cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--disable-gpu",
    f"--user-data-dir={temp_dir}",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_file}",
    html_file
]

print("Rendering PDF with Chrome headless...")
res = subprocess.run(chrome_cmd, capture_output=True, text=True)
if os.path.exists(pdf_file):
    print(f"SUCCESS: Generated PDF at {pdf_file} (Size: {os.path.getsize(pdf_file)} bytes)")
    
    # Check page count with PyMuPDF
    doc = pymupdf.open(pdf_file)
    print(f"Total Pages in PDF: {len(doc)}")
    
    # Render preview image
    pix = doc[0].get_pixmap(dpi=150)
    preview_img = os.path.join(assets_dir, "warning_notice_preview_page1.png")
    pix.save(preview_img)
    print("Saved preview image:", preview_img)
else:
    print("FAILED to generate PDF:", res.stderr)
