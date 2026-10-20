import React, { useRef, useEffect, useState, useCallback } from 'react'

/**
 * WebcamCaptureModal
 *
 * A reusable modal that:
 *  1. Opens the user's webcam
 *  2. Shows a live preview
 *  3. Lets the user capture a frame
 *  4. Lets the user retake or confirm
 *  5. Returns the captured image as a base64 data URL via onCapture()
 *  6. Properly releases all media tracks on close / unmount
 *
 * Props:
 *  isOpen       {boolean}   — whether the modal is visible
 *  onClose      {function}  — called when user cancels
 *  onCapture    {function}  — called with (imageDataUrl) when user confirms
 *  title        {string}    — optional modal title
 *  instructions {string}    — optional instruction text shown above the video
 */
function WebcamCaptureModal({ isOpen, onClose, onCapture, title = 'Take a Photo', instructions = '' }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase] = useState('camera') // 'camera' | 'preview'
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [cameraStarting, setCameraStarting] = useState(false)

  // ── Start camera ─────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraStarting(true)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Your browser does not support camera access. Please use Chrome, Firefox, or Edge.')
      setCameraStarting(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraStarting(false)
    } catch (err) {
      setCameraStarting(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permission in your browser settings and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was found on this device. Please connect a camera and try again.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application. Please close other apps using the camera and try again.')
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error'}. Please try again.`)
      }
    }
  }, [])

  // ── Stop camera ──────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // ── Lifecycle: start on open, stop on close ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setPhase('camera')
      setCapturedImage(null)
      setCameraError(null)
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera() // Cleanup on unmount
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Capture photo from live video frame ──────────────────────────────────────
  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')

    // Mirror effect: flip horizontally so preview matches mirror expectation
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    // Compress image to JPEG, 85% quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)
    setPhase('preview')
    stopCamera() // Release camera immediately after capture
  }

  // ── Retake: go back to camera view ───────────────────────────────────────────
  const handleRetake = () => {
    setCapturedImage(null)
    setPhase('camera')
    startCamera()
  }

  // ── Confirm: pass captured image to parent ────────────────────────────────────
  const handleConfirm = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage)
    }
  }

  // ── Cancel: stop camera and close ────────────────────────────────────────────
  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setPhase('camera')
    if (onClose) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.8rem',
          width: '90%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📸</span> {title}
          </h3>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.4rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {instructions && (
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', padding: '0.6rem 0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            💡 {instructions}
          </p>
        )}

        {/* Camera error state */}
        {cameraError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '1rem' }}>
            <p style={{ color: '#b91c1c', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>⚠️ Camera Error</p>
            <p style={{ color: '#dc2626', fontSize: '0.82rem' }}>{cameraError}</p>
            <button
              onClick={startCamera}
              style={{ marginTop: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Camera starting indicator */}
        {cameraStarting && !cameraError && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ fontSize: '0.88rem' }}>Starting camera...</p>
          </div>
        )}

        {/* Live camera preview */}
        {phase === 'camera' && !cameraError && (
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#0f172a', aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: cameraStarting ? 'none' : 'block' }}
              />
            </div>

            {/* Face guide overlay */}
            {!cameraStarting && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -55%)',
                width: '160px', height: '200px',
                border: '2px dashed rgba(37,99,235,0.6)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
            )}

            {!cameraStarting && (
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', margin: '0.6rem 0 0' }}>
                Position your face inside the guide
              </p>
            )}
          </div>
        )}

        {/* Captured photo preview */}
        {phase === 'preview' && capturedImage && (
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem' }}>
              Review your photo. If it looks good, click Confirm.
            </p>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleClose}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '8px', padding: '9px 18px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            Cancel
          </button>

          {phase === 'camera' && !cameraError && !cameraStarting && (
            <button
              onClick={capturePhoto}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📷 Capture
            </button>
          )}

          {phase === 'preview' && (
            <>
              <button
                onClick={handleRetake}
                style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                🔄 Retake
              </button>
              <button
                onClick={handleConfirm}
                style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                ✅ Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WebcamCaptureModal
