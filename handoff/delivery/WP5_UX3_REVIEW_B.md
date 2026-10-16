# WP5 UI change round 3, independent audit of area B (break entry integrity and dialogs) on 7ce4e95 (WP5-UX3-AUDIT-B)

[Tiếng Việt](WP5_UX3_REVIEW_B.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 3 after its fix round
  (WP5-UX3-FIX1 and WP5-UX3-FIX2) and the passed regate WP5-UX3-REGATE; task WP5-UX3-AUDIT-B, attempt 1, area B only,
  2026-10-16 from 18:15Z to about 20:05Z (11:15 to about 13:05 in America/Los_Angeles, a window day: current period
  09/28-10/11, in progress 10/12-10/25). Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set
  by the profile, not observable from inside). The strongest author model of the snapshot is also `claude-opus-5-5` (PLAN,
  PLAN2, T06, T08, FIX1, SWEEP; the other slices sonnet), so the reviewer is not weaker. The area-A auditor ran on the same
  machine at the same time.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `7ce4e95a0c4477374e981132d93b11aedab2e384` (the WP5-UX3-FIX2 freeze, the WP5-UX3-REGATE `freeze_commit`). HEAD =
  7ce4e95 before and after; `git status` outside `handoff/` empty before and after (only the coordinator's own records under
  `handoff/` are modified or untracked). Digest `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833
  files, `handoff/` excluded, recorded first and last, each time in three equal forms: a clean `git archive` export hashed
  with `git hash-object --no-filters`, the `git ls-tree HEAD` form (its sorted list byte-identical to the export's), and
  `npm run digest` in the repository. Source complete: `npm ci` exit 0 in every export.
- **Decision: FIX REQUIRED** (two Low findings, F-UX3B-1 and F-UX3B-2; no Medium or higher).
  - Request integrity holds: for the same typed values the session dialog and the Check out dialog store exactly the
    instants a643794's forms stored, in 25 cases captured from both UIs (section 2). Untouched rows resend their saved
    instants byte for byte; the end is the start plus the minutes as elapsed UTC time; hidden row dates follow the session
    date.
  - Confirmation semantics hold against R-02, D-02 and E-1, and the final "Save this session?" summary says what is sent;
    Cancel, Discard, Go back, Back and the sub-dialog's Done send nothing (section 3).
  - Pre-fill follows the server's `today_local`, never the device clock, in two device zones and across the reporting-zone
    midnight; the rewritten rule in docs/04 and docs/10 (EN and VI) is the PLAN section C text (section 4).
  - Figures are unchanged: `dist/server` and `dist/domain` are byte-identical to a643794, and the replayed bodies give the
    same worked minutes, OT credit, deficits, review items and sign-off state on both servers (section 5).
  - The dialog stack, B3-01 across 1360px, view-only shares, the reason field, and the phone rows and chips behave as
    documented (sections 6 and 7). Audit-focus item 8 passes; item 9: N-2 holds.
  - The fix-round area-B items hold: FIX1 seed (no 409 flake, still proves the refusal), FIX2 items 2, 5, 8 and 10 (section 8).
  - The mandatory checks pass (section 9). Thirteen own mutants on area-B behaviour are all caught (section 10).
  - Sweep finding 12 is reproduced and judged misleading (F-UX3B-1); "Confirm breaks" keeps the all-or-nothing suggestion rule
    while docs/04 describes another (F-UX3B-2).

## 1. Scope actually inspected and executed

1. Read as claims, not proof: the board's owner decisions of 2026-10-15/16 (U-21..U-27 in WP5-UX3-PLAN, G-3 a, G-4 owner
   variant, N-1, N-2, Q6 b, 24-hour chips) and coordinator decisions (G-4 trigger, the audit-focus list items 8 and 9, the
   finding-12 disposition); WP5-UX3-PLAN B8 and C, PLAN2 items 4-6, the slice records T06-T10, the failed gate, FIX1, the
   sweep, FIX2 with Addendum 1, the regate; docs/02 R-01, R-02, R-07, docs/03 sessions and breaks, docs/04 lines 7, 16, 25,
   62-70, 77, docs/10 D-02, E-1 and the round-3 entries, docs/12 "Unconfirmed breaks", EN and VI.
2. Code read in full: `breakRowsModel.ts`, `breakChipModel.ts`, `SessionDialog.tsx`, `BreakRows.tsx`, `BreakSubDialog.tsx`,
   `BreakChip.tsx`, `ClockOutDialog.tsx`, `ClockProvider.tsx` (dialog part), `ConfirmDialog.tsx`, `SessionList.tsx`,
   `dayEditorModel.ts`, `DayEditor.tsx`, `sessionModel.ts`, `TimeProblemPrompt.tsx`; at a643794 `SessionForm.tsx`,
   `BreaksEditor.tsx`, `ClockOutDialog.tsx`, `DayEditor.tsx`, `dayEditorModel.ts`; the server's `createSession`,
   `updateSession`, `clockOut` and `planBatch`. `git diff a643794..7ce4e95 -- src/server src/domain migrations
   src/client/api.ts src/client/components/sessionModel.ts`: empty.
3. Own probes (task-local, Edge, synthetic people on `example.invalid`; copies in the evidence as `*.ts.txt`): request capture
   on both builds (`zz-audb-req`), the server's figures for the captured bodies on both builds (`zz-audb-figures`), the
   dialog stack and nothing-sent checks (`zz-audb-dialogs`), pre-fill under the FIX10 clock (`zz-audb-prefill`), phone layout
   and partial-fit "Confirm breaks" (`zz-audb-phone`), finding 12 (`zz-audb-dialogs` F, `zz-audb-f12b`), the FIX1 seed
   (`aaa-audb-seed` with test and server mutants), thirteen area-B mutants.
4. Mandatory checks in a clean export of the target (section 9).

## 2. Request integrity against a643794 (matrix)

Method: the same typed values entered through the a643794 forms and through the target's dialogs (desktop 1280x800, device
zone Asia/Ho_Chi_Minh, a fresh synthetic person per build), every POST/PUT captured with its status, and the stored session
read back from `/api/days/:date` (`40-req-base.jsonl.txt`, `41-req-target.jsonl.txt`, comparison `42-req-compare.txt`).

| Case | Stored instants | Body |
|---|---|---|
| K01 same day, Los Angeles, three typed breaks (current period, no reason) | equal | break ends carry the explicit offset (PLAN B8) |
| K01b pre-filled suggestions saved untouched vs a643794 "Suggest breaks" + "Confirm suggested breaks" | equal | byte-identical |
| K02 overnight 22:00-06:00+1, break 23:50 for 20 min across midnight (old period, reason) | equal | end offset only |
| K03 Sydney fall-back fold, break 02:30 earlier (+11:00) for 45 min (ends 02:15 +10:00) | equal | end offset only; a643794 needed two server prompts, the target one row prompt |
| K04 same, later (+10:00) | equal | end offset only |
| K05 Los Angeles spring-forward gap, break at 02:30, "Use 03:30 on 2026-03-08", 15 min | equal | end offset only |
| K06 break 01:50 for 20 min across the gap (ends 03:10 PDT) | equal | end offset only |
| K07 input zone Asia/Ho_Chi_Minh, session on the next local date (hidden row date follows it) | equal | end offset only |
| K08 input zone America/New_York, overnight, break 23:55 for 10 min across midnight | equal | end offset only |
| K09 "Confirm no breaks taken" vs "No breaks taken" | equal | start pinned by the pre-fill offset (same instant, R-UX3B-5) |
| K10 notice "Leave breaks unconfirmed for now" vs "Breaks not confirmed yet" | equal | same |
| K11 notice "Confirm no breaks taken" vs "No breaks taken" | equal | same |
| E12 untouched edit, times with seconds | equal | byte-identical |
| E13 edit of the end time only (rows untouched) | equal | byte-identical |
| E14 session moved to the next date (Q6 b: hidden row date follows; a643794 typed the break dates) | equal | end offset only |
| E15 input zone changed Los Angeles to Ho Chi Minh (wall times re-read) | equal | end offset only |
| E16 zone round trip LA, HCM, LA | equal | target re-pins the untouched row (same instants) |
| E17 "Confirm breaks" with suggested rows vs one-tap "Confirm suggested breaks" | equal | byte-identical |
| E18 "Confirm breaks" with the listed row vs "Confirm breaks as listed" | equal | byte-identical |
| E19 "Confirm breaks", no suggestion fits, notice "Confirm no breaks taken" vs one-tap "No breaks taken" | equal | byte-identical |
| E20 untouched edit on the Sydney fold day (break 02:30 +10:00) | equal | byte-identical |
| C20 Check out with the box ticked vs "No breaks taken" | equal | byte-identical `{breaks: [], breaks_confirmed: true, expected_version}` |
| C21 Check out with an empty unticked list | equal | byte-identical `{breaks_confirmed: false, expected_version}` (E-1 omission) |
| C22 Check out with one typed row | equal | end offset only |
| C23 Check out with a saved unconfirmed row removed (finding 12) | equal | byte-identical (both omit the list) |

Result: **PASS** (25 of 25 equal by stored instant; every untouched case byte-identical). The end is start + minutes as
elapsed UTC time (K03: 45 min across the fall-back hour; K06: 20 min across the gap), sent as its local time with its
offset. Hidden row dates follow the session date after a date change (E14, no date field shown) and keep the shown wall date
after a zone change (E15, E16).

## 3. Confirmation semantics (R-02, D-02, E-1, the G-4 notice)

- Listed rows: `breaks_confirmed: true` (K01-K08, E14-E18, C22). Ticked box: `breaks: []`, true (K09, C20). G-4 "Confirm
  no breaks taken": `[]`, true (K11, E19); "Leave breaks unconfirmed for now": `[]`, false, and the day is
  `incomplete_breaks` with the review item `unconfirmed_breaks` (K10); "Go back and add breaks" and Escape in the notice:
  nothing sent, focus on "Add break" (`43-dialogs-obs-run1.txt` D5). Check out (E-1): an empty unticked list omits
  `breaks` and stays unconfirmed (C21); the notice and the final confirmation are not used there (O8).
- The final "Save this session?" lists Day, Time (with the zone, `+1` and a foreign start date) and Breaks exactly as sent:
  "3 breaks (15, 30, 15 min)" with "Saving confirms these breaks as the breaks you took.", "No breaks taken" with the same
  sentence, and "Breaks not confirmed: OT for this day stays pending" with "Unconfirmed breaks keep OT for this day pending
  until you confirm them." (K01, K09-K11, D6, D7).
- Nothing is sent on Cancel or Discard (D2, D4, O7), Back or Escape in the final confirmation (D6, D7), or the sub-dialog's
  Done and Cancel (P3, P4); the only write is the confirmed Save (D9).
- Verdicts: R-02 PASS (confirm suggested or actual or none at save and Check out; unknown differs from zero), D-02 PASS
  (unknown stays pending), E-1 PASS for the API contract, G-4 notice PASS (trigger only with no row and the box unticked).
  The UI side of E-1 for saved rows on a running session misleads: F-UX3B-1.

## 4. Pre-fill (G-3 a) by the server date

FIX10 clock preload (byte-identical copy) at 2026-10-27T06:58:00Z (Mon 23:58 Los Angeles), browser clock fixed to the same
instant, device zones Asia/Ho_Chi_Minh and America/New_York (device date already 10/27; `44-prefill-obs.txt`):
- 10/25: reference hours plus 3 suggested breaks; 10/26 (the server's today, the device's yesterday): hours only; 10/27:
  hours only. After the reporting-zone midnight: without a re-read the page still treats 10/26 as today (hours only;
  conservative, R-UX3B-2); after a reload 10/26 gets the breaks and 10/27 hours only. Both zones identical.
- Reference hours 08:00-17:00 in Los Angeles shown in the input zone (22:00-07:00+1 in Ho Chi Minh, 11:00-20:00 in New York),
  with the note "Pre-filled from your reference hours (08:00-17:00 in America/Los_Angeles) and suggested breaks". Edits are
  never pre-filled (`SessionDialog.tsx:233-248`).
- docs/04 line 16 EN and VI are the PLAN section C texts word for word; the docs/10 clause (EN line 182, VI 183) is replaced;
  the only "not seeded" text left is the quoted history in docs/10 line 226. Verdict: PASS.

## 5. Figures unchanged

`git diff a643794..7ce4e95 -- src/server src/domain migrations` empty; own clean builds: `dist/server` 180 and `dist/domain`
46 files, 0 hash differences (`47-dist-compare.txt`). The 20 captured session bodies (K and E cases) of both builds were sent
again to fresh people on both servers: day calculation (status, regular, off-calendar, eligible, credited), deficit, the
sheet's day and totals, the timesheet state, the review payload's day, `unresolved_inputs`, totals, OT and deficit proposals
are identical across all four combinations for every case (`46-figures-compare.txt`; a first run read a wrong key for the
unresolved items and is kept as `45-figures-base-run1-wrong-key.jsonl.txt`). Verdict: PASS.

## 6. Dialogs

- Stack (1280, floating modal editor): editor > session dialog > notice or confirmation, one modal on top; Escape closes only
  the top each time; focus returns to "Add session", "Add break", "Save", "Delete session …" or the day's button; after Save
  to "Times" (D1-D11). Eight Escape presses in a row alternate correctly between the question and the dialog (D3).
- B3-01 across 1360px (`43-dialogs-obs-run2.txt` B1-B6): with the session dialog open, 1440 to 1280 keeps the editor
  non-modal under the modal dialog, 1280 to 1440 keeps it modal; the switch happens after the dialog closes. Focus then lands
  on the editor heading, not on the opener (R-UX3B-1).
- View-only share: no Add session, Edit, Delete, Confirm breaks or Check in/out; chip "View only"; no write (S1, S2).
- Reason in an old period: one field in the panel and the same state in the session dialog; Save disabled until it is typed
  (B1, B2, B4).
- Check out discard question: see section 8.

## 7. Phone (N-1, N-2) and audit-focus item 9

`48-phone-obs.txt`, mobile project: same-day sessions show rows at 430/390/375/360/320 (list 398/358/343/328/288px);
overnight sessions rows at 430 and chips at 390 and below; chip text 24-hour (`Break 1 · 10/09/2026 10:00 → 10:15`, date only
for overnight). 390x844 new session with three suggestions: head 93px, footer sticky (775-844), first field visible
(271-315), body scrolls 297px with rows and 259px with chips. Targets: every control 44px high (the "Confirm no breaks
taken" box sits in its 44px label); sub-dialog fields and buttons 44px. No sideways scroll (document and dialog) at any width.
Judgement on N-2: holds; spacing is even and neither loose nor cramped (`audb-phone-390x844-*-synthetic.png`), and the
scroll is the documented content-length limit (docs/10 line 246), with the head and the footer always in view.

## 8. Fix round, area B

- **FIX1 seed (PASS).** With an entry left by an earlier test on the seeded date (`aaa-audb-seed`), `timesheet.spec.ts:452`
  passes on both projects; with the seed reverted to version `null` it fails at the seed with 409 `stale_version` (the old
  flake); with the server accepting a stale batch version it fails (no date-naming alert), so it still proves the refusal
  (`61-fix1-*.txt`).
- **FIX2 item 2 (PASS).** `day-editor.spec.ts:710` fixes the browser clock three days ahead and a year behind the server
  date and asserts both branches; my mutant M18 (A09) fails it: see section 10.
- **FIX2 item 8 (PASS).** Check out: unchanged Cancel and Escape close at once with focus on "Check out"; after an added row
  Cancel, Escape and `dialog.requestClose()` ask "Discard your changes?"; Keep editing keeps the row and returns focus to
  Cancel; Escape in the question keeps editing; an undone change closes at once; the ticked box counts; Discard sends
  nothing; Check out sends at once with no alert dialog (O1-O8). docs/04 line 70 and docs/10 line 238 (VI 239) say exactly
  this.
- **FIX2 item 10 (PASS).** The five removed unit tests and their proofs: (1) the one-tap body equals the form-flow body: held
  by `breakRowsModel.test.ts:181-202` (dialog body JSON-equal to the old form body, same value pins) and by E17
  (byte-identical in the UI); (2) none, empty confirmed list, no reason: held by `:213-219` and E19; (3) the "Confirm breaks"
  draft saved unchanged: held by `:181-202` and E17; (4) listed rows kept: held by `:204-212` with `:150-156` (confirmed) and
  E18; (5) preselecting "No breaks taken": retired by the accepted T08 design, held by the e2e test `day-editor.spec.ts:3708`
  (box unticked, Save asks, the empty confirmed list) and E19. Nothing weakened.
- **FIX2 item 5 (PASS, with R-UX3B-3).** docs/12 line 71 EN and VI now resolve a refused Check out in the Check out dialog
  (rows or the box) and limit "Confirm breaks" to ended sessions; reproduced: the 422 `saved_break_after_clock_out` is
  resolved by ticking the box (`49-f12b-obs.txt` G2-G3).
- **Sweep finding 12 (F-UX3B-1).** Matches E-1 at the API and a643794's result after a removal, but the dialog misleads.

## 9. Mandatory checks (clean export of the target; `10-main-exits.txt`)

| Command | Result | Evidence |
|---|---|---|
| `npm run typecheck` | exit 0, 0 deprecation lines | `10-typecheck.txt` |
| `npm run lint` | exit 0 | `10-lint.txt` |
| `npm test` (twice) | exit 0 both; 94 files, 2131 tests each | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | exit 0; main chunk `index-4YHzamSq.js` 487.17 kB, no advisory | `10-build.txt` |
| AC-13 (`vitest run tests/integration/ac13-two-week.test.ts`) | exit 0, 1/1 | `10-ac13.txt` |
| FULL e2e, both projects, real clock (18:29-18:46Z) | exit 0; 627 passed, 67 skipped, 0 failed (desktop 317/30, mobile 310/37) | `11-e2e-real.txt` |
| `day-editor.spec.ts` under FIX10 at 2026-11-01T08:45Z (LA 01:45, fold) | exit 0; 112 passed, 18 skipped (desktop 64, mobile 48) | `50-dst-20261101T0845.txt` |
| same at 2027-03-14T10:30Z (LA 03:30, after the gap) | exit 0; 112 passed, 18 skipped | `50-dst-20270314T1030.txt` |

No run failed by timeout; none was repeated.

## 10. Test strength: own mutants

Each mutant was applied alone in a scratch export, the client rebuilt, then the full unit suite and `day-editor.spec.ts` on the
desktop project ran; the file was reverted and checked identical.

| Id | Mutant (area-B behaviour) | Unit suite | `day-editor.spec.ts` desktop | Result |
|---|---|---|---|---|
| A01 | the session dialog always sends `breaks_confirmed: true` ("Leave unconfirmed" would confirm) | 1 area-B test fails | 2 fail (:146, :752) | caught |
| A02 | past-day comparison `<=` (the server's today gets suggested breaks) | 2 fail | 2 fail (:593, :710) | caught |
| A03 | break end sent as the start's wall clock plus minutes on the start date, no offset (not elapsed time) | 9 fail | 2 fail (:848, :1556) | caught |
| A04 | a hidden row date follows the session date but keeps its stale pin | 1 fails | 1 fails (:1075) | caught |
| A05 | the G-4 notice never opens (an empty unticked list is refused) | pass | 3 fail (:146, :752, :3708) | caught (e2e) |
| A06 | `breaksPayload` says "confirmed" for the Check out omission | 1 fails | pass | caught (unit); masked at the request, because `buildCheckOutDialogRequest` writes `false` on that branch |
| A13 | that omission branch of `buildCheckOutDialogRequest` says `breaks_confirmed: true` | 1 fails | 1 fails (:1866) | caught |
| A07 | the sub-dialog's Done hands back the original row | pass | 4 fail (:1277, :1433, :1556, :1977) | caught (e2e) |
| A08 | Escape in a confirmation confirms (nested Escape) | pass | 8 fail (:2052, :2492, :2603 x2, :3992 x2, :4058 x2) | caught (e2e) |
| A09 | M18: the past-day rule reads the device date | pass | 2 fail (:593, :710); on both projects too (`63-m18.txt`) | caught (e2e) |
| A10 | Check out sends listed rows unconfirmed | 1 fails | 4 fail (:1771, :1901, :1977, :2144) | caught |
| A11 | a session confirmed with none opens with the box unticked | 1 fails | 2 fail (:380, :500) | caught |
| A12 | an edited pinned row still sends its pinned instants | 3 fail | 4 fail (:593, :1075, :1277, :1433) | caught |

Result: 13 of 13 caught. A09 (M18) at 19:48Z, outside the 07:00-17:00 UTC band, fails the old test `:593` as well; the FIX2
test `:710` fails it at any hour. Unrelated to the mutants, five integration tests timed out at 30 s inside two unit runs
under the parallel load (A01: `backup-prune`, `backup`, `bootstrap`; A04: `deadline-race`), R-UX3B-6. Every mutated file was
reverted and compared identical to the clean export (`60-mutants.txt`).

## Findings

1. **F-UX3B-1, Low (sweep finding 12): the Check out dialog shows an empty list while the server keeps the saved rows the
   person removed.** `src/client/components/breakRowsModel.ts:389-391` (an empty unticked list omits `breaks` at Check out),
   `src/client/components/ClockOutDialog.tsx:103` (label "Check out, breaks unconfirmed") and
   `src/client/components/BreakRows.tsx:289-292` (the hint says nothing about saved rows).
   - Reproduction (`43-dialogs-obs-run2.txt` F1-F4, `audb-f12-*-synthetic.png`; `49-f12b-obs.txt`): seed through the API a
     running session with an unconfirmed break (POST `/api/days/{today}/sessions` with `end: null`); the dialog opens with
     the row and "Check out with these breaks"; Remove break 1: the list says "No breaks listed." and the button "Check out,
     breaks unconfirmed"; Check out sends `{breaks_confirmed: false, expected_version}`; the session card then shows the
     removed break (22:00, 15 min) as "Breaks not confirmed". When the saved row ends after now, the same steps give 422
     "A saved break ends after this Check out; resubmit the complete list of breaks to replace it" about a break the dialog
     no longer shows.
   - Expected: what the dialog shows is what Check out records (U-24, U-25), and E-1 keeps working: when the dialog started
     with saved rows and the person removed them all with the box unticked, either send the empty list unconfirmed
     (`breaks: []`, `breaks_confirmed: false`, which the server accepts as the complete unconfirmed set and which replaces the
     rows) or keep omitting but say in the dialog that the saved breaks are kept unconfirmed. Matches E-1 at the API and
     a643794's outcome after a removal (its pending mode also omitted the list), but a643794 did not default to confirming
     these rows, and the round-3 dialog makes the list look complete.
   - Reach and effect: only through the API today (no UI path saves rows on a running session); no figure changes (the breaks
     stay unconfirmed and OT pending). Bounded fix: the Check out branch of `breaksPayload`/`buildCheckOutDialogRequest` or
     the dialog text, one e2e test, and docs/04 line 70 plus docs/10 (EN and VI) if the behaviour changes.
2. **F-UX3B-2, Low (docs/code mismatch): "Confirm breaks" lists no suggestion unless every suggested break fits, but docs/04
   describes listing those that lie inside the session.** `docs/04_UX_AND_SETTINGS.md:65` and `.vi.md:65` against
   `src/client/components/SessionDialog.tsx:243-247` and `src/client/components/dayEditorModel.ts:73` (the old all-or-nothing
   `quickBreaksOf` rule).
   - Reproduction (`48-phone-obs.txt`, lines C): unconfirmed sessions 09:00-12:00 and 09:00-14:00 without rows: "Confirm
     breaks" opens the dialog with 0 rows; "Suggest breaks" in the same dialog then lists 1 and 2 rows that lie inside; a
     09:00-18:00 session opens with 3 rows.
   - Expected: docs and code agree. a643794's docs/04 line 64 said "only when every suggested break lies inside the saved
     session"; the round-3 line 65 says "the suggested breaks that lie inside the session; if none fits, Save asks". Either
     restore "every" in docs/04 line 65 (EN and VI) and docs/10 line 245 (VI 246), or list the fitting suggestions (a
     behaviour choice for the coordinator, consistent with the new-session pre-fill, which keeps those inside).
   - Effect: no data risk (Save always asks or confirms what is listed); the canonical UX text misdescribes the entry.

## Risks and optional improvements (not proven defects)

- **R-UX3B-1** After a mode switch across 1360px while the session dialog is open, the editor re-shows after the dialog
  closes and takes focus on its heading instead of returning it to "Add session" or Edit (docs/04 line 68). A defined target;
  rare trigger.
- **R-UX3B-2** With the page left open across the reporting-zone midnight (no focus or visibility change), the session
  dialog keeps the old `today_local` until the periods are read again: the new yesterday gets hours only. Conservative (never
  suggests for today).
- **R-UX3B-3** docs/12 line 71's first sentence (unchanged since before round 3) says Check out is refused "while a break row
  is unconfirmed"; Check out with a saved unconfirmed row inside the session and an omitted list succeeds (C23). The refusals
  are `saved_break_after_clock_out` and `future_break`.
- **R-UX3B-4** (area A, for AUDIT-A/INT) `src/client/components/dayModel.ts:143`, the batch stale-version alert, still says
  "review the new labels" (G-2 a: "category"); seen in the FIX1 probe.
- **R-UX3B-5** When the typed start equals the pre-filled one, the pre-fill's pinned offset is sent (K09-K11): the same
  instant; on a reference time inside a DST fold the earlier instant is taken without a question, as documented for schedule
  times.
- **R-UX3B-6** Under heavy parallel load the integration tests `backup-prune`, `backup`, `bootstrap` and `deadline-race`
  timed out at 30 s inside two mutant unit runs (not area B; both mandatory `npm test` runs passed).
- **R-UX3B-7** A filled minutes field shows only the number (the placeholder "total mins" disappears; the name "Break n
  minutes" is hidden text); "ends 10:15" next to it gives the context.

## Required gates unrun or blocked

None of the area-B items. Not repeated by this audit: the DPR 2 seam crops and the regate's two mobile timeouts (area A by the
coordinator's decision); a second browser engine (none installed).

## Disposition of previous findings

- WP5-UX3-GATE attempt 1, seed flake: closed (section 8). Sweep findings in area B: 2 closed (A09), 5 closed, 8 closed,
  10 closed; 12 reproduced and raised as F-UX3B-1 (the coordinator accepted it as documented E-1 behaviour; this audit judges
  that the dialog misleads).

## Software readiness, owner permission and pilot

Software readiness of round 3 waits for the fix of F-UX3B-1 and F-UX3B-2 (or a recorded coordinator or owner decision for
each), a regate and a fresh recheck. Owner permission for the pilot and the pilot result are separate and not affected.

## One next action

Coordinator: decide F-UX3B-1 (send the empty unconfirmed list, or say in the dialog that saved breaks are kept) and F-UX3B-2
(restore "every" in docs/04 line 65 and docs/10 line 245, VI 246, EN and VI, or list the fitting suggestions); dispatch one bounded fix
(`addresses_audit` WP5-UX3-AUDIT-B), its freeze, a docs-delta or targeted regate, and a fresh area-B recheck.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX3-AUDIT-B attempt 1 (agent a5ec67dc3fe32bb69 on the board);
  authors of the snapshot: the WP5-UX3 slice, fix and freeze agents listed on the board (T06 aeba6338447954b75, T07
  a87232fc0935fad79, T08 a0a4fd9361c7d74ea, T08B aba507cf0ab52b865, T09 a37c4616fc5da2e56, T10 aaffa913996c18d12, FIX1
  a96e41f7ee27175f4, FIX2 a457a761b24922fa2, and the others).
- Fresh context; the reviewer authored no change of this snapshot and edited no source, test, docs, board or STATE file.
- Source digest before and after: `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191` (833 files), three forms
  each time (`01-digest-*-before.txt`, `01-digest-*-after.txt`); the regate's PASS is on the same snapshot.
- New report path; no earlier area-B review of round 3 existed; every earlier review file is unchanged.
- Finding dispositions and the next coordinator task: above.
- Rule slips (read-only, no effect): one listing piped into `head`, a progress read and an `od -c` read of the brief's last
  bytes piped into `tail`, one wait loop
  whose `grep` sent its error output to the null device, and one leftover `python -c "print(1)"` no-op written to a task
  file. Probe corrections
  (recorded, not product findings): the first a643794 request run waited for the wrong confirmation text (three one-tap
  cases); the first dialog run had a race in my Check out probe, a wrong dirty assumption and a shared-view day opener; the
  first figures run read a wrong key. Nothing was fed to an interpreter through stdin, no recursive delete, no process killed.
