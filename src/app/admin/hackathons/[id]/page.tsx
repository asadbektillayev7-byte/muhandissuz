import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

export default async function EditHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Hackathon</h1>
        <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="hackathons" redirect="/admin/hackathons" fields={[
            { name: 'title_uz', label: 'Title (UZ)', type: 'text', required: true },
            { name: 'title_en', label: 'Title (EN)', type: 'text', required: true },
            { name: 'slug', label: 'Slug', type: 'text', required: true },
            { name: 'summary_uz', label: 'Summary (UZ)', type: 'textarea' },
            { name: 'summary_en', label: 'Summary (EN)', type: 'textarea' },
            { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'past'] },
            { name: 'date_range_start', label: 'Start Date', type: 'date', required: true },
            { name: 'date_range_end', label: 'End Date', type: 'date' },
            { name: 'cover_image_url', label: 'Cover Image URL', type: 'text' },
          ]} />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('hackathons').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Hackathon</h1>
      <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <SimpleForm table="hackathons" redirect="/admin/hackathons" item={item} fields={[
          { name: 'title_uz', label: 'Title (UZ)', type: 'text', required: true },
          { name: 'title_en', label: 'Title (EN)', type: 'text', required: true },
          { name: 'slug', label: 'Slug', type: 'text', required: true },
          { name: 'summary_uz', label: 'Summary (UZ)', type: 'textarea' },
          { name: 'summary_en', label: 'Summary (EN)', type: 'textarea' },
          { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'past'] },
          { name: 'date_range_start', label: 'Start Date', type: 'date', required: true },
          { name: 'date_range_end', label: 'End Date', type: 'date' },
          { name: 'cover_image_url', label: 'Cover Image URL', type: 'text' },
        ]} />
      </div>
    </div>
  )
}
