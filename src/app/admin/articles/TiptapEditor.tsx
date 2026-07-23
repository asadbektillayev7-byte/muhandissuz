'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import { useEffect } from 'react'

export function TiptapEditor({ content, onChange }: { content: any; onChange: (json: any) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(json)
    },
  })

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
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-border bg-muted/30">
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
        ].map((btn) => (
          <button
            key={btn.title}
            type="button"
            onClick={btn.action}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              btn.active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
}
