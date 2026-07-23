import Link from 'next/link'
import { getProjectBySlug } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import { renderRichText } from '@/utilities/richText'
import { notFound } from 'next/navigation'
import { ModelViewer } from '@/components/ModelViewer'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)

  if (!project) notFound()

  const label = locale === 'uz'
    ? { students: "O'quvchilar", age: 'Yosh', discipline: 'Fan', video: 'Video' }
    : { students: 'Students', age: 'Age', discipline: 'Discipline', video: 'Video' }

  const images = typeof project.images === 'string' ? JSON.parse(project.images) : (project.images || [])
  const studentNames = typeof project.student_names === 'string' ? JSON.parse(project.student_names) : (project.student_names || [])
  const description = locale === 'uz' ? project.description_uz : project.description_en

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{field(project, 'title', locale)}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
        {studentNames.length > 0 && (
          <span>{label.students}: {studentNames.join(', ')}</span>
        )}
        {project.age_group && <span>{label.age}: {project.age_group}</span>}
        {project.categories && (
          <span>{label.discipline}: {field(project.categories, 'name', locale)}</span>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {images.map((item: any, i: number) => (
            item.url && (
              <div key={i} className="aspect-video overflow-hidden bg-muted" style={{ borderRadius: 'var(--radius)' }}>
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </div>
            )
          ))}
        </div>
      )}

      {project.model3d_url && (
        <ModelViewer src={project.model3d_url} alt={field(project, 'title', locale)} />
      )}

      {project.video_url && (
        <div className="mb-8">
          <a href={project.video_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 text-chart-2 hover:underline">
            ▶ {label.video}
          </a>
        </div>
      )}

      <div className="prose max-w-none">
        {renderRichText(description as any)}
      </div>
    </div>
  )
}
