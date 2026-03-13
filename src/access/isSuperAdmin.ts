import type { Access } from 'payload'
import type { User } from '@/payload-types'

// req.user is User | PayloadMcpApiKey in multi-auth projects; cast to our User type
export const isSuperAdmin: Access = ({ req }) => {
  const user = req.user as User | null
  return user?.role === 'super-admin'
}
