'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { useEffect, useRef, useState } from 'react'
import sanitizeHtml from 'sanitize-html'
import { createClient } from '@/lib/supabase/client'
import {
  validateArticleImage,
  resizeAndConvertToWebp,
  uploadToArticleImagesBucket,
} from '@/lib/upload'

function sanitizeJson(nodes: any[]): any[] {
  if (!nodes) return nodes
  return nodes.map((node) => {
    if (node.type === 'text' && node.text) {
      return { ...node, text: sanitizeHtml(node.text, { allowedTags: [], allowedAttributes: {} }) }
    }
    if (node.type === 'image' && node.attrs?.src) {
      const url = String(node.attrs.src).toLowerCase()
      if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
        return { ...node, attrs: { ...node.attrs, src: '' } }
      }
    }
    if (node.href) {
      const url = String(node.href).toLowerCase()
      if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
        return { ...node, href: '' }
      }
    }
    if (node.content) {
      return { ...node, content: sanitizeJson(node.content) }
    }
    if (node.children) {
      return { ...node, children: sanitizeJson(node.children) }
    }
    return node
  })
}

export function TiptapEditor({ content, onChange }: { content: any; onChange: (json: any) => void }) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const uploadHandlerRef = useRef<(file: File, pos?: number) => Promise<void>>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      ImageExtension.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 border border-border',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const cleaned = sanitizeJson(json.content || [])
      onChange({ type: 'doc', content: cleaned })
    },
    editorProps: {
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              uploadHandlerRef.current?.(file)
              return true
            }
          }
        }
        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file && (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name))) {
            event.preventDefault()
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
            uploadHandlerRef.current?.(file, coordinates?.pos)
            return true
          }
        }
        return false
      },
    },
  })

  // Keep upload handler ref updated with latest editor instance
  uploadHandlerRef.current = async (file: File, pos?: number) => {
    setImageError('')
    const invalid = validateArticleImage(file)
    if (invalid) {
      setImageError(invalid)
      alert(invalid)
      return
    }

    setUploadingImage(true)
    try {
      const blob = await resizeAndConvertToWebp(file, 'cover')
      const supabase = createClient()
      const { url } = await uploadToArticleImagesBucket(supabase, blob, file.name)

      if (!editor) return

      if (typeof pos === 'number') {
        editor
          .chain()
          .focus()
          .insertContentAt(pos, { type: 'image', attrs: { src: url } })
          .run()
      } else {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload image'
      setImageError(msg)
      alert(msg)
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentJson = JSON.stringify(editor.getJSON())
      const newJson = JSON.stringify(content)
      if (currentJson !== newJson) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) return null

  const addLink = () => {
    const url = prompt('URL:')
    if (url) {
      const cleaned = url.toLowerCase()
      if (cleaned.startsWith('javascript:') || cleaned.startsWith('data:') || cleaned.startsWith('vbscript:')) {
        alert('Invalid URL')
        return
      }
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
      <input
        ref={imageInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadHandlerRef.current?.(file)
        }}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        {[
          { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
          { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
          { label: 'U', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Underline' },
          { label: 'S', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: 'Strike' },
          { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
          { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
          { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
          { label: '•', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
          { label: '1.', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered List' },
          { label: '“', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Blockquote' },
          { label: '⎯', action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: 'Horizontal Rule' },
          { label: '🔗', action: addLink, active: editor.isActive('link'), title: 'Link' },
          {
            label: '🖼 Image',
            action: () => imageInputRef.current?.click(),
            active: false,
            title: 'Insert Image (Click, paste from clipboard, or drag & drop)',
          },
        ].map((btn) => (
          <button
            key={btn.title}
            type="button"
            onClick={btn.action}
            disabled={uploadingImage && btn.label === '🖼 Image'}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              btn.active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            } disabled:opacity-50`}
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}

        {uploadingImage && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 px-2 py-1">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            Uploading image...
          </span>
        )}

        {imageError && (
          <span className="text-xs text-red-500 px-2 py-1 truncate max-w-xs" title={imageError}>
            {imageError}
          </span>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
}
