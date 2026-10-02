import React, { useState, useEffect } from 'react'
import { attendanceAPI, holidayAPI, faceAPI } from '../services/api'
import { API_URL } from '../services/api'
import ChangePwdModal from './ChangePwdModal'
import FaceVerificationModal from './FaceVerificationModal'
import EmployeeProfileModal from './EmployeeProfileModal'
import { SHIFTS, GEOFENCE } from '../utils/shiftsAndGeo'

function EmployeePanel({ currentUser, setCurrentUser, showToast }) {
  const [history, setHistory] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [isPwdOpen, setIsPwdOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [holidays, setHolidays] = useState([])

  // ── Face Verification States ─────────────────────────────────────────────────
  const [faceVerifyOpen, setFaceVerifyOpen] = useState(false)
  const [faceVerifyMode, setFaceVerifyMode] = useState('checkin') // 'checkin' | 'checkout'
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState('details')
  const [enrolledFaceUrl, setEnrolledFaceUrl] = useState(null)

  const isBda = currentUser?.department === 'BDA' || currentUser?.shift === 'shift_2' || currentUser?.shift === 'shift_3'
  const isDev = currentUser?.department === 'Development' || currentUser?.department === 'Software Development' || currentUser?.shift === 'shift_1'

  const [selectedShift, setSelectedShift] = useState(() => {
    if (isBda) {
      const now = new Date()
      const currentMin = now.getHours() * 60 + now.getMinutes()
      return currentMin >= (16 * 60 + 30) ? 'shift_3' : (currentUser?.shift === 'shift_3' ? 'shift_3' : 'shift_2')
    }
    return currentUser?.shift || (isDev ? 'shift_1' : 'shift_2')
  })

  const getTodayStr = () => new Date().toISOString().split('T')[0]
  
  const getCurrentTimeStr = () => {
    const n = new Date()
    return `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`
  }

  const fetchEmployeeData = async () => {
    try {
      const today = getTodayStr()
      const data = await attendanceAPI.getAll({ email: currentUser.email })
      const holsData = await holidayAPI.getAll({ email: currentUser.email })
      
      const records = Array.isArray(data) ? data : (data.data || data.records || [])
      setHistory(records)
      setHolidays(holsData.holidays || [])
      
      // Find today's check-in record
      const todayRec = records.find(r => r.date === today)
      setTodayRecord(todayRec || null)

      // Find if there is an active session
      const sessions = Array.isArray(data) ? [] : (data.liveSessions || [])
      const userSession = sessions.find(s => s.employeeEmail === currentUser.email)
      setActiveSession(userSession || null)
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch attendance data'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    }
  }

  useEffect(() => {
    fetchEmployeeData()
    // Fetch enrolled face status
    faceAPI.get(currentUser.email).then(d => {
      if (d.success && d.enrolled) setEnrolledFaceUrl(d.faceImageUrl)
    }).catch(() => {})

    // Poll to refresh UI state every 30 seconds
    const interval = setInterval(() => {
      fetchEmployeeData()
    }, 30000)

    return () => clearInterval(interval)
  }, [currentUser.email])

  // ── Triggered by FaceVerificationModal after successful verification ──────────
  const handleVerifiedCheckIn = async (capturedImageDataUrl, faceScore, coords) => {
    setFaceVerifyOpen(false)
    setLoading(true)
    try {
      const time = getCurrentTimeStr()
      const today = new Date().toISOString().split('T')[0]
      await attendanceAPI.checkIn(currentUser.email, time, coords, selectedShift)
      showToast(`✅ Checked in at ${time}`, '#22c55e')
      // Save photo + verification result asynchronously (non-blocking)
      if (capturedImageDataUrl) {
        faceAPI.saveAttendancePhoto(
          currentUser.email, today, 'checkin',
          capturedImageDataUrl, faceScore !== null, faceScore
        ).catch(e => console.warn('[FacePhoto] Save error:', e.message))
      }
      fetchEmployeeData()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to check in'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifiedCheckOut = async (capturedImageDataUrl, faceScore, coords) => {
    setFaceVerifyOpen(false)
    setLoading(true)
    try {
      const time = getCurrentTimeStr()
      const today = new Date().toISOString().split('T')[0]
      await attendanceAPI.checkOut(currentUser.email, time, coords)
      showToast(`✅ Checked out at ${time}`, '#22c55e')
      // Save photo + verification result asynchronously (non-blocking)
      if (capturedImageDataUrl) {
        faceAPI.saveAttendancePhoto(
          currentUser.email, today, 'checkout',
          capturedImageDataUrl, faceScore !== null, faceScore
        ).catch(e => console.warn('[FacePhoto] Save error:', e.message))
      }
      fetchEmployeeData()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to check out'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = () => {
    setFaceVerifyMode('checkin')
    setFaceVerifyOpen(true)
  }

  const handleCheckOut = () => {
    setFaceVerifyMode('checkout')
    setFaceVerifyOpen(true)
  }

  // Calculate Stats
  const totalDays = history.length
  const fullDays = history.filter(r => r.status === 'full-day').length
  const halfDays = history.filter(r => r.status === 'half-day').length
  const quarterDays = history.filter(r => r.status === 'quarter-day').length
  
  // Calculate attendance score percentage: Full=100%, Half=50%, Quarter=25%
  const attendanceScore = totalDays 
    ? Math.round(((fullDays * 1 + halfDays * 0.5 + quarterDays * 0.25) / totalDays) * 100) 
    : 0

  return (
    <div id="employeePanel">
      {/* Today's Attendance Card */}
      <div className="today-card">
        <h3><i className="fas fa-calendar-day" style={{ marginRight: '8px' }}></i> Today's Attendance Summary</h3>
        
        {(() => {
          const activeShiftKey = activeSession?.shift || selectedShift || (isDev ? 'shift_1' : 'shift_2')
          const userShift = SHIFTS[activeShiftKey] || SHIFTS.shift_2
          return (
            <>
              {isBda && !activeSession && (!todayRecord || !todayRecord.checkOut) && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                      ⚡ Select Today's Shift (Shift 2 or Shift 3)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Shift 1 is strictly for Software Developers
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedShift('shift_2')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: selectedShift === 'shift_2' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: selectedShift === 'shift_2' ? '#dcfce7' : '#ffffff',
                        color: selectedShift === 'shift_2' ? '#14532d' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: '800' }}>Shift 2: BDA Phase 1</div>
                      <div style={{ fontSize: '0.74rem' }}>11:00 AM – 05:00 PM (6 Hours)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedShift('shift_3')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: selectedShift === 'shift_3' ? '2px solid #d97706' : '1px solid #cbd5e1',
                        background: selectedShift === 'shift_3' ? '#fef3c7' : '#ffffff',
                        color: selectedShift === 'shift_3' ? '#78350f' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: '800' }}>Shift 3: BDA Phase 2</div>
                      <div style={{ fontSize: '0.74rem' }}>05:00 PM – 11:00 PM (6 Hours)</div>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                    ℹ️ BDA team can attend Shift 2 or Shift 3, but you must complete the full 6 hours of the selected shift.
                  </div>
                </div>
              )}

              <div className="today-info" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                <div>
                  <span>📅 Date: </span>
                  <strong>{getTodayStr()}</strong>
                </div>
                <div>
                  <span>⏰ Assigned Shift: </span>
                  <span style={{
                    background: userShift.color,
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {userShift.name} ({userShift.startTime} - {userShift.endTime})
                  </span>
                </div>
                <div>
                  <span>📍 Office Geofence: </span>
                  <a
                    href={GEOFENCE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 600, fontSize: '0.86rem' }}
                  >
                    {GEOFENCE.name} (200m) ↗
                  </a>
                </div>
                <div>
                  <span>🕐 Check-In: </span>
                  <strong>
                    {activeSession 
                      ? `${activeSession.checkInTime} (Active)` 
                      : (todayRecord ? todayRecord.checkIn : '—')}
                  </strong>
                </div>
                <div>
                  <span>🕒 Check-Out: </span>
                  <strong>
                    {todayRecord && todayRecord.checkOut ? todayRecord.checkOut : '—'}
                  </strong>
                </div>
                <div>
                  <span>📊 Status: </span>
                  <strong>
                    {activeSession ? (
                      '🟢 Working'
                    ) : todayRecord && todayRecord.checkOut ? (
                      <span className={`status-badge ${todayRecord.status === 'full-day' ? 'status-full' : (todayRecord.status === 'half-day' ? 'status-half' : 'status-quarter')}`}>
                        {todayRecord.status === 'full-day' ? 'Full Day' : (todayRecord.status === 'half-day' ? 'Half Day' : 'Quarter Day')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </strong>
                </div>
              </div>

              <div className="action-buttons" style={{ margin: '1rem 0 0.5rem' }}>
                <button 
                  className="btn-checkin" 
                  onClick={handleCheckIn}
                  disabled={loading || activeSession !== null || (todayRecord && todayRecord.checkOut !== '')}
                  style={{ marginRight: '1rem' }}
                >
                  <i className="fas fa-sign-in-alt" style={{ marginRight: '6px' }}></i> Check In
                </button>
                
                <button 
                  className="btn-checkout" 
                  onClick={handleCheckOut}
                  disabled={loading || activeSession === null || (todayRecord && todayRecord.checkOut !== '')}
                >
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i> Check Out
                </button>
              </div>

              <div className="rule-card">
                <small>
                  <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i> 
                  <strong>Shift Rules ({userShift.name}):</strong> Shift hours {userShift.startTime} to {userShift.endTime} ({userShift.duration}). Full Day requires completing your shift hours. Check-in/out must be verified within {GEOFENCE.allowedRadiusMeters}m of {GEOFENCE.name}.
                </small>
              </div>
            </>
          )
        })()}
      </div>

      {/* History & Stats Card */}
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i> My Attendance Stats</h2>
        </div>
        
        <div 
          className="employee-stats-summary" 
          style={{ 
            background: '#f1f5f9', 
            borderRadius: '20px', 
            padding: '1.2rem', 
            marginBottom: '1.8rem', 
            display: 'flex', 
            gap: '2.5rem', 
            flexWrap: 'wrap',
            color: '#1e293b'
          }}
        >
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>📊 Total Days</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e5a7a' }}>{totalDays}</span>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>✅ Full Days</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534' }}>{fullDays}</span>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>⚠️ Half Days</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9a3412' }}>{halfDays}</span>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>🟡 Quarter Days</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#854d0e' }}>{quarterDays}</span>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>⭐ Attendance Score</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e5a7a' }}>{attendanceScore}%</span>
          </div>
        </div>

        <h2><i className="fas fa-history" style={{ marginRight: '8px' }}></i> My Attendance History</h2>
        
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SHIFT</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>HOURS</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th>SOURCE</th>
                <th>REASON</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map(rec => {
                  let cls = 'status-pending'
                  let txt = 'Pending'
                  let badgeStyle = undefined

                  if (rec.status === 'full-day') {
                    cls = 'status-full'
                    txt = 'Full Day'
                  } else if (rec.status === 'half-day') {
                    cls = 'status-half'
                    txt = 'Half Day'
                  } else if (rec.status === 'quarter-day') {
                    cls = 'status-quarter'
                    txt = 'Quarter Day'
                  } else if (rec.status === 'holiday') {
                    cls = ''
                    txt = 'Holiday'
                    badgeStyle = { background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
                  } else if (rec.status === 'worked-on-holiday') {
                    cls = ''
                    txt = 'Worked on Holiday'
                    badgeStyle = { background: '#f3e8ff', color: '#7e22ce', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
                  }
                  
                  const sKey = rec.shift || (currentUser?.department === 'Development' ? 'shift_1' : 'shift_2')
                  const sInfo = SHIFTS[sKey] || SHIFTS.shift_1

                  return (
                    <tr key={rec._id}>
                      <td>{rec.date}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#fff',
                          background: sInfo.color
                        }}>
                          {sInfo.name.split(':')[0]}
                        </span>
                      </td>
                      <td>{rec.checkIn}</td>
                      <td>
                        {rec.checkOut || '—'}
                        {rec.logoutType === 'Admin Physical Logout' && (
                          <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 'bold', marginTop: '2px' }}>
                            [Admin Physical Logout]
                          </div>
                        )}
                      </td>
                      <td>{rec.workingHours || '—'}</td>
                      <td><span className={`status-badge ${cls}`} style={badgeStyle}>{txt}</span></td>
                      <td>
                        {rec.locationDistanceMeters !== undefined && rec.locationDistanceMeters !== null ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: rec.locationVerified ? '#166534' : '#dc2626'
                          }}>
                            {rec.locationVerified ? '📍 Office' : '⚠️ Remote'} ({rec.locationDistanceMeters}m)
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {rec.markedBy === 'Admin' ? (
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <i className="fas fa-user-shield"></i> Admin Entry
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                            Self Entry
                          </span>
                        )}
                      </td>
                      <td><small style={{ color: '#64748b' }}>{rec.statusReason || '—'}</small></td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>No personal history records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button 
            id="changePwdBtn" 
            className="g-button" 
            style={{ background: '#475569' }}
            onClick={() => setIsPwdOpen(true)}
          >
            <i className="fas fa-key" style={{ marginRight: '6px' }}></i> Change Password
          </button>
          {enrolledFaceUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '6px 12px' }}>
              <img
                src={`${API_URL}${enrolledFaceUrl}`}
                alt="Enrolled Face"
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #14b8a6' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600 }}>Face ID Enrolled ✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Automatic Checkout History */}
      <div className="section-card" style={{ borderLeft: '4px solid #1e3a8a' }}>
        <div className="section-header">
          <h2><i className="fas fa-robot" style={{ color: '#1e3a8a', marginRight: '8px' }}></i> Automatic Checkout History</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CHECK-IN TIME</th>
                <th>AUTOMATIC CHECKOUT TIME</th>
                <th>CHECKOUT TYPE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {history.filter(rec => rec.statusReason === 'System Auto Checkout').length > 0 ? (
                history
                  .filter(rec => rec.statusReason === 'System Auto Checkout')
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(rec => (
                    <tr key={rec._id}>
                      <td>{rec.date}</td>
                      <td>{rec.checkIn}</td>
                      <td><span className="status-badge status-checkedin" style={{ background: '#fef3c7', color: '#d97706' }}>🔴 {rec.checkOut}</span></td>
                      <td><span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.8rem' }}>System Auto Checkout</span></td>
                      <td><span className="status-badge" style={{ background: '#cbd5e1', color: '#1e293b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Auto Checked Out</span></td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    No automatic checkout events recorded for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Holidays Info Section */}
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-umbrella-beach" style={{ marginRight: '8px' }}></i> Declared Holidays List</h2>
        </div>
        
        {/* Upcoming Holidays List */}
        <h3 style={{ marginTop: '0.5rem', color: '#1e5a7a', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
          <i className="fas fa-bullhorn" style={{ marginRight: '8px' }}></i> Upcoming Declared Holidays
        </h3>
        <div style={{ display: 'grid', gap: '10px', marginTop: '1rem' }}>
          {holidays.filter(h => h.holidayDate >= getTodayStr()).length > 0 ? (
            holidays
              .filter(h => h.holidayDate >= getTodayStr())
              .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
              .map(h => (
                <div key={h._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ color: '#0f2b3d', fontSize: '0.9rem' }}>{h.holidayName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{h.description || 'No description provided.'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="status-badge status-full" style={{ fontSize: '0.65rem' }}>{h.holidayDate}</span>
                    <span className="status-badge status-quarter" style={{ fontSize: '0.65rem' }}>{h.holidayType}</span>
                    <span className="status-badge status-half" style={{ fontSize: '0.65rem' }}>{h.isPaidHoliday === 'Yes' ? 'Paid' : 'Unpaid'}</span>
                  </div>
                </div>
              ))
          ) : (
            <small style={{ color: '#64748b', fontStyle: 'italic' }}>No upcoming holidays declared.</small>
          )}
        </div>
      </div>

      <ChangePwdModal 
        isOpen={isPwdOpen} 
        onClose={() => setIsPwdOpen(false)} 
        email={currentUser.email} 
        showToast={showToast}
        onPasswordUpdated={(newPassword) => {
          const updatedUser = { ...currentUser, password: newPassword }
          setCurrentUser(updatedUser)
        }}
      />

      {/* Face Verification Modal — wraps check-in / check-out */}
      <FaceVerificationModal
        isOpen={faceVerifyOpen}
        onClose={() => setFaceVerifyOpen(false)}
        onVerified={faceVerifyMode === 'checkin' ? handleVerifiedCheckIn : handleVerifiedCheckOut}
        employeeEmail={currentUser.email}
        mode={faceVerifyMode}
      />

      {/* Employee Profile Modal */}
      <EmployeeProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        employee={currentUser}
        isAdmin={false}
        showToast={showToast}
        initialTab={profileTab}
        onUpdated={() => {
          // Sync changes back to currentUser in parent App state
          faceAPI.get(currentUser.email).then(d => {
            if (d.success && d.enrolled) setEnrolledFaceUrl(d.faceImageUrl)
          }).catch(() => {})
        }}
      />
    </div>
  )
}

export default EmployeePanel
