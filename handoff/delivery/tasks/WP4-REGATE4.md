# WP4-REGATE4 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE4; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB4-FREEZE.
- Scope: rerun the WP4 package-final gate on the round-4 fix freeze. WP4-FIXB4 made the
  inflate step linear, derived the cost bound from the limits, and set ceilings where
  needed.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no.
- Target: `freeze_commit` is the WP4-FIXB4-FREEZE commit, given in the dispatch prompt.
  The digest of record is computed on the clean export and cross-checked with the
  `git ls-tree` form.
- Read [WP4-REGATE3](WP4-REGATE3.md), [WP4_RECHECK_B3](../WP4_RECHECK_B3.md) and the
  [WP4-FIXB4](WP4-FIXB4.md) results.

## Runtime

Follow the WP4-REGATE3 rules, with the task folder `D:\.claude-tmp\timesheet\WP4-REGATE4`
and the Compose project `ts-wp4-regate4`.

**Never feed anything to python or node through stdin.** Write probe files and run them.
Set `DATA_DIR` and `DATABASE_PATH` explicitly for every run. Never use `cmd.exe`. If a
permission check denies a call, stop and report. Leave nothing running.

## Gate items

1. Run the WP4-REGATE3 gate again on the new freeze:
   - all 13 items;
   - the round-1, RB-01 and RB2-01 checks.
2. RB3-01 checks:
   - Rebuild the WP4-RECHECK-B3 incompressible shapes from
     `handoff/delivery/evidence/WP4-RECHECK-B3/probe-rcb3-cases*.mjs.txt`.
   - Run the WP4-FIXB4 bound confirmation.
   - Each case is refused fast, or stays within the stated derived bound and the
     500 ms / +150 MiB budget. `/api/health` must stay responsive and no request may
     answer 500.
   - Record the worst time and memory measured.
3. If the upload ceiling changed:
   - the route answers 413 just above it, and accepts the template and a realistic
     workbook;
   - the client message and the docs (EN and VI) match the new ceiling.
4. The benign differential against WP4-T09 is identical after dropping `sourceCount`.
5. Diff scope since 972ccda: only WP4-FIXB4 paths and handoff records.

## Output

Write your results into this file. Write masked LF evidence to
`handoff/delivery/evidence/WP4-REGATE4/`. Decide PASS or FAIL.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
