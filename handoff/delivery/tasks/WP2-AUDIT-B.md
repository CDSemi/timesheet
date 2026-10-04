# WP2-AUDIT-B dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-B; package WP2; kind audit;
  attempt 1; depends on WP2-GATE. This is a package-final independent audit of area B:
  workspace, admin, UI and integration.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English. WP2_REVIEW_B.md and
  its .vi.md are bilingual and follow handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP2. The author agent IDs are on the board. Treat every
    report as a claim.
  - The audit runs at opus, which is not weaker than any author model.
- Target: `reviewed_commit` = the WP2-GATE `freeze_commit`, given at dispatch. Record HEAD
  and the source digest before and after; the digest must equal the gate digest.
- Execute only in your own scratch clone outside Dropbox, and delete it afterwards. Call
  Node 24 by its full path. The e2e uses the installed Edge; download no browser. Do not
  edit source.
- Read AGENTS.md from disk first, including rule 7 and the UI standards section. Then
  read:
  - handoff/prompts/WP2_REVIEW.md;
  - docs/01, docs/02 (R-01, R-02, R-03, R-07), docs/03, docs/04, docs/06 (AC-04,
    AC-05) and docs/10;
  - handoff/delivery/WP2_HANDOFF.md;
  - the board decisions (E-1, E-4, E-8–E-13, the CALFIX refusal, the T09 split);
  - the task records for T01, T05–T13, CALFIX and T09-PREP.

## Scope

1. **T01 break contract** under E-1, and the Clock-out `expected_version`.
2. **T05 batch edit**: conflicts with sessions untouched, reasons for old dates, stale
   versions, partial leave, WFH, `category_source` with read-time default labels.
3. **AC-04**: reasons and audit events with before/after for every change.
4. **AC-05 and T08**:
   - duplicates and invalid dates;
   - preserved explicit labels and manual dates;
   - unchanged past classification;
   - idempotent commit, stale hash, boundary;
   - judge the design notes: refusals come before the hash check, and a calendar
     without a version is refused.
5. **T06**: the preview equals the post-creation views; one calculation engine. Judge
   the policies/timesheets import cycle.
6. **T07 and CALFIX**:
   - user admin, session revocation, last-admin and self refusals;
   - `calendar_in_use`, against rule 7 and R-07;
   - admin non-access to employee data.
7. **Payroll exceptions** (E-10).
8. **UI (T09A–T12)**. Rerun the e2e flows in your clone and visually inspect the
   committed screenshots, not only the DOM assertions. Check:
   - the E-8 tokens and the AGENTS UI standards, with the skill-conflict resolutions;
   - mobile 44px targets and no overflow;
   - CSP (no inline styles);
   - display-only use of the shared domain functions `suggestBreaks` and
     `expectedFinishUtc`. They must be the same module, not a copy, and no business
     minutes may be computed in the client;
   - the DST fold and gap handling, and overnight entry (rule 7);
   - future days shown as upcoming;
   - the E-2 warning is informational only;
   - E-3 record use only on or after the leave date.
9. **Integration**:
   - the T13 seed (keyed synthetic ledger entries; no opening-balance inference) and the
     smoke;
   - the WP1 → WP2 upgrade;
   - cross-area checks: leave label versus ledger, and export completeness.
10. **Docs and HANDOFF**:
    - the HANDOFF matches the evidence and the EN/VI pairs agree;
    - the docs/03 and docs/10 decision records are present.

## Output

- handoff/delivery/WP2_REVIEW_B.md and .vi.md.
- Results in this file.
- Evidence and probes in handoff/delivery/evidence/WP2-AUDIT-B/ (masked, LF; screenshots
  `*-synthetic.png`).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-B-nn), a
  severity, file:line and the required change.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
