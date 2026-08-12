import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuizForm } from '../QuizForm'

export default async function EditQuizQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_uz, name_en')
    .order('name_uz')

  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Quiz Question</h1>
        <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <QuizForm categories={categories || []} />
        </div>
      </div>
    )
  }

  const { data: item } = await supabase.from('quiz_questions').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Quiz Question</h1>
      <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <QuizForm categories={categories || []} item={item} />
      </div>
    </div>
  )
}
