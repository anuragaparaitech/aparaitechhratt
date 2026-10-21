import os
import json
import base64
import subprocess
import pymupdf

base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
data_path = os.path.join(base_dir, "backend", "scripts", "bda_reports_data.json")

# 1. Load assets
logo_path = os.path.join(base_dir, "frontend", "public", "aparaitech-logo.png")
with open(logo_path, "rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode("utf-8")

sign_path = os.path.join(base_dir, "Anurag Nand Sign.jpg")
with open(sign_path, "rb") as f:
    sign_b64 = base64.b64encode(f.read()).decode("utf-8")

stamp_path = os.path.join(base_dir, "id photo", "Stamp.png")
with open(stamp_path, "rb") as f:
    stamp_b64 = base64.b64encode(f.read()).decode("utf-8")

with open(data_path, "r", encoding="utf-8") as f:
    employees = json.load(f)

print(f"Loaded {len(employees)} BDA employees from JSON")

shift_names = {
    "shift_1": "Shift 1: 10:00 AM – 04:00 PM (Phase 1 Morning)",
    "shift_2": "Shift 2: 02:00 PM – 08:00 PM (Phase 1 Afternoon)",
    "shift_3": "Shift 3: 05:00 PM – 11:00 PM (Phase 2 Evening)"
}

def format_date(d_str):
    if not d_str or len(d_str) < 10:
        return d_str
    # YYYY-MM-DD -> DD/MM/YYYY
    parts = d_str.split('-')
    if len(parts) == 3:
        return f"{parts[2]}/{parts[1]}/{parts[0]}"
    return d_str

def get_compliance_badge(reports_count):
    if reports_count >= 12:
        return ('#059669', '#ecfdf5', '#a7f3d0', 'GRADE A+ • HIGHLY COMPLIANT')
    elif reports_count >= 8:
        return ('#0284c7', '#f0f9ff', '#bae6fd', 'GRADE A • REGULAR REPORTING')
    elif reports_count >= 4:
        return ('#d97706', '#fffbeb', '#fde68a', 'GRADE B • MODERATE SUBMISSION')
    elif reports_count >= 1:
        return ('#ea580c', '#fff7ed', '#fed7aa', 'GRADE C • PARTIAL LOGS')
    else:
        return ('#64748b', '#f8fafc', '#e2e8f0', 'ONBOARDING • NO REPORTS YET')

pages_html = []

for emp in employees:
    emp_id = emp["empId"]
    name = emp["name"]
    email = emp["email"]
    phone = emp.get("phone", "—")
    shift = shift_names.get(emp.get("shift"), emp.get("shift", "Shift 2"))
    join_date = format_date(emp.get("joinDate", "2026-10-01"))
    summary = emp["summary"]
    reports = emp["reports"]

    c_color, c_bg, c_border, c_label = get_compliance_badge(summary["totalReports"])

    # Build report table rows
    if len(reports) > 0:
        rows_html = []
        for r in reports:
            slot_badge = ""
            if r.get("slotNumber") == 2 or "Logout" in r.get("slotName", ""):
                slot_badge = '<span class="slot-pill slot-2">Logout</span>'
            else:
                slot_badge = '<span class="slot-pill slot-1">DWR</span>'

            # truncate remarks if too long for clean single-page layout
            remarks = r.get("remarks", "—")
            if len(remarks) > 42:
                remarks = remarks[:40] + "..."

            conv_val = r.get("todayConversions", 0)
            conv_display = f'<span class="conv-tag">{conv_val}</span>' if conv_val > 0 else '0'
            rev_val = r.get("revenue", 0)
            rev_display = f'₹{rev_val:,}' if rev_val > 0 else '—'

            rows_html.append(f"""
            <tr>
              <td class="cell-date"><strong>{format_date(r['reportDate'])}</strong></td>
              <td class="cell-time">{r['reportTime']} {slot_badge}</td>
              <td class="cell-num highlight">{r['connectedCalls']}</td>
              <td class="cell-num">{r['callsAbove3Min']}</td>
              <td class="cell-num">{r['groupsCreated']}</td>
              <td class="cell-num">{r['membersInGroups']}</td>
              <td class="cell-num">{conv_display}</td>
              <td class="cell-num text-bold">{rev_display}</td>
              <td class="cell-remarks">{remarks}</td>
            </tr>
            """)
        table_body = "\n".join(rows_html)
        table_footer = f"""
        <tfoot>
          <tr class="totals-row">
            <td colspan="2"><strong>CUMULATIVE TOTALS ({len(reports)} DAYS)</strong></td>
            <td class="cell-num highlight"><strong>{summary['totalCalls']}</strong></td>
            <td class="cell-num"><strong>{summary['totalCallsAbove3Min']}</strong></td>
            <td class="cell-num"><strong>{summary['totalGroups']}</strong></td>
            <td class="cell-num"><strong>{summary['totalMembers']}</strong></td>
            <td class="cell-num"><strong>{summary['totalConversions']}</strong></td>
            <td class="cell-num text-bold"><strong>₹{summary['totalRevenue']:,}</strong></td>
            <td class="cell-remarks text-muted">Quality Ratio: {summary['qualityCallRate']}%</td>
          </tr>
        </tfoot>
        """
        table_content = f"""
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 13%;">DATE</th>
              <th style="width: 15%;">TIME / SLOT</th>
              <th style="width: 10%;">CONNECTED</th>
              <th style="width: 9%;">&gt;3 MIN</th>
              <th style="width: 8%;">GROUPS</th>
              <th style="width: 8%;">MEMBERS</th>
              <th style="width: 9%;">CONVERSIONS</th>
              <th style="width: 10%;">REVENUE</th>
              <th style="width: 18%;">REMARKS / CALLING FOCUS</th>
            </tr>
          </thead>
          <tbody>
            {table_body}
          </tbody>
          {table_footer}
        </table>
        """
    else:
        table_content = f"""
        <div class="empty-reports-card">
          <div class="empty-badge">NEWLY ONBOARDED / PENDING FIRST REPORT</div>
          <h4>No Daily Work Reports Filed In System Yet</h4>
          <p>
            Employee <strong>{name} ({emp_id})</strong> is registered in the HRMS database under <strong>{shift}</strong>.
            Daily report submission protocol has been communicated. First report submission will appear here upon completion of shift tasks.
          </p>
          <div class="empty-metric-grid">
            <div class="empty-metric-item"><span>Assigned Department</span><strong>Business Development (BDA)</strong></div>
            <div class="empty-metric-item"><span>Assigned Shift</span><strong>{shift.split(':')[0]}</strong></div>
            <div class="empty-metric-item"><span>Daily Report Requirement</span><strong>Mandatory Before Logout</strong></div>
            <div class="empty-metric-item"><span>Attendance Verification</span><strong>Face ID Enrolled</strong></div>
          </div>
        </div>
        """

    # Single Page Container
    page_html = f"""
    <div class="employee-page">
      <!-- 1. HEADER SECTION -->
      <div class="page-header">
        <div class="header-left">
          <img src="data:image/png;base64,{logo_b64}" alt="Aparaitech Logo" class="company-logo" />
          <div class="company-info">
            <h2 class="company-name">APARAITECH SOFTWARE COMPANY</h2>
            <div class="company-sub">
              ISO 9001:2015 Certified Enterprise • Corporate HRMS &amp; Sales Operations
            </div>
            <div class="company-address">
              Pune &amp; Baramati, Maharashtra • Contact: +91 9110406075 • hr@info.aparaitech.org
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="dossier-ref">REF: APC/DWR/2026/{emp_id}</div>
          <div class="dossier-date">DATE: 21 OCT 2026</div>
          <div class="dossier-type">OFFICIAL AUDIT COPY</div>
        </div>
      </div>

      <div class="divider-line"></div>

      <!-- 2. DOCUMENT TITLE BANNER -->
      <div class="title-banner">
        <div class="banner-title">BDA EMPLOYEE DAILY WORK REPORT DOSSIER</div>
        <div class="banner-badge" style="color: {c_color}; background: {c_bg}; border-color: {c_border};">
          {c_label}
        </div>
      </div>

      <!-- 3. EMPLOYEE DETAILS CARD -->
      <div class="emp-profile-card">
        <div class="emp-profile-col">
          <div class="label">EMPLOYEE NAME &amp; ID</div>
          <div class="val-name">{name} <span class="id-pill">{emp_id}</span></div>
          <div class="sub-val">Designation: <strong>Business Development Associate</strong></div>
        </div>
        <div class="emp-profile-col">
          <div class="label">DEPARTMENT &amp; SHIFT</div>
          <div class="val">Department: <strong>BDA (Sales &amp; Outreach)</strong></div>
          <div class="sub-val">{shift}</div>
        </div>
        <div class="emp-profile-col">
          <div class="label">CONTACT &amp; JOINING</div>
          <div class="val">Email: <strong>{email}</strong></div>
          <div class="sub-val">Phone: <strong>{phone}</strong> • Joined: <strong>{join_date}</strong></div>
        </div>
      </div>

      <!-- 4. EXECUTIVE PERFORMANCE SCORECARD -->
      <div class="kpi-scorecard">
        <div class="kpi-tile">
          <div class="kpi-label">TOTAL REPORTS</div>
          <div class="kpi-num highlight-blue">{summary['totalReports']}</div>
          <div class="kpi-sub">{summary['presentDays']} Days Active</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">CONNECTED CALLS</div>
          <div class="kpi-num">{summary['totalCalls']}</div>
          <div class="kpi-sub">Outreach Dials</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">QUALITY CALLS (&gt;3M)</div>
          <div class="kpi-num">{summary['totalCallsAbove3Min']}</div>
          <div class="kpi-sub">{summary['qualityCallRate']}% Quality Ratio</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">COMMUNITIES</div>
          <div class="kpi-num">{summary['totalGroups']}</div>
          <div class="kpi-sub">{summary['totalMembers']} Total Members</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">CONVERSIONS &amp; REV</div>
          <div class="kpi-num highlight-green">{summary['totalConversions']}</div>
          <div class="kpi-sub">₹{summary['totalRevenue']:,} Generated</div>
        </div>
      </div>

      <!-- 5. DAILY REPORT TABLE / LOG -->
      <div class="table-container">
        <div class="table-header-title">
          <span>DAILY REPORT SUBMISSIONS LOG ({summary['totalReports']} RECORDED SUBMISSIONS)</span>
          <span class="table-legend">DWR: Standard Report • Logout: EOD Checkout Report</span>
        </div>
        {table_content}
      </div>

      <!-- 6. AUDIT NOTES & HR VERIFICATION -->
      <div class="audit-strip">
        <div class="audit-item">
          <strong>Compliance Assessment:</strong> {name} has logged {summary['totalReports']} verified reports. Attendance records cross-checked with Face ID Biometrics.
        </div>
        <div class="audit-item">
          <strong>Performance Rating:</strong> Quality pitch ratio is {summary['qualityCallRate']}%. Daily reporting status is verified under {shift.split(':')[0]}.
        </div>
      </div>

      <!-- 7. SIGNATURES & OFFICIAL SEAL -->
      <div class="footer-sign-section">
        <div class="sign-box">
          <div class="sign-space"></div>
          <div class="sign-line"></div>
          <div class="sign-name">{name}</div>
          <div class="sign-role">Employee / BDA Signature</div>
        </div>

        <div class="stamp-box">
          <img src="data:image/png;base64,{stamp_b64}" alt="Aparaitech Corporate Stamp" class="stamp-img" />
          <div class="stamp-label">VERIFIED &amp; CERTIFIED</div>
        </div>

        <div class="sign-box">
          <div class="sign-space"></div>
          <div class="sign-line"></div>
          <div class="sign-name">Anurag Nand</div>
          <div class="sign-role">Team Lead &amp; Operations Authority</div>
        </div>
      </div>

      <!-- 8. BOTTOM DISCLAIMER -->
      <div class="page-bottom-disclaimer">
        <span>Aparaitech Software Company • Baramati &amp; Pune, MH • Confidential Official Audit Document</span>
        <span>Page 1 of 1 • System Generated: 21-10-2026</span>
      </div>
    </div>
    """
    pages_html.append(page_html)

full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aparaitech BDA Employees Daily Work Reports Dossier</title>
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
    html, body {{
      width: 210mm;
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}
    .employee-page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      background: #ffffff;
      padding: 7mm 10mm 6mm 10mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }}

    /* 1. Header */
    .page-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 5px;
    }}
    .header-left {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .company-logo {{
      width: 48px;
      height: 48px;
      object-fit: contain;
    }}
    .company-name {{
      font-size: 13.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      line-height: 1.1;
    }}
    .company-sub {{
      font-size: 7.2pt;
      color: #0284c7;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-top: 1px;
    }}
    .company-address {{
      font-size: 7pt;
      color: #64748b;
      margin-top: 1px;
    }}
    .header-right {{
      text-align: right;
      font-size: 7.5pt;
      color: #334155;
    }}
    .dossier-ref {{
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
      font-size: 8.5pt;
    }}
    .dossier-date {{
      color: #64748b;
      font-weight: 600;
      margin-top: 1px;
    }}
    .dossier-type {{
      display: inline-block;
      margin-top: 2px;
      background: #0f172a;
      color: #ffffff;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 6.5pt;
      font-weight: 800;
      letter-spacing: 0.05em;
    }}

    .divider-line {{
      height: 2.5px;
      background: linear-gradient(90deg, #0284c7 0%, #0f172a 100%);
      margin-bottom: 5px;
      border-radius: 2px;
    }}

    /* 2. Banner */
    .title-banner {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #0284c7;
      padding: 4px 10px;
      border-radius: 5px;
      margin-bottom: 5px;
    }}
    .banner-title {{
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #0f172a;
      text-transform: uppercase;
    }}
    .banner-badge {{
      font-size: 7pt;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid transparent;
      letter-spacing: 0.03em;
    }}

    /* 3. Profile Card */
    .emp-profile-card {{
      display: grid;
      grid-template-columns: 1.3fr 1.2fr 1.5fr;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 5px;
    }}
    .emp-profile-col {{
      font-size: 7.5pt;
    }}
    .emp-profile-col .label {{
      font-size: 6.5pt;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1px;
    }}
    .val-name {{
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
    }}
    .id-pill {{
      display: inline-block;
      background: #0284c7;
      color: #ffffff;
      font-size: 6.8pt;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
      vertical-align: middle;
      margin-left: 4px;
    }}
    .emp-profile-col .val {{
      font-size: 7.8pt;
      color: #1e293b;
      line-height: 1.25;
    }}
    .emp-profile-col .sub-val {{
      font-size: 7.2pt;
      color: #475569;
      line-height: 1.25;
      margin-top: 1px;
    }}

    /* 4. Scorecard */
    .kpi-scorecard {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 5px;
    }}
    .kpi-tile {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 5px 6px;
      text-align: center;
    }}
    .kpi-label {{
      font-size: 6.2pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }}
    .kpi-num {{
      font-size: 13pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.1;
      margin: 1px 0;
    }}
    .kpi-num.highlight-blue {{
      color: #0284c7;
    }}
    .kpi-num.highlight-green {{
      color: #059669;
    }}
    .kpi-sub {{
      font-size: 6.3pt;
      color: #64748b;
      font-weight: 600;
    }}

    /* 5. Table Container */
    .table-container {{
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;
      min-height: 0;
    }}
    .table-header-title {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      font-weight: 800;
      color: #334155;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 3px;
      padding: 0 2px;
    }}
    .table-legend {{
      font-size: 6.2pt;
      color: #64748b;
      font-weight: 600;
      text-transform: none;
    }}
    .report-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 7.2pt;
      border: 1px solid #cbd5e1;
      table-layout: fixed;
    }}
    .report-table thead th {{
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 4px;
      border: 1px solid #1e293b;
      text-align: center;
    }}
    .report-table tbody td {{
      padding: 3px 4px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
      line-height: 1.2;
    }}
    .report-table tbody tr:nth-child(even) {{
      background: #f8fafc;
    }}
    .cell-date {{
      text-align: center;
      font-family: monospace;
      font-size: 7.3pt;
      color: #0f172a;
    }}
    .cell-time {{
      text-align: center;
      font-size: 6.8pt;
      color: #475569;
    }}
    .cell-num {{
      text-align: center;
      font-weight: 600;
    }}
    .cell-num.highlight {{
      font-weight: 800;
      color: #0284c7;
    }}
    .cell-remarks {{
      text-align: left;
      font-size: 6.7pt;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .slot-pill {{
      display: inline-block;
      font-size: 5.8pt;
      font-weight: 800;
      padding: 1px 3px;
      border-radius: 2px;
      margin-left: 2px;
      text-transform: uppercase;
    }}
    .slot-1 {{
      background: #e0f2fe;
      color: #0369a1;
    }}
    .slot-2 {{
      background: #fef3c7;
      color: #b45309;
    }}
    .conv-tag {{
      background: #dcfce7;
      color: #15803d;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
      display: inline-block;
    }}
    .totals-row td {{
      background: #f1f5f9;
      border-top: 2px solid #0f172a;
      font-size: 7.2pt;
      padding: 4px 4px;
      color: #0f172a;
    }}
    .text-bold {{
      font-weight: 800;
    }}
    .text-muted {{
      color: #64748b;
    }}

    /* Empty state */
    .empty-reports-card {{
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 8px;
      padding: 24px 20px;
      text-align: center;
      margin: auto 0;
    }}
    .empty-badge {{
      display: inline-block;
      background: #e2e8f0;
      color: #475569;
      font-size: 7pt;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }}
    .empty-reports-card h4 {{
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }}
    .empty-reports-card p {{
      font-size: 8pt;
      color: #64748b;
      max-width: 500px;
      margin: 0 auto 16px;
      line-height: 1.4;
    }}
    .empty-metric-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      max-width: 580px;
      margin: 0 auto;
      text-align: left;
    }}
    .empty-metric-item {{
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 7pt;
    }}
    .empty-metric-item span {{
      display: block;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 2px;
      font-size: 6.2pt;
      text-transform: uppercase;
    }}
    .empty-metric-item strong {{
      color: #0f172a;
      font-size: 7.5pt;
    }}

    /* 6. Audit Strip */
    .audit-strip {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 4px 8px;
      font-size: 6.8pt;
      color: #334155;
      margin-bottom: 5px;
      line-height: 1.25;
    }}

    /* 7. Signatures */
    .footer-sign-section {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 4px;
      border-top: 1px solid #cbd5e1;
      margin-bottom: 3px;
    }}
    .sign-box {{
      width: 32%;
      text-align: center;
    }}
    .sign-space {{
      height: 24px;
    }}
    .sign-line {{
      height: 1px;
      background: #475569;
      width: 80%;
      margin: 0 auto 4px;
    }}
    .sign-name {{
      font-size: 7.5pt;
      font-weight: 800;
      color: #0f172a;
    }}
    .sign-role {{
      font-size: 6.3pt;
      color: #64748b;
      font-weight: 600;
    }}
    .stamp-box {{
      width: 25%;
      text-align: center;
    }}
    .stamp-img {{
      height: 44px;
      object-fit: contain;
      margin-bottom: -4px;
    }}
    .stamp-label {{
      font-size: 5.8pt;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.05em;
    }}

    /* 8. Disclaimer */
    .page-bottom-disclaimer {{
      display: flex;
      justify-content: space-between;
      font-size: 6.2pt;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 2px;
    }}
  </style>
</head>
<body>
{"".join(pages_html)}
</body>
</html>
"""

html_out_path = os.path.join(base_dir, "Aparaitech_All_BDA_Daily_Reports.html")
with open(html_out_path, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"Generated master HTML with {len(pages_html)} employee pages: {html_out_path}")

# 2. Compile to Master PDF via Chrome Headless
pdf_out_path = os.path.join(base_dir, "Aparaitech_All_BDA_Daily_Reports.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_profile = os.path.join(base_dir, "temp_chrome_profile_bda_reports")
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

print("Rendering master PDF with Chrome headless...")
res = subprocess.run(chrome_cmd, capture_output=True, text=True)

if not os.path.exists(pdf_out_path):
    print(f"ERROR: Failed to generate PDF. Chrome output:\n{res.stderr}\n{res.stdout}")
    exit(1)

print(f"SUCCESS: Generated Master PDF at {pdf_out_path} (Size: {os.path.getsize(pdf_out_path):,} bytes)")

# 3. Verify Page Count and Split into Individual PDFs
doc = pymupdf.open(pdf_out_path)
total_pages = len(doc)
print(f"\n=== PDF PAGE COUNT VERIFICATION ===")
print(f"Total Employees: {len(employees)}")
print(f"Total Pages in Master PDF: {total_pages}")

if total_pages == len(employees):
    print(">>> PERFECT 1:1 MATCH: Exactly 1 single page per employee! <<<")
else:
    print(f">>> WARNING: Expected {len(employees)} pages, but got {total_pages} pages! Check for overflow! <<<")

# Create individual PDFs directory
indiv_dir = os.path.join(base_dir, "bda_individual_reports_pdf")
os.makedirs(indiv_dir, exist_ok=True)

print(f"\nExtracting individual single-page PDFs into '{indiv_dir}'...")
for i, emp in enumerate(employees):
    if i >= total_pages:
        break
    # Clean filename
    clean_name = "".join(c for c in emp["name"] if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    single_pdf_name = f"{emp['empId']}_{clean_name}_Daily_Report.pdf"
    single_pdf_path = os.path.join(indiv_dir, single_pdf_name)

    single_doc = pymupdf.open()
    single_doc.insert_pdf(doc, from_page=i, to_page=i)
    single_doc.save(single_pdf_path)
    single_doc.close()

print(f"Successfully generated {min(len(employees), total_pages)} individual 1-page employee PDFs!")

# 4. Generate Previews for Artifact Inspection
preview_dir = os.path.join(base_dir, "assets")
os.makedirs(preview_dir, exist_ok=True)

# Preview 1: High-volume employee (Page 3 or 4: Dnyaneshwari or Shraddha with 14 reports)
pix_14 = doc[3].get_pixmap(dpi=200)
preview_14_path = os.path.join(preview_dir, "bda_report_sample_14_days.png")
pix_14.save(preview_14_path)

# Preview 2: First page (Disha Kale)
pix_first = doc[0].get_pixmap(dpi=200)
preview_first_path = os.path.join(preview_dir, "bda_report_sample_disha_kale.png")
pix_first.save(preview_first_path)

# Preview 3: Onboarding / Phase 2 employee with 0 reports (e.g. Sakshi Pujari, page 15)
pix_empty = doc[15].get_pixmap(dpi=200)
preview_empty_path = os.path.join(preview_dir, "bda_report_sample_onboarding.png")
pix_empty.save(preview_empty_path)

print(f"\nGenerated Preview Images:")
print(f" - {preview_14_path}")
print(f" - {preview_first_path}")
print(f" - {preview_empty_path}")

