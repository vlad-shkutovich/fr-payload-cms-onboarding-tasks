import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

import { authenticated } from '../../access/authenticated'
import { isSuperAdmin } from '../../access/isSuperAdmin'
import { hasRole } from '../../access/hasRole'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Controls whether a user can log in to the admin panel at all
    admin: authenticated,
    // Only super-admin creates/deletes/updates user accounts
    // (tenant-admin will be able to invite editors in Task 13 with multi-tenancy)
    create: isSuperAdmin,
    delete: isSuperAdmin,
    // super-admin & tenant-admin: read all. tenant-editor: read only own document.
    // This allows /api/users/me to work for all roles (fetches current user by ID).
    // Legacy users (role undefined) also get read-own-document so they can log in.
    read: ({ req }) => {
      const user = req.user as User | null
      if (!user) return false
      if (user.role === 'super-admin' || user.role === 'tenant-admin') return true
      return { id: { equals: user.id } }
    },
    update: isSuperAdmin,
  },
  admin: {
    group: 'System',
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    // tenant-editors never see the Users collection in the sidebar
    // Tenants collection (Task 12) will also be hidden for tenant-editor — same pattern
    hidden: ({ user }) => (user as User | null)?.role === 'tenant-editor',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'tenant-editor',
      // saveToJWT: true stores the role in the JWT token so access control
      // functions can check it without an extra database query on every request
      saveToJWT: true,
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Tenant Admin', value: 'tenant-admin' },
        { label: 'Tenant Editor', value: 'tenant-editor' },
      ],
      // Only super-admins can promote or demote other users' roles
      access: {
        update: ({ req: { user } }) => (user as User | null)?.role === 'super-admin',
      },
    },
  ],
  timestamps: true,
}
