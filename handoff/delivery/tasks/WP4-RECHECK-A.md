# WP4-RECHECK-A dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-A; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE (PASS).
- Scope: a fresh, independent recheck of WP4 area A (operations) after the fix round. It
  verifies WP4-A-01 to A-04 and the R-A1, R-A5 and R-A7 changes, and re-confirms that
  area A holds on the new freeze.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context: you did not author WP4 and did not run the first area-A audit.
  - Write the task record in English.
  - `WP4_RECHECK_A.md` and its `.vi.md` are bilingual and follow the REVIEW form.
  - Earlier reviews stay unchanged.
- Target: `reviewed_commit` = the WP4-REGATE `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before and
  after; the digest must equal the gate digest.
- WP4-RECHECK-B may run at the same time in its own folder; do not share files.

## Runtime

- Use your own scratch clone or export under `D:\.claude-tmp\timesheet\WP4-RECHECK-A`,
  and use it for TEMP/TMP.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly there.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Never feed scripts to python or node through stdin; write probe files.
- Use Node 24 by full path. Keep shell calls in the foreground.
- Docker, if used: Compose project `ts-wp4-rca` only, removed by name; never push, log
  in or prune.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_REVIEW_A](../WP4_REVIEW_A.md), the first audit.
- The results of [WP4-FIXA](WP4-FIXA.md), [WP4-FIXB](WP4-FIXB.md) and
  [WP4-REGATE](WP4-REGATE.md).
- docs/07, docs/10 and docs/11, with their `.vi.md` pairs.

## Scope

1. **Each finding is closed.** Check each with your own reproduction:
   - A-01: build or inspect the image. There is no `.map` and no `sourceMappingURL`, and
     `/assets/*.map` answers 404.
   - A-02: the `.env.example` wording.
   - A-03: the runbook statements are true.
   - A-04: verify passes with `DATA_DIR` exported.
2. **The improvements are correct and safe.**
   - R-A1: prune refuses future-dated candidates and still prunes normally.
   - R-A5: the drill's bulk release really releases.
   - R-A7: the wording.
3. **Regression.** Check that the fixes changed nothing else in area A:
   - backup and restore;
   - pause and reconciliation;
   - upgrade and rollback;
   - retention;
   - the admin allowlists.

   Rerun at least `npm ci` and `npm run verify` on your export, plus the backup and
   restore probe from the first audit.
4. **The FIXB docs sync in docs/07 and docs/10** matches the code.

## Output

- `handoff/delivery/WP4_RECHECK_A.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-A/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings separate.
- Leave nothing running.

Return at most 160 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
