# WP4-FIXB3 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB3; package WP4; kind fix;
  attempt 1. It addresses WP4-RECHECK-B2 (FIX REQUIRED, finding WP4-RB2-01) and follows
  `handoff/prompts/FIX_FINDINGS.md`.
- Profile/routing: timesheet-expert, requested opus, no override. Effort stays at the
  profile's level, xhigh. Routing: size S, risk M (a resource bound and its stated
  claim), not novel.
  - The same expert who wrote WP4-FIXB2 is resumed for continuity. A different fresh
    auditor will recheck the work.
  - Records are in English.
- Read [WP4_RECHECK_B2](../WP4_RECHECK_B2.md): the finding WP4-RB2-01 and risks R-B2-1
  and R-B2-2. Read its probes in `handoff/delivery/evidence/WP4-RECHECK-B2/`, especially
  `probe-b2-cost.mjs.txt` (shapes E7 and Y7) and `20-b2-cost-mechanism.txt`.
- Baseline: main at cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d (digest 96445de4…, 775
  files). The working tree differs only in handoff/.

## Required outcome

1. **Make the stated budget true, with margin.**
   - Decode each kept attribute value once. Refuse or ignore kept attribute values
     longer than a small cap; OOXML `r`, `t` and `s` are a few characters, so use for
     example 255.
   - Keep kept cell values as copies, not slices that pin a decoded part.
   - Fix the `decodeXml` per-`&` window cost if it still matters.
   - Lower `maxTotalElements`, or another limit, only as far as needed.
   - The worst case you can construct must stay clearly under 500 ms and +150 MiB on
     the reference host: aim for at most about 70 percent of each.
   - Do not loosen the stated budget.
2. **Search for the worst case systematically.**
   - Extend the adversarial sweep with E7 and Y7.
   - Add a combinatorial search: each limit pushed to its maximum, combined with the
     most expensive decode paths and with two-byte text.
   - Record the worst shape you find and its numbers.
3. **Correctness.** A value must be decoded exactly once. Add tests showing that
   `&amp;amp;`, `&amp;lt;` and numeric references decode to exactly one level. The
   benign differential must stay byte-identical: template and a 12-dated-sheet workbook,
   against the accepted WP4-T09 reader output from an export of 13a258d.
4. **R-B2-1:** take the `floating_holiday` flag from the matched holiday itself, not
   from a comparison of truncated names. Add a red-first test.
5. **R-B2-2:** refuse a part whose XML declaration names an encoding other than UTF-8
   or UTF-16, with a reader code. Add a red-first test.
6. **Update the budget comment and docs/07 (EN and VI)** only to state the measured
   worst case and the margin. The 500 ms and 150 MiB claim stays.

## Owned (writable) paths

- `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` and
  `src/server/services/workbookImport.ts`.
- `tests/integration/workbook-reader.test.ts` and `workbook-import.test.ts`.
- `src/client/importModel.ts`, only for a label for a new reader code.
- docs/07 and its `.vi.md`, for the workbook-import budget sentence.
- This report and `handoff/delivery/evidence/WP4-FIXB3/`.

## Runtime

Use the WP4-FIXB2 rules, with the task folder `D:\.claude-tmp\timesheet\WP4-FIXB3`:
- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- Never feed scripts to python or node through stdin.
- Use Node 24 by full path. Keep shell calls in the foreground.
- Set `DATA_DIR` and `DATABASE_PATH` explicitly in the task folder.
- Never write a workbook into the repository. Run no docker command.
- Never redirect to /dev/null or nul. Never remove folders recursively.
- If a permission check denies a call, stop and report.
- Do not commit.

## Checks

- Red-first output for E7, Y7, the decode-once test, R-B2-1 and R-B2-2.
- Mutations in a scratch clone:
  - double decoding comes back: a test fails;
  - the attribute-length cap is removed: a test fails;
  - slices come back: the memory sweep fails, or note why memory cannot be asserted
    stably and what stands in for it.
- Rerun every earlier probe (P1b, P6, P7, r1–r3, the RECHECK-B2 shapes) and record the
  numbers before and after.
- Last commands, after the final edit, in this order: `npm run test:e2e`, then
  `npm run verify` (with deprecation tracing), then `npm run digest`.
- Evidence: masked, LF, `.txt` only. Run the precommit check over it on a temporary
  index.

Return at most 160 words, beginning with your self-reported model:
- the changes;
- the worst case found and its numbers;
- the margins;
- the tests and mutations;
- the e2e and verify exit codes and the test count;
- the digest;
- the changed paths;
- deviations.

## Results

Self-reported model: claude-opus-5-5 (effort not observable). Date 2026-10-06. Not committed. Baseline cc34e7f,
digest before `96445de4…d503` (775 files). Evidence: `handoff/delivery/evidence/WP4-FIXB3/` (01-baseline to
13-incidents, 14-precommit, probes as `probe-*.mjs.txt`; masked, LF).

### Changes

All of these are in `xlsxReader.ts` unless marked.
- **Kept attribute values:** each value of at most 255 characters as written (`maxKeptAttributeLength`) is kept;
  a longer one is refused with 422 `attribute_too_large`. Each value is decoded once, when the scanner reads it, and
  stored as an own copy. `attr()` never decodes again, which fixes E7's decoding on every read.
- **Kept text:** text is decoded once and made an own copy when its element closes. Formula text is cut, then copied.
  No kept value now pins a decoded part, which fixes Y7's pinning (07: pinned equals unpinned).
- **`decodeXml`:** it finds the next `;` once and skips every `&` too far before it in one step, so its cost is linear
  with a small constant. It allocates only when a reference decodes.
- **Inflating:** the output goes straight into one buffer.
- **Limits lowered, only as far as the budget needed:** `maxTotalXmlBytes` 16 → 8 MiB and `maxTotalElements`
  200 000 → 150 000. The experiments in 06 (re-run) show that 16 MiB or 12 MiB with 150 000, or 175 000 with 8 MiB,
  still exceed the +105 MiB target. Realistic margins: 6x the XML and 2.8x the openings of a 64-sheet workbook.
- **R-B2-2:** a declared encoding other than UTF-8 or UTF-16 is refused with 422 `unsupported_encoding`.
- **R-B2-1 (`templateMapping.ts`, `workbookImport.ts`):** `floating_holiday` comes from the matched holiday itself.
  The preview shape is unchanged, through a WeakMap and the `matchedHoliday()` accessor.
- **Budget comment and docs/07 EN/VI:** they state the measured worst case. The 500 ms / 150 MiB claim is unchanged.

### Worst case and margins (05, 06)

- Search: 210 earlier shapes, plus a grid of 8 MiB packages with every limit pushed to its maximum, the costliest
  decode paths, two-byte text, a pinned value in every part and the mapped sheet roles (132 shapes), plus repeats.
- Worst memory: +89 MiB, for 150 000 kept cells in two-byte parts (60 % of the budget).
- Worst time: 289 ms in one single run, at most 206 ms over five repeats (58 % and 41 %).
- Before → after:
  - E7: 614 ms → `attribute_too_large` in 21 ms; over HTTP, 201 after 670 ms (health 371 ms) → 422 in 15 ms.
  - Y7: +157 MiB → `total_xml_too_large` at +76 MiB.
  - Search shapes: up to 669 ms / +161 MiB → at most 152 ms / +83 MiB.
  - P1b, P6, P7, r1, r3 and r2: unchanged refusals or bounds (05, 08).
- The benign differential against T09 (13a258d) is identical, including the report's floating flags (09).

### Tests and mutations

- Red-first (02): 7 tests failed on cc34e7f: E7 and the cap, Y7, R-B2-1, R-B2-2, the sweep and two adjusted
  sheet-name tests. The decode-once test passes on the baseline too and is a guard.
- Green: 89/89 (03). The sweep gained E7, Y7, kept-attribute and new byte shapes. Some existing tests were resized to
  the new limits (13).
- Mutations (04), all files restored byte-identical:
  - double decoding of attributes or of text: KILLED;
  - attribute-length cap removed: KILLED;
  - slices back: not caught by the tests, because memory cannot be asserted stably in vitest. The retained-memory probe
    catches it: +16 MiB pinned (31 → 47 MiB);
  - the 4 extra mutations: KILLED.

### Final commands

- `npm run test:e2e`: exit 0, 145 passed and 5 skipped.
- `npm run verify` with deprecation tracing: exit 0. 76 files with 1 755 tests and SMOKE PASSED; no deprecation line.
- `npm run digest`: `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` (775 files). The template hash
  is unchanged.

### Changed paths

- `src/server/import/xlsxReader.ts`
- `src/server/import/templateMapping.ts`
- `src/server/services/workbookImport.ts`
- `tests/integration/workbook-reader.test.ts`
- `tests/integration/workbook-import.test.ts`
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`
- this brief and `evidence/WP4-FIXB3/`

### Deviations

- None outside the owned paths. `importModel.ts` is unchanged: the new reasons show the generic text.
- A stale mutation list ran once by mistake, in the scratch copy only (13).
- The NAS is NOT VERIFIED.
