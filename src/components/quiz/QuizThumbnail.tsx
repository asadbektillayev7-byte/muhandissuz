/**
 * Thumbnail slot. When thumbnail_url is null we draw a blueprint placeholder
 * chosen by engineering discipline, so cards don't all look identical before
 * real images are uploaded. currentColor throughout, so it reads in both themes.
 */

const r = (n: number) => n.toFixed(2)

function Gears() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <circle cx="130" cy="100" r="44" />
      <circle cx="130" cy="100" r="17" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 12
        return (
          <line
            key={i}
            x1={r(130 + Math.cos(a) * 44)} y1={r(100 + Math.sin(a) * 44)}
            x2={r(130 + Math.cos(a) * 54)} y2={r(100 + Math.sin(a) * 54)}
            strokeWidth="6"
          />
        )
      })}
      <circle cx="225" cy="140" r="26" />
      <circle cx="225" cy="140" r="10" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 8
        return (
          <line
            key={`s${i}`}
            x1={r(225 + Math.cos(a) * 26)} y1={r(140 + Math.sin(a) * 26)}
            x2={r(225 + Math.cos(a) * 33)} y2={r(140 + Math.sin(a) * 33)}
            strokeWidth="5"
          />
        )
      })}
    </g>
  )
}

function Circuit() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <rect x="120" y="70" width="80" height="60" rx="3" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={120} y1={82 + i * 15} x2={70} y2={82 + i * 15} />
          <circle cx="66" cy={82 + i * 15} r="3.5" />
          <line x1={200} y1={82 + i * 15} x2={250} y2={82 + i * 15} />
          <circle cx="254" cy={82 + i * 15} r="3.5" />
        </g>
      ))}
      <line x1="160" y1="130" x2="160" y2="165" />
      <rect x="140" y="165" width="40" height="14" rx="2" />
      <line x1="90" y1="40" x2="230" y2="40" />
      <circle cx="90" cy="40" r="3.5" />
    </g>
  )
}

function Truss() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <line x1="40" y1="140" x2="280" y2="140" strokeWidth="2" />
      <line x1="40" y1="80" x2="280" y2="80" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={40 + i * 60} y1="80" x2={40 + i * 60} y2="140" />
          {i < 4 && <line x1={40 + i * 60} y1="140" x2={100 + i * 60} y2="80" />}
        </g>
      ))}
      <line x1="30" y1="140" x2="30" y2="170" strokeWidth="3" />
      <line x1="290" y1="140" x2="290" y2="170" strokeWidth="3" />
      <line x1="15" y1="170" x2="305" y2="170" strokeWidth="2" />
    </g>
  )
}

function Flask() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <path d="M140 55 L140 95 L110 155 A6 6 0 0 0 116 165 L204 165 A6 6 0 0 0 210 155 L180 95 L180 55 Z" />
      <line x1="132" y1="55" x2="188" y2="55" strokeWidth="2.5" />
      <line x1="124" y1="128" x2="196" y2="128" />
      <circle cx="150" cy="145" r="4" />
      <circle cx="170" cy="150" r="3" />
      <circle cx="160" cy="138" r="2.5" />
      <path d="M215 70 L255 70 L255 110" />
      <circle cx="255" cy="118" r="6" />
    </g>
  )
}

function Environment() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <path d="M160 45 C210 75 210 135 160 165 C110 135 110 75 160 45 Z" />
      <line x1="160" y1="45" x2="160" y2="165" />
      {[70, 95, 120, 145].map((y, i) => (
        <g key={i}>
          <line x1="160" y1={y} x2={160 - (28 - i * 4)} y2={y + 14} />
          <line x1="160" y1={y} x2={160 + (28 - i * 4)} y2={y + 14} />
        </g>
      ))}
      <path d="M60 175 Q90 160 120 175 T180 175 T240 175 T280 175" />
    </g>
  )
}

function Aero() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
      <circle cx="120" cy="120" r="40" />
      <circle cx="120" cy="120" r="14" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 6
        return (
          <line
            key={i}
            x1={r(120 + Math.cos(a) * 14)} y1={r(120 + Math.sin(a) * 14)}
            x2={r(120 + Math.cos(a) * 40)} y2={r(120 + Math.sin(a) * 40)}
          />
        )
      })}
      <path d="M180 90 L270 90 L258 106 L180 106 Z" />
      <line x1="200" y1="106" x2="200" y2="140" />
      <line x1="250" y1="106" x2="250" y2="140" />
      {[40, 55, 70].map((y, i) => (
        <path key={i} d={`M35 ${y} Q75 ${y - 8} 110 ${y}`} opacity="0.7" />
      ))}
    </g>
  )
}

function Network() {
  const layers = [
    [70, [70, 110, 150]],
    [140, [55, 90, 125, 160]],
    [210, [55, 90, 125, 160]],
    [265, [90, 130]],
  ] as const
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5">
      {layers.slice(0, -1).map(([x, ys], li) => {
        const [nx, nys] = layers[li + 1]
        return ys.map((y, i) =>
          nys.map((ny, j) => <line key={`${li}-${i}-${j}`} x1={x} y1={y} x2={nx} y2={ny} />)
        )
      })}
      {layers.map(([x, ys]) =>
        ys.map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" strokeWidth="1.8" />)
      )}
    </g>
  )
}

const BY_CATEGORY: Record<string, () => React.JSX.Element> = {
  'mechanical-engineering': Gears,
  'electrical-engineering': Circuit,
  'civil-engineering': Truss,
  'chemical-engineering': Flask,
  'environmental-engineering': Environment,
  'motorsports-engineering': Aero,
  ai: Network,
}

export function QuizThumbnail({
  src,
  alt,
  category,
  className = 'aspect-[16/10]',
}: {
  src: string | null
  alt: string
  /** Category slug — picks which blueprint is drawn when there's no image. */
  category?: string | null
  className?: string
}) {
  if (src) {
    return (
      <div className={`w-full overflow-hidden bg-secondary ${className}`}>
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
    )
  }

  const Art = (category && BY_CATEGORY[category]) || Gears

  return (
    <div
      className={`relative w-full overflow-hidden bg-secondary text-muted-foreground ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`qt-grid-${category ?? 'default'}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill={`url(#qt-grid-${category ?? 'default'})`} />
        <Art />
      </svg>
    </div>
  )
}
