'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface F1BlueprintConfig {
  animationSpeed: number
  strokeWidth: number
  cameraRotationSpeed: number
  lineColor: string
  backgroundColor: string
}

const defaultConfig: F1BlueprintConfig = {
  animationSpeed: 1,
  strokeWidth: 1.5,
  cameraRotationSpeed: 0.3,
  lineColor: '#ffffff',
  backgroundColor: '#000000',
}

interface CarPath {
  id: string
  d: string
  pulse: boolean
}

function buildF1Paths(): CarPath[] {
  return [
    { id: 'nose', d: 'M 70,290 Q 110,290 150,270 C 180,255 200,235 220,210 C 240,185 260,170 290,160 L 330,160', pulse: true },
    { id: 'monocoque', d: 'M 330,160 L 450,160 C 475,160 490,175 510,200 L 530,200', pulse: true },
    { id: 'engine-cover', d: 'M 530,200 C 580,200 620,210 655,240 C 680,260 710,285 740,300 L 760,300', pulse: true },
    { id: 'gearbox', d: 'M 760,300 C 780,300 790,310 790,330 L 790,360', pulse: false },
    { id: 'rear-body', d: 'M 790,360 L 770,370 L 200,370 C 170,370 160,365 150,360 L 90,350', pulse: false },
    { id: 'nose-tip', d: 'M 70,290 C 60,290 55,295 55,305 L 55,315 C 55,325 60,330 70,330 L 90,350', pulse: true },
    { id: 'fw-main', d: 'M 30,295 C 45,290 60,288 80,288 C 100,288 120,290 140,295', pulse: true },
    { id: 'fw-secondary', d: 'M 35,308 C 50,303 65,301 85,301 C 105,301 125,303 145,308', pulse: true },
    { id: 'fw-tertiary', d: 'M 40,321 C 55,316 70,314 90,314 C 110,314 130,316 150,321', pulse: false },
    { id: 'fw-endplate', d: 'M 28,280 L 28,330 C 30,335 35,336 40,335 L 145,335', pulse: true },
    { id: 'fw-endplate-rear', d: 'M 145,280 L 145,335', pulse: false },
    { id: 'cockpit-opening', d: 'M 330,160 C 340,125 360,115 390,110 L 440,110 C 460,110 475,120 485,145 L 500,200', pulse: true },
    { id: 'cockpit-padding', d: 'M 335,155 C 345,130 365,120 390,118 L 435,118 C 455,118 465,128 475,150 C 480,165 485,180 490,200', pulse: false },
    { id: 'steering-wheel', d: 'M 375,170 C 385,160 400,158 410,165 C 415,170 415,180 410,185 C 400,195 385,192 378,182 Z', pulse: false },
    { id: 'driver-helmet', d: 'M 395,130 C 395,110 410,100 425,100 C 440,100 450,110 450,125 C 450,140 440,150 425,150 C 410,150 395,145 395,130 Z', pulse: false },
    { id: 'halo-main', d: 'M 345,110 C 345,70 375,55 405,50 C 430,48 455,55 470,75 C 480,90 490,110 500,130 L 505,190', pulse: true },
    { id: 'halo-pillar', d: 'M 440,50 C 445,70 450,95 455,120', pulse: false },
    { id: 'halo-center', d: 'M 405,50 L 405,100', pulse: false },
    { id: 'intake-main', d: 'M 340,110 L 340,85 C 350,70 370,65 390,65 L 450,65 C 465,65 480,75 485,95 L 485,130', pulse: true },
    { id: 'intake-opening', d: 'M 345,95 L 345,80 C 355,72 370,70 390,70 L 445,70 C 458,70 470,76 475,90 L 475,120', pulse: false },
    { id: 'intake-filter', d: 'M 370,85 L 440,85', pulse: false },
    { id: 'sidepod-top', d: 'M 500,200 C 550,200 590,210 620,240 C 640,260 655,290 660,320', pulse: true },
    { id: 'sidepod-bottom', d: 'M 500,370 C 550,370 595,365 625,355 C 645,348 655,340 660,320', pulse: false },
    { id: 'sidepod-front', d: 'M 500,200 L 500,370', pulse: true },
    { id: 'sidepod-intake', d: 'M 500,210 L 500,240 C 520,225 540,220 560,220', pulse: false },
    { id: 'sidepod-cooling', d: 'M 570,250 L 650,280', pulse: false },
    { id: 'sidepod-cooling-2', d: 'M 580,265 L 655,295', pulse: false },
    { id: 'sidepod-cooling-3', d: 'M 590,280 L 660,310', pulse: false },
    { id: 'floor-main', d: 'M 90,370 L 780,370', pulse: true },
    { id: 'floor-front', d: 'M 90,370 C 110,365 130,360 150,360', pulse: false },
    { id: 'floor-rear', d: 'M 780,370 C 800,370 815,365 830,350', pulse: true },
    { id: 'floor-curve', d: 'M 830,350 C 840,340 845,330 845,320', pulse: false },
    { id: 'diffuser-fence-1', d: 'M 770,370 L 810,355', pulse: false },
    { id: 'diffuser-fence-2', d: 'M 750,370 L 800,350', pulse: false },
    { id: 'diffuser-fence-3', d: 'M 730,370 L 790,345', pulse: false },
    { id: 'floor-edge', d: 'M 200,365 L 760,365', pulse: false },
    { id: 'rw-pillar-1', d: 'M 780,360 L 790,230', pulse: true },
    { id: 'rw-pillar-2', d: 'M 810,365 L 820,240', pulse: true },
    { id: 'rw-main', d: 'M 780,230 C 810,220 840,222 860,228 C 875,232 885,240 890,250', pulse: true },
    { id: 'rw-flap', d: 'M 790,210 C 820,200 850,202 870,208 C 885,212 895,220 900,230', pulse: true },
    { id: 'rw-endplate', d: 'M 895,190 L 895,270 C 893,275 888,277 882,276 L 865,276', pulse: true },
    { id: 'rw-endplate-front', d: 'M 865,190 L 865,276', pulse: false },
    { id: 'rw-gurney', d: 'M 890,250 L 890,255', pulse: false },
    { id: 'rw-drs-line', d: 'M 795,220 C 825,215 850,218 870,225', pulse: false },
    { id: 'fs-upper-front', d: 'M 210,230 L 235,280 L 260,330', pulse: true },
    { id: 'fs-upper-rear', d: 'M 270,230 L 250,280 L 260,330', pulse: false },
    { id: 'fs-lower-front', d: 'M 180,320 L 220,350 L 255,365', pulse: true },
    { id: 'fs-lower-rear', d: 'M 240,320 L 230,350 L 255,365', pulse: false },
    { id: 'fs-pushrod', d: 'M 240,250 L 255,345', pulse: false },
    { id: 'fs-upright', d: 'M 255,330 L 255,370', pulse: false },
    { id: 'rs-upper-front', d: 'M 710,250 L 710,290 L 720,330', pulse: true },
    { id: 'rs-upper-rear', d: 'M 750,255 L 725,290 L 720,330', pulse: false },
    { id: 'rs-lower-front', d: 'M 700,330 L 710,350 L 720,370', pulse: true },
    { id: 'rs-lower-rear', d: 'M 740,330 L 730,350 L 720,370', pulse: false },
    { id: 'rs-pushrod', d: 'M 720,260 L 720,345', pulse: false },
    { id: 'rs-upright', d: 'M 715,330 L 725,370', pulse: false },
    { id: 'fw-tire-outer', d: 'M 255,350 A 55,55 0 1,1 254,350', pulse: true },
    { id: 'fw-tire-inner', d: 'M 255,350 A 45,45 0 1,1 254,350', pulse: false },
    { id: 'fw-rim', d: 'M 255,350 A 30,30 0 1,1 254,350', pulse: true },
    { id: 'fw-hub', d: 'M 255,350 A 10,10 0 1,1 254,350', pulse: false },
    { id: 'fw-spoke-1', d: 'M 255,320 L 255,380', pulse: false },
    { id: 'fw-spoke-2', d: 'M 225,350 L 285,350', pulse: false },
    { id: 'fw-spoke-3', d: 'M 234,329 L 276,371', pulse: false },
    { id: 'fw-spoke-4', d: 'M 234,371 L 276,329', pulse: false },
    { id: 'fw-tread', d: 'M 255,295 A 55,55 0 0,1 310,350', pulse: false },
    { id: 'fw-sidewall', d: 'M 255,295 C 270,295 285,305 295,320', pulse: false },
    { id: 'rw-tire-outer', d: 'M 720,350 A 65,65 0 1,1 719,350', pulse: true },
    { id: 'rw-tire-inner', d: 'M 720,350 A 53,53 0 1,1 719,350', pulse: false },
    { id: 'rw-rim', d: 'M 720,350 A 35,35 0 1,1 719,350', pulse: true },
    { id: 'rw-hub', d: 'M 720,350 A 12,12 0 1,1 719,350', pulse: false },
    { id: 'rw-spoke-1', d: 'M 720,315 L 720,385', pulse: false },
    { id: 'rw-spoke-2', d: 'M 685,350 L 755,350', pulse: false },
    { id: 'rw-spoke-3', d: 'M 695,330 L 745,370', pulse: false },
    { id: 'rw-spoke-4', d: 'M 695,370 L 745,330', pulse: false },
    { id: 'rw-tread', d: 'M 720,285 A 65,65 0 0,1 785,350', pulse: false },
    { id: 'rw-sidewall', d: 'M 720,285 C 738,285 755,298 765,315', pulse: false },
    { id: 'detail-nose-1', d: 'M 80,295 C 110,293 135,285 160,270', pulse: false },
    { id: 'detail-nose-2', d: 'M 95,300 C 120,298 140,292 165,278', pulse: false },
    { id: 'detail-nose-3', d: 'M 65,310 C 90,308 110,304 130,296', pulse: false },
    { id: 'detail-body-1', d: 'M 350,180 L 440,180', pulse: false },
    { id: 'detail-body-2', d: 'M 340,190 L 460,190', pulse: false },
    { id: 'detail-body-3', d: 'M 530,220 C 560,220 595,230 625,250', pulse: false },
    { id: 'detail-body-4', d: 'M 540,240 C 570,240 600,250 630,270', pulse: false },
    { id: 'detail-body-5', d: 'M 550,260 C 580,260 610,270 640,290', pulse: false },
    { id: 'detail-gearbox', d: 'M 770,320 L 785,340', pulse: false },
    { id: 'detail-exhaust', d: 'M 680,300 L 710,310', pulse: false },
    { id: 'detail-exhaust-2', d: 'M 690,310 L 715,320', pulse: false },
    { id: 'brake-front', d: 'M 255,350 A 18,18 0 1,1 254,350', pulse: false },
    { id: 'brake-rear', d: 'M 720,350 A 22,22 0 1,1 719,350', pulse: false },
    { id: 'strut-front', d: 'M 160,290 L 200,370', pulse: false },
    { id: 'strut-rear', d: 'M 740,300 L 700,370', pulse: false },
    { id: 'radiator-line', d: 'M 450,240 L 520,370', pulse: false },
    { id: 'radiator-line-2', d: 'M 470,230 L 535,370', pulse: false },
    { id: 'dim-base', d: 'M 40,420 L 920,420', pulse: false },
    { id: 'dim-front', d: 'M 40,410 L 40,430', pulse: false },
    { id: 'dim-rear', d: 'M 920,410 L 920,430', pulse: false },
    { id: 'dim-wb-start', d: 'M 255,410 L 255,430', pulse: false },
    { id: 'dim-wb-end', d: 'M 720,410 L 720,430', pulse: false },
    { id: 'dim-wb-arrow-1', d: 'M 260,420 L 280,420 L 280,415 M 280,425 L 280,420', pulse: false },
    { id: 'dim-wb-arrow-2', d: 'M 715,420 L 695,420 L 695,415 M 695,425 L 695,420', pulse: false },
    { id: 'dim-wb-label', d: 'M 450,412 L 470,412 L 470,420 M 470,412 L 490,412', pulse: false },
    { id: 'grid-h-1', d: 'M 20,200 L 60,200', pulse: false },
    { id: 'grid-h-2', d: 'M 20,280 L 60,280', pulse: false },
    { id: 'grid-h-3', d: 'M 20,460 L 60,460', pulse: false },
    { id: 'grid-v-1', d: 'M 450,450 L 450,480', pulse: false },
    { id: 'grid-v-2', d: 'M 500,450 L 500,480', pulse: false },
  ]
}

export function F1BlueprintAnimation({
  config: userConfig,
  className,
}: {
  config?: Partial<F1BlueprintConfig>
  className?: string
}) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const pulseTweens = useRef<gsap.core.Tween[]>([])
  const orbitTween = useRef<gsap.core.Tween | null>(null)
  const config = { ...defaultConfig, ...userConfig }
  const paths = buildF1Paths()

  useEffect(() => {
    const scope = scopeRef.current
    const svg = svgRef.current
    if (!scope || !svg) return

    const pathEls = svg.querySelectorAll<SVGPathElement>('path[id]:not([id*="grid"]):not([id*="dim"])')
    const drawPaths = Array.from(pathEls)

    drawPaths.forEach(path => {
      const len = path.getTotalLength()
      path.style.strokeDasharray = String(len)
      path.style.strokeDashoffset = String(len)
    })

    const speed = config.animationSpeed
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out', duration: 0.8 / speed },
    })
    tlRef.current = tl

    tl.to(drawPaths, {
      strokeDashoffset: 0,
      duration: 0.6 / speed,
      stagger: 0.12 / speed,
    })

    tl.to({}, { duration: 1.5 })

    const pulseTargets = drawPaths.filter(p => {
      const carPath = paths.find(cp => p.id.endsWith(cp.id))
      return carPath?.pulse
    })

    pulseTweens.current = pulseTargets.map(el => {
      return gsap.to(el, {
        strokeDashoffset: () => el.getTotalLength() * 0.35,
        duration: 1.2 + Math.random() * 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      })
    })

    orbitTween.current = gsap.to(scope, {
      rotationY: 5,
      duration: 8 / speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => {
      tl.kill()
      pulseTweens.current.forEach(t => t.kill())
      if (orbitTween.current) orbitTween.current.kill()
      pulseTweens.current = []
    }
  }, [config.animationSpeed, paths])

  return (
    <div
      ref={scopeRef}
      aria-hidden="true"
      className={cn('w-full h-full', className)}
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        background: config.backgroundColor,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{
          stroke: config.lineColor,
          strokeWidth: config.strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
        }}
      >
        {paths.map(p => (
          <path key={p.id} id={p.id} d={p.d} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  )
}
