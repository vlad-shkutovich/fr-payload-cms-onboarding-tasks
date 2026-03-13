import type { Access } from 'payload'
import type { User } from '@/payload-types'

type UserRole = User['role']

/**
 * Factory that returns an Access function checking if the current user
 * has at least one of the provided roles.
 *
 * req.user is User | PayloadMcpApiKey in multi-auth projects; cast to our User type.
 *
 * Usage:
 *   create: hasRole('super-admin', 'tenant-admin')
 *   update: hasRole('super-admin')
 */
export const hasRole =
  (...roles: UserRole[]): Access =>
  ({ req }) => {
    const user = req.user as User | null
    if (!user) return false
    return roles.includes(user.role)
  }
