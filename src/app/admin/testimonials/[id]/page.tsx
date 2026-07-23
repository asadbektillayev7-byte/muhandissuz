import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimpleForm } from '../../SimpleForm'

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Testimonial</h1>
        <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <SimpleForm table="testimonials" redirect="/admin/testimonials" fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'quote_uz', label: 'Quote (UZ)', type: 'textarea', required: true },
            { name: 'quote_en', label: 'Quote (EN)', type: 'textarea', required: true },
            { name: 'role_uz', label: 'Role (UZ)', type: 'text' },
            { name: 'role_en', label: 'Role (EN)', type: 'text' },
            { name: 'rating', label: 'Rating (1-5)', type: 'number' },
            { name: 'sort_order', label: 'Sort Order', type: 'number' },
            { name: 'avatar_url', label: 'Avatar URL', type: 'text' },
          ]} />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('testimonials').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Testimonial</h1>
      <div className="max-w-xl border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <SimpleForm table="testimonials" redirect="/admin/testimonials" item={item} fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'quote_uz', label: 'Quote (UZ)', type: 'textarea', required: true },
          { name: 'quote_en', label: 'Quote (EN)', type: 'textarea', required: true },
          { name: 'role_uz', label: 'Role (UZ)', type: 'text' },
          { name: 'role_en', label: 'Role (EN)', type: 'text' },
          { name: 'rating', label: 'Rating (1-5)', type: 'number' },
          { name: 'sort_order', label: 'Sort Order', type: 'number' },
          { name: 'avatar_url', label: 'Avatar URL', type: 'text' },
        ]} />
      </div>
    </div>
  )
}
