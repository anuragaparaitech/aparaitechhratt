import React, { useState, useEffect } from 'react';
import AparaitechLogo from './AparaitechLogo';
import './SplashScreen.css';

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState(1);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const s = setTimeout(() => setStage(2), 800);
    const o = setTimeout(() => setStage(3), 1700);
    const l = setTimeout(() => setStage(4), 2600);
    const c = setTimeout(() => setStage(5), 3600);

    return () => {
      clearTimeout(s);
      clearTimeout(o);
      clearTimeout(l);
      clearTimeout(c);
    };
  }, []);

  const handleFinish = () => {
    setExit(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 450);
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`splash-screen-container ${exit ? 'splash-exit' : ''}`}>
      {/* Top Device / Status Bar Header */}
      <div className="splash-status-bar">
        <span className="splash-time">{currentTime}</span>
        <div className="splash-icons">
          <i className="fas fa-signal" />
          <i className="fas fa-wifi" />
          <i className="fas fa-battery-full" />
        </div>
      </div>

      {/* Skip Button during intro progression */}
      {stage < 5 && (
        <button className="splash-skip-btn" onClick={handleFinish} title="Skip to App">
          Skip <i className="fas fa-chevron-right" style={{ fontSize: '0.65rem' }} />
        </button>
      )}

      {/* Stages 1 to 4 Content */}
      {stage < 5 && (
        <div className="splash-stage-content">
          <div className="splash-logo-stage-box">
            {stage >= 2 && (
              <div className="splash-orbit-system">
                <div className="orbit-ring orbit-ring-inner">
                  <div className="orbit-dot dot-1" />
                </div>
                <div className="orbit-ring orbit-ring-middle">
                  <div className="orbit-dot dot-2" />
                </div>
                <div className="orbit-ring orbit-ring-outer">
                  <div className="orbit-dot dot-3" />
                </div>
              </div>
            )}
            <div className={`splash-cube-anim stage-${stage}`}>
              <AparaitechLogo size={120} animate={true} showBadge={true} />
            </div>
          </div>

          <div className={`splash-brand-group ${stage >= 3 ? 'show' : ''}`}>
            <h1 className="splash-brand-title">APARAITECH</h1>
            <p className="splash-brand-sub">SOFTWARE COMPANY</p>
          </div>

          <div className={`splash-tagline-box ${stage >= 4 ? 'show' : ''}`}>
            <div className="tagline-pill">
              <span>INNOVATING SOFTWARE DEVELOPMENT FOR THE FUTURE</span>
            </div>
          </div>
        </div>
      )}

      {/* Stage 5: Grand Landing / Welcome Stage */}
      {stage === 5 && (
        <div className="splash-stage-5-container">
          {/* Angled Ribbon Overlays */}
          <div className="geometric-bg-overlay">
            <div className="ribbon ribbon-navy" />
            <div className="ribbon ribbon-teal" />
            <div className="ribbon ribbon-gold" />
            <div className="ribbon ribbon-cyan" />
          </div>

          {/* Elevated Circular Badge with 3D Logo */}
          <div className="stage5-center-card">
            <div className="stage5-badge-circle">
              <AparaitechLogo size={85} animate={true} showBadge={true} />
              <div className="stage5-badge-text">
                <div className="stage5-brand">APARAITECH</div>
                <div className="stage5-sub">ATTENDANCE</div>
              </div>
            </div>
          </div>

          {/* Bottom Call-To-Action Area */}
          <div className="stage5-bottom-area">
            <div className="stage5-tagline-text">
              <span className="gold-sparkle">✦</span> Enterprise Biometric & HRMS Portal
            </div>

            <button className="stage5-get-started-btn" onClick={handleFinish}>
              <span>Get Started</span>
              <div className="btn-arrow-circle">
                <i className="fas fa-arrow-right" />
              </div>
            </button>

            <div className="stage5-footer-info">
              <span>aparaitech.org</span>
              <span className="dot-sep">•</span>
              <span>v2.5.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
