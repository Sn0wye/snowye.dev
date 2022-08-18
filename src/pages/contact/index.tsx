import { zodResolver } from '@hookform/resolvers/zod';
import Head from 'next/head';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Base } from '../../components/Base';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Textarea,
} from '../../components/Contact/styles';
import { Toast } from '../../components/Toast';
import { api } from '../../lib/api';
import { emailSchema, IEmailInputs } from '../../schemas/Email';
import { stripHtml } from '../../utils/stripHtml';

interface ContactProps {
  title: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function Contact({
  title,
  tagline,
  primaryColor,
  secondaryColor,
}: ContactProps) {
  const description = `<strong>I love chatting</strong> with software engineers, tech founders, students, and creators. <strong>I'm a busy person</strong>, so I can't promise that I'll reply to your email right away, but I'll try my best to respond in a timely manner.`;
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmailInputs>({
    resolver: zodResolver(emailSchema),
  });

  async function onSubmit(data: IEmailInputs) {
    try {
      await api.post('/email', data);
      setIsEmailSent(true);
      setShowToast(true);
    } catch (e) {
      console.error(e);
      setIsEmailSent(false);
      setShowToast(true);
    }
  }

  return (
    <Base
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      title={title}
      tagline={tagline}
    >
      <Head>
        <title>{title}</title>
        <meta content={title} property='og:title' />
        <meta content={stripHtml(description)} name='description' />
        <meta content={stripHtml(description)} property='og:description' />
        <meta content='https://github.dev/contact' property='og:url' />
      </Head>

      <div>
        <p dangerouslySetInnerHTML={{ __html: description }} />
        <h2>Send an email</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor='name'>Name</Label>
            <Input placeholder='John Doe' {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='email'>Email</Label>
            <Input placeholder='john@doe.com' {...register('email')} />
            {errors.email && <p>{errors.email.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              placeholder='Your message here :P'
              rows={4}
              {...register('message')}
            />
            {errors.message && <p>{errors.message.message}</p>}
          </FormGroup>
          <FormGroup>
            <Button type='submit'>Send</Button>
          </FormGroup>
        </Form>

        <Toast
          title={isEmailSent ? 'Email sent :D' : 'Error :('}
          description={
            isEmailSent
              ? 'Thanks for taking the time to write it.'
              : 'Something wrong happened. Try again later.'
          }
          isSuccess={isEmailSent}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </div>
    </Base>
  );
}

export async function getStaticProps() {
  const meta = {
    title: 'Contact || Gabriel Trzimajewski',
    tagline: 'Email me. As in the good old days.',
    primaryColor: 'purple',
    secondaryColor: 'cyan',
  };

  return { props: meta };
}
