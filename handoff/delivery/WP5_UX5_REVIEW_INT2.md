# WP5 UI change rounds 4 and 5, integration recheck after FIX18 on d96df5d (WP5-UX5-AUDIT-INT2)

[Tiếng Việt](WP5_UX5_REVIEW_INT2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5, owner-requested UI change rounds 4 and 5, the integration recheck whose PASS
  would re-accept WP5 and supersede RECHECK-A2 and RECHECK-B3 as the current acceptance; task WP5-UX5-AUDIT-INT2, attempt 1,
  2026-10-29 from 11:49:52Z to about 13:10Z. Reviewer self-reported model `claude-opus-5-5` (board agent `aec1aeea85222dbd9`), profile
  timesheet-auditor (effort set by the profile, not observable from inside). The strongest author model of the package on the board is
  `claude-opus-5-5` (18 author tasks); FIX18 itself is `claude-sonnet-5-5`, so the reviewer is not weaker. My agent id appears on the board
  only on this task: I authored no WP5-UX4 or WP5-UX5 task and none of their audits.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `d96df5daa25b44b156354bc96605e13e94e44396` (WP5-UX5-FIX18-FREEZE, pushed; WP5-UX5-REGATE13's `freeze_commit`). HEAD = origin/main =
  that commit before and after; no status line outside `handoff/` before or after. Digest
  `6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb`, 882 files, `handoff/` excluded, equal at 11:51:40Z and 13:01:39Z in
  three forms: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form on the target (the sorted
  lists byte-identical) and a copy of the target's `scripts/source-digest.mjs` with a wide buffer, run in a scratch clone and in the
  repository. The target's own `npm run digest` fails with `spawnSync git ENOBUFS` in the repository and also in a clean clone with no
  untracked file (finding F-UX5I2-2). No unpushed commit. Source complete: `npm ci` exit 0 in four exports. The last accepted snapshot is
  8e557100d16b6b6eb86a48e00276835761aabfdf (digest 507de97c); 223 paths differ outside `handoff/` between it and the target.
- **Decision: FIX REQUIRED.** F-UX5I-1 is closed: on the desktop the open Day editor now follows the page's Check in and Check out at
  1440px (beside) and 1280px (floating), keeps a typed note and saves it; a change made elsewhere to the day fields is still refused
  (another device, another tab, a grantee's session, an administrator's calendar change). FIX18's design is sound and the tab-return read is
  right under docs/03. But the recheck of "no stale field is overwritten" found one Medium defect that predates rounds 4 and 5 and FIX18:
  - **F-UX5I2-1 (Medium):** after a session save, a "Confirm breaks" or a delete in the open editor, the editor takes the server's day,
    including day fields changed elsewhere and their newer entry version, while the day fields form keeps its older values; the next "Save
    day fields" then silently overwrites the change made elsewhere. Reproduced on the target and on a5cbc91; by its code it exists since
    WP2-T10. It is the `saved()` path that AUDIT-INT named as the model for FIX18; FIX18 itself added a guard that this path lacks.
  - **F-UX5I2-2 (Low):** from this commit on, `npm run digest` fails in every checkout (the tracked file list alone is 1,063,240 bytes,
    over Node's 1 MiB default buffer), and docs/12 "Release identity" names that command for the release digest.

  Everything else in scope holds: the regressions of the client change (section 3), the carry-forward of AUDIT-INT's verdicts over the FIX18
  diff (section 4), and every mandatory check (section 6). Eight own mutants: two caught by the suite, five caught only by my probes, one
  equivalent (section 5).

## Scope actually inspected and executed

1. Read as claims, not proof: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); docs/08 "Gates and independent
   audit"; WP5_REVIEW; `WP5_UX5_REVIEW_INT.md` (+ VI) in full; FIX18's and REGATE13's briefs and Results with their evidence (`22-fix18-*`,
   `32-mutants.txt`, `62-m6-run.txt`); `WP5_UX5_RECHECK_A2.md` and `WP5_UX5_RECHECK_B3.md`; docs/04 and docs/12, EN and VI; docs/03 (the
   version rules); the board entries of this task, REGATE13, FIX18, FIX18-FREEZE, AUDIT-INT, RECHECK-A2, RECHECK-B3 and the author models of
   WP5.
2. Code: the FIX18 diff (`git diff a5cbc91..d96df5d`, five paths, +271/-3); `DayEditor.tsx` in full; `TimesheetScreen.tsx` (the clock
   effect, the focus and visibility listener, the label and batch refresh, the editor mount); `ClockProvider.tsx` (the one `version`
   counter: `afterAction` :99-102, `onVisible` :111-115); `DayFieldsForm.tsx` (the draft seeded once per mount :51-53, the version read at
   save :85); `SessionDialog.tsx:549`; the server's `timesheetCommands.ts` (`ensureDayEntry` :149-176, `applyDayEntryChange` :328-420,
   `createSession`, `updateSession`, `deleteSession`, `clockIn` :557-584, `clockOut` :592-) and `timesheets.ts` `buildDayView` :356-400;
   `scripts/source-digest.mjs`; the history of the day fields form key (`git log -S`).
3. Mandatory checks in a clean `git archive` export of the target with its own `npm ci` (`export`), one after another and alone on the
   host, with a census before and after each e2e run.
4. Own probes in a second export of the target (`export-probe`, own `npm ci` and build; only my `zz-int2-*.spec.ts` files and the AUDIT-INT
   probe added), and the same probes in an export of a5cbc91 (`export-prev-probe`) to tell FIX18's behaviour from what was there before.
5. Eight own mutants of FIX18's change in a third export (`export-mut`), each restored byte-equal; the restored build equals the target's.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT2/` (index `00-README.txt`); probe, mutant and script sources
are kept as `90-*.txt`; my rule slips are in `99-slips.txt`.

| Command or probe | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest (export, ls-tree, wide-buffer script), first and last | d96df5d = origin/main; no line; `6937d79c…61cb`, 882 files, at 11:51:40Z and 13:01:39Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| the target's `npm run digest`, repository and clean clone | exit 1, `spawnSync git ENOBUFS` in both | `01-digest-*.txt`, `31-digest-script-enobufs.txt` |
| FIX18 diff and scope | exactly the five FIX18 paths; nothing between the target and HEAD | `20-*`, `22-fix18-src-diff.txt`, `22-fix18-docs-diff.txt` |
| clean builds of a5cbc91 and the target | `dist/server` and `dist/domain` identical (232 files); `dist/client`: entry chunk, `index.html` and five lazy chunk names | `41-dist-compare.txt` |
| mandatory checks (section 6) | all exit 0; FULL 473/36/0 and 408/101/0; seven-file 389 passed, 0 failed; AC-13 1/1 | `03-*`, `04-*`, `05-*`, `08-*` |
| the AUDIT-INT probe, target and a5cbc91 | target 3 of 3 pass (the editor follows; the note saves); a5cbc91 the note case fails at the save (F-UX5I-1 reproduced on the base) | `44-auditint-probe-*.txt`, `48-log-auditint-*.txt` |
| own probe A-P (follow, version check, tab return, saved() path, regressions), target | 19 tests, all exit 0 (G1 and G2 record the overwrite); outcomes in sections 1-3 | `45-obs-follow-target*.txt`, `48-log-follow-target*.txt` |
| own probe E (an administrator's holiday import), target | E1 refused; E2 accepted (section 2) | `46-obs-admin-target-2.txt` |
| the same probes on a5cbc91 (`INT2_NO_FOLLOW=1`) | A, B, C, D, F1, F2, G1, G2, N, E as recorded; O not applicable (no follow read) | `45-obs-follow-prev-run1.txt`, `45-obs-follow-prev-2.txt`, `46-obs-admin-prev-2.txt` |
| axe-core 4.14.0 (from the npm registry into the task folder; same SHA-256 as REGATE13's copy) | 16 scans, 0 violations | `47-axe-lines.txt`, `48-log-axe-target.txt` |
| eight own mutants | MX1, MX8 caught by the suite; MX3-MX7 caught by my probes only; MX2 equivalent; all restored byte-equal | `50-*`, `51-*`, `52-log-mut-*.txt` |
| census before and after each run | 0.64-1.02 busy cores of 32 around the mandatory runs, 0.61-1.53 over all 19 censuses; 0.73 at the end | `10-census-*.txt` |

## 1. F-UX5I-1: the open desktop Day editor and the page's Check in and Check out

**Closed.** FIX18 raises `editorFollow` with every change of the clock version (`TimesheetScreen.tsx:309-316`, `:833`); the drawer reads
`GET /days/<date>` and takes the answer with `setDay` and no new `generation` (`DayEditor.tsx:250-263`), so the forms and what was typed stay.

- **The AUDIT-INT probe** (`90-zz-int-clock-editor.spec.ts.txt`, run unchanged): on the target all three cases pass: at 1440px and 1280px
  the editor shows the Running card after the page's Check in and the ended card after the Check out, and with a note typed first "Save
  day fields" saves it (`44-auditint-probe-target.txt`). On a5cbc91 the editor shows no card and the note case fails at the save (the
  reproduction of F-UX5I-1, `44-auditint-probe-prev.txt`). One "reopened" line of that probe reads the cards before the reopened editor's
  read answers (once on each commit); it is a probe timing artefact, not a product effect.
- **My probe A** (a day that already holds saved fields: WFH on and a note; 1440px beside and 1280px floating, the floating drawer docked
  left; Check in from the keyboard): one read of the day per clock action; the Running card, then the ended card ("Checked in and out");
  the typed note and WFH stay; nothing asks; focus stays on the page's clock button ("Check out", then "Check in"), never the body; no
  alert, status or live region of the editor is added; Escape after the follow still asks "Discard your changes?" and Keep editing keeps the
  note; the figures follow (complete, expected finish); "Save day fields" is accepted and the server holds the typed note, WFH on and one
  ended session (`45-obs-follow-target.txt`). On a5cbc91 the same day shows no card and no figures, and the save is accepted there too:
  before FIX18 only a day without an entry was refused, because the Check in creates the entry.
- FIX18's own tests (T1-T4 desktop, T5 phone) pass in my FULL runs and in the seven-file run at 2026-10-27T06:58:30Z.

## 2. The version check, and FIX18's design

**What a Check in and a Check out change** (`timesheetCommands.ts`): the day's sessions (insert; end, breaks, session version), the
timesheet row and its version, audit rows and the derived figures; `ensureDayEntry` (:149-176) creates the day entry with the calendar
default, source `default`, leave 0, WFH off and empty notes only when the day has none, and never changes an existing entry. A day fields
save writes only the entry (`applyDayEntryChange` :328-420) against the entry's own version. So a save after the follow cannot overwrite a
value the clock action changed: tried in A, T1/T2 and the AUDIT-INT probe (the session stays ended; only the typed fields change).

**A change made elsewhere is still refused** (all on the target, 1440px):

| Change made elsewhere | Trigger of the follow | Outcome |
|---|---|---|
| another device: notes only / WFH only / partial leave only / category only (B) | the tab comes back into view | refused each time; the other value kept; "Reload day" shows it |
| another tab of the same browser saves a note through its own editor (D) | the first tab's Check in | refused; the other tab's note kept |
| another session: a grantee with edit rights saves the owner's notes through the share (C) | the owner's Check in | refused; "Reload day" shows the grantee's note and the running session |
| an administrator imports a holiday on the open date, the day has no entry (E1) | the person's Check in | refused (the held category differs); "Reload day" shows Holiday |
| another device changes the session behind an open delete confirmation (N) | the tab comes back | the delete is refused (409, the loaded version) |
| another device changes the session behind an open session dialog (FIX18 T4) | the tab comes back | the dialog keeps its typed End time; its save is refused |

The same B, C, D, E1 and N outcomes hold on a5cbc91, where nothing follows.

**FIX18's design choices:**
- `sameDayFields` (`DayEditor.tsx:33-42`): right. The fresh entry version may be taken only when the server's day fields are the ones the
  form was seeded with, so the version the form later sends belongs to the fields it sends. It compares exactly what the form sends
  (category, leave minutes and kind, WFH, notes, with `''` for a day without an entry, as `dayFieldsDraft` seeds it) plus the category source,
  which is defensive only (MX2 survives everything, and I found no case where it decides). Its premise, "the held day's fields are the form's seed", is broken by one
  older path of the editor: F-UX5I2-1.
- The session dialog guard (`nestedOpen`, :140-141, also the delete confirmation): right. Those dialogs carry the version they loaded (the
  session dialog is keyed by the session version), so a change made elsewhere still ends in the refusal (T4, N). The Partial leave dialog is
  not in the guard and needs none: it edits only the form's draft.
- The overtaken-read drop (`dayStamp`, bumped by `load()` and `saved()`): right; a follow read that answers after the editor's own save is
  dropped (probe O: second save 200).
- **The read on a tab return** (FIX18's mutant M6): the page cannot tell its own clock action from a tab return, because `ClockProvider`
  raises the one `version` for both, so the drawer also reads its day when the tab comes back, exactly when the sheet behind it reloads
  (window focus reloads neither; it re-reads only `/periods/current`). M6 is equivalent in effect, as REGATE13 found: the data guard decides.

  **Is it right that sessions changed elsewhere are then shown and a save of unchanged day fields succeeds? Yes.** The deciding rule is
  docs/03's data model: `timesheets/day_entries` carry their own "optimistic version" (docs/03:24, VI :24) and every action validates "the
  version" of what it changes (docs/03:40, VI :40); sessions carry theirs (the session dialog and the delete send it). A day fields save
  changes only the entry, so a session changed elsewhere is not a conflict for it, and no document makes the whole day one versioned unit.
  docs/04:58 has the page re-read on focus and visibility, and the drawer showing what the server holds is the expectation AUDIT-INT stated
  for F-UX5I-1. My comparison runs confirm that FIX18 does not weaken the check: a5cbc91 already accepted that save for a day with an entry
  (F1: accepted, with a stale drawer); the only outcome FIX18 changes is a day without an entry that got its entry elsewhere from a session
  write (F2: refused before, only because the entry row appeared; accepted now, with the calendar defaults the form held, so nothing written
  elsewhere is overwritten). What remains is wording: docs/04:69's new sentence names only the page's Check in and Check out (R-UX5I2-2).

## 3. Regressions of the client change

| Item | How checked | Result |
|---|---|---|
| U4-05 guard after a follow: Escape, Close, a press outside (the title), another day, Next period | probes A and H at 1440px | each asks "Discard your changes?"; Keep editing keeps the drawer on its day and the note; the note then saves |
| the U4-05 suite (switch, unselect, Today, period steps, Close, Escape, the reason) | FULL e2e | pass (`day-editor.spec.ts:4994`, `:5052`, `:5079`, `:5115`, `:5189`, `:5485`, `:5608` and the rest) |
| the same-task Escape test | FULL e2e, both projects | `day-editor.spec.ts:5608` passes on desktop and mobile |
| the label and batch refresh path | probe P after a follow; the picker tests in FULL | the label pick on the open day reloads the editor and restarts its forms with nothing asked (typed note dropped, as docs/04:69 says); a later save succeeds; `:4589` and the review-on-top tests pass |
| the phone's bottom sheet | probe K; FIX18 T5 | no read of the day on a tab return; the note stays; Escape asks; the save from the foot succeeds |
| shared views | probe L; the sharing specs in FULL | a grantee's shared edit view has no clock region and sends no day read on a tab return; the typed note stays |
| the cross-tab theme with the editor open | probe I after a follow (1280px); the theme specs in FULL | Dark chosen in another tab paints this tab; the editor, the note and the Running card stay; nothing asks |
| keyboard focus and screen-reader output after the refresh | probe A | focus stays on the page's clock button; the editor adds no alert, status or live region; the Running and ended cards are plain content of the Times section |
| axe-core 4.14.0, WCAG 2.0-2.2 A/AA, light and dark | probe J: 1440px and 1280px with a typed note, before a Check in, after the page's Check in, after the Check out; 390px sheet before and after | 16 scans, 0 violations; incomplete only `color-contrast` (and `label-content-name-mismatch` on desktop), as in earlier gates |

No regression found. UX4-A risk 1 is seen again in the reasoning, not in a run: at 768-1329px a floating drawer docked right can cover the
page's Check in and Check out for a pointer (FIX18's tests and my probes focus the button first, which re-docks the drawer); FIX18 makes that
flow more useful, so the accepted risk matters a little more.

## 4. Carry-forward of AUDIT-INT's integration verdicts

Diff checked: `git diff --name-status a5cbc91..d96df5d -- . ':!handoff'` (`20-namestatus-prev-target.txt`): `docs/04_UX_AND_SETTINGS.md`
and `.vi.md` (one sentence each, the same claim), `src/client/DayEditor.tsx` (+52), `src/client/TimesheetScreen.tsx` (+6/-1),
`tests/e2e/day-editor.spec.ts` (+211, additions only); `git diff --name-status d96df5d..HEAD` outside `handoff/` is empty. No server
file, no package or lockfile, no test helper, no style.

- **Every finding closed:** AUDIT-INT section 1.1 stands; F-UX5I-1 is now closed (section 1). The new findings are F-UX5I2-1 and -2.
- **Every owner item and gate failure mapped:** sections 1.3 and 1.4 stand. The only item FIX18 touches is U4-05 (the non-modal drawer): its
  guard is unchanged and holds after a follow (section 3); docs/04:69 gains one sentence in EN and VI with the same claim. REGATE13 had no
  failure, so section 1.4 gains no row.
- **The load rule:** unchanged; REGATE13 applied it (entry 0.59 and 1.02 cores, no failure) and my 19 censuses read 0.61-1.53 cores.
- **RECHECK-A2 (area A):** its verdicts rest on files FIX18 does not touch (`styles.css`, `TimesheetSheet.tsx`, `DayFieldsForm.tsx`,
  `ThemeToggle.tsx`, `App.tsx`, `fixtures.ts`); the two points where FIX18 meets them were rechecked: FIX13's dirty report after a follow
  (A, H) and FIX14's cross-tab theme after a follow (I). Still valid.
- **RECHECK-B3 (area B):** no server file changed; my clean builds give identical `dist/server` and `dist/domain` for a5cbc91 and the target
  (`41-dist-compare.txt`), so the drill and `npm audit` carry forward from REGATE11. Still valid.

## 5. Test strength: own mutants of FIX18's change

Each mutant was applied to `export-mut`, the client rebuilt, FIX18's tests and the two stale-version tests run (desktop); a survivor was then
run against the six spec files that touch both the clock and the Day editor (`day-editor`, `controls`, `focus-ring`, `keyboard-access`,
`sharing`, `today`; 201 passed, 19 skipped each) and against my probe cases A, B, N and O; then restored byte-equal.

| Mutant | Suite | My probe | Reading |
|---|---|---|---|
| MX1 `sameDayFields` drops the notes | caught: T3 at the stale alert (`day-editor.spec.ts:2584`) | caught: B notes only | right reason, but T3 kills it only because T1/T2 earlier in the file leave today with an explicit entry; alone, T3 also differs in the category source |
| MX2 drops the category source | survives | survives | equivalent in effect: when only the source differs, the fields the form sends equal the server's, so nothing written elsewhere can be lost |
| MX3 drops WFH | survives (201 passed) | caught: B WFH only (accepted, WFH overwritten) | test gap |
| MX4 drops the partial leave | survives | caught: B partial leave only | test gap |
| MX5 an open delete confirmation no longer holds off the follow | survives | caught: N (the delete of a session changed elsewhere is not refused) | test gap |
| MX6 an overtaken follow read is no longer dropped | survives | caught: O (the second save is refused) | test gap |
| MX7 `saved()` no longer marks a newer day | survives | caught: O | test gap |
| MX8 the guard also demands the same entry version | caught: T1 and T2 at the Running card | - | right reason (the created entry must be taken) |

FIX18's tests pin the follow itself (its M1, M2 and my MX8), the dialog guard (M4), the phone gate (M5) and the field guard as a whole (M3);
they do not pin the WFH and leave comparisons, the delete-confirmation hold or the overtaken-read drop. The product is right in every probe,
so this is an optional test-strength item (R-UX5I2-1), best added in the fix round of F-UX5I2-1.

## 6. Mandatory checks (clean export, one after another, alone on the host)

| Command | Result / exit | Evidence |
|---|---|---|
| `npm ci` | 0 (162 packages; the audit summary "6 vulnerabilities (4 moderate, 2 high)" equals REGATE13's: the dev-only advisories R-UX5B-2) | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 files, 2,397 tests (45.6 s) | `03-npmtest.txt` |
| `npm run build` | 0; entry `index-D6YCEv6o.js` 492.70 kB, CSS 96.06 kB; no chunk-size advisory | `03-build.txt` |
| FULL e2e, real clock, desktop (11:58-12:08Z) | exit 0: 473 passed, 36 skipped, 0 failed (10.6 min) | `04-e2e-desktop.txt`, `04-e2e-counts.txt` |
| FULL e2e, real clock, mobile (12:08-12:15Z) | exit 0: 408 passed, 101 skipped, 0 failed (6.3 min) | `04-e2e-mobile.txt` |
| AC-13 under Pacific/Auckland (`TZPROBE` offset -780) | 0: 1/1 | `05-ac13-pacific-auckland.txt` |
| seven-file run at 2026-10-27T06:58:30Z, FIX10 wrapper (`shiftclock.mjs` SHA-256 equal to the FIX10 file), 6 workers | exit 0: 389 passed, 0 failed (desktop 223/16, mobile 166/73); the desktop crossing test 1.1 min, mobile 2.5 s | `08-seven-1026.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

No run failed, so no network or buffer rerun was needed. The only warning lines in the e2e logs are Node's notice that `NO_COLOR` is ignored
because `FORCE_COLOR` is set (the Playwright workers set it), not a deprecation.

## Findings

1. **F-UX5I2-1, Medium - a session write in the open Day editor makes a later "Save day fields" overwrite day fields changed elsewhere**
   (`src/client/DayEditor.tsx:279-288` `saved()`, called after a session save, a "Confirm breaks" (`:563-566`, from
   `SessionDialog.tsx:549`) and a delete (`:326-328`); `src/client/components/DayFieldsForm.tsx:51-53` seeds the draft once per
   `generation`, `:85` sends `day.entry.version` of the current day). Pre-existing: the key `fields-${generation}` and the once-seeded draft
   come from WP2-T10 (26fa7c9f), `saved()` was already `setDay(next)` at 8e557100; not introduced by rounds 4 and 5 or FIX18.
   - Cause: a session write answers with the whole day (`getDayView`), which carries any day fields changed elsewhere since the editor loaded
     and their newer entry version. `saved()` takes it with no new `generation`, so the form keeps its older draft while the editor now holds
     the newer version.
   - Reproduction (`zz-int2-follow.spec.ts` G1, G2; target and a5cbc91, `45-obs-follow-target.txt`, `45-obs-follow-prev-run1.txt`): a past
     workday with a session and the saved note "Saved before the editor opened (synthetic)"; open its editor at 1440px; another device saves
     the note "Changed on another device (synthetic)" and WFH on (entry version +1); in the editor, Edit the session, change its end and
     save ("Session saved."): the form still shows the old note and WFH off and no stale notice; press "Save day fields" without typing:
     accepted; the server now holds the old note and WFH off, the other device's change is gone, and nothing told anyone. G2, the same with
     "Delete session" in place of the edit: the same overwrite. By the code (not run), a note typed before the session write is sent with
     the newer version in the same way.
   - Expected: the rule FIX18 was given ("never send stale day fields with a fresh version") and docs/04:69's new sentence ("a change made
     elsewhere to the day's fields is not taken in this way: the save is refused and Reload day reads it"); docs/03:40 (each action validates
     the version). The day fields save should be refused, or the form should show the server's fields, so that the change made elsewhere is
     never dropped silently. The same edit through the follow is refused (section 2, B).
   - Bounded fix: in the editor, a session write's answer may replace the held day fields and entry version only when `sameDayFields(held,
     next)` holds; otherwise keep the held entry and fields for the day fields form (so its save carries the old version, is refused and
     "Reload day" reads the change) and show the stale notice, or restart the form from the answer when it holds no unsaved edit. One e2e
     test per write kind (session save, delete) in `day-editor.spec.ts` (the G1/G2 shape); docs/04 one clause in EN and VI only if the
     wording needs it.
2. **F-UX5I2-2, Low - `npm run digest` fails in every checkout from d96df5d** (`scripts/source-digest.mjs:13-15`).
   - Cause: the first `execFileSync` (`git ls-files --cached --others --exclude-standard -z`) has no `maxBuffer`, so Node's 1,048,576-byte
     default applies; the tracked list is 1,027,260 bytes at a5cbc91 and 1,063,240 bytes at d96df5d (535 evidence files were committed in
     the FIX18 freeze).
   - Reproduction (`31-digest-script-enobufs.txt`, `01-digest-before.txt`): a scratch clone of the target with 0 untracked files: `npm run
     digest` exits 1 with `spawnSync git ENOBUFS`; the same script with only `maxBuffer: 64 * 1024 * 1024` added prints the expected
     `6937d79c…61cb (882 files)`.
   - Expected: docs/12:7 (VI :7) "Release identity" records the release's source digest with `npm run digest`; the command must work in a
     clean checkout of the release candidate. The brief's premise ("while many handoff files are untracked") does not hold: the failure is
     permanent from this commit on, and the ls-tree form (or a patched copy of the script) is today the only working route.
   - Bounded fix: add `maxBuffer: 64 * 1024 * 1024` to the first `execFileSync` (the second already has it); prove it with `npm run digest`
     in a clean clone and in the repository.

## Risks and optional improvements (not proven defects)

New, from this audit:
- **R-UX5I2-1, FIX18's guards are pinned only in part** (section 5): the WFH and partial-leave comparisons, the delete-confirmation hold
  and the overtaken-read drop survive the suite (MX3-MX7); MX1 is caught only through the order of the tests. Optional: add my B, N and O
  cases (sources in `90-zz-int2-follow.spec.ts.txt`) to `day-editor.spec.ts`, ideally in the F-UX5I2-1 fix round.
- **R-UX5I2-2, docs/04:69 names only the page's Check in and Check out.** The drawer also reads its day when the tab comes back into view
  (the clock's one counter), and not on a window focus. Optional: one clause in EN and VI.
- **R-UX5I2-3, a day without an entry has no version to protect its calendar default** (pre-existing, same on a5cbc91): an administrator
  imports a holiday on the open date, the tab comes back (no Check in), and "Save day fields" records the old default "Worked" as the
  person's explicit choice over the new Holiday (E2); the form shows "Calendar default. Saving records it as your choice." Optional: send
  the category only when the person changed it, or refuse when the default changed since the load.

Carried from AUDIT-INT, status at this target:
- R-UX5I-1 (the owner's view of a send held after a restore): unchanged (no file in that path changed).
- R-UX5I-2 (the crossing test's focus half at the gates' sweep instant): unchanged; my seven-file run at 06:58:30Z took the same branch
  (desktop crossing 1.1 min).
- R-UX5I-3 (the load rule lives in gate briefs and DIAG10; "timeout" undefined): unchanged; REGATE13 copied it again.
- R-UX5I-4 (wording items: the FIX10 wrapper comment, docs/04:114 cross-tab theme, docs/12:106 round-5 press outside, the pause banner
  order): unchanged; R-UX5I2-2 joins them.
- The risks of AUDIT-INT section 1.6 keep the status recorded there; UX4-A risk 1 seen again (section 3).

## Optional backlog for the WP5 handoff (updated; none of these blocks, the two findings do)

1. Test strength, area A: R-A3-1, R-A3-2, R-A3-3, MA5, R-UX5I-2, **R-UX5I2-1**.
2. Test strength, area B: R-UX5B4-1, R-UX5B4-2, R-UX5B-5, G6.
3. Docs and comments: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4, **R-UX5I2-2**.
4. Optional product hardening: R1, R2, DIAG5's one-frame 8 px jump, R-UX5B2-1, R-UX5B2-2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3,
   4, 9, **R-UX5I2-3**.
5. Pilot device checks (NOT VERIFIED here): R-A2-1, R-A2-2, UX4-A 8, classic scrollbars in other browsers (docs/12:108); the owner's own look
   at the PDF samples against B11.
6. Process and harness: the logo sweep's load sensitivity (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (dev-only advisories, still "6
   vulnerabilities (4 moderate, 2 high)" in `npm ci`), R-UX5B-4, R-UX4B-6, the crossing test's mobile branch; the digest script becomes
   F-UX5I2-2.
7. Coordinator decisions the owner was informed of, not asked: as AUDIT-INT section "Optional backlog" item 7, plus FIX18's tab-return read
   (judged right in section 2).

## Required gates unrun or blocked

None of the mandatory checks was skipped, and none needed a rerun. Not run by me, by the brief's scope: the container drill and `npm audit`
(they carry forward from REGATE11: `dist/server` and `dist/domain` identical), the five other sweeps (REGATE13 ran all six), screenshots.
NAS items stay NOT VERIFIED. Probe defects of my own are kept and named: the first a5cbc91 run waited for a follow read that a5cbc91 does not
make (`48-log-follow-prev-run1-probe-defect.txt`, `48-log-admin-prev-run1-probe-defect.txt`; only its G1, G2 and L results are used); the
first target run read the form right after "Reload day" before the reload answered (its B and E reload lines; rerun with a wait, `-B2`,
`-2`); probe O does not apply to a5cbc91. No conclusion rests on a defective run.

## Disposition of previous findings

- **F-UX5I-1 (Low): closed** (section 1); reproduced on a5cbc91 with the AUDIT-INT probe, fixed on the target.
- AUDIT-INT's other dispositions stand (section 4). RECHECK-A2 and RECHECK-B3 stay valid for their areas, but this recheck does not re-accept
  WP5: F-UX5I2-1 and F-UX5I2-2 are open, so they are not yet superseded as current acceptance.

## Software readiness, owner permission and pilot result

Software readiness is not re-established: this integration recheck is FIX REQUIRED (one Medium pre-existing integrity finding in the Day
editor, one Low tooling finding that the release identity depends on). Owner permission: not requested or given. Pilot result: none; the NAS
is NOT VERIFIED. No production sending or deployment was touched (local capture only, synthetic `example.invalid` people).

## One next action

One bounded fix round (kind fix, `addresses_audit` WP5-UX5-AUDIT-INT2): F-UX5I2-1 in `src/client/DayEditor.tsx` (and
`DayFieldsForm.tsx` only if needed) with the G1/G2 e2e tests and, optionally, R-UX5I2-1's B, N and O cases; F-UX5I2-2 in
`scripts/source-digest.mjs`; then its freeze, a regate for a client change (as REGATE13), and a fresh integration recheck on the new digest
before the WP5 re-accept and ACCEPT-DOCS.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-AUDIT-INT2 attempt 1; reviewer agent `aec1aeea85222dbd9` (board); the
  authors of the snapshot are the WP5-UX4 and WP5-UX5 planners, workers, fixers and diagnosers on the board, for example WP5-UX5-FIX18
  `a9afbdb91d41abb10`, WP5-UX5-FIX17 `a4b1c3c982a5be9ee`, WP5-UX5-PLAN `a2066720d8bdcb583`, WP5-UX5-T01B `a084c1bdda1d1e1cf`.
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder, and staged or committed nothing.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE13 PASS.
- New report path: `handoff/delivery/WP5_UX5_REVIEW_INT2.md` (+ `.vi.md`); every earlier review is untouched.
- Finding dispositions and the next coordinator task: F-UX5I-1 closed; F-UX5I2-1 (Medium) and F-UX5I2-2 (Low) open, next action above;
  R-UX5I2-1..3 optional.
