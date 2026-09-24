import { headers } from 'next/headers';
import { cn } from '@/lib/cn';
import { geist } from '@/styles/fonts';
import '../styles/globals.css';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get('x-site-locale') === 'pt' ? 'pt' : 'en';

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className={cn(geist)}>
        {children}
      </body>
    </html>
  );
}
