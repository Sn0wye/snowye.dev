import { PageShell } from '@/components/shell/page-shell';
import { richText } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import type { AppLocale } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { moments, projects } from '@/motion/registry';
import { stripHtml } from '@/utils/stripHtml';

import { Gallery } from './gallery';
import { SlowMoHint } from './slow-mo';

/**
 * The craft page. /craft and /craft/<slug> both render it; the slug only
 * decides which moment starts open, so a shared link lands on the page
 * with that moment already in front.
 */
export async function CraftIndex({ locale }: { locale: AppLocale }) {
  const t = await getT();
  const copy = t.pages.craft;

  return (
    <PageShell
      current="/craft"
      title={t.common.navbar.craft}
      tagline={copy.tagline}
    >
      <WebPageJsonLd
        locale={locale}
        path="/craft"
        type="CollectionPage"
        name={copy.title}
        description={stripHtml(copy.description)}
      />
      <p
        className={cn('mt-6 max-w-2xl', richText)}
        // The copy ships with <strong> emphasis.
        dangerouslySetInnerHTML={{ __html: copy.description }}
      />
      <SlowMoHint text={copy.slowHint} />
      <Gallery
        projects={projects}
        moments={moments}
        locale={locale}
        copy={{
          live: copy.stage.live,
          recording: copy.stage.recording,
          close: copy.close,
          previous: copy.previous,
          next: copy.next,
          stage: copy.stage
        }}
      />
    </PageShell>
  );
}
