import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WP5-UX2-T06: the two-line wordmark of the shell bar is vector OUTLINES of the owner's typeface, written into
 * src/client/components/BrandWordmark.tsx as two path strings. The typeface itself (a file, a font-face rule or live
 * text) must never reach the public repository or the application: these are static guards on the sources.
 */
const ROOT = join(import.meta.dirname, '..', '..');
const SRC = join(ROOT, 'src');
const COMPONENT = join(SRC, 'client', 'components', 'BrandWordmark.tsx');
const STYLES = join(SRC, 'client', 'styles.css');
const MAX_PATH_BYTES = 12 * 1024;
const FONT_FILE = /\.(ttf|otf|woff2?|eot)$/i;

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(join(directory, entry.name)) : [join(directory, entry.name)],
  );
}

const component = readFileSync(COMPONENT, 'utf8');
const pathStrings = [...component.matchAll(/const (?:MAIN|SUB)_PATH =\s*'([^']*)'/g)].map((match) => match[1] ?? '');

describe('BrandWordmark.tsx', () => {
  it('holds exactly two outline path strings and draws two path elements', () => {
    expect(pathStrings).toHaveLength(2);
    expect(component.match(/<path /g)).toHaveLength(2);
    expect(component).toContain('className="wordmark-main"');
    expect(component).toContain('className="wordmark-sub"');
  });

  it('keeps the path data under 12 KB and uses path commands and numbers only', () => {
    const bytes = pathStrings.reduce((sum, data) => sum + Buffer.byteLength(data), 0);
    expect(bytes).toBeGreaterThan(1000);
    expect(bytes).toBeLessThan(MAX_PATH_BYTES);
    for (const data of pathStrings) expect(data).toMatch(/^[MLQCZ0-9 .-]+$/);
  });

  it('is a decorative inline graphic whose colours come from CSS classes', () => {
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('focusable="false"');
    expect(component).toContain('className="wordmark"');
    expect(component).not.toMatch(/\sstyle=/);
    expect(component).not.toMatch(/\sfill=/);
  });

  it('references no raster image', () => {
    expect(component).not.toContain('<image');
    expect(component).not.toContain('<img');
    expect(component).not.toContain('data:');
    expect(component).not.toMatch(/\.(png|jpe?g|webp|gif|bmp)\b/i);
  });
});

describe('the typeface stays out of the sources', () => {
  const sources = filesUnder(SRC).filter((file) => /\.(tsx?|css|html|svg|js)$/.test(file));

  it('has no SVG text element and no font-face rule anywhere under src/', () => {
    const offenders = sources.filter((file) => {
      const text = readFileSync(file, 'utf8');
      return /<text[\s>/]/.test(text) || /@font-face/i.test(text);
    });
    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('declares no font family for the wordmark and names no wordmark typeface', () => {
    expect(component).not.toMatch(/font-family|fontFamily/i);
    const styles = readFileSync(STYLES, 'utf8');
    const wordmarkRules = [...styles.matchAll(/(^|\n)\.wordmark[^{]*\{[^}]*\}/g)].map((match) => match[0]);
    expect(wordmarkRules.length).toBeGreaterThanOrEqual(3);
    for (const rule of wordmarkRules) expect(rule).not.toMatch(/font/i);
    for (const file of sources) expect(readFileSync(file, 'utf8')).not.toMatch(/VNI-?Revue|CDSemiFont/i);
  });

  it('has no font file in the working tree under src/', () => {
    expect(filesUnder(SRC).filter((file) => FONT_FILE.test(file))).toEqual([]);
  });

  it('has no font file among the tracked files', () => {
    let tracked: string[];
    try {
      tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
        .split('\0')
        .filter((name) => name !== '');
    } catch {
      // A source export without a repository: the working tree guard above is the check there.
      return;
    }
    expect(tracked.length).toBeGreaterThan(100);
    expect(tracked.filter((name) => FONT_FILE.test(name))).toEqual([]);
  });
});
