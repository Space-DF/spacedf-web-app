import { Metadata } from 'next'
import { getS3Url } from './s3'

export function buildMetadata(
  metadata: {
    title: string
    description: string
    siteName: string
  },
  favicon?: string | { light?: string; dark?: string }
): Metadata {
  const ogImage = getS3Url('images/spacedf-og.jpg')

  return {
    title: metadata.title,
    description: metadata.description,

    openGraph: {
      title: metadata.title,
      description: metadata.description,
      images: [ogImage],
      siteName: metadata.siteName,
    },

    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [ogImage],
    },

    keywords: [
      'IoT dashboard',
      'Real-time GPS tracking',
      'GPS tracking dashboard',
      'Device monitoring dashboard',
      'Centralized dashboard',
      'all-in-one dashboard',
      'Device tracking platform',
      'Device data monitoring',
      'Digital Twins dashboard',
    ],

    ...(favicon && {
      icons: {
        icon:
          typeof favicon === 'string'
            ? favicon
            : [
                ...(favicon.light
                  ? [
                      {
                        url: favicon.light,
                        media: '(prefers-color-scheme: light)',
                      },
                    ]
                  : []),
                ...(favicon.dark
                  ? [
                      {
                        url: favicon.dark,
                        media: '(prefers-color-scheme: dark)',
                      },
                    ]
                  : []),
              ],
        shortcut:
          typeof favicon === 'string'
            ? favicon
            : [
                ...(favicon.light
                  ? [
                      {
                        url: favicon.light,
                        media: '(prefers-color-scheme: light)',
                      },
                    ]
                  : []),
                ...(favicon.dark
                  ? [
                      {
                        url: favicon.dark,
                        media: '(prefers-color-scheme: dark)',
                      },
                    ]
                  : []),
              ],
        apple:
          typeof favicon === 'string'
            ? favicon
            : [
                ...(favicon.light
                  ? [
                      {
                        url: favicon.light,
                        media: '(prefers-color-scheme: light)',
                      },
                    ]
                  : []),
                ...(favicon.dark
                  ? [
                      {
                        url: favicon.dark,
                        media: '(prefers-color-scheme: dark)',
                      },
                    ]
                  : []),
              ],
      },
    }),
  }
}
