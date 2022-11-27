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
  Textarea
} from '../../components/containers/Contact/styles';
import { Toast } from '../../components/Toast';
import { api } from '../../lib/api';
import { getLocaleProps, useI18n } from '../../locales';
import { emailSchema, IEmailInputs } from '../../schemas/Email';
import { stripHtml } from '../../utils/stripHtml';

interface ContactProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function Contact({
  primaryColor,
  secondaryColor
}: ContactProps) {
  const { scopedT } = useI18n();
  const t = scopedT('pages.contact');

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IEmailInputs>({
    resolver: zodResolver(emailSchema)
  });

  async function onSubmit(data: IEmailInputs) {
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
  }

  return (
    <Base
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      title={t('title')}
      tagline={t('tagline')}
    >
      <Head>
        <title>{t('title')}</title>
        <meta content={t('title')} property='og:title' />
        <meta content={stripHtml(t('description'))} name='description' />
        <meta content={stripHtml(t('description'))} property='og:description' />
        <meta content='https://github.dev/contact' property='og:url' />
      </Head>

      <div>
        <p dangerouslySetInnerHTML={{ __html: t('description') }} />
        <h2>{t('email')}</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor='name'>{t('labels.name')}</Label>
            <Input placeholder='John Doe' {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='email'>{t('labels.email')}</Label>
            <Input placeholder='john@doe.com' {...register('email')} />
            {errors.email && <p>{errors.email.message}</p>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='message'>{t('labels.message')}</Label>
            <Textarea
              placeholder={t('placeholders.message')}
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
          title={isEmailSent ? t('toast.success.title') : t('toast.fail.title')}
          description={
            isEmailSent
              ? t('toast.success.description')
              : t('toast.fail.description')
          }
          isSuccess={isEmailSent}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </div>
    </Base>
  );
}

export const getStaticProps = getLocaleProps(() => {
  const meta = {
    primaryColor: 'purple',
    secondaryColor: 'cyan'
  };

  return { props: meta };
});
