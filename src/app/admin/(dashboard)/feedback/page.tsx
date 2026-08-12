import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '../DeleteButton'

export default async function AdminFeedbackPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>

      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Message</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">No feedback yet.</td>
              </tr>
            )}
            {items?.map((item: any) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{item.message}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <DeleteButton table="feedback" id={item.id} redirect="/admin/feedback" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
