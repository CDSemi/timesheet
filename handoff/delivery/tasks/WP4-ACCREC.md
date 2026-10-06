# WP4-ACCREC dispatch brief

- Mission/task: timesheet-software-readiness / WP4-ACCREC; package WP4; kind
  documentation; attempt 1.
- Dependencies: the final rechecks WP4-RECHECK-B4 and WP4-RECHECK-A attempt 4. This
  task is dispatched only after both PASS on the same freeze, 546cdda.
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
    - `WP4_RECHECK_A2.md`, `WP4_RECHECK_A3.md` and `WP4_RECHECK_A4.md`;
    - `WP4_RECHECK_B2.md`, `WP4_RECHECK_B3.md` and `WP4_RECHECK_B4.md`;
  - the board `owner_decisions` and `coordinator_decisions` dated 2026-10-05 and
    2026-10-06, and `pending_owner_question` (I-1..I-5).

## Required edits (records only)

1. **Fill the acceptance-record section of WP4_HANDOFF**, in EN and VI.
   - **Accepted source.** Commit 546cddaf6747aef85e8b6d9b7712de9e28f138bf
     (WP4-FIXB4-FREEZE). Source digest
     26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files;
     WP4-REGATE4 PASS). Final figures from WP4-REGATE4:
     - 76 files and 1,758 tests;
     - smoke 41 PASS;
     - e2e 145 passed and 5 skipped;
     - drill stages 1–6, 208 PASS;
     - migrations and upgrade 61 passed;
     - races 60/60 (10/10 for each of 6 suites);
     - NAS NOT VERIFIED.
   - **Import resource bound** (state it as derived, then measured):
     - the derived bound t ≤ 40 ms + 14.8 ns·X + 339 ns·O and
       m ≤ 15 MiB + 13.3 B·X + 428 B·O;
     - the ceilings: 2 MiB upload, 1 MiB per part, 3 MiB per package and 100k
       openings;
     - the worst cases measured by the gate and by RECHECK-B4, against the
       500 ms / +150 MiB budget.
   - **Gate chain:**
     - WP4-GATE PASS on 13a258d (1ed67f55);
     - WP4-REGATE PASS on 0f7fba2 (dfe4541d);
     - WP4-REGATE2 PASS on cc34e7f (96445de4);
     - WP4-REGATE3 PASS on 972ccda (635f909d);
     - WP4-REGATE4 PASS on 546cdda (26fcc969).
   - **Audit chain:**
     - WP4-AUDIT-A FIX REQUIRED (A-01..A-04);
     - WP4-AUDIT-B FIX REQUIRED (B-01, B-02);
     - WP4-RECHECK-A: attempts 1–3 PASS on 0f7fba2, cc34e7f and 972ccda, each
       superseded for digest binding by a later fix round; attempt 4 is the final
       result on 546cdda;
     - WP4-RECHECK-B FIX REQUIRED (RB-01 reopened B-01);
     - WP4-RECHECK-B2 FIX REQUIRED (RB2-01);
     - WP4-RECHECK-B3 FIX REQUIRED (RB3-01);
     - WP4-RECHECK-B4 PASS on 546cdda, the final area-B result.
   - **Fix rounds** (take each profile from the board):
     - round 1: WP4-FIXB and WP4-FIXA;
     - round 2: WP4-FIXB2 (escalated to timesheet-expert) and WP4-DEPCLEAN;
     - round 3: WP4-FIXB3;
     - round 4: WP4-FIXB4 and WP4-DEPCLEAN2 (fflate moved to devDependencies).
   - **Owner decisions:**
     - F-1..F-6;
     - option B, the readme-md removal, with GOV-SKILL-REMOVE PASS;
     - the open questions I-1..I-5 and the safe defaults that stand.
   - **Coordinator decisions:**
     - held sends after a restore;
     - the rollback restore mode and `JOB_RUNNER=off`;
     - the T07 and T12 splits;
     - the `not_due` conservative default;
     - 2026-10-06: close the parse-cost class by derivation and realistic ceilings,
       not by search.
   - **Non-blocking items carried forward:**
     - NAS NOT VERIFIED;
     - R-A2, R-A3 (an owner choice before the WP5 pilot), R-A6 and R-A8;
     - the risks R-RA1..R-RA4 from RECHECK-A;
     - B-R2 and B-R4/I-5;
     - the npm dev-only advisory;
     - the risks R-B4-1..R-B4-4 from RECHECK-B4 and any risks from RECHECK-A
       attempt 4.
   - **Runtime incidents** (one line each, no PIDs): the dev DB migrated by the first
     gate run, the runaway REPL output during WP4-AUDIT-B, and the stray probe server
     left by WP4-REGATE4. Take the wording from the board `runtime_observations`.
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
- Never feed scripts through stdin. Never use cmd.exe. Never pipe into head or tail.
  Write records with the Edit tool. Do not commit.

Return at most 100 words, beginning with your self-reported model.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-light).

- Filled the "Acceptance record (WP4-ACCEPT)" section of WP4_HANDOFF.md and WP4_HANDOFF.vi.md: accepted source and final figures, import resource bound, gate chain, audit chain, fix rounds, owner and coordinator decisions, carried risks (incl. R-RA8, R-RA9, R-B4-1..R-B4-4), runtime incidents, and the three separated outcomes. All figures copied from the board and review files; nothing re-run.
- EN/VI parity: same section, same 11 top-level list items, same sub-lists (checked by reading both).
- `validate_package.py --preflight` (workflow Python): exit 0, status PASS, 83 translation pairs.
- Precommit check on a temporary index (GIT_INDEX_FILE under the task temp folder, Node 24.21.0) over the 4 changed files: exit 0, 0 blocking findings; `git diff --cached --check` exit 0.
- Evidence: handoff/delivery/evidence/WP4-ACCREC/01-sources.txt. Nothing committed; STATE, NEXT_ACTION and the board untouched.
