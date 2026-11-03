# WP5-CALDEF-PLAN dispatch brief (plan the owner's answer to R-UX5I2-3)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-PLAN, package WP5, kind
  plan, attempt 1, depends on WP5-GOV-DOCS-COMMIT (done). Read-only: you change no
  repository file except this brief's Results and your evidence folder
  `handoff/delivery/evidence/WP5-CALDEF-PLAN/`.
- **Owner decision (2026-11-02, verbatim on the board under `owner_decisions`):**
  "R-UX5I2-3: nếu giá trị mặc định đã đổi thì hiện thông báo, để người dùng quyết định save
  (ghi đè) hay update theo giá trị mặc định mới"
  - Translation: if the default value has changed, show a notice so that the person decides
    whether to save (overwrite) or to update to the new default.
  - It is close to option (c) of the review ("refuse the save when the default changed since
    the load"), but the person chooses instead of a plain refusal. It is a user-confirmed
    requirement (AGENTS rule 8): plan how to implement it. Do not argue it away. Raise an
    owner question only for a real contradiction with a canonical rule, with a recommended
    default.
- **The risk being closed (R-UX5I2-3).** A calendar default (for example Holiday) has no
  version. If an administrator imports a holiday while a person's Day editor is open on that
  day, a later "Save day fields" can record "Worked" over the new Holiday default, which
  changes the day's required time. The form shows "Calendar default. Saving records it as
  your choice." under the old category. Sources:
  - `handoff/delivery/WP5_UX5_REVIEW_INT2.md`, R-UX5I2-3 (around line 259);
  - `handoff/delivery/WP5_UX5_REVIEW_INT3.md`, "An administrator's calendar change"
    (around line 168: cases E3 and E4, probe `zz-int3-admin.spec.ts` in that audit's
    evidence folder) and its "Risks" entry;
  - `handoff/delivery/WP5_PILOT_PACKET.md` section 8, "Open owner decision: R-UX5I2-3".
- **Profile and routing.** timesheet-planner (high), requested sonnet, no override. docs/08
  "Plan/diagnose a bounded issue". Routing: size M, risk H (a day's category drives required
  time and the OT figures; concurrency between an administrator and a person), novelty no
  (the day-fields version guard and its stale notice are the existing pattern). Task record
  in English.
- **State.** HEAD = origin/main = 5b2f287 (digest 4ac52e6b, 882 files). The accepted product
  source is a54061f / 690fd8fd (WP5-UX5-RECHECK-RN); 5b2f287 changed documentation only.
  The working tree holds uncommitted coordinator records under `handoff/` (the board,
  STATE, NEXT_ACTION, the checkpoint, the WP5-GOV-DOCS-COMMIT results): leave them alone.
- **AGENTS.md on disk wins.** Read it first (rules 8, 11, 14 and the UI standards).

## Read

- `AGENTS.md`, `docs/08_AI_WORKFLOW_AND_BUDGET.md` (routing table, gate and audit flow).
- `docs/02`, `docs/03` and `docs/04` where they define the day entry, its category source
  (calendar default versus the person's choice), the entry version, `expected_version`, the
  stale notice and the Day editor's save, follow and tab-return rules (docs/04 around
  line 69), the holiday import and the calendar; `docs/10` owner decisions; `docs/05` if the
  API contract lives there.
- Client: `src/client/DayEditor.tsx`, `src/client/components/DayFieldsForm.tsx` and every
  other client path that saves a day's category (the label picker, "Change several days",
  the phone sheet, the shared edit view).
- Server: the day-fields save route and its version check, how a day without an entry (or an
  entry with source "default") gets its category, the holiday import and any other calendar
  write that changes a default.
- Tests: `tests/e2e/day-editor.spec.ts` (FIX18 and FIX19 tests for the held and follow
  branches) and the server tests for the day-fields route.

## Plan (write it in your Results and in `evidence/WP5-CALDEF-PLAN/plan.txt`)

1. **Mechanism.** Confirm from the code exactly how the save works today: what the client
   sends (category, its source, the entry version), what the server checks, and why a changed
   calendar default is not detected. Cover a day with no entry, an entry whose category is
   still the calendar default, and an entry whose category is the person's explicit choice.
2. **Scope of "the default changed".** List every write path that can record a category over
   a default (Day editor desktop and phone, label picker, "Change several days", shared edit
   view, Check in creating an entry) and every event that changes a default (holiday import,
   calendar edit, calendar assignment, work-policy change if it affects the default). Say
   which ones the owner's rule must cover and why; keep it to the smallest complete set.
3. **Design.** Propose how the change is detected (for example the client sends the default
   it showed, or a calendar revision token, and the server refuses with a specific code and
   the new default) and the notice the person sees, with exactly two choices:
   - save and overwrite (record the person's category over the new default);
   - update to the new default (the form takes the new default; what happens to other typed
     fields such as the note must be stated).
   Compare at least one meaningful alternative and pick one. State the API contract change,
   the error code and message text, the notice text (English UI), its placement on desktop
   and phone, keyboard focus and announcements, and how it fits the existing stale notice,
   the unsaved-changes guard (U4-05), FIX18's follow and FIX19's held branch. Follow the
   AGENTS.md UI standards (tokens, 44px targets, focus ring, no colour-only state).
4. **Server-side safety.** A stale client that does not send the new field must not be able
   to overwrite silently, or say why the risk is acceptable. No migration unless needed; if
   one is, say so and why.
5. **Tests.** Name the unit, integration and e2e tests (both choices, each write path in
   scope, no regression of FIX18/FIX19 cases and the stale notice), and mutants the fix must
   kill.
6. **Documents.** The exact canonical lines to change in docs/02-05 and docs/10 (the owner
   decision), each with its `.vi.md`; the pilot packet section 8 and the WP5 handoff are
   updated later by the coordinator's accept step, not by the fix.
7. **Delivery.** Slices (prefer one fix task if it stays bounded), exact owned paths, the
   routing for each (profile, model, effort per docs/08), whether dist/server changes (and so
   whether the gate must rerun the container drill and npm audit), the gate scope and the
   audit scope.
8. **Questions.** Only real contradictions, each with a recommended answer.

## Rules

- Read-only on the repository; probes run in a scratch export or a temporary folder, never
  in the working tree. Synthetic data only. Ports 52010-52049 if you start servers. Stop
  every process you start; never kill by PID a process you did not start.
- No deprecated APIs in what you propose.
- Do not edit the board, STATE or any shared record. Record executed commands with their
  exit codes; never invent evidence.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-planner, effort high). Full plan with file:line citations:
`handoff/delivery/evidence/WP5-CALDEF-PLAN/plan.txt`; commands: `.../commands.txt`. Read-only: no repository file other than this
section and the evidence folder was changed; no server, build, test or probe was run (the mechanism is readable from the code and the INT3
probe `90-zz-int3-admin.spec.ts.txt` with its observation `46-obs-int3-admin-target.txt` is the reproducer; product source is unchanged
since a54061f).

**1. Mechanism (observed in code).** The form sends `{category, leave, wfh, notes, expected_version = entry version or null}` and nothing
about the default (`DayFieldsForm.tsx:81-102`, `sessionModel.ts:458-473`). `applyDayEntryChange` (`timesheetCommands.ts:328-420`, shared with
the batch) checks only the entry version and always writes `category_source = 'explicit'`. A default-sourced entry's shown category is
derived from the calendar at read time (`timesheets.ts:247`), and the holiday import writes only `calendar_versions` (`calendars.ts:158`),
never an entry; so the entry version does not move and a day with no entry has no version. Cases: (A) no entry: null version accepted,
INSERT explicit; (B) default-sourced entry: version matches, UPDATE explicit; both silently overwrite the new Holiday; (C) explicit entry:
nothing at stake. Recorded: INT3 E3 "ACCEPTED; server category Worked/explicit" after the import made the default Holiday.

**2. Scope.** Write paths in: Day editor desktop and phone and the shared edit view (one PUT /days/:date), label picker and "Change several
days" (one POST /days/batch). Out: Check in and sessions (they create default-sourced rows), workbook import, seed. Events in: the
administrator's holiday import (the only runtime writer of a default; `createCalendarVersion` has 3 callers); calendar assignment is refused
once an account has data and is covered anyway by the same comparison; a work-policy change does not alter the category default. The rule
applies only where a default is at stake (no entry, or source `default`); explicit entries are never checked.

**3. Design (chosen A; alternatives B, C, D compared in plan.txt).** Optional `default_category` (the default the caller was shown) on the
day PUT and each batch entry. Server, inside the write transaction after the reason and version checks: no entry or source `default`, field
sent, current default known and different -> 409 `default_changed` (details `work_date`/`work_dates`, `expected_default`,
`current_default`; batch preview status `default_changed`, `can_commit` false; commit all-or-nothing; `stale_version` always wins).
Acknowledgement = repeat the call with `current_default`. Day editor notice in the "Category and leave" form (same slot on drawer and sheet;
`.warn-box` tokens, `role="alert"`, focused, scrolled into view, no new CSS value): "Notice. The calendar default for this day changed from
Worked to Holiday since it was loaded. Nothing was saved. Use the new default, or save your category over it." Buttons, in Tab order: "Use
Holiday" (the category takes the new default; typed note, WFH and leave stay; nothing sent; baseline rebased; status line; focus to the
select; the editor re-reads the day when only the default changed) and "Save Worked anyway" (resends with the new default as
acknowledgement). The form must send the default it was seeded with (captured at mount), not the live prop, because FIX19's held branch
keeps the old category under an answer that already carries the new default (mutant M10). B (calendar version id) rejected: every import
changes the id of every later date, so false notices. C (client-only proactive detection) rejected as the only mechanism (no coverage on
the phone sheet, the sheet paths or without a tab event); it can be added later. Label picker and batch: the existing reload flow answers
(preview status "calendar default changed" in the review dialog; commit refusal handled like `stale_version`, page message "{dates}
changed since this period was loaded ... Reload the period ..."): reload = use the new default, pick again = save over it.

**4. Server-side safety.** Check is in `applyDayEntryChange` and `planBatch`, inside the IMMEDIATE transaction, against the owner's
calendar, so a concurrent import serialises with it; one new helper `calendarDefaultOn` replaces two copies of the classify/catch block. A
client that omits the field (an old tab after a deploy, a script) is not checked, as today; reason: three conditions must coincide, the
overwrite is visible and audited (before Holiday, after Worked) and fixed by one edit, whereas a required field would break 77 PUT call sites
in 22 test files. No migration; no package or lockfile change.

**5. Tests and mutants.** Integration `tests/integration/calendar-default-change.test.ts` I1-I13 (no entry; default entry; acknowledgement
and audit before/after; explicit never checked; no false notice and Holiday to closure; omitted field; precedence over `stale_version` and
the reason rule; null and invalid values; batch preview, all-or-nothing commit, acknowledgement; share route; no cross-user leak). Client
unit: `sessionModel`, `labelPickerModel`, `dayModel` tests and a `defaultChangeOf` parse test. E2E `tests/e2e/calendar-default.spec.ts` W1-W11
on a private server, both projects (both choices; no-entry day; FIX19 held branch and E4; FIX18 follow; explicit and no-change import;
U4-05; phone sheet 44px and focus; label picker; Change several days; shared view; contrast in both themes). The existing FIX18, FIX19
and U4-05 tests stay unmodified. Mutants M1-M15 (server: remove check, one branch only, explicit checked, version id instead of category,
null or omitted raising, wrong order, acknowledgement ignored or any value accepted, batch skipped or partial; client: live-prop default,
"Use" dropping the note or leaving dirty, "Save anyway" resending the old default, entries omitting the field, picker or batch error
handling, focus/role/44px/Tab order).

**6. Documents (each with its .vi.md; ship with the code task, no gate or audit, one review-and-fix).** D1 docs/02 R-03: default label
versus saved label and the decide-before-overwrite rule. D2 docs/03 `day_entries` row: category source. D3 docs/03 "API and hosting
boundary": the `default_category` / 409 `default_changed` contract, omitted field not checked. D4 docs/04 "Day editor": new bullet for the
notice. D5 docs/04: one clause each in the switching bullet, the picker bullet and the batch sentence. D6 docs/10: new owner-decision
section (verbatim sentence, scope reading, optional-field decision). docs/05: no change. Pilot packet section 8, WP5 handoff, release notes:
the coordinator's accept step.

**7. Delivery.** Prefer one fix task. T1 `WP5-CALDEF-FIX`: timesheet-worker-high (high), sonnet, no override, size M, risk H, novelty no.
Owned paths: `src/server/http/schemas.ts`, `src/server/services/{timesheets,timesheetCommands,dayEntries}.ts`, `src/client/{api.ts,
DayEditor.tsx,TimesheetScreen.tsx}`, `src/client/components/{DayFieldsForm.tsx,sessionModel.ts,dayModel.ts,labelPickerModel.ts,errors.ts,
BatchDialog.tsx}`, `tests/integration/calendar-default-change.test.ts` (new), `tests/client/{sessionModel,labelPickerModel,dayModel}.test.ts`,
`tests/e2e/calendar-default.spec.ts` (new), plus `styles.css` and the two CSS tests only if a custom property proves necessary. T2
`WP5-CALDEF-DOCS`: timesheet-worker (medium), sonnet, size S, beside T1 on docs/02, 03, 04, 10 and their `.vi.md`, then one fresh
review-and-fix. **dist/server changes** (schemas and three services), so the gate (T3, timesheet-verifier medium, sonnet) reruns the
container drill `--wp3` every stage and `npm audit --omit=dev`, with identity/digest, clean-build dist comparison against a54061f, core x3,
FULL e2e both projects, simulated-clock sweep, stress of the new spec and the FIX18/FIX19/U4-05 tests, and the INT3 E2/E3/E4 probe on the
target. Audit (T4, timesheet-auditor xhigh, opus, fresh): server contract and stale-client probe, client notice/focus/phone/themes and the
FIX18/FIX19/U4-05 interplay, independent run of M1-M15 and of the probes; one audit, size M.

**8. Questions.** No contradiction with a canonical rule (docs/10 E-4 is kept: the import still writes no person row and explicit labels are
never checked). Two non-blocking confirmations, each with a recommendation: (1) the two-button notice is built in the Day editor; the label
picker and Change several days use the existing reload flow (recommended: accept); (2) `default_category` is optional on the API
(recommended: optional; the strict variant costs 22 test files for a three-condition window).

**Slips.** None known. The shell tool does not print exit codes; every shell command completed without a reported failure (listed in
`commands.txt`). Line numbers cited were read from the working tree at HEAD 5b2f287.
