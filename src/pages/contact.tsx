/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from '@hookform/resolvers/zod';
import Head from 'next/head';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Base } from '../components/Base';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Textarea
} from '../components/containers/Contact/styles';
import { Toast } from '../components/Toast';
import { api } from '../lib/api';
import { emailSchema, type EmailSchema } from '../schemas/emails';
import { stripHtml } from '../utils/stripHtml';
import { contact } from '../locales/en/pages/contact';

interface ContactProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function Contact({
  primaryColor,
  secondaryColor
}: ContactProps) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema)
  });

  const onSubmit = async (data: EmailSchema) => {
    try {
      await api.post('/email', data);
      setIsEmailSent(true);
      setShowToast(true);
      reset();
    } catch (e) {
      console.error(e);
      setIsEmailSent(false);
      setShowToast(true);
    }
  };

  const description = (
    <p>
      <strong>I love chatting</strong> with software engineers, tech founders,
      students, and creators. <strong>I'm a busy person</strong>, so I can't
      promise that I'll reply to your email right away, but I'll try my best to
      respond in a timely manner.
    </p>
  );

  return (
    <Base
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      title={contact.title}
      tagline={contact.tagline}
    >
      <Head>
        <title>{contact.title}</title>
        <meta content={contact.title} property='og:title' />
        <meta content={stripHtml(String(description))} name='description' />
        <meta
          content={stripHtml(String(description))}
          property='og:description'
        />
        <meta content='https://github.dev/contact' property='og:url' />
      </Head>

      <div>
        {description}
        <h2>{contact.email}</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor='name'>{contact.labels.name}</Label>
            <Input placeholder='John Doe' {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='email'>{contact.labels.email}</Label>
            <Input placeholder='john@doe.com' {...register('email')} />
            {errors.email && <p>{errors.email.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='message'>{contact.labels.message}</Label>
            <Textarea
              placeholder={contact.placeholders.message}
              rows={4}
              {...register('message')}
            />
            {errors.message && <p>{errors.message.message}</p>}
          </FormGroup>
          <FormGroup>
            <Button type='submit'>{contact.send}</Button>
          </FormGroup>
        </Form>

        <Toast
          title={
            isEmailSent ? contact.toast.success.title : contact.toast.fail.title
          }
          description={
            isEmailSent
              ? contact.toast.success.description
              : contact.toast.fail.description
          }
          isSuccess={isEmailSent}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </div>
    </Base>
  );
}

export const getStaticProps = () => {
  const meta = {
    primaryColor: 'purple',
    secondaryColor: 'cyan'
  };

  return { props: meta };
};
