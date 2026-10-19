/**
 * The VENA logo: white geometric letters on near-black, with two faint grey shapes behind the
 * E and N. The paths are a vector redraw of the supplied 2000×2000 artwork (same coordinates);
 * public/icon.svg and the PNG icons use the same artwork.
 */
export const BRAND_BG = '#0A0B0A'
const SHADE = '#141515'
const SHAPES = [
  'M582 758H922V983H582Z', // shade behind the E
  'M1190 1045L1443 1450L965 1460Z', // shade behind the N
]
const LETTERS = [
  'M33 733H60L243 1238L416 758H115V733H453L243 1310Z', // V
  'M548 733H910L885 758H573V1284H892V1309H548Z', // E
  'M623 983H843V1007H599Z', // E bar
  'M1021 733H1050L1358 1265V733H1382V1309H1359L1046 775V1309H1021Z', // N
  'M1688 733L1898 1309H1560V1284H1862L1688 804L1505 1309H1479Z', // A
]

function Artwork() {
  return (
    <>
      {SHAPES.map((d) => <path key={d} d={d} fill={SHADE} />)}
      {LETTERS.map((d) => <path key={d} d={d} fill="#fff" />)}
    </>
  )
}

/** The full square logo, as supplied (for large spots). */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 2000 2000" role="img" aria-label="VENA" className="logo-mark">
      <rect width="2000" height="2000" fill={BRAND_BG} />
      <Artwork />
    </svg>
  )
}

/** The logo cropped to its lettering, so the thin lines stay readable at small sizes. */
export function LogoWide({ height = 28 }: { height?: number }) {
  return (
    <svg height={height} width={(height * 2060) / 760} viewBox="-65 640 2060 760" role="img" aria-label="VENA" className="logo-wide">
      <rect x="-65" y="640" width="2060" height="760" rx="170" fill={BRAND_BG} />
      <Artwork />
    </svg>
  )
}

/** Header brand: the logo carries the name, the text says what the app is. */
export function Logo({ height = 28 }: { height?: number }) {
  return (
    <span className="brand">
      <LogoWide height={height} />
      <span className="wordmark">Health Tracker</span>
    </span>
  )
}
