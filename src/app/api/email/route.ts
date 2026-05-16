import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from 'react-email';
import EmailTemplate from '@/email/EmailTemplate';
import { env } from '@/env';
import { withRateLimit } from '@/lib/ratelimit';
import { emailSchema } from '@/schemas/emails';

export const POST = withRateLimit({
  identifier: 'contact-form',
  limit: 1,
  windowMs: 30 * 1000 // 30 seconds
})(async (req: Request) => {
  if (req.method === 'POST') {
    try {
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
      const emailHtml = await render(
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
});
