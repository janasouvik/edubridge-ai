import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  taglineText?: string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  taglineText = 'Learn. Understand. Grow.',
  theme = 'auto',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // When theme='auto', CSS variables handle everything.
  // When theme='light', it's on dark backgrounds (e.g. footer).
  const isOnDarkBg = theme === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon: Open Book with Arching Bridge */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Rounded Container */}
          <rect
            width="40" height="40" rx="10"
            fill={isOnDarkBg ? 'rgba(255,255,255,0.15)' : 'var(--brand-text)'}
          />
          
          {/* Open Book pages */}
          <path
            d="M9 28V15C9 13.8954 9.89543 13 11 13H19C19.5523 13 20 13.4477 20 14V29C20 29.5523 19.5523 30 19 30H11C9.89543 30 9 29.1046 9 28Z"
            fill="#ffffff"
            fillOpacity="0.9"
          />
          <path
            d="M31 28V15C31 13.8954 30.1046 13 29 13H21C20.4477 13 20 13.4477 20 14V29C20 29.5523 20.4477 30 21 30H29C30.1046 30 31 29.1046 31 28Z"
            fill="#ffffff"
            fillOpacity="0.75"
          />

          {/* Bridge Arch Connecting the Pages */}
          <path
            d="M12 21C14.5 16 25.5 16 28 21"
            stroke={isOnDarkBg ? '#93c5fd' : '#1a264d'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Bridge Vertical Struts */}
          <line x1="16" y1="18" x2="16" y2="23" stroke={isOnDarkBg ? '#93c5fd' : '#1a264d'} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="17" x2="20" y2="23" stroke={isOnDarkBg ? '#93c5fd' : '#1a264d'} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="18" x2="24" y2="23" stroke={isOnDarkBg ? '#93c5fd' : '#1a264d'} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span
            className={`font-heading font-extrabold tracking-tight ${textSizes[size]}`}
            style={{ color: isOnDarkBg ? '#ffffff' : 'var(--text-primary)' }}
          >
            Edu<span style={{ color: 'var(--brand-text)' }}>Bridge</span>
          </span>
          <span
            className="ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
            style={{
              backgroundColor: 'var(--brand-bg)',
              color: 'var(--brand-text)',
            }}
          >
            AI
          </span>
        </div>
        {showTagline && (
          <span
            className="text-[11px] font-medium tracking-tight -mt-0.5"
            style={{ color: isOnDarkBg ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
