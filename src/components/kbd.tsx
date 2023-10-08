import * as React from 'react';
import { cva, type VariantProps } from 'cva';

export type KbdProps = React.ComponentProps<'kbd'> &
  VariantProps<typeof kbdStyles> & {
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
  };

const kbdStyles = cva({
  base: 'text-zinc-100 bg-zinc-950 inline-flex items-center justify-center shadow-[0_0_0_1px_hsla(0,0%,100%,.14)] text-center rounded space-x-2',
  variants: {
    size: {
      sm: 'text-xs leading-6 min-w-[20px] h-[20px] p-0',
      md: 'text-sm leading-8 min-w-[24px] h-[24px] px-2 py-0 '
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

const Kbd = React.forwardRef<HTMLDivElement, KbdProps>(
  (
    {
      className,
      meta = false,
      shift = false,
      alt = false,
      ctrl = false,
      size,
      children,
      ...props
    },
    ref
  ) => {
    const getChildren = () => {
      const childrenArray: string[] = [];

      if (meta) {
        childrenArray.push('⌘');
      }

      if (shift) {
        childrenArray.push('⇧');
      }

      if (alt) {
        childrenArray.push('⌥');
      }

      if (ctrl) {
        childrenArray.push('⌃');
      }

      if (typeof children === 'string') {
        children.split(' ').forEach(key => childrenArray.push(key));
      }

      return childrenArray;
    };

    // meta = ⌘
    // shift = ⇧
    // alt = ⌥
    // ctrl = ⌃

    return (
      <kbd className={kbdStyles({ className, size })} ref={ref} {...props}>
        {getChildren().map((key, index) => (
          <span key={index}>{key}</span>
        ))}
      </kbd>
    );
  }
);
Kbd.displayName = 'Kbd';

export { Kbd };
