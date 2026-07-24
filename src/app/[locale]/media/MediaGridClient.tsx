'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Masonry } from '@/components/ui/masonry'

interface Tile {
  id: number
  imgUrl: string
  title: string
  location: string | null
  dateStr: string | null
  isVideo: boolean
  locale: string
  alt: string
}

export function MediaGridClient({ tiles, locale }: { tiles: Tile[]; locale: string }) {
  const masonryItems = tiles.map((t) => ({ ...t, id: t.id, height: 1 }))

  return (
    <Masonry
      items={masonryItems as any}
      breakpoints={{
        768: { columns: 2, gap: 20 },
        1024: { columns: 3, gap: 24 },
        1280: { columns: 4, gap: 24 },
      }}
      renderItem={(item: any) => <MediaTile tile={item as Tile & { id: number }} />}
    />
  )
}

function MediaTile({ tile }: { tile: Tile & { id: number } }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsHovered((p) => !p)
  }, [])

  const ariaLabel = [tile.title, tile.dateStr, tile.location].filter(Boolean).join(' — ')

  return (
    <Link
      href={`/${tile.locale}/media/${tile.id}`}
      aria-label={ariaLabel || `Media item ${tile.id}`}
      className="block relative overflow-hidden group cursor-pointer"
      style={{ borderRadius: 'var(--radius)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouch}
    >
      <div className="aspect-[4/3] bg-secondary overflow-hidden">
        {tile.isVideo ? (
          <video
            src={tile.imgUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={tile.imgUrl}
            alt={tile.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>

      {tile.isVideo && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
          Video
        </div>
      )}

      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 70%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      >
        <div className="p-3 pb-4">
          {tile.dateStr && (
            <span className="text-white/80 text-[11px] font-medium flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3" />
              {tile.dateStr}
            </span>
          )}
          {tile.location && (
            <span className="text-white/60 text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {tile.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
