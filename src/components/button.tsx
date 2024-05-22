import { cn } from '@/lib/cn';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'cva';
import * as React from 'react';

const buttonVariants = cva({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300',
  variants: {
    variant: {
      default: 'shadow bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90',
      destructive: 'shadow-smbg-red-900 text-zinc-50 hover:bg-red-900/90',
      outline:
        'border bg-transparent shadow-sm border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50',
      secondary: 'shadow-sm bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80',
      ghost: 'hover:bg-zinc-800 hover:text-zinc-50',
      link: 'underline-offset-4 hover:underline text-zinc-50'
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
