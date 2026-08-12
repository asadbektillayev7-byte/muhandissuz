import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

const fields = [
  { name: 'name', label: 'Name', type: 'text' as const, required: true },
  { name: 'role_uz', label: 'Role (UZ)', type: 'text' as const, required: true },
  { name: 'role_en', label: 'Role (EN)', type: 'text' as const, required: true },
  { name: 'photo_url', label: 'Photo', type: 'image' as const },
  { name: 'bio_uz', label: 'Bio (UZ)', type: 'textarea' as const },
  { name: 'bio_en', label: 'Bio (EN)', type: 'textarea' as const },
]

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Team Member</h1>
        <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="team_members" redirect="/admin/team" fields={fields} />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('team_members').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Team Member</h1>
      <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <SimpleForm table="team_members" redirect="/admin/team" item={item} fields={fields} />
      </div>
    </div>
  )
}
