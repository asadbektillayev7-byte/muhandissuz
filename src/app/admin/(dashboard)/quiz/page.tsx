import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'
import { DIFFICULTY_LABELS, type Difficulty } from '@/lib/quiz'

export default async function AdminQuizzesPage() {
  const supabase = await createClient()
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, categories(name_uz), quiz_questions(count), quiz_articles(count)')
    .order('created_at', { ascending: false })

  const count = (v: any) => (Array.isArray(v) && v[0]?.count) || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link href="/admin/quiz/new" className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90" style={{ borderRadius: 'var(--radius)' }}>+ New</Link>
      </div>

      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Difficulty</th>
              <th className="text-left p-3">Questions</th>
              <th className="text-left p-3">Articles</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes?.map((q: any) => (
              <tr key={q.id} className="border-b border-border">
                <td className="p-3">
                  {q.title_uz}
                  {q.featured && (
                    <span className="ml-2 border border-chart-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-chart-2" style={{ borderRadius: 999 }}>
                      Featured
                    </span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{q.categories?.name_uz || '—'}</td>
                <td className="p-3 text-muted-foreground">
                  {DIFFICULTY_LABELS[q.difficulty as Difficulty]?.en ?? q.difficulty}
                </td>
                <td className="p-3 text-muted-foreground">{count(q.quiz_questions)}</td>
                <td className="p-3 text-muted-foreground">{count(q.quiz_articles)}</td>
                <td className="p-3 text-muted-foreground">{q.published ? 'Published' : 'Draft'}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/quiz/${q.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                    <DeleteButton table="quizzes" id={q.id} redirect="/admin/quiz" />
                  </div>
                </td>
              </tr>
            ))}
            {!quizzes?.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground text-sm">
                  No quizzes yet. Click <span className="font-medium">+ New</span> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
