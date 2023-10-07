'use client';

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
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { contact } from '@/locales/en/pages/contact';
import { emailSchema, type EmailSchema } from '@/schemas/emails';

export const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema)
  });

  const { toast } = useToast();

  const onSubmit = async (data: EmailSchema) => {
    try {
      await api.post('/email', data);

      toast({
        title: contact.toast.success.title,
        description: contact.toast.success.description
      });
      reset();
    } catch (e) {
      console.error(e);

      toast({
        variant: 'destructive',
        title: contact.toast.fail.title,
        description: contact.toast.fail.description
      });
    }
  };

  return (
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
  );
};
