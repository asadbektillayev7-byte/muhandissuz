import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Categories } from './src/collections/Categories'
import { Articles } from './src/collections/Articles'
import { Authors } from './src/collections/Authors'
import { Hackathons } from './src/collections/Hackathons'
import { StudentProjects } from './src/collections/StudentProjects'
import { Mentors } from './src/collections/Mentors'
import { TeamMembers } from './src/collections/TeamMembers'
import { GlossaryTerms } from './src/collections/GlossaryTerms'
import { Partners } from './src/collections/Partners'
import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'
import { SiteSettings } from './src/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' - Muhandis.uz',
    },
  },
  editor: lexicalEditor({}),
  sharp,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
    },
  }),
  collections: [
    Users,
    Categories,
    Articles,
    Authors,
    Hackathons,
    StudentProjects,
    Mentors,
    TeamMembers,
    GlossaryTerms,
    Partners,
    Media,
  ],
  globals: [SiteSettings],
  localization: {
    locales: ['uz', 'en'],
    defaultLocale: 'uz',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    seoPlugin({
      collections: ['articles', 'hackathons'],
    }),
    ...(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            collections: {
              media: {
                disableLocalStorage: true,
              },
            },
            bucket: process.env.S3_BUCKET,
            config: {
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
              region: process.env.S3_REGION,
              endpoint: process.env.S3_ENDPOINT,
            },
          }),
        ]
      : []),
  ],
})
