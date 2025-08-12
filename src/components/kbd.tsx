import { type VariantProps, cva } from 'cva';
import type * as React from 'react';

export type KbdProps = React.ComponentProps<'kbd'> &
  VariantProps<typeof kbdStyles> & {
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
  };

const kbdStyles = cva({
  base: 'aspect-square inline-flex justify-center items-center border font-mono leading-none rounded-[4px] bg-black border-zinc-800 text-white',
  variants: {
    size: {
      sm: 'text-xs leading-6 min-h-[20px] min-w-[20px]',
      md: 'text-sm leading-8 min-w-[24px] h-[24px] [&>svg]:size-4'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

const Kbd = ({
  className,
  meta = false,
  shift = false,
  alt = false,
  ctrl = false,
  size,
  children,
  ...props
}: KbdProps) => {
  const getChildren = () => {
    const childrenArray: React.ReactNode[] = [];

    if (meta) {
      childrenArray.push(<Command key="meta" />);
    }

    if (shift) {
      childrenArray.push(<Shift key="shift" />);
    }

    if (alt) {
      childrenArray.push(<Option key="alt" />);
    }

    if (ctrl) {
      childrenArray.push(<Control key="ctrl" />);
    }

    if (typeof children === 'string') {
      let charIndex = 0;
      for (const char of children) {
        childrenArray.push(
          <span key={`char-${char}-${charIndex++}`}>{char}</span>
        );
      }
    }

    return childrenArray;
  };

  return (
    <kbd className={kbdStyles({ className, size })} {...props}>
      {getChildren()}
    </kbd>
  );
};

export { Kbd };

const Command = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      className="size-3"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Command key Icon</title>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
};

const Option = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      className="size-3"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Option key Icon</title>
      <path d="M3 3h6l6 18h6" />
      <path d="M14 3h7" />
    </svg>
  );
};

const Shift = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      className="size-3"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Shift key Icon</title>
      <path d="M9 18v-6H5l7-7 7 7h-4v6H9z" />
    </svg>
  );
};

const Control = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      className="size-3"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Control key Icon</title>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
};
