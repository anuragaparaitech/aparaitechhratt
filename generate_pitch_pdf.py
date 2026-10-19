import os
import base64
import subprocess
import urllib.request

def build_pdf_template():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "registration-qr.png")

    if not os.path.exists(qr_path):
        qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&data=https%3A%2F%2Fforms.gle%2FsucrxqA8c7oZhnQQ7"
        req = urllib.request.Request(qr_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            with open(qr_path, "wb") as f:
                f.write(resp.read())

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aparaitech Live Project Program 2026 - Official Pitch</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary-navy: #0B132B;
      --navy-dark: #070D1E;
      --navy-light: #1C2541;
      --teal-primary: #0D9488;
      --teal-dark: #0F766E;
      --teal-light: #14B8A6;
      --teal-soft: #F0FDFA;
      --blue-accent: #2563EB;
      --blue-soft: #EFF6FF;
      --amber-accent: #D97706;
      --amber-soft: #FFFBEB;
      --text-dark: #0F172A;
      --text-muted: #475569;
      --text-light: #64748B;
      --border-color: #E2E8F0;
      --card-bg: #FFFFFF;
      --section-bg: #F8FAFC;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #E2E8F0;
      color: var(--text-dark);
      line-height: 1.42;
      font-size: 11.5px;
    }}

    .no-print-toolbar {{
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    }}
    .toolbar-title {{
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .toolbar-actions {{
      display: flex;
      gap: 12px;
    }}
    .btn {{
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }}
    .btn-primary {{
      background: #0d9488;
      color: #ffffff;
    }}
    .btn-outline {{
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }}

    .page-container {{
      width: 210mm;
      margin: 20px auto;
    }}

    .page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      min-height: 297mm;
      background: #ffffff;
      padding: 10mm 12mm;
      position: relative;
      box-sizing: border-box;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      margin-bottom: 25px;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
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
      .page-container {{
        width: 210mm;
        margin: 0;
      }}
      .page {{
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        min-height: 297mm;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        overflow: hidden !important;
        padding: 9.5mm 12mm !important;
      }}
    }}

    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 9px;
    }}
    .brand-group {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand-logo-img {{
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 4px 6px rgba(13, 148, 136, 0.25));
    }}
    .brand-names {{
      display: flex;
      flex-direction: column;
    }}
    .brand-title {{
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--primary-navy);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .brand-subtitle {{
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: var(--teal-primary);
      text-transform: uppercase;
      margin-top: 1px;
    }}
    .header-tags {{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }}
    .badge-primary {{
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }}
    .subtag {{
      font-size: 8.5px;
      color: var(--text-light);
      font-weight: 600;
    }}

    .hero-banner {{
      background: linear-gradient(135deg, #0B132B 0%, #112942 55%, #0F766E 100%);
      color: #ffffff;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 9px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(11, 19, 43, 0.15);
    }}
    .hero-tagline {{
      display: inline-block;
      background: rgba(20, 184, 166, 0.25);
      border: 1px solid rgba(20, 184, 166, 0.45);
      color: #5eead4;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .stipend-tag-top {{
      display: inline-block;
      background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-left: 6px;
      margin-bottom: 4px;
    }}
    .hero-title {{
      font-size: 19px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
      line-height: 1.15;
      margin-bottom: 6px;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .hero-letter {{
      font-size: 10.5px;
      color: #e2e8f0;
      line-height: 1.45;
      background: rgba(255, 255, 255, 0.08);
      border-left: 3px solid #14b8a6;
      padding: 6px 10px;
      border-radius: 0 6px 6px 0;
    }}
    .hero-letter strong {{
      color: #ffffff;
    }}

    .stat-strip {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      margin-bottom: 9px;
    }}
    .stat-card {{
      background: var(--section-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 7px 10px;
      text-align: center;
    }}
    .stat-card.gold-card {{
      background: #FFFBEB;
      border-color: #FDE68A;
    }}
    .stat-val {{
      font-size: 15px;
      font-weight: 800;
      color: var(--teal-primary);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .stat-val.gold {{
      color: #D97706;
    }}
    .stat-label {{
      font-size: 8.5px;
      font-weight: 700;
      color: var(--text-dark);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 1px;
    }}
    .stat-desc {{
      font-size: 8px;
      color: var(--text-light);
    }}

    .section-title {{
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 6px;
      font-family: 'Space Grotesk', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }}
    .section-title .icon-circle {{
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: var(--teal-soft);
      color: var(--teal-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      border: 1px solid rgba(13, 148, 136, 0.25);
    }}

    .program-intro-card {{
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--teal-primary);
      border-radius: 7px;
      padding: 8px 12px;
      margin-bottom: 9px;
    }}
    .program-intro-card p {{
      font-size: 10px;
      line-height: 1.45;
      color: #334155;
    }}
    .domain-pills {{
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 6px;
    }}
    .domain-pill {{
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      font-size: 8.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }}

    .benefits-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6.5px;
      margin-bottom: 9px;
    }}
    .benefit-item {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      padding: 6.5px 9px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }}
    .benefit-item.highlight-gold {{
      border-color: #FDE68A;
      background: #FFFDF5;
    }}
    .benefit-icon {{
      width: 24px;
      height: 24px;
      border-radius: 6px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      background: var(--teal-soft);
      border: 1px solid rgba(13, 148, 136, 0.2);
    }}
    .benefit-icon.gold-icon {{
      background: #FEF3C7;
      border-color: #FCD34D;
    }}
    .benefit-content h4 {{
      font-size: 10px;
      font-weight: 700;
      color: var(--primary-navy);
      line-height: 1.2;
    }}
    .benefit-content p {{
      font-size: 8.5px;
      color: var(--text-muted);
      line-height: 1.35;
      margin-top: 1px;
    }}

    .structure-table {{
      width: 100%;
      border-collapse: collapse;
      border-radius: 7px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      font-size: 9px;
      margin-bottom: 7px;
    }}
    .structure-table th {{
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 5px 9px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.04em;
    }}
    .structure-table td {{
      padding: 4.5px 9px;
      border-top: 1px solid var(--border-color);
      color: var(--text-dark);
    }}
    .structure-table tr:nth-child(even) td {{
      background: #F8FAFC;
    }}
    .structure-feature {{
      font-weight: 700;
      color: var(--primary-navy);
      width: 24%;
      display: flex;
      align-items: center;
      gap: 5px;
    }}

    .page-footer {{
      border-top: 1px solid var(--border-color);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: var(--text-light);
      margin-top: auto;
    }}
    .footer-left {{
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }}
    .footer-left span {{
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }}
    .footer-right {{
      font-weight: 700;
      color: var(--teal-primary);
    }}

    /* PAGE 2 */
    .page2-grid-top {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 9px;
    }}
    .eligibility-container {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 9px 11px;
    }}
    .eligibility-list {{
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 5px;
    }}
    .eligibility-badge {{
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 5px 8px;
    }}
    .elig-icon {{
      font-size: 13px;
    }}
    .elig-title {{
      font-size: 9.5px;
      font-weight: 700;
      color: var(--primary-navy);
    }}
    .elig-sub {{
      font-size: 8px;
      color: var(--text-light);
    }}

    .global-collab-card {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0d9488 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
    }}
    .collab-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
    }}
    .collab-badge {{
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .flags-tag {{
      font-size: 12px;
    }}
    .collab-title {{
      font-size: 12px;
      font-weight: 800;
      color: #38bdf8;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 4px;
    }}
    .collab-text {{
      font-size: 8.5px;
      color: #e2e8f0;
      line-height: 1.4;
    }}
    .collab-tags {{
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }}
    .collab-tag-item {{
      background: rgba(20, 184, 166, 0.2);
      border: 1px solid rgba(20, 184, 166, 0.4);
      color: #5eead4;
      font-size: 7.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }}

    .colleges-section {{
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 9px 12px;
      margin-bottom: 9px;
    }}
    .colleges-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 6px;
    }}
    .college-chip {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }}
    .college-chip-icon {{
      width: 20px;
      height: 20px;
      background: var(--blue-soft);
      color: var(--blue-accent);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }}
    .college-chip-info {{
      display: flex;
      flex-direction: column;
    }}
    .college-name {{
      font-size: 8.5px;
      font-weight: 700;
      color: var(--primary-navy);
      line-height: 1.2;
    }}
    .college-city {{
      font-size: 7.5px;
      color: var(--text-light);
    }}

    .why-us-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 9px;
    }}
    .why-card {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      padding: 6px 8px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }}
    .why-card::before {{
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2.5px;
      background: var(--teal-primary);
    }}
    .why-card.why-gold::before {{
      background: #F59E0B;
    }}
    .why-card-title {{
      font-size: 9px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }}
    .why-card-desc {{
      font-size: 8px;
      color: var(--text-muted);
      line-height: 1.35;
    }}

    .apply-hub {{
      background: #ffffff;
      border: 2px solid #0d9488;
      border-radius: 9px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 14px;
      align-items: center;
      margin-bottom: 9px;
      box-shadow: 0 4px 15px rgba(13, 148, 136, 0.08);
      position: relative;
    }}
    .apply-badge-corner {{
      position: absolute;
      top: -10px;
      left: 14px;
      background: #0d9488;
      color: #ffffff;
      font-size: 8.5px;
      font-weight: 800;
      padding: 2px 9px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .apply-steps-list {{
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 4px;
    }}
    .apply-step-item {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .step-num {{
      width: 17px;
      height: 17px;
      background: #0f172a;
      color: #ffffff;
      font-size: 8.5px;
      font-weight: 800;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}
    .step-text {{
      font-size: 8.8px;
      font-weight: 600;
      color: var(--text-dark);
    }}
    .step-text strong {{
      color: var(--teal-primary);
    }}
    .apply-qr-container {{
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background: #F8FAFC;
      border: 1px dashed #cbd5e1;
      padding: 7px;
      border-radius: 7px;
    }}
    .qr-img {{
      width: 82px;
      height: 82px;
      border-radius: 4px;
      background: #ffffff;
      padding: 3px;
      border: 1px solid var(--border-color);
    }}
    .qr-label {{
      font-size: 7.5px;
      font-weight: 800;
      color: var(--primary-navy);
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.04em;
    }}
    .form-link-btn {{
      margin-top: 6px;
      display: inline-block;
      background: #0d9488;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 8.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }}

    .contact-banner {{
      background: var(--navy-dark);
      color: #ffffff;
      border-radius: 8px;
      padding: 8px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      align-items: center;
      border: 1px solid #1e293b;
    }}
    .contact-unit {{
      display: flex;
      flex-direction: column;
    }}
    .contact-unit-title {{
      font-size: 7.5px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }}
    .contact-unit-val {{
      font-size: 8.5px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
    }}
    .contact-unit-val.highlight {{
      color: #2dd4bf;
    }}
  </style>
</head>
<body>

  <div class="no-print-toolbar">
    <div class="toolbar-title">
      <span>🚀</span>
      <span>Aparaitech Software • Live Project Program 2026 PDF Pitch</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-outline" onclick="window.scrollTo({{ top: document.body.scrollHeight, behavior: 'smooth' }})">
        Scroll to Page 2
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="page-container">

    <!-- PAGE 1 -->
    <div class="page" id="page-1">
      <div>
        <div class="header-bar">
          <div class="brand-group">
            <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
            <div class="brand-names">
              <span class="brand-title">APARAITECH SOFTWARE</span>
              <span class="brand-subtitle">Industry Innovation & Engineering Excellence</span>
            </div>
          </div>
          <div class="header-tags">
            <span class="badge-primary">⚡ BATCH 2026 • ADMISSIONS OPEN</span>
            <span class="subtag">Official Program Prospectus & Pitch Document</span>
          </div>
        </div>

        <div class="hero-banner">
          <div>
            <span class="hero-tagline">Industrial Capability Development</span>
            <span class="stipend-tag-top">💰 OVERALL PERFORMANCE STIPEND: ₹8,000 – ₹15,000 (NOT MONTHLY)</span>
          </div>
          <h1 class="hero-title">🚀 LIVE PROJECT PROGRAM 2026</h1>
          <div class="hero-letter">
            <strong>Dear Students,</strong><br>
            Are you tired of learning only from tutorials and textbooks? Do you want to gain real industry experience before you graduate?<br>
            <strong>Aparaitech Software</strong> presents the <strong>Live Project Program 2026</strong> — a 3-month immersive experience where you build, deploy real solutions, and earn an <strong>Overall Performance-Based Stipend of ₹8,000 to ₹15,000</strong> (strictly an overall program stipend, not monthly) under senior engineers.
          </div>
        </div>

        <div class="stat-strip">
          <div class="stat-card">
            <div class="stat-val">3 Months</div>
            <div class="stat-label">Intensive Duration</div>
            <div class="stat-desc">Hands-on Agile Sprints</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">10 Live</div>
            <div class="stat-label">Industry Projects</div>
            <div class="stat-desc">Production Deployments</div>
          </div>
          <div class="stat-card gold-card">
            <div class="stat-val gold">₹8K–15K</div>
            <div class="stat-label" style="color: #92400E;">Overall Stipend</div>
            <div class="stat-desc" style="color: #B45309; font-weight: 700;">Performance-Based</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">1 : 1</div>
            <div class="stat-label">Tech Mentorship</div>
            <div class="stat-desc">Senior Industry Leads</div>
          </div>
        </div>

        <div class="section-title">
          <span class="icon-circle">🎯</span>
          <span>What is the Live Project Program?</span>
        </div>
        <div class="program-intro-card">
          <p>
            The Live Project Program is a <strong>3-month hands-on initiative</strong> where selected students work on <strong>10 live industry-level projects</strong> across high-demand technology tracks. You don't just learn — <strong>you build, implement, and deploy real solutions</strong> under the direct guidance of senior engineers at Aparaitech Software, with an <strong>Overall Performance-Based Stipend of ₹8,000 to ₹15,000</strong> (strictly overall program stipend, not monthly).
          </p>
          <div class="domain-pills">
            <span class="domain-pill">💻 Web Development (Full-Stack)</span>
            <span class="domain-pill">🤖 AI / Machine Learning</span>
            <span class="domain-pill">📊 Data Analytics & BI</span>
            <span class="domain-pill">☕ Java Enterprise Systems</span>
            <span class="domain-pill">☁️ Cloud Computing & DevOps</span>
          </div>
        </div>

        <div class="section-title">
          <span class="icon-circle">🏆</span>
          <span>What You Will Gain — Tangible Career Benefits</span>
        </div>
        <div class="benefits-grid">
          <div class="benefit-item highlight-gold">
            <div class="benefit-icon gold-icon">💰</div>
            <div class="benefit-content">
              <h4 style="color: #92400E;">Overall Performance Stipend</h4>
              <p>Earn an overall performance-based stipend of ₹8,000 to ₹15,000 across the program (strictly not monthly) upon milestone completion.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🏢</div>
            <div class="benefit-content">
              <h4>Real Industry Experience</h4>
              <p>Work on 10 live projects simulating actual enterprise workflows & Git version control.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">💼</div>
            <div class="benefit-content">
              <h4>Pre-Placement Opportunity</h4>
              <p>Performance evaluation and fast-track consideration for full-time software engineering roles.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📜</div>
            <div class="benefit-content">
              <h4>Professional Documents</h4>
              <p>Experience Certificate, official Letter of Recommendation (LOR) & Completion Certificate.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📁</div>
            <div class="benefit-content">
              <h4>Portfolio Building</h4>
              <p>Build a verified public GitHub portfolio of production-grade deployments recruiters admire.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">⚡</div>
            <div class="benefit-content">
              <h4>Industry-Ready Skills</h4>
              <p>Master cutting-edge stacks: React, Node, Python, Cloud CI/CD, Data pipelines & AI models.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🌏</div>
            <div class="benefit-content">
              <h4>Global Exposure</h4>
              <p>International market collaboration exposure via partnerships with Embarc.Inc (Japan-India).</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🎯</div>
            <div class="benefit-content">
              <h4>Career Advancement</h4>
              <p>Direct HR interview call and dedicated placement support upon program completion.</p>
            </div>
          </div>
        </div>

        <div class="section-title">
          <span class="icon-circle">📚</span>
          <span>Program Structure & Operational Framework</span>
        </div>
        <table class="structure-table">
          <thead>
            <tr>
              <th style="width: 28%;">Feature</th>
              <th>Operational Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="structure-feature">⏱️ Duration</td>
              <td><strong>3 Months</strong> (Structured into milestone sprints, code reviews, and deployments)</td>
            </tr>
            <tr>
              <td class="structure-feature">💰 Stipend</td>
              <td><strong>₹8,000 – ₹15,000 Overall</strong> (Performance-based overall program stipend, strictly not monthly)</td>
            </tr>
            <tr>
              <td class="structure-feature">🚀 Projects</td>
              <td><strong>10 Live Industry-Level Projects</strong> with production hosting and real test cases</td>
            </tr>
            <tr>
              <td class="structure-feature">🌐 Domains</td>
              <td>Web Development, AI/ML, Data Analytics, Java Systems, Cloud Computing</td>
            </tr>
            <tr>
              <td class="structure-feature">💻 Delivery Mode</td>
              <td><strong>Online / Remote</strong> (Flexible developer schedule + weekly live interaction syncs)</td>
            </tr>
            <tr>
              <td class="structure-feature">📊 Evaluation</td>
              <td>Performance-based: Project Quality (50%) + Code Delivery (30%) + Attendance (20%)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="page-footer">
        <div class="footer-left">
          <span>🏢 Aparaitech Software</span>
          <span>•</span>
          <span>🌐 www.aparaitech.org</span>
          <span>•</span>
          <span>📧 hr@info.aparaitech.org</span>
        </div>
        <div class="footer-right">
          Page 1 of 2 • Official Pitch
        </div>
      </div>
    </div>

    <!-- PAGE 2 -->
    <div class="page" id="page-2">
      <div>
        <div class="header-bar">
          <div class="brand-group">
            <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
            <div class="brand-names">
              <span class="brand-title">APARAITECH SOFTWARE</span>
              <span class="brand-subtitle">Live Project Program 2026 • Eligibility & Admissions</span>
            </div>
          </div>
          <div class="header-tags">
            <span class="badge-primary" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">CAMPUS ADMISSIONS DESK</span>
            <span class="subtag">Candidate Guidelines & Institutional Trust</span>
          </div>
        </div>

        <div class="page2-grid-top">
          <div class="eligibility-container">
            <div class="section-title" style="margin-bottom: 4px;">
              <span class="icon-circle">🎓</span>
              <span>Candidate Eligibility</span>
            </div>
            <div class="eligibility-list">
              <div class="eligibility-badge">
                <span class="elig-icon">🎓</span>
                <div>
                  <div class="elig-title">College Students (1st to Final Year)</div>
                  <div class="elig-sub">B.Tech, B.E., BCA, MCA, B.Sc Computer Science & Polytechnic</div>
                </div>
              </div>
              <div class="eligibility-badge">
                <span class="elig-icon">🚀</span>
                <div>
                  <div class="elig-title">Fresh Graduates</div>
                  <div class="elig-sub">Seeking real enterprise proof-of-work to crack top tech interviews</div>
                </div>
              </div>
              <div class="eligibility-badge">
                <span class="elig-icon">💼</span>
                <div>
                  <div class="elig-title">Working Professionals</div>
                  <div class="elig-sub">Looking to upskill or pivot into Full Stack, AI/ML, or Cloud Tech</div>
                </div>
              </div>
            </div>
          </div>

          <div class="global-collab-card">
            <div>
              <div class="collab-header">
                <span class="collab-badge">INTERNATIONAL TIE-UP</span>
                <span class="flags-tag">🇯🇵 🤝 🇮🇳</span>
              </div>
              <div class="collab-title">Global Collaboration: Embarc.Inc</div>
              <p class="collab-text">
                Aparaitech Software maintains a strategic cross-border partnership with <strong>Embarc.Inc</strong> for <strong>Japan-India market entry</strong>. 
                Participants receive exposure to global engineering protocols, international collaboration standards, and cutting-edge software paradigms.
              </p>
            </div>
            <div class="collab-tags">
              <span class="collab-tag-item">Cross-Border Projects</span>
              <span class="collab-tag-item">Global Work Culture</span>
              <span class="collab-tag-item">Japan-India Bridge</span>
            </div>
          </div>
        </div>

        <div class="colleges-section">
          <div class="section-title" style="margin-bottom: 2px;">
            <span class="icon-circle">🏫</span>
            <span>Who Trusts Us? Leading Partner Academic Institutions</span>
          </div>
          <div class="colleges-grid">
            <div class="college-chip">
              <div class="college-chip-icon">🏛️</div>
              <div class="college-chip-info">
                <span class="college-name">DHB Soni College</span>
                <span class="college-city">Solapur, Maharashtra</span>
              </div>
            </div>
            <div class="college-chip">
              <div class="college-chip-icon">🏛️</div>
              <div class="college-chip-info">
                <span class="college-name">SPCOET</span>
                <span class="college-city">Baramati, Maharashtra</span>
              </div>
            </div>
            <div class="college-chip">
              <div class="college-chip-info">🏛️</div>
              <div class="college-chip-info">
                <span class="college-name">Vidya Pratishthan's COE</span>
                <span class="college-city">Baramati, Maharashtra</span>
              </div>
            </div>
            <div class="college-chip">
              <div class="college-chip-icon">🏛️</div>
              <div class="college-chip-info">
                <span class="college-name">Sharadchandra Pawar COE&T</span>
                <span class="college-city">Someshwarnagar, Pune</span>
              </div>
            </div>
            <div class="college-chip">
              <div class="college-chip-icon">🏛️</div>
              <div class="college-chip-info">
                <span class="college-name">Jaywant COE & Polytechnic</span>
                <span class="college-city">Sangli, Maharashtra</span>
              </div>
            </div>
            <div class="college-chip">
              <div class="college-chip-info">⭐</div>
              <div class="college-chip-info">
                <span class="college-name">& Many Leading Institutions</span>
                <span class="college-city">Across India & Global Network</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section-title">
          <span class="icon-circle">📌</span>
          <span>Why Choose Aparaitech Software? The Distinct Competitive Edge</span>
        </div>
        <div class="why-us-grid">
          <div class="why-card why-gold">
            <div class="why-card-title">💰 ₹8K–15K Overall Stipend</div>
            <div class="why-card-desc">Earn an overall performance-based stipend on milestone deliveries (strictly not monthly).</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">✅ Real Projects</div>
            <div class="why-card-desc">Not generic tutorials — actual production engineering and live cloud deployment.</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">📜 3 Credentials</div>
            <div class="why-card-desc">Experience Letter, official LOR, and Course Completion Certificate.</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">💼 HR Direct Calls</div>
            <div class="why-card-desc">Top performers get direct interview calls for hiring at Aparaitech & partners.</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">👨‍💻 Senior Mentors</div>
            <div class="why-card-desc">Continuous feedback and 1-on-1 sprint reviews from industry veterans.</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">🌏 Global Exposure</div>
            <div class="why-card-desc">International workflow alignment via Embarc.Inc (Japan-India).</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">📁 Hiring Portfolio</div>
            <div class="why-card-desc">Deploy 10 live projects on GitHub & Cloud to prove capability to employers.</div>
          </div>
          <div class="why-card">
            <div class="why-card-title">🏫 Campus Acclaim</div>
            <div class="why-card-desc">Accredited and trusted by renowned engineering and polytechnic colleges.</div>
          </div>
        </div>

        <div class="apply-hub">
          <div class="apply-badge-corner">Admissions Open • Apply Now</div>
          <div>
            <div class="section-title" style="margin-bottom: 2px;">
              <span class="icon-circle" style="background: #0d9488; color: #ffffff;">📝</span>
              <span>How to Apply — Simple 4-Step Process</span>
            </div>
            <div class="apply-steps-list">
              <div class="apply-step-item">
                <span class="step-num">1</span>
                <span class="step-text">Scan the QR code or click the registration link below.</span>
              </div>
              <div class="apply-step-item">
                <span class="step-num">2</span>
                <span class="step-text">Submit your academic details & choose your preferred domain.</span>
              </div>
              <div class="apply-step-item">
                <span class="step-num">3</span>
                <span class="step-text">Aparaitech Technical HR team evaluates your application.</span>
              </div>
              <div class="apply-step-item">
                <span class="step-num">4</span>
                <span class="step-text">Receive onboarding confirmation, mentor assignment & schedule.</span>
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 8px; color: var(--text-light);">
              Official Registration Link: <strong style="color: #0d9488;">https://forms.gle/sucrxqA8c7oZhnQQ7</strong>
            </div>
          </div>

          <div class="apply-qr-container">
            <img class="qr-img" src="data:image/png;base64,{qr_b64}" alt="Registration QR Code" />
            <div class="qr-label">Scan to Apply</div>
            <a href="https://forms.gle/sucrxqA8c7oZhnQQ7" target="_blank" class="form-link-btn">
              Open Form ↗
            </a>
          </div>
        </div>

        <div class="contact-banner">
          <div class="contact-unit">
            <div class="contact-unit-title">Campus Relations Desk</div>
            <div class="contact-unit-val" style="font-size: 9px; color: #f8fafc;">
              🏢 Aparaitech Software
            </div>
            <div style="font-size: 7.5px; color: #94a3b8; margin-top: 1px;">
              Student Success & University Alliances
            </div>
          </div>

          <div class="contact-unit">
            <div class="contact-unit-title">Official Inquiries & Support</div>
            <a href="mailto:hr@info.aparaitech.org" class="contact-unit-val">
              📧 hr@info.aparaitech.org
            </a>
            <a href="mailto:aparaitech@gmail.com" class="contact-unit-val" style="margin-top: 2px;">
              📧 aparaitech@gmail.com
            </a>
          </div>

          <div class="contact-unit">
            <div class="contact-unit-title">Helpline & Portal</div>
            <a href="tel:+919110406075" class="contact-unit-val highlight">
              📞 +91 9110406075
            </a>
            <a href="https://www.aparaitech.org" target="_blank" class="contact-unit-val highlight" style="margin-top: 2px;">
              🌐 www.aparaitech.org
            </a>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-left">
          <span>© 2026 Aparaitech Software. All Rights Reserved.</span>
          <span>•</span>
          <span>Verified Industry Program</span>
        </div>
        <div class="footer-right">
          Page 2 of 2 • Official Admission Document
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""

    html_file = os.path.join(base_dir, "aparaitech_live_project_2026_pitch.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    pdf_file = os.path.join(base_dir, "Aparaitech_Live_Project_Program_2026_Pitch.pdf")
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]

    print("Re-rendering PDF brochure with stipend...")
    subprocess.run(chrome_cmd, capture_output=True, text=True)
    print(f"Updated PDF Brochure: {pdf_file} (Size: {os.path.getsize(pdf_file)} bytes)")

if __name__ == "__main__":
    build_pdf_template()
