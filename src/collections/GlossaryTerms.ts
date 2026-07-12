import type { CollectionConfig } from 'payload'

export const GlossaryTerms: CollectionConfig = {
  slug: 'glossary-terms',
  admin: {
    useAsTitle: 'term_uz',
    group: 'Content',
  },
  fields: [
    {
      name: 'term_uz',
      type: 'text',
      required: true,
    },
    {
      name: 'term_en',
      type: 'text',
      required: true,
    },
    {
      name: 'definition_uz',
      type: 'textarea',
      required: true,
    },
    {
      name: 'definition_en',
      type: 'textarea',
      required: true,
    },
    {
      name: 'relatedCategory',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
  ],
}
