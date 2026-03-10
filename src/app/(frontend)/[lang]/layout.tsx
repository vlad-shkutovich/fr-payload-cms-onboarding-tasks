import { notFound } from 'next/navigation'
import React from 'react'
import { draftMode } from 'next/headers'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { isValidLocale, type Locale } from '@/i18n/config'
import { LivePreviewListener } from '@/components/LivePreviewListener'

type Args = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: Args) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  const { isEnabled } = await draftMode()

  return (
    <>
      <AdminBar
        adminBarProps={{
          preview: isEnabled,
        }}
      />
      <Header locale={lang} />
      {children}
      <Footer locale={lang} />
    </>
  )
}
