import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientHeader from './ClientHeader';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NYC Taxi Analytics Dashboard',
  description: 'Interactive dashboard for NYC Yellow Taxi Trip data analysis',
  // icons: {
  //   icon: '🚕',
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <ClientHeader />
          {children}
        </div>
      </body>
    </html>
  );
} 