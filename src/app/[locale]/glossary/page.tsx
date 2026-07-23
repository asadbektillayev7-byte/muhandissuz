import { getGlossaryTerms } from '@/lib/supabase/queries'

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const terms = await getGlossaryTerms()

  const label = locale === 'uz'
    ? { title: 'Muhandislik Glossariysi', term: 'Termin', definition: 'Ta\'rif' }
    : { title: 'Engineering Glossary', term: 'Term', definition: 'Definition' }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {terms.length === 0 && <p className="text-muted-foreground">No glossary terms yet.</p>}

      <div className="space-y-6">
        {terms.map((term: any) => (
          <div key={term.id} className="border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">{label.term} (O'zbek)</h3>
                <p className="text-lg">{term.term_uz}</p>
                <p className="text-sm text-muted-foreground mt-2">{term.definition_uz}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">{label.term} (English)</h3>
                <p className="text-lg">{term.term_en}</p>
                <p className="text-sm text-muted-foreground mt-2">{term.definition_en}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
