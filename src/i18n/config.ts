export type Locale = 'en' | 'de'

export const locales: Locale[] = ['en', 'de']
export const defaultLocale: Locale = 'en'

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
