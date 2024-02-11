import createJiti from 'jiti';

const jiti = createJiti(new URL(import.meta.url).pathname);

jiti('./src/env.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // i18n: {
  //   locales: ['en', 'pt'],
  //   defaultLocale: 'en'
  // },
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI }
};

export default nextConfig;
