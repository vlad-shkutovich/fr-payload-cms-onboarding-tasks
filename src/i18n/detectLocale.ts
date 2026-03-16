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
