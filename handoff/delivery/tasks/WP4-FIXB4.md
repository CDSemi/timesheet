# WP4-FIXB4 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB4; package WP4; kind fix;
  attempt 1. It addresses WP4-RECHECK-B3 (FIX REQUIRED, finding WP4-RB3-01) and follows
  `handoff/prompts/FIX_FINDINGS.md`.
- Profile/routing: timesheet-expert, requested opus, no override. Effort stays at the
  profile's level, xhigh. Routing: size S, risk M, not novel. The same expert resumes for
  continuity, and a different fresh auditor will recheck the result. Write records in
  English.
- **Coordinator decision of 2026-10-06** (board `coordinator_decisions`):
  - Area B has needed four rechecks on the parse budget, because the budget was claimed
    from searched shapes instead of derived.
  - This round closes the class by derivation.
- Read [WP4_RECHECK_B3](../WP4_RECHECK_B3.md) (finding WP4-RB3-01, risks R-B3-1..4) and
  its probes in `handoff/delivery/evidence/WP4-RECHECK-B3/`, especially
  `probe-rcb3-cases*.mjs.txt`, `probe-phase.mjs.txt` and `14-phase-F2.txt`.
- Baseline: main at 972ccda6409a7521a008c55c35a5b5cf416daf1e (digest 635f909d…, 775
  files).

## Required outcome

1. **Make inflation linear and cheap.** The 4 KiB-step inflate costs 264 ms on
   incompressible input, against 38 ms on compressible input.
   - Inflate into a single preallocated buffer of the declared size, still bounded by
     the size limit, or use another linear method.
   - Keep the size checks against the real inflated output.
2. **Derive a linear cost bound from the enforced limits.**
   - Measure per-unit coefficients for inflated bytes, decoded bytes, element openings,
     attributes and kept values, for both compressible and incompressible content.
   - Write the bound as a formula over the limits, and evaluate it.
   - Confirm it by measurement against the worst constructions: an incompressible part
     at each limit, a mixed package, and every earlier probe family.
   - Record the formula, the coefficients and the confirmation runs in evidence.
3. **Set a realistic ceiling if needed.**
   - If the derived bound at the current limits exceeds 500 ms or 150 MiB with less
     than about 30% margin, lower the route upload limit and the package limits to a
     realistic workbook ceiling. For example, use 2 MiB, justified by the measured size
     of a large realistic workbook such as three years of biweekly dated sheets.
   - Keep the template and realistic workbooks far inside the ceiling.
   - If the ceiling cannot be lowered enough, propose a restated budget figure with the
     derivation. Do not silently change the claim.
4. **Update the budget statement.** In the `xlsxReader.ts` comment and docs/07 (EN and
   VI), state the derived bound, the coefficients' host, the measured confirmation and
   the ceilings.
   - Update the docs/11 runbook and docs/03 only if a stated upload limit there changes.
   - Keep the client's stated 8 MiB message in step if the route limit changes:
     `importModel.ts` and the import screen text.
5. **Add a test.** It asserts that the route and reader ceilings match the documented
   values. It also asserts that a mid-size incompressible package at the new ceiling is
   handled within a generous time bound, or refused.

## Owned (writable) paths

- `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` and
  `src/server/services/workbookImport.ts`.
- `src/server/routes/imports.ts` and `src/server/app.ts`, only for the upload limit.
- `src/client/importModel.ts`, `src/client/ImportScreen.tsx` and
  `src/client/components/ImportPreview.tsx`, only for the stated limit text.
- `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`, and the client
  `importModel` test, only for limit pins.
- The e2e import spec, only if the limit text is pinned there.
- docs/07, docs/03 and docs/11, each with its `.vi.md`, only for the budget or limit
  sentences.
- This report and `handoff/delivery/evidence/WP4-FIXB4/`.

## Runtime

Use the WP4-FIXB3 rules, with the task folder `D:\.claude-tmp\timesheet\WP4-FIXB4`:
- **NEVER feed anything to python or node through stdin.** Write probe files and run
  them.
- Use Git Bash only. Never use `cmd.exe` in any form.
- Use Node 24 by full path. Keep shell calls in the foreground.
- Set `DATA_DIR` and `DATABASE_PATH` explicitly.
- No workbook in the repository and no docker.
- No /dev/null redirects and no recursive deletes.
- If a permission check denies a call, stop and report.
- Do not commit.

## Checks

- Save the red-first output for the new test, and the before-and-after numbers for the
  WP4-RECHECK-B3 incompressible shapes and for every earlier probe family.
- Rerun the benign differential against WP4-T09. It must be identical after dropping
  `sourceCount`.
- Last commands, after the final edit:
  1. `npm run test:e2e`;
  2. `npm run verify` (with deprecation tracing);
  3. `npm run digest`.
- Evidence: masked, LF, `.txt` only. Run the precommit check over it on a temporary
  index.

Return at most 160 words, beginning with your self-reported model:
- the inflate change;
- the bound formula and its value;
- the ceilings and their justification;
- the confirmation numbers and margins;
- the tests;
- the e2e and verify exit codes and the test count;
- the digest;
- the changed paths;
- deviations.

## Results

(Expert appends here.)

### Checkpoint 1 (2026-10-06, expert, in progress; superseded by the final results below)

- Done in the working tree (uncommitted): native `inflateRawSync` into one buffer with `maxOutputLength`; kept
  attribute values noted and decoded once per tag (last occurrence of each name); short decode path; canonical-address
  fast path; parts over 512 KiB decoded in steps and joined (removes a cost step at about 1 MB per part, where Node
  returns an external string that the scanner reads about 2x slower); ceilings 2 MiB upload, 1 MiB a part, 3 MiB a
  package, 100 000 openings; client text 2 MiB; red-first tests added and seen red (5 failures), limit-sized tests
  re-sized to the new ceilings (125/125 green in the three files).
- Derived bound (61 measured unit families, LP dual prices, reference host): about 121 ms and +95 MiB at the new
  ceilings (24 % and 63 % of the budget); at the old ceilings memory exceeded the budget (+185 MiB bound).
- Remaining: confirmation runs (worst constructions, every earlier probe family, repeats, full service path, HTTP,
  retained memory), benign differential, budget comment and docs/07, 11 (EN/VI), evidence, final gate commands.

### Final results (2026-10-06, expert, self-reported model claude-opus-5-5)

Status: done, uncommitted, for an independent recheck. Evidence: `handoff/delivery/evidence/WP4-FIXB4/` (00-README).

1. **Inflate.** One native `zlib.inflateRawSync` call per parsed entry, output buffer sized from the declared size,
   `maxOutputLength` at the cap (zlib stops with `ERR_BUFFER_TOO_LARGE` as soon as the real output passes it); size and
   CRC are still checked on the real output. Inflate alone, 8 MiB of incompressible XML: 251 ms before, 15.7 ms after;
   compressible: 32.5 ms to 2.2 ms; outputs equal (04).
2. **Linear decode.** A second cost step was found while measuring: Node returns decoded text of about 1 MB or more
   as an external string, which the scanner read about 2x slower (attributes family: 27 ms at parts of 1.005 M
   characters, 47 ms at 1.06 M). Parts over 512 KiB are now decoded in steps and joined (24 equality cases, 04). Kept
   attribute values are decoded once per tag for the last occurrence of each kept name; short values by concatenation;
   canonical cell addresses used as written.
3. **Derived bound** (05, 06; 61 unit families measured on Node 24.21, Windows 11 x64 workstation, five fresh
   processes each, compressible and incompressible, one-byte and two-byte parts; prices from linear-programming
   duality cover every unit): time <= 40 ms + 14.8 ns x X + 339 ns x O, memory <= 15 MiB + 13.3 B x X + 428 B x O
   (X XML bytes, O markup openings; attributes priced at zero). At the old ceilings (8 MiB, 150 000) the memory bound
   was about +182 MiB, over the budget.
4. **Ceilings** (justified by the largest accepted realistic workbook, 61 dated sheets / 64 sheets: 0.33 MB upload,
   1.4 MB XML, 53 400 openings; three years biweekly, 78 sheets, is over the 64-sheet limit): 2 MiB upload (route and
   reader; 6x), 1 MiB of XML a part (36x the largest part), 3 MiB a package (2.2x), 100 000 openings (1.9x); other
   limits unchanged. Bound at the ceilings: about 121 ms and +95 MiB, 24 % and 63 % of the budget (margins 76 % and
   37 %). Client text, the budget comment and docs/07 and docs/11 (EN, VI) state them; docs/03 states no size.
5. **Confirmation** (07-11): 23 worst constructions at the ceilings (incompressible part at the part limit, at each
   package limit and at the 2 MiB upload ceiling, the bound's own worst mixes, the recheck's shapes rebuilt): medians
   at most 108 ms and +63 MiB, single runs at most 114 ms and +72 MiB, bar one 149 ms run (median of that shape 107 ms,
   nine more runs at most 84 ms); whole service call at most 108 ms and +46 MiB. All earlier families (210 shapes,
   the WP4-FIXB3 search, the WP4-RECHECK-B3 catalogues, own sizes and rebuilt): at most 93 ms and +56 MiB. The
   WP4-RB3-01 shapes (506-576 ms, +96-122 MiB before) are refused by the upload ceiling (0 ms; HTTP 413 in 2-3 ms, worst
   health 2 ms, against 633 ms and 638 ms before); at the ceilings the worst HTTP upload took 107 ms (health 106 ms).
   Retained memory: pinned = unpinned. Benign differential against WP4-T09: reader cells and preview identical after
   dropping `sourceCount`, report identical after dropping `sourceCount` and the later `not_due` rule text, the same
   hashes as the recheck recorded for 972ccda; correctness probe 75 PASS.
6. **Tests.** Red-first (02): reader ceilings pinned to the documented values, an incompressible 2.33 MiB upload refused
   as `package_too_large`, route = reader = client limit = 2 MiB (413 above), client text "2 MiB": 5 failures before,
   green after; a mid-size incompressible package (1.8 MiB upload, 2.9 MiB XML; 102 ms in a probe) at the ceilings
   previews within the test's generous 2 s.
   20 existing tests sized to the old ceilings were re-sized (same assertions).
7. **Gate** (13-15, last commands in this order, rerun after the last edit, which corrected two test comment lines to
   measured sizes): `npm run test:e2e` exit 0 (145 passed, 5 skipped); `npm run verify` with `--trace-deprecation
   --pending-deprecation` exit 0 (76 files, 1 758 tests, smoke passed, no deprecation warning); `npm run digest`
   b0611629190b3f180a57a2dcc8baebe2efe2624e9149a5f840a3e7d45e9eb02f (775 files, handoff/ excluded). The first gate
   (same results, digest 558ede8d...) is kept in the same files. Precommit check on a temporary index: PASS (17).
8. **Changed paths:** `src/server/import/xlsxReader.ts`, `src/server/app.ts` and `src/server/routes/imports.ts`
   (comments), `src/client/importModel.ts`, `tests/integration/workbook-reader.test.ts`,
   `tests/integration/workbook-import.test.ts`, `tests/client/importModel.test.ts`, `tests/e2e/import.spec.ts`,
   `docs/07_DEPLOYMENT_AND_OPERATIONS(.vi).md`, `docs/11_OPERATIONS_RUNBOOK(.vi).md`, this brief, the evidence folder.
9. **Deviations and incidents** (16): fflate no longer imported by src/ (package.json not owned, dependency kept);
   limit-sized tests re-sized beyond pure pins; attribute and declared-inflate limits unchanged (no price in the bound);
   one `2>/dev/null` with the system `node -e "0"` (rule breach, no effect); two path-quoting slips (runs stopped before
   reading, rerun); an early `sed -i` EBUSY on a Dropbox file.
10. **Next action:** an independent auditor rechecks WP4-FIXB4 (WP4-RECHECK-B4); open hypothesis to test there: the
    bound covers the measured unit kinds, so a unit kind not in the 61 families could cost more per byte or per
    opening than the prices (07 and 08 found none).

Commit description (for timesheet-committer; scope: working tree of this task's owned paths, nothing staged):

```text
Derive the workbook parse bound and lower the import ceilings

- fix(import): Refuse uploads over 2 MiB and packages over 1 MiB of XML
  a part, 3 MiB in all or 100 000 markup openings, so the bound derived
  from measured unit costs (about 121 ms, +95 MiB) fits the budget; the
  import screen states 2 MiB.
- perf(import): Inflate each part with one native zlib call into one
  buffer, decode parts over 512 KiB in steps to avoid Node's slower
  external strings, and decode each kept attribute once per tag.
- docs: State the derived bound, its coefficients, the confirmation and
  the ceilings in the reader comment and docs/07 and docs/11 (EN, VI).
- test: Pin the reader, route and client ceilings, refuse an
  incompressible upload over 2 MiB, bound a mid-size one, and re-size
  the tests sized to the old ceilings.
- chore(handoff): Add the WP4-FIXB4 results and masked evidence.
```
