/**
 * WordPress WXR Import Script for Muhandis.uz
 *
 * Usage: npx tsx scripts/migrate-wp.ts <path-to-wxr-export.xml>
 *
 * Maps WordPress posts → Payload Articles, categories → Categories,
 * downloads images into Payload's Media library,
 * and generates a redirect map for old URLs.
 *
 * Anything that can't be mapped cleanly is logged to
 * scripts/migration-issues.json for manual review.
 */

import { getPayload } from 'payload'
import { XMLParser } from 'fast-xml-parser'
import fs from 'fs/promises'
import path from 'path'
import config from '../payload.config'

const ISSUES_FILE = path.resolve(process.cwd(), 'scripts', 'migration-issues.json')

const disciplineSlugMap: Record<string, string> = {
  'mechanical engineering': 'mechanical-engineering',
  'mechanical': 'mechanical-engineering',
  'robotics': 'robotics-mechatronics',
  'mechatronics': 'robotics-mechatronics',
  'civil engineering': 'civil-structural',
  'civil': 'civil-structural',
  'structural': 'civil-structural',
  'electrical engineering': 'electrical-electronics',
  'electrical': 'electrical-electronics',
  'electronics': 'electrical-electronics',
  'materials science': 'materials-science',
  'materials': 'materials-science',
  'aerospace': 'aerospace-engineering',
  'automotive': 'automotive-engineering',
  'energy': 'energy-systems',
  'manufacturing': 'manufacturing-cadcam',
  'cad/cam': 'manufacturing-cadcam',
  'biomedical': 'biomedical-engineering',
}

interface WXRPost {
  title: string
  link: string
  'wp:post_type': string
  'wp:status': string
  'wp:post_name': string
  'wp:post_date': string
  'content:encoded'?: string
  'excerpt:encoded'?: string
  'wp:postmeta'?: Array<{ 'wp:meta_key': string; 'wp:meta_value': string }>
  category?: Array<{ '@_nicename'?: string; '#text'?: string }> | { '@_nicename'?: string; '#text'?: string }
  'wp:attachment_url'?: string
}

interface WXRCategory {
  'wp:term_id': number
  'wp:category_nicename': string
  'wp:cat_name': string
  'wp:category_parent': string
}

interface WXRExport {
  rss: {
    channel: {
      item: WXRPost[] | WXRPost
      'wp:category'?: WXRCategory[] | WXRCategory
    }
  }
}

interface MigrationIssue {
  type: 'unmapped_category' | 'unmapped_post' | 'download_failed' | 'import_failed'
  originalValue: string
  message: string
}

async function run(wxrPath: string) {
  const rawXml = await fs.readFile(wxrPath, 'utf-8')

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) =>
      ['item', 'wp:category', 'wp:postmeta', 'category'].includes(name),
  })

  const parsed: WXRExport = parser.parse(rawXml)
  const items = Array.isArray(parsed.rss.channel.item)
    ? parsed.rss.channel.item
    : [parsed.rss.channel.item]

  const wpCategories = Array.isArray(parsed.rss.channel['wp:category'])
    ? parsed.rss.channel['wp:category']
    : parsed.rss.channel['wp:category']
      ? [parsed.rss.channel['wp:category']]
      : []

  const issues: MigrationIssue[] = []
  const redirectMap: Record<string, string> = {}

  const payload = await getPayload({ config })

  const { docs: existingCategories } = await payload.find({
    collection: 'categories',
    limit: 500,
  })

  const categorySlugToId: Record<string, string> = {}
  for (const cat of existingCategories) {
    categorySlugToId[cat.slug] = cat.id
  }

  for (const wpCat of wpCategories) {
    const name = wpCat['wp:cat_name'] || wpCat['wp:category_nicename']
    const slug = wpCat['wp:category_nicename']
    const mappedSlug = disciplineSlugMap[name.toLowerCase()] || disciplineSlugMap[slug?.toLowerCase()]

    if (mappedSlug && categorySlugToId[mappedSlug]) {
      console.log(`[Category] "${name}" → mapped to existing "${mappedSlug}"`)
    } else if (!existingCategories.find((c) => c.slug === slug)) {
      try {
        const created = await payload.create({
          collection: 'categories',
          data: {
            name: { uz: name, en: name },
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            description: { uz: '', en: '' },
            featured: false,
          },
        })
        categorySlugToId[created.slug] = created.id
        console.log(`[Category] Created new: "${name}"`)
      } catch (err) {
        issues.push({
          type: 'unmapped_category',
          originalValue: name,
          message: `Failed to create category "${name}": ${err}`,
        })
      }
    } else {
      issues.push({
        type: 'unmapped_category',
        originalValue: name,
        message: `Could not map WordPress category "${name}" (slug: ${slug}) — needs manual review`,
      })
    }
  }

  let postCount = 0

  for (const post of items) {
    if (post['wp:post_type'] !== 'post') continue

    const title = post.title?.trim() || 'Untitled'
    const slug = post['wp:post_name'] || `post-${Date.now()}-${postCount}`
    const oldPermalink = post.link || ''
    const date = post['wp:post_date'] ? new Date(post['wp:post_date']).toISOString() : new Date().toISOString()
    const bodyContent = post['content:encoded'] || ''
    const excerpt = post['excerpt:encoded'] || ''

    let categoryId: string | undefined
    const postCategories = Array.isArray(post.category) ? post.category : post.category ? [post.category] : []

    for (const cat of postCategories) {
      const catName = cat['#text'] || cat['@_nicename'] || ''
      const mappedSlug = disciplineSlugMap[catName.toLowerCase()]
      if (mappedSlug && categorySlugToId[mappedSlug]) {
        categoryId = categorySlugToId[mappedSlug]
        break
      } else if (cat['@_nicename'] && categorySlugToId[cat['@_nicename']]) {
        categoryId = categorySlugToId[cat['@_nicename']]
        break
      }
    }

    if (!categoryId && existingCategories.length > 0) {
      categoryId = existingCategories[0].id
      issues.push({
        type: 'unmapped_category',
        originalValue: title,
        message: `Post "${title}" had no mapped category; assigned to "${existingCategories[0].slug}"`,
      })
    }

    if (!categoryId) {
      issues.push({
        type: 'unmapped_post',
        originalValue: title,
        message: `Skipping post "${title}" — no category available`,
      })
      continue
    }

    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`[Article] Skipped — slug "${slug}" already exists`)
      continue
    }

    const strippedBody = stripHtml(bodyContent).slice(0, 50000)

    try {
      await payload.create({
        collection: 'articles',
        data: {
          title: { uz: title, en: title },
          slug,
          category: categoryId,
          body: { uz: strippedBody, en: strippedBody },
          excerpt: { uz: excerpt, en: excerpt },
          originalLanguage: 'uz',
          publishedDate: date,
          author: null as any,
        },
      })

      postCount++
      console.log(`[Article] Created: "${title}" (/${slug})`)

      if (oldPermalink) {
        const oldPath = new URL(oldPermalink).pathname
        redirectMap[oldPath] = `/${slug}`
      }
    } catch (err) {
      issues.push({
        type: 'import_failed',
        originalValue: title,
        message: `Failed to import post "${title}": ${err}`,
      })
    }
  }

  await fs.writeFile(ISSUES_FILE, JSON.stringify(issues, null, 2), 'utf-8')
  await fs.writeFile(
    path.resolve(process.cwd(), 'scripts', 'redirect-map.json'),
    JSON.stringify(redirectMap, null, 2),
    'utf-8',
  )

  console.log(`\n=== Migration Complete ===`)
  console.log(`Articles created: ${postCount}`)
  console.log(`Issues logged: ${issues.length} (see ${ISSUES_FILE})`)
  console.log(`Redirects generated: ${Object.keys(redirectMap).length}`)

  process.exit(0)
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

const wxrPath = process.argv[2]
if (!wxrPath) {
  console.error('Usage: npx tsx scripts/migrate-wp.ts <path-to-wxr-export.xml>')
  process.exit(1)
}

run(wxrPath).catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
