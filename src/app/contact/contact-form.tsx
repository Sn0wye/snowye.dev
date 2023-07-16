'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Textarea
} from '@/components/containers/Contact/styles';
import { Toast } from '@/components/Toast';
import { api } from '@/lib/api';
import { contact } from '@/locales/en/pages/contact';
import { emailSchema, type EmailSchema } from '@/schemas/emails';

export const ContactForm = () => {
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

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="name">{contact.labels.name}</Label>
          <Input placeholder="John Doe" {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">{contact.labels.email}</Label>
          <Input placeholder="john@doe.com" {...register('email')} />
          {errors.email && <p>{errors.email.message}</p>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="message">{contact.labels.message}</Label>
          <Textarea
            placeholder={contact.placeholders.message}
            rows={4}
            {...register('message')}
          />
          {errors.message && <p>{errors.message.message}</p>}
        </FormGroup>
        <FormGroup>
          <Button type="submit">{contact.send}</Button>
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
    </>
  );
};
