import React from 'react';

/**
 * TShirtMockup - Premium vector T-shirt renderer with realistic shading, aspect ratios & dynamic print overlays
 */
export default function TShirtMockup({
  colour = 'white',
  colourHex = '#FFFFFF',
  printLocation = 'front',
  printRatio = '4:5', // '1:1', '4:5', '3:4', '16:9', 'A3'
  graphicText = '',
  graphicTextColor = '#1E5631',
  graphicDesignName = '',
  customImage = null,
  scale = 1,
  showPrintArea = false,
  className = '',
}) {
  // Determine if tee is dark for shading contrast
  const isDark = ['black', 'navy', 'maroon', 'green'].includes(colour);

  // Aspect ratio dimensions calculation for boundary box
  const ratioSpecs = {
    '1:1': { width: 140, height: 140, label: '1:1 Square (10x10cm)' },
    '4:5': { width: 160, height: 200, label: '4:5 Standard (20x25cm)' },
    '3:4': { width: 165, height: 220, label: '3:4 Classic (21x29.7cm A4)' },
    '16:9': { width: 200, height: 112, label: '16:9 Chest Banner (28x15cm)' },
    'A3': { width: 210, height: 300, label: 'A3 Maxi Full Front (30x42cm)' },
  };

  const currentRatio = ratioSpecs[printRatio] || ratioSpecs['4:5'];

  return (
    <div className={`tshirt-mockup-wrapper ${className}`} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 500 550"
        className="tshirt-svg"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.08))' }}
      >
        <defs>
          {/* Natural Fabric Shadow Gradient */}
          <linearGradient id={`shirt-shadow-${colour}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isDark ? 0.05 : 0.4} />
            <stop offset="50%" stopColor="#000000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={isDark ? 0.4 : 0.15} />
          </linearGradient>

          {/* Sleeve & Collar Shadow */}
          <linearGradient id="neck-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Gold Trim for Kasavu look */}
          <linearGradient id="kasavu-gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B38728" />
            <stop offset="50%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
        </defs>

        {/* Base T-Shirt Body Outline */}
        <g id="tshirt-body">
          <path
            d="M 160,50 
               C 190,75 310,75 340,50 
               L 440,115 
               C 455,125 440,175 410,195 
               L 385,180 
               L 385,480 
               C 385,495 375,505 360,505 
               L 140,505 
               C 125,505 115,495 115,480 
               L 115,180 
               L 90,195 
               C 60,175 45,125 60,115 
               Z"
            fill={colourHex || '#FFFFFF'}
            stroke={isDark ? '#444444' : '#E2E8F0'}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Sleeves detail lines */}
          <path d="M 115,180 L 60,115" stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth="2" />
          <path d="M 385,180 L 440,115" stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth="2" />

          {/* Sleeve Hems */}
          <path d="M 60,115 C 70,140 75,170 90,195" fill="none" stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'} strokeWidth="2" />
          <path d="M 440,115 C 430,140 425,170 410,195" fill="none" stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'} strokeWidth="2" />

          {/* Collar Rim */}
          <path
            d="M 160,50 C 200,95 300,95 340,50 C 310,75 190,75 160,50 Z"
            fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
            strokeWidth="2"
          />
          <path
            d="M 160,50 C 200,95 300,95 340,50"
            fill="none"
            stroke="url(#neck-shadow)"
            strokeWidth="6"
          />

          {/* Inner Brand Tag */}
          <rect x="220" y="70" width="60" height="22" rx="4" fill={isDark ? '#2D6A4F' : '#FFFDF7'} stroke="#D4A843" strokeWidth="1" />
          <text x="250" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill={isDark ? '#FFFDF7' : '#1E5631'} fontFamily="sans-serif">
            SCREENARTS
          </text>

          {/* Fabric Texture Overlay */}
          <path
            d="M 160,50 C 190,75 310,75 340,50 L 440,115 C 455,125 440,175 410,195 L 385,180 L 385,480 C 385,495 375,505 360,505 L 140,505 C 125,505 115,495 115,480 L 115,180 L 90,195 C 60,175 45,125 60,115 Z"
            fill={`url(#shirt-shadow-${colour})`}
          />

          {/* Kasavu Gold Hem Border (if Kasavu edition) */}
          {colour === 'cream' || colour === 'white' ? (
            <line x1="140" y1="495" x2="360" y2="495" stroke="url(#kasavu-gold-grad)" strokeWidth="4" strokeDasharray="6 3" />
          ) : null}
        </g>

        {/* Printable Area Bounds (with Aspect Ratio Visualization) */}
        {showPrintArea && (
          <g id="print-area-bounds">
            {printLocation === 'left-chest' ? (
              <rect x="150" y="160" width="80" height="80" rx="8" fill="none" stroke="#E8772E" strokeWidth="2" strokeDasharray="4 4" />
            ) : (
              <rect
                x={250 - currentRatio.width / 2}
                y={150 + (220 - currentRatio.height) / 2}
                width={currentRatio.width}
                height={currentRatio.height}
                rx="10"
                fill="none"
                stroke="#E8772E"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
            <text x="250" y="142" textAnchor="middle" fontSize="10" fill="#E8772E" fontWeight="600" fontFamily="sans-serif">
              PRINT AREA ({printRatio} RATIO)
            </text>
          </g>
        )}

        {/* Graphic Artwork Overlay */}
        <g
          id="graphic-overlay"
          transform={
            printLocation === 'left-chest'
              ? `translate(150, 160) scale(${0.4 * scale})`
              : printLocation === 'full-front'
              ? `translate(150, 120) scale(${1.1 * scale})`
              : `translate(${250 - (currentRatio.width * 0.45 * scale)}, ${150 + (220 - currentRatio.height) / 2}) scale(${0.85 * scale})`
          }
        >
          {customImage ? (
            // User Uploaded Image
            <image href={customImage} x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid meet" />
          ) : (
            // ScreenArts Built-in Vector Onam Design Render
            <g id="screenarts-artwork">
              {/* Decorative Pookalam / Gold Frame */}
              <circle cx="100" cy="100" r="75" fill="none" stroke="#D4A843" strokeWidth="3" strokeDasharray="8 4" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="#2D6A4F" strokeWidth="2" />
              
              {/* Petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <circle
                  key={i}
                  cx={100 + 55 * Math.cos((angle * Math.PI) / 180)}
                  cy={100 + 55 * Math.sin((angle * Math.PI) / 180)}
                  r="7"
                  fill={i % 2 === 0 ? '#E8772E' : '#FDE68A'}
                />
              ))}

              {/* Graphic Icon / Illustration */}
              <text x="100" y="98" textAnchor="middle" fontSize="42" dominantBaseline="central">
                {graphicDesignName?.includes('Mahabali') || graphicDesignName?.includes('Maveli')
                  ? '👑'
                  : graphicDesignName?.includes('Pookalam')
                  ? '🌸'
                  : graphicDesignName?.includes('Naadan')
                  ? '🌴'
                  : graphicDesignName?.includes('Loading')
                  ? '⏳'
                  : graphicDesignName?.includes('Kasavu')
                  ? '✨'
                  : graphicDesignName?.includes('Typography')
                  ? '✍️'
                  : '🌼'}
              </text>

              {/* Malayalam Typography or Custom Text */}
              <text
                x="100"
                y="155"
                textAnchor="middle"
                fontSize="15"
                fontWeight="bold"
                fill={graphicTextColor || (isDark ? '#FFFDF7' : '#1E5631')}
                fontFamily="system-ui, sans-serif"
              >
                {graphicText || graphicDesignName || 'ഓണം 2026'}
              </text>

              <text
                x="100"
                y="172"
                textAnchor="middle"
                fontSize="9"
                letterSpacing="1.5"
                fontWeight="bold"
                fill="#D4A843"
                fontFamily="sans-serif"
              >
                SCREENARTS • CALICUT
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
