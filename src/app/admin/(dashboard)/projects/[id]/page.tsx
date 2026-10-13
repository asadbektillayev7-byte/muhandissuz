import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShowcaseForm } from '../../ShowcaseForm'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('id,name_uz,name_en').order('name_uz')
  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Yangi loyiha / New Project</h1>
        <div className="max-w-4xl border border-border p-4 sm:p-6" style={{ borderRadius: 'var(--radius)' }}>
          <ShowcaseForm kind="project" categories={categories ?? []} />
        </div>
      </div>
    )
  }

  const { data: item } = await supabase.from('student_projects').select('*').eq('id', id).single()
  if (!item) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Loyihani tahrirlash / Edit Project</h1>
      <div className="max-w-4xl border border-border p-4 sm:p-6" style={{ borderRadius: 'var(--radius)' }}>
        <ShowcaseForm kind="project" item={item} categories={categories ?? []} />
      </div>
    </div>
  )
}
