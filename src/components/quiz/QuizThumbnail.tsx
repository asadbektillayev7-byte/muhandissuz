/**
 * Thumbnail slot. Falls back to a drawn blueprint placeholder while
 * thumbnail_url is null, so cards never show a broken or empty box.
 * Uses currentColor throughout, so it reads in both themes.
 */
export function QuizThumbnail({
  src,
  alt,
  className = 'aspect-[16/10]',
}: {
  src: string | null
  alt: string
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

  return (
    <div
      className={`relative w-full overflow-hidden bg-secondary text-muted-foreground ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="qt-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#qt-grid)" />
        <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
          <circle cx="160" cy="100" r="46" />
          <circle cx="160" cy="100" r="18" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 12
            // Rounded: Node and the browser stringify raw floats differently in
            // the last digit, which trips React's hydration check.
            const r = (n: number) => n.toFixed(2)
            return (
              <line
                key={i}
                x1={r(160 + Math.cos(a) * 46)}
                y1={r(100 + Math.sin(a) * 46)}
                x2={r(160 + Math.cos(a) * 56)}
                y2={r(100 + Math.sin(a) * 56)}
                strokeWidth="6"
              />
            )
          })}
          <circle cx="252" cy="150" r="24" />
          <circle cx="252" cy="150" r="9" />
        </g>
      </svg>
    </div>
  )
}
