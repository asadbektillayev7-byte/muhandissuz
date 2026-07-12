import type { CollectionConfig } from 'payload'

export const StudentProjects: CollectionConfig = {
  slug: 'student-projects',
  admin: {
    useAsTitle: 'title',
    group: 'Programs',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'discipline',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: true,
    },
    {
      name: 'studentNames',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'ageGroup',
      type: 'text',
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'video',
      type: 'text',
    },
    {
      name: 'relatedHackathon',
      type: 'relationship',
      relationTo: 'hackathons',
      hasMany: false,
    },
    {
      name: 'model3d',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
