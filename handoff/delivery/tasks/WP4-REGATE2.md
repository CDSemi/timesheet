# WP4-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE2; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB2-FREEZE.
- This reruns the WP4 package-final gate on the round-2 fix freeze:
  - WP4-FIXB2 replaced fast-xml-parser with a bounded streaming scanner and capped the
    report (WP4-RB-01).
  - WP4-DEPCLEAN removed the unused dependency.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` is the WP4-FIXB2-FREEZE commit. The coordinator gives the SHA
  in the dispatch prompt.
  - Record HEAD and the source digest before and after; they must not change.
  - The digest of record is the one computed on the clean export, cross-checked with
    the `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-GATE](WP4-GATE.md) and [WP4-REGATE](WP4-REGATE.md): the items and their
    earlier results;
  - [WP4_RECHECK_B](../WP4_RECHECK_B.md): WP4-RB-01 and its probes r1–r3;
  - the [WP4-FIXB2](WP4-FIXB2.md) and [WP4-DEPCLEAN](WP4-DEPCLEAN.md) results.

## Runtime

Follow the WP4-GATE rules, with these settings:
- task folder `D:\.claude-tmp\timesheet\WP4-REGATE2`;
- Compose project `ts-wp4-regate2`.

Never feed scripts to python or node through stdin; write probe files and run them.
Set `DATA_DIR` and `DATABASE_PATH` explicitly under the task folder for every CLI or
server run. Never use `cmd.exe` in any form. If a permission check denies a call, stop
and report. Leave nothing running.

## Gate items

1. Rerun all 13 WP4-GATE items on a clean export of the new freeze.
   - `npm ci` must print no deprecation line. Confirm that `fast-xml-parser` is gone
     from `package.json`, from the lock and from `node_modules`.
   - Run verify (expect about 1,750 tests), e2e and the full drill with `--wp3`.
2. Run the WP4-REGATE finding checks again: B-01, B-02, R3, R1, A-01..A-04 and R-A1.
3. Run the RB-01 checks:
   - rebuild probes r1, r2 and r3 from
     `handoff/delivery/evidence/WP4-RECHECK-B/probe-*.mjs.txt`, and the first-audit
     probes P1b, P6 and P7;
   - each must be refused fast or stay within the stated budget (500 ms and +150 MiB
     per preview, report at most 2 MiB);
   - `/api/health` must stay responsive;
   - no request may answer 500;
   - the tracked template must still preview;
   - a realistic 12-dated-sheet synthetic workbook must preview, and its report must
     match the pre-FIXB2 report for the same input in its mapped days, labels and
     source cells. This checks that the new scanner reads benign workbooks the same
     way.
4. Diff scope since 0f7fba2: only WP4-FIXB2, WP4-DEPCLEAN and handoff records.

## Output

- Write the results in this file, and masked LF evidence in
  `handoff/delivery/evidence/WP4-REGATE2/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
