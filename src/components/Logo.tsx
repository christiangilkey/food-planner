/**
 * The VENA mark: a rounded V with a green dot above it, on the dark tile. public/icon.svg, the PNG
 * icons and the Android icon use the same shapes (design/sleek-logo/app-icons).
 */
export const LOGO_BG = '#0A0B0A'

function Mark() {
  return (
    <>
      <path d="M670 685L1000 1375L1330 685" fill="none" stroke="#f6f5f1" strokeWidth="170" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="1000" cy="645" r="100" fill="#5cc48c" />
    </>
  )
}

/** The square app icon (for large spots). */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 2000 2000" role="img" aria-label="VENA" className="logo-mark">
      <rect width="2000" height="2000" rx="440" fill={LOGO_BG} />
      <Mark />
    </svg>
  )
}

/** Header brand: the mark carries the name, the text says what the app is. */
export function Logo({ height = 34 }: { height?: number }) {
  return (
    <span className="brand">
      <LogoMark size={height} />
      <span className="wordmark">Health Tracker</span>
    </span>
  )
}
