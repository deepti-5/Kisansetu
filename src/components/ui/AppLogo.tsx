'use client';

import React, { memo } from 'react';

interface AppLogoProps {
  src?: string;
  iconName?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const iconSize = size;

  return (
    <div
      className={`flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
      style={{ width: iconSize, height: iconSize }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="KisanSetu Logo"
      >
        {/* Green circle background */}
        <circle cx="24" cy="24" r="24" fill="#16a34a" />

        {/* Tractor body */}
        <rect x="10" y="22" width="18" height="10" rx="2" fill="white" />

        {/* Tractor cabin */}
        <rect x="20" y="16" width="10" height="8" rx="1.5" fill="white" />

        {/* Exhaust pipe */}
        <rect x="28" y="13" width="2.5" height="5" rx="1" fill="#bbf7d0" />

        {/* Large rear wheel */}
        <circle cx="16" cy="33" r="6" fill="white" />
        <circle cx="16" cy="33" r="3.5" fill="#16a34a" />

        {/* Small front wheel */}
        <circle cx="30" cy="34" r="4" fill="white" />
        <circle cx="30" cy="34" r="2.2" fill="#16a34a" />

        {/* Axle connector */}
        <rect x="16" y="31" width="14" height="2" rx="1" fill="white" />

        {/* Wheat stalk left */}
        <line x1="6" y1="20" x2="8" y2="14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="8" cy="13" rx="1.5" ry="2.5" fill="#fbbf24" transform="rotate(-10 8 13)" />

        {/* Wheat stalk right */}
        <line x1="42" y1="20" x2="40" y2="14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="40" cy="13" rx="1.5" ry="2.5" fill="#fbbf24" transform="rotate(10 40 13)" />
      </svg>
    </div>
  );
});

export default AppLogo;
