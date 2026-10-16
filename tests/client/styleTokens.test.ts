import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WP5-UX3-T01 (round 3): static rules for src/client/styles.css that the token system promises.
 *  - `--transition` names only the properties that change, never `all`, and every `transition` declaration in a
 *    rule is `var(--transition)` (an element picks the fast or slow duration through `--transition-duration`).
 *  - No rule writes a literal border-radius or box-shadow: the value is a custom property (or 0, none, inherit,
 *    50%), possibly combined with other custom properties. A literal belongs in a token definition.
 *  - Every week band card of the sheet is square (`--radius-sheet`) and raised (`--elev-2`), and so is the footer card.
 */

const STYLES = join(import.meta.dirname, '..', '..', 'src', 'client', 'styles.css');

interface Rule {
  selector: string;
  body: string;
  /** The at-rule conditions this rule is nested in, outermost first. */
  within: string[];
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every rule that holds declarations (nested at-rules are walked; their conditions are recorded in `within`). */
function leafRules(css: string): Rule[] {
  const rules: Rule[] = [];
  const stack: { header: string; start: number; hasChild: boolean }[] = [];
  let headerStart = 0;
  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    if (character === '{') {
      const parent = stack[stack.length - 1];
      if (parent) parent.hasChild = true;
      stack.push({ header: css.slice(headerStart, index).trim().replace(/\s+/g, ' '), start: index + 1, hasChild: false });
      headerStart = index + 1;
    } else if (character === '}') {
      const closed = stack.pop();
      if (closed && !closed.hasChild) {
        rules.push({ selector: closed.header, body: css.slice(closed.start, index), within: stack.map((entry) => entry.header) });
      }
      headerStart = index + 1;
    } else if (character === ';' && stack.length === 0) {
      headerStart = index + 1;
    }
  }
  return rules;
}

/** Declarations of a rule body as [name, value] pairs (`;` inside parentheses is not a separator). */
function declarationsOf(body: string): [string, string][] {
  const result: [string, string][] = [];
  let depth = 0;
  let start = 0;
  const take = (end: number) => {
    const text = body.slice(start, end).trim();
    const colon = text.indexOf(':');
    if (text !== '' && colon > 0) result.push([text.slice(0, colon).trim(), text.slice(colon + 1).trim().replace(/\s+/g, ' ')]);
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

/** The value with every `var(...)` reference removed (innermost first, so a fallback is removed with it). */
function withoutVars(value: string): string {
  let text = value;
  for (;;) {
    const next = text.replace(/var\([^()]*\)/g, ' ');
    if (next === text) return next;
    text = next;
  }
}

/** True when the value carries a literal length, percentage or colour. A bare 0 is allowed. */
function hasLiteral(value: string): boolean {
  const rest = withoutVars(value);
  if (/#[0-9a-f]{3,8}\b/i.test(rest)) return true;
  if (/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i.test(rest)) return true;
  return /(?<![\w.-])-?\d*\.?\d+(?:px|rem|em|ch|vh|vw|dvh|svh|lvh|%)(?![\w])/i.test(rest);
}

/** Literal values allowed besides the keywords and 0, each with its reason (none is in use today; 50% is a circle). */
const ALLOWED_LITERALS: { property: string; value: string; reason: string }[] = [{ property: 'border-radius', value: '50%', reason: 'half the box is a circle at any size' }];

const css = stripComments(readFileSync(STYLES, 'utf8'));
const rules = leafRules(css);

describe('the stylesheet reader used by this test', () => {
  it('finds rules inside at-rules and records the conditions', () => {
    const sample = '@media (a) { .x { color: red; } } .y { border-radius: var(--r); }';
    expect(leafRules(sample)).toEqual([
      { selector: '.x', body: ' color: red; ', within: ['@media (a)'] },
      { selector: '.y', body: ' border-radius: var(--r); ', within: [] },
    ]);
  });

  it('detects literals and ignores custom property references and zero', () => {
    expect(hasLiteral('var(--radius)')).toBe(false);
    expect(hasLiteral('0')).toBe(false);
    expect(hasLiteral('var(--radius) 0 0 var(--radius)')).toBe(false);
    expect(hasLiteral('inset 0 calc(-1 * var(--rail)) 0 var(--accent)')).toBe(false);
    expect(hasLiteral('0 0 0 var(--hairline) var(--card), 0 0 0 var(--rule) currentColor')).toBe(false);
    expect(hasLiteral('4px')).toBe(true);
    expect(hasLiteral('0 1px 2px rgb(0 0 0 / 0.1)')).toBe(true);
    expect(hasLiteral('0 0 0 1px #fff')).toBe(true);
    expect(hasLiteral('var(--a) 0.5rem')).toBe(true);
    expect(hasLiteral('50%')).toBe(true);
  });
});

describe('src/client/styles.css motion', () => {
  const definitions = rules.flatMap((rule) => declarationsOf(rule.body).filter(([name]) => name === '--transition').map(([, value]) => value));

  it('defines --transition once', () => {
    expect(definitions).toHaveLength(1);
  });

  it('--transition names no `all` and only the properties that change', () => {
    const definition = definitions[0] ?? '';
    const names = definition.split(/,(?![^(]*\))/).map((part) => part.trim().split(/\s+/)[0]);
    expect(definition).not.toMatch(/\ball\b/);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(['color', 'background-color', 'background-position', 'border-color', 'box-shadow', 'transform'], `transition property ${name}`).toContain(name);
    expect(definition).toContain('var(--transition-duration)');
    expect(definition).toContain('var(--ease-standard)');
  });

  it('every transition declaration is var(--transition) or none: no rule writes its own literal transition', () => {
    const declared = rules.flatMap((rule) =>
      declarationsOf(rule.body)
        .filter(([name]) => name === 'transition' || name.startsWith('transition-'))
        .map(([name, value]) => `${rule.selector} { ${name}: ${value} }`),
    );
    const other = declared.filter((entry) => !/\{ transition: (var\(--transition\)|none) \}$/.test(entry));
    expect(other).toEqual([]);
    expect(declared.length).toBeGreaterThan(5);
  });

  it('keeps the reduced-motion rule: the three durations become 0.01ms', () => {
    const rule = rules.find((entry) => entry.within.includes('@media (prefers-reduced-motion: reduce)') && entry.selector === ':root');
    expect(rule).toBeDefined();
    const values = Object.fromEntries(declarationsOf(rule?.body ?? ''));
    expect(values).toEqual({ '--duration-fast': '0.01ms', '--duration': '0.01ms', '--duration-slow': '0.01ms' });
  });
});

describe('src/client/styles.css shape and elevation', () => {
  const properties = ['border-radius', 'box-shadow'];
  const literalUses = rules.flatMap((rule) =>
    declarationsOf(rule.body)
      .filter(([name]) => properties.includes(name) && !name.startsWith('--'))
      .map(([name, value]) => ({ where: `${rule.selector} { ${name}: ${value} }`, name, value })),
  );

  it('reads a useful number of border-radius and box-shadow declarations', () => {
    expect(literalUses.length).toBeGreaterThan(40);
  });

  it('no rule uses a literal border-radius or box-shadow value outside a custom property definition', () => {
    const offenders = literalUses.filter((use) => {
      if (/^(?:none|inherit|initial|unset|0)$/.test(use.value)) return false;
      if (ALLOWED_LITERALS.some((allowed) => allowed.property === use.name && allowed.value === use.value)) return false;
      return hasLiteral(use.value);
    });
    expect(offenders.map((use) => use.where)).toEqual([]);
  });

  it('the old elevation names are gone from every rule', () => {
    expect(literalUses.filter((use) => /--shadow-(panel|overlay)/.test(use.value))).toEqual([]);
  });

  it('a week card uses --radius-sheet and --elev-2, and the footer card the same', () => {
    for (const selector of ['.sheet-week', '.sheet-footer']) {
      const rule = rules.find((entry) => entry.selector === selector && entry.within.length === 0);
      expect(rule, `${selector} rule`).toBeDefined();
      const values = Object.fromEntries(declarationsOf(rule?.body ?? ''));
      expect(values['border-radius'], `${selector} border-radius`).toBe('var(--radius-sheet)');
      expect(values['box-shadow'], `${selector} box-shadow`).toBe('var(--elev-2)');
      expect(values.background, `${selector} background`).toBe('var(--card)');
    }
  });

  it('every border-radius is 0, inherit or a part of the radius scale (a corner list uses scale tokens only)', () => {
    const scale = new Set(['0', 'inherit', 'var(--radius-sm)', 'var(--radius)', 'var(--radius-lg)', 'var(--radius-pill)', 'var(--radius-sheet)', 'var(--radius-lift)', 'var(--shape-round)']);
    const unknown = literalUses.filter((use) => use.name === 'border-radius' && !use.value.split(/\s+/).every((part) => scale.has(part)));
    expect(unknown.map((use) => use.where)).toEqual([]);
  });
});
