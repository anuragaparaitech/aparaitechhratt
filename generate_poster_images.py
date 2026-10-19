import os
import base64
import subprocess

def build_posters():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "registration-qr.png")

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    # 1. FEED FLYER (1080 x 1350)
    feed_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Live Project Program 2026 - Student Flyer</title>
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
      height: 1350px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #070D1E;
      color: #ffffff;
      position: relative;
    }}
    .bg-gradient {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 85% 15%, rgba(13, 148, 136, 0.38) 0%, transparent 50%),
                  radial-gradient(circle at 15% 85%, rgba(37, 99, 235, 0.28) 0%, transparent 50%),
                  linear-gradient(180deg, #070D1E 0%, #0B172E 50%, #061124 100%);
      z-index: 1;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: 40px 40px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      z-index: 2;
    }}
    .container {{
      position: relative;
      z-index: 10;
      width: 1080px;
      height: 1350px;
      padding: 44px 54px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .top-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .brand-wrap {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .brand-logo {{
      width: 66px;
      height: 66px;
      object-fit: contain;
      filter: drop-shadow(0 4px 14px rgba(13, 148, 136, 0.5));
    }}
    .brand-text h2 {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .brand-text p {{
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: #2DD4BF;
      text-transform: uppercase;
      margin-top: 2px;
    }}
    .badge-open {{
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      color: #ffffff;
      padding: 9px 20px;
      border-radius: 30px;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 25px rgba(13, 148, 136, 0.45);
      border: 1px solid rgba(94, 234, 212, 0.4);
    }}
    .hero-box {{
      text-align: center;
      margin-top: 6px;
      margin-bottom: 6px;
    }}
    .stipend-pill-highlight {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.22) 0%, rgba(13, 148, 136, 0.3) 100%);
      border: 1.5px solid #F59E0B;
      color: #FDE68A;
      padding: 6px 20px;
      border-radius: 24px;
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
    }}
    .stipend-pill-highlight span.badge-num {{
      color: #FBBF24;
      font-size: 16px;
      font-weight: 900;
    }}
    .hero-title {{
      font-size: 52px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.08;
      letter-spacing: -0.02em;
      background: linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }}
    .hero-title span {{
      background: linear-gradient(90deg, #2DD4BF 0%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .hero-pitch {{
      font-size: 19px;
      color: #CBD5E1;
      font-weight: 600;
      max-width: 880px;
      margin: 0 auto;
      line-height: 1.42;
    }}
    .hero-pitch strong {{
      color: #F8FAFC;
    }}

    /* 4 Stat Cards */
    .stat-row {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 4px;
      margin-bottom: 12px;
    }}
    .stat-card {{
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 14px 10px;
      text-align: center;
      backdrop-filter: blur(10px);
    }}
    .stat-card.highlight-stipend {{
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(13, 148, 136, 0.2) 100%);
      border: 1.5px solid rgba(245, 158, 11, 0.5);
    }}
    .stat-num {{
      font-size: 32px;
      font-weight: 900;
      color: #2DD4BF;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .stat-num.gold {{
      color: #FBBF24;
    }}
    .stat-label {{
      font-size: 12.5px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 3px;
    }}
    .stat-sub {{
      font-size: 10.5px;
      color: #94A3B8;
      margin-top: 2px;
    }}

    /* Domains Bar */
    .domain-section {{
      background: rgba(13, 148, 136, 0.12);
      border: 1px solid rgba(45, 212, 191, 0.3);
      border-radius: 15px;
      padding: 12px 18px;
      margin-bottom: 12px;
    }}
    .domain-title {{
      font-size: 11.5px;
      font-weight: 800;
      color: #5EEAD4;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: center;
      margin-bottom: 8px;
    }}
    .domain-tags {{
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 9px;
    }}
    .domain-tag {{
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 5px;
    }}

    /* Benefits Grid (6 Cards) */
    .benefits-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 14px;
    }}
    .benefit-card {{
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 5px solid #0D9488;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }}
    .benefit-card.stipend-glow {{
      border-left: 5px solid #F59E0B;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);
    }}
    .benefit-icon {{
      font-size: 22px;
      background: rgba(45, 212, 191, 0.15);
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }}
    .benefit-icon.gold-icon {{
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.4);
    }}
    .benefit-info h4 {{
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 2px;
    }}
    .benefit-info h4.gold-text {{
      color: #FDE68A;
    }}
    .benefit-info p {{
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.35;
    }}

    /* Global Partner & Colleges */
    .trust-strip {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 10px 16px;
      margin-bottom: 14px;
    }}
    .trust-left {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #E2E8F0;
    }}
    .trust-left strong {{
      color: #38BDF8;
    }}
    .trust-collab {{
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.4);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 800;
      color: #93C5FD;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    /* Bottom CTA Registration Box */
    .cta-box {{
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 2px solid #2DD4BF;
      border-radius: 18px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 10px 30px rgba(13, 148, 136, 0.2);
    }}
    .cta-text h3 {{
      font-size: 22px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #FFFFFF;
      margin-bottom: 4px;
    }}
    .cta-text p {{
      font-size: 13.5px;
      color: #CBD5E1;
      margin-bottom: 8px;
    }}
    .cta-link-pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0D9488;
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 0.02em;
    }}
    .cta-contacts {{
      font-size: 11.5px;
      color: #94A3B8;
      margin-top: 6px;
      display: flex;
      gap: 14px;
    }}
    .cta-contacts span {{
      color: #5EEAD4;
      font-weight: 700;
    }}
    .qr-side {{
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #FFFFFF;
      padding: 9px 12px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }}
    .qr-img {{
      width: 100px;
      height: 100px;
      object-fit: contain;
    }}
    .qr-caption {{
      font-size: 10.5px;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 5px;
    }}
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="bg-grid"></div>

  <div class="container">
    <div class="top-bar">
      <div class="brand-wrap">
        <img class="brand-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-text">
          <h2>APARAITECH SOFTWARE</h2>
          <p>Innovation & Live Engineering Labs</p>
        </div>
      </div>
      <div class="badge-open">
        <span>⚡</span>
        <span>Admissions Open • 2026</span>
      </div>
    </div>

    <div class="hero-box">
      <div class="stipend-pill-highlight">
        <span>💰 PERFORMANCE-BASED STIPEND:</span>
        <span class="badge-num">₹8,000 – ₹15,000 / MONTH</span>
      </div>
      <h1 class="hero-title">
        Gain Real IT Experience<br>
        <span>Before You Graduate</span>
      </h1>
      <p class="hero-pitch">
        Tired of only watching tutorials? Work directly with senior software engineers, build <strong>10 production-level projects</strong>, and earn while you learn.
      </p>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-num">3 Mo.</div>
        <div class="stat-label">Duration</div>
        <div class="stat-sub">Online / Flexible Sprints</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">10 Live</div>
        <div class="stat-label">Projects</div>
        <div class="stat-sub">Full Stack & AI Systems</div>
      </div>
      <div class="stat-card highlight-stipend">
        <div class="stat-num gold">₹8K–15K</div>
        <div class="stat-label" style="color: #FDE68A;">Monthly Stipend</div>
        <div class="stat-sub" style="color: #FBBF24;">Performance-Based</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">3 Docs</div>
        <div class="stat-label">Credentials</div>
        <div class="stat-sub">Experience + LOR + Cert</div>
      </div>
    </div>

    <div class="domain-section">
      <div class="domain-title">Choose Your Technology Track</div>
      <div class="domain-tags">
        <div class="domain-tag">💻 Full-Stack Web Dev</div>
        <div class="domain-tag">🤖 AI / Machine Learning</div>
        <div class="domain-tag">📊 Data Analytics & BI</div>
        <div class="domain-tag">☕ Java Enterprise Systems</div>
        <div class="domain-tag">☁️ Cloud & DevOps</div>
      </div>
    </div>

    <div class="benefits-grid">
      <div class="benefit-card stipend-glow">
        <div class="benefit-icon gold-icon">💰</div>
        <div class="benefit-info">
          <h4 class="gold-text">₹8,000 – ₹15,000 Stipend</h4>
          <p>Performance-based monthly stipend based on project delivery, code quality & milestones.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🏢</div>
        <div class="benefit-info">
          <h4>Real Production Projects</h4>
          <p>Not simple tutorials. Build and deploy real software on live cloud architecture.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📜</div>
        <div class="benefit-info">
          <h4>3 Official Credentials</h4>
          <p>Experience Certificate, Letter of Recommendation (LOR) & Completion Certificate.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">💼</div>
        <div class="benefit-info">
          <h4>Pre-Placement Opportunities</h4>
          <p>Direct HR interview calls and consideration for full-time engineering roles.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📁</div>
        <div class="benefit-info">
          <h4>Verified GitHub Portfolio</h4>
          <p>Proof of work recruiters love. 10 production repositories on your profile.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🌏</div>
        <div class="benefit-info">
          <h4>Global Collaboration</h4>
          <p>Exposure to international projects via Embarc.Inc (Japan-India Alliance).</p>
        </div>
      </div>
    </div>

    <div class="trust-strip">
      <div class="trust-left">
        <span>🏛️ Trusted by students from:</span>
        <strong>SPCOET Baramati • Vidya Pratishthan's COE • DHB Soni College • & 20+ Colleges</strong>
      </div>
      <div class="trust-collab">
        <span>🇯🇵 🤝 🇮🇳</span>
        <span>Global Partner: Embarc.Inc</span>
      </div>
    </div>

    <div class="cta-box">
      <div class="cta-text">
        <h3>Admissions Open for 2026 Batch!</h3>
        <p>Performance-based stipend & 1:1 mentorship. Open to 1st-Final Year students & Grads.</p>
        <div class="cta-link-pill">
          <span>👉 Register: forms.gle/sucrxqA8c7oZhnQQ7</span>
        </div>
        <div class="cta-contacts">
          <div>📞 <span>+91 9110406075</span></div>
          <div>🌐 <span>www.aparaitech.org</span></div>
          <div>📧 <span>hr@info.aparaitech.org</span></div>
        </div>
      </div>

      <div class="qr-side">
        <img class="qr-img" src="data:image/png;base64,{qr_b64}" alt="QR Code" />
        <div class="qr-caption">Scan to Apply</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

    poster_html_file = os.path.join(base_dir, "aparaitech_student_poster.html")
    with open(poster_html_file, "w", encoding="utf-8") as f:
        f.write(feed_html)

    # 2. STORY FLYER (1080 x 1920)
    story_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Live Project Program 2026 - Story Flyer</title>
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
      background: #070D1E;
      color: #ffffff;
      position: relative;
    }}
    .bg-gradient {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 85% 12%, rgba(13, 148, 136, 0.4) 0%, transparent 55%),
                  radial-gradient(circle at 15% 88%, rgba(37, 99, 235, 0.3) 0%, transparent 55%),
                  linear-gradient(180deg, #070D1E 0%, #0B172E 50%, #061124 100%);
      z-index: 1;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: 40px 40px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      z-index: 2;
    }}
    .container {{
      position: relative;
      z-index: 10;
      width: 1080px;
      height: 1920px;
      padding: 60px 58px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .top-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .brand-wrap {{
      display: flex;
      align-items: center;
      gap: 18px;
    }}
    .brand-logo {{
      width: 74px;
      height: 74px;
      object-fit: contain;
      filter: drop-shadow(0 4px 14px rgba(13, 148, 136, 0.5));
    }}
    .brand-text h2 {{
      font-size: 30px;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .brand-text p {{
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: #2DD4BF;
      text-transform: uppercase;
      margin-top: 3px;
    }}
    .badge-open {{
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      color: #ffffff;
      padding: 12px 26px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 30px rgba(13, 148, 136, 0.45);
      border: 1px solid rgba(94, 234, 212, 0.4);
    }}
    .hero-box {{
      text-align: center;
      margin-top: 10px;
    }}
    .stipend-pill-highlight {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.22) 0%, rgba(13, 148, 136, 0.3) 100%);
      border: 2px solid #F59E0B;
      color: #FDE68A;
      padding: 9px 26px;
      border-radius: 30px;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 14px;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.3);
    }}
    .stipend-pill-highlight span.badge-num {{
      color: #FBBF24;
      font-size: 20px;
      font-weight: 900;
    }}
    .hero-title {{
      font-size: 64px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.08;
      letter-spacing: -0.02em;
      background: linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 14px;
    }}
    .hero-title span {{
      background: linear-gradient(90deg, #2DD4BF 0%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .hero-pitch {{
      font-size: 22px;
      color: #CBD5E1;
      font-weight: 600;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.45;
    }}
    .hero-pitch strong {{
      color: #F8FAFC;
    }}
    .stat-row {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }}
    .stat-card {{
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 18px 12px;
      text-align: center;
      backdrop-filter: blur(10px);
    }}
    .stat-card.highlight-stipend {{
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(13, 148, 136, 0.2) 100%);
      border: 1.5px solid rgba(245, 158, 11, 0.5);
    }}
    .stat-num {{
      font-size: 40px;
      font-weight: 900;
      color: #2DD4BF;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
    }}
    .stat-num.gold {{
      color: #FBBF24;
    }}
    .stat-label {{
      font-size: 13.5px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 4px;
    }}
    .stat-sub {{
      font-size: 11.5px;
      color: #94A3B8;
      margin-top: 2px;
    }}
    .domain-section {{
      background: rgba(13, 148, 136, 0.12);
      border: 1px solid rgba(45, 212, 191, 0.3);
      border-radius: 20px;
      padding: 18px 24px;
    }}
    .domain-title {{
      font-size: 14px;
      font-weight: 800;
      color: #5EEAD4;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: center;
      margin-bottom: 12px;
    }}
    .domain-tags {{
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
    }}
    .domain-tag {{
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .benefits-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }}
    .benefit-card {{
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 5px solid #0D9488;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }}
    .benefit-card.stipend-glow {{
      border-left: 5px solid #F59E0B;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%);
    }}
    .benefit-icon {{
      font-size: 26px;
      background: rgba(45, 212, 191, 0.15);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }}
    .benefit-icon.gold-icon {{
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.4);
    }}
    .benefit-info h4 {{
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 3px;
    }}
    .benefit-info h4.gold-text {{
      color: #FDE68A;
    }}
    .benefit-info p {{
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.35;
    }}
    .trust-strip {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 14px 20px;
    }}
    .trust-left {{
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #E2E8F0;
    }}
    .trust-left strong {{
      color: #38BDF8;
    }}
    .trust-collab {{
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.4);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 800;
      color: #93C5FD;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .cta-box {{
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 2px solid #2DD4BF;
      border-radius: 24px;
      padding: 24px 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 26px;
      box-shadow: 0 10px 40px rgba(13, 148, 136, 0.25);
    }}
    .cta-text h3 {{
      font-size: 26px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #FFFFFF;
      margin-bottom: 5px;
    }}
    .cta-text p {{
      font-size: 14.5px;
      color: #CBD5E1;
      margin-bottom: 10px;
    }}
    .cta-link-pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0D9488;
      color: #FFFFFF;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 15.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }}
    .cta-contacts {{
      font-size: 12.5px;
      color: #94A3B8;
      margin-top: 8px;
      display: flex;
      gap: 18px;
    }}
    .cta-contacts span {{
      color: #5EEAD4;
      font-weight: 700;
    }}
    .qr-side {{
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #FFFFFF;
      padding: 12px 16px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }}
    .qr-img {{
      width: 130px;
      height: 130px;
      object-fit: contain;
    }}
    .qr-caption {{
      font-size: 12px;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 6px;
    }}
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="bg-grid"></div>

  <div class="container">
    <div class="top-bar">
      <div class="brand-wrap">
        <img class="brand-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-text">
          <h2>APARAITECH SOFTWARE</h2>
          <p>Innovation & Live Engineering Labs</p>
        </div>
      </div>
      <div class="badge-open">
        <span>⚡</span>
        <span>Admissions Open • 2026</span>
      </div>
    </div>

    <div class="hero-box">
      <div class="stipend-pill-highlight">
        <span>💰 PERFORMANCE-BASED STIPEND:</span>
        <span class="badge-num">₹8,000 – ₹15,000 / MONTH</span>
      </div>
      <h1 class="hero-title">
        Gain Real IT Experience<br>
        <span>Before You Graduate</span>
      </h1>
      <p class="hero-pitch">
        Tired of only watching tutorials? Work directly with senior software engineers, build <strong>10 production-level projects</strong>, and earn while you learn.
      </p>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-num">3 Mo.</div>
        <div class="stat-label">Duration</div>
        <div class="stat-sub">Online / Flexible Sprints</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">10 Live</div>
        <div class="stat-label">Projects</div>
        <div class="stat-sub">Full Stack & AI Deployments</div>
      </div>
      <div class="stat-card highlight-stipend">
        <div class="stat-num gold">₹8K–15K</div>
        <div class="stat-label" style="color: #FDE68A;">Monthly Stipend</div>
        <div class="stat-sub" style="color: #FBBF24;">Performance-Based</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">3 Docs</div>
        <div class="stat-label">Credentials</div>
        <div class="stat-sub">Experience + LOR + Cert</div>
      </div>
    </div>

    <div class="domain-section">
      <div class="domain-title">Choose Your Technology Track</div>
      <div class="domain-tags">
        <div class="domain-tag">💻 Full-Stack Web Dev</div>
        <div class="domain-tag">🤖 AI / Machine Learning</div>
        <div class="domain-tag">📊 Data Analytics & BI</div>
        <div class="domain-tag">☕ Java Enterprise Systems</div>
        <div class="domain-tag">☁️ Cloud & DevOps</div>
      </div>
    </div>

    <div class="benefits-grid">
      <div class="benefit-card stipend-glow">
        <div class="benefit-icon gold-icon">💰</div>
        <div class="benefit-info">
          <h4 class="gold-text">₹8,000 – ₹15,000 Stipend</h4>
          <p>Performance-based monthly stipend based on project delivery, code quality & milestones.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🏢</div>
        <div class="benefit-info">
          <h4>Real Production Projects</h4>
          <p>Not simple tutorials. Build and deploy real software on live cloud architecture.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📜</div>
        <div class="benefit-info">
          <h4>3 Official Credentials</h4>
          <p>Experience Certificate, Letter of Recommendation (LOR) & Completion Certificate.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">💼</div>
        <div class="benefit-info">
          <h4>Pre-Placement Opportunities</h4>
          <p>Direct HR interview calls and consideration for full-time engineering roles.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📁</div>
        <div class="benefit-info">
          <h4>Verified GitHub Portfolio</h4>
          <p>Proof of work that recruiters love. 10 production repositories on your profile.</p>
        </div>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🌏</div>
        <div class="benefit-info">
          <h4>Global Collaboration</h4>
          <p>Exposure to international projects via Embarc.Inc (Japan-India Alliance).</p>
        </div>
      </div>
    </div>

    <div class="trust-strip">
      <div class="trust-left">
        <span>🏛️ Trusted by students from:</span>
        <strong>SPCOET Baramati • Vidya Pratishthan's COE • DHB Soni College • & 20+ Colleges</strong>
      </div>
      <div class="trust-collab">
        <span>🇯🇵 🤝 🇮🇳</span>
        <span>Global Partner: Embarc.Inc</span>
      </div>
    </div>

    <div class="cta-box">
      <div class="cta-text">
        <h3>Admissions Open for 2026 Batch!</h3>
        <p>Performance-based stipend & 1:1 mentorship. Open to 1st-Final Year students & Grads.</p>
        <div class="cta-link-pill">
          <span>👉 Register: forms.gle/sucrxqA8c7oZhnQQ7</span>
        </div>
        <div class="cta-contacts">
          <div>📞 <span>+91 9110406075</span></div>
          <div>🌐 <span>www.aparaitech.org</span></div>
          <div>📧 <span>hr@info.aparaitech.org</span></div>
        </div>
      </div>

      <div class="qr-side">
        <img class="qr-img" src="data:image/png;base64,{qr_b64}" alt="QR Code" />
        <div class="qr-caption">Scan to Apply</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

    story_html_file = os.path.join(base_dir, "aparaitech_story_poster.html")
    with open(story_html_file, "w", encoding="utf-8") as f:
        f.write(story_html)

    # Render Feed Flyer
    img_out_file = os.path.join(base_dir, "Aparaitech_Live_Project_2026_Flyer.png")
    subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1350",
        "--force-device-scale-factor=1",
        f"--screenshot={img_out_file}",
        poster_html_file
    ], capture_output=True)
    print(f"Feed Flyer with Stipend: {img_out_file} (Size: {os.path.getsize(img_out_file)} bytes)")

    # Render Story Flyer (9:16)
    story_out_file = os.path.join(base_dir, "Aparaitech_WhatsApp_Story_Flyer.png")
    subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1920",
        "--force-device-scale-factor=1",
        f"--screenshot={story_out_file}",
        story_html_file
    ], capture_output=True)
    print(f"Story Flyer with Stipend: {story_out_file} (Size: {os.path.getsize(story_out_file)} bytes)")

if __name__ == "__main__":
    build_posters()
