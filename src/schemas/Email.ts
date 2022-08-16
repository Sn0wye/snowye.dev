import * as z from 'zod';

export const EmailSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});
