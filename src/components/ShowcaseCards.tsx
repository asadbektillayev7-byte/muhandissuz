'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Images, Play, X } from 'lucide-react'
import { getShowcaseLabels } from '@/lib/showcase-i18n'
import { formatShowcaseDate } from '@/lib/showcase-date'
import type { GalleryPhoto, ShowcaseItem } from '@/lib/showcase'
import { parseVideoUrl } from '@/lib/video'

const surface = {
  backgroundColor: 'var(--card)',
  borderColor: 'var(--border)',
  borderRadius: 'var(--radius)',
}

function Poster({ url, title, locale }: { url: string | null; title: string; locale: string }) {
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const labels = getShowcaseLabels(locale)
  useEffect(() => {
    const image = imageRef.current
    setFailed(Boolean(image?.complete && !image.naturalWidth))
  }, [url])
  return (
    <div className="aspect-video w-full overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
      {url && !failed ? (
        <img
          ref={imageRef}
          src={url}
          alt={`${title} — ${labels.cover}`}
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.025]"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-8 text-center text-muted-foreground">
          <span className="text-lg font-medium">{title}</span>
        </div>
      )}
    </div>
  )
}

type LightboxSelection = {
  item: ShowcaseItem
  photos: GalleryPhoto[]
  index: number
}

function PhotoLightbox({ selection, locale, onClose }: {
  selection: LightboxSelection
  locale: string
  onClose: () => void
}) {
  const [index, setIndex] = useState(selection.index)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const labels = getShowcaseLabels(locale)
  const photo = selection.photos[index]
  const move = useCallback((direction: number) => {
    setIndex((current) => (current + direction + selection.photos.length) % selection.photos.length)
  }, [selection.photos.length])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowRight' ? 1 : -1)
      }
      if (event.key === 'Tab') {
        const controls = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    dialog.addEventListener('keydown', handleKeyboard)
    return () => {
      dialog.removeEventListener('keydown', handleKeyboard)
      dialog.close()
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [move])

  function finishSwipe(event: TouchEvent) {
    const start = swipeStart.current
    const end = event.changedTouches[0]
    swipeStart.current = null
    if (!start || !end) return
    const dx = end.clientX - start.x
    const dy = end.clientY - start.y
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="showcase-lightbox-title"
      className="fixed inset-0 z-[100] m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-black/95 p-4 text-white backdrop:bg-black/80 [&:not([open])]:hidden"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="pointer-events-none flex h-full flex-col gap-4">
        <div className="pointer-events-auto flex items-center justify-between gap-4">
          <h2 id="showcase-lightbox-title" className="truncate text-base font-semibold">{selection.item.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.closeGallery}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <figure
            className="pointer-events-auto flex h-full min-h-0 w-full flex-col items-center justify-center gap-3"
            style={{ touchAction: 'pan-y' }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
            onTouchStart={(event) => {
              swipeStart.current = event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
                : null
            }}
            onTouchEnd={finishSwipe}
            onTouchCancel={() => { swipeStart.current = null }}
          >
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.caption || `${selection.item.title} — ${labels.photo} ${index + 1}`}
              width={1600}
              height={1000}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="min-h-0 w-full flex-1 object-contain"
            />
            <figcaption aria-live="polite" className="max-w-3xl shrink-0 px-12 text-center text-sm">
              {photo.caption && <p className="mb-1">{photo.caption}</p>}
              <span className="text-white/65">{index + 1} / {selection.photos.length}</span>
            </figcaption>
          </figure>
          {selection.photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={labels.previousPhoto}
                className="pointer-events-auto absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-white/25 sm:left-2"
              ><ChevronLeft size={28} aria-hidden="true" /></button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label={labels.nextPhoto}
                className="pointer-events-auto absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-white/25 sm:right-2"
              ><ChevronRight size={28} aria-hidden="true" /></button>
            </>
          )}
        </div>
      </div>
    </dialog>
  )
}

/** Posters render first. At most one selected card mounts a video iframe. */
export function ShowcaseCards({ items, locale }: { items: ShowcaseItem[]; locale: string }) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null)
  const [lightbox, setLightbox] = useState<LightboxSelection | null>(null)
  const triggers = useRef(new Map<string | number, HTMLButtonElement>())
  const closeButton = useRef<HTMLButtonElement>(null)
  const labels = getShowcaseLabels(locale)
  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (expandedId !== null) closeButton.current?.focus({ preventScroll: true })
  }, [expandedId])

  function collapse(id: string | number) {
    setExpandedId(null)
    // The poster control is restored by this render before focus returns to it.
    requestAnimationFrame(() => triggers.current.get(id)?.focus({ preventScroll: true }))
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const video = parseVideoUrl(item.videoUrl)
          const photos = [...(item.photos || [])].sort((a, b) => a.position - b.position)
          const expanded = expandedId === item.id
          const canExpand = Boolean(video || photos.length)
          const posterUrl = item.posterUrl || video?.posterUrl || photos[0]?.url || null
          const date = formatShowcaseDate(item.date, locale)
          const endDate = formatShowcaseDate(item.endDate, locale)
          const statusLabel = item.status === 'upcoming' ? labels.upcoming : item.status === 'ongoing' ? labels.ongoing : labels.past

          return (
            <article
              key={item.id}
              className={`min-w-0 overflow-hidden border transition-shadow hover:shadow-md ${expanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
              style={surface}
            >
              {expanded ? (
                <>
                  <div className="flex items-center justify-between gap-4 border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <button
                      ref={closeButton}
                      type="button"
                      onClick={() => collapse(item.id)}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <X size={18} aria-hidden="true" />{labels.closePlayer}
                    </button>
                  </div>
                  <div className={`grid ${photos.length ? 'lg:grid-cols-3' : ''}`}>
                    <div className={`min-w-0 ${photos.length ? 'lg:col-span-2' : ''}`}>
                      {video ? (
                        <div className="aspect-video bg-black">
                          <iframe
                            src={`${video.embedUrl}?autoplay=1${video.provider === 'youtube' ? '&playsinline=1&rel=0' : ''}`}
                            title={`${labels.play}: ${item.title}`}
                            width={1280}
                            height={720}
                            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="h-full w-full border-0"
                          />
                        </div>
                      ) : <Poster url={posterUrl} title={item.title} locale={locale} />}
                    </div>
                    {photos.length > 0 && (
                      <aside
                        aria-label={`${item.title} — ${labels.photos}`}
                        className="relative min-h-0 border-t lg:border-l lg:border-t-0"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex flex-col p-4 lg:absolute lg:inset-0">
                          <h3 className="mb-3 shrink-0 text-sm font-semibold">{labels.photos} <span className="text-muted-foreground">({photos.length})</span></h3>
                          <div className="grid max-h-80 min-h-0 grid-cols-3 gap-2 overflow-y-auto pr-1 lg:max-h-none lg:grid-cols-2">
                            {photos.map((photo, index) => (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => setLightbox({ item, photos, index })}
                                aria-label={photo.caption || `${labels.photo} ${index + 1}: ${item.title}`}
                                className="group h-fit overflow-hidden rounded border transition-colors hover:border-accent"
                                style={{ backgroundColor: 'var(--secondary)' }}
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `${item.title} — ${labels.photo} ${index + 1}`}
                                  width={320}
                                  height={240}
                                  loading="lazy"
                                  decoding="async"
                                  className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </aside>
                    )}
                  </div>
                </>
              ) : canExpand ? (
                <button
                  ref={(element) => { if (element) triggers.current.set(item.id, element); else triggers.current.delete(item.id) }}
                  type="button"
                  onClick={() => setExpandedId(item.id)}
                  aria-label={`${video ? labels.play : labels.viewPhotos}: ${item.title}`}
                  aria-expanded={false}
                  className="group relative block w-full overflow-hidden text-left"
                >
                  <Poster url={posterUrl} title={item.title} locale={locale} />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition-transform duration-200 group-hover:scale-110 sm:h-16 sm:w-16">
                      {video ? <Play size={25} fill="currentColor" className="translate-x-0.5" aria-hidden="true" /> : <Images size={25} aria-hidden="true" />}
                    </span>
                  </span>
                </button>
              ) : (
                <Link href={item.href} className="group block overflow-hidden" aria-label={`${labels.details}: ${item.title}`}>
                  <Poster url={posterUrl} title={item.title} locale={locale} />
                </Link>
              )}
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {item.status && (
                    <span
                      className="rounded-full border px-2 py-0.5"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}
                    >{statusLabel}</span>
                  )}
                  {date && <time dateTime={item.date || undefined}>{date}{endDate && endDate !== date ? ` — ${endDate}` : ''}</time>}
                </div>
                <h2 className="text-lg font-semibold">
                  <Link href={item.href} className="transition-colors hover:text-accent">{item.title}</Link>
                </h2>
                {item.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>}
                <Link href={item.href} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover hover:underline">
                  {labels.details}<ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
      {lightbox && <PhotoLightbox selection={lightbox} locale={locale} onClose={closeLightbox} />}
    </>
  )
}
