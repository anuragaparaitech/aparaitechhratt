import os
import base64
import subprocess

def build_corporate_posters():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "working_qr.png")
    photo_path = os.path.join(base_dir, "assets", "developer_collaboration.jpg")

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(photo_path, "rb") as f:
        photo_b64 = base64.b64encode(f.read()).decode("utf-8")

    redirect_url = "https://forms.gle/sucrxqA8c7oZhnQQ7"

    # =========================================================================
    # 1. 3:4 RATIO CORPORATE POSTER (NO "WE ARE HIRING")
    # Dimensions: 1080 x 1440
    # =========================================================================
    poster_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Live Project Program 2026 - Corporate Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    body {{
      width: 1080px;
      height: 1440px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: linear-gradient(180deg, #DCEBFA 0%, #EBF4FC 28%, #F7FAFD 60%, #FFFFFF 100%);
      color: #0F172A;
      position: relative;
    }}

    .container {{
      width: 1080px;
      height: 1440px;
      padding: 50px 64px 44px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }}

    /* Top Header Bar */
    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }}
    .brand-left {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .brand-logo-img {{
      width: 48px;
      height: 48px;
      object-fit: contain;
    }}
    .brand-name-txt {{
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #0D9488;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .brand-name-txt span {{
      color: #0B2545;
    }}
    .header-right {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .brand-badge {{
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0D9488;
      text-transform: uppercase;
      background: rgba(13, 148, 136, 0.12);
      border: 1px solid rgba(13, 148, 136, 0.3);
      padding: 6px 16px;
      border-radius: 20px;
    }}

    /* Big Headline */
    .headline-section {{
      margin-bottom: 22px;
    }}
    .main-hiring-title {{
      font-size: 66px;
      font-weight: 900;
      color: #0B2545;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.01em;
      line-height: 1;
      margin-bottom: 12px;
      text-transform: uppercase;
    }}
    .accent-bar {{
      width: 100%;
      height: 3.5px;
      background: linear-gradient(90deg, #0284C7 0%, #0D9488 50%, rgba(13, 148, 136, 0.1) 100%);
      margin-bottom: 14px;
    }}
    .sub-invite {{
      font-size: 22px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }}
    .role-title {{
      font-size: 26px;
      font-weight: 800;
      color: #0369A1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .role-motto {{
      font-size: 17px;
      font-weight: 600;
      color: #475569;
    }}

    /* Specs Quick Bar */
    .specs-bar {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #BAE6FD;
      border-radius: 14px;
      padding: 14px 20px;
      margin-bottom: 22px;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.06);
    }}
    .spec-item {{
      border-left: 3px solid #0284C7;
      padding-left: 12px;
    }}
    .spec-item:first-child {{
      border-left: 3px solid #0D9488;
    }}
    .spec-label {{
      font-size: 13px;
      font-weight: 900;
      color: #0B2545;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }}
    .spec-val {{
      font-size: 17px;
      font-weight: 800;
      color: #0284C7;
      line-height: 1.15;
    }}
    .spec-val.gold {{
      color: #D97706;
    }}
    .spec-sub {{
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }}

    /* Middle Layout: Eligibility + Photo */
    .middle-section {{
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 28px;
      align-items: center;
      margin-bottom: 26px;
    }}
    .eligibility-box h3 {{
      font-size: 22px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }}
    .bullet-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}
    .bullet-item {{
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14.5px;
      line-height: 1.45;
      color: #334155;
    }}
    .bullet-dot {{
      width: 7px;
      height: 7px;
      background: #0284C7;
      border-radius: 50%;
      margin-top: 7px;
      flex-shrink: 0;
    }}
    .bullet-item strong {{
      color: #0F172A;
    }}

    /* Photo Frame */
    .photo-container {{
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(11, 37, 69, 0.15);
      border: 4px solid #FFFFFF;
      height: 380px;
      background: #E2E8F0;
    }}
    .photo-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
    }}

    /* Bottom Row: Why Join Us + Apply QR */
    .bottom-section {{
      display: grid;
      grid-template-columns: 1fr 240px;
      gap: 36px;
      align-items: center;
      padding-top: 22px;
      border-top: 2px solid #E2E8F0;
    }}
    .why-block h3 {{
      font-size: 24px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }}
    .why-tags {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
    }}
    .why-tag-item {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: #1E293B;
    }}
    .why-bullet {{
      font-size: 18px;
      color: #0D9488;
    }}
    .partner-note {{
      margin-top: 14px;
      font-size: 12.5px;
      font-weight: 700;
      color: #64748B;
    }}
    .partner-note span {{
      color: #0284C7;
    }}

    /* QR Code Side */
    .qr-block {{
      border-left: 2px solid #E2E8F0;
      padding-left: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }}
    .qr-header {{
      font-size: 14px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }}
    .qr-card-link {{
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .qr-img-tag {{
      width: 140px;
      height: 140px;
      padding: 6px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      cursor: pointer;
    }}
    .last-date-badge {{
      margin-top: 10px;
      font-size: 13px;
      font-weight: 800;
      color: #0B2545;
      line-height: 1.25;
    }}
    .last-date-badge span {{
      color: #D97706;
      display: block;
      font-size: 12px;
    }}
  </style>
</head>
<body>

  <div class="container">
    <!-- Header -->
    <div class="header-bar">
      <div class="brand-left">
        <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-name-txt">APARAITECH <span>SOFTWARE</span></div>
      </div>
      <div class="header-right">
        <div class="brand-badge">⚡ BATCH 2026</div>
      </div>
    </div>

    <!-- Main Headline Block (No "We Are Hiring") -->
    <div class="headline-section">
      <h1 class="main-hiring-title">APPLICATIONS OPEN</h1>
      <div class="accent-bar"></div>
      <div class="sub-invite">LIVE PROJECT PROGRAM 2026</div>
      <div class="role-title">GRADUATE & STUDENT PROJECT TRAINEE</div>
      <div class="role-motto">Build your career. Build live industry solutions with us!</div>
    </div>

    <!-- Specs Bar -->
    <div class="specs-bar">
      <div class="spec-item">
        <div class="spec-label">STIPEND</div>
        <div class="spec-val gold">₹8K – ₹15K</div>
        <div class="spec-sub">per month (performance)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">DURATION</div>
        <div class="spec-val">3 MONTHS</div>
        <div class="spec-sub">Live agile sprints</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">PROJECTS</div>
        <div class="spec-val">10 LIVE</div>
        <div class="spec-sub">Production deployments</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">ROLE</div>
        <div class="spec-val" style="color: #0D9488;">TRAINEE</div>
        <div class="spec-sub">Junior software eng.</div>
      </div>
    </div>

    <!-- Middle Section: Eligibility + Photo -->
    <div class="middle-section">
      <div class="eligibility-box">
        <h3>ELIGIBILITY CRITERIA</h3>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-dot"></span>
            <div><strong>BE / B.Tech / BCA / MCA / B.Sc</strong>, Graduating batches from 2024, 2025 & 2026 (1st Year to Final Year students eligible)</div>
          </li>
          <li class="bullet-item">
            <span class="bullet-dot"></span>
            <div>Passion for software development, coding fundamentals, and building scalable tech products.</div>
          </li>
          <li class="bullet-item">
            <span class="bullet-dot"></span>
            <div>Candidates with interest or specialization in: <strong>Web Development, Artificial Intelligence, Machine Learning, Data Analytics, Java Systems, Cloud Computing & DevOps</strong>.</div>
          </li>
        </ul>
      </div>

      <div class="photo-container">
        <img class="photo-img" src="data:image/jpeg;base64,{photo_b64}" alt="Team Collaboration" />
      </div>
    </div>

    <!-- Bottom Section: Why Join Us + Apply QR -->
    <div class="bottom-section">
      <div class="why-block">
        <h3>WHY JOIN US?</h3>
        <div class="why-tags">
          <div class="why-tag-item"><span class="why-bullet">•</span> Hands-on Live Projects (10 Apps)</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Learn from Senior Industry Engineers</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Verified Experience Letter & LOR</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Pre-Placement & Direct HR Calls</div>
        </div>
        <div class="partner-note">
          Global Partner: <span>Embarc.Inc (Japan-India 🇯🇵 🤝 🇮🇳)</span> • Trusted by 20+ Engineering Colleges
        </div>
      </div>

      <div class="qr-block">
        <div class="qr-header">APPLY HERE</div>
        <a href="{redirect_url}" target="_blank" class="qr-card-link">
          <img class="qr-img-tag" src="data:image/png;base64,{qr_b64}" alt="Scan to Apply QR" />
        </a>
        <div class="last-date-badge">
          Admissions Open
          <span>Limited Seats • Batch 2026</span>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
"""

    poster_file = os.path.join(base_dir, "aparaitech_hiring_poster.html")
    with open(poster_file, "w", encoding="utf-8") as f:
        f.write(poster_html)

    # =========================================================================
    # 2. 9:16 INSTAGRAM STORY FORMAT (NO "WE ARE HIRING")
    # Dimensions: 1080 x 1920
    # =========================================================================
    story_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Live Project Program 2026 - Corporate Story</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    body {{
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: linear-gradient(180deg, #DCEBFA 0%, #EBF4FC 25%, #F7FAFD 60%, #FFFFFF 100%);
      color: #0F172A;
      position: relative;
    }}

    .container {{
      width: 1080px;
      height: 1920px;
      padding: 100px 70px 120px 70px; /* Safe padding for Instagram bars */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }}

    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }}
    .brand-left {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .brand-logo-img {{
      width: 54px;
      height: 54px;
      object-fit: contain;
    }}
    .brand-name-txt {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #0D9488;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .brand-name-txt span {{
      color: #0B2545;
    }}
    .brand-badge {{
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0D9488;
      text-transform: uppercase;
      background: rgba(13, 148, 136, 0.12);
      border: 1px solid rgba(13, 148, 136, 0.3);
      padding: 8px 18px;
      border-radius: 20px;
    }}

    .headline-section {{
      margin-bottom: 24px;
    }}
    .main-hiring-title {{
      font-size: 74px;
      font-weight: 900;
      color: #0B2545;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.01em;
      line-height: 1;
      margin-bottom: 14px;
      text-transform: uppercase;
    }}
    .accent-bar {{
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #0284C7 0%, #0D9488 50%, rgba(13, 148, 136, 0.1) 100%);
      margin-bottom: 16px;
    }}
    .sub-invite {{
      font-size: 24px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }}
    .role-title {{
      font-size: 28px;
      font-weight: 800;
      color: #0369A1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .role-motto {{
      font-size: 19px;
      font-weight: 600;
      color: #475569;
    }}

    .specs-bar {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #BAE6FD;
      border-radius: 16px;
      padding: 16px 22px;
      margin-bottom: 28px;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.08);
    }}
    .spec-item {{
      border-left: 3px solid #0284C7;
      padding-left: 14px;
    }}
    .spec-item:first-child {{
      border-left: 3px solid #0D9488;
    }}
    .spec-label {{
      font-size: 14px;
      font-weight: 900;
      color: #0B2545;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }}
    .spec-val {{
      font-size: 19px;
      font-weight: 800;
      color: #0284C7;
      line-height: 1.15;
    }}
    .spec-val.gold {{
      color: #D97706;
    }}
    .spec-sub {{
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
    }}

    .middle-section {{
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }}
    .eligibility-box h3 {{
      font-size: 24px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }}
    .bullet-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}
    .bullet-item {{
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 16px;
      line-height: 1.45;
      color: #334155;
    }}
    .bullet-dot {{
      width: 8px;
      height: 8px;
      background: #0284C7;
      border-radius: 50%;
      margin-top: 7px;
      flex-shrink: 0;
    }}

    .photo-container {{
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(11, 37, 69, 0.15);
      border: 4px solid #FFFFFF;
      height: 480px;
      background: #E2E8F0;
    }}
    .photo-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
    }}

    .sticker-link-bar {{
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }}
    .sticker-pill {{
      background: #FFFFFF;
      color: #0F172A;
      padding: 12px 28px;
      border-radius: 30px;
      font-size: 17px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      text-decoration: none;
    }}

    .bottom-section {{
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 36px;
      align-items: center;
      padding-top: 24px;
      border-top: 2px solid #E2E8F0;
    }}
    .why-block h3 {{
      font-size: 26px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }}
    .why-tags {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
    }}
    .why-tag-item {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      color: #1E293B;
    }}
    .why-bullet {{
      font-size: 20px;
      color: #0D9488;
    }}
    .partner-note {{
      margin-top: 14px;
      font-size: 13.5px;
      font-weight: 700;
      color: #64748B;
    }}

    .qr-block {{
      border-left: 2px solid #E2E8F0;
      padding-left: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }}
    .qr-header {{
      font-size: 15px;
      font-weight: 900;
      color: #0B2545;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }}
    .qr-img-tag {{
      width: 150px;
      height: 150px;
      padding: 6px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      cursor: pointer;
    }}
    .last-date-badge {{
      margin-top: 10px;
      font-size: 14px;
      font-weight: 800;
      color: #0B2545;
    }}
    .last-date-badge span {{
      color: #D97706;
      display: block;
      font-size: 12.5px;
    }}
  </style>
</head>
<body>

  <div class="container">
    <div class="header-bar">
      <div class="brand-left">
        <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-name-txt">APARAITECH <span>SOFTWARE</span></div>
      </div>
      <div class="brand-badge">⚡ BATCH 2026</div>
    </div>

    <!-- Main Headline Block (No "We Are Hiring") -->
    <div class="headline-section">
      <h1 class="main-hiring-title">APPLICATIONS OPEN</h1>
      <div class="accent-bar"></div>
      <div class="sub-invite">LIVE PROJECT PROGRAM 2026</div>
      <div class="role-title">GRADUATE & STUDENT PROJECT TRAINEE</div>
      <div class="role-motto">Build your career. Build live industry solutions with us!</div>
    </div>

    <div class="specs-bar">
      <div class="spec-item">
        <div class="spec-label">STIPEND</div>
        <div class="spec-val gold">₹8K – ₹15K</div>
        <div class="spec-sub">per month (performance)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">DURATION</div>
        <div class="spec-val">3 MONTHS</div>
        <div class="spec-sub">Live agile sprints</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">PROJECTS</div>
        <div class="spec-val">10 LIVE</div>
        <div class="spec-sub">Production deployments</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">ROLE</div>
        <div class="spec-val" style="color: #0D9488;">TRAINEE</div>
        <div class="spec-sub">Junior software eng.</div>
      </div>
    </div>

    <div class="photo-container">
      <img class="photo-img" src="data:image/jpeg;base64,{photo_b64}" alt="Team Collaboration" />
    </div>

    <div class="middle-section">
      <div class="eligibility-box">
        <h3>ELIGIBILITY CRITERIA</h3>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-dot"></span>
            <div><strong>BE / B.Tech / BCA / MCA / B.Sc</strong>, Graduating batches from 2024, 2025 & 2026 (1st Year to Final Year students eligible)</div>
          </li>
          <li class="bullet-item">
            <span class="bullet-dot"></span>
            <div>Specialization Tracks: <strong>Web Development, AI/ML, Data Analytics, Java Systems, Cloud Computing & DevOps</strong>.</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="sticker-link-bar">
      <a href="{redirect_url}" target="_blank" class="sticker-pill">
        <span>🔗 Tap to Apply: <strong>forms.gle/sucrxqA8c7oZhnQQ7</strong></span>
        <span>↗</span>
      </a>
    </div>

    <div class="bottom-section">
      <div class="why-block">
        <h3>WHY JOIN US?</h3>
        <div class="why-tags">
          <div class="why-tag-item"><span class="why-bullet">•</span> Hands-on Live Projects</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Mentorship from Experts</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Experience Letter & LOR</div>
          <div class="why-tag-item"><span class="why-bullet">•</span> Pre-Placement HR Calls</div>
        </div>
        <div class="partner-note">
          Global Partner: Embarc.Inc (Japan-India 🇯🇵 🤝 🇮🇳) • Trusted by 20+ Colleges
        </div>
      </div>

      <div class="qr-block">
        <div class="qr-header">APPLY HERE</div>
        <a href="{redirect_url}" target="_blank">
          <img class="qr-img-tag" src="data:image/png;base64,{qr_b64}" alt="Scan to Apply QR" />
        </a>
        <div class="last-date-badge">
          Admissions Open
          <span>Limited Seats • Batch 2026</span>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
"""

    story_file = os.path.join(base_dir, "aparaitech_hiring_story.html")
    with open(story_file, "w", encoding="utf-8") as f:
        f.write(story_html)

    # Render Poster PNG
    poster_png = os.path.join(base_dir, "Aparaitech_Hiring_Style_Poster.png")
    subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1440",
        "--force-device-scale-factor=1",
        f"--screenshot={poster_png}",
        poster_file
    ], capture_output=True)
    print(f"Updated Poster created: {poster_png} (Size: {os.path.getsize(poster_png)} bytes)")

    # Render Story PNG
    story_png = os.path.join(base_dir, "Aparaitech_Hiring_Style_Story.png")
    subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1920",
        "--force-device-scale-factor=1",
        f"--screenshot={story_png}",
        story_file
    ], capture_output=True)
    print(f"Updated Story created: {story_png} (Size: {os.path.getsize(story_png)} bytes)")

if __name__ == "__main__":
    build_corporate_posters()
