import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteButton } from '../DeleteButton'

export default async function AdminHackathonsPage() {
  const supabase = await createClient()
  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('*')
    .order('date_range_start', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hackathons</h1>
        <Link
          href="/admin/hackathons/new"
          className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
          style={{ borderRadius: 'var(--radius)' }}
        >
          + New
        </Link>
      </div>
      <div className="border border-border" style={{ borderRadius: 'var(--radius)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Title (UZ)</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Start</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hackathons?.map((h: any) => (
              <tr key={h.id} className="border-b border-border">
                <td className="p-3">{h.title_uz}</td>
                <td className="p-3 text-muted-foreground">{h.slug}</td>
                <td className="p-3">{h.status}</td>
                <td className="p-3 text-muted-foreground">{new Date(h.date_range_start).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/hackathons/${h.id}`} className="text-chart-2 hover:underline text-xs">Edit</Link>
                    <DeleteButton table="hackathons" id={h.id} redirect="/admin/hackathons" />
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
