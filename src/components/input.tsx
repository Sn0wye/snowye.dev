import { cn } from '@/lib/cn';
import type * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, type, ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm  file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};
Input.displayName = 'Input';

export { Input };
