import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'

export default async function AdminPartnersPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('partners').select('*').order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Partners</h1>
        <Link href="/admin/partners/new" className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90" style={{ borderRadius: 'var(--radius)' }}>+ New</Link>
      </div>
      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">URL</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-3">{item.name}</td>
                <td className="p-3 text-muted-foreground truncate max-w-[200px]">{item.url}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/partners/${item.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                    <DeleteButton table="partners" id={item.id} redirect="/admin/partners" />
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
