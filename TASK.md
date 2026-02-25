## Working Format

This is a learning onboarding project. The primary goal is not just to complete the tasks, but to **deeply understand Payload CMS** — its architecture, patterns, pitfalls and best practices — in order to be prepared for work on a real production project.

### What I expect from the agent

When working on any task, the agent should not only write code but also **explain what is happening**:

- **What and why** — the purpose behind each configuration choice and what problem it solves
- **How it works** — a brief explanation of the underlying mechanism so the concepts are understood, not just copied
- **Definitions and terms** — when a new Payload concept is introduced (hook, access control, adapter, collection, global, etc.), provide a clear definition
- **Pitfalls and gotchas** — warn about non-obvious limitations, common mistakes, and edge cases related to the topic (especially security-critical patterns)
- **Tips and best practices** — what is considered good practice in real Payload projects, what should be done differently and why

### Safe environment principle

This project exists as a safe space to make mistakes without real consequences. If during the work the agent notices:

- An architectural decision that does not scale well — point it out
- A pattern that would cause a bug or vulnerability in a real project — highlight it
- An alternative approach better suited for production — mention it

### Response format

- First — a brief theory section covering the topic of the step (key concepts and context)
- Then — implementation with explanations along the way
- At the end — a summary: what was done, what is worth remembering, what to watch out for next

---

**Base:** [Payload Website Starter](https://github.com/payloadcms/payload/tree/main/templates/website) (`templates/website`)
**Stack:** Payload CMS 3, Next.js 16, Neon (Postgres), Vercel, Vercel Blob, shadcn/ui
**Domain:** Multi-brand hotel/travel platform — a hotel group where each brand (tenant) has its own site. Brands share a pool of destinations and blog content, but each brand manages its own pages, navigation, and branding.

Tenants example: **"Alpine Retreats"** (mountain lodges), **"City Stays"** (urban hotels).
Global content: destinations (Lake Como, Swiss Alps, …), blog posts.
Tenant content: pages (homepage, about, offers), header/footer, media.

Use Claude Code + Payload MCP throughout to generate seed data and speed up implementation.

---

### 1. Setup & Deploy

Clone the Payload Website Starter. Connect a Neon Postgres database. Configure Vercel Blob for file storage (replaces local `public/media`). Deploy to Vercel.

- Neon: https://payloadcms.com/docs/database/overview
- Vercel Blob storage adapter: https://payloadcms.com/docs/upload/storage-adapters
- Set env vars: `POSTGRES_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`

Install the Payload MCP plugin and connect it to Claude Code for data seeding.

- https://payloadcms.com/docs/plugins/mcp

**Result:** Starter running on `*.vercel.app`, admin panel accessible, media uploads going to Vercel Blob. MCP connected — you can ask Claude Code to create/read/update content in Payload.

---

### 2. Localization

Enable localization in `payload.config.ts`: English (default) + German (`de`).

Mark content fields as `localized: true` where it makes sense (titles, slugs, rich text, SEO meta). Not every field needs localization — IDs, relationships, structural fields stay unlocalized.

Update frontend routing to `/{lang}/{slug}` pattern (e.g., `/en/about`, `/de/about`). The `[lang]` segment should be validated against configured locales. Pass the locale to Payload queries.

**Result:** Admin panel shows locale switcher on documents. Content can be edited per-language. Frontend serves pages at `/en/...` and `/de/...`, content switches based on URL locale.

---

### 3. User Roles & Basic Access Control

Add a `role` field to the Users collection: `super-admin`, `tenant-admin`, `tenant-editor`.

Implement access control:

|                   | Pages                            | Posts     | Media         | Categories | Users                   |
| ----------------- | -------------------------------- | --------- | ------------- | ---------- | ----------------------- |
| **super-admin**   | full CRUD                        | full CRUD | full CRUD     | full CRUD  | full CRUD               |
| **tenant-admin**  | full CRUD                        | read      | full CRUD     | read       | read own tenant's users |
| **tenant-editor** | read + update (no create/delete) | read      | read + upload | read       | **hidden**              |

"Hidden" means the collection doesn't appear in the admin sidebar at all for that role (`admin.hidden` function). `tenant-editor` also should not see the Tenants collection (added later in task 12, but plan the role structure now).

Create reusable access control functions (e.g., `isSuperAdmin`, `hasRole`, `authenticatedWithRole`).

**Result:** Login as different roles — each sees a different admin panel. Editors can't delete pages or access user management. Access restrictions apply both in admin UI and API.

---

### 4. Admin Collection Grouping

Organize collections into logical groups using `admin.group`:

- **Content** — Pages, Posts, Categories
- **Media** — Media
- **Configuration** — Site Config (task 5), Header, Footer, Forms
- **System** — Users, Redirects

Groups will be extended when new collections are added later. Keep the grouping consistent as new collections appear.

**Result:** Admin sidebar shows collapsible groups instead of a flat list.

---

### 5. Site Configuration Global

Create a `site-config` Global with:

- `siteName` (text)
- `siteDescription` (text, localized)
- `fallbackSEO` (group): `metaTitle` (text, localized), `metaDescription` (textarea, localized), `ogImage` (upload → media)
- `socialLinks` (array): `platform` (select: twitter/instagram/linkedin/facebook), `url` (text)

On the frontend, use `fallbackSEO` values when a page doesn't have its own SEO meta defined (from the SEO plugin). Merge logic: page-level SEO > site-config fallback > empty.

**Result:** Super-admin configures default SEO in one place. Pages without explicit meta still get reasonable defaults. Social links available for footer/header rendering.

---

### 6. Language Detection Middleware

Add Next.js middleware that:

1. Checks if the URL already has a locale prefix (`/en/...`, `/de/...`)
2. If not — reads `Accept-Language` header, picks the best match from configured locales
3. Redirects to the locale-prefixed URL (e.g., visitor with German browser hitting `/about` → `302` to `/de/about`)
4. Stores the detected locale in a cookie for subsequent visits

Exclude `/admin`, `/api`, static assets, and `_next` from middleware processing.

**Result:** First-time visitors are auto-redirected to their preferred language. Direct locale URLs work as before. Cookie persists preference across visits.

---

### 7. Destinations Collection

Create a `destinations` collection — this is **global content** (shared across all tenants).

Fields:

- `title` (text, required, localized) — useAsTitle
- `slug` (auto-generated slug, localized later in task 16)
- `heroImage` (upload → media, required)
- `country` (select: Italy, Switzerland, Austria, Germany, France — or a separate Countries collection if you prefer)
- `type` (select: `beach`, `mountain`, `city`, `cultural`)
- **Conditional fields based on `type`:**
  - If `beach`: `waterActivities` (array of text — snorkeling, sailing, etc.), `beachType` (select: sandy/rocky/pebble)
  - If `mountain`: `altitude` (number), `skiResort` (checkbox), `hikingDifficulty` (select: easy/moderate/hard)
  - If `city`: `publicTransport` (checkbox), `walkabilityScore` (number, 1-10)
  - Always shown: `description` (rich text, localized), `highlights` (array: `title` + `description`), `bestSeason` (select: spring/summer/autumn/winter/year-round)
- `categories` (relationship → categories, hasMany)
- SEO meta (from SEO plugin)

Use `admin.condition` for the conditional fields — the admin form should dynamically show/hide field groups based on the selected `type`.

Access: same as Posts — authenticated CRUD, public read for published.

Versions/drafts: enabled, same pattern as Pages.

Add to admin group **Content**.

**Result:** Editors can create destinations with type-specific fields. Selecting "mountain" shows altitude and hiking difficulty; selecting "beach" shows water activities. Data model supports filtering by country, type, and category.

---

### 8. Extend Media Collection

Add fields to the existing Media collection:

- `location` (text) — where the photo was taken
- `photographer` (text) — credit
- `usageRights` (select: `owned`, `licensed`, `stock`)

These are informational — no complex logic, but they're useful on real projects and demonstrate extending a built-in collection.

**Result:** Media library items now carry attribution and location metadata.

---

### 9. Destination Showcase Block + Carousel

**A. Create a `destinationShowcase` block** for the Pages layout (alongside existing Archive, CTA, Content blocks).

Fields:

- `heading` (text, localized)
- `populateBy` (select: `manual` | `filter`)
- If `manual`: `selectedDestinations` (relationship → destinations, hasMany)
- If `filter`: `country` (select), `type` (select), `limit` (number, default 6)

This mirrors how the existing Archive Block works for Posts, but targets Destinations.

**B. Frontend rendering:** Render the destinations as a **carousel** using [shadcn/ui Carousel](https://ui.shadcn.com/docs/components/carousel) (which wraps Embla Carousel). Each slide shows the destination hero image, title, country, and type badge.

Register the new block in `RenderBlocks.tsx`.

**Result:** Editors can add a destination carousel to any page — either hand-picking destinations or filtering by country/type. Frontend shows a swipeable carousel with destination cards.

---

### 10. Lexical Feature: Anchor Marker

Create a custom Lexical feature that lets editors select heading text and assign an anchor ID.

**Editor behavior:**

- Toolbar button (or inline toolbar) — "Set Anchor ID"
- Opens a small input where the editor types an ID (e.g., `getting-started`)
- The heading in the editor shows a visual indicator that it has an anchor

**Frontend rendering (JSX converter):**

- Heading renders with `id={anchorId}` attribute
- On hover, a `#` link appears next to the heading text
- Clicking the `#` link updates the browser URL with `#anchorId` (e.g., `/en/blog-post#getting-started`)
- Smooth scroll if navigating from same page

This is a very common pattern for blog/documentation content. Implement as a custom Lexical feature using Payload's feature API — not a Lexical block, but a **mark/decorator on heading nodes** that stores the anchor ID.

Reference: https://payloadcms.com/docs/rich-text/overview (custom features section)

**Result:** Editors can set anchor IDs on headings. Frontend renders clickable anchor links. URLs update with hash — shareable deep links into content.

---

### 11. Lexical Inline Block: Transition Panel

Create a Lexical **block** (not inline — this is a block-level element in rich text) that renders a [Transition Panel](https://motion-primitives.com/docs/transition-panel) from `motion-primitives`.

**Block schema:**

- `panels` (array, min 2):
  - `title` (text, required)
  - `content` (rich text — simpler editor, just paragraphs + bold/italic/links)

**Editor experience:**

- Slash command or toolbar button to insert a "Transition Panel" block
- Block renders in the editor with a preview showing panel titles (use `admin.components.Block` to customize the in-editor rendering)

**Frontend rendering:**

- Install `motion-primitives` package
- Render the `TransitionPanel` component with tabs for each panel, animated content transitions

**Result:** Editors can insert an interactive tabbed panel anywhere in rich text content. Frontend shows smooth animated tab transitions. Demonstrates custom Lexical blocks with third-party component integration.

---

### 12. Multi-Tenancy Setup

Install `@payloadcms/plugin-multi-tenant`.

Create a `tenants` collection:

- `name` (text, required) — useAsTitle
- `slug` (text, required, unique) — used in URL routing
- `primaryColor` (text) — hex color for branding
- `logo` (upload → media)
- `description` (textarea)

Configure the plugin:

- Scope `pages` to tenants (tenant-specific)
- Scope `media` to tenants (but super-admin uploads are shared/global — configure `useTenantAccess` accordingly)
- Keep `posts`, `destinations`, `categories` as global (not tenant-scoped)
- Tenant-scoped Header/Footer — since Payload Globals can't be tenant-scoped, create **collections** instead: `tenant-headers` and `tenant-footers` with the same field structure as the current globals, plus tenant scoping. Each tenant gets one header and one footer document. Add to admin group **Tenant Configuration**.

Update frontend routing to `/{tenant-slug}/{lang}/{slug}`:

- Tenant is resolved from the first URL segment
- Tenant data (branding, header, footer) is fetched and applied
- Tenant's `primaryColor` is injected as a CSS custom property for basic theming

Create 2 demo tenants: "Alpine Retreats" and "City Stays" with different logos and colors.

**Result:** Two tenants accessible at `/alpine-retreats/en/...` and `/city-stays/en/...`. Each has its own pages, header, footer, and branding. Global content (posts, destinations) is shared. Admin panel shows tenant selector.

---

### 13. Extended RBAC for Multi-Tenancy

Refine the access control from task 3 for the multi-tenant context:

**super-admin:**

- Sees all collections, all tenants, all users
- Can switch between tenants in admin

**tenant-admin:**

- Full CRUD on their tenant's Pages, Media, Header, Footer
- Read-only access to global content (Posts, Destinations, Categories)
- Can see Users collection — but **only users assigned to the same tenant** (access control `read` function returns a `where` constraint matching tenant IDs)
- Can create new `tenant-editor` users within their tenant
- Cannot see other tenants' data at all
- Cannot see or edit Tenants collection

**tenant-editor:**

- Can update (not create/delete) their tenant's Pages
- Can upload Media (within their tenant)
- Read-only on global content
- **Cannot see** Users and Tenants collections (`admin.hidden` returns `true` for this role)
- Cannot see tenant Header/Footer collections (only `tenant-admin` manages navigation)

Test all combinations: log in as each role, verify sidebar visibility, verify API access (not just UI — try direct API calls to confirm access control works at the API level too).

**Result:** Three clearly scoped roles. Tenant users are fully isolated from other tenants. Editors see a minimal admin interface — just the content they can work with.

---

### 14. Translatable Slugs

Make the `slug` field on Pages `localized: true`.

This means `/en/contact` and `/de/kontakt` can point to the same page document, with different slugs per locale.

Update the slug auto-generation hook to work per-locale (generate slug from the localized title).

Update frontend page resolution: when fetching a page by slug, include the locale in the query.

**Result:** Pages can have different URL slugs per language. `/contact` in English and `/kontakt` in German resolve to the same document.

---

### 15. Parent Field & Nested Pages

Add a `parent` field to the Pages collection — a relationship to self (Pages → Pages), scoped to the same tenant.

This enables nested page hierarchies: e.g., a "Rooms" page with children "Deluxe Suite", "Mountain View Room".

The full URL path is built by concatenating parent slugs: `/alpine-retreats/en/rooms/deluxe-suite`.

**Important:** A page can have multiple levels of ancestors (grandparent → parent → child). Resolving the full path requires walking up the tree.

**Result:** Editors can create page hierarchies. Admin shows a parent picker (filtered to same-tenant pages). Frontend resolves nested URLs to the correct page.

---

### 16. Cached Page Index

The nested pages + translatable slugs make URL resolution expensive (multiple DB queries to walk the parent chain). Build a **Page Index** utility to solve this.

The index is a cached object that maps:

```tsx
// Lookup by full slug path → { [locale]: pageId }
{
  "rooms/deluxe-suite": { en: "page_123", de: "page_123" },
  "zimmer/deluxe-suite": { de: "page_123" },
  ...
}

// Reverse lookup by ID → full slug per locale
{
  "page_123": { en: "rooms/deluxe-suite", de: "zimmer/deluxe-suite" }
}
```

Implementation:

- Utility function that fetches all pages (select: id, slug, parent, tenant) for all locales
- Recursively resolves full slug paths by walking parent chains
- Cached with `unstable_cache` + tag-based revalidation (`page-index`)
- Invalidated by `afterChange` / `afterDelete` hooks on Pages collection (revalidate the `page-index` tag)

Where the index is used:

- **Page route** `[...slug]` — resolve the incoming URL path to a page ID, single DB query to fetch full page data
- **CMSLink component** — generate correct href for internal page links (resolves page ID → full slug for current locale)
- **hreflang generation** (task 17) — look up all locale slugs for a given page ID
- **Language switcher** (task 18) — same as hreflang

**Result:** A single cached utility powers all slug resolution. No N+1 queries for nested pages. Index rebuilds automatically when pages change. Fast lookups by slug or by ID.

---

### 17. hreflang Tags

Generate proper `<link rel="alternate" hreflang="x">` tags in the `<head>` of every page.

Use the Page Index (task 16) to look up all available locale slugs for the current page.

```html
<link
  rel="alternate"
  hreflang="en"
  href="https://example.com/alpine-retreats/en/rooms/deluxe-suite"
/>
<link
  rel="alternate"
  hreflang="de"
  href="https://example.com/alpine-retreats/de/zimmer/deluxe-suite"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://example.com/alpine-retreats/en/rooms/deluxe-suite"
/>
```

Include `x-default` pointing to the default locale.

Build as a reusable component (e.g., `<HreflangTags pageId={id} tenant={tenant} />`) that can be included in the layout or page metadata.

**Result:** Every page has correct hreflang tags. Search engines understand the language relationship between pages. Validate with an SEO tool or by inspecting page source.

---

### 18. Language Switcher Component

Build a language switcher for the frontend header.

- Shows available locales (EN / DE)
- Each option links to the **same page in the other language**, using the correct localized slug
- Uses the Page Index (task 16) to resolve the alternate slug
- Highlights the currently active locale
- If a page doesn't have a translation for a locale, either link to the homepage of that locale or hide the option

**Result:** Users can switch languages. The URL updates to the correct localized slug (not just swapping `/en/` for `/de/` — the slug itself changes if translated). Works correctly with nested pages.

---

### 19. Country Selector & Dynamic Rendering Lesson

Add a **country selector** to the frontend header. The user picks a country (e.g., Italy, Switzerland, Austria, Germany, France — matching the Destinations countries). The selected country is stored in a **cookie**.

The header shows a contextual element based on the selected country — e.g., "Discover [Country]" with a small flag icon and a link to filtered destinations.

**Step 1 — Implement naively:**

Read the cookie server-side using `cookies()` from `next/headers` in a server component within the header. This works, but `cookies()` makes the **entire page dynamic** — Next.js can no longer statically render or cache it.

Deploy and observe: every page request hits the server, no caching.

**Step 2 — Fix it:**

Refactor the country selector into a **client component**. Read the cookie client-side (via `document.cookie` or a small utility). The server component renders the page shell statically. The country-specific content hydrates on the client.

The page is static again. Only the country selector part is dynamic.

**Result:** Working country selector with cookie persistence. Understanding of how `cookies()` affects rendering — and the pattern for keeping pages static while having personalized client-side elements.

---

### 20. Custom Dashboard Widget

Add a custom component to the admin dashboard using `admin.components.beforeDashboard`.

Build a **"Content Overview"** widget that shows:

- Per tenant: number of pages (published / draft), number of media items, last updated timestamp
- Quick links to each tenant's pages list (filtered)
- Total destinations, total posts

Fetch data using Payload's Local API (`getPayload` + `payload.count` / `payload.find`). This is a server component — it runs on the server and renders in the admin panel.

Use shadcn `Card` components for layout.

**Result:** Admin dashboard shows a useful content summary instead of just the default collection list. Demonstrates custom admin components with data fetching.

---

### 21. Custom Admin Navigation

Replace the default admin sidebar with a custom `Nav` component (`admin.components.Nav`).

Goals:

- **Multi-level collapsible groups** — not just 2 levels. The grouping structure should be driven by collection configs (e.g., a `admin.group` value like `"Content > Destinations"` creates a nested group "Content" → "Destinations"). Define a convention for specifying hierarchy in group names (e.g., dot notation or `/` separator).
- **Collapsible sections** with expand/collapse state
- Role-aware: hide collections the current user shouldn't see (use the same logic as `admin.hidden`)
- Active state highlighting for the current route
- Globals section

This requires rebuilding the navigation from scratch. You'll need to:

- Read the Payload config to get all collections and globals
- Parse group names to build a tree structure
- Render with collapsible sections (shadcn `Collapsible` or a simple `<details>` approach)
- Handle mobile menu

Reference the Payload source for the default Nav to understand what needs to be replicated: https://github.com/payloadcms/payload/tree/main/packages/ui/src/elements/Nav

**Result:** Admin sidebar with nested, collapsible groups. Clean organization even with 15+ collections. Role-based visibility works. Collections still configurable via `admin.group` in their configs — the custom Nav just interprets the group strings with more flexibility.
