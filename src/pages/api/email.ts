import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { type IEmailInputs } from '../../schemas/Email';

export default async function SendMail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const data: IEmailInputs = req.body;

      const mailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD
        }
      });

      const mailDetails = {
        from: data.name,
        to: String(process.env.NODEMAILER_USER),
        subject: `${data.name} - via snowye.dev`,
        text: `
        Name: ${data.name}
        Email: ${data.email}
        ${data.message}`
      };

      await mailTransporter.sendMail(mailDetails);
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
