import type { MetadataRoute } from 'next';

/**
 * LLM crawlers are explicitly welcome: the CV Page exists to be cited when
 * someone asks an answer engine who Gabriel Trzimajewski is (ADR-0002).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://snowye.dev/sitemap.xml',
    host: 'https://snowye.dev'
  };
}
