import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'
import { articleStatus, toTashkentInput } from '@/lib/article-form'

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title_uz, title_en, slug, published, published_date')
    .order('published_date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          style={{ borderRadius: 'var(--radius)' }}
        >
          + New Article
        </Link>
      </div>

      <div className="border border-border overflow-x-auto" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium">Title (UZ)</th>
              <th className="text-left p-3 font-medium">Title (EN)</th>
              <th className="text-left p-3 font-medium">Slug</th>
              <th className="text-left p-3 font-medium">Holat / Visibility</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">No articles yet.</td>
              </tr>
            )}
            {articles?.map((article) => (
              <tr key={article.id} className="border-b border-border">
                <td className="p-3">{article.title_uz}</td>
                <td className="p-3">{article.title_en}</td>
                <td className="p-3 text-muted-foreground">{article.slug}</td>
                <td className="p-3">
                  {articleStatus(article) === 'draft' ? 'Qoralama / Draft' : articleStatus(article) === 'scheduled' ? `Rejalashtirilgan / Scheduled: ${toTashkentInput(article.published_date).replace('T', ' ')} (UTC+5)` : 'Nashr etilgan / Published'}
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(article.published_date).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {articleStatus(article) === 'published' && <a href={`/uz/articles/${encodeURIComponent(article.slug)}`} target="_blank" rel="noopener noreferrer" className="text-chart-2 hover:underline text-xs whitespace-nowrap">Saytda ko'rish / View on site</a>}
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-chart-2 hover:underline text-xs"
                    >
                      Edit
                    </Link>
                    <DeleteButton table="articles" id={article.id} redirect="/admin/articles" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
