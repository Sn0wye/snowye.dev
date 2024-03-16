import { type Metadata, type Viewport } from 'next';
// eslint-disable-next-line camelcase
import { Fira_Code } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/cn';
import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { CommandPalette } from '@/components/command-palette';
import { SparklesCore } from '@/components/sparkles';
import { Toaster } from '@/components/toaster';
import { env } from '@/env';

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
      'en': 'https://snowye.dev'
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
      <body
        suppressHydrationWarning
        className={cn(
          fontSans.variable,
          fontMono.variable,
          fontHeading.variable
        )}
      >
        {env.NODE_ENV === 'production' && (
          <div className="absolute inset-0 h-screen w-full">
            <SparklesCore
              id="tsparticlesfullpage"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="h-full w-full"
              particleColor="#FFFFFF"
            />
          </div>
        )}
        {children}
        <CommandPalette />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
