# WP4-RECHECK-B4 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-B4; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE4 (PASS).
- Scope: a fresh, independent recheck of WP4 area B (data) after fix round 4. It checks
  two things:
  - WP4-RB3-01 is closed: the parse budget is now derived and holds with margin for
    compressible and incompressible content;
  - area B still holds.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context: you did not author WP4 and ran none of the earlier area-B audits or
  rechecks.
  - The task record is in English.
  - `WP4_RECHECK_B4.md` and its `.vi.md` follow the REVIEW form.
- Target: `reviewed_commit` is the WP4-REGATE4 `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before and
  after.
- WP4-RECHECK-A attempt 4 may run at the same time in its own folder. Do not share files
  with it.

## Runtime

- Use your own export under `D:\.claude-tmp\timesheet\WP4-RECHECK-B4`. Keep every hostile
  workbook there. Set `DATA_DIR` and `DATABASE_PATH` explicitly there.
- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER feed anything to python or node through stdin, including `python -` and empty
  heredocs.** Write probe files and run them.
- Run Node 24 by its full path. Keep shell calls in the foreground.
- Run no docker command unless a finding needs one. If you do, use Compose project
  `ts-wp4-rcb4` and remove it by name.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_RECHECK_B3](../WP4_RECHECK_B3.md) and its probes.
- The results of [WP4-FIXB4](WP4-FIXB4.md) and [WP4-REGATE4](WP4-REGATE4.md).
- docs/07, workbook import (+ vi).

## Scope

1. **Is the derivation sound?**
   - Review the WP4-FIXB4 cost formula and its coefficients against the enforced limits
     in the code.
   - Check that every cost driver is in the formula: inflate, decode, scan, attributes,
     kept values, mapping, report building and serialization.
   - Then confirm it independently by measurement. Use incompressible and compressible
     content at each limit, mixed packages, and every earlier probe family.
   - A small overshoot of the stated figures is a finding.
2. **The ceilings.** If the upload or package ceilings changed, check these:
   - the route enforces them;
   - the client message and the docs match;
   - a realistic multi-year workbook still fits with room.
3. **Correctness and regression.**
   - Decoding happens exactly once, and the cap refuses rather than truncates.
   - R-B2-1 and R-B2-2 still hold.
   - The differential against WP4-T09 is identical after dropping `sourceCount`.
   - Rerun `npm ci` and `npm run verify` on your export, and rerun the area suites.

## Output

- `handoff/delivery/WP4_RECHECK_B4.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-B4/`, with probes saved as
  `*.mjs.txt`. No workbook or binary.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with the findings listed
  separately.
- Leave nothing running.

Return at most 160 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
