import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WP5-UX2-AUDIT R-UX2A-2: the owner renamed "Clock in" / "Clock out" to "Check in" / "Check out" (WP5-UX2-UX2-2 (3)). Reverting the
 * rename in a string that no other test reads was caught by nothing, so this test scans the client's source for the old wording.
 *
 * It looks only at what a person can read: string literals, JSX text and CSS `content`. Comments are skipped, and so are identifiers
 * (`ClockOutDialog`, `clockedInText`, `buildClockOutRequest`) and API paths (`/api/clock/out`), which never contain a space or a hyphen
 * between the two words. The only hyphenated hits are two element ids, listed explicitly below; a visible "Clock-in" is not allowlisted.
 */

const CLIENT = join(import.meta.dirname, '..', '..', 'src', 'client');
const EXTENSIONS = /\.(ts|tsx|css|html|js)$/;

/** The old wording: a word break, "clock", a space or a hyphen, then "in" or "out"; "clocked"; "checking the clock". Case-insensitive. */
const OLD_WORDING = [/\bclock[ -]in\b/i, /\bclock[ -]out\b/i, /\bclocked\b/i, /\bchecking the clock\b/i] as const;

/** Identifier-shaped strings that contain the old words by design: the check-out dialog's element ids (not read by anyone). */
const ALLOWED_IDENTIFIERS = ['clock-out-title', 'clock-out'] as const;

/** One line without its comments and without the allowlisted identifier strings. */
function visibleText(line: string): string {
  let text = line.replace(/\/\*.*?\*\//g, '');
  const trimmed = text.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return '';
  text = text.replace(/(^|\s)\/\/\s.*$/, '');
  for (const identifier of ALLOWED_IDENTIFIERS) {
    for (const quote of ['"', "'"]) text = text.split(`${quote}${identifier}${quote}`).join(`${quote}${quote}`);
  }
  return text;
}

/** The old wording found in `source`, as `line: text` entries. */
function oldWordingIn(source: string): string[] {
  const found: string[] = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const text = visibleText(line);
    if (OLD_WORDING.some((pattern) => pattern.test(text))) found.push(`${index + 1}: ${line.trim()}`);
  });
  return found;
}

function clientFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return clientFiles(path);
    return EXTENSIONS.test(entry.name) ? [path] : [];
  });
}

describe('the client says "Check in" and "Check out", never the old clock wording', () => {
  it('finds no old wording in any string, JSX text or CSS content of src/client', () => {
    const files = clientFiles(CLIENT);
    expect(files.length, 'the scan reads the client source').toBeGreaterThan(40);
    const offences = files.flatMap((file) => oldWordingIn(readFileSync(file, 'utf8')).map((hit) => `${relative(CLIENT, file)}:${hit}`));
    expect(offences).toEqual([]);
  });

  it('would catch each old phrase, in a string, in JSX text and in a CSS content', () => {
    for (const sample of [
      "const label = 'Clock in';",
      '<button>Clock out</button>',
      'return `Clocked ${time}`;',
      "legend: 'first clock-in of the day',",
      'const text = "Checking the clock";',
      "const again = 'Clock out again to finish';",
      '  content: "Clock in";',
    ]) {
      expect(oldWordingIn(sample), sample).toHaveLength(1);
    }
  });

  it('lets identifiers, API paths, the two element ids and comments through', () => {
    for (const sample of [
      "import { ClockOutDialog } from './ClockOutDialog.tsx';",
      'const since = clockedInText(running, zone);',
      "await api('POST', '/api/clock/out', buildClockOutRequest(draft, version));",
      'export interface ClockedInText {',
      '<dialog aria-labelledby="clock-out-title">',
      '<h2 id="clock-out-title">Check out</h2>',
      'idPrefix="clock-out"',
      '/* ---- Day editor and Clock out dialog ---- */',
      '// Clock in is the old wording',
      ' * The owner renamed Clock in to Check in.',
      '{/* Clock out */}',
    ]) {
      expect(oldWordingIn(sample), sample).toEqual([]);
    }
  });
});
