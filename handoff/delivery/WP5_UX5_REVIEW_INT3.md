# WP5 UI change rounds 4 and 5, integration recheck after FIX19 on 0b45781 (WP5-UX5-AUDIT-INT3)

[Tiếng Việt](WP5_UX5_REVIEW_INT3.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5, owner-requested UI change rounds 4 and 5, the integration recheck whose PASS
  re-accepts WP5 and supersedes RECHECK-A2 and RECHECK-B3 as the current acceptance; task WP5-UX5-AUDIT-INT3, attempt 1, 2026-10-29 from
  16:15:33Z to about 17:35Z. Reviewer self-reported model `claude-opus-5-5` (board agent `a89b2f7f5fa303382`), profile timesheet-auditor
  (effort set by the profile, not observable from inside). The author models on the board are `claude-opus-5-5`, `claude-sonnet-5-5` and one
  `claude-haiku-4-5-20251001`; the strongest is `claude-opus-5-5`, and FIX18, FIX19, their freezes and REGATE13 and REGATE14 are
  `claude-sonnet-5-5`, so the reviewer is not weaker. My agent id appears on the board only on this task: I authored no WP5-UX4 or WP5-UX5
  task and none of their audits.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `0b457817ed29806a36fdd78cc22ac84a0cc2db9d` (WP5-UX5-FIX19-FREEZE, pushed; WP5-UX5-REGATE14's `freeze_commit`). HEAD = origin/main = that
  commit before and after; no status line outside `handoff/` before or after. Digest
  `67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b`, 882 files, `handoff/` excluded, equal at 16:16:38Z and 17:13:45Z
  in every form: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form of the target and of HEAD
  (the sorted lists byte-identical), and `npm run digest` both in the repository and in a clean scratch clone of the target. No unpushed
  commit. Source complete: `npm ci` exit 0 in four exports. The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest
  507de97c); 224 paths differ outside `handoff/` between it and the target.
- **Decision: PASS.** Both findings of AUDIT-INT2 are closed.
  - F-UX5I2-1: after a session save, a "Confirm breaks", an Add session or a delete in the open Day editor, a later "Save day fields" no
    longer overwrites day fields changed elsewhere, on the desktop drawer, the phone sheet and a shared edit view. With nothing typed the
    form shows the server's fields; with an unsaved edit the save is refused and "Reload day" reads the change (sections 1 and 3).
    AUDIT-INT2's G1 and G2 now keep the other device's change, and 21 of my 27 own cases fail on d96df5d and pass on the target.
  - F-UX5I2-2: `npm run digest` works in a clean clone and in the repository and agrees with the export and `git ls-tree` forms (section 2).

  FIX18's follow and FIX19's session-write path agree in every sequence I could build (section 3). No regression (section 4; axe-core
  4.14.0, 30 scans, 0 violations). The integration verdicts of AUDIT-INT and AUDIT-INT2 carry over the FIX19 diff (section 5). Of my twelve mutants, the suite kills
  seven at the assertion that names the rule, four survive the suite and fail only my probes, and the digest-script mutant fails only when
  the script is run (section 6). Every mandatory check passes (section 7). No new finding. New optional risks R-UX5I3-1..4, among them a focus loss after "Save day
  fields" and "Reload day" that predates rounds 4 and 5 (R-UX5I3-3); R-UX5I2-3 is updated with its session-write case.

## Scope actually inspected and executed

1. Read as claims, not proof: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); `WP5_UX5_REVIEW_INT.md` and
   `WP5_UX5_REVIEW_INT2.md` (+ VI), with AUDIT-INT2's probes and evidence; FIX19's and REGATE14's briefs, Results and evidence (mutant
   records, `zz-fix19-mutants-recorded.txt`, `99-slips.txt`); `WP5_UX5_RECHECK_A2.md` and `WP5_UX5_RECHECK_B3.md`; docs/03 (the version
   rules, :24 and :40), docs/04 (:69, :71, :75) and docs/12 (:7), EN and VI; the board entries of this task, FIX18, AUDIT-INT2, FIX19,
   FIX19-FREEZE and REGATE14, and the author models.
2. Code: the FIX19 diff (`git diff d96df5d..0b45781`, five paths, +359/-4); `DayEditor.tsx` in full; `DayFieldsForm.tsx` (unchanged: the
   draft seeded once per mount :51-53, the layout-effect dirty report :57-59, the version sent :85, the Save button disabled while busy
   :104-108); `SessionDialog.tsx:543-553` (one write path for Add session, Edit and "Confirm breaks"); `SessionList.tsx` (button names);
   `ClockProvider.tsx:99-121` and `TimesheetScreen.tsx:307-316` (the one clock version and the follow counter); the server's
   `applyDayEntryChange` (`timesheetCommands.ts:328-395`) and `resolveDayCategory` (`domain/attendance.ts:49-55`);
   `scripts/source-digest.mjs`; `git blame` of the stale notice, `reload()` and the Save button (`23-blame-*.txt`).
3. Mandatory checks in a clean `git archive` export of the target with its own `npm ci` (`export`), one after another and alone on the host,
   with a census before and after each e2e run.
4. Own probes in a second export of the target (`export-probe`, own `npm ci` and build; only my `zz-int3-*.spec.ts` files and AUDIT-INT2's
   `zz-int2-follow.spec.ts` added) and the same probes in an export of d96df5d (`export-prev-probe`), to tell FIX19's behaviour from FIX18's.
5. Own mutants in a third export (`export-mut`), each restored byte-equal; the digest-script mutant in the clean clone.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT3/` (index `00-README.txt`); probe, mutant and script sources
are kept as `90-*.txt`; my rule slips are in `99-slips.txt`.

| Command or probe | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest (export, ls-tree, `npm run digest` in the repository and a clean clone), first and last | 0b45781 = origin/main; no line; `67aa715c…c42b`, 882 files, at 16:16:38Z and 17:13:45Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt`, `01-digest-npm-*.txt` |
| FIX19 diff and scope | exactly FIX19's five paths; nothing in `src/server`, `src/domain`, `src/client/components`, styles, fixtures or package files; nothing between the target and HEAD | `20-*`, `22-fix19-*.txt` |
| clean builds of d96df5d and the target | `dist/server` and `dist/domain` identical (232 files); `dist/client`: `index.html`, the entry chunk and five lazy chunks renamed (equal once names are normalised); CSS and `jsx-runtime` identical | `41-dist-compare.txt`, `41-dist-client-normcmp.txt` |
| mandatory checks (section 7) | all exit 0; FULL 484/36/0 and 408/112/0; seven-file 400 passed, 0 failed; AC-13 1/1 | `03-*`, `04-*`, `05-*`, `08-*` |
| my session-write probe (27 tests), target | 27 passed (desktop 25, phone 2); outcomes in sections 1 and 3 | `45-obs-int3-target.txt`, `48-log-int3-target.txt` |
| the same probe on d96df5d | 6 passed, 21 failed: every case FIX19 changes fails there, the 6 others pass on both | `45-obs-int3-prev.txt`, `48-log-int3-prev.txt` |
| AUDIT-INT2's follow probe (A-P with G1 and G2), unchanged, target | 19 passed; G1 and G2 now "kept" | `44-obs-int2-follow-target.txt`, `48-log-int2-target.txt` |
| AUDIT-INT2's G1 and G2 on d96df5d | both "OVERWRITTEN" (F-UX5I2-1 reproduced on the base) | `44-obs-int2-follow-prev-G.txt`, `48-log-int2-prev-G.txt` |
| an administrator's holiday on a default-source day, then a delete in the editor (E3 typed, E4 nothing typed), target and d96df5d | target: E3 accepted (Worked recorded over the new Holiday default), E4 restarts on Holiday; d96df5d: both record Worked | `46-obs-int3-admin-*.txt` |
| axe-core 4.14.0 (npm registry into the task folder; SHA-256 equal to REGATE14's and AUDIT-INT2's copies) | 30 scans, 0 violations | `47-axe-source.txt`, `47-axe-lines.txt` |
| own mutants MY1-MY12 | 7 of the 11 `DayEditor.tsx` mutants fail the suite at the assertion that names the rule; MY2, MY3, MY5 and MY8 survive the suite and the six spec files (212 passed each) and fail my probe; MY10 is caught only by running the script; all restored byte-equal, the rebuilt `dist/` equals the target's | `50-*`, `52-*` |
| census before and after each run | 0.87-3.70 busy cores of 32 | `10-census-*.txt` |

## 1. F-UX5I2-1: a session write in the open Day editor and day fields changed elsewhere

**Closed.** FIX19 routes the editor's session writes through `sessionWritten()` (`DayEditor.tsx:321-331`): the session dialog's save
(`:606-609`; `SessionDialog.tsx:545-549` is the one write path for Add session, Edit and "Confirm breaks") and the delete (`:369-371`). It
judges the answer against the day held at the latest render (`heldDay`, `:174-175`) and the day fields form's own dirty report
(`fieldsDirtyRef`, `:176`, `:294`):
- the answer's day fields equal the held ones (`sameDayFields`, FIX18's comparison): take the answer; the form keeps what was typed;
- they differ and nothing is typed: take the answer and restart the form (`generation` + 1);
- they differ and a field holds an unsaved edit: `withHeldDayFields()` (`:49-59`) takes the answer's sessions and figures but keeps the
  held category, category source, leave minutes and kind, WFH and entry (its notes and version), so the form's save carries the held
  version. The server refuses it (`timesheetCommands.ts:340-341` when the held day had no entry, `:380` otherwise), so this branch can only
  end in the stale notice.

`DayFieldsForm.tsx`, the follow, `saved()`, `stale()` and `reload()` are unchanged.

**AUDIT-INT2's G1 and G2**, run unchanged: on the target both end "the elsewhere change kept"; the form shows the other device's note
and WFH after the session save and the delete, and "Save day fields" is accepted without overwriting (`44-obs-int2-follow-target.txt`).
On d96df5d both end "OVERWRITTEN" (`44-obs-int2-follow-prev-G.txt`).

**My cases** (`zz-int3-session.spec.ts`, a synthetic person of its own per test, a past workday of the displayed period unless "today"; the
other device writes through the API after the editor loaded the day). Target and d96df5d:

| Case | Write and what changed elsewhere | Target | d96df5d |
|---|---|---|---|
| S1 | "Confirm breaks", nothing typed; notes and WFH | the form restarts on the other device's note and WFH; save accepted, both kept; focus on "Times" | old note shown; save overwrites |
| S2 (1280 floating) | "Confirm breaks", typed note; notes and WFH | note kept; no notice yet; save refused ("Nothing was saved"), both kept; "Reload day" shows them and the confirmed breaks | save accepted, overwrites |
| S3 | delete, typed note; partial leave 1:00 vacation | note kept; refused; the leave kept; "Reload day" shows "1:00 vacation" | the leave overwritten to none |
| S4 | session save, WFH ticked; notes | WFH stays ticked; refused; the notes kept | notes overwritten |
| S5 | session save, category set to Vacation; WFH | Vacation stays; refused; WFH kept, category stays Worked | WFH overwritten |
| S6 | session save, a note typed and typed back (no unsaved edit); notes and WFH | the form restarts; save accepted, both kept | the old note stays in the form (the case stops there) |
| S7 | Add session on a day without an entry, typed note; nothing | the entry the write creates is taken (same fields); the note saves | same (passes on both) |
| S8a / S8b | Add session; the other device created the entry with a note; typed / nothing typed | S8a refused (the held entry is none, so the save sends no version); S8b the form shows the note, save keeps it | both overwrite |
| S9 | session save, typed note; only the category source (same category saved explicitly) | refused, conservatively (the entry version moved) | accepted |
| S10 | own "Save day fields", then a new note and a session save; nothing | the new note stays and saves (no false refusal) | same |
| P1 (phone sheet) | session save, nothing typed; notes and WFH | restart; the save from the foot keeps both | the old fields stay in the form (the case stops there) |
| P2 (phone sheet) | delete, typed note; notes and WFH | note kept; refused; "Reload day" shows the change | overwrites |
| H1 / H2 (shared edit view) | the grantee saves a session; the owner changed notes and WFH on another device; nothing typed / typed | H1 restart, save keeps the owner's change; H2 refused, "Reload day" shows it | both overwrite |

Both branches the brief names hold: with no unsaved edit the form shows the server's fields (S1, S6, S8b, P1, H1, G1, G2); with an unsaved
edit the save is refused and "Reload day" reads the change (S2, S3, S4, S5, S8a, P2, H2, FIX19's G3).

**The stale notice and focus** (S2, P2 and the axe probe, every width and scheme):
- After the session write the editor shows "Session saved." (polite status) and focus is on the "Times" heading (docs/04:75); in the held
  branch no stale notice is shown yet. FIX19 chose this on purpose: the notice says "Nothing was saved", which would be false next to
  "Session saved.", and docs/04:69 (VI :70) now says the held edit's save is refused and "Reload day" reads the change. Nothing is lost
  silently; the person learns of the change at the save (R-UX5I3-2).
- The refused save shows the existing stale alert (`role="alert"`, "This day changed since it was loaded. Nothing was saved. Reload the
  day ...", with "Reload day") and keeps the typed values in the form.
- Focus after the refused save and after "Reload day" is on the document body, on the drawer and on the phone sheet. Cause: the Save button
  is disabled while the save is busy (`DayFieldsForm.tsx:105`), so the browser drops focus from it, and "Reload day" removes its own button
  with the notice. Both predate rounds 4 and 5 and FIX19: the busy-disabled button and `reload()` come from WP2-T10 (26fa7c9f,
  `23-blame-*.txt`), the accepted 8e55710 has the same button and the same non-modal drawer, and the same body focus follows an accepted save
  on d96df5d (`45-obs-int3-prev.txt`, S2). Recorded as R-UX5I3-3; the alert itself is announced.

## 2. F-UX5I2-2: `npm run digest`

**Closed.** `scripts/source-digest.mjs:13-16` now gives the first `execFileSync` (`git ls-files --cached --others --exclude-standard -z`) a
`maxBuffer` of 64 MiB, like the second; nothing else in the script changed (`22-fix19-src-scripts-diff.txt`).
- In a clean scratch clone of the target (0 status lines) `npm run digest` exits 0 and prints `67aa715c…c42b  (882 files, handoff/
  excluded)`; in the repository (tracked plus untracked, `handoff/` excluded) the same, before and after. Both equal the export form and the
  `git ls-tree` form of the target and of HEAD, and the export list is byte-identical to the ls-tree list (`01-digest-before.txt`,
  `01-digest-after.txt`).
- The list the script reads is now 1,092,799 bytes in the clean clone and 1,107,448 bytes in the repository, over Node's 1,048,576-byte
  default; 64 MiB leaves about 60 times that.
- My mutant MY10 (the first `maxBuffer` set back to 1 MiB in the clean clone): exit 1, `spawnSync git ENOBUFS`; restored byte-equal, exit 0
  with the same digest (`50-mut-MY10-digest.txt`). No test or config names the script, so only running it proves it; docs/12:7 (VI :7)
  makes that run a release step.

## 3. FIX18 and FIX19 together

**The follow on the page's Check in and Check out and on a tab return** (FIX18, unchanged by FIX19): AUDIT-INT2's probe, rerun unchanged on
the target, passes as on d96df5d: at 1440px (beside) and 1280px (floating) the drawer follows Check in (from the keyboard) and Check out with
one read each, keeps the typed note and WFH, asks nothing, leaves focus on the page's clock button and saves the note (A); the guard still
asks after a follow (A, H). The guards hold: the field guard refuses a change of notes, WFH, partial leave or category made elsewhere
before a tab return (B, and FIX19's five B tests); another tab (D) and a grantee's share session (C) before the page's Check in are refused;
an open delete confirmation keeps the version it loaded (N, 409); a follow read overtaken by the editor's own save is dropped (O); the phone
sheet sends no follow read (K); a shared view has no clock and no follow (L). docs/04:69 now names the tab return.

**Trying to make the two paths disagree** (target; d96df5d in brackets):

| Case | Sequence | Target |
|---|---|---|
| X1 | change elsewhere, nothing typed; tab return; session save | the follow keeps the held day (form unchanged); the session save restarts the form on the change; save keeps it [the old fields stay after the session save] |
| X2 | WFH alone changed elsewhere; typed note; session save (held); then a tab return, or a second session save | the follow and the second write both keep the held fields (WFH and the version); save refused, WFH kept [overwrites] |
| X2L | leave minutes alone, or notes alone, changed elsewhere; typed edit; session save; tab return | refused; the value kept [overwrites] |
| X3 | change elsewhere, nothing typed; session save (restart); then a typed note and a tab return | the follow takes the fresh read (same fields); save accepted with the typed note and the other device's WFH [WFH overwritten] |
| X4 | a follow read held at the route (it read the day before the change elsewhere); session save answers first (restart); the read is released | the late read is dropped (stamp); save keeps the change [the old fields stay after the session save] |
| X5 | held after a session save; the typed note typed back; second session save | the form restarts; save keeps the change [the old fields stay] |
| X6a / X6b | today: typed note; the page's Check in and Check out (followed); X6b: notes changed elsewhere; delete in the drawer | X6a the note saves; X6b refused, the other note kept [X6a same; X6b overwrites] |
| X8 (1280) | today: typed note; Check in; notes changed elsewhere; Check out | the follow keeps the held day (the Running card stays); refused; "Reload day" shows the ended session and the note [same: FIX18's guard] |
| X7 | notes and the second session changed elsewhere, nothing typed; tab return; then a session save | the tab return leaves the whole held day on screen (old note and old session end); the session save then shows both (observation, R-UX5I3-1) |

No sequence lets a stale field travel with a fresh version. The two paths differ in one designed way: with nothing typed and the fields
changed elsewhere, a session write restarts the form from the answer, while the follow keeps the whole held day (fields, sessions and
figures) until a write or "Reload day" (X1, X7). Both are safe and both are what docs/04:69 says; R-UX5I3-1 suggests one rule.

**An administrator's calendar change** (R-UX5I2-3; `zz-int3-admin.spec.ts`, private servers): a day whose entry keeps its calendar
default (source "default", created by a Check in) shows the calendar's category, so an imported holiday changes the shown category without a
new entry version. E4 (nothing typed, then a delete in the editor): the form restarts on "Holiday" (d96df5d: stays "Worked" and records it).
E3 (typed note): the held branch keeps "Worked" with the unchanged entry version, the save is accepted and records "Worked" explicitly over
the new Holiday default (the same on d96df5d). Not introduced or worsened by FIX19 (it improves E4); the coordinator left R-UX5I2-3 out of
FIX19 as a behaviour choice. Updated below.

## 4. Regressions of the change

| Item | How checked | Result |
|---|---|---|
| the unsaved-changes guard (U4-05): Escape, Close, a press outside, another day, Next period | AUDIT-INT2's A and H on the target; the U4-05 tests in FULL | each asks "Discard your changes?"; Keep editing keeps the drawer, its day and the note; the tests pass on both projects |
| the same-task Escape test | `day-editor.spec.ts:5919` in FULL (both projects) and in the seven-file run | passes |
| the label and batch refresh path | AUDIT-INT2's P after a follow; the picker and batch tests in FULL | the label pick restarts the forms with nothing asked (docs/04:69); a later save succeeds |
| sessions and breaks | FULL (`day-editor.spec.ts` session dialog, "Confirm breaks", Check out dialog tests); S1, S2 | pass; "Confirm breaks" confirms the three suggested breaks |
| shared views | H1, H2, AUDIT-INT2's C and L; `sharing.spec.ts` in FULL | the shared edit view takes the same rule through the share's routes; no clock, no follow; tests pass |
| keyboard focus and announcements | S1, S2, P1, P2, A; the axe probe's focus log | focus goes to "Times" after every session write (both branches, both projects) and stays on the page's clock button after a follow; "Session saved." and the stale alert are announced; after "Save day fields" and "Reload day" focus is on the body (pre-existing, R-UX5I3-3) |
| axe-core 4.14.0, WCAG 2.0-2.2 A/AA, light and dark | the Timesheet with the editor open on a past workday with a session at 1440, 1280 and 390px: (a) a typed note, (b) after a session save in the held branch, (c) the stale notice, (d) after "Reload day", (e) after a session save that restarts the form | 30 scans, 0 violations; incomplete only `color-contrast` (and `label-content-name-mismatch` on desktop), as in earlier gates |

No regression found. FIX19's tests add 311 lines and remove none; they use no sleep and raise no timeout (the two `timeout: 7_000` bound
their own `waitForResponse` below the test timeout); each test has a person of its own, so none depends on the order of the file.

## 5. Carry-forward of AUDIT-INT's and AUDIT-INT2's integration verdicts

Diff checked: `git diff --name-status d96df5d..0b45781 -- . ':!handoff'` (`20-namestatus-prev-target.txt`, `20-numstat-prev-target.txt`):
`docs/04_UX_AND_SETTINGS.md` and `.vi.md` (line 69, one change each), `scripts/source-digest.mjs` (+1), `src/client/DayEditor.tsx` (+45/-2)
and `tests/e2e/day-editor.spec.ts` (+311/-0). Nothing under `src/server`, `src/domain` or `src/client/components` (so `DayFieldsForm.tsx` is
unchanged), and no `TimesheetScreen.tsx`, `styles.css`, `tests/e2e/fixtures.ts`, `package.json` or lockfile change
(`20-namestatus-prev-target-areas.txt`, 0 lines); `git diff 0b45781..HEAD` outside `handoff/` is empty.

- **Every finding closed:** AUDIT-INT section 1.1 stands; F-UX5I-1 stays closed (the follow is untouched and AUDIT-INT2's probe A passes on
  the target); F-UX5I2-1 and F-UX5I2-2 are closed here. No finding of the rounds is open.
- **Every owner item and gate failure mapped:** AUDIT-INT sections 1.3 and 1.4 stand. The only owner item FIX19 touches is U4-05 (the
  non-modal drawer and its guard): docs/04:69 gains the tab-return clause and the session-write rule with the same claims in EN and VI, and
  the guard holds (section 4). REGATE13 and REGATE14 had no failure, so section 1.4 gains no row.
- **The load rule:** unchanged and sound (AUDIT-INT section 1.5). REGATE14 applied it (entry 0.63 and 0.91 busy cores, no failure); my
  censuses read 0.87-3.70 busy cores of 32, so no run of mine came near the 8-core limit.
- **RECHECK-A2 (area A):** its verdicts rest on `styles.css`, `TimesheetSheet.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`, `App.tsx` and
  `fixtures.ts`, none of which FIX19 touches. FIX19 now reads FIX13's layout-effect dirty report (`DayFieldsForm.tsx:57-59`) through
  `fieldsDirtyRef`; a state update from a layout effect re-renders before the browser yields, so the ref holds the report in the keystroke's
  own task, and every held case (typed note, WFH tick, category select, leave) took the held branch. Still valid.
- **RECHECK-B3 (area B):** no server file changed; `dist/server` and `dist/domain` are identical between my clean builds of d96df5d and the
  target (232 files), as are `package.json` and the lockfile, so the container drill (209/0, REGATE11) and `npm audit` (0) carry forward.
  Still valid.
- **The tab-return judgement (AUDIT-INT2 section 2):** still right under docs/03:24 and :40. FIX19 wrote it into docs/04:69 ("and so does
  the tab coming back into view"), which matches `ClockProvider.tsx:111-118`: the version is raised on `visibilitychange` to visible on the
  person's own screens, not on a window focus and not in a shared view. R-UX5I2-2 is closed.

## 6. Test strength: own mutants of FIX19's change

Each mutant was applied to `export-mut` (exactly one occurrence of its find text; `90-mutate.mjs.txt`), the client rebuilt, and the suite's
FIX18 and FIX19 tests run as the suite runs them (`day-editor.spec.ts -g "WP5-UX5-FIX19|WP5-UX5-FIX18"`, desktop: the 11 FIX19 tests and
4 FIX18 tests run, FIX18's phone test is skipped). A survivor then ran against the six spec files that touch the Day editor and the clock
(`day-editor`, `controls`, `focus-ring`, `keyboard-access`, `sharing`, `today`; desktop). Every mutant also ran against my session-write probe (desktop). The file
was then restored and compared byte for byte (`50-mut-apply.txt`). MY10 ran in the clean clone.

| Mutant (`DayEditor.tsx` unless named) | Suite (FIX18 + FIX19 tests) | Six spec files | My probe | Reading |
|---|---|---|---|---|
| MY1 the held branch takes the answer's entry (and so its version) | killed: G3 at `day-editor.spec.ts:2805` (no stale alert; the save is accepted) | - | 11 failed (S2-S5, S8a, X2 x2, X2L x2, X6b, H2) | right reason |
| MY2 the held branch takes the answer's WFH | survives (15 passed) | survives (212 passed) | killed: X2 after a tab return and after a second write (WFH overwritten) | test gap: G3 changes the notes and WFH together, so the held notes alone keep a later read apart |
| MY3 the held branch takes the answer's leave minutes | survives | survives | killed: X2L leave minutes (overwritten) | test gap, the same shape |
| MY4 nothing typed: no restart | killed: G1 `:2743`, G2 `:2774` (the form keeps the old note) | - | 8 failed | right reason |
| MY5 `heldDay` set once, at the first loaded day | survives | survives | killed: S10 (the editor's own save, a new note and a session save end in a false refusal) | test gap; a false refusal, no data loss |
| MY6 the dirty report never reaches the ref | killed: G3 `:2801` (the typed note is lost to a restart) | - | 12 failed | right reason |
| MY7 the delete back to `saved()` | killed: G2 `:2774` | - | S3, X6b | right reason |
| MY8 judge by the entry version instead of the fields | survives | survives | killed: S7 (Add session on a day without an entry refuses a typed note) | test gap; a false refusal, no data loss |
| MY9 restart also when the fields are the same | killed: G4 `:2831` (the typed note is lost) | - | S7, S10, X6a | right reason |
| MY11 FIX18's WFH comparison removed (FIX19's B pin) | killed: B (WFH) `:2884` | - | S5, X2 x2 | right reason; R-UX5I2-1 closed |
| MY12 FIX18's delete-confirmation hold removed (FIX19's N pin) | killed: N `:2922` (the delete answers 200, not 409) | - | none (my probe has no N case) | right reason; R-UX5I2-1 closed |
| MY10 `scripts/source-digest.mjs`: the first `maxBuffer` back to 1 MiB (clean clone) | no test runs the script | - | `npm run digest` exit 1, ENOBUFS | caught only by running it |

Seven of the eleven `DayEditor.tsx` mutants fail the suite, each at the assertion that names the rule (`50-mut-suite-reasons.txt`). Four
survive the suite and the six spec files and fail only in my probe (R-UX5I3-4). Every mutant was restored byte-equal; afterwards `src/`,
`tests/` and `scripts/` of `export-mut` equal the clean export and its rebuilt `dist/` equals the target's build (`51-mut-restored.txt`).
FIX19's own ten mutants were rerun by REGATE14 and failed their named tests; I did not repeat them.

## 7. Mandatory checks (clean export, one after another, alone on the host)

| Command | Result / exit | Evidence |
|---|---|---|
| `npm ci` | 0 (162 packages; "6 vulnerabilities (4 moderate, 2 high)", the dev-only advisories R-UX5B-2, as at REGATE13 and REGATE14) | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no warning and no deprecation line (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 files, 2,397 tests (45.8 s) | `03-npmtest.txt` |
| `npm run build` | 0; entry `index-PcdqNPHg.js` 493.05 kB (the name FIX19 and REGATE14 recorded), CSS 96.06 kB; no chunk-size advisory | `03-build.txt` |
| FULL e2e, real clock, desktop (16:18:45-16:29:03Z) | exit 0: 484 passed, 36 skipped, 0 failed (10.3 min) | `04-e2e-desktop.txt`, `04-e2e-counts.txt` |
| FULL e2e, real clock, mobile (16:29:04-16:35:29Z) | exit 0: 408 passed, 112 skipped, 0 failed (6.4 min) | `04-e2e-mobile.txt` |
| AC-13 under Asia/Kathmandu (`TZPROBE` offset -345, UTC+05:45) | 0: 1/1 | `05-ac13-asia-kathmandu.txt` |
| seven-file run at 2026-10-27T06:58:30Z, FIX10 wrapper (`shiftclock.mjs` byte-equal to the FIX10 file), 6 workers (16:35:35-16:41:55Z) | exit 0: 400 passed, 100 skipped, 0 failed (desktop 234/16, mobile 166/84; 6.3 min); the desktop crossing test `today.spec.ts:627` 1.1 min (it crossed), mobile 2.6 s | `08-seven-1026.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

The counts equal FIX19's and REGATE14's: from REGATE13's 473/36 and 408/101, desktop +11 passed (FIX19's eleven new tests) and mobile +11
skipped (the same tests on the phone project). No run failed, so no network or buffer rerun and no load classification was needed. The only
warning lines in the e2e logs are Node's notice that `NO_COLOR` is ignored because `FORCE_COLOR` is set (the Playwright workers set it), not
a deprecation.

## Findings

None. No defect of the snapshot was proven by this recheck; what I found is either by design and documented, pre-existing outside rounds 4
and 5, or a test-strength item (next section).

## Risks and optional improvements (not proven defects)

New, from this audit:
- **R-UX5I3-1, one rule for the follow and the session write when nothing is typed.** After a change elsewhere to the day fields, a tab
  return or the page's clock action keeps the whole held day on screen, sessions and figures included, until a write or "Reload day" (X7:
  another device shortened a session and changed the note; the drawer kept both old values), while a session write in the same state
  restarts the form from the answer. Safe (the save is refused) and documented (docs/04:69). Optional: let the follow take
  `withHeldDayFields(held, fresh)` when the fields differ (sessions and figures follow, fields and version stay) and restart the form from
  the fresh read when nothing is typed, the rule FIX19 gave the session write.
- **R-UX5I3-2, the held branch is quiet until the save.** After a session write in the held branch the editor says "Session saved." and
  nothing else; the figures are the answer's, computed with the fields changed elsewhere, while the form shows the held ones; the person
  learns of the change only at the refused save and then retypes the edit after "Reload day". FIX19's reason for not showing the stale
  notice early is sound (it says "Nothing was saved"). Optional: a short polite note in the held branch, which needs a new message.
- **R-UX5I3-3, focus after "Save day fields" and "Reload day" (pre-existing since WP2-T10).** The Save button is disabled while busy
  (`DayFieldsForm.tsx:105`), so focus falls to the body after every day fields save, accepted or refused; "Reload day" removes its own
  button, so focus falls to the body again (desktop drawer and phone sheet, light and dark; `47-axe-lines.txt`, S2, P2). The alert is
  announced and axe reports nothing, but a keyboard user's next Tab starts at the top of the page. The same at 8e55710. Optional, small:
  keep the button focusable while busy (`aria-disabled`) and move focus after "Reload day" to the "Category and leave" heading or the first
  field.
- **R-UX5I3-4, test strength of FIX19's change** (section 6). MY2, MY3, MY5 and MY8 survive FIX18's and FIX19's tests and the six spec
  files that touch the editor, and fail only in my probe. MY2 and MY3 would bring the silent overwrite back for a change of WFH or of the
  leave alone that is followed by a tab return or a second write (FIX19's G3 changes the notes and WFH together). MY5 and MY8 would give a
  false refusal (after the editor's own save; after Add session on a day without an entry). The product is right in every probe, so this
  is optional: add X2 (WFH alone, both follow-ups), X2L (leave alone), S10 and S7 from `90-zz-int3-session.spec.ts.txt` to
  `day-editor.spec.ts`.

Updated from AUDIT-INT2:
- R-UX5I2-1 (FIX18's guards pinned only in part): **closed** by FIX19's B (five fields), N and O tests; REGATE14's mutants and my MY11 and
  MY12 fail them.
- R-UX5I2-2 (docs/04:69 named only Check in and Check out): **closed** by the tab-return clause in EN and VI.
- **R-UX5I2-3, a calendar default has no version to protect it** (pre-existing; left out of FIX19 as a behaviour choice): now also shown
  for a day whose entry keeps its calendar default and for the session-write path. An administrator's holiday import changes the shown
  category without a new entry version; with a typed edit the held branch keeps "Worked" and the save records it explicitly over the new
  Holiday default (E3, the same on d96df5d); with nothing typed FIX19 now shows Holiday (E4; d96df5d recorded Worked). The form shows
  "Calendar default. Saving records it as your choice." under the old category. Optional (owner decision): send the category only when the
  person changed it, or refuse when the default changed since the load. Worth deciding before the pilot, because a holiday recorded as
  Worked changes the day's required time.

Carried from AUDIT-INT and AUDIT-INT2, status at this target: R-UX5I-1 (the owner's view of a held send), R-UX5I-2 (the crossing test's focus
half at the gate instant; my seven-file run took the same branch, desktop 1.1 min), R-UX5I-3 (the load rule is not canonical), R-UX5I-4
(wording items) unchanged; the risks of AUDIT-INT section 1.6 keep their status; UX4-A risk 1 (a floating drawer docked right can cover the
page's Check out for a pointer) unchanged, and my 1280px cases focus the button first as FIX18's tests do.

## Optional backlog for the WP5 handoff (updated; none of these blocks)

1. Test strength, area A: R-A3-1, R-A3-2, R-A3-3, MA5, R-UX5I-2, **R-UX5I3-4** (R-UX5I2-1 closed).
2. Test strength, area B: R-UX5B4-1, R-UX5B4-2, R-UX5B-5, G6.
3. Docs and comments: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4 (R-UX5I2-2 closed).
4. Optional product hardening: R1, R2, DIAG5's one-frame 8 px jump, R-UX5B2-1, R-UX5B2-2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3,
   4, 9, **R-UX5I2-3 (updated; owner decision, best before the pilot)**, **R-UX5I3-1**, **R-UX5I3-2**, **R-UX5I3-3** (accessibility).
5. Pilot device checks (NOT VERIFIED here): R-A2-1, R-A2-2, UX4-A 8, classic scrollbars in other browsers (docs/12:108); the owner's own look
   at the PDF samples against B11.
6. Process and harness: the logo sweep's load sensitivity (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (dev-only advisories, still "6
   vulnerabilities (4 moderate, 2 high)" in `npm ci`), R-UX5B-4, R-UX4B-6, the crossing test's mobile branch. The digest script works again
   (F-UX5I2-2 closed); no test runs it, so the release step in docs/12:7 is its only check.
7. Coordinator decisions the owner was informed of, not asked: as AUDIT-INT's item 7, plus FIX18's tab-return read (judged right by
   AUDIT-INT2), FIX19's quiet held branch (R-UX5I3-2) and the deferral of R-UX5I2-3.

## Required gates unrun or blocked

None of the mandatory checks was skipped, and none needed a rerun. Not run by me, by the brief's scope: the container drill and `npm audit`
(they carry forward from REGATE11: `dist/server`, `dist/domain`, `package.json` and the lockfile identical), the five other sweeps (REGATE14
ran all six), screenshots. NAS items stay NOT VERIFIED. My probe runs on d96df5d fail where FIX19 changed the behaviour, by design; no probe
run of mine had a defect.

## Disposition of previous findings

- **F-UX5I2-1 (Medium): closed** (sections 1 and 3); reproduced on d96df5d with AUDIT-INT2's G1 and G2 and 21 of my cases, fixed on the
  target.
- **F-UX5I2-2 (Low): closed** (section 2).
- F-UX5I-1 stays closed; every other disposition of AUDIT-INT and AUDIT-INT2 stands (section 5).
- This PASS re-accepts WP5 after UI change rounds 4 and 5 and supersedes RECHECK-A2 (PASS on ff73565b) and RECHECK-B3 (PASS on 69c6daff) as
  the current acceptance, at 0b45781 / 67aa715c.

## Software readiness, owner permission and pilot result

Software readiness for rounds 4 and 5 is re-established at 0b45781 / 67aa715c by this recheck and REGATE14 (PASS); ACCEPT-DOCS (the release
identity in docs/12:7) is still to do. Owner permission: not requested or given. Pilot result: none; the NAS is NOT VERIFIED. No production
sending or deployment was touched (local capture only, synthetic `example.invalid` people).

## One next action

The WP5 re-accept and ACCEPT-DOCS on 0b45781 / 67aa715c (docs/12's release identity with this digest, refreshed by `npm run digest`), with the
optional backlog above, R-UX5I2-3 first, carried into the WP5 handoff for the owner.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-AUDIT-INT3 attempt 1; reviewer agent `a89b2f7f5fa303382` (board); the
  authors of the snapshot are the WP5-UX4 and WP5-UX5 planners, workers, fixers and diagnosers on the board, for example WP5-UX5-FIX19
  `ab09a2f01997d2bf3`, WP5-UX5-FIX18 `a9afbdb91d41abb10`, WP5-UX5-FIX17 `a4b1c3c982a5be9ee`, WP5-UX5-PLAN `a2066720d8bdcb583`.
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder, and staged or committed nothing.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE14 PASS.
- New report path: `handoff/delivery/WP5_UX5_REVIEW_INT3.md` (+ `.vi.md`); every earlier review is untouched.
- Finding dispositions and the next coordinator task: F-UX5I2-1 and F-UX5I2-2 closed; no new finding; R-UX5I3-1..4 optional; next action
  above.
