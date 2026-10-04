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
- Target: `reviewed_commit` = 8fae685949adb525ec137e5972202f58b408ac24, the WP2-GATE
  `freeze_commit`. The gate digest is
  8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
- WP2-AUDIT-A runs at the same time in its own scratch clone. Do not share files with it.
- Use a temp location with free space; C: has ample room. Remove your clone and e2e
  outputs afterwards.
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
   - E-3 record use only on or after the leave date;
   - WP2-GATE finding F1: the insufficient-balance flow has no committed screenshot.
     Capture one in your rerun as `insufficient-balance-*-synthetic.png` in your evidence,
     inspect it, and judge whether F1 needs a code change.
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

### Auditor checkpoint 1 (in progress, 2026-10-04 UTC)

- Self-reported model: claude-opus-5-5. Scratch clone of 8fae685 on C: (outside Dropbox);
  digest before = gate digest 8ebce5fe...24a2 (`evidence/WP2-AUDIT-B/digest-before.txt`).
- Done so far (all exit 0): `npm ci`; `npm run verify` with trace/pending deprecation (31 files,
  599 tests, smoke 28 PASS, no deprecation output); `npm run test:e2e` (66 passed, 2 skipped);
  auditor UI probe (4 passed; F1 screenshots captured); API probe (77 PASS); WP1 to WP2
  upgrade probe (16 PASS). Evidence in `evidence/WP2-AUDIT-B/`.
- Remaining: code/spec review write-up, docs and HANDOFF checks, digest after, cleanup, report.

### Auditor result (attempt 1, final)

- Self-reported model: claude-opus-5-5 (timesheet-auditor; effort not observable). Fresh context;
  authored nothing in WP2; no source edited. Report: [WP2_REVIEW_B.md](../WP2_REVIEW_B.md) and
  [.vi.md](../WP2_REVIEW_B.vi.md). Evidence: `handoff/delivery/evidence/WP2-AUDIT-B/` (masked, LF).
- Reviewed commit 8fae685949adb525ec137e5972202f58b408ac24; project HEAD equal before and after;
  source digest 8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2 (611 files) before
  and after, equal to the gate digest (`digest-before.txt`, `digest-after.txt`).
- Executed (scratch git clone on C:, Node v24.21.0 by full path, Edge channel, no download):
  - `npm ci`: exit 0.
  - `npm run verify` with trace/pending deprecation: exit 0 (31 files / 599 tests, smoke 28 PASS,
    no deprecation output).
  - `npm run test:e2e`: exit 0 (66 passed, 2 skipped).
  - Auditor UI probe spec: F1 flow, every screen's CSP, tokens and mobile targets, the input-zone
    default and dark mode; all pass in the final runs.
  - API probe: 77 PASS (T01, T05, AC-04, T06, T07/CALFIX, E-10, integration, AC-05).
  - WP1 (f32978f) to WP2 upgrade probe: 16 PASS.
  - Seed run twice: idempotent.
  - `validate_package.py --preflight`: PASS.
  - Failed probe runs were auditor-probe bugs; they are listed in the report.
  - The clone, the WP1 export and the e2e outputs were deleted; no process was left running.
- Verdict: **FIX REQUIRED.**
  - WP2-B-01, Medium: the manual-entry input zone defaults to the reporting zone, not the current
    display zone required by R-07 (`src/client/DayEditor.tsx:75`,
    `src/client/components/SessionForm.tsx:53`; pinned by `tests/e2e/day-editor.spec.ts:95`).
    Fix: default to the display zone and update the e2e, or obtain an owner decision amending R-07
    (EN/VI plus docs/10).
  - WP2-B-02, Low: new literal font sizes and layout widths in `src/client/styles.css` (lines 632,
    825, 843; 410, 587, 616, 678, 802, 876, 966), against the AGENTS UI rule "introduce new values
    only as CSS custom properties". Fix: tokenize them, with no visual change.
- WP2-GATE F1: no code change needed. The insufficient-balance screen is clear: the figures,
  "Nothing was reserved.", `role="alert"`, with balances unchanged. Screenshots
  `insufficient-balance-{desktop,mobile}-synthetic.png` are in this evidence.
- Passed in area B:
  - the T01 contract and Clock-out version;
  - the T05 batch: conflicts, reasons, stale versions, partial leave, WFH, read-time default labels;
  - AC-04 audit before/after;
  - AC-05: issues, preserved explicit and manual dates, unchanged past classification for 26
    periods, idempotent commit, stale hash, boundary;
  - the T06 preview equal to creation;
  - user admin, revocation and the last-admin and self refusals;
  - `calendar_in_use`, consistent with rule 7 and R-07;
  - admin non-access;
  - E-10;
  - UI CSP (0 inline styles), 300 ms ease-out transitions, 4 px radius, mobile 44 px targets and no
    overflow on all screens;
  - DST fold and gap, overnight entry, upcoming days, the E-2 warning (informational) and E-3;
  - shared domain functions imported from `src/domain/breaks.ts` (no copy);
  - the keyed seed credit with no inference;
  - the WP1 upgrade (rows byte-identical);
  - leave label versus ledger, and export completeness;
  - the docs/03 and docs/10 records and the EN/VI HANDOFF pair.
- Next action: the coordinator dispatches one bounded fix task (`addresses_audit: WP2-AUDIT-B`,
  client and e2e only), then a freeze, a new WP2-GATE and a WP2-AUDIT-B recheck on the new digest.
