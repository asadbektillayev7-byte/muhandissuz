import { createPublicClient } from '@/lib/supabase/public'
import { ContactForm } from './ContactForm'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = createPublicClient()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single()

  const content = locale === 'uz' ? {
    title: 'Aloqa',
    subtitle: 'Biz bilan bog\'lanish uchun quyidagi ma\'lumotlardan foydalaning',
    email: 'Email',
    social: 'Ijtimoiy tarmoqlar',
    formTitle: 'Xabar yuborish',
  } : {
    title: 'Contact',
    subtitle: 'Use the information below to get in touch with us',
    email: 'Email',
    social: 'Social Media',
    formTitle: 'Send a Message',
  }

  const socialLinks = settings?.social_links
    ? (typeof settings.social_links === 'string' ? JSON.parse(settings.social_links) : settings.social_links)
    : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground mb-8">{content.subtitle}</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {settings?.contact_email && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">{content.email}</h2>
              <a href={`mailto:${settings.contact_email}`} className="text-chart-2 hover:underline">
                {settings.contact_email}
              </a>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">{content.social}</h2>
              <div className="space-y-2">
                {socialLinks.map((link: { platform?: string; url?: string }, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                     className="block text-chart-2 hover:underline">
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
          <h2 className="text-xl font-semibold mb-4">{content.formTitle}</h2>
          <ContactForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
