import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Team Member</h1>
        <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="team_members" redirect="/admin/team" fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'role_uz', label: 'Role (UZ)', type: 'text', required: true },
            { name: 'role_en', label: 'Role (EN)', type: 'text', required: true },
            { name: 'photo_url', label: 'Photo URL', type: 'text' },
            { name: 'bio_uz', label: 'Bio (UZ)', type: 'textarea' },
            { name: 'bio_en', label: 'Bio (EN)', type: 'textarea' },
          ]} />
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
        <SimpleForm table="team_members" redirect="/admin/team" item={item} fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'role_uz', label: 'Role (UZ)', type: 'text', required: true },
          { name: 'role_en', label: 'Role (EN)', type: 'text', required: true },
          { name: 'photo_url', label: 'Photo URL', type: 'text' },
          { name: 'bio_uz', label: 'Bio (UZ)', type: 'textarea' },
          { name: 'bio_en', label: 'Bio (EN)', type: 'textarea' },
        ]} />
      </div>
    </div>
  )
}
