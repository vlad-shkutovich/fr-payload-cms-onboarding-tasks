# Language Detection Middleware — Design

**Date:** 2026-03-16  
**Task:** 6 — Language Detection Middleware  
**Branch:** `feature/task-6_language-auto-detect`

---

## Goal

Add Next.js middleware that automatically redirects visitors to their preferred locale if the URL doesn't already contain one. Locale preference is detected via `Accept-Language` header and persisted in a cookie for subsequent visits.

---

## Approach

Use **`negotiator` + `@formatjs/intl-localematcher`** for RFC-compliant `Accept-Language` parsing. These two packages are the industry standard used in the official Next.js i18n documentation.

Priority order: `NEXT_LOCALE cookie` → `Accept-Language header` → `defaultLocale ('en')`.

---

## Files

### New

- `src/middleware.ts` — Next.js middleware entry point (auto-detected by Next.js)
- `src/i18n/detectLocale.ts` — pure locale detection function (isolated for testability)

### Modified

- `package.json` — add `negotiator` and `@formatjs/intl-localematcher` dependencies

---

## Detection Logic

```
Incoming request
      │
      ▼
Matched by config.matcher? (not /admin, /api, _next, favicon)
      │ no  → NextResponse.next() (passthrough)
      │ yes
      ▼
pathname already starts with a valid locale? (/en/... or /de/...)
      │ yes → NextResponse.next() (passthrough)
      │ no
      ▼
Cookie NEXT_LOCALE exists and is valid?
      │ yes → locale = cookie value
      │ no
      ▼
Parse Accept-Language header via negotiator
      │
      ▼
match() via intl-localematcher → best locale from [en, de]
      │ no match
      ▼
defaultLocale = 'en'
      │
      ▼
Set cookie NEXT_LOCALE = locale
      ▼
302 redirect → /${locale}${pathname}${search}
```

---

## Middleware Matcher

```ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|admin).*)',
  ],
}
```

Excludes:
- `_next/static`, `_next/image` — Next.js internals
- `favicon.ico`
- `/api/...` — Payload REST API
- `/admin/...` — Payload Admin Panel

Files served from `public/` (images, SVG, etc.) are handled by Next.js before middleware is invoked — no explicit exclusion needed.

---

## `detectLocale` Utility

```ts
// src/i18n/detectLocale.ts
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import { locales, defaultLocale } from './config'

export function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale

  const headers = { 'accept-language': acceptLanguage }
  const languages = new Negotiator({ headers }).languages()

  try {
    return match(languages, locales, defaultLocale)
  } catch {
    return defaultLocale
  }
}
```

`try/catch` is required — `match()` throws when the `languages` array is empty, which can occur with certain browser/proxy configurations.

---

## Cookie Spec

| Property   | Value          | Reason                                        |
|------------|----------------|-----------------------------------------------|
| Name       | `NEXT_LOCALE`  | Next.js convention, recognized by ecosystem   |
| Max-Age    | `31536000`     | 1 year in seconds                             |
| Path       | `/`            | Available site-wide                           |
| SameSite   | `lax`          | CSRF protection + works on external referrals |
| HttpOnly   | `false`        | Readable by client JS (needed for Task 18)    |

---

## Redirect

- HTTP status: `302 Found` (as specified in the task)
- Target: `/${locale}${pathname}${search}` — preserves full path and query string

---

## Existing Code Impact

- `src/app/(frontend)/page.tsx` — currently redirects `/` → `/en` unconditionally. With middleware in place, this redirect becomes a fallback that never fires in practice (middleware intercepts `/` first). No change needed.
- `src/app/(frontend)/[lang]/layout.tsx` — validates locale and 404s on invalid values. Remains unchanged; middleware ensures only valid locales reach it.
