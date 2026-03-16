import type { GlobalConfig } from 'payload'

import { revalidateSiteConfig } from './hooks/revalidateSiteConfig'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateSiteConfig],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'text',
      localized: true,
    },
    {
      name: 'fallbackSEO',
      type: 'group',
      label: 'Fallback SEO',
      admin: {
        description: 'Used as defaults when a page does not have its own SEO meta defined.',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Facebook', value: 'facebook' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
