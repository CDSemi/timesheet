# WP2-FIXA dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIXA; package WP2; kind fix; attempt 1;
  `addresses_audit` WP2-AUDIT-A (FIX REQUIRED: WP2-A-01). It does not depend on that
  audit.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S, risk H (privacy), novelty no.
- Read AGENTS.md from disk first (rule 4). Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP2_REVIEW_A](../WP2_REVIEW_A.md), the finding WP2-A-01;
  - its probe in handoff/delivery/evidence/WP2-AUDIT-A/10-probe-holiday-preview-privacy.txt;
  - docs/01 "Initial boundary" and docs/03 "Records";
  - [WP2-T08](WP2-T08.md), the preview design;
  - the board coordinator decision dated 2026-10-04 on WP2-A-01.

  Records in English.
- Baseline: main at 8fae685949adb525ec137e5972202f58b408ac24. The working tree differs
  only in handoff/.
- Runtime: call the Node 24 portable binary by its full path.
- Do not commit.

## Coordinator decision (binding; reversible by the owner)

Remove every employee-derived count from the holiday-import preview. The canonical
privacy boundary outranks the plan's T08 wording.

The preview keeps:
- the calendar diff: added, renamed, kind-changed, removed, unchanged count, kept and
  ignored-past dates;
- the issues;
- `finalized_conflicts`;
- the boundary fields;
- `can_commit` and `preview_hash`.

If `finalized_conflicts` exposes per-employee data, reduce it to a yes/no or
date-only signal that reveals no employee identity or entry counts. Report what you
changed.

The preview may state the preservation rule as text: explicit labels and manual dates
are preserved.

## Required changes

- src/server/services/holidayImport.ts:
  - remove the `affected_days` counts of default-labelled entries and preserved explicit
    overrides (lines 191-227, fields 217-218, returned at 265);
  - commit behaviour is unchanged.
- src/client/components/HolidayImport.tsx (line 130) and the preview types in
  src/client/api.ts: remove the counts from the screen and the types.
- tests/integration/holiday-import.test.ts:
  - update lines 228-247;
  - add a regression test. The preview response for the same CSV is identical whether or
    not employees have day entries on the affected dates, apart from fields that come
    from the calendar alone.
- If an admin e2e asserts the removed counts, update it (tests/e2e/admin.spec.ts).

## Owned (writable) paths

- src/server/services/holidayImport.ts.
- src/server/routes/admin.ts, only if the response mapping requires it.
- src/client/components/HolidayImport.tsx and src/client/api.ts (preview types only).
- tests/integration/holiday-import.test.ts and tests/e2e/admin.spec.ts.
- This report and handoff/delivery/evidence/WP2-FIXA/.

List any other minimal edit as a deviation.

## Checks

- Write the regression test red-first, and save its output against the unfixed code.
- Re-run the auditor's probe scenario as a test. The admin learns nothing about which
  days an employee recorded.
- Run `npm run verify` and `npm run test:e2e` (both projects); both must exit 0.
- Run `npm run digest`.
- Evidence must be masked, LF and free of trailing whitespace. Use synthetic data only and
  no deprecated APIs.

Return at most 160 words, beginning with your self-reported model:
- the fields removed;
- the `finalized_conflicts` handling;
- tests (red→green);
- verify and e2e exits;
- digest;
- deviations.

## Results

Worker: timesheet-worker-high (claude-sonnet-5-5), attempt 1. Baseline 8fae685, Node v24.21.0 by full path.

- Removed from the preview response, client types and screen: `default_labelled_entries` and
  `explicit_overrides_preserved` (the employee `day_entries` query in `affectedDays` is gone;
  the function now reads only the calendar versions). `affected_days` stays with `date`,
  `label_before`, `label_after` (calendar-derived). The screen states the rule as text:
  "Explicit labels and manual dates are preserved; only default labels follow the calendar."
- `finalized_conflicts`: was `{date, finalized_timesheets: count}`; now `{date}` only (EXISTS
  query), no count and no identity. `can_commit` still false when present. The commit 409
  `finalized_period_affected` details share the same type, so they are date-only too; the
  refusal itself, hash check and version/audit writes are unchanged.
- Tests (tests/integration/holiday-import.test.ts): replaced the old affected-days test with a
  calendar-only one; added "answers identically whether or not employees have day entries on
  the affected dates (WP2-A-01)" (same CSV, before/after default sessions, an explicit label and
  a second user's work; bodies toEqual; no identities; no count keys) and a date-only finalized
  signal test. Red on unfixed code: 3 failed / 26 passed (01-red-unfixed.txt). Green: 29/29
  (02-green-targeted.txt).
- `npm run verify` exit 0 (31 files, 600 tests, smoke passed; 03-verify.txt). `npm run
  test:e2e` exit 0, 66 passed, 2 skipped (the existing mobile-only specs on the desktop
  project; 04-e2e.txt). tests/e2e/admin.spec.ts asserted no removed count, so it is unchanged.
- `npm run digest` (working tree, handoff/ excluded): 73db9c0aa8fab99ca42213191195db9d5762a856d0067f80c3e2d8b7d86b7d79, 611 files (05-digest.txt).
- Deviations: none. No other path edited; nothing staged or committed; no process left running.

Commit description: Remove employee-derived counts from the holiday-import preview (WP2-FIXA)
