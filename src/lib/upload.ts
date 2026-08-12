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
