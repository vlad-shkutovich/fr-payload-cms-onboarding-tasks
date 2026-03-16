# Destinations Collection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the `destinations` global-content collection with conditional type-specific fields, drafts/versions, SEO, and revalidation hooks.

**Architecture:** New collection at `src/collections/Destinations/index.ts` following the same Tabs + Sidebar pattern as Posts. Conditional fields use `admin.condition` within an unnamed tab. Minimal revalidation hook (no frontend pages yet at this stage).

**Tech Stack:** Payload CMS 3, Next.js, TypeScript, `@payloadcms/plugin-seo/fields`, `@payloadcms/richtext-lexical`

**Design doc:** `docs/plans/2026-03-16-destinations-collection-design.md`

---

## Task 1: Create the revalidation hook

**Files:**
- Create: `src/collections/Destinations/hooks/revalidateDestination.ts`

**Step 1: Create the hook file**

```typescript
// src/collections/Destinations/hooks/revalidateDestination.ts
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
```

**Note:** The `Destination` type doesn't exist yet — it'll be generated in Task 3. The file will have a TypeScript error until then. That's expected.

---

## Task 2: Create the Destinations collection

**Files:**
- Create: `src/collections/Destinations/index.ts`

**Step 1: Create the collection file**

```typescript
// src/collections/Destinations/index.ts
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

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  access: {
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: authenticatedOrPublished,
    update: isSuperAdmin,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'type', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        // ── Tab 1: Content ──────────────────────────────────────────
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
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'text',
                },
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
        // ── Tab 2: Location & Type ───────────────────────────────────
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
            // ── Beach fields ─────────────────────────────────────────
            {
              name: 'waterActivities',
              type: 'array',
              admin: {
                condition: (data) => data?.type === 'beach',
              },
              fields: [
                {
                  name: 'activity',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'beachType',
              type: 'select',
              admin: {
                condition: (data) => data?.type === 'beach',
              },
              options: [
                { label: 'Sandy', value: 'sandy' },
                { label: 'Rocky', value: 'rocky' },
                { label: 'Pebble', value: 'pebble' },
              ],
            },
            // ── Mountain fields ──────────────────────────────────────
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
              admin: {
                condition: (data) => data?.type === 'mountain',
              },
            },
            {
              name: 'hikingDifficulty',
              type: 'select',
              admin: {
                condition: (data) => data?.type === 'mountain',
              },
              options: [
                { label: 'Easy', value: 'easy' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Hard', value: 'hard' },
              ],
            },
            // ── City fields ──────────────────────────────────────────
            {
              name: 'publicTransport',
              type: 'checkbox',
              admin: {
                condition: (data) => data?.type === 'city',
              },
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
        // ── Tab 3: SEO ──────────────────────────────────────────────
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
    // ── Sidebar fields ───────────────────────────────────────────────
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateDestination],
    afterDelete: [revalidateDeleteDestination],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
```

---

## Task 3: Register collection and generate types

**Files:**
- Modify: `src/payload.config.ts` (line 80 — the `collections` array)

**Step 1: Add the import**

Add after the `Posts` import (around line 10):
```typescript
import { Destinations } from './collections/Destinations'
```

**Step 2: Add to collections array**

Change line 80 from:
```typescript
collections: [Pages, Posts, Media, Categories, Users],
```
to:
```typescript
collections: [Pages, Posts, Destinations, Media, Categories, Users],
```

**Step 3: Run type generation**

```bash
cd /home/v-shkutovich/projects/fr-payload-cms-onboarding-tasks
npm run generate:types
```

Expected: `src/payload-types.ts` is regenerated, now containing a `Destination` type.

**Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors. If errors exist, fix them before proceeding.

---

## Task 4: Update plugins/index.ts

Two updates needed:

**4a. Add `destinations` to MCP plugin** so Claude Code can seed destinations via MCP.

In `src/plugins/index.ts`, add to the `mcpPlugin` collections object:
```typescript
destinations: {
  enabled: true,
  description: 'Global destination entries (beaches, mountains, cities, cultural sites)',
},
```

**4b. Update SEO plugin type annotation** to include `Destination`.

Change the import at the top:
```typescript
import { Page, Post } from '@/payload-types'
```
to:
```typescript
import { Destination, Page, Post } from '@/payload-types'
```

Change the `generateTitle` and `generateURL` type annotations:
```typescript
const generateTitle: GenerateTitle<Post | Page | Destination> = ({ doc }) => { ... }
const generateURL: GenerateURL<Post | Page | Destination> = ({ doc }) => { ... }
```

**Step: Verify TypeScript again**

```bash
npx tsc --noEmit
```

Expected: No errors.

---

## Task 5: Generate import map

After modifying collections and components, regenerate the admin import map:

```bash
npm run generate:importmap
```

Expected: `src/app/(payload)/admin/importMap.js` is updated.

---

## Task 6: Seed test data via MCP

Use the Payload MCP to create 2-3 test destinations to verify the admin UI works correctly:

1. One **mountain** destination (e.g. "Swiss Alps") — verify altitude/skiResort/hikingDifficulty fields appear
2. One **beach** destination (e.g. "Lake Garda") — verify waterActivities/beachType fields appear
3. One **city** destination (e.g. "Vienna") — verify publicTransport/walkabilityScore fields appear

After seeding, manually open the admin panel and:
- Switch the `type` dropdown — confirm conditional fields show/hide correctly
- Check the SEO tab renders
- Check the slug auto-generates from the title
- Publish one destination — confirm `publishedAt` is set

---

## Verification Checklist

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Destinations collection appears in admin sidebar under "Content" group
- [ ] Tabs render: Content / Location & Type / SEO
- [ ] Slug auto-generates from title
- [ ] Switching `type` shows/hides correct conditional fields
- [ ] Draft save works (autosave)
- [ ] Publish sets `publishedAt` in sidebar
- [ ] Categories relationship field appears in sidebar
- [ ] MCP can create/read destinations
