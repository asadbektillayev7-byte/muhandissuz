import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'

export default async function AdminQuizPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('quiz_questions')
    .select('*, categories(name_uz, name_en)')
    .order('category_id')
    .order('sort_order')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz Questions</h1>
        <Link href="/admin/quiz/new" className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90" style={{ borderRadius: 'var(--radius)' }}>+ New</Link>
      </div>
      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Question (UZ)</th>
              <th className="text-left p-3">Answers</th>
              <th className="text-left p-3">Image</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-3 text-muted-foreground">{item.categories?.name_uz || '—'}</td>
                <td className="p-3">{item.question_uz}</td>
                <td className="p-3 text-muted-foreground">
                  {Array.isArray(item.options_uz) ? item.options_uz.length : 0}
                </td>
                <td className="p-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-8 w-8 object-cover border border-border" style={{ borderRadius: 'var(--radius)' }} />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/quiz/${item.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                    <DeleteButton table="quiz_questions" id={item.id} redirect="/admin/quiz" />
                  </div>
                </td>
              </tr>
            ))}
            {!items?.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">
                  No questions yet. Click <span className="font-medium">+ New</span> to add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
