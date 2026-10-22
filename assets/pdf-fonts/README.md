# PDF fonts

The one committed font file of the project, used only by the timesheet PDF renderer (ADR 0001,
`docs/adr/0001-pdf-handwriting-font.md`).

| Item | Value |
|---|---|
| File | `IndieFlower-Regular.ttf` |
| Family and version | Indie Flower, Version 2.000 |
| Size | 108,196 bytes |
| SHA-256 | `ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94` |
| Source | `https://github.com/google/fonts/tree/main/ofl/indieflower` (`IndieFlower-Regular.ttf`) |
| Licence | SIL Open Font License 1.1, no Reserved Font Name; the unchanged `OFL.txt` of the source folder sits beside the font |
| Copyright | 2010 The Indie Flower Authors (kimberlygeswein.com) |

OFL.txt is the upstream licence text with trailing whitespace removed.

## Use

- Only `src/server/pdf/fonts.ts` reads the file, and the PDF renderer embeds a subset of it for the category cell of
  each day. The renderer refuses a file whose SHA-256 differs from the one above.
- The font is not served over HTTP and is not used by the user interface (the UI uses system fonts only).
- A category with a character the font lacks is drawn in DejaVu Serif Italic for that cell.
- The container image copies this folder to `/app/assets/pdf-fonts`.

## Changing it

A new font version or a second font file is a deliberate change that needs a new decision record: update the hash in
`src/server/pdf/fonts.ts`, this table, ADR 0001 and `tests/client/wordmarkAsset.test.ts` together.
