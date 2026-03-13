import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isSuperAdmin } from '../access/isSuperAdmin'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    // Categories are global taxonomy — only super-admin manages them
    // all roles can read categories for filtering/display
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: anyone,
    update: isSuperAdmin,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
