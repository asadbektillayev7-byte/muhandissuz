'use client'

import { useEffect, useState } from 'react'
import { field } from '@/lib/supabase/locale'
import { ArticleCard } from './ArticleCard'

/**
 * Category filtering in the browser.
 *
 * It used to be a server round-trip per chip: each category was a <Link> to
 * ?category=…, which re-queried the database and re-rendered the whole page.
 * That also made the route uncacheable, since reading searchParams forces
 * dynamic rendering.
 *
 * Every article is already on the page, so filtering is a local operation.
 * The URL is kept in sync with replaceState — deep links keep working and the
 * back button still leaves the page — but no navigation is triggered.
 */
export function ArticlesBrowser({
  articles,
  categories,
  locale,
  labels,
}: {
  articles: any[]
  categories: any[]
  locale: string
  labels: { all: string; noArticles: string }
}) {
  const [active, setActive] = useState<string | null>(null)

  // Read the initial category from the URL on mount rather than during
  // render, so the server output stays identical for every visitor.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category')
    if (fromUrl) setActive(fromUrl)
  }, [])

  function choose(slug: string | null) {
    setActive(slug)
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set('category', slug)
    else url.searchParams.delete('category')
    window.history.replaceState(null, '', url)
  }

  const shown = active
    ? articles.filter((a) => a.categories?.slug === active)
    : articles

  const chip = (isActive: boolean) =>
    'px-3 py-1.5 text-sm rounded-full border transition-colors ' +
    (isActive
      ? 'border-chart-2 text-chart-2 bg-muted'
      : 'border-transparent bg-muted text-muted-foreground hover:text-chart-2')

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button type="button" onClick={() => choose(null)} className={chip(!active)}>
            {labels.all}
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => choose(cat.slug)}
              className={chip(active === cat.slug)}
            >
              {field(cat, 'name', locale)}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 && <p className="text-muted-foreground">{labels.noArticles}</p>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((article: any) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </>
  )
}
