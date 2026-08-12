import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '../ArticleForm'
import { notFound } from 'next/navigation'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: article } = await supabase.from('articles').select('*').eq('id', id).single()
  if (!article) notFound()

  const { data: categories } = await supabase.from('categories').select('*').order('name_uz')
  const { data: authors } = await supabase.from('authors').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
      <div className="max-w-3xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <ArticleForm article={article} categories={categories || []} authors={authors || []} />
      </div>
    </div>
  )
}
