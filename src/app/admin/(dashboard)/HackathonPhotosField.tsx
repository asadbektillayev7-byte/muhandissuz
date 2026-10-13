'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Images, RotateCcw, Trash2 } from 'lucide-react'
import type { GalleryPhoto } from '@/lib/showcase'
import { SHOWCASE_IMAGE_ACCEPT, uploadShowcaseImage } from '@/lib/showcase-upload'

type PhotoDraft = GalleryPhoto & {
  preview: string
  filename: string
  file?: File
  progress: number
  state: 'queued' | 'uploading' | 'ready' | 'error'
  error?: string
}

export type GalleryUploadStatus = { busy: boolean; hasErrors: boolean }

const smallButton = 'inline-flex items-center justify-center gap-1 rounded border border-border px-2 py-1.5 text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'

export function HackathonPhotosField({
  initialPhotos = [],
  onChange,
  onStatusChange,
  disabled = false,
}: {
  initialPhotos?: GalleryPhoto[]
  onChange: (photos: GalleryPhoto[]) => void
  onStatusChange: (status: GalleryUploadStatus) => void
  disabled?: boolean
}) {
  const [drafts, setDrafts] = useState<PhotoDraft[]>(() => initialPhotos.map((photo) => ({
    ...photo, preview: photo.url, filename: '', progress: 100, state: 'ready',
  })))
  const [dragging, setDragging] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const queue = useRef<{ id: string; file: File }[]>([])
  const active = useRef(0)
  const removed = useRef(new Set<string | number>())
  const requests = useRef(new Map<string | number, AbortController>())
  const previews = useRef(new Map<string | number, string>())
  const mounted = useRef(true)

  useEffect(() => {
    onChange(drafts.filter((photo) => photo.state === 'ready').map((photo, position) => ({
      id: photo.id, url: photo.url, caption: photo.caption || null, position,
    })))
    onStatusChange({
      busy: drafts.some((photo) => photo.state === 'queued' || photo.state === 'uploading'),
      hasErrors: drafts.some((photo) => photo.state === 'error'),
    })
  }, [drafts, onChange, onStatusChange])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      requests.current.forEach((request) => request.abort())
      previews.current.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [])

  function update(id: string | number, patch: Partial<PhotoDraft>) {
    if (mounted.current) setDrafts((current) => current.map((photo) => photo.id === id ? { ...photo, ...patch } : photo))
  }

  function processQueue() {
    if (!mounted.current) return
    while (active.current < 3 && queue.current.length > 0) {
      const next = queue.current.shift()!
      if (removed.current.has(next.id)) continue
      active.current += 1
      const controller = new AbortController()
      requests.current.set(next.id, controller)
      update(next.id, { state: 'uploading', error: undefined, progress: 0 })
      uploadShowcaseImage(next.file, 'photos', (progress) => update(next.id, { progress }), controller.signal)
        .then((url) => update(next.id, { url, state: 'ready', progress: 100 }))
        .catch((error: unknown) => {
          if (!removed.current.has(next.id)) update(next.id, {
            state: 'error',
            error: error instanceof Error ? error.message : 'Yuklash amalga oshmadi. / Upload failed.',
          })
        })
        .finally(() => {
          requests.current.delete(next.id)
          active.current -= 1
          processQueue()
        })
    }
  }

  function addFiles(files: FileList | File[]) {
    if (disabled) return
    const additions = Array.from(files).map((file): PhotoDraft => {
      const id = crypto.randomUUID()
      const preview = URL.createObjectURL(file)
      previews.current.set(id, preview)
      queue.current.push({ id, file })
      return { id, url: '', caption: '', position: 0, file, preview, filename: file.name, progress: 0, state: 'queued' }
    })
    if (additions.length === 0) return
    setDrafts((current) => [...current, ...additions])
    processQueue()
  }

  function removePhoto(id: string | number) {
    removed.current.add(id)
    requests.current.get(id)?.abort()
    const preview = previews.current.get(id)
    if (preview) URL.revokeObjectURL(preview)
    previews.current.delete(id)
    setDrafts((current) => current.filter((photo) => photo.id !== id))
  }

  function movePhoto(index: number, offset: number) {
    setDrafts((current) => {
      const ordered = [...current]
      const target = index + offset
      if (target < 0 || target >= ordered.length) return current
      ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
      return ordered
    })
  }

  const ready = drafts.filter((photo) => photo.state === 'ready').length
  const pending = drafts.filter((photo) => photo.state === 'queued' || photo.state === 'uploading').length

  return (
    <section aria-labelledby="hackathon-photos-heading" className="space-y-4 border-t border-border pt-6">
      <div>
        <h2 id="hackathon-photos-heading" className="text-lg font-semibold">Rasmlar / Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bir vaqtning o'zida ko'p rasm tanlang. Rasmlar 1600 pikselgacha kichraytiriladi va siqiladi.
          {' / '}Choose multiple photos at once; they are resized and compressed before upload.
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => picker.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}
        className={`flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-4 text-sm transition-colors hover:bg-muted disabled:opacity-50 ${dragging ? 'border-accent bg-muted' : 'border-border'}`}
      >
        <Images size={24} aria-hidden="true" />
        <span>Rasmlarni shu yerga tashlang yoki tanlang / Drop photos here or choose files</span>
      </button>
      <input
        ref={picker}
        type="file"
        accept={SHOWCASE_IMAGE_ACCEPT}
        multiple
        className="hidden"
        aria-label="Rasmlarni tanlang / Select photos"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      {drafts.length > 0 && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {ready}/{drafts.length} tayyor / ready{pending > 0 ? ` · ${pending} yuklanmoqda / uploading` : ''}
        </p>
      )}
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((photo, index) => (
          <li key={photo.id} className="min-w-0 space-y-3 rounded border border-border bg-card p-3">
            <img
              src={photo.preview}
              alt={photo.caption || `Hakaton rasmi ${index + 1} / Hackathon photo ${index + 1}`}
              width={400}
              height={300}
              loading="lazy"
              className="aspect-[4/3] w-full rounded object-cover"
            />
            {photo.filename && <p className="truncate text-xs text-muted-foreground" title={photo.filename}>{photo.filename}</p>}
            {(photo.state === 'queued' || photo.state === 'uploading') && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{photo.state === 'queued' ? 'Navbatda / Queued' : `Yuklanmoqda / Uploading: ${photo.progress}%`}</p>
                <progress max={100} value={photo.progress} className="h-2 w-full accent-accent" aria-label={`${index + 1}-rasm yuklanishi / Photo upload progress`} />
              </div>
            )}
            {photo.error && <p role="alert" className="text-xs text-destructive">{photo.error}</p>}
            <div>
              <label htmlFor={`photo-caption-${photo.id}`} className="mb-1 block text-xs font-medium">Izoh (ixtiyoriy) / Caption (optional)</label>
              <input
                id={`photo-caption-${photo.id}`}
                type="text"
                value={photo.caption || ''}
                maxLength={240}
                disabled={disabled}
                onChange={(event) => update(photo.id, { caption: event.target.value })}
                className="w-full rounded border border-border bg-background px-2 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={smallButton} disabled={disabled || index === 0} onClick={() => movePhoto(index, -1)} aria-label={`${index + 1}-rasmni oldinga / Move photo earlier`}><ArrowUp size={14} /> Oldinga</button>
              <button type="button" className={smallButton} disabled={disabled || index === drafts.length - 1} onClick={() => movePhoto(index, 1)} aria-label={`${index + 1}-rasmni keyinga / Move photo later`}><ArrowDown size={14} /> Keyinga</button>
              <button type="button" className={`${smallButton} hover:text-destructive`} disabled={disabled} onClick={() => removePhoto(photo.id)} aria-label={`${index + 1}-rasmni o'chirish / Delete photo`}><Trash2 size={14} /> O'chirish</button>
              {photo.state === 'error' && photo.file && (
                <button type="button" className={smallButton} disabled={disabled} onClick={() => {
                  update(photo.id, { state: 'queued', error: undefined, progress: 0 })
                  queue.current.push({ id: String(photo.id), file: photo.file! })
                  processQueue()
                }}><RotateCcw size={14} /> Qayta urinish / Retry</button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {drafts.some((photo) => photo.state === 'error') && (
        <p role="alert" className="text-sm text-destructive">Saqlashdan oldin xatoli rasmlarni qayta yuklang yoki o'chiring. / Retry or remove failed photos before saving.</p>
      )}
    </section>
  )
}
