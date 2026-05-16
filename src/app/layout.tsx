import { Fira_Code } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/cn';
import '../styles/globals.css';

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
        {children}
      </body>
    </html>
  );
}
