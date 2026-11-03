# Independent review: WP5-CALDEF-AUDIT (R-UX5I2-3, a calendar default that changed under an open editor)

- **Package, date, reviewer, model.** WP5, 2026-11-03. timesheet-auditor in a fresh context; self-reported model `claude-opus-5-5`,
  requested opus/xhigh (the effort is not observable). The strongest author model on the board is `claude-opus-5-5`
  (`01-author-models.txt`), so the auditor is not weaker than any author.
- **Reviewed commit and digest.** `reviewed_commit` = b810ba942c608e058bd8c146de6f076734c48bf2, the WP5-CALDEF-FIX2-FREEZE commit and
  the `freeze_commit` of WP5-CALDEF-REGATE. It is pushed: HEAD = origin/main = b810ba9 at the start and at the end, and no path outside
  `handoff/` differs between the target and HEAD. Source digest `59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a`
  (885 files), equal before and after in three forms: the clean export, `git ls-tree` (target and HEAD) and `npm run digest` in the
  repository. Every mandatory check ran in a clean `git archive` export of the target; probes and mutants ran in separate copies. The
  source is complete: `git status` outside `handoff/` was empty before and after.
- **Decision: PASS.** The owner's rule of R-UX5I2-3 holds on every path in scope, the server contract and the client stand up to my
  probes and mutants, the documents match the build except two Low documentation slips (F-CALDEF-1, F-CALDEF-2), and every mandatory
  check passed in a clean export. The two findings are documentation only: by AGENTS rule 14 they are fixed by one documentation
  review-and-fix with no gate or audit, and they do not change the product or block this acceptance. **R-UX5I2-3 is closed.** This PASS
  re-accepts WP5 on b810ba9 / 59e2ec3f and supersedes WP5-UX5-RECHECK-RN (PASS on a54061f / 690fd8fd) as the current acceptance.

## Scope actually inspected and executed

Read: the brief, AGENTS.md (from disk), document 08, the risk (INT2 R-UX5I2-3, INT3 "An administrator's calendar change"), the plan and
its review, the Results of the FIX, DOCS, SMOKE, GATE, DIAG1, FIX2 and REGATE tasks, and the full diff a54061f..b810ba9 outside `handoff/`:
14 source files, 8 test files, the smoke script and 6 document pairs of the round (plus the AGENTS and document 08 pairs of the
documentation-only commit 5b2f287). Every plan, report and gate result was treated as a claim; each claim used below was checked
against the code or rerun.

Run by me: the mandatory checks (section 9); 10 API probes in a clean copy under two process zones; 11 browser probes on private
servers (8 desktop, 3 phone), among them 24 axe-core 4.14.0 scans; the round's own e2e spec across an LA midnight and on the DST-end
day; `classic-scrollbar.spec.ts` at a left-dock and a right-dock instant; an independent proof of the smoke script over 70,080
instants; a clean-build `dist/` comparison with a54061f; and 12 mutants of my own (7 server, 5 client).

## 1. The owner's rule on every path

Rule (docs/10, owner decision 2026-11-02): a save never records a category over a calendar default that changed since the person was
shown it, unless the person chose "Save {category} anyway"; "Use {new default}" really takes the new default.

| Path | Evidence (suite = the round's tests; E/A = my probes) | Result |
|---|---|---|
| Day with no entry, desktop drawer | W3 both choices; E1 (the INT2 E2 shape: nothing typed, the tab comes back, no Check in); E5 | refused with the notice; "Use" leaves the day on the calendar (no row), "Save Worked anyway" records Worked; E1: after the tab return the held form still shows Worked (FIX18 keeps the held day), Save sends `default_category: "Worked"` and is refused |
| Default-sourced entry (a Check in or session created it) | W1, W2, W2b, W2c, W12-W15; E6, E8 | refused; both choices work; the entry and its version are untouched by the refusal (`dayOf` after the 409: version 1, notes empty) |
| Explicit entry | W6, I4, I11b | never refused, even with a stale `default_category` |
| Phone sheet | W8, W1-W3 and W7 on the phone project; E7 | the notice is in the sheet, focused and in view; the buttons are 44px; after "Use" focus is on Category and the status is in view |
| Shared edit view | W10 (Day editor, both choices), I12 (PUT on a second calendar); A3 (shared batch, the grantee on a second calendar); E3 (shared picker) | the owner's calendar decides; "Reload period" is offered in the shared view and the next pick saves for the owner |
| Label picker | W9a; E2 (a day with recorded work: the pick of Vacation is refused in the review, "Commit changes" disabled, Cancel offers "Reload period", the reloaded cell shows Holiday, the next pick opens the conflict step and saves Vacation) | refused with nothing written (the day stays Holiday by default); the second commit names `default_category: "Holiday"` with `confirm_conflicts` and records Vacation |
| "Change several days" | W9b, W9c (a commit racing the import) | refused with nothing written; the page notice offers "Reload period"; after it the batch commits |
| A second default change between the notice and "Save anyway" | W12; E6 (the change after "Use") | refused again, the notice names the newest default (Holiday to Shutdown) |
| The category saved equals the new default (MF1) | W13, I14, I8 | accepted, no notice |
| An import that is undone before the save | E5 (UI), A2 (API) | no notice, the save is accepted (no false refusal) |

**The coordinator's scope decisions keep the owner's intent.** The two-button notice is where a typed category and note are at stake
(the Day editor: drawer, phone sheet and shared edit view are one component, `DayFieldsForm`). For the picker and "Change several
days" the person is told in the review ("calendar default changed: The calendar default is now Holiday (was Worked)") and nothing is
written; "Reload period" is "use the new default" and a pick on the reloaded sheet is "save over it, now seen". Both of the owner's
choices are reachable in the app on every path I drove (W9a/W9b, E2, E3), and no path records a category over a changed default
without the person seeing it. The indirection (Cancel, Reload period, pick again; a batch must be reselected because Reload clears the
selection) is a usability cost, recorded as an owner-vetoable decision in docs/10; I do not count it as a defect. The optional field is
the one path where no notice applies, by the coordinator's decision: a caller that omits `default_category` is not checked (A5: PUT
and batch both 200, audited as a create with before = null). It is documented in docs/03, docs/10 and docs/12 as the accepted
residual risk.

## 2. The server contract

- **Field and body.** `default_category` is `dayCategory.nullable().optional()` in both strict schemas (`schemas.ts:91`, `:102`,
  `:123`); unknown values and extra keys are 422 (I8). The PUT 409 body is `{error: {code: "default_changed", message, details:
  {work_date, expected_default, current_default}}}` (`errors.ts:33-45`); exactly these three keys (I12's key check and A1's comparison
  of the whole details both kill my S6). The batch preview and commit details carry only `expected_default`/`current_default` and
  `work_dates`/`changes` (A3).
- **Rule.** `defaultChangeOf` (`timesheetCommands.ts:302-313`): refuse only when the field is present, the date has no entry or a
  default-sourced entry, the calendar classifies the date, the shown default differs from the default now, and the category saved
  differs from it too. Read correctly: a default-sourced entry's current default is the calendar's now, not its stored snapshot (my S5
  is killed by I2).
- **Check orders.** PUT (`applyDayEntryChange`, `:358-407`): imported 409 and reason 422 (`prepareEdit`), leave 422, `stale_version`,
  then `default_changed`, then the write. Batch preview per entry (`dayEntries.ts:121-137`): stale, invalid, default_changed, then
  create/update/unchanged; `can_commit` false (my S4 is killed by I9). Batch commit (`:206-244`, one IMMEDIATE transaction): stale,
  invalid, reason, default_changed (details `work_dates` and `changes`), conflicts, writes; all or nothing (I10, I15). The per-entry
  order "stale before default_changed" is not pinned by any test (my S1 survives; the visible effect is only which 409 code comes back,
  and the page handles both the same way).
- **Inside the write transaction.** `upsertDayEntry` loads the scope inside `writeTransaction` (`timesheetCommands.ts:451-452`) and the
  batch commit inside its own (`dayEntries.ts:208-209`); `commitHolidayImport` is IMMEDIATE too. better-sqlite3 runs each transaction
  synchronously, so in one server process a save and an import cannot interleave: A7 sent each save together with an import and every
  accepted save was audited before the calendar version. Moving the scope read out of the transaction (my S3) is not observable in one
  process; no run-time path in a second process changes a default (the CLI only bootstraps a calendar once).
- **Share route and no leak.** The shared mount sets `subject` to the owner (`routes/api.ts:59-68`); the PUT and the batch read the
  owner's scope. A3: the grantee on a second calendar is refused per the owner's calendar through the share, while the same grantee's
  own batch and PUT on its own calendar are accepted; the acknowledgement is a create for the owner, attributed to the grantee. A
  view-only grantee gets 403 `grant_scope` for preview and commit (A4). The details carry only the owner's own date and defaults.
- **A client that omits the field** (A5) overwrites a changed default, through the PUT and the batch, audited as a create with before =
  null. This is the residual risk the coordinator accepted (docs/10 "The `default_category` field is optional"); the shipped client
  always sends it (`sessionModel.ts:477`, `labelPickerModel.ts:45`, `dayModel.ts:122`).

## 3. The client

- **The default captured at mount** (`DayFieldsForm.tsx:70`, state, never the live prop) against every branch that changes the editor's
  day: FIX18's follow takes a fresh read only when `sameDayFields` holds, which compares the category, so a changed default (the category
  of a no-entry or default-sourced day) is never taken under a fresh version (W5, E1); FIX19's held branch keeps the old category and
  entry and the form keeps the old default, so the save is refused (W4a; the round's M10 kills the live-prop variant); FIX19's restart
  branch, "Reload day", a label or batch refresh and a period step all remount the form on a fresh read, so it captures the default it
  now shows (W4b, W14). I found no sequence that sends a stale default with a fresh version: every path that can put a held day back on
  screen without a fresh read (a failed reload read) follows a version change, so the version guard refuses first.
- **"Use {new}"** sends nothing, sets the category, rebases the baseline to the loaded fields with the new category (so a typed note
  stays an unsaved edit: W7b, E1; my C1 is killed), refreshes the page and reads the day once, taking it only when it shows the new
  default and the same other fields (W2, W14; my C2 is killed by W2's figures check).
- **"Save {category} anyway"** repeats the save with the current draft, the live version, the reason and the new default; it is
  disabled while busy and while the reason is missing (W16); the label follows the category in the form (my C4 is killed by W12).
- **Stale precedence.** A `stale_version` closes the default notice and shows "Reload day" (W15).
- **Focus and announcements.** The notice is `role="alert"`, takes focus and scrolls into view; Tab goes to "Use Holiday", then "Save
  Worked anyway"; Enter saves and focus lands on Category (E8); after "Use" focus is on Category on the desktop and the phone (W2, E7).
- **Targets and themes.** 44px on the phone (W8); text 4.5:1, the primary fill 3:1 and the focus ring 3:1 in the light and both dark
  sets (W11); my axe scans: 0 violations (section 7).
- **The page notice.** Closing a review with stale or default-changed dates sets the page notice with "Reload period" (W9a, W9b, E2,
  E3; my C6 is killed by W9b).
- **Observation (optional, R-CALDEF-1).** After "Use" with nothing else typed, the polite status "Category set to Holiday, the calendar
  default now. Nothing needs saving." stays on screen after the person types a note (E1); the form is then dirty and Escape still asks
  "Discard your changes?", so nothing is lost.

## 4. Time (AGENTS rule 7)

The check compares civil `work_date` values in the owner's calendar; no device or display zone enters (`calendarDefaultOn`,
`timesheets.ts:252-259`; the client sends the day's own `default_category`). Evidence: W17 under a device zone of Pacific/Auckland;
A6 at 2026-11-01T08:30Z and 09:30Z (01:30 PDT and PST on the DST-end day) and at 2026-11-03T07:59:59Z and 08:00:01Z (one second either
side of LA midnight), each refused and then acknowledged identically; the whole API probe file again under a process zone of
Pacific/Kiritimati (UTC+14) with the same observations; A1, an import effective from a later date, changes only the dates on and after
it (2026-09-21 saved, 2026-09-22 refused); the round's whole spec through the FIX10 wrapper from 2026-11-03T07:58:30Z (it crossed LA
midnight during the run) and at 2026-11-01T08:50Z (the DST-end day), both projects: 45 passed, 5 skipped, 0 failed each; and the
seven-file run at 2026-10-27T06:58:30Z (section 9).

## 5. Documents

Every new statement in docs/02 R-03, docs/03 "API and hosting boundary", docs/04 "Day editor" (the switching bullet and the new
"Changed calendar default" bullet), docs/04 toolbar and "Category in the cell", docs/06 AC-05, docs/10 (the owner decision, its scope
reading, MF1, the optional field, the audit statement) and docs/12 (the release-notes entry) matches the build as I read and drove it,
and each VI pair says the same. The docs/10 audit statement is accurate: an acknowledged overwrite of a default-sourced entry is an
update with before = the effective (new) default (I3), and an overwrite of a date with no entry is a create with before = null (I3, A3,
A5). Two documentation slips (F-CALDEF-1, F-CALDEF-2 below).

## 6. The smoke fix

`recentMonday(now)` now takes today's LA date and steps whole calendar dates back to the latest Monday strictly before it
(`scripts/smoke-built-server.mjs:104-113`); `git diff a54061f..b810ba9 -- scripts` changes nothing else. My proof reads the function
text from the script and compares it, every 15 minutes from 2026-01-01 to 2028-01-01 (70,080 instants, both DST changes of 2026 and
2027), with an oracle that walks back hour by hour and reads each LA date and weekday from Intl: 0 mismatches. The a54061f function
throws "No Monday found" at 2026-11-03T07:49Z (LA Monday 23:49 after the DST change), as WP5-CALDEF-SMOKE reported.

## 7. Regressions of rounds 4 and 5, axe, and the tests-only fix

- **What changed in the build.** My clean builds of a54061f and the target: `dist/server` 184 files, 10 differ (errors, schemas,
  dayEntries, timesheetCommands, timesheets and their maps); `dist/domain` 48 identical; `dist/client` the entry and five lazy chunks
  renamed, `index.html` naming them, four assets identical (one map differs in its source paths). The PDF, the mail and the send jobs, the holiday import (and its preview counts,
  F-2 b) and the sharing guard are byte-identical, so their accepted behaviour stands.
- **The Day editor, the picker and batch, shared views.** The real-clock FULL run (both projects, 0 failed) includes the FIX18, FIX19,
  U4-05, session and break tests, the picker and batch tests, `sharing.spec.ts` and `calendar-default.spec.ts`.
- **axe-core 4.14.0** (SHA-256 of `axe.min.js` 20c09fe1…e878, the copy of earlier audits), WCAG 2.0-2.2 A and AA, light and dark: the
  notice open in the drawer beside (1440) and floating (1280) and in the phone sheet (390), after "Use", the review dialog showing
  "calendar default changed" and the page notice with "Reload period": 24 scans, 0 violations; incomplete only
  `color-contrast` (and `label-content-name-mismatch` where the page's sheet is in the scan), as in every earlier gate; W11 measures the
  contrast directly. The scans also log focus: on the notice when it opens, on Category after "Use", on Cancel in the review dialog and
  on the day's picker after the review closes.
- **WP5-CALDEF-FIX2 (tests only).** I agree with DIAG1: it was a test assumption. docs/04 docks the floating drawer away from the edited
  column, so for a Monday-Wednesday `days[0]` the drawer covers the right end of the card and the old press point (`box.right - 60`)
  landed on the drawer's note field; a press inside the drawer is a press on the drawer, not on the card's scrollbar, and must not
  scroll the card. A press on the visible part of the card's own scrollbar beside the drawer is handled as a scrollbar press
  (`onOwnScrollbar`, `TimesheetScreen.tsx:73`, `:635`); the patched test proves it on both dock sides: right dock in my real-clock
  FULL run (2026-11-03, `days[0]` Monday) and at 2026-11-04T18:00Z, left dock at 2026-11-06T18:00Z, the whole spec 3 passed each time.
  The diff (+11/-3) changes only the press point and adds one precondition (`elementFromPoint` lands on the week card); the drag,
  `scrolled() > 0`, the drawer still open and the plain-page close are unchanged; no sleep, timeout or skip. No other e2e test computes a press point on the sheet; every other reader of
  `data-side` branches on it, and `day-editor.spec.ts:5390` opens the first (Monday) column explicitly, so it does not depend on the date.

## 8. Test strength: my own mutants

Each mutant was applied to `export-mut` (each replacement matched exactly once; `mutate.mjs.txt`), and restored byte-equal to the
clean export after its runs (`50-mut-apply.txt`). Server mutants ran against the whole `npm test` (103 files) and my API probe file;
those the unit and integration suite let through were rebuilt and run against `calendar-default.spec.ts` on the desktop project
(S2 with `sharing.spec.ts` too; S7 also against my picker probe E2). Client mutants were rebuilt and run against
`calendar-default.spec.ts` on both projects. After the last restore, `src/`, `tests/` and `scripts/` of `export-mut` equal the clean
export and its rebuilt `dist/` equals the target build (`53-mut-restored.txt`).

| Mutant | What it breaks | The round's suite | My probes | Reading |
|---|---|---|---|---|
| S1 | a batch entry is checked for a changed default before its version | survives (`npm test` 2,425 passed; e2e 24 passed) | survives | test gap on a documented order; low impact (both 409 codes lead to "Reload period") |
| S2 | the batch reads the actor's scope, so a shared batch checks the grantee's calendar | killed, but not for the default: three sharing tests (`actor-subject`, `history`, `sharing`) fail on a 409 `conflict` from the actor's timesheet lookup; the round's own tests and the e2e specs pass | killed for the right reason by A3 (`can_commit` true where the owner's calendar refuses) | no test of the round pins the shared batch on another calendar; worth adding A3 |
| S3 | PUT reads the scope before the IMMEDIATE transaction | survives everything | survives (A7 cannot see it) | equivalent in one process (synchronous handler); recorded, no action |
| S4 | the preview's `can_commit` ignores default_changed | killed by I9 (`can_commit` expected false) | killed by A3 | right reason |
| S5 | a default-sourced entry's current default is its stored snapshot | killed by I2 (no 409) and I5 | survives (my probes use dates without an entry) | right reason |
| S6 | the PUT 409 details carry one more key | killed by I12 (the exact key list) | killed by A1 (`toEqual` of the details) | right reason |
| S7 | a batch entry with an existing default-sourced entry is not checked | survives (`npm test` 2,425 passed; e2e 24 passed: I9, I10, I15, W9a and W9b all use dates without an entry) | survives the API probe; killed by E2 for the right reason (the review shows "Worked to Vacation, category change" with "Review conflicts", so the person would confirm a conflict and record Vacation over the new Holiday without being told) | test gap on a real path: the picker or batch on a day with a Check in or a session |
| C1 | "Use" rebases the baseline to the whole draft (a typed note stops counting as unsaved) | killed by W7b (no "Discard your changes?") and W2 (the status says nothing needs saving), both projects | - | right reason (U4-05 pinned) |
| C2 | after "Use" the editor never takes the fresh day | killed by W2 on the desktop (the figures do not follow the holiday); the phone has no figures, so W2 passes there | - | right reason |
| C4 | the "Save … anyway" label names the old default | killed by W12 on both projects (after the second change the button reads "Save Holiday anyway", so "Save Worked anyway" is never found and the test times out) | - | right reason, through a timeout rather than a direct assertion |
| C5 | "Use {new}" stays enabled while a save is in flight | survives (45 passed, 5 skipped) | - | test gap, low impact: a "Use" pressed during a "Save anyway" in flight leaves the form showing the new default over a saved category, with the form dirty, so nothing is lost silently |
| C6 | closing a review offers "Reload period" only for a label pick | killed by W9b on both projects ("Reload period" not offered after "Change several days") | - | right reason |

## 9. Mandatory checks (clean export of the target, one after another, alone on the host)

| Command | Result / exit | Evidence |
|---|---|---|
| `npm ci` | 0 | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | 0 / 0, no warning or deprecation line | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 103 files, 2,425 tests (40.2 s) | `03-npmtest.txt` |
| `npm run build` | 0, no chunk-size advisory | `03-build.txt` |
| real-clock FULL e2e, both projects, `--workers=6` (2026-11-03, 12:59:38-13:08:40Z; `days[0]` Monday 2026-11-02, the floating drawer docks right) | exit 0: desktop 508 passed / 37 skipped / 0 failed, mobile 429 / 116 / 0; no flaky; no deprecation line | `04-e2e-full-real.txt`, `04-e2e-counts.txt` |
| AC-13 under Pacific/Chatham (`TZPROBE` offset -825, UTC+13:45) | 0: 1/1 | `05-ac13-pacific-chatham.txt` |
| seven files at 2026-10-27T06:58:30Z, FIX10 wrapper (byte-equal to the FIX10 file), `--workers=6` | exit 0: desktop 234 / 16 / 0, mobile 166 / 84 / 0 (400 passed, 5.7 min); the desktop crossing test `today.spec.ts:627` took 1.2 min (it crossed) | `08-seven-1027.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

The counts equal the regate's. No run failed, so no network or buffer rerun and no load classification was needed. Host census at
entry 1.00 and 1.09 busy cores of 32, after the FULL run 0.56, after the seven files 1.00 (`10-census-*.txt`). The only warning lines in
the e2e logs are Node's notice that `NO_COLOR` is ignored because `FORCE_COLOR` is set.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| identity: `git rev-parse HEAD origin/main`, `git status -- . ':!handoff'`, the digest in three forms, before and after | b810ba9 both; empty; 59e2ec3f… 885 files in every form | `00-*`, `01-digest-*` |
| `git diff --check a54061f..b810ba9 -- . ':!handoff'`; name-status | 0; 39 paths (the round's 34 and FIX2's one, plus the 4 workflow documents of 5b2f287) | `20-*`, `21-*`, `22-*` |
| clean builds of a54061f and the target, `distcmp.mjs` | `dist/server` 10 of 184 differ (5 modules and maps), `dist/domain` 48 identical, client entry and 5 lazy chunks renamed | `45-*` |
| API probes (vitest, 10 tests), host zone and Pacific/Kiritimati | 0: 10/10 twice, the same observations | `40-*` |
| browser probes (11 executed of 18; private servers) | first run 8 passed, 3 failed on my probe mistakes (`99-slips.txt`); after the fix E2 and desktop E4 3/3 | `41-*` |
| `classic-scrollbar.spec.ts` at 2026-11-06T18:00Z and 2026-11-04T18:00Z (desktop) | 3/3 and 3/3 | `42-*` |
| `calendar-default.spec.ts` from 2026-11-03T07:58:30Z and at 2026-11-01T08:50Z (both projects) | 45 passed / 5 skipped / 0 failed each | `43-*`, `44-probe-counts.txt` |
| smoke proof (70,080 instants) | target 0 mismatches; a54061f throws at 2026-11-03T07:49Z | `60-*` |
| 12 mutants | 7 killed by the round's suite for the right reason (S4, S5, S6, C1, C2, C4, C6); S2 killed through a side effect (right reason only by A3); S7 killed only by my E2; S1 and C5 survive; S3 equivalent; all restored | `50-*` to `53-*` |

## Findings

- **F-CALDEF-1 (Low, documentation).** `docs/03_ARCHITECTURE_AND_DATA.md:24` and `docs/03_ARCHITECTURE_AND_DATA.vi.md:24`, the
  `timesheets/day_entries` row of the data table. Reproduction: `git diff a54061f..b810ba9 -- docs/03_ARCHITECTURE_AND_DATA.md` (or read
  line 24). Actual: WP5-CALDEF-DOCS replaced the end of the row instead of appending to it; the row lost "notes, confirmation, optimistic
  version" (VI "ghi chú, xác nhận, phiên bản chống sửa đè") and now reads "(… no OT-leave day category), , category source (…)" (VI "…),
  , nguồn loại ngày (…)"). Expected: the three facts kept and the category source added after them with one comma, in both languages
  (the round changed none of them; `day_entries` still has `notes` and the optimistic `version`). Rule: docs/03
  is the canonical data contract; AGENTS "keep translations aligned". Bounded fix: one documentation review-and-fix of the two lines
  (AGENTS rule 14: no gate or audit); no product change. The gate's documents check did not catch it.
- **F-CALDEF-2 (Low, documentation parity).** `docs/12_RELEASE_NOTES.vi.md:63`, in the Vietnamese release-notes entry of this round,
  links the English text "WP5 handoff" to the English file `WP5_HANDOFF.md`, where lines 7 and 19 of the same file link "bàn giao WP5"
  to `WP5_HANDOFF.vi.md`. The link resolves, so the preflight passes. Expected: the Vietnamese text and the Vietnamese handoff. Bounded
  fix: the same documentation task.

No product defect was proven: every path of the owner's rule behaves as specified, the server contract and the client hold under my
probes, and the mandatory checks pass.

## Risks and optional improvements (not proven defects)

New, from this audit:
- **R-CALDEF-1, a stale status line after "Use".** After "Use {new}" with nothing else typed, "… Nothing needs saving." stays on screen
  when the person then types a note (E1); the unsaved-changes guard still asks. Optional: clear the status on the next edit
  (`DayFieldsForm.tsx:157-161`, `:248-252`).
- **R-CALDEF-2, test strength of the round** (section 8). The product was right in every probe, so these are test gaps only: S7 (the
  picker or batch on a day with a Check in or a session is never checked against a changed default by the round's tests; my E2 catches
  it), S2 (a shared batch with the grantee on another calendar; caught by older sharing tests only through a side effect, for the
  right reason by my A3), S1 (the per-entry order "stale before default_changed" is unpinned) and C5 ("Use" is not checked to be disabled while a save is
  in flight). Optional: add E2 and
  A3 (sources `zz-audit-caldef.spec.ts.txt`, `zz-audit-caldef.test.ts.txt`) to `calendar-default.spec.ts` and
  `calendar-default-change.test.ts`, and one preview entry that is both stale and default-changed.
- **R-CALDEF-3, the picker and the batch answer in three steps** (Cancel, "Reload period", pick or reselect again). By the coordinator's
  vetoable decision (docs/10); a one-step "Save anyway" for the picker is a follow-up only if the owner wants it.
- **R-CALDEF-4, the optional field** (accepted residual risk, docs/10): an old tab or a script that omits `default_category` overwrites a
  changed default without a notice (A5). Making it required later would fail closed.
- **The secondary-button boundary** (WP5-CALDEF-FIX open point): the "Use {new}" button, like every `button.secondary` of the app, draws
  its boundary at 2.05:1 against the light surface (below the 3:1 AGENTS asks for a component boundary; its text is 4.5:1 and the shared
  focus ring 3:1, W11). An app-wide design question for the owner, not introduced here.
- **F2 harness port race, updated.** `tests/e2e/fixtures.ts:60-69` `freePort()` closes its probe before migrate and seed run
  (`spawnSync`, `:72`) and the server starts on the number; `:76-88` `waitUntilHealthy` accepts any healthy `/api/health` on that origin,
  so under many workers a test can sign in to another test's server and get a seed sign-in 401. Seen twice (WP5-UX5-DIAG2,
  WP5-CALDEF-GATE stress), never reproduced; none of my e2e runs hit it (the FULL run, the seven files and 16 smaller runs, most on
  private servers). Backlog: a lock-file claim of the port in `freePort()` (DIAG1 section 6), with its own forced-collision proof.

Carried from WP5_UX5_REVIEW_INT3 and WP5_UX5_RECHECK_RN, status at this target:
- R-UX5I2-3: **closed** by this round (owner decision built; see "Disposition").
- R-UX5I3-1 (one rule for the follow and the session write when nothing is typed), R-UX5I3-2 (the quiet held branch), R-UX5I3-3 (focus
  after "Save day fields" and "Reload day"; the new "Save anyway" moves focus to Category, the old Save still does not), R-UX5I3-4 (test
  strength of FIX19): unchanged.
- R-UX5RN2-1 (docs/12:7 left DEVELOPMENT out): resolved by 5b2f287, which rewrote docs/12:7 for the release rule and names DEVELOPMENT.
  R-UX5RN2-2 and R-UX5RN2-3 (wording in docs/11:34 and docs/10): unchanged.
- The optional backlog of INT3 (items 1 to 7) otherwise unchanged: test strength A and B, docs and comments, product hardening (R1, R2,
  DIAG5's 8 px jump, R-UX5B2-1, -2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3, 4, 9, R-UX5I3-1, -2, -3), pilot device checks (NOT
  VERIFIED here), process and harness (R-A2-5, R-UX5I-3, R-UX5B-2, R-UX5B-4, R-UX4B-6, the crossing test's mobile branch, F2 above), and
  the coordinator decisions the owner was informed of (now with the R-UX5I2-3 scope reading and the optional field).

## Required gates unrun or blocked

None of the mandatory checks was skipped and none needed a rerun. Not run by me, by the brief's scope (carried from WP5-CALDEF-GATE on
300d61f with WP5-CALDEF-REGATE's identical `dist/`): the container drill (209/0), `npm audit --omit=dev`, the five other sweeps, the
round's 36 mutants and the stress runs. NAS items stay NOT VERIFIED.

## Disposition of previous findings

- **R-UX5I2-3: closed.** The owner's answer is built as decided: a changed default is shown and the person chooses on the Day editor
  paths; the picker and batch refuse and offer "Reload period" (coordinator scope reading, recorded in docs/10, vetoable by the owner);
  the omitted-field residual risk is documented.
- WP5-CALDEF-GATE F1 (`classic-scrollbar.spec.ts:143` on 2026-11-03): closed by FIX2, a test assumption (section 7); F2: a harness risk in
  the backlog.
- Every disposition of WP5_UX5_REVIEW_INT3 and WP5_UX5_RECHECK_RN stands.
- This PASS re-accepts WP5 after the R-UX5I2-3 round and supersedes WP5-UX5-RECHECK-RN (PASS on a54061f / 690fd8fd) as the current
  acceptance, at b810ba9 / 59e2ec3f.

## Software readiness, owner permission and pilot result

Software readiness of WP1 to WP5 is re-established at b810ba9 / 59e2ec3f (885 files) by this audit and WP5-CALDEF-REGATE (PASS, scoped,
carrying WP5-CALDEF-GATE's drill and other items on an identical `dist/`), with the NAS NOT VERIFIED. Owner permission: not requested
or given. Pilot result: none; the NAS is NOT VERIFIED. Nothing was deployed or sent: local private servers and local mail capture only,
synthetic `example.invalid` people.

## One next action

The WP5 re-accept on b810ba9 / 59e2ec3f (this PASS on the board, with `superseded_by` on WP5-UX5-RECHECK-RN), followed by one
documentation review-and-fix under AGENTS rule 14 for F-CALDEF-1 and F-CALDEF-2 (docs/03:24 EN and VI, docs/12.vi:63) together with the
WP5 handoff entry for this round that docs/12:63 points to.

## Independent subagent provenance

- **Review task, reviewer and authors.** WP5-CALDEF-AUDIT, attempt 1; reviewer agent `a4507aa2a7bba058d` (board). Authors of the
  reviewed round (board): WP5-CALDEF-PLAN `a5afcd9de38696b00`, -PLAN-REVIEW `aa5a99f7dc14c0b64`, -FIX `a2000d9193fe2d52a`, -DOCS
  `af035e5d4c8a20bef`, -SMOKE `a521700b2f94d665b`, -EVID `a855720586ac3ace9`, -DIAG1 `ab3e2c406e060a4e0`, -FIX2 `a9debfeca228aed5a`;
  committers -FREEZE `a92aef03b69a4f40e` and -FIX2-FREEZE `ae42fa75e6e1894da`; gates -GATE `ab46316f7e717fa2e` and -REGATE
  `adcebe049815453ba`; on top of the WP5-UX4 and WP5-UX5 authors of the product.
- **Fresh context.** I wrote none of the reviewed changes and no WP5-CALDEF task or audit. I changed nothing outside this review pair,
  the brief's Results and the evidence folder, and staged or committed nothing.
- **Digest.** 59e2ec3f…0770a (885 files) before and after in every form. Gate evidence for this snapshot: WP5-CALDEF-REGATE PASS.
- **Report path.** `handoff/delivery/WP5_CALDEF_REVIEW.md` (+ `.vi.md`); every earlier review is untouched.
- **Finding dispositions and the next coordinator task.** F-CALDEF-1 and F-CALDEF-2 are open documentation findings (rule 14, no gate or
  audit); no product fix is needed. Next: the re-accept and the documentation task in "One next action".
