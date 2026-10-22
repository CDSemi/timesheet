import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DRAWER_MIN_WIDTH } from '../../src/client/components/editorLayoutModel.ts';
import { SHEET_QUERY, SHELL_QUERY } from '../../src/client/components/layoutQueries.ts';

/*
 * WP5-UX5-T04 (U5-01, U5-15, owner decision F-6 a): the two layout breakpoints are 768px (the navigation shell) and 480px (the sheet's
 * compact form), written once in range syntax in TypeScript (layoutQueries.ts) and repeated in the style sheet, because a media query
 * cannot read a custom property. A `max-width: 767px` / `min-width: 768px` pair leaves a hole at 767.33px (a 150% display scaling),
 * where neither rule applies while the script's `matchMedia` has already decided. This test parses the style sheet and fails when a
 * media rule leaves the range syntax or the two documented values, and proves that the TypeScript query and the CSS rules switch at
 * the same width, with no fractional width between them.
 */

const STYLES = join(import.meta.dirname, '..', '..', 'src', 'client', 'styles.css');
const css = readFileSync(STYLES, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The prelude of every `@media` rule of the style sheet, whitespace normalised. */
const mediaPreludes = [...css.matchAll(/@media\s+([^{]+)\{/g)].map((match) => (match[1] ?? '').trim().replace(/\s+/g, ' '));

/** The width conditions of a media prelude as [low, high] pairs (low inclusive, high exclusive); other features are ignored. */
function widthRanges(prelude: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const part of prelude.split(',')) {
    const bounded = /\((\d+)px <= width < (\d+)px\)/.exec(part);
    const from = /\(width >= (\d+)px\)/.exec(part);
    const below = /\(width < (\d+)px\)/.exec(part);
    if (bounded !== null) ranges.push([Number(bounded[1]), Number(bounded[2])]);
    else if (from !== null) ranges.push([Number(from[1]), Number.POSITIVE_INFINITY]);
    else if (below !== null) ranges.push([0, Number(below[1])]);
  }
  return ranges;
}

/** True when a query written the way layoutQueries.ts writes it (`(width >= Npx)`) matches `width`. */
function matchesQuery(query: string, width: number): boolean {
  const match = /^\(width >= (\d+)px\)$/.exec(query);
  if (match === null) throw new Error(`Not a range query: ${query}`);
  return width >= Number(match[1]);
}

/** True when a media prelude's first width condition matches `width`. */
function matchesPrelude(prelude: string, width: number): boolean {
  return widthRanges(prelude).some(([low, high]) => width >= low && width < high);
}

describe('layout breakpoints (U5-01, U5-15)', () => {
  it('names the two documented breakpoints in range syntax, one constant per query', () => {
    expect(SHELL_QUERY).toBe('(width >= 768px)');
    expect(SHEET_QUERY).toBe('(width >= 480px)');
    expect(DRAWER_MIN_WIDTH, 'the Day editor drawer stands from the same 768px').toBe(768);
  });

  it('leaves no min-width / max-width media query and no old 767, 479, 359 or 929 literal in the style sheet', () => {
    expect(mediaPreludes.filter((prelude) => /\b(?:min|max)-width\b/.test(prelude))).toEqual([]);
    for (const literal of ['767px', '479px', '359px', '929px', '1023px', '1279px']) expect(css, literal).not.toContain(literal);
  });

  it('uses only the documented widths in its width conditions', () => {
    const numbers = new Set<number>();
    for (const prelude of mediaPreludes) for (const [low, high] of widthRanges(prelude)) for (const value of [low, high]) if (Number.isFinite(value) && value > 0) numbers.add(value);
    // 768 and 480 are the two breakpoints; 930 is the end of the sideways-scrolling week card (929 and its open end), 360 hides the
    // narrowest phone's date line, 1024 and 1280 bound the tight desktop bar.
    expect([...numbers].sort((a, b) => a - b)).toEqual([360, 480, 768, 930, 1024, 1280]);
  });

  it('every width falls on exactly one side of each breakpoint, in the script and in the style sheet (150% scaling gives 479.33 and 767.33)', () => {
    const widths: number[] = [];
    for (let width = 460; width <= 500; width += 1 / 3) widths.push(width);
    for (let width = 750; width <= 790; width += 1 / 3) widths.push(width);
    widths.push(479, 479.2, 479.33, 480, 767, 767.2, 767.33, 768);
    for (const [breakpoint, query] of [
      [768, SHELL_QUERY],
      [480, SHEET_QUERY],
    ] as const) {
      const below = mediaPreludes.filter((prelude) => prelude.startsWith(`(width < ${breakpoint}px)`));
      const from = mediaPreludes.filter((prelude) => prelude.startsWith(`(width >= ${breakpoint}px)`));
      expect(below.length, `the style sheet has rules below ${breakpoint}px`).toBeGreaterThan(0);
      for (const width of widths) {
        const script = matchesQuery(query, width);
        for (const prelude of below) expect(matchesPrelude(prelude, width), `${prelude} at ${width}`).toBe(!script);
        for (const prelude of from) expect(matchesPrelude(prelude, width), `${prelude} at ${width}`).toBe(script);
      }
    }
  });

  it('switches the sideways-scrolling week card on at the sheet breakpoint, so the 7-column sheet never overflows the page', () => {
    const scroll = mediaPreludes.find((prelude) => prelude.startsWith('(480px <= width < '));
    expect(scroll).toBeDefined();
    for (const width of [479, 479.33, 479.99]) expect(matchesPrelude(scroll ?? '', width), `${width}`).toBe(false);
    for (const width of [480, 600, 767.33, 768, 929.5]) expect(matchesPrelude(scroll ?? '', width), `${width}`).toBe(true);
    expect(matchesPrelude(scroll ?? '', 930)).toBe(false);
  });
});
