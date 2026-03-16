import type { Metadata } from 'next'

import type { Media, Page, Post, SiteConfig, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  siteConfig?: SiteConfig | null
}): Promise<Metadata> => {
  const { doc, siteConfig } = args

  // Cascade: page-level SEO > site-config fallback > hardcoded defaults
  const metaTitle =
    doc?.meta?.title ||
    siteConfig?.fallbackSEO?.metaTitle ||
    null

  const metaDescription =
    doc?.meta?.description ||
    siteConfig?.fallbackSEO?.metaDescription ||
    null

  const metaImage =
    doc?.meta?.image !== undefined
      ? doc.meta.image
      : siteConfig?.fallbackSEO?.ogImage

  const ogImage = getImageURL(metaImage as Media | Config['db']['defaultIDType'] | null)

  const siteName = siteConfig?.siteName || 'Payload Website Template'
  const title = metaTitle ? `${metaTitle} | ${siteName}` : siteName

  return {
    description: metaDescription,
    openGraph: mergeOpenGraph({
      description: metaDescription || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
