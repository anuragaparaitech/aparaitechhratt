import React from 'react';

export default function AparaitechLogo({ size = 80, className = '', animate = false, showBadge = true }) {
  return (
    <div
      className={`aparaitech-cube-wrapper ${animate ? 'cube-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0, 128, 128, 0.28))' }}
      >
        <defs>
          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="35%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="70%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="silverTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b192c" />
            <stop offset="40%" stopColor="#008080" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>
        </defs>

        {/* 3D Isometric Base */}
        <path
          d="M100 18 L170 58 L170 138 L100 178 L30 138 L30 58 Z"
          fill="#cbd5e1"
          stroke="url(#silverTrim)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Top Face */}
        <path
          d="M100 24 L162 60 L100 96 L38 60 Z"
          fill="url(#cubeTop)"
          stroke="url(#silverTrim)"
          strokeWidth="2.5"
        />
        <path
          d="M100 36 L146 62 L100 88 L54 62 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.65"
        />
        <path
          d="M76 49 L124 77"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Left Face */}
        <path
          d="M38 66 L96 99 L96 170 L38 134 Z"
          fill="url(#cubeLeft)"
          stroke="url(#silverTrim)"
          strokeWidth="2.5"
        />
        <path
          d="M48 78 L86 100 L86 156 L48 128 Z"
          fill="none"
          stroke="url(#silverTrim)"
          strokeWidth="1.8"
          opacity="0.8"
        />
        <path
          d="M48 102 L86 124"
          stroke="#2dd4bf"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Right Face */}
        <path
          d="M104 99 L162 66 L162 134 L104 170 Z"
          fill="url(#cubeRight)"
          stroke="url(#silverTrim)"
          strokeWidth="2.5"
        />
        <path
          d="M114 100 L152 78 L152 128 L114 156 Z"
          fill="none"
          stroke="url(#silverTrim)"
          strokeWidth="1.8"
          opacity="0.8"
        />
        <path
          d="M114 124 L152 102"
          stroke="#0d9488"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Dynamic Curved Swoosh */}
        <path
          d="M20 148 C50 185, 140 185, 180 145"
          fill="none"
          stroke="url(#swooshGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M32 160 C58 190, 130 190, 166 158"
          fill="none"
          stroke="#008080"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Verification Check Badge */}
        {showBadge && (
          <g transform="translate(116, 114)">
            <circle cx="34" cy="34" r="33" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="4" />
            <circle cx="30" cy="22" r="9" fill="#ffffff" />
            <path d="M16 45 C16 36, 22 34, 30 34 C38 34, 44 36, 44 45 Z" fill="#ffffff" />
            <circle cx="46" cy="38" r="11" fill="#ffffff" />
            <circle cx="46" cy="38" r="9.5" fill="#0d9488" />
            <path
              d="M41.5 38 L44.5 41 L50.5 35"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
