'use client'

import { Node, mergeAttributes, type Extensions } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { TableKit } from '@tiptap/extension-table'
import { parseArticleEmbed, normalizeArticleLink } from '@/lib/article-editor-paste'
import styles from './TiptapEditor.module.css'

export type ImageHandlers = { retry: (id: string) => void; replace: (id: string, file: File) => void }

function ImageView({ node, selected, updateAttributes, deleteNode, extension }: ReactNodeViewProps) {
  const attrs = node.attrs
  const busy = attrs.uploadState === 'pending'
  const failed = attrs.uploadState === 'error' || !attrs.src
  const id = String(attrs.uploadId || attrs.imageId || '')
  const handlers = extension.options.handlers as ImageHandlers
  return <NodeViewWrapper className={`${styles.imageNode} ${selected ? styles.imageSelected : ''}`} data-align={attrs.align || 'center'} contentEditable={false}>
    <figure style={{ width: `${attrs.align === 'full' ? 100 : Math.min(100, Math.max(25, Number(attrs.displayWidth) || 100))}%` }}>
      {attrs.src && <img src={attrs.src} alt={attrs.alt || ''} width={attrs.width || 1600} height={attrs.height || 900} loading="lazy" draggable="false" />}
      {busy && <div className={styles.uploadPlaceholder} role="status"><span>Rasm yuklanmoqda / Uploading image — {attrs.progress || 0}%</span><progress max="100" value={attrs.progress || 0} /></div>}
      {!busy && failed && <div className={styles.uploadPlaceholder} role="alert"><p>{attrs.error || "Rasmni qayta tanlang. / Select the image again to recover this upload."}</p><button type="button" onClick={() => handlers.retry(id)}>Qayta urinish / Retry</button></div>}
      {attrs.caption && <figcaption>{attrs.caption}</figcaption>}
    </figure>
    {!busy && !attrs.alt?.trim() && <p className={styles.altWarning}>Rasm tavsifi kerak / Add alt text for accessibility.</p>}
    <details className={styles.imageSettings} open={selected || failed}>
      <summary>Rasm sozlamalari / Image settings</summary>
      <div className={styles.imageFields}>
        <label>Rasm tavsifi / Alt text<input aria-label="Rasm tavsifi / Alt text" value={attrs.alt || ''} onChange={event => updateAttributes({ alt: event.target.value })} /></label>
        <label>Izoh / Caption<input aria-label="Izoh / Caption" value={attrs.caption || ''} onChange={event => updateAttributes({ caption: event.target.value })} /></label>
        <label>Joylashuv / Alignment<select value={attrs.align || 'center'} onChange={event => updateAttributes({ align: event.target.value })}><option value="left">Chap / Left</option><option value="center">Markaz / Center</option><option value="full">To'liq / Full width</option></select></label>
        <label>O'lcham / Width — {attrs.displayWidth || 100}%<input type="range" min="25" max="100" step="5" disabled={attrs.align === 'full'} value={attrs.displayWidth || 100} onChange={event => updateAttributes({ displayWidth: Number(event.target.value) })} /></label>
      </div>
      <div className={styles.row}><label className={styles.fileButton}>Almashtirish / Replace<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) handlers.replace(id, file); event.target.value = '' }} /></label><button type="button" onClick={deleteNode}>O'chirish / Delete</button></div>
    </details>
  </NodeViewWrapper>
}

const ArticleImage = Node.create<{ handlers: ImageHandlers }>({
  name: 'image', group: 'block', atom: true, draggable: true,
  addOptions() { return { handlers: { retry: () => {}, replace: () => {} } } },
  addAttributes() {
    return {
      src: { default: '' }, alt: { default: '' }, caption: { default: '' },
      align: { default: 'center' }, width: { default: null }, height: { default: null }, displayWidth: { default: 100 },
      imageId: { default: null, rendered: false }, uploadId: { default: null, rendered: false },
      uploadState: { default: null, rendered: false }, progress: { default: 0, rendered: false }, error: { default: '', rendered: false },
    }
  },
  parseHTML() {
    const read = (element: HTMLElement, wrapper?: HTMLElement) => {
      const uploadId = element.getAttribute('data-upload-id')
      const width = Number(element.getAttribute('width')) || null
      const height = Number(element.getAttribute('height')) || null
      const caption = wrapper?.querySelector('figcaption')?.textContent || element.getAttribute('data-caption') || ''
      return { src: element.getAttribute('src') || '', alt: element.getAttribute('alt') || '', width, height, caption, align: wrapper?.getAttribute('data-align') || element.getAttribute('data-align') || 'center', displayWidth: Number(wrapper?.getAttribute('data-width') || element.getAttribute('data-width') || wrapper?.style.width.replace('%', '')) || 100, uploadId, uploadState: uploadId ? 'pending' : null }
    }
    return [
      { tag: 'figure', priority: 80, getAttrs: element => { const img = (element as HTMLElement).querySelector('img'); return img ? read(img, element as HTMLElement) : false } },
      { tag: 'img', getAttrs: element => read(element as HTMLElement) },
    ]
  },
  renderHTML({ node }) {
    const attrs = node.attrs
    if (!attrs.src) return ['div', { 'data-upload-id': attrs.uploadId || '' }, 'Rasm yuklanmagan / Image upload incomplete']
    const img = ['img', { src: attrs.src, alt: attrs.alt || '', ...(attrs.width ? { width: attrs.width } : {}), ...(attrs.height ? { height: attrs.height } : {}), loading: 'lazy' }]
    return ['figure', { 'data-align': attrs.align, 'data-width': attrs.displayWidth }, img, ...(attrs.caption ? [['figcaption', {}, attrs.caption]] : [])] as never
  },
  addNodeView() { return ReactNodeViewRenderer(ImageView) },
})

const PullQuote = Node.create({
  name: 'pullQuote', group: 'block', content: 'block+', defining: true,
  parseHTML() { return [{ tag: 'blockquote[data-pull-quote]', priority: 80 }] },
  renderHTML({ HTMLAttributes }) { return ['blockquote', mergeAttributes(HTMLAttributes, { 'data-pull-quote': 'true' }), 0] },
})
const VideoEmbed = Node.create({
  name: 'videoEmbed', group: 'block', atom: true, draggable: true,
  addAttributes() { return { src: { default: '' }, title: { default: 'Video' }, provider: { default: '' } } },
  parseHTML() { return [{ tag: 'iframe', getAttrs: element => parseArticleEmbed((element as HTMLElement).getAttribute('src') || '') || false }] },
  renderHTML({ node }) {
    const embed = parseArticleEmbed(node.attrs.src)
    if (!embed) return ['p', {}, 'Video manzili yaroqsiz / Invalid embed URL']
    return ['div', { class: 'article-embed', 'data-provider': embed.provider }, ['iframe', { src: embed.src, title: node.attrs.title || embed.title, allowfullscreen: 'true', loading: 'lazy', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', referrerpolicy: 'strict-origin-when-cross-origin' }]]
  },
})

export function createArticleEditorExtensions(handlers: ImageHandlers): Extensions {
  return [
    StarterKit.configure({ link: false, underline: false }),
    Underline, Superscript, Subscript,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https', isAllowedUri: value => !!normalizeArticleLink(value), HTMLAttributes: { rel: 'noopener noreferrer', target: null } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TableKit.configure({ table: { resizable: true } }),
    ArticleImage.configure({ handlers }), PullQuote, VideoEmbed,
  ]
}
