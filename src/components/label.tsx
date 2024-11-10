'use client';

import { cn } from '@/lib/cn';
import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps, cva } from 'cva';
import type * as React from 'react';

const labelVariants = cva({
  base: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
});

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;

const Label = ({ className, ...props }: LabelProps) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
