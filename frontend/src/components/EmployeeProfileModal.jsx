import React, { useState, useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'
import { employeeAPI, faceAPI, API_URL } from '../services/api'
import WebcamCaptureModal from './WebcamCaptureModal'

const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'
const MIN_FACE_SCORE = 0.60
const FACE_MIN_SIZE = 80

function EmployeeProfileModal({ isOpen, onClose, employee, isAdmin = false, showToast, onUpdated, initialTab = 'details' }) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'details' | 'face'
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab, isOpen])

  // ── Profile fields state ──────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('Development')
  const [status, setStatus] = useState('active')
  const [profileImage, setProfileImage] = useState('')
  const [profilePreview, setProfilePreview] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  // ── Face ID state ─────────────────────────────────────────────────────────
  const [faceEnrolled, setFaceEnrolled] = useState(false)
  const [faceImageUrl, setFaceImageUrl] = useState('')
  const [faceEnrolledAt, setFaceEnrolledAt] = useState('')
  const [hasDescriptor, setHasDescriptor] = useState(false)

  // ── Webcam & Upload states for Profile Image / Face Image ──────────────────
  const [webcamTarget, setWebcamTarget] = useState(null) // 'profile' | 'face'
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  
  // Face capture specific states
  const [facePreview, setFacePreview] = useState(null)
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [faceQualityMsg, setFaceQualityMsg] = useState('')
  const [faceQualityType, setFaceQualityType] = useState('info') // 'info' | 'success' | 'error' | 'warn'
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [validatingFace, setValidatingFace] = useState(false)
  const [savingFace, setSavingFace] = useState(false)

  // ── Load employee details on open ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen && employee) {
      setName(employee.name || '')
      setEmail(employee.email || '')
      setPhone(employee.phone || '')
      setDob(employee.dob || '')
      setDesignation(employee.designation || '')
      setDepartment(employee.department || 'Development')
      setStatus(employee.status || 'active')
      setProfileImage(employee.profileImageUrl || '')
      setProfilePreview(employee.profileImageUrl ? `${API_URL}${employee.profileImageUrl}` : '')
      
      setFacePreview(null)
      setFaceDescriptor(null)
      setFaceQualityMsg('')
      setFaceQualityType('info')
      setEditMode(false)
      setActiveTab('details')

      // Fetch latest face enrollment info
      fetchFaceInfo()
    }
  }, [isOpen, employee]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFaceInfo = async () => {
    if (!employee) return
    try {
      const data = await faceAPI.get(employee.email)
      if (data.success && data.enrolled) {
        setFaceEnrolled(true)
        setFaceImageUrl(data.faceImageUrl)
        setFaceEnrolledAt(data.faceEnrolledAt)
        setHasDescriptor(data.hasDescriptor)
      } else {
        setFaceEnrolled(false)
        setFaceImageUrl('')
        setFaceEnrolledAt('')
        setHasDescriptor(false)
      }
    } catch (err) {
      console.error('Error fetching face details:', err)
    }
  }

  if (!isOpen || !employee) return null

  // ── Load face-api.js models ────────────────────────────────────────────────
  const loadModels = async () => {
    if (modelsLoaded) return true
    try {
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL)
      }
      if (!faceapi.nets.faceLandmark68TinyNet.isLoaded) {
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL)
      }
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL)
      }
      setModelsLoaded(true)
      return true
    } catch (err) {
      console.error('Model load error:', err)
      showToast('❌ Failed to load face recognition models.', '#dc2626')
      return false
    }
  }

  // ── Handle image validations (MIME & size) ─────────────────────────────────
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast('❌ Only JPEG, PNG, and WebP images are allowed', '#dc2626')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Image size must be under 5MB', '#dc2626')
      return false
    }
    return true
  }

  // ── Profile Image Upload ────────────────────────────────────────────────────
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!validateImageFile(file)) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePreview(event.target.result)
      setProfileImage(event.target.result) // Will send base64 to server
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Web Cam Capture handler ─────────────────────────────────────────────────
  const handleWebcamCapture = async (imageDataUrl) => {
    setIsWebcamOpen(false)
    if (webcamTarget === 'profile') {
      setProfilePreview(imageDataUrl)
      setProfileImage(imageDataUrl)
    } else if (webcamTarget === 'face') {
      setFacePreview(imageDataUrl)
      await runFaceValidation(imageDataUrl)
    }
  }

  // ── Face Validation using face-api.js ──────────────────────────────────────
  const runFaceValidation = async (imageDataUrl) => {
    setValidatingFace(true)
    setFaceQualityMsg('Validating captured face image...')
    setFaceQualityType('info')

    const loaded = await loadModels()
    if (!loaded) {
      setValidatingFace(false)
      return
    }

    try {
      const img = new Image()
      img.src = imageDataUrl
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: MIN_FACE_SCORE })
      const allDetections = await faceapi.detectAllFaces(img, options)

      if (!allDetections || allDetections.length === 0) {
        setFaceQualityMsg('❌ No face detected. Ensure face is clearly visible and look directly at camera.')
        setFaceQualityType('error')
        setFaceDescriptor(null)
        setValidatingFace(false)
        return
      }

      if (allDetections.length > 1) {
        setFaceQualityMsg(`❌ Multiple faces detected (${allDetections.length}). Ensure only one person is in the photo.`)
        setFaceQualityType('error')
        setFaceDescriptor(null)
        setValidatingFace(false)
        return
      }

      const detection = allDetections[0]
      if (detection.box.width < FACE_MIN_SIZE || detection.box.height < FACE_MIN_SIZE) {
        setFaceQualityMsg('⚠️ Face is too far away. Get closer to the camera and recapture.')
        setFaceQualityType('warn')
        setFaceDescriptor(null)
        setValidatingFace(false)
        return
      }

      const fullDetection = await faceapi
        .detectSingleFace(img, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!fullDetection) {
        setFaceQualityMsg('❌ Could not compute face descriptor. Ensure good lighting and high resolution.')
        setFaceQualityType('error')
        setFaceDescriptor(null)
        setValidatingFace(false)
        return
      }

      // Validated
      setFaceDescriptor(Array.from(fullDetection.descriptor))
      setFaceQualityMsg(`✅ Face validated successfully! Confidence: ${Math.round(detection.score * 100)}%`)
      setFaceQualityType('success')
    } catch (err) {
      console.error('Face validation error:', err)
      setFaceQualityMsg('❌ Face validation failed. Please try a different photo.')
      setFaceQualityType('error')
      setFaceDescriptor(null)
    } finally {
      setValidatingFace(false)
    }
  }

  // ── Save Details ────────────────────────────────────────────────────────────
  const handleSaveDetails = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      showToast('⚠️ Name and Email are required', '#eab308')
      return
    }

    setSavingDetails(true)
    try {
      const updateData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        dob: dob,
        designation: designation.trim(),
        department,
        status
      }

      // Send base64 profile image only if it has changed
      if (profileImage.startsWith('data:image/')) {
        updateData.profileImageBase64 = profileImage
      }

      const res = await employeeAPI.update(employee.email, updateData)
      showToast('✅ Employee details updated successfully!', '#22c55e')
      setEditMode(false)
      if (onUpdated) onUpdated()
      
      // Update local state details to display
      employee.name = res.employee.name
      employee.email = res.employee.email
      employee.phone = res.employee.phone
      employee.designation = res.employee.designation
      employee.department = res.employee.department
      employee.status = res.employee.status
      employee.profileImageUrl = res.employee.profileImageUrl
      setProfilePreview(res.employee.profileImageUrl ? `${API_URL}${res.employee.profileImageUrl}` : '')
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to update details'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setSavingDetails(false)
    }
  }

  // ── Save Face Image ─────────────────────────────────────────────────────────
  const handleSaveFaceImage = async () => {
    if (!facePreview) return
    if (!faceDescriptor) {
      showToast('❌ Face photo has not been validated yet', '#dc2626')
      return
    }

    setSavingFace(true)
    try {
      const res = await faceAPI.enroll(
        employee.email,
        facePreview,
        isAdmin ? 'Admin Update' : 'Self Update',
        faceDescriptor
      )

      if (res.success) {
        showToast('✅ Face image updated successfully!', '#22c55e')
        setFacePreview(null)
        setFaceDescriptor(null)
        setFaceQualityMsg('')
        setFaceQualityType('info')
        fetchFaceInfo()
        if (onUpdated) onUpdated()
      } else {
        showToast(`❌ ${res.message || 'Failed to enroll face'}`, '#dc2626')
      }
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to save face image', '#dc2626')
    } finally {
      setSavingFace(false)
    }
  }

  // ── Reset Face ID ───────────────────────────────────────────────────────────
  const handleResetFace = async () => {
    if (!window.confirm('Are you sure you want to reset Face ID for this employee? Check-in/out verification will be skipped.')) return
    try {
      const res = await faceAPI.reset(employee.email)
      showToast(`✅ ${res.message}`, '#22c55e')
      fetchFaceInfo()
      if (onUpdated) onUpdated()
    } catch (err) {
      showToast('❌ Failed to reset Face ID data', '#dc2626')
    }
  }

  const getStatusStyle = (type) => {
    switch (type) {
      case 'success': return { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' }
      case 'error':   return { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }
      case 'warn':    return { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }
      default:        return { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '650px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.2rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', border: '2px solid #2563eb', flexShrink: 0 }}>
                {profilePreview ? (
                  <img src={profilePreview} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {name ? name.charAt(0).toUpperCase() : 'E'}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {name || 'Employee Profile'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {designation || 'Designation'} &bull; {department}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.6rem', padding: 0 }}
            >
              &times;
            </button>
          </div>

          {/* Navigation tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0 1rem' }}>
            <button
              onClick={() => setActiveTab('details')}
              style={{
                padding: '12px 16px', border: 'none', background: 'none', fontWeight: 600, fontSize: '0.88rem',
                color: activeTab === 'details' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'details' ? '3px solid #2563eb' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              📂 Information Details
            </button>
            <button
              onClick={() => setActiveTab('face')}
              style={{
                padding: '12px 16px', border: 'none', background: 'none', fontWeight: 600, fontSize: '0.88rem',
                color: activeTab === 'face' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'face' ? '3px solid #2563eb' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              🔒 Face ID Enrollment
            </button>
          </div>

          {/* Content Pane */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {/* ══════════════════════════════════════════════════════════════════
                DETAILS TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'details' && (
              <div>
                {!editMode ? (
                  /* Display Details mode */
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee ID</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{employee.empId}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Designation</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{designation || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{name}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone Number</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{phone || '—'}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{department}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</small>
                        <div style={{ marginTop: '4px' }}>
                          <span className={`status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}`}>{status}</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date of Birth</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{dob || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <small style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Joining Date</small>
                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>{employee.joinDate || '—'}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        {/* Empty spacing block */}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.8rem' }}>
                      <button
                        onClick={() => setEditMode(true)}
                        className="g-button"
                        style={{ background: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <i className="fas fa-edit"></i> Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Edit Form mode */
                  <form onSubmit={handleSaveDetails} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                        {profilePreview ? (
                          <img src={profilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}>No Image</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <label className="g-button success" style={{ padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
                          📁 Upload Image
                          <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: 'none' }} />
                        </label>
                        <button
                          type="button"
                          onClick={() => { setWebcamTarget('profile'); setIsWebcamOpen(true) }}
                          className="g-button"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#2563eb' }}
                        >
                          📷 Capture Photo
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Full Name *</label>
                        <input
                          type="text"
                          className="auth-input"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                          style={{ margin: '4px 0 0', width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Email Address *</label>
                        <input
                          type="email"
                          className="auth-input"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          style={{ margin: '4px 0 0', width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                        <input
                          type="text"
                          className="auth-input"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          style={{ margin: '4px 0 0', width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Date of Birth</label>
                        <input
                          type="date"
                          className="auth-input"
                          value={dob}
                          onChange={e => setDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          style={{ margin: '4px 0 0', width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Designation</label>
                        <input
                          type="text"
                          className="auth-input"
                          value={designation}
                          onChange={e => setDesignation(e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          style={{ margin: '4px 0 0', width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        {/* Empty/aligned */}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Department *</label>
                        <select
                          className="auth-input"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          required
                          style={{ margin: '4px 0 0', width: '100%', height: '42px' }}
                        >
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Operations">Operations</option>
                          <option value="Management">Management</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Status *</label>
                        <select
                          className="auth-input"
                          value={status}
                          onChange={e => setStatus(e.target.value)}
                          required
                          disabled={!isAdmin} // Only admin can change active status
                          style={{ margin: '4px 0 0', width: '100%', height: '42px' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="g-button"
                        style={{ background: '#64748b' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingDetails}
                        className="g-button success"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <i className="fas fa-check"></i> {savingDetails ? 'Saving...' : 'Update Information'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ── 🔒 FACE ID TAB ─────────────────────────────────────────────── */}
            {activeTab === 'face' && (
              <div>
                {/* Active face representation */}
                <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', border: '2px solid #cbd5e1', flexShrink: 0 }}>
                    {faceImageUrl ? (
                      <img src={`${API_URL}${faceImageUrl}`} alt="Enrolled Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '4px' }}>
                        <span>❌ No Enrolled Face</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Face ID Status</strong>
                      <div style={{ marginTop: '2px' }}>
                        {faceEnrolled ? (
                          <span className="status-badge status-full">✅ Enrolled {hasDescriptor && '(AI Embedding)'}</span>
                        ) : (
                          <span className="status-badge status-pending">❌ Not Enrolled</span>
                        )}
                      </div>
                    </div>
                    {faceEnrolled && faceEnrolledAt && (
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Enrolled On</strong>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                          {new Date(faceEnrolledAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Update Face ID Section */}
                <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#1e3a8a', fontSize: '0.95rem', fontWeight: 700 }}>
                    📷 Update Face Image &amp; Descriptor
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#1d4ed8', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    Capturing a new face will automatically run face detection to ensure exactly 1 face is visible, compute a 128-dimensional embedding vector, and replace the existing Face ID safely.
                  </p>

                  {!facePreview ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { setWebcamTarget('face'); setIsWebcamOpen(true) }}
                        className="g-button"
                        style={{ background: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 16px' }}
                      >
                        📷 Open Camera &amp; Capture
                      </button>
                      {faceEnrolled && (
                        <button
                          onClick={handleResetFace}
                          className="g-button danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 16px' }}
                        >
                          🗑️ Reset Face ID
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Captured preview & validation status */}
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '1rem' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #bfdbfe', flexShrink: 0 }}>
                          <img src={facePreview} alt="Captured Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          {validatingFace ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 600 }}>
                              <div style={{ width: '6px', height: '6px', background: '#1d4ed8', borderRadius: '50%', animation: 'pulse 1.2s infinite' }}></div>
                              Validating face embedding...
                            </div>
                          ) : (
                            <div style={{ ...getStatusStyle(faceQualityType), padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {faceQualityMsg}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => { setFacePreview(null); setFaceDescriptor(null); setFaceQualityMsg(''); }}
                          className="g-button"
                          style={{ background: '#64748b', fontSize: '0.82rem', padding: '7px 14px' }}
                        >
                          🔄 Retake / Cancel
                        </button>
                        <button
                          onClick={handleSaveFaceImage}
                          disabled={!faceDescriptor || savingFace || validatingFace}
                          className="g-button success"
                          style={{ fontSize: '0.82rem', padding: '7px 18px', cursor: (!faceDescriptor || savingFace) ? 'not-allowed' : 'pointer' }}
                        >
                          {savingFace ? 'Saving...' : '💾 Save Face Image'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WebcamCaptureModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
        title={webcamTarget === 'profile' ? 'Capture Profile Picture' : 'Capture Face ID Photo'}
        instructions={webcamTarget === 'profile' ? 'Align your face center-frame.' : 'Position face clearly inside oval guide with good lighting.'}
      />
    </>
  )
}

export default EmployeeProfileModal
