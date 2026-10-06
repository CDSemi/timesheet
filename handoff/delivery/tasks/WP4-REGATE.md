# WP4-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE; package WP4; kind gate;
  attempt 1; depends on WP4-FIX-FREEZE.
- The package-final gate, rerun on the fixed freeze. The fixes are WP4-FIXB (WP4-B-01,
  B-02, R1, R3) and WP4-FIXA (WP4-A-01 to A-04, R-A1, R-A5, R-A7).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP4-FIX-FREEZE commit; the coordinator gives the SHA in
  the dispatch prompt.
  - Record HEAD and the source digest before and after. They must not change.
  - The digest of record is computed on the clean export and cross-checked with the
    `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-GATE](WP4-GATE.md): all 13 items and their earlier results;
  - [WP4_REVIEW_A](../WP4_REVIEW_A.md) and [WP4_REVIEW_B](../WP4_REVIEW_B.md);
  - the results of [WP4-FIXB](WP4-FIXB.md) and [WP4-FIXA](WP4-FIXA.md).

## Runtime

Use the WP4-GATE runtime rules, with these changes:
- the task folder is `D:\.claude-tmp\timesheet\WP4-REGATE`;
- the Compose project is `ts-wp4-regate`.

In addition:
- Never feed scripts to python or node through stdin; write probe files.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly under the
  task folder.
- Never use `cmd.exe` in any form.
- If a permission check denies a call, stop and report.
- Leave nothing running.

## Gate items

1. Rerun all 13 WP4-GATE items on a clean export of the new freeze, and record each
   result.
   - The expected counts change: verify at about 1730 tests or more, plus the FIXA
     tests.
   - The drill adds the `.map` checks and the two-job release.
2. Finding checks, each with its command, exit code and result:
   - **B-01:** rebuild the audit probes P1b, P6 and P7 from
     `handoff/delivery/evidence/WP4-AUDIT-B/probe-*.mjs.txt`.
     - The 65 KB package is refused quickly with 422.
     - `/api/health` stays responsive while the refusal happens.
     - The formula-heavy package is refused, or its report stays bounded.
     - The tracked template still previews.
   - **B-02:** 150,000 Holiday Dates cells give 422 or a preview, never 500.
   - **R3:** a not-yet-due period is skip-only (`not_due`). **R1:** an OT leave
     reservation inside an imported period answers 409.
   - **A-01:**
     - The image holds no `.map` file and no `sourceMappingURL`.
     - `/assets/*.map` answers 404.
     - The drill's forbidden-file scan includes `*.map`.
   - **A-02:** the `.env.example` wording. **A-03:** the runbook statements are true:
     the retention wording, and what bootstrap refusals print.
   - **A-04:** `npm run verify` passes with `DATA_DIR` exported to a task folder.
   - **R-A1:** prune with a candidate dated after the clock exits 2 and removes
     nothing.
3. Diff scope since the first gate's freeze 13a258d: list the paths. Only the FIXB and
   FIXA paths and handoff records may appear.

## Output

- Write the results in this file, with masked LF evidence in
  `handoff/delivery/evidence/WP4-REGATE/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
