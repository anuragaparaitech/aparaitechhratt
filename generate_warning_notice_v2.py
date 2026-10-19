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

# 3. Official Aparaitech Stamp SVG
stamp_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <defs>
    <path id="arcTop" d="M 44,160 A 116,116 0 0,1 276,160" fill="none" />
    <path id="arcBottom" d="M 48,160 A 112,112 0 0,0 272,160" fill="none" />
    <filter id="stampDistress" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <g filter="url(#stampDistress)" stroke="#1a1658" fill="#1a1658" opacity="0.88">
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

# HTML Content: Simple, clean corporate styling matching reference image exactly, NO bright colors, NO "FINAL WARNING" watermark
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Final Warning Notice - Arman Momin - Aparaitech Software</title>
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
      padding: 0 20mm 14mm 20mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }}

    /* Top Cyan Accent Line (Matching reference letterhead) */
    .top-cyan-bar {{
      height: 4px;
      background-color: #00A8B5;
      width: calc(100% + 40mm);
      margin-left: -20mm;
      margin-bottom: 24px;
    }}

    /* Subtle Company Watermark in Background (Matching reference letterhead) */
    .watermark-center {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      opacity: 0.045;
      pointer-events: none;
      z-index: 1;
      text-align: center;
    }}
    .watermark-center img {{
      width: 240px;
      height: auto;
    }}

    /* Main Content Container */
    .content {{
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }}

    /* Top Meta Line: Ref No (Left) and Date (Right) */
    .meta-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 11px;
      color: #000000;
      line-height: 1.2;
    }}
    .meta-header strong {{
      font-weight: 700;
    }}

    /* Document Title Block (Simple, Centered, Dark Blue, matching reference format) */
    .title-block {{
      text-align: center;
      margin-top: 4px;
      margin-bottom: 6px;
    }}
    .title-block h1 {{
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1E3A8A;
      text-transform: uppercase;
      line-height: 1.2;
    }}
    .title-block h2 {{
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1E3A8A;
      text-transform: uppercase;
      margin-top: 3px;
    }}

    /* Recipient Block (Matching reference format) */
    .recipient-block {{
      font-size: 10.5px;
      line-height: 1.45;
      color: #000000;
    }}
    .recipient-block .to-label {{
      margin-bottom: 2px;
      font-weight: 400;
    }}
    .recipient-block .name {{
      color: #1E3A8A;
      font-weight: 700;
      font-size: 11px;
    }}

    /* Subject Line (Matching reference format) */
    .subject-line {{
      font-size: 10.5px;
      line-height: 1.35;
      color: #000000;
      margin-top: 2px;
    }}
    .subject-line strong {{
      font-weight: 700;
    }}

    /* Salutation & Intro */
    .salutation {{
      font-size: 10.5px;
      font-weight: 600;
      color: #000000;
    }}
    .intro-p {{
      font-size: 10px;
      line-height: 1.45;
      color: #000000;
      text-align: justify;
    }}

    /* Section Headings (Matching: 1. PROGRAM DETAILS, 2. ABOUT THE PROGRAM) */
    .section-heading {{
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #1E3A8A;
      text-transform: uppercase;
      margin-top: 3px;
      margin-bottom: 4px;
    }}

    /* Bullet List Items (Matching: • Domain: Data Analytics) */
    .bullet-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 3.5px;
      font-size: 9.8px;
      line-height: 1.4;
      color: #000000;
    }}
    .bullet-list li {{
      position: relative;
      padding-left: 14px;
    }}
    .bullet-list li::before {{
      content: '•';
      position: absolute;
      left: 2px;
      font-weight: 900;
      color: #000000;
      font-size: 12px;
      line-height: 1;
    }}
    .bullet-list li strong {{
      font-weight: 700;
      color: #000000;
    }}

    /* Signatures Block */
    .signatures-block {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 26px;
      margin-top: 6px;
      padding-top: 6px;
      width: 100%;
    }}

    /* Authority Column */
    .authority-col {{
      position: relative;
      font-size: 9.5px;
      line-height: 1.35;
    }}
    .authority-header {{
      font-weight: 700;
      color: #000000;
      margin-bottom: 3px;
    }}
    .sig-seal-wrap {{
      position: relative;
      height: 52px;
      display: flex;
      align-items: center;
    }}
    .sig-img {{
      height: 48px;
      max-width: 140px;
      object-fit: contain;
      position: relative;
      z-index: 2;
    }}
    .stamp-img {{
      position: absolute;
      left: 95px;
      top: -12px;
      width: 78px;
      height: 78px;
      object-fit: contain;
      transform: rotate(-8deg);
      opacity: 0.88;
      z-index: 3;
    }}
    .signer-title {{
      font-weight: 700;
      color: #1E3A8A;
      font-size: 10px;
    }}
    .signer-role {{
      color: #1e293b;
      font-weight: 600;
    }}

    /* Employee Acknowledgement Column */
    .ack-col {{
      font-size: 9px;
      line-height: 1.35;
      color: #334155;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .ack-header {{
      font-weight: 700;
      color: #000000;
      margin-bottom: 3px;
    }}
    .ack-text {{
      font-size: 8.5px;
      line-height: 1.35;
      color: #475569;
      margin-bottom: 8px;
      text-align: justify;
    }}
    .ack-sign-row {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 10px;
      border-top: 1px dashed #94a3b8;
    }}
    .ack-emp-name {{
      font-weight: 700;
      color: #000000;
      font-size: 9px;
    }}
    .ack-date-line {{
      color: #64748b;
      font-size: 9px;
      font-weight: 600;
    }}

    /* Bottom Divider & Footer (Matching reference format) */
    .footer-container {{
      position: relative;
      z-index: 2;
      width: 100%;
      margin-top: 6px;
    }}
    .bottom-cyan-bar {{
      height: 2px;
      background-color: #00A8B5;
      width: 100%;
      margin-bottom: 8px;
    }}
    .footer-content {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 8.5px;
      color: #64748b;
    }}
    .footer-address {{
      text-align: center;
      flex: 1;
      padding-right: 12px;
      color: #64748b;
    }}
    .footer-page {{
      white-space: nowrap;
      font-weight: 500;
      color: #64748b;
    }}
  </style>
</head>
<body>

  <div class="page">
    <!-- Top Cyan Bar -->
    <div class="top-cyan-bar"></div>

    <!-- Subtle Logo Watermark Only (NO "FINAL WARNING" diagonal watermark) -->
    <div class="watermark-center">
      <img src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo Watermark" />
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Ref No & Date -->
      <div class="meta-header">
        <div><strong>Ref No:</strong> APC/HR/FWN/2026/AP7099</div>
        <div><strong>Date:</strong> 14 October 2026</div>
      </div>

      <!-- Document Title -->
      <div class="title-block">
        <h1>APARAITECH SOFTWARE COMPANY</h1>
        <h2>FINAL WARNING NOTICE</h2>
      </div>

      <!-- Recipient Block -->
      <div class="recipient-block">
        <div class="to-label">To,</div>
        <div class="name">Arman Momin</div>
        <div>Employee ID: AP7099</div>
        <div>Department: Business Development (BDA)</div>
        <div>Aparaitech Software Company, Maharashtra, India</div>
        <div><strong>Email:</strong> armanmomin202@gmail.com</div>
      </div>

      <!-- Subject Line -->
      <div class="subject-line">
        <strong>Subject: Final Warning for Lack of Professionalism &amp; Breach of Workplace Discipline</strong>
      </div>

      <!-- Salutation -->
      <div class="salutation">Dear Arman Momin,</div>

      <!-- Preamble / Intro -->
      <p class="intro-p">
        This document serves as an official <strong>Final Warning Notice</strong> issued to you by <strong>APARAITECH SOFTWARE COMPANY</strong>. Despite earlier verbal reprimands and formal counseling sessions, your attendance, adherence to operational directives, and workplace behavior have failed to meet the required professional benchmarks of the company.
      </p>

      <!-- 1. SUMMARY OF DOCUMENTED INFRACTIONS -->
      <div>
        <div class="section-heading">1. SUMMARY OF DOCUMENTED INFRACTIONS</div>
        <ul class="bullet-list">
          <li><strong>Unauthorized Leave:</strong> Taking unsanctioned leaves and absenting yourself from assigned shifts without prior written approval or formal intimation to the Team Lead and HR department.</li>
          <li><strong>Late Login:</strong> Chronic failure to adhere to designated shift login timings (10:00 AM / 11:00 AM), resulting in repeated tardiness and absence from morning sync standups.</li>
          <li><strong>Poor Work Report:</strong> Failure to submit accurate daily working reports, irregular call logs, and disregard for the mandatory 2-stage daily report submission policy.</li>
          <li><strong>Lack of Discipline:</strong> Non-compliance with established company SOPs, inattentiveness during supervisory reviews, and failure to follow operational directives.</li>
          <li><strong>Unprofessional Behavior:</strong> Exhibiting continuous indifference toward assigned targets, non-responsiveness on designated team channels, and irresponsible workplace conduct.</li>
        </ul>
      </div>

      <!-- 2. FINAL WARNING & DISCIPLINARY CONSEQUENCES -->
      <div>
        <div class="section-heading">2. FINAL WARNING &amp; DISCIPLINARY CONSEQUENCES</div>
        <ul class="bullet-list">
          <li><strong>Personal Formal Notice:</strong> This warning constitutes a formal reprimand recorded permanently in your official employee dossier.</li>
          <li><strong>Impact on FTP (Full-Time Placement):</strong> Your consideration for Full-Time Placement (FTP), retention bonus, and internship completion clearance is placed on immediate hold.</li>
          <li><strong>Disciplinary Supervision:</strong> You are placed under direct HR observation with zero tolerance for any procedural or punctuality lapse.</li>
          <li><strong>Immediate Termination:</strong> Any subsequent occurrence of unauthorized absence, late login, incomplete reporting, or unprofessionalism will lead to immediate termination of employment without further notice or compensation.</li>
        </ul>
      </div>

      <!-- 3. MANDATORY EXPECTATIONS FOR IMMEDIATE COMPLIANCE -->
      <div>
        <div class="section-heading">3. MANDATORY EXPECTATIONS FOR IMMEDIATE COMPLIANCE</div>
        <ul class="bullet-list">
          <li><strong>Report on Time:</strong> You must log in punctually at or before designated shift hours and complete daily verification without delay.</li>
          <li><strong>Do Not Leave Without Informing:</strong> Never leave your assigned workstation or take leave without formal, prior written approval from your Team Lead &amp; HR.</li>
          <li><strong>Submit Daily Reports:</strong> File complete, verified calling records and conversion data on the portal before checkout every day.</li>
          <li><strong>Follow Rules:</strong> Strictly adhere to all Aparaitech employee guidelines, shift protocols, and standard operating procedures.</li>
          <li><strong>Maintain Professionalism:</strong> Demonstrate accountability, proactive communication, and professional workplace decorum at all times.</li>
        </ul>
      </div>

      <!-- Signatures Block -->
      <div class="signatures-block">
        <!-- Authorized Signatory -->
        <div class="authority-col">
          <div class="authority-header">For Aparaitech Software Company,</div>
          <div class="sig-seal-wrap">
            <img src="data:image/png;base64,{sig_b64}" alt="Anurag Nand Signature" class="sig-img" />
            <img src="data:image/svg+xml;base64,{stamp_svg_b64}" alt="Aparaitech Official Stamp" class="stamp-img" />
          </div>
          <div class="signer-title">Anurag Nand</div>
          <div class="signer-role">Team Lead (TL) &amp; HR Department</div>
          <div class="signer-role" style="font-size: 8.5px; color: #64748b;">Aparaitech Software Company</div>
        </div>

        <!-- Employee Acknowledgement -->
        <div class="ack-col">
          <div>
            <div class="ack-header">Employee Acknowledgement:</div>
            <div class="ack-text">
              "I, <strong>Arman Momin</strong>, hereby acknowledge receipt of this Final Warning Notice. I have read, understood, and accept the terms and expectations stated above, and commit to immediate compliance."
            </div>
          </div>
          <div class="ack-sign-row">
            <div>
              <div style="font-size: 7.5px; color: #64748b; text-transform: uppercase;">Employee Signature</div>
              <div class="ack-emp-name">Arman Momin (AP7099)</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 7.5px; color: #64748b; text-transform: uppercase;">Date</div>
              <div class="ack-date-line">____ / ____ / 2026</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Bottom Footer (Matching reference letterhead) -->
    <div class="footer-container">
      <div class="bottom-cyan-bar"></div>
      <div class="footer-content">
        <div class="footer-address">
          122, Gera Imperial Rise, Hinjawadi Phase 2, Wipro Circle, Pune - 411057 | info@ai.aparaitech.org | www.aparaitech.org
        </div>
        <div class="footer-page">
          Page 1
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""

html_out_path = os.path.join(base_dir, "Final_Warning_Notice_Arman_Momin_Format.html")
with open(html_out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved HTML Notice: {html_out_path}")

# Compile to PDF using Headless Chrome
pdf_out_path = os.path.join(base_dir, "Final_Warning_Notice_Arman_Momin.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_profile = os.path.join(base_dir, "temp_chrome_profile_warning")
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
    preview_img_path = os.path.join(assets_dir, "warning_notice_format_preview.png")
    pix.save(preview_img_path)
    print(f"Saved preview image: {preview_img_path}")
else:
    print(f"ERROR: Failed to generate PDF. Chrome output:\n{res.stderr}\n{res.stdout}")
