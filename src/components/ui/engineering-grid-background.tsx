'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function alpha(color: string, opacity: number): string {
  return color.replace(')', ` / ${opacity})`)
}

export function EngineeringGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl: HTMLCanvasElement = canvasRef.current!
    const ctx = canvasEl.getContext('2d')!

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const NODE_COUNT = 20
    const CONNECTION_DISTANCE = 160
    const GRID_SPACING = 60

    let nodes: Node[] = []
    let animationId: number
    let frameCount = 0

    function resize() {
      canvasEl.width = window.innerWidth
      canvasEl.height = window.innerHeight
      if (prefersReducedMotion) {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
          x: Math.random() * canvasEl.width,
          y: Math.random() * canvasEl.height,
          vx: 0,
          vy: 0,
        }))
      }
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.25,
        vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.25,
      }))
    }

    function draw() {
      const borderColor = alpha(getCSSVar('--border') || 'rgb(128,128,128)', 0.06)
      const lineColor = alpha(getCSSVar('--muted-foreground') || 'rgb(128,128,128)', 0.1)
      const accentColor = alpha(getCSSVar('--chart-2') || 'rgb(0,200,150)', 0.15)
      const dotColor = alpha(getCSSVar('--muted-foreground') || 'rgb(128,128,128)', 0.12)

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

      for (let x = GRID_SPACING; x < canvasEl.width; x += GRID_SPACING) {
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasEl.height)
        ctx.stroke()
      }
      for (let y = GRID_SPACING; y < canvasEl.height; y += GRID_SPACING) {
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasEl.width, y)
        ctx.stroke()
      }

      if (!prefersReducedMotion) {
        frameCount++
        if (frameCount % 2 === 0) {
          for (const node of nodes) {
            node.x += node.vx
            node.y += node.vy
            if (node.x < 0 || node.x > canvasEl.width) node.vx *= -1
            if (node.y < 0 || node.y > canvasEl.height) node.vy *= -1
          }
        }

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x
            const dy = nodes[j].y - nodes[i].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < CONNECTION_DISTANCE) {
              const a = 1 - dist / CONNECTION_DISTANCE
              ctx.strokeStyle = lineColor
              ctx.globalAlpha = a
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
              ctx.stroke()
            }
          }
        }
        ctx.globalAlpha = 1

        let nearestDist = Infinity
        let nearestPair: [number, number] = [0, 1]
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x
            const dy = nodes[j].y - nodes[i].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < nearestDist) {
              nearestDist = dist
              nearestPair = [i, j]
            }
          }
        }
        const [ni, nj] = nearestPair
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(nodes[ni].x, nodes[ni].y)
        ctx.lineTo(nodes[nj].x, nodes[nj].y)
        ctx.stroke()
      }

      ctx.fillStyle = dotColor
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop() {
      draw()
      animationId = requestAnimationFrame(loop)
    }

    resize()
    initNodes()
    loop()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}
