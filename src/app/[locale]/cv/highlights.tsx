import { cn } from '@/lib/cn';

/**
 * Every highlight ships in the HTML; the overflow is hidden with CSS only.
 *
 * This is deliberate (ADR-0002): an answer engine that does not run JavaScript
 * still sees all of them, while a human sees a page rather than a wall.
 */
export const Highlights = ({
  id,
  items,
  showAll,
  showLess,
  visible = 4
}: {
  id: string;
  items: string[];
  showAll: string;
  showLess: string;
  visible?: number;
}) => {
  if (items.length === 0) return null;

  const toggleId = `highlights-${id}`;
  const hidden = items.length - visible;

  return (
    <div className="group">
      {hidden > 0 && (
        <input type="checkbox" id={toggleId} className="sr-only" />
      )}
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item}
            className={cn(
              'relative pl-5 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-2.5 before:bg-white/25',
              index >= visible && hidden > 0 && 'hidden group-has-checked:block'
            )}
          >
            {item}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <label
          htmlFor={toggleId}
          className="mt-3 inline-block cursor-pointer text-[13px] text-primary underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white/70"
        >
          <span className="group-has-checked:hidden">
            {showAll.replace('{count}', String(items.length))}
          </span>
          <span className="hidden group-has-checked:inline">{showLess}</span>
        </label>
      )}
    </div>
  );
};
