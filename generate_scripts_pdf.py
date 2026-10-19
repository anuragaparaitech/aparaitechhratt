import os
import base64
import subprocess

def build_scripts_pdf():
    base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
    logo_path = os.path.join(base_dir, "assets", "aparaitech-logo.png")
    qr_path = os.path.join(base_dir, "assets", "registration-qr.png")

    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(qr_path, "rb") as f:
        qr_b64 = base64.b64encode(f.read()).decode("utf-8")

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aparaitech Live Project Program 2026 - Master Pitch Scripts Manual</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary-navy: #0B132B;
      --navy-dark: #070D1E;
      --navy-light: #1C2541;
      --teal-primary: #0D9488;
      --teal-dark: #0F766E;
      --teal-light: #14B8A6;
      --teal-soft: #F0FDFA;
      --teal-border: #99F6E4;
      --blue-accent: #2563EB;
      --blue-soft: #EFF6FF;
      --amber-accent: #D97706;
      --amber-soft: #FFFBEB;
      --rose-accent: #E11D48;
      --rose-soft: #FFF1F2;
      --text-dark: #0F172A;
      --text-muted: #334155;
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
      line-height: 1.5;
      font-size: 11px;
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
      font-size: 14px;
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
      font-size: 12.5px;
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

    .document-container {{
      width: 210mm;
      margin: 20px auto;
    }}

    .page-section {{
      background: #ffffff;
      padding: 12mm 15mm;
      border-radius: 4px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 25px;
      position: relative;
    }}

    .page-break {{
      page-break-before: always;
      break-before: page;
    }}

    @page {{
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }}

    @media print {{
      body {{
        background: transparent !important;
      }}
      .no-print-toolbar {{
        display: none !important;
      }}
      .document-container {{
        width: 100% !important;
        margin: 0 !important;
      }}
      .page-section {{
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }}
      .page-break {{
        page-break-before: always !important;
        break-before: page !important;
      }}
      .avoid-break {{
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }}
    }}

    .avoid-break {{
      break-inside: avoid;
      page-break-inside: avoid;
    }}

    .master-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 9px;
      border-bottom: 2px solid var(--teal-primary);
      margin-bottom: 12px;
    }}
    .brand-box {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand-logo {{
      width: 40px;
      height: 40px;
      object-fit: contain;
    }}
    .brand-text-col {{
      display: flex;
      flex-direction: column;
    }}
    .company-title {{
      font-size: 16px;
      font-weight: 800;
      color: var(--primary-navy);
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.04em;
      line-height: 1.1;
    }}
    .company-sub {{
      font-size: 8.5px;
      font-weight: 700;
      color: var(--teal-primary);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }}
    .header-pill {{
      background: var(--navy-dark);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}

    .playbook-banner {{
      background: linear-gradient(135deg, #0B132B 0%, #112942 55%, #0F766E 100%);
      color: #ffffff;
      border-radius: 9px;
      padding: 12px 16px;
      margin-bottom: 14px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(11, 19, 43, 0.15);
    }}
    .playbook-badge {{
      display: inline-block;
      background: rgba(20, 184, 166, 0.25);
      border: 1px solid rgba(20, 184, 166, 0.5);
      color: #5eead4;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }}
    .stipend-banner-pill {{
      display: inline-block;
      background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-left: 6px;
      margin-bottom: 4px;
    }}
    .playbook-title {{
      font-size: 18px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 4px;
    }}
    .playbook-desc {{
      font-size: 9.5px;
      color: #cbd5e1;
      line-height: 1.4;
    }}

    .script-card {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 9px;
      margin-bottom: 14px;
      overflow: hidden;
      box-shadow: 0 2px 7px rgba(0, 0, 0, 0.03);
    }}
    .script-header {{
      background: #F8FAFC;
      border-bottom: 1px solid var(--border-color);
      padding: 9px 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .script-header-left {{
      display: flex;
      align-items: center;
      gap: 9px;
    }}
    .script-num-badge {{
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--teal-primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }}
    .script-title {{
      font-size: 12.5px;
      font-weight: 800;
      color: var(--primary-navy);
      font-family: 'Space Grotesk', sans-serif;
    }}
    .script-meta {{
      font-size: 8px;
      color: var(--text-light);
      font-weight: 600;
    }}
    .target-badge {{
      background: #E0F2FE;
      color: #0369A1;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 8px;
      font-weight: 700;
      border: 1px solid #BAE6FD;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    .script-body {{
      padding: 12px 14px;
    }}

    .stage-dir {{
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 5px;
    }}
    .step-heading {{
      font-size: 10.5px;
      font-weight: 800;
      color: var(--primary-navy);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 9px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .step-heading::before {{
      content: "";
      width: 3.5px;
      height: 11px;
      background: var(--teal-primary);
      border-radius: 2px;
      display: inline-block;
    }}

    .speech-box {{
      background: #F8FAFC;
      border-left: 3.5px solid var(--teal-primary);
      padding: 9px 12px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 9px;
      font-size: 9.8px;
      line-height: 1.52;
      color: #1E293B;
    }}
    .speech-box p {{
      margin-bottom: 5px;
    }}
    .speech-box p:last-child {{
      margin-bottom: 0;
    }}
    .speech-box strong {{
      color: #0F172A;
    }}
    .highlight-speech {{
      background: #FEF9C3;
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: 700;
      color: #854D0E;
    }}

    .dialogue-turn {{
      margin-bottom: 7px;
      padding: 6px 9px;
      border-radius: 5px;
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      font-size: 9.5px;
      line-height: 1.48;
    }}
    .dialogue-speaker {{
      font-weight: 800;
      color: var(--teal-dark);
      margin-right: 5px;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.04em;
    }}

    .objection-item {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
    }}
    .objection-header {{
      background: #FFF1F2;
      border-left: 3.5px solid #E11D48;
      padding: 5px 9px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .objection-title {{
      font-size: 9.5px;
      font-weight: 800;
      color: #9F1239;
    }}
    .objection-answer {{
      padding: 7px 10px;
      font-size: 9.3px;
      line-height: 1.48;
      color: #334155;
      background: #FAFAFA;
    }}

    .code-template {{
      background: #0F172A;
      color: #E2E8F0;
      border-radius: 6px;
      padding: 10px 12px;
      font-family: 'Fira Code', Consolas, monospace;
      font-size: 8.5px;
      line-height: 1.48;
      white-space: pre-wrap;
      word-break: break-word;
      border: 1px solid #334155;
      margin-bottom: 9px;
    }}

    .desk-box {{
      background: var(--navy-dark);
      color: #ffffff;
      border-radius: 7px;
      padding: 8px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      align-items: center;
      margin-top: 10px;
    }}
    .desk-col-title {{
      font-size: 7.5px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
    }}
    .desk-col-val {{
      font-size: 8.5px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 1px;
    }}

    .doc-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 7px;
      border-top: 1px solid var(--border-color);
      font-size: 8px;
      color: var(--text-light);
      margin-top: 12px;
    }}
  </style>
</head>
<body>

  <div class="no-print-toolbar">
    <div class="toolbar-title">
      <span>🎙️</span>
      <span>Aparaitech Software • Master Client Pitch & Script Playbook 2026</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-outline" onclick="window.scrollTo({{ top: document.body.scrollHeight, behavior: 'smooth' }})">
        Scroll to End
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="document-container">

    <!-- SECTION 1 -->
    <div class="page-section">
      <div class="master-header">
        <div class="brand-box">
          <img class="brand-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
          <div class="brand-text-col">
            <span class="company-title">APARAITECH SOFTWARE</span>
            <span class="company-sub">Client Pitch & Conversion Script Playbook</span>
          </div>
        </div>
        <div class="header-pill">
          <span>BATCH 2026 • DIRECT SCRIPTS</span>
        </div>
      </div>

      <div class="playbook-banner">
        <div>
          <span class="playbook-badge">Client Conversion Playbook</span>
          <span class="stipend-banner-pill">💰 INCLUDES ₹8,000 – ₹15,000 OVERALL STIPEND</span>
        </div>
        <h1 class="playbook-title">🚀 MASTER PITCH SCRIPTS: LIVE PROJECT PROGRAM 2026</h1>
        <p class="playbook-desc">
          Verbatim delivery scripts, psychological hooks, and objection-handling matrices designed for university seminars, student webinars, one-on-one telephonic consultations, and institutional campus meetings.
        </p>
      </div>

      <div class="script-card avoid-break">
        <div class="script-header">
          <div class="script-header-left">
            <span class="script-num-badge">01</span>
            <div>
              <div class="script-title">Direct-to-Student Live Pitch Script</div>
              <div class="script-meta">Applicable for: Webinars, Auditorium Seminars, Classroom Presentations & Google Meet Sessions</div>
            </div>
          </div>
          <span class="target-badge">Student Conversion (B2C)</span>
        </div>

        <div class="script-body">
          <div class="avoid-break">
            <div class="step-heading">Phase 1: The Psychological Hook (0:00 – 1:30)</div>
            <div class="stage-dir">Tone: Energetic, Relatable, Direct • Pause for audience reflection</div>
            <div class="speech-box">
              <p>"Good morning / afternoon everyone!</p>
              <p>Before I tell you who I am and why I'm here today, let me ask you one honest question:</p>
              <p><strong>How many of you have completed 3 or 4 tutorial courses on Udemy, YouTube, or Coursera, built a simple To-Do List or Calculator app, and yet when you look at a real job description from a tech company... you feel completely unprepared?</strong></p>
              <p><em>[Pause for 2–3 seconds. Look around or ask students in chat to type 'YES'.]</em></p>
              <p>Be honest with yourself. Most engineering students spend 4 years learning syntax, memorizing definitions for semester exams, and following step-by-step video tutorials. But the moment you sit in an actual technical interview, the interviewer doesn’t ask you for the definition of polymorphism.</p>
              <p>They ask: <strong>'Show me your GitHub repository.'</strong> | <strong>'Have you ever deployed a production-grade backend with CI/CD?'</strong> | <strong>'How did you handle database deadlocks or API rate limiting in your last live project?'</strong></p>
              <p>And that is where 90% of students go blank."</p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Phase 2: The Industry Reality Check (1:30 – 3:00)</div>
            <div class="stage-dir">Tone: Authoritative, Empathetic • Shift from problem to solution</div>
            <div class="speech-box">
              <p>"The IT industry doesn’t pay you for what you <em>know</em>. The industry pays you for what you can <strong>build and ship</strong>.</p>
              <p>That exact gap is why <strong>Aparaitech Software</strong> created the <strong>Live Project Program 2026</strong>.</p>
              <p>This is not another coaching class. We don’t give you recorded lectures from three years ago and say 'good luck'.</p>
              <p>This is a <strong>3-Month Immersive Industry Apprenticeship</strong> where you work directly under senior software engineers at Aparaitech Software. You don't just watch videos—<strong>you build, test, and deploy 10 live, enterprise-grade projects</strong> across high-demand domains: Full-Stack Web Development, AI & Machine Learning, Data Analytics, Java Enterprise Systems, and Cloud Computing."</p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Phase 3: The 5 Core Deliverables + Overall Performance Stipend (3:00 – 5:30)</div>
            <div class="stage-dir">Tone: High Energy, Value-Packed • Highlight ₹8K–15K performance reward</div>
            <div class="speech-box">
              <p>"When you finish these 3 months, you don’t leave with theory. You leave with an unfair advantage over every other graduate in your batch. Here is what you get:</p>
              <p>
                <strong>💰 1. Overall Performance-Based Stipend:</strong> You don't just learn—you earn. Eligible top performers receive an <strong>Overall Performance-Based Stipend ranging from ₹8,000 to ₹15,000</strong> across the program (strictly an overall program stipend, not monthly) based on sprint delivery and code quality.<br>
                <strong>🚀 2. 10 Live Deployed Projects:</strong> Real systems deployed on live cloud infrastructure with clean architecture, Git version control, and real-world edge cases that recruiters can actually test on their phones.<br>
                <strong>👨‍🏫 3. Direct Senior Mentorship:</strong> You are paired with senior engineers who review your pull requests, correct your code architecture, and conduct regular sprint reviews.<br>
                <strong>📜 4. Three Official Industry Credentials:</strong> An official <strong>Experience Certificate</strong> validating your work at Aparaitech Software, a verified <strong>Letter of Recommendation (LOR)</strong>, and a formal <strong>Completion Certificate</strong>.<br>
                <strong>💼 5. Pre-Placement Opportunities & Global Exposure:</strong> High performers are evaluated directly for full-time engineering roles, with direct HR interview calls and exposure to international workflows via our <strong>Embarc.Inc (Japan-India)</strong> alliance."
              </p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Phase 4: Institutional Proof & Closing Call to Action (5:30 – 7:30)</div>
            <div class="stage-dir">Tone: Reassuring & Decisive • Direct urgency to the registration link</div>
            <div class="speech-box">
              <p>"Leading institutions already trust Aparaitech: <strong>DHB Soni College (Solapur), SPCOET (Baramati), Vidya Pratishthan's COE (Baramati), Sharadchandra Pawar COE&T, Jaywant COE & Polytechnic (Sangli)</strong>, and many more.</p>
              <p><strong>Batch 2026 admissions are officially open today.</strong> Because our senior engineers mentor candidates directly in small sprint teams, <span class="highlight-speech">seats are strictly capped per batch</span>.</p>
              <p>If you are ready to stop being just a student following tutorials and start building software like an industry engineer:</p>
              <p>👉 <strong>Scan the QR code on your screen right now</strong>, or open the link: <strong>https://forms.gle/sucrxqA8c7oZhnQQ7</strong>. Fill out your details and domain preference. Our Campus Relations team will review your application and get in touch within 24 to 48 hours. Don't wait until placement season to realize your resume is empty. Build your proof of work now. Thank you!"</p>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>© 2026 Aparaitech Software • Internal Playbook</span>
        <span>Section 1 • Direct-to-Student Script</span>
      </div>
    </div>

    <!-- SECTION 2 -->
    <div class="page-section page-break">
      <div class="master-header">
        <div class="brand-box">
          <img class="brand-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
          <div class="brand-text-col">
            <span class="company-title">APARAITECH SOFTWARE</span>
            <span class="company-sub">Institutional & Telephonic Scripts</span>
          </div>
        </div>
        <div class="header-pill">
          <span>INSTITUTIONAL B2B & OUTREACH</span>
        </div>
      </div>

      <div class="script-card avoid-break">
        <div class="script-header">
          <div class="script-header-left">
            <span class="script-num-badge" style="background: #2563EB;">02</span>
            <div>
              <div class="script-title">Direct B2B Pitch to College TPO / Principal / HOD</div>
              <div class="script-meta">Applicable for: In-person campus meetings, Zoom calls with Training & Placement Officers and Deans</div>
            </div>
          </div>
          <span class="target-badge" style="background: #EDE9FE; color: #6D28D9; border-color: #DDD6FE;">Campus Partnership (B2B)</span>
        </div>

        <div class="script-body">
          <div class="avoid-break">
            <div class="step-heading">Step 1: Opening & Institutional Alignment</div>
            <div class="stage-dir">Tone: Professional, Respectful, Aligned with NAAC/NBA Accreditation Goals</div>
            <div class="speech-box">
              <p>"Good morning, Professor / Dr. [Name]. Thank you for taking the time to meet with me today.</p>
              <p>I know as the [TPO / Head of Department] at [College Name], your primary focus right now is ensuring higher placement statistics, strong student GitHub portfolios, and fulfilling mandatory <strong>NAAC / NBA criteria</strong> for active industry-academia collaboration."</p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Step 2: Highlighting the Recruiter Feedback Gap</div>
            <div class="speech-box">
              <p>"Over the latest hiring cycle, corporate recruiters have raised one consistent point: students know theoretical textbook concepts, but lack practical repository proof-of-work. When recruiters evaluate resumes during campus drives, they filter out candidates whose projects are just standard academic mini-projects copied from the internet.</p>
              <p>That is where <strong>Aparaitech Software</strong> steps in as your active software industry partner."</p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Step 3: The 5-Point Institutional Win-Win</div>
            <div class="speech-box">
              <p>
                <strong>1. Performance-Based Stipend for Students:</strong> Eligible top performers earn ₹8,000 to ₹15,000/month, providing immense financial and career motivation.<br>
                <strong>2. Zero Infrastructure Burden on College:</strong> Delivered in a flexible online/hybrid format with evening/weekend sprint reviews, meaning zero disruption to your daily lecture timetable.<br>
                <strong>3. 10 Live Industry Projects:</strong> Students build production systems in Web, AI/ML, Data Analytics, Java, and Cloud under senior architects.<br>
                <strong>4. Placement Multiplication:</strong> Verified Experience Letters, LORs, and direct HR interview calls for top performers.<br>
                <strong>5. International Exposure:</strong> Strategic alliance with <strong>Embarc.Inc (Japan-India)</strong> provides exposure to global workflow standards.<br>
                <strong>6. Institutional Trust:</strong> Prominent colleges like <em>Vidya Pratishthan's COE, SPCOET Baramati, and DHB Soni College</em> are already collaborating with us.
              </p>
            </div>
          </div>

          <div class="avoid-break">
            <div class="step-heading">Step 4: The Direct Close (Scheduling Student Orientation)</div>
            <div class="speech-box">
              <p>"We would love to conduct an exclusive <strong>45-minute orientation session</strong> for your [3rd Year / Final Year / Computer & IT] students this week, followed by candidate shortlisting.</p>
              <p>May we schedule this orientation for either <strong>[Option A: Thursday at 11 AM]</strong> or <strong>[Option B: Saturday at 2 PM]</strong> at a time convenient for your department?"</p>
            </div>
          </div>
        </div>
      </div>

      <div class="script-card avoid-break">
        <div class="script-header">
          <div class="script-header-left">
            <span class="script-num-badge" style="background: #059669;">03</span>
            <div>
              <div class="script-title">High-Impact 2-Minute Telephonic Pitch Script</div>
              <div class="script-meta">Applicable for: Calling registered student leads, web inquiries & WhatsApp warm contacts</div>
            </div>
          </div>
          <span class="target-badge" style="background: #DCFCE7; color: #15803D; border-color: #BBF7D0;">Discovery Call (1-on-1)</span>
        </div>

        <div class="script-body">
          <div class="stage-dir">Tone: Crisp, Friendly, High Confidence • Aim for under 120 seconds</div>

          <div class="dialogue-turn">
            <span class="dialogue-speaker">Representative:</span> "Hello, am I speaking with [Student Name]?"
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Candidate:</span> "Yes, speaking. Who is this?"
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Representative:</span> "Hi [Student Name], this is [Your Name] calling from the Campus Relations Team at <strong>Aparaitech Software</strong>. I’m calling regarding your inquiry for the <strong>Live Project Program 2026</strong>. I see you're currently in your [Year/Degree, e.g., 3rd Year B.Tech / BCA]. Are you looking to build your project portfolio for upcoming campus placements in Web Development, AI/ML, or Cloud?"
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Candidate:</span> "[Answers: Yes, I want to learn web development and get an internship / certificate.]"
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Representative:</span> "Got it! That’s exactly why students choose us. Instead of normal theory classes, our program puts you directly under senior software engineers for 3 months where you build and deploy <strong>10 live industry-grade projects</strong>.<br><br>
            Along with that, you receive:
            1. <strong>Overall Performance-Based Stipend of ₹8,000 to ₹15,000</strong> for milestone deliveries (strictly an overall program stipend, not monthly).<br>
            2. Official <strong>Experience Certificate</strong> and <strong>LOR</strong> from Aparaitech Software.<br>
            3. Direct <strong>HR interview calls</strong> for top performers.<br>
            4. Global project exposure via our <strong>Embarc.Inc Japan-India</strong> alliance.<br><br>
            Admissions for the upcoming 2026 batch are closing this week because seats per mentor are strictly capped. Have you filled out the short registration form yet, or would you like me to send the official PDF brochure and form directly to your WhatsApp right now?"
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Candidate:</span> "Please send it on WhatsApp."
          </div>
          <div class="dialogue-turn">
            <span class="dialogue-speaker">Representative:</span> "Sending it right away! Please review the PDF brochure and submit the form within the next 30 minutes so we can lock in your application for technical HR shortlisting. Looking forward to having you on board!"
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>© 2026 Aparaitech Software • Internal Playbook</span>
        <span>Section 2 • B2B & Telephonic Scripts</span>
      </div>
    </div>

    <!-- SECTION 3 -->
    <div class="page-section page-break">
      <div class="master-header">
        <div class="brand-box">
          <img class="brand-logo" src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" />
          <div class="brand-text-col">
            <span class="company-title">APARAITECH SOFTWARE</span>
            <span class="company-sub">Objection Handling & Digital Messaging</span>
          </div>
        </div>
        <div class="header-pill">
          <span>CLOSING & CONVERSION MATRIX</span>
        </div>
      </div>

      <div class="script-card avoid-break">
        <div class="script-header">
          <div class="script-header-left">
            <span class="script-num-badge" style="background: #E11D48;">04</span>
            <div>
              <div class="script-title">Objection Handling Masterclass (Word-for-Word Responses)</div>
              <div class="script-meta">How to neutralize student and parent hesitations immediately</div>
            </div>
          </div>
          <span class="target-badge" style="background: #FFE4E6; color: #BE123C; border-color: #FECDD3;">Handling Objections</span>
        </div>

        <div class="script-body">
          <div class="objection-item avoid-break">
            <div class="objection-header">
              <span>⚠️</span>
              <span class="objection-title">Objection 1: "How does the ₹8,000 to ₹15,000 overall stipend work?"</span>
            </div>
            <div class="objection-answer">
              <strong>Spoken Counter:</strong> "The stipend is an overall performance-based reward across the entire 3-month program (strictly not monthly). In our sprints, students are evaluated on milestone delivery, code quality & clean architecture, and sprint review attendance. Top performers meeting all project benchmarks receive an overall performance-based stipend between ₹8,000 and ₹15,000."
            </div>
          </div>

          <div class="objection-item avoid-break">
            <div class="objection-header">
              <span>⚠️</span>
              <span class="objection-title">Objection 2: "Why should I join this when I can learn free on YouTube or Udemy?"</span>
            </div>
            <div class="objection-answer">
              <strong>Spoken Counter:</strong> "YouTube and Udemy give you recorded videos where you watch someone else code. If your code breaks or you encounter a deployment bug, nobody reviews your code. More importantly, recruiters know Udemy certificates just mean you watched videos.<br><br>
              At Aparaitech, you are building <strong>live, deployed products</strong> with Git pull requests, code reviews by senior tech leads, earn a performance stipend, and receive an official <strong>Experience Letter</strong> that recruiters value."
            </div>
          </div>

          <div class="objection-item avoid-break">
            <div class="objection-header">
              <span>⚠️</span>
              <span class="objection-title">Objection 3: "Do you give a 100% job / placement guarantee?"</span>
            </div>
            <div class="objection-answer">
              <strong>Spoken Counter:</strong> "No genuine software company promises a fake '100% guarantee' without evaluating your skills first. What we provide is something far more valuable: <strong>direct access and verified proof-of-work</strong>.<br><br>
              Top performers receive direct HR interview calls at Aparaitech Software and our hiring partners. Plus, you get an official Letter of Recommendation (LOR) and an Experience Letter that sets you apart from 99% of candidates who only have academic mini-projects on their resumes."
            </div>
          </div>

          <div class="objection-item avoid-break">
            <div class="objection-header">
              <span>⚠️</span>
              <span class="objection-title">Objection 4: "I have college exams and lectures. How will I manage 3 months?"</span>
            </div>
            <div class="objection-answer">
              <strong>Spoken Counter:</strong> "The program is designed specifically for college students and working professionals. The sessions and sprint reviews are scheduled in flexible evening and weekend formats. You are given weekly sprint milestones, allowing you to manage your college exams smoothly without missing project deliverables."
            </div>
          </div>
        </div>
      </div>

      <div class="script-card avoid-break">
        <div class="script-header">
          <div class="script-header-left">
            <span class="script-num-badge" style="background: #0D9488;">05</span>
            <div>
              <div class="script-title">Digital Outreach & WhatsApp Conversion Templates</div>
              <div class="script-meta">Copy-paste templates for instant candidate outreach with stipend highlight</div>
            </div>
          </div>
          <span class="target-badge">Outreach Copy</span>
        </div>

        <div class="script-body">
          <div class="step-heading">Template A: Direct WhatsApp Message to Send with PDF Brochure & Poster</div>
          <div class="code-template">🚀 *APARAITECH LIVE PROJECT PROGRAM 2026*
*Transform from a Student into an Industry-Ready Engineer*

Dear [Student Name],

Tired of learning only from tutorials? Build REAL industry experience before you graduate! 💻

🎯 *Key Program Highlights:*
💰 *Overall Performance-Based Stipend: ₹8,000 – ₹15,000 (Strictly Overall, Not Monthly)*
✅ 3 Months Immersive Industry Experience
✅ Build & Deploy 10 Live Production Projects
✅ In-Demand Tracks: Web Dev | AI/ML | Data Analytics | Java | Cloud
✅ Direct Mentorship & Code Reviews by Senior Engineers
✅ 3 Official Credentials: Experience Letter + LOR + Completion Certificate
✅ Global Exposure: Embarc.Inc (Japan-India Collaboration)
✅ Direct HR Interview Calls for Top Performers

🏫 *Trusted by:* SPCOET Baramati, Vidya Pratishthan's COE, DHB Soni College Solapur & more!

📝 *Official Registration Form:*
👉 https://forms.gle/sucrxqA8c7oZhnQQ7

📎 *Attached:* Official Program Prospectus & PDF Pitch
📞 *Helpline:* +91 9110406075 | www.aparaitech.org
_Note: Limited seats per domain to maintain 1:1 mentorship quality._</div>
        </div>
      </div>

      <div class="desk-box avoid-break">
        <div>
          <div class="desk-col-title">Campus Relations Desk</div>
          <div class="desk-col-val">🏢 Aparaitech Software</div>
        </div>
        <div>
          <div class="desk-col-title">Direct Support Inquiries</div>
          <div class="desk-col-val">📧 hr@info.aparaitech.org</div>
          <div class="desk-col-val">📧 aparaitech@gmail.com</div>
        </div>
        <div>
          <div class="desk-col-title">Helpline & Website</div>
          <div class="desk-col-val">📞 +91 9110406075</div>
          <div class="desk-col-val">🌐 www.aparaitech.org</div>
        </div>
      </div>

      <div class="doc-footer">
        <span>© 2026 Aparaitech Software • Internal Playbook</span>
        <span>Section 3 • Objection Handling & Digital Outreach</span>
      </div>
    </div>

  </div>

</body>
</html>
"""

    html_file = os.path.join(base_dir, "aparaitech_pitch_scripts_manual.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    pdf_file = os.path.join(base_dir, "Aparaitech_Live_Project_Program_2026_Pitch_Scripts.pdf")
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]

    print("Re-rendering PDF scripts manual with stipend...")
    subprocess.run(chrome_cmd, capture_output=True, text=True)
    print(f"Updated Scripts PDF: {pdf_file} (Size: {os.path.getsize(pdf_file)} bytes)")

if __name__ == "__main__":
    build_scripts_pdf()
