import type { SupabaseClient } from '@supabase/supabase-js'

export const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/heif',
]

export const VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov — what iPhones and macOS screen recordings produce
  'video/x-m4v',
  'video/ogg',
]

export const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES]

export const MAX_IMAGE_SIZE = 15 * 1024 * 1024
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024

// Safari leaves File.type empty for some formats (notably .heic), so fall back
// to the extension before rejecting a file outright.
const EXT_TO_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  ogv: 'video/ogg',
}

export function resolveType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_TO_TYPE[ext] ?? ''
}

export function accepts(imagesOnly = false): string {
  return (imagesOnly ? IMAGE_TYPES : ALLOWED_TYPES).join(',')
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export function validateFile(file: File, imagesOnly = false): string | null {
  const type = resolveType(file)
  const allowed = imagesOnly ? IMAGE_TYPES : ALLOWED_TYPES

  if (!type) {
    return `Could not determine the type of "${file.name}". Try converting it to JPG, PNG or MP4.`
  }
  if (!allowed.includes(type)) {
    const kinds = imagesOnly ? 'images' : 'images and videos'
    return `"${file.name}" is ${type}, which is not supported. Allowed ${kinds}: ${allowed
      .map((t) => t.split('/')[1])
      .join(', ')}.`
  }

  const isVideo = VIDEO_TYPES.includes(type)
  const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > limit) {
    return `"${file.name}" is ${mb(file.size)}, over the ${mb(limit)} limit for ${
      isVideo ? 'videos' : 'images'
    }.`
  }

  return null
}

/** Uploads to the public `media` bucket and returns the public URL. */
export async function uploadToMediaBucket(
  supabase: SupabaseClient,
  file: File
): Promise<{ url: string; filename: string; type: string }> {
  const type = resolveType(file)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(filename, file, { contentType: type, upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('media').getPublicUrl(filename)
  return { url: data.publicUrl, filename, type }
}

export const ARTICLE_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp']
export const ARTICLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_ARTICLE_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateArticleImage(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const type = resolveType(file)

  if (!ARTICLE_IMAGE_EXTS.includes(ext) && !ARTICLE_IMAGE_TYPES.includes(type)) {
    return 'Only JPG, PNG, and WebP images are allowed.'
  }

  if (file.size > MAX_ARTICLE_IMAGE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return `File size is ${sizeMb} MB. Maximum allowed size is 5 MB.`
  }

  return null
}

export async function resizeAndConvertToWebp(
  file: File,
  variant: 'cover' | 'og' = 'cover'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas 2D context is not available.'))
          return
        }

        if (variant === 'cover') {
          let { naturalWidth: width, naturalHeight: height } = img
          if (width > 1600) {
            height = Math.round((height * 1600) / width)
            width = 1600
          }
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
        } else {
          // OG social share image: standard 1200x630
          const targetWidth = 1200
          const targetHeight = 630
          const targetRatio = targetWidth / targetHeight
          const sourceRatio = img.naturalWidth / img.naturalHeight

          let sx = 0
          let sy = 0
          let sWidth = img.naturalWidth
          let sHeight = img.naturalHeight

          if (sourceRatio > targetRatio) {
            // Source is wider than 1200:630 -> center crop horizontally
            sWidth = Math.round(img.naturalHeight * targetRatio)
            sx = Math.round((img.naturalWidth - sWidth) / 2)
          } else {
            // Source is taller than 1200:630 -> center crop vertically
            sHeight = Math.round(img.naturalWidth / targetRatio)
            sy = Math.round((img.naturalHeight - sHeight) / 2)
          }

          canvas.width = targetWidth
          canvas.height = targetHeight
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight)
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP format.'))
              return
            }
            resolve(blob)
          },
          'image/webp',
          0.88
        )
      } catch (err: any) {
        reject(new Error(err?.message || 'Error processing image.'))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for processing.'))
    }

    img.src = objectUrl
  })
}

/** Uploads a processed image to the public `article-images` bucket. */
export async function uploadToArticleImagesBucket(
  supabase: SupabaseClient,
  blob: Blob,
  originalName: string
): Promise<{ url: string; filename: string }> {
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '') || 'article-image'

  const rand = Math.random().toString(36).slice(2, 8)
  const filename = `${Date.now()}-${rand}-${baseName}.webp`

  const { error } = await supabase.storage
    .from('article-images')
    .upload(filename, blob, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('article-images').getPublicUrl(filename)
  return { url: data.publicUrl, filename }
}

