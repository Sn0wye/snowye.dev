import Head from 'next/head';
import { Base } from '@/components/Base';
import { stripHtml } from '@/utils/stripHtml';
import { contact } from '@/locales/en/pages/contact';
import { ContactForm } from './contact-form';

export default function Contact() {
  const meta = {
    primaryColor: 'purple',
    secondaryColor: 'cyan'
  };

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
      <Head>
        <title>{contact.title}</title>
        <meta content={contact.title} property="og:title" />
        <meta content={stripHtml(String(description))} name="description" />
        <meta
          content={stripHtml(String(description))}
          property="og:description"
        />
        <meta content="https://github.dev/contact" property="og:url" />
      </Head>

      <div>
        {description}
        <h2>{contact.email}</h2>
        <ContactForm />
      </div>
    </Base>
  );
}
