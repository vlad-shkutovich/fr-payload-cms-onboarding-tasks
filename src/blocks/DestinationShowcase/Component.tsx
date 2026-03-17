import type {
  Config,
  Destination,
  DestinationShowcaseBlock as DestinationShowcaseBlockProps,
} from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import React from 'react'

import { DestinationCarousel } from './DestinationCarousel'

export const DestinationShowcaseBlock: React.FC<
  DestinationShowcaseBlockProps & {
    locale?: Config['locale']
    disableInnerContainer?: boolean
  }
> = async (props) => {
  const {
    id,
    heading,
    populateBy = 'manual',
    selectedDestinations,
    country,
    type,
    limit: limitFromProps,
    locale,
  } = props

  const limit = limitFromProps ?? 6

  let destinations: Destination[] = []

  if (populateBy === 'manual') {
    if (selectedDestinations?.length) {
      destinations = selectedDestinations.filter(
        (d): d is Destination => typeof d === 'object' && d !== null,
      )
    }
  } else {
    const payload = await getPayload({ config: configPromise })

    const where: Where = {
      and: [
        { _status: { equals: 'published' } },
        ...(country ? [{ country: { equals: country } }] : []),
        ...(type ? [{ type: { equals: type } }] : []),
      ] as unknown as Where[],
    }

    const result = await payload.find({
      collection: 'destinations',
      depth: 1,
      limit,
      ...(locale ? { locale } : {}),
      where,
    })

    destinations = result.docs
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      <DestinationCarousel destinations={destinations} heading={heading} />
    </div>
  )
}
