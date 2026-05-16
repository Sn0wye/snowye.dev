import * as z from 'zod';

export const emailSchema = z.object({
  name: z.string().min(1, {
    message: 'Please enter your name!'
  }),
  email: z
    .email({
      message: 'Please enter a valid email!'
    })
    .min(1, {
      message: 'Please enter your email!'
    }),
  message: z.string().min(1, {
    message: 'Why send an empty message?'
  })
});

export interface EmailSchema {
  name: string;
  email: string;
  message: string;
}
