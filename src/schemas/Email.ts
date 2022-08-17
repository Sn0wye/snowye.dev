import * as z from 'zod';

export const emailSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export interface IEmailInputs {
  name: string;
  email: string;
  message: string;
}
