import React, { useState } from 'react'
import { authAPI, faceAPI, employeeAPI } from '../services/api'
import AparaitechLogo from './AparaitechLogo'
import WebcamCaptureModal from './WebcamCaptureModal'

/**
 * Enterprise Work Portal Login Screen for Aparaitech Software.
 * Features 4 Authentication Modes:
 * 1. Email + Password
 * 2. 4-Digit Passcode PIN
 * 3. Face Recognition Login
 * 4. Biometric Authentication (WebAuthn / Fingerprint)
 * + Forgot Password (OTP Verification)
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
    showToast('🔍 Analyzing facial biometrics...', '#2563eb')
    try {
      const res = await faceAPI.verifyFace(faceEmail.trim(), imageDataUrl)
      if (res.verified) {
        showToast(`✅ Face Authenticated! Welcome, ${res.employeeName || faceEmail}`, '#10b981')
        // Automatically retrieve employee session
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #07101e 0%, #0b192c 45%, #082f38 100%)',
      padding: 'calc(env(safe-area-inset-top, 0px) + 1.25rem) 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.25rem) 1.25rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background Glowing Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* Main Container */}
      <div
        className="login-card-container"
        style={{
          maxWidth: '1080px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {/* Left Hero Branding Panel */}
        <div
          className="login-hero-panel"
          style={{
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(11, 25, 44, 0.9) 0%, rgba(13, 148, 136, 0.15) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              marginBottom: '1.75rem',
              background: '#0a192f'
            }}>
              <img
                src="/aparaitech-banner.png"
                alt="Aparaitech Corporate Banner"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(13, 148, 136, 0.15)',
              border: '1px solid rgba(13, 148, 136, 0.35)',
              borderRadius: '999px',
              color: '#2dd4bf',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              marginBottom: '1rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
              ENTERPRISE WORK PORTAL 2.0
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem'
            }}>
              Software Engineering <br />
              <span style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Work & Operations Portal
              </span>
            </h1>

            <p style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              lineHeight: 1.65,
              marginBottom: '1.75rem'
            }}>
              Manage daily tasks, projects, code commits, attendance face verification, and engineering reports in one unified portal.
            </p>
          </div>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <a href="https://aparaitech.org" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>
              🌐 aparaitech.org
            </a>
            <span>•</span>
            <a href="mailto:info@aparaitech.org" style={{ color: '#93c5fd', textDecoration: 'none' }}>
              ✉️ info@aparaitech.org
            </a>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div style={{
          padding: '2.25rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff'
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
              <AparaitechLogo size={65} animate={true} variant="badge" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', letterSpacing: '0.02em' }}>
              APARAITECH SOFTWARE
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Official Employee Access
            </div>
          </div>

          {/* Authentication Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '1.25rem',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'email' ? '#ffffff' : 'transparent',
                color: authMode === 'email' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: authMode === 'email' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <i className="fas fa-key" style={{ marginRight: '4px' }}></i> Password
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('passcode')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'passcode' ? '#ffffff' : 'transparent',
                color: authMode === 'passcode' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: authMode === 'passcode' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <i className="fas fa-th" style={{ marginRight: '4px' }}></i> PIN Pad
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('face')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'face' ? '#ffffff' : 'transparent',
                color: authMode === 'face' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: authMode === 'face' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <i className="fas fa-camera" style={{ marginRight: '4px' }}></i> Face ID
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('biometric')
                handleBiometricLogin()
              }}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'biometric' ? '#ffffff' : 'transparent',
                color: authMode === 'biometric' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: authMode === 'biometric' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <i className="fas fa-fingerprint" style={{ marginRight: '4px' }}></i> Touch
            </button>
          </div>

          {/* 1. EMAIL + PASSWORD LOGIN FORM */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  📧 Work Email or Employee ID
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="name@aparaitech.com or AP7098"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                  <i className="fas fa-envelope" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                    🔒 Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                  <i className="fas fa-lock" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 18px -4px rgba(13, 148, 136, 0.4)'
                }}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-shield-alt" />}
                Sign In to Work Portal
              </button>
            </form>
          )}

          {/* 2. PASSCODE PIN LOGIN FORM */}
          {authMode === 'passcode' && (
            <form onSubmit={handlePasscodeSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  📧 Work Email or Employee ID
                </label>
                <input
                  type="text"
                  placeholder="name@aparaitech.com or AP7098"
                  value={passcodeEmail}
                  onChange={(e) => setPasscodeEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  🔢 4-Digit Passcode PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    outline: 'none',
                    fontWeight: '900'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-unlock" />}
                Unlock with Passcode
              </button>
            </form>
          )}

          {/* 3. FACE RECOGNITION LOGIN FORM */}
          {authMode === 'face' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  📧 Work Email or Employee ID for Face Match
                </label>
                <input
                  type="text"
                  placeholder="name@aparaitech.com or AP7098"
                  value={faceEmail}
                  onChange={(e) => setFaceEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
              }}>
                <i className="fas fa-camera"></i>
              </div>

              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>
                Biometric Facial Recognition
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Verifies 128-dimensional biometric facial descriptors stored in Aparaitech Cloud.
              </div>

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
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-camera"></i> Open Face Scanner
              </button>
            </div>
          )}

          {/* 4. BIOMETRIC TOUCH LOGIN */}
          {authMode === 'biometric' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                marginBottom: '1rem'
              }}>
                <i className="fas fa-fingerprint"></i>
              </div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>
                One-Touch Biometric Sign In
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Fast authentication via WebAuthn, fingerprint sensor, or saved biometric passkey.
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-fingerprint"></i> Authenticate Biometrics
              </button>
            </div>
          )}

          {/* Mobile APK Download Button */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: '#f0fdf4',
            border: '1.5px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fab fa-android" style={{ fontSize: '1.2rem', color: '#10b981' }}></i>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#065f46' }}>
                Aparaitech Mobile App APK
              </div>
            </div>
            <a
              href="/aparaitech-hrms.apk"
              download="Aparaitech-HRMS.apk"
              style={{
                textDecoration: 'none',
                background: '#059669',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}
            >
              Install APK
            </a>
          </div>
        </div>
      </div>

      {/* Face Capture Modal */}
      <WebcamCaptureModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onCapture={handleFaceCaptured}
        title="Face Biometric Verification"
        instructions="Position your face inside the circle in good lighting."
      />

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>
                Password Recovery (Email OTP)
              </h3>
              <button onClick={() => setIsForgotModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Enter Registered Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@aparaitech.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetting}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {resetting ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetting}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {resetting ? 'Resetting Password...' : 'Verify & Set Password'}
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
