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

/*
 * WP5-UX3-T01 (round 3): the new token system. A colour or shadow token must have a light value in `:root` and the
 * same dark value in BOTH dark sets; a shape, motion or layout token is theme-independent and lives in `:root` only.
 */
const THEMED_TOKENS = [
  '--bg',
  '--card',
  '--off',
  '--line',
  '--line-soft',
  '--field-bg',
  '--panel-head',
  '--row-alt',
  '--accent-soft',
  '--day-editing-head',
  '--avatar-bg',
  '--avatar-ink',
  '--danger',
  '--on-danger',
  '--elev-bar',
  '--elev-1',
  '--elev-2',
  '--elev-3',
  '--elev-lift',
  ...['current', 'old', 'future', 'neutral', 'progress'].flatMap((kind) => [`--pill-${kind}-bg`, `--pill-${kind}-ink`, `--pill-${kind}-line`]),
] as const;

const SHARED_TOKENS: Record<string, string> = {
  '--radius-sm': '6px',
  '--radius': '8px',
  '--radius-lg': '12px',
  '--radius-pill': '999px',
  '--radius-sheet': '0',
  '--radius-lift': '4px',
  '--duration-fast': '120ms',
  '--duration': '180ms',
  '--duration-slow': '260ms',
  '--ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  '--ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-strong': '600',
  '--font-weight-heavy': '700',
  '--font-size-h1': '1.6rem',
  '--lift-clip': '32px',
  '--sheet-col-min': '7.2rem',
  '--page-max-editor': '1600px',
  '--dialog-pad-phone': 'var(--space-4)',
  '--dialog-section-gap-phone': '20px',
  '--dialog-field-gap-phone': 'var(--space-3)',
  '--break-row-gap': 'var(--space-2)',
  '--break-date-w': '7.6rem',
  '--break-time-w': '6.8rem',
  '--break-min-w': '5.6rem',
};

describe('src/client/styles.css round-3 token system', () => {
  const sets = themeSets(css);

  it.each(THEMED_TOKENS)('%s has a light value and the same value in both dark sets', (name) => {
    expect(sets.light[name], `${name} in :root`).toBeDefined();
    expect(sets.mediaDark[name], `${name} in the media dark set`).toBeDefined();
    expect(sets.manualDark[name], `${name} in the manual dark set`).toBeDefined();
    expect(sets.mediaDark[name]).toBe(sets.manualDark[name]);
  });

  it.each(['--bg', '--field-bg', '--panel-head', '--elev-1', '--elev-2', '--elev-3', '--pill-future-bg'])('%s differs between the light and the dark theme', (name) => {
    expect(sets.light[name]).not.toBe(sets.mediaDark[name]);
  });

  it.each(Object.entries(SHARED_TOKENS))('%s is %s in :root and is not redefined by a theme', (name, value) => {
    expect(sets.light[name]).toBe(value);
    expect(sets.mediaDark[name]).toBeUndefined();
    expect(sets.manualDark[name]).toBeUndefined();
  });

  it('removes the old elevation and motion tokens (no alias is left)', () => {
    const everywhere = Object.keys({ ...sets.light, ...sets.mediaDark, ...sets.manualDark });
    expect(everywhere.filter((name) => ['--shadow-panel', '--shadow-overlay', '--ease'].includes(name))).toEqual([]);
    expect(stripComments(css)).not.toMatch(/var\(--(shadow-panel|shadow-overlay|ease)\)/);
  });

  it('writes the light --bg darker than --card so the page and the cards are two steps', () => {
    expect(sets.light['--bg']).toBe('#edf0f5');
    expect(sets.light['--card']).toBe('#ffffff');
    expect(sets.mediaDark['--bg']).toBe('#0e1217');
    expect(sets.mediaDark['--card']).toBe('#1a2029');
  });
});

/*
 * WP5-UX5-T05A (round 5, U5-20): the worked-hours line of a day is tinted with --worked-line. It is a themed colour (a light value and the
 * same dark value in both dark sets), and --muted and --text keep 4.5:1 on it in every theme (WCAG 2.2 SC 1.4.3).
 */
describe('src/client/styles.css --worked-line (U5-20)', () => {
  const sets = themeSets(css);

  const channel = (value: number) => {
    const unit = value / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex: string) => {
    const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((start) => channel(Number.parseInt(hex.slice(start, start + 2), 16)));
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const ratio = (left: string, right: string) => {
    const [high, low] = [luminance(left), luminance(right)].sort((a, b) => b - a);
    return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
  };

  it('has a light value and the same value in both dark sets', () => {
    expect(sets.light['--worked-line']).toBeDefined();
    expect(sets.mediaDark['--worked-line']).toBeDefined();
    expect(sets.manualDark['--worked-line']).toBe(sets.mediaDark['--worked-line']);
    expect(sets.light['--worked-line']).not.toBe(sets.mediaDark['--worked-line']);
  });

  it.each([
    ['light', () => sets.light],
    ['dark', () => sets.mediaDark],
  ] as const)('keeps --muted and --text at 4.5:1 on the tint in the %s set, and the tint apart from the card', (_name, pick) => {
    const set = { ...sets.light, ...pick() };
    const tint = set['--worked-line'] ?? '';
    expect(tint).toMatch(/^#[0-9a-f]{6}$/);
    expect(ratio(set['--muted'] ?? '', tint)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(set['--text'] ?? '', tint)).toBeGreaterThanOrEqual(4.5);
    expect(tint).not.toBe(set['--card']);
  });
});
