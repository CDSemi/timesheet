# WP5-CALDEF-PLAN-REVIEW dispatch brief (challenge the R-UX5I2-3 fix plan before code)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-PLAN-REVIEW, package WP5,
  kind plan, attempt 1, depends on WP5-CALDEF-PLAN (done). Read-only: you change no
  repository file except this brief's Results and your evidence folder
  `handoff/delivery/evidence/WP5-CALDEF-PLAN-REVIEW/`.
- **You are fresh.** You did not write the plan. Do not trust it: verify each material claim
  against the code at HEAD and challenge the design. A flaw found now costs one edit; the
  same flaw found by the final opus audit costs a fix, a freeze, a gate and another audit.
- **Profile and routing.** timesheet-planner (high), requested opus, override `size_risk`
  (risk H design; the final audit is opus). Size M, risk H, novelty no. Task record in
  English.
- **Owner decision (2026-11-02, verbatim on the board under `owner_decisions`):**
  "R-UX5I2-3: nếu giá trị mặc định đã đổi thì hiện thông báo, để người dùng quyết định save
  (ghi đè) hay update theo giá trị mặc định mới". Translation: if the default value has
  changed, show a notice so that the person decides whether to save (overwrite) or to update
  to the new default. A user-confirmed requirement (AGENTS rule 8).
- **Coordinator decisions already taken (board `coordinator_decisions`, 2026-11-02).** You may
  challenge them only with concrete evidence that they break the owner's requirement or a
  canonical rule:
  1. The two-button notice is in the Day editor (desktop, phone, shared view); the label
     picker and "Change several days" answer through their existing reload flow.
  2. `default_category` is optional on the API; a client without it is not checked.
  3. Order: this review, then WP5-CALDEF-FIX (code and tests), then WP5-CALDEF-DOCS (docs
     after the fix, not beside it: the board allows one source writer), one freeze, one gate,
     one fresh opus audit.
- **State.** HEAD = origin/main = 5b2f287 (digest 4ac52e6b). Product source unchanged since
  the accepted a54061f. Uncommitted coordinator records under `handoff/`: leave them alone.

## Read

- `AGENTS.md` (rules 7, 8, 11, 14 and the UI standards), `docs/08` routing table.
- The plan: `handoff/delivery/tasks/WP5-CALDEF-PLAN.md` (Results) and
  `handoff/delivery/evidence/WP5-CALDEF-PLAN/plan.txt` (full plan with file:line citations).
- The risk sources: `handoff/delivery/WP5_UX5_REVIEW_INT2.md` (R-UX5I2-3),
  `handoff/delivery/WP5_UX5_REVIEW_INT3.md` ("An administrator's calendar change", cases E2,
  E3, E4) and the probe in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT3/`
  (`90-zz-int3-admin.spec.ts.txt`, `46-obs-int3-admin-target.txt`).
- `docs/02`, `docs/03`, `docs/04`, `docs/10` where they define the day entry, the category
  source, the calendar default, the version guard, the stale notice, FIX18's follow, FIX19's
  held branch, U4-05 and the batch.
- The code the plan cites, and anything it should have cited.

## Review (write the result in your Results and `evidence/WP5-CALDEF-PLAN-REVIEW/review.txt`)

1. **Claims.** Check every material claim of plan sections 1-2 against the code: what the
   client sends, what the server checks, how a default is derived (weekends, holidays, a
   work policy, an unassigned calendar, a date outside every calendar version), that the
   holiday import is the only runtime default change, and the list of write paths. Mark each
   claim confirmed or wrong, with file:line.
2. **Design.** Challenge design A, at least:
   - what exactly "the default the caller was shown" is for a day without an entry and for a
     default-sourced entry, and whether the client always knows it (phone sheet, shared
     view, a day opened from the picker, a day after a follow or a tab return);
   - the mount-time capture versus FIX18's follow and FIX19's held and restart branches:
     after each, which default must the form send so that a real change is caught and a
     stale one is never sent;
   - after "Use the new default": is the form dirty, what is saved, does the entry become
     explicit, and does the person still have to press Save; after "Save anyway": the exact
     resend, and what happens if the default changes again in between;
   - check order inside the transaction (reason rule, `stale_version`, `default_changed`),
     concurrency with a concurrent import, and the error shape compared with the existing
     409 answers;
   - batch preview and commit semantics, and whether the reload flow really gives the person
     the owner's two choices;
   - false notices: any path where the notice can appear without a real default change
     (time zones and accounting dates, AGENTS rule 7; a calendar version created for other
     dates; a no-change import);
   - accessibility and UI: role, focus, announcements, 44px targets, both themes, U4-05.
3. **Tests and mutants.** Is the plan's test list enough to prove both choices on every
   in-scope path and to kill M1-M15? Name missing cases and missing mutants.
4. **Documents and delivery.** Is the doc list complete (also the docs/12 release-notes entry,
   which the coordinator moved into WP5-CALDEF-DOCS)? Are the owned paths complete for the
   fix (any file the plan forgot)? Is the gate scope right?
5. **Verdict.** One of: "plan sound as written", "sound with corrections", or "redesign
   needed". List corrections as must-fix (the fix would be wrong or an audit would fail) and
   should-fix, each with file:line evidence. Then write an **amended plan section** the fix
   brief can use directly: the final contract, notice behaviour, check order, tests, mutants,
   owned paths. Raise an owner question only for a real contradiction, with a recommended
   answer.

## Rules

- Read-only on the repository. If you need a probe, run it in a scratch export or a
  temporary folder, never in the working tree; synthetic data only; ports 52050-52089; stop
  every process you start; never kill by PID a process you did not start.
- No deprecated APIs in what you propose.
- Do not edit the board, STATE or any shared record. Record executed commands with their
  exit codes; never invent evidence.

## Results

Self-reported model: claude-opus-5-5 (timesheet-planner role, fresh; not the plan's author). Full review with file:line evidence and the
amended plan section: `handoff/delivery/evidence/WP5-CALDEF-PLAN-REVIEW/review.txt`; commands with exit codes: `.../commands.txt`.
Read-only at HEAD 5b2f287: no server, build, test or probe was run; `git status` before and after the review matched (only this section
and the evidence folder were written).

**Verdict: sound with corrections.** Design A stands; the mount-time capture of the shown default is right for every branch (initial load,
FIX18 follow taken or kept, FIX19 same/held/restart, Reload day, refresh, epoch, own save). Claims of sections 1-2 confirmed (C1-C13, C19)
except: the audit "before Holiday" holds only for an update, a no-entry create has before = null (timesheetCommands.ts:377); the
picker/batch "reload flow" has no reload control on the preview path; `importHoliday` is not in fixtures.ts; `tests/e2e/day-editor.spec.ts`
cannot stay unmodified. Added fact: an import cannot take effect before the current period (calendars.ts:170-171).

**Must-fix.**
- MF1 Refuse only when `input.category` differs from the current default. Otherwise a person who already chose the new default, or who
  selects it after the notice, gets a notice whose two choices are identical; the form loops (it keeps sending the old captured default),
  and a picker pick of the new default on a stale cell is refused (timesheetCommands.ts:380-393, dayEntries.ts:123-133, DayFieldsForm.tsx:85).
- MF2 The picker always previews first; a `default_changed` preview opens the review dialog ("close and reload the period",
  BatchDialog.tsx:97-101), but closing it only clears the preview (TimesheetScreen.tsx:534-538) and "Reload period" exists only for a commit
  409 (:482-484, :766-772). Neither of the owner's choices is then reachable in the app. Closing a review dialog whose preview holds stale or
  `default_changed` entries must set the page's stale notice with those dates.
- MF3 Own `tests/e2e/day-editor.spec.ts`: :4936-4940 and :4953 assert exact label-pick batch bodies and break once `default_category` is added
  to the entries (only those assertions change; FIX18/FIX19/U4-05 stay unmodified).
- MF4 Delivery per coordinator decision 3: WP5-CALDEF-DOCS after the fix (not beside it), with D7 docs/12 EN/VI added.

**Should-fix (S1-S14, details in review.txt).** Batch commit order stale -> invalid -> reason -> default_changed -> conflicts; the preview
entry reuses the `error` slot and the dialog names the new default; "Use" status text says "nothing needs saving" when nothing else is
typed; "Use" re-read tightly specified (drawer and sheet, dayStamp guard, taken only if `fresh.category` equals the new default and the rest
is equal) and `onChanged()` so the sheet follows; the default notice closes on `stale_version`; "Save anyway" disabled while busy or the
reason is missing; focus to the Category select after "Save anyway"; "from none" text; the `.stale` box pattern (not `.editor-actions`);
I12 with the grantee on a second calendar, a rename case, leave-before-default order, a second change, a non-reporting device zone; the
docs/10 stale-client text corrected for no-entry days; the gate adds axe scans with the notice open, the INT2 E2 shape, stress sized for
per-test private servers and `earliest_effective_from` for the import date; the new spec carries its own `importHoliday`.
New mutants M16-M23.

**Owner question:** none. MF1 reads the owner's rule (both choices give the same category); docs/10 E-4 holds.

**Amended plan section** (contract, notice behaviour, check order, tests, mutants, owned paths, docs and gate) for the WP5-CALDEF-FIX brief:
review.txt section 6. Owned paths add `tests/e2e/day-editor.spec.ts` (two assertions), `tests/client/errors.test.ts` (new) and, only for
a `defaultChanged()` helper, `src/server/http/errors.ts`.

**Slips.** One: a single `ls ... | head -5` pipe (read-only, against the no-pipe-into-head rule), recorded in commands.txt.
