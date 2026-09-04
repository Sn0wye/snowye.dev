import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { CommandPalette } from '@/components/command-palette-loader';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import Particles from '@/components/particles';
import { PersonJsonLd } from '@/components/person-json-ld';
import { SiteJsonLd } from '@/components/site-json-ld';
import { Toaster } from '@/components/toaster';
import { TooltipProvider } from '@/components/tooltip';
import { messages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';

export const metadata = {
  metadataBase: new URL('https://snowye.dev'),
  title: 'Gabriel Trzimajewski',
  description:
    'Gabriel Trzimajewski is a Senior Backend Software Engineer from Brazil, working with Java, Spring Boot, Node.js, React and C#/.NET across distributed systems, observability and cloud infrastructure.',
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
    type: 'profile',
    title: 'Gabriel Trzimajewski',
    description:
      'Senior Backend Software Engineer — Java, Spring Boot, Node.js, React, C#/.NET.',
    url: 'https://snowye.dev',
    images: [{ url: '/static/images/me.jpeg', width: 336, height: 336 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gabriel Trzimajewski',
    images: ['/static/images/me.jpeg']
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
    <>
      <SiteJsonLd locale={locale} />
      <PersonJsonLd locale={locale} />
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale] as unknown as Record<string, unknown>}
      >
        <TooltipProvider delayDuration={150}>
          <div className="relative z-0 flex min-h-screen flex-col">
            {/* overflow-hidden: the WebGL canvas carries explicit pixel
                  dimensions, so it must never be able to grow the document. */}
            <div className="absolute inset-0 h-full w-full overflow-hidden">
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
    </>
  );
}
