# WP3-DOC dispatch brief

- Mission/task: timesheet-software-readiness / WP3-DOC; package WP3; kind documentation;
  attempt 1; depends on the owner's answers to G-Q1/G-Q2 (board `owner_decisions`) and
  on the freeze of the task running before it (the coordinator names the SHA in the
  dispatch prompt). Canonical documents are part of the source digest, so this is a
  single-writer task.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing: size
  M, risk M (canonical business rules in two languages; no code), novelty no.
- **G-Q answers:** (filled by the coordinator at dispatch).
- Read AGENTS.md from disk first (rules 1 and 8: English is authoritative; keep matching
  `.vi.md` translations; record a real contradiction in the canonical rule plus
  translation). Then read:
  - the board `owner_decisions` of 2026-10-04 (F-1..F-5, F-Q1..F-Q6, G-Q answers) and the
    coordinator decision that starts "Interpretation recorded for the canonical update";
  - [WP3-REQ](WP3-REQ.md) section A (drafts) and [WP3-REQ2](WP3-REQ2.md) items 1 and 5
    (amended drafts and the exact edit list), which are binding as amended by the G-Q
    answers;
  - every file in the edit list, EN and VI.
- Runtime: call the Node 24 portable binary by its full path; use the workflow Python for
  the package validator. Use `D:\timesheet-tmp\WP3-DOC` for TEMP/TMP; delete only files
  you created; never remove folders recursively. If a shell call fails with ENOSPC, stop
  and report. Never write into the repository root. On Windows, never redirect to
  /dev/null or nul from a POSIX shell.
- Do not commit.

## Required changes (binding)

Apply exactly the edit list in WP3-REQ2 item 5, using the WP3-REQ section A drafts as
amended by WP3-REQ2 item 1 and by the G-Q answers above:

- docs/01, 02, 03, 04, 05, 06, 07, 09 and 10, each in English and the matching `.vi.md`
  (locate VI lines by content);
- handoff/prompts/WP3_IMPLEMENT.md and WP3_REVIEW.md with their `.vi.md` (gate and scope
  lines mirroring docs/09);
- reference/examples/policy.example.json (the two note fields and the neutral email body
  line).

Rules:
- No other wording change. Keep line structure and links intact; keep EN and VI saying
  the same thing.
- docs/10 records the owner decisions with their dates, including that automatic
  submissions carry no automatic indicator by explicit owner decision (D-09 and R-07
  wording changed accordingly) and the G-Q answers.
- Mark nothing as implemented that is not yet built (the sharing feature and the note
  line are planned in WP3; say "WP3" where the drafts do).

## Owned (writable) paths

- docs/01_PRODUCT_REQUIREMENTS.md, docs/02_TIME_AND_OT_RULES.md,
  docs/03_ARCHITECTURE_AND_DATA.md, docs/04_UX_AND_SETTINGS.md,
  docs/05_SUBMISSION_AND_NOTIFICATIONS.md, docs/06_TEST_AND_ACCEPTANCE.md,
  docs/07_DEPLOYMENT_AND_OPERATIONS.md, docs/09_IMPLEMENTATION_ROADMAP.md,
  docs/10_DECISIONS_AND_SOURCES.md, and each matching `.vi.md`.
- handoff/prompts/WP3_IMPLEMENT.md, WP3_IMPLEMENT.vi.md, WP3_REVIEW.md, WP3_REVIEW.vi.md.
- reference/examples/policy.example.json.
- This report and handoff/delivery/evidence/WP3-DOC/.

## Checks

- An EN/VI parity table per edited line (file, EN line, VI line, same meaning yes/no) in
  the evidence.
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`:
  exit 0.
- JSON parse of policy.example.json; `npm run verify` (the policy example may be read by
  tests) and `npm run digest` as the last commands.
- Evidence masked, LF, free of trailing whitespace, single final newline.

Return at most 150 words, beginning with your self-reported model: files and edit counts
per language, the docs/10 decision entries, parity result, preflight and verify exits,
digest, and deviations.

## Results

(Worker appends here.)
