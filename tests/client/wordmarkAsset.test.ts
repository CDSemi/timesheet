import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INDIE_FLOWER_FILE, INDIE_FLOWER_SHA256 } from '../../src/server/pdf/fonts.ts';

/*
 * WP5-UX2-T06: the two-line wordmark of the shell bar is vector OUTLINES of the owner's typeface, held as two path
 * strings. WP5-UX5-T02 moved the strings into src/domain/brand.ts, shared with the PDF header, and BrandWordmark.tsx
 * imports them. The typeface itself (a file, a font-face rule or live text) must never reach the public repository
 * or the application: these are static guards on the sources.
 *
 * ADR 0001 (WP5-UX5-T02) adds exactly one font file to the repository: the PDF renderer's Indie Flower
 * (assets/pdf-fonts, SIL OFL 1.1), pinned by its SHA-256. It is never under src/, never served and never used by the UI.
 */
const ROOT = join(import.meta.dirname, '..', '..');
const SRC = join(ROOT, 'src');
const COMPONENT = join(SRC, 'client', 'components', 'BrandWordmark.tsx');
const BRAND = join(SRC, 'domain', 'brand.ts');
const LOGO_SVG = join(SRC, 'client', 'public', 'cd-logo.svg');
const STYLES = join(SRC, 'client', 'styles.css');
const MAX_PATH_BYTES = 12 * 1024;
const FONT_FILE = /\.(ttf|otf|woff2?|eot)$/i;
const ALLOWED_FONT = 'assets/pdf-fonts/IndieFlower-Regular.ttf';
const ALLOWED_FONT_SHA256 = 'ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94';
const ALLOWED_FONT_BYTES = 108_196;

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(join(directory, entry.name)) : [join(directory, entry.name)],
  );
}

const component = readFileSync(COMPONENT, 'utf8');
const brand = readFileSync(BRAND, 'utf8');
const pathStrings = [...brand.matchAll(/export const WORDMARK_(?:MAIN|SUB)_PATH =\s*'([^']*)'/g)].map((match) => match[1] ?? '');

describe('the wordmark paths (src/domain/brand.ts) and BrandWordmark.tsx', () => {
  it('holds exactly two outline path strings in the shared module and draws two path elements from them', () => {
    expect(pathStrings).toHaveLength(2);
    expect(component.match(/<path /g)).toHaveLength(2);
    expect(component).toContain('className="wordmark-main"');
    expect(component).toContain('className="wordmark-sub"');
    expect(component).toContain('d={WORDMARK_MAIN_PATH}');
    expect(component).toContain('d={WORDMARK_SUB_PATH}');
    expect(component).toContain("from '../../domain/brand.ts'");
    // The component keeps no copy of the outlines: client and server import the one module.
    expect(component).not.toMatch(/'[MLQCZ0-9 .-]{200,}'/);
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

  it('keeps the logo lettering outlines of the shared module identical to src/client/public/cd-logo.svg', () => {
    const svg = readFileSync(LOGO_SVG, 'utf8');
    const fromSvg = [...svg.matchAll(/<path d="([^"]*)"/g)].map((match) => match[1] ?? '');
    const block = /export const LOGO_LETTER_PATHS[^=]*=\s*\[([^\]]*)\]/.exec(brand)?.[1] ?? '';
    const fromModule = [...block.matchAll(/'([^']*)'/g)].map((match) => match[1] ?? '');
    expect(fromSvg).toHaveLength(3);
    expect(fromModule).toEqual(fromSvg);
    for (const data of fromModule) expect(data).toMatch(/^[MLZ0-9 .-]+$/);
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
    expect(brand).not.toMatch(/font-family|fontFamily/i);
    const styles = readFileSync(STYLES, 'utf8');
    const wordmarkRules = [...styles.matchAll(/(^|\n)\.wordmark[^{]*\{[^}]*\}/g)].map((match) => match[0]);
    expect(wordmarkRules.length).toBeGreaterThanOrEqual(3);
    for (const rule of wordmarkRules) expect(rule).not.toMatch(/font/i);
    for (const file of sources) expect(readFileSync(file, 'utf8')).not.toMatch(/VNI-?Revue|CDSemiFont/i);
  });

  it('has no font file in the working tree under src/', () => {
    expect(filesUnder(SRC).filter((file) => FONT_FILE.test(file))).toEqual([]);
  });

  it('never mentions the PDF handwriting font or its folder in the client code', () => {
    const offenders = filesUnder(join(SRC, 'client')).filter((file) => /IndieFlower|Indie Flower|pdf-fonts/i.test(readFileSync(file, 'utf8')));
    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });
});

describe('exactly one font file in the project: the PDF handwriting font (ADR 0001)', () => {
  const fontPath = join(ROOT, ...ALLOWED_FONT.split('/'));

  it('is assets/pdf-fonts/IndieFlower-Regular.ttf: 108,196 bytes with the pinned SHA-256, the same one the renderer checks', () => {
    const bytes = readFileSync(fontPath);
    expect(statSync(fontPath).size).toBe(ALLOWED_FONT_BYTES);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(ALLOWED_FONT_SHA256);
    expect(INDIE_FLOWER_SHA256).toBe(ALLOWED_FONT_SHA256);
    expect(INDIE_FLOWER_FILE).toBe('IndieFlower-Regular.ttf');
  });

  it('travels with its licence and README, and names source, version and hash', () => {
    const readme = readFileSync(join(ROOT, 'assets', 'pdf-fonts', 'README.md'), 'utf8');
    for (const fact of ['github.com/google/fonts', 'Version 2.000', '108,196', ALLOWED_FONT_SHA256, 'SIL Open Font License 1.1']) expect(readme).toContain(fact);
    expect(readFileSync(join(ROOT, 'assets', 'pdf-fonts', 'OFL.txt'), 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });

  it('has no other font file in the working tree outside node_modules and the build output', () => {
    const skip = new Set(['node_modules', 'dist', '.git', 'coverage']);
    const walk = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (skip.has(entry.name)) return [];
        return entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)];
      });
    const fonts = walk(ROOT).filter((file) => FONT_FILE.test(file)).map((file) => relative(ROOT, file).split('\\').join('/'));
    expect(fonts).toEqual([ALLOWED_FONT]);
  });

  it('is the only font file among the tracked and not-ignored files', () => {
    let listed: string[];
    try {
      // The same listing the source digest uses: tracked files plus untracked files that are not ignored.
      listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
        .split('\0')
        .filter((name) => name !== '');
    } catch {
      // A source export without a repository: the working tree guard above is the check there.
      return;
    }
    expect(listed.length).toBeGreaterThan(100);
    expect(listed.filter((name) => FONT_FILE.test(name))).toEqual([ALLOWED_FONT]);
    expect(listed).toContain('assets/pdf-fonts/OFL.txt');
    expect(listed).toContain('assets/pdf-fonts/README.md');
  });
});
