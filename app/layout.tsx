import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NYC Taxi Analytics Dashboard',
  description: 'Interactive dashboard for NYC Yellow Taxi Trip data analysis',
  icons: {
    icon: '🚕',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

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
      <body className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <header className="flex flex-col items-center justify-center py-8 animate-fade-in">
            <div className="flex items-center space-x-4">
              <span className="text-5xl animate-bounce" role="img" aria-label="taxi">🚕</span>
              <h1 className="main-header">NYC Taxi Analytics Dashboard</h1>
            </div>
            <button
              className="btn-secondary mt-4"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
} 