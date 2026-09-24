import { NotFoundView } from '@/components/shell/not-found-view';

// Catches any unmatched route outside the [locale] segment.
// next-intl middleware normally rewrites unknown paths into a locale,
// so this is a safety net for static/edge cases. Hardcoded to English.
export default function GlobalNotFound() {
  return (
    <NotFoundView
      title="four oh four"
      description="This page doesn't exist or may have moved. Choose where to go next:"
      whereTo="Where did you mean to go?"
      noMatch="Nothing matches. The sitemap lists every page."
      destinations={[
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Projects', href: '/projects' },
        { label: 'CV', href: '/cv' },
        { label: 'Contact', href: '/contact' },
        { label: 'Sitemap', href: '/sitemap.xml' },
        { label: 'Agent instructions', href: '/llms.txt' }
      ]}
    />
  );
}
