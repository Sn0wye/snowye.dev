'use client';

import { Command as CommandPrimitive } from 'cmdk';
import type * as React from 'react';
import { cn } from '@/lib/cn';

const Command = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn(
      'w-full overflow-hidden rounded-2xl bg-black p-2 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/10 transition-transform duration-100 ease-out [&_:not([hidden])+[cmdk-group]]:mt-3',
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
      'mb-2 h-12 w-full border-white/[0.06] border-b bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-white/35',
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
      'h-[min(360px,var(--cmdk-list-height))] scroll-py-2 overflow-auto overscroll-contain transition-[height] duration-200 ease-out',
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
    className="flex h-12 items-center justify-center text-[13px] text-white/40"
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
      '**:[[cmdk-group-heading]]:mb-1 **:[[cmdk-group-heading]]:select-none **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:text-white/35',
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
    className={cn('my-1 h-px w-full bg-white/[0.06]', className)}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/**
 * The highlight is not painted here: the palette slides one shared element
 * between items, so an item only brightens its own text.
 */
const CommandItem = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      'group relative isolate flex h-11 cursor-pointer select-none items-center gap-3 rounded-lg px-3 text-[14px] text-white/55 transition-colors duration-150 data-[selected=true]:text-white [&_svg]:size-4',
      className
    )}
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
        'ml-auto text-[11px] tracking-widest text-white/40',
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
};
