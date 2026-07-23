'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DeleteButton } from '../DeleteButton'
import { adminInsertMedia } from '@/lib/actions'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
]

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [descriptionUz, setDescriptionUz] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMedia(data)
    })
  }, [])

  function validateFile(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `Invalid file type: ${f.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`
    }
    if (f.size > MAX_FILE_SIZE) {
      return `File too large: ${(f.size / 1024 / 1024).toFixed(1)}MB. Max: 50MB`
    }
    return null
  }

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

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filename)

    try {
      await adminInsertMedia({
        filename,
        url: publicUrl,
        thumbnail_url: publicUrl,
        alt_uz: descriptionUz,
        alt_en: descriptionEn,
        mime_type: file.type,
        filesize: file.size,
      })
    } catch (e: any) {
      alert('DB insert failed: ' + (e?.message || 'Unknown error'))
      setUploading(false)
      return
    }

    setFile(null)
    setDescriptionUz('')
    setDescriptionEn('')
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
            <label className="block text-xs text-muted-foreground mb-1">File (max 50MB, jpg/png/webp/gif/svg/mp4/webm)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
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
