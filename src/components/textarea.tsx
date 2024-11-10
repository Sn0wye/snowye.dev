import { cn } from '@/lib/cn';
import type * as React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};
Textarea.displayName = 'Textarea';

export { Textarea };
