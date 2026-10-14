import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WP5-UX2-T01: the dark token set is written twice in src/client/styles.css, once under the device's
 * preference (`@media (prefers-color-scheme: dark)`, when no manual choice is stored) and once under the
 * manual choice (`:root[data-theme='dark']`). CSS has no way to share the two, so this test parses the
 * stylesheet and fails when the sets differ, when a dark token has no light value in `:root`, or when a
 * dark rule exists outside the token sets (it would not follow the manual choice).
 */

const STYLES = join(import.meta.dirname, '..', '..', 'src', 'client', 'styles.css');

const MEDIA_SELECTOR = '@media (prefers-color-scheme: dark)';
const MEDIA_INNER_SELECTOR = ":root:not([data-theme='light'])";
const MANUAL_DARK_SELECTOR = ":root[data-theme='dark']";
const MANUAL_LIGHT_SELECTOR = ":root[data-theme='light']";

interface Block {
  selector: string;
  body: string;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** The blocks at the top nesting level of `css`: a rule or an at-rule with its raw body. */
function topLevelBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  let depth = 0;
  let selectorStart = 0;
  let bodyStart = 0;
  let selector = '';
  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    if (character === '{') {
      if (depth === 0) {
        selector = css.slice(selectorStart, index).trim().replace(/\s+/g, ' ');
        bodyStart = index + 1;
      }
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        blocks.push({ selector, body: css.slice(bodyStart, index) });
        selectorStart = index + 1;
      }
    }
  }
  return blocks;
}

/** The declarations of a rule body as name to whitespace-normalised value (`;` inside parentheses is not a separator). */
function declarations(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  let depth = 0;
  let start = 0;
  const take = (end: number) => {
    const text = body.slice(start, end).trim();
    const colon = text.indexOf(':');
    if (text !== '' && colon > 0) result[text.slice(0, colon).trim()] = text.slice(colon + 1).trim().replace(/\s+/g, ' ');
  };
  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;
    else if (character === ';' && depth === 0) {
      take(index);
      start = index + 1;
    }
  }
  take(body.length);
  return result;
}

function onlyTokens(set: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(set).filter(([name]) => name.startsWith('--')));
}

interface ThemeSets {
  light: Record<string, string>;
  mediaDark: Record<string, string>;
  manualDark: Record<string, string>;
  manualLight: Record<string, string>;
}

function themeSets(css: string): ThemeSets {
  const blocks = topLevelBlocks(stripComments(css));
  const only = (selector: string, from: Block[]): Block => {
    const matches = from.filter((block) => block.selector === selector);
    expect(matches, `exactly one top-level ${selector}`).toHaveLength(1);
    return matches[0] ?? { selector, body: '' };
  };
  const media = only(MEDIA_SELECTOR, blocks);
  const inner = only(MEDIA_INNER_SELECTOR, topLevelBlocks(media.body));
  return {
    light: declarations(only(':root', blocks).body),
    mediaDark: declarations(inner.body),
    manualDark: declarations(only(MANUAL_DARK_SELECTOR, blocks).body),
    manualLight: declarations(only(MANUAL_LIGHT_SELECTOR, blocks).body),
  };
}

/** The names whose values differ between two token sets, or that exist in one only. */
function differences(left: Record<string, string>, right: Record<string, string>): string[] {
  const names = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...names].filter((name) => left[name] !== right[name]).sort();
}

const css = readFileSync(STYLES, 'utf8');

describe('the stylesheet parser used by the parity test', () => {
  const sample = `
    :root { --a: 1; --shadow: 0 0 0 1px rgb(1 2 3 / 0.4),
      0 1px 2px rgb(1 2 3 / 0.3); }
    @media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { --a: 2; } }
    /* a comment { with a brace */
    :root[data-theme='dark'] { color-scheme: dark; --a: 3; }
    :root[data-theme='light'] { color-scheme: light; }
  `;

  it('reads nested blocks and multi-line values', () => {
    const sets = themeSets(sample);
    expect(sets.light).toEqual({ '--a': '1', '--shadow': '0 0 0 1px rgb(1 2 3 / 0.4), 0 1px 2px rgb(1 2 3 / 0.3)' });
    expect(sets.mediaDark).toEqual({ '--a': '2' });
    expect(sets.manualDark).toEqual({ 'color-scheme': 'dark', '--a': '3' });
  });

  it('reports a changed, a missing and an extra token', () => {
    expect(differences({ '--a': '1', '--b': '2' }, { '--a': '1', '--b': '2' })).toEqual([]);
    expect(differences({ '--a': '1' }, { '--a': '2' })).toEqual(['--a']);
    expect(differences({ '--a': '1', '--b': '2' }, { '--a': '1' })).toEqual(['--b']);
    expect(differences({ '--a': '1' }, { '--a': '1', '--c': '3' })).toEqual(['--c']);
  });
});

describe('src/client/styles.css theme sets', () => {
  const sets = themeSets(css);

  it('has a non-empty dark set', () => {
    expect(Object.keys(onlyTokens(sets.mediaDark)).length).toBeGreaterThan(20);
  });

  it('writes the same dark tokens under the device preference and under the manual choice', () => {
    expect(differences(onlyTokens(sets.mediaDark), onlyTokens(sets.manualDark))).toEqual([]);
  });

  it('holds only custom properties in the media set, and the colour scheme in the manual sets', () => {
    expect(Object.keys(sets.mediaDark).filter((name) => !name.startsWith('--'))).toEqual([]);
    expect(sets.manualDark['color-scheme']).toBe('dark');
    expect(sets.manualLight).toEqual({ 'color-scheme': 'light' });
    expect(sets.light['color-scheme']).toBe('light dark');
  });

  it('has a light value in :root for every dark token', () => {
    const missing = Object.keys(onlyTokens(sets.mediaDark)).filter((name) => !(name in sets.light));
    expect(missing).toEqual([]);
  });

  it('keeps every other dark rule inside the sets: no further prefers-color-scheme query', () => {
    expect(stripComments(css).match(/prefers-color-scheme/g) ?? []).toHaveLength(1);
  });
});
