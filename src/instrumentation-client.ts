import posthog from 'posthog-js';

import { env } from '@/env';

const token = env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = env.NEXT_PUBLIC_POSTHOG_HOST;

if (token && host) {
  posthog.init(token, {
    api_host: host,
    defaults: '2026-08-30'
  });
}
