'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { field } from '@/lib/supabase/locale'

const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
}

function parseRgb(color: string): { r: number; g: number; b: number } {
  const m = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 100, g: 100, b: 100 }
}

export function ArticleCard({ article, locale }: { article: any; locale: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const chart2Rgb = useRef({ r: 100, g: 100, b: 100 })

  useEffect(() => {
    const el = document.createElement('div')
    el.style.color = 'var(--chart-2)'
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    chart2Rgb.current = parseRgb(computed)
  }, [])

  const rotateX = useSpring(0, springConfig)
  const rotateY = useSpring(0, springConfig)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(-y * 15)
    rotateY.set(x * 15)
  }, [])

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    setIsHovered(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    if (!isHovered) {
      cancelAnimationFrame(animRef.current)
      ctx.clearRect(0, 0, w, h)
      particlesRef.current = []
      return
    }

    if (particlesRef.current.length === 0) {
      const c = chart2Rgb.current
      const count = 30
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: Math.random() * 50,
        maxLife: 50 + Math.random() * 100,
      }))
    }

    const particles = particlesRef.current

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      const c = chart2Rgb.current

      for (const p of particles) {
        const alpha = (1 - p.life / p.maxLife) * 0.12
        ctx!.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`
        ctx!.lineWidth = 1.5
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(p.x + p.vx * 12, p.y + p.vy * 12)
        ctx!.stroke()

        p.x += p.vx
        p.y += p.vy
        p.life++

        if (p.life > p.maxLife) {
          p.x = Math.random() * w
          p.y = Math.random() * h
          p.vx = (Math.random() - 0.5) * 0.8
          p.vy = (Math.random() - 0.5) * 0.8
          p.life = 0
          p.maxLife = 50 + Math.random() * 100
        }

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [isHovered])

  const title = field(article, 'title', locale)
  const categoryName = article.categories ? field(article.categories, 'name', locale) : ''

  return (
    <Link href={`/${locale}/articles/${article.slug}`} className="block [perspective:1000px]">
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        className="relative overflow-hidden cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, var(--background), transparent 60%)',
            opacity: isHovered ? 0.92 : 0,
          }}
        />

        <motion.div
          className="absolute top-3 right-3"
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 6 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--chart-2)' }} />
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4"
          animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          {categoryName && (
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--chart-2)' }}>
              {categoryName}
            </span>
          )}
          <h3 className="text-sm font-semibold mt-1.5 line-clamp-2 leading-snug" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
        </motion.div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
    </Link>
  )
}
