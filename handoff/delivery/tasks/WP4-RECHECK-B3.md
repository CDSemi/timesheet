# WP4-RECHECK-B3 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-B3; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE3 (PASS).
- Scope: a fresh, independent recheck of WP4 area B (data) after fix round 3. It checks
  three things:
  - WP4-RB2-01 is closed: the stated parse budget now holds with margin;
  - the R-B2-1 and R-B2-2 changes are correct;
  - area B still holds.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context: you did not author WP4, and you ran none of the earlier area-B audits or
  rechecks. The task record is in English. `WP4_RECHECK_B3.md` and its `.vi.md` follow
  the REVIEW form.
- Target: `reviewed_commit` is the WP4-REGATE3 `freeze_commit`, given with the gate digest
  in the dispatch prompt. Record HEAD and the digest before and after; the digest must
  equal the gate digest.
- WP4-RECHECK-A attempt 3 may run at the same time in its own folder. Do not share files.

## Runtime

- Use your own export under `D:\.claude-tmp\timesheet\WP4-RECHECK-B3`.
  - Keep every hostile workbook there.
  - Set `DATA_DIR` and `DATABASE_PATH` explicitly there.
- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **Never feed scripts to python or node through stdin.**
- Call Node 24 by full path. Keep shell calls in the foreground.
- Run no docker command unless a finding needs one. If one is needed, use Compose
  project `ts-wp4-rcb3` and remove it by name.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_RECHECK_B2](../WP4_RECHECK_B2.md) and its probes.
- The results of [WP4-FIXB3](WP4-FIXB3.md) and [WP4-REGATE3](WP4-REGATE3.md).
- docs/07 (workbook import) and its `.vi.md`.

## Scope

1. **The budget claim holds.**
   - Rebuild E7, Y7 and the expert's worst-case search.
   - Then search independently for the most expensive shape inside every limit:
     - decode paths, attribute and text mixes, and two-byte text;
     - many parts and shared strings;
     - combinations at each limit's maximum.
   - Report the worst time and memory against 500 ms and +150 MiB, with health latency
     and status. A small, honest overshoot is a finding. Judge its severity against the
     stated claim.
2. **Correctness.**
   - Every value is decoded exactly once.
   - The attribute cap (255) never truncates a value that is then imported.
   - R-B2-1: the floating flag follows the matched holiday.
   - R-B2-2: a non-UTF encoding is refused.
   - The benign differential against the accepted WP4-T09 reader (export 13a258d) is
     identical for the template and a 12-dated-sheet workbook.
     - "Identical" means equal after dropping the additive finding field `sourceCount`.
       That field was introduced by WP4-FIXB and accepted at WP4-REGATE.
     - WP4-REGATE3 found it to be the only raw difference.
3. **Regression.**
   - Rerun `npm ci` and `npm run verify` on your export.
   - Rerun the workbook-reader, workbook-import, opening-balance and sharing-matrix
     suites.
   - The other area-B rules still hold.

## Output

- `handoff/delivery/WP4_RECHECK_B3.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-B3/`, with probes saved
  as `*.mjs.txt`. No workbook or binary.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately.
- Leave nothing running.

Return at most 160 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (effort not observable). Date 2026-10-06. Report:
[WP4_RECHECK_B3](../WP4_RECHECK_B3.md) and its `.vi.md`. Evidence: `handoff/delivery/evidence/WP4-RECHECK-B3/`
(masked, LF, probes as `*.mjs.txt`, no workbook or binary).

- **Target.** HEAD 972ccda6409a7521a008c55c35a5b5cf416daf1e. Digest
  635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b (775 files) before and after, both ways, and equal
  to the gate digest. The export's 775 files hash-equal the commit.
- **Regression.**
  - `npm ci`: exit 0.
  - `npm run verify` with deprecation tracing: exit 0. 76 files with 1755 tests, SMOKE PASSED, no deprecation line.
  - The four area suites: 128 tests, exit 0.
  - No regression found.
- **Scope 1, the budget: not met.**
  - The rebuilt RECHECK-B2 catalogue (E7 refused in 22-24 ms, Y7 refused) peaks at 140 ms and +87 MiB.
  - The FIXB3 search at the final limits peaks at 184 ms and +93 MiB.
  - The independent search covered 104 shapes. Compressible shapes stay at most 379 ms; memory peaks at +123 MiB.
  - Incompressible parts (a 4.1-5.4 MB upload, inside every limit) exceed the time budget, mostly through the reader's
    4 KiB-step inflate (264 ms against 38 ms):
    - formulas: 576-611 ms in memory, `/api/health` stalled 640-648 ms over HTTP;
    - kept-attribute flood: 508-528 ms, HTTP 554 ms.
  - The server gives no 5xx and stays up.
- **Scope 2, correctness: holds (75 PASS, 0 FAIL).**
  - Decoding is exactly once, and the 255 cap refuses instead of cutting.
  - R-B2-1 and R-B2-2 hold. Three lenient encoding cases are recorded as risk R-B3-1.
  - The differential against T09 is identical after dropping `sourceCount`, plus the R3 rule text from 0f7fba2 that
    was accepted at WP4-REGATE.
- **Findings.** WP4-RB3-01 (Low): the stated budget and the measured worst case (about 290 ms and +89 MiB) are false
  for incompressible content. Risks: R-B3-1 to R-B3-4.
- **Next action.** A bounded fix: cheaper inflate, add incompressible content to the sweep, then re-measure and
  restate the budget. Then a freeze, a regate and a fresh area-B recheck.
- **Runtime.** Nothing is left running; the server child was stopped through its handle. No docker command was run.
  Nothing was committed.
