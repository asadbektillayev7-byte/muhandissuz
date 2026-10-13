'use client'

import { useEditor, EditorContent, useEditorState, type Editor } from '@tiptap/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createArticleEditorExtensions } from './article-editor-extensions'
import { prepareArticlePaste, pairArticlePasteImages, normalizeArticleLink, parseArticleEmbed, articleImageUploadState } from '@/lib/article-editor-paste'
import { uploadEditorImage } from '@/lib/article-editor-upload'
import { articleBodyToEditorHtml } from '@/lib/article-content'
import styles from './TiptapEditor.module.css'

export type EditorUploadState = { pending: number; failed: number }
type Props = { content: unknown; onChange: (json: unknown) => void; language?: 'uz' | 'en' | 'ru'; onUploadStateChange?: (state: EditorUploadState) => void }
type UploadJob = { id: string; source: File | string }
type GalleryImage = { url: string; name: string; altText?: string }
type SlashCommand = { label: string; keywords: string; run: (editor: Editor) => void }

const slashCommands: SlashCommand[] = [
  { label: 'Abzats / Paragraph', keywords: 'paragraph text abzats', run: editor => { editor.chain().focus().setParagraph().run() } },
  ...([2, 3, 4] as const).map(level => ({ label: `Sarlavha / Heading ${level}`, keywords: `heading h${level} sarlavha`, run: (editor: Editor) => { editor.chain().focus().setHeading({ level }).run() } })),
  { label: "Ro'yxat / Bullet list", keywords: 'bullet list royxat', run: editor => { editor.chain().focus().toggleBulletList().run() } },
  { label: "Raqamli ro'yxat / Numbered list", keywords: 'number list numbered', run: editor => { editor.chain().focus().toggleOrderedList().run() } },
  { label: 'Iqtibos / Blockquote', keywords: 'quote blockquote iqtibos', run: editor => { editor.chain().focus().toggleBlockquote().run() } },
  { label: 'Ajratilgan iqtibos / Pull quote', keywords: 'pull quote ajratilgan', run: editor => { editor.chain().focus().toggleWrap('pullQuote').run() } },
  { label: 'Jadval / Table', keywords: 'table jadval', run: editor => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() } },
  { label: 'Kod / Code block', keywords: 'code kod', run: editor => { editor.chain().focus().toggleCodeBlock().run() } },
  { label: 'Chiziq / Horizontal rule', keywords: 'horizontal rule divider chiziq', run: editor => { editor.chain().focus().setHorizontalRule().run() } },
]

function normalizedContent(content: unknown) {
  if (content && typeof content === 'object' && (content as { type?: string }).type === 'doc') return content
  return articleBodyToEditorHtml(content) || '<p></p>'
}

function findImage(editor: Editor, id: string): number | undefined {
  let result: number | undefined
  editor.state.doc.descendants((node, position) => {
    if (node.type.name === 'image' && (node.attrs.uploadId === id || node.attrs.imageId === id)) result = position
  })
  return result
}

export function TiptapEditor({ content, onChange, language = 'uz', onUploadStateChange }: Props) {
  const [panel, setPanel] = useState<'link' | 'embed' | 'find' | 'gallery' | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [galleryCursor, setGalleryCursor] = useState<number | null>(0)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [slashIndex, setSlashIndex] = useState(0)
  const [slashDismissed, setSlashDismissed] = useState(false)
  const imageInput = useRef<HTMLInputElement>(null)
  const callbacks = useRef({ onChange, onUploadStateChange })
  callbacks.current = { onChange, onUploadStateChange }
  const sources = useRef(new Map<string, File | string>())
  const queue = useRef<UploadJob[]>([])
  const active = useRef(new Map<string, AbortController>())
  const pump = useRef<() => void>(() => {})
  const enqueue = useRef<(jobs: UploadJob[]) => void>(() => {})
  const retry = useRef<(id: string) => void>(() => {})
  const replace = useRef<(id: string, file: File) => void>(() => {})
  const clipboard = useRef<(html: string, files: File[], text?: string, at?: number) => boolean>(() => false)
  const initialize = useRef<(editor: Editor) => void>(() => {})
  const shortcut = useRef<(event: KeyboardEvent) => boolean>(() => false)
  const lastUploadState = useRef('')
  const mounted = useRef(true)
  const pendingPanelSelection = useRef<{ from: number; to: number } | null>(null)
  const lastEmittedContent = useRef<unknown>(content)
  const suppressInternalUpdate = useRef(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createArticleEditorExtensions({ retry: id => retry.current(id), replace: (id, file) => replace.current(id, file) }),
    content: normalizedContent(content) as never,
    onCreate: ({ editor: instance }) => initialize.current(instance),
    onUpdate: ({ editor: instance }) => {
      if (suppressInternalUpdate.current) return
      const json = instance.getJSON()
      lastEmittedContent.current = json
      callbacks.current.onChange(json)
      const state = articleImageUploadState(json)
      const key = `${state.pending}:${state.failed}`
      if (key !== lastUploadState.current) { lastUploadState.current = key; callbacks.current.onUploadStateChange?.(state) }
      if (!/^\//.test(instance.state.selection.$from.parent.textContent)) setSlashDismissed(false)
    },
    editorProps: {
      attributes: { lang: language, spellcheck: 'true', 'aria-label': `Maqola matni / Article body (${language.toUpperCase()})` },
      handlePaste: (_view, event) => {
        const data = event.clipboardData
        if (!data) return false
        const files = Array.from(data.files).filter(file => file.type.startsWith('image/'))
        const handled = clipboard.current(data.getData('text/html'), files, data.getData('text/plain'))
        if (handled) event.preventDefault()
        return handled
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false
        const data = event.dataTransfer
        const files = Array.from(data.files).filter(file => file.type.startsWith('image/') || /\.(png|jpe?g|webp|avif|gif)$/i.test(file.name))
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        const handled = clipboard.current(data.getData('text/html'), files, data.getData('text/plain'), position)
        if (handled) event.preventDefault()
        return handled
      },
      handleKeyDown: (_view, event) => shortcut.current(event),
    },
  })
  const editorState = useEditorState({ editor, selector: ({ editor: instance }) => instance?.state })

  function patchImage(id: string, attrs: Record<string, unknown>) {
    if (!editor || editor.isDestroyed) return false
    const position = findImage(editor, id)
    if (position === undefined) return false
    const node = editor.state.doc.nodeAt(position)!
    editor.view.dispatch(editor.state.tr.setNodeMarkup(position, undefined, { ...node.attrs, ...attrs }).setMeta('addToHistory', false))
    return true
  }
  pump.current = () => {
    if (!editor || editor.isDestroyed || !mounted.current) return
    while (active.current.size < 3 && queue.current.length) {
      const job = queue.current.shift()!
      if (active.current.has(job.id) || findImage(editor, job.id) === undefined) continue
      const controller = new AbortController()
      active.current.set(job.id, controller)
      patchImage(job.id, { uploadState: 'pending', progress: 0, error: '' })
      void uploadEditorImage(job.source, progress => { patchImage(job.id, { progress }) }, controller.signal)
        .then(result => {
          patchImage(job.id, { src: result.url, width: result.width, height: result.height, imageId: job.id, uploadId: null, uploadState: null, progress: 100, error: '' })
          // Keep the source for this editing session: undo/redo can restore the
          // placeholder, and Retry must still work without losing the image.
        })
        .catch(error => {
          if (!controller.signal.aborted) patchImage(job.id, { uploadState: 'error', error: error instanceof Error ? error.message : "Rasm yuklanmadi. / Image upload failed." })
        })
        .finally(() => { active.current.delete(job.id); pump.current() })
    }
  }
  enqueue.current = jobs => {
    for (const job of jobs) {
      sources.current.set(job.id, job.source)
      if (!active.current.has(job.id) && !queue.current.some(queued => queued.id === job.id)) queue.current.push(job)
    }
    pump.current()
  }
  retry.current = id => {
    const source = sources.current.get(id)
    if (source) enqueue.current([{ id, source }])
    else patchImage(id, { uploadState: 'error', error: "Asl rasmni qayta tanlang (Almashtirish). / Use Replace to select the original image again." })
  }
  replace.current = (id, file) => {
    if (!editor) return
    const nextId = crypto.randomUUID()
    if (patchImage(id, { uploadId: nextId, imageId: nextId, uploadState: 'pending', error: '', progress: 0 })) enqueue.current([{ id: nextId, source: file }])
  }
  clipboard.current = (html, files, plain = '', at) => {
    if (!editor) return false
    setNotice('')
    if (typeof at === 'number') editor.commands.setTextSelection(at)
    if (html) {
      const prepared = prepareArticlePaste(html)
      const { jobs, remainingFiles } = pairArticlePasteImages(prepared.images, files)
      editor.chain().focus().insertContent(prepared.html || '<p></p>').run()
      if (jobs.length) enqueue.current(jobs)
      if (remainingFiles.length) insertFiles(remainingFiles)
      return true
    }
    if (files.length) { insertFiles(files); return true }
    const embed = parseArticleEmbed(plain)
    if (embed && editor.state.selection.empty) { editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: embed }).run(); return true }
    return false
  }
  function insertFiles(files: File[]) {
    if (!editor) return
    const jobs = files.map(source => ({ id: crypto.randomUUID(), source }))
    editor.chain().focus().insertContent(jobs.map(job => ({ type: 'image', attrs: { imageId: job.id, uploadId: job.id, uploadState: 'pending', alt: '', src: '' } }))).run()
    enqueue.current(jobs)
  }
  initialize.current = instance => {
    const jobs: UploadJob[] = []
    const transaction = instance.state.tr
    let hasMeaningfulChange = false
    instance.state.doc.descendants((node, position) => {
      if (node.type.name !== 'image') return
      const id = node.attrs.uploadId || node.attrs.imageId || crypto.randomUUID()
      const transientSource = /^(data:|blob:)/i.test(String(node.attrs.src || ''))
      if (transientSource) {
        hasMeaningfulChange = true
        jobs.push({ id, source: node.attrs.src })
        transaction.setNodeMarkup(position, undefined, { ...node.attrs, imageId: id, src: '', uploadId: id, uploadState: 'pending', progress: 0 })
      } else if ((node.attrs.uploadId || node.attrs.uploadState) && !sources.current.has(id)) {
        hasMeaningfulChange = true
        transaction.setNodeMarkup(position, undefined, { ...node.attrs, imageId: id, uploadState: 'error', error: "Uzilgan yuklash. Asl rasmni qayta tanlang. / Upload interrupted. Select the image again." })
      } else if (!node.attrs.imageId) transaction.setNodeMarkup(position, undefined, { ...node.attrs, imageId: id })
    })
    if (transaction.docChanged) {
      suppressInternalUpdate.current = !hasMeaningfulChange
      instance.view.dispatch(transaction.setMeta('addToHistory', false))
      suppressInternalUpdate.current = false
    }
    if (jobs.length) enqueue.current(jobs)
    const state = articleImageUploadState(instance.getJSON())
    lastUploadState.current = `${state.pending}:${state.failed}`
    callbacks.current.onUploadStateChange?.(state)
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      queue.current = []
      for (const controller of active.current.values()) controller.abort()
    }
  }, [])
  useEffect(() => {
    if (!editor || editor.isDestroyed || content === lastEmittedContent.current) return
    if (JSON.stringify(content) === JSON.stringify(editor.getJSON())) return
    // Form recovery is an explicit content change. Avoid resetting the selection
    // after each keystroke, or overwriting the document while imports are running.
    if (active.current.size || queue.current.length) return
    editor.commands.setContent(normalizedContent(content) as never, { emitUpdate: false })
    lastEmittedContent.current = content
    initialize.current(editor)
  }, [content, editor])
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    for (const [id, controller] of active.current) {
      if (findImage(editor, id) === undefined) controller.abort()
    }
    const restored: UploadJob[] = []
    editor.state.doc.descendants(node => {
      if (node.type.name !== 'image' || node.attrs.uploadState !== 'pending') return
      const id = String(node.attrs.uploadId || '')
      if (active.current.has(id) || queue.current.some(job => job.id === id)) return
      const source = sources.current.get(id)
      if (source) restored.push({ id, source })
    })
    if (restored.length) enqueue.current(restored)
  }, [editor, editorState])
  useEffect(() => {
    if (!fullscreen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', close)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close) }
  }, [fullscreen])

  const slashMatch = editor?.state.selection.empty && editor.state.selection.$from.parent.type.name === 'paragraph'
    ? /^\/([\w -]*)$/.exec(editor.state.selection.$from.parent.textBetween(0, editor.state.selection.$from.parentOffset)) : null
  const slashOptions = slashMatch && !slashDismissed ? slashCommands.filter(command => command.keywords.includes(slashMatch[1].toLowerCase())) : []
  const chooseSlash = (command: SlashCommand) => {
    if (!editor || !slashMatch) return
    editor.commands.deleteRange({ from: editor.state.selection.$from.start(), to: editor.state.selection.from })
    command.run(editor)
    setSlashIndex(0)
  }
  shortcut.current = event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); setPanel('find'); return true }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Enter') { event.preventDefault(); setFullscreen(value => !value); return true }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openLink(); return true }
    if (slashOptions.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { setSlashIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + slashOptions.length) % slashOptions.length); return true }
      if (event.key === 'Enter') { chooseSlash(slashOptions[slashIndex % slashOptions.length]); return true }
      if (event.key === 'Escape') { setSlashDismissed(true); return true }
    }
    return false
  }

  function openLink() {
    if (!editor) return
    pendingPanelSelection.current = { from: editor.state.selection.from, to: editor.state.selection.to }
    setLinkUrl(editor.getAttributes('link').href || '')
    setLinkNewTab(editor.getAttributes('link').target === '_blank')
    setNotice('')
    setPanel('link')
  }
  function saveLink() {
    if (!editor) return
    const href = normalizeArticleLink(linkUrl)
    if (!href) { setNotice('https://, http:// yoki mailto: manzilini kiriting. / Enter a valid https://, http:// or mailto: link.'); return }
    const selection = pendingPanelSelection.current || { from: editor.state.selection.from, to: editor.state.selection.to }
    const chain = editor.chain().focus().setTextSelection(selection)
    const attrs = { href, target: linkNewTab ? '_blank' : null, rel: 'noopener noreferrer' }
    if (selection.from === selection.to && !editor.isActive('link')) chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs }] }).run()
    else chain.extendMarkRange('link').setLink(attrs).run()
    setPanel(null)
  }
  function findMatches() {
    if (!editor || !findText) return []
    const query = caseSensitive ? findText : findText.toLocaleLowerCase()
    const matches: { from: number; to: number }[] = []
    editor.state.doc.descendants((node, position) => {
      if (!node.isTextblock) return
      const blockText = node.textBetween(0, node.content.size, '\n', '\uFFFC')
      const text = caseSensitive ? blockText : blockText.toLocaleLowerCase()
      let start = 0, index = 0
      while ((index = text.indexOf(query, start)) !== -1) { matches.push({ from: position + 1 + index, to: position + 1 + index + findText.length }); start = index + query.length }
      return false
    })
    return matches
  }
  function findNext() {
    if (!editor) return
    const matches = findMatches()
    if (!matches.length) { setNotice('Topilmadi / No matches'); return }
    const next = matches.find(match => match.from >= editor.state.selection.to) || matches[0]
    editor.chain().focus().setTextSelection(next).scrollIntoView().run()
    setNotice(`${matches.length} ta / ${matches.length} matches`)
  }
  function replaceMatches(all: boolean) {
    if (!editor || !findText) return
    const matches = findMatches()
    const selected = all ? matches : matches.filter(match => match.from === editor.state.selection.from && match.to === editor.state.selection.to).slice(0, 1)
    if (!selected.length) { findNext(); return }
    const transaction = editor.state.tr
    for (const match of selected.reverse()) {
      if (replaceText) transaction.insertText(replaceText, match.from, match.to)
      else transaction.delete(match.from, match.to)
    }
    editor.view.dispatch(transaction)
    setNotice(`${selected.length} ta almashtirildi / ${selected.length} replaced`)
  }
  const loadGallery = useCallback(async (cursor: number) => {
    setGalleryLoading(true)
    setNotice('')
    try {
      const response = await fetch(`/api/admin/article-images?cursor=${cursor}`, { credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Rasmlar ochilmadi / Could not load images')
      setGallery(previous => cursor === 0 ? data.images : [...previous, ...data.images])
      setGalleryCursor(data.nextCursor)
      if (data.warnings?.length) setNotice(data.warnings.join(' '))
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Rasmlar ochilmadi / Could not load images') }
    finally { setGalleryLoading(false) }
  }, [])
  if (!editor) return <div className={styles.editor}><p className={styles.content}>Muharrir yuklanmoqda / Loading editor…</p></div>

  const text = editor.getText()
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const buttons = [
    { label: '↶', title: 'Bekor qilish / Undo (Ctrl/⌘+Z)', active: false, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: '↷', title: 'Qaytarish / Redo (Ctrl/⌘+Shift+Z)', active: false, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
    { label: 'B', title: 'Qalin / Bold (Ctrl/⌘+B)', active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run() },
    { label: 'I', title: 'Kursiv / Italic (Ctrl/⌘+I)', active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run() },
    { label: 'U', title: 'Tagiga chizish / Underline (Ctrl/⌘+U)', active: editor.isActive('underline'), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: 'S̶', title: "Ustiga chizish / Strikethrough (Ctrl/⌘+Shift+S)", active: editor.isActive('strike'), run: () => editor.chain().focus().toggleStrike().run() },
    { label: '</>', title: 'Kod / Inline code (Ctrl/⌘+E)', active: editor.isActive('code'), run: () => editor.chain().focus().toggleCode().run() },
    { label: 'x²', title: 'Yuqori indeks / Superscript', active: editor.isActive('superscript'), run: () => editor.chain().focus().toggleSuperscript().run() },
    { label: 'x₂', title: 'Pastki indeks / Subscript', active: editor.isActive('subscript'), run: () => editor.chain().focus().toggleSubscript().run() },
    { label: 'Tx', title: 'Formatni tozalash / Clear formatting', active: false, run: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { label: '•', title: "Ro'yxat / Bullet list (Ctrl/⌘+Shift+8)", active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: '1.', title: "Raqamli ro'yxat / Numbered list (Ctrl/⌘+Shift+7)", active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: '❝', title: 'Iqtibos / Blockquote', active: editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: '❞', title: 'Ajratilgan iqtibos / Pull quote', active: editor.isActive('pullQuote'), run: () => editor.chain().focus().toggleWrap('pullQuote').run() },
    { label: '{ }', title: 'Kod bloki / Code block', active: editor.isActive('codeBlock'), run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: '―', title: 'Chiziq / Horizontal rule', active: false, run: () => editor.chain().focus().setHorizontalRule().run() },
  ]
  return <div className={`${styles.editor} ${fullscreen ? styles.fullscreen : ''}`}>
    <input ref={imageInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={event => { const files = Array.from(event.target.files || []); if (files.length) insertFiles(files); event.target.value = '' }} />
    <div className={styles.toolbar} role="toolbar" aria-label="Matn formatlash / Text formatting">
      {buttons.map(button => <button key={button.title} type="button" title={button.title} aria-label={button.title} aria-pressed={button.active} disabled={button.disabled} onClick={button.run}>{button.label}</button>)}
      <select aria-label="Matn turi / Text style" title="Matn turi / Text style" value={editor.isActive('heading') ? `h${editor.getAttributes('heading').level}` : 'p'} onChange={event => { const value = event.target.value; if (value === 'p') editor.chain().focus().setParagraph().run(); else editor.chain().focus().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run() }}><option value="p">Abzats / Paragraph</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option></select>
      <select aria-label="Matn joylashuvi / Text alignment" title="Matn joylashuvi / Text alignment" value={editor.getAttributes('paragraph').textAlign || editor.getAttributes('heading').textAlign || 'left'} onChange={event => editor.chain().focus().setTextAlign(event.target.value).run()}><option value="left">Chap / Left</option><option value="center">Markaz / Center</option><option value="right">O'ng / Right</option><option value="justify">Tekislash / Justify</option></select>
      <select aria-label="Jadval / Table" title="Jadval / Table" value="" onChange={event => {
        const command = event.target.value
        const chain = editor.chain().focus()
        if (command === 'insert') chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        else if (command === 'rowBefore') chain.addRowBefore().run()
        else if (command === 'rowAfter') chain.addRowAfter().run()
        else if (command === 'deleteRow') chain.deleteRow().run()
        else if (command === 'columnBefore') chain.addColumnBefore().run()
        else if (command === 'columnAfter') chain.addColumnAfter().run()
        else if (command === 'deleteColumn') chain.deleteColumn().run()
        else if (command === 'header') chain.toggleHeaderRow().run()
        else if (command === 'delete') chain.deleteTable().run()
      }}><option value="">Jadval / Table</option><option value="insert">Yangi jadval / Insert table</option><option value="rowBefore" disabled={!editor.isActive('table')}>Oldin qator / Row before</option><option value="rowAfter" disabled={!editor.isActive('table')}>Keyin qator / Row after</option><option value="deleteRow" disabled={!editor.isActive('table')}>Qatorni o'chirish / Delete row</option><option value="columnBefore" disabled={!editor.isActive('table')}>Oldin ustun / Column before</option><option value="columnAfter" disabled={!editor.isActive('table')}>Keyin ustun / Column after</option><option value="deleteColumn" disabled={!editor.isActive('table')}>Ustunni o'chirish / Delete column</option><option value="header" disabled={!editor.isActive('table')}>Sarlavha qatori / Header row</option><option value="delete" disabled={!editor.isActive('table')}>Jadvalni o'chirish / Delete table</option></select>
      <button type="button" title="Havola / Link (Ctrl/⌘+K)" aria-pressed={editor.isActive('link')} onClick={openLink}>Havola / Link</button>
      <button type="button" title="Rasm yuklash / Upload images" onClick={() => imageInput.current?.click()}>Rasm / Image</button>
      <button type="button" title="Yuklangan rasmlar / Uploaded images" onClick={() => { setPanel('gallery'); void loadGallery(0) }}>Media</button>
      <button type="button" title="YouTube, Telegram, Google Drive" onClick={() => { setPanel('embed'); setNotice('') }}>Video / Embed</button>
      <button type="button" title="Qidirish va almashtirish / Find and replace (Ctrl/⌘+F)" onClick={() => { setPanel('find'); setNotice('') }}>Qidirish / Find</button>
      <button type="button" title="To'liq ekran / Focus mode (Ctrl/⌘+Shift+Enter)" aria-pressed={fullscreen} onClick={() => setFullscreen(value => !value)}>{fullscreen ? 'Yopish / Exit focus' : '⛶ Focus'}</button>
    </div>
    {panel === 'link' && <div className={styles.panel}>
      <label>Havola / URL<input value={linkUrl} autoFocus placeholder="https://" onChange={event => setLinkUrl(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); saveLink() } }} /></label>
      <label><span><input type="checkbox" checked={linkNewTab} onChange={event => setLinkNewTab(event.target.checked)} /> Yangi oynada / New tab</span></label>
      <button type="button" onClick={saveLink}>Qo'llash / Apply</button><button type="button" onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setPanel(null) }}>O'chirish / Remove link</button><button type="button" onClick={() => setPanel(null)}>Yopish / Close</button>
      {notice && <p className={styles.error} role="status">{notice}</p>}
    </div>}
    {panel === 'embed' && <div className={styles.panel}>
      <label>YouTube / Telegram / Google Drive<input value={embedUrl} autoFocus placeholder="https://" onChange={event => setEmbedUrl(event.target.value)} /></label><button type="button" onClick={() => { const embed = parseArticleEmbed(embedUrl); if (!embed) { setNotice('YouTube, ochiq Telegram post yoki Google Drive video havolasini kiriting. / Enter a YouTube, public Telegram post or Google Drive video link.'); return }; editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: embed }).run(); setEmbedUrl(''); setPanel(null) }}>Qo'shish / Insert</button><button type="button" onClick={() => setPanel(null)}>Yopish / Close</button><p className="text-xs text-muted-foreground">Drive: “Anyone with the link”. Telegram: ochiq kanal / public channel.</p>{notice && <p className={styles.error} role="status">{notice}</p>}
    </div>}
    {panel === 'find' && <div className={styles.panel}>
      <label>Qidirish / Find<input value={findText} autoFocus onChange={event => setFindText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); findNext() } }} /></label><label>Almashtirish / Replace<input value={replaceText} onChange={event => setReplaceText(event.target.value)} /></label><label><span><input type="checkbox" checked={caseSensitive} onChange={event => setCaseSensitive(event.target.checked)} /> Aa</span></label><button type="button" onClick={findNext}>Keyingisi / Next</button><button type="button" onClick={() => replaceMatches(false)}>Almashtirish / Replace</button><button type="button" onClick={() => replaceMatches(true)}>Barchasi / Replace all</button><button type="button" onClick={() => setPanel(null)}>Yopish / Close</button>{notice && <p className="w-full text-xs" role="status">{notice}</p>}
    </div>}
    {panel === 'gallery' && <div className={styles.panel}>
      <span className="text-sm">Yuklangan rasmlar / Uploaded images</span><button type="button" onClick={() => setPanel(null)}>Yopish / Close</button>
      <div className={styles.gallery}>{gallery.map(image => <button type="button" key={image.url} title={image.name} onClick={() => { editor.chain().focus().insertContent({ type: 'image', attrs: { imageId: crypto.randomUUID(), src: image.url, alt: image.altText || '' } }).run(); setPanel(null) }}><img src={image.url} alt={image.altText || image.name} width="160" height="120" loading="lazy" /><span>{image.name}</span></button>)}</div>
      {galleryLoading ? <p role="status">Yuklanmoqda / Loading…</p> : galleryCursor !== null ? <button type="button" onClick={() => void loadGallery(galleryCursor)}>Ko'proq / Load more</button> : !gallery.length ? <p>Rasmlar topilmadi / No uploaded images yet.</p> : null}
      {notice && <p className={styles.error} role="status">{notice}</p>}
    </div>}
    {slashOptions.length > 0 && <div className={styles.slash} role="listbox" aria-label="Tezkor buyruqlar / Slash commands">{slashOptions.map((command, index) => <button type="button" role="option" aria-selected={index === slashIndex % slashOptions.length} key={command.label} onMouseDown={event => event.preventDefault()} onClick={() => chooseSlash(command)}>{command.label}</button>)}</div>}
    <EditorContent editor={editor} className={styles.content} />
    <div className={styles.footer}><span>{words} so'z / words</span><span>{text.length} belgi / characters</span><span>~{Math.max(1, Math.ceil(words / 200))} daqiqa / min</span><span>/ — tezkor buyruqlar / commands</span></div>
  </div>
}
