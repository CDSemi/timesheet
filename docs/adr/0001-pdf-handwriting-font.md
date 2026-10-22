# ADR 0001: a handwriting font for the PDF category cells

Status: accepted (owner decision F-9 b, 2026-10-21; implemented by WP5-UX5-T02).

## Context

- The owner's workbook shows each day's category (Worked, Off, Vacation, ...) in a handwriting face. The redesigned
  timesheet PDF (docs/04 "Email and PDF", AC-10) reproduces that look; on 2026-10-21 the owner answered F-9 b: use a
  handwriting font, if one can be committed and embedded under a licence that allows it, and approved Indie Flower.
- The PDF is drawn with pdf-lib and `@pdf-lib/fontkit` (docs/03). Its fonts so far were DejaVu Sans and Sans Bold read
  from the `dejavu-fonts-ttf` npm package; no font binary was committed.
- The user interface uses system fonts only, with no web font and no `@font-face` (AGENTS.md "Frontend and UI/UX
  standards", the content security policy). The company wordmark is shipped as vector outlines, never as a font
  (WP5-UX2-T06). `tests/client/wordmarkAsset.test.ts` guards both and used to assert that no font file is tracked.

## Decision

- Commit one font file, `assets/pdf-fonts/IndieFlower-Regular.ttf` (version 2.000, 108,196 bytes, SHA-256
  `ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94`), with its `OFL.txt` and a README that records the
  source, version, size, hash and licence. Both come from the official Google Fonts repository,
  `github.com/google/fonts`, path `ofl/indieflower/`: the font file unchanged, and `OFL.txt` as the upstream licence
  text with trailing whitespace removed.
- Licence: SIL Open Font License 1.1, copyright "2010 The Indie Flower Authors (kimberlygeswein.com)", no Reserved Font
  Name. OFL 1.1 allows bundling, embedding in documents and redistribution with the software; the font must not be sold
  by itself and the licence text travels with the file.
- Use: only the PDF renderer (`src/server/pdf/fonts.ts`) reads it, embeds a subset of it, and only for the category
  cell of each day. It is not served over HTTP and not used by the UI. The renderer checks the file against the pinned
  SHA-256 before use.
- Fallback: a category whose text has a character Indie Flower lacks (it covers Basic Latin, Latin-1 and Vietnamese, not
  Greek or Cyrillic) is drawn in DejaVu Serif Italic for that cell, never as "?".
- Every other face stays in the installed DejaVu package: Sans, Sans Bold, Serif Condensed Bold, Serif Italic.
- The container image copies `assets/pdf-fonts` into its runtime stage (and `.dockerignore` allows that folder); the
  container drill and the built-server smoke render a PDF that embeds the Indie Flower subset.
- Gate: `tests/client/wordmarkAsset.test.ts` now asserts exactly one tracked font file, at that path, with that
  SHA-256; the checks that no font file or `@font-face` exists under `src/` stay.

## Consequences

- About 108 KB more in the repository and the image; one PDF grows by the font subset (about 7 KB measured).
- The PDF bytes changed (new layout and font), so the pilot packet sample PDFs and their hashes are regenerated
  (UX5-T06). The same input still gives identical bytes.
- A new version of the font is a deliberate change: a new file hash in `fonts.ts`, the README, this ADR and the test.
  A second font file needs a new ADR and a new decision in the test.
- The OFL travels with the font; the README states the licence. Third-party notice stays complete without further text.

## Alternatives considered

- **DejaVu Serif Italic for the category** (no new file, no licence): rejected as the default because the owner asked for
  a handwriting look (F-9 b); kept as the per-cell fallback.
- **Patrick Hand 1.003** (OFL 1.1, 214,772 bytes, lacks only the micro sign): twice the size, a less handwritten look.
- **Caveat and Kalam** (OFL 1.1): variable or multi-weight files and no Vietnamese subset.
- **An npm font package** (a new dependency, WOFF2 split by Unicode range): rejected, no new dependency without a named
  need (AGENTS.md Prime Directive).
