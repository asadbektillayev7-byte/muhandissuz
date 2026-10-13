import sanitizeHtml from 'sanitize-html'

export type ArticleLanguage = 'uz' | 'en' | 'ru'
export type ArticleStatus = 'draft' | 'scheduled' | 'published'

/** URL-only transliteration. Never transforms an article's displayed text. */
export function articleSlug(title: string): string {
  const letters: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  }
  return title.toLowerCase().normalize('NFKD').replace(/[а-яёўқғҳ]/g, (c) => letters[c] ?? c)
    .replace(/[\u0300-\u036f'‘’ʻʼ`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180).replace(/-+$/g, '')
}

export function isArticleSlug(slug: string): boolean {
  return slug.length <= 180 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/** datetime-local fields represent Tashkent wall time, independent of device timezone. */
export function toTashkentInput(value?: string | null): string {
  const date = value ? new Date(value) : new Date()
  if (!Number.isFinite(date.getTime())) return ''
  return new Date(date.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16)
}

export function fromTashkentInput(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Sana va vaqtni tekshiring / Check the date and time.")
  const date = new Date(`${value}:00+05:00`)
  if (!Number.isFinite(date.getTime()) || toTashkentInput(date.toISOString()) !== value) throw new Error("Sana va vaqtni tekshiring / Check the date and time.")
  return date.toISOString()
}

export function articleStatus(article: { published?: unknown; published_date?: unknown }, now = Date.now()): ArticleStatus {
  if (article.published !== true) return 'draft'
  const date = typeof article.published_date === 'string' ? Date.parse(article.published_date) : NaN
  return Number.isFinite(date) && date > now ? 'scheduled' : 'published'
}

/** Guard all languages before sanitizing; never turn an unfinished upload into a silently missing image. */
export function hasUnfinishedArticleImages(body: unknown, depth = 0): boolean {
  if (depth > 80) return true
  if (typeof body === 'string') {
    if (/^\s*[\[{]/.test(body)) {
      try { return hasUnfinishedArticleImages(JSON.parse(body), depth + 1) } catch { /* legacy HTML */ }
    }
    let unfinished = false
    // Parse rather than matching raw HTML: Word/Docs and old HTML can entity-
    // encode the scheme, and the browser removes control characters in URLs.
    sanitizeHtml(body, {
      allowedTags: [], allowedAttributes: {},
      transformTags: {
        '*': (tagName, attrs) => {
          if ('data-upload-id' in attrs || 'data-upload-placeholder' in attrs) unfinished = true
          if ((tagName === 'img' || tagName === 'source') && isTransientImageSource(attrs.src)) unfinished = true
          return { tagName, attribs: attrs }
        },
      },
    })
    return unfinished
  }
  if (Array.isArray(body)) return body.some((child) => hasUnfinishedArticleImages(child, depth + 1))
  if (!body || typeof body !== 'object') return false
  const node = body as Record<string, any>
  if (node.type === 'image' || node.type === 'upload') {
    const source = node.attrs?.src ?? node.src ?? node.url ?? node.value?.url
    if (node.attrs?.uploadId || node.attrs?.uploadState || !isSavedImageSource(source)) return true
  } else if (typeof node.type === 'string' && /upload|placeholder/i.test(node.type)) return true
  return ['content', 'children', 'root', 'html'].some((key) => node[key] && hasUnfinishedArticleImages(node[key], depth + 1))
}

function isTransientImageSource(source: unknown): boolean {
  return typeof source === 'string' && /^(?:data|blob):/i.test(source.replace(/[\u0000-\u0020\u007f]/g, ''))
}

function isSavedImageSource(source: unknown): boolean {
  if (typeof source !== 'string' || !source.trim() || isTransientImageSource(source)) return false
  const value = source.trim()
  if (/^\/(?!\/)/.test(value)) return true
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}

export function articleTags(value: unknown): string[] {
  let tags = value
  if (typeof value === 'string') {
    try { tags = JSON.parse(value) } catch { tags = value.split(',') }
  }
  return Array.isArray(tags) ? [...new Set(tags.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean))].slice(0, 30) : []
}
