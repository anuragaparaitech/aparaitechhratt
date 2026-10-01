import React, { useState } from 'react'
import { authAPI } from '../services/api'

function ChangePwdModal({ isOpen, onClose, email, showToast, onPasswordUpdated }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      await authAPI.changePassword(email, oldPwd, newPwd)
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
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Change Password</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
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
