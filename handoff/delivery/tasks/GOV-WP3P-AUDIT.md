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

### Auditor result (attempt 1, 2026-10-05)

- Self-reported model: claude-opus-5-5 (profile timesheet-auditor; agent aa78670760adbe556 per
  the board). Author WP3-DOC a3f90533c00057935 used claude-sonnet-5-5; the reviewer is not weaker
  and authored nothing in the snapshot.
- Verdict: **PASS**. Review: [GOV_WP3P_REVIEW.md](../GOV_WP3P_REVIEW.md) (+ `.vi.md`). Evidence:
  `handoff/delivery/evidence/GOV-WP3P-AUDIT/` (masked, LF).
- Reviewed commit da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d (= GOV-WP3P-GATE freeze_commit =
  origin/main = remote); parent cb9800e. HEAD before/after da6d0cd. Source digest before/after
  4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f (git ls-tree pipeline and
  `npm run digest` on Node 24.21.0), equal to the expected value.
- Scope 1: the six scope/gate sentences (EN, VI) are byte-identical to docs/09:33/37 once the label
  is removed; against the parent, the change is pure insertion and nothing was removed. Each added
  clause traces to an owner decision of 2026-10-04 and its canonical text (F-1, F-Q1/F-Q2, G-Q1,
  F-3/F-Q3, F-3/F-Q4/F-Q5; F-5 via AC-10). No requirement is added or dropped silently.
- Scope 2: EN and VI have the same meaning (analysis.txt table B).
- Scope 3: only lines 17/21 (IMPLEMENT) and 17 (REVIEW) changed; no other docs/08 governance path
  changed; no conflict with AGENTS.md or docs/08.
- Scope 4: all 13 required items are present in all four gate lines; the parent clause is kept
  verbatim.
- Scope 5 (workflow Python 3.12.14, `C:\Users\<user>\.cache\codex-runtimes\...\python.exe`):
  validate_orchestration.py exit 0 (PASS, 133 tasks), check_recovery.py exit 0 (82 checks),
  validate_package.py --preflight exit 0 (58 pairs; 59 pairs and 1079 links after the review pair
  was written).
- Also: `git diff --check cb9800e da6d0cd` exit 0; the working tree equals the freeze for the
  governance and docs paths.
- Findings: none. Optional (not required): R1 AGENTS rule 4 could mention owner-granted share items;
  R2 the WP3 gate names neither F-2, F-4 nor the G-Q2 rendering (pre-existing; covered by the scope
  and the read list); R3 VI "tình trạng admin" polish; R4 and R5 information only.
- Unrun: `npm run verify` (not required by this brief; GOV-WP3P-GATE exit 0 on the same digest).
- Temporary files: the scripts and outputs this task created in `D:\timesheet-tmp\GOV-WP3P-AUDIT\`
  were deleted one by one (the scripts are kept as `*.py.txt` evidence). The `node-compile-cache`
  folder that Node created there is left in place, because folders are never removed recursively.
