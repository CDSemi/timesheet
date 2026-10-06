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

### Auditor result (attempt 1) - decision: PASS

Self-reported model: claude-opus-5-5. Reviewed commit 546cddaf6747aef85e8b6d9b7712de9e28f138bf (WP4-REGATE4
freeze_commit, HEAD = origin/main). Source digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081`
(775 files, handoff/ excluded) before and after, by `scripts/source-digest.mjs` and the `git ls-tree` form, equal to
the gate digest of record; HEAD and non-handoff tree unchanged. Node v24.21.0 portable, Git Bash. Full report:
`handoff/delivery/WP4_RECHECK_B4.md` (+ `.vi.md`); masked LF evidence in
`handoff/delivery/evidence/WP4-RECHECK-B4/` (00-README maps the files). DATA_DIR and DATABASE_PATH were set under the
task folder for every CLI/server run; the HTTP probe used an OS-assigned free port and was stopped via its handle.

- **WP4-RB3-01: closed (fixed and verified).** The parse budget is now derived from the enforced limits
  (time <= 40 ms + 14.8 ns·X + 339 ns·O; memory <= 15 MiB + 13.3 B·X + 428 B·O, X XML bytes, O openings), not claimed
  from searched shapes. I re-measured the 61 per-unit families on this host and recomputed the bound by LP duality:
  105.5 ms and +90.8 MiB at the ceilings (vs the stated 121 ms / +95 MiB), both under the 500 ms / +150 MiB budget with
  margin, same worst-mix. Every cost driver is covered (inflate, decode, scan, attributes, kept values, mapping, and —
  via the whole-service run plus the MAX_REPORT_BYTES/MAX_TEXT_LENGTH caps — report build and serialization).
- **Measured confirmation at the ceilings.** The 23 FIXB4 worst constructions are all accepted and inside every
  ceiling: worst preview single run 89 ms / +71 MiB, worst whole-`previewImport` run 90 ms / +46 MiB; no OVER-BUDGET,
  nothing thrown. No overshoot of the stated figures.
- **The RB3-01 incompressible shapes are refused fast.** The WP4-RECHECK-B3 catalogues rebuilt at their old sizes are
  refused (210 cases) in 0-3 ms by the lowered ceilings; the costliest one (F2-rand100-d2-wide, 611 ms before) is
  `package_too_large` in 0 ms. Over HTTP a 5.4 MB incompressible package → 413 in 3 ms with `/api/health` at 2 ms.
- **Ceilings match.** Route upload limit = reader `maxCompressedBytes` = 2 MiB (413 above); client "2 MiB"; docs/07 and
  docs/11 EN/VI say 2 MiB; docs/03 no size; no stale active 8 MiB limit. Template (201/24 ms), a 12-dated-sheet workbook
  (201/26 ms) and the documented 61-sheet maximum fit with 2-6x margin.
- **Correctness and regression hold.** decode-once/caps/R-B2-1/R-B2-2 probe 75 PASS, 0 FAIL (3 LENIENT = R-B3-1);
  `npm run verify` 76 files / 1758 tests, no deprecation line, SMOKE PASSED; area suites 4 files / 131 tests; the WP4-T09
  differential is identical after dropping `sourceCount` (report also differs only in the post-T09 rules[] text).
  No 5xx; worst `/api/health` under load 78 ms.
- **Findings:** none. Risks carried: R-B4-1 lenient encoding declaration, R-B4-2 no per-user quota + NAS NOT VERIFIED +
  dev-only source-map-js advisory, R-B4-3 64-sheet cap, R-B4-4 bound covers the measured unit kinds only (no uncovered
  costly unit found).
- **Unrun/blocked:** no mandatory area-B check unrun. The e2e suite and container drill were run by WP4-REGATE4 on this
  digest and are outside this brief; the NAS target is NOT VERIFIED (no owner access).
- **Minor rule deviations (honest):** I twice wrote a tiny helper (`deflate-lib.mjs`, a CR-byte checker) and the latter
  briefly lived under /tmp instead of the task folder; both were single-file `rm -f` removals (never `rm -r`), neither
  touched the repo. Nothing was committed, pushed or sent; no container, docker command or background process was used
  or left; nothing I started is still running.
- **Next action:** record WP4-RECHECK-B4 PASS; no area-B fix outstanding; proceed with WP4 acceptance / the next
  roadmap action.
