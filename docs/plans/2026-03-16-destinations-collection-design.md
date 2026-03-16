# Destinations Collection Design

**Date:** 2026-03-16  
**Task:** 7 — Destinations Collection  
**Status:** Approved

---

## Overview

`destinations` is a **global content** collection — shared across all tenants. Editors create destination entries (Lake Como, Swiss Alps, etc.) that can be referenced by any tenant's pages via the Destination Showcase block (task 9).

---

## Collection Config

```typescript
slug: 'destinations'
admin: {
  useAsTitle: 'title'
  group: 'Content'
  defaultColumns: ['title', 'country', 'type', 'updatedAt']
}
```

---

## Access Control

Same pattern as Posts — only super-admin can mutate, public read for published:

| Operation | Function |
|---|---|
| `create` | `isSuperAdmin` |
| `update` | `isSuperAdmin` |
| `delete` | `isSuperAdmin` |
| `read` | `authenticatedOrPublished` |

Rationale: destinations are global content managed centrally, not by individual tenant editors.

---

## Versions / Drafts

Same as Posts:

```typescript
versions: {
  drafts: {
    autosave: { interval: 100 },
    schedulePublish: true,
  },
  maxPerDoc: 50,
}
```

---

## Field Structure

### Sidebar fields (`admin.position: 'sidebar'`)

| Field | Type | Notes |
|---|---|---|
| `slug` | `slugField()` | Auto-generated from `title`, from `'payload'` package |
| `categories` | relationship → categories | `hasMany: true` |
| `publishedAt` | date | Auto-set on first publish via `beforeChange` hook |

### Tab "Content"

| Field | Type | Notes |
|---|---|---|
| `heroImage` | upload → media | `required: true` |
| `description` | richText (lexical) | `localized: true` |
| `highlights` | array | items: `title` (text, required) + `description` (text) |
| `bestSeason` | select | `spring / summer / autumn / winter / year-round` |

### Tab "Location & Type"

| Field | Type | Condition |
|---|---|---|
| `country` | select (Italy / Switzerland / Austria / Germany / France) | always |
| `type` | select (beach / mountain / city / cultural) | always |
| `waterActivities` | array of `{ activity: text }` | `type === 'beach'` |
| `beachType` | select (sandy / rocky / pebble) | `type === 'beach'` |
| `altitude` | number | `type === 'mountain'` |
| `skiResort` | checkbox | `type === 'mountain'` |
| `hikingDifficulty` | select (easy / moderate / hard) | `type === 'mountain'` |
| `publicTransport` | checkbox | `type === 'city'` |
| `walkabilityScore` | number (1–10) | `type === 'city'` |

Conditional fields use `admin: { condition: (data) => data?.type === '...' }`.  
Tabs are unnamed (no `name` property) so all fields live at the document root — `data.type` is accessible from any tab's condition.

### Tab "SEO"

Standard SEO plugin fields (same as Posts):
`OverviewField`, `MetaTitleField`, `MetaImageField`, `MetaDescriptionField`, `PreviewField` from `@payloadcms/plugin-seo/fields`.

---

## Hooks

### `beforeChange`

Sets `publishedAt` on first publish (same pattern as Posts):

```typescript
async ({ data, operation }) => {
  if ((operation === 'create' || operation === 'update')
      && data._status === 'published'
      && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}
```

### `afterChange` + `afterDelete`

Minimal revalidation hook in `src/collections/Destinations/hooks/revalidateDestination.ts`.  
At this stage (task 7) there are no frontend destination pages yet, so the hook only calls:
```typescript
revalidateTag('destinations-sitemap')
```
Will be extended in task 9 when frontend pages are added.

---

## File Structure

```
src/collections/Destinations/
├── index.ts
└── hooks/
    └── revalidateDestination.ts
```

---

## Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| Country field | inline `select` | sufficient for learning project, no need for separate collection |
| Admin layout | Tabs + Sidebar | consistent with Posts, good for comparison; sidebar matches Posts pattern |
| Conditional fields location | Tab "Location & Type" | all type-specific fields grouped together — makes `admin.condition` purpose clear |
| Revalidation scope | `revalidateTag` only | no frontend pages exist at task 7 stage |
