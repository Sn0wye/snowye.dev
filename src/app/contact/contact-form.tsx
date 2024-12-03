'use client';

import { Button } from '@/components/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/form';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { useToast } from '@/components/use-toast';
import { contact } from '@/locales/en/pages/contact';
import { type EmailSchema, emailSchema } from '@/schemas/emails';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlausible } from 'next-plausible';
import { useForm } from 'react-hook-form';

export const ContactForm = () => {
  const form = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema)
  });

  const { toast } = useToast();
  const plausible = usePlausible();

  const onSubmit = async (data: EmailSchema) => {
    try {
      await fetch('/email', {
        body: JSON.stringify(data),
        method: 'POST'
      });

      plausible('send-email', {
        props: {
          name: data.name,
          email: data.email,
          message: data.message
        }
      });

      toast({
        title: contact.toast.success.title,
        description: contact.toast.success.description
      });
      form.reset();
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-[400px] space-y-2'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{contact.labels.name}</FormLabel>
              <Input placeholder='John Doe' {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{contact.labels.email}</FormLabel>
              <Input placeholder='john@doe.com' {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='message'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{contact.labels.message}</FormLabel>
              <Textarea placeholder='john@doe.com' {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='!mt-5 w-full border transition-colors hover:border-white hover:bg-transparent hover:text-white'
          type='submit'
        >
          {contact.send}
        </Button>
      </form>
    </Form>
  );
};
