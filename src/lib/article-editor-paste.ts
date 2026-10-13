import sanitizeHtml from 'sanitize-html'
import { parseDocument } from 'htmlparser2'
import { parseVideoUrl } from './video'

export type PastedImage = { id: string; source: string; alt: string; width?: number; height?: number }

/** Images become stable placeholders before ProseMirror parses the clipboard. Sources
 * stay in an upload queue, never in the article JSON or the saved HTML. */
export function prepareArticlePaste(html: string, makeId: () => string = () => crypto.randomUUID()): { html: string; images: PastedImage[] } {
  const images: PastedImage[] = []
  const cleaned = sanitizeHtml(semanticPasteHtml(html), {
    allowedTags: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike', 'sup', 'sub', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'img'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'], img: ['data-upload-id', 'alt', 'width', 'height'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'], ol: ['start'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      'b': 'strong', 'i': 'em', 'strike': 's', 'del': 's',
      // Word sometimes uses VML image elements instead of regular <img> tags.
      'v:imagedata': (tag, attrs) => imagePlaceholder(attrs),
      'img': (tag, attrs) => imagePlaceholder(attrs),
      'a': (tag, attrs) => {
        const href = normalizeArticleLink(attrs.href || '')
        return { tagName: 'a', attribs: href ? { href, ...(attrs.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } : {} }
      },
    },
    exclusiveFilter: frame => ['p', 'span'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
  })
  return { html: cleaned, images }

  function imagePlaceholder(attrs: Record<string, string>) {
    const id = makeId()
    const source = attrs.src || attrs['data-src'] || ''
    const dimension = (value: string | undefined) => {
      const parsed = Number.parseInt(value || '', 10)
      return Number.isFinite(parsed) && parsed > 0 && parsed <= 30000 ? parsed : undefined
    }
    const width = dimension(attrs.width), height = dimension(attrs.height)
    images.push({ id, source, alt: attrs.alt || attrs.title || '', width, height })
    return { tagName: 'img', attribs: { 'data-upload-id': id, alt: attrs.alt || '', ...(width ? { width: String(width) } : {}), ...(height ? { height: String(height) } : {}) } }
  }
}

export function normalizeArticleLink(value: string): string | null {
  const input = value.trim()
  if (!input || /[\u0000-\u0020]/.test(input)) return null
  try {
    const url = new URL(input)
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol) || url.username || url.password) return null
    if (url.protocol === 'mailto:' && !url.pathname.includes('@')) return null
    return url.href
  } catch { return null }
}

export function parseArticleEmbed(value: string): { src: string; provider: 'youtube' | 'drive' | 'telegram'; title: string } | null {
  const video = parseVideoUrl(value)
  if (video) return { src: video.embedUrl, provider: video.provider, title: video.provider === 'youtube' ? 'YouTube' : 'Google Drive' }
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || !['t.me', 'telegram.me'].includes(url.hostname) || url.port || url.username || url.password) return null
    if (!/^\/[a-zA-Z][a-zA-Z0-9_]{3,31}\/[1-9]\d*\/?$/.test(url.pathname)) return null
    return { src: `https://t.me${url.pathname.replace(/\/$/, '')}?embed=1`, provider: 'telegram', title: 'Telegram' }
  } catch { return null }
}

/** Counts pending imports even after local recovery, so unresolved images cannot be published. */
export function articleImageUploadState(doc: unknown): { pending: number; failed: number } {
  let pending = 0, failed = 0
  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return
    const item = node as { type?: string; attrs?: Record<string, unknown>; content?: unknown[] }
    if (item.type === 'image') {
      if (item.attrs?.uploadState === 'pending') pending++
      else if (item.attrs?.uploadState === 'error' || (item.attrs?.uploadId && !item.attrs?.src)) failed++
    }
    item.content?.forEach(visit)
  }
  visit(doc)
  return { pending, failed }
}

/** Word/Docs encode marks in CSS spans. Convert only meaningful text marks to
 * semantic tags before discarding presentation CSS, including Docs' neutral <b>. */
export function semanticPasteHtml(html: string): string {
  const document = parseDocument(html, { decodeEntities: true, recognizeSelfClosing: true })
  type PasteNode = typeof document.children[number]
  const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  function render(node: PasteNode): string {
    if (node.type === 'text') return escape(node.data)
    if (!('name' in node) || !('attribs' in node)) return 'children' in node ? node.children.map(render).join('') : ''
    let tag = node.name.toLowerCase()
    if (['script', 'style', 'noscript', 'textarea'].includes(tag)) return ''
    const style = Object.fromEntries((node.attribs.style || '').split(';').map(part => part.split(':').map(value => value.trim().toLowerCase())).filter(parts => parts.length === 2))
    let children = node.children.map(render).join('')
    const marks: string[] = []
    if (/^(bold|[6-9]00)$/.test(style['font-weight'] || '') && !['b', 'strong'].includes(tag)) marks.push('strong')
    if (style['font-style'] === 'italic' && !['i', 'em'].includes(tag)) marks.push('em')
    const decoration = `${style['text-decoration'] || ''} ${style['text-decoration-line'] || ''}`
    if (/underline/.test(decoration) && tag !== 'u') marks.push('u')
    if (/line-through/.test(decoration) && !['s', 'del', 'strike'].includes(tag)) marks.push('s')
    if (style['vertical-align'] === 'super' && tag !== 'sup') marks.push('sup')
    if (style['vertical-align'] === 'sub' && tag !== 'sub') marks.push('sub')
    for (const mark of marks.reverse()) children = `<${mark}>${children}</${mark}>`
    if (['span', 'font'].includes(tag) || (['b', 'strong'].includes(tag) && /^(normal|[1-5]00)$/.test(style['font-weight'] || ''))) return children
    if (tag === 'v:imagedata') tag = 'img'
    const attributes = Object.entries(node.attribs).filter(([key]) => key !== 'style' && key !== 'class' && key !== 'id').map(([key, value]) => ` ${key}="${escape(value)}"`).join('')
    if (['img', 'br', 'hr', 'meta', 'input', 'link'].includes(tag)) return `<${tag}${attributes}>`
    return `<${tag}${attributes}>${children}</${tag}>`
  }
  return document.children.map(render).join('')
}

/** Clipboard HTML and File items can be two representations of the same image.
 * Match explicit filenames first, then inaccessible blob/file placeholders. Any
 * remaining File items are appended rather than silently discarded. */
export function pairArticlePasteImages(images: PastedImage[], files: File[]): { jobs: { id: string; source: File | string }[]; remainingFiles: File[] } {
  const used = new Set<number>()
  const matched = new Map<number, number>()
  images.forEach((image, imageIndex) => {
    let name = ''
    try { name = decodeURIComponent(new URL(image.source).pathname.split('/').pop() || '') } catch { /* source may be a data URI or empty */ }
    if (!name) return
    const fileIndex = files.findIndex((file, index) => !used.has(index) && file.name === name)
    if (fileIndex >= 0) { matched.set(imageIndex, fileIndex); used.add(fileIndex) }
  })
  images.forEach((image, imageIndex) => {
    if (matched.has(imageIndex)) return
    if ((!image.source || /^(file:|cid:|blob:)/i.test(image.source)) || files.length === images.length) {
      const fileIndex = files.findIndex((_file, index) => !used.has(index))
      if (fileIndex >= 0) { matched.set(imageIndex, fileIndex); used.add(fileIndex) }
    }
  })
  return {
    jobs: images.map((image, index) => ({ id: image.id, source: matched.has(index) ? files[matched.get(index)!] : image.source })),
    remainingFiles: files.filter((_file, index) => !used.has(index)),
  }
}
