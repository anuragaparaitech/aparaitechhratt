import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { leadsAPI, employeeAPI } from '../services/api'
import { PREDEFINED_DOMAINS } from '../utils/domains'

function AIDataDistributionCenter({ currentUser, showToast }) {
  // Navigation / active sub-view: 'entry' | 'distribution' | 'reports'
  const [activeSubTab, setActiveSubTab] = useState('entry')

  // Data Entry States
  const [rawText, setRawText] = useState('')
  const [processingAI, setProcessingAI] = useState(false)
  const [manualFormOpen, setManualFormOpen] = useState(false)
  const [manualData, setManualData] = useState({
    name: '',
    mobile: '',
    email: '',
    college: '',
    domain: 'Web Development',
    priority: 'Warm'
  })

  // AI Processed Results State
  const [aiResult, setAiResult] = useState(null)
  const [selectedLeads, setSelectedLeads] = useState([])

  // Distribution States
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeEmails, setSelectedEmployeeEmails] = useState([])
  const [distributionStrategy, setDistributionStrategy] = useState('split') // 'split' | 'all'
  const [empSearchFilter, setEmpSearchFilter] = useState('')
  const [empDeptFilter, setEmpDeptFilter] = useState('All')
  const [distributeDomainFilter, setDistributeDomainFilter] = useState('All')
  const [assigning, setAssigning] = useState(false)

  // Reports & Analytics States
  const [reportsData, setReportsData] = useState(null)
  const [loadingReports, setLoadingReports] = useState(false)
  const [reportFilterEmployee, setReportFilterEmployee] = useState('')
  const [reportFilterStatus, setReportFilterStatus] = useState('All')
  const [reportSearch, setReportSearch] = useState('')
  const [reportPage, setReportPage] = useState(1)

  // Fetch employees for dropdown & reports
  useEffect(() => {
    fetchEmployeesList()
    fetchReports()
  }, [])

  const fetchEmployeesList = async () => {
    try {
      const data = await employeeAPI.getAll()
      const list = data.employees || []
      setEmployees(list)
      if (list.length > 0 && selectedEmployeeEmails.length === 0) {
        // Default: select BDA employees if available, otherwise first employee
        const bdaEmps = list.filter(e => (e.department || '').toUpperCase() === 'BDA')
        if (bdaEmps.length > 0) {
          setSelectedEmployeeEmails(bdaEmps.map(e => e.email))
        } else {
          setSelectedEmployeeEmails([list[0].email])
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  // Quick Selection Helpers
  const handleSelectAllEmployees = () => {
    setSelectedEmployeeEmails(employees.map(e => e.email))
  }

  const handleSelectBDAEmployees = () => {
    const bdaList = employees.filter(e => (e.department || '').toUpperCase() === 'BDA')
    if (bdaList.length > 0) {
      setSelectedEmployeeEmails(bdaList.map(e => e.email))
    } else {
      setSelectedEmployeeEmails(employees.map(e => e.email))
    }
  }

  const handleClearSelectedEmployees = () => {
    setSelectedEmployeeEmails([])
  }

  const toggleSelectEmployee = (email) => {
    setSelectedEmployeeEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    )
  }

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const params = {
        page: reportPage,
        limit: 25
      }
      if (reportFilterEmployee) params.employeeEmail = reportFilterEmployee
      if (reportFilterStatus !== 'All') params.status = reportFilterStatus
      if (reportSearch) params.search = reportSearch

      const res = await leadsAPI.getAdminStats(params)
      if (res.success) {
        setReportsData(res)
      }
    } catch (err) {
      console.error('Error fetching lead reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    if (activeSubTab === 'reports') {
      fetchReports()
    }
  }, [activeSubTab, reportFilterEmployee, reportFilterStatus, reportSearch, reportPage])

  // Sample Raw Data for Quick Testing
  const sampleData = `Rahul Sharma 9876543210 rahul.sharma@gmail.com COEP Pune Web Dev immediate joining
Aditya Kulkarni +91 91234 56789 aditya.k@yahoo.com PICT AI ML
Pooja Patil 9890123456 poojap@gmail.com MIT WPU Data Science
Saurabh Deshmukh saurabh.d@gmail.com VIT Pune Cloud DevOps
Snehal Jadhav 9988776655 PCCOE Web Development
Kunal Verma 9765432109 kunal@outlook.com DY Patil Cybersecurity
Pooja Patil 9890123456 poojap@gmail.com MIT WPU (Duplicate Row)`

  const handleLoadSample = () => {
    setRawText(sampleData)
    if (showToast) showToast('📋 Sample raw calling leads loaded!', '#0d9488')
  }

  // Handle File Upload (CSV / XLSX / XLS)
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (data.length === 0) {
          if (showToast) showToast('⚠️ Uploaded spreadsheet is empty', '#eab308')
          return
        }

        // Convert rows to lines for AI processing
        const lines = data.map(row => {
          return Object.entries(row)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        }).join('\n')

        setRawText(lines)
        if (showToast) showToast(`✅ Uploaded ${data.length} records from ${file.name}! Click "Process with AI"`, '#16a34a')
      } catch (err) {
        console.error('File parse error:', err)
        if (showToast) showToast('❌ Failed to parse spreadsheet file', '#dc2626')
      }
    }
    reader.readAsBinaryString(file)
  }

  // Run AI Processing Engine
  const handleProcessWithAI = async () => {
    if (!rawText.trim()) {
      if (showToast) showToast('⚠️ Please paste raw text or upload a file first', '#eab308')
      return
    }

    setProcessingAI(true)
    try {
      const res = await leadsAPI.processAI(rawText)
      if (res.success) {
        setAiResult(res)
        // Select all clean records by default
        setSelectedLeads(res.records.map((_, idx) => idx))
        setActiveSubTab('entry')
        if (showToast) {
          showToast(`✨ AI Engine Cleaned ${res.cleanRecordsCount} leads! (${res.duplicateCount} duplicates removed)`, '#16a34a')
        }
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || 'AI processing failed'
      if (showToast) showToast(`❌ ${msg}`, '#dc2626')
    } finally {
      setProcessingAI(false)
    }
  }

  // Add Manual Entry to AI results
  const handleAddManualLead = (e) => {
    e.preventDefault()
    if (!manualData.name) {
      if (showToast) showToast('⚠️ Lead name is required', '#eab308')
      return
    }

    const newLead = {
      ...manualData,
      cleanMobile: manualData.mobile.replace(/\D/g, ''),
      rawText: `${manualData.name} ${manualData.mobile} ${manualData.email} ${manualData.college} ${manualData.domain}`,
      missingFields: [],
      priorityScore: manualData.priority === 'Hot' ? 90 : (manualData.priority === 'Cold' ? 20 : 60),
      status: 'Not Called'
    }

    if (!newLead.cleanMobile) newLead.missingFields.push('mobile')
    if (!newLead.email) newLead.missingFields.push('email')
    if (!newLead.college) newLead.missingFields.push('college')

    setAiResult(prev => {
      const existing = prev ? prev.records : []
      const updated = [newLead, ...existing]
      return {
        ...(prev || {}),
        success: true,
        cleanRecordsCount: updated.length,
        records: updated
      }
    })

    setSelectedLeads(prev => [0, ...prev.map(i => i + 1)])
    setManualFormOpen(false)
    setManualData({
      name: '',
      mobile: '',
      email: '',
      college: '',
      domain: 'Web Development',
      priority: 'Warm'
    })
    if (showToast) showToast('✅ Manual lead added to clean batch!', '#16a34a')
  }

  // Toggle selection
  const toggleSelectLead = (index) => {
    setSelectedLeads(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const toggleSelectAll = () => {
    if (!aiResult?.records) return
    if (selectedLeads.length === aiResult.records.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(aiResult.records.map((_, i) => i))
    }
  }

  const removeLeadFromBatch = (indexToRemove) => {
    if (!aiResult?.records) return
    const updated = aiResult.records.filter((_, i) => i !== indexToRemove)
    setAiResult(prev => ({
      ...prev,
      cleanRecordsCount: updated.length,
      records: updated
    }))
    setSelectedLeads(prev => prev.filter(i => i !== indexToRemove).map(i => (i > indexToRemove ? i - 1 : i)))
  }

  // Filter leads for distribution
  const getLeadsToDistribute = () => {
    if (!aiResult?.records) return []
    let list = aiResult.records.filter((_, idx) => selectedLeads.includes(idx))
    if (distributeDomainFilter !== 'All') {
      list = list.filter(l => l.domain === distributeDomainFilter)
    }
    return list
  }

  // Execute Distribution to Employee(s)
  const handleAssignLeads = async () => {
    const leadsToAssign = getLeadsToDistribute()

    if (selectedEmployeeEmails.length === 0) {
      if (showToast) showToast('⚠️ Please select at least one employee', '#eab308')
      return
    }

    if (leadsToAssign.length === 0) {
      if (showToast) showToast('⚠️ No leads selected to assign. Check your selection and filters.', '#eab308')
      return
    }

    const targetEmpObjs = employees.filter(e => selectedEmployeeEmails.includes(e.email))
    const targetEmployees = targetEmpObjs.map(e => ({
      email: e.email,
      name: e.name,
      empId: e.empId || 'EMP',
      department: e.department || 'BDA'
    }))

    setAssigning(true)
    try {
      const res = await leadsAPI.assignLeads({
        targetEmployees,
        distributionMode: distributionStrategy,
        leads: leadsToAssign
      })

      if (res.success) {
        if (showToast) {
          showToast(`🚀 ${res.message || `Successfully distributed ${res.count} clean leads!`}`, '#16a34a')
        }
        // Remove assigned leads from current AI staging results
        const assignedSet = new Set(leadsToAssign)
        const remaining = (aiResult?.records || []).filter(l => !assignedSet.has(l))
        setAiResult(prev => ({
          ...prev,
          cleanRecordsCount: remaining.length,
          records: remaining
        }))
        setSelectedLeads(remaining.map((_, i) => i))
        // Refresh reports
        fetchReports()
        // Switch to reports view to show updated metrics
        setActiveSubTab('reports')
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || 'Failed to distribute leads'
      if (showToast) showToast(`❌ ${msg}`, '#dc2626')
    } finally {
      setAssigning(false)
    }
  }

  // Export to Excel for Reports
  const handleExportReports = () => {
    if (!reportsData?.leads || reportsData.leads.length === 0) {
      if (showToast) showToast('⚠️ No lead records to export', '#eab308')
      return
    }

    const exportRows = reportsData.leads.map(l => ({
      'Lead Name': l.name,
      'Mobile': l.mobile,
      'Email': l.email || '—',
      'College': l.college,
      'Domain': l.domain,
      'Priority': l.priority,
      'Call Status': l.status,
      'Call Notes / Remarks': l.callNotes || '—',
      'Called Date': l.calledAt ? new Date(l.calledAt).toLocaleString('en-IN') : '—',
      'Assigned Employee': l.assignedTo?.name || '—',
      'Employee Email': l.assignedTo?.email || '—',
      'Batch ID': l.batchId || '—',
      'Date Distributed': new Date(l.createdAt).toLocaleDateString('en-IN')
    }))

    const ws = XLSX.utils.json_to_sheet(exportRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Distributed_Leads')
    XLSX.writeFile(wb, `Aparaitech_Lead_Distribution_${new Date().toISOString().slice(0, 10)}.xlsx`)

    if (showToast) showToast('📥 Exported leads report to Excel!', '#16a34a')
  }

  const selectedEmployeesList = employees.filter(e => selectedEmployeeEmails.includes(e.email))
  const selectedEmployeeObj = selectedEmployeesList[0] || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ── Header AI Engine Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #091a28 0%, #0f3443 50%, #34e89e 100%)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 12px 28px -6px rgba(15, 52, 67, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(52, 232, 158, 0.2)',
            border: '1px solid rgba(52, 232, 158, 0.5)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.74rem',
            fontWeight: '800',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            color: '#a7f3d0'
          }}>
            <i className="fas fa-brain"></i> APARAITECH AI DATA ENGINE 2.0
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
            AI-Powered Calling Data Distribution
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '650px', lineHeight: 1.5 }}>
            Insert unstructured student or client leads. The AI automatically cleans, standardizes (+91 mobile, title case, college expansion), removes duplicates, scores priority, and distributes directly to employees.
          </p>
        </div>

        {/* Action Pills Navigation */}
        <div style={{ display: 'flex', gap: '8px', zIndex: 1, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('entry')}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              border: activeSubTab === 'entry' ? '2px solid #34e89e' : '1px solid rgba(255, 255, 255, 0.25)',
              background: activeSubTab === 'entry' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: activeSubTab === 'entry' ? '#0f3443' : '#ffffff',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSubTab === 'entry' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            <i className="fas fa-magic"></i> 1. Ingest & AI Process
          </button>

          <button
            onClick={() => setActiveSubTab('distribution')}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              border: activeSubTab === 'distribution' ? '2px solid #34e89e' : '1px solid rgba(255, 255, 255, 0.25)',
              background: activeSubTab === 'distribution' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: activeSubTab === 'distribution' ? '#0f3443' : '#ffffff',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-paper-plane"></i> 2. Distribute to Staff {aiResult?.records?.length ? `(${selectedLeads.length})` : ''}
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              border: activeSubTab === 'reports' ? '2px solid #34e89e' : '1px solid rgba(255, 255, 255, 0.25)',
              background: activeSubTab === 'reports' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: activeSubTab === 'reports' ? '#0f3443' : '#ffffff',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-chart-pie"></i> 3. Analytics & Progress
          </button>
        </div>
      </div>

      {/* ── VIEW 1: DATA ENTRY & AI PROCESSING ───────────────────────── */}
      {activeSubTab === 'entry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Input Options Card */}
          <div className="section-card">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2><i className="fas fa-keyboard" style={{ color: '#0f766e', marginRight: '8px' }}></i> Raw Calling Data Input</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Paste random unstructured notes, messy WhatsApp leads, or upload CSV / Excel spreadsheet
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-file-alt" style={{ color: '#0284c7' }}></i> Load Sample Data
                </button>

                {/* Spreadsheet Upload */}
                <label style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="fas fa-file-excel" style={{ color: '#16a34a' }}></i>
                  Upload CSV / Excel
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Manual Lead Add Toggle */}
                <button
                  type="button"
                  onClick={() => setManualFormOpen(v => !v)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: manualFormOpen ? '#eff6ff' : '#ffffff',
                    color: '#1d4ed8',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-user-plus"></i> Manual Single Lead
                </button>
              </div>
            </div>

            {/* Manual Form Accordion */}
            {manualFormOpen && (
              <form onSubmit={handleAddManualLead} style={{
                background: '#f8fafc',
                border: '1.5px dashed #93c5fd',
                borderRadius: '14px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Candidate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={manualData.name}
                    onChange={e => setManualData({ ...manualData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={manualData.mobile}
                    onChange={e => setManualData({ ...manualData, mobile: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={manualData.email}
                    onChange={e => setManualData({ ...manualData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. COEP Pune"
                    value={manualData.college}
                    onChange={e => setManualData({ ...manualData, college: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Domain Interest</label>
                  <select
                    value={manualData.domain}
                    onChange={e => setManualData({ ...manualData, domain: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  >
                    {PREDEFINED_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="fas fa-check"></i> Add to Batch
                  </button>
                </div>
              </form>
            )}

            {/* Big Unstructured Textarea */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <textarea
                rows={7}
                placeholder={`Paste messy unstructured text here. Formats can be anything:
• "Rahul 9876543210 rahul@gmail.com COEP Web Dev urgent"
• "aditya kulkarni aditya@gmail.com 919876543210 PICT AI ML"
• Tab-separated columns copied from Google Sheets or Excel
• Multi-line chat logs or student inquiry dumps`}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#0f766e'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '15px',
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {rawText ? `${rawText.split('\n').filter(Boolean).length} lines detected` : 'Empty input'}
              </div>
            </div>

            {/* Process Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <i className="fas fa-info-circle" style={{ color: '#0284c7', marginRight: '5px' }}></i>
                AI Engine automatically extracts Mobile (+91), Email, Title Case Name, College abbreviation expansion, and Domain.
              </div>

              <button
                type="button"
                onClick={handleProcessWithAI}
                disabled={processingAI || !rawText.trim()}
                style={{
                  padding: '11px 26px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: processingAI || !rawText.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                {processingAI ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    AI Engine Analyzing & Cleaning...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt"></i>
                    Process With AI Engine
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── AI Processing Results Preview ──────────────────────────── */}
          {aiResult && (
            <div className="section-card" style={{ borderLeft: '4px solid #0d9488' }}>
              <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase', marginBottom: '2px' }}>
                    <i className="fas fa-check-circle"></i> AI PROCESSING COMPLETE
                  </div>
                  <h2>Standardized & Cleaned Leads Preview</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('distribution')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    Proceed to Distribute ({selectedLeads.length}) <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL RAW INPUTS</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a' }}>{aiResult.totalRawInput}</div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700' }}>CLEAN STANDARDIZED</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803d' }}>{aiResult.cleanRecordsCount}</div>
                </div>

                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: '700' }}>DUPLICATES REMOVED</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#d97706' }}>{aiResult.duplicateCount}</div>
                </div>

                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: '700' }}>MISSING FIELDS FLAGGED</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#dc2626' }}>{aiResult.missingFieldRecordsCount}</div>
                </div>
              </div>

              {/* Interactive Staging Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={aiResult.records.length > 0 && selectedLeads.length === aiResult.records.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>CANDIDATE NAME</th>
                      <th>MOBILE (+91 FORMAT)</th>
                      <th>EMAIL</th>
                      <th>COLLEGE (EXPANDED)</th>
                      <th>DOMAIN (STANDARDIZED)</th>
                      <th>PRIORITY</th>
                      <th>MISSING FIELDS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiResult.records.length > 0 ? (
                      aiResult.records.map((lead, idx) => (
                        <tr key={idx} style={{ background: selectedLeads.includes(idx) ? '#ffffff' : '#f8fafc' }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(idx)}
                              onChange={() => toggleSelectLead(idx)}
                            />
                          </td>
                          <td>
                            <strong>{lead.name}</strong>
                          </td>
                          <td>
                            {lead.cleanMobile ? (
                              <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                                {lead.mobile}
                              </span>
                            ) : (
                              <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>⚠️ Missing Mobile</span>
                            )}
                          </td>
                          <td>
                            {lead.email ? (
                              <span style={{ color: '#2563eb' }}>{lead.email}</span>
                            ) : (
                              <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontStyle: 'italic' }}>— Missing</span>
                            )}
                          </td>
                          <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span title={lead.college}>{lead.college}</span>
                          </td>
                          <td>
                            <span style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              whiteSpace: 'nowrap'
                            }}>
                              {lead.domain}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: lead.priority === 'Hot' ? '#fee2e2' : (lead.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                              color: lead.priority === 'Hot' ? '#b91c1c' : (lead.priority === 'Warm' ? '#b45309' : '#475569'),
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '800'
                            }}>
                              {lead.priority === 'Hot' ? '🔥 Hot' : (lead.priority === 'Warm' ? '⚡ Warm' : '❄️ Cold')}
                            </span>
                          </td>
                          <td>
                            {lead.missingFields && lead.missingFields.length > 0 ? (
                              lead.missingFields.map(f => (
                                <span key={f} style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: '700',
                                  marginRight: '4px'
                                }}>
                                  {f}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#16a34a', fontSize: '0.72rem', fontWeight: '700' }}>✓ Complete</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeLeadFromBatch(idx)}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                              title="Remove from this batch"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                          No leads in current batch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: EMPLOYEE DISTRIBUTION ────────────────────────────── */}
      {activeSubTab === 'distribution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="section-card">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2><i className="fas fa-share-alt" style={{ color: '#2563eb', marginRight: '8px' }}></i> Distribute Leads to Team Members</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Select single, multiple, or all employees and assign clean calling data with one click. Associates will immediately see these in "Company Assign Data".
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('entry')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-arrow-left"></i> Back to AI Ingest
                </button>
              </div>
            </div>

            {/* Distribution Assignment Controls Box */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Row 1: Target Selection Toolbar & Picker */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-users-cog" style={{ color: '#2563eb' }}></i>
                    Target Associates / Employees <span style={{ color: '#ef4444' }}>*</span>
                    <span style={{
                      background: selectedEmployeeEmails.length === employees.length && employees.length > 0 ? '#dcfce7' : '#eff6ff',
                      color: selectedEmployeeEmails.length === employees.length && employees.length > 0 ? '#15803d' : '#1d4ed8',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {selectedEmployeeEmails.length === employees.length && employees.length > 0
                        ? `🌟 All ${employees.length} Selected`
                        : `${selectedEmployeeEmails.length} of ${employees.length} Selected`}
                    </span>
                  </label>

                  {/* Quick selection action buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleSelectAllEmployees}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: selectedEmployeeEmails.length === employees.length && employees.length > 0 ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedEmployeeEmails.length === employees.length && employees.length > 0 ? '#2563eb' : '#ffffff',
                        color: selectedEmployeeEmails.length === employees.length && employees.length > 0 ? '#ffffff' : '#1e293b',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <i className="fas fa-check-double"></i> Send to All ({employees.length})
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectBDAEmployees}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid #a7f3d0',
                        background: '#ecfdf5',
                        color: '#047857',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <i className="fas fa-briefcase"></i> BDA Team Only ({employees.filter(e => (e.department || '').toUpperCase() === 'BDA').length})
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelectedEmployees}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search & Department filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 160px', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8', fontSize: '0.82rem' }}></i>
                    <input
                      type="text"
                      placeholder="Search employee by name, ID, or email..."
                      value={empSearchFilter}
                      onChange={e => setEmpSearchFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <select
                    value={empDeptFilter}
                    onChange={e => setEmpDeptFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="All">All Departments</option>
                    <option value="BDA">BDA Only</option>
                    <option value="SOFTWARE">Software Only</option>
                    <option value="HR">HR Only</option>
                  </select>
                </div>

                {/* Scrollable employee checkboxes grid */}
                <div style={{
                  maxHeight: '190px',
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: '#ffffff',
                  padding: '6px'
                }}>
                  {employees
                    .filter(emp => {
                      const matchesSearch = !empSearchFilter ||
                        (emp.name || '').toLowerCase().includes(empSearchFilter.toLowerCase()) ||
                        (emp.email || '').toLowerCase().includes(empSearchFilter.toLowerCase()) ||
                        (emp.empId || '').toLowerCase().includes(empSearchFilter.toLowerCase())
                      const matchesDept = empDeptFilter === 'All' || (emp.department || '').toUpperCase() === empDeptFilter.toUpperCase()
                      return matchesSearch && matchesDept
                    })
                    .map(emp => {
                      const isSelected = selectedEmployeeEmails.includes(emp.email)
                      return (
                        <div
                          key={emp.email}
                          onClick={() => toggleSelectEmployee(emp.email)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            background: isSelected ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                                {emp.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {emp.email} • {emp.empId || 'EMP'}
                              </div>
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: (emp.department || '').toUpperCase() === 'BDA' ? '#dcfce7' : '#f1f5f9',
                            color: (emp.department || '').toUpperCase() === 'BDA' ? '#15803d' : '#475569'
                          }}>
                            {emp.department || 'Associate'}
                          </span>
                        </div>
                      )
                    })}
                </div>

                {/* Selected tags chip strip */}
                {selectedEmployeeEmails.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>Active Selected:</span>
                    {selectedEmployeeEmails.map(email => {
                      const emp = employees.find(e => e.email === email)
                      return (
                        <span
                          key={email}
                          style={{
                            background: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {emp?.name || email.split('@')[0]}
                          <i
                            className="fas fa-times"
                            style={{ cursor: 'pointer', opacity: 0.7 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelectEmployee(email)
                            }}
                          ></i>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Row 2: Distribution Strategy & Domain Filter & Calculation & Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #e2e8f0'
              }}>
                {/* Distribution Strategy */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    ⚡ Distribution Method
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDistributionStrategy('split')}
                      style={{
                        flex: 1,
                        padding: '9px 10px',
                        borderRadius: '10px',
                        border: distributionStrategy === 'split' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: distributionStrategy === 'split' ? '#eff6ff' : '#ffffff',
                        color: distributionStrategy === 'split' ? '#1d4ed8' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: '800' }}>⚡ Split Evenly</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Round-robin (unique leads per employee)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDistributionStrategy('all')}
                      style={{
                        flex: 1,
                        padding: '9px 10px',
                        borderRadius: '10px',
                        border: distributionStrategy === 'all' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: distributionStrategy === 'all' ? '#eff6ff' : '#ffffff',
                        color: distributionStrategy === 'all' ? '#1d4ed8' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: '800' }}>📋 Send to All</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Full batch to each selected associate</div>
                    </button>
                  </div>
                </div>

                {/* Filter by Domain */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    🎯 Filter Domain (Optional)
                  </label>
                  <select
                    value={distributeDomainFilter}
                    onChange={e => setDistributeDomainFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="All">All Domains ({selectedLeads.length} leads selected)</option>
                    {PREDEFINED_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Calculation & Summary Box */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase' }}>
                    READY TO DISTRIBUTE
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1d4ed8' }}>
                    {getLeadsToDistribute().length} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6' }}>Leads</span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 6px' }}>→</span>
                    {selectedEmployeeEmails.length} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6' }}>Staff</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '3px', fontWeight: '600' }}>
                    {selectedEmployeeEmails.length > 0 ? (
                      distributionStrategy === 'split'
                        ? `~${Math.ceil(getLeadsToDistribute().length / Math.max(1, selectedEmployeeEmails.length))} leads per associate`
                        : `All ${getLeadsToDistribute().length} leads to each associate`
                    ) : (
                      'Please select target staff'
                    )}
                  </div>
                </div>

                {/* Assign Action Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleAssignLeads}
                    disabled={assigning || getLeadsToDistribute().length === 0 || selectedEmployeeEmails.length === 0}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      cursor: assigning || getLeadsToDistribute().length === 0 || selectedEmployeeEmails.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    {assigning ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Distributing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Assign & Send ({getLeadsToDistribute().length} Leads to {selectedEmployeeEmails.length} Staff)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Leads Preview for Selected Employees */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b' }}>
                  Leads to be delivered to {
                    selectedEmployeeEmails.length === 0
                      ? 'No employee selected'
                      : (selectedEmployeeEmails.length === 1
                          ? (selectedEmployeesList[0]?.name || selectedEmployeeEmails[0])
                          : (selectedEmployeeEmails.length === employees.length
                              ? `All ${employees.length} Associates`
                              : `${selectedEmployeeEmails.length} Selected Associates`))
                  }:
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {selectedEmployeeEmails.length > 0 && distributionStrategy === 'split'
                    ? `${getLeadsToDistribute().length} leads will be split evenly across ${selectedEmployeeEmails.length} associates (~${Math.ceil(getLeadsToDistribute().length / Math.max(1, selectedEmployeeEmails.length))} each)`
                    : `${getLeadsToDistribute().length} leads will be locked to each associate's roster`}
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>MOBILE</th>
                    <th>EMAIL</th>
                    <th>COLLEGE</th>
                    <th>DOMAIN</th>
                    <th>PRIORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {getLeadsToDistribute().slice(0, 15).map((l, i) => (
                    <tr key={i}>
                      <td><strong>{l.name}</strong></td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{l.mobile || '—'}</span></td>
                      <td>{l.email || '—'}</td>
                      <td>{l.college}</td>
                      <td>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                          {l.domain}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: l.priority === 'Hot' ? '#fee2e2' : (l.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                          color: l.priority === 'Hot' ? '#b91c1c' : (l.priority === 'Warm' ? '#b45309' : '#475569'),
                          padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800'
                        }}>
                          {l.priority === 'Hot' ? '🔥 Hot' : (l.priority === 'Warm' ? '⚡ Warm' : '❄️ Cold')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {getLeadsToDistribute().length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                        No leads match current distribution filters. Go to "1. Ingest & AI Process" to stage leads.
                      </td>
                    </tr>
                  )}
                  {getLeadsToDistribute().length > 15 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic' }}>
                        + and {getLeadsToDistribute().length - 15} more leads will be assigned simultaneously...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 3: REPORTS & ANALYTICS ──────────────────────────────── */}
      {activeSubTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Performance Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL LEADS PROCESSED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                {reportsData?.stats?.totalLeads || 0}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>PENDING CALLS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ea580c', marginTop: '4px' }}>
                {reportsData?.stats?.notCalledCount || 0}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>TOTAL CALLED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                {reportsData?.stats?.calledCount || 0}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>INTERESTED LEADS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
                {reportsData?.stats?.interestedCount || 0}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase' }}>CONVERSION RATE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0d9488', marginTop: '4px' }}>
                {reportsData?.stats?.conversionRate || 0}%
              </div>
            </div>
          </div>

          {/* Employee-wise Distribution Roster */}
          <div className="section-card">
            <div className="section-header">
              <h2><i className="fas fa-users-cog" style={{ color: '#2563eb', marginRight: '8px' }}></i> Employee-wise Calling Distribution Breakdown</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>DEPARTMENT</th>
                    <th>TOTAL ASSIGNED</th>
                    <th>CALLED</th>
                    <th>PENDING</th>
                    <th>INTERESTED</th>
                    <th>NOT INTERESTED</th>
                    <th>CONVERSION %</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData?.employeeBreakdown?.length > 0 ? (
                    reportsData.employeeBreakdown.map(emp => (
                      <tr key={emp.email}>
                        <td>
                          <strong>{emp.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{emp.email} ({emp.empId})</div>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                            {emp.department}
                          </span>
                        </td>
                        <td><strong>{emp.totalAssigned}</strong></td>
                        <td><span style={{ color: '#2563eb', fontWeight: '700' }}>{emp.calledCount}</span></td>
                        <td><span style={{ color: '#ea580c', fontWeight: '700' }}>{emp.pendingCount}</span></td>
                        <td><span style={{ color: '#16a34a', fontWeight: '800' }}>{emp.interestedCount}</span></td>
                        <td><span style={{ color: '#94a3b8' }}>{emp.notInterestedCount}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '45px', background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${emp.conversionRate}%`, background: '#16a34a', height: '100%' }} />
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '0.78rem', color: '#15803d' }}>
                              {emp.conversionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        No distributed leads found. Distribute leads in Tab 2 to populate employee analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master Leads Table with Filter Controls */}
          <div className="section-card">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2><i className="fas fa-list-ul" style={{ color: '#0f766e', marginRight: '8px' }}></i> Master Leads Calling Registry</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Search and inspect live lead statuses, employee call remarks, and outcomes
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="🔍 Search name / mobile / college"
                  value={reportSearch}
                  onChange={e => setReportSearch(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '200px' }}
                />

                <select
                  value={reportFilterStatus}
                  onChange={e => setReportFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Not Called">Not Called</option>
                  <option value="Called">Called</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                </select>

                <select
                  value={reportFilterEmployee}
                  onChange={e => setReportFilterEmployee(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                >
                  <option value="">All Staff Members</option>
                  {employees.map(e => (
                    <option key={e.email} value={e.email}>{e.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportReports}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-file-excel"></i> Export Excel
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CANDIDATE</th>
                    <th>CONTACT</th>
                    <th>COLLEGE & DOMAIN</th>
                    <th>ASSIGNED TO</th>
                    <th>CALL STATUS</th>
                    <th>CALL NOTES</th>
                    <th>CALLED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingReports ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        <i className="fas fa-spinner fa-spin"></i> Loading leads registry...
                      </td>
                    </tr>
                  ) : reportsData?.leads?.length > 0 ? (
                    reportsData.leads.map(lead => (
                      <tr key={lead._id}>
                        <td>
                          <strong>{lead.name}</strong>
                          <div>
                            <span style={{
                              background: lead.priority === 'Hot' ? '#fee2e2' : (lead.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                              color: lead.priority === 'Hot' ? '#b91c1c' : (lead.priority === 'Warm' ? '#b45309' : '#475569'),
                              padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800'
                            }}>
                              {lead.priority}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{lead.mobile || '—'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>{lead.email || '—'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', fontSize: '0.82rem' }}>{lead.college}</div>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {lead.domain}
                          </span>
                        </td>
                        <td>
                          <strong>{lead.assignedTo?.name || '—'}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{lead.assignedTo?.email}</div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: '800',
                            background: lead.status === 'Interested' ? '#dcfce7' : (lead.status === 'Called' ? '#e0f2fe' : (lead.status === 'Not Interested' ? '#fee2e2' : '#f1f5f9')),
                            color: lead.status === 'Interested' ? '#15803d' : (lead.status === 'Called' ? '#0369a1' : (lead.status === 'Not Interested' ? '#b91c1c' : '#475569'))
                          }}>
                            {lead.status === 'Interested' ? '🟢 Interested' : (lead.status === 'Called' ? '🔵 Called' : (lead.status === 'Not Interested' ? '🔴 Not Interested' : '⚪ Not Called'))}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lead.callNotes || '—'}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {lead.calledAt ? new Date(lead.calledAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                        No leads match current registry filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {reportsData?.pagination && reportsData.pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  disabled={reportPage <= 1}
                  onClick={() => setReportPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: reportPage <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Page {reportPage} of {reportsData.pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={reportPage >= reportsData.pagination.pages}
                  onClick={() => setReportPage(prev => prev + 1)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: reportPage >= reportsData.pagination.pages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIDataDistributionCenter
