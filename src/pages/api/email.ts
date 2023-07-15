import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { env } from '@/env.mjs';
import { EmailTemplate } from '@/email/EmailTemplate';
import { render } from '@react-email/components';
import { emailSchema } from '@/schemas/emails';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(1, '30 s')
});

export default async function SendMail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const ip = req.headers['x-forwarded-for'] as string;
      const { success, reset } = await ratelimit.limit(ip ?? 'anonymous');

      if (!success) {
        const now = Date.now();
        const retryAfter = Math.floor((reset - now) / 1000);
        return new Response(
          JSON.stringify({
            message: `Rate limit exceeded. Try again in ${reset} seconds.`
          }),
          {
            headers: {
              'retry-after': `${retryAfter}`
            }
          }
        );
      }

      const parsedBody = emailSchema.safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(400).json({
          message: `Invalid request body - ${parsedBody.error.message}`
        });
      }
      const { data } = parsedBody;
      const emailHtml = render(
        EmailTemplate({
          message: data.message,
          name: data.name
        })
      );

      const mailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        auth: {
          user: env.NODEMAILER_USER,
          pass: env.NODEMAILER_PASSWORD
        }
      });

      const smh = await mailTransporter.sendMail({
        from: data.name,
        to: env.NODEMAILER_USER,
        subject: `${data.name} - via snowye.dev`,
        html: emailHtml
      });

      return res.status(200).json({ message: 'Email sent' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      res
        .status(500)
        .json({ message: `Email not sent - Error: ${err.message}` });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
}
