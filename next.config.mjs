import createNextIntlPlugin from 'next-intl/plugin';
import './src/env.ts';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router i18n is handled by next-intl middleware (see src/middleware.ts).
  typescript: { ignoreBuildErrors: !!process.env.CI },
  // Reverse proxy for PostHog so ad blockers don't drop events. Assets and
  // remote config must hit the assets host and come before the catch-all.
  // /relay is excluded from the i18n proxy matcher in src/proxy.ts.
  rewrites: () => [
    {
      source: '/relay/static/:path*',
      destination: 'https://us-assets.i.posthog.com/static/:path*'
    },
    {
      source: '/relay/array/:path*',
      destination: 'https://us-assets.i.posthog.com/array/:path*'
    },
    {
      source: '/relay/:path*',
      destination: 'https://us.i.posthog.com/:path*'
    }
  ],
  // ytd dropped its `down` subcommand, and the moment named after it moved.
  redirects: () => [
    {
      source: '/craft/ytd-down',
      destination: '/craft/download',
      permanent: true
    },
    {
      source: '/:locale(en|pt)/craft/ytd-down',
      destination: '/:locale/craft/download',
      permanent: true
    }
  ]
};

export default withNextIntl(nextConfig);
