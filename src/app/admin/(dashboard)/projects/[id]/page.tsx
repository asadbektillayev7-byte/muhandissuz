import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') {
    const supabase = await createClient()
    const { data: cats } = await supabase.from('categories').select('*')
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Project</h1>
        <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="student_projects" redirect="/admin/projects" fields={[
            { name: 'title_uz', label: 'Title (UZ)', type: 'text', required: true },
            { name: 'title_en', label: 'Title (EN)', type: 'text', required: true },
            { name: 'slug', label: 'Slug', type: 'text', required: true },
            { name: 'age_group', label: 'Age Group', type: 'text' },
            { name: 'video_url', label: 'Video URL', type: 'text' },
            { name: 'category_id', label: 'Category ID', type: 'number' },
          ]} />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('student_projects').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <div className="max-w-2xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <SimpleForm table="student_projects" redirect="/admin/projects" item={item} fields={[
          { name: 'title_uz', label: 'Title (UZ)', type: 'text', required: true },
          { name: 'title_en', label: 'Title (EN)', type: 'text', required: true },
          { name: 'slug', label: 'Slug', type: 'text', required: true },
          { name: 'age_group', label: 'Age Group', type: 'text' },
          { name: 'video_url', label: 'Video URL', type: 'text' },
          { name: 'category_id', label: 'Category ID', type: 'number' },
        ]} />
      </div>
    </div>
  )
}
