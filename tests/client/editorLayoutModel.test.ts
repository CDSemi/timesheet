import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { besideNeed, DRAWER_MIN_WIDTH, editorLayout, type EditorLayoutInput, sheetRoomBeside } from '../../src/client/components/editorLayoutModel.ts';

/**
 * The tokens of the style sheet at 15px per rem: --page-pad 16px on both sides, --editor-width 400px, --editor-gap 16px and
 * --sheet-min-width = the 92px label column + 7 x 108px (7.2rem) + 2 x 1px hairline + 2 x 16px paper padding = 882px.
 */
const TOKENS = { pagePadding: 32, editorWidth: 400, gap: 16, sheetMinWidth: 92 + 7 * 108 + 2 + 2 * 16 };

/**
 * `document.documentElement.clientWidth` of a window `innerWidth` wide: a classic scrollbar (about 15px) takes its width, an overlay
 * scrollbar takes none.
 */
const clientWidthOf = (innerWidth: number, scrollbar: number) => innerWidth - scrollbar;

const layoutAt = (viewportWidth: number) => editorLayout({ viewportWidth, ...TOKENS });

describe('editorLayout (U4-07)', () => {
  const need = besideNeed(TOKENS);

  it('needs the page padding, the drawer, its gap and the minimum sheet: 1330px with the documented tokens', () => {
    expect(TOKENS.sheetMinWidth).toBe(882);
    expect(need).toBe(1330);
  });

  it('is a bottom sheet below 768px and a drawer from 768px, whatever the sheet needs', () => {
    expect(DRAWER_MIN_WIDTH).toBe(768);
    expect(layoutAt(767)).toBe('bottom-sheet');
    expect(layoutAt(768)).toBe('floating');
    expect(layoutAt(390)).toBe('bottom-sheet');
    // A window narrower than 768px is a phone even when the sheet would fit (a tiny token set).
    expect(editorLayout({ viewportWidth: 700, pagePadding: 0, editorWidth: 100, gap: 0, sheetMinWidth: 100 })).toBe('bottom-sheet');
  });

  it.each([
    { kind: 'overlay scrollbars', scrollbar: 0 },
    { kind: 'a classic 15px scrollbar', scrollbar: 15 },
  ])('floats one pixel below the need, stands beside at the need and one pixel above it, with $kind', ({ scrollbar }) => {
    // The window is wider by the scrollbar, so the switch lands at 1330px (overlay) or 1345px (classic) of window width.
    expect(layoutAt(clientWidthOf(need - 1 + scrollbar, scrollbar))).toBe('floating');
    expect(layoutAt(clientWidthOf(need + scrollbar, scrollbar))).toBe('beside');
    expect(layoutAt(clientWidthOf(need + 1 + scrollbar, scrollbar))).toBe('beside');
  });

  it('puts the switch at 1330px of window width with overlay scrollbars and 1345px with a classic one', () => {
    const switchAt = (scrollbar: number) => {
      for (let inner = DRAWER_MIN_WIDTH; inner < 3000; inner += 1) if (layoutAt(clientWidthOf(inner, scrollbar)) === 'beside') return inner;
      return null;
    };
    expect(switchAt(0)).toBe(1330);
    expect(switchAt(15)).toBe(1345);
  });

  it('changes once per crossing: the width alone decides, and every width below the need floats, every width from it stands beside', () => {
    const modes: string[] = [];
    for (let width = DRAWER_MIN_WIDTH; width <= 2200; width += 1) modes.push(layoutAt(width));
    const changes = modes.filter((mode, index) => index > 0 && mode !== modes[index - 1]).length;
    expect(changes).toBe(1);
    expect(modes[0]).toBe('floating');
    expect(modes.at(-1)).toBe('beside');
  });

  it('reads the room the sheet would get beside the drawer from the same inputs', () => {
    const input: EditorLayoutInput = { viewportWidth: 1440, ...TOKENS };
    expect(sheetRoomBeside(input)).toBe(1440 - 32 - 400 - 16);
    expect(editorLayout(input)).toBe('beside');
    expect(sheetRoomBeside({ ...input, viewportWidth: need - 1 })).toBe(TOKENS.sheetMinWidth - 1);
  });

  it('leaves no fixed switch width in the style sheet or the Timesheet page: the rule reads the tokens', () => {
    for (const file of ['src/client/styles.css', 'src/client/TimesheetScreen.tsx']) {
      const text = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
      expect(text, `${file} holds no 1360 layout literal`).not.toMatch(/\b1360\b/);
    }
    const css = readFileSync(new URL('../../src/client/styles.css', import.meta.url), 'utf8');
    expect(css).toMatch(/--sheet-min-width:\s*calc\(var\(--sheet-label-col\) \+ var\(--sheet-days\) \* var\(--sheet-col-min\) \+ 2 \* var\(--hairline\) \+ 2 \* var\(--paper-pad\)\)/);
  });

  it('follows the tokens: a wider drawer or a wider sheet moves the switch with them', () => {
    expect(besideNeed({ ...TOKENS, editorWidth: 440 })).toBe(need + 40);
    expect(editorLayout({ viewportWidth: need, ...TOKENS, editorWidth: 440 })).toBe('floating');
    expect(editorLayout({ viewportWidth: need + 40, ...TOKENS, editorWidth: 440 })).toBe('beside');
  });
});
