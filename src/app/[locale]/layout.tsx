import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
// eslint-disable-next-line camelcase
import { Fira_Code } from 'next/font/google';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { CommandPalette } from '@/components/command-palette-loader';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import Particles from '@/components/particles';
import { Toaster } from '@/components/toaster';
import { TooltipProvider } from '@/components/tooltip';
import { messages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import '../../styles/globals.css';

const fontSans = localFont({
  src: [
    {
      path: '../font/Biotif-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../font/Biotif-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../font/Biotif-Bold.woff2',
      style: 'normal',
      weight: '700'
    },
    {
      path: '../font/Biotif-RegularItalic.woff2',
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
      path: '../font/NeuzeitGrotesk-Bold.woff2',
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
      en: 'https://snowye.dev',
      pt: 'https://snowye.dev/pt'
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
    url: 'https://snowye.dev'
  }
} satisfies Metadata;

export const viewport = {
  themeColor: '#08070b',
  colorScheme: 'dark'
} satisfies Viewport;

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this segment.
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        className={cn(
          fontSans.variable,
          fontMono.variable,
          fontHeading.variable
        )}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale] as unknown as Record<string, unknown>}
        >
          <TooltipProvider delayDuration={150}>
            <div className="relative z-0 flex min-h-screen flex-col">
              <div className="absolute inset-0 h-full w-full">
                <Particles
                  particleCount={150}
                  particleSpread={20}
                  speed={0.05}
                  particleBaseSize={100}
                  disableRotation={false}
                />
              </div>
              <Navbar />
              {children}
              <Footer />
            </div>
            <CommandPalette />
            <Toaster />
          </TooltipProvider>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
