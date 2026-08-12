//@ts-check
import { createEnv } from '@t3-oss/env-nextjs';
import { vercel } from '@t3-oss/env-nextjs/presets-zod';
import { z } from 'zod';

export const env = createEnv({
  extends: [vercel()],
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production'])
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV
  },
  skipValidation: !!process.env.CI
});
