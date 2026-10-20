import React, { useState } from 'react'
import { authAPI } from '../services/api'

function ChangePwdModal({ isOpen = true, onClose, email, currentUser, showToast, onPasswordUpdated }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const targetEmail = email || currentUser?.email

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetEmail) {
      showToast('⚠️ Email is required to change password', '#eab308')
      return
    }
    if (!oldPwd || !newPwd) {
      showToast('⚠️ Please fill in all fields', '#eab308')
      return
    }
    if (newPwd.length < 4) {
      showToast('⚠️ Password must be at least 4 characters long', '#eab308')
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword(targetEmail, oldPwd, newPwd)
      showToast('✅ Password changed successfully!', '#22c55e')
      setOldPwd('')
      setNewPwd('')
      if (onPasswordUpdated) onPasswordUpdated(newPwd)
      onClose()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to update password'
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
            <i className="fas fa-lock" style={{ color: '#2563eb' }}></i> Change Account Password
          </h3>
          <button className="close-modal" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              className="auth-input" 
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              className="auth-input" 
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required 
              minLength={4}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePwdModal
