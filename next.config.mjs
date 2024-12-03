import createJiti from 'jiti';
import { withPlausibleProxy } from 'next-plausible';

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

// export default MillionLint.next({ rsc: true })(nextConfig);
export default withPlausibleProxy({
  customDomain: 'https://plausible.snowye.dev'
})(nextConfig);
