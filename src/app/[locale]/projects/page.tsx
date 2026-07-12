import { getPayloadClient } from '@/utilities/getPayload'
import Link from 'next/link'

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayloadClient()

  const { docs: projects } = await payload.find({
    collection: 'student-projects',
    locale: locale as 'uz' | 'en',
    depth: 2,
  })

  const label = locale === 'uz'
    ? { title: 'Talabalar Loyihalari', view: "Ko'rish", noProjects: 'Hozircha loyihalar yo\'q' }
    : { title: 'Student Projects', view: 'View', noProjects: 'No projects yet' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {projects.length === 0 && <p className="text-muted-foreground">{label.noProjects}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/${locale}/projects/${project.slug}`}
            className="block border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
          >
            {project.images && project.images.length > 0 && (project.images[0] as any)?.image && (
              <div className="aspect-video bg-muted">
                <img src={(project.images[0] as any).image.url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{project.title}</h2>
              {project.studentNames && project.studentNames.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {project.studentNames.map((s: any) => s.name).join(', ')}
                </p>
              )}
              {project.ageGroup && <p className="text-xs text-muted-foreground/60 mt-1">{project.ageGroup}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
