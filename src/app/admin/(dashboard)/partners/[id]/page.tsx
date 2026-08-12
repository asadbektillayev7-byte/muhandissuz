import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

const fields = [
  { name: 'name', label: 'Name', type: 'text' as const, required: true },
  { name: 'logo_url', label: 'Logo', type: 'image-url' as const },
  { name: 'url', label: 'Website URL', type: 'text' as const },
]

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Partner</h1>
        <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="partners" redirect="/admin/partners" fields={fields} />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('partners').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Partner</h1>
      <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <SimpleForm table="partners" redirect="/admin/partners" item={item} fields={fields} />
      </div>
    </div>
  )
}
