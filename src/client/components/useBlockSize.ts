import { type RefObject, useLayoutEffect } from 'react';

/**
 * Writes the rendered height of a sticky element to a CSS custom property while it is mounted
 * (WP5-UX-AX-01, WCAG 2.2 SC 2.4.11). The stylesheet turns the property into scroll padding (and a
 * sticky offset), so a control that takes focus scrolls clear of the bar whatever height it wraps to.
 * The property goes on `host` (the document root when absent) and is removed again on unmount, so the
 * stylesheet's default applies. CSSOM writes are not inline style markup, so the page CSP allows them.
 */
export function useBlockSizeProperty(element: RefObject<HTMLElement | null>, property: `--${string}`, host?: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const node = element.current;
    const target = host === undefined ? document.documentElement : host.current;
    if (node === null || target === null) return;
    const write = () => target.style.setProperty(property, `${node.getBoundingClientRect().height}px`);
    write();
    const observer = new ResizeObserver(write);
    observer.observe(node);
    return () => {
      observer.disconnect();
      target.style.removeProperty(property);
    };
  }, [element, property, host]);
}
