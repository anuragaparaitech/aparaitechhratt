import React, { useState } from 'react'
import { authAPI } from '../services/api'

function ChangePinModal({ isOpen, onClose, email, showToast, onPinUpdated }) {
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanOld = oldPin.trim()
    const cleanNew = newPin.trim()
    const cleanConfirm = confirmPin.trim()

    if (!cleanNew) {
      showToast('⚠️ Please enter a new 4-digit PIN', '#eab308')
      return
    }
    if (cleanNew.length !== 4 || !/^\d{4}$/.test(cleanNew)) {
      showToast('⚠️ PIN must be exactly 4 numeric digits (0-9)', '#eab308')
      return
    }
    if (cleanNew !== cleanConfirm) {
      showToast('⚠️ New PIN and Confirm PIN do not match', '#eab308')
      return
    }

    setLoading(true)
    try {
      await authAPI.changePasscode(email, cleanOld, cleanNew)
      showToast('✅ 4-Digit Passcode PIN updated successfully!', '#22c55e')
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      if (onPinUpdated) onPinUpdated(cleanNew)
      onClose()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to update PIN'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', zIndex: 9999 }}>
      <div className="modal-content" style={{ background: '#ffffff', maxWidth: '420px', width: '90%', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-th" style={{ color: '#2563eb' }}></i> Change 4-Digit Passcode PIN
          </h3>
          <button className="close-modal" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', display: 'block' }}>
              Current 4-Digit PIN (Default: 1234)
            </label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              className="auth-input" 
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1234"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }}
            />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', display: 'block' }}>
              New 4-Digit PIN
            </label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              className="auth-input" 
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }}
            />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', display: 'block' }}>
              Confirm New 4-Digit PIN
            </label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              className="auth-input" 
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Updating PIN...' : 'Save 4-Digit PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePinModal
