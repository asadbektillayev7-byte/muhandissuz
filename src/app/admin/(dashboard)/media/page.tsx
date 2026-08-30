'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DeleteButton } from '../DeleteButton'
import { adminInsertMedia } from '@/lib/actions'
import { accepts, resolveType, uploadToMediaBucket, validateFile } from '@/lib/upload'

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [descriptionUz, setDescriptionUz] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [titleUz, setTitleUz] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [locationUz, setLocationUz] = useState('')
  const [locationEn, setLocationEn] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [fullDescriptionUz, setFullDescriptionUz] = useState('')
  const [fullDescriptionEn, setFullDescriptionEn] = useState('')
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMedia(data)
    })
  }, [])

  async function handleUpload() {
    setValidationError('')
    if (!file) return
    const validationErr = validateFile(file)
    if (validationErr) {
      setValidationError(validationErr)
      return
    }
    if (!descriptionUz.trim() && !descriptionEn.trim()) {
      if (!confirm('Alt text is empty. Upload anyway?')) return
    }

    setUploading(true)

    let publicUrl: string
    let filename: string
    try {
      const uploaded = await uploadToMediaBucket(supabase, file)
      publicUrl = uploaded.url
      filename = uploaded.filename
    } catch (e: any) {
      setValidationError(`Upload to storage failed: ${e?.message || 'unknown error'}`)
      setUploading(false)
      return
    }

    // Optional still for a video. Videos show their own first frame without
    // one; this is the override for when that frame is a bad one.
    let posterUrl: string | undefined
    if (posterFile) {
      try {
        posterUrl = (await uploadToMediaBucket(supabase, posterFile)).url
      } catch (e: any) {
        setValidationError(`Poster upload failed: ${e?.message || 'unknown error'}`)
        setUploading(false)
        return
      }
    }

    const isVideo = resolveType(file).startsWith('video/')

    try {
      await adminInsertMedia({
        filename,
        url: publicUrl,
        // A video's own URL is not a thumbnail — feeding it to an <img> just
        // fails to decode. Only images are their own thumbnail.
        thumbnail_url: isVideo ? undefined : publicUrl,
        poster_url: posterUrl,
        alt_uz: descriptionUz,
        alt_en: descriptionEn,
        title_uz: titleUz || undefined,
        title_en: titleEn || undefined,
        location_uz: locationUz || undefined,
        location_en: locationEn || undefined,
        description_uz: fullDescriptionUz || undefined,
        description_en: fullDescriptionEn || undefined,
        event_date: eventDate || undefined,
        mime_type: resolveType(file),
        filesize: file.size,
      })
    } catch (e: any) {
      setValidationError(`Saving to the database failed: ${e?.message || 'unknown error'}`)
      setUploading(false)
      return
    }

    setFile(null)
    setPosterFile(null)
    setDescriptionUz('')
    setDescriptionEn('')
    setTitleUz('')
    setTitleEn('')
    setLocationUz('')
    setLocationEn('')
    setEventDate('')
    setFullDescriptionUz('')
    setFullDescriptionEn('')
    setUploading(false)

    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false })
    if (data) setMedia(data)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Media</h1>

      <div className="border border-border p-4 mb-6" style={{ borderRadius: 'var(--radius)' }}>
        <h2 className="text-sm font-semibold mb-3">Upload New</h2>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded mb-3">
            {validationError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">File (images max 15MB, video max 200MB)</label>
            <input
              type="file"
              accept={accepts()}
              onChange={(e) => {
                setValidationError('')
                setFile(e.target.files?.[0] || null)
              }}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Alt text (UZ)</label>
            <input
              value={descriptionUz}
              onChange={(e) => setDescriptionUz(e.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
              placeholder="Tasvir nomi"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Alt text (EN)</label>
            <input
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
              placeholder="Image name"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end mt-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Title (UZ)</label>
            <input value={titleUz} onChange={(e) => setTitleUz(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2" style={{ borderRadius: 'var(--radius)' }} placeholder="Tadbir nomi" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Title (EN)</label>
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2" style={{ borderRadius: 'var(--radius)' }} placeholder="Event name" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Location (UZ)</label>
            <input value={locationUz} onChange={(e) => setLocationUz(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2" style={{ borderRadius: 'var(--radius)' }} placeholder="Toshkent" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Location (EN)</label>
            <input value={locationEn} onChange={(e) => setLocationEn(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2" style={{ borderRadius: 'var(--radius)' }} placeholder="Tashkent" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Poster image (videos only, optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Event Date</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2" style={{ borderRadius: 'var(--radius)' }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted-foreground mb-1">Full description (UZ)</label>
            <textarea value={fullDescriptionUz} onChange={(e) => setFullDescriptionUz(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 w-full" style={{ borderRadius: 'var(--radius)' }} rows={2} placeholder="Tadbir haqida batafsil..." />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted-foreground mb-1">Full description (EN)</label>
            <textarea value={fullDescriptionEn} onChange={(e) => setFullDescriptionEn(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 w-full" style={{ borderRadius: 'var(--radius)' }} rows={2} placeholder="Detailed event writeup..." />
          </div>
        </div>
        <div className="flex mt-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {media.map((item) => (
          <div key={item.id} className="relative group aspect-square overflow-hidden border border-border bg-muted" style={{ borderRadius: 'var(--radius)' }}>
            {item.mime_type?.startsWith('video') ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.thumbnail_url || item.url} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <span className="text-white text-xs text-center truncate w-full">{item.alt_uz || item.filename}</span>
              <span className="text-white/60 text-[10px] truncate w-full text-center">{item.mime_type} {item.filesize ? `(${(item.filesize / 1024).toFixed(0)}KB)` : ''}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.url)
                  alert('URL copied!')
                }}
                className="text-xs text-chart-2 hover:underline"
              >
                Copy URL
              </button>
              <DeleteButton table="media" id={item.id} redirect="/admin/media" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
