'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface GearBlueprintConfig {
  animationSpeed: number
  cameraSpeed: number
  strokeWidth: number
  lineColor: string
  backgroundColor: string
}

const defaultConfig: GearBlueprintConfig = {
  animationSpeed: 1,
  cameraSpeed: 0.3,
  strokeWidth: 1.2,
  lineColor: '#ffffff',
  backgroundColor: 'transparent',
}

function gearPath(teeth: number, outerR: number, innerR: number): string {
  const pts: string[] = []
  const step = (Math.PI * 2) / teeth
  const toothArc = step * 0.28
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step
    const a1 = a0 + toothArc
    const a2 = a0 + step * 0.5
    const a3 = a2 + toothArc
    const add = (r: number, a: number) => ({ x: r * Math.cos(a), y: r * Math.sin(a) })
    const p0 = add(outerR, a0)
    const p1 = add(innerR, a1)
    const p2 = add(innerR, a2)
    const p3 = add(outerR, a3)
    if (i === 0) pts.push(`M${p0.x},${p0.y}`)
    pts.push(`L${p1.x},${p1.y}`, `L${p2.x},${p2.y}`, `L${p3.x},${p3.y}`)
  }
  pts.push('Z')
  return pts.join(' ')
}

interface GearSpec {
  cx: number
  cy: number
  teeth: number
  outerR: number
  innerR: number
  boreR: number
}

const VIEW = { w: 800, h: 500 }

const gears: GearSpec[] = [
  { cx: 400, cy: 250, teeth: 20, outerR: 95, innerR: 78, boreR: 14 },
  { cx: 265, cy: 170, teeth: 14, outerR: 68, innerR: 55, boreR: 10 },
  { cx: 525, cy: 340, teeth: 12, outerR: 55, innerR: 44, boreR: 8 },
]

export function GearBlueprint({
  config: uc,
  className,
}: {
  config?: Partial<GearBlueprintConfig>
  className?: string
}) {
  const scope = useRef<HTMLDivElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const camRef = useRef<SVGGElement>(null)
  const cfg = { ...defaultConfig, ...uc }

  useEffect(() => {
    const el = scope.current
    const group = groupRef.current
    const cam = camRef.current
    if (!el || !group || !cam) return

    const speed = cfg.animationSpeed

    gears.forEach(g => {
      const gEl = group.querySelector(`[data-gear="g${g.cx}_${g.cy}"]`)
      if (!gEl) return
      const dir = g.cx < 400 ? -1 : 1
      const ratio = 20 / g.teeth
      gsap.to(gEl, {
        rotation: 360 * dir * ratio,
        duration: 12 / speed,
        repeat: -1,
        ease: 'none',
      })
    })

    const shafts = group.querySelectorAll('[data-shaft]')
    gsap.to(shafts, {
      opacity: 0.3,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    const bores = group.querySelectorAll('[data-bore]')
    gsap.to(bores, {
      scale: 0.85,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    gsap.to(cam, {
      x: 12,
      y: 8,
      scale: 1.03,
      duration: 10 / cfg.cameraSpeed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    const traceTimer = setInterval(() => {
      const idx = Math.floor(Math.random() * gears.length)
      const g = gears[idx]
      const gEl = group.querySelector(`[data-gear-path="g${g.cx}_${g.cy}"]`) as SVGPathElement | null
      if (!gEl) return
      const len = gEl.getTotalLength()
      gsap.fromTo(gEl,
        { strokeDashoffset: len, strokeDasharray: String(len) },
        { strokeDashoffset: 0, duration: 0.6 / speed, ease: 'power2.out' }
      )
    }, 3500 / speed)

    return () => {
      gsap.killTweensOf('*')
      clearInterval(traceTimer)
    }
  }, [cfg.animationSpeed, cfg.cameraSpeed])

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className={cn('w-full h-full', className)}
      style={{ background: cfg.backgroundColor }}
    >
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{
          stroke: cfg.lineColor,
          strokeWidth: cfg.strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
        }}
      >
        <g ref={camRef}>
          <g ref={groupRef}>
            {/* connecting shafts */}
            {gears.map((g, i) =>
              gears.slice(i + 1).map((h, j) => (
                <line
                  key={`s${i}${j}`}
                  data-shaft
                  x1={g.cx} y1={g.cy} x2={h.cx} y2={h.cy}
                  opacity={0.15}
                />
              ))
            )}

            {/* gears */}
            {gears.map(g => (
              <g key={`gear-${g.cx}_${g.cy}`} data-gear={`g${g.cx}_${g.cy}`}>
                <path
                  data-gear-path={`g${g.cx}_${g.cy}`}
                  d={gearPath(g.teeth, g.outerR, g.innerR)}
                  transform={`translate(${g.cx},${g.cy})`}
                />
                <circle data-bore cx={g.cx} cy={g.cy} r={g.boreR} opacity={0.4} />
                <circle cx={g.cx} cy={g.cy} r={g.boreR * 0.35} opacity={0.6} />
                {/* spoke lines */}
                {Array.from({ length: 4 }).map((_, s) => (
                  <line
                    key={`sp${s}`}
                    x1={g.cx + g.boreR * 1.4 * Math.cos(s * Math.PI / 2 + Math.PI / 4)}
                    y1={g.cy + g.boreR * 1.4 * Math.sin(s * Math.PI / 2 + Math.PI / 4)}
                    x2={g.cx + g.innerR * 0.75 * Math.cos(s * Math.PI / 2 + Math.PI / 4)}
                    y2={g.cy + g.innerR * 0.75 * Math.sin(s * Math.PI / 2 + Math.PI / 4)}
                    opacity={0.2}
                  />
                ))}
              </g>
            ))}

            {/* pitch circles (faint) */}
            {gears.map(g => (
              <circle
                key={`pc-${g.cx}_${g.cy}`}
                cx={g.cx} cy={g.cy}
                r={g.outerR * 0.88}
                opacity={0.06}
                strokeWidth={cfg.strokeWidth * 0.5}
              />
            ))}

            {/* blueprint annotations */}
            {gears.map((g, i) => (
              <g key={`ann-${i}`} opacity={0.15} fontSize="6" fontFamily="monospace">
                <text x={g.cx - g.outerR - 30} y={g.cy - g.outerR - 5}>
                  Z={g.teeth}
                </text>
                <line
                  x1={g.cx} y1={g.cy - g.outerR - 2}
                  x2={g.cx + g.outerR + 5} y2={g.cy - g.outerR - 2}
                  strokeWidth={cfg.strokeWidth * 0.4}
                />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
