/**
 * Where the Day editor stands (round 4, U4-07). Below 768px it is a modal bottom sheet. From 768px it is a drawer
 * on a window edge: beside the sheet (the page is pushed aside and keeps its seven day columns at their readable
 * width) when the window has room for both, otherwise floating over the sheet. The rule is one function of the
 * window width and the tokens of the style sheet, never of the mode the editor is in now, so it cannot flap.
 */

/** The width from which the Day editor is a drawer; the same value as DESKTOP_QUERY (a media query cannot read a token). */
export const DRAWER_MIN_WIDTH = 768;

export type EditorLayout = 'bottom-sheet' | 'beside' | 'floating';

/** Every length is in CSS px. */
export interface EditorLayoutInput {
  /** `document.documentElement.clientWidth`: the window width without a classic scrollbar. */
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
