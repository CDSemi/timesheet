# WP4-ACCREC dispatch brief

- Mission/task: timesheet-software-readiness / WP4-ACCREC; package WP4; kind
  documentation; attempt 1.
- Dependencies: the final rechecks WP4-RECHECK-B2 and WP4-RECHECK-A attempt 2. This
  task is dispatched only after both PASS on the same freeze, cc34e7f.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L (records only; no source), novelty no.
- Language: the task record is in English. The HANDOFF stays bilingual; EN is
  authoritative and VI must match it.
- Read AGENTS.md from disk first, in particular rules 1, 5 and 9. Then read:
  - `handoff/templates/HANDOFF.md` and `.vi.md`;
  - `handoff/delivery/WP4_HANDOFF.md` and `.vi.md`;
  - the accepted acceptance record in [WP3_HANDOFF](../WP3_HANDOFF.md), for the form;
  - the board tasks from WP4-GATE through the final rechecks, read-only, including
    `history`, `findings`, `notes` and `gate_notes`;
  - the review chain, each with its `.vi.md`:
    - [WP4_REVIEW_A](../WP4_REVIEW_A.md);
    - [WP4_REVIEW_B](../WP4_REVIEW_B.md);
    - [WP4_RECHECK_A](../WP4_RECHECK_A.md);
    - [WP4_RECHECK_B](../WP4_RECHECK_B.md);
    - `WP4_RECHECK_A2.md` and `WP4_RECHECK_B2.md`;
  - the board `owner_decisions` and `coordinator_decisions` dated 2026-10-05 and
    2026-10-06, and `pending_owner_question` (I-1..I-5).

## Required edits (records only)

1. **Fill the acceptance-record section of WP4_HANDOFF**, in EN and VI.
   - **Accepted source.** Commit cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d
     (WP4-FIXB2-FREEZE). Source digest
     96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503 (775 files;
     WP4-REGATE2 PASS). Final figures:
     - 76 files and 1,750 tests;
     - smoke 41 PASS;
     - e2e 145 passed and 5 skipped;
     - drill stages 1–6, 208 PASS;
     - races 60/60.
   - **Gate chain:**
     - WP4-GATE PASS on 13a258d (1ed67f55);
     - WP4-REGATE PASS on 0f7fba2 (dfe4541d);
     - WP4-REGATE2 PASS on cc34e7f (96445de4).
   - **Audit chain:**
     - WP4-AUDIT-A FIX REQUIRED (A-01..A-04);
     - WP4-AUDIT-B FIX REQUIRED (B-01, B-02);
     - WP4-RECHECK-A attempt 1 PASS on 0f7fba2; attempt 2 is the final result on
       cc34e7f;
     - WP4-RECHECK-B FIX REQUIRED (RB-01 reopened B-01);
     - WP4-RECHECK-B2 is the final result on cc34e7f.
   - **Fix rounds:**
     - round 1: WP4-FIXB and WP4-FIXA;
     - round 2: WP4-FIXB2 (escalated to timesheet-expert) and WP4-DEPCLEAN.
   - **Owner decisions:**
     - F-1..F-6;
     - option B, the readme-md removal, with GOV-SKILL-REMOVE PASS;
     - the open questions I-1..I-5 and the safe defaults that stand.
   - **Coordinator decisions:**
     - held sends after a restore;
     - the rollback restore mode and `JOB_RUNNER=off`;
     - the T07 and T12 splits;
     - the `not_due` conservative default.
   - **Non-blocking items carried forward:**
     - NAS NOT VERIFIED;
     - R-A2, R-A3 (an owner choice before WP5), R-A6 and R-A8;
     - the risks R-RA1..R-RA4 from RECHECK-A;
     - B-R2 and B-R4/I-5;
     - the npm dev-only advisory;
     - the risks from the final rechecks.
   - **Separation of three outcomes:** software readiness of WP4, owner permission
     (not requested) and the pilot result (none).
2. **Report the result in this file.** Do not edit STATE, NEXT_ACTION or the board;
   the coordinator writes those.

## Checks

- EN/VI parity: the same headings and the same list items.
- Run `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  it must exit 0.
- Run the precommit check over the changed files on a temporary index.
- Never feed scripts through stdin. Never use cmd.exe. Write records with the Edit tool.
  Do not commit.

Return at most 100 words, beginning with your self-reported model.

## Results

(Worker appends here.)
