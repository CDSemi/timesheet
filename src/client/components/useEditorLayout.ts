import { useLayoutEffect, useState } from 'react';
import { editorLayout, type EditorLayout, type EditorLayoutInput } from './editorLayoutModel.ts';

/** The tokens the rule reads, each as a length. A media query cannot read a custom property, so the lengths are measured. */
const TOKENS = ['--page-pad', '--editor-width', '--editor-gap', '--sheet-min-width'] as const;

/** The classic scrollbar width last measured, and the pixel ratio it was measured at (a zoom changes the width in CSS px). */
let classicScrollbar: { ratio: number; width: number } | null = null;

/**
 * The width, in CSS px, that a classic scrollbar takes in this browser: 0 for overlay or hidden scrollbars. An off-screen box with
 * `overflow: scroll` always draws its track, so the answer does not depend on whether the page scrolls at this moment (R5 b).
 * It is measured once per device pixel ratio, because a zoom changes the width in CSS px.
 */
export function measureClassicScrollbarWidth(): number {
  if (classicScrollbar !== null && classicScrollbar.ratio === window.devicePixelRatio) return classicScrollbar.width;
  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.position = 'absolute';
  box.style.visibility = 'hidden';
  box.style.pointerEvents = 'none';
  box.style.top = '-200px';
  box.style.width = '100px';
  box.style.height = '100px';
  box.style.overflow = 'scroll';
  document.body.append(box);
  const width = box.offsetWidth - box.clientWidth;
  box.remove();
  classicScrollbar = { ratio: window.devicePixelRatio, width };
  return width;
}

/**
 * The inputs of `editorLayout` as the page has them right now. The tokens are resolved to px by a hidden probe whose children take
 * the lengths as their widths (rem, calc and the hairline included). CSSOM writes are not inline style markup, so the page CSP allows them.
 * The window width always has the classic scrollbar's width taken off, whether or not the page draws a track now.
 */
export function measureEditorLayoutInput(): EditorLayoutInput {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.width = '0';
  probe.style.height = '0';
  probe.style.overflow = 'hidden';
  for (const token of TOKENS) {
    const child = document.createElement('div');
    child.style.width = `var(${token})`;
    probe.append(child);
  }
  document.body.append(probe);
  const [pagePad = 0, editorWidth = 0, gap = 0, sheetMinWidth = 0] = [...probe.children].map((child) => child.getBoundingClientRect().width);
  probe.remove();
  return { viewportWidth: window.innerWidth - measureClassicScrollbarWidth(), pagePadding: 2 * pagePad, editorWidth, gap, sheetMinWidth };
}

/**
 * The layout of the Day editor, evaluated again when the window changes size (a zoom is a resize too). It reads the window width
 * less a classic scrollbar, never the live width of the document: a scrollbar that came and went with the page's height made the
 * rule depend on the layout it had chosen (F-UX4A-1).
 */
export function useEditorLayout(): EditorLayout {
  const [layout, setLayout] = useState<EditorLayout>(() => editorLayout(measureEditorLayoutInput()));
  useLayoutEffect(() => {
    const update = () => setLayout(editorLayout(measureEditorLayoutInput()));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return layout;
}
