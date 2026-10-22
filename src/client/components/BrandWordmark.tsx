import { WORDMARK_MAIN_PATH, WORDMARK_SUB_PATH } from '../../domain/brand.ts';

/*
 * The two-line wordmark of the shell bar (WP5-UX2-T06): "Semiconductor" over "SERVICES, INC.".
 *
 * The letters are vector OUTLINES of those two lines of text, generated once from the company's own typeface with a
 * throwaway script (the shapes are the company's logo artwork). They live in src/domain/brand.ts, shared with the
 * timesheet PDF header (WP5-UX5-T02), as two path strings. The application ships no font file for the mark, no
 * font-face rule, no SVG text element and no font family; tests/client/wordmarkAsset.test.ts guards this.
 *
 * Geometry: one coordinate system of 151.36 x 27.78 units, where 1 unit is 1 CSS px when the first line
 * is set at 21px (the --wordmark-size token). Line 1 is the capital S at 21 units followed by the other
 * twelve letters as small capitals at 0.75 of that size (as in the owner's reference image); line 2 is
 * drawn at 7 units with 0.76 em of letter-spacing, centred under line 1. The fills come from the CSS
 * classes (the --wordmark-main and --wordmark-sub tokens), so the mark follows the light and dark themes. The graphic is
 * decorative: the shell brand carries the one accessible name as visually hidden text.
 */
export function BrandWordmark() {
  return (
    <svg className="wordmark" viewBox="0 0 151.36 27.78" aria-hidden="true" focusable="false">
      <path className="wordmark-main" d={WORDMARK_MAIN_PATH} />
      <path className="wordmark-sub" d={WORDMARK_SUB_PATH} />
    </svg>
  );
}
