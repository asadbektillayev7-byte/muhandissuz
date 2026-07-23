'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TiptapEditor } from './TiptapEditor'

type Article = {
  id?: number
  title_uz?: string
  title_en?: string
  slug?: string
  category_id?: number | null
  body_uz?: any
  body_en?: any
  excerpt_uz?: string
  excerpt_en?: string
  cover_image_url?: string
  original_language?: string
  author_id?: number | null
  translator_id?: number | null
  published_date?: string
  tags?: any
  published?: boolean
}

export function ArticleForm({
  article,
  categories,
  authors,
}: {
  article?: Article
  categories: any[]
  authors: any[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title_uz: article?.title_uz || '',
    title_en: article?.title_en || '',
    slug: article?.slug || '',
    category_id: article?.category_id || null,
    excerpt_uz: article?.excerpt_uz || '',
    excerpt_en: article?.excerpt_en || '',
    cover_image_url: article?.cover_image_url || '',
    original_language: article?.original_language || 'uz',
    author_id: article?.author_id || null,
    translator_id: article?.translator_id || null,
    published_date: article?.published_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    published: article?.published ?? true,
  })
  const [bodyUz, setBodyUz] = useState<any>(article?.body_uz || null)
  const [bodyEn, setBodyEn] = useState<any>(article?.body_en || null)

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const data = {
      ...form,
      body_uz: bodyUz,
      body_en: bodyEn,
      published_date: new Date(form.published_date).toISOString(),
      tags: [],
    }

    if (article?.id) {
      await supabase.from('articles').update(data).eq('id', article.id)
    } else {
      await supabase.from('articles').insert(data)
    }

    setSaving(false)
    router.push('/admin/articles')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title (UZ)</label>
          <input
            value={form.title_uz}
            onChange={(e) => handleChange('title_uz', e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title (EN)</label>
          <input
            value={form.title_en}
            onChange={(e) => handleChange('title_en', e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={form.category_id || ''}
            onChange={(e) => handleChange('category_id', e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <option value="">None</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name_uz} / {cat.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt (UZ)</label>
          <textarea
            value={form.excerpt_uz}
            onChange={(e) => handleChange('excerpt_uz', e.target.value)}
            rows={3}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 resize-none"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt (EN)</label>
          <textarea
            value={form.excerpt_en}
            onChange={(e) => handleChange('excerpt_en', e.target.value)}
            rows={3}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 resize-none"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Image URL</label>
        <input
          value={form.cover_image_url}
          onChange={(e) => handleChange('cover_image_url', e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Body (UZ)</label>
        <TiptapEditor content={bodyUz} onChange={setBodyUz} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Body (EN)</label>
        <TiptapEditor content={bodyEn} onChange={setBodyEn} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Original Language</label>
          <select
            value={form.original_language}
            onChange={(e) => handleChange('original_language', e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <option value="uz">O'zbek</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <select
            value={form.author_id || ''}
            onChange={(e) => handleChange('author_id', e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <option value="">None</option>
            {authors.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Published Date</label>
          <input
            type="date"
            value={form.published_date}
            onChange={(e) => handleChange('published_date', e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => handleChange('published', e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push('/admin/articles')}
          className="border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {saving ? 'Saving...' : article?.id ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </div>
  )
}
