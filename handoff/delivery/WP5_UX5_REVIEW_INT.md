# WP5 UI change rounds 4 and 5, integration audit on a5cbc91 (WP5-UX5-AUDIT-INT)

[Tiếng Việt](WP5_UX5_REVIEW_INT.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5, owner-requested UI change rounds 4 and 5 (one package-final snapshot,
  owner decision Q0 a), the integration pass whose PASS would re-accept WP5; task WP5-UX5-AUDIT-INT, attempt 1, 2026-10-29 from 07:55Z
  to about 09:20Z (00:55 to about 02:20 on Thursday in America/Los_Angeles; the displayed period 10/12-10/25 has ended and is
  shown through its payroll date 10/30, so the real clock is a window day). Reviewer self-reported model `claude-opus-5-5` (board agent
  `abc262afcf62ce6a7`), profile timesheet-auditor (effort set by the profile, not observable from inside). The strongest author model of
  the snapshot on the board is `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN, WP5-UX5-T01B, WP5-UX5-DIAG7); every other
  author is `claude-sonnet-5-5` or records no model with sonnet requested (`01-author-models.txt`), so the reviewer is not weaker. My
  agent id appears on the board only on this task: I authored no WP5-UX4 or WP5-UX5 task and none of their audits.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `a5cbc91e6965633a0f9d1dd7e912577321cc71e3` (WP5-UX5-FIX17-FREEZE, pushed; WP5-UX5-REGATE12's `freeze_commit`). HEAD = origin/main =
  that commit before and after; no status line outside `handoff/` before or after. Digest
  `69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf`, 882 files, `handoff/` excluded, equal in three forms at
  07:55:37Z and at 09:08:47Z: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form (the
  sorted list byte-identical to the export's) and `npm run digest` in the repository. No unpushed commit. Source complete: `npm ci` exit
  0 in three exports. The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest 507de97c); 223 paths differ outside
  `handoff/` between it and the target.
- **Decision: FIX REQUIRED.** One new Low finding, F-UX5I-1: since round 4 made the desktop Day editor non-modal at every width, a Check
  in or Check out pressed on the page while the editor is open leaves the editor showing the day as it was (no running session after the
  Check in, no ended session after the Check out) while the sheet behind it follows, and a note typed in the editor before the clock
  action is then refused on save ("This day changed since it was loaded"); reproduced at 1440px and 1280px. Nothing is stored wrongly or
  lost silently, but the drawer states wrong facts and an everyday flow needs a retyped note. Everything else in scope holds:
  - Integration (section 1): every finding of the rounds is closed by a named recheck; every owner item U4-01..U4-15 and U5-01..U5-34
    and every answer is mapped to the review that judged it; every gate FAIL reason has a verdict; every recorded risk has a status; the
    load rule adopted after REGATE11 is sound and errs towards FAIL; the logo sweep's load sensitivity is an accepted backlog risk.
  - Areas (section 2): RECHECK-A2's area-A PASS still holds (no client file changed; FIX17's two e2e files prove what the old ones proved);
    RECHECK-B3's area-B PASS is confirmed.
  - Probes (section 3): restore with a correction behaves as docs/05:72, docs/11 section 7 and docs/12:114 say, step by step on the
    Review page and in History; the Day editor guard holds across the midnight on the desktop and the phone (the desktop run's last step
    met UX4-A risk 1, the floating drawer over the page's Check out at 1280px; the phone run saved the note and ended the session under
    10/26); the theme follows across tabs with the editor and the account menu open, keeping the note and asking nothing; shared views
    (view and edit) keep the round-5 header, sheet and dialogs, stay on the shared mount and pass axe-core 4.14.0 in light and dark.
  - Test design (section 4): enough for this release; the gaps are optional test-strength items.
  - AC-13 under three device zones, the docs in EN and VI, and every mandatory check pass: typecheck, lint, build, `npm test` (101 files,
    2,397 tests), the real-clock FULL e2e (desktop 469/35/0, mobile 407/97/0) and the seven-file run at 2026-10-27T06:58:30Z (384 passed,
    0 failed).
  - New optional risks R-UX5I-1..4; the optional backlog for the WP5 handoff is listed separately.

## Scope actually inspected and executed

1. Read as claims, not proof: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); docs/08 "Gates and independent
   audit"; the board's `owner_decisions` of 2026-10-20 to 2026-10-23 verbatim (the round-4 request and its F-1..F-5 and D answers, R2-R5,
   the round-5 request, F-1..F-10 with the mockup adjustments, mockup notes 2, adjustment 3 and its correction, G-1, "1 a, 2 a",
   "A.a, B.A, C.b", the push lift, "D.a, E.a", the ff-only request) and every answered question record of rounds 4 and 5; the
   `coordinator_decisions` of 2026-10-20 to 2026-10-22 and the decisions recorded in the board's pause note and task records (the load
   rule, the fence, option A, the cross-tab fix); WP5-UX4-PLAN and WP5-UX5-PLAN (item lists, F sections), PLAN-FIX7 and PLAN-FIX7A; every
   review of the rounds (WP5_UX4_REVIEW_A/B, WP5_UX5_REVIEW_A/B, WP5_UX5_RECHECK_A, _B, _A2, _B2, _B3); every gate record (WP5-UX4-GATE,
   -REGATE, -REGATE2, WP5-UX5-GATE, -REGATE to -REGATE12); every diagnosis and fix record (WP5-UX4-FIX1..3, WP5-UX5-DIAG1..10, DEPS1,
   FIX1..FIX17) on the board, and in full the ones my judgements rest on (DIAG9, DIAG10, REGATE12, FIX10's wrapper); docs/04, 05, 10, 11
   and 12, EN and VI, as frozen.
2. Diffs and code: `git diff be2afa2..a5cbc91` (the area-A carry-forward, `20-*`, `21-*`, `22-*`), and from each earlier reviewed commit
   to the target (0ddfead, 57c41e8, f4049aa, a5533b5, be2afa2; `23-diffs-earlier-pass-areas.txt`); `restore.ts` `blockerOf` and the job
   state writers; `TimesheetScreen.tsx` (the refresh listeners, the clock reload, the outside press), `DayEditor.tsx` (its loads),
   `SendCard.tsx`, `deliveryModel.ts`, `DayFieldsForm.tsx`, `LeaveDialog.tsx`, `AccountMenu.tsx`, `OperationsStatus.tsx`, `fixtures.ts`
   (the fence), `today.spec.ts:627` and `:764-783`, `timesheet-api.test.ts:125-148`.
3. Mandatory checks in a clean `git archive` export of the target with its own `npm ci` (`export`), one after another and alone on the
   host, with a census before and after each e2e run.
4. Own cross-area probes in a second export (`export-probe`: the same archive, its own `npm ci` and build; only my `zz-int-*.spec.ts`
   files and a port helper that keeps the harness on ports 51470-51489 were added; my restore servers used 51460-51462): restore with a
   correction, the Day editor guard across the midnight (FIX10 clock), the cross-tab theme with the editor and the account menu open,
   shared views (view and edit) with axe-core 4.14.0 from the task folder, and the open Day editor across a check in and out from the
   page (added when the midnight probe pointed at it).
5. One test-design mutant in a third export (`export-mut`): the page's focus and visibility refresh removed, run against the crossing
   test at the gate's instant and at a both-dates instant, and against the refresh-trigger tests; restored byte-equal and rebuilt.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/` (index `00-README.txt`). Probe, mutant and script
sources are kept as `90-*.txt`; the board extract with the author models is `01-author-models.txt`; my rule slips are `99-slips.txt`.

| Command or probe | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest in three forms, first and last | HEAD a5cbc91 = origin/main; no line; `69c6daff…e6bf`, 882 files, at 07:55:37Z and 09:08:47Z | `00-*`, `01-digest-*.txt` |
| mandatory checks (section 7) | all exit 0; FULL 469/35/0 and 407/97/0; seven-file 384/84/0 | `03-*`, `04-*`, `08-*` |
| diffs from each earlier reviewed commit to the target | listed in sections 1.2 and 2 | `20-*` to `23-*` |
| restore with a correction (run 2; run 1 kept as a probe defect) | exit 0; every step as documented (section 3.1) | `40-obs-restore.txt`, `41-log-probe-restore-run2.txt`, `*-run1-probe-defect.txt` |
| the Day editor guard across the midnight (FIX10 clock, 06:58:00Z), desktop and phone | the guard holds; the desktop run ended at a click on the page's Check out that the floating drawer covers (UX4-A risk 1); desktop exit 1 at that step, every guard step before it passed; the phone run exit 0, the note saved and the session ended under 10/26 | `41-obs-midnight.txt`, `41-log-probe-midnight-*.txt` |
| cross-tab theme with the editor and the account menu open, 1280, 1440 and the phone | exit 0; followed both ways, the note kept, nothing asked | `42-obs-theme.txt`, `41-log-probe-theme.txt` |
| shared views, view and edit, 320-1440px, light and dark, axe-core 4.14.0 | run 2 (phone) and run 6 (desktop) pass; 0 violations in every settled scan | `43-obs-shared-run2.txt`, `43-obs-shared-run6.txt`, `41-log-probe-shared-*.txt` |
| the open Day editor across a check in and out from the page, 1440 and 1280px | the editor does not follow; the later save is refused (F-UX5I-1) | `44-obs-clock-editor.txt`, `41-log-probe-clock-editor-run2.txt` |
| test-design mutant: the focus and visibility refresh removed | the mutant passes the crossing test at the gate's 2026-10-27T06:58:30Z on both projects (exit 0) and fails it at 2026-11-04T07:58:50Z (desktop and mobile exit 1; the unmutated control exit 0); the refresh-trigger tests `:764`, `:769` kill it on both projects (2 of 2 failed each); restored byte-equal, `dist/` identical to the clean export | `50-mut-exits.txt`, `51-log-*.txt` |
| EN/VI parity of seven doc pairs | structure identical; code spans differ only by translated placeholders | `60-docs-parity.txt` |
| census before and after each run | 1.5-2.3 busy cores around every mandatory run; 1.33-2.58 before each probe; 1.64 at the end (09:07:33Z) | `10-census-*.txt` |

## 1. Integration of the rounds' records

### 1.1 Every finding of the rounds

| Finding (review, snapshot) | Severity | Fix | Closed by (own evidence of the closing review) | Status at the target |
|---|---|---|---|---|
| F-UX4A-1 classic-scrollbar flap (WP5-UX4-AUDIT-A, 0ddfead) | Medium | FIX2, then owner R5 b in FIX3 | WP5-UX5-AUDIT-A (0 layout changes in 3 s, beside from 1345px) | closed; `classic-scrollbar.spec.ts` passes in my FULL run |
| F-UX4A-2 Escape on a sheet control | Low | FIX2 | WP5-UX5-AUDIT-A | closed |
| F-UX4A-3 focus after Current period | Low | FIX2 | WP5-UX5-AUDIT-A | closed |
| F-UX4A-4 docs/04 two claims | Low | FIX2 | WP5-UX5-AUDIT-A | closed |
| F-UX4B-1 sign-in fills the password-change bucket (WP5-UX4-AUDIT-B) | Low | FIX2 (`login:` key space) | WP5-UX5-AUDIT-B (six crafted sign-ins leave the change at 200) | closed; `routes/auth.ts` unchanged since 57c41e8 |
| F-UX5A-1 signed footer on a narrow Review (WP5-UX5-AUDIT-A, f4049aa) | Medium | FIX8 | WP5-UX5-RECHECK-A (36 measurements) | closed |
| F-UX5A-2 SC 2.5.3 "Change days" | Low | FIX8 | WP5-UX5-RECHECK-A | closed |
| F-UX5A-3 a scroll closes the Day editor | Low | FIX8 | WP5-UX5-RECHECK-A (Chromium only; R-A2-1, R-A2-2) | closed |
| F-UX5A-4 docs truth (area A) | Low | FIX8 | WP5-UX5-RECHECK-A | closed |
| F-UX5B-1, -2, -4 docs truth (WP5-UX5-AUDIT-B) | Low | FIX7 | WP5-UX5-RECHECK-B | closed |
| F-UX5B-3 PDF leave on a long holiday label | Low | FIX7 (code route) | WP5-UX5-RECHECK-B (2,304 renders) | closed |
| F-UX5B-5 two tests that could not fail | Low | FIX7 | WP5-UX5-RECHECK-B (M12b, M11 killed) | closed |
| F-UX5A2-1 read-only week card ring (WP5-UX5-RECHECK-A, a5533b5) | Low | FIX11 | WP5-UX5-RECHECK-A2 (96 states) | closed |
| F-UX5B2-1 restore release of a superseded send (WP5-UX5-RECHECK-B) | Low | FIX11 (period join) | partly; WP5-UX5-RECHECK-B2 found F-UX5B3-1 | closed through F-UX5B3-1 |
| F-UX5B3-1 later send in `intervention` (WP5-UX5-RECHECK-B2, be2afa2) | Low | FIX16 | WP5-UX5-RECHECK-B3 (12/12, A-D 13 PASS, X1-X6) | closed; my restore probe (section 3.1) |

Defects found by gates and diagnoses rather than audits were fixed and rechecked the same way: the SC 2.4.11 walk (FIX1, round 4), the
History scroll region (FIX1, round 5), the read-only week cards' keyboard access (FIX9, RECHECK-A), the late dirty report (FIX13,
RECHECK-A2) and the cross-tab theme (FIX14, RECHECK-A2).

### 1.2 Earlier verdicts, carried forward only where the later diffs leave them valid

Diffs checked (`23-diffs-earlier-pass-areas.txt`, `20-diff-a2-target.txt`), from each reviewed commit to the target, outside `handoff/`:

| Earlier verdict | Reviewed commit | What changed since in its area | Carried? |
|---|---|---|---|
| WP5-UX4-AUDIT-A/-B item passes (round 4) | 0ddfead | round 5 rebuilt the period card, toolbar, Day editor, Review and PDF (82 source files); the round-4 server files (`auth.ts`, `timesheetCommands.ts`, holiday import, ledger, workbook import) changed last in FIX2/FIX3 (57c41e8) and not since | only through the round-5 reviews: UX5-AUDIT-A rechecked F-UX4A-1..4 and the round-4 behaviours its items touch; UX5-AUDIT-B rechecked F-UX4B-1 and the round-4 server changes (`git diff 57c41e8..` empty for them); every round-4 test passes in my FULL run |
| WP5-UX5-AUDIT-A item passes | f4049aa | client: `TimesheetScreen.tsx` (FIX8 touch and scrollbar), `ReviewScreen.tsx`, `SignoffDialog.tsx`, `styles.css` (FIX8, FIX9, FIX11), `TimesheetSheet.tsx` (FIX9, FIX11), `DayFieldsForm.tsx` (FIX13), `App.tsx`, `ThemeToggle.tsx` (FIX14), two strings of `deliveryModel.ts` (FIX7) | yes: each change was rechecked by RECHECK-A (FIX8, FIX9) or RECHECK-A2 (FIX11, FIX13, FIX14) |
| WP5-UX5-AUDIT-B item passes | f4049aa | server: `deliveries.ts` (option A), `timesheetPdf.ts` (`drawCategory`), `restore.ts` (FIX11, FIX16); the drill's fetch headers | yes: RECHECK-B (FIX7), RECHECK-B2 (FIX11), RECHECK-B3 (FIX16) |
| WP5-UX5-RECHECK-A2 PASS (area A) | be2afa2 | no client file; FIX17's two e2e files | yes (section 2) |
| WP5-UX5-RECHECK-B3 PASS (area B) | a5cbc91 | nothing (the target) | yes |

### 1.3 Owner items and answers, each with the review that judged it

Round 4 (owner request of 2026-10-20, 15 items U4-01..U4-15, and its answers):

| Item or answer | Judged by | Verdict there | Later change and its judge |
|---|---|---|---|
| U4-01 settings export and import (F-3 a, F-4 a) | WP5-UX4-AUDIT-B section 8; WP5-UX4-AUDIT-A (cards, preview dialog) | pass | none in round 5 except the `show_time_on_pdf` key (WP5-UX5-AUDIT-B item 8) |
| U4-02 title gap 32px (F-5) | WP5-UX4-AUDIT-A | pass | unchanged; `controls.spec.ts:49` passes at the target (FIX14 wait) |
| U4-03 paper on Timesheet and Review (F-5: toolbar, weeks, footer unchanged; two signature rows) | WP5-UX4-AUDIT-A | pass | the Review part was redesigned by U5-27..U5-32 (WP5-UX5-AUDIT-A, RECHECK-A) |
| U4-04 round switches | WP5-UX4-AUDIT-A | pass | unchanged |
| U4-05 non-modal drawer, switch, unselect | WP5-UX4-AUDIT-A | pass except F-UX4A-2/-3 | fixed (UX5-AUDIT-A); FIX13's same-task dirty report (RECHECK-A2) |
| U4-06 corners | WP5-UX4-AUDIT-A | pass | superseded by the owner's U5-23 (square), WP5-UX5-AUDIT-A |
| U4-07 float only when the columns would overlap | WP5-UX4-AUDIT-A | F-UX4A-1 | FIX2, owner R5 b, FIX3; WP5-UX5-AUDIT-A |
| U4-08 select arrow | WP5-UX4-AUDIT-A | pass | the seam fix U5-03, WP5-UX5-AUDIT-A |
| U4-09 checkbox centring | WP5-UX4-AUDIT-A | pass | unchanged |
| U4-10 "Show worked hours" (coordinator's answer to the rename question) | WP5-UX4-AUDIT-A | pass | superseded by the owner's U5-18 "Worked hours", WP5-UX5-AUDIT-A |
| U4-11 edit the start of a running session | WP5-UX4-AUDIT-A (UI), WP5-UX4-AUDIT-B section 2 (figures, shared guard) | pass | owner R2 a (delete through a share refused) in FIX3, WP5-UX5-AUDIT-B item 9 |
| U4-12 zone above the times | WP5-UX4-AUDIT-A | pass | unchanged |
| U4-13 Today and Now links, right-aligned (F-5) | WP5-UX4-AUDIT-A; WP5-UX4-AUDIT-B section 3 (zones) | pass | unchanged |
| U4-14 aligned break rows | WP5-UX4-AUDIT-A | pass | unchanged |
| U4-15 the save-error alert (also in Check out, coordinator decision) | WP5-UX4-AUDIT-A | pass | unchanged |
| F-1 (i) opening balance; D-5 a; D-10 per F-1 | WP5-UX4-AUDIT-B section 5 | pass | unchanged since 57c41e8 (UX5-AUDIT-B item 9) |
| F-2 (b) holiday-preview counts with an audit event (D-15 b) | WP5-UX4-AUDIT-B section 7 | pass, within the approved exception | unchanged |
| F-5 mockup with the named changes | WP5-UX4-AUDIT-A item table | pass | round 5 changed the same screens at the owner's request |
| D-1..D-15 (documentation answers, D-6 a, D-8 a, D-9 b code) | WP5-UX4-AUDIT-B sections 4, 6, 9, 11 | pass (F-UX4B-1 for D-9 b, fixed) | unchanged |
| R2 a, R3 b, R4 a, R5 b (answers of 2026-10-21) | R2 a and R5 b: FIX3, WP5-UX5-AUDIT-A/-B; R4 a: no change; R3 b: dropped as superseded by the round-5 Review redesign (coordinator decision 2026-10-21, owner told) | pass | R3 b's two-column Review no longer exists (the checklist moved into the Sign off dialog) |
| FREEZE1-Q a, FREEZE2-Q a (commit permission) | process; WP5-UX4-T01-FREEZE and its recon | done | - |

Round 5 (owner request and answers of 2026-10-21 and 2026-10-22):

| Item or answer | Judged by | Verdict there | Later change and its judge |
|---|---|---|---|
| U5-01..U5-32 (UI items) | WP5-UX5-AUDIT-A item table | pass except U5-17b (F-UX5A-2), U5-24 (F-UX5A-3), U5-30 (F-UX5A-1) | FIX8, RECHECK-A; FIX9/FIX11 (week-card keyboard access and ring), RECHECK-A/A2; FIX13, FIX14, RECHECK-A2 |
| U5-33 sign-off and send split (server) | WP5-UX5-AUDIT-B items 1-4 | pass | FIX7 option A, FIX11, FIX16 (RECHECK-B, B2, B3) |
| U5-34 the PDF | WP5-UX5-AUDIT-B items 5-7; T02 geometry and `pdf-layout.test.ts` "matches plan Addendum 2 within 1 pt" | pass except F-UX5B-3 | FIX7, RECHECK-B |
| F-1 a 36px with a 44px hit area | WP5-UX5-AUDIT-A U5-05 | pass | unchanged |
| F-2 a "submitted" = sent | WP5-UX5-AUDIT-B item 3 | pass (F-UX5B-4 docs) | RECHECK-B |
| F-3 b per-send switches, Settings defaults | WP5-UX5-AUDIT-B items 2, 5, 8 | pass (F-UX5B-5 test) | RECHECK-B |
| F-4 per-send envelope and the reason rule | WP5-UX5-AUDIT-B item 2 | pass (F-UX5B-5 test) | RECHECK-B |
| F-5 b image optional | WP5-UX5-AUDIT-B item 1 | pass | unchanged |
| F-6 a compact form below 480px only | WP5-UX5-AUDIT-A U5-01 | pass | unchanged |
| F-7 a a press outside closes | WP5-UX5-AUDIT-A U5-24 | F-UX5A-3 | FIX8, RECHECK-A |
| F-8 a no instructions; F-9 b Indie Flower (G-1); F-10 a Revision n with the id | WP5-UX5-AUDIT-B items 6, 7 | pass | unchanged since FIX7 (`drawCategory` only) |
| Mockup adjustments B1, B2, B5, B7/B9 | WP5-UX5-AUDIT-A U5-09, U5-17, U5-25, U5-30 | pass (B7/B9 revisit: F-UX5A-1) | RECHECK-A |
| B11 (PDF) and mockup notes 2 (b11 fields 1.5 tabs, WEEK centred, day names) | T02 geometry, `pdf-layout.test.ts` (54 pt field inset, rotated label centred, signature block), WP5-UX5-AUDIT-B item 6 (content) | pass | the owner's own look at the samples is pending (pilot packet) |
| Mockup notes 2: b2 "Change days", b7/b9 Sign off at the line end | WP5-UX5-AUDIT-A U5-17b, U5-30 | pass except F-UX5A-2 | RECHECK-A |
| Adjustment 3 and its correction (signature rows indented as b11) | WP5-UX5-AUDIT-A U5-30, WP5-UX5-RECHECK-A (fractions 0.0352 / 0.2741 / 0.4445 / 0.1370 / 0.1092) | pass | unchanged |
| H-1 a ("1 a, 2 a") | WP5-UX5-AUDIT-B item 3 (H-1 probe, mutant M6) | pass (F-UX5B-4 docs) | RECHECK-B |
| FREEZE-T01B-Q a ("1 a, 2 a") | process; WP5-UX5-T01B-FREEZE attempt 2 | done | - |
| Q0 a (fold round 4), Q1 (reference image not stored), Q2 (footer texts) | Q0: every round-5 review covers both rounds; Q1: no tracked image without "synthetic" (my check, 979 of 979); Q2: WP5-UX5-AUDIT-B item 6 and `timesheetPdf.ts:104/:556` | pass | - |
| "A.a, B.A, C.b", "Từ giờ ... push", "D.a, E.a", the ff-only request | process (REMOTE-RECON, REMOTE-RECON2, the freezes); Ingat files checked for non-interference by REGATE2, REGATE3 and WP5-UX5-AUDIT-B item 10 | done | `git.unpushed` empty; HEAD = origin/main |

### 1.4 Every gate FAIL reason, with a verdict

| Gate (snapshot) | FAIL or NOT VERIFIED reason | Diagnosis and fix | My verdict at the target |
|---|---|---|---|
| WP5-UX4-GATE (a3042dd) | SC 2.4.11: a control wholly under the left-docked drawer at 1280x800 (product) | FIX1 `whollyCovered` clipped to the window with a 1px tolerance; walks | closed (WP5-UX4-REGATE walks, UX4-AUDIT-A 96 walks; unchanged code since, walks in the suite pass) |
| same | sweep test defects: `sharing.spec.ts:399` window day, U4-11 Sunday, U4-05 reachability, a contrast read before the theme settled, a seed at 23:58:30 | FIX1 (tests) | closed: test defects, product right (UX4-AUDIT-B oracle for the Sunday figures) |
| same | `keyboard-access.spec.ts:227` mobile: the lazily loaded card moved "Import from Excel" | FIX1 waits for the card; product mitigation left as UX4-AUDIT-A risk 3 | closed as a test defect; the layout shift is an accepted optional risk |
| WP5-UX4-REGATE2 (178f1cf) NOT VERIFIED | stopped early; `hover.spec.ts:125` mobile settled-style timeout | FIX3 event-based `settledStyle` | superseded by the round-5 gates; the test passes in every later FULL run |
| WP5-UX5-GATE (e2bf1aa) | drill `--wp3`: the previous build needs `signer_name` | FIX1 (drill only) | closed: drill 209/0 since REGATE |
| same | four date or DST test defects in the sweep | FIX1 (tests) | closed |
| same | axe `scrollable-region-focusable` on History (pre-existing) | FIX1 `TableWrap` | closed (axe 0 in later gates and audits) |
| WP5-UX5-REGATE (2bce0ab) | `theme.spec.ts:605` bar size read one frame stale | DIAG1 (test), FIX2 poll; border-box hardening left as risk R1 | closed; R1 open, optional |
| WP5-UX5-REGATE2 (7aafa21) | `settings-routes.spec.ts:16` and `controls.spec.ts:640` | FIX3: wait for the sign-in form; `settledSelect` | closed (test races) |
| WP5-UX5-REGATE3 (5b8b718) | `npm audit --omit=dev`: nodemailer and zod advisories | DEPS1, FIX4 exact pins 10.1.4 and 4.6.6 | closed (audit 0 at REGATE4 and REGATE11; dist identical since) |
| same | `timesheet.spec.ts:1216` across the midnight; `review.spec.ts:616` late image; ECONNRESET | DIAG2, FIX5 (poll, image wait, `connection: close`) | closed; the late image shift is risk R2 |
| same | repository verify timeouts under load | DIAG3, FIX6 vitest `maxWorkers: '50%'`, smoke and drill hardening | closed as a harness matter (R-UX5B-4 records the evidence base) |
| WP5-UX5-REGATE5 (94accda) | the logo timeout: `logo.spec.ts:508` 240 s under load | DIAG4, FIX10 (four contexts, split test, decoded surface, one evaluate) | closed: 46.7 s of 240 s in my FULL desktop run; load sensitivity stays a backlog risk (section 1.5) |
| WP5-UX5-REGATE7 (0f52300) | a measuring race: `review.spec.ts:406` read 8 px off centre at 767px | DIAG5, FIX12 `expectLayoutAt` / `expectSheetAt` (and the R3 restore case) | closed; RECHECK-A2 MB10/CTL10 prove the helper is what holds them |
| WP5-UX5-REGATE8 (bb8d340) | the same class on mobile: `controls.spec.ts:49` 74.8 px | DIAG7 (expert, escalation), FIX14 waits in controls | closed; the cap did not fire again |
| same (DIAG7 completeness) | the range ladder `timesheet.spec.ts:2596`; a starved tab `theme.spec.ts:376` | DIAG8, FIX14 `stepPeriod`, `bringToFront`, and the cross-tab theme product fix | closed; my theme probe (section 3.3) |
| same (FIX12 completeness) | `keyboard-access.spec.ts:267` and `day-editor.spec.ts:5304` | DIAG6, FIX13 (`toBeEnabled`; `useLayoutEffect` dirty report, product) | closed; RECHECK-A2 and my midnight probe |
| WP5-UX5-REGATE9 (bd9c275) | the midnight date reads: `day-editor.spec.ts:2340` polled the pre-midnight date | DIAG9, FIX15 (clockIn by the start's own date, the fence, the boundary test) | closed: 0 failed in my seven-file run at 06:58:30Z; coverage judged in section 4 |
| WP5-UX5-REGATE11 (1fe5ad3) | the starved tab again: `import.spec.ts:102` 30 s timeout at 6-7 non-mission cores | DIAG10, FIX17 (`bringToFront`; the crossing test's second window in its own context) | closed: the class has no other member (my grep of every `newPage(`/`newContext(` at the target) |

### 1.5 The gate load rule adopted after REGATE11, and the logo sweep

The rule (REGATE12 brief, "The load rule", with Addendum 1): stop at the entry census when the non-mission load is above about 8 busy
cores (first 4); take a census at the end of each sweep and right after any failure; classify every failure from its trace; a timeout
whose trace shows host starvation (fast server answers, a slow or stalled browser step) while the census right after it is over the limit
makes that run NOT VERIFIED, and the run is repeated once after the load is back within the limit (both runs recorded, the repeat must
pass); a network or buffer error is repeated once; every other failure fails the gate; no rerun turns an assertion failure into a pass.

Judgement: sound, and it does not waive a product fault.
- It never relabels a slow server: the class needs a trace with fast server answers, and DIAG10's trace of the REGATE11 failure shows
  exactly that (36 requests answered, the slowest 245 ms; no commit request ever sent; the tab behind starved for 8.8 s and more).
- Its threshold rests on measurement, not on the figure that happened to fail: 0 failures at 3-8 non-mission cores in 198 runs, 0 in a
  1,068-test mixed run at 10-14 cores, failures only when the total demand passed the 32 logical cores (DIAG10 dose table). 8 is
  conservative for this host with 6 workers.
- It errs towards FAIL: a spike that ends before the census leaves the failure a FAIL, which costs a diagnosis round, never an acceptance.
- My runs: entry census 1.73 busy cores, 1.5-2.3 around each FULL run (`10-census-*.txt`), so no run of mine came near the limit.
- Two limits worth recording (optional, process): the rule lives in a gate brief and the DIAG10 record, not in docs/08 or a template, so a
  later gate depends on the coordinator copying it (making it permanent is a GOV change); and "a timeout" does not say whether a
  Playwright expect timeout (an assertion that timed out on a starved tab, the theme.spec.ts:392 shape) counts. As written such a failure
  fails the gate, which is the safe reading.

The logo sweep (R-A2-5, DIAG10 backlog): frame-bound, not tab-bound. Calm host: my FULL desktop run's longest `logo.spec.ts` test is
46.7 s of its 240 s (`12-logo-durations.txt`); REGATE12's six-worker sweeps 53-96 s. Saturated host (48-thread burner): 168-192 s median,
228 s at worst (DIAG10 Addendum 1). No failure since FIX10, and no product effect (the wordmark rule is CSS and a measured threshold).
Accepted as an optional backlog risk: under the load rule a starvation timeout of this test on a saturated host is NOT VERIFIED and
repeated, and a remedy (more contexts or fewer widths per window, the DIAG4 kind of change) is a test-design choice for later.

### 1.6 Every recorded risk, with its status at the target

| Risk (source) | Status now |
|---|---|
| UX4-A 1 drawer over the period bar's right end when floating | open, accepted (an overlay; one press closes it) |
| UX4-A 2 the reload after a label or batch commit drops typed fields | open, documented (docs/04:69, docs/12:106) |
| UX4-A 3 lazy export/import card shifts the page once | open, optional (reserve the card's height) |
| UX4-A 4 change-password announcements, no `aria-invalid` | open, optional |
| UX4-A 5 `ol.review-steps.plain` indent | obsolete: the round-5 Review has no step list (`review-steps` absent from `src/client`) |
| UX4-A 6 stale `--elev` comment, unused `--scrim-side` | closed by FIX2 (`--scrim-side` absent) |
| UX4-A 7 `width: 30%` literal | closed by FIX2 (`--transfer-row-head-width`) |
| UX4-A 8 forced colours of the switch thumb on real hardware | open, NOT VERIFIED (pilot device check) |
| UX4-A 9 server codes in the alert text | open, optional |
| UX4-A 10 native file input instead of the mockup's button | open, accepted (documented in docs/04) |
| R-UX4B-1 `end: null` with `breaks_confirmed: true` accepted | open, optional (client never sends it) |
| R-UX4B-2 grantee deletes the running session | closed by owner R2 a, FIX3 (409 `shared_clock_action`) |
| R-UX4B-3 Now in the repeated DST hour asks for the fold | open, accepted (R-07 compliant) |
| R-UX4B-4 session token kept on password change | open, optional |
| R-UX4B-5 per-address bucket shared with sign-in | open, accepted (no new capability) |
| R-UX4B-6 implicit-TLS crash in one process (test harness) | open, harness risk only |
| R-UX4B-7 company-file previews write audit events per change | open, accepted (approved behaviour) |
| R-UX4B-8 UTF-8 BOM settings file refused | open, optional |
| R1 `useBlockSize` content box (DIAG1) | open, optional hardening |
| R2 Sign off dialog image shift (DIAG2 B) | open, optional (reserve the image box) |
| R3 ladder forms and fractional widths in a browser | partly closed (FIX8 ladder browser test); fractional widths stay a style-sheet proof (docs/12:117) |
| R4 `aria-label` on a generic div | closed by FIX8 |
| R5 "->" arrow; reason dialog date format | arrow closed by FIX8; date format accepted (app-wide `instantText`) |
| R6 `reviewLinkLabel` unused outside its test | open, optional (`reviewModel.ts:220` still only used by `tests/client/reviewModel.test.ts`) |
| R7 payroll date as "Today" when `/periods/current` fails | open, optional |
| R8 wordmark shown, hidden, shown with a switcher | open, accepted (documented no-new-row rule) |
| R-UX5B-1 cross-revision in-flight sends | closed: option A (FIX7), restore path FIX11 and FIX16; my restore probe |
| R-UX5B-2 dev-only advisories | open, optional dependency round |
| R-UX5B-3 drill fetch sites | closed by FIX7 |
| R-UX5B-4 worker cap evidence; lazy PDF import (FIX6b) | open, optional (FIX6b deferred) |
| R-UX5B-5 position of the reason check (M3) | open, optional test |
| R-UX5B-6 format characters in reason and body | open, optional |
| R-UX5B-7 a GET that renders a variant | open, accepted by design |
| R-A2-1 touch on real tablets | open, pilot device check |
| R-A2-2 overlay scrollbars | open, NOT VERIFIED |
| R-A2-3 resize with a focused card | open, accepted |
| R-A2-4 test strength MA1, MA5, MA8, MA9 | MA1, MA8, MA9 closed (FIX11 tests, RECHECK-A2); MA5 open |
| R-A2-5 logo sweeps load-sensitive | open, backlog (section 1.5) |
| R-UX5B2-1 the retry minute of a send claimed before its PDF (DIAG4 note) | open, documented (docs/12:79); backlog |
| R-UX5B2-2 Resend sees only the current revision | open, optional |
| R-UX5B2-3 how long option A can block | documented known limit (docs/12:114) |
| R-UX5B2-4 G2 and P4 survived | closed by FIX11 tests |
| R-A3-1 theme follower edge cases untested (MB3, MB5) | open, optional tests |
| R-A3-2 the fence: constant zone, untested exemption (MB11, MB12) | open, optional (section 4) |
| R-A3-3 ring on mouse focus (MB8) | open, optional test |
| R-UX5B3-1 midnight second, Tokyo input zone, DST midnight in the boundary test | midnight second closed (FIX16, T4); the extras open as R-UX5B4-2 |
| R-UX5B3-2 the "later" order | closed (FIX16 case E1, N5) |
| R-UX5B4-1..5 (retries used up; the second before midnight; the cancelled invariant; a stale test comment; docs/11:178 same-revision repeat) | open, optional (RECHECK-B3) |
| DIAG5 the one-frame 8 px jump at 768px | open, optional |
| DIAG9 the suite holds tests off the midnight | recorded test-design choice for the WP5 handoff (section 4) |
| DIAG10 the logo sweep's load sensitivity | open, backlog (section 1.5) |
| UX3 R2 the account menu's target-size item at 1440px | accepted in round 3, unchanged (RECHECK-A2) |

## 2. Changes since the area rechecks

`git diff --name-status be2afa2..a5cbc91` outside `handoff/` (`20-diff-a2-target.txt`): `src/server/ops/restore.ts`, two integration
tests, docs/05 EN and VI (FIX16), and `tests/e2e/import.spec.ts`, `tests/e2e/today.spec.ts` (FIX17). No file under `src/client`, no style,
no `tests/e2e/fixtures.ts`, no package or lockfile, no other doc. My build of the target has the entry `index-qNP6kTPW.js`, the same name
RECHECK-A2 and RECHECK-B3 recorded, and REGATE12 found all 250 `dist/` files identical to the 1fe5ad3 build.

**Area A (RECHECK-A2's PASS on be2afa2 / ff73565b): still holds.** FIX16 touches no client file. FIX17 (`21-diff-e2e-a2-target.txt`, +26/-2):
- `import.spec.ts` adds only `bringToFront()` before the steps that drive or read a tab that may be behind (six calls, two comments). No
  step, assertion, budget or poll changed; it proves what it proved, and the tab-behind starvation (DIAG10's trace) can no longer turn
  a 3 s step into a timeout.
- `today.spec.ts:627` opens its second window as a browser context of its own with the first page's storage state, viewport, locale,
  zone and device options, instead of a second tab of the same context, and closes it on both paths. The session is the same (the cookie
  is in the storage state); the test asserts only per-window facts (the Today tag, the inactive state, the jump, the read count), none of
  which depends on shared `localStorage`, and each window is in front in its own context, so the refresh the second window shows is the
  one the test dispatches. Equivalent; no step or assertion loosened. One limit of the test that FIX17 neither adds nor removes is in
  section 4.
- My FULL run on both projects (469/35/0 and 407/97/0) and the seven-file run at 06:58:30Z pass both files.

**Area B (RECHECK-B3's PASS on a5cbc91 / 69c6daff): confirmed.** Same commit and digest. I reread `blockerOf` (`restore.ts:536-564`): a
later send job of the same period (`held.timesheet_id`, `j.rowid > held.rowid`) in any state but `cancelled` blocks; the only writer of
`state = 'cancelled'` in `src/server` is `dropHeldReminder` (`restore.ts:646`), which refuses every kind but a reminder (`:643`), so the
exception cannot be reached by a send job (`33-cancelled-writers.txt`). My own restore probe (section 3.1) drove the release, refusal and
delivery through the UI and the CLI and saw the documented outcome in each step.

## 3. Cross-area probes

### 3.1 Restore with a correction (`zz-int-restore.spec.ts`; `40-obs-restore.txt`)

A built source on port 51460 (`migrate`, `seed`; JOB_RUNNER off, capture mode); the seeded `employee2@example.invalid` (saved recipients
To payroll, Cc manager, and a saved synthetic image) works the displayed period 10/12-10/25 through the Review page in Edge; jobs run only
through `cli.js run-jobs`; backup, isolated restore, `outbound resume --confirm` and `outbound release` through the CLI. What the person
saw, step by step (Review chips and Send card; the Timesheet status shows the same words; History):

| Step | Review page | History and operator |
|---|---|---|
| S0 before the sign-off | "current", "Draft"; Send disabled, "Sign off first" | - |
| S1 signed through the Sign off dialog | "Signed", "Not sent yet"; the footer shows the image, the name and "Signed"; Send enabled | - |
| S2 Send | notice "Send 1 is queued for payroll@example.invalid"; "Submitted manually", "Email queued" | revision 1, "PDF is being prepared", "Email queued", Resend disabled "The PDF is not ready yet."; audit "Revision sent", reason none |
| S3 `run-jobs` | "Email accepted by the mail server"; the button reads "Send another copy..." | attempt 1 accepted, recipients To and Cc |
| S4/S5 a day changed with a reason; "Sign correction" with a reason | "Corrected (revision 2)", "Not sent yet" | revision 2 signed; revision 1 "Superseded" with its accepted attempt |
| S6 "Send another copy..." | the dialog names the earlier copy (recipients, time, "accepted by the mail server"); the reason field starts with the correction's reason; then "Email queued" | audit "Revision sent", reason "Synthetic correction of one day" |
| backup while revision 2's send waits; two isolated restores from it | - | `restore` exit 0 each: outbound paused `restored`, `send_jobs_held` 1 |
| A1 restored, paused | "Corrected (revision 2)", **"Email needs attention"**; "Send another copy..." enabled | revision 2 "Email needs attention", no attempt; administrator status: "Outbound delivery is paused ... Held for reconciliation 1"; preview: 1 held, releasable |
| A2 `outbound resume --confirm` | unchanged ("Email needs attention") | resumed, `held_send_jobs` 1; no banner, one job "Needs attention" |
| A3 `outbound release --job --confirm` | "Email queued" | `released` |
| A4 `run-jobs` | "Email accepted by the mail server" | the PDF and the send ran; one capture folder on the restored instance (the release went out once); nothing held any more |
| B1 the second restored copy, resumed; the owner presses "Send another copy..." | the dialog names revision 1's accepted copy; "Send 2 is queued"; "Email queued" | - |
| B3 preview and release by id | - | the held job is blocked `superseded_by_later_send`; the release exits 1 `refused superseded_by_later_send` |
| B4 `run-jobs` | "Email accepted by the mail server" | revision 2 attempt 1 accepted (the owner's send); one capture folder; the held job never ran |
| B5 `outbound release --all --confirm`, `run-jobs` | unchanged | released 0, refused 1 (`superseded_by_later_send`); `run-jobs` claimed nothing; still one capture folder |

Judgement: the build does what docs/05:72, docs/11 section 7 and docs/12:114 say, end to end and from the person's side: the sign-off sends
nothing; a send is queued and recorded; after an accepted copy every further send asks for a reason, the dialog names the earlier copy, and
the reason is kept in History and not in the mail; a backup taken while a send waits is restored with that send held and outbound paused;
after the resume the operator releases the held send and it goes out once; and when the owner has already sent again on the restored copy,
the held send stays held for good and only the owner's send goes out (RECHECK-B3's R-UX5B4-5 edge, harmless). What the person sees of a
held send is "Email needs attention" (truthful: the job is in `intervention`), with no word that the operator holds it after a restore or
that a release may still send it, while "Send another copy..." stays enabled. Pressing it is safe (the release is then refused, no
duplicate), but the person cannot tell the two situations apart; no document describes this view (optional R-UX5I-1). Run 1 of this probe
had two probe defects (the CLI's JSON read together with a Node warning, so the release printed its usage; a `stop()` that waited for an
exit that had already happened); its steps up to A2 and B3 matched run 2 and it is kept as `*-run1-probe-defect.txt`.

### 3.2 The Day editor guard with a check-in running across the midnight (`zz-int-midnight.spec.ts`; `41-obs-midnight.txt`)

FIX10 clock, each run started at 2026-10-27T06:58:00Z (Mon 10/26 23:58 in Los Angeles, 118 s before the midnight); the probe test carries
the `CROSSES_MIDNIGHT` annotation, so the fence does not hold it; desktop at 1280px (floating drawer) and the phone project (bottom sheet).

| Step (desktop) | Observed |
|---|---|
| Today, then Check in at 23:58:03 | the session is filed under 2026-10-26 (start 06:58:03Z); the editor of 10/26 lists "23:58 Running, Checked in" |
| a note typed, not saved; Escape | "Discard your changes?"; Keep editing keeps the note |
| the server passes the midnight (07:00:00.2Z), the page left alone | the editor stays open on 10/26 with the note; the Today tag stays on 10/26 (no timer, as docs/04:58 says); nothing asks |
| the documented focus refresh | one `/api/periods/current` read; the Today tag moves to 10/27; the editor stays on 10/26 with the note; nothing asks |
| the server | the running session is on 10/26, none on 10/27; the page says "Checked in since 23:58 Mon 10/26, session running" |
| Escape after the midnight | the question; Keep editing keeps the note |
| Today (now 10/27) with the note | the question; Keep editing leaves the editor on 10/26 with the note |
| Check out from the page | not reached in this run: at 1280px with Monday open the floating drawer docks right and covers the page's Check out (the accepted UX4-A risk 1), and the probe's click waited until its test timeout; the same step with an unsaved note was then taken at 1440px in the clock-editor probe (F-UX5I-1) |

The phone run (bottom sheet) took every step up to the midnight the same way, then: after the midnight the untouched sheet kept the note and
the Today tag stayed on 10/26; the focus refresh moved the tag to 10/27 with the sheet and the note kept and nothing asked; Escape asked
and Keep editing kept the note; "Save day fields" from the fixed foot after the midnight saved the note under 10/26 (10/27 has no entry);
Check out from the top bar after the midnight ended the session 23:58 - 00:00 on 10/26 (10/27 has no session).

Judgement: the guard holds across the midnight; a background date change never drops or asks about unsaved fields; the running session
stays on the date of its start (docs/02, D-05) and the Today press after the midnight is guarded like any other. The one defect met on the
way is F-UX5I-1 (the page's clock actions do not refresh the open editor).

### 3.3 The theme across two tabs with the Day editor and the account menu open (`zz-int-theme.spec.ts`; `42-obs-theme.txt`)

One browser context (shared storage), two tabs; the second tab holds the Day editor on a past day (10/23) with a typed, unsaved note; each
tab is brought to the front before it is driven or read. At 1280px (floating) and 1440px (beside):
- the second tab's account menu opened with the note unsaved: the menu opens, the editor stays, nothing asks (a control keeps its
  action, docs/04:69);
- Dark chosen in the first tab: the second tab is painted dark (`data-theme` dark, background `rgb(14, 18, 23)`), its open menu shows Dark
  checked, the editor and the note stay, nothing asks; its menu is still open when it comes back to the front;
- Light chosen in the second tab's own menu: applied there, the editor and the note stay, nothing asks; the first tab follows;
- Escape with the menu open: the menu closes and focus returns to the account button, the editor stays and nothing asks; a second
  Escape asks "Discard your changes?"; Keep editing keeps the note.
Phone (bottom sheet, modal; the More panel cannot open over it): Dark chosen in the first tab paints the second dark with the sheet and the
note kept; Escape asks; Keep editing keeps the note. Exit 0. Judgement: the FIX14 follower and the U4-05/U5-24 guard work together.

### 3.4 Shared views, view only and edit, with the round-5 header, sheet and dialogs (`zz-int-shared.spec.ts`; `43-obs-shared-run2.txt`, `-run6.txt`)

A synthetic owner shares the timesheets (view, then edit; OT and PDF items on) with a synthetic grantee; every request of the grantee's
page is recorded.
- Header and sheet at 1440, 1280, 1024, 768, 767, 600, 480, 479, 390, 360 and 320px (desktop project) and 390, 360, 320px (phone): the
  share bar names the owner and the right; the period card shows the range (the ladder's "10/12 /2026 → 10/25/2026" at 320px), the pills
  and only "<", ">" and Today; no review link and no check in/out at any width; the toolbar is "Worked hours" alone for view only and
  "Open a day, Open day, Worked hours, Change several days" with edit rights ("Change days" at 320px); no width scrolls sideways.
- Day editor: view only shows the "View only" chip and no Edit, Delete, Add or Save day fields; with edit rights the "Partial leave" dialog
  (1:30 vacation) writes nothing until "Save day fields", which sends one `PUT /api/shared/:ownerId/days/<date>` (stored 90 minutes,
  vacation); a press outside with the unsaved leave asks and Keep editing keeps it (desktop; with nothing unsaved it closes); no request
  left the shared mount (`/api/shared/:ownerId/...`, `/api/shares`, `/api/auth/me` only).
- axe-core 4.14.0 (WCAG 2.0-2.2 A/AA tags), after the transitions settle: 0 violations on the sheet in light and dark at 1440 and 768px
  (desktop) and 390 and 320px (phone), on the open editor and on the Partial leave dialog, for both rights.
Probe history (all kept): run 1 read axe right after a colour-scheme change (13 transient colour-contrast nodes in dark at 1440px, gone once
the transitions settle) and pressed the page title where the floating drawer covered it; runs 2-5 corrected the settling and searched for a
free outside point (run 3 and 4 found the title scrolled out of view; run 5 met a strict-mode error of my own assertion); run 6 completed
the desktop project (exit 0), run 2 the phone project. Judgement: the round-5 header, sheet and dialogs hold in shared views, and the share
boundary holds.

## 4. Test design

**The suite as it now stands.** 101 vitest files, 2,397 tests; 504 e2e tests per project (469 and 407 run, the rest are project skips).
Since round 4 the fix rounds changed tests in three ways, and none of them loosened a check: state-based waits instead of reads that
raced a frame or a tab (`expectLayoutAt`, `expectSheetAt`, `stepPeriod`, `settledSelect`, `bringToFront`, the image wait), cheaper proofs of
the same facts (DIAG4/FIX10: four contexts, a decoded surface, one evaluate, each with equivalence evidence), and the midnight fence. Every
fix came with mutants that the changed test kills (REGATE5-REGATE12, RECHECK-A/A2/B/B2/B3); the survivors are listed as optional risks
(R-A3-1..3, R-UX5B4-1/-2, MA5, G6).

**The midnight fence (FIX15) and whether the midnight behaviour is covered enough.** The fence holds a test that would start within 45 s
of the seeded zone's midnight until 0.5 s after it, with no request, sign-in or database access; one test is exempt by annotation. It
removes no case and no assertion; it removes the chance midnight inside arbitrary tests, which DIAG9 showed to be 31 test assumptions and no
product defect. What covers the midnight now:
1. The server's filing at the boundary is pinned in the suite: `timesheet-api.test.ts:125-148` (06:59:58Z, 07:00:00Z, 07:00:31Z, the
   check-out across it); T1, T2 and T4 fail it (RECHECK-B2, RECHECK-B3). The second before the midnight (T6) and the DST nights are proved
   by probes only (RECHECK-B2's 11-case probe, rerun by RECHECK-B3), optional R-UX5B4-2.
2. The page across the midnight: the crossing test `today.spec.ts:627` runs its crossing branch in the gates' seven-file sweep on the
   desktop project only (59.5 s in my run; the mobile instance starts after the midnight and runs its real-clock branch in 2.5 s, as
   in REGATE12). At 2026-10-27T06:58:30Z the displayed period (10/12-10/25) holds neither date, so the branch taken is "today is in
   another period": the Today press must re-read and jump (discriminating), while the "focus refresh moves the Today tag" half expects no
   tag before and after and cannot fail. My test-design mutant confirms it (`50-mut-exits.txt`): with the page's focus and visibility
   refresh removed (`TimesheetScreen.tsx`), the crossing test still passes at that instant on both projects and fails at
   2026-11-04T07:58:50Z, where the displayed period holds both dates (the unmutated control passes there); the real-clock refresh-trigger
   tests (`:764`, `:769`) fail under the same mutant on both projects. So the focus refresh is pinned by those tests, not by the gate's
   crossing run (optional R-UX5I-2).
3. The Day editor across the midnight: no suite test; my probe (section 3.2) and DIAG9's product probe are evidence, not regression tests.

Judgement: enough for this release. The rule that can lose data or misfile time (the filing date of a check-in) is pinned at the boundary
by an integration test that fails for the wrong date; the page's own date handling is pinned by the Today press in the gate's crossing run
and by the refresh-trigger tests; the remaining gaps are test-strength items with the product right in every probe, so they are optional
backlog, not a fix round.

**The simulated-clock sweeps against FIX10's design.** WP5-UX-FIX10 made the suite date-independent and ran it at chosen calendar
positions (a window day, the due day after the due time, the payroll date, DST, the New Year, a 2027 due Tuesday) under `shiftclock.mjs`,
which shifts every Node process by one constant and leaves the browser unshifted, on the premise that "the client code never reads the
browser clock". The six gate sweeps still do this: the same wrapper (byte-equal to the FIX10 file), three FULL runs at 2026-10-26T16:00Z,
2026-11-01T08:45Z and 2027-03-14T10:30Z and three seven-file runs around the midnight and the New Year. Two things moved since FIX10:
- The premise is no longer literally true: round 4's Today and Now links read the device clock (`LocalTimeField.tsx:7`), and the settings
  file stamps `exported_at` from it (`SettingsTransferFile.ts:10`). The two tests that press those links freeze the browser clock at a
  server-derived instant first (`day-editor.spec.ts:5741`, `:5795`), the one test that sets a wrong device clock does so on purpose to
  prove the suggestions ignore it (`:828`), and no test compares `exported_at` with the server's clock, so the sweeps are still valid; the
  wrapper's comment is outdated (optional).
- The seven-file run at 06:58:30Z no longer puts the midnight inside arbitrary tests; with the fence it runs them just after it, and only the
  crossing test spans it. That is the accepted design choice of DIAG9, and the other five sweeps are unaffected (the fence is a no-op away
  from the midnight).

## 5. AC-13 under three device zones

`vitest run tests/integration/ac13-two-week.test.ts` in the clean export, the zone set in the child environment by `run-tz.mjs` and
proved by its `TZPROBE` line (`03-ac13-*.txt`): America/Los_Angeles (offset 420, test start 01:00:21 local) 1/1, exit 0; Asia/Tokyo
(offset -540, 17:00:24) 1/1, exit 0; America/New_York (offset 240, 04:00:28) 1/1, exit 0. The device zone does not regroup the two-week
scenario (AGENTS rule 7).

## 6. Docs, EN and VI, against the frozen behaviour

- Structure (`60-docs-parity.txt`, my script): docs 02, 03, 04, 05, 10, 11 and 12 have the same headings in the same order, the same bullet,
  numbered-item, table-row and fence counts in EN and VI. Inline code spans agree section by section except where the VI file translates
  the placeholder words inside a span (`<thư mục rỗng>`, `t<dòng giờ>o<dòng OT>`, the "(một thời điểm UTC)" note and the two layout
  sketches of docs/04 section 5): translations, not drift. Line counts differ by 1-3 in docs 02, 03, 04, 05 and 10, as before this round.
- The points of this audit:
  - Restore with a correction: docs/05:72 ("refused (`superseded_by_later_send`) while any later send of the period exists, whatever state
    it is in or ended in (a cancelled one excepted)"), docs/11 sections 6 and 7 (hold, resume, release, `outbound release` preview) and
    docs/12:114 and :130 match the code and my probe (section 3.1); the VI lines say the same with the same codes on the same lines.
    docs/11:178 still omits the same-revision repeat that delivered nothing (RECHECK-B3's R-UX5B4-5), which my part B shows from the
    owner's side.
  - The Day editor guard: docs/04:69 (EN) / :70 (VI) list the guarded routes, the press-outside rule and the two unguarded routes;
    docs/04:58 says the periods are re-read on focus and visibility; docs/02's filing rule (an overnight session belongs to the date of
    its start) and D-05 match the server in my midnight probe (section 3.2).
  - The theme: docs/04:114 (VI :115) says the choice is stored on that device only and applied before the page is drawn; it states no
    cross-tab rule. The build follows another tab (FIX14 restores the WP5-UX2 rule from its records). Not a contradiction; the canonical
    line could say it (optional).
  - Shared views: docs/04 lines 14, 53, 60 ("a shared view has no link"), 62 (no check in/out in any shared view), 63 (the toolbar's edit
    controls absent without edit rights) and 72 (a shared edit view's running card has Edit and no Delete) match my shared probe
    (section 3.4).
  - docs/10 records H-1 a (2026-10-22) verbatim; docs/12 keeps the release identity marked for refresh at re-acceptance (line 7), which is
    ACCEPT-DOCS's job after this audit.

## 7. Mandatory checks (clean export, one after another, alone on the host)

| Command | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest in three forms, first and last | HEAD a5cbc91 = origin/main; no line; `69c6daff…e6bf`, 882 files, at 07:55:37Z and 09:08:47Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (three exports) | 0, 0, 0 (162 packages each) | `02-ci-*.txt`, `50-mut-ci.txt` |
| entry census | 1.73 busy cores of 32 (no run of mine near the 8-core limit; 1.5-2.3 before and after each e2e run) | `10-census-*.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm run build` | 0; entry `index-qNP6kTPW.js` 492.09 kB, `ReviewScreen` 25.75 kB, CSS 96.06 kB; no chunk-size advisory | `03-build.txt` |
| `npm test` | 0: 101 files, 2,397 tests (50.9 s) | `03-npmtest.txt` |
| AC-13 under America/Los_Angeles, Asia/Tokyo, America/New_York | 0, 0, 0: 1/1 each (`TZPROBE` offsets 420, -540, 240) | `03-ac13-*.txt` |
| FULL e2e, real clock, desktop (07:59-08:12Z) | exit 0: 469 passed, 35 skipped, 0 failed (11.4 min); longest logo test 46.7 s of 240 s | `04-e2e-desktop.txt`, `04-e2e-counts.txt`, `12-logo-durations.txt` |
| FULL e2e, real clock, mobile (08:12-08:20Z) | exit 0: 407 passed, 97 skipped, 0 failed (7.5 min) | `04-e2e-mobile.txt` |
| seven-file run at 2026-10-27T06:58:30Z, FIX10 wrapper, 6 workers (08:20:25-08:27:35Z real) | exit 0: 384 passed, 84 skipped, 0 failed (desktop 219/15, mobile 165/69); the desktop crossing test 59.5 s (crossed), mobile 2.5 s (started after the midnight) | `08-seven-1026.txt`, `08-seven-counts.txt`, `13-crossing-durations.txt` |

No run failed, so no network or buffer rerun was needed. The only warning lines in the e2e logs are Node's notice that `NO_COLOR` is
ignored because `FORCE_COLOR` is set (my environment set both), not a deprecation.

## Findings

1. **F-UX5I-1, Low - the open Day editor does not follow a Check in or Check out made from the page** (`src/client/TimesheetScreen.tsx:305-312`,
   `:820-830`; `src/client/DayEditor.tsx:176-192`, `:207-212`, `:228-236`, `:250-257`).
   - Cause: a clock action raises the clock version and the screen reloads the period (`load()`), so the sheet behind the drawer follows; the
     open editor reads its day (`GET /days/<date>`) only when it mounts, after its own writes, and when `refresh` is raised, which only a
     label or batch commit does. Nothing re-reads it after a clock action.
   - Reproduction (`zz-int-clock-editor.spec.ts`, `44-obs-clock-editor.txt`; real clock, desktop project, at 1440px beside and at 1280px
     floating): open today's Day editor (no session); press Check in on the page: the server holds the running session and the page shows
     "Check out", the editor still shows no session card; press Check out and confirm no breaks: the server's session is ended and the
     sheet's day cell reads "Time: 01:51 - 01:51 no breaks ... Status: Complete", the editor still shows no session; close and reopen it:
     the card "01:51 - 01:51 No breaks taken, Checked in and out" appears (run 1, `44-obs-clock-editor-run1.txt`, the same at 01:45). With
     a note typed in the editor first (same file, the "unsaved note" case at 1440px): the note stays and nothing asks during the Check in
     and Check out, but "Save day fields" afterwards is refused, "This day changed since it was loaded. Nothing was saved. Reload the day
     to see the latest data, then repeat your edit." with "Reload day", and the server keeps no note (`41-log-probe-clock-editor-run2.txt`,
     `44-error-context-clock-editor-note.txt`). By the code, "Reload day" restarts the forms from the server's day (`DayEditor.tsx:250-257`,
     a new `generation`), so the typed note is gone and has to be typed again.
   - Expected: docs/04 "Day editor": the drawer is non-modal so the page stays usable, and "Times" shows one card per session with its range
     and a state pill ("Running" with a static dot while it runs); after an action of the same page on the open day, the drawer shows the
     day the server holds, as the sheet behind it does. Round 4 (U4-05) made the drawer non-modal at every desktop width, so the page's
     Check in and Check out are now reachable with the drawer open from 768px (round 3 had this only beside the sheet, from 1360px, where
     it was not found); the phone's bottom sheet is modal and a shared view has no clock, so neither is affected.
   - Effect: wrong facts in the drawer (a missing running session or a stale one, stale figures), and an everyday desktop flow (a note typed
     on today, then Check out at the end of the day) ends in a refused save and a retyped note. Nothing is stored wrongly and nothing is lost
     silently: the server's version check refuses the stale save and says so.
   - Bounded fix: when the clock version changes while the editor is open, re-read its day without restarting its forms (the path `saved()`
     uses: `setDay` from `GET /days/<date>`, no `generation` change, so typed fields and a reason stay); one e2e test at 1440px and 1280px:
     today's editor open with an unsaved note, Check in from the page shows a "Running" card and keeps the note, Check out shows the ended
     session and keeps the note, and "Save day fields" then saves it; docs/04 one clause in EN and VI if the wording needs it.

## Risks and optional improvements (not proven defects)

New, from this audit:
- **R-UX5I-1, the owner's view of a send held after a restore.** The Review chip, the Timesheet status and History say "Email needs
  attention" for a held send, with no word that the operator holds it or may release it, and "Send another copy..." stays enabled. Safe
  (a later send makes the release refuse, so nothing is sent twice), but the person cannot tell "held, may still go" from "failed".
  Optional: one sentence in docs/05 or docs/12, or a status word for a held send.
- **R-UX5I-2, the crossing test's focus half in the gates.** At the gate's sweep instant 2026-10-27T06:58:30Z the displayed period
  (10/12-10/25) holds neither the old nor the new date, so the crossing test (`today.spec.ts:627`) takes its "today is in another period"
  branch, where the focus-refresh half expects no Today tag before and after. My mutant that removes the page's focus and visibility
  refresh (`TimesheetScreen.tsx`) passes that test at this instant on both projects (exit 0; the desktop run crossed, 1.5 min) and fails it
  at 2026-11-04T07:58:50Z, where the displayed period holds both dates (desktop and mobile exit 1, "the refreshed tab tags the new date",
  expected 2026-11-04, received 2026-11-03; the unmutated control passes there). The real-clock refresh-trigger tests
  (`today.spec.ts:764`, `:769`) kill the same mutant on both projects (each waits for the periods read after a focus event and times
  out). So the refresh is guarded today, but the gate's crossing run proves only the Today press. Optional: one sweep instant (or a second
  crossing run) whose displayed period holds both dates, for example 2026-11-04T07:58:50Z.
- **R-UX5I-3, the load rule is not canonical, and "timeout" is not defined.** The rule lives in the REGATE12 brief and DIAG10; record it
  in the WP5 handoff (and in docs/08 or the gate template through a GOV task if it is to stay), and say whether a Playwright expect
  timeout on a starved tab counts as a timeout. As written such a failure fails the gate (safe).
- **R-UX5I-4, small wording items.** The FIX10 wrapper's comment "the client code never reads the browser clock" no longer holds
  (`LocalTimeField.tsx:7`, `SettingsTransferFile.ts:10`; no sweep is affected, see section 4); docs/04:114 does not state the cross-tab
  theme rule the build follows (FIX14 restored it from the WP5-UX2 records); docs/12:106 lists the guarded routes of round 4 without the
  round-5 press outside (docs/04:69 has it); the administrator's pause banner says "Release or drop the held sends, then resume" while
  docs/11 section 7 resumes first and releases after (both orders work; pre-existing WP4 text, not of rounds 4-5).

Seen again, unchanged: UX4-A risk 1 (at 768-1329px the floating drawer docked right covers the page's Check out for a pointer; my midnight
probe met it at 1280px with Monday open). Carried (status in section 1.6): the open optional items listed there.

## Optional backlog for the WP5 handoff (none of these blocks the re-acceptance; F-UX5I-1 does)

1. Test strength, area A: R-A3-1 (theme follower edge cases), R-A3-2 (the fence: constant zone, untested exemption), R-A3-3 (ring on mouse
   focus), MA5 (the `touchend` listener's lifetime), R-UX5I-2.
2. Test strength, area B: R-UX5B4-1 (retries used up), R-UX5B4-2 (the second before the midnight; a Tokyo input zone and a DST midnight in
   the boundary test), R-UX5B-5 (the reason check's position), G6 (the 409 text).
3. Docs and comments: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4.
4. Optional product hardening: R1 (`useBlockSize` border box), R2 (the Sign off image box), DIAG5's one-frame 8 px jump, R-UX5B2-1 (claim the
   PDF before its send at equal instants, or do not count `pdf_not_ready`), R-UX5B2-2 (a period-wide waiting flag for Resend), R-UX5B-6,
   R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3, 4, 9.
5. Pilot device checks (NOT VERIFIED here): R-A2-1 (touch on a real iPad and Android tablet), R-A2-2 (overlay scrollbars), UX4-A 8 (forced
   colours), classic scrollbars in other browsers (docs/12:108); the owner's own look at the PDF samples against B11.
6. Process and harness: the logo sweep's load sensitivity (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (dev-only advisories: vite, vitest,
   smtp-server), R-UX5B-4 (FIX6b deferred), R-UX4B-6 (the implicit-TLS test crash); the crossing test's mobile branch crosses only in stress
   runs, not in the gate's sweep (section 4).
7. Coordinator decisions the owner was informed of, not asked (worth one line each in the handoff for the owner's own look): R3 b
   dropped because the round-5 Review has no checklist column (2026-10-21); the signed footer's "Sign correction" drops under the signed
   content below about 1150px (PLAN-FIX7A, RECHECK-A); option A, so a correction's send can wait behind an older send of the period up to
   about 81 minutes (PLAN-FIX7, docs/12:114); the cross-tab theme rule restored from WP5-UX2 (DIAG8).

## Required gates unrun or blocked

None of the mandatory checks was skipped, and none needed a rerun. Not run by me, by the brief's scope: the container drill, `npm audit`
and the full axe sweep (REGATE12 carried them forward from REGATE11 and REGATE9 with `dist/` identical; my axe runs were on the shared
views only), the five other sweeps (REGATE12 ran all six). NAS items stay NOT VERIFIED. Probe runs with my own defects are kept and named
in section 3; no conclusion rests on them.

## Disposition of previous findings

Every finding of the rounds is closed (section 1.1). RECHECK-A2's area-A PASS holds at the target and RECHECK-B3's area-B PASS is
confirmed (section 2). This audit does not re-accept WP5: F-UX5I-1 is open, so RECHECK-A2 and RECHECK-B3 stay the latest area verdicts
until a fix and its recheck.

## Software readiness, owner permission and pilot result

Software readiness is not re-established for rounds 4 and 5: this integration audit is FIX REQUIRED (one Low finding, a client change).
Owner permission: not requested or given. Pilot result: none; the NAS is NOT VERIFIED. No production sending or deployment was touched
(local capture only, synthetic `example.invalid` people).

## One next action

One bounded client fix for F-UX5I-1 (kind fix, `addresses_audit` WP5-UX5-AUDIT-INT; `TimesheetScreen.tsx` and `DayEditor.tsx`, one e2e
test, docs/04 EN and VI only if the wording needs it), its freeze, a regate for a client change (identity, `dist/` comparison, core
checks, the real-clock FULL e2e, the six sweeps, axe on the Timesheet with the drawer open; the drill and `npm audit` carry forward if
`dist/server` and the package files are unchanged), and a fresh recheck of F-UX5I-1 with the integration points of this review on the new
digest, before the WP5 re-accept and ACCEPT-DOCS.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-AUDIT-INT attempt 1; reviewer agent `abc262afcf62ce6a7` (board);
  the authors of the snapshot are the WP5-UX4 and WP5-UX5 planners, workers, fixers and diagnosers on the board (`01-author-models.txt`;
  for example WP5-UX4-PLAN `a3f294195d4f4c99f`, WP5-UX4-T04 `ac40529a094d001dc`, WP5-UX5-PLAN `a2066720d8bdcb583`, WP5-UX5-T01B
  `a084c1bdda1d1e1cf`, WP5-UX5-DIAG7 `a2f9710356f00cfc2`, WP5-UX5-FIX16 `aaa0458d71ba78d3a`, WP5-UX5-DIAG10 `a06798c4c71075da3`,
  WP5-UX5-FIX17 `a4b1c3c982a5be9ee`).
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE12 PASS (attempt 2).
- New report path: `handoff/delivery/WP5_UX5_REVIEW_INT.md` (+ `.vi.md`); every earlier review is untouched.
- Finding dispositions and the next coordinator task: F-UX5I-1 open (Low), next action above; R-UX5I-1..4 optional.
