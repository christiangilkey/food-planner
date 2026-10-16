/** The app mark: a leaf inside a rounded tile. Same artwork as public/icon.svg. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="logo-mark">
      <defs>
        <linearGradient id="fp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2bb673" />
          <stop offset="1" stopColor="#14724a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#fp-g)" />
      <path d="M18 46c0-16 10-28 28-28 0 18-12 28-28 28z" fill="#fff" />
      <path d="M18 46 36 28" stroke="#14724a" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="brand">
      <LogoMark size={size} />
      <span className="wordmark">Food Planner</span>
    </span>
  )
}
