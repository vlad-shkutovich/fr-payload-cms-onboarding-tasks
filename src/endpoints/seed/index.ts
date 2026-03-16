import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import {
  categoriesDE,
  contactPageDE,
  footerNavDE,
  headerNavDE,
  homePageDE,
  mediaAltDE,
  mediaCaptionDE,
  post1DE,
  post2DE,
  post3DE,
} from './seed-de'
import { lexicalParagraph } from './lexical'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'destinations',
  'forms',
  'form-submissions',
  'search',
]

const globals: ('header' | 'footer')[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc, ...categoryDocs] =
    await Promise.all([
      payload.create({
        collection: 'users',
        data: {
          name: 'Demo Author',
          email: 'demo-author@example.com',
          password: 'password',
          role: 'super-admin',
        },
      }),
      payload.create({
        collection: 'media',
        data: image1,
        file: image1Buffer,
        locale: 'en',
      }),
      payload.create({
        collection: 'media',
        data: image2,
        file: image2Buffer,
        locale: 'en',
      }),
      payload.create({
        collection: 'media',
        data: image2,
        file: image3Buffer,
        locale: 'en',
      }),
      payload.create({
        collection: 'media',
        data: imageHero1,
        file: hero1Buffer,
        locale: 'en',
      }),
      ...categories.map((category) =>
        payload.create({
          collection: 'categories',
          data: {
            title: category,
            slug: category,
          },
          locale: 'en',
        }),
      ),
    ])

  payload.logger.info(`— Adding German (de) translations...`)

  await Promise.all([
    ...categoryDocs.map((doc, i) =>
      payload.update({
        collection: 'categories',
        id: doc.id,
        data: { title: categoriesDE[categories[i]] ?? categories[i] },
        locale: 'de',
      }),
    ),
    payload.update({
      collection: 'media',
      id: image1Doc.id,
      data: {
        alt: mediaAltDE[image1.alt ?? ''] ?? image1.alt,
        caption: mediaCaptionDE as Record<string, unknown>,
      },
      locale: 'de',
    }),
    payload.update({
      collection: 'media',
      id: image2Doc.id,
      data: {
        alt: mediaAltDE[image2.alt ?? ''] ?? image2.alt,
        caption: mediaCaptionDE as Record<string, unknown>,
      },
      locale: 'de',
    }),
    payload.update({
      collection: 'media',
      id: image3Doc.id,
      data: {
        alt: mediaAltDE[image2.alt ?? ''] ?? image2.alt,
        caption: mediaCaptionDE as Record<string, unknown>,
      },
      locale: 'de',
    }),
    payload.update({
      collection: 'media',
      id: imageHomeDoc.id,
      data: {
        alt: mediaAltDE[imageHero1.alt ?? ''] ?? imageHero1.alt,
      },
      locale: 'de',
    }),
  ])

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    locale: 'en',
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    locale: 'en',
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    locale: 'en',
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  // Sequential updates to avoid deadlock on posts_rels (relatedPosts/authors)
  const seedContext = { disableRevalidate: true }

  // DE updates (Payload #12536: updating with locale 'de' can overwrite EN in localized blocks)
  await payload.update({
    collection: 'posts',
    id: post1Doc.id,
    data: post1DE as Record<string, unknown>,
    locale: 'de',
    context: seedContext,
  })
  await payload.update({
    collection: 'posts',
    id: post2Doc.id,
    data: post2DE as Record<string, unknown>,
    locale: 'de',
    context: seedContext,
  })
  await payload.update({
    collection: 'posts',
    id: post3Doc.id,
    data: post3DE as Record<string, unknown>,
    locale: 'de',
    context: seedContext,
  })

  // Restore EN content (merge preserves DE from previous update)
  await payload.update({
    collection: 'posts',
    id: post1Doc.id,
    data: {
      ...post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
      relatedPosts: [post2Doc.id, post3Doc.id],
    } as Record<string, unknown>,
    locale: 'en',
    context: seedContext,
  })
  await payload.update({
    collection: 'posts',
    id: post2Doc.id,
    data: {
      ...post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
      relatedPosts: [post1Doc.id, post3Doc.id],
    } as Record<string, unknown>,
    locale: 'en',
    context: seedContext,
  })
  await payload.update({
    collection: 'posts',
    id: post3Doc.id,
    data: {
      ...post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
      relatedPosts: [post1Doc.id, post2Doc.id],
    } as Record<string, unknown>,
    locale: 'en',
    context: seedContext,
  })

  payload.logger.info(`— Seeding destinations...`)

  await payload.create({
    collection: 'destinations',
    depth: 0,
    locale: 'en',
    draft: false,
    context: seedContext,
    data: {
      title: 'Swiss Alps',
      heroImage: image1Doc.id,
      description: lexicalParagraph(
        'The Swiss Alps offer breathtaking mountain scenery, world-class skiing, and pristine hiking trails. A paradise for outdoor enthusiasts year-round.',
      ),
      country: 'switzerland',
      type: 'mountain',
      altitude: 2500,
      skiResort: true,
      hikingDifficulty: 'moderate',
      highlights: [
        { title: 'Matterhorn', description: 'Iconic peak and hiking destination' },
        { title: 'Alpine Lakes', description: 'Crystal-clear mountain lakes' },
      ],
      bestSeason: 'winter',
      slug: 'swiss-alps',
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'destinations',
    depth: 0,
    locale: 'en',
    draft: false,
    context: seedContext,
    data: {
      title: 'Lake Garda',
      heroImage: image2Doc.id,
      description: lexicalParagraph(
        'Italy\'s largest lake combines Mediterranean charm with alpine backdrop. Perfect for water sports, wine tasting, and lakeside relaxation.',
      ),
      country: 'italy',
      type: 'beach',
      waterActivities: [
        { activity: 'Sailing' },
        { activity: 'Windsurfing' },
        { activity: 'Swimming' },
      ],
      beachType: 'pebble',
      highlights: [
        { title: 'Limone sul Garda', description: 'Charming lakeside town' },
        { title: 'Olive Groves', description: 'Famous local olive oil' },
      ],
      bestSeason: 'summer',
      slug: 'lake-garda',
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'destinations',
    depth: 0,
    locale: 'en',
    draft: false,
    context: seedContext,
    data: {
      title: 'Vienna',
      heroImage: image3Doc.id,
      description: lexicalParagraph(
        'Austria\'s capital blends imperial grandeur with modern culture. Museums, coffee houses, and classical music define this elegant city.',
      ),
      country: 'austria',
      type: 'city',
      publicTransport: true,
      walkabilityScore: 9,
      highlights: [
        { title: 'Schönbrunn Palace', description: 'UNESCO World Heritage site' },
        { title: 'Coffee House Culture', description: 'Traditional Viennese cafés' },
      ],
      bestSeason: 'year-round',
      slug: 'vienna',
      _status: 'published',
    },
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)

  const [homePage, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      locale: 'en',
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      locale: 'en',
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  // Sequential updates to avoid deadlock on relationship tables
  // DE updates (Payload #12536: can overwrite EN in localized blocks)
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    data: homePageDE(imageHomeDoc.id, image2Doc.id) as Record<string, unknown>,
    locale: 'de',
    context: seedContext,
  })
  await payload.update({
    collection: 'pages',
    id: contactPage.id,
    data: contactPageDE(contactForm.id) as Record<string, unknown>,
    locale: 'de',
    context: seedContext,
  })

  // Restore EN content (merge preserves DE from previous update)
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }) as Record<string, unknown>,
    locale: 'en',
    context: seedContext,
  })
  await payload.update({
    collection: 'pages',
    id: contactPage.id,
    data: contactPageData({ contactForm }) as Record<string, unknown>,
    locale: 'en',
    context: seedContext,
  })

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      locale: 'en',
      context: seedContext,
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      locale: 'en',
      context: seedContext,
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      locale: 'de',
      context: seedContext,
      data: headerNavDE(contactPage.id) as Record<string, unknown>,
    }),
    payload.updateGlobal({
      slug: 'footer',
      locale: 'de',
      context: seedContext,
      data: footerNavDE as Record<string, unknown>,
    }),
  ])

  // Restore EN globals (merge preserves DE from previous update)
  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      locale: 'en',
      context: seedContext,
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      locale: 'en',
      context: seedContext,
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
