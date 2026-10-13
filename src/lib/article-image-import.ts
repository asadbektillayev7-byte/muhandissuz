import { lookup } from 'node:dns/promises'
import { request as httpsRequest, type RequestOptions } from 'node:https'
import { isIP } from 'node:net'
import type { IncomingHttpHeaders } from 'node:http'
import sharp from 'sharp'

export const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_IMPORTED_IMAGE_BYTES = 3 * 1024 * 1024
const TIMEOUT_MS = 12_000
const MAX_REDIRECTS = 3
const RASTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

export class ImageImportError extends Error {
  constructor(message: string, public readonly status = 422) {
    super(message)
    this.name = 'ImageImportError'
  }
}

type Address = { address: string; family: number }
type Resolver = (hostname: string) => Promise<Address[]>
export type ImageResponse = {
  status: number
  headers: IncomingHttpHeaders
  body: AsyncIterable<Uint8Array>
  cancel: () => void
}
type PinnedRequest = (url: URL, address: Address, signal: AbortSignal) => Promise<ImageResponse>

/** Deliberately excludes special-purpose networks, including IPv4 embedded in IPv6. */
export function isPublicImageAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b, c, d] = address.split('.').map(Number)
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 168 && b === 63 && c === 129 && d === 16) || // Azure platform virtual IP
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)) || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    )
  }
  if (isIP(address) !== 6 || address.includes('%') || address.includes('.')) return false
  const [start, end] = address.toLowerCase().split('::')
  const left = start ? start.split(':').map((part) => parseInt(part, 16)) : []
  const right = end ? end.split(':').map((part) => parseInt(part, 16)) : []
  const words = end === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill(0), ...right]
  if (words.length !== 8 || (words[0] & 0xe000) !== 0x2000) return false
  // IANA special-purpose ranges: IETF, documentation, 6to4 and AS112.
  if (words[0] === 0x2001 && (words[1] < 0x200 || words[1] === 0xdb8)) return false
  if (words[0] === 0x2002 || (words[0] === 0x3fff && (words[1] & 0xf000) === 0)) return false
  if (words[0] === 0x2620 && words[1] === 0x4f && words[2] === 0x8000) return false
  if ((words[4] === 0 || words[4] === 0x200) && words[5] === 0x5efe) return false // ISATAP
  return true
}

export function parseRemoteImageUrl(source: string): URL {
  let url: URL
  try { url = new URL(source) } catch { throw new ImageImportError('Rasm havolasi noto‘g‘ri / Invalid image URL.', 400) }
  if (source.length > 4096 || url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    throw new ImageImportError('Faqat oddiy HTTPS rasm havolasi mumkin / Use an HTTPS image URL without a password or custom port.', 400)
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase()
  if (!hostname || /(^|\.)(localhost|local|internal|invalid|test|onion)$/.test(hostname) || (isIP(hostname) && !isPublicImageAddress(hostname))) {
    throw new ImageImportError('Bu rasm manziliga ruxsat berilmagan / This image address is not allowed.', 400)
  }
  url.hash = ''
  return url
}

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw signal.reason
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}

async function resolvePublicAddress(url: URL, resolver: Resolver, signal: AbortSignal): Promise<Address> {
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  const literalFamily = isIP(hostname)
  const addresses = literalFamily ? [{ address: hostname, family: literalFamily }] : await abortable(resolver(hostname), signal)
  if (!addresses.length || addresses.some((item) => !isPublicImageAddress(item.address) || isIP(item.address) !== item.family)) {
    throw new ImageImportError('Bu rasm manziliga ruxsat berilmagan / This image address is not allowed.', 400)
  }
  return addresses.find((item) => item.family === 4) || addresses[0]
}

/** The socket uses the already-checked DNS answer; it never resolves the host a second time. */
export function pinnedImageRequestOptions(address: Address, signal: AbortSignal): RequestOptions {
  return {
    method: 'GET', agent: false, signal, timeout: 6000, maxHeaderSize: 16 * 1024,
    headers: {
      accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif',
      'accept-encoding': 'identity',
      'user-agent': 'Muhandiss-Article-Image-Importer/1.0',
    },
    lookup: (_hostname, options, callback) => {
      if (options.all) callback(null, [address])
      else callback(null, address.address, address.family)
    },
  }
}

const requestPinnedImage: PinnedRequest = (url, address, signal) => new Promise((resolve, reject) => {
  const request = httpsRequest(url, pinnedImageRequestOptions(address, signal), (response) => {
    // Keep an error listener before async iteration starts (an abort can race the caller).
    response.on('error', () => {})
    resolve({ status: response.statusCode || 0, headers: response.headers, body: response, cancel: () => response.destroy() })
  })
  request.on('timeout', () => request.destroy(new ImageImportError('Rasm manbasi javob bermadi / Image source timed out. Try again.', 504)))
  request.on('error', reject)
  request.end()
})

export function detectRasterMime(bytes: Uint8Array): string | null {
  const buffer = Buffer.from(bytes)
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (/^GIF8[79]a$/.test(buffer.toString('ascii', 0, 6))) return 'image/gif'
  if (buffer.toString('ascii', 4, 8) === 'ftyp' && /^(avif|avis)$/.test(buffer.toString('ascii', 8, 12))) return 'image/avif'
  return null
}

/** Test dependencies let the security boundary run without contacting external hosts. */
export async function downloadRemoteRaster(source: string, dependencies: {
  resolve?: Resolver; request?: PinnedRequest; timeoutMs?: number; signal?: AbortSignal
} = {}): Promise<Buffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(new ImageImportError('Rasm manbasi javob bermadi / Image source timed out. Try again.', 504)), dependencies.timeoutMs ?? TIMEOUT_MS)
  const cancel = () => controller.abort(dependencies.signal?.reason)
  dependencies.signal?.addEventListener('abort', cancel, { once: true })
  if (dependencies.signal?.aborted) cancel()
  const resolver = dependencies.resolve ?? ((hostname) => lookup(hostname, { all: true, verbatim: true }))
  const request = dependencies.request ?? requestPinnedImage
  try {
    let url = parseRemoteImageUrl(source)
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const address = await resolvePublicAddress(url, resolver, controller.signal)
      const response = await abortable(request(url, address, controller.signal), controller.signal)
      try {
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          if (hop === MAX_REDIRECTS || typeof response.headers.location !== 'string') {
            throw new ImageImportError('Rasm havolasi ko‘p marta yo‘naltirildi / Too many image redirects. Download the image and upload it from your laptop.')
          }
          url = parseRemoteImageUrl(new URL(response.headers.location, url).href)
          continue
        }
        if (response.status !== 200) {
          throw new ImageImportError('Rasmga kirib bo‘lmadi (havola eskirgan yoki kirish talab etiladi). Rasmni yuklab olib, qayta biriktiring / The source needs access or has expired. Download the image and upload it from your laptop.')
        }
        const contentType = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
        if (!RASTER_TYPES.has(contentType) || (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) {
          throw new ImageImportError('Havola JPG, PNG, WebP, GIF yoki AVIF rasm bo‘lishi kerak / This link must return a JPG, PNG, WebP, GIF or AVIF image.')
        }
        const declaredLength = response.headers['content-length']
        if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_REMOTE_IMAGE_BYTES)) {
          throw new ImageImportError('Rasm juda katta (eng ko‘pi 8 MB) / Image is too large (8 MB maximum).', 413)
        }
        const chunks: Buffer[] = []
        let size = 0
        const iterator = response.body[Symbol.asyncIterator]()
        while (true) {
          const { value, done } = await abortable(iterator.next(), controller.signal)
          if (done) break
          size += value.byteLength
          if (size > MAX_REMOTE_IMAGE_BYTES) throw new ImageImportError('Rasm juda katta (eng ko‘pi 8 MB) / Image is too large (8 MB maximum).', 413)
          chunks.push(Buffer.from(value))
        }
        const bytes = Buffer.concat(chunks, size)
        if (detectRasterMime(bytes) !== contentType) throw new ImageImportError('Rasm fayli turi mos kelmadi / The image file does not match its declared type.')
        return bytes
      } finally { response.cancel() }
    }
    throw new ImageImportError('Rasm yuklanmadi / Could not download this image.')
  } catch (error) {
    if (error instanceof ImageImportError) throw error
    if (controller.signal.aborted && controller.signal.reason instanceof ImageImportError) throw controller.signal.reason
    throw new ImageImportError('Rasm manbasiga ulanish imkonsiz. Qayta urinib ko‘ring yoki faylni biriktiring / Could not reach the image source. Retry or upload the image file.')
  } finally {
    clearTimeout(timeout)
    dependencies.signal?.removeEventListener('abort', cancel)
  }
}

export async function optimizeImportedRaster(bytes: Buffer): Promise<Buffer> {
  try {
    // Decode as raster, reject decompression bombs, remove metadata and animations.
    const result = await sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'warning', animated: false })
      .rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).timeout({ seconds: 8 }).toBuffer()
    if (result.length > MAX_IMPORTED_IMAGE_BYTES) throw new ImageImportError('Rasm juda katta. Kichikroq faylni biriktiring / Please upload a smaller image.', 413)
    return result
  } catch (error) {
    if (error instanceof ImageImportError) throw error
    throw new ImageImportError('Rasm buzilgan yoki o‘lchami juda katta / The image is damaged or its dimensions are too large.')
  }
}
