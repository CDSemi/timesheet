# Mission checkpoint (WP3 accepted; GOV-SKILL cycle and WP4 planning)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-05 UTC.

## Update 2026-10-15: owner-requested UI change round 3 (WP5-UX3)

- Starting point: WP5 re-accepted on a643794 / 229df806 (WP5-UX2-AUDIT2 PASS); last board
  commit b1bf147 (WP5-UX2-ACCEPT). The round-2 update below records uncommitted records
  after that commit (the `software_ready` flip, the ACCEPT results and evidence, the
  checkpoint update).
- New coordinator session b5de56d1-fb31-4dc5-b74f-70e9473e1a0a (inferred from the
  scratchpad path); the board's `coordinator_session_id` points to it.
- The owner asked for 27 UI changes (verbatim in the board `owner_decisions`; English list
  U-01..U-27 in `handoff/delivery/tasks/WP5-UX3-PLAN.md`): a modern instead of an
  industrial style; more surface contrast and a raised week sheet; a top-bar identity block
  (avatar, display name, email) with a menu holding Light/Dark, Profile, Settings (with
  Administration as a tab) and Sign out; on large screens the wordmark, Check in/out on the
  title row, no name under the title, distinct old/current/future pills (future pink), a
  wrapping meta row, Open a day beside its picker, more space before Show details, a
  Day-cell fill and lifted (shadowed) batch and editor columns, and opinions on the row
  names "Label" and "Check"; on narrow screens "Current" and a hidden "Open a day" text when
  needed; in the Day editor a short note, a stronger header, a separate session dialog
  with a break table (start date, time, minutes), a delete confirmation, pre-filled
  defaults and suggested breaks for past days, a simpler break area, Save as confirmation
  with confirmation prompts, and WFH on the Label row.
- Coordinator decision (board): WP5 UI change round 3 (task IDs WP5-UX3-*), no new
  package; board `running`, `next_task_id` WP5-UX3-PLAN. U-01 changes a governance path
  (AGENTS.md UI section; E-8), so a GOV cycle precedes any style slice. U-21..U-25 touch
  break entry and confirmation (risk H; possible canonical-rule change under AGENTS rule
  8). The owner reviews a mockup and the plan's questions before the style-dependent
  slices.
- Running: WP5-UX3-PLAN (planner, opus override size_risk, read-only; brief
  `handoff/delivery/tasks/WP5-UX3-PLAN.md`; mockup under
  `handoff/delivery/design/WP5-UX3/`). Step 0 reconciles git (commits after b1bf147,
  uncommitted paths, digest).
- WP5-UX3-PLAN done (planner, self-reported claude-opus-5-5, read-only): HEAD b4d9dd8 =
  origin/main, an owner-made handoff-only commit after b1bf147 that holds the round-2
  return to `software_ready`; digest 229df806 (815 files) at start and end. Facts: the
  wordmark shows only from 1440px; the "Check" row only displays status; the "Label" row
  is the day category ("Category" on the PDF and in the API); display name and email
  already exist, no Profile page; reference hours exist per policy; light-mode pills differ
  by 1.12:1. Design: modern tokens and elevation, account menu, Settings sub-pages,
  lifted columns, a session dialog with start+minutes break rows (no server or API change).
  One rule contradiction: U-23 pre-fill vs docs/04 line 16 and docs/10 line 178 (new text
  drafted). Mockup and ten synthetic renders under `handoff/delivery/design/WP5-UX3/`.
- Coordinator decision (board): adopt the plan and its recommended defaults; "Status"
  replaces "Check"; owner questions G-1..G-5 (`pending_owner_question_3`; G-5 supersedes
  WP5-UX2-Q3); GLOSSARY.md missing goes to the governance backlog.
- Running: WP5-UX3-T06 (worker-high, opus override novelty; pure break-row model and unit
  tests, no UI change; both G-4 options behind one parameter). Its freeze also commits the
  plan, mockup and round-3 records. After the owner's answers: GOV chain, then T01..T10.
- WP5-UX3-T06 done (worker-high, self-reported claude-opus-5-5; reported, not independent
  proof): new `breakRowsModel.ts` and its unit tests only (no UI change); untouched rows
  resend saved instants byte-identically; end = start + minutes in UTC with an explicit
  offset; `breaks_confirmed` per the G-4 parameter; Check out keeps E-1; unit 1950; new file
  68/68 under three device zones; 3 mutations caught; day-editor and shell e2e 0 failed;
  verify 0; digest 0ef75a15 (817 files). Note for T08: only `future_break` carries
  `break_index` today.
- STATE `next_role` now says round 3 is running (WP5 stays accepted on a643794 until the
  re-accept).
- Running: WP5-UX3-T06-FREEZE (committer, alone): the two T06 files plus the plan, mockup,
  renders, T06 evidence, board, STATE, checkpoint pair and NEXT_ACTION pair.
- WP5-UX3-T06-FREEZE done: 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334 on main, pushed (35
  paths; digests 0ef75a15, 817 files; every check exit 0; no deviation).
- Board: status `blocked` on the owner's answers G-1..G-5 (`pending_owner_question_3`);
  `next_task_id` WP5-UX3-GOV (pending brief `handoff/delivery/tasks/WP5-UX3-GOV.md`,
  dispatched after G-1 a or b, cancelled by c). Uncommitted afterwards: the freeze result,
  the GOV brief, this update (+ vi).
- Next after the answers: WP5-UX3-GOV, its freeze, gate and fresh opus audit; then T01..T05,
  T07..T10 with a freeze each (owner answers folded into the briefs), the package-final
  gate, area audits A and B plus an integration pass, and the WP5 re-accept.
- Owner answered (verbatim on the board): G-1 b with changes (square week sheets, 4px
  selection columns, no overlapping shadows between adjacent lifted columns, no squeezed
  or overlapping column content beside the panel; a floating panel when both do not fit),
  G-2 a, G-3 a, G-4 owner variant (a notice with confirm no breaks / leave unconfirmed /
  go back, then the final confirmation), G-5 b; plus N-1 (phone break rows on one line
  under a "Break n" label, chips with a sub-dialog when even that does not fit) and N-2
  (tidier phone dialog spacing).
- Coordinator decision: G-4 triggers only with no break listed and the box unticked; the
  break chip uses 24-hour times (E-4; the owner may ask for AM/PM); the AGENTS wording is
  unchanged by G-1.
- Running in parallel: WP5-UX3-GOV (worker, sonnet; AGENTS.md and AGENTS.vi.md, the only
  writer) and WP5-UX3-PLAN2 (the same planner resumed, opus, read-only: real-app overlap
  measurement, floating-panel rule, sheet shapes, phone break rows and sub-dialog, spacing,
  G-4 notice, G-5 pill, mockup and slice deltas).
- WP5-UX3-GOV done (worker, self-reported claude-sonnet-5-5; reported, not independent
  proof): the AGENTS.md and AGENTS.vi.md UI sections replaced by the B2 text unchanged (7
  added, 9 removed per file); preflight, validator and check_recovery pass; digest
  a682f153 (817 files). Its freeze waits until WP5-UX3-PLAN2 returns (a commit task runs
  alone); then WP5-UX3-GOV-GATE and a fresh opus WP5-UX3-GOV-AUDIT.
- Coordinator decision: docs/04 "Visual standard" and a docs/10 E-8 supersession note move
  into T01, so AGENTS, docs/04 and styles.css agree from the T01 freeze; the GOV audit
  treats the interval as a planned transition.
- WP5-UX3-PLAN2 done (planner, self-reported claude-opus-5-5, read-only): the real app has
  no element overlap but 89.4px columns with mid-word breaks beside the panel; side by side
  from 1360px, a floating modal side panel below; square sheets, grouped 4px lifted
  columns; phone break rows from 382px, chips with a "Break n" sub-dialog below (so on
  390/375/360/320 phones); phone dialog spacing; the G-4 notice; the "in progress" pill;
  new slices T05B and T08B; mockup updated with eight `mockup-r2` renders.
- Coordinator decision: adopt PLAN2; optional owner question WP5-UX3-Q6 (rows or chips on
  common phones; default chips) blocks only T08B.
- Running: WP5-UX3-GOV-FREEZE (committer, alone; AGENTS pair plus 32 handoff paths). Then
  WP5-UX3-GOV-GATE and WP5-UX3-GOV-AUDIT (registered pending).
- WP5-UX3-GOV-FREEZE done: 79b9a53c13b1542877a587dd0ca00fe295d1f8b6 on main, pushed (34
  paths; digests a682f153, 817 files; every check exit 0; no checks.txt evidence, results
  in the brief only).
- Running: WP5-UX3-GOV-GATE (verifier, sonnet) on 79b9a53 / a682f153. Then the fresh opus
  WP5-UX3-GOV-AUDIT.
- WP5-UX3-GOV-GATE PASS (verifier, self-reported claude-sonnet-5-5) on 79b9a53: digest
  a682f153 before and after; validators, check_recovery 106, preflight 91, verify 1950;
  only AGENTS.md and AGENTS.vi.md changed outside handoff/; forbidden wording 0; section
  byte-equal to the B2 blocks.
- Running: WP5-UX3-GOV-AUDIT (fresh auditor, opus) on 79b9a53 / a682f153.
- WP5-UX3-GOV-AUDIT PASS (fresh auditor, self-reported claude-opus-5-5), no findings:
  HEAD = reviewed_commit = 79b9a53, digest a682f153 at start, end and final check; both
  sections byte-equal to B2; EN/VI equivalent; only the AGENTS pair changed among
  governance paths; validators pass. Review `handoff/delivery/GOV_UX3_REVIEW.md` (+ vi).
  Risks R1 (docs/04 line 87 "High-density"), R2 (durations through the one `--transition`)
  and R3 (stale injected AGENTS copy: the on-disk text wins) folded into the T01 brief; R4,
  R5 and R6 (GLOSSARY.md) in the governance backlog. **WP5-UX3-GOV accepted on 79b9a53.**
- Running: WP5-UX3-GOV-ACCEPT (committer, alone; 28 handoff paths). T01 registered pending
  (worker-high, sonnet), dispatched after the accept commit.
- WP5-UX3-GOV-ACCEPT done: 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b on main, pushed (28
  handoff paths; digest a682f153 unchanged; every check exit 0; one null-device slip).
- Running: WP5-UX3-T01 (worker-high, sonnet; tokens and surfaces, docs/04 visual standard
  incl. line 87, docs/10 E-8 note) on 3968e15 / a682f153.
- WP5-UX3-T01 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): round-3 tokens in light and both dark sets; `--transition` declared in the
  universal rule with a local `--transition-duration`, never `all`; each week a square
  `--elev-2` card, the footer its own card, toolbar and form header on the page; quiet
  buttons step to `--accent-strong` on hover (beyond the brief, for 4.5:1 on the darker page);
  value-only updates of the old page colour in theme.spec and logo.spec; card on page
  1.14 / 1.15; unit 2031; full e2e desktop 229/0/29, mobile 245/0/13; budgets 559.45 /
  658.41 own, 611.45 / 710.41 with a share; verify 0; digest e9e8d117 (819 files). Notes for
  the audit: the universal-selector transition declaration. Slips: two read-only commands with
  a head/tail pipe or a null-device redirect.
- T02 brief written (identity block, account menu, More, wordmark) and registered pending.
- Running: WP5-UX3-T01-FREEZE (committer, alone; 12 source/docs paths plus 32 handoff paths).
- WP5-UX3-T01-FREEZE attempt 1 stopped before commit: `git diff --cached --check` exit 2 on
  a blank line at EOF in `tests/e2e/surfaces.spec.ts:242` (source; the committer may not fix
  it). 44 paths stay staged; digest e9e8d117 matched; precommit PASS.
- Running: WP5-UX3-T01 Addendum 1 (the same worker resumed): remove that blank line, check
  the other slice files for whitespace defects, rerun the spec, lint, verify and the digest;
  the index stays untouched. Then T01-FREEZE attempt 2 with the new digest.
- T01 Addendum 1 done: only the EOF blank line removed; no other whitespace defect;
  surfaces.spec 26/26; lint 0; verify 0; digest a4f127cc (819 files); index untouched.
- Running: WP5-UX3-T01-FREEZE attempt 2 (committer, alone; 12 source/docs paths plus 36
  handoff paths, digest a4f127cc).
- WP5-UX3-T01-FREEZE attempt 2 done: e2f3d7492160d389c18903285994bedec56df51e on main,
  pushed (48 paths; digest a4f127cc, 819 files; every check exit 0). Coordinator slip
  recorded on the board (an agent-ID edit of the board while the commit ran).
- Running: WP5-UX3-T02 (worker-high, sonnet; identity block, account menu, phone More,
  desktop nav without Settings/Admin, wordmark from 1024px) on e2f3d74 / a4f127cc.
- WP5-UX3-T02 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): AccountMenu and accountModel (identity button, disclosure menu, keyboard, Escape and
  focus return, shared More content); desktop nav Timesheet/Overtime/History; Administration
  still `#/admin`, Profile `#/settings` until T03; wordmark from 1024px, hidden 1024-1279px
  with a share (tighter gap and nav padding there so the bar stays one row); assertions in 12
  specs moved to the menu, each listed; unit 2045; full e2e desktop 246/0/30, mobile
  257/0/19; mutation caught; budgets unchanged; verify 0; digest c938aa6f (822 files). The
  client JS chunk reached 502.77 kB (Vite 500 kB advisory).
- Coordinator decision: code-split in T03 (lazy Administration and Import screens), no limit
  raise; later slices record the chunk size; the gate checks there is no advisory. T03 brief
  written and registered pending.
- Running: WP5-UX3-T02-FREEZE (committer, alone; 19 source/test paths plus 26 handoff paths).
- WP5-UX3-T02-FREEZE done: aa64999240ab0d5822ca371a0c8e24436d27f30a on main, pushed (45
  paths; digest c938aa6f, 822 files; every check exit 0).
- Running: WP5-UX3-T03 (worker-high, sonnet; Settings sub-pages, Profile, routes and the
  `#/admin` redirect, lazy Administration and Import screens) on aa64999 / c938aa6f.
- WP5-UX3-T03 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): routeModel, SettingsNav, ProfileScreen; `#/admin` replaced by `#/settings/admin`
  for admins, timesheet fallback for employees; lazy Admin and Import (main chunk 502.77 ->
  452.08 kB, no advisory); unit 2059; full e2e desktop 256, mobile 267, 0 failed; mutation
  caught; no server/domain diff; verify 0; digest e5b3faf9 (827 files). Deviation: the
  chunk-load "Try again" reloads the page.
- T04 brief written and registered pending.
- Running: WP5-UX3-T03-FREEZE (committer, alone; 15 source/test paths plus 28 handoff paths).
- WP5-UX3-T03-FREEZE done: 7cd8c592ba57d7f4a12013bacced948de0fb8c42 on main, pushed (43
  paths; digest e5b3faf9, 827 files; every check exit 0).
- Running: WP5-UX3-T04 (worker-high, sonnet; title row with check in/out, pills incl. "in
  progress", meta row, Open a day row, toolbar spacing, narrow rules) on 7cd8c59 / e5b3faf9.
- WP5-UX3-T04 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): pill function from server periods ("in progress" blue in the window days; old
  amber, current green, future pink, neutral grey); title row with check in/out; two-row
  period card; Open a day row; toolbar spacing; narrow "Sign off" / "Current"; inactive
  Today look; unit 2065; full e2e desktop 267/0/30, mobile 274/0/23; simulated clock 10-20,
  10-26, 10-30 all pass; mutation caught; budgets unchanged; main chunk 452.40 kB; verify 0;
  digest 025b46cf (827 files). Deviations: meta wrap tested with a long zone name; "Open a
  day" words hide at 320 only; toolbar separator from 768px.
- T05 brief written and registered pending.
- Running: WP5-UX3-T04-FREEZE (committer, alone; 11 source/test paths plus 38 handoff paths).
- WP5-UX3-T04-FREEZE done: 83c32d2fbc57af00ef251a06024b39e641a677ce on main, pushed (49
  paths; digest 025b46cf, 827 files; every check exit 0).
- Running: WP5-UX3-T05 (worker-high, sonnet; lift runs, editor frame and Day-cell fill,
  Category/Status names, the "No times" shape) on 83c32d2 / 025b46cf.
- WP5-UX3-T05 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): `liftRuns` per week band, clipped inner shadows, 4px outer corners; inset editor
  frame and filled Day cell (underline and rails gone); "Category"/"Status" on screen;
  slashed-ring "No times"; unit 2075; full e2e desktop 275, mobile 280, 0 failed; two
  mutations caught; budgets unchanged; main chunk 452.86 kB; verify 0; digest 23b394dd (827
  files). Left outside its paths: reviewModel's square "No times" glyph and the batch-review
  "label change" wording (to T07), docs/04 Label/Check (T10); R-UX2A-4 via an emulating test
  (a real axe scan goes to the gate and audit area A).
- T05B brief written (floating editor below 1360px) and registered pending.
- Running: WP5-UX3-T05-FREEZE (committer, alone; 15 source/test paths plus 30 handoff paths).
- WP5-UX3-T05-FREEZE done: 699b1b304390ae556c89c6d3a9ee652a00da5182 on main, pushed (45
  paths; digest 23b394dd, 827 files; every check exit 0).
- Running: WP5-UX3-T05B (worker-high, sonnet; floating Day editor below 1360px, minimum
  column width) on 699b1b3 / 23b394dd.
- WP5-UX3-T05B done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): 108px minimum columns; side panel from 1360px (page cap 1600px while editing);
  floating modal side panel with a light backdrop from 768 to 1359px, docked away from the
  edited column; columns 116.8 / 117.7 / 151.1px at 1360 / 1366 / 1920; unit 2075; full e2e
  desktop 281, mobile 280, 0 failed; mutation caught; budgets unchanged; main chunk 453.27
  kB; verify 0; digest a17a0ce8 (827 files). Deviations: week cards scroll sideways inside
  themselves from 768 to 899px; the lift-run pixel test runs at 1445px because of a
  fractional column edge at 1440.
- Coordinator decision: an audit-focus list (universal transition rule, hover colour, chunk
  retry reload, real axe scan, the 768-899px inner scroll and possible lift-run seams at
  fractional widths, the 1024-1279px bar tightening, the 360px Open-a-day words) goes into
  the gate and audit briefs.
- T07 brief written and registered pending.
- Running: WP5-UX3-T05B-FREEZE (committer, alone; 6 source/test paths plus 25 handoff paths).
- WP5-UX3-T05B-FREEZE done: 5c0dad8e41fddc25306e8f2ff28424f815af32ef on main, pushed (31
  paths; digest a17a0ce8, 827 files; every check exit 0; one `| head -0` slip).
- Running: WP5-UX3-T07 (worker-high, sonnet; editor header and chips, session cards, delete
  confirmation, WFH row, review "No times" and "category change") on 5c0dad8 / a17a0ce8.
- The owner said he had not seen any question (verbatim on the board); WP5-UX3-Q6 (phone
  break rows or chips; now recommended b, date field only for overnight sessions) and the
  optional 24-hour/AM-PM chip item were re-asked on their own. They block only T08B.
- WP5-UX3-T07 done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): header with chips, session cards with break tables, "Confirm breaks", reusable
  ConfirmDialog for delete, WFH on the Category row, review ring and preview words; unit
  2091; e2e desktop 289, mobile 287, 0 failed; two mutations caught; budgets unchanged; main
  chunk 458.49 kB; verify 0; digest a3cbc3f4 (829 files). Open points: the editor's "in
  progress" chip prop (to T08), three batch-review "label" strings (to T09), generated-content
  brackets in the dialog name (audit focus).
- T08 brief written (opus, size_risk) and registered pending.
- Running: WP5-UX3-T07-FREEZE (committer, alone; 15 source/test paths plus 29 handoff paths).
- WP5-UX3-T07-FREEZE done: f8117a48cd856ee09494e54c64d6f09dbc20b234 on main, pushed (44
  paths; digest a3cbc3f4, 829 files; every check exit 0).
- Running: WP5-UX3-T08 (worker-high, opus, size_risk; session dialog, break rows, automatic
  pre-fill, G-4 notice, save and discard confirmations, nested dialogs, the editor "in
  progress" chip prop) on f8117a4 / a3cbc3f4.
- Owner answered (verbatim on the board): WP5-UX3-Q6 b (the break date field only when the
  session crosses midnight or has no end) and 24-hour chip times. Coordinator decision: T08's
  scope is not changed mid-run; T08B applies the rule at every width and re-measures the
  chip threshold. No owner question is open in this round.
- WP5-UX3-T08 done (worker-high, self-reported claude-opus-5-5; reported, not independent
  proof): SessionDialog and BreakRows (SessionForm.tsx deleted, BreaksEditor kept for T09);
  pre-fill; "No breaks listed" notice with three choices, always "Save this session?";
  "Discard your changes?"; nested-dialog rules; editor "in progress" chip; unit 2091; full
  e2e desktop 298, mobile 292, 0 failed; simulated clock at the fold, the gap and before
  midnight pass; three mutations caught; budgets unchanged; main chunk 477.22 kB; verify 0;
  probe digest da580f1e (830 files). Deviations: `suggestionRows` built in SessionDialog
  without a unit test (moved into the model in T08B); "Confirm breaks" with no fitting
  suggestion now asks through the notice (accepted, audit focus B).
- T08B brief written (Q6 b date rule, chips and sub-dialog, phone spacing, model helper) and
  registered pending.
- Running: WP5-UX3-T08-FREEZE (committer, alone; 10 source/test paths incl. a deletion plus 35
  handoff paths; digest checked after staging).
- WP5-UX3-T08-FREEZE done: 1a33c574ee6f5ec5d02008e6077eb4e8b2ce3415 on main, pushed (45
  paths; digest after staging and on HEAD da580f1e, 830 files, equal to the probe; every check
  exit 0; one null-device slip after the push).
- Running: WP5-UX3-T08B (worker-high, sonnet; Q6 b date rule, chips and the "Break n"
  sub-dialog, phone spacing, suggestionRows into the model) on 1a33c57 / da580f1e.
- WP5-UX3-T08B done (worker-high, self-reported claude-sonnet-5-5; reported, not independent
  proof): break date field only for overnight or open sessions, rows follow the session date;
  same-day rows down to 268px (every phone), overnight rows down to 390px, chips below with a
  "Break n" sub-dialog; unit 2126; full e2e desktop 305, mobile 299, 0 failed; simulated clock
  at the fold and the gap pass; two mutations caught; budgets unchanged; main chunk 484.15 kB;
  verify 0; digest dd620f70 (834 files). The 390x844 new-session dialog with three suggested
  breaks scrolls 297px (footer sticky): added to the audit focus. Slips: one heredoc, one
  `| head -0`, two `tail -c` reads.
- T09 brief written and registered pending.
- Running: WP5-UX3-T08B-FREEZE (committer, alone; 10 source/test paths plus 31 handoff paths).
- WP5-UX3-T08B-FREEZE done: f89573b89435b651f5d7cdca7811b972a82087bc on main, pushed (41
  paths; digest dd620f70, 834 files; every check exit 0).
- Running: WP5-UX3-T09 (worker-high, sonnet; Check out dialog on the new break rows with E-1,
  BreaksEditor deletion if unused, batch-review "category" strings) on f89573b / dd620f70.
- WP5-UX3-T09 first hand-back (self-reported claude-sonnet-5-5): Check out on BreakRows with
  E-1 (ticked: `breaks: []` confirmed; rows: confirmed, replace; empty unticked: `breaks`
  omitted); BreaksEditor.tsx deleted; unit 2126; full e2e 614/0/66; mutation caught; verify
  0; probe digest 2038dfc7 (833 files). Left: two batch strings in BatchDialog.tsx (assertion
  in keyboard-access.spec.ts) and the "Saving" hint inside Check out. T10 brief written.
- Running: T09 Addendum 1 (the same worker; owned paths extended for exactly those two
  points), then full e2e, verify and a new probe digest.
- T09 Addendum 1 done: the two batch strings say "category" (BatchDialog.tsx, assertion in
  keyboard-access.spec.ts:382); BreakRows hint "Checking out ..." in the Check out dialog; unit
  2126; full e2e 614/0/66; verify 0; probe digest 1fc57bce (833 files). Two code comments still
  say "new label" (server schemas.ts and client api.ts; not user-visible; left).
- Gate brief WP5-UX3-GATE written (target filled after the T10 freeze); T10 registered pending.
- Running: WP5-UX3-T09-FREEZE (committer, alone; 9 source/test paths incl. the BreaksEditor.tsx
  deletion plus 29 handoff paths; digest checked after staging).
- WP5-UX3-T09-FREEZE done: 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56 on main, pushed (38 paths;
  digest after staging and on HEAD 1fc57bce, 833 files; every check exit 0).
- Running: WP5-UX3-T10 (worker, sonnet; docs/04, 10, 12 EN and VI, the U-23 rule rewrite, the
  stale-wording sweep) on 4b5403d / 1fc57bce. Its freeze is the package-final freeze.
- WP5-UX3-T10 done (worker, self-reported claude-sonnet-5-5; reported, not independent proof):
  docs/04, docs/10 and docs/12 (EN and VI) describe round 3; the U-23 rule placed verbatim at
  docs/04 line 16 and the docs/10 clause replaced; T01's E-8 note checked; sweep fixed stale
  names (history entries kept); parity counts equal; preflight PASS; verify 0; digest 29ac2594
  (833 files).
- STATE `next_role` and NEXT_ACTION (EN/VI) updated (slices done; gate and audits next). Gate,
  area audits A and B and the integration audit registered pending with their briefs.
- Running: WP5-UX3-T10-FREEZE (package-final freeze; committer, alone; 6 docs plus 20 handoff
  paths). Then WP5-UX3-GATE on that commit; when the gate records the new digest, the current
  WP5 PASS (WP5-UX2-AUDIT2) and every audit pointing to it get superseded_by
  WP5-UX3-AUDIT-INT.
- WP5-UX3-T10-FREEZE done (package-final freeze): cecfceb61c7f15216c8f188e8b7059c9f075247d on
  main, pushed (26 paths; digest 29ac2594, 833 files; every check exit 0).
- Running: WP5-UX3-GATE (verifier, sonnet; package-final) on cecfceb / 29ac2594: WP5 gate items
  with the drill, server and domain byte-identical to a643794, round scope, a ten-instant
  simulated-clock sweep, the round-specific checks with the audit-focus measurements and a real
  axe scan.
- WP5-UX3-GATE FAIL (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on cecfceb /
  29ac2594 (three forms equal): everything else passed (verify 2126, real-clock e2e 614/0/66,
  AC-13, drill 208 PASS, dist/server and dist/domain byte-identical to a643794, scope, CSP,
  contrast, bar, floating rule). FAIL reasons: (1) `timesheet.spec.ts:807` fails on Tuesdays
  (neighbours across two week bands) and a mobile seed flake at `:452` (409); (2) keyboard focus
  clipped in the 768-899px week-card scroll; (3) axe: two label-content-name-mismatch items and
  a target-size item under the open account menu. Also measured: a faint notch in the run
  shadow at inner joins; the 390x844 session dialog scrolls 297/259px with first field and
  footer visible.
- Coordinator decision: one fix round. Running in parallel: WP5-UX3-FIX1 (worker-high, opus,
  size_risk; the seven items) and WP5-UX3-SWEEP (planner, opus, read-only on a clean export of
  cecfceb; audit-style defect sweep of areas A and B excluding the FIX1 items). Then FIX2 for
  any sweep findings, freezes, WP5-UX3-REGATE and the audits.
- WP5-UX3-SWEEP done (planner, self-reported claude-opus-5-5; read-only): 2 Medium (focus lost
  after an account-menu entry; mutant M18, the device-date past-day rule, survives), 6 Low (editor
  chip for an in-progress day opened through Open a day; "day label" wording; docs/12 Check out
  remedy; docs/10 chunk figure; mutant M21 Profile zone survives; no discard question in the Check
  out dialog), 5 Info; request bodies, breaks_confirmed paths, nothing sent on Cancel/Discard/Done,
  server-date pre-fill and dialog Escape/focus clean; 22 mutants, 20 caught.
- Coordinator decision: WP5-UX3-FIX2 (worker-high, sonnet) after the FIX1 freeze covers findings
  1-11 and 13 (Check out gets the discard question per U-26); finding 12 (API-only E-1 case)
  accepted and added to audit focus B. FIX2 registered pending.
- WP5-UX3-FIX1 done (worker-high, self-reported claude-opus-5-5): the lifted-column test keeps
  its neighbour in the open day's week; the batch stale-version seed uses the current version;
  week-card focus is scrolled fully into view at 768-899px; the category picker and break chip
  names contain their visible text; one run-level shadow layer removes the notch (under the
  joins 22.5-24.3/255 before, 2.1-2.8 after); the account-menu target-size item is justified (62
  of 73 widths overlap a control). Unit 2130 passed, full e2e 0 failed; digest e4659145 (833
  files).
- WP5-UX3-FIX1-FREEZE done: 9187f31bee9c092041887d3ab034c492e33da0b5 on main, pushed (348 files:
  11 source/tests, 12 task records and board files, 325 evidence files; digest e4659145, 833
  files, on HEAD too; every check 0). Slip: one empty here-document redirect into a scratch file.
- WP5-UX3-FIX2 first hand-back (worker-high, self-reported claude-sonnet-5-5): items 1-11 and
  13 fixed (focus after an account entry, M18 and M21 now caught, editor chip by the day's own
  period, "category" wording, docs/10 and docs/12, Check out discard question, unused helpers
  removed with their oracles moved, hover gating, hint link). Unit 2131; full e2e 0 failed
  (desktop 317, mobile 310); both simulated clocks 0 failed; main chunk 487.17 kB; verify 0;
  digest 65a2296e (833 files). docs/04 still lacks the discard sentence and the account-menu
  focus rule: Addendum 1 extends the worker's paths to the docs/04 pair for exactly these.
- WP5-UX3-FIX2 done after Addendum 1: only the docs/04 pair changed (line 7 account-menu focus
  rule, line 70 Check out discard sentence, EN and VI); parity OK, preflight PASS, unit 2131,
  verify 0; digest 262138e0 (833 files); 27 changed paths outside handoff (13 client, 2 unit
  test, 6 e2e, 6 docs).
- Draft brief WP5-UX3-REGATE written (every attempt-1 gate item again, the FAIL reasons closed,
  the FIX2 behaviours); target and digest are filled after the freeze. Registered pending.
- WP5-UX3-FIX2-FREEZE done: 7ce4e95a0c4477374e981132d93b11aedab2e384 on main, pushed (66 files;
  digest 262138e0, 833 files, on HEAD too; every check 0; no slip reported).
- Running now: WP5-UX3-REGATE (verifier, sonnet) on 7ce4e95 / 262138e0. Then fresh audits A and
  B retargeted to it, AUDIT-INT and the WP5 re-accept.
- While the regate runs, the briefs AUDIT-A, AUDIT-B and AUDIT-INT were retargeted to 7ce4e95 /
  262138e0 and WP5-UX3-REGATE, with a fix-round scope item each and new port ranges (A
  48940-48969, B 48970-48999). The board entries are retargeted only after a regate PASS.
- WP5-UX3-REGATE done (verifier, self-reported claude-sonnet-5-5): PASS (NAS items NOT VERIFIED) on
  7ce4e95 / 262138e0, digest equal in three forms before and after.
  - Every attempt-1 FAIL reason is closed: the Tuesday runs and both 11-28 runs ended 0 failed;
    48 focus walks at 768-899px with no ring clipped; axe (a) and (b) gone, (c) as justified.
  - Real-clock e2e 627 passed, 0 failed; verify 2131; drill 208 PASS; server and domain
    byte-identical to a643794; FIX2 behaviours confirmed.
  - Deviation: the first FULL run at 2026-12-31 23:30 failed two mobile tests by timeout
    (theme.spec.ts:413, timesheet.spec.ts:1799). The rerun passed and both tests passed 15 of
    15 alone. The DPR 2 seam crops were not repeated.
- Coordinator decision: the PASS is recorded with that deviation. Fresh AUDIT-A judges both
  tests under load and repeats the DPR 2 seams; a test-or-product cause is FIX REQUIRED.
  current_source_digest is 262138e0. WP5-UX2-AUDIT2 and the seven audits that pointed to it
  now name WP5-UX3-AUDIT-INT. The board entries for the audits are retargeted to 7ce4e95 and
  the regate.
- Running now: WP5-UX3-AUDIT-A and WP5-UX3-AUDIT-B (fresh auditors, opus/xhigh, read-only,
  in parallel).
- WP5-UX3-AUDIT-B done (self-reported claude-opus-5-5): FIX REQUIRED with two Low findings.
  - F-UX3B-1 (sweep finding 12): Check out with saved unconfirmed rows (API-only state): after
    removing every row, the dialog shows an empty list but the server keeps the rows (or answers
    422). The dialog never says so.
  - F-UX3B-2: "Confirm breaks" lists suggestions only when all fit; docs/04 line 65 says it
    lists those inside the session.
  - Everything else in area B passed: request integrity (25 cases), confirmation semantics,
    pre-fill, figures, dialogs, phone, the fix-round items, 13 of 13 mutants. Full e2e 627 / 0
    failed; digest 262138e0 before and after.
  - Optional risks R-UX3B-1..7 are in the review.
- AUDIT-A is still running. The fix round is decided after it returns, so that one fix covers
  both areas.
- WP5-UX3-AUDIT-A done (self-reported claude-opus-5-5): FIX REQUIRED.
  - F-UX3A-01, Medium: the focus ring disappears under the pointer on the sheet's date button
    and weakens on the Category picker. This also happens after the Escape return from the
    editor, and it already existed in a643794.
  - F-UX3A-02..06, Low:
    - ungated hover rules;
    - the identity button is 38px high with a coarse pointer;
    - the Sign out icon has no gap to its text;
    - the More panel's Escape focus return is untested (mutant A4 survives);
    - the phone Administration table scrolls sideways with a long delivery badge (axe
      serious).
  - Item 11: the regate's two timeouts are load noise (one 21 s host stall; 125 of 125 passes
    in five full runs).
  - The DPR 2 seams are clean.
  - Mandatory checks: full e2e 627 passed, 0 failed; digest 262138e0 before and after.
- Coordinator decision: one fix task, WP5-UX3-FIX3 (worker-high, sonnet), for F-UX3A-01..06 and
  F-UX3B-1..2, plus R-UX3B-3, R-UX3B-4, R1 (docs) and R8 (test budget).
  - F-UX3B-1: Check out sends the empty list unconfirmed when the person removed every saved
    row. It replaces them, so what the dialog shows is what is recorded. With no saved rows
    at the start, the list stays omitted (E-1).
  - F-UX3B-2: the code follows docs/04 line 65 (list the suggestions inside the session).
  - No server change.
  - After FIX3: FIX3-FREEZE, WP5-UX3-REGATE2, fresh AUDIT-A2 and AUDIT-B2, AUDIT-INT.
- Running now: WP5-UX3-FIX3.
- WP5-UX3-FIX3 done (worker-high, self-reported claude-sonnet-5-5): all twelve items done.
  - Focus ring under the pointer (four controls); seven hover rules gated, with a full scan;
    identity 44px under a coarse pointer; Sign out flex; More Escape test (A4 caught); phone
    Administration wrap.
  - Check out: the empty unconfirmed list when every saved row was removed. The server was
    verified first, and the dialog shows a note.
  - "Confirm breaks" lists the suggestions inside the session.
  - The wording and docs fixes; theme.spec.ts budget plus a stall retry.
  - Unit 2141; full e2e 645 passed, 0 failed; both simulated clocks 0 failed; theme x5 380
    passed; mutants caught; main chunk 486.81 kB; verify 0; digest d1d903cf (833 files; 20
    changed paths).
- Before the freeze, the WP5-UX3-REGATE evidence folder holds four `.log` files that are
  neither `.txt` nor referenced. The regate verifier (same agent) is asked to turn them into
  masked LF `.txt`, or to delete exact duplicates, and to record that. Then WP5-UX3-FIX3-FREEZE.
- Evidence hygiene done: none of the four was a duplicate. Each became a masked LF `.log.txt`
  copy (nothing needed masking), and the originals were removed. The step is recorded in the
  REGATE Results; the decision is unchanged.
- Running now: WP5-UX3-FIX3-FREEZE (committer, sonnet; the 20 FIX3 paths, the records, the
  review pairs and five evidence folders).
- WP5-UX3-FIX3-FREEZE done: a78ada5edbf5339d4502df57e9f195d11c0b5d28 on main, pushed.
  - 550 files: 20 outside handoff, 14 records, 516 evidence files.
  - Digest d1d903cf (833 files), on HEAD too.
  - Every check 0; precommit found 0 findings.
- Running now: WP5-UX3-REGATE2 (verifier, sonnet) on a78ada5 / d1d903cf.
  - Gate items 1, 2, 3, 5 and 6 again.
  - A reduced simulated-clock sweep: FIX3 changes no time computation, so 5 FULL instants
    (including both DST changes) and 4 five-spec instants.
  - Each audit finding closed, measured.
  - A full axe scan.
- Then fresh rechecks AUDIT-A2 and AUDIT-B2, then AUDIT-INT.
- While REGATE2 runs:
  - Recheck briefs written: WP5-UX3-AUDIT-A2 and WP5-UX3-AUDIT-B2. Each covers its findings
    closed, regression from FIX3's diff, at least six mutants and the mandatory checks;
    ports A2 49080-49109, B2 49110-49139.
  - The AUDIT-INT brief is retargeted to a78ada5 / d1d903cf, REGATE2, A2 and B2 (ports
    49140-49159).
  - Board entries are registered only after a REGATE2 PASS.

### Paused for usage (2026-10-16)

- The owner asked to pause because usage is nearly exhausted. The coordinator stopped
  WP5-UX3-REGATE2 attempt 1 (agent afc3cf1073f2699f5) with TaskStop, mid-run.
- Board state:
  - mission status `paused_usage`;
  - WP5-UX3-REGATE2 `interrupted`, with an `interruption` note;
  - next_task_id WP5-UX3-REGATE2;
  - current_source_digest still 262138e0. It becomes d1d903cf only at a REGATE2 PASS.
- Last pushed commit: a78ada5edbf5339d4502df57e9f195d11c0b5d28 (WP5-UX3-FIX3-FREEZE; digest
  d1d903cf, 833 files). Nothing is committed locally and unpushed.
- Uncommitted coordinator records since a78ada5 (all under `handoff/`):
  - modified: `delivery/ORCHESTRATION.json`, `delivery/STATE.json`, this checkpoint pair,
    `NEXT_ACTION.md` and `.vi.md`, `delivery/tasks/WP5-UX3-FIX3-FREEZE.md` (committer
    results), `delivery/tasks/WP5-UX3-AUDIT-INT.md` (retargeted);
  - new: `delivery/tasks/WP5-UX3-REGATE2.md` (brief; may hold partial attempt-1 Results),
    `delivery/tasks/WP5-UX3-AUDIT-A2.md`, `delivery/tasks/WP5-UX3-AUDIT-B2.md`,
    `delivery/evidence/WP5-UX3-FIX3-FREEZE/` (`checks.txt`, `commit-message.txt`), and
    possibly partial `delivery/evidence/WP5-UX3-REGATE2/`.
  - The deferred checkpoint commit: the next freeze or accept commit carries these records.
    The partial REGATE2 evidence is committed only if every name ends in `.txt` or
    `-synthetic.png`.
- Possible leftovers of the stopped verifier, unknown and to be reconciled:
  - Playwright, server or browser processes on ports 49040-49079;
  - the task folder `D:\.claude-tmp\timesheet\WP5-UX3-REGATE2` (exports, build output);
  - the Docker compose project `ts-wp5-ux3regate2` and its drill image.

  No source, docs or tests are expected to have changed: a verifier never edits them.
- **Resume steps** (RESUME.md, docs/08):
  1. Start with `claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a` or a new session
     with the entry prompt.
  2. Delegate reconciliation to a verifier:
     - `git status --short` (only the records above);
     - the working-tree digest d1d903cf;
     - HEAD = origin/main = a78ada5;
     - no live process of REGATE2;
     - `docker ps --all --filter name=ts-wp5-ux3regate2` empty (remove that project and its
       drill image by exact name if present);
     - list the partial evidence.
  3. Rerun WP5-UX3-REGATE2 as attempt 2 with a fresh verifier and the same brief. The
     attempt-1 partial Results stay as history under "Attempt 1 (interrupted)".
  4. On PASS:
     - set current_source_digest to d1d903cf;
     - register WP5-UX3-AUDIT-A2 and -B2 and dispatch them in parallel (fresh opus
       auditors; briefs ready);
     - retarget the WP5-UX3-AUDIT-INT board entry to a78ada5 / d1d903cf and to REGATE2,
       A2 and B2.
  5. Then AUDIT-INT, and the WP5 re-accept (pilot packet identity, WP5_HANDOFF EN/VI,
     STATE, NEXT_ACTION, accept commit, board back to `software_ready`).

### Resumed (2026-10-19)

- The owner resumed the session (same coordinator session ID). The board mission status is
  back to `running`.
- AGENTS.md on disk changed during the pause. It now starts with an "AI Instruction"
  header, an Operating Contract and a Prime Directive; the project instructions 1-13 and the
  UI section are unchanged in substance. The coordinator does not inspect git, so the
  reconciliation finds out whether this change is committed, who made it, and whether
  AGENTS.vi.md and the preflight still match.
- Running now: the read-only reconciliation WP5-UX3-RESUME-RECON (verifier, sonnet; board
  `auxiliary_lookups`). Its only write is removing the REGATE2 Docker leftovers, if present.
- WP5-UX3-RESUME-RECON done.
  - HEAD = origin/main = a78ada5; no later commit. The handoff changes are exactly the
    records listed in the pause section.
  - Outside handoff/, only AGENTS.md is modified and uncommitted: 48 lines added (AI
    Instruction header, Operating Contract, Prime Directive), items 1-13 and the UI section
    unchanged. AGENTS.vi.md, CLAUDE files, `.claude/` and docs/08 are unchanged.
  - Working-tree digest 54cb9a3d against the HEAD digest d1d903cf; the difference is
    AGENTS.md only.
  - Both validators exit 0.
  - No leftover process or Docker object; REGATE2 attempt 1 left no Results and no
    evidence.
- Owner question WP5-UX3-Q7 (board `open_owner_question_ux3_q7`): adopt the new AGENTS.md
  text in the repository before the regate (with an AGENTS.vi.md translation), keep it local,
  or let the owner handle it. A sub-question asks about the runbook-mirror line. The mission
  is `blocked` on this answer because the regate target depends on it.
- The owner answered WP5-UX3-Q7, verbatim on the board: (a). The runbook line follows the
  `.vi.md` convention, and project-foreign phrases ("shop-floor", "step type", "probe kind",
  "manifest key" and similar) are removed.
- Coordinator decision: a GOV chain, because AGENTS.md is a governance path.
  1. WP5-UX3-GOV2 (worker, sonnet) edits AGENTS.md and translates AGENTS.vi.md.
  2. WP5-UX3-GOV2-FREEZE commits it together with the pending handoff records.
  3. WP5-UX3-GOV2-GATE runs on that commit.
  4. The fresh opus GOV2-AUDIT and REGATE2 attempt 2 then run in parallel.
  REGATE2, A2, B2 and INT are retargeted to the GOV2 freeze, and the GOV accept records go
  with the next WP5 commit.
- Running now: WP5-UX3-GOV2. The mission status is back to `running`.
- WP5-UX3-GOV2 done (worker, self-reported claude-sonnet-5-5).
  - Runbook line now on the `.vi.md` convention.
  - Removed: "shop-floor aware"; "step type", "task mode", "probe kind", "template
    variable" and "manifest key"; "CI run". "CI evidence" became "recorded evidence"; the
    repository has no CI.
  - Kept, with Grep evidence: production accuracy, host check, deployment, migration,
    release, recoverability, consumer need, public API, ADR.
  - AGENTS.vi.md translated: 9 headings in each file.
  - Items 1-13 to the end are byte-equal to a78ada5.
  - Validators PASS; digest b35dddd5 (833 files).
- Running now: WP5-UX3-GOV2-FREEZE (committer, alone).
- WP5-UX3-GOV2-FREEZE done: ceb86b6b18bd0e8fabd93f47672cd87f3899b92f on main, pushed.
  - 21 paths: the AGENTS pair plus the pending handoff records.
  - Digest b35dddd5 (833 files), on HEAD too.
  - Every check 0.
- Running now, in parallel (two read-only verifiers):
  - WP5-UX3-GOV2-GATE (sonnet) on ceb86b6;
  - WP5-UX3-REGATE2 attempt 2 (sonnet), retargeted to ceb86b6 / b35dddd5.
- Then: GOV2-AUDIT (fresh opus) after the GOV gate; the rechecks A2 and B2 after a REGATE2
  PASS, with their briefs retargeted to ceb86b6 / b35dddd5.
- While the gates run:
  - The briefs AUDIT-A2, AUDIT-B2 and AUDIT-INT are retargeted to ceb86b6 / b35dddd5.
  - The WP5-UX3-GOV2-AUDIT brief is written: owner fidelity, consistency with items 1-13,
    docs/08, CLAUDE and the prompts, the translation, scope and format, and validators. It
    runs no e2e.
- WP5-UX3-GOV2-GATE done: PASS on ceb86b6 / b35dddd5.
  - Scope: exactly the AGENTS pair.
  - The owner's edits are in place.
  - The sections after the Project instructions heading are byte-equal to a78ada5.
  - EN/VI parity holds.
  - Validators and verify pass (2141 tests).
- Running now, in parallel: WP5-UX3-GOV2-AUDIT (fresh opus) and WP5-UX3-REGATE2 attempt 2.
- WP5-UX3-GOV2-AUDIT done: PASS on ceb86b6 / b35dddd5, with no finding. WP5-UX3-GOV2 is
  accepted.
  - The auditor rebuilt the owner's original text and confirmed that the worker changed only
    the named items.
  - The CI removal is accepted.
  - No contradiction with items 1-13, docs/08, CLAUDE or the prompts.
  - Risks:
    - R1 (owner note): "template variable" and "manifest key" exist here (email templates,
      backup manifests), but the removal follows the owner's words.
    - R2: "production accuracy" kept.
    - R3-R5 and R8 go to the governance backlog.
    - R9: agents in this session receive the owner's unedited injected AGENTS.md, so briefs
      must say the on-disk text wins.
- Still running: WP5-UX3-REGATE2 attempt 2.
- WP5-UX3-REGATE2 attempt 2 done: PASS on ceb86b6 / b35dddd5. NAS, the DPR 2 seam scripts and
  non-Chromium browsers are NOT VERIFIED.
  - Real-clock e2e 645 passed / 0 failed; 2141 unit tests; drill 208 PASS.
  - dist/server and dist/domain byte-identical to a643794.
  - 5 FULL and 5 five-spec simulated-clock runs, 0 failed. One buffer error on 11-28 run 1
    was within the rerun allowance.
  - Every F-UX3A and F-UX3B finding closed.
  - axe: only the justified target-size item.
  - Observations: the Sign out icon sits 3px right of Profile's; the away first screen is
    2.2px lower; the docs/10 label "after WP5-UX3-FIX2" is stale.
- current_source_digest is b35dddd5. The AUDIT-INT entry now depends on REGATE2, A2 and B2.
- Running now, in parallel: fresh opus rechecks WP5-UX3-AUDIT-A2, which also judges the
  three observations and repeats the DPR 2 seams, and WP5-UX3-AUDIT-B2.
- WP5-UX3-AUDIT-B2 done: FIX REQUIRED with one Low test-strength finding and no product
  defect.
  - F-UX3B2-1: no test proves that the removal note is absent on a plain Check out (mutant
    M6a survives).
  - F-UX3B-1 and F-UX3B-2 are closed; the behaviour choice is sound.
  - Regression: 39 request cases are byte-identical to 7ce4e95.
  - Full e2e 645 / 0 failed.
  - Risks R-B2-1..5: R-B2-1 means no test pins "Confirm breaks" on today's ended session
    (M5b survives).
- AUDIT-A2 is still running. The fix is decided after it returns.
- WP5-UX3-AUDIT-A2 done: FIX REQUIRED.
  - F-UX3A2-1, Medium: on a phone width the More panel stays open after focus leaves it, so
    12 of 14 focused Category pickers are hidden behind it. It dates from round 3.
  - F-UX3A2-2, Low: the button-link and phone-tab focus-under-hover rules are unguarded by
    tests.
  - F-UX3A2-3, Low: the Sign out entry is 3px out of line.
  - F-UX3A-01..06 are closed; F-UX3A-04 is closed except for that offset.
  - DPR 2 seams are clean.
  - Risk R-A2-1: the hover scan gates by text, so mutant M6b survives.
  - Full e2e 645 / 0 failed after one allowed network-error rerun.
- Coordinator decision: one bounded fix WP5-UX3-FIX4 (worker-high, sonnet).
  - Scope: F-UX3A2-1..3 and F-UX3B2-1, plus the guards R-A2-1, R-B2-1 and R-B2-4, and the
    docs/10 line 240 label. Each guard is proven by its mutant.
  - Then FIX4-FREEZE, a reduced WP5-UX3-REGATE3, fresh rechecks A3 and B3, and AUDIT-INT.
- Running now: WP5-UX3-FIX4.
- WP5-UX3-FIX4 done (worker-high, self-reported claude-sonnet-5-5).
  - More closes when focus leaves the tab bar.
  - Sign out is aligned.
  - New guards: button-link and phone-tab rings, the matchMedia hover scan, the removal-note
    absence, and "Confirm breaks" on a session ended today.
  - The suggestedRows comment and the docs/10 figure (487.01 kB).
  - Mutants M1, M4, M5, M6b, M6a and M5b are all caught.
  - Unit 2141; full e2e 651 passed / 0 failed; verify 0.
  - Digest 245e9459 (833 files; 8 changed paths).
- Running now: WP5-UX3-FIX4-FREEZE (committer, alone).
- WP5-UX3-FIX4-FREEZE done: 86294412ce15e221f6e0fbc782f0b52a332352be on main, pushed.
  - 581 files: 8 outside handoff, 18 records, 555 evidence files.
  - Digest 245e9459, on HEAD too.
  - Every check 0.
- Coordinator decision: FIX4 is small and touches no time, server or request logic.
  - WP5-UX3-REGATE3 is reduced: gate item 1 in full, items 2 and 3, FULL runs at a window day
    and a DST change, the FIX4 behaviours and mutants, the touched round checks, and a full
    axe scan.
  - No separate A3/B3: the fresh WP5-UX3-AUDIT-INT also rechecks the A2/B2 findings and
    FIX4's diff, and depends on REGATE3 only.
- Running now: WP5-UX3-REGATE3 (verifier, sonnet) on 8629441 / 245e9459.
- While REGATE3 runs, the AUDIT-INT brief was rewritten.
  - It now covers the recheck of F-UX3A2-1..3, F-UX3B2-1 and the FIX4 guards and diff,
    the integration of all round-3 reviews and gates including GOV2, cross-area probes,
    AC-13 in three zones, the docs, and the mandatory checks with a full e2e.
  - Target 8629441 / 245e9459; it depends on REGATE3 only.
- The owner asked why so much runs for a small AGENTS edit. The AGENTS chain itself took
  about 20 minutes. The rest is round 3: the interrupted REGATE2 had to rerun anyway, and
  the rechecks found real defects. Keep the remaining work minimal.
- WP5-UX3-REGATE3 done: FAIL on item 4 only.
  - FIX4's new test `day-editor.spec.ts:3895` depends on the time of day. Between 00:00
    and about 03:00 its session crosses midnight, and the phone shows chips.
  - Everything else passed: real-clock e2e 651 / 0, drill, AC-13, the boundary, every FIX4
    behaviour and mutant, and axe.
- Coordinator decision:
  - WP5-UX3-FIX5 changes the test only, by the FIX4 author resumed.
  - Then FIX5-FREEZE and a minimal WP5-UX3-REGATE4. It proves the builds are
    byte-identical to 8629441's so REGATE3's other items carry forward, and reruns only
    the tests.
  - Then AUDIT-INT.
- Running now: WP5-UX3-FIX5.
- WP5-UX3-FIX5 done (test only).
  - The test now uses its own synthetic person in a fixed-offset zone where it is midday
    now, and asserts the server's today.
  - It passes at 00:30, 01:45, 02:00, 12:00 and 23:30 PDT and on the real clock, on both
    projects.
  - M5b fails it at 01:45 and at 12:00.
  - day-editor 120 passed / 0 failed; verify 0; digest 95323f2d.
- Running now: WP5-UX3-FIX5-FREEZE (committer, alone).
- WP5-UX3-FIX5-FREEZE done: 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d on main, pushed.
  - 260 files: the spec, 8 records, 251 evidence files.
  - Digest 95323f2d, on HEAD too.
- Running now: the minimal WP5-UX3-REGATE4 (verifier, sonnet) on 5c101c1 / 95323f2d.
  - It proves that only the spec changed and that the builds are byte-identical to
    8629441's, so REGATE3's other items carry forward.
  - It reruns npm test, the real-clock full e2e, FULL runs at the two instants, and the
    fixed test at night with M5b.
- Then WP5-UX3-AUDIT-INT on 5c101c1, with its brief retargeted.
- WP5-UX3-REGATE4 done: FAIL on item 2 as written.
  - Identity and build equality hold, so REGATE3's items carry forward.
  - The fixed test and M5b pass, and both simulated FULL runs ended 651 / 0.
  - Three real-clock full runs each had one different failure in an unchanged test:
    - surfaces.spec.ts:215 and keyboard-access.spec.ts:444 hit a 30 s timeout waiting for
      the sign-in page;
    - hover.spec.ts:718, a FIX4 test, failed with "element not attached".
  - The failing tests passed when repeated alone.
- Running now: the read-only diagnosis WP5-UX3-DIAG1 (planner, sonnet). It classifies each
  failure as a test race, a product defect or an environment or load event, with
  evidence. The next step depends on its result.
- WP5-UX3-DIAG1 done.
  - Two failures are environment: `net::ERR_NO_BUFFER_SPACE` on the app bundle, a known host
    buffer event; the existing rerun rule applies.
  - hover.spec.ts:718 is a race in a FIX4 test: a stale desktop button is resolved before the
    layout swap. A one-line selector fix is proved.
  - A fourth full run passed 651 / 0.
- Coordinator decision:
  - WP5-UX3-FIX6 applies the one-line test fix.
  - Then FIX6-FREEZE and a minimal REGATE5: identity, build equality, npm test, one real-clock
    full e2e, the ring test repeated.
  - Rule clarification: a failure showing ERR_NO_BUFFER_SPACE counts as a buffer error even
    when it surfaces as a timeout.
  - Then AUDIT-INT.
- Running now: WP5-UX3-FIX6 (worker, sonnet).
- WP5-UX3-FIX6 done: one selector line plus a comment in hover.spec.ts.
  - The ring test x30 gave 60 passed; hover.spec.ts on both projects gave 70 passed.
  - npm test 2141; verify 0; digest 507de97c.
- Running now: WP5-UX3-FIX6-FREEZE (committer, alone).
- WP5-UX3-FIX6-FREEZE: attempt 1 stopped at validate_orchestration. It was a coordinator
  slip: the REGATE4 entry had no evidence list. After the board fix, attempt 2 committed
  and pushed 8e557100d16b6b6eb86a48e00276835761aabfdf (88 paths; digest 507de97c, on HEAD
  too; every check 0).
- Running now: the minimal WP5-UX3-REGATE5 (verifier, sonnet) on 8e55710 / 507de97c.
  - It covers identity and build equality, npm test, one real-clock full e2e under the
    clarified buffer-error rule, the ring test x30, and the validators.
- Then WP5-UX3-AUDIT-INT on 8e55710, with its brief retargeted.
- WP5-UX3-REGATE5 done: PASS on 8e55710 / 507de97c.
  - Only hover.spec.ts changed, and the 236 dist files are byte-identical.
  - npm test 2141; real-clock full e2e 651 passed / 0 failed with no rerun; ring test x30
    60 passed; validators 0.
  - REGATE3 and REGATE4 items carry forward. Docker, NAS and non-Chromium browsers are not
    run here.
- current_source_digest is 507de97c.
- Running now: the fresh opus WP5-UX3-AUDIT-INT on 8e55710. It is the final recheck and
  integration audit whose PASS re-accepts WP5.
- WP5-UX3-AUDIT-INT done: PASS with no finding, on 8e55710 / 507de97c. WP5 is re-accepted.
  - Every A2/B2 finding and guard is closed, by its own probes and mutants.
  - Every owner item (U-01..U-27, N-1, N-2, G-1..G-5, Q6, the chips, Q7) is mapped to its
    review.
  - Cross-area checks hold; axe 0; AC-13 passes in three zones.
  - Real-clock e2e 651 / 0.
  - Optional risks R-INT-1..4: R-INT-1 is one docs/04 sentence on the More panel.
- Running now: WP5-UX3-ACCEPT-DOCS (light, sonnet). It refreshes the pilot packet identity
  and adds the round-3 section to WP5_HANDOFF, EN and VI.
- Then STATE and NEXT_ACTION by the coordinator, and the WP5-UX3-ACCEPT commit with the
  board back at `software_ready`.
- WP5-UX3-ACCEPT-DOCS done.
  - Pilot packet: identity 8e55710 / 507de97c, server provenance, REGATE3 drill figures,
    WP5-UX2-Q3 superseded by G-5 (b), and the round-3 backlog by ID.
  - WP5_HANDOFF: a round-3 section.
  - EN/VI parity holds; preflight 0; digest unchanged.
- STATE and NEXT_ACTION (EN and VI) now record the re-acceptance on 8e55710 / 507de97c.
- Running now: the handoff-only accept commit WP5-UX3-ACCEPT (committer, alone).
  - After it returns, the coordinator sets the board to `software_ready` (next_task_id null,
    no running task). That flip stays uncommitted until the next commit, as after round 2.
- WP5-UX3-ACCEPT done: 1b96e9d36c4b32caab95d6c4638df7038134b189 on main, pushed.
  - 202 handoff paths and nothing outside handoff.
  - Digest 507de97c, unchanged.
  - Every check 0.
- **WP5 is re-accepted on 8e55710 / 507de97c. UI change round 3 is closed.**
  - The board is back at `software_ready` (next_task_id null). This flip, the ACCEPT
    result and this entry stay uncommitted until the next commit.
  - Next, owner: review the pilot packet and answer D-1..D-15.
  - The NAS is NOT VERIFIED; the pilot is not authorized.
  - Optional backlog for the pilot fix round, by ID, is in the WP5 handoff.

## Update 2026-10-20: owner request round 4 (WP5-UX4) and the pilot-decision answers

- The owner sent, in one message, a 15-item UI request (verbatim on the board,
  `owner_decisions` 2026-10-20) and the answers to D-1..D-15.
  - The UI items include a settings export/import feature, a paper-sheet panel for
    Timesheet and Review, round switches, panel corners, a content-based floating rule,
    select and checkbox polish, "Show worked hours", editing today's running session, and
    session-dialog changes.
  - Answers that need code: D-5 a, D-6 a, D-9 b (change-password route), D-15 b (holiday
    preview counts restored).
  - Documentation only: D-1 a, D-7 a, D-8 a, D-11 a, D-12 a, D-13 a, D-14 b. Defaults
    kept: D-2..D-4 a.
  - D-10 as written conflicts with the canonical rule F-3 (evidence, reasoned
    corrections) and with D-5 a. It is asked as WP5-OWN-Q1, recommending: start at 0,
    every change a correction entry with a short reason and no evidence document, history
    kept. The working assumption is no historical import.
- The coordinator agreed to "Show worked hours": the switch adds exactly the two
  worked-time rows (docs/04 line 41).
- The mission is reopened (`running`, phase `ux4-plan`). The board flip to
  `software_ready` after round 3 and the ACCEPT result are still uncommitted and travel
  with the next commit.
- Running now: WP5-UX4-PLAN (planner, opus, override size_risk). It is read-only and
  writes the plan, a mockup update, the slicing and at most 8 owner questions.
- WP5-UX4-PLAN done.
  - 15 items, with measurements: title gap 12px; the WFH checkbox 7.6px low; an added
    break's time box 265.6px against 192.5px; save errors off-screen.
  - Editing a running session is refused only by the client; the server already accepts
    it.
  - Settings design: personal file plus a company-calendar file, client-only.
  - Server slice T04: D-9 b password route, D-5 a, D-6 a, D-10, D-15.
  - Slices T01..T06; about 18-20 dispatches.
  - Mockup and 11 renders in `handoff/delivery/design/WP5-UX4/`.
- A handoff-only commit 18c8fd9 was made outside the mission's committer, probably by the
  owner (runtime observation). git.last_commit is set to it.
- Owner questions F-1..F-5 are open (board `open_owner_question_ux4`):
  - F-1 opening balance (it supersedes WP5-OWN-Q1);
  - F-2 D-15 b against the privacy rule;
  - F-3 export/import scope;
  - F-4 import behaviour;
  - F-5 mockup approval.
- The mission is `blocked` on them. next_task_id is WP5-UX4-T01, pending on F-5.
- The owner answered (verbatim on the board):
  - F-1 i: no historical import for the pilot; production keeps the import.
  - F-2 b: exact holiday-preview counts with a written privacy exception and an audit event.
  - F-3 a and F-4 a.
  - F-5 approved with changes:
    - the title gap is 32px;
    - the toolbar, weeks and footer keep today's style inside one paper sheet, and the
      signatures and dates stay in two rows;
    - the paper style is free;
    - Today and Now are right-aligned;
    - the week header row and first column get a stronger fill.
  - Commit 18c8fd9 was the owner's.
- Coordinator decision: slices in the order T04 (server), T01, T02, T03, T05, T06.
  - T04 also enforces the existing rule F-Q5 with a shared clock guard, and rewrites the
    canonical rules F-3 and the privacy exception in docs/03 and docs/10 (EN and VI).
  - The alert dialog is reused in the Check out dialog.
- Running now: WP5-UX4-T04 (worker-high, opus, override size_risk). The mission is
  `running`, phase `ux4-slices`.
- WP5-UX4-T04 first hand-back. Items 1-7 are done:
  - the password route and Profile card;
  - D-5 a, F-1 i and D-6 a;
  - the F-2 b counts with an audit event;
  - the shared clock guard, which also refuses reopening an ended session through a share;
  - docs/03 and docs/10.
- Results: unit 2152 passed / 1 failed; full e2e 0 real failures (one buffer error,
  rerun passed); mutants caught.
- The one failure is the route inventory in `tests/integration/ot-api.test.ts`, a path T04
  does not own. Two leftovers sit outside its paths: `importModel.ts` (old opening-balance
  rules) and `AdminScreen.tsx` (privacy sentence).
- Addendum 1 extends the paths for exactly these. Running now: T04 Addendum 1, same worker.
- WP5-UX4-T04 done after Addendum 1.
  - The route inventory test is updated, the opening-balance rules now live in
    `importModel.ts`, and the Administration intro carries the F-2 b exception.
  - npm test 2155 passed / 0 failed; the five touched specs 29 + 29 passed; verify 0.
  - Digest 6e9e3001 (835 files); 33 changed paths.
- Running now: WP5-UX4-T04-FREEZE (committer, alone).
- WP5-UX4-T04-FREEZE.
  - Attempt 1 stopped at the validators: the T01 placeholder had no brief, a coordinator
    slip.
  - After the T01 brief was written, attempt 2 committed and pushed
    5a68fba65bac6723ed3e66f33048b722d34c4656 (71 paths; digest 6e9e3001, on HEAD too; every
    check 0).
- Running now: WP5-UX4-T01 (worker-high, sonnet) on 5a68fba / 6e9e3001.
- WP5-UX4-T01 done (worker report; the round-4 audits check it independently).
  - Delivered:
    - a 32px title gap;
    - the paper wrapping the toolbar, both weeks and the footer, which keeps its layout and
      two signature rows;
    - a stronger week header row and first column;
    - round switches, a 12px select chevron, centred checkboxes;
    - "Show worked hours".
  - Results: unit 2155; full e2e 696 passed / 0 failed; 4 mutants caught; verify 0.
  - preflight PASS with the workflow Python (a first exit 1 came from a Python without
    tzdata). Digest 1921c36f (836 files); 16 changed paths outside handoff (1 new).
  - Deviation for the owner: Review switches to two columns at 1330px (was 1200px)
    because of an existing week-grid overflow at 1280px.
  - Left over: the `sheetModel.ts:141` comment goes to UX4-T03.
- Running now: WP5-UX4-T01-FREEZE (committer, alone).
  - Attempt 1 stopped before staging on a brief error, a coordinator slip: the two
    T04-FREEZE evidence files are untracked (`checks.txt`) or were not listed
    (`commit-message.txt`). Nothing was staged.
  - Addendum 1 lists both as new. The same committer resumes as attempt 2.
  - Attempt 2: the client permission system denied the committer's `git add` twice. It read
    the coordinator's decision as not user approval.
    - The re-verification before the denial passed: HEAD = origin/main = 5a68fba; the 16
      paths match; the T04-FREEZE evidence folder holds exactly the two `.txt` files.
    - Nothing was staged or committed.
  - Mission `blocked` on the owner's direct confirmation (WP5-UX4-FREEZE1-Q).
    - (a) Stage including the two files.
    - (b) Leave them out.
  - Next: the same committer resumes after the owner's answer, quoting it verbatim.
  - The owner answered "a" (stage including the two files). Mission `running`; the same
    committer resumes attempt 2 with the owner's words quoted.
  - A third `git add` denial: the permission system does not accept a relayed approval. This
    matches the 2026-10-03 precedent.
    - Pre-checks passed again. Nothing was staged.
    - The denial was not routed around: no fresh committer was dispatched.
  - Mission `blocked` on WP5-UX4-FREEZE2-Q.
    - (a) A direct owner message naming the action and its risk, then the same committer
      resumes.
    - (b) A manual commit by the owner with exact commands, then a read-only recon.
  - The owner chose (a) and sent the direct message (verbatim on the board). Mission
    `running`; the same committer resumes attempt 2 quoting it. If it is denied again,
    fall back to (b).
  - A fourth denial of a plain explicit `git add`, reason "[Auto-Mode Bypass]". Not routed
    around.
  - Fallback (b): the owner commits manually.
    - The message is in `evidence/WP5-UX4-T01-FREEZE/commit-message.txt`.
    - Mission `blocked` until the commit lands. A read-only verifier recon then records it.
  - The owner reported "xong, đã push". Running now: WP5-UX4-T01-FREEZE-RECON (verifier,
    read-only).
- WP5-UX4-T01-FREEZE done: the owner's manual commit 213bbdc8a013c96e7144d59dd5802e467572779d.
  - The recon passed all 8 checks: parent 5a68fba; message equal to the file; exactly 37
    paths; digest 1921c36f in the tree and on HEAD; validators PASS; privacy scan 0 hits.
  - Lesson (board runtime_observations): after a classifier denial, do not resume the same
    agent for the same action.
- Running now: WP5-UX4-T02 (worker-high, sonnet) on 213bbdc / 1921c36f.
  - It covers U4-05 (a non-modal floating panel with switch, unselect and a discard guard),
    U4-06 (the edge drawer) and U4-07 (the editorLayout rule).
- WP5-UX4-T02 first hand-back.
  - Reported done:
    - non-modal drawer from 768px with switch and unselect;
    - corners 0 / 12px;
    - the switch at 1330px (overlay scrollbars) / 1345px (classic);
    - unit 2164; mobile e2e 0 failed; mutants 1-6 caught; digest a56b26fd (839 files).
  - Gaps:
    - the Today button still moves an open editor without asking, which silently loses
      edits;
    - a clock-second dependent failure at `day-editor.spec.ts:3994` passed only on a rerun
      outside the rerun rule;
    - stale comments in `today.spec.ts`; `docs/12:39` goes to T06.
  - Path deviation: `src/client/DayEditor.tsx`. The brief's path was a coordinator error.
- Running now: T02 Addendum 1 (same worker). It guards every route that changes or closes the
  open day, fixes the time-dependent assertion deterministically, fixes the comments, and adds
  mutant 7.
- WP5-UX4-T02 done after Addendum 1.
  - One discard guard covers: day button or column, unselect, Open a day, Today,
    Previous/Next period, Current period, Close and Escape.
  - The Confirm-breaks failure was the test: the input holds HH:MM at 0 s. It now runs two
    pinned cases.
  - Full e2e: desktop 376 / mobile 347 passed, 0 failed, no reruns. Mutants 1-7 caught.
    Digest 04e16199 (839 files).
  - Not guarded by design: leaving the page through a link, and the reload after a label or
    batch commit changed the open day.
- Running now: WP5-UX4-T02-FREEZE.
  - A fresh committer runs alone.
  - The brief lists every path as dispatched. Extra WP5-UX4 task records and evidence are
    allowed by a pattern set at dispatch.
- WP5-UX4-T02-FREEZE committed and pushed b7cc06352687d1bc8cd6953b284915584a21e4fd.
  - 49 paths; digest 04e16199 on HEAD; every check 0.
  - One allowed whitespace fix, in `WP5-UX4-T01-FREEZE.md`.
  - Slip: one `node -e` used for the JSON parse.
- Coordinator decision: the U4-15 alert is reused in the Check out dialog.
- Running now: WP5-UX4-T03 (worker-high, sonnet; risk H with an existing pattern) on b7cc063
  / 04e16199.
  - Scope:
    - U4-11: edit the start of a running session;
    - U4-12: zone first;
    - U4-13: Today/Now, right-aligned, in the input zone;
    - U4-14: aligned break rows;
    - U4-15: the alert in the session and Check out dialogs;
    - the `sheetModel.ts:141` comment.
- WP5-UX4-T03 done (worker report; the round-4 audits check it independently).
  - Running edit: the integration oracle gives 601 regular minutes from 08:00 against 541
    from 09:00.
  - Today and Now are right-aligned within 1px; the Tokyo-zone test with an LA device and a
    frozen clock passes.
  - The break rows are aligned.
  - The alert works in both dialogs.
  - Results:
    - vitest 2185; full e2e desktop 394 and mobile 365 passed, 0 failed, no rerun;
    - mutants 1-7 caught;
    - build 498.66 kB, 1.3 kB under the 500 kB advisory. **T05 must split code**;
    - digest e3c7016b (840 files).
  - Notes:
    - axe-core is not a dependency; direct checks were asserted instead;
    - after the full e2e, a test-only U4-14 assertion was added and its tests passed again;
      the gate reruns everything;
    - slips: pipes into `head` and one empty heredoc.
- Running now: WP5-UX4-T03-FREEZE. A fresh committer runs alone, with the full path list
  set at dispatch.
- WP5-UX4-T03-FREEZE committed and pushed cda9c5172b06d3651e94e75ff30e9b1edfae382e.
  - 47 paths; digest e3c7016b on HEAD; every check 0.
  - Slip: one `/dev/null` redirect.
- Running now: WP5-UX4-T05 (worker-high, sonnet; risk H for privacy and the auto-submit
  flag, using the existing preview-then-confirm pattern) on cda9c51 / e3c7016b.
  - Scope: settings export and import per F-3 a and F-4 a.
  - Hard limits:
    - client only; a missing route is a stop;
    - an allowlist of keys;
    - no write without a preview and one confirmation;
    - a separate auto-submit tick;
    - the company file for administrators only;
    - the transfer code in a lazy chunk, so the main chunk stays under the 500 kB
      advisory.
- WP5-UX4-T05 done (worker report; audited later).
  - Client only, no route missing.
  - Personal file: work policy, submission and theme. Company file: zone, payroll, weekdays,
    holidays and payroll exceptions.
  - One confirmation; auto-submit only by its own tick.
  - Main chunk 489.14 kB.
  - Full e2e: desktop 400 / mobile 371 passed, 0 failed, no rerun. Mutants 1-6 caught (4
    split into 4a and 4b). Digest b4727677 (849 files).
  - Limits for the owner:
    - a company file with different working weekdays is refused, because no route writes
      them;
    - it applies to the administrator's own calendar;
    - the holiday commit and the payroll exceptions are separate writes.
- Running now: WP5-UX4-T05-FREEZE (a fresh committer, alone).
- WP5-UX4-T05-FREEZE committed and pushed 82d1ab4d8300de139db88dbaa9f7b2d56d2650b0: 52 paths;
  digest b4727677 on HEAD; every check 0.
- Running now: WP5-UX4-T06 (worker, sonnet; docs only) on 82d1ab4 / b4727677.
  - Docs: docs/01, 03, 05, 07, 10, 11 and 12 (+ vi), plus leftovers in docs/04.
  - Pilot packet §0, §4, §8 and §9, with the D-1..D-15 answer table.
  - Claims are checked against the frozen source.
  - The release identity is unchanged until ACCEPT-DOCS.
- WP5-UX4-T06 first hand-back (not committed).
  - The docs and the pilot packet are updated as briefed: parity 9 pairs, preflight PASS,
    claim check 39 rows, digest 32432deb.
  - One open claim: D-8. `smtpAdapter.ts:46` classes `ETLS` and `EREQUIRETLS` as
    permanent, while the docs say a certificate failure is retried.
- Running now: WP5-UX4-D8-DIAG (planner, read-only). It observes each SMTP security mode
  with a local synthetic TLS listener and self-signed certificates, and proposes true
  wording.
  - The T06 worker waits; it is not running.
  - Then either a T06 addendum aligns the D-8 wording, or the owner is asked if the
    premise of D-8 a changes.
- WP5-UX4-D8-DIAG done. The premise holds, so no owner question is needed.
  - A certificate failure arrives as `ESOCKET` in both modes and is temporary
    `smtp_unavailable`: five attempts, then intervention.
  - Only a refused STARTTLS gives `smtp_tls_failed`.
  - The docs were true but did not name the code.
- Running now: T06 Addendum 1 (same worker).
  - Precise D-8 wording.
  - One pinning test in `tests/integration/delivery.test.ts`, with a mutant.
  - typecheck, lint, npm test, then the digest last.
- WP5-UX4-T06 done after Addendum 1.
  - The D-8 wording is precise.
  - One test body in `delivery.test.ts` covers both STARTTLS and implicit TLS; its mutant
    was caught.
  - npm test 2219 passed; digest 104ca9c3 (849 files).
  - Risk note for the gate: a TLS-failure test without a trusted follow-up crashed the
    vitest worker (0xC0000005) at teardown. D8-DIAG's first probe also segfaulted. The final
    test sends a trusted follow-up, like the existing implicit-TLS test.
- Running now: WP5-UX4-T06-FREEZE (a fresh committer, alone). Its brief adds a PEM and key
  Grep on the D8-DIAG evidence.
  - Attempt 1 stopped before staging. The Grep hit `BEGIN` at `probe-script.txt:50`.
  - That line is a template literal building a certificate header around `${b64}` at run
    time, with no key material. The coordinator read it.
  - Addendum 1 allows exactly that hit. A fresh committer runs attempt 2.
- WP5-UX4-T06-FREEZE attempt 2 committed and pushed
  a3042dd9c2f94dd2287ef04ed815db0fbf1838b6.
  - 62 paths; digest 104ca9c3 on HEAD; every check 0.
  - The round-4 source is complete: T04 5a68fba, T01 213bbdc, T02 b7cc063, T03 cda9c51,
    T05 82d1ab4, T06 a3042dd.
- Running now: WP5-UX4-GATE (verifier, sonnet) on a3042dd / 104ca9c3. It covers:
  - the full WP5 gate;
  - a server boundary limited to T04's eight files;
  - the round scope;
  - the simulated-clock sweep;
  - the round-specific checks, including axe, contrast, CSP and chunks;
  - `npm test` three times, watching for worker crashes.
- WP5-UX4-GATE: **FAIL**.
  - **Product defect (T02, SC 2.4.11).** At 1280x800, "Edit 10/19" stays wholly under the
    left-docked floating drawer. `whollyCovered` compares strictly, and the button rests
    0.23px below the window.
  - **Date-dependent test defects:**
    - `sharing.spec.ts:399` on window days;
    - U4-11 on Sundays;
    - U4-05 reachability on 2026-11-01.
  - **Flakes:**
    - `keyboard-access.spec.ts:227` (mobile; the only real-clock failure, 770 passed);
    - the Today/Now contrast read;
    - the U4-14 seed at 23:58:30.
  - **Everything else passed:**
    - ci, lint, verify, AC-13, the drill (208 PASS), audit, validators;
    - `npm test` x3 with 0 worker crashes;
    - the boundary: only T04's eight server files, `dist/domain` identical;
    - the scope: 90 paths;
    - the T01, T03, T04 and T05 measurements;
    - axe 0 violations in 30 scans; CSP identical; main chunk 489 kB.
- Running now: WP5-UX4-FIX1 (worker-high, sonnet).
  - It reproduces and then fixes each finding.
  - SC 2.4.11 is judged on the visible part of the control, with a tolerance, a unit test,
    a 1280 walk and a mutant.
  - The tests become deterministic, proven at the six gate instants and by 10x repeats.
- WP5-UX4-FIX1 done (no stop). Each finding was reproduced first.
  - SC 2.4.11 is fixed in a pure `whollyCovered`: clipped to the window, 1px tolerance, 7
    unit cases, a 1280 walk docked on both edges, mutant caught.
  - The window-day and Sunday cases are test defects; the product is right per docs/02.
  - The keyboard flake is a layout shift: the lazy export card arrives mid-walk. The test
    now waits. A product mitigation (reserving the card's height) is flagged for audit A.
  - Results: 0 failed at the six instants; repeats 140/140 and 40/40; FULL e2e 774
    passed, 0 failed; npm test 2226; digest b3e9c962.
- Running now: WP5-UX4-FIX1-FREEZE (a fresh committer, alone), then WP5-UX4-REGATE.
- WP5-UX4-FIX1-FREEZE committed and pushed 0ddfeada1b66c82b066b179e901184ca5d857793.
  - 319 paths, including the gate's 242 and FIX1's 62 evidence files.
  - Digest b3e9c962 on HEAD; every check 0; key and PEM scan clean.
- Running now: WP5-UX4-REGATE (verifier, sonnet) on 0ddfead / b3e9c962.
  - Carry-forward needs `dist/server`, `dist/domain` and the lazy chunks byte-identical to
    a3042dd.
  - Reruns: core with `npm test` x3; real-clock FULL e2e; simulated FULL at three instants
    plus seven specs at three; the 1280 walk docked on both sides; 10x repeats; focused
    axe; the assertion check.
- WP5-UX4-REGATE: **PASS** on 0ddfead / b3e9c962.
  - `dist/server` and `dist/domain` are identical. The lazy chunks are identical once the
    chunk file names are normalised, so the gate items carried forward.
  - `npm test` x3: 2226 each, 0 crashes.
  - Real-clock FULL e2e: 774 passed, 0 failed.
  - Sweep: 0 failed (one buffer rerun).
  - 2.4.11: 12 walks, 0 hidden.
  - Repeats 140/140 and 40/40; axe 0.
- Running now, in parallel: WP5-UX4-AUDIT-A and WP5-UX4-AUDIT-B (fresh opus auditors).
  - Area A: visual, shell, Day editor, dialogs and accessibility.
  - Area B: data, security, settings files, sessions and docs.
- Then WP5-UX4-AUDIT-INT.
- WP5-UX4-AUDIT-B: **FIX REQUIRED**, one Low finding.
  - F-UX4B-1: five failed sign-ins with the email `password:<victim id>`, from the same
    client address, put the victim's password change at 429 for 15 minutes. The two flows
    share the limiter key space.
  - Optional risks R-UX4B-1..8. They include R-UX4B-2: an edit grantee can delete the
    owner's running session.
  - Checks: npm test x2; nine integration files; delivery x21 with no crash; AC-13 Tokyo;
    six e2e specs 239/0; 19 mutants all caught.
  - The coordinator stopped a background task the auditor left running.
- Waiting for WP5-UX4-AUDIT-A before the fix round: no source writer runs while an audit
  runs.
- WP5-UX4-AUDIT-A: **FIX REQUIRED**, 1 Medium and 3 Low.
  - F-UX4A-1 (Medium): with a classic 15px scrollbar the drawer flaps beside/floating at
    about 60 a second at 1330-1344px, within a band of window heights.
  - F-UX4A-2: Escape from a sheet control with unsaved edits shows nothing (no
    `preventDefault`).
  - F-UX4A-3: Current period, then Keep editing, puts focus on Today.
  - F-UX4A-4: docs/04 lines 67 and 108.
  - Everything else passed: axe 0 in 102 scans; 2.4.11 0 in 96 walks; 14 mutants caught;
    FULL e2e 773 passed (1 buffer rerun). The two unguarded routes and the lazy card shift
    are acceptable.
- Owner question WP5-UX4-R2-Q (R-UX4B-2: block an edit grantee deleting the owner's
  running session?) is open. Recommendation: (a) block.
- Running now: WP5-UX4-FIX2 (worker-high, sonnet).
  - F-UX4A-1..4 and F-UX4B-1, with separate limiter key spaces.
  - Cleanups for review-A risks 6 and 7.
  - Reproduce first; mutants; a classic-scrollbar e2e repeated 5 times; FULL e2e.
- WP5-UX4-FIX2 done.
  - The flap fix is `html { overflow-y: scroll }`, because `scrollbar-gutter: stable` was
    measured not to work. A classic track is now always drawn on desktop browsers that use
    classic scrollbars.
  - Escape now uses `preventDefault`.
  - Current period moves focus only on proceed.
  - The sign-in limiter key is now `login:<email>`; the address bucket stays shared, as
    documented.
  - Cleanups.
  - Results: mutants caught; FULL e2e 779 passed, 0 failed; npm test 2226; digest 1c1c526f
    (850 files).
- The owner question WP5-UX4-R2-Q is still open. An answer (a) becomes a small FIX3.
- Running now: WP5-UX4-FIX2-FREEZE (a fresh committer, alone), then REGATE2 and the
  rechecks A2 and B2.
- WP5-UX4-FIX2-FREEZE committed and pushed 178f1cf8970086018e2e96e8340d911077a2d3ad.
  - 352 paths; digest 1c1c526f on HEAD; every check 0; key and PEM scan clean.
- Running now: WP5-UX4-REGATE2 (verifier, sonnet) on 178f1cf / 1c1c526f.
  - `dist/server` may differ only in `auth.ts`.
  - The drill and AC-13 in three zones are rerun.
  - The real-clock FULL e2e and the simulated sweep.
  - The findings rechecked, including the classic-scrollbar probes and the side effects of
    the root `overflow-y: scroll`.
- Owner answers (2026-10-21, verbatim on the board):
  - R2 a: block an edit grantee from deleting the owner's running session.
  - R3 b: Review shows two columns again from 1200px.
  - R4 a: the footer is unchanged.
  - R5: the owner asked for an explanation of the flap. The question stays open with
    options (a) keep the always-visible track, or (b) decide on a width that always
    subtracts the classic scrollbar, with no forced track.
- REGATE2 is asked to stop early and clean up, because FIX3 (R2, R3 and R5 if b) changes
  the source again and a later regate covers everything.
- WP5-UX4-REGATE2: NOT VERIFIED, stopped early and cleaned up.
  - Done: identity (only `auth.js` differs in `dist/server`), `npm test` x3 with 0 crashes,
    the drill (208 PASS), AC-13 in three zones, integration, routes, audit.
  - The real-clock FULL e2e failed one test: `hover.spec.ts:125` on mobile, a settle
    timeout and not a network error. It goes into FIX3.
- WP5-UX4-FIX3 brief written. FIX3 is `blocked` on the owner's R5 answer, and so is the
  mission. It covers:
  - R2 a: a server guard and the client hide;
  - R3 b: Review two columns from 1200px without overflow;
  - R5 per the answer;
  - the `hover.spec.ts` timeout.

## Update 2026-10-21: owner request round 5 (WP5-UX5)

- The owner answered R5 b and sent a large round-5 request, verbatim on the board
  (`owner_decisions` 2026-10-21). It covers:
  - compact mode below 480px instead of 768px;
  - top bar, chevron seam, icons, button heights, theme toggle, time-range spacing;
  - Timesheet period card and week sheet details;
  - Day editor: no corners, outside click, Partial leave sub-dialog, phone Save fixed;
  - a Review and sign off redesign that splits Sign off and Send;
  - a PDF redesign.
- Coordinator decision:
  - FIX3 runs now with R2 a, R5 b and the hover timeout. R3 b is dropped as superseded,
    because the checklist moves into a sign-off dialog.
  - WP5-UX5-PLAN (opus planner, read-only) runs in parallel.
- Owner question WP5-UX5-Q0, with the missing PDF image and the licence text:
  - (a, recommended) fold round 4 into round 5's gate and audits;
  - (b) close round 4 first.
- Running now: WP5-UX4-FIX3 (worker-high, sonnet) and WP5-UX5-PLAN (planner, opus).
- Owner answers:
  - **Q0 a:** round 4 is folded into round 5's gate and audits. No separate round-4
    regate, recheck or integration after FIX3-FREEZE.
  - **Q2:** footer "© 2026 C&D Semiconductor Services, Inc. All rights reserved." and
    "Internal use by C&D only".
  - **Q1:** a reference image of the PDF page. It holds a name and a signature, so it is
    kept out of the repository (AGENTS rule 4). Its layout is described in text on the
    board, and the planner has been told.
- WP5-UX5-PLAN done.
  - 34 items.
  - Causes confirmed: the 767/768 desync at 150% scaling, the chevron seam from two
    gradient tiles, the WEEK bar width, and the "68px" buttons (44px touch targets at
    150%).
  - Slices T01 (the sign-off/send split, risk H) to T06.
  - No migration; no GOV path unless F-1 c or F-6 b.
  - Mockup with 11 renders.
  - Owner questions F-1..F-10 are open (`open_owner_question_ux5_f`).
- WP5-UX4-FIX3 is still running.
- Owner answers (verbatim on the board):
  - F-1 a, F-2 a, F-6 a, F-7 a, F-8 a, F-10 a;
  - F-3 b: per-send PDF switches, with Settings defaults;
  - F-4: the envelope is editable per send; a further send needs a confirmation and a typed
    reason;
  - F-5 b: the signature image is optional;
  - F-9 b: a licensed handwriting font if one is found, else a.
  - Mockup adjustments: B1, B2, B5, B7/B9 (two signature rows; header fill kept), B11.
- Running now: WP5-UX5-PLAN Addendum 1 (same planner, read-only): it revises B, C, the
  mockup and E. FIX3 is still the source writer.
- WP5-UX5-PLAN Addendum 1 done.
  - Each send is a new record with its own envelope and switches. Up to four PDF variants
    are stored.
  - Reason rule: 2-500 characters, audited. A copy counts as sent once any attempt was
    accepted or uncertain.
  - The optional signature image needs migration 0014.
  - Font: Indie Flower (SIL OFL 1.1), with ADR 0001.
  - Mockup re-rendered, 12 renders.
  - Slices: T01a sign-off, T01b sends, T02 PDF, T03 Review, T04 breakpoints, T05 sheet and
    editor, T06 docs. Estimate 24-28 dispatches.
- Owner question WP5-UX5-G-1 (mockup and font approval) blocks T02..T05. T01a starts after
  FIX3-FREEZE.
- WP5-UX4-FIX3 done.
  - R2 a: deleting through a share answers 409 and the client hides Delete.
  - R5 b: `innerWidth` minus a probe-measured scrollbar width; no forced track.
  - Hover: the REGATE2 failure was a ~24 s host stall that ran out a 7 s poll. Fixed with
    an event-based settle in `hover.spec.ts`; 1050/1050 on mobile. `contrast.ts` still has
    the old helper; round 5 picks it up.
  - Results: FULL e2e 0 failed; mutants caught; digest 7af8e935.
- Running now: WP5-UX4-FIX3-FREEZE (a fresh committer, alone). It is the last round-4
  commit.
- WP5-UX4-FIX3-FREEZE committed and pushed 57c41e8e43fb6e10df654294361818e59bff86ca.
  - 179 paths; digest 7af8e935 on HEAD; every check 0; scans clean.
  - Round 4 is folded into round 5.
- Owner, verbatim on the board: mockup notes 2 (B2, B7/B9, B11) and Indie Flower approved.
  The owner asks that the reference image be given to the mockup agent. It is viewed from
  the session temp folder only, never copied, with no real name or signature.
- Running now, in parallel:
  - WP5-UX5-T01a (worker-high, sonnet; source writer): signer from the account, optional
    signature image with migration 0014. The sign-off/send split is left to T01b.
  - WP5-UX5-PLAN Addendum 2 (planner, read-only): the mockup notes.
- T01a stopped on scope before any edit. Compiling and verify need five more paths:
  `ReviewScreen.tsx`, `ReviewEnvelope.tsx`, the smoke and drill scripts, and
  `DEVELOPMENT.md` (+ vi).
  - Addendum 1 adds them and makes `signer_name` accepted-and-ignored, so the 22 test files
    stay valid.
  - `scripts/precommit-check.mjs` stays out, because it is a GOV path; the other scripts
    are not.
  - The same worker resumes.
- WP5-UX5-PLAN Addendum 2 done.
  - B2 thresholds measured.
  - B7/B9: aligned lines, 22rem and 11rem; Sign off inset 8px.
  - B11: typography measured from the reference image without storing it. Serif
    Condensed Bold 17/18pt titles, bold small-caps day names, Indie Flower 13pt, fields
    54pt in, rows 34/69/16/17pt.
  - Renders updated. No new question.
- Owner adjustment 3 (verbatim on the board): on the Review page and in the Sign off dialog,
  the signature rows and their dates are inset 1 tab from the left and 2 tabs from the right.
  - Recorded as plan Addendum 3, with 1 tab = 0.5 in (48px / 36pt).
  - It is applied in UX5-T03 without a re-render. The PDF is unchanged unless asked.
- The owner corrected adjustment 3 (verbatim on the board): the signature rows on Review and
  in the Sign off dialog take the same insets as the B11 PDF mockup.
  - Plan Addendum 3b supersedes the 1-tab/2-tab rule.
  - UX5-T03 measures the B11 proportions and applies them as tokens.
- WP5-UX5-T01a done.
  - The signer comes from the account; `signer_name` is ignored.
  - The image is optional, through migration 0014 with an upgrade test from v13.
  - Results: FULL e2e 779 passed, 0 failed; mutants 3/3; digest 783a63f8 (851 files).
  - One assertion outside the owned paths was accepted (`history-settings.spec.ts:286`).
  - docs/01 FR-11 goes to T01b.
- Running now: WP5-UX5-T01a-FREEZE (a fresh committer, alone), with 39 paths.
  - Attempt 1 stopped at the validators with "Invalid task ID". The IDs contained a
    lowercase "a", a coordinator slip.
  - The board IDs are renamed WP5-UX5-T01A and WP5-UX5-T01A-FREEZE; the file names are
    kept.
  - The same committer re-stages the board and the checkpoint and reruns every check
    (attempt 2).
- WP5-UX5-T01A-FREEZE attempt 2 committed and pushed
  c1b2cc4f31cc9a3957a04056a8dff413977b97b5. 60 paths; digest 783a63f8; every check 0.
- Running now: WP5-UX5-T01B (worker-high, **opus**, override `size_risk`: an L/H/novel
  outbox slice). It covers:
  - sign-off without sending;
  - `revision_sends` and the PDF variants (migration 0015);
  - the send-draft, send and pdf routes;
  - the reason rule;
  - the deadline send and reminders;
  - the transitional UI wiring;
  - docs/01 FR-11.
- T01B stopped on scope before any edit. Missing paths: the History resend components, the
  admin operations status (one row per variant), `submissionSettings.ts`, and
  `admin-status.spec.ts`.
  - Design addition, approved: migration 0015 backfills a send record for every existing
    send job, so a pre-upgrade send is never re-sent at the deadline.
  - Addendum 1 adds the paths. The same worker resumes.
  - Lesson: inventory the call sites of every changed contract before writing a slice's
    owned paths.
- T01B stopped a second time, again before any edit. `tests/support/schemaV6.ts` needs its
  own v6 send jobs after the split.
  - Addendum 2 adds `tests/support/` for fixture adaptations only.
  - The worker now implements.
- WP5-UX5-T01B done (opus).
  - Sign-off no longer sends. Each send is a record; PDF variants; the reason rule.
  - Migration 0015, with a backfill and an upgrade test.
  - Deadline send and reminders per F-2 a; transitional UI.
  - Results: vitest 2261; FULL e2e 779 passed, 0 failed; mutants 5/5; digest 089cf868
    (854 files).
  - The drill was edited but not run; it needs Docker and the gate covers it.
  - Deviation, asked as owner question WP5-UX5-H-1: "submitted" means any revision of the
    period has a send, so corrections are not auto-sent at the deadline.
- Running now: WP5-UX5-T01B-FREEZE (a fresh committer), with a rule-based path set.
  - Attempt 1: the classifier denied `git add --pathspec-from-file` with "[Credential
    Leakage]". It was not retried and nothing was staged.
  - The checks before it all passed: the digest, the 71 paths meet the rules, and the scans
    found 0 hits.
  - Likely cause: my brief's list-file staging hides the paths from the check; earlier
    freezes staged explicit paths.
  - Per the lesson, the same agent is not resumed.
  - The owner is asked to choose (a) a fresh committer with explicit paths, or (b) a manual
    commit. The mission is `blocked`.
- Owner (2026-10-22, verbatim "1 a, 2 a"):
  - a fresh committer with explicit paths, per brief Addendum 1. If it is denied again, it
    stops and the owner commits manually;
  - H-1 a: corrections after a sent copy are sent by the person, not at the deadline (as
    built).
  - The mission is `running`.
- WP5-UX5-T01B-FREEZE attempt 2 (fresh committer) committed and pushed
  9917ae8443f46cc3fc2dce79214176ff04bc01ba.
  - 96 paths staged as explicit arguments, none denied. Digest 089cf868.
  - Rule kept: never stage from a list file.
- Running now: WP5-UX5-T02 (worker-high, sonnet): the PDF layout per Addendum 2, the Indie
  Flower asset with ADR 0001, the font fallback, the Dockerfile, and the wordmark test
  change.
  - It inventories first and reads the precommit check.
  - It stops if a governance change or a missing path is needed.
- T02 stopped on its inventory before any edit. `.dockerignore` is an allow-list, so it
  needs `!assets/pdf-fonts/`.
  - The precommit check does not refuse `.ttf` or `OFL.txt`, so no GOV change is needed.
  - Addendum 1 adds `.dockerignore` (one line). The same worker implements.
- T02 implemented: one page in all four variants per Addendum 2; Indie Flower with its
  SHA-256 and a fallback; ADR 0001; mutants 5/5; digest e9a8b42d.
  - Two e2e failures (`automation.spec.ts:118`, desktop and mobile) read the old PDF text.
  - Addendum 2 owns those two assertions and asks for a full e2e rerun.
  - The coordinator stopped a leftover `python -` background task.
- WP5-UX5-T02 done.
  - FULL e2e 779 passed, 0 failed, after one allowed buffer rerun; npm test 2300; digest
    0f0467ab (862 files).
  - Audit note: `automation.spec.ts:191` now checks "VERTIME" and `:202` is vacuous. Test
    strength to review.
- Running now: WP5-UX5-T02-FREEZE (a fresh committer).
  - 24 explicit paths, including the one font file, checked by size and hash.
- T02-FREEZE attempt 1 stopped at `git diff --cached --check`. `OFL.txt:21` has trailing
  whitespace from upstream. 61 paths remain staged.
  - The T02 author trims it (Addendum 3, without touching the git index) and gives a new
    digest.
  - The same committer then re-stages and reruns (attempt 2).
- T02 Addendum 3 done.
  - `OFL.txt` was trimmed. The READMEs and ADR 0001 (EN/VI) say so.
  - Tests and preflight pass. New digest 1b413273.
  - T02-FREEZE attempt 2 runs: re-stage and rerun.
- WP5-UX5-T02-FREEZE done: b4c500456a69158571799f8f0d90f035fd7a0fa5 on main, pushed (61
  paths: 24 outside `handoff/`, 37 handoff). Digest 1b413273 (862 files) before staging and
  on HEAD; every check exit 0.
- Running now: WP5-UX5-T03, the Review and sign off page with the Send card
  (worker-high, sonnet; size L, risk H; base b4c5004 / 1b413273; ports 49720-49739).
  - The brief puts the owner's F-3 b, F-4 and F-5 b answers and Addendum 3b above plan B3.
  - Also: the Settings switch "Time rows on the PDF", the settings-file key, and the
    `revision.send` label and reason display in History.
  - No `src/server` path is owned. The worker inventories first and stops if one is
    needed.
- WP5-UX5-T03 done (worker report; the gate and audits are pending). No inventory stop;
  `src/server` untouched.
  - npm test 2312; FULL e2e 795 passed, 0 failed, no rerun; mutants 5/5; verify 0; digest
    d23e3617 (862 files).
  - The signature fractions from the B11 mockup and from `layout.ts` agree exactly.
  - Deviations:
    - "From" shows a placeholder before a revision exists;
    - "PDF Preview" opens in a new tab, because the CSP forbids framing;
    - `App.tsx` lazy-loads Review, for the chunk limit;
    - the worker staged the two deleted files with `git rm --cached` so the digest script
      runs.
  - Slips: one heredoc, one `/dev/null`.
- Running now: the lookup WP5-UX5-T03-PATHS (light, haiku, read-only). It lists the exact
  paths for the T03-FREEZE brief.
- T03-PATHS done. Outside `handoff/`: 28 modified, 2 new, and 2 deletions, already staged.
  Nothing else is staged. No path is outside the owned set, and there is no binary.
- Running now: WP5-UX5-T03-FREEZE (a fresh committer, alone). It stages 32 explicit paths
  plus the handoff records; the digest must be d23e3617.
- WP5-UX5-T03-FREEZE done: 65def2f61b6cb82e8c23cb01c15e787d2d0b1c14 on main, pushed (56
  paths: 32 outside `handoff/`, 24 handoff). Digest d23e3617 (862 files) before staging and
  on HEAD; every check exit 0. Slips: one `2>/dev/null` and one `| head`.
- Running now: WP5-UX5-T04, the breakpoints, top bar and period card (worker-high, sonnet;
  size L, risk H; base 65def2f / d23e3617; ports 49740-49759).
  - It covers U5-01, U5-02, U5-08 to U5-15, U5-22 and the B1 gap.
  - F-6 a: only the sheet's compact form moves to below 480px. The shell, the Day editor,
    dialogs and the 44px rule stay at 768px.
  - U5-14 with H-1 a: the Review button is primary while an ended period still needs the
    person, and secondary once any revision of the period has a send.
  - No `src/server` path is owned.
- WP5-UX5-T04 done (worker report; the gate and audits are pending). No inventory stop;
  `src/server` untouched.
  - npm test 2333; FULL e2e 809 passed, 0 failed, no rerun; mutants 5/5; verify 0; digest
    2ba69f62 (867 files).
  - Every media query is in range syntax; a vitest test enforces it.
  - Fractional widths (479.33, 767.33) are proved on the style sheet's text only, because
    a browser cannot set a fractional viewport.
  - Deviations:
    - the shared-view wordmark shows from 492px, not about 250px, so it never adds a bar
      row;
    - the period-card thresholds are measured: 600px, plus 138px with Current period.
  - Slips: three empty heredocs, two `/dev/null`, one `| head`, and temporary `zz-*`
    probes in `tests/e2e/`, removed before the full runs.
  - Left for T05: U5-16, U5-21, the Timesheet signature link label, and old 768-899
    comments.
- Running now: the lookup WP5-UX5-T04-PATHS (light, haiku, read-only), including a `zz-*`
  check.
- T04-PATHS done. Outside `handoff/`: 20 modified, 5 new, 0 deleted. Nothing is staged.
  No path is outside the owned set, there is no binary, and there is no `zz-*` file.
- Running now: WP5-UX5-T04-FREEZE (a fresh committer, alone). It stages 25 explicit paths
  plus the handoff records; the digest must be 2ba69f62.
- WP5-UX5-T04-FREEZE done: 060302bcb41050c116e2519602f303c3a11cb01d on main, pushed (58
  paths: 25 outside `handoff/`, 33 handoff). Digest 2ba69f62 (867 files) before staging and
  on HEAD; every check exit 0; no slip reported.
- Coordinator decision: UX5-T05 is split.
  - **T05A:** the week sheets, toolbar and controls, plus the T04 leftovers, the
    `contrast.ts` settle helper and the `automation.spec.ts` PDF assertions.
  - **T05B:** the Day editor (U5-23 to U5-26).
- Running now: WP5-UX5-T05A (worker, sonnet; size L, risk M; base 060302b / 2ba69f62;
  ports 49760-49779).
  - Items: U5-03 to U5-07, U5-16 to U5-21 and U5-17b.
  - F-1 a: 36px visible sub-buttons, with a 44px invisible hit area below 768px and with
    a coarse pointer.
  - Only the range text may change in `src/domain/policy.ts` and the PDF, if any.
- WP5-UX5-T05A done (worker report; the gate and audits are pending). No inventory stop.
  - npm test 2344; mutants 5/5; verify 0; digest 66574877 (867 files).
  - FULL e2e run 2 after the last change: 845 passed and 1 failed, a mobile buffer error.
    That one test was rerun alone and passed; the full suite was not rerun.
  - The PDF prints no range, so `timesheetPdf.ts` is untouched.
  - The thresholds were measured again. A wrap fallback was added for late "+1" ranges in
    the narrowest phone cell.
  - Many runtime slips. A hung `python -` was left in the background; the coordinator
    stopped the finished worker agent to end it.
  - Audit notes:
    - the Review header does not wrap (`nowrap`), against U5-16;
    - the changed 44x44 test;
    - the partial rerun;
    - the docs/04 parity wording.
- Running now: the lookup WP5-UX5-T05A-PATHS (light, haiku, read-only).
- T05A-PATHS done. Outside `handoff/`: 32 modified, none new or deleted. Nothing is
  staged. Nothing is outside the allowed set or under `src/server`, and there is no `zz-*`
  file.
- Running now: WP5-UX5-T05A-FREEZE (a fresh committer, alone). It stages 32 explicit paths
  plus the handoff records, including the draft T05B brief; the digest must be 66574877.
- WP5-UX5-T05A-FREEZE done: 70f7800b9c1582cffee453ac0bc8c741418f6f99 on main, pushed (56
  paths: 32 outside `handoff/`, 24 handoff). Digest 66574877 (867 files) before staging;
  every check exit 0.
  - Deviation: after the commit the committer re-ran the working-tree digest instead of
    the `git ls-tree` digest of HEAD. The tree outside `handoff/` was clean; the gate
    records HEAD identity.
- Running now: WP5-UX5-T05B, the Day editor (worker-high, sonnet; size M, risk H; base
  70f7800 / 66574877; ports 49780-49799).
  - Items: U5-23 (no drawer corners), U5-24 with F-7 a (an outside press closes, with the
    discard guard; controls keep their action), U5-25 (Partial leave sub-dialog; Notes
    stay, B5) and U5-26 (phone: no Figures, a fixed Save).
- WP5-UX5-T05B done (worker report; the gate and audits are pending). No inventory stop;
  `src/server` untouched.
  - npm test 2345; FULL e2e 859 passed, 0 failed, no rerun; mutants 5/5; verify 0; digest
    a5dcb5a6 (868 files; new `LeaveDialog.tsx`).
  - `LeaveRow.tsx` was not reused: it is the OT leave-request row.
  - The outside-press handlers call `preventDefault`, so focus returns to the day button.
  - No runtime slip reported.
  - Audit notes:
    - after a save from the phone foot with the body scrolled, the "saved" status is
      announced but not in view;
    - a press on a bare part of the top bar closes the drawer.
- Draft brief ready: WP5-UX5-T06 (docs/04, docs/12, the pilot packet and new samples).
- Running now: the lookup WP5-UX5-T05B-PATHS (light, haiku, read-only).
- T05B-PATHS done. Outside `handoff/`: 11 modified, 1 new (`LeaveDialog.tsx`), 0 deleted.
  Nothing is staged, and there is no disallowed path, binary or `zz-*` file.
- Running now: WP5-UX5-T05B-FREEZE (a fresh committer, alone). It stages 12 explicit paths
  plus the handoff records, including the draft T06 brief. The digest must be a5dcb5a6,
  checked on HEAD with `git ls-tree`.
- WP5-UX5-T05B-FREEZE done: 69d63400486a977f10e022deea85026c6751b687 on main, pushed (26
  paths: 12 outside `handoff/`, 14 handoff). Digest a5dcb5a6 (868 files) before staging
  and from HEAD's `git ls-tree`; every check exit 0. All five source slices of round 5 are
  frozen.
- Running now: WP5-UX5-T06, docs and pilot packet (worker, sonnet; size L, risk M; base
  69d6340 / a5dcb5a6; ports 49800-49819).
  - It covers docs/04 and docs/12 (EN/VI), the pilot packet (EN/VI), and new synthetic
    samples from a clean export of 69d6340, in capture mode.
  - The release identity and drill figures are left for ACCEPT-DOCS. No source change: the
    digest must stay a5dcb5a6.
- Coordinator correction during T06: the source digest covers `docs/` (only `handoff/` is
  excluded), so T06's docs edits move it. Sent by message, and recorded as Addendum 1.
- T06 first hand-back.
  - Docs updated: docs/04, docs/12 and docs/11 (EN/VI; docs/07 needed none), and the pilot
    packet (EN/VI).
  - Samples come from a clean export of 69d6340: S1-S6 and N1-N5. There are six one-page
    PDFs with matching hashes, and the ready check shows schema 15.
  - parity x4, preflight and the precommit self-test pass. Digest 318b3370 (868 files),
    moved only by the six docs files.
  - Gap: the owner's round-5 answers Q1 (the reference image) and Q2 (the footer texts)
    are missing from packet section 8.
- Running now: T06 Addendum 1 (the same worker) adds the two rows.
- Draft brief ready: WP5-UX5-GATE (the gate of rounds 4 and 5).
- WP5-UX5-T06 done after Addendum 1: the Q1 and Q2 rows are in packet section 8 (EN/VI).
  Packet parity OK, preflight PASS, `git diff --check` 0. Digest 318b3370 (868 files),
  unchanged by the addendum.
- Running now: the lookup WP5-UX5-T06-PATHS (light, haiku, read-only).
- T06-PATHS done. Outside `handoff/`: the 6 docs files, all modified. Nothing is staged,
  and there is no `zz-*` file. Under `handoff/`, the only binaries are the six
  `-synthetic.png` renders.
- Running now: WP5-UX5-T06-FREEZE (a fresh committer, alone). It stages the 6 docs paths
  plus the handoff records, including the pilot packet pair and the draft gate brief. The
  digest must be 318b3370, checked on HEAD with `git ls-tree`.
- WP5-UX5-T06-FREEZE done: e2bf1aab4ef65d496de6672c7986e27db04ddb39 on main, pushed (55
  paths). Digest 318b3370 (868 files) before staging and from HEAD's `git ls-tree`; every
  check exit 0. Every round-5 slice is frozen; e2bf1aa is the package-final snapshot.
- Phase `ux5-gate`. Running now: WP5-UX5-GATE (verifier, sonnet; size L, risk H; target
  e2bf1aa / 318b3370; base 8e55710 / 507de97c; ports 49820-49859; Compose project
  `ts-wp5-ux5gate`).
  - It covers rounds 4 and 5: the WP5 gate with the first round-5 drill, the boundary and
    scope, the data / sends / PDF, the simulated clocks, the round-4 rechecks, the round-5
    UI checks, axe, the CSP and screenshots.
  - No writer runs while the gate runs.
- Draft briefs ready for after a gate PASS: WP5-UX5-AUDIT-A (visual, shell, Timesheet,
  Day editor, Review UI, accessibility, F-UX4A-1..4) and WP5-UX5-AUDIT-B (sign-off and
  send, data, migrations, PDF, font, privacy, docs, F-UX4B-1). Both are fresh opus/xhigh
  auditors on e2bf1aa / 318b3370, run in parallel; the integration audit follows.
- WP5-UX5-GATE: **FAIL** (NAS NOT VERIFIED). The digest is 318b3370 in all three forms.
  - **Drill `--wp3`:** 203 PASS / 6 FAIL. The drill's sign-off omits `signer_name`, which
    the previous build requires, so the data-bearing upgrade was not exercised.
  - **Simulated-clock sweep:** four date- or DST-dependent test defects:
    - `day-editor.spec.ts:6357`;
    - `today.spec.ts:990` and `:455`;
    - `timesheet.spec.ts:2040`.
  - **axe:** `scrollable-region-focusable` on History. It is pre-existing, the same on
    BASE_SHA.
  - **Passed:** everything else. That includes the real-clock FULL e2e (859/0), npm test
    x3, the migration 13 to 15 with backfill, backup and restore, sends and reasons,
    deadline and reminders, the four one-page PDF variants with Indie Flower, scope, the
    route table, the CSP, the fractional widths (reached), the round-4 rechecks and 38/40
    axe scans.
- Phase `ux5-fix`. Running now: WP5-UX5-FIX1 (worker-high, sonnet; size M, risk M; base
  e2bf1aa / 318b3370; ports 49920-49939; Compose project `ts-wp5-ux5fix1`).
  - It fixes the drill's sign-off body for the previous build, the four tests, and makes
    History's scroll regions focusable and named.
  - Proof: the drill with 0 FAIL; the four tests with 0 failed at all six instants and on
    the real clock; History axe 0; FULL e2e 0 failed.
- WP5-UX5-FIX1 done (worker report; the regate is pending). Each finding was reproduced
  first.
  - **The drill:** `signer_name` is sent only to the previous build. 209 PASS / 0 FAIL, and
    stage 4 now signs two periods before the upgrade.
  - **The four tests:** they now follow the T04 rules from measurement, and use a session
    that crosses midnight in both seasons. 0 failed at all six instants and on the real
    clock, and the mutants of the old assertions fail.
  - **History:** a new `TableWrap.tsx` replaces all seven `.table-wrap` uses. A table that
    overflows becomes a named, focusable region. History axe 0, and a new
    `history-a11y.spec.ts`.
  - FULL e2e: desktop 458 and mobile 403 passed, 0 failed. Verify 0. Digest 70975091 (870
    files).
- Running now: the lookup WP5-UX5-FIX1-PATHS (light, haiku, read-only).
- FIX1-PATHS done, but a permission check refused its write of the Results into its
  brief. The full list is in its task folder, and the board holds the summary.
  - Outside `handoff/`: 11 modified, 2 new, nothing staged, nothing under `src/server` or
    `src/domain`.
  - Under `handoff/`: 5 modified and 344 new, mostly the gate's and FIX1's evidence.
- Running now: WP5-UX5-FIX1-FREEZE (a fresh committer, alone). It stages 13 explicit paths,
  the handoff records, and three evidence folders as directories. The digest must be
  70975091, checked on HEAD with `git ls-tree`.
- WP5-UX5-FIX1-FREEZE done at attempt 3: 2bce0ab5842b80c710f23496d5173c122319e5c7 on main,
  pushed (363 paths). HEAD `git ls-tree` digest 70975091 (870 files); every check exit 0.
  - Attempt 1: the precommit `private-media` rule blocked the gate log
    `13-integ-signatures.txt`. It was renamed `-synthetic.txt`.
  - Attempt 2: the validators refused the board. Coordinator slip: FIX1 depended on the
    FAIL gate. Now FIX1 depends on T06-FREEZE and names the gate in `addresses_gate`.
- Phase `ux5-regate`. Running now: WP5-UX5-REGATE (verifier, sonnet; size M, risk H;
  target 2bce0ab / 70975091; ports 49940-49979; Compose project `ts-wp5-ux5regate`).
  - It checks: identity and scope against e2bf1aa; byte-identical `dist/server` and
    `dist/domain`, which carry the server items forward; core; the drill; real-clock and
    simulated-clock e2e; axe on every `.table-wrap` screen; and the four tests.
- The regate was interrupted early by an expired sign-in (API 401) while the verifier was
  still reading scripts. The owner signed in again. The same agent is resumed: it checks
  for leftovers first, then continues.
- WP5-UX5-REGATE: **FAIL** on 2bce0ab / 70975091, under the rule that a non-network
  failure is reported as is.
  - **Passed:**
    - identity: only FIX1's 13 paths, with `dist/server` and `dist/domain` byte-identical;
    - core, npm test x3, the validators and the integration files;
    - the drill 209/0 on the rerun, with stage 4 signing two periods;
    - the real-clock FULL e2e, 458 + 403 passed, 0 failed;
    - axe 0 everywhere;
    - the four fixed tests are not weaker.
  - **Sweep:** six of seven runs had 0 failed. One failure:
    - `theme.spec.ts:605` mobile, FULL at 2026-11-01T08:45Z: `--shell-bar-size` 112
      against a rendered bar of 60;
    - it did not reproduce in 3 isolated runs or in a full rerun.
  - **Leftover:** the wedged first-sweep Node/Playwright tree and two idle shells from
    before the interruption may still be alive; they were not stopped (no PID kills).
- Coordinator slip, fixed: a REGATE edit briefly split the task into a stray placeholder
  object; it was merged back before any dispatch.
- Running now: WP5-UX5-DIAG1 (planner, sonnet; read-only; ports 49980-49999).
  - It finds what sets and reads `--shell-bar-size`, reproduces the stale value under load
    at that instant, and classifies it as a test or a product defect, with the minimal
    fix.
  - It also lists, without stopping them, the leftover regate processes.
- The next freeze must rename the regate's `13-integ-signatures.txt` (the precommit rule).
- WP5-UX5-DIAG1 done: a **test defect**.
  - The ResizeObserver writes `--shell-bar-size` one to a few frames after the bar changes
    size (1-35 ms, 67 ms at 10x throttle). Its readers are CSS only, and there is no
    user-visible fault.
  - `expectBudget` reads the bar and the property in two round trips.
  - It did not reproduce in about 560 runs. No leftover regate process is alive.
  - Optional hardening (observe the border box): not done now (coordinator decision);
    passed to Audit A as an optional risk.
- Running now: WP5-UX5-FIX2 (worker, sonnet; tests only; ports 50000-50019).
  - It uses `expect.poll` on one round trip in `theme.spec.ts` and `shell.spec.ts`, and
    adds a deterministic test.
  - Proof: repeat-each=40 at 2026-11-01T08:45Z, a mutant, and the FULL e2e.

### Paused for restart (2026-10-22)

- **The pause.** The owner asked to pause and save everything to restart the machine. The
  coordinator stopped the WP5-UX5-FIX2 worker (agent ac23550fd8a51aab2) with TaskStop
  while it was implementing. It had written no Results.
- **Board state:**
  - mission status `paused_usage`, with a `pause_note` that says this is a restart, not a
    usage limit; it is the board's only pause status;
  - phase `ux5-fix2`;
  - WP5-UX5-FIX2 `interrupted`, with an interruption note;
  - next_task_id WP5-UX5-FIX2;
  - `current_source_digest` still 507de97c (the last accepted snapshot, 8e55710).
- **Git.** The last pushed commit is 2bce0ab5842b80c710f23496d5173c122319e5c7
  (WP5-UX5-FIX1-FREEZE; digest 70975091, 870 files). Nothing is committed locally and left
  unpushed.
- **Uncommitted work since 2bce0ab:**
  - possibly partial FIX2 edits in `tests/e2e/theme.spec.ts`, `shell.spec.ts` and
    `day-editor.spec.ts` (FIX2's owned paths only);
  - coordinator records under `handoff/`: the board, STATE.json, NEXT_ACTION (+ vi), this
    checkpoint pair, `tasks/WP5-UX5-FIX1-FREEZE.md` (Results and addenda);
  - `tasks/WP5-UX5-REGATE.md` (Results), `tasks/WP5-UX5-DIAG1.md`, `tasks/WP5-UX5-FIX2.md`;
  - the draft `tasks/WP5-UX5-REGATE2.md`, and the drafts AUDIT-A and AUDIT-B (retargeted
    to 2bce0ab);
  - the evidence folders `WP5-UX5-FIX1-FREEZE`, `WP5-UX5-REGATE` (its
    `13-integ-signatures.txt` must be renamed `-synthetic` at the next freeze) and
    `WP5-UX5-DIAG1`.
- **Leftovers.** No regate process is alive (DIAG1 checked), and no task-range port is
  held. The FIX2 worker's own servers and browsers end with the restart.
- **Resume steps:**
  1. Open the session (`claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`, or a new
     session with the entry prompt in NEXT_ACTION). Set the mission status back to
     `running`.
  2. Dispatch WP5-UX5-FIX2 attempt 2 to a fresh worker on the same brief. It first records
     HEAD, `git status` and the diff of its owned test files. It keeps a partial change
     only if it matches the brief; otherwise it restores those files from HEAD (owned paths
     only). Then it completes the brief.
  3. Then: a path lookup and WP5-UX5-FIX2-FREEZE, which also renames the regate's
     `13-integ-signatures.txt`. Then WP5-UX5-REGATE2 (fill its Target).
  4. Then AUDIT-A and AUDIT-B in parallel, retargeted to the FIX2 freeze. Then the
     integration audit, ACCEPT-DOCS (pilot packet identity, WP5 handoff) and the WP5
     re-accept.
- **Open owner items:** none blocking. D-1..D-15 of the pilot packet stay for the pilot.

### Resumed (2026-10-22, after the restart)

- The owner said "tiếp tục" in the same coordinator session. The mission status is back to
  `running`.
- Running now: WP5-UX5-FIX2 attempt 2 (a fresh worker, sonnet; brief Addendum 1).
  - It first records HEAD, `git status` and the diff of its owned test files.
  - It keeps a partial attempt-1 change only if that matches the brief; otherwise it
    restores those three files from HEAD.
  - Then it completes the brief, in the task folder `WP5-UX5-FIX2-a2`.

### Paused for restart again (2026-10-22, second time)

- **The pause.** The owner asked again to pause and save everything to restart the machine.
  The coordinator stopped FIX2 attempt 2 (agent a0c1d387b29545038) with TaskStop while it
  was running tests. It wrote no Results.
- **Board:**
  - mission status `paused_usage`, with the pause note updated;
  - WP5-UX5-FIX2 `interrupted`, with an `interruption_2` note;
  - next_task_id WP5-UX5-FIX2.
- **Git:** unchanged since the first pause. The last pushed commit is 2bce0ab (digest
  70975091), and nothing is committed and left unpushed.
- **Uncommitted:**
  - the same list as in "Paused for restart (2026-10-22)" above;
  - possibly partial FIX2 edits in the three owned test files;
  - the brief's Addendum 1, which now also covers attempt 3.
- **Resume steps:**
  1. Resume the session and set the mission status to `running`.
  2. Dispatch FIX2 attempt 3 to a fresh worker on the same brief (Addendum 1; task folder
     `WP5-UX5-FIX2-a3`).
  3. Continue the route: the path lookup and FIX2-FREEZE (renaming the regate's
     `13-integ-signatures.txt`), REGATE2, audits A and B, the integration audit,
     ACCEPT-DOCS and the WP5 re-accept.

### Resumed again (2026-10-22, after the second restart)

- The owner said "tiếp tục". The mission status is back to `running`.
- Running now: WP5-UX5-FIX2 attempt 3 (a fresh worker, sonnet; brief Addendum 1; task
  folder `WP5-UX5-FIX2-a3`).
- WP5-UX5-FIX2 done at attempt 3 (worker report; the regate is pending).
  - Tests only: the poll in `theme.spec.ts` and `shell.spec.ts`, plus a deterministic test.
    The partial edits of attempts 1 and 2 matched the brief and were kept.
  - FULL e2e 863 passed, 0 failed. The mutant fails 7 tests.
  - The whole-spec repeat-each=40 with 14 workers did not reach 0 failed (19, then 8, out
    of 6272): timeouts and buffer errors in unrelated tests, from host overload. The
    targeted repeat of the bar-size tests passed 1360/0.
  - Digest 3ca01b9c (870 files).
- **New facts from the FIX2 worker:**
  - `origin/main` is at 70dce2a, ahead of HEAD 2bce0ab. The new commits came from outside
    the mission and touch `.github`, docs, `ingat.toml` and `handoff`.
  - An untracked checkout `.claude/worktrees/relaxed-lalande-8359f0/` holds a font that
    makes `wordmarkAsset.test.ts` fail when `npm run verify` runs in the repository; it
    passes in a clean export.
- Running now: the read-only lookup WP5-UX5-REMOTE-RECON (verifier, sonnet). It records
  the commits, their overlap with the mission's uncommitted work, the worktree's state and
  use, and the options. No freeze runs until the owner decides how to integrate them.
- WP5-UX5-REMOTE-RECON done.
  - **Two commits made outside the mission, by the same author identity as 2bce0ab:**
    - 6173f07, "ci(deploy): add the Ingat manifest and the GHCR image workflow": 203
      files (`ingat.toml`, two `.github/workflows`, docs 07 and 11 (+vi), ADR 0002 (+vi),
      INGAT records);
    - 70dce2a: handoff only.
  - No governance path, and no overlap with the mission's uncommitted work: a
    fast-forward is conflict-free.
  - **The worktree** `.claude/worktrees/relaxed-lalande-8359f0`:
    - branch `claude/relaxed-lalande-8359f0`, local only, at 70dce2a;
    - dirty with an INGAT-T0T8 record, ignored through `.git/info/exclude`;
    - not in use.
  - The digest is not affected. `wordmarkAsset.test.ts:135-140` walks the folder and finds
    its font.
- **Waiting on the owner:** question WP5-UX5-REMOTE-Q.
  - A: integrate the commits by a fast-forward before the FIX2 freeze (recommended), or
    audit them too, or wait.
  - B: the font-scan test skips `.claude/` (recommended), or the owner removes the
    worktree.
  - C: whether pushes to main may start the new GHCR workflow.
- **Owner answer (verbatim): "A.a, B.A, C.b".**
  - **A a:** the FIX2 freeze first fast-forwards local main to origin/main 70dce2a, then
    commits. The Ingat files count as owner work outside rounds 4 and 5, checked only for
    non-interference.
  - **B a:** the font-scan test skips `.claude/`.
  - **C b:** no push until the owner says. Commits stay local (`push_hold` on the board).
- Running now: FIX2 Addendum 2 (the same worker). It makes the font walk in
  `wordmarkAsset.test.ts` skip `.claude/`, then proves:
  - `npm run verify` passes in the repository with the worktree present;
  - a stray-font mutant still fails.
- Next steps:
  1. a short path lookup;
  2. FIX2-FREEZE: fast-forward, commit, rename the regate's signature log, **no push**;
  3. REGATE2 on the local commit;
  4. audits A and B.
- FIX2 Addendum 2 done.
  - `wordmarkAsset.test.ts:134` skips `.claude`.
  - `npm run verify` passes in the repository with the worktree present.
  - The stray-font mutant still fails.
  - Digest 7ad771b5 (870 files, on 2bce0ab plus the FIX2 test edits).
- Running now: the lookup WP5-UX5-FIX2-PATHS (light, haiku, short Results).
- FIX2-PATHS done. Its list is in the task folder; the agent wrote no Results into its
  brief.
  - Outside `handoff/`: the 3 test files.
  - Under `handoff/`: 10 modified and 199 new, in 4 evidence folders and 5 task records.
  - No overlap with HEAD..origin/main. One signature-basename log needs the rename.
- Running now: WP5-UX5-FIX2-FREEZE (a fresh committer, alone). It runs:
  1. a fetch and the overlap check;
  2. `git merge --ff-only origin/main` (A a);
  3. staging, the rename, the precommit check and the validators;
  4. a **local commit with no push** (C b).

  The HEAD `ls-tree` digest must equal the digest computed after the fast-forward.
- WP5-UX5-FIX2-FREEZE done: **7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 on main, NOT
  pushed** (C b).
  - The fast-forward 2bce0ab -> 70dce2a succeeded (A a). 213 files were staged.
  - `13-integ-signatures.txt` was renamed `-synthetic`.
  - Every check exits 0. D_PRE = the HEAD `ls-tree` digest = 59516a2d.
  - `git.unpushed` = [7aafa21].
- Phase `ux5-regate2`. Running now: WP5-UX5-REGATE2 (verifier, sonnet) on the local commit
  7aafa21 / 59516a2d, against 2bce0ab.
- **Owner (verbatim): "Từ giờ bạn cứ push lên main thoải mái nhé".**
  - The push hold (C b) is lifted.
  - 7aafa21 is pushed by a committer as soon as REGATE2 ends; commit tasks run alone.
  - Later freezes push as before.
- WP5-UX5-REGATE2: **FAIL** on 7aafa21 / 59516a2d (875 files), under the "report as is"
  rule.
  - **Passed:**
    - identity: 12 paths, each from FIX2 or Ingat; all of `dist/` byte-identical;
    - core, with verify also run in the repository;
    - the real-clock FULL e2e, 459 + 404 passed, 0 failed;
    - both stress runs, 1360 and 3140 passed, 0 failed;
    - the deterministic test.
  - **Two non-network failures in the sweep,** not reproducible:
    - mobile `settings-routes.spec.ts:16` ("Administration" heading not visible in 7 s),
      on the 10-26 full rerun;
    - mobile `controls.spec.ts:640` (the chevron screenshot at DPR 1.5), on the 11-01 full
      run.

    The 11-01 rerun had 0 failed, and the chevron test alone passed 3 of 3. The verifier
    judges both as host-load flakes.
- Running now: WP5-UX5-RECORDS1 (a committer, alone). It commits the REGATE2 records
  (handoff only) and **pushes main**, including 7aafa21.
- RECORDS1 stopped at its fetch step. origin/main is now 01c4cdc, not 70dce2a: the owner's
  Ingat session has pushed again. Nothing was staged, committed or pushed. RECORDS1 is
  `blocked`.
- Running now: the read-only lookup WP5-UX5-REMOTE-RECON2. It records the new commits,
  their overlap with 7aafa21 and the uncommitted records, a no-write merge check, and the
  options. Then the owner chooses how to integrate.
- REMOTE-RECON2 done. Local 7aafa21 and origin/main 01c4cdc have diverged (1 / 2, base
  70dce2a).
  - **Two owner commits:**
    - 782cddab, the GHCR cleanup: a workflow, `scripts/ghcr-cleanup.ts`,
      `tests/integration/ghcr-cleanup*`, the tsconfig files, docs 07 and 11, ADRs 0002 and
      0003, and records;
    - 01c4cdcb, records.
  - No governance path, and no overlap with 7aafa21. The `merge-tree` check is clean.
  - **An uncommitted edit of `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` (+ vi) sits in
    this main checkout.** The mission did not make it, and it conflicts with the remote
    version at line 116.
- **Waiting on the owner:** WP5-UX5-REMOTE2-Q.
  - D: how to integrate — merge (recommended), rebase, or pause the Ingat pushes.
  - E: who settles the uncommitted INGAT checkpoint edit.
  - Also: whether the Ingat session can keep to its worktree.
- **Owner answer (verbatim): "D.a, E.a".**
  - **D a:** before each mission commit, merge origin/main with a merge commit (clean, no
    mission path touched), then commit and push.
  - **E a:** the owner's Ingat session settles the INGAT checkpoint pair. The mission never
    touches it, and merges only once it is clean.
- RECORDS1 is `cancelled`. Its records and the push of 7aafa21 move into the FIX3 freeze.
- Running now: WP5-UX5-FIX3 (worker-high, sonnet; base 7aafa21; ports 50060-50079).
  - It reproduces and fixes the two load flakes, `settings-routes.spec.ts:16` and
    `controls.spec.ts:640`, with event-based waits. It is tests only, and a product cause
    is a stop.
- Then the FIX3 freeze:
  1. check that the owner's INGAT pair is clean; stop if not;
  2. `git merge origin/main` (a merge commit);
  3. commit FIX3 with the REGATE2 records;
  4. push.

  Then REGATE3 on the merged tip, including the owner's new ghcr-cleanup tests and the
  tsconfig changes, checked for non-interference.
- WP5-UX5-FIX3 done (worker report). **Both flakes were test races, not product defects.**
  - **The heading:** after Sign out, the Administration screen stays until the answer
    arrives, and its own Email field took the fill. The fix in `fixtures.ts`:
    `signInPageAs` waits for "Sign in". Under load it went from 2 of 40 failing to 80/80
    passing.
  - **The chevron:** "Loading..." placeholders above the select move it by 0.53px. The fix
    in `controls.spec.ts`: `settledSelect` waits for no placeholder and 6 still frames.
    Under load: 80/80.
  - Mutants fail. FULL e2e 863 passed, 0 failed. Verify 0.
  - `--preflight` fails in the repository only on the owner's untracked
    `INGAT_MANIFEST_DESIGN_REVIEW.md`; it passes on an export.
- **WP5-UX5-FIX3-FREEZE is `blocked`** (E a). It waits until the owner's Ingat session has
  settled its files in this checkout:
  - the INGAT_T0_T8_CHECKPOINT pair;
  - `INGAT_MANIFEST_DESIGN_REVIEW.md` and its evidence folder.

  The owner was asked to say when.
- **Owner (verbatim): "Bên ingat yêu cầu bạn chạy "git merge --ff-only origin/main" cho lần
  commit kế tiếp".**
  - The next commit fast-forwards only, with no merge commit and no rebase. If a
    fast-forward is not possible, the committer stops.
- Running now: the read-only lookup WP5-UX5-FIX3-PATHS. It checks:
  - whether 7aafa21 is already in origin/main, so that a fast-forward is possible;
  - what the new remote commits touch;
  - the dirty paths;
  - whether the Ingat files are settled.
- FIX3-PATHS done: **a fast-forward is not possible.** The unpushed 7aafa21 is not in
  origin/main 01c4cdc (1 ahead, 2 behind).
  - The remote commits touch no mission path.
  - Outside `handoff/`: only the two FIX3 files.
  - **Still in this checkout from the Ingat session:**
    - the modified INGAT_T0_T8_CHECKPOINT pair, which origin also changed, so it blocks
      any fast-forward or merge;
    - the untracked INGAT reviews, tasks and evidence folders, which break `--preflight`.
- **Waiting on the owner:** WP5-UX5-FF-Q.
  - F: how to get there — rebase the unpushed 7aafa21 onto origin/main (recommended,
    needs an explicit OK); or the Ingat session pushes 7aafa21 into origin first; or one
    merge commit.
  - G: the Ingat session settles or moves its files out of this checkout first.
- **The owner relayed the Ingat-track coordinator (2026-10-23):** the synchronization is
  done.
  - origin/main 9f186b2 holds the merge b8bae50, with parents db87939 and the mission's
    7aafa21. Its tree was gated by the Ingat side (2374/2374 tests).
  - The steps asked of this checkout:
    1. save the two sections of the INGAT checkpoint pair, and restore the pair;
    2. `git merge --ff-only origin/main`;
    3. re-add the sections;
    4. commit the INGAT reviews, tasks and evidence with the mission's files, register the
       INGAT tasks as done, and push.
  - The Ingat side pushes nothing more.
- Coordinator handling:
  - The INGAT tasks are registered under the board's new `external_tracks.INGAT`. The
    validator admits only WP1-WP5 and GOV packages in `tasks`, and this mission did not
    run them.
  - The FIX3 freeze brief now follows the steps. It allows one fix: a directory link in an
    INGAT review that fails `--preflight` may point to a file instead.
- Running now: WP5-UX5-FIX3-FREEZE (a fresh committer, alone): save, restore,
  fast-forward, re-add, stage, check, commit, push.
- WP5-UX5-FIX3-FREEZE done: **5b8b7184692fff683c4083c9fc5610acd47bece1 pushed**, a
  fast-forward from 9f186b2.
  - The sections were re-added (+92 / +91 lines). 177 files were staged.
  - One link fix, in the INGAT manifest design review (EN/VI).
  - Every check exits 0. D_PRE = the HEAD digest = edcca194. Nothing is unpushed.
  - Deviations: the append was done by shell; one `/dev/null`; a public no-reply address
    from a Co-Authored-By line in the staged records (not personal data).
- Phase `ux5-regate3`. Running now: WP5-UX5-REGATE3 (verifier, sonnet) on 5b8b718 /
  edcca194, against 7aafa21. It covers:
  - identity, with every FIX3 and Ingat path mapped;
  - all of `dist/` compared: if identical the earlier results carry forward, otherwise the
    affected items rerun;
  - core, with the Ingat tests and tsconfig;
  - the real-clock FULL e2e;
  - the seven-run sweep with `--workers=6`;
  - stress of the three fixed tests;
  - FIX3's mutants.

### Paused for usage (2026-10-23)

- **The pause.** The owner asked to pause because the usage limit is near. The
  coordinator stopped WP5-UX5-REGATE3 (agent a5a471b592740f995) with TaskStop mid-run. Its
  last note was "Both clean. Continue waiting."; no Results were written.
- **Board:**
  - mission status `paused_usage`, with the pause note;
  - phase `ux5-regate3`;
  - WP5-UX5-REGATE3 `interrupted`, with an interruption note;
  - next_task_id WP5-UX5-REGATE3;
  - `current_source_digest` still 507de97c (the last accepted snapshot, 8e55710).
- **Git.** The last pushed commit is 5b8b7184692fff683c4083c9fc5610acd47bece1 (digest
  edcca194). `git.unpushed` is empty. origin/main also holds the owner's Ingat merge
  b8bae50.
- **Uncommitted since 5b8b718:**
  - the board, STATE, NEXT_ACTION (+ vi) and this checkpoint pair;
  - `tasks/WP5-UX5-FIX3-FREEZE.md` (Results), `tasks/WP5-UX5-REGATE3.md`, and the audit
    A and B drafts (retargeted);
  - `evidence/WP5-UX5-FIX3-FREEZE/`;
  - possibly partial `evidence/WP5-UX5-REGATE3/`.
- **Possible leftovers of REGATE3:** its servers and browsers, and Compose project
  `ts-wp5-ux5regate3` if it had started a drill. Attempt 2 checks for them and removes
  only by project name, never by PID.
- **Resume steps:**
  1. Resume the session (`claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`, or a new
     session with the entry prompt), and set the mission status to `running`.
  2. Dispatch WP5-UX5-REGATE3 attempt 2: a fresh verifier on the same brief, task folder
     `WP5-UX5-REGATE3-a2`, leftover check first.
  3. On a PASS: audits A and B in parallel (fresh opus/xhigh, briefs on disk, retargeted to
     5b8b718 / edcca194), then the integration audit, ACCEPT-DOCS and the WP5 re-accept.
     On a FAIL: diagnose and fix as before.
- **Owner coordination in force:**
  - D a for merges, unless the owner asks for `--ff-only` again;
  - pushes to main are allowed;
  - the Ingat track pushes nothing more;
  - the owner's worktree `.claude/worktrees/relaxed-lalande-8359f0` stays untouched.

### Resumed (2026-10-26)

- The owner said "tiếp tục". The mission status is back to `running`.
- Running now: WP5-UX5-REGATE3 attempt 2 (a fresh verifier, sonnet; brief Addendum 1).
  - It runs a fetch and the identity check first; if origin has moved past HEAD, it
    stops.
  - It checks for attempt-1 leftovers (Compose project `ts-wp5-ux5regate3` by name,
    processes listed but never stopped by PID).
  - It uses a new task folder `WP5-UX5-REGATE3-a2`.

### REGATE3 failed; two diagnoses run (2026-10-26)

- **WP5-UX5-REGATE3 attempt 2: FAIL** on the pushed 5b8b718 / edcca194. NAS items stay
  NOT VERIFIED.
  - **Passed:**
    - identity (FIX3 and Ingat paths only; nothing under `src/`, `assets/` or the package
      files);
    - all 250 `dist/` files byte-identical to 7aafa21, so REGATE2's drill, axe, CSP and
      integration results carry forward;
    - core: npm ci, lint, typecheck, export verify, npm test x3 (2374 tests), validators;
    - real-clock FULL e2e: desktop 459, mobile 404, 0 failed;
    - stress of the fixed tests: 0 failed;
    - FIX3's mutants fail the fixed tests.
  - **Failed:**
    - `npm audit --omit=dev`: nodemailer (moderate) and zod (high). These are new
      advisories on unchanged package files.
    - The sweep with `--workers=6`:
      - `timesheet.spec.ts:1216`: the run crossed LA midnight, and Today stayed on the old
        day;
      - `review.spec.ts:616`: row alignment off by 23.25;
      - repeated ECONNRESET (`submission.spec.ts:67` and automation specs), not cleared by
        the reruns.
  - The first repository verify had two unit-test timeouts under load; its rerun passed.
  - After the verifier returned, the harness still showed one of its background handles.
    The coordinator stopped the finished agent with TaskStop. No PID kills.
- **Running now, in parallel, both read-only:**
  - WP5-UX5-DIAG2 (planner, sonnet): classify and reproduce A (midnight), B (row
    alignment) and C (ECONNRESET), and propose minimal fixes;
  - WP5-UX5-DEPS1 (planner, sonnet): the two advisories, the app's exposure, the
    smallest upgrade, and a probe in a scratch export.
- **Next:** one fix round (one source writer at a time), its freeze, then REGATE4. Then
  audits A and B, the integration audit, ACCEPT-DOCS and the WP5 re-accept.
- **On interruption:** resume both diagnoses from their briefs with fresh planners, in new
  task folders.
- **WP5-UX5-DEPS1: done.** Both packages are direct production dependencies with exact
  pins. All four advisories were published or reviewed on 2026-10-23.
  - **zod 4.6.5** (high; memory use grows with large arrays): fixed in 4.6.6. Reachable in
    principle through JSON validation, but limited by the 64 KiB body limit.
  - **nodemailer 10.0.14** (three moderate advisories, all in the address parser): fixed
    in 10.1.4. Not reachable: every address passes a strict single-address check first.
  - **Probe** in a scratch export: every check exits 0, `dist/` is unchanged, and no
    deprecation appears.
  - **Coordinator choice:** the smallest clearing pair, 10.1.4 and 4.6.6. The runtime
    dependencies change, so REGATE4 reruns the container drill even though `dist/` is
    byte-identical.
- **Running now:**
  - WP5-UX5-FIX4 (worker, sonnet), the only source writer. It changes `package.json` and
    `package-lock.json`, with proof in a scratch export, and does not touch the
    repository's `node_modules`.
  - WP5-UX5-DIAG2 (read-only) continues.
- **WP5-UX5-FIX4: done** (worker report; the regate is pending).
  - The audit failure was reproduced first.
  - Pinned nodemailer 10.1.4 and zod 4.6.6. The lockfile diff touches only those entries
    and one dev-only nested entry.
  - In the scratch export, lint, typecheck, npm test (2374), verify and
    `npm audit --omit=dev` all exit 0. `dist/` is byte-identical.
  - The two package files are changed in the working tree and not committed. The
    repository's `node_modules` still has the old versions.
  - The digest is c431c508 (882 files).
- **Next:**
  - The freeze waits for DIAG2: a commit task must run alone.
  - After DIAG2: its fix (the only source writer), then one freeze of FIX4 and that fix,
    then REGATE4. REGATE4 runs npm ci in the repository before the repository verify, and
    reruns the drill.
- **WP5-UX5-DIAG2: done.** All three failures were reproduced. None is a product fault
  against the docs.
  - **A, Today at midnight:** a test defect.
    - The test reads the server date once. A click just after LA midnight makes the page
      re-read, and Today moves to the new day.
    - The product re-reads on load, focus, visibility and the Today press, with no timer,
      as document 04 line 58 requires.
    - Fix: the test polls against a fresh server read, with the focus refresh.
  - **B, row alignment:** a test defect.
    - In the Sign off dialog preview, the saved signature image arrives late and the
      employee line grows by one text line (23.25 px) between two reads.
    - Fix: wait for the image to load before the geometry checks.
    - The 23 px shift itself goes to the WP5 optional backlog; no `src/` change in this
      round.
  - **C, ECONNRESET:** a harness defect.
    - The test runner's seed client reuses a keep-alive socket after a blocking job drain
      that lasts longer than the server's 5 s keep-alive.
    - Fix: `connection: close` in the seed client.
    - The simulated clock plays no part.
  - **Gate method:** unchanged (`--workers=6`, the rerun rule).
  - **The repository verify timeout:** no fix; run it alone and rerun once.
- **Running now:** WP5-UX5-FIX5 (worker, sonnet), alone; tests and harness only.
  - It first runs npm ci in the repository to sync FIX4's lockfile.
  - It reproduces each failure, applies the three fixes, and proves them with probes,
    repeated runs at the failing instants, the real-clock FULL e2e, two mutants and the
    core checks. The digest comes last.
- **Next:** one freeze of FIX4 and FIX5 (a path lookup, then the committer), then REGATE4.
- **WP5-UX5-FIX5: done** (worker report; the regate is pending). Tests and harness only;
  not committed; the digest is 4e93f766.
  - **Before the fixes:** A failed deterministically in the probe. B failed 3 of 6 at a
    50 ms image delay. C failed 20 of 20 at 14 workers.
  - **After the fixes:** A passed 80/80 at 06:59:35Z and 80/80 on the real clock. B passed
    50/50 at delays of 50-200 ms. C passed 20/20 at 10 and at 14 workers.
  - **Real-clock FULL e2e:** desktop 459 and mobile 404 passed, 0 failed.
  - **Mutants:** both fail the tests.
  - **Two open symptoms**, outside its owned paths, would fail the next gate:
    - `npm test` failed twice on 30 s timeouts in spawn-heavy integration tests, with a
      different set of tests each run;
    - `npm run verify` failed once in smoke with "fetch failed" after `run-jobs`, likely
      the same keep-alive mechanism as C.

    Later runs passed. FIX5 saw 46 `msedge` processes it had not started.
- **Coordinator decision:** diagnose before the freeze rather than gamble the regate.
  REGATE3 took about 2.5 hours.
- **WP5-UX5-DIAG3 done** (planner, sonnet, read-only). No product fault.
  - **Host census.** The 45 `msedge` processes are the owner's Edge. There was no
    leftover browser, Playwright, vitest or Docker process from the mission. One mission
    leftover: `bash.exe waitfor.sh out/sweep.done 590` from REGATE3 attempt 2, spinning
    one core. The owner is asked to close it; mission tasks never kill by PID. Visible load
    was 1.5-4 of 32 cores.
  - **Timeouts.** The suite runs 31 vitest forks that spawn CLI children. CPU burners on
    all 32 cores did not cause a failure. Giving the suite only 2-8 logical CPUs did, and
    at 2 CPUs it reproduced FIX5's exact set. At 4 CPUs, 16 or 8 workers gave 0 failures.
    One CLI takes 0.25-0.7 s idle; the "3.6 s" was six runs.
  - **Smoke.** Keep-alive confirmed: three blocking `spawnSync` CLIs, then a fetch on a
    socket the server already closed. Second defect: after a failure the open `monitor`
    blocks the cleanup, so the "SMOKE FAILED" line is lost.
  - **Coordinator decision:** FIX6 covers harness and test configuration only:
    - a vitest worker cap;
    - smoke `connection: close` and closing `monitor` before cleanup;
    - the same header at `container-drill.mjs`, `fixtures.ts:69` and `setup.spec.ts:98`,
      only where the pattern holds.

    DIAG3's optional lazy PDF import goes to the WP5 optional backlog (no `src/` change in
    this round). No timeout is raised and no assertion changes.
  - **For REGATE4:** take a census before the gate, and run `npm test` and `npm run verify`
    one after another, never together.
- **WP5-UX5-FIX6 done** (worker, sonnet; uncommitted; digest 26b163a6).
  - Changed: `vitest.config.ts` (`maxWorkers: '50%'`, 16 forks instead of 31),
    `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs` and the
    `tests/e2e/fixtures.ts` health poll. `setup.spec.ts` is unchanged, because its spawns
    run before the server starts.
  - **Smoke:** before the fix, the blocked probe failed and its failure line was lost.
    After it, 8 s and 40 s blocks pass, and an induced failure prints "SMOKE FAILED (2)"
    and leaves no folder.
  - **Worker cap:** FIX6's own 4-CPU runs passed both before and after the change, so the
    cap rests on DIAG3's controlled runs. This is a note for REGATE4 and the auditors.
  - **Results:** real-clock FULL e2e 863 passed, 0 failed. The container drill passed
    (stages 1, 2, 3, 6). Lint, typecheck, `npm test` and `npm run verify` all exit 0.
  - **Slip:** one global `git config safe.directory` entry was added for a scratch export.
    The owner is told and may remove it.
- **The lookup WP5-UX5-FIX6-PATHS is done.**
  - HEAD = origin/main = 5b8b718, so no merge is needed.
  - The dirty source paths are exactly the eight expected.
  - One evidence basename, `20-B-signature-image.txt` in DIAG2's evidence, is renamed with
    `-synthetic` in the freeze. The board already lists the new name.
  - No drill containers are left. The global `safe.directory` entry is
    `D:/.claude-tmp/timesheet/WP5-UX5-FIX6/exp2`.
  - `waitfor.sh` matched PID 22240, the REGATE3 leftover, and three bash processes created
    during the lookup itself. Those three are assumed to be its own shells; the REGATE4
    census confirms.
- **WP5-UX5-FIX6-FREEZE done.**
  - Commit f4049aa7905e22f1467dfcae4208675cb2fc8e80 is on main and pushed, a fast-forward
    from 5b8b718.
  - D_PRE equals the HEAD digest, 26b163a6.
  - 164 paths: 8 source files, 6 records, 12 tasks and 138 evidence files. One rename added
    `-synthetic`. Every check exits 0.
  - The email scan matched only the public no-reply address of a Co-Authored-By trailer,
    quoted in the FIX3-FREEZE records. That address has been public since 5b8b718 and is
    accepted as recorded. Later freeze briefs name it as allowed.
- **WP5-UX5-REGATE4: PASS** on f4049aa / 26b163a6 (verifier, sonnet). NAS stays NOT
  VERIFIED.
  - Census: about 1.4 of 32 cores busy. The REGATE3 leftover still uses one core.
  - Exactly the eight source paths. All 250 `dist/` files are byte-identical to 5b8b718.
  - Drill `--wp3`: stages 1-6 had 209 PASS and 0 FAIL. `npm audit --omit=dev` found 0
    vulnerabilities.
  - `npm test` ×3 and `verify` (export and repository) exit 0, with no timeout. The suite
    at 4 logical CPUs passed.
  - Real-clock FULL e2e: 459 and 404 passed, 0 failed. The six sweep runs and the three
    stress runs had 0 failed, with no ECONNRESET.
  - The DIAG2 Today probe, the mutants M1 and M2, and the FIX6 smoke probes (with and
    without the header, and the induced failure) behaved as required.
  - Flagged: a new nested dev-only `smtp-server` copy of nodemailer 10.0.14, which is not
    in the image.
- **Running now:** WP5-UX5-AUDIT-A and WP5-UX5-AUDIT-B (fresh auditors, opus), in parallel,
  on f4049aa / 26b163a6. Their briefs are retargeted and add:
  - A: the fix-round e2e changes, a mutant that only the Today poll's date compare can
    catch, and a judgment on the deferred 23 px signature-image shift;
  - B: the dependency pins (including the nested dev-only copy), the harness, the
    evidence for the worker cap, and the deferred lazy PDF import.
- **WP5-UX5-AUDIT-B: FIX REQUIRED** (opus). Five Low findings, and no product defect in
  area B:
  - F-UX5B-1: docs/05:11 still describes sending at sign-off.
  - F-UX5B-2: docs/12:54 and docs/04:124 quote UI strings that were removed.
  - F-UX5B-3: in the PDF, a day with leave and a holiday label of about 35 characters or
    more loses "Leave h:mm" to the ellipsis, which contradicts docs/12:86.
  - F-UX5B-4: docs/10 has no record of H-1 a.
  - F-UX5B-5: the tests miss mutant M12b, and `sends.test.ts:300` cannot fail because of
    quoted-printable encoding.

  Risks:
  - R-UX5B-1 (pre-existing): a superseded revision's queued send can arrive after the
    correction.
  - The dev-only advisories, the drill fetch sites and the worker cap are judged
    acceptable.

  All checks passed, including the e2e, the migrations, backup and restore, and the HTTP
  probes. F-UX4B-1 is fixed.
- **WP5-UX5-AUDIT-A: FIX REQUIRED** (opus). Findings:
  - **F-UX5A-1, Medium.** On a signed period's Review page, "Sign correction" sits in the
    employee signature line. At 480, 390 and 320 px the name breaks letter by letter, the
    button covers "Signed", and the lines lose alignment.
  - F-UX5A-2: SC 2.5.3. The button shows "Change days", but its name is "Change several
    days".
  - F-UX5A-3: a touch swipe, or a press on a week card's scrollbar, closes the Day editor.
  - F-UX5A-4: stale lines in docs/04 and docs/12, and three CSS comments.

  Everything else passed:
  - the other U5 items, the fractional widths 479.33 and 767.33 (one layout each), and
    F-UX4A-1..4, which are fixed;
  - axe: 108 scans, 0 violations;
  - the full e2e: 863 passed, 0 failed.

  Mutants: 15 of 17 were caught.
  - M2, the ladder's end-day step, was not caught.
  - M13 was caught only by `today.spec.ts:626` at the crossing, not by the `showToday`
    poll.
- **WP5-UX5-PLAN-FIX7 done** (planner, sonnet). It produced a proven diff and an exact
  specification.
  - **F-UX5B-3.** A holiday or closure day can carry partial leave; nothing forbids it.
    The code route restores docs/04:122, AC-10 and docs/12:86. In the fix, the holiday
    label gets one line and "Leave h:mm" its own line. PDFs without both labels stay
    byte-identical (624 of 1,920 pairs), and the pilot samples carry neither label.
  - **R-UX5B-1.** Reproduced and pre-existing. The planner recommends option A: a waiting
    send of any revision of the period blocks a new send (409). This enforces docs/05:72
    as written and aligns docs/03:60.
  - **Coordinator decisions:**
    - F-UX5B-3: the code route;
    - R-UX5B-1: option A in this round;
    - the four drill `connection: close` edits are folded in.

    No owner decision is needed, because no rule the owner set changes. The owner is
    informed.
- **WP5-UX5-PLAN-FIX7A done** (planner, sonnet). It is proven in a scratch export.
  - **F-UX5A-1:** a pure-CSS wrap. At 1440 and 1200 px nothing changes. Below about
    1150 px, "Sign correction" drops under the signed content and stays 8 px inside the line
    end. There is no overlap, the lines stay aligned, and the PDF is untouched. The owner's
    words place the action at the line end, and the mockup never showed this state, so no
    owner decision is needed. The owner is informed.
  - **F-UX5A-2:** the name follows the shown form. Four e2e assertions change.
  - **F-UX5A-3:** touch acts on `pointerup`, a press on an element's own scrollbar is
    ignored, and the mouse and pen paths are unchanged.
  - **F-UX5A-4:** exact EN and VI text. The shared lines docs/04:124 and docs/12:54 keep
    FIX7's text.
  - **Folded in:** R3 (the ladder test that catches M2), R4 and the R5 arrow.
- **WP5-UX5-FIX7 done** (worker-high, sonnet; uncommitted; digest bca04c4f).
  - **Before:** the PDF probes failed 13 checks, 7 of the new tests failed, and M11 and
    M12b survived.
  - **After:** the PDF probes fail 0 checks and 106 new tests pass. Of the 1,920 PDF pairs,
    the 624 without both labels are byte-identical. M11, M12b and M14 are killed.
  - The targeted e2e had 38 passed and 0 failed. `npm test` ran 2,384 tests, and `verify`
    exits 0. The drill `--wp3` had 209 PASS and 0 FAIL. The documents have EN/VI parity.
  - Note for the rechecks: the Resend reason "A delivery of this revision is in progress."
    (`deliveryModel.ts:251`) is still per revision.
- **WP5-UX5-FIX8 done** (worker, sonnet; uncommitted; digest 61d19bf1).
  - Before the fix, the four new tests failed. After it, they pass. Mutant M2 now fails the
    new ladder test.
  - Deviation: axe flagged `button-name` at 320 px, so the short form "Change days" is now
    real text instead of `::before` content.
  - axe: 40 scans, 0 violations. FULL e2e: 868 passed and 0 failed (desktop 463, mobile
    405). `npm test` ran 2,384 tests, and `verify` and build exit 0.
  - A `git apply -p2` with the masked path first wrote ten files into a stray `export/`
    folder. The worker repaired that.
  - **New, pre-existing:** axe `scrollable-region-focusable` (serious) on the read-only
    Review week cards at 768 px. They scroll sideways from 480 to 929 px and hold no
    focusable content. HEAD has it too.
- **Coordinator decision:** fix it now, before the freeze, because the AGENTS UI standards
  require WCAG 2.2 AA (SC 2.1.1) and a recheck would fail on it.
- **WP5-UX5-FIX9 done** (worker, sonnet; uncommitted; digest 462a1cd7; 27 changed files
  outside `handoff/`).
  - Before: axe found 24 `scrollable-region-focusable` hits, all on the Review's read-only
    week cards 2 and 3, at 480 to 900 px. Nothing else was found on any screen.
  - The fix: a `useScrollsSideways` hook gives the card `tabIndex=0` only while it
    overflows. The card is already named "Week n", the arrow keys scroll it, and an inset
    focus ring shows. Editable cards are untouched.
  - After: axe ran 56 scans with 0 violations. The new test fails without the fix, and so
    does the mutant.
  - FULL e2e: 869 passed and 0 failed. `npm test` ran 2,384 tests; `verify` and build
    exit 0.
  - Slips: the axe probe spec was deleted, so it is not in the evidence, and one `rm -rf`
    was denied.
- **The lookup WP5-UX5-FIX9-PATHS is done.**
  - HEAD = origin/main = f4049aa.
  - Outside `handoff/`: exactly FIX9's 27 paths, all LF. No `export/`, untracked or
    `.tmp` file remains.
  - `handoff/`: 9 modified and 566 untracked, all mission records.
  - No blocker and no Docker leftover.
- **Running now:** WP5-UX5-FIX9-FREEZE (committer, sonnet), alone: one commit of FIX7 to
  FIX9 and the records, then a push.
  - **First stop:** the committer stopped correctly before committing. The precommit check
    blocked two synthetic password literals in an AUDIT-B probe script stored as evidence
    (`94-http-areab.mjs.txt:380-381`). 603 paths were staged, and HEAD is still f4049aa.
  - **Coordinator decision (brief Addendum 1):** mask those two literals as
    `'<synthetic-password>'`, re-stage that file and the updated records, rerun the scans
    and the precommit check, then commit and push. The same committer continues.
- **WP5-UX5-FIX9-FREEZE done.**
  - Commit 94accda904240fda1cf500063d8b30d3a3603fd2 is on main and pushed, a fast-forward
    from f4049aa.
  - D_PRE equals the HEAD digest, 462a1cd7.
  - 603 paths, with the two literals masked. Every check exits 0.
- **WP5-UX5-REGATE5: FAIL** on 94accda / 462a1cd7, on one criterion only.
  - In sweep run full-1101, the unchanged and slow `logo.spec.ts:508` hit its 240 s
    timeout under host load (a census right after showed 5.5 busy cores). The test takes
    2.5 to 3.8 min on every run. It passed alone, and the rerun of the whole run passed.
  - **Everything else passed:**
    - the 27 paths;
    - the `dist/` changes, mapped to FIX7 to FIX9;
    - the drill `--wp3`: 209 PASS, 0 FAIL;
    - `npm audit`: 0;
    - `npm test` ×3: 2,384 tests;
    - the real-clock FULL e2e: 464 and 405 passed, 0 failed;
    - the other five sweep runs and all the stress runs: 0 failed;
    - all ten mutants killed;
    - axe: 80 scans, 0 violations.
  - The repository's `npm ci` hit Dropbox EBUSY, and the verifier recovered with
    `npm install`.
- **Coordinator decision:** a timeout is not waived. A test that runs this close to its
  limit is a test defect, so we remove its cost and do not raise the limit.
- **WP5-UX5-DIAG4 done** (planner, sonnet). No product fault.
  - **The cause:** `logo.spec.ts:508` makes 2,242 resize steps, each about two browser
    frames. Under load the frames stretch, and under a burner it failed 4 of 4 runs.
  - **Other tests near their limit:**
    - logo `:489`;
    - `admin-status` `:122` and `:259`: a send job that runs before its PDF waits a
      one-minute retry;
    - `timesheet.spec.ts:1037`: 360 one-pixel screenshots;
    - `day-editor.spec.ts:5560`: five browser round trips per leaf.

    The two new 120 s tests take at most 7 s.
  - **The patch** (tests only, five files; assertions, cases and timeouts unchanged):
    - logo sweeps run in four browser contexts, and the shared-view sweep becomes its own
      test; the rows are identical;
    - admin-status waits for the PDF before it sends;
    - one decoded screenshot replaces the 360;
    - one evaluate replaces the per-leaf round trips, with the same ratios.
  - **Proof:** 508 went from 2.0 min to about 33 s per test, and from 192 to 72 s at the
    sweep instant. Ten mutants were killed. The sweep-instant suite ran 871 tests with 0
    failed, and `dist/` is unchanged.
  - **Regate scope:** `dist/`, the drill, `npm audit`, `npm test`, axe and the unit
    mutants carry forward from REGATE5. The rerun covers identity, lint, typecheck, build
    and `verify`, the FULL e2e, the six sweeps, stress of the changed files, and the
    mutants.
- **Coordinator decisions:**
  - apply the patch in FIX10 (worker);
  - accept the scoped regate;
  - add a product note to the WP5 optional backlog: a send requested right after sign-off
    can wait one retry minute, because the PDF and send jobs share a second and are
    ordered by random id.
- **WP5-UX5-FIX10 done** (worker, sonnet; uncommitted; digest 41477510). Only the five
  owned test files changed.
  - logo 508 now takes about 31 s per split test, down from 1.9 min. Under the burner it
    passed 12 of 12, where the old test timed out 4 of 4.
  - admin-status takes 31-33 s, down from 17 or 78 s. The frame test takes 15 s, down from
    34 s.
  - Equivalence holds, and all ten mutants are killed.
  - The real-clock FULL e2e had 871 passed and 0 failed. The FULL run at
    2026-11-01T08:45Z, workers=6, had 871 passed and 0 failed, with the logo tests at 1.1
    to 1.3 min.
  - The build asset names are unchanged.
- **WP5-UX5-FIX10-FREEZE done.**
  - Commit a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5 is on main and pushed, a fast-forward
    from 94accda.
  - D_PRE equals the HEAD digest, 41477510.
  - 307 paths. Three profile-path lines in a DIAG4 census log were masked as `<user>`.
    Every check exits 0.
- **WP5-UX5-REGATE6** (verifier, sonnet), the scoped regate, ran alone on a5533b5.
  - **Carried forward from REGATE5,** once the five-path identity and equal `dist/` hashes
    are confirmed: the build pair, the drill, `npm audit`, `npm test` ×3, the unit
    mutants, axe, and the stress of untouched files.
  - **Rerun:** lint, typecheck, `verify`, the validators, the FULL e2e, the six sweeps
    (any timeout fails), the stress of the changed tests, the mutants, and a diff read.
  - **First stop:** the verifier called PowerShell with `-ExecutionPolicy Bypass -File`, a
    form the brief never allowed. The permission check denied it, and the verifier stopped
    correctly. No gate item ran.
  - **Coordinator decision (Addendum 1):** never retry that form. The census uses only
    inline read-only `-Command` queries. If those are denied too, the census is skipped and
    recorded; it is a precaution, not a gate criterion. The same verifier continues.
- **WP5-UX5-REGATE6: PASS** (scoped) on a5533b5 / 41477510.
  - The census was taken inline: 2.57 busy cores.
  - **The premise holds:** exactly five `tests/e2e` paths changed, and the 250 `dist/`
    hashes equal REGATE5's. So the drill, `npm audit`, `npm test` ×3, the unit mutants and
    axe carry forward.
  - lint, typecheck, `verify` and the validators exit 0.
  - The FULL e2e had 466 and 405 passed, 0 failed.
  - The six sweeps had 0 failed and no timeout; the logo tests took 1.1 to 1.4 min.
  - The stress runs had 0 failed. The longest logo test took 204 s of 240 s under the
    10-worker load.
  - All 12 mutants failed their tests.
- **WP5-UX5-RECHECK-B: FIX REQUIRED** (opus), with one new Low finding.
  - **F-UX5B2-1:** after a restore, `outbound release` checks for later sends per revision
    only (`restore.ts:535-555`). A held send of a superseded revision can be released and
    delivered after the correction.
  - **The fix:** check later sends by period (`timesheet_id`) and add one
    `restore.test.ts` case.
  - **The old findings F-UX5B-1..5 are fixed.** The auditor's own PDF probe made 2,304
    renders, and the 768 PDFs without both labels are byte-identical. The pilot sample
    hashes are unaffected. Option A is verified, including a race between two server
    processes.
  - **Risks:**
    - the one-minute retry when a send's PDF is not stored yet, acceptable for the pilot;
    - a correction's send can be blocked for up to about 81 minutes while the mail server
      is down;
    - two test gaps (G2, P4) that the auditor's probes catch but the suite does not.
- **Coordinator decision:** one fix after RECHECK-A returns, never beside a running audit.
  It covers:
  - F-UX5B2-1 in code, consistent with option A;
  - tests for the G2 and P4 gaps;
  - one known-limit sentence in docs/12 (EN and VI) on how long option A can block.
- **WP5-UX5-RECHECK-A: FIX REQUIRED** (opus), with one new Low finding.
  - **F-UX5A-1..4 are fixed.** Measured at nine widths in both themes: no overlap, the
    button 8 px inside the line end, the lines aligned. The "Change days" name matches its
    words. The touch fix is proven in Chromium emulation. The docs are corrected.
  - **New, F-UX5A2-1:** the focus ring of a read-only week card is painted only on the top
    and left edges, because the day columns cover the rest. The docs claim the shared
    ring. WCAG 2.2 AA is still met (SC 2.4.7); the defect is against the AGENTS UI
    standard and the docs.
  - axe: 104 scans, 0 violations. FULL e2e: 871 passed, 0 failed.
  - **Risks:** touch on real iOS and Android, overlay scrollbars, the test gaps MA1, MA5,
    MA8 and MA9, and the load-sensitive logo sweeps.
  - The auditor's probe run was still running at hand-back. The coordinator stopped it with
    TaskStop; no PID kill.
- **Coordinator decision:** one fix, WP5-UX5-FIX11 (worker-high). It covers:
  - F-UX5B2-1 and F-UX5A2-1;
  - tests for the gaps G2, P4, MA1, MA8 and MA9;
  - a docs/12 known-limit sentence on how long option A can block.

  R-A2-1 (real devices), R-A2-2 and MA5 stay recorded. The pilot packet will list a check
  on a real iPad and Android tablet.
- **WP5-UX5-FIX11 done** (worker-high, sonnet; uncommitted; digest 20709d60; 15 changed
  files). Both findings were reproduced first.
  - **F-UX5B2-1:** `blockerOf` now checks by period. The held superseded send stays held
    (`superseded_by_later_send`). docs/11:178 is corrected and docs/05:72 is extended.
  - **F-UX5A2-1:** a ring layer paints all four edges, in light and dark, also when the card
    is scrolled. The comments and docs/04 are corrected.
  - **Gap tests:** G2, P4, MA1, MA8 and MA9 all fail under their mutants now.
  - docs/12 has the known-limit sentence.
  - axe: 46 scans, 0 violations. `npm test` ran 2,388 tests. The FULL e2e had 872 passed
    and 0 failed. The drill had 209 PASS and 0 FAIL.
  - **Leftover:** the RECHECK-A probe run left orphaned Playwright processes and a built
    server (PIDs 63092, 37448, 90528, 101148) after its bash task was stopped. The owner
    is asked to close them; mission tasks never kill by PID.
- **WP5-UX5-FIX11-FREEZE done.**
  - Commit 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955 is on main and pushed, a fast-forward
    from a5533b5.
  - D_PRE equals the HEAD digest, 20709d60.
  - 425 paths, with no masking. Every check exits 0.
- **WP5-UX5-REGATE7 FAILED on one criterion** (verifier, sonnet, alone, on 0f52300 /
  20709d60).
  - The failure: sweep run `seven-1026` (2026-10-27T06:58:30Z, `--workers=6`), desktop
    `review.spec.ts:406`. The assertion "the text is vertically centred at 767px" read 8,
    and the limit is 1.5. It is not a network, buffer or timeout error.
  - The test is unchanged by FIX11. Alone at the same instant it passed 20/20, and 20/20 on
    the real clock. A rerun of the whole seven-file scope had 0 failed.
  - Everything else passed:
    - exactly FIX11's 15 paths;
    - `dist/` changes map to `restore.ts` and the client bundle;
    - drill `--wp3`: 209 PASS, 0 FAIL;
    - `npm audit --omit=dev`: 0;
    - `npm test` three times, 2,388 tests each, and the validators;
    - the real-clock FULL e2e: 467/35/0 and 405/97/0;
    - the other five sweeps: 0 failed, no timeout;
    - stress: 0 failed;
    - the FIX11 mutants were all killed. The old `restore.ts` delivers the superseded copy,
      and the target refuses it;
    - axe: 84 scans, 0 violations.
  - **Test gap:** the extra mutant R3 survived all 33 restore tests. In R3, a leased later
    send no longer blocks the restore-path release. The guarded line is older than FIX11.
  - Census: the RECHECK-A orphans were still alive, using about one core. Nothing was
    stopped.
  - **Coordinator:** an assertion failure of an unchanged test is not waived, as with
    REGATE5.
- **WP5-UX5-DIAG5 first result** (planner, sonnet, alone, read-only):
  - **Cause:** a measuring race on a real one-frame transient.
    - At the 768-to-767 crossing, the CSS applies first. React's `useMedia` mounts the top-bar
      clock one rendering update later, so the bar grows from 52 to 60 px and the card moves
      8 px.
    - The test read the card and its text in different states. Every settled layout is
      centred.
    - The trace of the failed run agrees. A delay on React's media notice reproduces "Received
      8" in 35 of 40 runs.
    - No product change. The one-frame jump goes to the WP5 optional backlog.
  - **Fix (tests only):** a helper `expectLayoutAt(page, width)` in `tests/e2e/fixtures.ts`,
    called after `setViewportSize` in `review.spec.ts` 406, 643 and 734 and in
    `timesheet.spec.ts` 2541.
    - It passed 40/40 under the delay model and under load.
    - An 8 px off-centre mutant still fails it.
  - **R3:** a `restore.test.ts` case in which a leased later send blocks the release with
    `superseded_by_later_send`. This is the correct reason. The case kills R3.
  - **Coordinator:** accepted. Addendum 1 asks the same planner to cover `logo.spec.ts:599`
    too, which failed at 90 ms like 734. It also asks for a rerun of the 15-spec delay suite
    with the final patch.
- **WP5-UX5-DIAG5 done (Addendum 1).**
  - `logo.spec.ts:599` has the same cause at 480 px. React swaps the 865 px week grid for the
    phone table one update after the CSS, so a helper `expectSheetAt` now runs in the logo
    `sweepRange`.
  - The final patch has five files.
  - The delay suite (the 15 spec files that change the viewport, 436 desktop tests) had 0
    failed at 20, 45 and 90 ms. Before the patch it had 1, 3 and 6 failed.
  - The mutants still fail their tests.
- **WP5-UX5-FIX12 done** (worker, sonnet; uncommitted; digest bf7ec3f7, 882 files).
  - It reproduced the failures on HEAD, then applied the patch to the five test files.
  - **Accepted deviation:** two more `expectLayoutAt` lines, in `review.spec.ts` "a signed
    period opened again" and `timesheet.spec.ts` "from 320 to 1920px". The completeness runs
    found them failing, 8 of 18 and 4 of 120; with the lines, 0 failed.
  - Delay suite: 0 failed at 20, 45, 70 and 90 ms. Load runs: 0 failed. The mutants fail
    their tests. `restore.test.ts`: 33/33.
  - Lint, typecheck, build, verify and `npm test` (2,388) passed. `dist/` is identical to
    HEAD.
  - Real-clock FULL e2e:
    - mobile: 405/97/0;
    - desktop: the first run had 1 failed (`keyboard-access.spec.ts:267`); the rerun was
      467/35/0.
  - Sweep instant 2026-10-27T06:58:30Z: 0 failed.
  - **Two pre-existing flaky tests** fail on HEAD too:
    - `keyboard-access.spec.ts:267` ("Received: inactive"): about half of repeated runs;
    - `day-editor.spec.ts:5304`: 2 to 4 of 20.
  - **Coordinator:** either flake can fail the next regate. They are diagnosed and fixed
    before one freeze of FIX12 and that fix.
- **WP5-UX5-DIAG6 done** (planner, sonnet, read-only).
  - Neither flake comes from state carried between repeats. Both races also exist in a
    single run; host load makes them more frequent.
  - **`keyboard-access.spec.ts:267`: a test race.**
    - The Check in button is disabled while its status loads, 10 to 56 ms after the days
      are drawn. That is documented behaviour.
    - `focus()` does nothing on a disabled button, so the test waits in vain.
    - Fix: wait until the button is enabled before focusing it.
  - **`day-editor.spec.ts:5304`: a narrow product race, of the data-loss class.**
    - The Day editor's unsaved-changes flag is reported one task late.
    - An Escape pressed right after typing in Notes can close the editor without "Discard
      your changes?", and the note is lost. This breaks U4-05.
    - Fix: `useLayoutEffect` for the report in `DayFieldsForm.tsx`, plus a deterministic
      e2e test that fails on the old product 10 of 10.
  - Proof:
    - 60 repeats at 2 and 6 workers: 0 failed;
    - the delay and throttle models pass;
    - the mutants are caught;
    - a repeat census of the whole FULL suite three times on both projects: 0 failed.
  - History: both races are long-standing. Earlier logs show no failure.
  - `dist/client` changes, so the regate is full. A fresh auditor reads the product change.
  - **Coordinator:** accepted. No business or UX decision is needed, because the fix
    restores U4-05.
- **WP5-UX5-FIX13 done** (worker, sonnet; uncommitted; digest c1691aed, 882 files).
  - It reproduced all three failures on the original product: 10/10, 10/10 and 20/20.
  - It applied the patch to `DayFieldsForm.tsx`, `keyboard-access.spec.ts` and
    `day-editor.spec.ts`. Eight paths now differ outside `handoff/`.
  - 60 repeats at 2 and 6 workers: 0 failed. The models, the flag-lag matrix and the load
    run pass. Five mutants, including `useEffect` restored, each fail their test.
  - Lint, typecheck, build, verify and `npm test` (2,388) passed, with no deprecation
    warning. `dist/server` is identical. `dist/client` changed: `index.html` and six chunks.
  - Real-clock FULL e2e: desktop 468/35/0, mobile 406/97/0.
  - The sweep instant had 0 failed.
- **WP5-UX5-FIX13-FREEZE done.**
  - Commit bb8d34039b79320e415a0224c0bd02075bd0f76a is on main and pushed, a fast-forward
    from 0f52300.
  - D_PRE equals the HEAD digest, c1691aed. 627 paths are staged.
  - First stop: `validate_orchestration.py` refused DIAG5's dependency on the failed gate.
    The coordinator fixed the board (DIAG5 now depends on FIX11-FREEZE), and the same
    committer continued.
  - Two evidence files that show the command lines of the owner's own tools were left out
    of the public commit: DIAG6 `new-proc-detail.txt` and REGATE7
    `10-census-sample1.txt`.
- **WP5-UX5-REGATE8 FAILED** (verifier, self-reported claude-sonnet-5-5) on bb8d340 /
  c1691aed, on one criterion.
  - Two simulated-clock FULL sweeps failed: `full-1101` (2026-11-01T08:45Z) had 1 failure
    and `full-0314` (2027-03-14T10:30Z) had 2.
  - All three are the unchanged mobile test `controls.spec.ts:49`: "title row to period
    card at 768px", received 74.8 px, expected 32. They are assertion failures, not
    network errors.
  - The verifier's characterisation:
    - 1 worker at the 1101 instant fails 4 of 5;
    - 6 workers fail 0 of 10;
    - 0f52300 fails too;
    - the real clock never fails.
  - Everything else passed:
    - the 8 paths and the `dist/` comparison;
    - drill 209/0 and `npm audit` 0;
    - core ×3 (2,388 tests);
    - the real-clock FULL run (0 failed);
    - the other four sweeps;
    - stress, the mutants and the DIAG5 and DIAG6 models;
    - axe, 0 violations.
- **Coordinator decision.** Not waived, as with REGATE5 and REGATE7. The failure class
  came back after DIAG5's completeness check, which covered the desktop project only. Part
  of the evidence does not fit a load race:
  - one worker fails more often than six;
  - both failing instants are next to a US Pacific DST change.

  docs/08 escalation row: WP5-UX5-DIAG7 goes to timesheet-expert (opus, xhigh), not to a
  planner. It must settle race, carried state or real state, and run the completeness check
  on both projects, at both instants, with 1 and 6 workers. Cap: if the following fix fails
  a regate on the same class, an owner blocker.
- **WP5-UX5-DIAG7 done** (expert, self-reported claude-opus-5-5).
  - Verdict: a measuring race of the FIX12 class. It is not carried state and not a real
    layout state. Neither the date, DST, the clock wrapper nor one worker is needed.
  - Cause: the test reads the period card in the first rendering update after the width
    change. There, the phone's check in/out group is still in the top bar, which wraps to
    two rows. It then reads the title row after React's commit, which moves the group into
    the title row. 74.8 = 194.8 − 120. The settled gap is always 32.
  - REGATE8's "one worker, two instants" pattern was small-sample noise. The unchanged
    test also fails on the real clock.
  - Fix, tests only: `controls.spec.ts` +4/−1, `expectLayoutAt` after the width change at
    `:49` and `:68`.
  - Proof:
    - delay model: original 52 of 600 failed, patched 0 of 600;
    - plain runs: original 5 of 180 failed, patched 0 of 180;
    - a mutant with the card 42.8 px lower: 12 of 12 caught.
  - Completeness on both projects, 3.5 hours of runs: 0 failed except two other
    pre-existing intermittent failures.
    - F1: `timesheet.spec.ts:2596`, the range ladder, missed "cross-year" 1 of 12 times,
      also on the real clock.
    - F2: `theme.spec.ts:376` timed out once under the 45 ms model: the second tab never
      turned dark. The theme's only cross-tab listener lives in `ThemeToggle`, which is
      mounted only while a menu is open.
- **Coordinator decision.** DIAG7 is accepted. F1 would probably fail the next regate, and
  F2 may hide a cross-tab theme gap. So WP5-UX5-DIAG8 (planner, sonnet) diagnoses both
  before one fix round. It runs on bb8d340 with DIAG7's patch in a scratch export. F2 is
  checked against the accepted plans: a product fix only if an accepted rule requires it,
  otherwise an observation for the backlog.
- **WP5-UX5-DIAG8 done** (planner, self-reported claude-sonnet-5-5).
  - **F1** (range ladder): a test race of the same kind. A click draws the next period only
    after two server answers, so the 14-day wait passes on the old period.
    - In 15 of 36 runs, the test also measured the wrong period without failing.
    - Fix: a `stepPeriod` helper that waits for `data-period-due` to change.
    - Proof: the original failed 5 of 216, the fix 0 of 216. A wrong-year mutant is caught
      12 of 12; the original caught it only 5 of 12.
  - **F2** (theme in a second tab): the failing line is tab A's own paint. On a busy host,
    the tab behind starves; this is DIAG4's finding again.
    - Fix: three `bringToFront` calls. Proof: beside a burner, the original failed 41 of 48
      and the fix passed 48 of 48.
  - **Product finding.** A tab whose account menu is closed does not follow a theme chosen
    in another tab.
    - This breaks the accepted UX2 rule "a storage event keeps other tabs in step".
      WP5-UX3-T02 broke it when it moved the theme control, with its only listener, into the
      menu. docs/04 is silent.
    - A small product patch is proven: `ThemeToggle.tsx` +12, `App.tsx` +4 and a new test.
  - Combined proof, both clocks: 855 passed, 0 failed; the mobile delay suite: 0 failed.
- **Coordinator decision.** Accepted, with the product option:
  - it restores an owner-accepted rule;
  - it is small and proven;
  - it changes no document;
  - left in place, it would come back as an audit finding.

  So the next regate is full.
- **WP5-UX5-FIX14 done** (worker, self-reported claude-sonnet-5-5). It is uncommitted.
  Digest 419ede40.
  - Reproduced first on bb8d340:
    - controls, mobile: 26 of 200 failed;
    - the range ladder under the forced probe: 6 of 6 failed;
    - the theme test beside the burner: 21 of 24 failed;
    - the new cross-tab test on the old product: 12 of 12 failed.
  - It applied the three patches to exactly five paths, +69/−7.
  - Proof:
    - the models: 0 failed;
    - repeats: the ladder 120, the theme spec 820 and the controls tests 120 passed;
    - all five mutants failed their tests.
  - `dist/server` and `dist/domain` are identical. Only `dist/client` changed: the entry
    chunk and the five chunks that import it.
  - `npm test`: 2,388.
  - FULL: desktop 469/35/0 and mobile 407/97/0.
  - The 0314 sweep of the 15 files: 0 failed.
- **WP5-UX5-FIX14-FREEZE done.**
  - Commit bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23 on main. It was pushed as a fast-forward
    from bb8d340, and the remote equals HEAD.
  - D_PRE equals the HEAD digest, 419ede40. 549 paths were staged.
  - Left out: two REGATE8 `.log` files, because evidence must be `.txt`. The two earlier
    privacy files stay untracked.
  - A profile-path literal was masked in three evidence scripts.
  - Every check exited 0.
- **WP5-UX5-REGATE9 FAILED** (verifier, self-reported claude-sonnet-5-5) on bd9c275 /
  419ede40, on one criterion.
  - The seven-spec sweep at 2026-10-27T06:58:30Z failed once. Local midnight in Los Angeles
    comes 90 s into that run.
  - The failing test was the mobile `day-editor.spec.ts:2340`. The `clockIn` poll for an
    open session on `todayLocal` timed out after 7 s. It is not a network error.
  - Everything else passed:
    - drill 209/0 and `npm audit` 0;
    - core ×3 (2,388 tests);
    - the real-clock FULL run (0 failed);
    - the other five sweeps;
    - stress;
    - the FIX14 mutants;
    - every model, including the DIAG5 delay suite on both projects;
    - axe, 0 violations, including the open account menu and the More panel.
- **Coordinator decision.** Not waived. This is a new class: the measuring-race fixes all
  held, so the cap does not apply.

  The leading reading is unproven: the test fixes the local date before the run crosses
  midnight. A real product defect at the day boundary must still be ruled out.
  WP5-UX5-DIAG9 (planner, sonnet) diagnoses it, and runs a completeness census:
  - the boundary-crossing scope with midnight at several offsets;
  - the other sweep instants.
- **WP5-UX5-DIAG9 first result** (planner, self-reported claude-sonnet-5-5). Its sweep
  chain was still running, so the result is NOT VERIFIED yet.
  - **Verdict:** a test assumption at the day boundary. The product is correct: an
    overnight session belongs to the date it started (docs/02, D-05). The failed run's
    trace shows the check-in filed at 07:00:00Z under 2026-10-27, while the test looked at
    2026-10-26.
  - **Fix A:** `clockIn` looks at that day and the next, and checks the day against the
    session's own start instant. It is proven at six chosen instants, and the mutants are
    caught.
  - **Census:** 31 tests fail on the old suite when midnight falls inside them.
  - **Fix B:** a "midnight fence" in the fixtures. If midnight is less than 45 s away, it
    holds a test until the date changes. The deliberate crossing test is exempt. With it,
    six midnight placements gave 0 failed, and the control without the fence failed again.
  - **Optional:** an integration test that pins the check-in date at the second boundary.
- **Coordinator decision (brief Addendum 1).**
  - Fix A and the integration test are accepted.
  - Fix B is accepted in principle. Condition: the fence must not sign in or act on the
    system before every test, unless that is proven harmless.
  - The same planner finishes the sweep chain and proves the final patch, including the
    real-clock FULL run on both projects.
- **WP5-UX5-DIAG9 done (Addendum 1 results).**
  - The fence now reads the runner's clock and the seed's saved zone. It makes no sign-in,
    no request and no database access.
  - The final patch touches tests only: four paths, +101/−14.
  - Proof in a fresh export:
    - `npm test`: 2,389;
    - real-clock FULL: 469/35/0 and 407/97/0;
    - the seven-file scope at 06:58:30Z and with midnight 200 s into the run: 0 failed;
    - the models pass;
    - the fence-off control fails again;
    - all mutants are caught.
  - The first fence's sweep chain (repeat 2) also had 0 failed.
- **Coordinator decision.** Accepted. The fence is a state-based hold before a test starts,
  and it has no side effect. Midnight behaviour stays covered by:
  - the crossing test;
  - the product probe;
  - the new integration test.

  The fence goes to the WP5 handoff as a recorded test-design choice.
- **WP5-UX5-FIX15 done** (worker, self-reported claude-sonnet-5-5). It is uncommitted.
  Digest ff73565b.
  - Reproduced first: case C2 failed on both projects, and the fence-off models failed.
  - It applied the patch to exactly four test paths.
  - Proof:
    - cases C1–C6: 24/24;
    - the models pass, and the fence-off control fails again;
    - mutants A, A2 and B, and the boundary-test mutant, are caught;
    - repeats: 40/40 per project.
  - `dist/` is identical.
  - `npm test`: 2,389.
  - FULL: 469/35/0 and 407/97/0.
  - The midnight sweep: 0 failed. The desktop crossing test took 1.0 min.
- **Running now:** WP5-UX5-FIX15-FREEZE (committer). The coordinator writes no file while it
  runs. Then a scoped REGATE10.
- **Next:**
  - a fix, its freeze and a regate;
  - fresh rechecks of the two findings, the Day editor change and the cross-tab theme
    change;
  - the integration audit, ACCEPT-DOCS and the WP5 re-accept.

## Update 2026-10-14: owner-requested UI change round 2 (WP5-UX2)

- Starting point: WP5 re-accepted on 90b98ef / 57e2974c (WP5-UX-AUDIT-AB9 PASS); last
  board commit aa3a7a0 (WP5-UX-ACCEPT). The earlier update below recorded uncommitted
  coordinator records after that commit; one read-only lookup (OWNER-RESEED) was added
  to the board on 2026-10-14 before this round.
- The owner asked for six Timesheet-page changes (verbatim in the board
  `owner_decisions`): highlight the whole column of the day open in the Day editor; a
  lighter but recognisable selection in the Label picker; a dark/light theme toggle in
  the main navigation; a clearer hover on toggle buttons; an explicit Today button after
  Open day or period navigation; Show details as a slide toggle (switch).
- Coordinator decision: WP5 UI change round 2 (task IDs WP5-UX2-*) before pilot
  activation, no new package; board `running`, `next_task_id` WP5-UX2-PLAN.
- New coordinator session 11acfabe-25ef-48b5-ac28-73ce2d74ecee (inferred from the
  scratchpad path); the board's `coordinator_session_id` and the NEXT_ACTION resume line
  point to it.
- Running: WP5-UX2-PLAN (planner, sonnet, read-only; brief
  `handoff/delivery/tasks/WP5-UX2-PLAN.md`; mockup under
  `handoff/delivery/design/WP5-UX2/`). Step 0 reconciles git (commits after aa3a7a0,
  uncommitted paths, digest).
- Planned order: plan → owner questions only if the plan lists any → handoff-only
  checkpoint commit WP5-UX2-CKPT → slices WP5-UX2-T01.. with a freeze each → package-final
  gate (simulated-clock sweep for Today, drill) → fresh opus audit → WP5 re-accept with a
  pilot-packet identity refresh; docs/10 receives the carried WP5-UX-Q1/Q2 entries and
  this request in the same round.
- WP5-UX2-PLAN done (planner, self-reported claude-sonnet-5-5, read-only): step 0 found
  HEAD = origin/main = 834b9fc, a handoff-only commit by the owner after aa3a7a0 holding
  the WP5-UX-ACCEPT records; digest 57e2974c (795 files) unchanged at start and end.
  Plan sections A-H, mockup and three synthetic renders under
  `handoff/delivery/design/WP5-UX2/`. No server/API/schema change. Measured beyond the
  request: the docs/04 line 46 Today top bar is hidden by the opaque day head (also breaks
  the batch ring); a hover rule erases the pressed look of toggles.
- Coordinator decisions (board): slices consolidated to T01 theme, T02 controls (hover
  and pressed, Show details switch, label picker), T03 editing column with the Today-bar
  repair, T04 Today (after the owner's answer), T05 docs EN+VI, each with a freeze; the
  hover fill applies app-wide; theme stored per device; an open Day editor follows Today
  (F-2 default). Owner question WP5-UX2-Q1 (Today target in the 5 days P-4..P; the
  coordinator recommends b, the period that contains today's date) blocks only T04.
- No separate checkpoint commit: the plan, mockup and records go into the T01 freeze.
- Running: WP5-UX2-T01 (worker-high, sonnet; Dark mode toggle).
- Owner answered WP5-UX2-Q1 (verbatim on the board): Today opens the period that
  contains today, plus a separate button back to the period the page opens on (R-07).
  Coordinator: visible name "Current period" (matches the "current" badge); both buttons
  in T04. Running in parallel with T01: WP5-UX2-PLAN2 (the same planner resumed,
  read-only, no build, app or browser) revises B5 and designs the second button, with the
  test, docs, T04-row and mockup deltas.
- WP5-UX2-PLAN2 done (self-reported claude-sonnet-5-5, read-only): Today targets
  `in_progress` (re-read on click), the editor follows; Current period targets `current`
  and is rendered only in P-4..P away from the landing period, only navigates; order
  Previous, Next, Today, Current period, Review. Mockup HTML updated (renders predate it).
  Flag: in that window the phone row would wrap Review. Coordinator decision: one row at
  390px in every state (compact visible label "Current" below 768px, accessible name
  "Current period", if needed); T04 measures and stops if it cannot fit.
- The owner added three requests (verbatim on the board, with the attached logo): the
  C&D logo instead of the "C&D CDsemi" text (plus "CDSemi" where there is room); on
  phones the clock controls in the top header bar and Today, Current period and Review &
  sign off in one row ("Review & sign off" may wrap or become "Sign off"); "Clock in/out"
  becomes "Check in/out". Coordinator: folded into round 2; the logo ships as a traced
  SVG (the precommit privacy rule blocks PNG); the visible "Current period" stays full.
  Running in parallel with T01: WP5-UX2-PLAN3 (the same planner resumed, read-only).
- WP5-UX2-T01 done (worker-high, self-reported claude-sonnet-5-5; reported, not
  independent proof): Dark mode toggle, `/theme-init.js` before first paint (CSP
  unchanged), dark tokens under the media query and `[data-theme='dark']`; unit 1848; full
  e2e desktop 138/0/15, mobile 142/0/11; budget 659/758/667/766 of 788; verify 0; digest
  44f5b6cc (802 files). Finding R-UX2-1: `/theme-init.js` has no Cache-Control (heuristic
  caching of an unhashed file). Slips: two /dev/null redirects, one heredoc into its own
  test file.
- WP5-UX2-PLAN3 done (read-only): logo `src/client/public/cd-logo.svg` (also favicon),
  36px, "CDSemi" from 768px; phone header clock on every own screen (ClockProvider), none
  in shared views, desktop card unchanged, budget 591/690/643/742; "Review & sign off" on
  two lines; rename touches three server message literals. Coordinator: adopted, with a
  dist/server diff limited to those literals at the gate. Final slices T02 controls, T03
  editing column, T04 Today and Current period, T05 logo, T06 rename, T07 phone header
  clock, T08 docs.
- WP5-UX2-T01-FREEZE done: af6207c281badc27192d1d420de8ace5a73c8296 on main, pushed (46
  paths; digests 44f5b6cc, 802 files; every check exit 0; one harmless /dev/null slip).
- Running: WP5-UX2-T02 (worker-high, sonnet; hover and pressed, Show details switch,
  label picker) on af6207c / 44f5b6cc.
- The owner added two requests (verbatim on the board, with image 2 and a font file
  outside the repository): a two-line wordmark ("SEMICONDUCTOR" / "SERVICES, INC.") in
  his font and colours to the right of the logo instead of "CDSemi"; remove the company
  line from the on-screen timesheet. Coordinator: both go into the brand slice T05; the
  font file is never committed (public repository, unknown licence), the wordmark becomes
  vector outlines; the PDF keeps its company line. Running in parallel with T02:
  WP5-UX2-PLAN4 (the same planner resumed, read-only).
- WP5-UX2-PLAN4 done (read-only): the font is VNI-Revue Bold (copyright 1991 VNI, all
  rights reserved, no licence text); wordmark "Semiconductor" (20px) over "SERVICES, INC."
  (7px, spaced), blue ~#006bbb and grey ~#4c4f57, 196px with the logo, shown from 1280px;
  inline SVG outlines through the installed fontkit, lighter tints in dark; name "C&D
  Semiconductor Services, Inc."; the company line leaves the Timesheet and Review sheets
  (PDF unchanged). Owner question WP5-UX2-Q2 (Q-1 font right for the logo, Q-2 dark
  tint) blocks only T05.
- Owner answered WP5-UX2-Q2 "Q-1 a, Q-2 a" (verbatim on the board): the company may use
  the font for its wordmark (outlines only, no font file); lighter tints in the dark
  theme. T05 is unblocked.
- WP5-UX2-T02 first hand-back (worker-high, self-reported claude-sonnet-5-5): hover fill,
  pressed = solid accent (hover cannot erase it; AX-04 special case removed, ring
  6.09/6.79), Show details as a role=switch checkbox, label picker rail and check; unit
  1848; e2e desktop 171/0/15, mobile 174/1/11; budget unchanged; verify 0; digest
  c44e612c (804 files). The single failure is T01's `theme.spec.ts:215` expecting a hover
  colour on the mobile project, where hover rules no longer apply (plan B4). Deviation:
  the switch off-track uses `--card` (hover contrast 1.23/1.45 instead of 1.08).
  Addendum 1 to the same worker: branch that one test on `(hover: hover)`, then full e2e,
  verify and digest again.
- WP5-UX2-T02 done after addendum 1: `theme.spec.ts:215` branches on `(hover: hover)`;
  full e2e desktop 171/0/15, mobile 175/0/11; verify 0; digest 1e421090 (804 files).
- WP5-UX2-T02-FREEZE done: d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646 on main, pushed (42
  paths; digests 1e421090, 804 files; every check exit 0; slips: one /dev/null redirect,
  one pipe into tail).
- Running: WP5-UX2-T03 (worker-high, sonnet; editing-column marker and Today-bar repair)
  on d0d21e1 / 1e421090.
- WP5-UX2-T03 done (worker-high, self-reported claude-sonnet-5-5; reported, not
  independent proof): editing column via `::before` fill and `::after` rails, Today bar
  and batch ring now visible above the day head; `aria-current` on the editing day only;
  phone row frame (the detail row also has side edges); rails at least 4.53:1, text at
  least 4.52:1; mutation caught (3 failures); unit 1850; e2e desktop 183/0/15, mobile
  187/0/11; budget unchanged; verify 0; digest a42c5b04 (804 files). Slips recorded on
  the board (pipes into tail, one /dev/null, one rm -rf of its own scratch folder outside
  the repository).
- WP5-UX2-T03-FREEZE done: 70ecb1264f7b54cc967a136811eeddcd64d9014a on main, pushed (35
  paths; digests a42c5b04, 804 files; every check exit 0; no checks.txt evidence file,
  results in the brief only).
- Running: WP5-UX2-T04 (worker-high, sonnet; Today and Current period, one-row phone
  layout, its own simulated-clock sweep) on 70ecb12 / a42c5b04.
- WP5-UX2-T04 first hand-back (worker-high, self-reported claude-sonnet-5-5): Today and
  Current period as designed; one phone row at 390/375/360 (Review two lines), Review
  drops at 320; unit 1862; e2e desktop 190/0/19, mobile 197/0/12; sweep 11 instants pass
  except one; mutation caught; verify 0; digest c9abda3e (807 files). STOP: on the first
  window day the away state with the zone note ends at 795.0 / 803.0 against 788 (Today
  tag plus two-line Review); the landing states hold (659/758/667/766). Coordinator
  decision: Addendum 1 drops the away-state assertion to T07 (which frees page height),
  makes the jump announcement a persistent aria-live region, and reruns e2e, sweep,
  verify and digest.
- The owner added five requests (verbatim on the board): "Sign off" instead of a wrapped
  Review label on phones (full text when it fits); more space between the brand and the
  menu on large screens; a Light/Dark toggle with icons instead of the "Dark mode"
  button; "Due" in label style; a nicer separator than "to" in period ranges.
  Coordinator: T04 Addendum 2 (Review short label via container query, so the away-state
  budget assertion stays in T04; "Due" label style; an aria-hidden arrow with a hidden
  " to "); spacing joins T05; new slice T06 theme toggle; new order T05 brand, T06 theme
  toggle, T07 rename, T08 phone header clock, T09 docs.
- WP5-UX2-T04 done after addenda 1 and 2: persistent aria-live jump region; phone Review
  link on one line ("Sign off" / "Review" short forms via container query, full label as
  name); "Due" label style; arrow range separator with a hidden " to "; first window day
  away state 777.5 / 785.5 of 788 asserted; unit 1865; e2e desktop 191/0/19, mobile
  198/0/12; eleven-instant sweep all pass; verify 0; digest 9c76a1ec (807 files).
- WP5-UX2-T04-FREEZE done: 54dda11bbd95e8a8df07aa5918d1e6736231a0a5 on main, pushed (101
  paths; digests 9c76a1ec, 807 files; every check exit 0; one stray `node -e "1"`).
- Coordinator decision: the brand slice is split. T05 logo (traced SVG, favicon, logo
  brand with the hidden company name) and T06 wordmark (outlines, tokens, breakpoint,
  brand-to-menu spacing, on-screen company-line removal); then T07 Light/Dark toggle, T08
  rename, T09 phone header clock, T10 docs.
- Running: WP5-UX2-T05 (worker-high, sonnet; logo) on 54dda11 / 9c76a1ec.
- WP5-UX2-T05 done (worker-high, self-reported claude-sonnet-5-5; reported, not
  independent proof): traced `cd-logo.svg` (3,440 B, pure vector), fidelity 0.45 / 1.40 /
  2.87 mean at 512/64/32 (within thresholds; renders viewed), favicon, logo brand with the
  hidden company name; unit 1869; e2e desktop 196, mobile 203, 0 failed; verify 0; digest
  38a2bb09 (810 files). No 1px ring on the rim (for the audit).
- WP5-UX2-T05-FREEZE done: fa2e679273185e3ebad9f3af425177bf21fb8ac1 on main, pushed (39
  paths; digests 38a2bb09, 810 files; every check exit 0; raw step outputs written as
  `.txt` in its evidence folder, checked: no profile path or private address).
- Running: WP5-UX2-T06 (worker-high, sonnet; wordmark outlines, brand-to-menu gap,
  on-screen company-line removal) on fa2e679 / 38a2bb09.
- WP5-UX2-T06 done (worker-high, self-reported claude-sonnet-5-5; reported, not
  independent proof): wordmark outlines (5.8 KB, font not committed), light
  #006eba/#4c4f57, dark accent/muted tints; fidelity within the PLAN4 checks (render
  viewed); breakpoint raised to 1440 because the bar wraps at 1280 with a share; gap
  24px/32px; company line removed on screen (PDF unchanged); unit 1877; e2e desktop 198,
  mobile 204, 0 failed; verify 0; digest 3407f8f7 (812 files).
- WP5-UX2-T06-FREEZE done: 3f5a3b333dede51043000e7123960ac05d26a76b on main, pushed (68
  paths; digests 3407f8f7, 812 files; every check exit 0; one /dev/null slip).
- Running: WP5-UX2-T07 (worker-high, sonnet; Light/Dark radio-group toggle with sun and
  moon icons, desktop and phone More panel) on 3f5a3b3 / 3407f8f7.
- WP5-UX2-T07 done (worker-high, self-reported claude-sonnet-5-5; reported, not
  independent proof): "Theme" radio group Light | Dark with sun and moon icons, checked
  segment solid accent; contrast at least 4.68 text and 6.09 ring; bar one row at 1440
  with a share; More panel fits; unit 1877; e2e desktop 204, mobile 210, 0 failed; verify
  0; digest 3416cf04 (812 files).
- WP5-UX2-T07-FREEZE done: 9864400243ee0da55ff6241cca7a6ddf720e765d on main, pushed (34
  paths; digests 3416cf04, 812 files; every check exit 0).
- Running: WP5-UX2-T08 (worker, sonnet; Check in/out rename incl. three server message
  literals, with a dist/server delta proof) on 9864400 / 3416cf04.
- WP5-UX2-T08 first hand-back STOPPED (worker, self-reported claude-sonnet-5-5): rename
  done in ten client files, three server literals plus one comment, and the owned tests
  (region "Check in and out", loading text "Checking your status"); unit 1878; full e2e
  4 failed, all `keyboard-access.spec.ts:177` (not owned) still expecting "Clock in/out".
  A mis-escaped junction was briefly created in the repository root and removed.
  Addendum 1: own that one pattern (new name only), record the junction incident with
  proof, then full e2e, the dist/server delta proof, verify and digest.
- WP5-UX2-T08 done after addendum 1: keyboard-access pattern renamed; full e2e desktop
  204/0/19, mobile 210/0/13; dist/server differs from 9864400 only in
  timesheetCommands.js (3 literals, 1 comment); verify 0; digest d3c1f7ca (812 files); the
  junction incident is documented and nothing is left in the repository root.
- WP5-UX2-T08-FREEZE done: 608572f6e8ea53e1567568ac85ca49190b5d45cf on main, pushed (45
  paths; digests d3c1f7ca, 812 files; staged src/server limited to timesheetCommands.ts;
  every check exit 0).
- Running: WP5-UX2-T09 (worker-high, sonnet; phone header check in/out via ClockProvider,
  none in shared views, desktop card unchanged) on 608572f / d3c1f7ca.
- WP5-UX2-T09 first hand-back STOPPED (worker-high, self-reported claude-sonnet-5-5):
  ClockProvider (disabled in shared views, at most the old 3 GETs) and BarClock in a 60px
  phone bar (112px with a share), desktop card kept; budgets 571.5/670.4/623.5/722.4 of
  788; AX-01 passes at 390/375/360/320; full e2e 5 failures, all two older bar-height
  assertions (`theme.spec.ts:532`, `logo.spec.ts:150`) that encode the old heights.
  Addendum 1: own those two assertions with the designed heights, then finish unit,
  e2e, sweep, verify and digest. Slip: two empty heredocs.
- WP5-UX2-T09 done after addendum 1: both bar assertions follow the designed heights;
  unit 1878; e2e desktop 209/0/29, mobile 225/0/13; sweep 3 instants 0 failed; budgets
  571.5/670.4/623.5/722.4 and away 571.5/670.4 of 788; AX-01 0 hidden; verify 0; digest
  29ea76df (814 files).
- WP5-UX2-T09-FREEZE done: f70a5c0479b6cc1a0dd10d29f7791157ff29c43d on main, pushed (43
  paths; digests 29ea76df, 814 files; every check exit 0).
- Running: WP5-UX2-T10 (worker, sonnet; docs/04, 10, 12, 01, 02 and DEVELOPMENT, EN and
  VI) on f70a5c0 / 29ea76df. After its freeze: the package-final gate WP5-UX2-GATE, then
  the fresh opus audit WP5-UX2-AUDIT.
- WP5-UX2-T10 done (worker, self-reported claude-sonnet-5-5; reported, not independent
  proof): docs/04, docs/10 (new round-2 section, coordinator list, carried WP5-UX-Q1/Q2;
  E-1 and F-Q5 reworded to "Check in/out" with the change disclosed), docs/12, docs/01,
  docs/02 and DEVELOPMENT, EN and VI; parity OK; preflight 0; verify 0; digest 20e7a7c8
  (814 files).
- Next: WP5-UX2-T10-FREEZE (the package-final freeze, committer alone), then
  WP5-UX2-GATE (verifier) and the fresh opus WP5-UX2-AUDIT. When the gate records the new
  digest, WP5-UX-AUDIT-AB9 and the six audits that point to it get superseded_by
  WP5-UX2-AUDIT (no chains).
- WP5-UX2-T10-FREEZE done (package-final freeze): d1a20a7f0112fa00171fe4b1d6035427855f12b6
  on main, pushed (27 paths; digests 20e7a7c8, 814 files; every check exit 0; one stray
  `node -e` to the null device).
- Running: WP5-UX2-GATE (verifier, sonnet) on d1a20a7 / 20e7a7c8: the WP5 gate items,
  the server boundary against 90b98ef (only the three message literals), the round
  scope, a simulated-clock sweep (6 full-suite instants plus 9 targeted), the
  round-specific checks and synthetic screenshots.
- WP5-UX2-GATE PASS (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on
  d1a20a7 / 20e7a7c8 (814 files, three forms equal): verify 1878; e2e 434/0/42; AC-13 x3
  plus Tokyo and New York; drill 208/0, image
  sha256:8b0effa0f831dbb96a08e1e0ab22615601dfbfe8384086abf1ee030682ce4310 (removed); server
  and domain differ from 90b98ef only in timesheetCommands (three literals, one comment);
  scope 67 paths mapped to T01-T10, no font or raster; sweep 6 full plus 10 targeted runs,
  0 failed (one buffer-error rerun); contrast, 44px, no sideways scroll; budgets
  571.5/670.4/623.5/722.4, away 591.0/690.0 of 788; bars 56, 60 and 112; CSP identical;
  no check in/out in shared views; 10 synthetic screenshots.
- Board: current_source_digest 20e7a7c8; WP5-UX-AUDIT-AB9 and the six audits that pointed
  to it now carry superseded_by WP5-UX2-AUDIT.
- Running: WP5-UX2-AUDIT (fresh opus auditor, xhigh) on d1a20a7 / 20e7a7c8.
- WP5-UX2-AUDIT FIX REQUIRED (fresh opus, self-reported claude-opus-5-5) on d1a20a7 /
  20e7a7c8 (digest equal at start and end): three Low findings, 01 Today inert after the
  reporting-zone midnight with the page open, 02 docs omit the 320px Review row, 03 the
  inactive Today's focus ring dimmed to 2.70:1 by element opacity; risks R-UX2A-1..5;
  mandatory checks green (npm test 1878 x2, e2e 434/0/42, AC-13, server diff only the
  three literals); 20 mutants, 16 caught; owner fidelity: all 16 items and both answers
  done. Review: `handoff/delivery/WP5_UX2_REVIEW.md` (+ vi).
- Coordinator decision (2026-10-15): one fix round WP5-UX2-FIX1 (findings 01-03 and
  R-UX2A-2); R-UX2A-5 (the "future" badge on the period Today opens) goes to the owner as
  an optional question. Then FIX1-FREEZE, WP5-UX2-REGATE and a fresh WP5-UX2-AUDIT2.
- WP5-UX2-FIX1 done after addendum 1 (worker-high, self-reported claude-sonnet-5-5;
  reported, not independent proof): the inactive Today re-reads on press, focus and
  visibility (midnight e2e under the preload passes at 10-25 and 10-31); the docs
  describe the below-330px row and the new press behaviour; inactive dimming by colour,
  ring 6.09-6.79; wording unit test catches all 5 reverts; unit 1882; e2e desktop
  216/0/29, mobile 232/0/13; preflight and verify 0; digest ac1895d9 (815 files).
- WP5-UX2-FIX1-FREEZE done: b1b725b7361d55e7aed70656051359153e457b5c on main, pushed (418
  paths incl. the gate, audit and FIX1 evidence; digests ac1895d9, 815 files; every check
  exit 0; one stray `node -e`).
- Running: WP5-UX2-REGATE (verifier, sonnet) on b1b725b / ac1895d9: WP5 gate items with
  the drill (new release image), boundary, the 11-path fix scope, the findings observed
  fixed, a reduced sweep and the round checks. Then the fresh opus WP5-UX2-AUDIT2. The
  optional owner question WP5-UX2-Q3 stays open (default a).
- WP5-UX2-REGATE FAIL (verifier, self-reported claude-sonnet-5-5) on b1b725b / ac1895d9:
  everything passed (verify 1882, real-clock e2e 448/0, AC-13, drill 208 PASS with image
  2d269f87…, boundary, fix scope, findings 01-03 and R-UX2A-2 observed fixed, round
  checks) except the full simulated-clock runs outside the window (2026-10-17 and
  2026-12-31): 8 failures each in the new `focus-ring.spec.ts:407` tests, whose focus step
  only works on window days. The product is fine (direct focus probes show the full
  ring). FIX1 had run only today.spec outside the window.
- Coordinator decision: tests-only WP5-UX2-FIX2 (worker, sonnet) makes that focus step
  calendar-independent and runs the full suite outside the window too; then FIX2-FREEZE,
  WP5-UX2-REGATE2 and the fresh WP5-UX2-AUDIT2.
- WP5-UX2-FIX2 done (worker, self-reported claude-sonnet-5-5; tests only): the
  inactive-Today focus step is calendar-independent; focus-ring.spec passes at 10-17,
  12-31, 10-26, 10-27 and the real clock; full e2e 448/0 on the real clock (after one
  buffer-error rerun) and at 2026-10-17; unit 1882; verify 0; digest 229df806 (815
  files).
- WP5-UX2-FIX2-FREEZE done: a6437943403fc416240fd13a787a8c4748af3e84 on main, pushed (190
  paths incl. the REGATE evidence; digests 229df806, 815 files; every check exit 0; one
  empty heredoc fed to cat).
- Running: WP5-UX2-REGATE2 (verifier, sonnet) on a643794 / 229df806 (WP5 gate items with
  the drill, boundary, dist identity with b1b725b, the one-file fix scope, a sweep inside
  and outside the window). Then the fresh opus WP5-UX2-AUDIT2.
- WP5-UX2-REGATE2 PASS (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on
  a643794 / 229df806 (three forms equal): verify 1882; real-clock e2e 448/0/42; AC-13 x3
  plus Tokyo and New York; drill 208/0, image
  sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a (removed);
  dist/server differs from 90b98ef only in timesheetCommands.js; dist/ byte-identical to
  b1b725b; fix scope only focus-ring.spec.ts (+4/-0); 9 sweep runs 0 failed, including
  the full suite at 2026-10-17 and 2026-12-31.
- Board: current_source_digest 229df806; WP5-UX-AUDIT-AB9 and the six audits that pointed
  to it now carry superseded_by WP5-UX2-AUDIT2.
- WP5-UX2-AUDIT2 PASS (fresh opus, self-reported claude-opus-5-5; not the first round's
  auditor) on a643794 / 229df806, no findings: 01-03 and R-UX2A-2 closed with its own
  simulated-clock and ring probes; npm test 1882 x2; e2e 448/0/42 on the real clock and
  outside the window; AC-13 1/1; 11 mutants, 14 catches in 15 runs; only the 11 fix paths
  changed since d1a20a7, dist/server still differs from 90b98ef only in the three
  message texts; risks R-UX2A-1, -3, -4, -5 and new optional R-UX2A2-1..4. Review:
  `handoff/delivery/WP5_UX2_REVIEW2.md` (+ vi).
- Re-accept in progress: STATE (WP5 on a643794 / 229df806, review WP5_UX2_REVIEW2) and
  NEXT_ACTION (EN/VI) updated by the coordinator; running WP5-UX2-ACCEPT-DOCS (light,
  sonnet: pilot packet identity and WP5 handoff, EN/VI); then the accept commit
  WP5-UX2-ACCEPT and the flip to `software_ready`.
- WP5-UX2-ACCEPT-DOCS done (light, self-reported claude-sonnet-5-5): pilot packet (EN/VI)
  refreshed to a643794 / 229df806 / REGATE2 / image 6d184442 / AUDIT2 with corrected
  server provenance; WP5 handoff (EN/VI) section "Re-acceptance after UI change round 2
  (WP5-UX2)"; parity and preflight pass; digest unchanged. Background work left after
  hand-back was stopped by the coordinator (TaskStop).
- Next: WP5-UX2-ACCEPT (committer, alone; handoff only), then the board flips to
  `software_ready` (that last flip stays uncommitted). **WP5 is re-accepted on
  a643794 / 229df806; UI change round 2 is closed.** Next owner action: review the pilot
  packet and answer D-1..D-15 (optional WP5-UX2-Q3).
- WP5-UX2-ACCEPT done: b1bf1479ba51f2df0d888fca232a1cb71f47c9e8 on main, pushed (263
  handoff paths; digest 229df806 unchanged; every check exit 0). **WP5 re-accepted on
  a643794 / 229df806; UI change round 2 is closed.** Board back to `software_ready`
  (next_task_id null).
- Uncommitted afterwards (handoff only): that flip, the ACCEPT results and evidence, and
  this update (+ vi).
- Next (owner): review the pilot packet (release identity a643794 / 229df806, image
  6d184442…), answer D-1..D-15 and, optionally, WP5-UX2-Q3 (the "future" badge; default
  keep), run the NAS steps, and decide on pilot authorization.

## Update 2026-10-08: owner-requested UI change round (WP5)

- The owner asked for a more beautiful, easier UI, with the Timesheet page laid out like
  the timesheet in the sample Excel workbook. Verbatim request in the board's
  `owner_decisions`.
- Coordinator decision: run it as a WP5 change round before pilot activation (no new
  package). The board moved from `software_ready` to `running`; `next_task_id` is
  WP5-UX-PLAN.
- Done: WP5-UX-PLAN (planner, self-reported claude-opus-5-5, read-only; HEAD fe67f94 and
  digest 150420e7 unchanged at start and end). Plan sections A-G in
  `handoff/delivery/tasks/WP5-UX-PLAN.md`; mockup `handoff/delivery/design/WP5-UX/mockup.html`
  (artboards A1-A7) with eight synthetic screenshots. No server/API change except a
  display-only h:mm formatter in `src/domain/format.ts`; slicing WP5-UX-T01..T06, one
  writer, then WP5-UX-GATE and a fresh opus audit on the new digest.
- This coordinator session has no Artifact (Design) tool; the HTML mockup replaces it.
- Pending owner question: board `pending_owner_question_2` (E-1..E-7). Blocks WP5-UX-T01.
- Checkpoint commit WP5-UX-CKPT (committer) stores the plan, mockup, screenshots, board,
  checkpoints and NEXT_ACTION, plus the leftover GOV-RECOVERY-ACCEPT result record and
  evidence (attempt 2). `handoff/delivery/WP5_PILOT_PACKET.vi.md` has an uncommitted
  change of unknown origin; it stays unstaged until the owner says whether it is his. After it, the board returns to `software_ready` (the
  accepted WP5 snapshot is unchanged); that last flip stays uncommitted.
- Committed: WP5-UX-CKPT attempt 2 = 5faa0b6f046568dae300331790a9dd168685427b on main,
  pushed (18 paths, all checks exit 0, digest 150420e7). Uncommitted afterwards: the board
  result and `software_ready` flip, this update (+ vi), the WP5-UX-CKPT results and
  evidence, and `WP5_PILOT_PACKET.vi.md` (unknown origin, untouched).
- Owner answered E-1..E-7 "OK theo khuyến nghị" (all recommended). The D answers go in
  chat, recorded verbatim, then a docs worker updates the packet EN+VI (coordinator
  decision); the owner reverted his draft edit of `WP5_PILOT_PACKET.vi.md`.
- Planned GOV-SUPERSEDE cycle before WP5-UX-GATE (audit field `superseded_by` so that
  WP5-RECHECK stays a historical PASS when the digest moves; see coordinator_decisions).
- Running: WP5-UX-T01 (worker, sonnet; tokens and shell), base 5faa0b6 / 150420e7.
  Order: T01 → T01-FREEZE → … → T06, GOV-SUPERSEDE, WP5-UX-GATE, WP5-UX-AUDIT.
- T01 first hand-back: shell, tokens, Settings link and four specs done; typecheck, lint,
  unit and verify exit 0; mobile e2e 3 failures because Sign out/Settings moved under
  More. Addendum 1 extends owned paths to the sharing, isolation, setup and review specs
  (test updates only) and requires the full e2e suite; the same agent was resumed.
- T01 done after addendum 2: full e2e exit 0 (desktop 72/0/3, mobile 73/0/2);
  typecheck, lint, verify exit 0; digest b5cdb2d4 (779 files). One stray empty heredoc
  (no effect, no task left).
- WP5-UX-T01-FREEZE done: 3224474 on main, pushed (26 files, digest b5cdb2d4, all checks
  exit 0).
- Running: WP5-UX-T02 (worker-high, opus, novelty; the Excel-style sheet) on base
  3224474 / b5cdb2d4. Owns the sheet components, sheetModel, formatter, screen swap,
  styles and `tests/e2e` specs (not fixtures.ts).
- T02 done (2 hand-backs): sheet components added, grid/list deleted, display formatter;
  unit 1783 passed; full e2e exit 0 (desktop 72/0/3, mobile 73/0/2); verify exit 0;
  probe digest 1789a8be (781 files) because `npm run digest` exits 1 on unstaged
  deletions (backlog note). Open for the gate: the fixed phone top bar appears mid-image
  in full-page captures.
- WP5-UX-T02-FREEZE done: 5edc548 on main, pushed (41 files, digest 1789a8be after
  staging and on HEAD, all checks exit 0).
- T03 done: PeriodBar, ClockPanel, periodBarModel (accepted outside the listed owned
  paths), batch mode; unit 1790 (one native vitest worker crash on the first run, rerun
  clean: watch at the gate); full e2e exit 0 (desktop 72/0/3, mobile 73/0/2); verify
  exit 0; probe digest 80bffa7e (783 files). Sixth empty-heredoc incident, no effect.
- WP5-UX-T03-FREEZE done: b6324b7 on main, pushed (38 files, digest 80bffa7e after
  staging and on HEAD, all checks exit 0; one harmless `| node -e` stdin slip).
- Running: WP5-UX-T04 (worker-high, opus, novelty; side-panel/bottom-sheet day editor,
  hours+minutes leave, one-tap break confirmation, in-cell label picker) on base
  b6324b7 / 80bffa7e.
- T04 done: side panel, bottom sheet, hours+minutes leave, one-tap break confirmation,
  in-cell label picker (three new pure models); unit 1808; full e2e exit 0 (desktop
  76/0/3, mobile 77/0/2); verify exit 0; digest 6f362af9 (789 files). Eighth stdin-rule
  slip (empty `cat` heredoc, no effect).
- WP5-UX-T04-FREEZE done: 118a104 on main, pushed (37 files, digest 6f362af9, all checks
  exit 0).
- T05 done: Review as read-only sheet plus checklist; unit 1816; full e2e exit 0
  (desktop 76/0/3, mobile 77/0/2); verify exit 0; digest 0071a588. review.spec per-day
  assertions adapted (audit must confirm no weakening). Ninth stdin-rule slip (empty
  `cat >>` heredoc, no effect).
- WP5-UX-T05-FREEZE done: 6cbe5d6 on main, pushed (27 files, digest 0071a588, all checks
  exit 0).
- T06 done: docs/04, docs/10 (owner decisions 2026-10-08) and docs/12, EN+VI; preflight
  PASS; verify exit 0; digest 46a3a0c6. Contradiction found: docs/04:16 "Display current
  viewing zone" versus the period bar showing the zone only when it differs. Coordinator
  decision: keep the rule, fix the UI in WP5-UX-FIX1.
- WP5-UX-T06-FREEZE done: abe6802 on main, pushed (17 files, digest 46a3a0c6, all checks
  exit 0; head/tail piping deviation, harmless).
- FIX1 done: "Times in <zone>" always shown, note added when zones differ; unit 1817;
  full e2e exit 0 (desktop 77/0/3, mobile 78/0/2); preflight and verify exit 0; digest
  2565b1e8. No deviation.
- WP5-UX-FIX1-FREEZE done: 4def605 on main, pushed (23 files, digest 2565b1e8, all checks
  exit 0). All UI redesign source is frozen.
- GOV-SUPERSEDE-FIX done: validate_superseded (six rules) and the stale-PASS exemption;
  probes 87 -> 106; real board passes; docs/08 (+vi); runtime line in eight profiles;
  preflight and verify exit 0; digest 3d274c9e. One harmless `ls | head` slip.
- GOV-SUPERSEDE-FREEZE done: 831f760 on main, pushed (31 files, digest 3d274c9e, new
  validator PASS on 283 tasks, 106 probes).
- GOV-SUPERSEDE-GATE PASS on 831f760 (106 probes; scenarios accepted/rejected as
  expected; digest 3d274c9e).
- GOV-SUPERSEDE-AUDIT PASS (fresh opus, no findings; 48 scenarios, 85 earlier probes kept,
  27/30 mutants killed; R1/R2 optional in the governance backlog; R3 coordinator
  discipline) at 831f760 / 3d274c9e.
- GOV-SUPERSEDE-ACCEPT done: 5beae2f on main, pushed (40 handoff files). GOV-SUPERSEDE
  accepted.
- WP5-UX-GATE PASS on 831f760 (NAS NOT VERIFIED): digest 3d274c9e in three forms; verify
  1817; e2e 155/0/5; AC-13 x3 and two real zones; drill 208/0, image
  sha256:2c8d9db2…24143 (removed after the run); boundary only formatHoursMinutes; PDF
  unchanged; contrast >= 4.65 (non-text rule line 2.86/2.97 noted); npm test x3 stable;
  top bar sticky (capture artifact explained); 44px and no horizontal scroll.
- Board: current_source_digest 3d274c9e; WP5-RECHECK superseded_by WP5-UX-AUDIT-A.
- Running (parallel, read-only): WP5-UX-AUDIT-A (integrity, zones, edit paths, sharing,
  privacy, PDF; ports 47910-47929) and WP5-UX-AUDIT-B (owner fidelity, test strength,
  accessibility, UI standards, docs, full e2e; ports 47930-47949), both fresh opus.
- WP5-UX-AUDIT-B done: FIX REQUIRED. B-01 (Medium) no day row on the first phone screen;
  B-02 (Medium) side panel at 768-1199px obscures focusable sheet controls, Escape on the
  sheet does not close it, docs/04:59 inaccurate; B-03 (Low) weakened import-absence
  assertion (import.spec.ts:382-396); B-04 (Low) docs/04 lines 41, 55 (EN/VI). Own
  checks all green; digest 3d274c9e.
- WP5-UX-AUDIT-A: first hand-back NOT VERIFIED (stopped after a denied rm of the stray
  file D:\raw-r07.txt it created; owner asked to delete it); resumed to finish, including
  the leave-input `noValidate` question and the npm ci vulnerability line.
- WP5-UX-AUDIT-A done (2026-10-09): FIX REQUIRED, A-01 (Medium) malformed leave input
  saved as a different leave (noValidate + leaveInputModel); own probes for zones,
  AC-04, sharing, isolation and privacy all passed; npm 'high' is the pre-existing
  dev-only source-map-js (R-RA6).
- Fix round (coordinator decision 2026-10-09): WP5-UX-FIX2 (A-01) running now, then
  FIX2-FREEZE, WP5-UX-FIX3 (B-01..B-04), FIX3-FREEZE, WP5-UX-REGATE, fresh re-audits
  WP5-UX-AUDIT-A2 and -B2.
- WP5-UX-FIX2 done: malformed leave input refused (role=alert, aria-invalid, nothing
  sent); unit 1820; full e2e desktop 78/0/3, mobile 79/0/2; verify exit 0; digest
  574bbc02. Also fixed a pre-existing racy e2e wait (re-audit to confirm no weakening).
- WP5-UX-FIX2-FREEZE done: aebc06f on main, pushed (185 files, digest 574bbc02).
- WP5-UX-FIX3 first hand-back: B-01 (phone first row bottom 758px < 788px tab bar),
  B-02 (modal with inert page below 1200px; Escape closes from anywhere), B-03, B-04
  done; unit 1820; full e2e 162/0/10; preflight and verify exit 0; digest b4df9213.
  Residual phone tab order (review link before `>`) sent back as addendum 1 to the same
  worker before the freeze.
- WP5-UX-FIX3 done after addendum 1 (DOM order previous, next, review; tab-order
  assertion both projects): unit 1820; full e2e 164/0/10; preflight and verify exit 0;
  digest 8c07aac5.
- WP5-UX-FIX3-FREEZE done: 589bcff on main, pushed (38 files, digest 8c07aac5).
- WP5-UX-REGATE PASS on 589bcff (NAS NOT VERIFIED): digest 8c07aac5 in three forms;
  verify 1820; e2e 164/0/10; AC-13 x3 and two zones; drill 208/0, image
  sha256:6ab12fdf7889467842a044430dee0386d9f8755897ff2d4681421f558080cf72 (removed after
  the run); boundary only formatHoursMinutes; PDF unchanged; A-01, B-01 (659 <= 788),
  B-02, B-03, B-04 and tab order observed fixed.
- Board: current_source_digest 8c07aac5; WP5-RECHECK superseded_by WP5-UX-AUDIT-A2.
- WP5-UX-AUDIT-B2 done: FIX REQUIRED, one Low finding B2-01 (the one-row "Open a day"
  input clips the typed date at 360/320px, WCAG 1.4.10); B-01..B-04 closed; 0 weakened
  assertions; full e2e 164/0/10; digest 8c07aac5.
- WP5-UX-AUDIT-A2 done: PASS on 589bcff / 8c07aac5, no findings; A-01 closed (12
  malformed entries refused on three layouts; valid bodies equal to 014bd47); Info R2
  (Escape order under a picker review when shrinking below 1200px) and R5 (grantee bar
  on the phone) carried.
- WP5-UX-FIX4 done: full date in the phone Open-a-day field (220px at 360, 180px at 320;
  390 layout unchanged); O-1..O-3; unit 1820; full e2e 167/0/13; verify exit 0; digest
  0b8428fd.
- WP5-UX-FIX4-FREEZE done: a2ea7a4 on main, pushed (246 files, digest 0b8428fd).
- WP5-UX-REGATE2 PASS on a2ea7a4 (NAS NOT VERIFIED): digest 0b8428fd in three forms;
  verify 1820; e2e 167/0/13; AC-13 x3 and two zones; drill 208/0, image
  sha256:410209b0d74225b7e20337279bccd6ab4bb0173a7437fa2e879344e2fac4ac9e (removed after
  the run); B2-01 closed (146/220/180px); B-01 659.02 (757.97 with zone note) <= 788;
  A-01, B-02, tab order hold.
- Board: current_source_digest 0b8428fd; WP5-UX-AUDIT-A2 and WP5-RECHECK superseded_by
  WP5-UX-AUDIT-A3.
- WP5-UX-AUDIT-A3 PASS on a2ea7a4 / 0b8428fd (FIX4 delta comment/CSS only; bodies equal
  to 014bd47; checks green). Stray file D:\canedit.txt left by the auditor (owner to
  delete, with D:\raw-r07.txt).
- WP5-UX-AUDIT-B3 FIX REQUIRED: B3-01 (Low) nested review dialog loses Escape and focus
  across the 1200px mode switch; B3-02 (Low) docs/04 line 55; B2-01 closed; optional O-5
  (vacuous sub-assertion) and R-7 (token tuning).
- WP5-UX-FIX5 done (opus): editor defers the mode switch while another modal is open;
  docs/04 line 55; O-5 meaningful assertion; R-7 tokens 8.5/14.25rem (375px first row now
  above the tab bar); nine resize paths self-checked; e2e desktop 84/0/9, mobile 86/0/7;
  verify exit 0; digest b7bbcbc0.
- WP5-UX-FIX5-FREEZE done: edaaa85 on main, pushed (302 files, digest b7bbcbc0).
- WP5-UX-REGATE3 PASS on edaaa85 (NAS NOT VERIFIED): digest b7bbcbc0 in three forms;
  verify 1820; e2e 170/0/16; AC-13 x3 and two zones; drill 208/0, image
  sha256:1332b6d5ac7bbbc127b0b64f56814373088e989508137f6760640a7d5abc6af2 (removed after
  the run); B3-01 holds on three resize paths; B3-02, R-7 (full date at 390/375/360/320)
  and earlier fixes hold.
- Board: current_source_digest b7bbcbc0; WP5-RECHECK, WP5-UX-AUDIT-A2 and -A3
  superseded_by WP5-UX-AUDIT-A4.
- WP5-UX-AUDIT-A4 PASS on edaaa85 / b7bbcbc0, no findings (deferred switch never
  changes what is saved; 12 post-switch saves equal to 014bd47; checks green).
- WP5-UX-AUDIT-B4 FIX REQUIRED on edaaa85: B3-01 closed on 7 paths, B3-02, O-5, R-7
  done, no weakened assertion; new B4-01 (Medium, re-judged R-1: focus ring 1.72:1 /
  2.46:1, WCAG 1.4.11) and B4-02 (Low, ISO due time in the zone note vs docs/04 line 45).
- Per the 2026-10-09 decision, owner question WP5-UX-Q1 instead of another loop;
  WP5-UX-FIX6 brief prepared as pending (recommended option a).
- WP5-UX-CKPT2 done: c24d634 on main, pushed (300 handoff files, digest b7bbcbc0).
- Board: status `blocked`, next_task_id WP5-UX-FIX6 (pending), waiting for the owner's
  answer to WP5-UX-Q1. Uncommitted: this flip, the CKPT2 results and evidence, and this
  checkpoint update (+ vi).
- Owner answered WP5-UX-Q1 "a" (2026-10-09, recorded verbatim). Board back to `running`.
- WP5-UX-FIX6 done: focus ring 5.2-7.5:1 on every surface in both themes (new
  focus-ring e2e check), US due date in the zone note; unit 1821; full e2e 174/0/16;
  verify exit 0; digest 07c3ca00.
- Reconciled (WP5-UX-RECON1): HEAD = origin/main = 49a3ff0, a handoff-only commit the
  owner made himself after c24d634 (CKPT2 results, board flip, checkpoint); source
  unchanged.
- WP5-UX-FIX6-FREEZE done: 5e104e1 on main, pushed (32 files, digest 07c3ca00, 790
  files).
- WP5-UX-REGATE4 PASS on 5e104e1 (NAS NOT VERIFIED): digest 07c3ca00 in three forms;
  verify 1821; e2e 174/0/16; AC-13 x3 and two zones; drill 208/0, image
  sha256:218dd7cc9e567862182f633914717e4087d2bb2265a77a2d98a7eaaf596e9791 (removed after
  the run); focus ring 6.09 / 6.79:1 on six controls; zone note US format; earlier fixes
  hold.
- Board: current_source_digest 07c3ca00; WP5-RECHECK, A2, A3 and A4 superseded_by
  WP5-UX-AUDIT-A5.
- WP5-UX-AUDIT-B5 FIX REQUIRED on 5e104e1: B4-01 and B4-02 closed; new WCAG 2.2 AA
  findings B5-01 (Medium, sticky bars hide focused controls on Shift+Tab, SC 2.4.11),
  B5-02 (Medium, label-picker active option 1.14:1 / 1.28:1, SC 1.4.11) and B5-03 (Low,
  the editor dialog is a focus stop without indicator, SC 2.4.7); no weakened assertion;
  full e2e 174/0/16.
- WP5-UX-AUDIT-A5 PASS on 5e104e1 / 07c3ca00, no findings (FIX6 changes no area-A
  behaviour; 20316 DST checks; server byte-identical). Area A current.
- Owner question WP5-UX-Q2 on the board and in NEXT_ACTION (+vi); pending brief
  WP5-UX-A11Y-SWEEP (option a).
- WP5-UX-CKPT3 done: d3935e7 on main, pushed (310 handoff files, digest 07c3ca00).
- Board: status `blocked`, next_task_id WP5-UX-A11Y-SWEEP (pending), waiting for the
  owner's answer to WP5-UX-Q2. Uncommitted: this flip, the CKPT3 results and evidence,
  and this checkpoint update (+ vi).
- Owner answered WP5-UX-Q2 "a" (2026-10-09, recorded verbatim). Board back to `running`.
- Running: WP5-UX-A11Y-SWEEP (planner, opus, read-only; automated axe plus a full
  keyboard walk of every screen on desktop and phone, light and dark).
- Next: one fix round WP5-UX-FIX7 for every WCAG 2.2 AA item the sweep lists, its
  freeze, WP5-UX-REGATE5, fresh B6 and an area-A delta A6, then the WP5 re-accept (docs/10
  gets the Q1 and Q2 owner decisions).
- WP5-UX-A11Y-SWEEP done (planner, self-reported claude-opus-5-5, read-only): ten WCAG
  2.2 AA issues AX-01..AX-10 (AX-01..AX-03 = B5-01..B5-03; new: AX-04 pressed-tool ring,
  AX-05 accessible names without the visible text (SC 2.5.3), AX-06 sharing switcher
  navigates on change (SC 3.2.2), AX-07 missing status/alert roles (SC 4.1.3), AX-08 focus
  not returned after dialogs (SC 2.4.3), AX-09 light `--ok` contrast (SC 1.4.3), AX-10
  batch header overflow at 320px (SC 1.4.10)). HEAD observed 5b349f8 (handoff-only commit
  after d3935e7; the next freeze checks its author and contents).
- Coordinator decision (AGENTS rule 8): AX-05 contradicts docs/04 line 48 (the day button
  name); the name will contain the visible text and keep the ISO date, and docs/04 EN+VI
  change in FIX7.
- WP5-UX-FIX7 done (self-reported claude-opus-5-5; reported, not independent proof): all
  ten fixed client-only in 29 files plus docs/04 line 48 EN+VI; new checks fail on
  5e104e1; probe self-check 0 hidden stops; AX-09 deviation `--ok` #136a42; extra R-12
  date-field ring; unit 1823, full e2e 208/0/24, preflight and verify 0; digest b7c011d2.
  Slips: one `| head`, one shared TEMP folder for parallel runs.
- WP5-UX-FIX7-FREEZE attempt 1 stopped before commit: 5b349f8 is the owner's
  handoff-only checkpoint (author huysrc, 6 handoff files); digest b7c011d2 matched; 141
  paths staged and left staged; the precommit check blocked 36 cut synthetic addresses
  (domain cut to `example.inval`) and one profile-path grep pattern in evidence and the FIX7 record.
- WP5-UX-FIX7-MASK done (light, self-reported claude-sonnet-5-5): 36 `<email>` and one
  `<user>` replacement in nine files; no index change; sed used instead of Edit.
- WP5-UX-FIX7-FREEZE attempt 2 stopped: 143 staged, 7 new email blocks, all records
  written after the mask that quoted the cut address (coordinator's own five rewritten
  without the at sign; rule added to runtime_observations).
- WP5-UX-FIX7-MASK attempt 2 done: both lines fixed; whole handoff sweep 0 blocked
  emails, 0 profile-path hits in changed paths; 21 older pattern hits in committed files
  noted for a later read-only privacy classification.
- WP5-UX-FIX7-FREEZE attempt 3 done: bf954c0b371ad9a5fe461a603c5d476ea210e66c on main,
  pushed (143 paths; working-tree and HEAD digests b7c011d2; every check exit 0).
- WP5-UX-REGATE5 PASS (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on
  bf954c0 / b7c011d2: unit 1823, full e2e 208/0/24, drill 208 PASS, image
  sha256:1b7b561e3d6ca29cedd4fc7bb5bc3b2cecd1c8c88a6b86370e9b267c0765caf4; fix scope the
  29 paths; AX-01 0 hidden stops in 64 walks; rings 5.3-6.8:1; two admin/Settings status
  notices verified in source only.
- WP5-UX-AUDIT-A6 PASS (fresh opus, self-reported claude-opus-5-5), no findings: FIX7
  changes no area-A behaviour (no write on Cancel/Escape/Back, bodies equal since 014bd47,
  same 6 switcher routes, AC-16 and isolation, data-day selection across DST and device
  zones, sticky hook hides nothing); npm test 1823, area-A e2e 155/0/23, AC-13 1/1.
  Board: A5, A4, A3, A2 and WP5-RECHECK superseded_by A6; current digest b7c011d2.
- WP5-UX-AUDIT-B6 FIX REQUIRED (fresh opus): every fix-round item closed (B5-01..B5-03,
  AX-04..AX-10, R-12; 200 walks, 7320 stops, 0 hidden, 0 without a ring; no weakened
  assertion; e2e run 2 208/0/24, run 1 had one transient ECONNRESET in
  automation.spec.ts:118). New Low finding WP5-UX-B6-01 (pre-existing): at 390x844 a
  person with a received share and the zone note gets a two-row shell bar; the first day
  row ends at 830.2px, below the tab bar at 788px (docs/04 line 48).
- Coordinator decisions: fix the layout and keep docs/04 line 48; keep docs/10 unchanged
  for the re-accept (it is inside the digest), Q1 and Q2 stay on the board and go into
  the WP5 handoff.
- WP5-UX-FIX8 done (self-reported claude-sonnet-5-5; reported, not independent proof):
  CSS-only one-row compact bar below 768px (`styles.css`, new `--switcher-basis` token)
  and two mobile e2e checks in `sharing.spec.ts` that fail on bf954c0; 390x844 first-row
  bottoms 659 / 758 / 667 / 766 against 788; unit 1823; full e2e 210/0/26; verify 0;
  digest b07727b2.
- WP5-UX-FIX8-FREEZE attempt 1 stopped: the board listed two FIX7-FREEZE evidence files
  that were never written, so the validators failed (precommit clean, 393 staged).
  Board list corrected.
- Attempt 2 stopped on the validator: FIX8 listed the FIX REQUIRED audit B6 in
  depends_on. Removed; addresses_audit keeps the link.
- WP5-UX-FIX8-FREEZE attempt 3 done: 255ba17d6bf891c0ff779d4a4f518e0d2998cee8 on main,
  pushed (393 paths; digests b07727b2; every check exit 0).
- WP5-UX-REGATE6 PASS (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on
  255ba17 / b07727b2: unit 1823, full e2e 210/0/26, drill 208 PASS, image
  sha256:f36d083ee6dd37ab66c1d00a98398a18171264ebad17b170f1a9c85b25e83af4; fix scope 2
  paths (76 insertions, 0 deletions); B6-01 four states fit at 390x844; AX-01 0 hidden.
  Informational for B7: at 320 the switcher's select text is clipped; at 375/360/320 a
  share plus the zone note still exceeds the first screen (outside the 390x844 promise).
- B7 and A7 attempt 1 (2026-10-09) stopped at the subscription weekly usage limit; no
  record written. The owner asked to try again (2026-10-13).
- WP5-UX-AUDIT-A7 attempt 2 FIX REQUIRED (fresh opus): FIX8 changes no area-A
  behaviour (delta proof passes), but WP5-UX-A7-01 (Low, tests only, older than FIX8):
  `isolation.spec.ts` (and `shell.spec.ts:68`) seed a date outside the displayed period
  on 4 of every 14 days (Tuesday to Friday of each period's first week; now until
  2026-10-16 Los Angeles), so the mandatory isolation spec fails on every build then.
  A seed-date variant with unchanged assertions passes 6/6.
- WP5-UX-AUDIT-B7 attempt 2 FIX REQUIRED (fresh opus): B6-01 closed (first-row bottoms
  757.97 / 659.02 / 765.97 / 667.02 against 788), every bar-affected area-B item holds,
  no weakened assertion; the only blocker is WP5-UX-B7-01, the same test-date defect as
  A7-01 (6 e2e failures in the window, also on bf954c0). Optional risks R-B7-1 (select
  value clipped at 355-420 px after FIX8), R-B7-2..R-B7-4.
- Coordinator decision: one tests-only round WP5-UX-FIX9 with a deterministic window
  check; no product change; R-B7-1..R-B7-4 to the pilot fix backlog.
- WP5-UX-FIX9 done (self-reported claude-sonnet-5-5; reported, not independent proof):
  the displayed period is the one with the earliest payroll date on or after today; the
  old seed choice is wrong on the 4 days ending on each payroll date (P-3..P; A7's
  description). Isolation and shell specs now use
  `displayedSeedDay()`; new deterministic test `tests/domain/e2eSeedSelection.test.ts`
  (the old choice fails it); 5 test paths; specs 3x pass in the window; full e2e
  210/0/26; unit 1827; verify 0; digest 58b0deee.
- WP5-UX-FIX9-FREEZE done: 3670a6c3c22ddcf75138927ed60f4cd9bf02078d on main, pushed (374
  paths; digests 58b0deee; every check exit 0).
- WP5-UX-REGATE7 attempt 1 NOT VERIFIED only because the Docker engine was unreachable
  (drill --wp3 could not run). Everything else passed on 3670a6c / 58b0deee: full e2e
  210/0/26 inside the seed-date window (2026-10-13 13:04 Los Angeles), unit 1827, seed
  test fails on the old choice, new specs pass 3x, 230 dist files byte-identical to
  255ba17.
- Board was `blocked` on owner action WP5-UX-DOCKER (start Docker Desktop). The owner
  replied "tiếp tục nếu đang chạy dở" without confirming Docker; board back to
  `running`. REGATE7 attempt 2 (drill only) stopped at the engine check: client 28.5.1,
  the Docker Desktop Linux engine pipe is missing. Board `blocked` again on
  WP5-UX-DOCKER. Checkpoint commit WP5-UX-CKPT4 done:
  dc70ba65eb6c93925b3abe821829b76fc7e1f9da on main, pushed (100 handoff paths, digest
  58b0deee unchanged). Uncommitted afterwards: this update (+ vi), the board result and
  the CKPT4 results and evidence. The owner replied "Docker đã chạy" (Docker is running);
  board `running`. WP5-UX-REGATE7 attempt 3 (drill only): drill --wp3 208 PASS / 0
  FAIL, image sha256:52b45ad9774df69e0a116440bbd64d15fa114ad0273af6b063f08a8f7c61b590,
  cleanup verified; the whole gate PASS on 3670a6c / 58b0deee (NAS NOT VERIFIED).
  WP5-UX-AUDIT-AB8 (combined fresh opus) FIX REQUIRED: product byte-identical to
  255ba17, test strength and the seed rule PASS, AC-01 passes inside the window, B7-01 =
  A7-01 closed; but the full e2e has 3 failures (AB8-01, deadline tests after each due
  time) and a validated simulated-clock sweep found AB8-02 (free-day pool on
  2026-11-28..30), AB8-03 (holiday import across New Year) and AB8-04 (default import
  year from 2027-01-01). All test-only and pre-existing.
- Coordinator decision: one tests-only round WP5-UX-FIX10 (worker-high, sonnet) that
  also runs the simulated-clock sweep itself and fixes every calendar failure it shows.
  Then freeze, WP5-UX-REGATE8 (real clock plus the sweep) and a combined recheck AB9.
- WP5-UX-FIX10 done (self-reported claude-sonnet-5-5; reported, not independent proof):
  AB8-01 later deadline through the payroll-exception path when the displayed due has
  passed; AB8-02 seeded days released; AB8-03 import dates after the displayed period;
  AB8-04 client default import year. 8 test files, no new file. Sweep: 14 full runs on
  both projects with 0 failures (one transient ERR_NO_BUFFER_SPACE on 2027-01-19 passed on
  rerun); unit 1831; verify 0; digest 57e2974c.
- WP5-UX-FIX10-FREEZE done: 90b98efc395c3894a21a909b6d361eadc6fc2bd9 on main, pushed (106
  paths; digests 57e2974c; every check exit 0).
- WP5-UX-REGATE8 PASS (verifier, self-reported claude-sonnet-5-5; NAS NOT VERIFIED) on
  90b98ef / 57e2974c: real-clock e2e 210/0/26 at 22:20 Los Angeles after the displayed
  due; sweep 7 instants 0 failed; drill 208 PASS, image
  sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327; dist identical
  to 3670a6c; fix scope the 8 test paths.
- WP5-UX-AUDIT-AB9 PASS (combined fresh opus, self-reported claude-opus-5-5; no
  finding): dist byte-identical across 255ba17, 3670a6c and 90b98ef; test strength holds;
  the AB8-01 payroll-exception setup still proves the deadline automation, the docs/05
  activation rule and the automatic PDF; own sweep at 8 new instants (2026-2028) plus 2
  one-worker runs, all 210/0/26; real-clock e2e 210/0/26; AC-01 and AC-13 pass; AB8-01..04
  closed; optional R-AB9-1..6 to the pilot backlog. Board: A6, A5, A4, A3, A2 and
  WP5-RECHECK superseded_by AB9; current digest 57e2974c.
- WP5-UX-ACCEPT-DOCS done (light, self-reported claude-sonnet-5-5): pilot packet (EN/VI)
  refreshed to 90b98ef / 57e2974c / image dec7b485 / AB9, with dist/server byte-identical
  across 74d5bfe, 014bd47 and 90b98ef (only the client changed); WP5 handoff (EN/VI)
  re-acceptance section; parity and preflight pass; digest unchanged. The coordinator
  updated STATE (WP5 re-accepted on 90b98ef) and NEXT_ACTION (EN/VI).
- WP5-UX-ACCEPT done: aa3a7a02f04a059843d120f7372848709f816f69 on main, pushed (182
  handoff paths; digest 57e2974c unchanged; every check exit 0). **WP5 re-accepted on
  90b98ef; the UI change round is closed.** Board back to `software_ready`
  (next_task_id null). Uncommitted afterwards: that flip, the ACCEPT result and evidence,
  and this update (+ vi).
- Next (owner): review the pilot packet (release identity 90b98ef / 57e2974c), answer
  D-1..D-15 in chat, run the NAS steps, and decide on pilot authorization. Optional
  backlog for the pilot fix round: see the WP5 handoff. Housekeeping: delete the stray
  files `D:\raw-r07.txt` and `D:\canedit.txt`.
- Next: if both PASS, the WP5 re-accept (pilot packet identity refresh to 5e104e1 /
  07c3ca00 / image 218dd7cc…, docs/10 owner decision Q1, STATE, NEXT_ACTION, WP5
  handoff, accept commit).
- Next: FIX6-FREEZE, WP5-UX-REGATE4, fresh B5 and an area-A delta A5 (A2, A3, A4 and
  WP5-RECHECK superseded_by A5), then the WP5 re-accept. Docs/10 gets the Q1 owner
  decision in the re-accept docs task.
- Next action: if both PASS, the WP5 re-accept (pilot packet identity refresh to
  edaaa85 / b7bbcbc0 / image 1332b6d5…, STATE, NEXT_ACTION, WP5 handoff, accept commit);
  if area B fails again, an owner question instead of another loop.
- Next: WP5-UX-REGATE3, then fresh B4 and A4 (A2, A3 and WP5-RECHECK superseded_by A4).
  If area B fails again after this round, raise an owner question instead of looping.
- Next action: if both PASS, the WP5 re-accept: a docs task refreshes the pilot packet
  identity (EN+VI) to a2ea7a4 / 0b8428fd / image 410209b0…, then the coordinator updates
  STATE, NEXT_ACTION (+vi), the WP5 handoff (+vi) and the board, and the accept commit
  follows.
- Next action: FIX4-FREEZE, WP5-UX-REGATE2, fresh rechecks WP5-UX-AUDIT-B3 (area B) and
  WP5-UX-AUDIT-A3 (area-A delta); then A2 and WP5-RECHECK get superseded_by A3.
- Next action: if both PASS, the WP5 re-accept (STATE, NEXT_ACTION, WP5 handoff,
  pilot-packet identity refresh to 589bcff / 8c07aac5 / the new image, then the accept
  commit); otherwise another bounded fix round.
- Next action: on the FIX3 result, WP5-UX-FIX3-FREEZE; then WP5-UX-REGATE and fresh
  re-audits A2 and B2 (move WP5-RECHECK superseded_by to WP5-UX-AUDIT-A2).

- Active package and role: WP3 (fix round 1: regate and rechecks); coordinator. Actual
  model claude-opus-5-5 (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = fe67f9400e59ae7c10b9ac8871b4dea10b83860d (GOV-RECOVERY-ACCEPT, the closing commit; accepted WP5 source 014bd47, digest 150420e7). The board's final flip to `software_ready` and this line are uncommitted until the next commit.
    WP3 was accepted at b103923, on source 49651c8 with digest c31c300c…. The GOV-SKILL
    freeze is 3bdffbe.
    WP2 accept commit 3ead61e; accepted WP2 source 5fafeaee72509c6110a907458643bf7582dad81a.
  - Gate digest of record eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410
    (WP3-REGATE PASS on 2f2520e). The first WP3 gate digest was 96870f7e… (WP3-GATE on
    a1cd566); the WP2 gate digest was e61fa914… (WP2-GATE4).
  - Uncommitted (handoff only): the board, this checkpoint, the WP4-T01-FREEZE results
    and evidence, and the WP4-T02 brief.

    The gate digest of record is 0d513fca… (WP3-REGATE2 PASS).
  - No unpushed commits.
- Completed scope:
  - Governance: revision v2 accepted (WF-AUDIT3 PASS, `1a25275..6578df8`;
    [handoff](WORKFLOW_HANDOFF.md)); GOV-E8 accepted ([review](GOV_E8_REVIEW.md)).
  - WP1 accepted (recheck PASS at 68bbb31 / c6e24381; accept commit f32978f).
  - WP2 implemented and independently accepted:
    - tasks T01–T13 with CALFIX and the T09A/T09B split, each frozen (396b399 … 8fae685;
      the full list is on the board and in [WP2_HANDOFF](WP2_HANDOFF.md));
    - gate chain WP2-GATE (8fae685), GATE2 (f79413b), GATE3 (a3d1b65), GATE4 PASS on
      5fafeae: 613 tests, concurrency x20, fresh and WP1-upgrade migrations, e2e 74
      passed / 2 skipped with all 12 flows;
    - audit chain: WP2-AUDIT-A and -B FIX REQUIRED; fix rounds WP2-FIXA, WP2-FIXB (with
      addendum), WP2-FIXB2, WP2-FIXB3; WP2-AUDIT-B2 and -B3 FIX REQUIRED (all closed);
      final WP2-AUDIT-A2 attempt 3 PASS ([recheck A4](WP2_RECHECK_A4.md)) and WP2-AUDIT-B4
      PASS with no findings ([recheck B4](WP2_RECHECK_B4.md)), both on 5fafeae / e61fa914.
      A2 attempts 1–2 were invalidated by later source changes and stay in its history.
- Carried, non-blocking (recorded in STATE and WP2_HANDOFF):
  - R1 revision-specific correction keys; R2 policy note with leading space exported raw;
    R3 `calendar_in_use` reveals account data (accepted); R4 WP3 must persist the
    `CorrectionResult`/`DeficitDebitResult` pending variant and drop provisional minutes at
    finalization.
  - A3-01 hide `refreshed_pay_period` in any future admin audit view; A4-01 smoke port
    message; ADV-A-05; F1 (evidence-only); B4 optional items.
  - Owner option: prospective calendar reassignment (currently refused with 409, a
    reversible coordinator decision). Removing employee-derived holiday-preview counts is
    also a reversible coordinator decision.
  - Governance backlog for one later GOV cycle: check_recovery live-status inheritance (fix
    before software_ready), AGENTS.vi item 2, precommit limits, the evidence -whitespace
    note in docs/08.
- Runtime lessons (board `runtime_observations`): call Node 24 by full path; use the
  workflow Python for preflight; never write into the repo root or redirect to `nul`;
  committer briefs use no-print hygiene (no classifier denial since); a manual owner commit
  must use `git add -A` and the chat Commit description must equal the intended message.
- WP2-ACCREC (light) is done: the WP2_HANDOFF acceptance record (EN/VI), the corrected
  FR-13 preview line and updated figures; preflight 0 (author-reported).
- WP2-ACCEPT is done: commit 3ead61e pushed (137 handoff-only paths, all checks 0). WP2
  is accepted; the board's active package is WP3.
- WP3-PLAN (opus planner) is done ([plan](tasks/WP3-PLAN.md)): 16 tasks T00–T15 in three
  checkpoints, each frozen; WP3-GATE; two fresh opus area audits; accept commit. The
  coordinator adopted the plan and its routine defaults (board `coordinator_decisions`).
- Owner question pending (board `pending_owner_question`): F-1 deadline auto-submit of a
  period with no saved entries; F-2 pending deficit-debit lifecycle; F-3 admin operations
  status versus privacy; F-4 scope of `automation_active_from`; F-5 PDF total
  (clarification, proceeds unless the owner objects). Needed before T05 (F-2), T10 (F-1,
  F-4) and T13 (F-3); T00–T04 continue.
- WP3-T00 is done (author-reported): R2 CSV hardening (red 4, green 26/26, mutation
  caught) and the A4-01 smoke-port fix (free port when unset; FAIL line on every non-zero
  exit); verify 619 tests, 0 deprecation lines; digest 81567e53….
- WP3-T00-FREEZE is committed and pushed as db75346 (attempt 2, 23 paths, all checks 0).
  Attempt 1 stopped at the validator because the coordinator's WP2-ACCEPT board record
  lacked `branch`/`pushed`; nothing was committed then.
- WP3-T01 is done (author-reported): migration 0004 with 10 tables and
  `timesheets.imported_unverified`; a real 5fafeae database upgrades cleanly; capture by
  default, SMTP only with an owner-only flag; 69 tests green, 6/6 mutations caught; verify
  674 tests; digest 995e68c9…. The schema follows the F-2/F-4 recommendations; another
  owner choice needs a migration 0005.
- WP3-T01-FREEZE attempt 1 stopped: the precommit check blocked two synthetic
  user-profile path literals in tests/integration/config.test.ts. Nothing was committed.
- WP3-T01 attempt 2 is done (author-reported): a neutral synthetic root replaces the two
  literals; verify 674 tests; digest 3c6a10c1….
- WP3-T01-FREEZE is committed and pushed as ac5d0ba (attempt 2, 29 paths, all checks 0).
- WP3-T02 is done (author-reported): private file store, image check, signature upload
  (raw PNG/JPEG, 256 KiB route limit) and owner-only download; the JSON-only rule holds
  elsewhere; 14/14 mutations caught; verify 711 tests; digest 629e7d9d…. Carry to T08:
  `index.ts` must pass `dataDir` from the delivery config.
- WP3-T02-FREEZE is committed and pushed as b060d33 (28 paths, all checks 0).
- WP3-T03 is done (author-reported): email template engine, validated recipients,
  append-only submission settings with a per-user auto-submit effective instant, audited
  auto-image authorization, write-free preview; 18/18 mutations caught; verify 821 tests;
  digest 22acf6c4…. A mutation-script incident (one file truncated, rewritten, all runs
  repeated) is disclosed.
- WP3-T03-FREEZE is committed and pushed as 79862bb (32 paths, all checks 0).
- WP3-T04 is done (author-reported): canonical JSON and SHA-256, the review snapshot from
  the existing engine, a GET review route that writes nothing; 16/16 mutations caught;
  verify 878 tests; digest 69e790e0….
- Environment: the B: scratch drive had about 448 KB free; about 7.8 GB under
  B:\Temp\claude belongs to Claude sessions. Agents must not touch it; cleaning it is the
  owner's choice.
- WP3-TMPCLEAN is done: 28 unused project temp directories removed (about 14.9 MB); B:
  now has about 22 MB free and stays nearly full. Other large B:\Temp consumers (IDE and
  diagnostics folders) are the owner's choice.
- WP3-T04-FREEZE is committed and pushed as b89f8a8 (32 paths, all checks 0).
- Coordinator decision: WP3-T07 (PDF renderer) runs now, before T05/T06, because it
  depends only on T04 and T05 waits for the owner's F-2 answer.
- WP3-T07 is done (author-reported): deterministic pdf-lib renderer (14 dates, h:mm, OT
  total with both Sundays, Show OT toggle, Unicode font, bounded signature, pending
  banner); dependencies pdf-lib, fontkit, DejaVu fonts, dev pdfjs-dist (none deprecated;
  lockfile +20 packages); 14/14 mutations caught; verify 906 tests; digest 971e7843….
- WP3-T07-FREEZE attempt 1 stopped before staging: the digest was 3f4a016d…, not the
  worker-reported 971e7843…. Nothing was committed.
- WP3-T07-RECON is done: the worker edited a test after its digest; the current tree's
  digest 3f4a016d… is stable, the changed set is exactly T07's, verify passes (906 tests)
  and the precommit check is clean.
- WP3-T07-FREEZE is committed and pushed as c289375 (attempt 2; lockfile +20 packages,
  none removed; all checks 0).
- The owner answered F-1..F-5 on 2026-10-04 (verbatim in board `owner_decisions`): F-2,
  F-4 and F-5 as recommended; F-1 modified (empty periods auto-submit with default labels,
  OT not counted, the "employee review pending" notice off by default with a settings
  option, no deficit); F-3 modified (the admin sees everything except each person's
  timesheet details; individuals may share view-only or edit access to their timesheets).
  F-1 and F-3 change canonical rules; F-3 adds a sharing feature.
- WP3-REQ (opus planner) is done ([report](tasks/WP3-REQ.md)): exact EN/VI canonical
  drafts, a "timesheet details" table, the sharing specification (FR-17/AC-16, grants in
  migration 0006, an allowlisted `/api/shared/:ownerId` mount, an authorization matrix),
  the impact (delta task T07B for the notice setting; T06 posts a first credit for a day
  without an original) and a revised plan (WP3-DOC, T07B, T13D, T13A, T13B, T13C inside
  WP3; gate items 13–16). The coordinator adopted it subject to the owner's answers.
- Owner question pending (board `pending_owner_question`): F-Q1..F-Q6, needed before
  WP3-DOC (after the T06 freeze).
- WP3-T05 is done (author-reported): one IMMEDIATE sign-off transaction (hash/version
  409, input 422, signed revision with real signed_at, ledger posting through ledger.ts,
  every outcome persisted incl. F-2 pending lines, finalized_revision_no, job rows,
  audit; identical retry replays); race 20/20; 13/13 mutations caught; verify 930 tests;
  digest c380f302….
- WP3-T05-FREEZE is committed and pushed as 72f1920 (28 paths, all checks 0).
- WP3-T06 is done (author-reported): correction revisions (differences only,
  revision-specific keys, first credit for a day without an original, pending increases
  per F-2), R1, late review with zero delta and an explicit send choice, resend without
  ledger movement; 19/19 mutations caught; verify 959 tests; digest b47d30da….
- **Blocker:** WP3-T06-FREEZE attempt 1 stopped before any git command. The B: scratch
  drive (Claude Code agent temp, B:\Temp\claude) is full (0 MB), so every subagent shell
  call fails with ENOSPC. Nothing was staged or committed; the T06 source changes are in
  the working tree. Agents must not touch B:\Temp\claude and the coordinator has no
  shell: the owner must free space on B: or move the Claude Code temp directory.
- The owner answered F-Q1..F-Q5 (verbatim in board `owner_decisions`): F-Q1 (a); F-Q2
  overrides the recommendation (no automatic indicator on outgoing submissions, a full
  signature block, system-only tracking, plus user options for an editable note line
  and the signature image); F-Q3 (b) admin sees recipient addresses; F-Q4 (b) with
  per-item toggles; F-Q5 (a). F-Q6 needs a clearer question (WP2-A-01 stays meanwhile).
  The owner authorized a temporary work folder on D: (D:\timesheet-tmp, outside
  Dropbox). The coordinator interpretation is in board `coordinator_decisions`.
- WP3-T06-FREEZE is committed and pushed as 2f8011a (attempt 2, 23 paths, all checks 0;
  B: had space again). A recursive delete of its empty D: temp folder was denied and not
  retried; the folder stays.
- WP3-REQ2 is done ([addendum](tasks/WP3-REQ2.md)): the notice is replaced by an
  optional note line (default off, editable, default text "Automatic submission") and the
  existing auto-image authorization; the PDF origin labels go too; the manual PDF must
  print the stored signer name (a T07 defect fixed in T07B); revised T07B scope (also
  owns the pdfJob input mapping); sharing with three per-grant items; a doc-edit list of
  10 canonical docs in both languages, 4 prompts and the policy example.
- Owner question pending: G-Q1 (signature image default on automatic submissions) and
  G-Q2 ({SignOffStatus} wording); F-Q6 optional.
- WP3-T08 is done (author-reported): atomic claims with leases, retries 1/5/15/60 then
  intervention, runner and CLI, PDF job from the stored snapshot with signature-hash
  check, crash recovery tests, DATA_DIR wiring; 13/13 mutations caught; verify 980
  tests; digest 706c1619…. T09 must own `src/server/jobs/runner.ts` to register the send
  handler.
- WP3-T08-FREEZE is committed and pushed as 3d7a17c (25 paths, all checks 0).
- Coordinator decision: WP3-T09 runs now (it builds mail from the frozen snapshot, so
  G-Q1/G-Q2 do not affect it); WP3-DOC and T07B follow the owner's answers and precede
  T10.
- WP3-T09 is done (author-reported): deterministic message from the frozen snapshot and
  stored PDF; capture default; SMTP only with the owner flag (tested against a loopback
  sink); outcome classification with uncertain never retried; crash recovery; decision
  route; secrets absent everywhere; 4/4 mutations; verify 1005 tests; digest 5e7e6b40….
  Four reported deviations (index.ts/cli.ts one line each, an ot-api route line, the
  jobs-restart assertions for the now-registered send job). Audit notes: a send claimed
  before its PDF consumes a job attempt; a TLS verification failure is temporary.
- WP3-T09-FREEZE is committed and pushed as 0a26afa (32 paths, lockfile +6, all checks
  0).
- Coordinator decision: WP3-T10 runs now (F-1/F-4 decided; G-Q1/G-Q2 only affect T07B's
  presentation). T11/T12 may also precede WP3-DOC; T13 waits for WP3-DOC and T07B.
- WP3-T10 is done (author-reported): eligibility re-checked in the transaction;
  automatic finalization (empty periods with default labels, zero OT, no deficit);
  overdue record when switched off; bounded chronological recovery; races always one
  revision/ledger set/send; audited admin activation route refusing past instants; 12/12
  mutations; verify 1038 tests; digest 5f16dab1…. Finding for T07B: the snapshot
  hardcodes "Signed by employee" for every revision (G-Q2).
- WP3-T10-FREEZE is committed and pushed as 0321be6 (26 paths, all checks 0).
- WP3-T11 is done (author-reported): reminders (24 h/2 h or saved offsets), overdue
  warning, outcome notice to the employee only; dedupe and collapse; DST-safe offsets;
  login-required links; 16/16 mutations; verify 1095 tests; digest e7f00cd0…. Carry
  items: a zero-byte attachment.pdf in reminder captures (fix later); a possible repeated
  reminder after a crash on real SMTP (documented limitation).
- WP3-T11-FREEZE is committed and pushed as c3d32b9 (21 paths, all checks 0).
- WP3-T12 is done (author-reported): review screen, stale handling, deep link, header
  badges; literal scan 0; 8/8 mutations; e2e 93 passed/3 skipped; verify 1135 tests;
  digest 160bb78c…. Carry item for T13: status in the grid (its parent was not owned).
- WP3-T12-FREEZE is committed and pushed as 8e2c2bf (49 paths, 6 screenshots viewed, all
  checks 0).
- WP3-T13D is done (author-reported): allowlisted admin operations/submission status
  with recipient addresses (F-3, F-Q3 (b)), admin UI, key-path leak test, isolation
  inventory; e2e 97 passed; 8/8 mutations; verify 1150 tests; digest 321cc6a0…. Carry
  item (assigned to T13A): pass the delivery config through AppDeps instead of reading
  process.env.
- WP3-T13D-FREEZE is committed and pushed as 19723b6 (34 paths, 4 screenshots viewed, all
  checks 0).
- WP3-T13A is done (author-reported): actor/subject seam, router factories, separate
  audit actor/owner, delivery config through AppDeps; 63-route inventory identical; tests
  1150 → 1164; 6/6 mutations; verify 0; digest 0edefc94…. Its single e2e run had 2
  mobile failures on `net::ERR_NO_BUFFER_SPACE` (environmental; targeted rerun passed).
- WP3-T13A-FREEZE is committed and pushed as c1e4bb2 (34 paths, all checks 0).
- WP3-E2E-RECHECK is done: full e2e on c1e4bb2 exit 0 (97 passed, 3 skipped, 0 failed);
  the T13A failures were environmental.
- WP3-REC1 is committed and pushed as 632092d (8 handoff-only paths, all checks 0).
- The owner answered G-Q1 (b) and G-Q2 (a) (board `owner_decisions`): the signature
  upload asks for the auto-image authorization pre-selected (one explicit, audited act);
  `{SignOffStatus}` is "Submitted" for both origins, or the note text when the note line
  is on. The WP3-DOC and T07B briefs carry the answers.
- WP3-DOC is done (author-reported): 30 edits per language in docs 01–07, 09, 10; the WP3
  prompt gate lines; the policy example; parity table; preflight 0; verify 1164 tests;
  digest 4d4c4863….
- Governance split (coordinator decision): `handoff/prompts/` is a governance path, so
  WP3-DOC-FREEZE commits only the docs and the policy example; the four WP3 prompt files
  go through GOV-WP3P-FREEZE, GOV-WP3P-GATE and a fresh GOV-WP3P-AUDIT before T07B.
- WP3-DOC-FREEZE is committed and pushed as cb9800e (32 paths; the four prompt files
  stayed unstaged; all checks 0).
- GOV-WP3P-FREEZE is committed and pushed as da6d0cd (13 paths incl. the four WP3 prompt
  files; all checks 0).
- GOV-WP3P-GATE PASS on da6d0cd (diff limited to the four prompt files; mirror of docs/09
  confirmed EN and VI; validators, verify and digest unchanged).
- GOV-WP3P-AUDIT PASS (fresh opus, no findings; [review](GOV_WP3P_REVIEW.md)); accepted
  range cb9800e..da6d0cd. Optional notes R1–R3 added to the governance backlog.
- WP3-T07B is done (author-reported): migration 0005 note fields, audited note settings,
  upload-time consent (`authorize_auto_image`, one transaction; 422 without saved
  settings — carried to T13), snapshot v2, "Submitted"/note status, no automatic
  indicator, stored signer name on manual PDFs; 19/19 mutations; verify 1232 tests;
  digest 5e37ab98….
- WP3-T07B-FREEZE is committed and pushed as 943027b (56 paths incl. the GOV-WP3P
  records; all checks 0).
- WP3-T13 is done (author-reported): owner-only PDF download, history and delivery UI,
  settings with note line and image authorization, signature upload with pre-selected
  consent (422 handled), grid status; 16/16 mutations; e2e 111 passed; verify 1292 tests;
  digest 7b04f0b1…. Carry items: a revision-list route (added to the T13B brief); a
  capture sender in the e2e harness and the deadline-automation e2e (T14); the 404 of
  `GET /api/signatures/current` without a signature (later fix).
- WP3-T13-FREEZE is committed and pushed as 5b90d30 (57 paths, 6 screenshots viewed, all
  checks 0).
- WP3-T13B is done (author-reported): migration 0006 shares with per-item columns,
  `/api/shares` (audited, rate-limited unknown-grantee 422), admin list/revoke, the
  allowlisted `/api/shared/:ownerId` mount (17 routes, live check and in-transaction
  re-check), `GET /api/revisions`, grantee attribution in history; matrix 11 × 17 plus 31
  never-shared paths; 10/10 mutations; e2e 111 passed; verify 1356 tests; digest
  f3df3b86….
- WP3-T13B-FREEZE is committed and pushed as c3c35de (attempt 2; attempt 1 was blocked by
  email addresses in an evidence log, 7 masked as `<email>`; all checks 0).
- WP3-T13C is done (author-reported): sharing settings with per-item switches and the PDF
  note, shared-with-me switcher and owner bar, shared views with absent disallowed
  actions, history from the revision list with grantee names, signatures/current 200
  null; e2e 119 passed; 11/11 mutations; verify 1383 tests; digest 9b8d6b26…. Carry item:
  raw operation names in the history for unknown operations.
- WP3-T13C-FREEZE is committed and pushed as 8ad2e4f (attempt 2; attempt 1 stopped on
  TimesheetScreen.tsx missing from the worker's list, included once the digest matched;
  72 paths; all checks 0).
- WP3-T14 is done (author-reported): capture sender and synthetic signature in the seed
  and e2e fixture, capture fix for attachment-less messages, smoke additions, e2e 127
  passed (submission, automation, pdf-visual), five PDF renders viewed, gate mapping;
  verify 1384 tests; digest 677b9142….
- WP3-T14-FREEZE is committed and pushed as b083739 (attempt 2; attempt 1 stopped at
  preflight on a broken link in the WP3-GATE brief, fixed by the coordinator; 42 paths;
  all checks 0; 8 synthetic images viewed).
- WP3-T15 is done (author-reported): WP3_HANDOFF (EN/VI), README and DEVELOPMENT (EN/VI)
  for jobs, capture, the production flag, activation, sharing and MAIL_FROM;
  package.json description; parity ok; preflight 0; verify 0 with 1384 tests; digest
  96870f7e…. Observation for the gate: the T14 record says 46 smoke checks, its log
  shows 40.
- WP3-T15-FREEZE is committed and pushed as a1cd566, the WP3 package-final freeze
  (attempt 1; 25 planned paths plus the committer's two own evidence files, a harmless
  deviation outside the digest; all checks 0; no secret or real address in the docs).
- WP3-GATE PASS on a1cd566 (all 16 items; verifier-reported):
  - verify 0 with 1384 tests; smoke 40 PASS (the T14 record's 46 was wrong);
  - e2e 127 passed, 5 skipped, 0 failed;
  - races 20/20 each; fault injection passes;
  - migrations fresh and upgraded from 5fafeae; validators 0;
  - diff scope clean.

  The coordinator stopped the agent after hand-back (leftover background work).
- WP3-AUDIT-B: FIX REQUIRED (fresh opus auditor):
  - WP3-B-01 (Medium): an account created after activation, with no saved settings,
    gets every already-overdue period auto-finalized; bound by `users.created_at`.
  - WP3-B-02 (Low): a crash during the final send attempt leaves it `sending` with no
    owner decision; recover interrupted sends in every runner pass.
  - WP3-B-03 (Low): History labels system auto-finalize as "someone else" and shows raw
    operation codes.
  - The other carry items are acceptable backlog.
- WP3-AUDIT-A: NOT VERIFIED, procedural only, with no finding. Every functional check
  passed (races, crash, HTTP, PDF, migrations, privacy). The classifier refused its
  digest command after it tried to stop an interactive cmd.exe it had opened by mistake.
  The coordinator does not rerun the refused command through another agent. A fresh
  area-A recheck binds its own digest on the fix-round freeze.
- WP3-AUDIT-C: FIX REQUIRED (fresh opus auditor). Sharing authorization held under every
  probe: 88 inventory entries, 17 shared routes, 11 item sets, the race window proven,
  disallowed UI actions absent.
  - WP3-C-01 (Medium): the planned owner review hint "changed by <grantee>" is missing.
  - WP3-C-02 (Low): History attributes admin-route or same-second acts to a grantee.
  - WP3-C-03 (Info): a stale comment.
  - The full preflight fails on directory links in WP3_REVIEW_A/B.
- Fix round 1 (coordinator decision 2026-10-05), in sequence:
  1. WP3-LINKFIX (light): done at attempt 2, preflight 0. Attempt 1 failed on the
     coordinator's own example links in the brief.
  2. WP3-FIXB (B-01..03): done (author-reported). Fixes:
     - B-01: automation starts at account creation;
     - B-02: recover interrupted sends in every pass;
     - B-03: plain operation names and a system badge.

     Results: red 8 → green; verify 1391 tests; e2e 127 passed; digest d9fa55bd….
     Deviations: HistoryScreen.tsx, and one changed assertion in delivery-crash.test.ts
     (to be judged by the recheck).
  3. WP3-FIXC (C-01..03): done (author-reported).
     - C-01: the owner-only hint, derived from the audit and kept outside the hash and
       the PDF.
     - C-02: an act is attributed to a grantee only when the actor is not the owner and
       the operation is a shared-route operation. No migration was added.
     - C-03: the comment is fixed.
     - Checks: verify 1407 tests; e2e 127 passed; digest eeb417d3….
     - Deviations for the recheck: the operation-based rule; a grantee leaving a share
       is now unattributed; a replaced test.
     - WP3-FIX-FREEZE is committed and pushed as 2f2520e (attempt 3; 177 paths; all
       checks 0; 6 synthetic images viewed). Attempts 1 and 2 stopped on validator rules
       that the coordinator's records broke: prose in the audit decisions, and
       WP3-LINKFIX depending on non-PASS audits.
     - WP3-REGATE: PASS on 2f2520e, items 1–18 (verifier-reported):
       - 1407 tests; smoke 40; e2e 127 passed;
       - races 20/20 each; fault injection; migrations to v6;
       - regression tests named per finding;
       - fix scope exactly the FIXB/FIXC paths.
     - WP3-RECHECK-BC: FIX REQUIRED (fresh opus auditor).
       - B-01, B-02, C-01, C-02 and C-03 are fixed (regression tests fail on a1cd566);
         B-03 is partly fixed.
       - New findings, both Low: WP3-RBC-01 (the actor-less automatic OT credit shows
         "by someone else") and WP3-RBC-02 (with no owner finalization, the hint misses
         grantee changes made before the period start).
       - The FIXB/FIXC deviations are accepted. A recorded share marker is needed
         before WP4.
       - Risks: never-configured accounts are auto-finalized and fail with
         recipient_missing; docs/05 lacks the creation bound.
     - Owner question H-Q1 is pending: automatic submission for never-configured
       accounts.
     - WP3-RECHECK-A: PASS on 2f2520e with no finding (fresh opus auditor). The digest
       was bound at the first and last commands.
       - Area A probes: race twice, crash twice, HTTP 70, hint 7, PDF 34, migrations 26.
       - The fix round has no effect on area A.
       - Risks R1–R7 remain risks.
       - Because the validator requires every WP3 PASS to match the current digest, a
         digest-bound area-A delta recheck (attempt 2) follows fix round 2.
     - The owner answered H-Q1 with (a) on 2026-10-05. Automatic submission applies only
       after the account saved its submission settings with auto-submit on. By default,
       periods due before setup are not submitted; the explicit apply-to-overdue choice
       stays.
     - WP3-FIX2 is blocked: attempt 1 is PARTIAL. The work itself is reported done:
       - RBC-01, RBC-02, the sending-branch test and H-Q1 (a);
       - docs/05 and docs/10 EN/VI; the HANDOFF;
       - preflight 0; e2e 127 passed; verify 1416 tests; digest 0d513fca….

       The permission check denied the Bash loop that masked the evidence and removed
       six `.raw` logs. Those six logs remain unmasked in evidence/WP3-FIX2/ and must
       not be committed.
     - The owner answered H-Q2 with (a): mask the six logs, then delete exactly those
       six `.raw` files, one literal path at a time. The owner also moved the temporary
       folder to `D:\.claude-tmp\timesheet\<task>`.
     - WP3-TMPMOVE is done: `D:\timesheet-tmp` was moved to `D:\.claude-tmp\timesheet`
       with one literal rename. All 46 directories are present; nothing was deleted.
     - WP3-FIX2 is done at attempt 2. It masked the six logs, deleted the six named
       `.raw` files one literal path at a time, and the evidence precommit found 0
       findings. Verify passed with 1416 tests; the digest is still 0d513fca….
     - WP3-FIX2-FREEZE is committed and pushed as 2d72d35 (158 paths; all checks 0; 6
       synthetic images; no `.raw` file). The freeze brief itself was left unstaged; it
       goes into the next handoff commit.
     - WP3-REGATE2: PASS on 2d72d35, items 1–19 (verifier-reported).
       - Tests: 1416; smoke 40; e2e 127 passed.
       - Robustness: races 20/20 each; fault injection; migrations to v6.
       - Round-2 and H-Q1 tests named.
       - Fix scope limited to the FIX2 paths and docs 05/10.
       - Docs: parity ok; D-09 unchanged.
       - Validators: 0 in the project folder.
       - Gate digest of record: 0d513fca….
     - WP3-RECHECK-A attempt 2: PASS on 2d72d35 with no finding (fresh opus auditor;
       digest 0d513fca… bound first and last).
       - Delta of 18 paths; the area-A core and the database layer are unchanged.
       - Reruns: race twice and a new first-save race; crash; HTTP 84; hint 12; PDF 34;
         migrations 30.
       - The H-Q1 differential leaves configured accounts byte-identical.
       - R3 is closed. New Info risks: R8 (before-due reminders reach never-configured
         accounts) and R9 (seed events show as automatic).
     - WP3-RECHECK-BC2: FIX REQUIRED (fresh opus auditor).
       - RBC-01, RBC-02, the sending-branch test and H-Q1 (a) are correct; docs are in
         parity; no regression in areas B or C.
       - WP3-RBC2-01 (Low, test-only): two deadline tests now use never-configured
         accounts. As a result, the F-4 scan guard and the imported-period exclusion are
         untested: mutations M4, M5 and M5b pass the whole suite. Production behaviour
         is correct.
     - Fix round 3 (coordinator decision 2026-10-05):
       1. WP3-FIX3, a test-only change: restore those guards' coverage, prove it by
          mutation in a scratch clone, and cover the other untested skips.
       2. WP3-FIX3-FREEZE.
       3. WP3-REGATE3.
       4. One fresh auditor for WP3-RECHECK-BC3 and WP3-RECHECK-A attempt 3 (rebinding
          area A).
       5. WP3-ACCREC and WP3-ACCEPT.
     - WP3-FIX3 is done (author-reported), test-only.
       - The guard tests use configured accounts again; the off switch is saved before
         the deadline.
       - A guard sweep adds 3 tests.
       - Mutations M4, M5, M5b and the three skips each fail; the clean run passes.
       - verify: 1420 tests; digest c31c300c….
     - WP3-FIX3-FREEZE is committed and pushed as 49651c8. It holds 142 paths, including
       its own brief and the WP3-FIX2-FREEZE brief. All checks returned 0; one EOF
       blank line was fixed, which the brief allows.
     - WP3-REGATE3 attempt 1 (verifier) on 49651c8.
       - Every source item passed: 1420 tests; smoke 40; e2e 127 passed; races 20/20;
         migrations clean.
       - The round-3 guard tests are named; mutations M4, M5 and M5b each fail.
       - The round-3 scope is the test file only.
       - Item 12 failed on the live tree only. The cause is a record gap: the
         committer's untracked evidence `WP3-FIX3-FREEZE/result.md` lacks a `.vi.md`
         pair. The committed export passes.
       - The gate is blocked until the record gap is fixed.
     - WP3-RECFIX is done. It renamed that file to `.txt` with one literal-path move
       and deleted nothing; the live preflight now exits 0.
     - WP3-REGATE3: PASS. Attempt 2 reran item 12; all three validators exit 0 on the
       live board. HEAD is 49651c8 and the gate digest of record is c31c300c….
     - The owner answered H-Q3 with (a): keep the `readme-md` skill in the repository,
       through a GOV cycle. Order:
       1. WP3 acceptance on digest c31c300c… first. WP3-ACCEPT leaves the three skill
          files unstaged and checks the ls-tree digest.
       2. Then GOV-SKILL-FREEZE, GOV-SKILL-GATE and a fresh GOV-SKILL-AUDIT. Their
          briefs are ready.
       3. WP4-PLAN may run beside the GOV gate or audit, never beside the freeze.
     - WP3-RECHECK-BC3 and WP3-RECHECK-A attempt 3: both PASS on 49651c8, with no
       finding (one fresh opus auditor).
       - Mutations M4, M5 and M5b now fail the suite. The guard sweep is covered except
         for two single-guard edges, recorded as risks.
       - The test quality is meaningful.
       - No B/C regression; the area-A delta is test-only.
       - The coordinator stopped the auditor's idle shell and the agent after hand-back.
     - **WP3 review chain closed with PASS at 49651c8, digest c31c300c….**
     - WP3-ACCREC is done.
       - The WP3_HANDOFF acceptance record is filled in, EN and VI in parity.
       - Corrected figures: smoke 40, 1420 tests, e2e 127, and the freeze list.
       - Carry items R1–R9 and the WP4 carry-forward are listed.
       - Preflight 0.
     - STATE now marks WP3 passed with its carried risks. The active package stays WP3
       until after the accept commit, because the validator allows running tasks only
       in the active package or GOV. NEXT_ACTION (EN/VI) points to GOV-SKILL and WP4.
     - **WP3-ACCEPT is committed and pushed as b103923.** It holds 92 handoff paths;
       the ls-tree digest c31c300c… matched, and all checks returned 0. The three owner
       skill files were left untracked. **WP3 is accepted.**
     - The board and STATE now name WP4 as the active package (phase
       wp4-planning-gov-skill). WP4-PLAN is pending.
     - GOV-SKILL-FREEZE is committed and pushed as 3bdffbe: 19 paths, including the
       three owner skill files. The new digest, which includes the skill, is
       aab8b32c…; all checks returned 0.
     - GOV-SKILL-GATE: PASS, 7/7.
       - The scope is only the three skill files, and the frontmatter is valid.
       - Hygiene is clean, and verify passes 1420 tests.
       - Validators exit 0.
       - The digest of record is aab8b32c…; compared with c31c300c… it adds only the
         three skill files.
     - WP4-PLAN is done (opus) and adopted by coordinator decision:
       - 14 tasks: T01–T07, WP4-DEC, T08–T13;
       - then WP4-GATE and two area audits;
       - about 33 dispatches, or 37–41 with fix rounds.

       Docker 28.5.1 is present on this machine; Podman is absent.
     - Owner questions WP4-F-1..F-6 are pending; F-7 is for awareness and belongs to
       WP5. T01–T06 do not need the answers.
     - GOV-SKILL-AUDIT: FIX REQUIRED (fresh opus auditor, 3bdffbe).
       - GOV-SKILL-01 (Medium): the write path at SKILL.md:267 points outside the
         repository.
       - GOV-SKILL-02 (Low): markdown.md:142 gives a wrong location rule.
       - GOV-SKILL-03 (Medium): the source and licence are not recorded (likely
         LisaHQ/lisa-skills); skills-lock.json has no entry.
       - GOV-SKILL-04 (Low): it suggests an obsolete `align` attribute.
       - N1 suggests one AGENTS.md line.

       These are put to the owner as questions Q1–Q4, because the skill is the owner's
       content. A GOV fix cycle follows the answers.
     - WP4-T01 is done (author-reported):
       - changes: trusted-proxy resolver, absolute-path production config, `/api/ready`
         returning allowlisted keys, `.env.example`, smoke;
       - tests: red 23 → green 83; the mutation fails 2 tests;
       - e2e 127 passed; verify 1449 tests; digest 1c57dbae…;
       - deviation: one line in the sharing-matrix inventory.
     - WP4-T01-FREEZE is committed and pushed as a1dc01b (50 paths; digest 1c57dbae…;
       all checks 0).
     - WP4-T02 is done (author-reported):
       - migration 0007 adds `via_share_id` with an owner-to-actor trigger;
       - the marker is recorded on every shared write and on the PDF audit;
       - a HEAD request writes no audit, and legacy rows keep the inference;
       - tests: red 23 → green 136; 4 mutations are killed;
       - verify: 1469 tests; digest d6f223a7….

       Deviations: `http/auth.ts` and `routes/api.ts` were also edited. docs/03 should
       mention the marker; this is carried to WP4-DEC.
     - WP4-T02-FREEZE attempt 1 made no commit. The coordinator wrote the WP4-T03 brief
       during the run and asked for it to be staged; a permission check denied that
       bundled `git add`. The call is not retried.
     - WP4-T02-FREEZE is committed and pushed as 37f1be2 (attempt 2; 33 paths; all checks
       0; `WP4-T03.md` left untracked for the next freeze).
     - WP4-T03 is done (author-reported):
       - changes: migration 0008, the bootstrap service, CLI `bootstrap` plus
         `--new-token`, setup GET and POST (a generic 403 for every refusal), Setup
         screen;
       - tests: 24 tests, red then green; the mutation is killed; migrations to v8;
       - e2e 129 passed; verify 1494 tests; digest 8a316cc0….

       Follow-ups: docs/07, docs/03 and DEVELOPMENT.md, carried to WP4-DEC and T13.
     - WP4-T03-FREEZE is committed and pushed as 199e792 (35 paths; all checks 0; the
       screenshots and the token scan are clean).
     - WP4-T04 is done (author-reported).
       - Image: node:24.21.0-trixie-slim pinned by digest; 105 MiB; UID 10001.
       - Drill stage 1: healthy in 5.4 s, schema 8/8, read-only root; the data survived
         a restart.
       - Checks: 0 forbidden files; 0 deprecation lines; verify 1494 tests.
       - Digest: 6ec6549d….
       - Two local images (`:drill`, `:arm64-emulated`) are left in place. The arm64 build
         was under emulation only.
     - WP4-T04-FREEZE is committed and pushed as 3b2ddf2 (21 paths; all checks 0).
     - WP4-T05 is done (author-reported, opus).
       - Design: one online-backup step, no pause; every file is hashed and checked
         against its recorded hash.
       - Tests: red 9 → green 9; both mutations are killed.
       - Migrations: through v9.
       - Drill stage 2: backup in 348 ms while writes continued; all hashes match.
       - verify: 1503 tests. Digest: 724d5cd8….
       - Backup status is not yet in the admin status response; this moves to T07.
     - WP4-T05-FREEZE is committed and pushed as 0c58130 (27 paths; all checks 0).
     - WP4-T06 attempt 1 is done (opus).
       - The pause, restore and resume work.
       - Tests went red 17 → green 29; the mutation fails 4 tests; AC-08 passes 47/47.
       - Drill stages 1–3 pass 90/0; verify passes 1523 tests.
       - The worker flagged one problem: queued sends from the backup go out after
         resume, which breaks docs/07:30 and :32.
     - Coordinator decision: hold those sends at restore until an explicit, audited
       release or drop.
     - WP4-T06 attempt 2 is done.
       - Restore now holds queued and leased sends from the backup. `outbound release`
         and `outbound drop` (reminders only) are audited, and `--confirm` must be passed
         to act; without it they only preview.
       - Tests: red 5 → green 31; the mutation fails 4 tests.
       - Drill: 105/0, including a second-generation restore.
       - verify: 1525 tests; digest 15b7422e….
       - Risk for the audit: a send that the source already delivered stays held. It can
         only be released or left held.
     - WP4-T06-FREEZE is committed and pushed as 72ab2ed (39 paths; all checks 0).
     - The coordinator split WP4-T07 because F-3 and F-4 are still unanswered.
       - The F-3 flag and F-4 retention go to WP4-T07B, after the owner answers.
       - WP4-T07 is done (author-reported):
         - status fields for backup, disk and outbound, with an exact allowlist;
         - a daily orphan sweep keyed by day that removes only unreferenced files older
           than 24 h;
         - the status UI on E-8 tokens;
         - tests: red 13 → green; the mutation fails 2 tests;
         - e2e: 131 passed; verify: 1545 tests; digest cc86af8a….

         Job-claim expectations in three tests changed to include the sweep; the audit
         will judge whether that weakens them.
     - WP4-T07-FREEZE is committed and pushed as e1d97bd (31 paths; all checks 0).
     - Coordinator decision: T08 does not depend on F-1..F-3, so it runs before WP4-DEC.
     - WP4-T08 is done (author-reported).
       - Dependencies: two new ones, with no deprecation.
       - The reader enforces limits on real inflated output and rejects
         DOCTYPE/ENTITY and macros.
       - The README defects are detected.
       - Tests: 28, red-first; 6 mutations are killed.
       - The template hash is unchanged.
       - Verify: 1573 tests. Digest: 6fcd692d….
     - WP4-T08-FREEZE attempt 1 made no commit. `git diff --cached --check` flagged a
       blank line at EOF in `src/server/import/xlsxReader.ts`, a source file the
       committer may not fix.
     - WP4-T08 attempt 2 removed the one EOF blank line; verify passes 1573 tests and
       the new digest is d70a03c2….
     - WP4-T08-FREEZE attempt 2 committed and pushed dd1422f (25 paths; all checks 0).
     - Coordinator decision: split WP4-T12.
       - WP4-T12A runs now: drill stages 4–5 (upgrade of a WP3 v6 DB, old-binary
         refusal, paired rollback restore with no automatic resend) and the upgrade test.
       - Stage 6 (import no-op) and a full drill rerun stay in WP4-T12 after T09–T11.
     - WP4-T12A is done (author-reported).
       - Stage 4 upgrades a WP3 schema-6 DB to the latest schema once.
       - Stage 5: the old binary refuses the upgraded DB. A new
         `restore --keep-schema --confirm` restores the paired backup and holds the sends
         it contains. The old server then makes 0 send attempts; a control copy without
         the hold does send.
       - Tests: 10 + 6, red-first; 3 mutations killed.
       - Drill stages 1–5: 165 PASS. Verify: 1589 tests. Digest: e6bb47fd….
       - Residual limit, carried to the T13 runbook and the audit: after a rollback the
         old schema cannot hold jobs created later, so the old build must run with
         `JOB_RUNNER=off` until reconciliation.
     - WP4-T12A-FREEZE committed and pushed 0f989e4 (25 paths; all checks 0).
     - Every WP4 task that does not depend on F-1..F-6 is now done and committed.
     - The owner answered F-1..F-6, all as recommended, on 2026-10-05; the answers are in
       the board's `owner_decisions`.
     - The owner asked why the readme-md skill fix appears here. The coordinator
       explained where it comes from (H-Q3 (a) and GOV-SKILL-AUDIT). The owner then
       chose B: remove the skill from the repository, which reverses H-Q3 (a). The
       GOV-SKILL-REMOVE cycle follows WP4-DEC-FREEZE.
     - WP4-DEC is done (author-reported).
       - docs/03 has a new section for F-1..F-4.
       - docs/07 lines 9, 26, 32 and 46 cover F-6, F-5, the held sends and
         `JOB_RUNNER=off`, and F-1..F-3.
       - docs/10 records the owner and coordinator decisions.
       - No contradiction; parity holds; preflight 0. Digest: 65247d70….
       - Deviation: the worker launched `npm run digest` through cmd.exe. It hung, and
         the coordinator stopped it.
     - WP4-DEC-FREEZE committed and pushed e5576de (18 paths; all checks 0).
     - GOV-SKILL-REMOVE is done (author-reported).
       - The three skill files and their two empty folders are deleted.
       - No reference remains outside handoff/; preflight 0.
       - The digest could not be computed while the index still lists the deleted
         files. The committer stages the deletions first, then computes it.
     - GOV-SKILL-REMOVE-FREEZE committed and pushed a923351 (13 paths; three deletions;
       digest fcd8fe1e…, 750 files; all checks 0).
     - GOV-SKILL-REMOVE-GATE: PASS (7/7).
       - Exactly three deletions; no residual reference outside handoff/.
       - Clean-export verify: 1589 tests, 0 deprecation lines.
       - Validators 0.
       - Digest of record fcd8fe1e… (750 files), equal to the committer's figure.
     - GOV-SKILL-REMOVE-AUDIT: PASS with no findings (fresh opus auditor; review
       GOV_SKILL_REMOVE_REVIEW.md).
       - GOV-SKILL-01..04 and N1 are closed.
       - Note R1 for the owner: the removed files stay in public history. Removing them
         would need a history rewrite, which docs/08 forbids.
       - The board's current source digest is now fcd8fe1e… (R3).
     - GOV-SKILL-REMOVE-ACCEPT committed and pushed c398cab (27 handoff paths; all checks
       0). The GOV readme-md removal is closed.
     - WP4-T07B is done (author-reported).
       - F-3: `not_set_up` reuses the H-Q1 (a) `hasSavedSettings` condition; the UI
         shows a badge.
       - F-4: migration 0011 adds a narrow trigger exception, opened only through a
         single-row retention window, and a daily `job_retention` job.
       - Tests: 18 new; the mutation fails 2. e2e: 133 passed. Verify: 1613 tests.
         Digest: 7fe65713….
       - Deviations: mechanical count and key pins. The automation.spec job caps were
         raised (1 to 2, 2 to 4); the audit should judge this.
     - WP4-T07B-FREEZE committed and pushed 641ca10 (41 paths; all checks 0). The
       board's current source digest is 7fe65713….
     - WP4-T05B is done (author-reported).
       - Rule: 7 UTC days, 4 ISO weeks and 6 UTC months, plus the newest backup.
       - Only tool folders with a matching manifest are candidates.
       - Prune runs only after a verified backup; a dry run exists; any target escape
         refuses the whole run.
       - Tests: 21; the mutation fails 1. Verify: 1625 tests. Digest: 57be8442….
       - The prune status is not recorded, because that would need a migration.
     - WP4-T05B-FREEZE committed and pushed 6fecd88 (20 paths; all checks 0). The
       board's current source digest is 57be8442….
     - WP4-T09 is done (author-reported, opus).
       - Migration 0012 adds `imports`.
       - Import is owner only, with an idempotent preview and commit.
       - Only new, ended, in-calendar periods are importable. Every listed day needs a
         decision.
       - Imported periods answer 409 for sign-off, correction and edits, and are never
         automated.
       - Tests: 21; 5 mutations caught. Verify: 1646 tests. Digest: 65f38459….
       - Open owner choices I-1..I-3 are asked; the safe defaults stand.
       - Follow-ups:
         - WP4-T09B: backups do not include import sources yet;
         - WP4-T10: refuse OT leave use in imported periods;
         - WP4-T11: expose `imported_unverified` to the client.
     - WP4-T09-FREEZE committed and pushed a679787 (32 paths; all checks 0). The board's
       current source digest is 65f38459….
     - WP4-T09B is done (author-reported).
       - Backup and restore now include import sources, with hash and size checks,
         when the `imports` table exists.
       - An old manifest without imports rows restores. With imports rows it is
         refused, and a tampered source is refused.
       - Tests: 6 red, 57 green; the mutation fails 4. Verify: 1655 tests. Digest:
         b8db09bd….
     - WP4-T09B-FREEZE committed and pushed 1b4d817 (21 paths; all checks 0). The
       board's current source digest is b8db09bd….
     - WP4-T10 is done (author-reported, opus).
       - Migration 0013 rebuilds `ot_ledger` with the `opening_balance` type, by the
         12-step procedure.
       - `migrate()` now turns foreign keys off around the transaction and runs
         `foreign_key_check` before COMMIT, because `defer_foreign_keys` alone failed.
         The audit must judge this change.
       - The owner-only routes GET, POST and PUT are idempotent; a correction needs a
         reason.
       - OT leave use in an imported period answers 409.
       - Tests: 26 red-first; the mutation fails 4. Verify: 1673 tests. Digest:
         260ca363….
       - Open owner question I-4: a correction to 0 is refused.
     - WP4-T10-FREEZE committed and pushed aff904a (34 paths; all checks 0). The board's
       current source digest is 260ca363….
     - WP4-T11 is done (author-reported).
       - The Import screen has upload, preview, per-day decisions, confirmation and
         replay.
       - Imported periods show "Imported, unverified" with their controls disabled.
       - The opening-balance form has a confirmation step and a correction.
       - The read model gains `imported_unverified`.
       - e2e: 145 passed. Verify: 1707 tests. Digest: 70561b0d….
       - Deviations: several client components outside the owned list, and the
         `.shell-nav` wrap.
     - WP4-T11-FREEZE committed and pushed 61bf524 (53 paths; all checks 0). The
       board's current source digest is 70561b0d….
     - WP4-T12 is done (author-reported).
       - The drill with `--wp3` passed stages 1–6: 205 PASS, 0 FAIL.
       - Stage 6 checks the import no-op across eight tables, a single opening balance,
         409 on an imported period, and 404 for others.
       - Stages 2–4 now check import sources in backups, a prune dry run, the restored
         pause, and the upgrade from schema 6 to 13.
       - Verify: 1710 tests. Digest: de0e215b….
       - A stray background probe was stopped with TaskStop.
     - WP4-T12-FREEZE committed and pushed 0f6abdf (17 paths; all checks 0). The board's
       current source digest is de0e215b….
     - WP4-T13 is done (author-reported).
       - New: docs/11 runbook (EN/VI) and WP4_HANDOFF (EN/VI).
       - Updated: DEVELOPMENT, README and one docs/03 sentence.
       - Command map: 13 rows map to drill stages; 5 are owner NAS steps, unverified.
       - Parity holds; preflight 0. Digest: 1ed67f55….
     - The WP4-GATE, WP4-AUDIT-A and WP4-AUDIT-B briefs are ready.
     - WP4-T13-FREEZE committed and pushed 13a258d (26 paths; all checks 0). This is the
       WP4 package freeze; the board's current source digest is 1ed67f55….
     - WP4-GATE: PASS (13/13, verifier-reported).
       - The digest of record is 1ed67f55… (774 files).
       - Verify: 1710 tests. e2e: 145 passed.
       - Drill stages 1–6: 205 PASS.
       - Migrations pass, and races ran 60 of 60.
       - NAS: NOT VERIFIED.
       - Incident: one migrate probe without `DATABASE_PATH` migrated the owner's local
         development database from schema 1 to 13. It holds dev data only and is outside
         the repository. The owner was told.
     - WP4-AUDIT-B (data): **FIX REQUIRED.**
       - WP4-B-01 (Medium): an XML parse-cost bomb inside the limits blocks the server
         for about 9 s and adds about 730 MiB, and the stored report grows without bound.
       - WP4-B-02 (Low): 150,000 Holiday Dates cells cause a stack overflow and HTTP 500.
       - Everything else in area B held.
       - Risk notes R1–R4: R3 says an ended but not-yet-due period is importable, which
         is relevant to I-3. R4 says previews are kept forever with no quota.
       - Incident: the auditor's runaway python REPL (background task b9vel2ldq) wrote a
         multi-GB output file. The coordinator stopped it; the owner deletes the file.
     - WP4-AUDIT-A (operations): **FIX REQUIRED.**
       - WP4-A-01 (Low, must fix): the image ships 114 source maps, and production
         serves the client map.
       - WP4-A-02 (Low): `.env.example` contradicts the `JOB_RUNNER=off` rollback rule.
       - WP4-A-03 (Low): two runbook statements are inaccurate.
       - WP4-A-04 (Info): the smoke test inherits `DATA_DIR`.
       - Risks R-A1 to R-A9. The rest of area A held: backup under writes and restore,
         the migration runner, prune junction escapes, bootstrap, proxy, retention,
         privacy and the outbound CLI.
     - Fix round:
       - WP4-FIXB is done (author-reported).
         - XML limits refuse with 422 before parsing; findings are capped.
         - The 65 KB bomb now takes 4 ms (422) instead of 8.4 s and +740 MiB.
         - B-02 is fixed; R3 adds `not_due` as skip-only; R1 answers 409.
         - Verify: 1730 tests. Digest: b119e1b5….
       - WP4-FIXA is done (author-reported).
         - The image has no maps, and `/assets/*.map` answers 404; `app.ts` now
           returns 404 for a missing asset.
         - `.env.example`, the runbook and the smoke test are fixed.
         - Prune refuses when the clock is backward, and the drill releases two jobs.
         - The docs sync is done.
         - Drill: 208 PASS. Verify: 1734 tests. Digest: dfe4541d….
       - WP4-FIX-FREEZE committed and pushed 0f7fba2 (149 paths; all checks 0). The
         board's current source digest is dfe4541d….
       - WP4-REGATE: PASS, with 13/13 items and every finding check.
         - Digest of record: dfe4541d… (775 files).
         - Verify: 1734 tests. e2e: 145 passed. Drill: 208 PASS.
         - The 65 KB bomb is refused in 5 ms while health stays at 2 ms.
         - The image has no maps; races passed 60/60.
         - Diff: FIXA and FIXB paths only.
         - Observation: two backups in the same second break the tie by name; the
           recheck will judge it.
       - WP4-RECHECK-B: **FIX REQUIRED**, finding WP4-RB-01 (Medium). It reopens B-01:
         - tags led by a digit or a space, and attributes, slip past the element count:
           four 26 KB-class parts take about 3 s and about 1.4 GiB;
         - cell values in findings are not capped: a 99.8 MiB report is stored, and
           a larger one gives 500.
         - B-02, R3 and R1 are closed, and regression holds.
       - WP4-RECHECK-A: **PASS**, with no findings.
         - A-01 to A-04 are closed; R-A1, R-A5 and R-A7 are correct; there is no
           regression.
         - Risks R-RA1 to R-RA4 are non-blocking.
         - If the source changes, an area-A delta recheck (attempt 2) must bind to the
           new digest.
       - WP4-FIXB2 is done (expert, opus; author-reported).
         - A bounded streaming scanner replaces fast-xml-parser. It counts every `<`
           and bounds attributes, the tag length and names.
         - Text is cut at 200 characters, and the report is at most 2 MiB. A report
           failure gives 422.
         - All probes are refused in at most 57 ms. The worst accepted package takes
           180 ms and adds 107 MiB.
         - Tests: 15 red-first plus a sweep of 35 shapes; 10 mutations killed.
           Verify: 1,750 tests. Digest: 9848e8d7….
       - WP4-DEPCLEAN is done: fast-xml-parser and its 7 transitive packages were
         removed, and no other dependency changed. `npm ci` is clean; audit --omit=dev
         shows 0 vulnerabilities; verify passes 1,750 tests. Digest: 96445de4….
       - The board is ready for the new digest:
         - WP4-RECHECK-A moves to attempt 2 (pending; attempt 1 PASS is kept in its
           history);
         - WP4-REGATE2 and WP4-RECHECK-B2 are pending.
       - WP4-FIXB2-FREEZE committed and pushed cc34e7f (127 paths; checks 0, after one
         EOF-blank-line fix the brief allows). The board's current source digest is
         96445de4….
       - WP4-REGATE2: PASS.
         - Digest: 96445de4….
         - Verify: 1,750 tests. e2e: 145 passed. Drill: 208 PASS.
         - The RB-01 probes are all refused fast or stay within the budget: worst
           62 ms and +73 MiB. Health answers in 1–3 ms, no request returns 500, and
           the largest report is 0.57 MiB.
         - The benign-workbook differential is byte-identical against the old reader.
       - WP4-RECHECK-A attempt 2: **PASS** on cc34e7f (digest 96445de4), with no
         findings.
         - The delta touches only FIXB2 and DEPCLEAN files.
         - The lock change removes only fast-xml-parser.
         - Verify: 1,750 tests. Drill: 208 PASS. No maps.
         - The attempt-1 conclusions hold. New: R-RA5 (Info).
       - WP4-RECHECK-B2: **FIX REQUIRED**, finding WP4-RB2-01 (Low).
         - Two shapes break the stated budget: about 610 ms (a `t` attribute is decoded
           twice) and +158 MiB (slices pin two-byte parts).
         - Cost stays linear, with no 500.
         - Everything else held:
           - the scanner passes 49/49 spec cases and refuses DOCTYPE;
           - the differential is identical;
           - 72 new shapes stay bounded;
           - the report is at most 1.61 MiB.
       - Coordinator decision: fix the code instead of restating the budget.
       - WP4-FIXB3 is done (expert; author-reported).
         - Kept values are decoded once and stored as copies; attributes are capped at
           255; `decodeXml` is linear.
         - Limits tightened: 8 MiB of XML and 150k openings.
         - Worst case: 289 ms / +89 MiB, about 60% of the budget. E7 and Y7 are
           refused.
         - R-B2-1 and R-B2-2 are fixed.
         - Tests: 89/89; the differential is identical. Verify: 1,755 tests. Digest:
           635f909d….
       - The board moves WP4-RECHECK-A to attempt 3 (pending) and adds WP4-REGATE3 and
         WP4-RECHECK-B3 (pending).
       - WP4-FIXB3-FREEZE committed and pushed 972ccda (148 paths; all checks 0). The
         board's current source digest is 635f909d….
       - WP4-REGATE3: **PASS** (digest 635f909d…).
         - Verify: 1,755 tests. e2e: 145 passed. Drill: 208 PASS.
         - Whole-gate worst case: 160 ms and +86 MiB.
         - E7 and Y7 are refused or within the budget.
         - R-B2-1 and R-B2-2 pass.
         - The differential has 0 differences beyond the accepted additive
           `sourceCount` field.
         - The verifier left two stdin-blocked python tasks running; the coordinator
           stopped them.
       - WP4-RECHECK-A attempt 3: **PASS** on 972ccda (digest 635f909d), with no
         findings.
         - The delta is FIXB3 only.
         - Verify: 1,755 tests. The image has no maps.
         - Attempts 1 and 2 still hold.
       - WP4-RECHECK-B3: **FIX REQUIRED**, finding WP4-RB3-01 (Low).
         - Incompressible content (4–5 MB uploads, inside every limit) takes 508–611 ms
           and stalls health 640 ms, because of the 4 KiB-step inflate.
         - So the stated worst case of about 290 ms is false. Memory stays at most
           +123 MiB, with no 5xx.
         - Correctness (75/75), R-B2-1, R-B2-2, the differential and regression all
           hold.
       - Coordinator decision: close the class by derivation, not search. That means a
         linear inflate, a cost formula over the enforced limits, and realistic
         ceilings (for example 2 MiB) if needed.
       - WP4-FIXB4 is done (expert; author-reported).
         - Native zlib inflate: 251 ms becomes 16 ms. Parts over 512 KiB are decoded
           in steps.
         - Derived bound: t ≤ 40 ms + 14.8 ns·X + 339 ns·O and
           m ≤ 15 MiB + 13.3 B·X + 428 B·O.
         - New ceilings: 2 MiB upload, 1 MiB per part, 3 MiB per package and
           100k openings. That gives about 121 ms and +95 MiB. Measured worst:
           114 ms and +72 MiB.
         - Verify: 1,758 tests. Digest: b0611629….
       - WP4-DEPCLEAN2 is done: fflate 0.8.3 is a dev dependency now, with no other
         lock change; the runtime image omits it; audit --omit=dev finds 0. Verify:
         1,758 tests. Digest: 26fcc969….
       - WP4-FIXB4-FREEZE attempt 1 stopped correctly, with no commit. The validator
         rejected the board because the coordinator had left WP4-RECHECK-A as `done`
         while moving it to attempt 4. The coordinator fixed the board.
       - WP4-FIXB4-FREEZE attempt 2 committed and pushed 546cddaf (215 paths; digest
         26fcc969, 775 files; all checks 0).
       - WP4-REGATE4: **PASS** on 546cdda (digest 26fcc969, 775 files). verify 1,758,
         e2e 145/5 skipped, drill 208/0, races 10/10 x6. RB3 worst at the ceilings
         107 ms / +70 MiB against a derived ~120 ms / +96 MiB; no 5xx. 2 MiB ceiling
         enforced (413 above it); the differential is identical. Incident: one stray
         Node server child may remain from its task folder; the agent was TaskStopped.
       - WP4-RECHECK-B4 (fresh opus): **PASS** on 546cdda, digest 26fcc969 before and
         after, no findings. RB3-01 is closed. An independent LP recomputation of the
         bound gives 105.5 ms / +90.8 MiB (stated 121 ms / +95 MiB). Worst at the
         ceilings: 89–90 ms. Risks R-B4-1..4 are recorded.
       - WP4-RECHECK-A attempt 4 (fresh opus, delta): **PASS** on 546cdda, digest
         26fcc969 before and after, no findings. The 14 delta paths are FIXB4 and
         DEPCLEAN2 only; the other route limits are unchanged; fflate is absent from
         production with no area-A effect. New risks R-RA8 (Info) and R-RA9 (Low) are in
         old code. Its process listing shows the stray probe server is gone.
       - WP4-ACCREC is done (light, sonnet): the WP4_HANDOFF acceptance record (EN and
         VI) for 546cdda. Preflight 0; precommit 0.
       - STATE marks WP4 passed with its carried risks; NEXT_ACTION (EN and VI) points
         to WP5.
       - WP4-ACCEPT attempt 1 stopped correctly, with no commit. The validator found
         WP4-REGATE4 and WP4-RECHECK-B4 still at `running`. The coordinator had
         recorded their results without changing the status, and has now fixed it.
       - WP4-ACCEPT attempt 2 committed and pushed e7fe514 (163 handoff paths; all
         checks 0). **WP4 accepted.**
       - The board and STATE now have WP5 active.
       - WP5-PLAN is done (planner, opus; read-only).
         - No new gate before the assessment: WP4-REGATE4 passed on the same freeze.
         - Two parallel fresh opus audits on 546cdda: A (integrated workflow,
           submission and privacy) and B (reproducible release, verified restore and
           operations).
         - It outlines the pilot packet, sets owner decisions D-1..D-15, and lists the
           provisional tasks: fixes, REL, GATE, PILOT, FINAL-AUDIT, ACCREC, ACCEPT and
           GOV-RECOVERY.
       - The owner was asked D-1..D-15 (board `pending_owner_question`; it supersedes
         WP4-I-1..I-5).
       - WP5-ASSESS-A: **PASS** on 546cdda (digest 26fcc969 before and after), no
         findings.
         - The AC-13 integrated run passed 77/77 and the fault run 12/12.
         - verify 1,758, e2e 145/5 skipped, targeted suites 747.
         - Risks R-WA1..R-WA8; R-WA1..R-WA3 and R-WA8 go to the owner and the packet.
       - WP5-ASSESS-B: **FIX REQUIRED** on 546cdda (digest 26fcc969).
         - The release reproduces: dist byte-identical, and the image dist equals the
           local build. The image is non-root, with 0 forbidden files.
         - Drill: 208 PASS. The extra restore (finalized period, correction, OT
           reservation and partial use) matched.
         - Findings: WP5-B-01 (Medium), the runbook's Compose variables and `<image>`
           are undefined, so the restored and rollback instances have no binding;
           WP5-B-02 (Low), no protected env-file copy and no release identity are kept
           with the off-device backup.
         - Risks R-B5-1..R-B5-7.
       - WP5-FIXB is done (worker, sonnet; author-reported).
         - It changed docs/11 EN and VI, the `.env.example` header and one
           `compose.example.yaml` comment.
         - `docker compose config` exits 0 for the live, restored and rollback
           forms. verify 1,758; precommit 0; preflight 0.
         - Digest ed604d0c (775 files); the board's current digest is updated.
       - WP5-ASSESS-A moved to attempt 2, pending: a digest-bound area-A delta recheck
         on a later WP5 freeze. Attempt 1 is kept in its history.
       - WP5-FIXB-FREEZE committed and pushed 85838b5 on attempt 3 (105 paths; all
         checks 0). Attempts 1 and 2 stopped on board errors that the coordinator
         made: a stale override reason, and a pending audit that named no gate.
       - WP5-AC13 is done (worker-high, sonnet; author-reported).
         - New `tests/integration/ac13-two-week.test.ts` plus its helper. One
           deterministic scenario: 14 dates, sign-off (8:30, ledger posted once), a
           crash and restart around the send, a correction, an OT double-spend race,
           isolation and an overdue run.
         - It passes under 3 time zones, and the 3 solo runs pass. 2 mutations are
           caught. No product defect was found.
         - lint 0; verify 77 files / 1,759 tests. Digest 1e59ad31 (777 files).
       - WP5-AC13-FREEZE committed and pushed 8e99d2c (23 paths; all checks 0).
       - WP5-REL is done (worker, sonnet; author-reported).
         - New: docs/12 release notes and the WP5_HANDOFF pre-gate snapshot (EN and
           VI).
         - docs/11 sections 13–16: pilot activation, deactivation, rollback card and
           operator notes.
         - A README link to docs/12.
         - D-1..D-15 are marked as recommended and pending. The activation instant is
           set through an admin API call, because no screen exists for it.
         - All 14 env keys found; verify 1,759. Digest 0a64a75f (779 files).
       - WP5-REL-FREEZE committed and pushed 74d5bfe, the package-final freeze: 28
         paths, digest 0a64a75f, all checks 0, and no email or host found in the
         staged docs.
       - WP5-GATE: **PASS** on 74d5bfe (digest 0a64a75f, 779 files; NAS NOT
         VERIFIED).
         - verify 1,759 with 0 deprecation lines; e2e 145/5 skipped.
         - AC-13 passed 3 times (about 4.1 s each).
         - Drill: 208 PASS.
         - `docker compose config` exits 0 for the live, restored and rollback forms.
         - Env keys present; audit 0; validators PASS; scope clean; Docker clean.
       - Running, in parallel:
         - WP5-PILOT (worker, sonnet; handoff only, ports 47780–47789);
         - WP5-ASSESS-A attempt 2 (fresh opus; area-A delta on 74d5bfe; ports
           47700–47719).
       - WP5-PILOT is done (worker, sonnet; author-reported).
         - `WP5_PILOT_PACKET` EN and VI: 8 synthetic captured messages, 4 PDFs and 4
           `*-synthetic.png` renders, all viewed.
         - D-1..D-15 are pending. Digest unchanged; precommit and preflight 0.
         - Incident: a `python -` heredoc runaway, about 1 GB of output. The
           coordinator stopped the task and the agent. The owner is asked to delete
           the output file.
       - WP5-ASSESS-A attempt 2: **FIX REQUIRED** on 74d5bfe (digest 0a64a75f).
         - The software passes every area-A check. No application source changed.
         - The AC-13 test is sound and deterministic, and mutations fail it.
         - verify 1,759; e2e 145/5 on the rerun, after one `ERR_NO_BUFFER_SPACE` on
           run 1; probe 26/26.
         - Findings, both Low and docs/11 only:
           - WP5-A2-01: the status screen shows no "flag" field;
           - WP5-A2-02: the deep-link check cannot be done in the capture self-test.
         - Risks R-A2-1..5. Among them, the WP5-AC13 TZ runs did not actually change
           the zone.
       - WP5-FINAL-AUDIT: **FIX REQUIRED** on 74d5bfe (digest 0a64a75f).
         - B-01 and B-02 are resolved; the restored instance was started for real,
           bound correctly and came up paused.
         - Area B: PASS. The console activation step was tried in Edge and is safe.
         - Findings, both Low:
           - WP5-F-01: the same status "flag" issue, plus the CLI-refusal wording
             (runbook and packet);
           - WP5-F-02: packet section 8 names a freeze that has already happened.
         - Risks R-F1..R-F7. O-1 (the B-01 severity in WP5_HANDOFF) goes into
           ACCREC.
       - WP5-FIXD is done (worker, sonnet; author-reported).
         - F-01, F-02, A2-01 and A2-02 are fixed, and so are R-A2-1, R-A2-2/R-F1,
           R-F4, R-F5 and R-F6.
         - Only docs/11 EN and VI changed outside handoff/, plus the packet.
         - Parity and Grep are clean; verify 0. Digest 1b8ceae4 (779 files).
       - WP5-FIXD-FREEZE committed and pushed 9bcdd88 (197 paths; secrets Grep 0;
         all checks 0).
       - WP5-REGATE: **PASS** on 9bcdd88 (digest 1b8ceae4).
         - verify 1,759; e2e 145/5 skipped; drill 208.
         - AC-13 passed under real Asia/Tokyo and America/New_York zones, as the
           process itself reported.
         - Image `bd17d061…`.
         - The fixed lines hold.
         - Observation (Low): docs/11 section 11, line 274, still says the screen
           shows a sending "flag".
       - WP5-FIXD2 is done. The only hit was that sentence (EN and VI), and it is
         fixed. The sweep of docs/05, 07, 12, README and the packet is clean. Digest
         150420e7.
       - WP5-FIXD2-FREEZE committed and pushed 014bd47 (46 paths; all checks 0).
       - WP5-REGATE2: **PASS** on 014bd47 (digest 150420e7, 779 files).
         - Since 9bcdd88, only docs/11 changed outside handoff/: one line each in EN
           and VI.
         - All 230 dist files are identical; verify 1,759; AC-13 passed.
         - Status-flag claims: 0.
       - WP5-PKTID is done (attempt 2).
         - Packet sections 0 and 6 now name 014bd47, 150420e7 and the development
           image bd17d061 of 9bcdd88.
         - Sections 3 and 5 are labelled with their 74d5bfe/WP5-GATE source and the
           documentation-only delta.
       - WP5-RECHECK: **PASS** on 014bd47 (digest 150420e7), with no findings.
         - F-01, F-02, A2-01 and A2-02 were each checked against the live app and are
           resolved.
         - The small-risk fixes are accurate, and the packet identity is correct.
         - Risks R-RC-1..6 are optional Info items.
         - **WP5 software readiness is accepted, and the pilot is pending.**
       - WP5-ACCREC is done.
         - The WP5_HANDOFF acceptance record (EN and VI) is filled: 014bd47,
           150420e7.
         - O-1 is corrected: B-01 is recorded as Medium.
         - Parity and preflight pass.
       - STATE marks WP5 passed. NEXT_ACTION (EN and VI) points to GOV-RECOVERY and
         the owner's pilot review.
       - WP5-ACCEPT committed and pushed dd0c7d1 (74 handoff paths; secrets Grep 0;
         all checks 0; no tag). **WP5 accepted. WP1–WP5 software readiness is
         complete.**
       - GOV-RECOVERY-FIX is done (attempt 2).
         - The synthetic boards set their own status.
         - New `software_ready` probes: 1 accepted and 4 rejected.
         - Environment overrides default to the real files.
         - Probes went from 82 to 87, and the suite passes on a `software_ready` copy.
         - The source digest is unchanged.
       - GOV-RECOVERY-FREEZE committed and pushed 7f750e9 (12 paths; 87 probes; all
         checks 0).
       - GOV-RECOVERY-GATE: **PASS** on 7f750e9.
         - Scope: check_recovery.py only.
         - 87 probes pass on the real board and on a `software_ready` copy.
         - validate() accepts the copy. Validators, preflight and the digest are
           unchanged.
       - GOV-RECOVERY-AUDIT: **PASS** on 7f750e9, with no findings. GOV-E8-AUDIT R1 is
         closed.
         - The old suite fails on a `software_ready` copy; the new one passes.
         - All 82 old probes are kept, and 5 new ones are added.
         - Validator mutants V1–V6 are killed.
         - Optional risks R1–R4 go to the governance backlog.
       - GOV-RECOVERY-ACCEPT committed and pushed fe67f94, the closing commit: 39
         paths, 87 probes, secrets Grep 0, all checks 0, no tag.
       - The board is now `software_ready`.
         - `next_task_id` is null, and the phase is `complete-pilot-pending`.
         - No task is running or pending.
         - This last board change is uncommitted.
       - **Mission state: WP1–WP5 software readiness is complete. The concrete pilot
         packet waits for the owner.**
       - Then: a freeze, a docs-delta regate, WP5-PKTID, WP5-RECHECK (fresh opus),
         ACCREC and ACCEPT.
       - Then:
         - a freeze;
         - a regate, which applies TZ inside the process (R-A2-3);
         - a packet identity refresh;
         - one fresh recheck;
         - ACCREC and ACCEPT.
       - Then:
         - WP5-AC13, a committed integrated test (worker-high, sonnet), and its
           freeze;
         - WP5-REL, the release and setup notes plus the runbook activation,
           deactivation and rollback card; its freeze is the package-final freeze;
         - WP5-GATE;
         - WP5-PILOT;
         - the final audit, which covers the area-B recheck and the area-A delta.
     - Backlog: R-A2, R-A6, R-A8, B-R2.
     - Owner questions still open: WP4-I-1..I-5 (safe defaults in force), and R-A3
       (rollback approach) before the WP5 pilot.
     - Answered by the owner: F-1..F-6 (recommendations) and GOV-SKILL option B
       (readme-md skill removed).
     - Drafted for use after both PASS: the WP3-ACCREC brief (HANDOFF acceptance record)
       and the WP4-PLAN brief. The WP3-ACCEPT committer brief, STATE and NEXT_ACTION
       follow once WP3-ACCREC is done.
  4. One freeze, a full regate.
  5. Two fresh rechecks in parallel: A with digest binding, and B+C.

  Briefs are ready: WP3-FIXC, WP3-REGATE, WP3-RECHECK-A and WP3-RECHECK-BC. The
  WP3-FIX-FREEZE brief will be written after WP3-FIXC.
- Next action:
  1. Owner: review `handoff/delivery/WP5_PILOT_PACKET.md` and answer D-1..D-15. D-1,
     D-7, D-8 and D-13 are needed before activation. Run the owner NAS steps.
  2. A coordinator session resumes only for a fix round that the answers require, or
     for the authorized pilot. Real sending and activation stay owner-controlled.
- Blocker: none now (B: had space again for T06-FREEZE attempt 2; it may fill up again).
  Risk: the classifier may deny a committer `git add`; the coordinator does
  not route around a denial and asks the owner (approval message naming the action and its
  danger, or a manual commit with `git add -A`).
- Unchanged constraints: synthetic data and dry-run mail only; no real sending or
  deployment; no billing, global-settings or permission changes; commits only through
  timesheet-committer, on main until the first release; no amend, force-push or tags.
- Matching prompt: handoff/prompts/ORCHESTRATE.md (WP3 per WP3_IMPLEMENT.md after the
  accept commit).

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). The last committed board is the
  recovery copy; the full WP2 history (tasks, attempts, decisions) is there and in git.
- Live processes: WP4-FIXB4-FREEZE (attempt 1) only.
- Temporary work folder (owner, 2026-10-05): `D:\.claude-tmp\timesheet\<task>`, outside
  Dropbox. Records before that date name `D:\timesheet-tmp\<task>`.
- Usage/reset: not observable.
