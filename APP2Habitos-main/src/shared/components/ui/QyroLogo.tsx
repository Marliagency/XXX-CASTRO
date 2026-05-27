interface QyroLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
}

export function QyroLogo({ size = 32, className = '', showText = false, textSize = 'md' }: QyroLogoProps) {
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="QYRO"
      >
        <defs>
          <linearGradient id="qyro-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#7B1FA2" />
          </linearGradient>
          <linearGradient id="qyro-teal" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#26C6DA" />
            <stop offset="100%" stopColor="#42A5F5" />
          </linearGradient>
        </defs>
        {/* Background rounded rect */}
        <rect width="32" height="32" rx="8" fill="url(#qyro-grad)" />
        {/* Q shape — outer circle arc */}
        <circle cx="13" cy="14" r="6" stroke="white" strokeWidth="2.5" fill="none" />
        {/* Q tail */}
        <line x1="17" y1="18" x2="21" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Accent teal dot — top right */}
        <circle cx="23" cy="9" r="3" fill="url(#qyro-teal)" />
      </svg>
      {showText && (
        <span
          className={`font-extrabold tracking-tight ${textSizes[textSize]}`}
          style={{
            background: 'var(--qyro-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          QYRO
        </span>
      )}
    </div>
  );
}
