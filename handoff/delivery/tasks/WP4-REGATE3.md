# WP4-REGATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE3; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB3-FREEZE.
- Scope: rerun the WP4 package-final gate on the round-3 fix freeze. In that round,
  WP4-FIXB3 met the parse budget with margin and fixed R-B2-1 and R-B2-2.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP4-FIXB3-FREEZE commit, as given in the dispatch
  prompt.
  - Record HEAD and the source digest before and after.
  - The digest of record is computed on the clean export and cross-checked with the
    `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-REGATE2](WP4-REGATE2.md), for the items and earlier results;
  - [WP4_RECHECK_B2](../WP4_RECHECK_B2.md), for WP4-RB2-01 and the shapes E7 and Y7;
  - the [WP4-FIXB3](WP4-FIXB3.md) results.

## Runtime

Follow the WP4-GATE rules, with these settings:
- task folder `D:\.claude-tmp\timesheet\WP4-REGATE3`;
- Compose project `ts-wp4-regate3`.

Also:
- Never feed scripts to python or node through stdin; write probe files.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly under the
  task folder.
- Never use `cmd.exe` in any form.
- If a permission check denies a call, stop and report.
- Leave nothing running.

## Gate items

1. **The WP4-REGATE2 run, repeated on the new freeze.**
   - All 13 WP4-GATE items: install, verify (about 1,755 tests), e2e, the full drill
     with `--wp3`, migrations, races, privacy, validators and the mapping.
   - The round-1 finding checks.
   - The RB-01 probes: r1–r3, P1b, P6 and P7.
2. **RB2-01 checks.** Rebuild E7 and Y7 from
   `handoff/delivery/evidence/WP4-RECHECK-B2/probe-b2-cost.mjs.txt`, and the expert's
   worst-case search from `handoff/delivery/evidence/WP4-FIXB3/probe-search.mjs.txt`.
   - Each case is refused fast, or stays under 500 ms and +150 MiB, with
     `/api/health` responsive and no 500.
   - Record the worst time and memory you see.
3. **R-B2-1 and R-B2-2.**
   - The floating flag follows the matched holiday.
   - A declared non-UTF encoding is refused.
4. **The benign differential.** Run it for the template and a 12-dated-sheet workbook
   against the accepted WP4-T09 reader. It must still be byte-identical.
5. **Diff scope since cc34e7f.** Only the WP4-FIXB3 paths and handoff records may
   appear.

## Output

- Write the results into this file, and masked LF evidence into
  `handoff/delivery/evidence/WP4-REGATE3/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
