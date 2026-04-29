import createJiti from 'jiti';
import createNextIntlPlugin from 'next-intl/plugin';

const jiti = createJiti(new URL(import.meta.url).pathname);

jiti('./src/env.ts');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // App Router i18n is handled by next-intl middleware (see src/middleware.ts).
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI }
};

// export default MillionLint.next({ rsc: true })(nextConfig);
export default withNextIntl(nextConfig);
