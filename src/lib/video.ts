export type ParsedVideo = {
  provider: 'youtube' | 'drive'
  id: string
  embedUrl: string
  posterUrl: string | null
}

const youtubeHosts = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
  'youtube-nocookie.com', 'www.youtube-nocookie.com',
])
const youtubeId = /^[A-Za-z0-9_-]{11}$/
const driveId = /^[A-Za-z0-9_-]{10,200}$/

/** Only supported HTTPS video providers can become an iframe source. */
export function parseVideoUrl(value: string | null | undefined): ParsedVideo | null {
  if (!value?.trim()) return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null

  let id: string | null = null
  if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
    id = url.pathname.match(/^\/([A-Za-z0-9_-]+)\/?$/)?.[1] ?? null
  } else if (youtubeHosts.has(url.hostname)) {
    id = /^\/watch\/?$/.test(url.pathname)
      ? url.searchParams.get('v')
      : url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]+)\/?$/)?.[1] ?? null
  }
  if (id && youtubeId.test(id)) {
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      posterUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  }

  if (url.hostname === 'drive.google.com') {
    id = /^\/open\/?$/.test(url.pathname)
      ? url.searchParams.get('id')
      : url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)\/(?:view|preview)\/?$/)?.[1] ?? null
    if (id && driveId.test(id)) {
      return {
        provider: 'drive',
        id,
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        posterUrl: null,
      }
    }
  }
  return null
}

/** Optional video; Drive needs an uploaded cover because its thumbnails vary. */
export function getVideoValidationError(
  value: string | null | undefined,
  coverImageUrl?: string | null,
): string | null {
  if (!value?.trim()) return null
  const video = parseVideoUrl(value)
  if (!video) {
    return "YouTube yoki Google Drive video havolasini kiriting. / Enter a valid YouTube or Google Drive video link."
  }
  if (video.provider === 'drive' && !coverImageUrl?.trim()) {
    return "Google Drive videosi uchun muqova rasmini yuklang. / Upload a cover image for the Google Drive video."
  }
  return null
}
