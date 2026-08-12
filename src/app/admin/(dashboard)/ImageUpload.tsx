'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { accepts, uploadToMediaBucket, validateFile } from '@/lib/upload'

export function ImageUpload({
  value,
  onChange,
  allowUrl = false,
}: {
  value: string
  onChange: (url: string) => void
  /** Also show a URL text field, for pasting a logo hosted elsewhere. */
  allowUrl?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')

    const invalid = validateFile(file, true)
    if (invalid) {
      setError(invalid)
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadToMediaBucket(createClient(), file)
      onChange(url)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-16 w-16 object-cover border border-border shrink-0"
            style={{ borderRadius: 'var(--radius)' }}
          />
        ) : (
          <div
            className="h-16 w-16 border border-dashed border-border shrink-0 flex items-center justify-center text-[10px] text-muted-foreground text-center px-1"
            style={{ borderRadius: 'var(--radius)' }}
          >
            No image
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-50"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {uploading ? 'Uploading...' : value ? 'Replace' : 'Upload image'}
            </button>
            {value && !uploading && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setError('')
                }}
                className="text-sm text-muted-foreground hover:text-red-500 transition-colors px-2"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accepts(true)}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />

          {allowUrl && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image URL"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
            />
          )}

          {!allowUrl && value && (
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
