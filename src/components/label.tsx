'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'cva';
import type * as React from 'react';
import { cn } from '@/lib/cn';

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
