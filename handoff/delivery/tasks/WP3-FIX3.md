# WP3-FIX3 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIX3; package WP3; kind fix; attempt 1;
  `addresses_audit` WP3-RECHECK-BC2 (FIX REQUIRED: WP3-RBC2-01, test coverage). This is
  fix round 3 and it changes tests only.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing: size
  S, risk M (it restores coverage of integrity guards), novelty no.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP3_RECHECK_BC2](../WP3_RECHECK_BC2.md), finding WP3-RBC2-01 and the H-Q1 section;
  - the auditor's evidence in handoff/delivery/evidence/WP3-RECHECK-BC2/:
    `17-coverage-mutations.txt`, `18-h2-guards.txt`, `h2-guards.mjs.txt`,
    `mutsweep.sh.txt` and `h2mut.sh.txt`;
  - the WP3-FIX2 results (the `configuredUser` helper and the H-Q1 tests).

  Records in English.
- Baseline: main at 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714. The working tree differs
  only in handoff/.
- Runtime:
  - Call the Node 24 portable binary by its full path; plain `node` resolves v26. Make
    the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP3-FIX3` for TEMP/TMP, scratch clones and all raw
    output. Put only masked copies in the evidence directory.
  - Delete only files you created, and never inside the repository. Never remove
    folders recursively.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
  - If a permission check denies a call, stop and report; do not retry or rephrase it.
- Do not commit. Do not change any file under src/, docs/, scripts/ or configuration.

## Required changes (tests only)

1. **WP3-RBC2-01.**
   - In `tests/integration/deadline.test.ts` at the two tests near lines 271 and 786,
     use accounts that saved their submission settings with auto-submit on, for example
     with the `configuredUser` helper.
   - Each test must again exercise the guard it was written for:
     - the F-4 activation guard of the deadline scan (`automation.ts:191`, `:343-344`);
     - the imported-period exclusion (`automation.ts:204`).
   - In the "off" half of the second test, save the off switch **before** the deadline.
     Assert that nothing is submitted.
2. **Mutation proof.** Run these only in a scratch clone of 2d72d35 under the temp folder
   that has your updated test file copied in. Never mutate the repository's source.
   - Apply the auditor's mutations M4, M5 and M5b one at a time.
   - Show that the updated suite fails for each mutation and passes without it.
   - Save the outputs, masked.
3. **Guard sweep (pre-existing gap; add it if it stays test-only).** The auditor's sweep
   found that removing the `inactive_user`, `before_activation` or `not_due` skip passes
   the suite in both commits.
   - Add a direct test for each of these guards that is not already covered.
   - Prove each new test with the same scratch-clone mutation method.
   - If a guard cannot be tested without a source change, report it instead.

## Owned (writable) paths

- tests/integration/deadline.test.ts. A new test file under tests/integration/ is
  allowed only if it keeps the guard tests clearer; list it.
- handoff/delivery/WP3_HANDOFF.md and .vi.md: append a "Fix round 3 — WP3-FIX3"
  disposition subsection, with the same edit in both languages.
- This report and handoff/delivery/evidence/WP3-FIX3/.

## Checks

- Run `npm run verify` (with `--trace-deprecation --pending-deprecation`) and then
  `npm run digest` as the **last** commands. No e2e run is needed, because only
  integration tests change; state this.
- Evidence must be masked (`<email>`, `<user>`), LF and free of trailing whitespace. Run
  the precommit check over your evidence on a temporary index.

Return at most 150 words, beginning with your self-reported model:
- the tests changed or added, per guard;
- the mutation results (each mutation fails, the clean run passes);
- the guard-sweep outcome;
- the verify exit code and test count;
- the digest;
- every changed path;
- any deviations.

## Results

WP3-FIX3 attempt 1 (timesheet-worker, self-reported model claude-sonnet-5-5). Evidence: `evidence/WP3-FIX3/` (start at `00-commands.txt`).

- WP3-RBC2-01: `tests/integration/deadline.test.ts` only.
  - F-4 activation test: now `configuredUser` (auto-submit on) and asserts a saved-settings row exists.
  - Imported-period test: split in two. One uses `configuredUser`. The "off" half saves auto-submit off before the deadline, then asserts no revision, no job and no overdue record.
  - Guard sweep: new `describe` with three tests (`inactive_user` and `before_activation` through a temporary trigger that fires after the first revision; `not_due` through a clock that goes back after it).
- Mutation proof (scratch clone of 2d72d35, updated test file copied in; repository source untouched):
  - clean: 44 passed.
  - M4: 1 failed. M5: 1 failed. M5b: 2 failed.
  - G1, G2, G3 (each skip deleted): 1 failed each, in the new tests. G4 `finalized` (control): 2 failed.
  - clean again: 44 passed.
- Guard sweep: all three guards testable without a source change; nothing to report.
- `npm run verify` exit 0, 62 files, 1420 tests (+4), SMOKE PASSED, no deprecation line. No e2e run, because only an integration test file changed.
- Changed paths: tests/integration/deadline.test.ts; handoff/delivery/WP3_HANDOFF.md and .vi.md; this brief; handoff/delivery/evidence/WP3-FIX3/.
- Deviations: none. Mutation runs used `tests/integration/deadline.test.ts` only (the only changed file); the full suite ran in `npm run verify`.
