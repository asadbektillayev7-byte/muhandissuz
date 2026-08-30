import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import { field } from '@/lib/supabase/locale'

/** Three most recent published articles. Renders only what exists. */
export async function LatestArticles({ locale }: { locale: string }) {
  const supabase = createPublicClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title_uz, title_en, cover_image_url, categories(name_uz, name_en)')
    .eq('published', true)
    .order('published_date', { ascending: false })
    .limit(3)

  if (!articles?.length) return null

  const t =
    locale === 'uz'
      ? { title: 'So‘nggi maqolalar', all: 'Barchasi' }
      : { title: 'Latest articles', all: 'All' }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold">{t.title}</h2>
        <Link
          href={`/${locale}/articles`}
          className="text-sm text-muted-foreground transition-colors duration-150 hover:text-accent"
        >
          {t.all} →
        </Link>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article: any) => (
          <li key={article.id}>
            <Link
              href={`/${locale}/articles/${article.slug}`}
              className="group block overflow-hidden border transition-colors duration-150 hover:border-accent"
              style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                )}
              </div>

              <div className="p-4">
                {article.categories && (
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {field(article.categories, 'name', locale)}
                  </p>
                )}
                <h3 className="text-base font-semibold leading-snug">
                  {field(article, 'title', locale)}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
