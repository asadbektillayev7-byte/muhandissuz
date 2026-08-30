import { FeedbackForm } from '@/components/FeedbackForm'
import { createPublicClient } from '@/lib/supabase/public'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = createPublicClient()

  // Reuses the same row the contact page reads, so the email and social links
  // stay managed in one place rather than hardcoded here.
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  const socialLinks: { platform?: string; url?: string }[] = settings?.social_links
    ? typeof settings.social_links === 'string'
      ? JSON.parse(settings.social_links)
      : settings.social_links
    : []

  const content = locale === 'uz' ? {
    title: 'Baholash',
    subtitle: 'Muhandiss.uz haqida fikringizni bildiring',
    whyTitle: 'Fikringiz nimaga kerak?',
    whyBody:
      'Muhandiss.uz talabalar va yosh muhandislar uchun ochiq loyiha. Har bir fikr sayt qaysi yo‘nalishda rivojlanishini belgilaydi — qanday maqolalar kerakligi, qaysi bo‘limlar qulay emasligi va nimani birinchi bo‘lib qo‘shishimiz kerakligini.',
    whatHappens:
      'Yuborilgan fikrlarni o‘qib chiqamiz. Ba’zilari, ruxsatingiz bilan, bosh sahifada e’lon qilinadi.',
    contactTitle: 'Bog‘lanish',
    emailLabel: 'Email',
    socialLabel: 'Ijtimoiy tarmoqlar',
  } : {
    title: 'Rate Us',
    subtitle: 'Tell us what you think of Muhandiss.uz',
    whyTitle: 'Why your feedback matters',
    whyBody:
      'Muhandiss.uz is an open project for students and young engineers. Every note shapes where the site goes next — which articles are worth writing, which sections are awkward to use, and what we should build first.',
    whatHappens:
      'We read everything that comes in. Some of it, once approved, appears on the homepage.',
    contactTitle: 'Get in touch',
    emailLabel: 'Email',
    socialLabel: 'Social media',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground mb-10">{content.subtitle}</p>

      {/* Single column below md so the explainer never pushes the form off
          the first screen on a phone. */}
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12">
        <div>
          <h2 className="text-lg font-semibold mb-3">{content.whyTitle}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{content.whyBody}</p>
          <p className="text-muted-foreground leading-relaxed">{content.whatHappens}</p>

          {(settings?.contact_email || socialLinks.length > 0) && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold mb-3">{content.contactTitle}</h2>

              {settings?.contact_email && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {content.emailLabel}
                  </p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-chart-2 hover:underline"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {content.socialLabel}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {socialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-chart-2 hover:underline"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="border border-border p-6 self-start"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <FeedbackForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
