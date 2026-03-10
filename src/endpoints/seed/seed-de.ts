/**
 * German (de) translations for seed data.
 * Used to populate localized fields after creating documents with default (en) locale.
 */
import { lexicalHeading, lexicalHeadingAndParagraph, lexicalParagraph } from './lexical'

export const categoriesDE: Record<string, string> = {
  Technology: 'Technologie',
  News: 'Nachrichten',
  Finance: 'Finanzen',
  Design: 'Design',
  Software: 'Software',
  Engineering: 'Ingenieurwesen',
}

export const homePageDE = (heroImageId: string | number, metaImageId: string | number) => ({
  title: 'Startseite',
  hero: {
    type: 'highImpact' as const,
    media: heroImageId,
    richText: {
      root: {
        type: 'root' as const,
        children: [
          {
            type: 'heading' as const,
            children: [
              {
                type: 'text' as const,
                detail: 0,
                format: 0,
                mode: 'normal' as const,
                style: '',
                text: 'Payload Website Vorlage',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph' as const,
            children: [
              {
                type: 'link' as const,
                children: [
                  {
                    type: 'text' as const,
                    detail: 0,
                    format: 0,
                    mode: 'normal' as const,
                    style: '',
                    text: 'Besuchen Sie das Admin-Dashboard',
                    version: 1,
                  },
                ],
                direction: 'ltr' as const,
                fields: {
                  linkType: 'custom' as const,
                  newTab: false,
                  url: '/admin',
                },
                format: '' as const,
                indent: 0,
                version: 3,
              },
              {
                type: 'text' as const,
                detail: 0,
                format: 0,
                mode: 'normal' as const,
                style: '',
                text: ', um den Inhalt dieser Website zu verwalten. Der Code dieser Vorlage ist vollständig Open-Source und kann ',
                version: 1,
              },
              {
                type: 'link' as const,
                children: [
                  {
                    type: 'text' as const,
                    detail: 0,
                    format: 0,
                    mode: 'normal' as const,
                    style: '',
                    text: 'auf unserem Github',
                    version: 1,
                  },
                ],
                direction: 'ltr' as const,
                fields: {
                  linkType: 'custom' as const,
                  newTab: true,
                  url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
                },
                format: '' as const,
                indent: 0,
                version: 3,
              },
              {
                type: 'text' as const,
                detail: 0,
                format: 0,
                mode: 'normal' as const,
                style: '',
                text: ' gefunden werden.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Alle Beiträge',
          url: '/posts',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'Kontakt',
          url: '/contact',
        },
      },
    ],
  },
  layout: [
    {
      blockName: 'Content Block',
      blockType: 'content' as const,
      columns: [
        {
          richText: lexicalHeading('Kernfunktionen', 'h2'),
          size: 'full' as const,
        },
        {
          enableLink: false,
          richText: lexicalHeadingAndParagraph(
            'Admin-Dashboard',
            'Verwalten Sie die Seiten und Beiträge dieser Website über das Admin-Dashboard.',
            'h3',
          ),
          size: 'oneThird' as const,
        },
        {
          enableLink: false,
          richText: lexicalHeadingAndParagraph(
            'Vorschau',
            'Mit Versionen, Entwürfen und Vorschau können Redakteure ihre Änderungen überprüfen und teilen, bevor sie veröffentlicht werden.',
            'h3',
          ),
          size: 'oneThird' as const,
        },
        {
          enableLink: false,
          richText: lexicalHeadingAndParagraph(
            'Seiten-Builder',
            'Der benutzerdefinierte Seiten-Builder ermöglicht es Ihnen, einzigartige Layouts für jede Art von Inhalt zu erstellen.',
            'h3',
          ),
          size: 'oneThird' as const,
        },
        {
          enableLink: false,
          richText: lexicalHeadingAndParagraph(
            'SEO',
            'Redakteure haben volle Kontrolle über SEO-Daten und Website-Inhalte direkt im Admin-Dashboard.',
            'h3',
          ),
          size: 'oneThird' as const,
        },
        {
          enableLink: false,
          richText: lexicalHeadingAndParagraph(
            'Dark Mode',
            'Benutzer erleben diese Website in ihrem bevorzugten Farbschema und jeder Block kann invertiert werden.',
            'h3',
          ),
          size: 'oneThird' as const,
        },
      ],
    },
    {
      blockName: 'Media Block',
      blockType: 'mediaBlock' as const,
      media: metaImageId,
    },
    {
      blockName: 'Archive Block',
      blockType: 'archive' as const,
      introContent: lexicalHeadingAndParagraph(
        'Aktuelle Beiträge',
        'Die folgenden Beiträge werden in einem "Archiv"-Layout-Block angezeigt, der eine äußerst leistungsstarke Möglichkeit darstellt, Dokumente auf einer Seite anzuzeigen.',
        'h3',
      ),
    },
    {
      blockName: 'CTA',
      blockType: 'cta' as const,
      links: [
        {
          link: {
            type: 'custom' as const,
            appearance: 'default' as const,
            label: 'Alle Beiträge',
            url: '/posts',
          },
        },
      ],
      richText: lexicalHeadingAndParagraph(
        'Call-to-Action',
        'Dies ist ein benutzerdefinierter Layout-Block, der im Admin-Dashboard konfiguriert wird.',
        'h3',
      ),
    },
  ],
  meta: {
    description: 'Eine Open-Source-Website, die mit Payload und Next.js erstellt wurde.',
    title: 'Payload Website Vorlage',
  },
})

export const contactPageDE = (contactFormId: string | number) => ({
  title: 'Kontakt',
  layout: [
    {
      blockType: 'formBlock' as const,
      enableIntro: true,
      form: contactFormId,
      introContent: lexicalHeading('Beispiel-Kontaktformular:', 'h3'),
    },
  ],
})

export const post1DE = {
  title: 'Digitale Horizonte: Ein Blick in die Zukunft',
  content: lexicalHeadingAndParagraph(
    'Tauchen Sie ein in die Wunder der modernen Innovation, wo die einzige Konstante der Wandel ist.',
    'Wir befinden uns in einer transformativen Ära, in der künstliche Intelligenz an der Spitze der technologischen Evolution steht. IoT verbindet die Welt um uns herum – von Smart-Home-Systemen bis hin zu vernetzten Fahrzeugen. Dieser Inhalt ist vollständig dynamisch und verwendet benutzerdefinierte Layout-Blöcke, die im CMS konfiguriert sind.',
    'h2',
  ),
  meta: {
    description:
      'Tauchen Sie ein in die Wunder der modernen Innovation, wo die einzige Konstante der Wandel ist.',
    title: 'Digitale Horizonte: Ein Blick in die Zukunft',
  },
}

export const post2DE = {
  title: 'Globaler Blick: Jenseits der Schlagzeilen',
  content: lexicalHeadingAndParagraph(
    'Entdecken Sie das Ungesagte und Übersehene. Eine vergrößerte Ansicht in die Ecken der Welt.',
    'In diesen Momenten tiefer Krise taucht eine oft unterschätzte Kraft auf: der unbezwingbare Widerstandsgeist des Menschen. Dieser Inhalt ist vollständig dynamisch und verwendet benutzerdefinierte Layout-Blöcke, die im CMS konfiguriert sind.',
    'h2',
  ),
  meta: {
    description:
      'Entdecken Sie das Ungesagte und Übersehene. Eine vergrößerte Ansicht in die Ecken der Welt.',
    title: 'Globaler Blick: Jenseits der Schlagzeilen',
  },
}

export const post3DE = {
  title: 'Dollar und Sinn: Die Finanzprognose',
  content: lexicalHeadingAndParagraph(
    'Geld ist nicht nur Währung; es ist eine Sprache. Tauchen Sie ein in ihre Nuancen, wo Strategie auf Intuition trifft.',
    'Geld transzendiert das bloße Konzept von Münzen und Papiergeld; es wird zu einer tiefgründigen Sprache, die von Wert, Vertrauen und gesellschaftlichen Strukturen spricht. Dieser Inhalt ist vollständig dynamisch und verwendet benutzerdefinierte Layout-Blöcke, die im CMS konfiguriert sind.',
    'h2',
  ),
  meta: {
    description:
      'Geld ist nicht nur Währung; es ist eine Sprache. Tauchen Sie ein in ihre Nuancen, wo Strategie auf Intuition trifft.',
    title: 'Dollar und Sinn: Die Finanzprognose',
  },
}

export const mediaAltDE: Record<string, string> = {
  'Curving abstract shapes with an orange and blue gradient':
    'Kurvige abstrakte Formen mit orangefarbenem und blauem Verlauf',
  'Straight metallic shapes with a blue gradient': 'Gerade metallische Formen mit blauem Verlauf',
}

export const mediaCaptionDE = lexicalParagraph('Foto von Andrew Kliatskyi auf Unsplash.')

export const headerNavDE = (contactPageId: string | number) => ({
  navItems: [
    {
      link: {
        type: 'custom' as const,
        label: 'Beiträge',
        url: '/posts',
      },
    },
    {
      link: {
        type: 'reference' as const,
        label: 'Kontakt',
        reference: {
          relationTo: 'pages' as const,
          value: contactPageId,
        },
      },
    },
  ],
})

export const footerNavDE = {
  navItems: [
    {
      link: {
        type: 'custom' as const,
        label: 'Admin',
        url: '/admin',
      },
    },
    {
      link: {
        type: 'custom' as const,
        label: 'Quellcode',
        newTab: true,
        url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
      },
    },
    {
      link: {
        type: 'custom' as const,
        label: 'Payload',
        newTab: true,
        url: 'https://payloadcms.com/',
      },
    },
  ],
}

// Forms collection does not have localized fields by default (form-builder plugin).
// Uncomment and use if you add localization to form fields:
// export const contactFormDE = { ... }
