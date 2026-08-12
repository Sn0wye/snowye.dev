import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://snowye.dev';
const PATHS = ['', '/about', '/cv', '/projects', '/contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap(locale => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

    return PATHS.map(path => ({
      url: `${BASE_URL}${prefix}${path}`,
      lastModified: new Date(),
      // The CV is the page meant to be found and cited.
      priority: path === '/cv' || path === '' ? 1 : 0.7
    }));
  });
}
