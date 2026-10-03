import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import ChangePwdModal from './ChangePwdModal'
import ChangePinModal from './ChangePinModal'
import { requestNotificationPermission, popNotification, isNotificationPermissionGranted } from '../services/notificationService'

function SettingsView({ currentUser, onLogout, showToast, currentLang, onLangChange }) {
  const [lang, setLang] = useState(currentLang || localStorage.getItem('aparaitech_lang') || 'en')
  const [theme, setTheme] = useState(localStorage.getItem('aparaitech_theme') || 'light')
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)

  // Notification toggles & permission
  const [reportReminder, setReportReminder] = useState(true)
  const [taskAlerts, setTaskAlerts] = useState(true)
  const [messageAlerts, setMessageAlerts] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(true)
  const [hasNotifPermission, setHasNotifPermission] = useState(false)
  const [testingNotif, setTestingNotif] = useState(false)

  useEffect(() => {
    isNotificationPermissionGranted().then(setHasNotifPermission)
  }, [])

  const handleLanguageChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem('aparaitech_lang', newLang)
    if (onLangChange) onLangChange(newLang)
    showToast(`🌐 Language set to ${newLang === 'hi' ? 'हिंदी (Hindi)' : (newLang === 'mr' ? 'मराठी (Marathi)' : 'English')}`, '#10b981')
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('aparaitech_theme', newTheme)
    showToast(`🎨 Theme switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, '#2563eb')
  }

  const handleToggleBiometrics = () => {
    setBiometricEnabled(prev => {
      const next = !prev
      showToast(next ? '👆 Biometric authentication active for fast login' : 'Biometric authentication disabled', '#10b981')
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '850px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(10, 25, 47, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '3px 10px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
            <i className="fas fa-sliders-h"></i> PREFERENCES & SECURITY
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Portal Settings & Profile Controls
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Customize language localization, notification triggers, biometric login, and security credentials.
          </p>
        </div>
      </div>

      {/* 1. Language & Localization Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-language"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Language Selection (Localization)
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Choose your preferred interface language for navigation, reports, and controls.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            { id: 'en', name: 'English', native: 'English', desc: 'Default Corporate' },
            { id: 'hi', name: 'Hindi', native: 'हिंदी', desc: 'राष्ट्रभाषा इंटरफ़ेस' },
            { id: 'mr', name: 'Marathi', native: 'मराठी', desc: 'प्रादेशिक इंटरफेस' }
          ].map(l => {
            const isSel = lang === l.id
            return (
              <div
                key={l.id}
                onClick={() => handleLanguageChange(l.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${isSel ? '#2563eb' : '#e2e8f0'}`,
                  background: isSel ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.88rem', color: isSel ? '#2563eb' : '#0f172a' }}>{l.native}</strong>
                  {isSel && <i className="fas fa-check-circle" style={{ color: '#2563eb' }}></i>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.name} • {l.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Theme & Display Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fdf4ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-palette"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Interface Display & Theme
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Select visual mode suited for daytime programming or night shifts.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${theme === 'light' ? '#2563eb' : '#e2e8f0'}`,
              background: theme === 'light' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <i className="fas fa-sun" style={{ fontSize: '1.4rem', color: '#f59e0b' }}></i>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>Light Corporate Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Optimal for daytime office hours</div>
            </div>
          </div>

          <div
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${theme === 'dark' ? '#2563eb' : '#e2e8f0'}`,
              background: theme === 'dark' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <i className="fas fa-moon" style={{ fontSize: '1.4rem', color: '#6366f1' }}></i>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>Dark Engineering Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Reduced eye strain during code sprints</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Notification Preferences */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-bell"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Automated Alerts & Push Notifications
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Configure scheduled reminders for shift deadlines and daily reports.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>07:00 PM Daily Work Report Reminder</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Alerts on screen if daily report is pending at 7:00 PM</span>
            </div>
            <input type="checkbox" checked={reportReminder} onChange={(e) => setReportReminder(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Sprint Task Assignment & Deadline Alerts</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Notification when a lead assigns a new task or code review</span>
            </div>
            <input type="checkbox" checked={taskAlerts} onChange={(e) => setTaskAlerts(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Message Centre Direct Alerts</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Instant sound and badge alerts for urgent leadership messages</span>
            </div>
            <input type="checkbox" checked={messageAlerts} onChange={(e) => setMessageAlerts(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          </label>

          {/* Test System & Mobile Popup Button */}
          <div style={{
            marginTop: '6px',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: hasNotifPermission ? '#10b981' : '#f59e0b',
                  boxShadow: hasNotifPermission ? '0 0 8px #10b981' : 'none'
                }} />
                <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                  {hasNotifPermission ? 'Native Popups Active' : 'Permission Required for Popups'}
                </strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                Supports Chrome Desktop/Mobile & Android Heads-Up Notifications
              </div>
            </div>

            <button
              onClick={async () => {
                setTestingNotif(true)
                const granted = await requestNotificationPermission()
                setHasNotifPermission(granted)
                await popNotification({
                  title: '🔔 Aparaitech Notification Test',
                  body: 'System popup & audio chime verified successfully on your device!',
                  tag: 'settings-test'
                })
                showToast('🔔 Notification popped successfully!', '#10b981')
                setTimeout(() => setTestingNotif(false), 3000)
              }}
              style={{
                background: testingNotif ? '#10b981' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
              }}
            >
              <i className={`fas ${testingNotif ? 'fa-check' : 'fa-paper-plane'}`}></i>
              {testingNotif ? 'Notification Sent!' : 'Test System Popup'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Security, Biometrics & Password */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Security, Credentials & Biometrics
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Manage password, WebAuthn fingerprint, and session auto-logout.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPwdModalOpen(true)}
            style={{
              background: '#0a192f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-key"></i> Change Account Password
          </button>

          <button
            onClick={() => setIsPinModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <i className="fas fa-th"></i> Change 4-Digit PIN (Passcode)
          </button>

          <button
            onClick={handleToggleBiometrics}
            style={{
              background: biometricEnabled ? '#ecfdf5' : '#f8fafc',
              color: biometricEnabled ? '#059669' : '#64748b',
              border: `1.5px solid ${biometricEnabled ? '#a7f3d0' : '#cbd5e1'}`,
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-fingerprint"></i>
            {biometricEnabled ? 'Biometric Auth: Enabled ✓' : 'Enable Biometrics'}
          </button>
        </div>
      </div>

      {/* 5. Logout Action */}
      <div style={{
        background: '#fff1f2',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        border: '1px solid #fecdd3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#9f1239' }}>
            Terminate Active Work Session
          </div>
          <div style={{ fontSize: '0.75rem', color: '#be123c' }}>
            Clears local JWT security token and locks work portal.
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: '#e11d48',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: '800',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)'
          }}
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>

      {/* Change Password Modal */}
      {isPwdModalOpen && (
        <ChangePwdModal
          currentUser={currentUser}
          onClose={() => setIsPwdModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Change 4-Digit Passcode PIN Modal */}
      {isPinModalOpen && (
        <ChangePinModal
          isOpen={isPinModalOpen}
          email={currentUser?.email}
          onClose={() => setIsPinModalOpen(false)}
          showToast={showToast}
          onPinUpdated={(newPin) => {
            if (currentUser) currentUser.passcode = newPin
          }}
        />
      )}
    </div>
  )
}

export default SettingsView
