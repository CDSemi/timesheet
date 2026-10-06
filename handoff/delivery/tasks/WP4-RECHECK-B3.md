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
     byte-identical for the template and a 12-dated-sheet workbook.
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
