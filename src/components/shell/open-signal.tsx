import { cn } from '@/lib/cn';

/** The derived Open Signal (CONTEXT.md): calm, never urgent. */
export function OpenSignal({
  label,
  className
}: {
  label: string;
  className?: string;
}) {
  return (
    <p className={cn('flex items-center gap-2', className)}>
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#7ee2a8] opacity-40 motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-[#7ee2a8]" />
      </span>
      {label}
    </p>
  );
}
