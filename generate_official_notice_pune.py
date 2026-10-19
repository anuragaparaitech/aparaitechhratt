import os
import base64
import subprocess
import pymupdf

base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
assets_dir = os.path.join(base_dir, "assets")

# 1. Load Company Logo
logo_path = os.path.join(base_dir, "frontend", "public", "aparaitech-logo.png")
with open(logo_path, "rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode("utf-8")

# 2. Official Aparaitech Rubber Stamp SVG
stamp_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <defs>
    <path id="arcTop" d="M 44,160 A 116,116 0 0,1 276,160" fill="none" />
    <path id="arcBottom" d="M 48,160 A 112,112 0 0,0 272,160" fill="none" />
    <filter id="stampDistress" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <g filter="url(#stampDistress)" stroke="#1a1658" fill="#1a1658" opacity="0.90">
    <circle cx="160" cy="160" r="148" fill="none" stroke="#1a1658" stroke-width="4.8" />
    <circle cx="160" cy="160" r="139" fill="none" stroke="#1a1658" stroke-width="1.8" />
    <circle cx="160" cy="160" r="86" fill="none" stroke="#1a1658" stroke-width="2.8" />

    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="25" font-weight="900" letter-spacing="6" fill="#1a1658">
      <textPath href="#arcTop" startOffset="50%" text-anchor="middle">APARAITECH</textPath>
    </text>

    <text x="32" y="167" font-family="'Arial', sans-serif" font-size="22" text-anchor="middle" fill="#1a1658">★</text>
    <text x="288" y="167" font-family="'Arial', sans-serif" font-size="22" text-anchor="middle" fill="#1a1658">★</text>

    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="21" font-weight="900" letter-spacing="5.5" fill="#1a1658">
      <textPath href="#arcBottom" startOffset="50%" text-anchor="middle">BARAMATI</textPath>
    </text>

    <text x="160" y="142" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#1a1658">PUNE</text>
    <line x1="110" y1="151" x2="210" y2="151" stroke="#1a1658" stroke-width="2.4" />
    <text x="160" y="178" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" letter-spacing="3.5" text-anchor="middle" fill="#1a1658">413102</text>
  </g>
</svg>"""

stamp_svg_b64 = base64.b64encode(stamp_svg.encode("utf-8")).decode("utf-8")

# HTML Template: Simple, clean, formal corporate letterhead format (No bright red boxes/colors, No "FINAL WARNING" watermark)
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OFFICIAL NOTICE – DISCIPLINE &amp; PROFESSIONAL CONDUCT - APARAITECH</title>
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
      font-family: Arial, 'Calibri', 'Segoe UI', Helvetica, sans-serif;
      color: #000000;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }}
    .page {{
      width: 210mm;
      height: 297mm;
      position: relative;
      background: #ffffff;
      padding: 0 18mm 12mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }}

    /* Top Cyan Accent Line (Matching corporate letterhead format) */
    .top-cyan-bar {{
      height: 4px;
      background-color: #00A8B5;
      width: calc(100% + 36mm);
      margin-left: -18mm;
      margin-bottom: 16px;
    }}

    /* Subtle Company Logo Watermark in Background (Matching reference letterhead) */
    .watermark-center {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 340px;
      opacity: 0.045;
      pointer-events: none;
      z-index: 1;
      text-align: center;
    }}
    .watermark-center img {{
      width: 230px;
      height: auto;
    }}

    /* Main Content Container */
    .content {{
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 9px;
      width: 100%;
    }}

    /* Header Meta Line: Ref No (Left) and Date (Right) */
    .meta-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 10.5px;
      color: #000000;
      line-height: 1.2;
    }}
    .meta-header strong {{
      font-weight: 700;
    }}

    /* Brand Header with Company Logo */
    .brand-header {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 2px;
      margin-bottom: 4px;
    }}
    .brand-logo {{
      height: 38px;
      width: auto;
      object-fit: contain;
    }}
    .brand-titles {{
      text-align: center;
    }}
    .brand-company-name {{
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1E3A8A;
      text-transform: uppercase;
      line-height: 1.2;
    }}
    .notice-title {{
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1E3A8A;
      text-transform: uppercase;
      line-height: 1.2;
      margin-top: 2px;
    }}

    /* Recipient & Sender Routing (Clean, simple layout) */
    .routing-block {{
      font-size: 10px;
      line-height: 1.45;
      color: #000000;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
    }}
    .routing-block strong {{
      font-weight: 700;
    }}

    /* Subject Line */
    .subject-line {{
      font-size: 10px;
      line-height: 1.35;
      color: #000000;
      margin-top: 1px;
    }}
    .subject-line strong {{
      font-weight: 700;
    }}

    /* Section Headings */
    .sec-head {{
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #1E3A8A;
      text-transform: uppercase;
      margin-top: 2px;
      margin-bottom: 3px;
    }}

    /* Preamble Text */
    .preamble-text {{
      font-size: 9px;
      line-height: 1.4;
      color: #000000;
      text-align: justify;
    }}
    .preamble-text strong {{
      font-weight: 700;
    }}

    /* Issues Observed Table (Clean corporate monochrome table) */
    .issues-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
      line-height: 1.3;
      margin-top: 1px;
    }}
    .issues-table th {{
      background-color: #f1f5f9;
      color: #000000;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 4px 6px;
      text-align: left;
      font-size: 8.5px;
      border: 1px solid #cbd5e1;
    }}
    .issues-table td {{
      padding: 3.5px 6px;
      border: 1px solid #cbd5e1;
      color: #000000;
    }}
    .issues-table tr:nth-child(even) {{
      background-color: #f8fafc;
    }}
    .issues-table td.issue-name {{
      font-weight: 700;
      color: #000000;
      white-space: nowrap;
    }}

    /* Rules & Regulations (2 Columns clean bullet list) */
    .rules-list {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5px 14px;
      font-size: 8.5px;
      line-height: 1.35;
    }}
    .rule-item {{
      position: relative;
      padding-left: 12px;
      color: #000000;
    }}
    .rule-item::before {{
      content: '•';
      position: absolute;
      left: 0;
      top: -1px;
      font-size: 11px;
      color: #000000;
      font-weight: 900;
    }}
    .rule-item strong {{
      font-weight: 700;
      color: #000000;
    }}

    /* Final Warning Consequences (Clean simple list) */
    .warning-bullets {{
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5px 14px;
      font-size: 8.5px;
      line-height: 1.35;
      color: #000000;
    }}
    .warning-bullets li {{
      position: relative;
      padding-left: 12px;
    }}
    .warning-bullets li::before {{
      content: '•';
      position: absolute;
      left: 0;
      top: -1px;
      font-size: 11px;
      color: #000000;
      font-weight: 900;
    }}
    .warning-bullets li strong {{
      font-weight: 700;
      color: #000000;
    }}

    /* Dual Section Grid: Team Leads & Employees */
    .dual-sec-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      font-size: 8.5px;
      line-height: 1.35;
    }}
    .dual-box-title {{
      font-weight: 800;
      font-size: 9.5px;
      color: #1E3A8A;
      margin-bottom: 2px;
      text-transform: uppercase;
    }}
    .dual-box ul {{
      list-style: none;
      padding-left: 0;
    }}
    .dual-box li {{
      position: relative;
      padding-left: 12px;
      margin-bottom: 2px;
      color: #000000;
    }}
    .dual-box li::before {{
      content: '•';
      position: absolute;
      left: 0;
      top: -1px;
      font-size: 11px;
      color: #000000;
      font-weight: 900;
    }}

    /* Acknowledgment Text */
    .ack-text {{
      font-size: 8.5px;
      line-height: 1.35;
      color: #000000;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
    }}
    .ack-text strong {{
      font-weight: 700;
      color: #000000;
    }}

    /* Sign-off / Official Directorate Seal Block (No individual names) */
    .signoff-container {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 6px;
      margin-top: 2px;
      width: 100%;
    }}
    .seal-wrap {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .official-stamp-img {{
      width: 68px;
      height: 68px;
      object-fit: contain;
      transform: rotate(-6deg);
      opacity: 0.90;
    }}
    .authority-info {{
      font-size: 9px;
      line-height: 1.35;
    }}
    .authority-info .issued-label {{
      font-size: 8px;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
    }}
    .authority-info .designation {{
      font-size: 10px;
      font-weight: 800;
      color: #1E3A8A;
      letter-spacing: 0.2px;
    }}
    .authority-info .company {{
      font-weight: 700;
      color: #000000;
    }}
    .authority-info .loc {{
      color: #475569;
      font-size: 8px;
    }}

    .compliance-stamp-box {{
      text-align: right;
      font-size: 8px;
      line-height: 1.35;
      color: #475569;
    }}
    .compliance-stamp-box strong {{
      color: #000000;
      font-size: 8.5px;
    }}

    /* Footer Container */
    .footer-container {{
      position: relative;
      z-index: 2;
      width: 100%;
    }}
    .bottom-cyan-bar {{
      height: 2px;
      background-color: #00A8B5;
      width: 100%;
      margin-bottom: 6px;
    }}
    .footer-content {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 8px;
      color: #64748b;
    }}
    .footer-content .footer-left {{
      color: #475569;
      font-weight: 600;
    }}
    .footer-content .footer-center {{
      text-align: center;
      flex: 1;
      padding: 0 10px;
      color: #64748b;
    }}
    .footer-content .footer-right {{
      white-space: nowrap;
      font-weight: 600;
      color: #64748b;
    }}
  </style>
</head>
<body>

  <div class="page">
    <!-- Top Cyan Accent Bar -->
    <div class="top-cyan-bar"></div>

    <!-- Subtle Watermark Only (NO "FINAL WARNING" diagonal watermark) -->
    <div class="watermark-center">
      <img src="data:image/png;base64,{logo_b64}" alt="Aparaitech Watermark" />
    </div>

    <!-- Main Content -->
    <div class="content">
      
      <!-- Meta Header: Ref No & Date -->
      <div class="meta-header">
        <div><strong>Ref No:</strong> APC/OFFICE/2026/001</div>
        <div><strong>Date:</strong> 14 October 2026</div>
      </div>

      <!-- Corporate Header with Logo & Centered Titles -->
      <div class="brand-header">
        <img src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" class="brand-logo" />
        <div class="brand-titles">
          <div class="brand-company-name">APARAITECH SOFTWARE COMPANY</div>
          <div class="notice-title">OFFICIAL NOTICE – DISCIPLINE &amp; PROFESSIONAL CONDUCT</div>
        </div>
      </div>

      <!-- Recipient & Routing -->
      <div class="routing-block">
        <div><strong>TO:</strong> All Pune Working Professionals</div>
        <div><strong>FROM:</strong> Managing Director, Aparaitech Software Company</div>
      </div>

      <!-- Subject Line -->
      <div class="subject-line">
        <strong>Subject: Final Warning – Discipline, Professional Conduct, and Poor Work Reports</strong>
      </div>

      <!-- 1. Preamble -->
      <div>
        <div class="sec-head">1. PREAMBLE</div>
        <p class="preamble-text">
          It has been observed with serious concern that several working professionals at our Pune office are not maintaining the expected level of discipline, professional conduct, and work quality. Despite multiple prior reminders, no significant improvement has been observed. <strong>This document serves as an official and binding FINAL WARNING to all personnel.</strong>
        </p>
      </div>

      <!-- 2. Issues Observed (Table) -->
      <div>
        <div class="sec-head">2. ISSUES OBSERVED</div>
        <table class="issues-table">
          <thead>
            <tr>
              <th style="width: 7%; text-align: center;">#</th>
              <th style="width: 28%;">Observed Issue</th>
              <th style="width: 65%;">Description &amp; Non-Compliance Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; font-weight: 700;">1</td>
              <td class="issue-name">Lack of Discipline</td>
              <td>Insubordination, disregard for managerial directives, and non-compliance with established office decorum.</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">2</td>
              <td class="issue-name">Unprofessional Conduct</td>
              <td>Inappropriate demeanor, casual communication, and engaging in non-work activities during operational hours.</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">3</td>
              <td class="issue-name">Poor Work Reports</td>
              <td>Late submission of daily work reports, incomplete metrics, inaccurate calling counts, and irregular updates.</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">4</td>
              <td class="issue-name">Unauthorized Leave</td>
              <td>Absenteeism or leaving office premises without prior written intimation or formal approval from TL/HR.</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">5</td>
              <td class="issue-name">Late Login</td>
              <td>Repeated failure to report on time, missing mandatory morning standups, and irregular attendance records.</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">6</td>
              <td class="issue-name">Disturbance in Office</td>
              <td>Unwarranted noise, gathering in common areas, loud discussions, and disrupting active business calling operations.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Workplace Rules & Regulations -->
      <div>
        <div class="sec-head">3. WORKPLACE RULES &amp; REGULATIONS</div>
        <div class="rules-list">
          <div class="rule-item"><strong>Cabin Entry Policy:</strong> Strictly no entry into executive/management cabins without prior permission.</div>
          <div class="rule-item"><strong>Silence &amp; Work Environment:</strong> Maintain complete silence across office bays, especially during calling shifts.</div>
          <div class="rule-item"><strong>Professional Language &amp; Conduct:</strong> Only courteous, professional business language is permitted at all times.</div>
          <div class="rule-item"><strong>Unauthorized Leave &amp; Absence:</strong> Prior approval from TL/HR is mandatory before taking leave or stepping out.</div>
          <div class="rule-item"><strong>Punctuality &amp; Attendance:</strong> Report promptly for assigned shifts and mark attendance daily via Face ID.</div>
          <div class="rule-item"><strong>Daily Work Report Submission:</strong> Submit accurate reports on time; incomplete reports will not be accepted.</div>
          <div class="rule-item" style="grid-column: span 2;"><strong>Respect &amp; Discipline:</strong> Maintain mutual respect, professional courtesy, and strict discipline toward TLs, seniors, and colleagues.</div>
        </div>
      </div>

      <!-- 4. Final Warning Consequences -->
      <div>
        <div class="sec-head">4. FINAL WARNING &amp; DISCIPLINARY ACTION</div>
        <ul class="warning-bullets">
          <li><strong>Personal Notice:</strong> Formal disciplinary reprimand recorded permanently in the official employee dossier.</li>
          <li><strong>Impact on FTP Profile:</strong> Immediate disqualification or forfeiture from Full-Time Placement (FTP) conversions and appraisals.</li>
          <li><strong>Disciplinary Action:</strong> Strict administrative probation, loss of incentives, and suspension of workplace privileges.</li>
          <li><strong>Termination:</strong> Immediate termination of employment or internship without further notice or compensation.</li>
        </ul>
      </div>

      <!-- 5 & 6. Dual Responsibilities: Team Leads & Employees -->
      <div class="dual-sec-grid">
        <div class="dual-box">
          <div class="dual-box-title">5. Special Responsibility – Team Leads</div>
          <ul>
            <li>Strictly enforce shift punctuality, floor silence, and daily calling discipline.</li>
            <li>Audit and verify all daily work reports before approving end-of-shift checkouts.</li>
            <li>Any failure to report infractions or unapproved leaves will reflect on the TL's evaluation.</li>
          </ul>
        </div>
        <div class="dual-box">
          <div class="dual-box-title">6. Expectations from All Employees</div>
          <ul>
            <li>Maintain 100% adherence to company SOPs, assigned shift timings, and targets.</li>
            <li>Foster a focused, distraction-free environment that upholds company reputation.</li>
            <li>Demonstrate personal accountability, integrity, and proactive work ethic daily.</li>
          </ul>
        </div>
      </div>

      <!-- 7. Acknowledgment -->
      <div class="ack-text">
        <strong>7. Acknowledgment:</strong> This notice is an official corporate directive. All working professionals are required to read, understand, and strictly comply with these terms with immediate effect. Ignorance of rules will not be excused.
      </div>

      <!-- Sign-off Block (Managing Director - NO personal names as instructed) -->
      <div class="signoff-container">
        <div class="seal-wrap">
          <img src="data:image/svg+xml;base64,{stamp_svg_b64}" alt="Aparaitech Official Seal" class="official-stamp-img" />
          <div class="authority-info">
            <div class="issued-label">Issued By Order Of:</div>
            <div class="designation">Office of the Managing Director</div>
            <div class="company">Aparaitech Software Company</div>
            <div class="loc">Pune Operations &bull; Maharashtra, India</div>
          </div>
        </div>
        <div class="compliance-stamp-box">
          <strong>CORPORATE COMPLIANCE DIRECTIVE</strong><br>
          Enforcement: Immediate Effect<br>
          Jurisdiction: Pune Office &amp; Operations
        </div>
      </div>

    </div>

    <!-- Footer Container -->
    <div class="footer-container">
      <div class="bottom-cyan-bar"></div>
      <div class="footer-content">
        <div class="footer-left">Issued By: Managing Director, Aparaitech Software Company</div>
        <div class="footer-center">Pune, Maharashtra | +91 9110406075 | hr@info.aparaitech.org | www.aparaitech.org</div>
        <div class="footer-right">Page 1</div>
      </div>
    </div>

  </div>

</body>
</html>
"""

html_out_path = os.path.join(base_dir, "Official_Notice_Discipline_Pune.html")
with open(html_out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved HTML Notice: {html_out_path}")

# Compile to PDF using Headless Chrome
pdf_out_path = os.path.join(base_dir, "Official_Notice_Discipline_Pune.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_profile = os.path.join(base_dir, "temp_chrome_profile_notice")
os.makedirs(temp_profile, exist_ok=True)

chrome_cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    f"--user-data-dir={temp_profile}",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_out_path}",
    html_out_path
]

print("Rendering PDF with Chrome headless...")
res = subprocess.run(chrome_cmd, capture_output=True, text=True)

if os.path.exists(pdf_out_path):
    print(f"SUCCESS: Generated PDF at {pdf_out_path} (Size: {os.path.getsize(pdf_out_path)} bytes)")
    
    # Render preview image
    doc = pymupdf.open(pdf_out_path)
    print(f"Total Pages in PDF: {len(doc)}")
    page = doc[0]
    pix = page.get_pixmap(dpi=200)
    preview_img_path = os.path.join(assets_dir, "official_notice_discipline_preview.png")
    pix.save(preview_img_path)
    print(f"Saved preview image: {preview_img_path}")
else:
    print(f"ERROR: Failed to generate PDF. Chrome output:\n{res.stderr}\n{res.stdout}")
