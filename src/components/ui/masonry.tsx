'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTransition, a } from '@react-spring/web'
import { cn } from '@/lib/utils'

const defaultBreakpoints = { columns: 1, gap: 16 } as const

interface MasonryBreakpoints {
  columns: number
  gap: number
}

interface MasonryItem {
  id: string | number
  height: number
  [key: string]: unknown
}

interface MasonryProps {
  items: MasonryItem[]
  breakpoints?: Record<number, MasonryBreakpoints>
  renderItem: (item: MasonryItem, index: number) => React.ReactNode
  className?: string
}

function getColumns(width: number, breakpoints: Record<number, MasonryBreakpoints>): MasonryBreakpoints {
  const sorted = Object.keys(breakpoints).map(Number).sort((a, b) => b - a)
  for (const bp of sorted) {
    if (width >= bp) return breakpoints[bp]
  }
  return defaultBreakpoints
}

export function Masonry({ items, breakpoints = {}, renderItem, className }: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [heights, setHeights] = useState<number[]>([])

  const mergedBreakpoints: Record<number, MasonryBreakpoints> = {
    640: { columns: 2, gap: 16 },
    1024: { columns: 3, gap: 20 },
    ...breakpoints,
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const { columns, gap } = getColumns(containerWidth, mergedBreakpoints)

  const columnHeights = useMemo(() => {
    const cols = new Array(columns).fill(0)
    const h: number[] = []
    for (const item of items) {
      const shortest = cols.indexOf(Math.min(...cols))
      h[shortest] = (h[shortest] || 0) + 1
      cols[shortest] += item.height / (item.height || 1)
      items.indexOf(item) === items.length - 1 && setHeights(Object.values(cols))
    }
    return cols
  }, [items, columns])

  const positioned = useMemo(() => {
    if (columns === 0 || items.length === 0) return []
    const cols = new Array(columns).fill(0)
    const result: { item: MasonryItem; x: number; y: number; width: number; index: number }[] = []
    const colWidth = (containerWidth - (columns - 1) * gap) / columns

    items.forEach((item, i) => {
      const col = cols.indexOf(Math.min(...cols))
      const itemHeight = colWidth / (16 / 9) * (item.height || 1)
      result.push({
        item,
        x: col * (colWidth + gap),
        y: cols[col],
        width: colWidth,
        index: i,
      })
      cols[col] += itemHeight + gap
    })
    return result
  }, [items, columns, containerWidth, gap])

  const transitions = useTransition(positioned, {
    key: (p: { index: number }) => p.index,
    from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
    enter: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    leave: { opacity: 0, transform: 'translateY(-20px) scale(0.95)' },
    config: { mass: 1, tension: 220, friction: 24 },
    trail: 40,
  })

  const totalHeight = Math.max(...columnHeights, 0)

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} style={{ height: totalHeight ? `${totalHeight}px` : 'auto' }}>
      {transitions((style, item) => (
        <a.div
          style={{
            position: 'absolute',
            width: item.width,
            height: 'auto',
            transform: style.transform,
            opacity: style.opacity,
            x: item.x,
            y: item.y,
          }}
        >
          {renderItem(item.item, item.index)}
        </a.div>
      ))}
    </div>
  )
}
