# WP4-FIXB2 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB2; package WP4; kind fix;
  attempt 1. It addresses WP4-RECHECK-B (FIX REQUIRED, finding WP4-RB-01) and follows
  `handoff/prompts/FIX_FINDINGS.md`.
- Escalation. WP4-RB-01 reopens WP4-B-01, which WP4-FIXB tried to fix. A recurring
  FIX REQUIRED on the same finding goes to the expert tier under document 08. The fix
  must close the class of attack, not only the three probes.
- Profile/routing: timesheet-expert, requested opus, no override. Effort stays at the
  profile's level, xhigh. Routing: size M, risk H (an untrusted-input resource bound), not
  novel. Records in English.
- Read AGENTS.md from disk first. Then read:
  - [WP4_RECHECK_B](../WP4_RECHECK_B.md), the finding WP4-RB-01, and its probes in
    `handoff/delivery/evidence/WP4-RECHECK-B/` (`probe-r1-cost.mjs.txt`,
    `probe-r2-http.mjs.txt`, `probe-r3-bypass.mjs.txt`);
  - [WP4_REVIEW_B](../WP4_REVIEW_B.md), the original WP4-B-01, and the first-audit
    probes in `handoff/delivery/evidence/WP4-AUDIT-B/`;
  - the [WP4-FIXB](WP4-FIXB.md) results: the limits chosen and why;
  - `src/server/import/xlsxReader.ts`, `templateMapping.ts`,
    `src/server/services/workbookImport.ts` and `routes/imports.ts`;
  - the fast-xml-parser options in use. Consult its documentation for any built-in
    limits.
- Baseline: main at 0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65 (digest dfe4541d…, 775
  files). The working tree differs only in handoff/.

## Runtime

- Shell:
  - Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`,
    or any interactive shell.
  - Never feed scripts to python or node through stdin; write probe files and run them.
  - Call Node 24 by its full portable path, or put it first on PATH. Make the first
    shell call a trivial `node --version`, and stop on ENOSPC. Keep shell calls in the
    foreground.
- Files:
  - Use `D:\.claude-tmp\timesheet\WP4-FIXB2` for TEMP/TMP, scratch clones, every
    hostile workbook and all raw output.
  - Set `DATA_DIR` and `DATABASE_PATH` explicitly there for every CLI or server run.
  - Never write a workbook into the repository. The template hash must stay
    `47ef42d5…`.
- Run mutation checks only in a scratch clone.
- Delete only files you created, never inside the repository. Never remove folders
  recursively.
- Never kill processes by PID. Run no docker command. Never write into the repository
  root. Never redirect to /dev/null or nul.
- Write task records with the Edit tool.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Do not commit.

## Required outcome (a resource budget, not a probe patch)

1. **Define a budget and prove it.** Any upload the route accepts, or refuses after
   reading, must stay within a stated worst-case cost. Pick the numbers and justify
   them for a small NAS. Suggested targets:
   - parsing all parts of one package takes at most about 500 ms of event-loop time;
   - parsing adds at most about 150 MiB of heap or RSS.
   Measure the tracked template and a realistic 12-dated-sheet workbook against the
   budget as well.
2. **Close the parser bypasses (RB-01 (a)), as a class.**
   - Bound the work before or while building any object tree. For example:
     - count every `<` that opens markup, whatever follows it;
     - bound the attribute bytes and the attribute count per element and per part;
     - bound the per-part XML size so that the worst-case node amplification fits the
       budget;
     - or use the parser's own limits, or a streaming or event parser, with hard
       stops.
   - Whatever you choose, show that no shape of XML inside the limits exceeds the
     budget. Cover:
     - tiny elements of any name shape;
     - attribute-heavy elements;
     - deep nesting;
     - long text nodes;
     - many parts each just under the limit.
3. **Bound the stored report (RB-01 (b)).**
   - Cap the length of every cell value, label and text copied into findings or the
     report, for example 200 characters plus a `truncated` flag.
   - Cap the total serialized report size. Refuse with 422 when the cap is exceeded,
     never with 500.
   - Report building must never throw an unhandled error. A `RangeError` or a similar
     failure becomes 422 `workbook_rejected` with a reader code.
4. **Correct the overclaiming header comment** in `xlsxReader.ts`.
5. **Tests.**
   - Red-first tests built from the recheck probes r1, r2 and r3: tags led by digits or
     spaces, attribute-heavy parts, four near-limit parts, a 1 MiB shared string times
     100 holiday names, and a 4 MiB string times 2,000.
   - One test that asserts the template and the realistic workbook still preview.
   - Assert the refusal codes and a bounded report size. Use time and memory only as
     generous, CI-stable bounds.
   - Add one "adversarial sweep" test that generates a set of shapes near every limit
     and asserts each one is refused or bounded.

## Owned (writable) paths

- `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` and
  `src/server/services/workbookImport.ts`.
- `src/server/routes/imports.ts`, only for the error mapping.
- `tests/integration/workbook-reader.test.ts` and `workbook-import.test.ts`.
- `tests/support/syntheticWorkbook.ts`, only if a generator helper is needed.
- `src/client/importModel.ts`, only for labels of any new reader codes, if the generic
  fallback is not enough.
- docs/07 workbook import, EN and VI: update the limits sentence if the numbers change.
- This report and `handoff/delivery/evidence/WP4-FIXB2/`.

List any other minimal edit as a deviation. Do not touch migrations, `.claude/` or
`reference/`.

## Checks

- Save the red-first output for each new test.
- Mutations, in a scratch clone:
  - revert to the letter-only element count: a test fails;
  - drop the value-length cap: a test fails;
  - drop the report-size guard: a test fails.
- Rerun every probe on your build, from the first audit (P1b, P6, P7) and from the
  recheck (r1, r2, r3). Record before-and-after numbers for each: time, maximum RSS,
  health latency, report size and status.
- Last commands, after the final edit:
  1. `npm run test:e2e`;
  2. `npm run verify` (with `--trace-deprecation --pending-deprecation`);
  3. `npm run digest`.

  If any file changes after these, rerun them.
- Evidence:
  - masked (`<email>`, `<user>`), LF and `.txt` only;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 180 words, beginning with your self-reported model:
- the budget and the mechanism;
- the probe numbers, before and after;
- the report bound;
- the tests (red→green) and the mutation results;
- the e2e and verify exit codes and the test count;
- the digest;
- every changed path;
- deviations.

## Results

Self-reported model: claude-opus-5-5 (effort not observable). Date 2026-10-06. Not committed. Baseline 0f7fba2,
digest before `dfe4541d…6742` (775 files). Evidence: `handoff/delivery/evidence/WP4-FIXB2/` (01-baseline to
10-incidents, 11-precommit, probes as `probe-*.mjs.txt`; masked, LF).

### Budget and mechanism

- Budget (stated next to `DEFAULT_READER_LIMITS`): reading any package that is accepted, or refused after reading,
  takes at most 500 ms of event-loop time and adds at most 150 MiB on the reference host (Node 24, x64 workstation).
  Why: the preview runs on the single event loop that serves everyone on a small NAS (a CPU 3-4x slower makes 500 ms
  a 1.5-2 s pause, not a hang), and a 1-2 GiB NAS cannot give one preview more than ~150 MiB. The stored report is at
  most 2 MiB (`MAX_REPORT_BYTES`).
- Mechanism (`xlsxReader.ts`): fast-xml-parser is no longer used. Its char-by-char string building costs ~55-110 B and
  70-300 ns per input byte, which no byte limit that still accepts a 64-sheet workbook can fit. A bounded one-pass
  scanner replaces it. It counts every `<` that does not start an end tag (elements of any name, comments, PIs,
  CDATA); end tags must match an open element. It counts attributes per element, part and package and the length of
  every start tag, and refuses non-XML tag names (`<1/>`, `< />`, `<.a/>`, `<-/>`), nesting over 40 and malformed
  markup. It keeps only the elements, attributes and text the reader uses, with no allocation for anything else, and
  streams rows, cells and shared strings one at a time. Entities are decoded into one buffer. Formula text is cut at
  8 192 characters, and the mapping examines each distinct formula text once. The mapping examines at most 1 024
  characters of a cell's text.
- Limits: openings 100 000 a part / 200 000 a package (were 200 000 / 400 000 letter-led elements); attributes 64 an
  element / 200 000 a part / 500 000 a package; start tag 64 KiB; sheet name 100 characters. Unchanged: 4 MiB a part,
  16 MiB a package, cells, rows and shared strings. Margins over the 64-sheet realistic workbook (1.4 MB, 53 400
  openings, 92 400 attributes; largest part 29 KB, 1 379 openings, 1 720 attributes; at most 9 attributes and 643
  characters per tag): openings 3.7x a package, attributes 5.4x, tag length 100x, part bytes 142x.
- Measured against the budget (05): the worst shapes were about 180 ms (4 x 4 MiB of `&amp;`) and +107 MiB (4 x 49 900
  empty cells, refused at the package opening limit). The tracked template took 10 ms / +11 MiB, 12 dated sheets with
  clocks 24 ms / +11 MiB, and 61 dated sheets (the 64-sheet limit) 59 ms / +32 MiB.

### Report bound (`templateMapping.ts`, `workbookImport.ts`)

- Every workbook text copied into the preview or report is cut to 200 characters (`MAX_TEXT_LENGTH`). This covers
  labels, holiday names, the employee cell, finding labels and part names, and each carries `truncated: true` when
  cut. Text longer than the 1 024-character scan is never matched as a label, holiday, date or time.
- The serialized report (plan included) is capped at 2 MiB of UTF-8 and checked before the source is stored and again
  in the transaction. Over the cap, or a `RangeError` while serializing, gives 422 `workbook_rejected` with reason
  `report_too_large`. Any other failure while reading, mapping or building the report gives 422 `report_failed`.
  Nothing is stored, and no response is a 500.
- Measured stored reports: template 4 KB, 12 sheets 0.11 MiB, 61 sheets 0.58 MiB, the capped flood 1.42 MiB. 2 000
  control-character names give 422 `report_too_large`.

### Probes before -> after (05 in memory, 06 over HTTP; before = 0f7fba2)

- r3: `<1/>`, `<9/>`, `< />` and `<.a/>` went from 0.66-0.88 s and +232-520 MiB accepted to 17-28 ms and about +20
  MiB, refused `malformed_xml`. The 3.8 MiB-attribute `<c>` went from 1.16 s / +465 MiB to 55 ms / +78 MiB,
  `too_many_attributes`.
- r1:
  - H2a: 3.15 s / +1.09 GiB -> 25 ms, `malformed_xml`.
  - H4b: 5.06 s / +525 MiB -> 57 ms, `too_many_attributes`.
  - H1c: 591 ms / +222 MiB -> 28 ms, `too_many_elements`.
  - H5b: 3.4 s + a RangeError -> 43 ms, 0.57 MiB report.
  - H5d: 99.8 MiB report -> 0.03 MiB.
  - H5e: RangeError -> 0.39 MiB.
  - H6a/H6b: 24 / 143 MiB reports -> 0.02 MiB.
  - H7: 261 ms / +235 MiB -> 32 ms.
- r2 over HTTP:
  - H2a: 201 after 3 164 ms, health 2 864 ms -> 422 in 10 ms, health 2 ms.
  - H4b: 201 after 4 956 ms -> 422 in 53 ms.
  - H5d: 99.8 MiB stored -> 0.031 MiB.
  - H5b: 500 after 5 678 ms -> 201 in 37 ms with 0.568 MiB.
  - No server error line.
- First audit:
  - P1b and P7 (all sizes) stay refused as before (`part_too_large` / `total_too_large`), now in 1-8 ms.
  - P6 (37 KB and 65 KB `<c/>` packages over HTTP): 422 in 2-3 ms, health 2 ms (before: 7 / 3 ms).
- New:
  - shared 1 MiB formula x 19 000 cells: 38.2 s -> 65 ms.
  - 4 MiB of whitespace x 2 000 holidays: 3.8 s -> 39 ms.
  - 1 MiB sheet name: 45 MiB preview / 124 MiB response -> `tag_too_large`.
  - Entity-dense text: 939 ms / +555 MiB -> 176 ms / +62 MiB.

### Tests and mutations

- Red-first (02): 15 new tests failed on the unchanged source. These are 12 in workbook-reader (r3 names, r1
  H2a/b/e, count of every opening, the H1c total, attributes and tag length, H5d, H5b, H6/H5e labels, sheet name,
  shared formula, whitespace, and the adversarial sweep of 35 shapes) and 3 in workbook-import (r2 over HTTP, the
  report cap, serialization and mapping failures -> 422). The final versions were rerun against the baseline export
  and the same 15 failed.
- The guard test "template and realistic 12-sheet workbook still preview, untruncated" passes before and after.
- Green: the two files pass 84/84 (03). Existing tests adjusted: RAISED limits gain attribute limits, and the
  findings-cap test uses 3 x 30 000 cells (3 x 40 000 is now over the opening limit). See 10.
- Mutations, in the scratch copy (04), all KILLED and restored byte-identical:
  - required: letter-only count (2 tests), no value-length cap (4), no report-size guard (1);
  - extra: any tag name, no per-element attribute limit, no per-part attribute limit, no tag-length limit, no scan
    prefix, no formula memo, a rethrown report failure.

### Final commands (after the last source edit)

- `npm run test:e2e`: exit 0, 145 passed and 5 skipped (07).
- `npm run verify` with `--trace-deprecation --pending-deprecation`: exit 0. Typecheck, lint, 76 files with 1 750
  tests, build and SMOKE PASSED all passed, and the output has no deprecation line (08).
- `npm run digest`: `9848e8d77bfef9a167dfe811fac3bda312fdce146ceaf52c7d4332f0788f2cdb` (775 files, handoff/ excluded).
  The template hash `47ef42d5…6331` is unchanged (09).

### Changed paths

- `src/server/import/xlsxReader.ts`
- `src/server/import/templateMapping.ts`
- `src/server/services/workbookImport.ts`
- `tests/integration/workbook-reader.test.ts`
- `tests/integration/workbook-import.test.ts`
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md` (the limits sentence)
- this brief and `handoff/delivery/evidence/WP4-FIXB2/`

### Deviations and open points

- `routes/imports.ts` and `src/client/importModel.ts` are unchanged. The service maps every failure itself, and the new
  reasons show the client's generic text.
- fast-xml-parser is now unused by `src/`. package.json is not an owned path, so removing the dependency is a follow-up.
- Rule breach: one empty heredoc was fed to `python3` through stdin to probe for Python. It ran nothing (10).
- The budget is measured on the workstation only; the NAS is NOT VERIFIED. Owner choice I-5 (per-user preview quota)
  remains open.
