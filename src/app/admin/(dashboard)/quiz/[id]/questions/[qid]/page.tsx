import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { QuestionForm } from '../../../QuestionForm'

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>
}) {
  const { id, qid } = await params
  const supabase = await createClient()

  const { data: quiz } = await supabase.from('quizzes').select('id, title_uz').eq('id', id).single()
  if (!quiz) notFound()

  const isNew = qid === 'new'
  let item: any = undefined

  if (!isNew) {
    const { data } = await supabase.from('quiz_questions').select('*').eq('id', qid).single()
    if (!data) notFound()
    item = data
  }

  return (
    <div>
      <Link href={`/admin/quiz/${id}`} className="text-chart-2 hover:underline text-sm">
        ← {quiz.title_uz}
      </Link>
      <h1 className="text-2xl font-bold mb-6 mt-2">
        {isNew ? 'New Question' : 'Edit Question'}
      </h1>
      <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <QuestionForm quizId={Number(id)} item={item} />
      </div>
    </div>
  )
}
