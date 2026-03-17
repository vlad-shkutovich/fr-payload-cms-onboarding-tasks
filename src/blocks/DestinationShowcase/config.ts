import type { Block } from 'payload'

const countryOptions = [
  { label: 'Italy', value: 'italy' },
  { label: 'Switzerland', value: 'switzerland' },
  { label: 'Austria', value: 'austria' },
  { label: 'Germany', value: 'germany' },
  { label: 'France', value: 'france' },
]

const typeOptions = [
  { label: 'Beach', value: 'beach' },
  { label: 'Mountain', value: 'mountain' },
  { label: 'City', value: 'city' },
  { label: 'Cultural', value: 'cultural' },
]

export const DestinationShowcase: Block = {
  slug: 'destinationShowcase',
  interfaceName: 'DestinationShowcaseBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true, label: 'Heading' },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual Selection', value: 'manual' },
        { label: 'Filter', value: 'filter' },
      ],
    },
    {
      name: 'selectedDestinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.populateBy === 'manual' },
    },
    {
      name: 'country',
      type: 'select',
      options: countryOptions,
      admin: { condition: (_, siblingData) => siblingData?.populateBy === 'filter' },
    },
    {
      name: 'type',
      type: 'select',
      options: typeOptions,
      admin: { condition: (_, siblingData) => siblingData?.populateBy === 'filter' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'filter',
        step: 1,
      },
    },
  ],
  labels: { singular: 'Destination Showcase', plural: 'Destination Showcases' },
}
