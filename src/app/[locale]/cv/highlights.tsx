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
      <ul>
        {items.map((item, index) => (
          <li
            key={item}
            className={
              index >= visible && hidden > 0
                ? 'hidden group-has-checked:list-item'
                : undefined
            }
          >
            {item}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <label
          htmlFor={toggleId}
          className="cursor-pointer text-sm text-primary underline underline-offset-4"
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
