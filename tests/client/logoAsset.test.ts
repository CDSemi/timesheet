import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WP5-UX2-T05: the C&D logo is a pure vector file traced from the owner's artwork. It is served
 * as an <img> and as the favicon, so it must stay self-contained: no embedded raster, no script,
 * no live text (the glyphs are paths) and no external reference.
 */
const LOGO = join(import.meta.dirname, '..', '..', 'src', 'client', 'public', 'cd-logo.svg');
const svg = readFileSync(LOGO, 'utf8');

describe('cd-logo.svg', () => {
  it('is an SVG with the 512 by 512 view box', () => {
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('embeds no raster, script, live text or external reference', () => {
    expect(svg).not.toContain('<image');
    expect(svg).not.toContain('data:');
    expect(svg).not.toMatch(/href\s*=\s*["'](?!#)/i);
    expect(svg).not.toMatch(/url\(\s*["']?(?!#)/i);
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('<text');
    expect(svg).not.toContain('<foreignObject');
    expect(svg).not.toMatch(/\.(png|jpe?g|webp|gif)/i);
  });

  it('draws the three traced glyphs as paths', () => {
    expect(svg.match(/<path /g)?.length).toBe(3);
  });

  it('stays under 20 KB', () => {
    expect(statSync(LOGO).size).toBeLessThan(20 * 1024);
  });
});
