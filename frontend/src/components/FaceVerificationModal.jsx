import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { API_URL } from '../services/api'

/**
 * FaceVerificationModal — FIXED
 *
 * ROOT CAUSE OF PREVIOUS BUG:
 *   Two <video ref={videoRef}> elements existed simultaneously:
 *     1. A visible one inside {verifyPhase === 'camera' && <div>...<video ref={videoRef}/></div>}
 *     2. A hidden one at the bottom: <video ref={videoRef} style={{display:'none'}}/>
 *   React ref always resolves to the LAST mounted element.
 *   So videoRef.current always pointed to the hidden display:none video.
 *   The camera stream attached to the invisible element → visible video was always blank.
 *   Canvas drew from the hidden blank video → no face detected → immediate "Failed".
 *
 * FIX:
 *   - ONE single <video> element, always in the DOM.
 *   - Visibility toggled via CSS (height:0 / overflow:hidden) — NOT by conditional rendering.
 *   - Stream is attached before phase state change so the single ref is always correct.
 *   - Models and registered descriptor loaded in background WHILE camera opens.
 *   - Full debug logging added at every step.
 *
 * FLOW:
 *   Open modal → Start camera immediately → Show live preview
 *   → Load models + fetch descriptor in parallel (background)
 *   → Employee clicks Capture → Canvas draws frame → Face detection runs
 *   → Compare descriptors → Mark attendance or show failure
 */

const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'
const SIMILARITY_THRESHOLD = 0.45  // Euclidean distance ≤ 0.45 → similarity ≥ 55% → verified
const MIN_CONFIDENCE_PCT = 55       // Human-readable minimum confidence required (%)

// ── Debug logger ──────────────────────────────────────────────────────────────
const log = (msg, data) => {
  const prefix = '[FaceVerify]'
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, data)
  } else {
    console.log(`${prefix} ${msg}`)
  }
}

/**
 * Phases (UI state machine):
 *  'init'           – modal just opened, nothing started yet
 *  'starting-camera'– getUserMedia() called, waiting for permission
 *  'camera-ready'   – stream live, employee sees their face
 *  'background-load'– models/descriptor loading in background while camera shows
 *  'capturing'      – employee clicked Capture, drawing canvas frame
 *  'verifying'      – face detection + comparison running
 *  'verified'       – match confirmed, auto-proceeding
 *  'failed'         – real mismatch after full comparison
 *  'no-face'        – captured image had no detectable face
 *  'multi-face'     – captured image had >1 face
 *  'cam-denied'     – camera permission denied
 *  'cam-not-found'  – no camera hardware
 *  'cam-error'      – generic camera error
 *  'model-error'    – face-api.js model load failed
 *  'no-enrolled'    – employee has no registered face
 *  'fetch-error'    – failed to fetch registered face from server
 */

function FaceVerificationModal({
  isOpen,
  onClose,
  onVerified,
  employeeEmail,
  mode = 'checkin',
  threshold = SIMILARITY_THRESHOLD
}) {
  // ── Single refs — never duplicated ─────────────────────────────────────────
  const videoRef   = useRef(null)   // THE one and only <video> element
  const canvasRef  = useRef(null)   // THE one and only <canvas> element
  const streamRef  = useRef(null)   // MediaStream reference for cleanup
  const descriptorRef = useRef(null) // Registered Float32Array(128) descriptor

  // ── Phase state ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('init')
  const [statusMsg, setStatusMsg] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [score, setScore] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [bgLoading, setBgLoading] = useState(false) // models loading in background
  const [bgReady, setBgReady] = useState(false)     // models + descriptor ready

  const MAX_RETRIES = 3
  const modeLabel = mode === 'checkin' ? 'Check-In' : 'Check-Out'
  const modeColor = mode === 'checkin' ? '#22c55e' : '#ef4444'

  // ── Stop camera stream ──────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
      log('Camera stream stopped')
    }
    // Do NOT touch videoRef.current.srcObject here — just nullify after stop
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // ── Full reset ──────────────────────────────────────────────────────────────
  const fullReset = useCallback(() => {
    stopStream()
    descriptorRef.current = null
    setPhase('init')
    setStatusMsg('')
    setCapturedImage(null)
    setScore(null)
    setRetryCount(0)
    setBgLoading(false)
    setBgReady(false)
  }, [stopStream])

  // ── Lifecycle: open / close ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      log('Modal opened — starting camera immediately')
      setRetryCount(0)
      startCameraThenLoad()
    } else {
      fullReset()
    }
    return () => {
      stopStream()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── STEP 1: Start camera FIRST, then load models in background ────────────
  const startCameraThenLoad = async () => {
    // --- Camera phase ---
    log('Camera access requested')
    setPhase('starting-camera')
    setStatusMsg('')

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      log('getUserMedia not supported in this browser')
      setPhase('cam-error')
      setStatusMsg('Your browser does not support camera access. Please use Chrome, Edge, Firefox, or Safari.')
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:  { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })
      log('Camera access granted ✓')
    } catch (err) {
      log('Camera access error:', err.name)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPhase('cam-denied')
        setStatusMsg('Camera permission denied. Please allow camera access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPhase('cam-not-found')
        setStatusMsg('No camera found. Please connect a webcam device and try again.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPhase('cam-error')
        setStatusMsg('Camera is in use by another application. Close it and try again.')
      } else if (err.name === 'OverconstrainedError') {
        setPhase('cam-error')
        setStatusMsg('Camera does not meet requirements. Please try a different camera.')
      } else {
        setPhase('cam-error')
        setStatusMsg(`Camera error: ${err.message}`)
      }
      return
    }

    // Attach stream to the SINGLE video ref
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      try {
        await videoRef.current.play()
        log('Webcam stream started ✓ — video dimensions:', {
          w: videoRef.current.videoWidth,
          h: videoRef.current.videoHeight
        })
      } catch (playErr) {
        log('Video play() error:', playErr.message)
        // Autoplay policy may block — still try to proceed
      }
    } else {
      log('WARNING: videoRef.current is null after stream assigned')
    }

    // Show live preview — phase change AFTER stream is attached
    setPhase('camera-ready')
    log('Phase → camera-ready')

    // --- Background: load models + fetch descriptor (non-blocking) ---
    loadModelsAndDescriptor()
  }

  // ── STEP 2 (background): Load face-api.js models + fetch registered face ──
  const loadModelsAndDescriptor = async () => {
    setBgLoading(true)
    log('Background: loading face-api.js models...')

    // Load models
    try {
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL)
        log('TinyFaceDetector loaded ✓')
      }
      if (!faceapi.nets.faceLandmark68TinyNet.isLoaded) {
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL)
        log('FaceLandmark68Tiny loaded ✓')
      }
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL)
        log('FaceRecognitionNet loaded ✓')
      }
      log('All face-api.js models ready ✓')
    } catch (modelErr) {
      log('Model load FAILED:', modelErr.message)
      setPhase('model-error')
      setStatusMsg('Failed to load face recognition models. Check your internet connection and click Retry.')
      setBgLoading(false)
      return
    }

    // Fetch registered face descriptor from backend
    log(`Fetching registered face for: ${employeeEmail}`)
    try {
      const token = localStorage.getItem('aparaitech_token')
      const res = await fetch(
        `${API_URL}/api/face/${encodeURIComponent(employeeEmail)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      log('Face API response:', { success: data.success, enrolled: data.enrolled, hasDescriptor: data.hasDescriptor })

      if (!data.success || !data.enrolled || !data.faceImageUrl) {
        log('No enrolled face found for employee')
        setBgLoading(false)
        setPhase('no-enrolled')
        return
      }

      // Use stored 128-d descriptor if available (set at enrollment time)
      if (data.faceDescriptor && data.faceDescriptor.length === 128) {
        descriptorRef.current = new Float32Array(data.faceDescriptor)
        log('Using stored descriptor from DB ✓ (length=128)')
      } else {
        // Fallback: compute descriptor from the registered image
        log('No stored descriptor — computing from registered image...')
        const img = await faceapi.fetchImage(`${API_URL}${data.faceImageUrl}`)
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor()

        if (!detection) {
          log('Could not detect face in registered photo')
          setPhase('fetch-error')
          setStatusMsg('Could not read your registered face photo. Please re-enroll with a clearer front-facing photo.')
          setBgLoading(false)
          return
        }
        descriptorRef.current = detection.descriptor
        log('Computed descriptor from registered image ✓')
      }

      setBgLoading(false)
      setBgReady(true)
      log('Background load complete — ready to verify ✓')

    } catch (fetchErr) {
      log('Registered face fetch FAILED:', fetchErr.message)
      setBgLoading(false)
      setPhase('fetch-error')
      setStatusMsg(`Could not load your registered face data: ${fetchErr.message}. Please try again.`)
    }
  }

  // ── STEP 3: Capture frame from live video ──────────────────────────────────
  const handleCapture = async () => {
    const video  = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      log('ERROR: video or canvas ref is null during capture')
      return
    }

    // Validate video is actually playing
    if (video.readyState < 2) { // HAVE_CURRENT_DATA = 2
      log('Video not ready yet (readyState=' + video.readyState + ')')
      setStatusMsg('Camera is not ready yet. Please wait a moment and try again.')
      return
    }

    const vw = video.videoWidth
    const vh = video.videoHeight
    log(`Capturing frame — video dimensions: ${vw}×${vh}`)

    if (!vw || !vh) {
      log('ERROR: Video dimensions are 0 — stream not attached to visible element')
      setStatusMsg('Camera is not showing video. Please close and try again.')
      return
    }

    setPhase('capturing')
    setStatusMsg('Capturing...')

    // Draw mirrored frame to canvas
    canvas.width  = vw
    canvas.height = vh
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    log('Frame captured ✓ — data URL length:', imageDataUrl.length)
    setCapturedImage(imageDataUrl)

    // Stop camera stream (release hardware)
    stopStream()

    // Run face verification
    await runVerification(imageDataUrl)
  }

  // ── STEP 4: Detect face + compare descriptor ───────────────────────────────
  const runVerification = async (imageDataUrl) => {
    setPhase('verifying')
    setStatusMsg('Analyzing face...')

    // Wait for background load if still in progress
    if (!bgReady && !descriptorRef.current) {
      log('Background load not complete yet — waiting up to 15s...')
      setStatusMsg('Loading verification data...')
      const waited = await waitForDescriptor(15000)
      if (!waited) {
        log('Timed out waiting for descriptor — model/descriptor not ready')
        setPhase('fetch-error')
        setStatusMsg('Face verification data took too long to load. Please close and try again.')
        return
      }
    }

    // Check we have a registered descriptor
    if (!descriptorRef.current) {
      log('No registered descriptor available after wait')
      setPhase('no-enrolled')
      return
    }

    log('Loading captured image for face detection...')

    try {
      // Create HTMLImageElement from captured data URL
      const capturedImg = new Image()
      capturedImg.src = imageDataUrl
      await new Promise((resolve, reject) => {
        capturedImg.onload  = resolve
        capturedImg.onerror = reject
      })

      log('Running face detection on captured image...')

      // Detect ALL faces first (to catch multi-face scenario)
      const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
      const allFaces = await faceapi.detectAllFaces(capturedImg, options)
      log('Faces detected:', allFaces.length)

      // No face
      if (!allFaces || allFaces.length === 0) {
        log('No face detected in captured image')
        setPhase('no-face')
        setStatusMsg('No face detected. Please ensure your face is clearly visible in the camera frame.')
        return
      }

      // Multiple faces
      if (allFaces.length > 1) {
        log(`Multiple faces detected: ${allFaces.length}`)
        setPhase('multi-face')
        setStatusMsg(`${allFaces.length} faces detected. Please ensure only one person is visible in the frame.`)
        return
      }

      log('Exactly 1 face detected ✓ — computing descriptor...')

      // Single face — compute full descriptor
      const liveDetection = await faceapi
        .detectSingleFace(capturedImg, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!liveDetection) {
        log('detectSingleFace returned null — could not compute descriptor')
        setPhase('no-face')
        setStatusMsg('Could not compute face features. Please improve lighting and try again.')
        return
      }

      log('Face descriptor generated ✓')

      // Compare with registered descriptor
      log('Running face comparison...')
      const distance = faceapi.euclideanDistance(
        liveDetection.descriptor,
        descriptorRef.current
      )
      const similarity = Math.round(Math.max(0, (1 - distance) * 100))
      setScore(similarity)

      log(`Face comparison complete — distance: ${distance.toFixed(4)}, similarity: ${similarity}%, threshold: ${MIN_CONFIDENCE_PCT}% (distance ≤ ${SIMILARITY_THRESHOLD})`)

      if (distance <= threshold) {
        log(`Verification SUCCESSFUL ✓ (${similarity}% similarity)`)
        setPhase('verified')
        setStatusMsg(`Face verified successfully! Similarity: ${similarity}%`)
        setTimeout(() => {
          if (onVerified) onVerified(imageDataUrl, similarity)
        }, 1500)
      } else {
        log(`Verification FAILED — similarity ${similarity}% below required ${MIN_CONFIDENCE_PCT}%`)
        setPhase('failed')
        setStatusMsg(`Face verification failed. Match confidence is below the required ${MIN_CONFIDENCE_PCT}%. Please face the camera directly and try again.`)
      }

    } catch (err) {
      log('Verification error:', err.message)
      setPhase('cam-error')
      setStatusMsg(`Verification error: ${err.message}. Please try again.`)
    }
  }

  // ── Helper: wait for descriptorRef to be populated (poll) ─────────────────
  const waitForDescriptor = (timeoutMs) => {
    return new Promise((resolve) => {
      const start = Date.now()
      const check = () => {
        if (descriptorRef.current) {
          resolve(true)
        } else if (Date.now() - start >= timeoutMs) {
          resolve(false)
        } else {
          setTimeout(check, 300)
        }
      }
      check()
    })
  }

  // ── Retry: reopen camera ────────────────────────────────────────────────────
  const handleRetry = async () => {
    if (retryCount >= MAX_RETRIES) {
      setPhase('cam-error')
      setStatusMsg(`Maximum retries (${MAX_RETRIES}) reached. Please contact your administrator.`)
      return
    }
    log(`Retry attempt ${retryCount + 1}`)
    setRetryCount(r => r + 1)
    setCapturedImage(null)
    setScore(null)
    setStatusMsg('')

    // Restart camera — descriptor is already loaded, no need to reload
    setPhase('starting-camera')
    log('Camera access requested (retry)')

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase('cam-error')
      setStatusMsg('Your browser does not support camera access.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        log('Camera restarted for retry ✓')
      }
      setPhase('camera-ready')
    } catch (err) {
      log('Retry camera error:', err.name)
      setPhase('cam-denied')
      setStatusMsg('Camera permission denied. Please allow camera access in browser settings.')
    }
  }

  // ── Skip (no face enrolled — let employee proceed without verification) ────
  const handleSkip = () => {
    log('User chose to proceed without face verification')
    if (onVerified) onVerified(null, null)
  }

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleClose = () => {
    log('User cancelled face verification')
    stopStream()
    if (onClose) onClose()
  }

  if (!isOpen) return null

  // ── Is camera showing live view? (for conditional camera UI) ───────────────
  const isLiveCamera = phase === 'camera-ready'
  const isLoading    = phase === 'starting-camera' || phase === 'capturing' || phase === 'verifying'
  const isErrorState = ['cam-denied', 'cam-not-found', 'cam-error', 'model-error', 'fetch-error'].includes(phase)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15,23,42,0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3500
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '1.8rem',
        width: '92%',
        maxWidth: '560px',
        maxHeight: '94vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.45)',
        border: '1px solid #e2e8f0'
      }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🔒 Face Verification
              <span style={{ background: modeColor, color: '#fff', fontSize: '0.68rem', padding: '2px 10px', borderRadius: '20px', fontWeight: 700 }}>
                {modeLabel}
              </span>
            </h3>
            <p style={{ fontSize: '0.77rem', color: '#64748b', margin: '3px 0 0' }}>
              Identity must be verified before attendance is marked
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            THE SINGLE VIDEO ELEMENT — always in DOM, CSS-controlled visibility
            NEVER conditionally rendered. This fixes the dual-ref bug.
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#0f172a',
          // Show the camera area only during live preview
          display: isLiveCamera ? 'block' : 'none'
        }}>
          {/* aspectRatio wrapper */}
          <div style={{ aspectRatio: '4/3', position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',  // Mirror for natural selfie feel
                display: 'block'
              }}
              onLoadedMetadata={() => {
                log('Video loadedmetadata event ✓ — dimensions:', {
                  w: videoRef.current?.videoWidth,
                  h: videoRef.current?.videoHeight
                })
              }}
              onCanPlay={() => log('Video canplay event ✓')}
            />

            {/* Oval face guide overlay */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -55%)',
              width: '145px', height: '185px',
              border: '2.5px solid rgba(37,99,235,0.75)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 2
            }} />

            {/* Vignette overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 55% 65% at 50% 45%, transparent 0%, rgba(15,23,42,0.4) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            {/* LIVE badge */}
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#22c55e', color: '#fff',
              fontSize: '0.6rem', fontWeight: 800,
              padding: '2px 9px', borderRadius: '12px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              zIndex: 3
            }}>
              LIVE
            </div>

            {/* Background loading badge */}
            {bgLoading && (
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(15,23,42,0.75)', color: '#94a3b8',
                fontSize: '0.6rem', fontWeight: 600,
                padding: '2px 9px', borderRadius: '12px',
                zIndex: 3
              }}>
                ⏳ Preparing...
              </div>
            )}
            {bgReady && !bgLoading && (
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(34,197,94,0.85)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                padding: '2px 9px', borderRadius: '12px',
                zIndex: 3
              }}>
                ✓ Ready
              </div>
            )}
          </div>

          {/* Instructions */}
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', padding: '6px 0', margin: 0 }}>
            Position your face within the oval guide, then click <strong style={{ color: '#fff' }}>Capture Face</strong>
          </p>

          {/* Retry attempt counter */}
          {retryCount > 0 && (
            <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.74rem', margin: '0 0 4px' }}>
              Attempt {retryCount + 1} of {MAX_RETRIES + 1}
            </p>
          )}
        </div>

        {/* Hidden canvas — always in DOM, never shown ───────────────────────── */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ── Phase: Camera starting ────────────────────────────────────────── */}
        {phase === 'starting-camera' && (
          <div style={{ textAlign: 'center', padding: '2.2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📷</div>
            <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Starting Camera...</p>
            <p style={{ color: '#64748b', fontSize: '0.83rem', marginBottom: '1rem' }}>
              Please allow camera access when your browser asks for permission.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb',
                  animation: `pulse 1.2s ease-in-out ${i*0.3}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Phase: Capturing / Verifying ──────────────────────────────────── */}
        {(phase === 'capturing' || phase === 'verifying') && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            {capturedImage && (
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', border: '3px solid #2563eb' }}>
                <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {phase === 'capturing' ? '📷' : '🔐'}
            </div>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>
              {phase === 'capturing' ? 'Capturing your face...' : 'Verifying identity...'}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px' }}>{statusMsg}</p>
          </div>
        )}

        {/* ── Phase: Verified ───────────────────────────────────────────────── */}
        {phase === 'verified' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            {capturedImage && (
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', border: '4px solid #22c55e' }}>
                <img src={capturedImage} alt="Verified" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem', margin: '0 0 4px' }}>Identity Verified!</p>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0 0 4px' }}>
              Match Confidence: <strong style={{ color: '#15803d' }}>{score}%</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Processing your {modeLabel}...</p>
          </div>
        )}

        {/* ── Phase: Failed (real mismatch after full comparison) ───────────── */}
        {phase === 'failed' && (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            {capturedImage && (
              <div style={{ width: '95px', height: '95px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 0.8rem', border: '3px solid #ef4444', opacity: 0.75 }}>
                <img src={capturedImage} alt="Failed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>❌</div>
            <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '1rem', margin: '0 0 4px' }}>Face Verification Failed</p>
            {score !== null && (
              <p style={{ color: '#64748b', fontSize: '0.83rem', margin: '0 0 10px' }}>
                Match Confidence: <strong style={{ color: '#b91c1c' }}>{score}%</strong> — Required: <strong>{MIN_CONFIDENCE_PCT}%+</strong>
              </p>
            )}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 4px' }}>Attendance will NOT be marked — confidence must be ≥ {MIN_CONFIDENCE_PCT}%. Tips:</p>
              <ul style={{ color: '#dc2626', fontSize: '0.8rem', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.8 }}>
                <li>Improve lighting — face a bright light source</li>
                <li>Remove glasses or face coverings if possible</li>
                <li>Look directly at the camera</li>
                <li>Ensure your full face is inside the oval</li>
                <li>Contact admin if problem persists</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
                Cancel
              </button>
              {retryCount < MAX_RETRIES && (
                <button onClick={handleRetry} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem' }}>
                  🔄 Try Again ({MAX_RETRIES - retryCount} left)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Phase: No face in captured image ──────────────────────────────── */}
        {(phase === 'no-face' || phase === 'multi-face') && (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            {capturedImage && (
              <div style={{ width: '95px', height: '95px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 0.8rem', border: '3px solid #f59e0b', opacity: 0.75 }}>
                <img src={capturedImage} alt="No face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
              {phase === 'no-face' ? '🙈' : '👥'}
            </div>
            <p style={{ fontWeight: 700, color: '#92400e', fontSize: '1rem', margin: '0 0 8px' }}>
              {phase === 'no-face' ? 'No Face Detected' : 'Multiple Faces Detected'}
            </p>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem' }}>
              <p style={{ color: '#92400e', fontSize: '0.83rem', margin: 0 }}>
                {phase === 'no-face'
                  ? 'No face was found in the captured image. Please position your face clearly inside the oval guide with good lighting.'
                  : 'More than one person was detected in the camera frame. Please ensure only you are visible in the camera.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
              <button onClick={handleClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
                Cancel
              </button>
              <button onClick={handleRetry} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem' }}>
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: No enrolled face ───────────────────────────────────────── */}
        {phase === 'no-enrolled' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.6rem' }}>🆔</div>
            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', margin: '0 0 6px' }}>No Face Registered</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Your face has not been enrolled yet. You can proceed without face verification, but please enroll your face from your profile.
            </p>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.7rem', marginBottom: '1rem' }}>
              <p style={{ color: '#b45309', fontSize: '0.8rem', margin: 0 }}>⚠️ Attendance will be marked WITHOUT face verification.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
                Cancel
              </button>
              <button onClick={handleSkip} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem' }}>
                Proceed Without Face Verification
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: Error states ───────────────────────────────────────────── */}
        {isErrorState && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.6rem' }}>
              {phase === 'cam-denied' ? '🚫' : phase === 'cam-not-found' ? '📷' : '⚠️'}
            </div>
            <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '1rem', margin: '0 0 8px' }}>
              {phase === 'cam-denied'   ? 'Camera Permission Denied'   :
               phase === 'cam-not-found'? 'Camera Not Found'           :
               phase === 'model-error'  ? 'Model Load Failed'          :
               phase === 'fetch-error'  ? 'Face Data Load Failed'      :
               'Camera Error'}
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ color: '#dc2626', fontSize: '0.83rem', margin: 0, lineHeight: 1.5 }}>{statusMsg}</p>
            </div>
            {phase === 'cam-denied' && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', textAlign: 'left' }}>
                <p style={{ color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 4px' }}>How to allow camera:</p>
                <ul style={{ color: '#1d4ed8', fontSize: '0.78rem', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.8 }}>
                  <li>Click the 🔒 lock icon in your browser address bar</li>
                  <li>Set Camera to "Allow"</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
                Cancel
              </button>
              {phase !== 'cam-denied' && phase !== 'cam-not-found' && (
                <button
                  onClick={() => { fullReset(); setTimeout(startCameraThenLoad, 100) }}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem' }}
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Live camera action buttons ─────────────────────────────────────── */}
        {isLiveCamera && (
          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.8rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleClose}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              disabled={bgLoading && !descriptorRef.current}
              style={{
                padding: '9px 22px', borderRadius: '8px', border: 'none',
                background: (bgLoading && !descriptorRef.current) ? '#94a3b8' : '#22c55e',
                color: '#fff', cursor: (bgLoading && !descriptorRef.current) ? 'wait' : 'pointer',
                fontWeight: 700, fontSize: '0.86rem',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
              title={(bgLoading && !descriptorRef.current) ? 'Please wait — loading verification data...' : 'Capture your face'}
            >
              📸 Capture Face
              {bgLoading && !descriptorRef.current && (
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(loading...)</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default FaceVerificationModal
