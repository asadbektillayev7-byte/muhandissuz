import { getProjects } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import Link from 'next/link'

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const projects = await getProjects(locale)

  const label = locale === 'uz'
    ? { title: 'Talabalar Loyihalari', view: "Ko'rish", noProjects: 'Hozircha loyihalar yo\'q' }
    : { title: 'Student Projects', view: 'View', noProjects: 'No projects yet' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {projects.length === 0 && <p className="text-muted-foreground">{label.noProjects}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project: any) => {
          const images = typeof project.images === 'string' ? JSON.parse(project.images) : (project.images || [])
          const studentNames = typeof project.student_names === 'string' ? JSON.parse(project.student_names) : (project.student_names || [])
          return (
            <Link
              key={project.id}
              href={`/${locale}/projects/${project.slug}`}
              className="block border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
            >
              {images.length > 0 && images[0]?.url && (
                <div className="aspect-video bg-muted">
                  <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{field(project, 'title', locale)}</h2>
                {studentNames.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {studentNames.join(', ')}
                  </p>
                )}
                {project.age_group && <p className="text-xs text-muted-foreground/60 mt-1">{project.age_group}</p>}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
