import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'AlertTable – Real-Time Restaurant Feedback via QR Code',
  description: 'Turn table complaints into instant alerts. Get real-time feedback from your restaurant customers via QR code. No app needed. Fix problems before they become bad reviews.',
  keywords: [
    'restaurant feedback',
    'real-time alerts',
    'QR code feedback',
    'customer satisfaction',
    'hospitality technology',
    'restaurant management',
    'customer experience',
    'feedback system',
    'table service',
    'guest feedback'
  ],
  authors: [{ name: 'AlertTable' }],
  creator: 'AlertTable',
  publisher: 'AlertTable',
  openGraph: {
    title: 'AlertTable – Real-Time Restaurant Feedback via QR Code',
    description: 'Turn table complaints into instant alerts. Get real-time feedback from your restaurant customers via QR code.',
    url: 'https://alerttable.com',
    siteName: 'AlertTable',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AlertTable - Real-Time Restaurant Feedback'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlertTable – Real-Time Restaurant Feedback via QR Code',
    description: 'Turn table complaints into instant alerts. Get real-time feedback from your restaurant customers via QR code.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    languages: {
      'en': '/',
      'fr': '/?lang=fr',
      'ar': '/?lang=ar'
    }
  }
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  )
}
