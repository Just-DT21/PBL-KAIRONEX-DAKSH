/**
 * KAIRONEXA brand marks.
 *
 * The symbol is a geometric nexus: two converging strokes (idea→capital,
 * founder→investor) intersecting at a diamond node — the moment connection
 * happens. Constructed to stay legible in monochrome and at 16px.
 *
 * Exports:
 *  - LogoMark  symbol-only (favicon, app icon, compact UI)
 *  - Logo      symbol + KAIRONEXA wordmark (horizontal, navbar/footer/auth)
 */

let uidCounter = 0

function useGradId() {
  // Stable-per-mount unique ids keep multiple SVG gradients from colliding.
  return `kxg${++uidCounter}`
}

export function LogoMark({ size = 30, mono = false }: { size?: number; mono?: boolean }) {
  const gid = useGradId()
  const stroke = mono ? 'currentColor' : `url(#${gid})`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      style={{ flex: 'none', display: 'block' }}
    >
      {!mono && (
        <defs>
          <linearGradient id={gid} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5b8cff" />
            <stop offset="0.55" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#3ee6d8" />
          </linearGradient>
        </defs>
      )}
      {/* rounded containment tile */}
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      {/* descending stroke: idea → opportunity */}
      <path d="M9 8.5 L23 23.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      {/* ascending stroke: investor → capital */}
      <path d="M23 8.5 L9 23.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      {/* nexus node at the intersection */}
      <path d="M16 11.6 L20.4 16 L16 20.4 L11.6 16 Z" fill={stroke} />
    </svg>
  )
}

export function Logo({
  size = 30,
  stackedTagline = false,
}: {
  size?: number
  stackedTagline?: boolean
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 11,
        minWidth: 0,
      }}
    >
      <LogoMark size={size} />
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          gap: stackedTagline ? 2 : 0,
        }}
      >
        <span
          className="kx-wordmark"
          style={{ fontSize: Math.max(13, size * 0.53), letterSpacing: '0.18em' }}
        >
          KAIRONEXA
        </span>
        {stackedTagline && (
          <span className="kx-tagline">WHERE IDEAS MEET CAPITAL</span>
        )}
      </span>
    </span>
  )
}
