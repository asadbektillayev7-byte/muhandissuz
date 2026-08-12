import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '../ArticleForm'

export default async function NewArticlePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name_uz')
  const { data: authors } = await supabase.from('authors').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Article</h1>
      <div className="max-w-3xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <ArticleForm categories={categories || []} authors={authors || []} />
      </div>
    </div>
  )
}
