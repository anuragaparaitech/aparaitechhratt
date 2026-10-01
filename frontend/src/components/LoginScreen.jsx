import React, { useState } from 'react'
import { authAPI } from '../services/api'

/**
 * Single unified login form for both Admin and Employee.
 * The server determines the user's role after credential validation.
 * The client simply redirects to the correct dashboard based on the
 * role field returned in the API response — no role tab required.
 */
function LoginScreen({ onLogin, showToast }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('⚠️ Please fill in all fields', '#eab308')
      return
    }

    setLoading(true)
    try {
      // The backend validates credentials and returns user.role from the DB.
      // We never send a role from the frontend — role is authoritative on the server.
      const data = await authAPI.login(email.trim().toLowerCase(), password)

      if (data.token) {
        localStorage.setItem('aparaitech_token', data.token)
      }

      // App.jsx reads user.role and renders AdminPanel or EmployeePanel accordingly.
      onLogin(data.user)
    } catch (err) {
      console.error('Login error details:', err)
      let errorMsg = 'Invalid email or password'
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network Error: Cannot connect to the server. Please check your internet connection or backend status.'
      } else if (err.message) {
        errorMsg = err.message
      }
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Brand */}
        <div className="company-logo">⚡</div>
        <div className="company-name">APARAITECH SOFTWARE</div>
        <div className="auth-title">HRMS 2.0 | Intelligent Attendance</div>

        {/* Single sign-in form — role is resolved by the server */}
        <form onSubmit={handleSubmit} autoComplete="on">

          <div className="input-group">
            <label>📧 Official Email</label>
            <input
              id="loginEmail"
              type="email"
              className="auth-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group" style={{ position: 'relative' }}>
            <label>🔒 Password</label>
            <input
              id="loginPassword"
              type={showPwd ? 'text' : 'password'}
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: '44px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              title={showPwd ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: '12px', bottom: '10px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', fontSize: '1rem', padding: 0
              }}
            >
              <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          <button
            id="loginSubmitBtn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i>
                Signing in...
              </>
            ) : (
              '🔓 Secure Sign In'
            )}
          </button>
        </form>

        {/* Info note */}
        <p style={{
          marginTop: '1.2rem', textAlign: 'center',
          fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5
        }}>
          Your dashboard will open automatically based on your account role.<br />
          Admin and Employee accounts use the same login form.
        </p>

      </div>
    </div>
  )
}

export default LoginScreen
