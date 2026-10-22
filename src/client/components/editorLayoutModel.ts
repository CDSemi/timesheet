/**
 * Where the Day editor stands (round 4, U4-07). Below 768px it is a modal bottom sheet. From 768px it is a drawer
 * on a window edge: beside the sheet (the page is pushed aside and keeps its seven day columns at their readable
 * width) when the window has room for both, otherwise floating over the sheet. The rule is one function of the
 * window width and the tokens of the style sheet, never of the mode the editor is in now, so it cannot flap.
 */

/** The width from which the Day editor is a drawer; the same value as SHELL_QUERY (layoutQueries.ts; a media query cannot read a token). */
export const DRAWER_MIN_WIDTH = 768;

export type EditorLayout = 'bottom-sheet' | 'beside' | 'floating';

/** Every length is in CSS px. */
export interface EditorLayoutInput {
  /** `window.innerWidth` less the width of a classic scrollbar (0 for overlay scrollbars), whether or not the page draws a track now. */
  viewportWidth: number;
  /** The page's side padding, both sides together (2 x --page-pad). */
  pagePadding: number;
  /** The drawer's width (--editor-width). */
  editorWidth: number;
  /** The gap the page keeps beside the drawer (--editor-gap). */
  gap: number;
  /** The narrowest paper that keeps seven day columns at --sheet-col-min (--sheet-min-width). */
  sheetMinWidth: number;
}

/** The window width from which the sheet fits beside the drawer: the page padding, the drawer, the gap and the sheet. */
export function besideNeed(input: Omit<EditorLayoutInput, 'viewportWidth'>): number {
  return input.pagePadding + input.editorWidth + input.gap + input.sheetMinWidth;
}

/** The width the sheet would get beside the drawer. */
export function sheetRoomBeside(input: EditorLayoutInput): number {
  return input.viewportWidth - input.pagePadding - input.editorWidth - input.gap;
}

export function editorLayout(input: EditorLayoutInput): EditorLayout {
  if (input.viewportWidth < DRAWER_MIN_WIDTH) return 'bottom-sheet';
  return sheetRoomBeside(input) >= input.sheetMinWidth ? 'beside' : 'floating';
}

/** A box in CSS px from the window's top left corner: the part of a `DOMRect` that the coverage rule reads. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The slack, in CSS px, that the coverage rule allows at every edge: a browser rests a scrolled-to control a fraction of a pixel off the window. */
export const COVER_TOLERANCE = 1;

/**
 * True when the visible part of `control` lies wholly under `cover` (WCAG 2.2 SC 2.4.11 Focus Not Obscured): the control's box
 * clipped to the window, compared with the cover's box, with `COVER_TOLERANCE` of slack at each edge. A control whose only part
 * outside the cover lies beyond the window is covered (nothing of it can be seen); a control with any visible part outside the cover
 * is not. A control with no visible part at all (no size, or wholly outside the window) is not reported: there is nothing to uncover.
 */
export function whollyCovered(control: Box, cover: Box, viewport: { width: number; height: number }): boolean {
  const left = Math.max(control.left, 0);
  const top = Math.max(control.top, 0);
  const right = Math.min(control.right, viewport.width);
  const bottom = Math.min(control.bottom, viewport.height);
  if (right <= left || bottom <= top) return false;
  return left >= cover.left - COVER_TOLERANCE && right <= cover.right + COVER_TOLERANCE && top >= cover.top - COVER_TOLERANCE && bottom <= cover.bottom + COVER_TOLERANCE;
}
