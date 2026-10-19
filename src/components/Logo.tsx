import { LOGO_BG, LOGO_LETTERS, LOGO_ROOTS, LOGO_SHADE, LOGO_SHAPES, linePath, polygonPath } from '../lib/logoArt'

/** The VENA artwork (see lib/logoArt.ts); public/icon.svg and the PNG icons use the same shapes. */
function Artwork() {
  return (
    <>
      {LOGO_SHAPES.map((p) => <path key={p.join()} d={polygonPath(p)} fill={LOGO_SHADE} />)}
      {LOGO_LETTERS.map((p) => <path key={p.join()} d={polygonPath(p)} fill="#fff" />)}
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        {LOGO_ROOTS.map(([w, ...p]) => <path key={p.join()} d={linePath(p)} strokeWidth={w} />)}
      </g>
    </>
  )
}

/** The full square logo, as supplied (for large spots). */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 2000 2000" role="img" aria-label="VENA" className="logo-mark">
      <rect width="2000" height="2000" fill={LOGO_BG} />
      <Artwork />
    </svg>
  )
}

/** The logo cropped to its lettering and roots, so the thin lines stay readable at small sizes. */
export function LogoWide({ height = 34 }: { height?: number }) {
  return (
    <svg height={height} width={(height * 2060) / 980} viewBox="-65 640 2060 980" role="img" aria-label="VENA" className="logo-wide">
      <rect x="-65" y="640" width="2060" height="980" rx="190" fill={LOGO_BG} />
      <Artwork />
    </svg>
  )
}

/** Header brand: the logo carries the name, the text says what the app is. */
export function Logo({ height = 34 }: { height?: number }) {
  return (
    <span className="brand">
      <LogoWide height={height} />
      <span className="wordmark">Health Tracker</span>
    </span>
  )
}
