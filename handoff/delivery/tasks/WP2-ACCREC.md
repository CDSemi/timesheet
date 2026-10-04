# WP2-ACCREC dispatch brief

- Mission/task: timesheet-software-readiness / WP2-ACCREC; package WP2; kind
  documentation; attempt 1; depends on WP2-AUDIT-A2 (attempt 3 PASS) and WP2-AUDIT-B4
  (PASS).
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L (records only; no source), novelty no. The task record is in English; the HANDOFF
  stays bilingual (EN authoritative, VI matching).
- Read AGENTS.md from disk first (rules 1, 5 and 9). Then read:
  - handoff/templates/HANDOFF.md and .vi.md;
  - handoff/delivery/WP2_HANDOFF.md and .vi.md;
  - the accepted acceptance record in WP1_HANDOFF.md, for the form;
  - the board tasks from WP2-GATE through WP2-AUDIT-B4 (read-only);
  - the review chain: WP2_REVIEW_A/B, WP2_RECHECK_A/A3/A4, WP2_RECHECK_B/B3/B4, each with
    its .vi.md.

## Required edits (records only)

1. **Fill the WP2_HANDOFF acceptance-record section** in EN and VI:
   - accepted commit 5fafeaee72509c6110a907458643bf7582dad81a and source digest
     e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df;
   - the gate chain: WP2-GATE, then GATE2, GATE3 and GATE4, with GATE4 PASS on 5fafeae;
   - the audit chain:
     - WP2-AUDIT-A FIX REQUIRED (WP2-A-01);
     - WP2-AUDIT-B FIX REQUIRED (WP2-B-01, WP2-B-02);
     - WP2-AUDIT-A2 attempts 1–3 PASS; attempts 1–2 were invalidated by later source
       changes; attempt 3 is the final PASS at 5fafeae;
     - WP2-AUDIT-B2 FIX REQUIRED (B2-01, B2-02);
     - WP2-AUDIT-B3 FIX REQUIRED (B3-01, B3-02);
     - WP2-AUDIT-B4, final verdict.
   - the fix rounds and what each closed: WP2-FIXA, WP2-FIXB with its addendum,
     WP2-FIXB2 and WP2-FIXB3;
   - non-blocking items carried forward:
     - R1–R4;
     - WP2-A2-01 (closed);
     - WP2-A3-01 (the audit record keeps the refresh flag; hide it in any future admin
       audit view);
     - WP2-A4-01 (the smoke-port message);
     - ADV-A-05;
     - F1 as an evidence-only note;
     - and any B4 optional items;
   - WP3 carry-forward:
     - the `CorrectionResult`/`DeficitDebitResult` pending variant;
     - dropping provisional minutes at finalization;
     - a prospective calendar reassignment as an owner option;
     - revision-specific correction keys (R1).
2. **Correct the stale wording at WP2_HANDOFF.md:41** (and the matching .vi.md line). It
   still describes per-date employee counts in the holiday preview, which WP2-FIXA
   removed.
3. **Update the HANDOFF figures where the fix rounds changed them**: test counts (613
   unit tests; e2e 74 passed and 2 skipped), the screens and the freeze list. Every figure
   must cite a task record or evidence file; invent nothing.

## Owned (writable) paths

- handoff/delivery/WP2_HANDOFF.md and handoff/delivery/WP2_HANDOFF.vi.md.
- This report and handoff/delivery/evidence/WP2-ACCREC/.

Do not edit STATE.json, NEXT_ACTION, the board, source or any review report.

## Checks

- Run `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- Confirm that the EN and VI files say the same thing.
- Evidence must be LF and free of trailing whitespace, with a single final newline.
  Never write into the repository root.

Return at most 120 words, beginning with your self-reported model: the sections edited,
the stale line fixed, the preflight exit, and EN/VI parity.

## Results

(Light worker appends here.)

### Worker result (attempt 1)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP2-ACCREC/` (`preflight.txt`, `parity.txt`).

- Edited only `WP2_HANDOFF.md` and `WP2_HANDOFF.vi.md` (same edits in both), this Results section and the evidence folder.
- Acceptance record filled (commit 5fafeae, digest e61fa914..., gate chain GATE to GATE4, audit chain A, B, A2 attempts 1-3, B2, B3, B4, fix rounds FIXA/FIXB(+addendum)/FIXB2/FIXB3, carried items R1-R4, ADV-A-05, A2-01 closed, A3-01, A4-01, F1, B4 optional items, WP3 carry-forward). Figures come from the GATE, FIX and AUDIT task Results.
- Stale line fixed: the FR-13 row (was WP2_HANDOFF.md:41, "affected days, preserved overrides") now states a calendar-only preview with date-only finalized conflicts and no employee-derived counts (WP2-FIXA).
- Updated: header, commit/status/next-action/provenance bullets, T13 freeze row and three fix freeze rows, task-evidence table (FIXA 600; FIXB 606; FIXB2 611; FIXB3 and GATE4 613 unit tests; e2e 74 passed, 2 skipped), gate 20x/upgrade note, evidence index (GATE, FIX, AUDIT, ACCREC folders).
- Left as written (T13-era history, labelled): T13 verification table and the 599/66 rows.
- Preflight (workflow Python 3.12.14): first run exit 1 on a link to the directory `evidence/WP2-ACCREC/` that I wrote; changed to file links; rerun exit 0, PASS, 58 pairs, 1015 links.
- EN/VI parity: heading, bullet, table-row and hash counts equal (`parity.txt`).
