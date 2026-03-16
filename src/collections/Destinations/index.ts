import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isSuperAdmin } from '../../access/isSuperAdmin'
import { revalidateDestination, revalidateDeleteDestination } from './hooks/revalidateDestination'

export const Destinations: CollectionConfig<'destinations'> = {
  slug: 'destinations',
  access: {
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: authenticatedOrPublished,
    update: isSuperAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    country: true,
    type: true,
    heroImage: true,
    meta: { image: true, description: true },
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'type', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
            },
            {
              name: 'highlights',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
            {
              name: 'bestSeason',
              type: 'select',
              options: [
                { label: 'Spring', value: 'spring' },
                { label: 'Summer', value: 'summer' },
                { label: 'Autumn', value: 'autumn' },
                { label: 'Winter', value: 'winter' },
                { label: 'Year-round', value: 'year-round' },
              ],
            },
          ],
        },
        {
          label: 'Location & Type',
          fields: [
            {
              name: 'country',
              type: 'select',
              required: true,
              options: [
                { label: 'Italy', value: 'italy' },
                { label: 'Switzerland', value: 'switzerland' },
                { label: 'Austria', value: 'austria' },
                { label: 'Germany', value: 'germany' },
                { label: 'France', value: 'france' },
              ],
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              options: [
                { label: 'Beach', value: 'beach' },
                { label: 'Mountain', value: 'mountain' },
                { label: 'City', value: 'city' },
                { label: 'Cultural', value: 'cultural' },
              ],
            },
            {
              name: 'waterActivities',
              type: 'array',
              admin: { condition: (data) => data?.type === 'beach' },
              fields: [{ name: 'activity', type: 'text', required: true }],
            },
            {
              name: 'beachType',
              type: 'select',
              admin: { condition: (data) => data?.type === 'beach' },
              options: [
                { label: 'Sandy', value: 'sandy' },
                { label: 'Rocky', value: 'rocky' },
                { label: 'Pebble', value: 'pebble' },
              ],
            },
            {
              name: 'altitude',
              type: 'number',
              admin: {
                condition: (data) => data?.type === 'mountain',
                description: 'Altitude in metres',
              },
            },
            {
              name: 'skiResort',
              type: 'checkbox',
              admin: { condition: (data) => data?.type === 'mountain' },
            },
            {
              name: 'hikingDifficulty',
              type: 'select',
              admin: { condition: (data) => data?.type === 'mountain' },
              options: [
                { label: 'Easy', value: 'easy' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Hard', value: 'hard' },
              ],
            },
            {
              name: 'publicTransport',
              type: 'checkbox',
              admin: { condition: (data) => data?.type === 'city' },
            },
            {
              name: 'walkabilityScore',
              type: 'number',
              admin: {
                condition: (data) => data?.type === 'city',
                description: 'Score from 1 to 10',
              },
              min: 1,
              max: 10,
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) =>
            siblingData._status === 'published' && !value ? new Date() : value,
        ],
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateDestination],
    afterDelete: [revalidateDeleteDestination],
  },
  versions: {
    drafts: {
      // autosave omitted: causes blank create form. See https://github.com/payloadcms/payload/issues/8372
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
