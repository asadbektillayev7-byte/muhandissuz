import sanitizeHtml from 'sanitize-html'

/** The public renderer accepts both the current TipTap document and earlier
 * HTML, array and Lexical/Payload documents. No stored content is rewritten. */
type Node = Record<string, any>
const text = (value: unknown) => typeof value === 'string' ? value : ''
const escape = (value: unknown) => text(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const positive = (value: unknown, fallback: number) => Number.isFinite(Number(value)) && Number(value) > 0 ? Math.min(Math.round(Number(value)), 10000) : fallback

export function safeArticleEmbedUrl(input: unknown): string | null {
  try {
    const url = new URL(text(input))
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (['www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname)) {
      const match = url.pathname.match(/^\/embed\/([\w-]{11})$/)
      return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null
    }
    if (url.hostname === 'drive.google.com') {
      const match = url.pathname.match(/^\/file\/d\/([\w-]{10,200})\/preview$/)
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null
    }
    if (url.hostname === 't.me') {
      const match = url.pathname.match(/^\/([A-Za-z][A-Za-z0-9_]{3,31})\/(\d+)$/)
      return match ? `https://t.me/${match[1]}/${match[2]}?embed=1` : null
    }
  } catch { /* Unsupported or malformed embeds are omitted. */ }
  return null
}

export function safeArticleLink(input: unknown): string | null {
  const value = text(input).trim()
  if (/^\/(?!\/)/.test(value) || /^#[\w-]*$/.test(value)) return value
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

function safeImage(input: unknown, editor: boolean): string | null {
  const value = text(input).trim()
  if (editor && (/^data:image\/(?:png|jpe?g|webp|gif|avif|bmp);base64,[a-z\d+/=\s]+$/i.test(value) || /^blob:https?:\/\//.test(value))) return value
  if (/^\/(?!\/)/.test(value)) return value
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

function tableWidths(attrs: Node): string {
  const widths = Array.isArray(attrs.colwidth) ? attrs.colwidth.filter((value:unknown) => Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= 10000) : []
  return widths.length ? ` colwidth="${widths.join(',')}"` : ''
}

function alignment(attrs: Node): string {
  const align = attrs.textAlign
  return ['left', 'center', 'right', 'justify'].includes(align) ? ` style="text-align:${align}"` : ''
}

function serializeNode(input: unknown, depth = 0): string {
  if (depth > 100) throw new Error('Article document is nested too deeply')
  if (!input || typeof input !== 'object') return typeof input === 'string' ? escape(input) : ''
  const node = input as Node
  const attrs = node.attrs && typeof node.attrs === 'object' ? node.attrs : {}
  const children = Array.isArray(node.content) ? node.content : Array.isArray(node.children) ? node.children : []
  const inner = children.map(child => serializeNode(child, depth + 1)).join('')
  const block = (tag: string, extra = '') => `<${tag}${extra}>${inner}</${tag}>`
  switch (node.type) {
    case 'root': case 'doc': return inner
    case 'text': {
      let result = escape(node.text)
      const marks: Node[] = Array.isArray(node.marks) ? [...node.marks] : []
      // Old Lexical documents use a bit mask instead of a marks array.
      if (typeof node.format === 'number') {
        for (const [flag, type] of [[1,'bold'],[2,'italic'],[4,'strike'],[8,'underline'],[16,'code'],[32,'subscript'],[64,'superscript']] as const) {
          if (node.format & flag) marks.push({ type })
        }
      }
      for (const mark of marks) {
        const tag = ({ bold:'strong', italic:'em', underline:'u', strike:'s', code:'code', subscript:'sub', superscript:'sup' } as Record<string,string>)[mark?.type]
        if (tag) result = `<${tag}>${result}</${tag}>`
        if (mark?.type === 'link') {
          const href = safeArticleLink(mark.attrs?.href)
          if (href) result = `<a href="${escape(href)}"${mark.attrs?.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${result}</a>`
        }
      }
      return result
    }
    case 'paragraph': return block('p', alignment(attrs))
    case 'heading': {
      const level = positive(attrs.level || text(node.tag).replace('h', '') || node.tag, 2)
      return block(`h${Math.max(2, Math.min(4, level))}`, alignment(attrs))
    }
    case 'bulletList': return block('ul')
    case 'orderedList': return block('ol', ` start="${positive(attrs.start, 1)}"`)
    case 'list': return block(node.listType === 'number' || node.listType === 'ordered' ? 'ol' : 'ul')
    case 'listItem': case 'listitem': return block('li')
    case 'blockquote': case 'quote': return block('blockquote')
    case 'pullQuote': return block('blockquote', ' data-pull-quote="true"')
    case 'codeBlock': case 'code': return `<pre><code>${inner || escape(node.text)}</code></pre>`
    case 'hardBreak': case 'linebreak': return '<br>'
    case 'horizontalRule': case 'horizontalrule': return '<hr>'
    case 'image': case 'upload': {
      const src = attrs.src || node.src || node.url || node.value?.url
      const alt = attrs.alt || node.alt || node.value?.alt || ''
      const caption = attrs.caption || attrs.title || node.caption || node.title || ''
      const align = ['left', 'center', 'full'].includes(attrs.align) ? attrs.align : 'full'
      const displayWidth = Math.max(25, Math.min(100, Number(attrs.displayWidth) || 100))
      return `<figure data-align="${align}" style="width:${displayWidth}%"><img src="${escape(src)}" alt="${escape(alt)}" width="${positive(attrs.width || node.width || node.value?.width, 1600)}" height="${positive(attrs.height || node.height || node.value?.height, 900)}" loading="lazy" decoding="async">${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`
    }
    case 'videoEmbed': {
      const src = safeArticleEmbedUrl(attrs.src)
      return src ? `<div class="article-embed"><iframe src="${escape(src)}" title="${escape(attrs.title || 'Video')}" loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen="true" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>` : ''
    }
    case 'table': return block('table')
    case 'tableRow': case 'tablerow': return block('tr')
    case 'tableCell': case 'tablecell': return block('td', ` colspan="${positive(attrs.colspan || node.colSpan, 1)}" rowspan="${positive(attrs.rowspan || node.rowSpan, 1)}"${tableWidths(attrs)}`)
    case 'tableHeader': return block('th', ` colspan="${positive(attrs.colspan, 1)}" rowspan="${positive(attrs.rowspan, 1)}"${tableWidths(attrs)}`)
    case 'link': case 'autolink': {
      const href = safeArticleLink(attrs.href || node.href || node.url || node.fields?.url)
      return href ? block('a', ` href="${escape(href)}"${attrs.target === '_blank' || node.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}`) : inner
    }
    default: return inner || escape(node.text)
  }
}

function bodyMarkup(body: unknown): string {
  if (body == null) return ''
  if (typeof body === 'string') {
    const trimmed = body.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { return bodyMarkup(JSON.parse(trimmed)) } catch { /* Plain text that starts with a bracket. */ }
    }
    return /<\/?[a-z][\s\S]*>/i.test(trimmed) ? body : `<p>${escape(body).replace(/\n/g, '<br>')}</p>`
  }
  if (Array.isArray(body)) return body.map(node => serializeNode(node)).join('')
  if (typeof body === 'object') {
    const record = body as Node
    if (typeof record.html === 'string') return record.html
    if (record.root) return serializeNode(record.root)
    return serializeNode(record)
  }
  return ''
}

function sanitizeBody(body: unknown, editor: boolean): string {
  return sanitizeHtml(bodyMarkup(body), {
    allowedTags: ['p','br','h2','h3','h4','strong','b','em','i','u','s','strike','del','code','pre','sup','sub','ul','ol','li','blockquote','hr','a','figure','figcaption','img','table','thead','tbody','tfoot','tr','th','td','iframe','div'],
    allowedAttributes: {
      p:['style'], h2:['style'], h3:['style'], h4:['style'],
      a:['href','target','rel','title'], ol:['start'],
      figure:['data-align','style'], img:['src','alt','title','width','height','loading','decoding'],
      blockquote:['data-pull-quote'], th:['colspan','rowspan','colwidth'], td:['colspan','rowspan','colwidth'],
      iframe:['src','title','loading','allow','allowfullscreen','referrerpolicy'], div:['class'],
    },
    allowedClasses: { div:['article-embed'] },
    allowedStyles: {
      p: { 'text-align': [/^(left|center|right|justify)$/] },
      h2: { 'text-align': [/^(left|center|right|justify)$/] },
      h3: { 'text-align': [/^(left|center|right|justify)$/] },
      h4: { 'text-align': [/^(left|center|right|justify)$/] },
      figure: { width: [/^(?:[2-9]\d|100)%$/] },
    },
    allowedSchemes: ['http','https','mailto','tel'],
    allowedSchemesByTag: editor ? { img:['http','https','data','blob'] } : { img:['http','https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1:'h2', h5:'h4', h6:'h4', b:'strong', i:'em', strike:'s', del:'s',
      a: (_tag, attrs) => {
        const href = safeArticleLink(attrs.href)
        return { tagName:'a', attribs:{ ...(href ? { href } : {}), ...(attrs.target === '_blank' ? { target:'_blank', rel:'noopener noreferrer' } : {}) } }
      },
      img: (_tag, attrs) => {
        const src = safeImage(attrs.src, editor)
        return { tagName:'img', attribs:{ ...(src ? { src } : {}), alt:attrs.alt || '', width:String(positive(attrs.width, 1600)), height:String(positive(attrs.height, 900)), loading:'lazy', decoding:'async' } }
      },
      iframe: (_tag, attrs) => {
        const src = safeArticleEmbedUrl(attrs.src)
        return { tagName:'iframe', attribs:{ ...(src ? { src } : {}), title:attrs.title || 'Video', loading:'lazy', allow:'fullscreen; encrypted-media; picture-in-picture', allowfullscreen:'true', referrerpolicy:'strict-origin-when-cross-origin' } }
      },
    },
    exclusiveFilter: frame => (frame.tag === 'iframe' || frame.tag === 'img') && !frame.attribs.src,
  })
}

export function articleBodyToHtml(body: unknown): string { return sanitizeBody(body, false) }

/** Only for the admin editor's legacy import. Pending data/blob images must be
 * imported through the upload queue before saving; never use this in public. */
export function articleBodyToEditorHtml(body: unknown): string { return sanitizeBody(body, true) }

export function hasArticleBody(body: unknown): boolean {
  const html = articleBodyToHtml(body)
  return /<(img|iframe)\b/.test(html) || sanitizeHtml(html, { allowedTags:[], allowedAttributes:{} }).replace(/&nbsp;|\s/g, '').length > 0
}

export function localizedArticle(article: Record<string, any>, locale: string) {
  const requested = ['uz','en','ru'].includes(locale) ? locale : 'uz'
  const requestedComplete = Boolean(text(article[`title_${requested}`]).trim()) && hasArticleBody(article[`body_${requested}`])
  const fallbackLocale = text(article.title_uz).trim() ? 'uz' : text(article.title_en).trim() ? 'en' : 'ru'
  const contentLocale = requestedComplete ? requested : fallbackLocale
  const pick = (name: string) => article[`${name}_${contentLocale}`] || article[`${name}_uz`] || article[`${name}_en`] || ''
  return {
    title:text(pick('title')), body:article[`body_${contentLocale}`] ?? article.body_uz ?? article.body_en,
    excerpt:text(pick('excerpt')), metaDescription:text(pick('meta_description')),
    contentLocale, isFallback:requested !== contentLocale,
  }
}
