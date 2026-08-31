import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { QuizMetaForm } from '../QuizMetaForm'
import { DeleteButton } from '../../DeleteButton'
import { GenerateQuestions } from './GenerateQuestions'

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: categories }, { data: articles }] = await Promise.all([
    supabase.from('categories').select('id, name_uz, name_en').order('name_uz'),
    supabase.from('articles').select('id, title_uz').order('published_date', { ascending: false }),
  ])

  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Quiz</h1>
        <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <QuizMetaForm categories={categories || []} articles={articles || []} />
        </div>
        <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
          Save the quiz first, then add its questions.
        </p>
      </div>
    )
  }

  const [{ data: quiz }, { data: questions }, { data: links }] = await Promise.all([
    supabase.from('quizzes').select('*').eq('id', id).single(),
    supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('sort_order'),
    supabase.from('quiz_articles').select('article_id').eq('quiz_id', id),
  ])

  if (!quiz) notFound()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>
        <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <QuizMetaForm
            categories={categories || []}
            articles={articles || []}
            item={quiz}
            linkedArticleIds={(links || []).map((l: any) => l.article_id)}
          />
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Questions <span className="text-muted-foreground font-normal">({questions?.length ?? 0})</span>
          </h2>
          <Link
            href={`/admin/quiz/${id}/questions/new`}
            className="bg-foreground text-background px-3 py-1.5 text-xs hover:opacity-90"
            style={{ borderRadius: 'var(--radius)' }}
          >
            + Add question
          </Link>
        </div>

        <div className="mb-4">
          <GenerateQuestions quizId={Number(id)} articleCount={(links || []).length} />
        </div>

        <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
          <table className="w-full text-sm">
            <tbody>
              {questions?.map((q: any) => (
                <tr key={q.id} className="border-b border-border last:border-b-0">
                  <td className="p-3">{q.question_uz}</td>
                  <td className="p-3 text-muted-foreground w-24">
                    {Array.isArray(q.options_uz) ? q.options_uz.length : 0} answers
                  </td>
                  <td className="p-3 text-right w-32">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/quiz/${id}/questions/${q.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                      <DeleteButton table="quiz_questions" id={q.id} redirect={`/admin/quiz/${id}`} />
                    </div>
                  </td>
                </tr>
              ))}
              {!questions?.length && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground text-sm">
                    No questions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
