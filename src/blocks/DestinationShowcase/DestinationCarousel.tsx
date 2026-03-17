'use client'

import React from 'react'

import type { Destination } from '@/payload-types'

import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/utilities/ui'

const countryLabels: Record<string, string> = {
  italy: 'Italy',
  switzerland: 'Switzerland',
  austria: 'Austria',
  germany: 'Germany',
  france: 'France',
}

const typeLabels: Record<string, string> = {
  beach: 'Beach',
  mountain: 'Mountain',
  city: 'City',
  cultural: 'Cultural',
}

export const DestinationCarousel: React.FC<{
  destinations: Destination[]
  heading?: string | null
}> = ({ destinations, heading }) => {
  if (!destinations?.length) {
    return null
  }

  return (
    <div className="container">
      {heading && <h2 className="mb-8 text-3xl font-bold">{heading}</h2>}
      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent>
          {destinations.map((destination, index) => {
            const heroImage = destination.heroImage
            const title = destination.title
            const country = destination.country
            const type = destination.type

            return (
              <CarouselItem
                key={destination.id ?? index}
                className="basis-full pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <article className={cn('border-border bg-card overflow-hidden rounded-lg border')}>
                  <div className="relative aspect-[4/3] w-full">
                    {heroImage ? (
                      <Media
                        resource={heroImage}
                        size="33vw"
                        imgClassName="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {title && <h3 className="font-semibold">{title}</h3>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {country && (
                        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                          {countryLabels[country] ?? country}
                        </span>
                      )}
                      {type && (
                        <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs">
                          {typeLabels[type] ?? type}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
