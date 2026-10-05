# WP3-DOC dispatch brief

- Mission/task: timesheet-software-readiness / WP3-DOC; package WP3; kind documentation;
  attempt 1; depends on the owner's answers to G-Q1/G-Q2 (board `owner_decisions`) and
  on the freeze of the task running before it (the coordinator names the SHA in the
  dispatch prompt). Canonical documents are part of the source digest, so this is a
  single-writer task.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing: size
  M, risk M (canonical business rules in two languages; no code), novelty no.
- **G-Q answers** (owner, 2026-10-04, verbatim "* G-Q1: b * G-Q2: a"; board
  `owner_decisions`):
  - G-Q1 (b): when a user uploads a signature, the app asks for the auto-image
    authorization ("use this image on automatic submissions") with the option
    pre-selected; confirming is still one explicit, audited authorization act; a user who
    unticks it gets no image on automatic submissions until they authorize later in
    Settings. Write the canonical default this way (docs/04 defaults table, docs/05:24,
    D-09), replacing the "off unless authorized later" wording where the drafts use it.
  - G-Q2 (a): `{SignOffStatus}` renders "Submitted" for manual and automatic submissions,
    or the user's note text for an automatic submission whose note line is on. Apply the
    WP3-REQ2 edits marked "only with G-Q2 (a)" (for example docs/04:50) and the neutral
    email line in policy.example.json.
  - F-Q6 stays unanswered: WP2-A-01 stays as accepted; do not change it.
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

### Worker result (attempt 1, 2026-10-04)

- Self-reported model: claude-sonnet-5-5 (profile timesheet-worker).
- Baseline: main at 632092d730f84bc10b3bee1f7ae61f96edec35eb; source digest before the edits
  0edefc94a01eef88b0c7df32d7c71f328703ee08f58876a2c9297d6b8ed03299.
- Edits (applied by exact unique-match replacement scripts kept outside the repository in the
  scratch folder; each match asserted once): docs 01, 02, 03, 04, 05, 06, 07, 09, 10 in English
  (30 edits) and the matching `.vi.md` (30 edits, located by content); WP3_IMPLEMENT (scope and
  gate) and WP3_REVIEW (gate), EN and VI (3 edits each language); policy.example.json (3 edits:
  `auto_note_enabled`, `auto_note_text`, body line "Status: {SignOffStatus}.").
- G-Q answers applied: G-Q1 (b) in docs/04 defaults row, docs/05:24 and D-09 (asked at signature
  upload, pre-selected, one explicit audited act, unticked means no image until authorized later in
  Settings); G-Q2 (a) in docs/04:50 and the policy example email line. F-Q6 and WP2-A-01 untouched.
  A "Shared with me"/sharing feature, the note line and the 14-day OT total are described as WP3
  scope (FR-17/AC-16 rows say WP3); nothing is marked implemented.
- docs/10 entries (final section "Owner decisions - 2026-10-04"): F-1; F-Q1/F-Q2 (no automatic
  indicator by explicit owner decision, D-09 and R-07 wording changed); G-Q1/G-Q2; F-2; F-3/F-Q3;
  F-3/F-Q4/F-Q5; F-4; F-5; unchanged WP2-A-01 with F-Q6 re-asked; plus :7, D-09 and :38 edits.
- Parity: [01-parity.txt](../evidence/WP3-DOC/01-parity.txt), every changed EN line has its VI line
  (same line numbers, hunk by hunk), same meaning yes.
- Preflight (workflow Python): exit 0, PASS, 58 translation pairs
  ([02-preflight.txt](../evidence/WP3-DOC/02-preflight.txt)). JSON parse of the policy example: ok.
- `npm run verify` (Node 24.21.0 by full path): exit 0, 54 files / 1164 tests passed, smoke passed
  ([03-verify.txt](../evidence/WP3-DOC/03-verify.txt)).
- `npm run digest` after the final edit: exit 0,
  `4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f` (679 files, handoff/ excluded)
  ([04-digest.txt](../evidence/WP3-DOC/04-digest.txt)).
- Deviations: none in paths. Evidence files are `.txt` because the package validator demands a
  `.vi.md` translation for evidence `.md` files. The docs/09 and prompt gate lines place the
  AC-16 clause before the closing "All sending stays dry-run/capture." sentence so the sentence
  stays intact.
- Commit description: Update canonical docs, prompts and policy example for the 2026-10-04 owner
  decisions (automatic-submission presentation, per-item sharing, admin status boundary).
