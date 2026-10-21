import { useLayoutEffect, useState } from 'react';
import { editorLayout, type EditorLayout, type EditorLayoutInput } from './editorLayoutModel.ts';

/** The tokens the rule reads, each as a length. A media query cannot read a custom property, so the lengths are measured. */
const TOKENS = ['--page-pad', '--editor-width', '--editor-gap', '--sheet-min-width'] as const;

/**
 * The inputs of `editorLayout` as the page has them right now. The tokens are resolved to px by a hidden probe whose children take
 * the lengths as their widths (rem, calc and the hairline included). CSSOM writes are not inline style markup, so the page CSP allows them.
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
  return { viewportWidth: document.documentElement.clientWidth, pagePadding: 2 * pagePad, editorWidth, gap, sheetMinWidth };
}

/**
 * The layout of the Day editor, evaluated again when the window or the document's width changes (a classic scrollbar appearing
 * changes `clientWidth` without a resize event, which the observer of the root element sees).
 */
export function useEditorLayout(): EditorLayout {
  const [layout, setLayout] = useState<EditorLayout>(() => editorLayout(measureEditorLayoutInput()));
  useLayoutEffect(() => {
    const update = () => setLayout(editorLayout(measureEditorLayoutInput()));
    update();
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);
  return layout;
}
