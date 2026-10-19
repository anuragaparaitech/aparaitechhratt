import os
import base64
import subprocess
import pymupdf

def build_pdea_coem_dossier():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    
    # Load logo
    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")

    # Load 6 reference doc images
    ref_b64 = {}
    for i in range(1, 7):
        p = os.path.join(base_dir, "assets", "ref_docs", f"ref_doc_{i}.png")
        if os.path.exists(p):
            with open(p, "rb") as f:
                ref_b64[i] = base64.b64encode(f.read()).decode("utf-8")
        else:
            ref_b64[i] = ""

    address_line_1 = "Corporate HQ: Gera's Imperium Rise, Hinjewadi Phase 2, Pune, Maharashtra 411057"
    address_line_2 = "Bengaluru: 360, Neeladri Rd, Electronic City Phase I | Regional Center: Anand Nagar Colony, Baramati, Maharashtra 413102"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Institutional Collaboration Dossier - PDEA's College of Engineering, Manjari, Pune</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary-blue: #0284C7;
      --deep-blue: #0369A1;
      --navy-dark: #0B2545;
      --accent-teal: #0D9488;
      --soft-blue-bg: #E0F2FE;
      --badge-circle: #BAE6FD;
      --border-blue: #0284C7;
      --text-dark: #0F172A;
      --text-body: #1E293B;
      --text-muted: #475569;
      --text-light: #64748B;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #E2E8F0;
      color: var(--text-dark);
      line-height: 1.45;
    }}

    /* Web Preview Toolbar */
    .no-print-toolbar {{
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0B2545;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    }}
    .toolbar-title {{
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: 0.02em;
    }}
    .btn {{
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12.5px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: background 0.2s;
    }}
    .btn-primary {{
      background: #0284C7;
      color: #ffffff;
    }}
    .btn-primary:hover {{
      background: #0369A1;
    }}
    .btn-outline {{
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }}

    /* Page Setup */
    .doc-container {{
      width: 210mm;
      margin: 20px auto;
    }}

    .page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      min-height: 297mm;
      background: #FFFFFF;
      margin-bottom: 25px;
      position: relative;
      box-sizing: border-box;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      padding: 12mm 14mm;
    }}

    @page {{
      size: A4 portrait;
      margin: 0;
    }}

    @media print {{
      body {{
        background: transparent !important;
      }}
      .no-print-toolbar {{
        display: none !important;
      }}
      .doc-container {{
        width: 210mm !important;
        margin: 0 !important;
      }}
      .page {{
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        overflow: hidden !important;
        padding: 10mm 12mm !important;
      }}
    }}

    /* Canva UI Frame matching Aparaitech corporate template */
    .frame-box {{
      width: 100%;
      height: 100%;
      border: 2px solid var(--border-blue);
      border-radius: 26px;
      padding: 24px 28px 16px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #FFFFFF;
    }}

    /* Top Wave Lines Artwork */
    .top-wave-svg {{
      position: absolute;
      top: 0;
      right: 0;
      width: 220px;
      height: 150px;
      pointer-events: none;
      z-index: 1;
    }}

    /* Watermark Cube Logo in Center */
    .watermark-logo {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 280px;
      height: 280px;
      opacity: 0.055;
      pointer-events: none;
      z-index: 1;
    }}

    /* Content Area */
    .content-area {{
      position: relative;
      z-index: 5;
      flex: 1;
      display: flex;
      flex-direction: column;
    }}

    /* Typography */
    .title-primary {{
      font-size: 30px;
      font-weight: 800;
      color: var(--primary-blue);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.15;
      margin-bottom: 4px;
    }}
    .subtitle-primary {{
      font-size: 18.5px;
      font-weight: 800;
      color: var(--deep-blue);
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 14px;
    }}
    .section-desc {{
      font-size: 11.2px;
      color: var(--text-body);
      line-height: 1.5;
      margin-bottom: 13px;
    }}

    /* Numbered List Layout */
    .num-list {{
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}
    .num-item {{
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }}
    .num-circle {{
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--badge-circle);
      color: #0B2545;
      font-size: 18px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15);
    }}
    .num-content {{
      flex: 1;
    }}
    .num-heading {{
      font-size: 14.2px;
      font-weight: 800;
      color: var(--primary-blue);
      margin-bottom: 4px;
    }}
    .num-bullets {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 3.5px;
    }}
    .num-bullets li {{
      font-size: 10.8px;
      color: var(--text-body);
      line-height: 1.45;
      position: relative;
      padding-left: 14px;
    }}
    .num-bullets li::before {{
      content: "•";
      position: absolute;
      left: 0;
      top: 0;
      color: var(--primary-blue);
      font-weight: bold;
    }}

    /* Grid Layouts for Products & Services */
    .grid-2col {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      margin-top: 6px;
    }}
    .card-box {{
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid var(--primary-blue);
      border-radius: 8px;
      padding: 11px 13px;
    }}
    .card-title {{
      font-size: 12.3px;
      font-weight: 800;
      color: var(--navy-dark);
      margin-bottom: 4px;
    }}
    .card-desc {{
      font-size: 10.2px;
      color: var(--text-muted);
      line-height: 1.42;
    }}
    .card-link {{
      display: inline-block;
      font-size: 9.8px;
      font-weight: 700;
      color: var(--primary-blue);
      text-decoration: none;
      margin-top: 5px;
    }}

    /* Table format */
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 10.8px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }}
    .data-table th {{
      background: #0284C7;
      color: #FFFFFF;
      text-align: left;
      padding: 8px 12px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .data-table td {{
      padding: 8px 12px;
      border-top: 1px solid #E2E8F0;
      color: var(--text-body);
    }}
    .data-table tr:nth-child(even) td {{
      background: #F8FAFC;
    }}

    /* Embedded Ref Document Viewer Frame */
    .ref-doc-frame {{
      width: 100%;
      height: 485px;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      overflow: hidden;
      background: #F8FAFC;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }}
    .ref-doc-img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }}

    /* Bottom Footer Bar */
    .page-bottom {{
      position: relative;
      z-index: 5;
      margin-top: auto;
    }}
    .bottom-gradient-bar {{
      height: 28px;
      border-radius: 14px;
      background: linear-gradient(90deg, #BAE6FD 0%, #0284C7 65%, #0369A1 100%);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 18px;
      margin-bottom: 8px;
    }}
    .page-number-text {{
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .address-footer {{
      text-align: center;
      font-size: 8.2px;
      color: var(--text-light);
      line-height: 1.35;
      font-weight: 500;
    }}

    /* Cover Page Specific */
    .cover-box {{
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 10px 18px;
    }}
    .cover-logo-img {{
      width: 115px;
      height: 115px;
      object-fit: contain;
      margin-bottom: 14px;
    }}
    .cover-main-title {{
      font-size: 44px;
      font-weight: 900;
      color: #0F172A;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.04em;
      line-height: 1.05;
      margin-bottom: 4px;
    }}
    .cover-prop-title {{
      font-size: 30px;
      font-weight: 800;
      color: #0284C7;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
    }}
    .cover-college-banner {{
      background: linear-gradient(135deg, #0B2545 0%, #0369A1 100%);
      color: #FFFFFF;
      border-radius: 12px;
      padding: 12px 24px;
      margin-bottom: 14px;
      width: 100%;
      box-shadow: 0 4px 14px rgba(3, 105, 161, 0.25);
    }}
    .cover-college-pres {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #BAE6FD;
      font-weight: 700;
      margin-bottom: 3px;
    }}
    .cover-college-name {{
      font-size: 17px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.02em;
      line-height: 1.25;
      color: #FFFFFF;
    }}
    .cover-college-sub {{
      font-size: 11.5px;
      color: #E0F2FE;
      margin-top: 2px;
      font-weight: 600;
    }}

    .cover-audience-tag {{
      display: inline-block;
      background: #E0F2FE;
      color: #0369A1;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 14px;
      border: 1px solid #BAE6FD;
    }}
    .cover-motto {{
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      line-height: 1.45;
      max-width: 540px;
      margin-bottom: 22px;
    }}
    .cover-blue-block {{
      width: 100%;
      background: linear-gradient(90deg, #BAE6FD 0%, #0284C7 50%, #0369A1 100%);
      color: #FFFFFF;
      border-radius: 14px;
      padding: 16px 24px;
      margin-bottom: 16px;
      text-align: right;
    }}
    .cover-block-brand {{
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .cover-block-sub {{
      font-size: 12px;
      font-weight: 600;
      opacity: 0.95;
      margin-top: 3px;
    }}

    /* Formal Address Letter Box */
    .formal-letter-box {{
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #0284C7;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 14px;
    }}
    .formal-letter-header {{
      font-size: 13.2px;
      font-weight: 800;
      color: #0B2545;
      margin-bottom: 5px;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .formal-letter-body {{
      font-size: 10.8px;
      color: #334155;
      line-height: 1.55;
    }}

    .institution-pill {{
      background: #F0F9FF;
      border: 1px solid #BAE6FD;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .inst-pill-title {{
      font-size: 12px;
      font-weight: 800;
      color: #0369A1;
    }}
    .inst-pill-meta {{
      font-size: 10.5px;
      color: #475569;
      font-weight: 600;
    }}
  </style>
</head>
<body>

  <!-- Screen Toolbar -->
  <div class="no-print-toolbar">
    <div class="toolbar-title">
      Aparaitech Software | Institutional Dossier for PDEA's College of Engineering, Manjari, Pune
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-outline" onclick="window.scrollTo({{ top: document.body.scrollHeight, behavior: 'smooth' }})">
        Scroll to Directory
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="doc-container">

    <!-- ==========================================
         PAGE 1: COVER PAGE (CUSTOMIZED FOR PDEA'S COEM, MANJARI, PUNE)
         ========================================== -->
    <div class="page" id="page-1">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
          <path d="M0,70 Q140,170 250,55" stroke="#0284C7" stroke-width="1.2" opacity="0.35" />
          <path d="M0,90 Q150,190 250,75" stroke="#0284C7" stroke-width="1.2" opacity="0.3" />
        </svg>

        <div class="content-area cover-box">
          <img class="cover-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
          <h1 class="cover-main-title">APARAITECH</h1>
          <div class="cover-prop-title">INSTITUTIONAL COLLABORATION DOSSIER</div>
          
          <div class="cover-college-banner">
            <div class="cover-college-pres">Specially Presented To:</div>
            <div class="cover-college-name">Pune District Education Association's College of Engineering</div>
            <div class="cover-college-sub">Hadapsar-Manjari Road, Manjari (BK), Pune - 412307, Maharashtra</div>
          </div>

          <div class="cover-audience-tag">
            For the Respected Principal Dr. R. V. Patil, TPO Prof. D. L. Mule & Heads of Departments
          </div>

          <div class="cover-motto">
            Bridging the Pune IT Hub with Applied Engineering: Production Sprints, Enterprise Mentorship, and Industry Placements
          </div>

          <div class="cover-blue-block">
            <div class="cover-block-brand">APARAITECH SOFTWARE</div>
            <div class="cover-block-sub">Hinjewadi Tech HQ • Enterprise Cloud Applications • Verified Academic Alliances</div>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">1</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 2: EXECUTIVE ADDRESS TO PDEA COEM LEADERSHIP & TPO
         ========================================== -->
    <div class="page" id="page-2">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
          <path d="M0,70 Q140,170 250,55" stroke="#0284C7" stroke-width="1.2" opacity="0.35" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Institutional Address</div>
          <div class="subtitle-primary">To the Respected Principal Dr. R. V. Patil & TPO Prof. D. L. Mule</div>

          <div class="institution-pill">
            <div>
              <div class="inst-pill-title">PDEA's College of Engineering, Manjari (BK), Pune</div>
              <div class="inst-pill-meta">Affiliated to Savitribai Phule Pune University (SPPU) | Approved by AICTE | DTE Code: 6206 | NAAC Accredited</div>
            </div>
            <span style="background: #0284C7; color: #FFF; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px;">PUNE ALLIANCE 2026</span>
          </div>

          <div class="formal-letter-box">
            <div class="formal-letter-header">Advancing Student Employability Through Direct Enterprise Partnership in Pune</div>
            <p class="formal-letter-body">
              Pune District Education Association holds a distinguished heritage in nurturing talented engineers across Maharashtra. In today's competitive tech ecosystem, academic rigor delivers its greatest impact when reinforced by real commercial development experience. As a Pune-headquartered enterprise located in Hinjewadi Phase 2, Aparaitech Software respectfully submits this collaboration proposal to PDEA's College of Engineering, Manjari. We seek an active bilateral partnership with your Training & Placement Cell, the "Campus Connectors" student council, and departmental heads across Computer Engineering, IT, E&TC, Mechanical, and Instrumentation to transform students from theoretical learners into confident, production-ready engineers.
            </p>
          </div>

          <div class="grid-2col" style="margin-bottom: 14px;">
            <div class="card-box">
              <div class="card-title">Hinjewadi-to-Manjari Tech Synergy</div>
              <div class="card-desc">Seamless physical and digital collaboration between Pune's premier IT corridor (Hinjewadi) and PDEA's Manjari campus, facilitating live workshops, physical code reviews, and industry visits.</div>
            </div>
            <div class="card-box">
              <div class="card-title">Live Commercial Software Sprints</div>
              <div class="card-desc">Direct hands-on involvement with active commercial applications: multi-tenant SaaS platforms, alumni portals, real-time cloud kitchen displays, and cognitive test platforms.</div>
            </div>
            <div class="card-box">
              <div class="card-title">SPPU & NAAC Accreditation Support</div>
              <div class="card-desc">Documented industrial apprenticeships strengthening institutional compliance under NAAC Criterion 3 (Industry Linkages & MoUs) and SPPU outcome-based learning mandates.</div>
            </div>
            <div class="card-box">
              <div class="card-title">Global Exposure (Embarc.Inc Japan)</div>
              <div class="card-desc">Bilateral alliance with Embarc.Inc (Tokyo, Japan), introducing PDEA students to international software engineering workflows, bilingual specifications, and cross-border standards.</div>
            </div>
          </div>

          <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 11px 16px;">
            <div style="font-weight: 800; color: #166534; font-size: 12px; margin-bottom: 2px;">Our Humanized Commitment: Learn, Build, Deploy, and Succeed</div>
            <p style="font-size: 10.3px; color: #14532D; line-height: 1.45;">
              We eliminate the disconnect between tutorial theory and real software engineering. Every PDEA engineering student is assigned verifiable problem statements, works within structured Git workflows, receives code reviews from working software leads, and graduates with live deployed applications.
            </p>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">2</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 3: SERVICES AND PRODUCT MATRIX
         ========================================== -->
    <div class="page" id="page-3">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Our Services and Products</div>
          <div class="subtitle-primary">Comprehensive Technological & Training Architecture</div>

          <div class="num-list">
            <div class="num-item">
              <div class="num-circle">1</div>
              <div class="num-content">
                <div class="num-heading">Live Industry Projects & Apprenticeship</div>
                <ul class="num-bullets">
                  <li>Real-time project execution aligned with current enterprise technology stacks</li>
                  <li>Specialized engineering tracks: AI/ML, Full-Stack Web Development, Data Analytics, Java Enterprise, Cloud & DevOps</li>
                  <li>Structured milestone sprints with 10 industry-grade problem statements</li>
                  <li><strong>Overall Performance-Based Stipend:</strong> Eligible students receive an <strong>Overall Performance-Based Stipend of ₹8,000 to ₹15,000</strong> upon milestone completion (<strong>Strictly an Overall Program Stipend, Not Monthly</strong>)</li>
                </ul>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">2</div>
              <div class="num-content">
                <div class="num-heading">Enterprise Software Products & Multi-Industry Solutions</div>
                <ul class="num-bullets">
                  <li>Institutional Web Platforms: SVPM Alumni Portal, Online Testing Engine, Attendance Management System</li>
                  <li>Commercial Enterprise Applications: Cloud Kitchen Operations, APNA Store E-Commerce, Service Hub</li>
                  <li>AI Question Paper Generator with cognitive Bloom's Taxonomy balancing</li>
                  <li>Automated Decision-Support Dashboards engineered for educational institutions and businesses</li>
                </ul>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">3</div>
              <div class="num-content">
                <div class="num-heading">Academic–Industry Collaboration & Placement Support</div>
                <ul class="num-bullets">
                  <li>Formal bilateral MoUs structured in full accordance with AICTE internship guidelines</li>
                  <li>Pre-Placement Orientation Sessions, Technical Mock Interviews, and Resume/Portfolio Reviews</li>
                  <li>Direct HR interview rounds and priority consideration for full-time engineering placements</li>
                  <li>Official verified documentation: Industrial Experience Letter, Letter of Recommendation (LOR), and Completion Certificate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">3</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 4: PRODUCTS - AI-BASED APPLICATIONS
         ========================================== -->
    <div class="page" id="page-4">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Products</div>
          <div class="subtitle-primary">AI-Based Enterprise & Campus Applications</div>

          <div class="num-list">
            <div class="num-item">
              <div class="num-circle">1</div>
              <div class="num-content">
                <div class="num-heading">AI Question Paper Generator</div>
                <ul class="num-bullets">
                  <li>Automated question paper synthesis for university examinations, unit tests, and semester finals</li>
                  <li>Rigorous Bloom's Taxonomy cognitive balancing (Remembering, Understanding, Application, Analysis, Evaluation)</li>
                  <li>Difficulty distribution controller and randomized question permutations preventing examination paper leaks</li>
                  <li>Instant export to printable formatted PDF, Microsoft Word, and institutional LMS question banks</li>
                </ul>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">2</div>
              <div class="num-content">
                <div class="num-heading">Face Detection & Smart Attendance System</div>
                <ul class="num-bullets">
                  <li>AI-powered facial biometric recognition for seamless, contact-free classroom and lab attendance</li>
                  <li>Real-time identity verification with anti-spoofing and infrared liveness detection</li>
                  <li>Automated daily and monthly attendance analytics, deficiency flagging, and instant parent notifications</li>
                  <li>Zero friction integration with existing college ERPs, faculty mobile applications, and administrative databases</li>
                </ul>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">3</div>
              <div class="num-content">
                <div class="num-heading">AI Automation & Decision-Support Tools</div>
                <ul class="num-bullets">
                  <li>Automated institutional workflows utilizing fine-tuned NLP and computer vision models</li>
                  <li>Intelligent decision-support dashboards for departmental resource planning and faculty schedules</li>
                  <li>Drastic reduction in manual paperwork, administrative backlog, and repetitive verification overhead</li>
                  <li>Predictive analytics tracking student academic progress, attendance patterns, and placement readiness</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">4</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 5: LIVE PRODUCTION PLATFORMS
         ========================================== -->
    <div class="page" id="page-5">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Live Software Deployments</div>
          <div class="subtitle-primary">Production Platforms Across Multiple Industries</div>

          <p class="section-desc">
            Aparaitech Software actively engineers, deploys, and maintains real-world digital solutions across education, food-tech, e-commerce, and service sectors. These live production deployments showcase our proven full-stack software expertise:
          </p>

          <div class="grid-2col" style="gap: 12px; margin-bottom: 12px;">
            <div class="card-box" style="border-left-color: #0284C7;">
              <div class="card-title">SVPM Alumni Portal</div>
              <div class="card-desc">Institutional alumni engagement network featuring global alumni directories, mentorship connections, event management, and institutional archival records.</div>
              <a class="card-link" href="http://svpmalumni.aparaitech.org/" target="_blank">Portal: svpmalumni.aparaitech.org</a>
            </div>

            <div class="card-box" style="border-left-color: #0D9488;">
              <div class="card-title">Online Test Platform</div>
              <div class="card-desc">High-concurrency online examination engine with automated grading, real-time student analytics, question paper pools, and secure timed proctoring.</div>
              <a class="card-link" href="https://tests.apraitech.org/" target="_blank">Platform: tests.apraitech.org</a>
            </div>

            <div class="card-box" style="border-left-color: #0284C7;">
              <div class="card-title">Attendance Management System</div>
              <div class="card-desc">Enterprise-grade digital attendance and workforce monitoring platform with automated shift tracking, student logs, and institutional ERP synchronization.</div>
              <a class="card-link" href="https://attendance.aparaitech.org/" target="_blank">System: attendance.aparaitech.org</a>
            </div>

            <div class="card-box" style="border-left-color: #D97706;">
              <div class="card-title">Cloud Kitchen Operations</div>
              <div class="card-desc">Multi-brand culinary automation platform managing real-time food order routing, live kitchen display systems, inventory control, and point-of-sale integration.</div>
              <a class="card-link" href="https://cloudkitchen.aparaitech.org/" target="_blank">Portal: cloudkitchen.aparaitech.org</a>
            </div>

            <div class="card-box" style="border-left-color: #0284C7;">
              <div class="card-title">APNA Store E-Commerce</div>
              <div class="card-desc">Complete digital retail commerce platform featuring dynamic product catalogues, secure automated payment gateway integrations, cart mechanics, and dispatch tracking.</div>
              <a class="card-link" href="https://apnastore.aparaitech.org/" target="_blank">Store: apnastore.aparaitech.org</a>
            </div>

            <div class="card-box" style="border-left-color: #0D9488;">
              <div class="card-title">On-Demand Service Hub</div>
              <div class="card-desc">Multi-vendor marketplace connecting consumers with specialized service technicians, featuring dynamic booking scheduling, invoicing, and customer feedback.</div>
              <a class="card-link" href="http://servicehub.aparaitech.org/" target="_blank">Hub: servicehub.aparaitech.org</a>
            </div>
          </div>

          <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 8px; padding: 10px 14px; margin-top: auto;">
            <div style="font-weight: 800; color: #166534; font-size: 11.5px; margin-bottom: 2px;">Direct Industry Mentorship for PDEA COEM Students</div>
            <p style="font-size: 10px; color: #14532D; line-height: 1.4;">
              Candidates in our Live Project Program are trained on the exact software architectures, CI/CD pipelines, and cloud environments that power these active commercial applications.
            </p>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">5</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 6: LIVE PROJECT PROGRAM ARCHITECTURE
         ========================================== -->
    <div class="page" id="page-6">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Live Project Program</div>
          <div class="subtitle-primary">3-Month Execution Model & Sprint Breakdown</div>

          <p class="section-desc">
            Structured into disciplined milestone sprints simulating corporate agile development. Students tackle real problem statements, submit periodic code reviews, and deploy production software systems under active senior mentor supervision.
          </p>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 22%;">Timeline</th>
                <th style="width: 38%;">Assigned Problem Statements</th>
                <th>Mandatory Deliverables</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Month 1</strong><br><span style="color:#0284C7; font-size:10px;">Foundation Sprint</span></td>
                <td><strong>Assigned: 3 Problem Statements</strong><br>Candidate selects based on domain specialization</td>
                <td>Minimum <strong>1 Project (End-to-End)</strong> completed with Git repository, architecture schema & code review</td>
              </tr>
              <tr>
                <td><strong>Month 2</strong><br><span style="color:#0284C7; font-size:10px;">Advanced Sprint</span></td>
                <td><strong>Assigned: 3 Problem Statements</strong><br>Complex backend, database optimization & REST/GraphQL API integration</td>
                <td>Minimum <strong>1 Project (End-to-End)</strong> completed with automated testing, user authentication & CI/CD</td>
              </tr>
              <tr>
                <td><strong>Month 3</strong><br><span style="color:#0284C7; font-size:10px;">Production Sprint</span></td>
                <td><strong>Assigned: 4 Problem Statements</strong><br>Full cloud deployment, AI model integration & live hosting</td>
                <td>Minimum <strong>2 Projects (End-to-End)</strong> completed with live URLs, performance benchmarking & documentation</td>
              </tr>
            </tbody>
          </table>

          <div class="grid-2col" style="margin-top: 18px;">
            <div class="card-box" style="border-left-color: #0284C7; background: #F0F9FF;">
              <div class="card-title" style="color: #0369A1;"><strong>Overall Performance-Based Stipend</strong></div>
              <div class="card-desc" style="color: #0F172A; line-height: 1.5;">
                Students earn an <strong>Overall Performance-Based Stipend of ₹8,000 to ₹15,000</strong> across the entire 3-month program (<strong>Strictly an Overall Program Stipend, Not Monthly</strong>), evaluated strictly against milestone completion, sprint timeliness, and production code quality.
              </div>
            </div>
            <div class="card-box" style="border-left-color: #0D9488; background: #F0FDFA;">
              <div class="card-title" style="color: #0F766E;">Institutional Credentials Provided</div>
              <div class="card-desc" style="color: #0F172A;">
                Every successful participant receives an official <strong>Experience Certificate</strong>, a personalized <strong>Letter of Recommendation (LOR)</strong>, and a verified <strong>Completion Certificate</strong>.
              </div>
            </div>
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">6</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 7: GLOBAL PARTNERSHIP - EMBARC.INC (JAPAN - INDIA)
         ========================================== -->
    <div class="page" id="page-7">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Global Collaboration</div>
          <div class="subtitle-primary">Embarc.Inc Alliance (Japan - India Market Entry)</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Aparaitech Software maintains an active international bilateral collaboration with <strong>Embarc.Inc</strong> for <strong>Japan-India market entry, digital transformation, and cross-border engineering</strong>. Signed by Mr. Pratik Pawar (ATL, Aparaitech Software) and Mr. Ruka Nishida (Embarc.Inc).
          </p>

          <!-- Embedded Reference Document Image Page 1 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[1]}" alt="Embarc.Inc Signed Agreement" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 1: International Agreement with Embarc.Inc (Executed 25-27 Feb 2026)
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">7</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 8: ACADEMIC PARTNER - DHB SONI COLLEGE, SOLAPUR
         ========================================== -->
    <div class="page" id="page-8">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Academic Collaboration</div>
          <div class="subtitle-primary">Deshbhakt Harinarayan Bankatlal SONI COLLEGE, Solapur</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Formal partnership and proposal acceptance with <strong>DHB Soni College, Solapur</strong>. Signed by Principal <strong>Prof. Madhuri Swami</strong> and <strong>Mr. Pratik Pawar</strong>, witnessed by faculty heads and business development representatives, accompanied by on-site campus drive executions.
          </p>

          <!-- Embedded Reference Document Image Page 2 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[2]}" alt="DHB Soni College MoU & Campus Drive" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 2: Signed Agreement & Campus Drive Felicitation at DHB Soni College, Solapur
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">8</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 9: ACADEMIC PARTNER - DATTAKALA GROUP OF INSTITUTIONS
         ========================================== -->
    <div class="page" id="page-9">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Academic Collaboration</div>
          <div class="subtitle-primary">Dattakala Group of Institutions, Bhigwan (Pune)</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Official bilateral Memorandum of Understanding with <strong>Dattakala Group of Institutions, Bhigwan (Tal. Daund, Dist. Pune)</strong>. Executed with <strong>Prof. Salunke S.D.</strong> (Director) and <strong>Mr. Pratik Pawar</strong> (ATL, Aparaitech Software), witnessed by HOD Dr. S.S. Bere and engineering team leads.
          </p>

          <!-- Embedded Reference Document Image Page 3 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[3]}" alt="Dattakala Group of Institutions MoU" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 3: Signed MoU Agreement with Dattakala Group of Institutions
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">9</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 10: ACADEMIC PARTNER - SPCOET SOMESHWARNAGAR
         ========================================== -->
    <div class="page" id="page-10">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Academic Collaboration</div>
          <div class="subtitle-primary">Sharadchandra Pawar College of Engineering & Technology (SPCOET)</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Bilateral agreement with <strong>Shri Someshwar Shikshan Prasarak Mandal's Sharadchandra Pawar College of Engineering and Technology (SPCOET), Someshwarnagar</strong>. Authorized by Respected Principal and <strong>Mr. Pratik Pawar</strong> (Proprietor, ATL, Aparaitech Software).
          </p>

          <!-- Embedded Reference Document Image Page 4 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[4]}" alt="SPCOET Someshwarnagar MoU" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 4: Signed MoU Agreement with SPCOET Someshwarnagar (Dist. Pune)
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">10</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 11: ACADEMIC PARTNER - SVPM COE MALEGAON (BARAMATI)
         ========================================== -->
    <div class="page" id="page-11">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Academic Collaboration</div>
          <div class="subtitle-primary">Shivnagar Vidya Prasarak Mandal (SVPM COE), Baramati</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Institutional partnership with <strong>Shivnagar Vidya Prasarak Mandal, College of Engineering, Baramati Nira Rd, Malegaon Budruk</strong>. Signed with <strong>Dr. Purushottam Jadhav</strong> (Head, Training & Placement Officer) and <strong>Mr. Pratik Pawar</strong> (Aparaitech Software Company).
          </p>

          <!-- Embedded Reference Document Image Page 5 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[5]}" alt="SVPM COE Baramati MoU" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 5: Signed Agreement with SVPM College of Engineering, Malegaon Budruk
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">11</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 12: INVITATION LETTER & SUMMARY
         ========================================== -->
    <div class="page" id="page-12">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>

        <div class="content-area">
          <div class="title-primary">Institutional Validation</div>
          <div class="subtitle-primary">Official Campus Drive Invitation Letter (DHB Soni College)</div>

          <p class="section-desc" style="margin-bottom: 8px;">
            Formal Invitation Letter (Ref: <strong>DHB/2025-26/389</strong>, Date: 7/2/2026) issued by <strong>Deshbhakt Harinarayan Bankatlal Soni College, Solapur</strong>, inviting Aparaitech for an on-campus recruitment and live project internship selection drive.
          </p>

          <!-- Embedded Reference Document Image Page 6 -->
          <div class="ref-doc-frame">
            <img class="ref-doc-img" src="data:image/png;base64,{ref_b64[6]}" alt="Campus Drive Invitation Letter" />
          </div>

          <div style="font-size: 10px; color: var(--text-light); text-align: center; margin-top: 6px; font-weight: 600;">
            Official Reference Document 6: Formal Recruitment Drive Invitation Issued to Aparaitech Software
          </div>
        </div>

        <div class="page-bottom">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">12</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PAGE 13: PROPOSED ROADMAP FOR PDEA'S COEM & CONTACT DIRECTORY
         ========================================== -->
    <div class="page" id="page-13">
      <div class="frame-box">
        <svg class="top-wave-svg" viewBox="0 0 250 160" fill="none">
          <path d="M0,30 Q120,130 250,15" stroke="#0284C7" stroke-width="1.2" opacity="0.45" />
          <path d="M0,50 Q130,150 250,35" stroke="#0284C7" stroke-width="1.2" opacity="0.4" />
        </svg>
        <img class="watermark-logo" src="data:image/png;base64,{logo_b64}" alt="" />

        <div class="content-area">
          <div class="title-primary">Institutional Partnership Roadmap</div>
          <div class="subtitle-primary">Tailored for PDEA's College of Engineering, Manjari, Pune</div>

          <p class="section-desc">
            Aparaitech Software proposes an organic, AICTE-aligned collaboration pathway designed to integrate seamlessly with PDEA COEM's academic calendar without administrative overhead:
          </p>

          <div class="num-list" style="margin-bottom: 14px;">
            <div class="num-item">
              <div class="num-circle">1</div>
              <div class="num-content">
                <div class="num-heading">Step 1: Institutional MoU & Departmental Alignment</div>
                <div style="font-size: 10.8px; color: var(--text-body);">
                  Execution of an academic Memorandum of Understanding, formalizing project tracks for Computer Engineering, IT, E&TC, Mechanical, and Instrumentation departments, aligning with SPPU credit internship requirements and NAAC Criterion 3 compliance.
                </div>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">2</div>
              <div class="num-content">
                <div class="num-heading">Step 2: Campus Orientation & Live Problem Statement Allocation</div>
                <div style="font-size: 10.8px; color: var(--text-body);">
                  Joint technical briefing on campus with the Training & Placement Cell and "Campus Connectors" student coordinators. Candidates select their domain specialization and receive live enterprise problem statements with dedicated Git repositories and senior mentor guidance.
                </div>
              </div>
            </div>

            <div class="num-item">
              <div class="num-circle">3</div>
              <div class="num-content">
                <div class="num-heading">Step 3: Milestone Reviews, Stipend & Placement Pathways</div>
                <div style="font-size: 10.8px; color: var(--text-body);">
                  Periodic sprint reviews, <strong>Overall Performance-Based Stipend</strong> disbursement of <strong>₹8,000 to ₹15,000</strong> (<strong>Strictly an Overall Program Stipend, Not Monthly</strong>) upon milestone clearance, official credentials issuance (Experience Letter, LOR, Certificate), and direct HR interviews for pre-placement offers.
                </div>
              </div>
            </div>
          </div>

          <div style="background: #0B2545; color: #FFFFFF; border-radius: 12px; padding: 15px 18px; margin-top: auto;">
            <div style="font-size: 13px; font-weight: 800; color: #38BDF8; font-family: 'Space Grotesk', sans-serif; margin-bottom: 7px;">
              OFFICIAL CORPORATE & CAMPUS DIRECTORY
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 10.2px;">
              <div>
                <strong style="color: #94A3B8;">Corporate Headquarters (Pune):</strong><br>
                Gera's Imperium Rise, Hinjewadi Phase 2, Pune, Maharashtra 411057<br><br>
                <strong style="color: #94A3B8;">Leadership:</strong> Mr. Pratik Pawar (ATL / Proprietor)<br>
                <strong style="color: #94A3B8;">Direct Phone:</strong> +91 6364326342 / +91 9110406075<br>
                <strong style="color: #94A3B8;">Website:</strong> www.aparaitech.org
              </div>
              <div>
                <strong style="color: #94A3B8;">Bengaluru Tech Center:</strong><br>
                360, Neeladri Rd, Electronic City Phase I, Bengaluru, Karnataka 560100<br><br>
                <strong style="color: #94A3B8;">Official Email:</strong> info@aparaitechsoftware.org<br>
                <strong style="color: #94A3B8;">HR Email:</strong> hr@info.aparaitech.org<br>
                <strong style="color: #94A3B8;">Alternate:</strong> aparaitech@gmail.com
              </div>
            </div>
          </div>
        </div>

        <div class="page-bottom" style="margin-top: 10px;">
          <div class="bottom-gradient-bar">
            <span class="page-number-text">13</span>
          </div>
          <div class="address-footer">
            {address_line_1}<br>{address_line_2}
          </div>
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""

    html_file = os.path.join(base_dir, "aparaitech_dossier_pdea_coem.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Product Portfolio HTML written to: {html_file}")

    # Generate PDF with Chrome headless
    pdf_file = os.path.join(base_dir, "Aparaitech_Product_Portfolio_and_Reference_Dossier_PDEA_COEM_Pune.pdf")
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]

    print("Compiling full PDEA COEM Product Portfolio & Reference Dossier PDF...")
    result = subprocess.run(chrome_cmd, capture_output=True, text=True)
    print("Return code:", result.returncode)
    
    if os.path.exists(pdf_file):
        pdf_size = os.path.getsize(pdf_file)
        print(f"SUCCESS: PDEA COEM PDF generated: {pdf_file} (Size: {pdf_size} bytes)")
        
        # Verify page count with pymupdf and generate preview images
        doc = pymupdf.open(pdf_file)
        print(f"Total Page Count in PDF: {len(doc)}")
        
        preview_dir = os.path.join(base_dir, "assets", "pdea_dossier_previews")
        os.makedirs(preview_dir, exist_ok=True)
        
        for pno in [0, 1, 4, 12]:  # Pages 1, 2, 5, 13 (0-indexed)
            if pno < len(doc):
                page = doc[pno]
                pix = page.get_pixmap(dpi=150)
                out_img = os.path.join(preview_dir, f"pdea_dossier_page_{pno+1}.png")
                pix.save(out_img)
                print(f"Saved preview: {out_img}")
        doc.close()
    else:
        print("ERROR: PDF was not generated. Stderr:", result.stderr)

if __name__ == "__main__":
    build_pdea_coem_dossier()
