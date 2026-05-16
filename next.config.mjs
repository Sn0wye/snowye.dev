import createNextIntlPlugin from 'next-intl/plugin';
import './src/env.ts';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router i18n is handled by next-intl middleware (see src/middleware.ts).
  typescript: { ignoreBuildErrors: !!process.env.CI }
};

export default withNextIntl(nextConfig);
