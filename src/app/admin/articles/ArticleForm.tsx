'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminSaveArticle, adminCheckSlug } from '@/lib/actions'
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
  meta_description_uz?: string
  meta_description_en?: string
  og_image_url?: string
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    'o‘': 'o', "o'": 'o', 'O‘': 'o', "O'": 'o', 'g‘': 'g', "g'": 'g',
    'G‘': 'g', "G'": 'g', 'sh': 'sh', 'Sh': 'sh', 'SH': 'sh',
    'ch': 'ch', 'Ch': 'ch', 'CH': 'ch', '‘': '', "'": '',
  }
  let s = text.toLowerCase()
  for (const [k, v] of Object.entries(map)) {
    s = s.replaceAll(k, v)
  }
  return s
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [form, setForm] = useState({
    title_uz: article?.title_uz || '',
    title_en: article?.title_en || '',
    slug: article?.slug || '',
    category_id: article?.category_id || null,
    excerpt_uz: article?.excerpt_uz || '',
    excerpt_en: article?.excerpt_en || '',
    cover_image_url: article?.cover_image_url || '',
    meta_description_uz: article?.meta_description_uz || '',
    meta_description_en: article?.meta_description_en || '',
    og_image_url: article?.og_image_url || '',
    original_language: article?.original_language || 'uz',
    author_id: article?.author_id || null,
    translator_id: article?.translator_id || null,
    published_date: article?.published_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    published: article?.published ?? true,
  })
  const [bodyUz, setBodyUz] = useState<any>(article?.body_uz || null)
  const [bodyEn, setBodyEn] = useState<any>(article?.body_en || null)

  const handleChange = useCallback((field: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title_uz' && !slugManuallyEdited && value) {
        const slug = slugify(value)
        if (slug) next.slug = slug
      }
      return next
    })
  }, [slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setForm(prev => ({ ...prev, slug: value }))
  }, [])

  const getEmptyBilingual = useCallback((): string[] => {
    const warnings: string[] = []
    if (!!form.title_uz?.trim() !== !!form.title_en?.trim()) {
      if (!form.title_uz?.trim()) warnings.push('Title (UZ)')
      if (!form.title_en?.trim()) warnings.push('Title (EN)')
    }
    if (!!form.excerpt_uz?.trim() !== !!form.excerpt_en?.trim()) {
      if (!form.excerpt_uz?.trim()) warnings.push('Excerpt (UZ)')
      if (!form.excerpt_en?.trim()) warnings.push('Excerpt (EN)')
    }
    const hasBodyUz = bodyUz?.content?.length > 0
    const hasBodyEn = bodyEn?.content?.length > 0
    if (hasBodyUz !== hasBodyEn) {
      if (!hasBodyUz) warnings.push('Body (UZ)')
      if (!hasBodyEn) warnings.push('Body (EN)')
    }
    return warnings
  }, [form, bodyUz, bodyEn])

  const handleSave = async () => {
    setError('')

    const empty = getEmptyBilingual()
    if (empty.length > 0) {
      if (!confirm(`Warning: missing translations for: ${empty.join(', ')}. Save anyway?`)) return
    }

    if (slugManuallyEdited && form.slug) {
      const exists = await adminCheckSlug(form.slug, 'articles', article?.id)
      if (exists) {
        if (!confirm(`Slug "${form.slug}" already exists. Save anyway?`)) return
      }
    }

    setSaving(true)
    try {
      await adminSaveArticle(
        {
          ...form,
          body_uz: bodyUz,
          body_en: bodyEn,
          published_date: new Date(form.published_date).toISOString(),
          tags: [],
        },
        article?.id,
      )
      router.push('/admin/articles')
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Save failed')
      setSaving(false)
    }
  }

  const emptyBilingual = getEmptyBilingual()

  return (
    <div className="space-y-4">
      {emptyBilingual.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded">
          ⚠ Missing translations: {emptyBilingual.join(', ')}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded">
          {error}
        </div>
      )}

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
          <div className="flex gap-2">
            <input
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
              required
            />
            {!slugManuallyEdited && form.title_uz && (
              <button
                type="button"
                onClick={() => setSlugManuallyEdited(true)}
                className="text-xs text-chart-2 hover:underline shrink-0 self-center"
              >
                Edit
              </button>
            )}
            {slugManuallyEdited && (
              <button
                type="button"
                onClick={() => {
                  setSlugManuallyEdited(false)
                  handleChange('title_uz', form.title_uz)
                }}
                className="text-xs text-chart-2 hover:underline shrink-0 self-center"
              >
                Auto
              </button>
            )}
          </div>
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

      <hr className="border-border" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description (UZ){" "}
            <span className="text-muted-foreground">(SEO)</span>
          </label>
          <textarea
            value={form.meta_description_uz}
            onChange={(e) => handleChange('meta_description_uz', e.target.value)}
            rows={2}
            maxLength={160}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 resize-none"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description (EN){" "}
            <span className="text-muted-foreground">(SEO)</span>
          </label>
          <textarea
            value={form.meta_description_en}
            onChange={(e) => handleChange('meta_description_en', e.target.value)}
            rows={2}
            maxLength={160}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 resize-none"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">OG Image URL{" "}
          <span className="text-muted-foreground">(social sharing)</span>
        </label>
        <input
          value={form.og_image_url}
          onChange={(e) => handleChange('og_image_url', e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder="https://..."
        />
      </div>

      <hr className="border-border" />

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
        {!form.published && article?.id && (
          <a
            href={`/${form.original_language}/articles/${form.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-chart-2 hover:underline"
          >
            Preview draft
          </a>
        )}
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
