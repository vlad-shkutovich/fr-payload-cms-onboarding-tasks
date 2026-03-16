import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { Destination } from '../../../payload-types'

export const revalidateDestination: CollectionAfterChangeHook<Destination> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating destinations-sitemap after change to: ${doc.slug}`)
    revalidateTag('destinations-sitemap')
  }
  return doc
}

export const revalidateDeleteDestination: CollectionAfterDeleteHook<Destination> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating destinations-sitemap after delete: ${doc?.slug}`)
    revalidateTag('destinations-sitemap')
  }
  return doc
}
