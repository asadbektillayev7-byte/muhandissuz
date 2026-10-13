import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShowcaseForm } from '../../ShowcaseForm'

export default async function EditHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Yangi hakaton / New Hackathon</h1>
        <div className="max-w-4xl border border-border p-4 sm:p-6" style={{ borderRadius: 'var(--radius)' }}>
          <ShowcaseForm kind="hackathon" />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: item } = await supabase.from('hackathons').select('*').eq('id', id).single()
  if (!item) notFound()
  const { data: photos, error: photosError } = await supabase
    .from('hackathon_photos')
    .select('*')
    .eq('hackathon_id', id)
    .order('position', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hakatonni tahrirlash / Edit Hackathon</h1>
      <div className="max-w-4xl border border-border p-4 sm:p-6" style={{ borderRadius: 'var(--radius)' }}>
        <ShowcaseForm kind="hackathon" item={item} photos={photos ?? []} photosError={photosError?.message} />
      </div>
    </div>
  )
}
