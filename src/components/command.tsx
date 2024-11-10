'use client';

import { cn } from '@/lib/cn';
import { Command as CommandPrimitive } from 'cmdk';
/* eslint-disable react/no-unknown-property */
import type * as React from 'react';

const Command = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn(
      'w-full min-w-[640px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-[var(--cmdk-shadow)] duration-100 ease-in-out  [&_:not([hidden])_+_[cmdk-group]]:mt-2 [&_[cmdk-group-heading]]:px-2',
      className
    )}
    {...props}
  />
);
Command.displayName = CommandPrimitive.displayName;

const CommandInput = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) => (
  <CommandPrimitive.Input
    className={cn(
      'mb-4 w-full rounded-none border-b border-zinc-800 bg-transparent px-2 pb-4 pt-2 text-lg text-zinc-50 outline-none placeholder:text-zinc-400',
      className
    )}
    {...props}
  />
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn(
      'h-[min(330px,calc(var(--cmdk-list-height)))] max-h-[400px] overflow-auto overscroll-contain transition-[height] duration-100 ease-in-out',
      className
    )}
    {...props}
  />
);
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = (
  props: React.ComponentProps<typeof CommandPrimitive.Empty>
) => (
  <CommandPrimitive.Empty
    className="flex h-12 items-center justify-center whitespace-pre-wrap text-sm text-zinc-400"
    {...props}
  />
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      '[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:select-none [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-zinc-400',
      className
    )}
    {...props}
  />
);
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator
    className={cn('my-1 h-px w-full bg-zinc-800', className)}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      '[selected="true"]:bg-white/5 flex h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-zinc-400 transition-all transition-none duration-150 ease-in-out will-change-[background,color] active:bg-zinc-800 active:transition-colors data-[selected="true"]:bg-white/5 data-[selected="true"]:text-zinc-100 [&+&]:mt-1 [&_svg]:h-4 [&_svg]:w-4',
      className
    )}
    style={{
      contentVisibility: 'auto'
    }}
    {...props}
  />
);
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-zinc-500 dark:text-zinc-400',
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
};
