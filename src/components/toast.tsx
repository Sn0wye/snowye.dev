'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'cva';
import type * as React from 'react';
import { cn } from '@/lib/cn';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Viewport>) => (
  <ToastPrimitives.Viewport
    className={cn(
      'fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva({
  base: 'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl p-4 pr-8 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.9)] ring-1 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none data-[state=open]:animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[toast-out_0.2s_ease-in_forwards] motion-reduce:animate-none',
  variants: {
    variant: {
      default: 'bg-black text-primary ring-white/10',
      destructive: 'destructive group bg-red-950 text-primary ring-red-900'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

const Toast = ({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>) => {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
};
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Action>) => (
  <ToastPrimitives.Action
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-zinc-800/40  group-[.destructive]:hover:border-red-900/30 group-[.destructive]:hover:bg-red-900 group-[.destructive]:hover:text-zinc-50 group-[.destructive]:focus:ring-red-900',
      className
    )}
    {...props}
  />
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Close>) => (
  <ToastPrimitives.Close
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-white/40 opacity-0 transition-opacity hover:text-zinc-50  focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Title>) => (
  <ToastPrimitives.Title
    className={cn(
      'text-[14px] font-medium text-primary [&+div]:text-[13px]',
      className
    )}
    {...props}
  />
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Description>) => (
  <ToastPrimitives.Description
    className={cn('text-[13px] text-secondary', className)}
    {...props}
  />
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentProps<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport
};
