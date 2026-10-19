import React from 'react';

interface GadzonicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  imageSrc?: string;
}

export const GadzonicLogo: React.FC<GadzonicLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  imageSrc = '/src/assets/images/gadzonic_logo_1792334338384.jpg'
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-base', spacing: 'gap-2' },
    md: { img: 'w-9 h-9', text: 'text-lg', spacing: 'gap-2.5' },
    lg: { img: 'w-12 h-12', text: 'text-xl', spacing: 'gap-3' },
    xl: { img: 'w-16 h-16', text: 'text-2xl', spacing: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center ${currentSize.spacing} select-none ${className}`}>
      {/* Logo Emblem Stage */}
      <div className={`relative ${currentSize.img} rounded-full overflow-hidden bg-neutral-950 p-[1.5px] ring-1 ring-cyan-500/30 shadow-sm shrink-0`}>
        <img
          src={imageSrc}
          alt="GADZONIC Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // If image fails, fallback to vector SVG
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* SVG Fallback Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full absolute inset-0 -z-10 bg-[#070b14]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="46" stroke="#00d2ff" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.6" />
          <circle cx="50" cy="50" r="38" stroke="#a855f7" strokeWidth="2" opacity="0.5" />
          {/* Circuit tracks */}
          <path d="M50 8 L50 20 M20 50 L8 50 M80 50 L92 50 M50 80 L50 92" stroke="#00d2ff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="20" r="2" fill="#00d2ff" />
          <circle cx="20" cy="50" r="2" fill="#a855f7" />
          <circle cx="80" cy="50" r="2" fill="#00d2ff" />
          {/* Letter G & Lightning Bolt */}
          <path
            d="M56 22 L38 52 L50 52 L44 78 L64 46 L52 46 Z"
            fill="url(#gadzonic-gradient)"
          />
          <defs>
            <linearGradient id="gadzonic-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Styled Brand Wordmark */}
      {showText && (
        <span className={`${currentSize.text} font-black tracking-tight tracking-wider uppercase font-sans text-neutral-900 group-hover:text-cyan-700 transition-colors`}>
          GAD<span className="text-cyan-500">ZONIC</span>
        </span>
      )}
    </div>
  );
};
