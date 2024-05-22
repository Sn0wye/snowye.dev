import { Base } from '@/components/base';
import { contact } from '@/locales/en/pages/contact';
import { stripHtml } from '@/utils/stripHtml';
import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata = {
  title: contact.title,
  description: stripHtml(contact.description),
  openGraph: {
    description: stripHtml(contact.description),
    url: 'https://github.dev/contact'
  }
} satisfies Metadata;

export default function Contact() {
  const meta = {
    primaryColor: 'purple',
    secondaryColor: 'cyan'
  } as const;

  const description = (
    <p>
      <strong>I love chatting</strong> with software engineers, tech founders,
      students, and creators. <strong>I&apos;m a busy person</strong>, so I
      can&apos;t promise that I&apos;ll reply to your email right away, but
      I&apos;ll try my best to respond in a timely manner.
    </p>
  );

  return (
    <Base
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
      title={contact.title}
      tagline={contact.tagline}
    >
      <div>
        {description}
        <h2>{contact.email}</h2>
        <ContactForm />
      </div>
    </Base>
  );
}
