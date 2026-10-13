import { getProjects } from '@/lib/supabase/queries'
import { projectCard, type ShowcaseItem } from '@/lib/showcase'
import { getShowcaseLabels } from '@/lib/showcase-i18n'
import { ShowcaseCards } from '@/components/ShowcaseCards'

export const revalidate = 600

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const label = getShowcaseLabels(locale)
  let items: ShowcaseItem[] = []
  let failed = false
  try {
    const projects = await getProjects(locale)
    items = projects.map((project) => projectCard(project, locale))
  } catch (error) {
    console.error(error)
    failed = true
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.titleProjects}</h1>
      {failed ? <p role="alert" className="text-muted-foreground">{label.loadError}</p>
        : items.length === 0 ? <p className="text-muted-foreground">{label.emptyProjects}</p>
        : <ShowcaseCards items={items} locale={locale} />}
    </div>
  )
}
