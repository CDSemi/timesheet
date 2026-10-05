# WP3-ACCREC dispatch brief

- Mission/task: timesheet-software-readiness / WP3-ACCREC; package WP3; kind
  documentation; attempt 1. It depends on the final rechecks WP3-RECHECK-A (attempt 3)
  and WP3-RECHECK-BC3, and is dispatched only after both PASS.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L (records only; no source), novelty no. The task record is in English. The
  HANDOFF stays bilingual: EN is authoritative and VI must match.
- Read AGENTS.md from disk first (rules 1, 5 and 9). Then read:
  - handoff/templates/HANDOFF.md and .vi.md;
  - handoff/delivery/WP3_HANDOFF.md and .vi.md, including the fix-round sections;
  - the accepted acceptance record in [WP2_HANDOFF](../WP2_HANDOFF.md), for the form;
  - the board tasks from WP3-GATE through WP3-RECHECK-BC2, read-only, including
    `history`, `findings` and `gate_notes`;
  - the review chain, each report with its .vi.md:
    - [WP3_REVIEW_A](../WP3_REVIEW_A.md), [WP3_REVIEW_B](../WP3_REVIEW_B.md),
      [WP3_REVIEW_C](../WP3_REVIEW_C.md);
    - [WP3_RECHECK_A](../WP3_RECHECK_A.md), [WP3_RECHECK_BC](../WP3_RECHECK_BC.md);
    - `WP3_RECHECK_A2.md`, `WP3_RECHECK_BC2.md`, `WP3_RECHECK_A3.md` and
      `WP3_RECHECK_BC3.md`;
  - the board `owner_decisions` dated 2026-10-04 and 2026-10-05.

## Required edits (records only)

1. **Fill the WP3_HANDOFF acceptance-record section**, in EN and in VI.
   - **Accepted source:**
     - commit 49651c8bb91d56bf6c6966405257537ec7ca474b (WP3-FIX3-FREEZE);
     - source digest c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72
       (git ls-tree form; WP3-REGATE3 PASS);
     - final figures: 62 files and 1420 tests; smoke 40 PASS; e2e 127 passed and 5
       skipped.
   - **WP3-REGATE3 history.** Attempt 1 passed every source item. Item 12 failed only on
     the live tree, because an untracked evidence `.md` had no `.vi.md` pair. WP3-RECFIX
     renamed that file. Attempt 2 reran item 12, and every validator exited 0.
   - **Final rechecks.** WP3-RECHECK-BC3 and WP3-RECHECK-A attempt 3 both PASS, with no
     finding, by one fresh auditor on 49651c8.
   - **Owner decision H-Q3 (a).** The owner's `.claude/skills/readme-md` skill goes
     through a GOV-SKILL cycle after the WP3 accept commit. It is not part of the WP3
     source.
   - **Gate chain:**
     - WP3-GATE PASS on a1cd566 (96870f7e);
     - WP3-REGATE PASS on 2f2520e (eeb417d3);
     - WP3-REGATE2 PASS on 2d72d35 (0d513fca);
     - WP3-REGATE3 (final) on the round-3 freeze.
   - **Audit chain:**
     - WP3-AUDIT-A NOT VERIFIED (procedural, no finding; digest not recorded after a
       permission refusal);
     - WP3-AUDIT-B FIX REQUIRED (B-01..03);
     - WP3-AUDIT-C FIX REQUIRED (C-01..03);
     - WP3-RECHECK-A: attempt 1 PASS on 2f2520e, attempt 2 PASS on 2d72d35, attempt 3
       (final) on the round-3 freeze;
     - WP3-RECHECK-BC FIX REQUIRED (RBC-01, RBC-02; B-03 partly fixed);
     - WP3-RECHECK-BC2 FIX REQUIRED (WP3-RBC2-01, test coverage only);
     - WP3-RECHECK-BC3 (final).
   - **Fix rounds and what each closed:**
     - round 1: WP3-LINKFIX, WP3-FIXB, WP3-FIXC;
     - round 2: WP3-FIX2, including the owner decision H-Q1 (a);
     - round 3: WP3-FIX3, test-only.
   - **Owner decisions of 2026-10-05:**
     - H-Q1 (a), with the coordinator's reading of the explicit overdue choice;
     - H-Q2 (a);
     - the temporary-folder move.
   - **Non-blocking items carried forward**, from the reviews, the HANDOFF carry list and
     the final rechecks:
     - R1–R9 (R3 closed by H-Q1 (a); R8: never-configured accounts still get before-due
       reminders to their own address; R9: seed events without an actor show as
       automatic in History);
     - the recorded "through a share" marker required before WP4 lets any non-shared
       route write day or session rows for another person;
     - the hint shows a count, not dates;
     - a HEAD request on the shared PDF writes a download audit;
     - the reminder repeat on real SMTP, TLS-as-temporary, and send-before-PDF items;
     - F-Q6 open (WP2-A-01 kept);
     - ADV-A-05 and the WP2 B4 optional items;
     - the final-recheck risks:
       - no test covers the activation instant being cleared mid-scan (probe H3 shows
         how);
       - the `not_active` guard (`automation.ts:191`) has no single test of its own;
       - `before_account` is covered only as a pair;
     - the hint read has no time bound;
     - never-configured accounts get no overdue warning;
     - the deadline scan re-checks their periods on every pass.
   - **WP4 carry-forward:** list the items that WP4 planning must address.
2. **Correct stale figures.** Every figure must cite a task record or an evidence file;
   invent nothing. Correct:
   - the smoke count (40 `PASS` lines; the T14 record's "46" was wrong);
   - the test counts, taken from the final gate (62 files / 1420 tests at 49651c8);
   - e2e (127 passed, 5 skipped);
   - the freeze list: a1cd566, 2f2520e, 2d72d35 and 49651c8.
3. **Next action:** the GOV-SKILL cycle for the owner's skill, with WP4 planning
   (WP4-PLAN) in parallel where the single-writer rule allows.

## Owned (writable) paths

- handoff/delivery/WP3_HANDOFF.md and handoff/delivery/WP3_HANDOFF.vi.md.
- This report and handoff/delivery/evidence/WP3-ACCREC/.

Do not edit STATE.json, NEXT_ACTION, the board, source, documents or any review report.

## Checks

- Run `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  and write `<user>` in the evidence. The exit code must be 0.
- EN/VI parity: compare headings, bullets and table rows. Write a parity note in the
  evidence.
- Link only to files that exist, never to directories.
- Use `D:\.claude-tmp\timesheet\WP3-ACCREC` for any temporary output.
- Evidence must be LF, masked, free of trailing whitespace, and end with a single final
  newline. Never write into the repository root, and never redirect to /dev/null or nul.
- If a permission check denies a call, stop and report.

Return at most 120 words, beginning with your self-reported model:
- the sections you edited;
- the figures you corrected;
- the carry items you listed;
- the preflight exit code;
- EN/VI parity.

## Results

Self-reported model: claude-sonnet-5-5. Attempt 1.

- Edited: [WP3_HANDOFF](../WP3_HANDOFF.md) and [WP3_HANDOFF.vi.md](../WP3_HANDOFF.vi.md): the acceptance record (filled), the intro paragraph, the Commands smoke row, carry item 14 and the Next action section. Nothing else was edited.
- Figures corrected: smoke 40 `PASS` (not 46); verify 62 files / 1420 tests at 49651c8; e2e 127 passed, 5 skipped; freeze list a1cd566, 2f2520e, 2d72d35, 49651c8 with each digest and count, from the gate_notes.
- Carry items: R1-R9, the through-a-share marker, count-only hint, HEAD audit, SMTP items, F-Q6, ADV-A-05/B4, the final-recheck risks, and a WP4 carry-forward list.
- Preflight: exit 0 (workflow Python, user `<user>`), [preflight.txt](../evidence/WP3-ACCREC/preflight.txt). Parity: [parity.txt](../evidence/WP3-ACCREC/parity.txt), headings, bullets and table rows match (17 / 82 / 87).
- Blockers: none. Not committed.
