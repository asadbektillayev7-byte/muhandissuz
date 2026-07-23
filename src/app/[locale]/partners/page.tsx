import { getPartners } from '@/lib/supabase/queries'
import { PartnerMarquee } from '@/components/PartnerMarquee'

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const partners = await getPartners()

  const label = locale === 'uz'
    ? {
        title: 'Hamkorlar',
        subtitle: 'Biz bilan hamkorlik qilayotgan tashkilotlar',
        sectionTitle: 'Hamkorlarimiz',
      }
    : {
        title: 'Partners',
        subtitle: 'Organizations we work with',
        sectionTitle: 'Our Partners',
      }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{label.title}</h1>
      <p className="text-muted-foreground mb-8">{label.subtitle}</p>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">{label.sectionTitle}</h2>
        <PartnerMarquee />
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {partners.map((partner: any) => (
          <div
            key={partner.id}
            className="border border-border p-6 flex items-center justify-center"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {partner.logo_url ? (
              <a
                href={partner.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name || ''}
                  className="max-h-12 w-auto grayscale hover:grayscale-0 transition-all"
                />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">{partner.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
