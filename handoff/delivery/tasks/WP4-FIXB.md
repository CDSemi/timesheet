# WP4-FIXB dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB; package WP4; kind fix;
  attempt 1. It addresses WP4-AUDIT-B (FIX REQUIRED) and follows
  `handoff/prompts/FIX_FINDINGS.md`.
- Title: bound the workbook parse cost and report size, fix the holiday overflow, and
  two conservative import guards.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Effort stays at
  the profile's level, high.
  - Routing: size M, risk H (untrusted-input limits), not novel; it extends WP4-T08 and
    T09.
  - This is the first fix round, so no escalation.
  - Records in English.
- Read AGENTS.md from disk first. Then read:
  - [WP4_REVIEW_B](../WP4_REVIEW_B.md): findings WP4-B-01 and WP4-B-02 and risks R1
    and R3, with their probes in `handoff/delivery/evidence/WP4-AUDIT-B/`
    (`probe-p1b-cost.mjs.txt`, `probe-p6-blocking.mjs.txt`, `probe-p7-report-size.mjs.txt`,
    `probe-p1-reader.mjs.txt`);
  - `handoff/prompts/FIX_FINDINGS.md`;
  - the results of [WP4-T08](WP4-T08.md) and [WP4-T09](WP4-T09.md);
  - `src/server/import/xlsxReader.ts`, `templateMapping.ts`,
    `src/server/services/workbookImport.ts` and `src/server/services/otLeave.ts`.
- Baseline: main at 13a258db86b2f0b6388830e584e2cca5303f1f6c, the WP4 package freeze
  (digest 1ed67f55…, 774 files). The working tree differs only in handoff/.

## Runtime

- Shell:
  - Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`,
    or any interactive shell.
  - Never feed a script to python or node through stdin (`-` or a heredoc). Write each
    probe to a file in the task folder and run that file.
  - Call Node 24 by its full portable path, or put it first on PATH. Make the first
    shell call a trivial `node --version`, and stop on ENOSPC. Keep shell calls in the
    foreground.
- Files:
  - Use `D:\.claude-tmp\timesheet\WP4-FIXB` for TEMP/TMP, scratch clones, every
    generated or hostile workbook, and all raw output.
  - For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly under
    that folder.
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

## Required changes

1. **WP4-B-01: bound the work an untrusted package can cause.**
   - Before a part is parsed, refuse it with 422 `workbook_rejected` and a reader code
     if either is true:
     - its decoded XML is larger than a per-part parse limit, for example 4 MiB, well
       below the 16 MiB inflate limit;
     - a cheap scan of the decoded text counts more element openings than the limits
       allow. Count `<c`, `<row` and `<si`, and all elements, before building a DOM.
   - Also bound the total XML parsed per package.
   - Choose the limits so the tracked template, and a realistic workbook of several
     dated sheets, stay far inside them. State the numbers and the reason in the
     report.
   - Cap the stored and returned findings. For example, keep the first 20 sources per
     finding plus a total count. The report size then stays bounded whatever the cell
     count.
   - Red-first tests, adapted from the audit probes:
     - the 65 KB package of `<c/>`-filled sheets is refused quickly, or handled within
       a stated time and memory budget;
     - `<c><v>1</v></c>` sheets are refused before large allocations;
     - the 2.7 MB formula-heavy package gives a bounded report size.

     Assert time or memory only loosely, with a generous bound that is stable on CI; the
     refusal code is the main assertion.
2. **WP4-B-02.** In `readHolidays`, compute the last row with a loop, or iterate the
   cells that exist. No spread or `Math.max(...)` over an unbounded array, and no row
   loop driven by a far sparse row. Red-first tests:
   - 150,000 Holiday Dates cells: previewed, or refused with 422, never 500;
   - one sparse far row: fast.
3. **R3, a conservative import guard.**
   - A period whose payroll due instant has not passed yet is skip-only. Name it
     `not_due` or similar, so that a live, not-yet-due period cannot be made
     unsignable by an import. This makes the I-3 safe default stricter; the owner can
     reverse it.
   - Store the new rule in the report's `rules`.
   - Red-first test.
4. **R1.** An OT leave reservation dated inside an `imported_unverified` period answers
   409 `imported_period`, as recording its use already does. Red-first test.
5. Fix nothing else. Do not touch the client except where a test pin breaks. Report every
   changed path.

## Owned (writable) paths

- `src/server/import/xlsxReader.ts` and `src/server/import/templateMapping.ts`.
- `src/server/services/workbookImport.ts` and `src/server/services/otLeave.ts`.
- `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts` and
  `ot-leave*.test.ts`, plus `tests/support/syntheticWorkbook.ts` if a generator helper is
  needed.
- This report and `handoff/delivery/evidence/WP4-FIXB/`.

List any other minimal edit as a deviation. Do not touch migrations, `.claude/`, docs/ or
`reference/`.

## Checks

- Red-first output for each item, saved.
- Mutations, in a scratch clone:
  - remove the element-count pre-scan, or the per-part limit: a test fails;
  - restore the spread in `readHolidays`: the 150,000-cell test fails.
- Rerun the audit probes P1b, P6 and P7 against your build, and record the
  before-and-after numbers: time, maximum RSS, report size and status codes.
- Last commands, after the final edit:
  1. `npm run test:e2e`;
  2. `npm run verify` (with `--trace-deprecation --pending-deprecation`);
  3. `npm run digest`.

  If any file changes afterwards, rerun them.
- Evidence:
  - masked (`<email>`, `<user>`), LF and `.txt` only;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 160 words, beginning with your self-reported model:
- the limits chosen and why;
- the before-and-after probe numbers;
- the B-02, R3 and R1 changes;
- the tests (red→green) and the mutation results;
- the e2e and verify exit codes and the test count;
- the digest;
- every changed path;
- deviations.

## Results

Self-reported model: claude-sonnet-5-5 (effort not observable). Date 2026-10-06. Not committed. Evidence:
`handoff/delivery/evidence/WP4-FIXB/` (01-baseline to 10-precommit, probes as `probe-*.mjs.txt`).

### Limits chosen (xlsxReader.ts `DEFAULT_READER_LIMITS`) and why

Measured on the tracked template and on synthetic workbooks of 3, 26 and 60 dated sheets
(`01-baseline.txt`): largest part 29 454 B, 1 378 elements, 529 cells, 353 rows; 60 dated sheets are
1.43 MB of XML and 53 363 elements in all.

| Limit | Value | Margin | Code |
|---|---|---|---|
| `maxPartXmlBytes` (checked on the declared size before inflating, and on the real output while inflating) | 4 MiB | 142x the largest part | `part_too_large` |
| `maxTotalXmlBytes` (all parsed parts of one package) | 16 MiB | 11x the 60-sheet workbook | `total_xml_too_large` |
| `maxPartElements` (cheap element-opening scan before the DOM, any namespace prefix, early exit) | 200 000 | 145x | `too_many_elements` |
| `maxTotalElements` | 400 000 | 7.5x the 60-sheet workbook | `too_many_elements` |
| `maxCellsPerSheet` (`<c` count in the scan; was 200 000) | 50 000 | 94x | `too_many_cells` |
| `maxRowsPerSheet` (`<row` count; new) | 20 000 | 57x | `too_many_rows` |
| `maxSharedStrings` (`<si` count; was 100 000) | 50 000 | template has 66 | `too_many_shared_strings` |

Report caps (templateMapping.ts): `MAX_FINDING_SOURCES` 20 with a new `sourceCount` on every finding;
`MAX_FINDINGS_PER_CODE` 25, the rest folded into one summary finding per code (`details.omitted_findings`),
while `summary` and `clean` are counted before the fold and stay true; `MAX_HOLIDAY_ROWS` 2000 (template: 9 rows),
more is 422 `too_many_holidays`. All refusals are 422 `workbook_rejected` with the code in `details.reason`. The
cell and string limits were lowered because 200 000 cells could not be reached under the element limit anyway.
The worst package that is still accepted (3 sheets of about 130 000 valued cells) costs 0.5 s and +193 MiB, against
8.5 s and +740 MiB before.

### Before and after (`05-probes-before-after.txt`)

| Probe | Before | After |
|---|---|---|
| P1b 65 KB, 3 x 15.8 MiB `<c/>` | 8 472 ms, maxRSS 167 to 903 MiB, accepted | 4 ms, 167 to 169 MiB, `part_too_large` |
| P1b 113 KB, 3 x `<c><v>1</v></c>` | 2 547 ms, to 1 010 MiB, `too_many_cells` | 4 ms, 169 MiB, `part_too_large` |
| P1b Holiday sheet, 150 000 cells (692 KB) | RangeError (500), 873 ms | 12 ms, 422 (`part_too_large`); with raised limits it previews, no crash |
| P1b sparse far row A9999999 | accepted, 553 ms | accepted, 18 ms |
| P6 65 KB upload over HTTP | 201 after 8 340 ms; health check waited 8 042 ms | 422 `part_too_large` in 5 ms; health 2 ms |
| P6 37 KB (one 15 MiB sheet) | 201 after 2 789 ms; health waited 2 488 ms | 422 in 15 ms; health 2 ms |
| P7 3 x 199 000 formula cells (2.7 MB) | findings JSON 12.21 MiB, 597 023 sources | refused `part_too_large`, 9 ms |
| P7 3 x 15 000 formula cells (accepted) | 0.872 MiB, 45 023 sources | 0.003 MiB, 83 listed sources |

### Changes

- B-01: `xlsxReader.ts` (new limits, per-part size check before inflate, real-output stop at the part cap, element
  scan before the DOM, total budgets); `templateMapping.ts` (`sourceCount`, source cap, per-code fold).
- B-02: `readHolidays` takes its row numbers from the A/B cells that exist, sorted, with no spread and no loop to
  the largest row; more than 2 000 holiday rows is refused.
- R3: `workbookImport.ts` state `not_due` / reason `period_not_due` when the period has ended but `dueAtUtc` is
  after now (the due instant itself counts as due, like the deadline scan); skip-only; new entry in `IMPORT_RULES`
  (stored in every report); header comment updated.
- R1: `otLeave.ts` `reserveOtLeave` answers 409 `imported_period` for a leave date inside an imported period (after
  the idempotent duplicate check, before the balance check); the use guard stays as defence in depth.

### Tests (red to green) and mutations

- Red-first (`02-red-first.txt`): 18 failed, 86 passed in workbook-reader, workbook-import and ot-leave before any
  source change. Green (`03-green.txt`, `07-verify.txt`): the full suite is 75 files, 1 730 tests, all pass.
- New tests: reader 12 (limits and report size; the audit's 65 KB, `<c><v>1</v></c>` and 2.7 MB packages; pre-scan with
  prefixed names; every lowered limit; total XML; 60 dated sheets accepted; source cap; whole small findings; finding fold; holiday cap) and
  4 for B-02 (150 000 cells with raised limits previewed, default limits 422, sparse far row, a counting-map test of
  the mapping alone); import 2 (HTTP 422 for the oversized and the 150 000-cell package, nothing stored; R3 with the
  exact due boundary); ot-leave 2 (R1, and the use refusal for a reservation that predates an import).
- Existing tests adjusted because the rules changed: the 64 MiB lying-header bomb now stops as `part_too_large`; the
  automation test imports P1 one minute after its deadline (R3 makes an earlier import skip-only) and drops the two
  before-deadline instants; the opening-balance red-first test now expects 409 on the reservation.
- Mutations (scratch clone, `04-mutations.txt`), all KILLED and restored byte-identical: no element pre-scan (4 tests),
  no per-part limit (5), spread restored in `readHolidays` (3, including the 150 000-cell test), no source cap (1), no
  total-XML budget (2), no finding fold (1), no holiday row cap (1), no `not_due` rule (1), no reserve guard (1).

### Final commands (after the last edit; `06` to `08`)

- `npm run test:e2e`: exit 0, 145 passed, 5 skipped.
- `npm run verify` with `--trace-deprecation --pending-deprecation`: exit 0; typecheck, lint, 75 files / 1 730 tests,
  build, SMOKE PASSED; no deprecation line. The first run failed only at the smoke because the shell had DATA_DIR
  set (the smoke script derives its own); rerun with DATA_DIR and DATABASE_PATH unset (`09-incidents.txt`).
- `npm run digest`: `b119e1b58aaeefa57784e01f4158f27d6decc83907ae4a6b817bfc613dc144ce` (774 files, handoff/ excluded).
  Template hash `47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331` unchanged. Precommit check on a
  temporary index: PASS, 26 files, 0 findings (`10-precommit.txt`).

### Changed paths

Owned: `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts`,
`src/server/services/workbookImport.ts`, `src/server/services/otLeave.ts`,
`tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`, `ot-leave.test.ts`, this report and
`handoff/delivery/evidence/WP4-FIXB/`.

### Deviations

- Outside the owned list, all minimal and required: `src/client/api.ts` and `src/client/importModel.ts` (labels for
  the new `not_due` state and `period_not_due` reason; the new reader codes use the existing generic fallback),
  `tests/client/importModel.test.ts` (its all-reasons and all-states pins) and
  `tests/integration/opening-balance.test.ts` (its red-first test reserved OT leave inside an imported period).
- Not done (outside scope): `docs/07`, `docs/10` (I-3 wording) and their `.vi.md` still say "not ended"; the
  coordinator should add the due-instant rule and the new limits there. `tests/support/syntheticWorkbook.ts` unchanged.
- Procedure: two inline `node -e` debugging commands (not stdin); the smoke incident above; helper files only under
  the task folder (`09-incidents.txt`).
- Not rerun: the container drill and the NAS target (outside this task).
