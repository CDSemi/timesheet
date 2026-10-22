import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

/**
 * The scrolling box of a table (WP5-UX5-FIX1, WCAG 2.1.1 and 4.1.2). A table that is wider than its box scrolls sideways, and a
 * scrolling box that nothing inside can focus has no keyboard stop, so a keyboard user could not reach the cut-off columns. While the
 * content overflows, the box is a named, focusable region (`tabindex="0"`, `role="region"`, `aria-label` = what the table lists)
 * and takes the shared focus ring; while it fits, it is a plain box, so a short table adds no tab stop and no landmark. The
 * overflow is measured before the first paint and again whenever the box or the table changes size.
 */
export function TableWrap({ label, children }: { label: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  useLayoutEffect(() => {
    const element = box.current;
    if (element === null) return;
    const measure = () => setScrolls(element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="table-wrap" {...(scrolls ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}>
      {children}
    </div>
  );
}
