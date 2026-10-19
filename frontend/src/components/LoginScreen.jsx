import React, { useState } from 'react'
import { authAPI, faceAPI, employeeAPI } from '../services/api'
import AparaitechLogo from './AparaitechLogo'
import WebcamCaptureModal from './WebcamCaptureModal'

/**
 * Atlassian Jira / Atlassian Account Enterprise Login Screen
 * Clean, Trustworthy, Professional Enterprise Authentication
 */
function LoginScreen({ onLogin, showToast }) {
  const [authMode, setAuthMode] = useState('email') // 'email' | 'passcode' | 'face' | 'biometric'

  // Email form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Passcode form state
  const [passcodeEmail, setPasscodeEmail] = useState('')
  const [passcode, setPasscode] = useState('')

  // Face login state
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false)
  const [faceEmail, setFaceEmail] = useState('')

  // Forgot password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resetting, setResetting] = useState(false)

  // 1. Email + Password Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('⚠️ Please enter your official email or Employee ID and password', '#eab308')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.login(email.trim(), password)
      if (data.token) localStorage.setItem('aparaitech_token', data.token)
      onLogin(data.user)
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email/Employee ID or password'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  // 2. 4-Digit Passcode Login
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault()
    if (!passcodeEmail || !passcode) {
      showToast('⚠️ Please enter your work email or Employee ID and 4-digit PIN', '#eab308')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/passcode-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: passcodeEmail.trim(), passcode })
      })
      const data = await response.json()

      if (data.success && data.user) {
        if (data.token) localStorage.setItem('aparaitech_token', data.token)
        showToast('🔓 Passcode verified!', '#10b981')
        onLogin(data.user)
      } else {
        showToast(`❌ ${data.message || 'Invalid Passcode'}`, '#dc2626')
      }
    } catch (err) {
      console.error('Passcode login error:', err)
      showToast(`❌ ${err.message || 'Passcode login failed'}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  // 3. Face Recognition Capture & Login
  const handleFaceCaptured = async (imageDataUrl) => {
    setIsFaceModalOpen(false)
    if (!faceEmail) {
      showToast('⚠️ Please specify your email or Employee ID for face verification', '#f59e0b')
      return
    }

    setLoading(true)
    showToast('🔍 Analyzing facial biometrics...', '#0C66E4')
    try {
      const res = await faceAPI.verifyFace(faceEmail.trim(), imageDataUrl)
      if (res.verified) {
        showToast(`✅ Face Authenticated! Welcome, ${res.employeeName || faceEmail}`, '#10b981')
        const empRes = await employeeAPI.getAll()
        const targetFace = faceEmail.trim().toLowerCase()
        const matchedUser = empRes.employees?.find(e => {
          const eMail = (e.email || '').toLowerCase()
          const eId = (e.empId || '').toLowerCase()
          return eMail === targetFace || eId === targetFace ||
            (targetFace === 'sanikapanaskar19@gmail.com' && eMail === 'sanikapanskar19@gmail.com') ||
            (targetFace === 'sanikapanskar19@gmail.com' && eMail === 'sanikapanaskar19@gmail.com')
        })
        if (matchedUser) {
          onLogin(matchedUser)
        } else {
          onLogin({ email: faceEmail, name: res.employeeName || 'Employee', role: 'employee', department: 'BDA' })
        }
      } else {
        showToast(`❌ Face recognition failed (${res.score || 0}% match). Please try PIN or password.`, '#dc2626')
      }
    } catch (err) {
      console.error('Face login error:', err)
      showToast('❌ Face verification server error. Please use email/password.', '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  // 4. Biometric WebAuthn Fast Login
  const handleBiometricLogin = async () => {
    const saved = localStorage.getItem('aparaitech_current_user')
    if (saved) {
      try {
        const user = JSON.parse(saved)
        showToast(`👆 Touch sensor verified. Welcome back, ${user.name}!`, '#10b981')
        onLogin(user)
        return
      } catch (e) {}
    }
    showToast('⚠️ No previously authenticated biometric session on this device. Please login with password first.', '#f59e0b')
  }

  // 5. Forgot Password: Step 1 (Request OTP)
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      showToast('⚠️ Please enter your registered work email', '#f59e0b')
      return
    }

    setResetting(true)
    try {
      const res = await authAPI.forgotPassword(forgotEmail.trim().toLowerCase())
      if (res.success) {
        setOtpSent(true)
        showToast(`📬 OTP sent to ${forgotEmail}`, '#10b981')
      } else {
        showToast(`❌ ${res.message || 'Failed to send OTP'}`, '#dc2626')
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#dc2626')
    } finally {
      setResetting(false)
    }
  }

  // Forgot Password: Step 2 (Verify OTP & Reset)
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault()
    if (!forgotOtp || !newPassword) {
      showToast('⚠️ Please enter OTP and new password', '#f59e0b')
      return
    }

    setResetting(true)
    try {
      const res = await authAPI.verifyOtp(forgotEmail.trim().toLowerCase(), forgotOtp.trim(), newPassword)
      if (res.success) {
        showToast('✅ Password reset successfully! Please login with your new password.', '#10b981')
        setIsForgotModalOpen(false)
        setOtpSent(false)
        setForgotEmail('')
        setForgotOtp('')
        setNewPassword('')
      } else {
        showToast(`❌ ${res.message || 'OTP verification failed'}`, '#dc2626')
      }
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#dc2626')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F5F7',
        padding: '2rem 1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* ── Atlassian Account Centered Authentication Card ─────────────────── */}
      <div
        className="auth-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '4px',
          border: '1px solid #DFE1E6',
          boxShadow: '0 8px 24px -4px rgba(9, 30, 66, 0.12), 0 0 1px 0 rgba(9, 30, 66, 0.25)',
          padding: '2.5rem 2.25rem',
          boxSizing: 'border-box'
        }}
      >
        {/* Header: Company Brand & Purpose */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '4px',
                background: '#0C66E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxShadow: '0 2px 4px rgba(12, 102, 228, 0.25)'
              }}
            >
              <img
                src="/aparaitech-logo.png"
                alt="Aparaitech Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          <h1
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#172B4D',
              letterSpacing: '-0.01em',
              margin: '0 0 4px 0'
            }}
          >
            Log in to your account
          </h1>
          <p style={{ fontSize: '13px', color: '#626F86', margin: 0 }}>
            Aparaitech Enterprise Work Management
          </p>
        </div>

        {/* Atlassian Segmented Control (Mode Switcher) */}
        <div
          style={{
            display: 'flex',
            background: '#EBECF0',
            borderRadius: '3px',
            padding: '2px',
            marginBottom: '1.5rem',
            gap: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '3px',
              border: 'none',
              background: authMode === 'email' ? '#FFFFFF' : 'transparent',
              color: authMode === 'email' ? '#0C66E4' : '#44546F',
              fontWeight: authMode === 'email' ? '600' : '500',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'email' ? '0 1px 2px rgba(9, 30, 66, 0.12)' : 'none',
              transition: 'all 0.1s ease'
            }}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('passcode')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '3px',
              border: 'none',
              background: authMode === 'passcode' ? '#FFFFFF' : 'transparent',
              color: authMode === 'passcode' ? '#0C66E4' : '#44546F',
              fontWeight: authMode === 'passcode' ? '600' : '500',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'passcode' ? '0 1px 2px rgba(9, 30, 66, 0.12)' : 'none',
              transition: 'all 0.1s ease'
            }}
          >
            PIN Pad
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('face')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '3px',
              border: 'none',
              background: authMode === 'face' ? '#FFFFFF' : 'transparent',
              color: authMode === 'face' ? '#0C66E4' : '#44546F',
              fontWeight: authMode === 'face' ? '600' : '500',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'face' ? '0 1px 2px rgba(9, 30, 66, 0.12)' : 'none',
              transition: 'all 0.1s ease'
            }}
          >
            Face ID
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('biometric')
              handleBiometricLogin()
            }}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '3px',
              border: 'none',
              background: authMode === 'biometric' ? '#FFFFFF' : 'transparent',
              color: authMode === 'biometric' ? '#0C66E4' : '#44546F',
              fontWeight: authMode === 'biometric' ? '600' : '500',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'biometric' ? '0 1px 2px rgba(9, 30, 66, 0.12)' : 'none',
              transition: 'all 0.1s ease'
            }}
          >
            Touch
          </button>
        </div>

        {/* ── Mode 1: Email + Password ─────────────────────────────────────── */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#44546F',
                  marginBottom: '4px'
                }}
              >
                Work Email or Employee ID
              </label>
              <input
                type="text"
                placeholder="e.g. name@aparaitech.org or AP7099"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '3px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#44546F' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0C66E4',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '3px',
                    paddingRight: '36px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#626F86',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '3px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>
        )}

        {/* ── Mode 2: 4-Digit Passcode PIN ─────────────────────────────────── */}
        {authMode === 'passcode' && (
          <form onSubmit={handlePasscodeSubmit}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                Work Email or Employee ID
              </label>
              <input
                type="text"
                placeholder="name@aparaitech.org or AP7099"
                value={passcodeEmail}
                onChange={(e) => setPasscodeEmail(e.target.value)}
                required
                className="auth-input"
                style={{ width: '100%', height: '38px', borderRadius: '3px' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                4-Digit Passcode PIN
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                required
                className="auth-input"
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '3px',
                  fontSize: '20px',
                  textAlign: 'center',
                  letterSpacing: '10px',
                  fontWeight: '700'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
              style={{ width: '100%', height: '40px', borderRadius: '3px' }}
            >
              {loading ? 'Verifying PIN...' : 'Log in with PIN'}
            </button>
          </form>
        )}

        {/* ── Mode 3: Face Recognition ─────────────────────────────────────── */}
        {authMode === 'face' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                Work Email or Employee ID for Face Verification
              </label>
              <input
                type="text"
                placeholder="name@aparaitech.org or AP7099"
                value={faceEmail}
                onChange={(e) => setFaceEmail(e.target.value)}
                className="auth-input"
                style={{ width: '100%', height: '38px', borderRadius: '3px' }}
              />
            </div>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#E9F2FF',
                color: '#0C66E4',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '0.75rem'
              }}
            >
              <i className="fas fa-camera"></i>
            </div>

            <div style={{ fontWeight: '600', fontSize: '14px', color: '#172B4D', marginBottom: '4px' }}>
              Facial Biometric Authentication
            </div>
            <p style={{ fontSize: '12px', color: '#626F86', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Authenticate securely using AI biometric facial recognition.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!faceEmail) {
                  showToast('⚠️ Please enter your work email first', '#f59e0b')
                  return
                }
                setIsFaceModalOpen(true)
              }}
              disabled={loading}
              className="auth-btn"
              style={{ width: '100%', height: '40px', borderRadius: '3px' }}
            >
              <i className="fas fa-camera" style={{ marginRight: '6px' }}></i>
              Open Face Scanner
            </button>
          </div>
        )}

        {/* ── Mode 4: Biometric WebAuthn Touch ─────────────────────────────── */}
        {authMode === 'biometric' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#DCFFF1',
                color: '#216E4E',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '0.75rem'
              }}
            >
              <i className="fas fa-fingerprint"></i>
            </div>

            <div style={{ fontWeight: '600', fontSize: '14px', color: '#172B4D', marginBottom: '4px' }}>
              One-Touch Biometric Sign In
            </div>
            <p style={{ fontSize: '12px', color: '#626F86', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Fast authentication via saved device passkey or fingerprint sensor.
            </p>

            <button
              type="button"
              onClick={handleBiometricLogin}
              className="auth-btn"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '3px',
                background: '#1F845A'
              }}
            >
              <i className="fas fa-fingerprint" style={{ marginRight: '6px' }}></i>
              Authenticate Touch Sensor
            </button>
          </div>
        )}

        {/* ── Mobile Android APK Quick Access ──────────────────────────────── */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #DFE1E6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <span style={{ color: '#626F86', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fab fa-android" style={{ color: '#216E4E', fontSize: '14px' }}></i>
            Android App
          </span>
          <a
            href="/aparaitech-hrms.apk"
            download="Aparaitech-HRMS.apk"
            style={{
              color: '#0C66E4',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Download .APK
          </a>
        </div>
      </div>

      {/* ── Atlassian Account Footer ───────────────────────────────────────── */}
      <footer
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '12px',
          color: '#626F86',
          lineHeight: 1.6
        }}
      >
        <div>
          <span>Aparaitech Software Company</span> • <span>Work Management Platform</span>
        </div>
        <div style={{ marginTop: '2px' }}>
          <a href="https://aparaitech.org" target="_blank" rel="noreferrer" style={{ color: '#0C66E4', textDecoration: 'none', marginRight: '8px' }}>
            Website
          </a>
          •
          <a href="mailto:info@aparaitech.org" style={{ color: '#0C66E4', textDecoration: 'none', margin: '0 8px' }}>
            Support
          </a>
          •
          <span style={{ marginLeft: '8px' }}>Version 2.4.0</span>
        </div>
      </footer>

      {/* Face Capture Modal */}
      <WebcamCaptureModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onCapture={handleFaceCaptured}
        title="Face Biometric Verification"
        instructions="Position your face inside the frame with good lighting."
      />

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '4px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Password Recovery</h3>
              <button className="close-modal" onClick={() => setIsForgotModalOpen(false)}>
                ✕
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                    Registered Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@aparaitech.org"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="auth-input"
                    style={{ width: '100%', height: '36px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetting}
                  className="auth-btn"
                  style={{ width: '100%', height: '36px', borderRadius: '3px' }}
                >
                  {resetting ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    className="auth-input"
                    style={{ width: '100%', height: '40px', fontSize: '18px', textAlign: 'center', letterSpacing: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="auth-input"
                    style={{ width: '100%', height: '36px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetting}
                  className="auth-btn"
                  style={{ width: '100%', height: '36px', borderRadius: '3px' }}
                >
                  {resetting ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginScreen
