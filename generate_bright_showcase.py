import os
import base64
import subprocess
import pymupdf

def generate_bright_showcase():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    showcase_dir = os.path.join(base_dir, "collaboration_showcase")
    html_dir = os.path.join(showcase_dir, "html_templates")
    img_dir = os.path.join(showcase_dir, "images")
    pdf_dir = os.path.join(showcase_dir, "pdf")
    
    os.makedirs(html_dir, exist_ok=True)
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(pdf_dir, exist_ok=True)

    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "working_qr.png")

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

    # Crisp Vector SVG Icons & Authentic Country Flags
    icons = {
        "globe": '''<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>''',
        "handshake": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2"></path><path d="m18 10 1.7-1.7a1 1 0 0 0 0-1.4L17 4.2a1 1 0 0 0-1.4 0L14 6"></path><path d="m2 14 3.7 3.7a1 1 0 0 0 1.4 0l2.6-2.6"></path><path d="m7 9 5-5a1 1 0 0 1 1.4 0l1.9 1.9"></path><path d="M7 9 3 13"></path></svg>''',
        "brain": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"></path></svg>''',
        "cloud": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>''',
        "chart": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>''',
        "code": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>''',
        "server": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>''',
        "award": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>''',
        "rocket": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>''',
        "grad": '''<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>''',
        "check": '''<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>''',
        "check_green": '''<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>''',
        "flag_jp": '''<svg width="24" height="16" viewBox="0 0 900 600" style="border-radius:3px; vertical-align:middle; display:inline-block; border:1px solid #CBD5E1; box-shadow:0 1px 3px rgba(0,0,0,0.1);"><rect fill="#ffffff" width="900" height="600"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>''',
        "flag_in": '''<svg width="24" height="16" viewBox="0 0 900 600" style="border-radius:3px; vertical-align:middle; display:inline-block; border:1px solid #CBD5E1; box-shadow:0 1px 3px rgba(0,0,0,0.1);"><rect width="900" height="200" fill="#ff9933"/><rect y="200" width="900" height="200" fill="#ffffff"/><rect y="400" width="900" height="200" fill="#138808"/><circle cx="450" cy="300" r="80" fill="#000080"/></svg>''',
        "flag_us": '''<svg width="24" height="16" viewBox="0 0 7410 3900" style="border-radius:3px; vertical-align:middle; display:inline-block; border:1px solid #CBD5E1; box-shadow:0 1px 3px rgba(0,0,0,0.1);"><rect width="7410" height="3900" fill="#b22234"/><path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" stroke-width="300"/><rect width="2964" height="2100" fill="#3c3b6e"/></svg>''',
        "flag_kr": '''<svg width="24" height="16" viewBox="0 0 900 600" style="border-radius:3px; vertical-align:middle; display:inline-block; border:1px solid #CBD5E1; box-shadow:0 1px 3px rgba(0,0,0,0.1);"><rect width="900" height="600" fill="#ffffff"/><circle cx="450" cy="300" r="150" fill="#cd2e3a"/><path d="M300,300 A150,150 0 0,0 600,300 A75,75 0 0,1 450,300 A75,75 0 0,0 300,300 Z" fill="#0047a0"/></svg>''',
    }

    # =========================================================================
    # 1. BRIGHT A4 POSTER FORMAT (1240 x 1754 & 210mm x 297mm PDF)
    # =========================================================================
    a4_bright_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Collaborations & MNC Projects Showcase (A4 Bright)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    @page {{ size: A4 portrait; margin: 0; }}
    
    @media screen {{
      body {{
        width: 1240px;
        height: 1754px;
        max-height: 1754px;
        background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFD 40%, #EFF6FF 100%);
        font-family: 'Montserrat', sans-serif;
        color: #0F172A;
        overflow: hidden;
        position: relative;
        padding: 44px 50px 36px 50px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }}
      .hero-h1 {{ font-size: 38px; }}
      .partnership-card {{ margin-bottom: 14px; padding: 16px 24px; }}
      .domains-grid {{ margin-bottom: 14px; }}
      .colleges-box {{ margin-bottom: 12px; padding: 11px 18px; }}
      .benefits-box {{ margin-bottom: 14px; padding: 11px 18px; }}
      .footer-bar {{ padding: 12px 22px; }}
    }}

    @media print {{
      @page {{
        size: A4 portrait;
        margin: 0;
      }}
      body {{
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFD 40%, #EFF6FF 100%) !important;
        font-family: 'Montserrat', sans-serif;
        color: #0F172A !important;
        overflow: hidden !important;
        position: relative;
        padding: 9mm 12mm 7mm 12mm !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }}
      .hero-h1 {{ font-size: 30px !important; }}
      .partnership-card {{ margin-bottom: 8px !important; padding: 10px 18px !important; }}
      .domains-grid {{ margin-bottom: 8px !important; }}
      .colleges-box {{ margin-bottom: 8px !important; padding: 8px 14px !important; }}
      .benefits-box {{ margin-bottom: 8px !important; padding: 8px 14px !important; }}
      .footer-bar {{ padding: 9px 16px !important; }}
    }}

    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        radial-gradient(rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px),
        radial-gradient(rgba(212, 175, 55, 0.08) 1.5px, transparent 1.5px);
      background-size: 38px 38px, 76px 76px;
      background-position: 0 0, 19px 19px;
      opacity: 0.7;
      pointer-events: none;
      z-index: 1;
    }}
    .glow-blob-1 {{
      position: absolute;
      top: -120px; right: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%);
      pointer-events: none; z-index: 1;
    }}
    .glow-blob-2 {{
      position: absolute;
      bottom: 220px; left: -140px;
      width: 650px; height: 650px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%);
      pointer-events: none; z-index: 1;
    }}
    .content-wrap {{
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }}

    /* Header Bar */
    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.35);
    }}
    .brand-group {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .logo-img {{
      height: 58px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.12));
    }}
    .brand-title-wrap {{
      display: flex;
      flex-direction: column;
    }}
    .brand-name {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.06em;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
    }}
    .brand-tag {{
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #B45309;
    }}
    .header-badge {{
      display: flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      border: 1.5px solid #2563EB;
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 800;
      color: #1D4ED8;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
    }}

    /* Hero Section */
    .hero-title-sec {{
      text-align: center;
      margin: 12px 0 14px 0;
    }}
    .gold-pre-title {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #B45309;
      margin-bottom: 4px;
    }}
    .hero-h1 {{
      font-size: 38px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.15;
      color: #0A192F;
    }}
    .hero-h1 span {{
      background: linear-gradient(135deg, #1D4ED8 0%, #0284C7 50%, #B45309 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .hero-sub {{
      font-size: 14.5px;
      color: #475569;
      font-weight: 600;
      margin-top: 5px;
      letter-spacing: 0.01em;
    }}

    /* Global Presence Bar */
    .global-presence-bar {{
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 12px;
      padding: 9px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
    }}
    .presence-title {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }}
    .presence-countries {{
      display: flex;
      align-items: center;
      gap: 22px;
    }}
    .country-item {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
    }}

    /* Embarc.Inc Partnership Card */
    .partnership-card {{
      background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%);
      border: 2px solid #D4AF37;
      border-radius: 16px;
      padding: 16px 24px;
      box-shadow: 0 10px 28px rgba(212, 175, 55, 0.16), 0 2px 8px rgba(15, 23, 42, 0.04);
      margin-bottom: 14px;
      position: relative;
    }}
    .partnership-tag {{
      position: absolute;
      top: -12px;
      left: 24px;
      background: linear-gradient(90deg, #D4AF37, #B8860B);
      color: #0A192F;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
    }}
    .partnership-inner {{
      display: grid;
      grid-template-columns: 290px 1fr;
      gap: 22px;
      align-items: center;
    }}
    .partner-brand-box {{
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }}
    .partner-name {{
      font-size: 24px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
    }}
    .partner-desc {{
      font-size: 11.5px;
      color: #64748B;
      font-weight: 600;
    }}
    .bilateral-pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      border: 1.5px solid #93C5FD;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      color: #1D4ED8;
      margin-top: 4px;
    }}
    .partner-content-box h4 {{
      font-size: 15.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 5px;
    }}
    .partner-content-box p {{
      font-size: 12px;
      color: #334155;
      line-height: 1.45;
      margin-bottom: 10px;
    }}
    .partner-metrics {{
      display: flex;
      gap: 12px;
    }}
    .p-metric {{
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #166534;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 5px 12px;
      border-radius: 6px;
    }}

    /* MNC Projects Grid */
    .section-header-row {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
    }}
    .sec-title {{
      font-size: 16.5px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .sec-sub {{
      font-size: 11.5px;
      color: #64748B;
      font-weight: 600;
    }}
    .domains-grid {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 14px;
    }}
    .domain-card {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .domain-card.c-blue {{ border-top: 3.5px solid #2563EB; }}
    .domain-card.c-cyan {{ border-top: 3.5px solid #0284C7; }}
    .domain-card.c-purple {{ border-top: 3.5px solid #7C3AED; }}
    .domain-card.c-emerald {{ border-top: 3.5px solid #059669; }}
    .domain-card.c-gold {{ border-top: 3.5px solid #D97706; }}

    .domain-head {{
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #F1F5F9;
    }}
    .domain-icon {{
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .c-blue .domain-icon {{ background: #EFF6FF; color: #1D4ED8; }}
    .c-cyan .domain-icon {{ background: #F0F9FF; color: #0284C7; }}
    .c-purple .domain-icon {{ background: #F5F3FF; color: #7C3AED; }}
    .c-emerald .domain-icon {{ background: #ECFDF5; color: #059669; }}
    .c-gold .domain-icon {{ background: #FFFBEB; color: #D97706; }}

    .domain-title {{
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .project-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .project-item {{
      font-size: 11px;
      color: #334155;
      line-height: 1.35;
      font-weight: 600;
      position: relative;
      padding-left: 12px;
    }}
    .project-item::before {{
      content: "•";
      position: absolute;
      left: 0;
      font-size: 14px;
      font-weight: 900;
      top: -2px;
    }}
    .c-blue .project-item::before {{ color: #2563EB; }}
    .c-cyan .project-item::before {{ color: #0284C7; }}
    .c-purple .project-item::before {{ color: #7C3AED; }}
    .c-emerald .project-item::before {{ color: #059669; }}
    .c-gold .project-item::before {{ color: #D97706; }}

    /* Colleges Partner Box */
    .colleges-box {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 11px 18px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      margin-bottom: 12px;
    }}
    .college-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }}
    .col-title {{
      font-size: 13.5px;
      font-weight: 800;
      color: #0A192F;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .col-badge {{
      font-size: 11px;
      color: #1E40AF;
      font-weight: 700;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      padding: 3px 12px;
      border-radius: 20px;
    }}
    .colleges-badges-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }}
    .college-pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F0F9FF;
      border: 1px solid #BAE6FD;
      padding: 4px 12px;
      border-radius: 20px;
    }}
    .c-dot {{
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #0284C7;
    }}
    .c-name {{
      font-size: 11px;
      font-weight: 700;
      color: #0369A1;
    }}

    /* Student Benefits */
    .benefits-box {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 11px 18px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      margin-bottom: 14px;
    }}
    .benefits-title {{
      font-size: 13.5px;
      font-weight: 800;
      color: #0A192F;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }}
    .benefits-grid {{
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }}
    .benefit-item {{
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 7px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .benefit-icon {{
      width: 26px; height: 26px;
      border-radius: 6px;
      background: #EFF6FF;
      color: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .benefit-name {{
      font-size: 10.5px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.25;
    }}

    /* Footer Grounding Bar */
    .footer-bar {{
      background: #0A192F;
      border-top: 2.5px solid #D4AF37;
      border-radius: 12px;
      padding: 12px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(10, 25, 47, 0.3);
    }}
    .footer-left {{
      display: flex;
      flex-direction: column;
      gap: 3px;
    }}
    .footer-brand {{
      font-size: 15px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #38BDF8;
    }}
    .footer-motto {{
      font-size: 11px;
      color: #D4AF37;
      font-weight: 700;
      letter-spacing: 0.05em;
    }}
    .footer-center {{
      display: flex;
      gap: 20px;
      font-size: 11.5px;
      color: #CBD5E1;
      font-weight: 600;
    }}
    .footer-center strong {{
      color: #FFFFFF;
    }}
    .footer-right {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .footer-qr {{
      width: 46px;
      height: 46px;
      background: #FFFFFF;
      padding: 3px;
      border-radius: 6px;
    }}
    .footer-btn {{
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0A192F;
      font-size: 11.5px;
      font-weight: 900;
      padding: 9px 18px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }}
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="glow-blob-1"></div>
  <div class="glow-blob-2"></div>

  <div class="content-wrap">
    <div class="header-bar">
      <div class="brand-group">
        <img class="logo-img" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
        <div class="brand-title-wrap">
          <span class="brand-name">APARAITECH SOFTWARE</span>
          <span class="brand-tag">Enterprise Software • Global AI • Academic Alliances</span>
        </div>
      </div>
      <div class="header-badge">
        <span>★ Global Industry Alliances ★</span>
      </div>
    </div>

    <div class="hero-title-sec">
      <div class="gold-pre-title">
        {icons["globe"]} Global Industry Partnerships & MNC Sprints
      </div>
      <h1 class="hero-h1">Our Collaborations & <span>MNC Projects</span></h1>
      <p class="hero-sub">Building Industry-Ready Professionals Through Global Partnerships & Production Sprints</p>
    </div>

    <div class="global-presence-bar">
      <div class="presence-title">
        {icons["globe"]} <strong>Global Presence:</strong>
      </div>
      <div class="presence-countries">
        <div class="country-item">{icons["flag_in"]} <span>India</span></div>
        <div class="country-item">{icons["flag_jp"]} <span>Japan</span></div>
        <div class="country-item">{icons["flag_us"]} <span>USA</span></div>
        <div class="country-item">{icons["flag_kr"]} <span>South Korea</span></div>
      </div>
      <div style="font-size: 11px; color: #64748B; font-weight: 700;">
        International Standards & Cross-Border Delivery
      </div>
    </div>

    <div class="partnership-card">
      <div class="partnership-tag">Global Strategic Partnership</div>
      <div class="partnership-inner">
        <div class="partner-brand-box">
          <div class="partner-name">Embarc.Inc</div>
          <div class="partner-desc">Tokyo, Japan • Global Tech Strategy</div>
          <div class="bilateral-pill">
            <span>{icons["flag_jp"]} Japan</span> <span>⟷</span> <span>{icons["flag_in"]} India</span>
          </div>
        </div>
        <div class="partner-content-box">
          <h4>Bilateral Technology Alliance & Cross-Border Deployments</h4>
          <p>
            Strategic partnership for international market entry, high-scalability software solutions, and cross-border digital transformation projects. Students gain direct exposure to international enterprise development standards, bilingual technical documentation, and offshore system engineering.
          </p>
          <div class="partner-metrics">
            <div class="p-metric">{icons["check_green"]} Tokyo-Pune Engineering Bridge</div>
            <div class="p-metric">{icons["check_green"]} Enterprise Cloud Standards</div>
            <div class="p-metric">{icons["check_green"]} Cross-Border Code Reviews</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="section-header-row">
        <div class="sec-title">
          {icons["server"]} MNC-Level Projects Our Students Work On
        </div>
        <div class="sec-sub">
          Work on real projects aligned with international standards across 5 high-demand engineering tracks
        </div>
      </div>

      <div class="domains-grid">
        <div class="domain-card c-blue">
          <div class="domain-head">
            <span class="domain-icon">{icons["brain"]}</span>
            <span class="domain-title">AI/ML Engineering</span>
          </div>
          <ul class="project-list">
            <li class="project-item">Multi-Modal Conversational AI</li>
            <li class="project-item">Computer Vision Defect Detection</li>
            <li class="project-item">Predictive Analytics Forecasting</li>
            <li class="project-item">AI Automated Question Paper Gen</li>
          </ul>
        </div>

        <div class="domain-card c-cyan">
          <div class="domain-head">
            <span class="domain-icon">{icons["cloud"]}</span>
            <span class="domain-title">Cloud Computing</span>
          </div>
          <ul class="project-list">
            <li class="project-item">Multi-Region AWS Microservices</li>
            <li class="project-item">Kubernetes Cluster Autoscaling</li>
            <li class="project-item">Serverless Event-Driven Pipeline</li>
            <li class="project-item">Enterprise DevSecOps Toolchain</li>
          </ul>
        </div>

        <div class="domain-card c-purple">
          <div class="domain-head">
            <span class="domain-icon">{icons["chart"]}</span>
            <span class="domain-title">Data Analytics</span>
          </div>
          <ul class="project-list">
            <li class="project-item">Real-Time Financial Analytics</li>
            <li class="project-item">Customer Lifetime Value Engine</li>
            <li class="project-item">Big Data Lakehouse ETL</li>
            <li class="project-item">Supply Chain Decision Dashboards</li>
          </ul>
        </div>

        <div class="domain-card c-emerald">
          <div class="domain-head">
            <span class="domain-icon">{icons["code"]}</span>
            <span class="domain-title">Web Development</span>
          </div>
          <ul class="project-list">
            <li class="project-item">High-Concurrency Next.js Portal</li>
            <li class="project-item">Cloud Kitchen Real-Time Display</li>
            <li class="project-item">Micro-Frontend E-Commerce</li>
            <li class="project-item">WebSocket Collaborative Engine</li>
          </ul>
        </div>

        <div class="domain-card c-gold">
          <div class="domain-head">
            <span class="domain-icon">{icons["server"]}</span>
            <span class="domain-title">Enterprise Software</span>
          </div>
          <ul class="project-list">
            <li class="project-item">ERP Attendance & Shift Tracker</li>
            <li class="project-item">SVPM Global Alumni & Mentor Hub</li>
            <li class="project-item">High-Concurrency Test Engine</li>
            <li class="project-item">Multi-Tenant SaaS RBAC Access</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="colleges-box">
      <div class="college-header">
        <div class="col-title">
          {icons["grad"]} Trusted by Leading Engineering Colleges
        </div>
        <div class="col-badge">Academic MoUs & On-Campus Drives</div>
      </div>
      <div class="colleges-badges-row">
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">DHB Soni College, Solapur</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">SPCOET Someshwarnagar, Baramati</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">Vidya Pratishthan's COE, Baramati</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">Sharadchandra Pawar COET</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">Jaywant COE & Polytechnic, Sangli</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">Gangamai COE, Nagaon</div></div>
        <div class="college-pill"><div class="c-dot"></div><div class="c-name">SSBT's COET, Jalgaon</div></div>
      </div>
    </div>

    <div class="benefits-box">
      <div class="benefits-title">
        {icons["award"]} What Our Students Gain (The Aparaitech Advantage)
      </div>
      <div class="benefits-grid">
        <div class="benefit-item">
          <span class="benefit-icon">{icons["server"]}</span>
          <span class="benefit-name">Real MNC-Level Projects</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">{icons["globe"]}</span>
          <span class="benefit-name">Global Exposure (Japan-India)</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">{icons["award"]}</span>
          <span class="benefit-name">Industry Certifications & LOR</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">{icons["handshake"]}</span>
          <span class="benefit-name">Direct HR Interviews</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">{icons["code"]}</span>
          <span class="benefit-name">Production Git Portfolio</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">{icons["rocket"]}</span>
          <span class="benefit-name">Rapid Career Advancement</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <div class="footer-brand">APARAITECH SOFTWARE COMPANY</div>
        <div class="footer-motto">Corporate Office: Gera's Imperium Rise, Hinjewadi Phase 2, Pune • Industry-Integrated Innovation</div>
      </div>
      <div class="footer-center">
        <div><strong>Email:</strong> hr@info.aparaitech.org</div>
        <div><strong>Helpline:</strong> +91 9110406075</div>
        <div><strong>Web:</strong> www.aparaitech.org</div>
      </div>
      <div class="footer-right">
        <img class="footer-qr" src="data:image/png;base64,{qr_b64}" alt="QR" />
        <div class="footer-btn">Apply Now</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

    a4_file = os.path.join(html_dir, "showcase_a4_poster.html")
    with open(a4_file, "w", encoding="utf-8") as f:
        f.write(a4_bright_html)

    # =========================================================================
    # 2. BRIGHT INSTAGRAM POST FORMAT (1080 x 1080)
    # =========================================================================
    ig_bright_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Collaborations Showcase (Instagram 1080x1080 Bright)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1080px;
      background: linear-gradient(145deg, #FFFFFF 0%, #F5F9FF 50%, #EFF6FF 100%);
      font-family: 'Montserrat', sans-serif;
      color: #0F172A;
      overflow: hidden;
      position: relative;
      padding: 34px 38px 28px 38px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        radial-gradient(rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px),
        radial-gradient(rgba(212, 175, 55, 0.08) 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      opacity: 0.6;
      pointer-events: none;
    }}
    .content-wrap {{
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }}

    .ig-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
    }}
    .ig-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .ig-logo {{
      height: 48px;
      object-fit: contain;
    }}
    .ig-brand-name {{
      font-size: 22px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
    }}
    .ig-badge {{
      background: #EFF6FF;
      border: 1px solid #2563EB;
      color: #1D4ED8;
      font-size: 11px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .ig-hero {{
      text-align: center;
      margin: 8px 0 10px 0;
    }}
    .ig-hero-sub {{
      font-size: 11px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }}
    .ig-hero-h1 {{
      font-size: 32px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
      line-height: 1.2;
    }}
    .ig-hero-h1 span {{
      color: #2563EB;
    }}

    .ig-partner-card {{
      background: #FFFFFF;
      border: 2px solid #D4AF37;
      border-radius: 14px;
      padding: 14px 18px;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.16);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .ig-part-left h3 {{
      font-size: 19px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
    }}
    .ig-part-left p {{
      font-size: 11.5px;
      color: #475569;
      margin-top: 3px;
    }}
    .ig-part-flags {{
      display: flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      border: 1px solid #93C5FD;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      color: #1D4ED8;
    }}

    .ig-tracks-grid {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin: 8px 0;
    }}
    .ig-track-box {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 8px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }}
    .ig-track-box.tb-blue {{ border-top: 3px solid #2563EB; }}
    .ig-track-box.tb-cyan {{ border-top: 3px solid #0284C7; }}
    .ig-track-box.tb-purple {{ border-top: 3px solid #7C3AED; }}
    .ig-track-box.tb-emerald {{ border-top: 3px solid #059669; }}
    .ig-track-box.tb-gold {{ border-top: 3px solid #D97706; }}

    .tb-name {{
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 3px;
    }}
    .tb-sub {{
      font-size: 9px;
      color: #64748B;
      font-weight: 600;
    }}

    .ig-presence-row {{
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 10px;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }}
    .ig-pres-title {{
      font-size: 11px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
    }}
    .ig-pres-flags {{
      display: flex;
      gap: 16px;
      font-size: 11.5px;
      font-weight: 700;
      color: #0F172A;
      align-items: center;
    }}

    .ig-gains-row {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 8px 0;
    }}
    .ig-gain-pill {{
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 10.5px;
      font-weight: 700;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .ig-colleges-bar {{
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      color: #0369A1;
      text-align: center;
    }}

    .ig-footer {{
      background: #0A192F;
      border-radius: 10px;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
    }}
    .ig-foot-left {{
      font-size: 11.5px;
      font-weight: 800;
      color: #38BDF8;
    }}
    .ig-foot-left span {{
      display: block;
      font-size: 9.5px;
      color: #CBD5E1;
      font-weight: 500;
    }}
    .ig-foot-center {{
      font-size: 9.5px;
      color: #CBD5E1;
      text-align: center;
    }}
    .ig-foot-center strong {{
      color: #D4AF37;
    }}
    .ig-foot-right {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .ig-cta-btn {{
      background: linear-gradient(135deg, #D4AF37, #B8860B);
      color: #0A192F;
      font-size: 10.5px;
      font-weight: 900;
      padding: 7px 14px;
      border-radius: 6px;
      text-transform: uppercase;
    }}
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="content-wrap">
    <div class="ig-header">
      <div class="ig-brand">
        <img class="ig-logo" src="data:image/png;base64,{logo_b64}" alt="Logo" />
        <span class="ig-brand-name">APARAITECH SOFTWARE</span>
      </div>
      <div class="ig-badge">Global Industry Alliances</div>
    </div>

    <div class="ig-hero">
      <div class="ig-hero-sub">Japan-India Bilateral Strategic Alliance</div>
      <div class="ig-hero-h1">Collaborations & <span>MNC Projects</span></div>
    </div>

    <div class="ig-partner-card">
      <div class="ig-part-left">
        <h3>Embarc.Inc (Tokyo, Japan)</h3>
        <p>Cross-Border Market Entry & Technology Delivery</p>
      </div>
      <div class="ig-part-flags">
        {icons["flag_jp"]} <span>Japan</span> <span>⟷</span> {icons["flag_in"]} <span>India</span>
      </div>
    </div>

    <div class="ig-tracks-grid">
      <div class="ig-track-box tb-blue">
        <div class="tb-name">AI / ML</div>
        <div class="tb-sub">Vision & NLP</div>
      </div>
      <div class="ig-track-box tb-cyan">
        <div class="tb-name">Cloud Computing</div>
        <div class="tb-sub">AWS & DevSecOps</div>
      </div>
      <div class="ig-track-box tb-purple">
        <div class="tb-name">Data Analytics</div>
        <div class="tb-sub">Lakehouse ETL</div>
      </div>
      <div class="ig-track-box tb-emerald">
        <div class="tb-name">Web Dev</div>
        <div class="tb-sub">Next.js Cloud</div>
      </div>
      <div class="ig-track-box tb-gold">
        <div class="tb-name">Enterprise</div>
        <div class="tb-sub">SaaS RBAC</div>
      </div>
    </div>

    <div class="ig-presence-row">
      <div class="ig-pres-title">{icons["globe"]} Global Footprint:</div>
      <div class="ig-pres-flags">
        <span>{icons["flag_in"]} India</span>
        <span>{icons["flag_jp"]} Japan</span>
        <span>{icons["flag_us"]} USA</span>
        <span>{icons["flag_kr"]} Korea</span>
      </div>
    </div>

    <div class="ig-gains-row">
      <div class="ig-gain-pill">{icons["check_green"]} Real MNC Projects</div>
      <div class="ig-gain-pill">{icons["check_green"]} Global Japan Exposure</div>
      <div class="ig-gain-pill">{icons["check_green"]} Verified Certifications</div>
      <div class="ig-gain-pill">{icons["check_green"]} Direct HR Interviews</div>
      <div class="ig-gain-pill">{icons["check_green"]} Live Production Git</div>
      <div class="ig-gain-pill">{icons["check_green"]} High Placement Rate</div>
    </div>

    <div class="ig-colleges-bar">
      🎓 Trusted by Leading Colleges: DHB Soni • SPCOET • VPCOE • Sharadchandra Pawar COET • Jaywant Sangli • Gangamai • SSBT Jalgaon
    </div>

    <div class="ig-footer">
      <div class="ig-foot-left">
        Aparaitech Software
        <span>Corporate HQ: Hinjewadi Phase 2, Pune</span>
      </div>
      <div class="ig-foot-center">
        <strong>hr@info.aparaitech.org</strong> • +91 9110406075
      </div>
      <div class="ig-foot-right">
        <div class="ig-cta-btn">Join Program</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

    ig_file = os.path.join(html_dir, "showcase_instagram_post.html")
    with open(ig_file, "w", encoding="utf-8") as f:
        f.write(ig_bright_html)

    # =========================================================================
    # 3. BRIGHT LINKEDIN BANNER FORMAT (1584 x 396)
    # =========================================================================
    li_bright_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Collaborations Showcase (LinkedIn Banner 1584x396 Bright)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1584px;
      height: 396px;
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFD 50%, #EFF6FF 100%);
      font-family: 'Montserrat', sans-serif;
      color: #0F172A;
      overflow: hidden;
      position: relative;
      padding: 24px 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px);
      background-size: 28px 28px;
      opacity: 0.6;
      pointer-events: none;
    }}
    .container {{
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 370px 1fr 340px;
      gap: 24px;
      position: relative;
      z-index: 5;
      align-items: center;
    }}

    /* Left Column: Brand & Hero */
    .left-col {{
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-right: 1.5px solid #E2E8F0;
      padding-right: 22px;
      height: 100%;
    }}
    .brand-top {{
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }}
    .li-logo {{
      height: 42px;
      object-fit: contain;
    }}
    .brand-h2 {{
      font-size: 20px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
      letter-spacing: 0.05em;
    }}
    .li-hero-h1 {{
      font-size: 25px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.15;
      color: #0A192F;
      margin-bottom: 6px;
    }}
    .li-hero-h1 span {{
      color: #2563EB;
    }}
    .li-hero-sub {{
      font-size: 11.5px;
      color: #475569;
      line-height: 1.45;
      font-weight: 600;
    }}

    /* Center Column: Collaborations & MNC Projects */
    .center-col {{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 6px 0;
      gap: 10px;
    }}
    .li-global-partner {{
      background: #FFFFFF;
      border: 1.5px solid #D4AF37;
      border-radius: 10px;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 14px rgba(212, 175, 55, 0.12);
    }}
    .gp-left h4 {{
      font-size: 14.5px;
      font-weight: 800;
      color: #0A192F;
    }}
    .gp-left p {{
      font-size: 11px;
      color: #64748B;
    }}
    .gp-badge {{
      display: flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      border: 1px solid #93C5FD;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 800;
      color: #1D4ED8;
    }}

    /* Feature Banner Strip */
    .li-feature-strip {{
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 8px 14px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #1E40AF;
    }}
    .li-feature-strip span {{
      color: #D97706;
    }}

    .li-track-pills {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }}
    .track-pill {{
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 6px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }}
    .track-pill.tb-blue {{ border-top: 3px solid #2563EB; }}
    .track-pill.tb-cyan {{ border-top: 3px solid #0284C7; }}
    .track-pill.tb-purple {{ border-top: 3px solid #7C3AED; }}
    .track-pill.tb-emerald {{ border-top: 3px solid #059669; }}
    .track-pill.tb-gold {{ border-top: 3px solid #D97706; }}

    .tp-title {{
      font-size: 10.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }}
    .tp-desc {{
      font-size: 9px;
      color: #64748B;
    }}

    /* Right Column: Global Footprint & Contact */
    .right-col {{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      border-left: 1.5px solid #E2E8F0;
      padding-left: 22px;
      padding-top: 6px;
      padding-bottom: 6px;
    }}
    .presence-widget {{
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      padding: 8px 14px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }}
    .pw-title {{
      font-size: 10.5px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }}
    .pw-flags {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 700;
      color: #0F172A;
    }}
    .colleges-count {{
      font-size: 10.5px;
      color: #334155;
      line-height: 1.4;
      background: #F8FAFC;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }}
    .colleges-count strong {{
      color: #0284C7;
    }}
    .li-contact-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #475569;
      font-weight: 700;
    }}
    .li-contact-bar strong {{
      color: #0A192F;
    }}
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="container">
    <!-- Left -->
    <div class="left-col">
      <div class="brand-top">
        <img class="li-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech" />
        <span class="brand-h2">APARAITECH SOFTWARE</span>
      </div>
      <div class="li-hero-h1">Collaborations & <span>MNC Projects</span></div>
      <p class="li-hero-sub">
        Building Industry-Ready Professionals Through Global Strategic Alliances & Production Sprints.
      </p>
    </div>

    <!-- Center -->
    <div class="center-col">
      <div class="li-global-partner">
        <div class="gp-left">
          <h4>Embarc.Inc (Tokyo, Japan) Strategic Alliance</h4>
          <p>Cross-Border Technology Projects & Market Entry Deployments</p>
        </div>
        <div class="gp-badge">
          {icons["flag_jp"]} <span>Japan</span> <span>⟷</span> {icons["flag_in"]} <span>India</span>
        </div>
      </div>

      <div class="li-feature-strip">
        <div><span>✦</span> 10 Live Production Projects</div>
        <div><span>✦</span> Senior Tech Reviews</div>
        <div><span>✦</span> Global Tokyo Standards</div>
        <div><span>✦</span> Direct HR Placement Calls</div>
      </div>

      <div class="li-track-pills">
        <div class="track-pill tb-blue">
          <div class="tp-title">AI / ML</div>
          <div class="tp-desc">Vision & NLP</div>
        </div>
        <div class="track-pill tb-cyan">
          <div class="tp-title">Cloud Computing</div>
          <div class="tp-desc">AWS & DevSecOps</div>
        </div>
        <div class="track-pill tb-purple">
          <div class="tp-title">Data Analytics</div>
          <div class="tp-desc">Big Data ETL</div>
        </div>
        <div class="track-pill tb-emerald">
          <div class="tp-title">Web Dev</div>
          <div class="tp-desc">Full-Stack Cloud</div>
        </div>
        <div class="track-pill tb-gold">
          <div class="tp-title">Enterprise</div>
          <div class="tp-desc">SaaS Platforms</div>
        </div>
      </div>
    </div>

    <!-- Right -->
    <div class="right-col">
      <div class="presence-widget">
        <div class="pw-title">Global Presence</div>
        <div class="pw-flags">
          <div>{icons["flag_in"]} <span>India</span></div>
          <div>{icons["flag_jp"]} <span>Japan</span></div>
          <div>{icons["flag_us"]} <span>USA</span></div>
          <div>{icons["flag_kr"]} <span>Korea</span></div>
        </div>
      </div>
      <div class="colleges-count">
        Trusted by <strong>10+ Leading Engineering Colleges</strong> including DHB Soni, SPCOET, VPCOE & SSBT
      </div>
      <div class="li-contact-bar">
        <span>HQ: Gera's Imperium Rise, Pune</span>
        <span><strong>www.aparaitech.org</strong></span>
      </div>
    </div>
  </div>
</body>
</html>
"""

    li_file = os.path.join(html_dir, "showcase_linkedin_banner.html")
    with open(li_file, "w", encoding="utf-8") as f:
        f.write(li_bright_html)

    # =========================================================================
    # 4. BRIGHT PRESENTATION SLIDE FORMAT (1920 x 1080 - 16:9)
    # =========================================================================
    slide_bright_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Collaborations Showcase (Slide 1920x1080 Bright)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1920px;
      height: 1080px;
      background: linear-gradient(135deg, #FFFFFF 0%, #F6FAFF 40%, #EFF6FF 100%);
      font-family: 'Montserrat', sans-serif;
      color: #0F172A;
      overflow: hidden;
      position: relative;
      padding: 44px 64px 34px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .bg-grid {{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px);
      background-size: 38px 38px;
      opacity: 0.7;
      pointer-events: none;
    }}
    .content-wrap {{
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }}

    .slide-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.35);
    }}
    .slide-brand {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .slide-logo {{
      height: 52px;
      object-fit: contain;
    }}
    .slide-brand-title {{
      font-size: 26px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
      letter-spacing: 0.06em;
    }}
    .slide-badge {{
      background: #EFF6FF;
      border: 1.5px solid #2563EB;
      color: #1D4ED8;
      padding: 8px 22px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
    }}

    .slide-hero {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin: 14px 0 16px 0;
    }}
    .slide-hero-left h1 {{
      font-size: 42px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.15;
      color: #0A192F;
    }}
    .slide-hero-left h1 span {{
      color: #2563EB;
    }}
    .slide-hero-left p {{
      font-size: 16px;
      color: #475569;
      font-weight: 600;
      margin-top: 5px;
    }}
    .slide-presence-card {{
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 14px;
      padding: 10px 22px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }}
    .sp-title {{
      font-size: 12px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}
    .sp-flags {{
      display: flex;
      gap: 18px;
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      align-items: center;
    }}
    .sp-flag-item {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .slide-top-grid {{
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 22px;
      margin-bottom: 16px;
    }}
    .partner-banner {{
      background: #FFFFFF;
      border: 2px solid #D4AF37;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.16);
    }}
    .pb-head {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .pb-name {{
      font-size: 22px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #0A192F;
    }}
    .pb-flag-pill {{
      display: flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      border: 1.5px solid #93C5FD;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 800;
      color: #1D4ED8;
    }}
    .pb-text {{
      font-size: 13px;
      color: #334155;
      line-height: 1.45;
      margin: 8px 0;
    }}
    .pb-features {{
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #166534;
      font-weight: 700;
    }}
    .pb-features span {{
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 4px 10px;
      border-radius: 6px;
    }}

    .gains-banner {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 16px;
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }}
    .gb-title {{
      font-size: 16px;
      font-weight: 800;
      color: #0A192F;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .gb-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }}
    .gb-item {{
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .domains-row {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-bottom: 14px;
    }}
    .dom-card {{
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 14px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
    }}
    .dom-card.c-blue {{ border-top: 3.5px solid #2563EB; }}
    .dom-card.c-cyan {{ border-top: 3.5px solid #0284C7; }}
    .dom-card.c-purple {{ border-top: 3.5px solid #7C3AED; }}
    .dom-card.c-emerald {{ border-top: 3.5px solid #059669; }}
    .dom-card.c-gold {{ border-top: 3.5px solid #D97706; }}

    .dom-title-box {{
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #F1F5F9;
    }}
    .dom-name {{
      font-size: 13.5px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      color: #0F172A;
    }}
    .dom-ul {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}
    .dom-li {{
      font-size: 11px;
      color: #334155;
      font-weight: 600;
      position: relative;
      padding-left: 12px;
    }}
    .dom-li::before {{
      content: "•";
      position: absolute;
      left: 0;
      font-size: 14px;
      font-weight: 900;
      top: -2px;
    }}
    .c-blue .dom-li::before {{ color: #2563EB; }}
    .c-cyan .dom-li::before {{ color: #0284C7; }}
    .c-purple .dom-li::before {{ color: #7C3AED; }}
    .c-emerald .dom-li::before {{ color: #059669; }}
    .c-gold .dom-li::before {{ color: #D97706; }}

    .colleges-ribbon {{
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 10px;
      padding: 9px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      margin-bottom: 14px;
    }}
    .cr-title {{
      font-size: 12px;
      font-weight: 800;
      color: #B45309;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }}
    .cr-list {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 11.5px;
      font-weight: 700;
      color: #0369A1;
    }}

    .slide-footer {{
      background: #0A192F;
      border-top: 2.5px solid #D4AF37;
      border-radius: 12px;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(10, 25, 47, 0.3);
    }}
    .sf-left {{
      font-size: 15px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      color: #38BDF8;
    }}
    .sf-left span {{
      display: block;
      font-size: 11px;
      color: #CBD5E1;
      font-weight: 500;
    }}
    .sf-center {{
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #CBD5E1;
    }}
    .sf-center strong {{
      color: #FFFFFF;
    }}
    .sf-btn {{
      background: linear-gradient(135deg, #D4AF37, #B8860B);
      color: #0A192F;
      font-size: 12px;
      font-weight: 900;
      padding: 9px 20px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="content-wrap">
    <div class="slide-header">
      <div class="slide-brand">
        <img class="slide-logo" src="data:image/png;base64,{logo_b64}" alt="Logo" />
        <span class="slide-brand-title">APARAITECH SOFTWARE COMPANY</span>
      </div>
      <div class="slide-badge">★ Global Industry Alliances ★</div>
    </div>

    <div class="slide-hero">
      <div class="slide-hero-left">
        <h1>Our Collaborations & <span>MNC Projects</span></h1>
        <p>Building Industry-Ready Professionals Through Global Strategic Alliances & Production Sprints</p>
      </div>
      <div class="slide-presence-card">
        <div class="sp-title">{icons["globe"]} Global Footprint:</div>
        <div class="sp-flags">
          <div class="sp-flag-item">{icons["flag_in"]} <span>India</span></div>
          <div class="sp-flag-item">{icons["flag_jp"]} <span>Japan</span></div>
          <div class="sp-flag-item">{icons["flag_us"]} <span>USA</span></div>
          <div class="sp-flag-item">{icons["flag_kr"]} <span>South Korea</span></div>
        </div>
      </div>
    </div>

    <div class="slide-top-grid">
      <div class="partner-banner">
        <div class="pb-head">
          <div class="pb-name">Embarc.Inc (Tokyo, Japan) Strategic Alliance</div>
          <div class="pb-flag-pill">{icons["flag_jp"]} <span>Japan</span> <span>⟷</span> {icons["flag_in"]} <span>India</span></div>
        </div>
        <p class="pb-text">
          Strategic partnership for international market entry, high-scalability software solutions, and cross-border digital transformation projects. Students work under international enterprise standards and bilateral code reviews.
        </p>
        <div class="pb-features">
          <span>✓ Cross-Border Code Reviews</span>
          <span>✓ Tokyo-Pune Engineering Bridge</span>
          <span>✓ Enterprise Cloud Architecture</span>
        </div>
      </div>

      <div class="gains-banner">
        <div class="gb-title">{icons["award"]} What Our Students Gain</div>
        <div class="gb-grid">
          <div class="gb-item">{icons["check_green"]} Real MNC-Level Projects</div>
          <div class="gb-item">{icons["check_green"]} Global Exposure (Japan)</div>
          <div class="gb-item">{icons["check_green"]} Industry Certifications & LOR</div>
          <div class="gb-item">{icons["check_green"]} Direct HR Interviews</div>
          <div class="gb-item">{icons["check_green"]} Production Git Portfolio</div>
          <div class="gb-item">{icons["check_green"]} Rapid Career Growth</div>
        </div>
      </div>
    </div>

    <div class="domains-row">
      <div class="dom-card c-blue">
        <div class="dom-title-box">
          <span style="color:#2563EB;">{icons["brain"]}</span>
          <span class="dom-name">AI / ML Engineering</span>
        </div>
        <ul class="dom-ul">
          <li class="dom-li">Multi-Modal Conversational AI</li>
          <li class="dom-li">Computer Vision Defect Detection</li>
          <li class="dom-li">Predictive Sales Pipeline</li>
          <li class="dom-li">Cognitive Question Paper Synthesizer</li>
        </ul>
      </div>

      <div class="dom-card c-cyan">
        <div class="dom-title-box">
          <span style="color:#0284C7;">{icons["cloud"]}</span>
          <span class="dom-name">Cloud Computing</span>
        </div>
        <ul class="dom-ul">
          <li class="dom-li">Multi-Region AWS Microservices</li>
          <li class="dom-li">Kubernetes Cluster Autoscaling</li>
          <li class="dom-li">Serverless Event-Driven Pipelines</li>
          <li class="dom-li">Enterprise DevSecOps Toolchain</li>
        </ul>
      </div>

      <div class="dom-card c-purple">
        <div class="dom-title-box">
          <span style="color:#7C3AED;">{icons["chart"]}</span>
          <span class="dom-name">Data Analytics</span>
        </div>
        <ul class="dom-ul">
          <li class="dom-li">Real-Time Financial Analytics</li>
          <li class="dom-li">Customer Lifetime Value Engine</li>
          <li class="dom-li">Big Data Lakehouse ETL</li>
          <li class="dom-li">Supply Chain BI Dashboards</li>
        </ul>
      </div>

      <div class="dom-card c-emerald">
        <div class="dom-title-box">
          <span style="color:#059669;">{icons["code"]}</span>
          <span class="dom-name">Web Development</span>
        </div>
        <ul class="dom-ul">
          <li class="dom-li">High-Concurrency Next.js Portal</li>
          <li class="dom-li">Cloud Kitchen Real-Time Display</li>
          <li class="dom-li">Micro-Frontend E-Commerce</li>
          <li class="dom-li">WebSocket Collaborative Engine</li>
        </ul>
      </div>

      <div class="dom-card c-gold">
        <div class="dom-title-box">
          <span style="color:#D97706;">{icons["server"]}</span>
          <span class="dom-name">Enterprise Systems</span>
        </div>
        <ul class="dom-ul">
          <li class="dom-li">ERP Attendance & Shift Tracker</li>
          <li class="dom-li">SVPM Global Alumni & Mentorship</li>
          <li class="dom-li">High-Concurrency Online Test Platform</li>
          <li class="dom-li">Multi-Tenant SaaS RBAC Engine</li>
        </ul>
      </div>
    </div>

    <div class="colleges-ribbon">
      <div class="cr-title">{icons["grad"]} Trusted by Leading Colleges:</div>
      <div class="cr-list">
        <span>DHB Soni College, Solapur</span>
        <span>•</span>
        <span>SPCOET Someshwarnagar</span>
        <span>•</span>
        <span>Vidya Pratishthan's COE, Baramati</span>
        <span>•</span>
        <span>Sharadchandra Pawar COET</span>
        <span>•</span>
        <span>Jaywant COE, Sangli</span>
        <span>•</span>
        <span>Gangamai COE, Nagaon</span>
        <span>•</span>
        <span>SSBT's COET, Jalgaon</span>
      </div>
    </div>

    <div class="slide-footer">
      <div class="sf-left">
        APARAITECH SOFTWARE COMPANY
        <span>Corporate HQ: Gera's Imperium Rise, Hinjewadi Phase 2, Pune • Building the Future Together</span>
      </div>
      <div class="sf-center">
        <div><strong>Email:</strong> hr@info.aparaitech.org</div>
        <div><strong>Helpline:</strong> +91 9110406075</div>
        <div><strong>Website:</strong> www.aparaitech.org</div>
      </div>
      <div class="sf-btn">Explore Sprints</div>
    </div>
  </div>
</body>
</html>
"""

    slide_file = os.path.join(html_dir, "showcase_presentation_slide.html")
    with open(slide_file, "w", encoding="utf-8") as f:
        f.write(slide_bright_html)

    # Render All 4 Bright Formats
    render_tasks = [
        ("01_collaboration_showcase_a4.png", a4_file, "1240,1754"),
        ("02_collaboration_showcase_instagram.png", ig_file, "1080,1080"),
        ("03_collaboration_showcase_linkedin.png", li_file, "1584,396"),
        ("04_collaboration_showcase_slide.png", slide_file, "1920,1080"),
    ]

    for img_name, html_path, size in render_tasks:
        out_img = os.path.join(img_dir, img_name)
        cmd = [
            chrome_exe,
            "--headless=new",
            "--disable-gpu",
            f"--window-size={size}",
            "--hide-scrollbars",
            f"--screenshot={out_img}",
            html_path
        ]
        print(f"Rendering Bright {img_name} ({size})...")
        subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(out_img):
            print(f"SUCCESS: Bright {img_name} ({os.path.getsize(out_img)} bytes)")

    # Compile 1-Page PDF
    pdf_out = os.path.join(pdf_dir, "Aparaitech_Collaboration_Showcase_A4.pdf")
    pdf_cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out}",
        a4_file
    ]
    print("Compiling Bright A4 Showcase PDF...")
    subprocess.run(pdf_cmd, capture_output=True, text=True)
    if os.path.exists(pdf_out):
        print(f"SUCCESS: Bright PDF compiled: {pdf_out} ({os.path.getsize(pdf_out)} bytes)")
        
        # Verify page count
        doc = pymupdf.open(pdf_out)
        print(f"Bright PDF Page Count: {len(doc)}")
        doc.close()

    # Hub HTML with Bright & Dark View
    hub_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech Software - Collaborations & MNC Projects Showcase Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Montserrat', sans-serif;
      background: #F1F5F9;
      color: #0F172A;
      padding: 30px 40px;
      line-height: 1.5;
    }}
    .header {{
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 24px 32px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
    }}
    .header h1 {{
      font-size: 26px;
      font-weight: 900;
      color: #0A192F;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .header p {{
      color: #64748B;
      font-size: 14px;
      margin-top: 4px;
      font-weight: 600;
    }}
    .badge-gold {{
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0A192F;
      padding: 8px 18px;
      border-radius: 20px;
      font-weight: 900;
      font-size: 12.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }}

    .formats-grid {{
      display: flex;
      flex-direction: column;
      gap: 32px;
    }}
    .format-card {{
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
    }}
    .format-head {{
      background: #F8FAFC;
      padding: 16px 24px;
      border-bottom: 1.5px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .format-title {{
      font-size: 18px;
      font-weight: 800;
      color: #0A192F;
      font-family: 'Space Grotesk', sans-serif;
    }}
    .format-meta {{
      font-size: 12px;
      color: #0369A1;
      font-weight: 700;
      background: #E0F2FE;
      border: 1px solid #BAE6FD;
      padding: 4px 12px;
      border-radius: 12px;
    }}
    .format-body {{
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: #FFFFFF;
    }}
    .format-img {{
      max-width: 100%;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(15, 23, 42, 0.12);
      border: 1px solid #CBD5E1;
    }}
    .action-row {{
      display: flex;
      gap: 14px;
      margin-top: 8px;
    }}
    .btn {{
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }}
    .btn-gold {{
      background: #D4AF37;
      color: #0A192F;
    }}
    .btn-blue {{
      background: #2563EB;
      color: #FFFFFF;
    }}
    .btn-outline {{
      background: transparent;
      border: 1.5px solid #CBD5E1;
      color: #334155;
    }}
    .btn-outline:hover {{
      background: #F1F5F9;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Aparaitech Software • Collaborations & MNC Projects Showcase</h1>
      <p>Bright Executive Edition • Japan-India Strategic Alliance, MNC Projects & College Partners</p>
    </div>
    <div class="badge-gold">Bright Edition Active</div>
  </div>

  <div class="formats-grid">
    <!-- Format 1: A4 Poster -->
    <div class="format-card">
      <div class="format-head">
        <div class="format-title">1. A4 Print Poster & Executive Dossier Insert (Bright Edition)</div>
        <div class="format-meta">Dimensions: 1240 x 1754 (A4 Portrait) • Verified 1-Page PDF</div>
      </div>
      <div class="format-body">
        <img class="format-img" style="max-height: 750px;" src="images/01_collaboration_showcase_a4.png" alt="A4 Poster" />
        <div class="action-row">
          <a class="btn btn-gold" href="pdf/Aparaitech_Collaboration_Showcase_A4.pdf" target="_blank">Download Bright PDF</a>
          <a class="btn btn-blue" href="images/01_collaboration_showcase_a4.png" target="_blank">Open High-Res PNG</a>
          <a class="btn btn-outline" href="html_templates/showcase_a4_poster.html" target="_blank">View HTML Source</a>
          <a class="btn btn-outline" href="images/01_collaboration_showcase_a4_dark.png" target="_blank">View Dark Edition Backup</a>
        </div>
      </div>
    </div>

    <!-- Format 2: Presentation Slide (16:9) -->
    <div class="format-card">
      <div class="format-head">
        <div class="format-title">2. Presentation Keynote Slide (16:9 Widescreen Bright)</div>
        <div class="format-meta">Dimensions: 1920 x 1080 • Pitch Deck Ready</div>
      </div>
      <div class="format-body">
        <img class="format-img" style="max-height: 520px;" src="images/04_collaboration_showcase_slide.png" alt="Slide" />
        <div class="action-row">
          <a class="btn btn-blue" href="images/04_collaboration_showcase_slide.png" target="_blank">Open High-Res PNG</a>
          <a class="btn btn-outline" href="html_templates/showcase_presentation_slide.html" target="_blank">View HTML Source</a>
          <a class="btn btn-outline" href="images/04_collaboration_showcase_slide_dark.png" target="_blank">View Dark Edition Backup</a>
        </div>
      </div>
    </div>

    <!-- Format 3: Instagram Post (1080x1080) -->
    <div class="format-card">
      <div class="format-head">
        <div class="format-title">3. Instagram & Social Media Square Post (Bright Edition)</div>
        <div class="format-meta">Dimensions: 1080 x 1080 (1:1 Ratio)</div>
      </div>
      <div class="format-body">
        <img class="format-img" style="max-height: 500px;" src="images/02_collaboration_showcase_instagram.png" alt="Instagram" />
        <div class="action-row">
          <a class="btn btn-gold" href="images/02_collaboration_showcase_instagram.png" target="_blank">Open High-Res PNG</a>
          <a class="btn btn-outline" href="html_templates/showcase_instagram_post.html" target="_blank">View HTML Source</a>
          <a class="btn btn-outline" href="images/02_collaboration_showcase_instagram_dark.png" target="_blank">View Dark Edition Backup</a>
        </div>
      </div>
    </div>

    <!-- Format 4: LinkedIn Banner (1584x396) -->
    <div class="format-card">
      <div class="format-head">
        <div class="format-title">4. LinkedIn Panoramic Banner (Bright Edition)</div>
        <div class="format-meta">Dimensions: 1584 x 396 (4:1 Ratio)</div>
      </div>
      <div class="format-body">
        <img class="format-img" style="width: 100%; max-width: 1100px;" src="images/03_collaboration_showcase_linkedin.png" alt="LinkedIn Banner" />
        <div class="action-row">
          <a class="btn btn-blue" href="images/03_collaboration_showcase_linkedin.png" target="_blank">Open High-Res PNG</a>
          <a class="btn btn-outline" href="html_templates/showcase_linkedin_banner.html" target="_blank">View HTML Source</a>
          <a class="btn btn-outline" href="images/03_collaboration_showcase_linkedin_dark.png" target="_blank">View Dark Edition Backup</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
"""

    hub_file = os.path.join(showcase_dir, "showcase_hub.html")
    with open(hub_file, "w", encoding="utf-8") as f:
        f.write(hub_html)

    print("ALL BRIGHT SHOWCASE ASSETS, PDF, IMAGES, AND HUB UPDATED SUCCESSFULLY!")

if __name__ == "__main__":
    generate_bright_showcase()
