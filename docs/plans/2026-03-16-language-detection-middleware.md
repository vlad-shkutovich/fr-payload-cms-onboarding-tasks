# Language Detection Middleware Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Next.js middleware that auto-redirects visitors to their browser-preferred locale when the URL has no locale prefix, and persists the choice in a cookie.

**Architecture:** A single `src/middleware.ts` file intercepts all non-admin/non-api requests. A pure utility function `src/i18n/detectLocale.ts` handles Accept-Language parsing using `negotiator` + `@formatjs/intl-localematcher`. Priority: cookie → Accept-Language → defaultLocale. On redirect, the cookie `NEXT_LOCALE` is set (1 year, SameSite=lax).

**Tech Stack:** Next.js 15 Middleware (Edge runtime), `negotiator`, `@formatjs/intl-localematcher`, TypeScript.

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

```bash
cd /home/v-shkutovich/projects/fr-payload-cms-onboarding-tasks
pnpm add negotiator @formatjs/intl-localematcher
pnpm add -D @types/negotiator
```

**Step 2: Verify installation**

Run: `pnpm tsc --noEmit`  
Expected: No errors related to missing types.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add negotiator and intl-localematcher for locale detection"
```

---

### Task 2: Create `detectLocale` utility

**Files:**
- Create: `src/i18n/detectLocale.ts`

**Step 1: Create the file**

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

**Step 2: Verify TypeScript**

Run: `pnpm tsc --noEmit`  
Expected: No errors.

**Step 3: Commit**

```bash
git add src/i18n/detectLocale.ts
git commit -m "feat: add detectLocale utility using negotiator + intl-localematcher"
```

---

### Task 3: Create `src/middleware.ts`

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create the middleware**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, isValidLocale } from '@/i18n/config'
import { detectLocale } from '@/i18n/detectLocale'

const COOKIE_NAME = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 31536000 // 1 year in seconds

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl

  // Check if the pathname already starts with a valid locale
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameLocale) {
    return NextResponse.next()
  }

  // Determine locale from cookie or Accept-Language header
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  const locale =
    cookieLocale && isValidLocale(cookieLocale)
      ? cookieLocale
      : detectLocale(request.headers.get('accept-language'))

  const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url)
  const response = NextResponse.redirect(redirectUrl, 302)

  response.cookies.set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|admin).*)'],
}
```

**Step 2: Verify TypeScript**

Run: `pnpm tsc --noEmit`  
Expected: No errors.

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add language detection middleware with cookie persistence"
```

---

### Task 4: Manual verification

Start the dev server and test the following scenarios:

**Step 1: Start dev server**

```bash
pnpm dev
```

**Step 2: Test — no locale in URL, no cookie**

Open `http://localhost:3000/about` in a browser with German language set as preferred.  
Expected: `302` redirect to `http://localhost:3000/de/about`. Cookie `NEXT_LOCALE=de` is set.

Open `http://localhost:3000/about` in a browser with English language (default).  
Expected: `302` redirect to `http://localhost:3000/en/about`. Cookie `NEXT_LOCALE=en` is set.

**Step 3: Test — URL already has locale**

Open `http://localhost:3000/en/about`.  
Expected: No redirect, page renders normally.

Open `http://localhost:3000/de/about`.  
Expected: No redirect, page renders normally.

**Step 4: Test — cookie persists preference**

Set cookie `NEXT_LOCALE=de` manually (DevTools → Application → Cookies).  
Open `http://localhost:3000/about` with an English-preferred browser.  
Expected: `302` redirect to `/de/about` (cookie wins over Accept-Language).

**Step 5: Test — admin and API paths are not affected**

Open `http://localhost:3000/admin`.  
Expected: Admin panel loads, no redirect.

Open `http://localhost:3000/api/users` (or any API path).  
Expected: API response, no redirect.

**Step 6: Test — root URL**

Open `http://localhost:3000/`.  
Expected: `302` redirect to `http://localhost:3000/en/` (or `de/` depending on browser/cookie).

---

### Task 5: Final commit and cleanup

**Step 1: Verify no TypeScript errors**

```bash
pnpm tsc --noEmit
```

Expected: Exit code 0, no errors.

**Step 2: Final commit (if any remaining changes)**

```bash
git add -A
git commit -m "chore: verify language detection middleware implementation"
```
