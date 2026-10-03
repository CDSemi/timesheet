# WP2-CALFIX dispatch brief

- Mission/task: timesheet-software-readiness / WP2-CALFIX; package WP2; kind fix;
  attempt 1; depends on WP2-T08-FREEZE. It addresses the WP2-T08 report-only finding on
  calendar reassignment, which is a defect in the WP2-T07 code.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S, risk H (AGENTS rule 7, R-07, finalized-state integrity), novelty no.
- Read AGENTS.md from disk first (rules 7 and 8), then:
  - the finding under "Calendar reassignment finding" in [WP2-T08](WP2-T08.md);
  - its probe in handoff/delivery/evidence/WP2-T08/calendar-reassignment-probe*.txt;
  - the T07 result in [WP2-T07](WP2-T07.md);
  - docs/01 FR-01, docs/02 R-07, docs/03 and docs/04 (user and calendar administration);
  - docs/10 (decision format);
  - src/server/services/users.ts and src/server/routes/admin.ts.

  Records in English; docs keep their .vi.md pairs.
- Baseline: main at the WP2-T08-FREEZE commit. The coordinator gives the SHA at dispatch.
- Do not commit.

## Defect (from the T08 probe)

`PATCH /api/admin/users/:id {calendar_id}` causes the following for a user who already has
data:
- the draft period regroups, and default-labelled days relabel and recalculate;
- existing timesheets are orphaned, and a payroll-date read can fail with 422;
- a finalized timesheet reads as not finalized, and a new timesheet can be created for an
  overlapping period.

Stored session dates do not move.

## Coordinator decision (reversible by the owner)

- Refuse a calendar change, with 409 `calendar_in_use`, while the user has any timesheet,
  day entry, session, ledger entry or leave request.
- A refused change writes nothing and creates no audit event.
- The calendar may change only for an account without such data.
- Display name and role edits are unaffected.
- A prospective, effective-dated calendar reassignment would need its own schema and
  period-lookup design. It is out of scope for WP2 and is recorded as an owner option.

**Guard (rule 8).** Read the canonical texts first. Stop and report without implementing
in either of these cases:
- a canonical text requires changing the calendar of a user who already has data;
- a canonical text requires that a calendar change take effect for existing periods.

## Required content

- Implement the refusal in users.ts within the existing update transaction.
- Map the error in admin.ts only if the existing error mapping needs it.
- Record the decision:
  - in docs/10 and its .vi.md, dated 2026-10-03, as a coordinator decision reversible by
    the owner;
  - as one clarifying sentence in the canonical section that describes admin user
    editing, with its .vi.md pair.

## Owned (writable) paths

- src/server/services/users.ts and src/server/routes/admin.ts.
- tests/integration/user-admin.test.ts.
- docs/10_DECISIONS_AND_SOURCES.md and .vi.md.
- The one canonical document section on admin user editing, with its .vi.md pair. Name
  it in your report.
- This report and handoff/delivery/evidence/WP2-CALFIX/.

List any other minimal edit as a deviation.

## Checks

- Red-first regressions:
  - one for each data kind (timesheet, day entry, session, ledger entry, leave request):
    409 `calendar_in_use`, with the stored row and the audit table unchanged;
  - a user without data can change calendar, with one audit event;
  - a combined PATCH that includes a refused calendar change applies nothing;
  - display name and role edits still work.
- Re-run the T08 probe scenario as a test. It must now be refused, and the finalized
  timesheet view must be unchanged.
- Run `npm run verify` and `npm run digest` with the Node 24 portable runtime first on
  PATH, and confirm `node --version`.
- Run `validate_package.py --preflight` with the workflow Python, because docs change.
- Evidence must be masked, LF and free of trailing whitespace. No deprecated APIs.

Return at most 180 words, beginning with your self-reported model:
- the guard result (the canonical texts checked);
- files changed;
- tests (red→green);
- verify exit, digest and preflight;
- deviations.

## Results

(Worker appends here.)
