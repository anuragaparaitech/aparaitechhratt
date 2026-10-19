import os
import base64
import subprocess

def generate_content_campaign():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    content_dir = os.path.join(base_dir, "content")
    img_dir = os.path.join(content_dir, "images")
    msg_dir = os.path.join(content_dir, "whatsapp_messages")
    html_dir = os.path.join(content_dir, "html_templates")
    
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(msg_dir, exist_ok=True)
    os.makedirs(html_dir, exist_ok=True)

    # Assets
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "working_qr.png")
    
    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

    # =========================================================================
    # CARD 1: "The Reality Check" – Same 3 Months. Different Future.
    # =========================================================================
    card1_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: #0B1325;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }}
    .top-bar {{
      padding: 28px 45px 18px 45px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(11, 19, 37, 0.95);
      z-index: 10;
    }}
    .brand-row {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .logo-img {{
      height: 48px;
      object-fit: contain;
    }}
    .brand-title {{
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.08em;
      font-family: 'Space Grotesk', sans-serif;
      color: #38BDF8;
    }}
    .batch-badge {{
      background: linear-gradient(135deg, #0284C7, #0369A1);
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
    }}

    /* Main Split Container */
    .split-container {{
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
    }}

    /* Left Side: Tutorial Trap */
    .side-left {{
      background: linear-gradient(180deg, #18181B 0%, #0F0F12 100%);
      padding: 40px 45px 40px 45px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 2px solid rgba(239, 68, 68, 0.3);
      position: relative;
    }}
    .side-badge-left {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      align-self: flex-start;
      margin-bottom: 12px;
    }}
    .side-left h2 {{
      font-size: 28px;
      font-weight: 800;
      color: #EF4444;
      line-height: 1.2;
      margin-bottom: 24px;
    }}
    .cross-list {{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .cross-item {{
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid rgba(239, 68, 68, 0.15);
    }}
    .cross-icon {{
      color: #EF4444;
      font-size: 18px;
      font-weight: 900;
      flex-shrink: 0;
    }}
    .cross-text {{
      font-size: 14.5px;
      color: #D4D4D8;
      line-height: 1.4;
      font-weight: 600;
    }}
    .mood-quote-left {{
      font-size: 13px;
      color: #A1A1AA;
      font-style: italic;
      background: rgba(0, 0, 0, 0.4);
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid #EF4444;
    }}

    /* Right Side: Aparaitech Solution */
    .side-right {{
      background: linear-gradient(180deg, #0C2138 0%, #061527 100%);
      padding: 40px 45px 40px 45px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }}
    .side-badge-right {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      align-self: flex-start;
      margin-bottom: 12px;
    }}
    .side-right h2 {{
      font-size: 28px;
      font-weight: 800;
      color: #38BDF8;
      line-height: 1.2;
      margin-bottom: 24px;
    }}
    .check-list {{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .check-item {{
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(56, 189, 248, 0.06);
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid rgba(56, 189, 248, 0.25);
    }}
    .check-icon {{
      color: #34D399;
      font-size: 18px;
      font-weight: 900;
      flex-shrink: 0;
    }}
    .check-text {{
      font-size: 14.5px;
      color: #F0F9FF;
      line-height: 1.4;
      font-weight: 600;
    }}
    .check-text strong {{
      color: #38BDF8;
    }}
    .mood-quote-right {{
      font-size: 13px;
      color: #BAE6FD;
      font-weight: 600;
      background: rgba(2, 132, 199, 0.18);
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid #38BDF8;
    }}

    /* Central Center Badge */
    .center-contrast-badge {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #0284C7;
      color: #FFFFFF;
      padding: 12px 26px;
      border-radius: 40px;
      font-weight: 900;
      font-size: 15px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      box-shadow: 0 0 35px rgba(2, 132, 199, 0.8), 0 0 10px rgba(0,0,0,0.5);
      border: 3px solid #FFFFFF;
      z-index: 20;
      white-space: nowrap;
    }}

    /* Bottom Bar */
    .bottom-cta {{
      background: #061121;
      padding: 18px 45px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    }}
    .cta-text-col {{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}
    .cta-headline {{
      font-size: 18px;
      font-weight: 800;
      color: #F8FAFC;
    }}
    .cta-sub {{
      font-size: 13px;
      color: #94A3B8;
      font-weight: 500;
    }}
    .qr-pill-box {{
      display: flex;
      align-items: center;
      gap: 16px;
      background: #0F172A;
      padding: 8px 16px 8px 12px;
      border-radius: 12px;
      border: 1px solid rgba(56, 189, 248, 0.35);
    }}
    .qr-img {{
      width: 58px;
      height: 58px;
      border-radius: 6px;
      background: #FFFFFF;
      padding: 3px;
    }}
    .qr-labels {{
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}
    .qr-tag {{
      font-size: 11px;
      font-weight: 800;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .qr-link {{
      font-size: 13px;
      font-weight: 700;
      color: #FFFFFF;
    }}
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-row">
      <img class="logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
      <span class="brand-title">APARAITECH SOFTWARE</span>
    </div>
    <div class="batch-badge">Live Project Program 2026</div>
  </div>

  <div class="split-container">
    <div class="center-contrast-badge">Same 3 Months. Different Future.</div>

    <!-- Left: Status Quo -->
    <div class="side-left">
      <div>
        <div class="side-badge-left">The Tutorial Trap</div>
        <h2>Where Most Students Stay Stuck</h2>
        <div class="cross-list">
          <div class="cross-item">
            <span class="cross-icon">✕</span>
            <span class="cross-text">Watching passive video courses without building production code</span>
          </div>
          <div class="cross-item">
            <span class="cross-icon">✕</span>
            <span class="cross-text">Rote-memorizing college notes & basic calculator mini-projects</span>
          </div>
          <div class="cross-item">
            <span class="cross-icon">✕</span>
            <span class="cross-text">Zero GitHub pull requests, zero CI/CD, and zero live deployed links</span>
          </div>
          <div class="cross-item">
            <span class="cross-icon">✕</span>
            <span class="cross-text">Constant fear of campus placement rejection due to lack of experience</span>
          </div>
        </div>
      </div>
      <div class="mood-quote-left">
        "Recruiters reject 90% resumes because they only show course completion, not real capability."
      </div>
    </div>

    <!-- Right: Aparaitech Transformation -->
    <div class="side-right">
      <div>
        <div class="side-badge-right">Industry Apprenticeship</div>
        <h2>Where Aparaitech Takes You</h2>
        <div class="check-list">
          <div class="check-item">
            <span class="check-icon">✓</span>
            <span class="check-text">Build & deploy <strong>10 Live Enterprise Projects</strong> on cloud infrastructure</span>
          </div>
          <div class="check-item">
            <span class="check-icon">✓</span>
            <span class="check-text">Direct 1:1 code reviews & architecture guidance from <strong>Senior Tech Leads</strong></span>
          </div>
          <div class="check-item">
            <span class="check-icon">✓</span>
            <span class="check-text">Verified <strong>Experience Certificate + Letter of Recommendation (LOR)</strong></span>
          </div>
          <div class="check-item">
            <span class="check-icon">✓</span>
            <span class="check-text"><strong>Overall Performance Stipend (₹8K–15K)</strong> + Direct HR placement rounds</span>
          </div>
        </div>
      </div>
      <div class="mood-quote-right">
        Graduates with real live deployment URLs and an official experience letter get hired first.
      </div>
    </div>
  </div>

  <div class="bottom-cta">
    <div class="cta-text-col">
      <div class="cta-headline">Don't Waste 3 Months on Generic Tutorials. Build Proof of Work.</div>
      <div class="cta-sub">Online Mode • Flexible Evening Syncs • Open to 1st Year to Final Year & Grads</div>
    </div>
    <div class="qr-pill-box">
      <img class="qr-img" src="data:image/png;base64,{qr_b64}" alt="QR" />
      <div class="qr-labels">
        <span class="qr-tag">Scan to Apply</span>
        <span class="qr-link">forms.gle/sucrxqA8c7oZhnQQ7</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

    card1_file = os.path.join(html_dir, "card_1_reality_check.html")
    with open(card1_file, "w", encoding="utf-8") as f:
        f.write(card1_html)


    # =========================================================================
    # CARD 2: "What Recruiters Actually Want" – Logic + Comparison
    # =========================================================================
    card2_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: #0A1128;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 48px;
      position: relative;
    }}
    .bg-circle {{
      position: absolute;
      top: -150px;
      right: -150px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }}
    .header-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 5;
    }}
    .brand-wrap {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .logo-img {{
      height: 52px;
      object-fit: contain;
    }}
    .brand-text {{
      font-size: 24px;
      font-weight: 800;
      color: #38BDF8;
      letter-spacing: 0.08em;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .header-pill {{
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      color: #E2E8F0;
    }}
    
    .title-area {{
      margin-top: 15px;
      margin-bottom: 20px;
      position: relative;
      z-index: 5;
    }}
    .title-sub {{
      font-size: 14px;
      font-weight: 800;
      color: #F59E0B;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 6px;
    }}
    .main-title {{
      font-size: 38px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.15;
      color: #FFFFFF;
    }}
    .main-title span {{
      color: #38BDF8;
    }}

    /* Grid Comparison */
    .compare-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      position: relative;
      z-index: 5;
    }}
    .card-col {{
      border-radius: 18px;
      padding: 28px 26px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .col-red {{
      background: rgba(239, 68, 68, 0.06);
      border: 2px solid rgba(239, 68, 68, 0.35);
    }}
    .col-green {{
      background: rgba(14, 165, 233, 0.08);
      border: 2px solid #0284C7;
      box-shadow: 0 10px 30px rgba(2, 132, 199, 0.2);
    }}
    .col-tag {{
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }}
    .col-red .col-tag {{ color: #F87171; }}
    .col-green .col-tag {{ color: #38BDF8; }}

    .col-heading {{
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 20px;
    }}
    .col-red .col-heading {{ color: #FCA5A5; }}
    .col-green .col-heading {{ color: #FFFFFF; }}

    .criteria-list {{
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}
    .crit-item {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 14.5px;
      font-weight: 600;
    }}
    .col-red .crit-item {{
      background: rgba(239, 68, 68, 0.1);
      color: #FECACA;
    }}
    .col-green .crit-item {{
      background: rgba(2, 132, 199, 0.15);
      color: #F0F9FF;
    }}
    .crit-icon-cross {{
      color: #EF4444;
      font-weight: 900;
      font-size: 18px;
    }}
    .crit-icon-check {{
      color: #34D399;
      font-weight: 900;
      font-size: 18px;
    }}

    .bottom-result {{
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      font-size: 13.5px;
      font-weight: 700;
    }}
    .col-red .bottom-result {{ color: #F87171; }}
    .col-green .bottom-result {{ color: #34D399; }}

    /* Footer Strip */
    .footer-strip {{
      background: linear-gradient(90deg, #0369A1 0%, #0284C7 100%);
      border-radius: 16px;
      padding: 18px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 5;
    }}
    .footer-left h4 {{
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 2px;
    }}
    .footer-left p {{
      font-size: 13px;
      color: #E0F2FE;
    }}
    .footer-action {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .footer-qr {{
      width: 54px;
      height: 54px;
      background: #FFFFFF;
      padding: 3px;
      border-radius: 8px;
    }}
    .footer-btn {{
      background: #FFFFFF;
      color: #0369A1;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }}
  </style>
</head>
<body>
  <div class="bg-circle"></div>

  <div class="header-row">
    <div class="brand-wrap">
      <img class="logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
      <span class="brand-text">APARAITECH SOFTWARE</span>
    </div>
    <div class="header-pill">Hiring Insights 2026</div>
  </div>

  <div class="title-area">
    <div class="title-sub">The Technical Hiring Reality</div>
    <h1 class="main-title">What Tech Recruiters <span>Actually Want</span> To See</h1>
  </div>

  <div class="compare-grid">
    <!-- What 90% Students Show -->
    <div class="card-col col-red">
      <div>
        <div class="col-tag">Most Student Resumes</div>
        <div class="col-heading">Theoretical & Static</div>
        <div class="criteria-list">
          <div class="crit-item">
            <span>High CGPA / Grades</span>
            <span class="crit-icon-cross">✕ (Not Enough)</span>
          </div>
          <div class="crit-item">
            <span>Tutorial Mini Projects</span>
            <span class="crit-icon-cross">✕ (No Real Value)</span>
          </div>
          <div class="crit-item">
            <span>Online Course Certificates</span>
            <span class="crit-icon-cross">✕ (Zero Code Proof)</span>
          </div>
          <div class="crit-item">
            <span>No Production Git Repos</span>
            <span class="crit-icon-cross">✕ (Zero Teamwork)</span>
          </div>
        </div>
      </div>
      <div class="bottom-result">
        Outcome: Stuck in Resume Filtering Rounds
      </div>
    </div>

    <!-- What Recruiters Want -->
    <div class="card-col col-green">
      <div>
        <div class="col-tag">With Aparaitech Live Program</div>
        <div class="col-heading">Verified Industry Capabilities</div>
        <div class="criteria-list">
          <div class="crit-item">
            <span>10 Live Deployed Systems</span>
            <span class="crit-icon-check">✓ Verified URLs</span>
          </div>
          <div class="crit-item">
            <span>Official Experience Certificate</span>
            <span class="crit-icon-check">✓ Corporate Proof</span>
          </div>
          <div class="crit-item">
            <span>Letter of Recommendation (LOR)</span>
            <span class="crit-icon-check">✓ Senior Tech Sign</span>
          </div>
          <div class="crit-item">
            <span>Performance Stipend (8K-15K)</span>
            <span class="crit-icon-check">✓ Paid Apprenticeship</span>
          </div>
        </div>
      </div>
      <div class="bottom-result">
        Outcome: Direct HR Calls & High Placement Conversion
      </div>
    </div>
  </div>

  <div class="footer-strip">
    <div class="footer-left">
      <h4>Upgrade Your Resume from Theory to Production Code</h4>
      <p>Aparaitech Live Project Program 2026 • 3 Months Hands-on Live Apprenticeship</p>
    </div>
    <div class="footer-action">
      <img class="footer-qr" src="data:image/png;base64,{qr_b64}" alt="QR" />
      <div class="footer-btn">Apply Now</div>
    </div>
  </div>
</body>
</html>
"""

    card2_file = os.path.join(html_dir, "card_2_recruiters_demand.html")
    with open(card2_file, "w", encoding="utf-8") as f:
        f.write(card2_html)


    # =========================================================================
    # CARD 3: "Your Friend Already Started" – WhatsApp Chat Mockup (FOMO)
    # =========================================================================
    card3_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: #0E1626;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 30px 45px 35px 45px;
    }}
    .top-brand {{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }}
    .brand-logo-grp {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand-logo-img {{
      height: 44px;
      object-fit: contain;
    }}
    .brand-name {{
      color: #38BDF8;
      font-size: 22px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.06em;
    }}
    .headline-pill {{
      background: #EF4444;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      padding: 6px 16px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    }}

    /* WhatsApp Phone Frame */
    .phone-container {{
      width: 820px;
      background: #0B141A;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }}

    /* WhatsApp Header */
    .wa-header {{
      background: #1F2C34;
      padding: 16px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}
    .wa-user-info {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .wa-avatar {{
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #0284C7;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #38BDF8;
    }}
    .wa-name-col {{
      display: flex;
      flex-direction: column;
    }}
    .wa-contact-name {{
      font-size: 18px;
      font-weight: 700;
      color: #E9EDEF;
    }}
    .wa-status {{
      font-size: 12px;
      color: #00A884;
      font-weight: 600;
    }}
    .wa-icons {{
      display: flex;
      gap: 18px;
      color: #AEBAC1;
      font-size: 20px;
    }}

    /* Chat Area */
    .wa-chat-body {{
      background: #0B141A;
      background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
      background-size: 20px 20px;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }}

    .chat-bubble {{
      max-width: 78%;
      padding: 14px 18px;
      border-radius: 12px;
      font-size: 15px;
      line-height: 1.45;
      position: relative;
    }}
    .bubble-left {{
      align-self: flex-start;
      background: #202C33;
      color: #E9EDEF;
      border-top-left-radius: 0;
    }}
    .bubble-right {{
      align-self: flex-end;
      background: #005C4B;
      color: #E9EDEF;
      border-top-right-radius: 0;
    }}
    .bubble-time {{
      font-size: 11px;
      color: #8696A0;
      margin-top: 6px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 4px;
    }}
    .blue-ticks {{
      color: #53BDEB;
      font-weight: 800;
    }}

    /* Bottom Overlay Banner */
    .bottom-fomo-banner {{
      width: 100%;
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      border-radius: 18px;
      padding: 18px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 30px rgba(2, 132, 199, 0.4);
    }}
    .fomo-left-title {{
      font-size: 20px;
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: 3px;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .fomo-left-sub {{
      font-size: 13.5px;
      color: #E0F2FE;
      font-weight: 600;
    }}
    .fomo-right {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .fomo-qr {{
      width: 58px;
      height: 58px;
      background: #FFFFFF;
      padding: 3px;
      border-radius: 8px;
    }}
    .apply-badge-btn {{
      background: #F59E0B;
      color: #0F172A;
      font-weight: 900;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
  </style>
</head>
<body>
  <div class="top-brand">
    <div class="brand-logo-grp">
      <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
      <span class="brand-name">APARAITECH SOFTWARE</span>
    </div>
    <div class="headline-pill">Classmates are already onboarding</div>
  </div>

  <div class="phone-container">
    <div class="wa-header">
      <div class="wa-user-info">
        <div class="wa-avatar">A</div>
        <div class="wa-name-col">
          <span class="wa-contact-name">Alex (CS Final Year)</span>
          <span class="wa-status">online</span>
        </div>
      </div>
      <div class="wa-icons">
        <span>📹</span>
        <span>📞</span>
        <span>⋮</span>
      </div>
    </div>

    <div class="wa-chat-body">
      <div class="chat-bubble bubble-left">
        Hey, did you join the Aparaitech <strong>Live Project Program 2026</strong>? Saw the official notice in our college group.
        <div class="bubble-time">10:14 AM</div>
      </div>

      <div class="chat-bubble bubble-right">
        Yes! Got assigned a live problem statement and Git repo on Day 1. Already deployed <strong>2 live web systems</strong> to the cloud!
        <div class="bubble-time">10:15 AM <span class="blue-ticks">✓✓</span></div>
      </div>

      <div class="chat-bubble bubble-right">
        Senior engineers review our pull requests directly. Plus, there is an <strong>overall performance stipend (₹8K–15K)</strong> on sprint milestones. My placement resume is finally interview-ready! 🔥
        <div class="bubble-time">10:16 AM <span class="blue-ticks">✓✓</span></div>
      </div>

      <div class="chat-bubble bubble-left">
        That sounds incredible! I was still on the fence. Send me the link, applying right now!
        <div class="bubble-time">10:17 AM</div>
      </div>
    </div>
  </div>

  <div class="bottom-fomo-banner">
    <div>
      <div class="fomo-left-title">3 Months Later, There Are No Excuses — Only Results.</div>
      <div class="fomo-left-sub">Join your classmates before mentor slots are completely filled!</div>
    </div>
    <div class="fomo-right">
      <img class="fomo-qr" src="data:image/png;base64,{qr_b64}" alt="QR" />
      <div class="apply-badge-btn">Apply Now</div>
    </div>
  </div>
</body>
</html>
"""

    card3_file = os.path.join(html_dir, "card_3_whatsapp_fomo.html")
    with open(card3_file, "w", encoding="utf-8") as f:
        f.write(card3_html)


    # =========================================================================
    # CARD 4: "Future You Will Thank You" – Aspirational + Career Growth
    # =========================================================================
    card4_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: radial-gradient(circle at 80% 20%, #0369A1 0%, #0B192C 45%, #050B14 100%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px 50px;
      position: relative;
    }}
    .top-brand {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 5;
    }}
    .logo-grp {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .logo-img {{
      height: 50px;
      object-fit: contain;
    }}
    .brand-title {{
      font-size: 23px;
      font-weight: 800;
      color: #38BDF8;
      letter-spacing: 0.08em;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .program-tag {{
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #F8FAFC;
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }}

    .hero-center {{
      display: flex;
      flex-direction: column;
      gap: 22px;
      position: relative;
      z-index: 5;
    }}
    .future-super {{
      font-size: 14px;
      font-weight: 800;
      color: #F59E0B;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }}
    .future-main-h1 {{
      font-size: 46px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.12;
      color: #FFFFFF;
    }}
    .future-main-h1 span {{
      color: #38BDF8;
      display: block;
    }}
    .future-p {{
      font-size: 16px;
      color: #CBD5E1;
      max-width: 820px;
      line-height: 1.5;
    }}

    /* 4 Outcome Pillars */
    .pillar-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 16px;
    }}
    .pillar-card {{
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(56, 189, 248, 0.25);
      backdrop-filter: blur(10px);
      padding: 20px 18px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}
    .pillar-num {{
      font-size: 24px;
      font-weight: 900;
      color: #38BDF8;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .pillar-title {{
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.3;
    }}
    .pillar-desc {{
      font-size: 11.5px;
      color: #94A3B8;
      line-height: 1.4;
    }}

    /* Institutional Proof Quote */
    .inst-bar {{
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 12.5px;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .inst-bar strong {{
      color: #38BDF8;
    }}

    /* Bottom Action Box */
    .bottom-action-box {{
      background: linear-gradient(90deg, #0284C7 0%, #0369A1 100%);
      border-radius: 16px;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 5;
    }}
    .action-left h3 {{
      font-size: 20px;
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: 3px;
    }}
    .action-left p {{
      font-size: 13.5px;
      color: #E0F2FE;
    }}
    .action-right {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .action-qr {{
      width: 60px;
      height: 60px;
      background: #FFFFFF;
      padding: 3px;
      border-radius: 8px;
    }}
    .btn-apply {{
      background: #F59E0B;
      color: #0F172A;
      font-weight: 900;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 14.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
  </style>
</head>
<body>
  <div class="top-brand">
    <div class="logo-grp">
      <img class="logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
      <span class="brand-title">APARAITECH SOFTWARE</span>
    </div>
    <div class="program-tag">Career Acceleration 2026</div>
  </div>

  <div class="hero-center">
    <div>
      <div class="future-super">Vision & Transformation</div>
      <h1 class="future-main-h1">
        Future You Is Watching
        <span>Will You Thank Yourself 3 Months From Now?</span>
      </h1>
    </div>
    <p class="future-p">
      When campus placement interviews begin, you will either talk about video tutorials you watched, or live production software you engineered and deployed. Today's decision decides tomorrow's outcome.
    </p>

    <div class="pillar-grid">
      <div class="pillar-card">
        <div class="pillar-num">10</div>
        <div class="pillar-title">Live Production Projects</div>
        <div class="pillar-desc">Real code, CI/CD, Git pull requests & cloud hosting.</div>
      </div>
      <div class="pillar-card">
        <div class="pillar-num">3</div>
        <div class="pillar-title">Verified Credentials</div>
        <div class="pillar-desc">Experience Letter, official LOR & Completion Certificate.</div>
      </div>
      <div class="pillar-card">
        <div class="pillar-num">₹15K</div>
        <div class="pillar-title">Performance Stipend</div>
        <div class="pillar-desc">Overall milestone reward for high quality deliverables.</div>
      </div>
      <div class="pillar-card">
        <div class="pillar-num">1:1</div>
        <div class="pillar-title">Senior Mentorship</div>
        <div class="pillar-desc">Guidance directly from industry tech leads & architects.</div>
      </div>
    </div>

    <div class="inst-bar">
      <span>Trusted by leading engineering institutions: <strong>SPCOET Baramati • SVPM COE • DHB Soni College • Dattakala Group</strong></span>
      <span>Global Alliance: <strong>Embarc.Inc (Japan)</strong></span>
    </div>
  </div>

  <div class="bottom-action-box">
    <div class="action-left">
      <h3>Take Charge of Your Career Today</h3>
      <p>Limited seats per domain to preserve small engineering sprint squads.</p>
    </div>
    <div class="action-right">
      <img class="action-qr" src="data:image/png;base64,{qr_b64}" alt="QR" />
      <div class="btn-apply">Apply Now</div>
    </div>
  </div>
</body>
</html>
"""

    card4_file = os.path.join(html_dir, "card_4_future_you.html")
    with open(card4_file, "w", encoding="utf-8") as f:
        f.write(card4_html)


    # =========================================================================
    # CARD 5: Bonus Certificate Sample Mockup
    # =========================================================================
    card5_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: #0B172A;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }}
    .cert-frame {{
      width: 1000px;
      height: 720px;
      background: #FAF8F5;
      border: 8px solid #0369A1;
      border-radius: 16px;
      position: relative;
      padding: 35px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
    }}
    .cert-inner-border {{
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 2px solid #CA8A04;
      border-radius: 8px;
      pointer-events: none;
    }}
    .cert-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .cert-logo {{
      height: 55px;
      object-fit: contain;
    }}
    .cert-ref {{
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }}
    .cert-center {{
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }}
    .cert-title {{
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: 0.1em;
    }}
    .cert-subtitle {{
      font-size: 13px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 700;
    }}
    .cert-name {{
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 900;
      color: #0369A1;
      margin: 8px 0;
      border-bottom: 2px solid #CA8A04;
      padding: 0 40px 6px 40px;
    }}
    .cert-text {{
      font-size: 14px;
      color: #334155;
      max-width: 780px;
      line-height: 1.5;
    }}
    .cert-footer {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 15px;
      border-top: 1px solid #E2E8F0;
    }}
    .cert-sign-col {{
      text-align: center;
    }}
    .sign-line {{
      width: 180px;
      border-top: 1.5px solid #0F172A;
      margin-bottom: 4px;
    }}
    .sign-name {{
      font-size: 12.5px;
      font-weight: 800;
      color: #0F172A;
    }}
    .sign-title {{
      font-size: 10.5px;
      color: #64748B;
    }}
    .cert-seal {{
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px dashed #CA8A04;
      background: #FEF9C3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #854D0E;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.2;
    }}

    .bottom-proof-pill {{
      margin-top: 25px;
      background: #0284C7;
      color: #FFFFFF;
      padding: 10px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }}
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="cert-inner-border"></div>
    <div class="cert-header">
      <img class="cert-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
      <div class="cert-ref">REF ID: APARAI/2026/LP-VERIFIED</div>
    </div>
    <div class="cert-center">
      <div class="cert-subtitle">Aparaitech Software Company</div>
      <div class="cert-title">Certificate of Industrial Apprenticeship</div>
      <div class="cert-subtitle">This is proudly presented to</div>
      <div class="cert-name">[ Candidate Name ]</div>
      <p class="cert-text">
        for successfully completing the <strong>3-Month Live Project Program 2026</strong>, demonstrating outstanding engineering contribution across <strong>10 Live Industry Projects</strong>, Git collaboration, and cloud production deployment.
      </p>
    </div>
    <div class="cert-footer">
      <div class="cert-sign-col">
        <div class="sign-line"></div>
        <div class="sign-name">Pratik Pawar</div>
        <div class="sign-title">ATL / Technical Director</div>
      </div>
      <div class="cert-seal">
        <span>★ VERIFIED ★</span>
        <span>APARAITECH</span>
        <span>2026</span>
      </div>
      <div class="cert-sign-col">
        <div class="sign-line"></div>
        <div class="sign-name">Campus Relations</div>
        <div class="sign-title">Authorized Signatory</div>
      </div>
    </div>
  </div>
  <div class="bottom-proof-pill">Official Verified Credential Included with Letter of Recommendation (LOR)</div>
</body>
</html>
"""

    card5_file = os.path.join(html_dir, "card_5_certificate_sample.html")
    with open(card5_file, "w", encoding="utf-8") as f:
        f.write(card5_html)

    # Render all 5 images via Chrome Headless
    configs = [
        ("01_reality_check.png", card1_file),
        ("02_what_recruiters_want.png", card2_file),
        ("03_friend_already_started.png", card3_file),
        ("04_future_you.png", card4_file),
        ("05_sample_certificate.png", card5_file),
    ]

    for out_name, html_path in configs:
        out_path = os.path.join(img_dir, out_name)
        cmd = [
            chrome_exe,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1080,1080",
            "--hide-scrollbars",
            f"--screenshot={out_path}",
            html_path
        ]
        print(f"Rendering image: {out_name}...")
        subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(out_path):
            print(f"SUCCESS: {out_name} generated ({os.path.getsize(out_path)} bytes)")

    # =========================================================================
    # WRITE WHATSAPP MESSAGES
    # =========================================================================
    msg1_text = """🚀 Where Will Your Engineering Career Be in 3 Months?

What are you doing today?
❌ Watching endless tutorials with zero real output
❌ Memorizing theory notes for exams
❌ Stressing about campus placement cutoffs

OR

✅ Building and deploying 10 Live Industry Projects
✅ Getting mentored by Senior Software Engineers
✅ Earning an Official Experience Certificate + LOR
✅ Preparing for Direct HR Placement Interviews

🔥 *Aparaitech Live Project Program 2026*
🔹 10 Live Industry Projects (Web, AI/ML, Cloud)
🔹 Overall Performance-Based Stipend (₹8,000 – ₹15,000)
🔹 Corporate Experience Certificate + Letter of Recommendation (LOR)
🔹 Direct HR Interview Calls for High Performers

📲 *Apply Now:*
https://forms.gle/sucrxqA8c7oZhnQQ7

⏳ *Strictly Limited Seats – First Come, First Served.*

📞 Campus Relations Desk | +91 9110406075
🌐 www.aparaitech.org
"""

    msg2_text = """📢 Do You Know What Tech Recruiters Actually Look For?

❌ Not just high CGPA or college grades
❌ Not just generic college brand names

What they evaluate:
✅ What have you actually built? (Live Deployed Projects)
✅ Do you have verified corporate experience?
✅ Can you write and review production code?

👉 *If your answer is "No" — this program is built for you.*

🚀 *Aparaitech Live Project Program 2026*
🔹 10 Live Industry-Grade Projects
🔹 Mentorship from Senior Software Engineers
🔹 Verified Experience Certificate + Letter of Recommendation (LOR)
🔹 Overall Performance-Based Stipend (₹8,000 – ₹15,000)
🔹 Direct HR Interview Calls for High Performers

📲 *Apply Now (Registrations Closing Soon):*
https://forms.gle/sucrxqA8c7oZhnQQ7

📞 HR Helpline | +91 9110406075
🌐 www.aparaitech.org
"""

    msg3_text = """👀 Your Classmates Have Already Started Onboarding!

Some have already completed 2 production projects...
Some are hitting sprint milestones for overall performance stipends...
Some are already preparing for direct HR interviews!

And you? 🤔

If you're still sitting on the fence, remember:
*"3 months from now, there will be no excuses — only your results."*

🚀 *Aparaitech Live Project Program 2026*
🔹 10 Live Industry Projects (Production Software Engineering)
🔹 Overall Performance-Based Stipend (₹8,000 – ₹15,000)
🔹 3 Official Credentials: Experience Certificate + LOR + Completion Letter
🔹 Direct Pre-Placement HR Interview Calls

📲 *Apply Now (Limited Seats Per Mentor):*
https://forms.gle/sucrxqA8c7oZhnQQ7

⏳ *Early applicants receive priority technical domain allocation!*

📞 Campus Relations Desk | +91 9110406075
🌐 www.aparaitech.org
"""

    msg4_text = """🎓 Think Ahead...

3 months from now, when you sit across from technical interviewers,
what will you say?

❌ "I only watched online video tutorials"
❌ "I don't have real corporate engineering experience"
❌ "I have never deployed production systems to the cloud"

OR

✅ "I engineered and deployed 10 Live Industry Projects"
✅ "I have an official Experience Certificate & LOR from Aparaitech"
✅ "I collaborated with Senior Engineers through production Git code reviews"

🔥 *Future You Is Watching.*
The decision you make today will define your placement season!

🚀 *Aparaitech Live Project Program 2026*
🔹 10 Live Production Projects
🔹 Direct Mentorship by Senior Tech Leads
🔹 Experience Certificate + LOR + Completion Certificate
🔹 Direct HR Placement Interview Calls
🔹 Overall Performance-Based Stipend (₹8,000 – ₹15,000)

📲 *Apply Now:*
https://forms.gle/sucrxqA8c7oZhnQQ7

⏳ *Seats Capped Per Batch — Don't Miss Out.*

📞 Campus Relations Team | +91 9110406075
🌐 www.aparaitech.org
"""

    bonus_templates_text = """================================================================================
BONUS WHATSAPP GROUP TEMPLATES & BROADCAST SEQUENCES
================================================================================

TEMPLATE 1: SHORT TELEGRAM & WHATSAPP STATUS / STORY CAPTION (WITH ATTACHMENT)
--------------------------------------------------------------------------------
🔥 Don't just learn from tutorials. Build & deploy 10 live industry projects!
Aparaitech Live Project Program 2026 is officially open.
💼 Overall Performance Stipend: ₹8,000 – ₹15,000
📜 Experience Letter + LOR included.
📲 Apply Here: https://forms.gle/sucrxqA8c7oZhnQQ7
📞 Contact: +91 9110406075


TEMPLATE 2: COLLEGE GROUP ADMIN / CR (CLASS REPRESENTATIVE) ANNOUNCEMENT
--------------------------------------------------------------------------------
📢 Notice for [Branch / Year] Students:
Aparaitech Software has opened applications for the Live Project Program 2026.
Students work on 10 live projects in Web Dev, AI/ML, Data Analytics & Cloud under senior industry mentors.

Key Benefits:
- Overall Performance-Based Stipend: ₹8,000 to ₹15,000
- Official Experience Certificate + LOR for placement resumes
- Direct HR interview opportunities

Interested candidates must register using the official link below:
👉 Registration Form: https://forms.gle/sucrxqA8c7oZhnQQ7
(Limited seats per batch)


TEMPLATE 3: 24-HOUR DEADLINE REMINDER
--------------------------------------------------------------------------------
🚨 FINAL CALL: Applications for Aparaitech Live Project Program 2026 close soon!
Don't miss the chance to build 10 live projects and earn an overall performance stipend of ₹8,000–₹15,000.
👉 Apply before slots fill up: https://forms.gle/sucrxqA8c7oZhnQQ7
Helpline: +91 9110406075
"""

    with open(os.path.join(msg_dir, "01_reality_check_whatsapp.txt"), "w", encoding="utf-8") as f:
        f.write(msg1_text)

    with open(os.path.join(msg_dir, "02_what_recruiters_want_whatsapp.txt"), "w", encoding="utf-8") as f:
        f.write(msg2_text)

    with open(os.path.join(msg_dir, "03_friend_already_started_whatsapp.txt"), "w", encoding="utf-8") as f:
        f.write(msg3_text)

    with open(os.path.join(msg_dir, "04_future_you_whatsapp.txt"), "w", encoding="utf-8") as f:
        f.write(msg4_text)

    with open(os.path.join(msg_dir, "bonus_quick_templates.txt"), "w", encoding="utf-8") as f:
        f.write(bonus_templates_text)

    # =========================================================================
    # CREATE CAMPAIGN HUB HTML (BROWSER PREVIEW & ONE-CLICK COPY)
    # =========================================================================
    hub_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech WhatsApp Group Content Hub 2026</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0F172A;
      color: #F8FAFC;
      padding: 30px 40px;
      line-height: 1.5;
    }}
    .header {{
      background: #1E293B;
      padding: 24px 32px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }}
    .header h1 {{
      font-size: 26px;
      font-weight: 900;
      color: #38BDF8;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .header p {{
      color: #94A3B8;
      font-size: 14px;
      margin-top: 4px;
    }}
    .badge-info {{
      background: #0284C7;
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 13px;
    }}

    .grid-container {{
      display: flex;
      flex-direction: column;
      gap: 35px;
    }}

    .content-card {{
      background: #1E293B;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      display: grid;
      grid-template-columns: 480px 1fr;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }}

    .image-preview-pane {{
      background: #0B1325;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }}
    .image-preview-pane img {{
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    }}
    .img-meta {{
      margin-top: 12px;
      font-size: 12px;
      color: #94A3B8;
      font-weight: 600;
    }}

    .copy-pane {{
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .piece-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }}
    .piece-title {{
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .piece-theme {{
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .theme-urgency {{ background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid #EF4444; }}
    .theme-logic {{ background: rgba(2, 132, 199, 0.2); color: #38BDF8; border: 1px solid #0284C7; }}
    .theme-fomo {{ background: rgba(245, 158, 11, 0.2); color: #FBBF24; border: 1px solid #F59E0B; }}
    .theme-aspiration {{ background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid #10B981; }}

    .message-box {{
      background: #0B1325;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 16px 20px;
      color: #E2E8F0;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      font-family: monospace;
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 18px;
    }}

    .action-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .copy-btn {{
      background: #0284C7;
      color: #FFFFFF;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }}
    .copy-btn:hover {{
      background: #0369A1;
    }}
    .tip-text {{
      font-size: 12px;
      color: #94A3B8;
      font-style: italic;
    }}
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>Aparaitech Live Project Program 2026 • WhatsApp Campaign Kit</h1>
      <p>Ready-to-use visuals & captions for student WhatsApp groups, CR channels & Telegram broadcasts.</p>
    </div>
    <div class="badge-info">4 Content Pieces + Images Ready</div>
  </div>

  <div class="grid-container">

    <!-- PIECE 1 -->
    <div class="content-card">
      <div class="image-preview-pane">
        <img src="images/01_reality_check.png" alt="Reality Check" />
        <div class="img-meta">Resolution: 1080x1080 • File: images/01_reality_check.png</div>
      </div>
      <div class="copy-pane">
        <div>
          <div class="piece-header">
            <div>
              <div class="piece-title">Piece 1: "The Reality Check"</div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 2px;">Same 3 Months. Different Future.</div>
            </div>
            <span class="piece-theme theme-urgency">Urgency + Emotion</span>
          </div>
          <div class="message-box" id="msg1">{msg1_text.strip()}</div>
        </div>
        <div class="action-row">
          <span class="tip-text">Best for: 1st broadcast in morning (9:00 AM - 11:30 AM)</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('msg1').innerText); alert('Caption Copied to Clipboard!');">
            Copy WhatsApp Caption
          </button>
        </div>
      </div>
    </div>

    <!-- PIECE 2 -->
    <div class="content-card">
      <div class="image-preview-pane">
        <img src="images/02_what_recruiters_want.png" alt="What Recruiters Want" />
        <div class="img-meta">Resolution: 1080x1080 • File: images/02_what_recruiters_want.png</div>
      </div>
      <div class="copy-pane">
        <div>
          <div class="piece-header">
            <div>
              <div class="piece-title">Piece 2: "What Recruiters Actually Want"</div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 2px;">Logic, Resume Expectations & Proof of Work</div>
            </div>
            <span class="piece-theme theme-logic">Logic + Industry Standard</span>
          </div>
          <div class="message-box" id="msg2">{msg2_text.strip()}</div>
        </div>
        <div class="action-row">
          <span class="tip-text">Best for: Follow-up 24 hours later (2:00 PM - 5:00 PM)</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('msg2').innerText); alert('Caption Copied to Clipboard!');">
            Copy WhatsApp Caption
          </button>
        </div>
      </div>
    </div>

    <!-- PIECE 3 -->
    <div class="content-card">
      <div class="image-preview-pane">
        <img src="images/03_friend_already_started.png" alt="WhatsApp Chat FOMO" />
        <div class="img-meta">Resolution: 1080x1080 • File: images/03_friend_already_started.png</div>
      </div>
      <div class="copy-pane">
        <div>
          <div class="piece-header">
            <div>
              <div class="piece-title">Piece 3: "Your Friend Already Started"</div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 2px;">WhatsApp Chat Mockup • Peer Proof & Stipend</div>
            </div>
            <span class="piece-theme theme-fomo">FOMO + Social Proof</span>
          </div>
          <div class="message-box" id="msg3">{msg3_text.strip()}</div>
        </div>
        <div class="action-row">
          <span class="tip-text">Best for: Mid-campaign trigger (7:00 PM - 9:30 PM peak student time)</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('msg3').innerText); alert('Caption Copied to Clipboard!');">
            Copy WhatsApp Caption
          </button>
        </div>
      </div>
    </div>

    <!-- PIECE 4 -->
    <div class="content-card">
      <div class="image-preview-pane">
        <img src="images/04_future_you.png" alt="Future You" />
        <div class="img-meta">Resolution: 1080x1080 • File: images/04_future_you.png</div>
      </div>
      <div class="copy-pane">
        <div>
          <div class="piece-header">
            <div>
              <div class="piece-title">Piece 4: "Future You Will Thank You"</div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 2px;">Aspiration, Long-Term Career Vision & Interview Day</div>
            </div>
            <span class="piece-theme theme-aspiration">Aspiration + Final Push</span>
          </div>
          <div class="message-box" id="msg4">{msg4_text.strip()}</div>
        </div>
        <div class="action-row">
          <span class="tip-text">Best for: Final deadline push before batch closure</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('msg4').innerText); alert('Caption Copied to Clipboard!');">
            Copy WhatsApp Caption
          </button>
        </div>
      </div>
    </div>

    <!-- PIECE 5 (BONUS) -->
    <div class="content-card">
      <div class="image-preview-pane">
        <img src="images/05_sample_certificate.png" alt="Sample Certificate" />
        <div class="img-meta">Resolution: 1080x1080 • File: images/05_sample_certificate.png</div>
      </div>
      <div class="copy-pane">
        <div>
          <div class="piece-header">
            <div>
              <div class="piece-title">Bonus Asset: Sample Certificate of Apprenticeship</div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 2px;">Visual Social Proof of Official Credential</div>
            </div>
            <span class="piece-theme theme-logic">Trust & Proof</span>
          </div>
          <div class="message-box" id="msg5">{bonus_templates_text.strip()}</div>
        </div>
        <div class="action-row">
          <span class="tip-text">Attach to WhatsApp broadcast to show exactly what students earn!</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('msg5').innerText); alert('Bonus Templates Copied!');">
            Copy Bonus Templates
          </button>
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""

    hub_file = os.path.join(content_dir, "campaign_hub.html")
    with open(hub_file, "w", encoding="utf-8") as f:
        f.write(hub_html)

    # =========================================================================
    # CREATE README.MD IN CONTENT FOLDER
    # =========================================================================
    readme_md = f"""# Aparaitech Live Project Program 2026 — WhatsApp Campaign Kit

Welcome to the **WhatsApp Outreach & Student Conversion Kit** for the **Aparaitech Live Project Program 2026**.

This folder contains high-converting, psychologically tested visuals and copy designed specifically for student WhatsApp groups, Telegram channels, CR announcements, and campus ambassador outreach.

---

## Folder Structure

```text
content/
├── images/                               # High-Resolution (1080x1080) Creatives
│   ├── 01_reality_check.png              # Piece 1: Side-by-side contrast (Tutorials vs Real Work)
│   ├── 02_what_recruiters_want.png       # Piece 2: Comparison card (CGPA vs Real Deployed Projects)
│   ├── 03_friend_already_started.png     # Piece 3: WhatsApp Chat UI Mockup (Peer proof & FOMO)
│   ├── 04_future_you.png                 # Piece 4: Aspirational vision (Future You is Watching)
│   └── 05_sample_certificate.png         # Bonus: Official Certificate Sample Mockup
├── whatsapp_messages/                    # Ready-to-Copy WhatsApp Captions (.txt)
│   ├── 01_reality_check_whatsapp.txt
│   ├── 02_what_recruiters_want_whatsapp.txt
│   ├── 03_friend_already_started_whatsapp.txt
│   ├── 04_future_you_whatsapp.txt
│   └── bonus_quick_templates.txt
├── html_templates/                       # Source HTML templates for the visuals
│   ├── card_1_reality_check.html
│   ├── card_2_recruiters_demand.html
│   ├── card_3_whatsapp_fomo.html
│   ├── card_4_future_you.html
│   └── card_5_certificate_sample.html
├── campaign_hub.html                     # Interactive Campaign Dashboard (Preview & One-Click Copy)
└── README.md                             # Campaign Master Playbook
```

---

## 4 Content Pieces Summary & Schedule

| # | Piece Name | Core Emotion | Best Posting Time | Attached Image |
|---|---|---|---|---|
| **1** | **The Reality Check** | Urgency + Emotional Reality | Day 1 (Morning: 9:30 AM - 11:30 AM) | `images/01_reality_check.png` |
| **2** | **What Recruiters Actually Want** | Logic + Fear of Rejection | Day 2 (Afternoon: 2:00 PM - 4:30 PM) | `images/02_what_recruiters_want.png` |
| **3** | **Your Friend Already Started** | Social Proof + FOMO | Day 3 (Evening Peak: 7:00 PM - 9:30 PM) | `images/03_friend_already_started.png` |
| **4** | **Future You Will Thank You** | Aspiration + Long-Term ROI | Day 4 (Final Push / Weekend) | `images/04_future_you.png` |
| **+** | **Certificate Sample** | Social Proof & Trust | During inquiry follow-ups | `images/05_sample_certificate.png` |

---

## How to Post on WhatsApp Groups (Best Practice)

1. **Always Attach the Image First:** Open WhatsApp, select the image from `content/images/`.
2. **Add the Caption Directly Under the Image:** Do NOT send text as a separate message! Paste the corresponding text from `content/whatsapp_messages/` into the photo caption box. This ensures students see the text and image together when scrolling.
3. **Verify Links:** Check that the registration link (`https://forms.gle/sucrxqA8c7oZhnQQ7`) is clickable.
4. **Interactive Dashboard:** You can also open `content/campaign_hub.html` in your web browser to preview all cards and copy any caption with one click.

---

## Key Rules & Compliance
- **Stipend Clarification:** Overall Performance-Based Stipend of ₹8,000 to ₹15,000 (strictly overall tenure, not monthly).
- **No Changes to Official Dossier PDF:** The institutional reference document remains untouched as per instructions.
"""

    with open(os.path.join(content_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_md)

    print("ALL CONTENT PIECES, IMAGES, TEXTS, AND DASHBOARD GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    generate_content_campaign()
