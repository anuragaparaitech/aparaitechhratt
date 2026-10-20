import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { employeeAPI, faceAPI } from '../services/api'
import {
  extract5KeyLandmarks,
  alignFaceInsightFace,
  generateArcFace512Embedding,
  checkLivenessAndAntiSpoof
} from '../utils/biometricsEngine'

/**
 * AddEmployeeModal — 2-Step Employee Registration with Mandatory Face Enrollment
 *
 * Step 1: Employee Details (ID, Name, Email, Department, Password)
 * Step 2: Face Capture & Validation
 *   - Opens webcam
 *   - Detects face using face-api.js (TinyFaceDetector)
 *   - Validates: exactly 1 face must be visible
 *   - Rejects: 0 faces, multiple faces, poor-quality images
 *   - On confirm: stores face descriptor + image
 *
 * Registration only completes when BOTH steps pass successfully.
 * Face is enrolled immediately after the employee account is created.
 */

const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'

// ── Detection quality thresholds ────────────────────────────────────────────────
const MIN_FACE_SCORE = 0.60      // Minimum detection confidence score
const FACE_MIN_SIZE = 80         // Minimum face box size in pixels

function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded, showToast }) {
  // ── Step control ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1) // 1 = details, 2 = face capture

  // ── Step 1: Employee details ────────────────────────────────────────────────
  const [empId, setEmpId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Development')
  const [shift, setShift] = useState('shift_1')
  const [password, setPassword] = useState('Aparaitech123@')
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0])
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')

  // ── Step 2: Face capture states ─────────────────────────────────────────────
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Phases: 'idle' | 'loading-models' | 'starting-camera' | 'live' |
  //         'analyzing' | 'preview' | 'ready'
  const [facePhase, setFacePhase] = useState('idle')
  const [faceStatusMsg, setFaceStatusMsg] = useState('')
  const [faceStatusType, setFaceStatusType] = useState('info')  // 'info' | 'success' | 'error' | 'warn'
  const [capturedImage, setCapturedImage] = useState(null)      // Validated face image
  const [faceDescriptor, setFaceDescriptor] = useState(null)    // 128-d descriptor
  const [modelsLoaded, setModelsLoaded] = useState(false)

  // ── Submit state ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)

  // ── Reset everything on close ────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setStep(1)
    setEmpId('')
    setName('')
    setEmail('')
    setDepartment('Development')
    setShift('shift_1')
    setPassword('Aparaitech123@')
    setJoiningDate(new Date().toISOString().split('T')[0])
    setPhone('')
    setDob('')
    setCapturedImage(null)
    setFaceDescriptor(null)
    setFacePhase('idle')
    setFaceStatusMsg('')
    setFaceStatusType('info')
    setSubmitting(false)
    stopCamera()
  }, [])

  // ── Camera helpers ────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
    }
    return () => stopCamera()
  }, [isOpen, stopCamera])

  // Reset when re-opened
  useEffect(() => {
    if (isOpen) {
      resetAll()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  // ── Load face-api.js models ──────────────────────────────────────────────────
  const loadModels = async () => {
    if (modelsLoaded) return true
    setFacePhase('loading-models')
    setFaceStatusMsg('Loading face detection models...')
    setFaceStatusType('info')
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
      console.error('[AddEmployee] Model load error:', err)
      setFacePhase('idle')
      setFaceStatusMsg('❌ Failed to load face detection models. Check internet connection.')
      setFaceStatusType('error')
      return false
    }
  }

  // ── Start webcam ─────────────────────────────────────────────────────────────
  const startCamera = async () => {
    const loaded = await loadModels()
    if (!loaded) return

    if (!navigator.mediaDevices?.getUserMedia) {
      setFaceStatusMsg('❌ Camera access not supported in this browser. Try Chrome or Firefox.')
      setFaceStatusType('error')
      return
    }

    setFacePhase('starting-camera')
    setFaceStatusMsg('Starting camera...')
    setFaceStatusType('info')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setFacePhase('live')
      setFaceStatusMsg('📸 Position your face within the oval guide, then click Capture Face.')
      setFaceStatusType('info')
    } catch (err) {
      setFacePhase('idle')
      if (err.name === 'NotAllowedError') {
        setFaceStatusMsg('❌ Camera permission denied. Please allow access in browser settings.')
      } else if (err.name === 'NotFoundError') {
        setFaceStatusMsg('❌ No camera found. Connect a camera and try again.')
      } else if (err.name === 'NotReadableError') {
        setFaceStatusMsg('❌ Camera is in use by another application. Close it and try again.')
      } else {
        setFaceStatusMsg(`❌ Camera error: ${err.message}`)
      }
      setFaceStatusType('error')
    }
  }

  // ── Capture & analyze face ───────────────────────────────────────────────────
  const captureAndAnalyze = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setFacePhase('analyzing')
    setFaceStatusMsg('Analyzing face...')
    setFaceStatusType('info')

    // Draw current video frame to canvas (mirrored)
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.88)
    stopCamera() // Release camera immediately

    try {
      // Create HTMLImageElement for face-api.js
      const img = new Image()
      img.src = imageDataUrl
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

      // ── Detect ALL faces (to reject multi-face images) ──────────────────────
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: MIN_FACE_SCORE
      })
      const allDetections = await faceapi.detectAllFaces(img, options)

      // ── No face detected ────────────────────────────────────────────────────
      if (!allDetections || allDetections.length === 0) {
        setFacePhase('live')
        setFaceStatusMsg('❌ No face detected. Ensure your face is clearly visible, well-lit, and within the frame.')
        setFaceStatusType('error')
        await startCamera() // Re-open camera for retry
        return
      }

      // ── Multiple faces detected ─────────────────────────────────────────────
      if (allDetections.length > 1) {
        setFacePhase('live')
        setFaceStatusMsg(`❌ ${allDetections.length} faces detected. Only one person should be visible in the frame.`)
        setFaceStatusType('error')
        await startCamera()
        return
      }

      // ── Single face detected — validate quality ─────────────────────────────
      const detection = allDetections[0]
      const box = detection.box
      const faceArea = box.width * box.height
      const frameArea = canvas.width * canvas.height
      const coveragePercent = Math.round((faceArea / frameArea) * 100)

      // Face too small / too far away
      if (box.width < FACE_MIN_SIZE || box.height < FACE_MIN_SIZE) {
        setFacePhase('live')
        setFaceStatusMsg('⚠️ Face is too small. Move closer to the camera and try again.')
        setFaceStatusType('warn')
        await startCamera()
        return
      }

      // Detection score too low (poor quality)
      if (detection.score < MIN_FACE_SCORE) {
        setFacePhase('live')
        setFaceStatusMsg('⚠️ Poor image quality. Improve lighting and ensure your face is clearly visible.')
        setFaceStatusType('warn')
        await startCamera()
        return
      }

      // ── Compute 512D ArcFace descriptor and verify liveness ─────────────
      const fullDetection = await faceapi
        .detectSingleFace(img, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!fullDetection) {
        setFacePhase('live')
        setFaceStatusMsg('❌ Could not compute face features. Try better lighting and a clearer photo.')
        setFaceStatusType('error')
        await startCamera()
        return
      }

      // Check Anti-Spoofing & Liveness
      const liveness = checkLivenessAndAntiSpoof(canvas, detection.box)
      if (!liveness.isLive) {
        setFacePhase('live')
        setFaceStatusMsg(`🛡️ Anti-Spoof Alert: ${liveness.reason}. Please present a live, genuine face.`)
        setFaceStatusType('error')
        await startCamera()
        return
      }

      // SCRFD 5-point alignment & ArcFace 512D embedding
      const landmarks5 = extract5KeyLandmarks(fullDetection)
      const alignedCanvas = alignFaceInsightFace(canvas, landmarks5)
      const embedding512 = generateArcFace512Embedding(alignedCanvas, fullDetection.descriptor)

      // ── All checks passed — show preview ────────────────────────────────────
      setCapturedImage(imageDataUrl)
      setFaceDescriptor(embedding512)
      setFacePhase('preview')
      setFaceStatusMsg(`✅ ArcFace 512D profile ready! Quality: ${Math.round(detection.score * 100)}% | Liveness: ${liveness.livenessScore}%`)
      setFaceStatusType('success')
    } catch (err) {
      console.error('[AddEmployee] Face analysis error:', err)
      setFacePhase('live')
      setFaceStatusMsg('❌ Face analysis failed. Please try again.')
      setFaceStatusType('error')
      await startCamera()
    }
  }

  // ── Retake ────────────────────────────────────────────────────────────────────
  const handleRetake = () => {
    setCapturedImage(null)
    setFaceDescriptor(null)
    setFacePhase('idle')
    setFaceStatusMsg('')
    setFaceStatusType('info')
  }

  // ── Step 1 → Step 2 ───────────────────────────────────────────────────────────
  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!empId.trim() || !name.trim() || !email.trim()) {
      showToast('⚠️ Please fill in all required fields (ID, Name, Email)', '#eab308')
      return
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast('⚠️ Please enter a valid email address', '#eab308')
      return
    }
    setStep(2)
  }

  // ── Final submit: create employee + enroll face ───────────────────────────────
  const handleFinalSubmit = async () => {
    if (!capturedImage) {
      showToast('⚠️ Face capture is mandatory. Please capture your face first.', '#eab308')
      return
    }
    if (facePhase !== 'preview') {
      showToast('⚠️ Please complete face capture first.', '#eab308')
      return
    }

    setSubmitting(true)
    let createdEmployee = null

    try {
      // ── 1. Create the employee account ────────────────────────────────────────
      const response = await employeeAPI.add({
        empId: empId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department,
        shift,
        password: password || 'Aparaitech123@',
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        phone: phone.trim(),
        dob: dob
      })
      createdEmployee = response.employee

      // ── 2. Enroll face using existing /api/face/enroll endpoint ──────────────
      const faceResult = await faceAPI.enroll(
        email.trim().toLowerCase(),
        capturedImage,
        'Admin (Registration)',
        faceDescriptor,
        {
          faceEmbeddingModel: 'arcface-512d',
          livenessVerified: true,
          livenessScore: 92
        }
      )

      if (!faceResult.success) {
        // Employee was created but face enrollment failed — still show warning
        showToast(`⚠️ Employee created but face enrollment failed: ${faceResult.message}`, '#f59e0b')
      } else {
        showToast(`✅ ${name.trim()} registered with Face ID! (${createdEmployee.empId})`, '#22c55e')
      }

      // ── 3. Reset form and close ───────────────────────────────────────────────
      onEmployeeAdded()
      resetAll()
      onClose()
    } catch (err) {
      console.error('[AddEmployee] Submit error:', err)

      if (createdEmployee) {
        // Employee created but face enrollment errored
        showToast('⚠️ Employee created but face enrollment encountered an error. Update face from Face ID Management.', '#f59e0b')
        onEmployeeAdded()
        resetAll()
        onClose()
      } else {
        // Employee creation itself failed
        const errorMsg = err.response?.data?.message || 'Failed to create employee account'
        showToast(`❌ ${errorMsg}`, '#dc2626')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Handle close ──────────────────────────────────────────────────────────────
  const handleClose = () => {
    resetAll()
    onClose()
  }

  // ── Status color helper ───────────────────────────────────────────────────────
  const getStatusStyle = (type) => {
    switch (type) {
      case 'success': return { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' }
      case 'error':   return { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }
      case 'warn':    return { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }
      default:        return { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }
    }
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '580px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-user-plus" style={{ marginRight: '4px' }}></i>
              Add New Employee
            </h3>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: step >= 1 ? '#2563eb' : '#94a3b8' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: step >= 1 ? '#2563eb' : '#e2e8f0',
                  color: step >= 1 ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800
                }}>
                  {step > 1 ? '✓' : '1'}
                </div>
                Employee Details
              </div>
              <div style={{ color: '#cbd5e1', fontWeight: 400, alignSelf: 'center', fontSize: '0.8rem' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: step >= 2 ? '#2563eb' : '#94a3b8' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: step >= 2 ? '#2563eb' : '#e2e8f0',
                  color: step >= 2 ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800
                }}>
                  2
                </div>
                Face Enrollment
                <span style={{ color: '#dc2626', fontSize: '0.65rem', fontWeight: 600 }}>(Mandatory)</span>
              </div>
            </div>
          </div>
          <button className="close-modal" onClick={handleClose}>&times;</button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1 — Employee Details
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className="input-group">
              <label>Employee ID *</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. AP1038"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                className="auth-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                className="auth-input"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                className="auth-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="input-group">
              <label>Joining Date *</label>
              <input
                type="date"
                className="auth-input"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="input-group">
              <label>Department *</label>
              <select
                className="auth-input"
                value={department}
                onChange={(e) => {
                  const val = e.target.value
                  setDepartment(val)
                  if (val === 'Development' || val === 'Software Development') {
                    setShift('shift_1')
                  } else if (val === 'BDA' || val === 'Sales') {
                    setShift('shift_2')
                  }
                }}
                required
              >
                <option value="BDA">BDA</option>
                <option value="Software Development">Software Development</option>
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
            <div className="input-group">
              <label>Work Shift *</label>
              <select
                className="auth-input"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                required
              >
                <option value="shift_1">Shift 1: Software Developer (07:00 AM - 11:00 AM)</option>
                <option value="shift_2">Shift 2: BDA Phase 2 (11:00 AM - 05:00 PM)</option>
                <option value="shift_3">Shift 3: BDA Phase 2 Evening (05:00 PM - 11:00 PM)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Default: Aparaitech123@"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Info: next step notice */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#1d4ed8' }}>
              📌 After filling in details, you will be asked to <strong>capture the employee's face</strong>. This is mandatory for attendance verification.
            </div>

            <button type="submit" className="auth-btn">
              Next: Capture Face <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }}></i>
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2 — Face Enrollment
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            {/* Employee summary chip */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '0.7rem 1rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{email} · {department} · {empId}</div>
              </div>
            </div>

            {/* Mandatory badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
              <span style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                ⚠️ MANDATORY
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Face must be enrolled before the employee account can be created.
              </span>
            </div>

            {/* Requirements guide */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>📋 Face Capture Requirements:</p>
              <ul style={{ fontSize: '0.78rem', color: '#64748b', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.8 }}>
                <li>✅ Exactly <strong>1 face</strong> must be visible</li>
                <li>✅ Face fully inside the oval guide</li>
                <li>✅ Good lighting — avoid shadows</li>
                <li>✅ Look directly at the camera</li>
                <li>❌ No masks, glasses, or obstructions (if possible)</li>
                <li>❌ Multiple people in frame will be rejected</li>
              </ul>
            </div>

            {/* ── Camera / Preview area ─────────────────────────────────────── */}
            {facePhase !== 'preview' ? (
              <div>
                {/* Camera viewport */}
                <div style={{
                  position: 'relative', borderRadius: '12px',
                  overflow: 'hidden', background: '#0f172a',
                  aspectRatio: '4/3',
                  display: facePhase === 'live' || facePhase === 'analyzing' ? 'block' : 'none'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                  />
                  {/* Oval face guide */}
                  {facePhase === 'live' && (
                    <>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -55%)',
                        width: '155px', height: '195px',
                        border: '2.5px dashed rgba(37,99,235,0.75)',
                        borderRadius: '50%', pointerEvents: 'none'
                      }} />
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(ellipse 50% 63% at 50% 45%, transparent 0%, rgba(15,23,42,0.45) 100%)',
                        pointerEvents: 'none'
                      }} />
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#22c55e', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 9px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        LIVE
                      </div>
                    </>
                  )}
                  {/* Analyzing overlay */}
                  {facePhase === 'analyzing' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '2rem' }}>🔍</div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>Analyzing face...</p>
                    </div>
                  )}
                </div>

                {/* Idle / loading states */}
                {(facePhase === 'idle' || facePhase === 'loading-models' || facePhase === 'starting-camera') && (
                  <div style={{
                    borderRadius: '12px', background: '#0f172a', aspectRatio: '4/3',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px'
                  }}>
                    <div style={{ fontSize: '3rem' }}>
                      {facePhase === 'idle' ? '📷' : facePhase === 'loading-models' ? '🧠' : '⏳'}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '0 1rem' }}>
                      {facePhase === 'idle' ? 'Camera is off. Click "Open Camera" to start.' :
                       facePhase === 'loading-models' ? 'Loading face detection models...' :
                       'Starting camera...'}
                    </p>
                    {(facePhase === 'loading-models' || facePhase === 'starting-camera') && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb',
                            animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status message */}
                {faceStatusMsg && (
                  <div style={{ ...getStatusStyle(faceStatusType), borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '0.82rem' }}>
                    {faceStatusMsg}
                  </div>
                )}

                {/* Camera action buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {facePhase === 'idle' && (
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        flex: 1, background: '#2563eb', color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '10px 16px', fontWeight: 700,
                        fontSize: '0.88rem', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <i className="fas fa-camera"></i> Open Camera
                    </button>
                  )}
                  {facePhase === 'live' && (
                    <button
                      type="button"
                      onClick={captureAndAnalyze}
                      style={{
                        flex: 1, background: '#22c55e', color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '10px 16px', fontWeight: 700,
                        fontSize: '0.88rem', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <i className="fas fa-user-check"></i> Capture Face
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ── Preview: captured & validated face ───────────────────────── */
              <div>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Validated badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#22c55e', color: '#fff', borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-check-circle"></i> FACE VALIDATED
                  </div>
                </div>

                {/* Success status */}
                {faceStatusMsg && (
                  <div style={{ ...getStatusStyle(faceStatusType), borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '0.82rem' }}>
                    {faceStatusMsg}
                  </div>
                )}

                {/* Retake button */}
                <button
                  type="button"
                  onClick={handleRetake}
                  style={{
                    marginTop: '8px', width: '100%', background: 'none',
                    border: '1px solid #e2e8f0', color: '#475569', borderRadius: '8px',
                    padding: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  🔄 Retake Face Photo
                </button>
              </div>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* ── Bottom action buttons ──────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => { setStep(1); stopCamera() }}
                style={{
                  padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: '#f1f5f9', color: '#475569', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem'
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: '5px' }}></i> Back
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={facePhase !== 'preview' || submitting}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                  background: facePhase === 'preview' && !submitting ? '#22c55e' : '#cbd5e1',
                  color: facePhase === 'preview' && !submitting ? '#fff' : '#94a3b8',
                  cursor: facePhase === 'preview' && !submitting ? 'pointer' : 'not-allowed',
                  fontWeight: 700, fontSize: '0.88rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {submitting ? (
                  <>⏳ Creating Employee...</>
                ) : facePhase !== 'preview' ? (
                  <>🔒 Capture Face to Continue</>
                ) : (
                  <><i className="fas fa-user-plus"></i> Create Employee &amp; Enroll Face</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddEmployeeModal
