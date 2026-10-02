import React, { useState } from 'react'
import { authAPI } from '../services/api'
import AparaitechLogo from './AparaitechLogo'

/**
 * Enterprise Login Screen for Aparaitech Software Company.
 * Features official 3D branding, corporate banner, and seamless role-based authentication.
 */
function LoginScreen({ onLogin, showToast }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('⚠️ Please enter your official email and password', '#eab308')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.login(email.trim().toLowerCase(), password)

      if (data.token) {
        localStorage.setItem('aparaitech_token', data.token)
      }

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

  const handleQuickFill = (demoEmail, demoPwd) => {
    setEmail(demoEmail)
    setPassword(demoPwd)
    if (showToast) {
      showToast(`Credentials filled for demo! Click "Secure Sign In"`, '#0d9488')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #07101e 0%, #0b192c 45%, #082f38 100%)',
      padding: '1.5rem',
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

      {/* Main Container Container */}
      <div style={{
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
      }}>

        {/* ── Left Hero Branding Panel ──────────────────────────────── */}
        <div style={{
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(11, 25, 44, 0.9) 0%, rgba(13, 148, 136, 0.15) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            {/* Official Corporate Banner Header */}
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
                alt="Aparaitech Software Company Corporate Banner"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover'
                }}
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
              ENTERPRISE ATTENDANCE & HRMS 2.0
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem'
            }}>
              Innovating Software <br />
              <span style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Development For The Future
              </span>
            </h1>

            <p style={{
              fontSize: '0.88rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              Secure biometric face recognition, geofenced physical office check-in, 7-day follow-up conversion pipeline, and automated company operations.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.95rem', color: '#2dd4bf', marginBottom: '2px' }}>📍 200m Geofence</div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Aparaitech Software Office</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '2px' }}>👤 Face ID System</div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>128-d Neural Vector Match</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.95rem', color: '#f59e0b', marginBottom: '2px' }}>📈 7-Day Pipeline</div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>₹1.5k Onb / ₹4.5k Finalize</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.95rem', color: '#a855f7', marginBottom: '2px' }}>⚡ MongoDB Atlas</div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Dedicated Cloud Cluster</div>
              </div>
            </div>
          </div>

          {/* Official Contact Footer */}
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
            <a
              href="https://aparaitech.org"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              🌐 aparaitech.org
            </a>
            <span style={{ color: '#475569' }}>•</span>
            <a
              href="mailto:info@aparaitech.org"
              style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ✉️ info@aparaitech.org
            </a>
          </div>
        </div>

        {/* ── Right Login Form Card ─────────────────────────────────── */}
        <div style={{
          padding: '2.5rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff'
        }}>
          {/* Official 3D Glossy Cube Logo with Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              <AparaitechLogo size={75} animate={true} variant="badge" />
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '900',
              color: '#0f172a',
              letterSpacing: '0.04em'
            }}>
              APARAITECH SOFTWARE
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#0d9488',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Official Work Portal
            </div>
          </div>

          {/* Quick Demo Credentials Autofill Chips */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px'
            }}>
              ⚡ Quick Fill Access:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@aparaitech.com', 'admin123')}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🛡️ Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kaledisha868@gmail.com', 'Aparaitech123@')}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#166534',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                💼 BDA Team (Disha)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('rutikyadav2004@gmail.com', 'Aparaitech123@')}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#1e40af',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                💻 Software Dev (Rutik)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="input-group" style={{ marginBottom: '1.15rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px'
              }}>
                📧 Official Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="loginEmail"
                  type="email"
                  className="auth-input"
                  placeholder="name@aparaitech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#f8fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <i className="fas fa-envelope" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#334155'
                }}>
                  🔒 Account Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="loginPassword"
                  type={showPwd ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#f8fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <i className="fas fa-lock" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  title={showPwd ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '1rem',
                    padding: '4px'
                  }}
                >
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button
              id="loginSubmitBtn"
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
                boxShadow: '0 10px 20px -5px rgba(13, 148, 136, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin" />
                  Authenticating with MongoDB Atlas...
                </>
              ) : (
                <>
                  <i className="fas fa-shield-alt" />
                  Sign In to Work Portal
                </>
              )}
            </button>
          </form>

          {/* Mobile App Download Card */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                <i className="fab fa-android"></i>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#065f46' }}>
                  Aparaitech Mobile App
                </div>
                <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                  Direct APK for Android phones
                </div>
              </div>
            </div>
            <a
              href="/aparaitech-hrms.apk"
              download="Aparaitech-HRMS.apk"
              style={{
                textDecoration: 'none',
                background: '#059669',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <i className="fas fa-download"></i>
              <span>Install APK</span>
            </a>
          </div>

          {/* Security & Verification Guarantee */}
          <div style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#64748b',
            lineHeight: 1.5,
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#16a34a', fontWeight: '700', marginBottom: '4px' }}>
              <i className="fas fa-lock" /> 256-bit SSL Encrypted • MongoDB Atlas Cloud Verified
            </div>
            <div>Aparaitech Software Company (OPC) Private Limited</div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginScreen
