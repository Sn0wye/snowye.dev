import { cn } from '@/lib/cn';
import type { Metadata, Viewport } from 'next';
// eslint-disable-next-line camelcase
import { Fira_Code } from 'next/font/google';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { CommandPalette } from '@/components/command-palette';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import Particles from '@/components/particles';
import { Toaster } from '@/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import PlausibleProvider from 'next-plausible';

const fontSans = localFont({
  src: [
    {
      path: './font/Biotif-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './font/Biotif-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './font/Biotif-Bold.woff2',
      style: 'normal',
      weight: '700'
    },
    {
      path: './font/Biotif-RegularItalic.woff2',
      style: 'italic',
      weight: '400'
    }
  ],
  display: 'swap',
  variable: '--font-sans'
});

const fontMono = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: '500'
});

const fontHeading = localFont({
  src: [
    {
      path: './font/NeuzeitGrotesk-Bold.woff2',
      style: 'normal',
      weight: '400'
    }
  ],
  weight: '400',
  display: 'swap',
  variable: '--font-heading'
});

export const metadata = {
  metadataBase: new URL('https://snowye.dev'),
  title: 'Gabriel Trzimajewski',
  creator: 'Gabriel Trzimajewski',
  alternates: {
    canonical: 'https://snowye.dev',
    languages: {
      en: 'https://snowye.dev'
      // 'pt': 'https://snowye.dev/pt'
    }
  },
  authors: [
    {
      name: 'Gabriel Trzimajewski',
      url: 'https://snowye.dev'
    }
  ],
  keywords: ['Gabriel', 'Trzimajewski', 'Snowye', 'snowyedotdev', 'snowye.dev'],
  openGraph: {
    type: 'website',
    title: 'Gabriel Trzimajewski',
    locale: 'en_US',
    url: 'https://snowye.dev'
  }
} satisfies Metadata;

export const viewport = {
  themeColor: '#08070b',
  colorScheme: 'dark'
} satisfies Viewport;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider
          selfHosted
          domain="snowye.dev"
          customDomain="https://plausible.snowye.dev"
          taggedEvents
          trackLocalhost
          enabled={true}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          fontSans.variable,
          fontMono.variable,
          fontHeading.variable
        )}
      >
        <div className="relative z-0 flex min-h-screen flex-col">
          <div className="absolute inset-0 h-full w-full">
            <Particles
              particleColors={['#ffffff', '#ffffff']}
              particleCount={200}
              particleSpread={10}
              speed={0.1}
              particleBaseSize={100}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>
          <Navbar />
          {children}
          <Footer />
        </div>
        <CommandPalette />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
