'use client'

import { useEffect, useRef } from 'react'

export function HeroDiagram() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !pathRef.current) return

    const length = pathRef.current.getTotalLength()
    pathRef.current.style.strokeDasharray = String(length)
    pathRef.current.style.strokeDashoffset = String(length)

    const animate = () => {
      if (!pathRef.current) return
      pathRef.current.style.transition = 'stroke-dashoffset 2s ease-in-out'
      pathRef.current.style.strokeDashoffset = '0'
    }

    const timer = setTimeout(animate, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <svg viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] mx-auto">
      {/* Outer gear */}
      <path
        ref={pathRef}
        d="M140 30 C185 30 220 55 235 90 C250 125 245 165 225 195 C205 225 170 240 140 240 C110 240 75 225 55 195 C35 165 30 125 45 90 C60 55 95 30 140 30Z"
        stroke="var(--chart-2)"
        strokeWidth="2"
        fill="none"
      />
      {/* Gear teeth */}
      <line x1="140" y1="18" x2="140" y2="38" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="140" y1="222" x2="140" y2="242" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="75" x2="64" y2="88" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="216" y1="172" x2="232" y2="185" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="185" x2="64" y2="172" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="216" y1="88" x2="232" y2="75" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Inner circle */}
      <circle cx="140" cy="140" r="50" stroke="var(--chart-2)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      {/* Center */}
      <circle cx="140" cy="140" r="8" stroke="var(--chart-2)" strokeWidth="1.5" fill="none" />
      <circle cx="140" cy="140" r="3" fill="var(--chart-2)" />
      {/* Dimension annotations */}
      <text x="148" y="28" fill="var(--chart-2)" fontFamily="Fira Code, monospace" fontSize="8" opacity="0.7">Ø140</text>
      <text x="222" y="140" fill="var(--chart-2)" fontFamily="Fira Code, monospace" fontSize="8" opacity="0.7">R=70</text>
      <text x="55" y="145" fill="var(--chart-2)" fontFamily="Fira Code, monospace" fontSize="7" opacity="0.5">MOD 2.5</text>
      {/* Dimension lines */}
      <line x1="140" y1="10" x2="140" y2="18" stroke="var(--chart-2)" strokeWidth="0.5" opacity="0.4" />
      <line x1="135" y1="10" x2="145" y2="10" stroke="var(--chart-2)" strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}
