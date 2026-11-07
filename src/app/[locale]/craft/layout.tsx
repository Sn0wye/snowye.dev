import { getT } from '@/i18n/server-t';
import { TimeScaleProvider } from '@/lib/time-scale';
import { SlowMoBadge } from './slow-mo';

/** One clock speed for every moment on the page, index and breakdown alike. */
export default async function CraftLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = await getT();

  return (
    <TimeScaleProvider>
      {children}
      <SlowMoBadge label={t.pages.craft.slowBadge} />
    </TimeScaleProvider>
  );
}
