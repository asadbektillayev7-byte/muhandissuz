import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'

export default async function AdminTestimonialsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('testimonials').select('*').order('sort_order')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Link href="/admin/testimonials/new" className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90" style={{ borderRadius: 'var(--radius)' }}>+ New</Link>
      </div>
      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Quote (UZ)</th>
              <th className="text-left p-3">Order</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{'★'.repeat(item.rating)}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{item.quote_uz}</td>
                <td className="p-3">{item.sort_order}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/testimonials/${item.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                    <DeleteButton table="testimonials" id={item.id} redirect="/admin/testimonials" />
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
