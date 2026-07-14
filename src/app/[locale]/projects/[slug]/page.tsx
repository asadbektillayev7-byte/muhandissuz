import Link from 'next/link'
import { getPayloadClient } from '@/utilities/getPayload'
import { renderRichText } from '@/utilities/richText'
import { resolveLocalizedField } from '@/lib/locale'
import { notFound } from 'next/navigation'
import { ModelViewer } from '@/components/ModelViewer'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'student-projects',
    where: { slug: { equals: slug } },
    locale: locale as 'uz' | 'en',
    depth: 2,
  })

  if (docs.length === 0) notFound()

  const project = docs[0]

  const label = locale === 'uz'
    ? { students: "O'quvchilar", age: 'Yosh', discipline: 'Fan', video: 'Video' }
    : { students: 'Students', age: 'Age', discipline: 'Discipline', video: 'Video' }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{project.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
        {project.studentNames && project.studentNames.length > 0 && (
          <span>{label.students}: {project.studentNames.map((s: any) => s.name).join(', ')}</span>
        )}
        {project.ageGroup && <span>{label.age}: {project.ageGroup}</span>}
        {project.discipline && typeof project.discipline === 'object' && (
          <span>{label.discipline}: {resolveLocalizedField(project.discipline.name, locale)}</span>
        )}
        {project.relatedHackathon && typeof project.relatedHackathon === 'object' && (
          <Link href={`/${locale}/hackathons/${project.relatedHackathon.slug}`} className="text-chart-2 hover:underline">
            {project.relatedHackathon.title}
          </Link>
        )}
      </div>

      {project.images && project.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {project.images.map((item: any, i: number) => (
            item.image && typeof item.image === 'object' && item.image.url && (
              <div key={i} className="aspect-video overflow-hidden bg-muted" style={{ borderRadius: 'var(--radius)' }}>
                <img src={item.image.url} alt="" className="w-full h-full object-cover" />
              </div>
            )
          ))}
        </div>
      )}

      {project.model3d && typeof project.model3d === 'object' && project.model3d.url && (
        <ModelViewer src={project.model3d.url} alt={project.title || ''} />
      )}

      {project.video && (
        <div className="mb-8">
          <a href={project.video} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 text-chart-2 hover:underline">
            ▶ {label.video}
          </a>
        </div>
      )}

      <div className="prose max-w-none">
        {renderRichText(project.description as any)}
      </div>
    </div>
  )
}
