import type { CollectionConfig } from 'payload'

export const Hackathons: CollectionConfig = {
  slug: 'hackathons',
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
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'dateRange',
      type: 'group',
      fields: [
        {
          name: 'start',
          type: 'date',
          required: true,
        },
        {
          name: 'end',
          type: 'date',
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Past', value: 'past' },
      ],
    },
    {
      name: 'buildLog',
      type: 'array',
      fields: [
        {
          name: 'stage',
          type: 'select',
          required: true,
          options: [
            { label: 'Problem', value: 'Problem' },
            { label: 'Design', value: 'Design' },
            { label: 'Build', value: 'Build' },
            { label: 'Test', value: 'Test' },
            { label: 'Iterate', value: 'Iterate' },
            { label: 'Result', value: 'Result' },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          localized: true,
        },
        {
          name: 'media',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'mentors',
      type: 'relationship',
      relationTo: 'mentors',
      hasMany: true,
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'student-projects',
      hasMany: true,
    },
  ],
}
