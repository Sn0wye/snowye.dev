import { EmailTemplate } from '@/email/EmailTemplate';
import { env } from '@/env';
import { emailSchema } from '@/schemas/emails';
import { render } from '@react-email/components';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(1, '30 s')
});

export const POST = async (req: Request) => {
  if (req.method === 'POST') {
    try {
      const ip = req.headers.get('x-forwarded-for') as string;
      const { success, reset } = await ratelimit.limit(ip ?? 'anonymous');

      if (!success) {
        const now = Date.now();
        const retryAfter = Math.floor((reset - now) / 1000);
        return NextResponse.json(
          {
            message: `Rate limit exceeded. Try again in ${reset} seconds.`
          },
          {
            headers: {
              'retry-after': `${retryAfter}`
            }
          }
        );
      }

      const body = await req.json();
      const parsedBody = emailSchema.safeParse(body);

      if (!parsedBody.success) {
        return NextResponse.json(
          {
            message: `Invalid request body - ${parsedBody.error.message}`
          },
          {
            status: 400
          }
        );
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

      await mailTransporter.sendMail({
        from: data.name,
        to: env.NODEMAILER_USER,
        subject: `${data.name} - via snowye.dev`,
        html: emailHtml
      });

      return NextResponse.json({ message: 'Email sent' }, { status: 200 });
    } catch (err) {
      if (err instanceof Error) {
        NextResponse.json(
          {
            message: `Email not sent - Error: ${err?.message}`
          },
          {
            status: 500
          }
        );
      }
    }
  }
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
};
