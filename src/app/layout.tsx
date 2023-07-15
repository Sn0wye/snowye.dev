import { type Metadata } from 'next';
import { getCssText } from 'stitches.config';
import { CommandBar } from '@/components/CommandBar';

export const metadata = {
  title: 'Gabriel Trzimajewski',
  creator: 'Gabriel Trzimajewski',
  alternates: {
    canonical: 'https://snowye.dev',
    languages: {
      'en': 'https://snowye.dev'
      // 'pt': 'https://snowye.dev/pt'
    }
  },
  twitter: {
    card: 'summary_large_image',
    site: '@snowyedev',
    creator: '@snowyedev'
  },
  authors: [
    {
      name: 'Gabriel Trzimajewski',
      url: 'https://snowye.dev'
    }
  ],
  themeColor: '#08070b',
  colorScheme: 'dark',
  keywords: ['Gabriel Trzimajewski', 'Snowye', 'snowyedotdev', 'snowye.dev'],
  openGraph: {
    type: 'website',
    title: 'Gabriel Trzimajewski',
    locale: 'en_US',
    url: 'https://snowye.dev'
  }
} satisfies Metadata;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <head>
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </head>
      <body>
        <CommandBar>{children}</CommandBar>
      </body>
    </html>
  );
}
