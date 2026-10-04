"use client";

interface Super60LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export default function Super60Logo({
  className = "",
  size = "md",
  showWordmark = true,
  showSubtitle = true,
  subtitleText = "SKILL UP",
}: Super60LogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 42, text: "text-2xl", sub: "text-[10px]" },
    lg: { icon: 52, text: "text-3xl", sub: "text-xs" },
    xl: { icon: 64, text: "text-4xl", sub: "text-xs" },
  };

  const { icon: iconSize, text: textSize, sub: subSize } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3.5 group select-none ${className}`}>
      {/* Precision Geometric SVG Emblem (Zero AI artifacts, 100% vector scalable) */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(240,124,39,0.45)]"
        >
          <defs>
            {/* Primary Flame Gradient */}
            <linearGradient id="s60-flame" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#FFA048" />
              <stop offset="50%" stopColor="#F07C27" />
              <stop offset="100%" stopColor="#D86312" />
            </linearGradient>

            {/* Gold Highlight Gradient */}
            <linearGradient id="s60-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FFB703" />
            </linearGradient>

            {/* Deep Navy Slate Gradient for Inner Facets */}
            <linearGradient id="s60-navy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D325E" />
              <stop offset="100%" stopColor="#151A38" />
            </linearGradient>

            {/* Soft Ambient Glow Filter */}
            <filter id="s60-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Hexagonal Shield Frame */}
          <polygon
            points="50,6 90,28 90,72 50,94 10,72 10,28"
            fill="url(#s60-navy)"
            stroke="url(#s60-flame)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Ring */}
          <polygon
            points="50,14 83,32 83,68 50,86 17,68 17,32"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />

          {/* Stylized Interlocking 'S' & '60' Geometric Monogram */}
          {/* Top 'S' loop curve / angle */}
          <path
            d="M66 32 C66 26 58 24 50 24 C40 24 33 28 33 36 C33 46 64 43 64 54 C64 64 56 68 47 68 C36 68 31 62 31 56"
            stroke="url(#s60-flame)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center core pulse dot */}
          <circle cx="50" cy="50" r="3.5" fill="url(#s60-gold)" filter="url(#s60-glow)" />

          {/* Accent Circuit Corner Nodes */}
          <circle cx="50" cy="6" r="3" fill="#FFA048" />
          <circle cx="90" cy="28" r="3" fill="#FFA048" />
          <circle cx="90" cy="72" r="3" fill="#F07C27" />
          <circle cx="50" cy="94" r="3" fill="#D86312" />
          <circle cx="10" cy="72" r="3" fill="#F07C27" />
          <circle cx="10" cy="28" r="3" fill="#FFA048" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F07C27] via-[#FFA048] to-[#F07C27] ${textSize} drop-shadow-[0_0_15px_rgba(240,124,39,0.35)]`}
            >
              Super 60
            </span>
            {showSubtitle && (
              <span
                className={`px-2 py-0.5 rounded-full font-mono font-bold bg-[#F07C27]/15 text-[#F07C27] border border-[#F07C27]/30 uppercase tracking-wider ${subSize}`}
              >
                {subtitleText}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-medium tracking-wider text-slate-400 uppercase">
            Systems Engineering Platform
          </span>
        </div>
      )}
    </div>
  );
}
