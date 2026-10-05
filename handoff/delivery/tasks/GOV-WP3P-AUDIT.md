# GOV-WP3P-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-WP3P-AUDIT; package GOV; kind audit;
  attempt 1; depends on GOV-WP3P-GATE (PASS). A fresh, independent audit of the
  governance change to the WP3 prompts.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk M, novelty no.
  - Fresh context: you authored nothing in this change. The author is the WP3-DOC worker
    (board task WP3-DOC); the coordinator wrote the brief.
  - The task record is in English; GOV_WP3P_REVIEW.md and its .vi.md are bilingual
    (REVIEW form in handoff/templates/).
- Target: `reviewed_commit` = the GOV-WP3P-GATE `freeze_commit` (the coordinator gives
  the SHA in the dispatch prompt). Record HEAD and the source digest before and after.
- Read AGENTS.md from disk first (rules 1, 8 and 13), then docs/08 (governance scope),
  docs/09 and docs/10 (the owner decisions of 2026-10-04), the board `owner_decisions`
  (read-only), the four prompt files at the target and their previous versions
  (`git show <parent>:<path>`), the WP3-DOC result and the GOV-WP3P-GATE evidence.
- Read-only for everything except your outputs. Use Node 24 by full path and
  `D:\timesheet-tmp\GOV-WP3P-AUDIT` for TEMP/TMP; delete only files you created; never
  remove folders recursively. If a shell call fails with ENOSPC, stop and report. Never
  write into the repository root; on Windows never redirect to /dev/null or nul from a
  POSIX shell.

## Scope

1. The changed prompt lines are a faithful mirror of docs/09 (WP3 scope and gate) and of
   the recorded owner decisions; they add or drop no requirement silently (rule 8).
2. English and Vietnamese say the same thing.
3. The change does not alter roles, routing, authority, commit rules or any other
   governance rule (only the WP3 scope/gate wording); no instruction conflicts with
   AGENTS.md or docs/08.
4. The WP3 gate still covers AC-06–AC-10 and AC-14, now AC-16, the deadline/manual race,
   auto-image on/off, interrupted/uncertain send, duplicate jobs, private downloads,
   visual PDF evidence including both Sundays, and dry-run/capture only.
5. Validators: `validate_orchestration.py`, `check_recovery.py`, preflight (workflow
   Python) exit 0.

## Output

- handoff/delivery/GOV_WP3P_REVIEW.md and .vi.md; results in this file; masked, LF
  evidence in handoff/delivery/evidence/GOV-WP3P-AUDIT/.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (GOV-WP3P-nn), a
  severity, file:line and the required change; separate optional improvements.

Return at most 150 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
