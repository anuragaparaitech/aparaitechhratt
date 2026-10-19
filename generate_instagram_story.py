import os
import base64
import subprocess

def build_instagram_story():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "working_qr.png")

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    redirect_url = "https://forms.gle/sucrxqA8c7oZhnQQ7"

    story_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Live Project Program 2026 - Instagram Story</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
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
      background: #060B18;
      color: #ffffff;
      position: relative;
    }}

    /* Cyber Glow Background */
    .bg-gradient {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 80% 12%, rgba(13, 148, 136, 0.42) 0%, transparent 55%),
                  radial-gradient(circle at 20% 75%, rgba(37, 99, 235, 0.32) 0%, transparent 55%),
                  radial-gradient(circle at 85% 90%, rgba(245, 158, 11, 0.22) 0%, transparent 50%),
                  linear-gradient(180deg, #060B18 0%, #0A1428 50%, #040814 100%);
      z-index: 1;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: 44px 44px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      z-index: 2;
    }}

    /* Safe-zone padded container for Instagram Stories */
    .story-container {{
      position: relative;
      z-index: 10;
      width: 1080px;
      height: 1920px;
      padding: 120px 60px 140px 60px; /* Safe padding for Instagram UI bars */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
    }}

    /* Top Brand Bar */
    .brand-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 40px;
      padding: 14px 28px;
      backdrop-filter: blur(12px);
    }}
    .brand-left {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .brand-logo-img {{
      width: 58px;
      height: 58px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(13, 148, 136, 0.5));
    }}
    .brand-titles {{
      text-align: left;
    }}
    .brand-name {{
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }}
    .brand-tag {{
      font-size: 12px;
      font-weight: 700;
      color: #2DD4BF;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }}
    .badge-live {{
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 0 20px rgba(13, 148, 136, 0.4);
    }}

    /* Main Hero Block */
    .hero-center {{
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
    }}
    .program-pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(45, 212, 191, 0.15);
      border: 1.5px solid rgba(45, 212, 191, 0.4);
      color: #5EEAD4;
      padding: 8px 24px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }}
    .headline-main {{
      font-size: 64px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.08;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      background: linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .headline-main span {{
      background: linear-gradient(90deg, #2DD4BF 0%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    /* Glowing Stipend Callout */
    .stipend-glow-box {{
      width: 100%;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(13, 148, 136, 0.25) 100%);
      border: 2px solid #F59E0B;
      border-radius: 24px;
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22px;
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.25);
    }}
    .stipend-glow-left {{
      text-align: left;
    }}
    .stipend-small {{
      font-size: 13px;
      font-weight: 800;
      color: #FDE68A;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}
    .stipend-amount {{
      font-size: 38px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #FBBF24;
      line-height: 1.1;
    }}
    .stipend-badge-right {{
      background: #F59E0B;
      color: #0F172A;
      font-size: 14px;
      font-weight: 900;
      padding: 8px 18px;
      border-radius: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    /* 4 Feature Highlights Grid */
    .features-row {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      width: 100%;
      margin-bottom: 20px;
    }}
    .feature-item {{
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-align: left;
    }}
    .feature-icon {{
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
    .feature-item h4 {{
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }}
    .feature-item p {{
      font-size: 12px;
      color: #94A3B8;
      margin-top: 2px;
    }}

    /* Domains Pill Strip */
    .domain-strip {{
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      width: 100%;
      margin-bottom: 24px;
    }}
    .domain-tag {{
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      color: #E2E8F0;
    }}

    /* Instagram "Link Sticker" Mockup */
    .link-sticker-wrap {{
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }}
    .ig-link-sticker {{
      background: #FFFFFF;
      color: #0F172A;
      padding: 14px 28px;
      border-radius: 30px;
      font-size: 17px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.2s;
    }}
    .ig-link-sticker:hover {{
      transform: scale(1.03);
    }}
    .ig-sticker-icon {{
      font-size: 20px;
    }}
    .ig-sticker-url {{
      color: #0284C7;
      letter-spacing: 0.02em;
    }}

    /* QR Code Hero Section */
    .qr-hero-card {{
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.3) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 2px solid #2DD4BF;
      border-radius: 28px;
      padding: 24px 36px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      box-shadow: 0 15px 40px rgba(13, 148, 136, 0.25);
      cursor: pointer;
      text-decoration: none;
    }}
    .qr-text-side {{
      text-align: left;
    }}
    .qr-title {{
      font-size: 26px;
      font-weight: 900;
      color: #FFFFFF;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 6px;
    }}
    .qr-desc {{
      font-size: 14px;
      color: #CBD5E1;
      line-height: 1.4;
      margin-bottom: 12px;
    }}
    .direct-link-btn {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0D9488;
      color: #FFFFFF;
      padding: 10px 22px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
    }}
    .qr-frame {{
      background: #FFFFFF;
      padding: 14px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .qr-image {{
      width: 160px;
      height: 160px;
      object-fit: contain;
    }}
    .qr-scan-label {{
      font-size: 12px;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 8px;
    }}

    /* Bottom Trust & Helpline */
    .story-footer {{
      width: 100%;
      margin-top: 14px;
    }}
    .footer-trust {{
      font-size: 13.5px;
      color: #94A3B8;
      font-weight: 600;
      margin-bottom: 6px;
    }}
    .footer-trust strong {{
      color: #38BDF8;
    }}
    .footer-helpline {{
      font-size: 13px;
      color: #5EEAD4;
      font-weight: 700;
      display: flex;
      justify-content: center;
      gap: 20px;
    }}
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="bg-grid"></div>

  <div class="story-container">
    <!-- Top Brand Bar -->
    <div class="brand-header">
      <div class="brand-left">
        <img class="brand-logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-titles">
          <div class="brand-name">APARAITECH SOFTWARE</div>
          <div class="brand-tag">Industry Engineering Labs</div>
        </div>
      </div>
      <div class="badge-live">
        BATCH 2026
      </div>
    </div>

    <!-- Center Hero -->
    <div class="hero-center">
      <div class="program-pill">
        🚀 3-Month Live Industry Program
      </div>
      <h1 class="headline-main">
        Gain Real IT Experience<br>
        <span>Before Graduation!</span>
      </h1>
      <p style="font-size: 19px; color: #CBD5E1; max-width: 860px; margin-bottom: 18px; line-height: 1.4;">
        Tired of learning only from tutorials? Build and deploy <strong>10 live industry projects</strong> under senior software engineers.
      </p>

      <!-- Glowing Stipend Box -->
      <div class="stipend-glow-box">
        <div class="stipend-glow-left">
          <div class="stipend-small">Performance-Based Reward</div>
          <div class="stipend-amount">₹8,000 – ₹15,000 / MO.</div>
        </div>
        <div class="stipend-badge-right">
          💰 Monthly Stipend
        </div>
      </div>

      <!-- 4 Core Pillars -->
      <div class="features-row">
        <div class="feature-item">
          <div class="feature-icon">💻</div>
          <div>
            <h4>10 Live Projects</h4>
            <p>Production deployments</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📜</div>
          <div>
            <h4>3 Industry Docs</h4>
            <p>Experience + LOR + Cert</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">👨‍💻</div>
          <div>
            <h4>1:1 Mentorship</h4>
            <p>Senior engineer code reviews</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💼</div>
          <div>
            <h4>Pre-Placement</h4>
            <p>Direct HR interview calls</p>
          </div>
        </div>
      </div>

      <!-- Tech Tracks -->
      <div class="domain-strip">
        <div class="domain-tag">💻 Full-Stack Web</div>
        <div class="domain-tag">🤖 AI / Machine Learning</div>
        <div class="domain-tag">📊 Data Analytics</div>
        <div class="domain-tag">☕ Java Systems</div>
        <div class="domain-tag">☁️ Cloud / DevOps</div>
      </div>
    </div>

    <!-- Instagram Link Sticker Mockup (Clickable redirect) -->
    <div class="link-sticker-wrap">
      <a href="{redirect_url}" target="_blank" class="ig-link-sticker">
        <span class="ig-sticker-icon">🔗</span>
        <span>Tap to Apply: <strong class="ig-sticker-url">forms.gle/sucrxqA8c7oZhnQQ7</strong></span>
        <span>↗</span>
      </a>
    </div>

    <!-- QR Code Scan Hero Box (Also Clickable) -->
    <a href="{redirect_url}" target="_blank" class="qr-hero-card">
      <div class="qr-text-side">
        <div class="qr-title">Scan or Tap to Register!</div>
        <div class="qr-desc">
          Open your phone camera to scan the QR code, or tap anywhere on this card to open the form directly.
        </div>
        <div class="direct-link-btn">
          <span>Apply Online (Google Form)</span>
          <span>➔</span>
        </div>
      </div>

      <div class="qr-frame">
        <img class="qr-image" src="data:image/png;base64,{qr_b64}" alt="Verified Registration QR" />
        <div class="qr-scan-label">Scan to Apply</div>
      </div>
    </a>

    <!-- Footer Trust Mark -->
    <div class="story-footer">
      <div class="footer-trust">
        🏛️ Trusted by students from: <strong>SPCOET • Vidya Pratishthan's COE • DHB Soni College & 20+ Colleges</strong>
      </div>
      <div class="footer-helpline">
        <span>📞 +91 9110406075</span>
        <span>🌐 www.aparaitech.org</span>
        <span>🇯🇵 🤝 🇮🇳 Global Partner: Embarc.Inc</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

    story_html_file = os.path.join(base_dir, "aparaitech_instagram_story.html")
    with open(story_html_file, "w", encoding="utf-8") as f:
        f.write(story_html)
    print(f"Instagram Story HTML template created: {story_html_file}")

    # Compile 1080x1920 Instagram Story Image via Chrome
    story_img_file = os.path.join(base_dir, "Aparaitech_Instagram_Story_Template.png")
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1920",
        "--force-device-scale-factor=1",
        f"--screenshot={story_img_file}",
        story_html_file
    ]

    print("Rendering high-res Instagram Story Template...")
    subprocess.run(chrome_cmd, capture_output=True, text=True)
    print(f"SUCCESS: Instagram Story Image created at: {story_img_file} (Size: {os.path.getsize(story_img_file)} bytes)")

if __name__ == "__main__":
    build_instagram_story()
