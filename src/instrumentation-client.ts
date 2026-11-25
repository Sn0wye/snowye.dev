import posthog from 'posthog-js';

import { env } from '@/env';

const config = {
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  NEXT_PUBLIC_POSTHOG_HOST: env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_POSTHOG_UI_HOST: env.NEXT_PUBLIC_POSTHOG_UI_HOST
};

const missing = Object.entries(config).find(([, value]) => !value)?.[0];

if (missing) {
  // Production stays a no-op; development fails loudly.
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      `${missing} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missing} is configured`
    );
  }
} else {
  posthog.init(config.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    // Same-origin path rewritten to PostHog in next.config.mjs.
    api_host: config.NEXT_PUBLIC_POSTHOG_HOST,
    ui_host: config.NEXT_PUBLIC_POSTHOG_UI_HOST,
    defaults: '2026-08-30'
  });
}
