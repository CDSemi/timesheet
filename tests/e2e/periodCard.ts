import type { Page } from '@playwright/test';

/*
 * Measuring the period card (WP5-UX5-T04, U5-09 to U5-14). The specs read the card's geometry from the browser's own layout and compare it
 * with the rules of the plan: they never reuse the style sheet's thresholds. The test compiler has no DOM library, so the page code is a
 * string; a page cannot add a `<style>` element (the CSP blocks it), so a form of the range is measured by hiding parts through the CSSOM.
 */

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/** The boxes of the card's parts as the browser laid them out, or null for a part that is not on the card. */
const CARD_PARTS_SCRIPT = `(() => {
  const toBox = (rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height });
  const box = (selector) => {
    const element = document.querySelector(selector);
    return element === null ? null : toBox(element.getBoundingClientRect());
  };
  const pills = [...document.querySelectorAll('.period-pills .badge')].map((element) => element.getBoundingClientRect());
  const last = pills[pills.length - 1];
  return {
    card: box('.period-bar'),
    prev: box('.period-bar > .period-step'),
    title: box('.period-title'),
    name: box('.period-name'),
    pills: box('.period-pills'),
    lastPill: last === undefined ? null : toBox(last),
    next: box('.period-actions > .period-step'),
    cta: box('.period-cta'),
    today: box('[data-period-today]'),
    current: box('[data-period-current]'),
    review: box('[data-review-link]'),
    meta: box('.period-meta'),
  };
})()`;

/** The parts of the card, each a box or null when it is not on the card (Current period only shows in the window; a shared view has no review link). */
export interface CardParts {
  card: Box | null;
  prev: Box | null;
  title: Box | null;
  name: Box | null;
  pills: Box | null;
  lastPill: Box | null;
  next: Box | null;
  cta: Box | null;
  today: Box | null;
  current: Box | null;
  review: Box | null;
  meta: Box | null;
}

export const cardParts = (page: Page) => page.evaluate<CardParts>(CARD_PARTS_SCRIPT);

/** True when `actual` is within `tolerance` of `expected`. */
export const near = (actual: number | undefined, expected: number, tolerance: number) => Math.abs((actual ?? Number.NaN) - expected) <= tolerance;

/** The computed styles of the first match, for the divider and the gaps. */
export async function cardStyle(page: Page, selector: string, properties: string[]): Promise<Record<string, string>> {
  return page.locator(selector).first().evaluate((element, names) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, style?.getPropertyValue(name) ?? '']));
  }, properties);
}

export const noSidewaysScroll = (page: Page) => page.evaluate<boolean>('document.documentElement.scrollWidth <= document.documentElement.clientWidth');

/** The forms of the range at this width, measured by hiding parts of the real text, and what the card shows now. */
export interface RangeState {
  widths: Record<string, number>;
  box: number;
  text: string;
  kind: string;
  spoken: string;
}

const RANGE_STATE_SCRIPT = `(() => {
  const name = document.querySelector('.period-name');
  const title = document.querySelector('.period-title');
  const part = (selector) => name.querySelector(selector);
  const parts = { startYear: part('.rg-start-year'), endMonth: part('.rg-end-month'), endYear: part('.rg-end-year'), arrow: part('.range-arrow') };
  const keys = Object.keys(parts);
  const widths = {};
  // A part the style sheet hides is a clipped, absolutely positioned box: every part is first put back in the line (inline styles beat the
  // container rules), then the parts of the form are removed.
  const shown = 'position:static;width:auto;height:auto;overflow:visible;clip-path:none;white-space:nowrap;margin-inline:8px';
  const measure = (label, hidden, tight) => {
    for (const key of keys) parts[key].style.cssText = key === 'arrow' ? shown : shown.replace(';margin-inline:8px', '');
    for (const key of hidden) parts[key].style.cssText = 'display:none';
    if (tight) parts.arrow.style.cssText = 'margin-inline:0';
    widths[label] = name.getBoundingClientRect().width;
  };
  measure('full', [], false);
  measure('no-start-year', ['startYear'], false);
  measure('no-years', ['startYear', 'endYear'], false);
  measure('end-day', ['startYear', 'endMonth', 'endYear'], false);
  measure('tight', ['startYear', 'endMonth', 'endYear'], true);
  for (const key of keys) parts[key].style.cssText = '';
  // What shows now: a part that the style sheet hides is a clipped, absolutely positioned box.
  const visible = (element) => getComputedStyle(element).position !== 'absolute';
  const tight = Number.parseFloat(getComputedStyle(parts.arrow).marginInlineStart) === 0;
  const text =
    part('.rg-start').textContent +
    (visible(parts.startYear) ? parts.startYear.textContent : '') +
    (tight ? '→' : ' → ') +
    (visible(parts.endMonth) ? parts.endMonth.textContent : '') +
    part('.rg-end-day').textContent +
    (visible(parts.endYear) ? parts.endYear.textContent : '');
  // The text a screen reader reads: the direct text and the children that are not aria-hidden.
  const spoken = [...name.childNodes].map((child) => (child.nodeType === 3 || child.getAttribute('aria-hidden') !== 'true' ? child.textContent : '')).join('');
  return { widths, box: title.getBoundingClientRect().width, text, kind: name.dataset.rangeKind || '', spoken };
})()`;

export const rangeState = (page: Page) => page.evaluate<RangeState>(RANGE_STATE_SCRIPT);

/** `2026-10-12` as `10/12/2026`, spelled out here as an oracle independent of the app. */
export const usDay = (date: string) => `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
