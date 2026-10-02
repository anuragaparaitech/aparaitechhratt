import React, { useState, useEffect } from 'react'
import { employeeAPI, holidayAPI } from '../services/api'

function HolidayFormModal({ isOpen, onClose, onHolidaySaved, holidayToEdit, showToast }) {
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayType, setHolidayType] = useState('National Holiday')
  const [description, setDescription] = useState('')
  const [branch, setBranch] = useState('All Branches')
  const [department, setDepartment] = useState('All Departments')
  const [appliesTo, setAppliesTo] = useState('All Employees')
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [isPaidHoliday, setIsPaidHoliday] = useState('Yes')
  
  const [employeesList, setEmployeesList] = useState([])
  const [loading, setLoading] = useState(false)

  // Load holiday details if editing, otherwise reset
  useEffect(() => {
    if (holidayToEdit) {
      setHolidayName(holidayToEdit.holidayName || '')
      setHolidayDate(holidayToEdit.holidayDate || '')
      setHolidayType(holidayToEdit.holidayType || 'National Holiday')
      setDescription(holidayToEdit.description || '')
      setBranch(holidayToEdit.branch || 'All Branches')
      setDepartment(holidayToEdit.department || 'All Departments')
      setAppliesTo(holidayToEdit.appliesTo || 'All Employees')
      setSelectedEmployees(holidayToEdit.employeeIds || [])
      setIsPaidHoliday(holidayToEdit.isPaidHoliday || 'Yes')
    } else {
      setHolidayName('')
      setHolidayDate('')
      setHolidayType('National Holiday')
      setDescription('')
      setBranch('All Branches')
      setDepartment('All Departments')
      setAppliesTo('All Employees')
      setSelectedEmployees([])
      setIsPaidHoliday('Yes')
    }
  }, [holidayToEdit, isOpen])

  // Fetch employees list for checklist
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeAPI.getAll()
        // Filter out admin
        const filtered = (data.employees || []).filter(e => e.role === 'employee')
        setEmployeesList(filtered)
      } catch (err) {
        console.error(err)
      }
    }
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleToggleEmployee = (email) => {
    if (selectedEmployees.includes(email)) {
      setSelectedEmployees(selectedEmployees.filter(e => e !== email))
    } else {
      setSelectedEmployees([...selectedEmployees, email])
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!holidayName.trim() || !holidayDate) {
      showToast('⚠️ Please fill in Holiday Name and Date', '#eab308')
      return
    }

    if (appliesTo === 'Selected Employees' && selectedEmployees.length === 0) {
      showToast('⚠️ Please select at least one employee', '#eab308')
      return
    }

    setLoading(true)
    try {
      const payload = {
        holidayName: holidayName.trim(),
        holidayDate,
        holidayType,
        description: description.trim(),
        branch,
        department,
        appliesTo,
        employeeIds: appliesTo === 'Selected Employees' ? selectedEmployees : [],
        isPaidHoliday,
        createdBy: 'admin@aparaitech.com' // Default admin identity
      }

      if (holidayToEdit) {
        await holidayAPI.update(holidayToEdit._id, payload)
        showToast('✅ Holiday updated successfully!', '#22c55e')
      } else {
        await holidayAPI.create(payload)
        showToast('✅ Holiday declared & emails sent!', '#22c55e')
      }

      onHolidaySaved()
      onClose()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to save holiday'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-umbrella-beach" style={{ marginRight: '8px' }}></i> 
            {holidayToEdit ? 'Edit Holiday' : 'Declare New Holiday'}
          </h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Holiday Name *</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="e.g. Independence Day" 
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                required 
              />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Holiday Date *</label>
              <input 
                type="date" 
                className="auth-input" 
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Holiday Type</label>
              <select className="auth-input" value={holidayType} onChange={(e) => setHolidayType(e.target.value)}>
                <option value="National Holiday">National Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Festival Holiday">Festival Holiday</option>
                <option value="Optional Holiday">Optional Holiday</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Applies To</label>
              <select className="auth-input" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)}>
                <option value="All Employees">All Employees</option>
                <option value="Selected Employees">Selected Employees</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Branch Scope</label>
              <select className="auth-input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="All Branches">All Branches</option>
                <option value="Headquarters">Headquarters</option>
                <option value="Pune Branch">Pune Branch</option>
                <option value="Mumbai Branch">Mumbai Branch</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}></div> {/* Spacer */}
          </div>

          {appliesTo === 'Selected Employees' && (
            <div className="input-group" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: '#f8fafc', maxHeight: '180px', overflowY: 'auto', marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Select Affected Employees:</label>
              {employeesList.length > 0 ? (
                employeesList.map(emp => (
                  <div key={emp.email} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      id={`chk-${emp.email}`}
                      checked={selectedEmployees.includes(emp.email)}
                      onChange={() => handleToggleEmployee(emp.email)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor={`chk-${emp.email}`} style={{ textTransform: 'none', fontWeight: 'normal', cursor: 'pointer', margin: 0 }}>
                      {emp.name} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({emp.email})</span>
                    </label>
                  </div>
                ))
              ) : (
                <small style={{ color: '#64748b' }}>No employees available</small>
              )}
            </div>
          )}

          <div className="input-group">
            <label>Description / Greeting Message</label>
            <textarea 
              className="auth-input" 
              placeholder="Provide holiday details, greetings, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '40px', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Saving...</span>
            ) : (
              <span><i className="fas fa-check" style={{ marginRight: '6px' }}></i> Save & Announce</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default HolidayFormModal
