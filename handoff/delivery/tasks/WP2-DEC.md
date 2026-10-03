# WP2-DEC dispatch brief

- Mission/task: timesheet-software-readiness / WP2-DEC; package WP2; kind documentation;
  attempt 1; depends on WP2-CKPT1.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing:
  size S/M, risk M (canonical business-rule text and one reference fixture), novelty no.
- Read AGENTS.md from disk first, then [WP2-PLAN](WP2-PLAN.md) section E, the board
  `owner_decisions` entry dated 2026-10-03 (owner reply "dùng đề xuất"), docs/01–04,
  docs/06, docs/10, reference/fixtures/README.md and ledger_cases.json. Task record in
  English; every human-facing English doc you change needs its .vi.md equivalent.

## Owner decisions to encode (binding, 2026-10-03)

- **E-2.** OT-funded leave is not a day category.
  - Day entries carry leave minutes with a `leave_kind`: vacation | sick | ot.
  - L for deficits (R-05) = the day's leave minutes entered by the employee.
  - The UI warns when the day's OT-kind leave minutes differ from the leave request's
    consumed minutes.
  - Never auto-spend (label changes never spend).
- **E-3.** OT leave is consumed only by an explicit, idempotent employee "record use"
  action, on or after the leave date. Partial use is allowed. An unconsumed reservation
  stays reserved until it is used or cancelled, and WP3 review flags it. WP2 needs no job
  runner.
- **E-8 (docs/04 only here).** The app's visual standard is:
  - plain CSS custom properties in src/client/styles.css;
  - 4px radius;
  - 300 ms ease-out transitions on interactive states (hover, active, focus);
  - high-density, mobile-first layout.

  The AGENTS.md UI section is changed by a separate governance task. Do not edit
  AGENTS.md.

## Required changes

1. docs/02_TIME_AND_OT_RULES.md and its .vi.md: in R-05/R-06 and the leave text (around
   lines 54–62), state E-2 and E-3 precisely. Keep all other rules unchanged.
2. docs/03_ARCHITECTURE_AND_DATA.md and its .vi.md: the data model gains `leave_kind` on
   day entries and the explicit consume action; no WP2 job runner.
3. docs/04_UX_AND_SETTINGS.md and its .vi.md: the "record use" action, the mismatch
   warning, and the E-8 visual standard.
4. docs/06 and its .vi.md: only if an acceptance line names the "OT-funded leave"
   category.
5. docs/10_DECISIONS_AND_SOURCES.md and its .vi.md:
   - record owner decisions E-2, E-3 and E-8 (2026-10-03);
   - record the coordinator's reversible routine defaults E-1, E-4..E-7 and E-9..E-13
     from the board `coordinator_decisions`.
6. reference/fixtures/ledger_cases.json (around line 445):
   - align the "OT-funded leave" scenario with E-2 (no category; leave_kind ot);
   - do not change the scenario count, IDs or expected numbers;
   - update reference/fixtures/README.md and its .vi.md if they describe the category;
   - grep docs/ and reference/ for "OT-funded leave" and align every occurrence.
7. No source code changes. If a test reads the changed fixture field and fails, report it
   rather than editing the test, unless the edit is a one-line field rename; list any such
   edit as a deviation.

## Owned (writable) paths

docs/02_TIME_AND_OT_RULES.md/.vi.md; docs/03_ARCHITECTURE_AND_DATA.md/.vi.md;
docs/04_UX_AND_SETTINGS.md/.vi.md; docs/06_TEST_AND_ACCEPTANCE.md/.vi.md (only if
needed); docs/10_DECISIONS_AND_SOURCES.md/.vi.md; reference/fixtures/ledger_cases.json;
reference/fixtures/README.md/.vi.md; this report; handoff/delivery/evidence/WP2-DEC/.

## Checks

- `python handoff/delivery/validate_package.py --preflight` with the workflow Python
  recorded in handoff/delivery/evidence/orchestration/run-validation.ps1. It must still
  report 91 reference scenarios and valid links.
- `npm run verify` with Node 24: put the portable Node bin first on PATH.
- `git diff --check`.
- Evidence must be masked, with LF line endings and a single final newline.
- Return at most 250 words, beginning with your self-reported model: files changed, the
  exact rule text added, fixture change, check exits, deviations.

## Results

Attempt 1 (sonnet): done.

- Changed: docs/02, 03, 04, 10 and their .vi.md; reference/fixtures/ledger_cases.json, README.md, README.vi.md. docs/06 not changed (no acceptance line names the category).
- docs/02: R-05 defines L as the leave minutes the employee entered (any leave_kind); R-06 states OT-funded leave is not a day category, leave_kind vacation|sick|ot, mismatch warning, record-use only, partial allowed, unconsumed reservation stays reserved and WP3 flags it.
- docs/03: day_entries leave_kind; ot_leave_requests consumption only via record use; no WP2 job runner.
- docs/04: Record use action, mismatch warning, "Visual standard" section (E-8).
- docs/10: owner decisions E-2, E-3, E-8 and coordinator defaults E-1, E-4..E-7, E-9..E-13.
- Fixture LG-10: event type change_category -> change_leave_label, category "OT-funded leave" -> leave_kind "ot"; scenario count, IDs, expected numbers unchanged. No test reads these fields (grep).
- Checks (evidence in handoff/delivery/evidence/WP2-DEC/): preflight exit 0 (91 scenarios); npm run verify on Node 24 exit 0; git diff --check exit 0.
- Deviations: none.
