# WP5-UX5-T03 dispatch brief (the Review and sign off page, and the Send card)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T03, package WP5, kind
  implement, attempt 1. It depends on WP5-UX5-T02-FREEZE (done, b4c5004).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size L, risk H (the sign-off and send flow the person uses to sign and send a
    timesheet; the owner's reason rule; idempotent sends), novelty no. The server contracts
    exist since UX5-T01A/T01B; this slice is the client over them. docs/08 row "High-risk
    fix/slice with an existing pattern".
  - Write the task record in English.
- **Sources (read them in full):**
  - the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`:
    - section B3 (U5-27..U5-32, about lines 798-834);
    - Addendum 1, "B, revised" B-A1..B-A4 (sends, the reason rule, the optional image);
    - Addendum 2, "B7/B9 signature lines" (about lines 1225-1236), **as amended by
      Addendum 3b** (brief section, about lines 353-371);
  - `handoff/delivery/tasks/WP5-UX5-T01B.md`, Results: the routes, the counting rule as
    built, and "Deviations and notes" (the "submitted" meaning, the sign-off default
    variant, the leftovers for this slice);
  - `handoff/delivery/tasks/WP5-UX5-T01a.md`, Results (signer from the account, optional
    image);
  - the mockups `handoff/delivery/design/WP5-UX5/mockup.html` and the renders B7, B8, B9,
    B10 and B11 (`mockup-r5-b*-synthetic.png`);
  - the owner's words on the board (`owner_decisions` 2026-10-21, the round-5 request,
    section "Trong trang 'Review and sign off'", and the answers F-3 b, F-4, F-5 b; the
    2026-10-22 answer H-1 a).
- **AGENTS.md on disk wins.** Rule 4 (the signature image is shown only to its owner),
  rule 7 (dates in the reporting zone), rule 8 (a changed rule changes with its `.vi.md`),
  rule 11, and the "Frontend and UI/UX standards" section (tokens, both dark sets, states,
  WCAG 2.2 AA, 44px targets below 768px, `--transition`, no animation library).
- **Base.** HEAD = origin/main = b4c500456a69158571799f8f0d90f035fd7a0fa5, or a later commit
  that changes only `handoff/`. The digest is
  1b4132739017e8f153cc32764b84a8a698b406e5ada027bb3d8d4f7ff701aca1 (862 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Where the owner's later answers replace plan B3

Plan B3 was written before the owner's answers. These lines win over it:

1. **F-5 b, the image is optional.** The Sign off dialog does **not** disable Sign off when
   no image is saved. It says "your saved image and your name", or "your name only" with a
   link to Settings to add an image. The signer is the signed-in person; there is no typed
   name.
2. **F-3 b and F-4, the Send card is edited per send.** To, Cc, Subject and the body are
   editable for each send (the body is **not** read-only). The two switches "Time rows on the
   PDF" and "OT rows on the PDF" are live for each send. All defaults come from
   `GET /api/revisions/:id/send-draft` (Settings).
3. **The owner's reason rule (B-A2 as built in T01B).** Once a copy counts as sent, the Send
   button reads "Send another copy..." and opens a confirmation dialog. It names the earlier
   copy (date, recipients, delivery state) and requires "Reason for sending another copy"
   (2-500 characters after trimming). For a correction revision the field is prefilled with
   the correction reason, still editable. A 422 `reason_required` from the server opens the
   same dialog. Follow the counting exactly as T01B built it; do not re-implement it on the
   client beyond what the send-draft returns.
4. **Signature rows, Addendum 3b.** The two rows (Employee Signature + Date, Manager
   Signature + Date) take the B11 PDF block's insets and proportions, not Addendum 2's fixed
   22rem / 11rem widths:
   - measure from the B11 mockup page, as fractions of the content width: the signature
     line's left inset, the line lengths, the gap to the Date line, and the Date line's inset
     from the right;
   - cross-check them with the frozen PDF geometry in `src/server/pdf/layout.ts`. If the two
     differ by more than 1% of the content width, use the PDF's values, so the screen matches
     the PDF that is signed, and record both;
   - apply them on screen as CSS custom properties, on the Review sheet footer and in the
     Sign off dialog's signature preview;
   - state your narrow-width rule: the lines keep a minimum readable length and stay in two
     rows at every width;
   - kept: "Sign off" right-aligned at the end of its signature line, inset 8px; the four
     lines aligned by row and by column.
5. **H-1 a.** A period counts as submitted once any of its revisions has a send. The status
   chips follow it.
6. **Round-4 R3 b is dropped** (coordinator decision 2026-10-21): one column at every width.

## First: inventory, then stop if a path is missing

Before editing, list every file the change touches:
- the call sites of the Review components you rename or remove (`ReviewSignoff.tsx`,
  `ReviewEnvelope.tsx`) and of every `api.ts` type you change;
- the Sign off and Send client calls, `useAttemptKey.ts`, and the T01B routes they use
  (`send-draft`, `send`, the revision `pdf` route with `time` / `ot` / `disposition`, and the
  unsigned `pdf-preview`). **If the unsigned preview route does not exist, stop and report.**
- where `show_time_on_pdf` is read and written: the Settings form, `settingsFileModel.ts`,
  and the server settings route, service and settings-file import. **If the server does not
  accept the key on save or on settings-file import, stop and report.**
- the History pieces for sends: the `revision.send` audit label (`otModel.ts`) and where the
  reason is shown;
- every e2e spec or helper that drives the Review page, sign-off, send, the Settings
  submission form or the settings file (for example by the button "Sign off & Submit");
- the shared (grantee) mount of Review, if any: grantees never see Sign off, Send, the
  send draft or a render control (F-Q5).

If a needed path is not in "Owned paths", stop and report before editing.

## Scope

1. **U5-27, the title.** "Review and sign off"; the description "Pay period Mon 10/12/2026
   -> Sun 10/25/2026 · payroll date Fri 10/30/2026 · due Tue 10/27/2026, 17:00
   (America/Los_Angeles)" from real values in the reporting zone; no submission id (it stays
   on the PDF and in the email). Chips under it, left-aligned: the period pill and the status
   chips (Draft / Signed / Not sent yet / delivery state / Imported).
2. **U5-28, the check card.** The period card's padding (16px; 12px and 8px edges in
   compact). Text left, vertically centred, wrapping: "Check every day, then sign off.
   Signing off locks this period and posts your OT credits; you send the PDF to payroll
   afterwards, below." "Back to the timesheet" right, vertically centred, "Back" below 480px
   (the accessible name stays the full text). Gap >= 16px. Rewrite `MODE_INTRO` for the
   three modes.
   - Where a rule says "compact", use the current compact breakpoint mechanism, so that
     UX5-T04 moves it in one place. The "Back" label switches below 480px as specified.
3. **U5-29, the Preview card.**
   - Header bar: "Preview" on the left; the same chips on the right.
   - Line 1, "C&D Semiconductor Services, Inc.": large, centred, one line. It is **hidden,
     not wrapped,** when it does not fit, measured against its max-content width.
   - Line 2, the title: large, centred, wrapping by word.
   - Line 3, the fields: 12px gap above, wrapping by group as U5-16, then inside a group.
   - Divider; the two week sheets (detail rows on, as today; the header row and first column
     keep `--sheet-head-strong`).
   - Footer as on the Timesheet, with a primary "Sign off" button in the Employee Signature
     line (geometry per item 4 above). After sign-off the line shows the signed image when
     there is one (`/api/signatures/:attachment_id`, owner only), the name, the date
     (`signed_at` in the reporting zone) and a "Signed" mark (words, not colour alone).
4. **U5-30, the Sign off dialog** (B9).
   - Summary: signer "(you)", the date on the PDF (today in the reporting zone), the OT
     total, and the signature preview (image and name, or name only).
   - All of today's step 1 content from `ReviewFindings.tsx`: OT proposals, deficit choices,
     missing evidence with acknowledgement, reserved OT leave.
   - The correction reason in correction mode.
   - A note that signing off sends nothing.
   - Cancel and Sign off.
   - Errors: blockers inline in the dialog. A server refusal opens the `AlertDialog` "Not
     signed off". A stale review reloads and says so. Nothing is signed in any of these.
   - Success closes the dialog, returns focus sensibly, and shows the signed footer.
5. **U5-31, the Send card**, the last card. Steps 2 and 3 of today's page go away.
   - From (read-only), To, Cc, Subject, body: editable, defaults from `send-draft`, with the
     existing address and length rules shown as field errors.
   - The two switches, defaults from `send-draft`.
   - "PDF Preview": the PDF for the current switches, inline. Before sign-off, the unsigned
     preview; after it, the revision PDF for the switches.
   - "Save PDF": enabled after sign-off; downloads the PDF for the current switches.
   - "Send": primary. Before sign-off it is disabled, with "Sign off first". After a copy
     counts, "Send another copy..." with the reason dialog (item 3 above).
   - One request key per attempt (`useAttemptKey.ts`); a replay is not a second send.
   - 409 (an open or uncertain attempt, a waiting job) shows a clear message; nothing is
     retried blindly.
   - A status chip with the delivery state.
   - Imported revisions and grantees: no Send.
6. **U5-32.** Remove "What you sign" and its hint. At the end of the page, one muted note:
   "Dates are accounting dates in America/Los_Angeles. Session times are shown in that
   zone, as on the PDF." Use the saved reporting zone, not a literal.
7. **One column.** Remove `.review-layout` (`styles.css`, about line 5055, 1330px) and every
   rule that only served it.
8. **Settings.**
   - Add the switch "Time rows on the PDF" next to "OT rows on the PDF" in the submission
     settings, as the per-send default.
   - Add the optional settings-file key `show_time_on_pdf` to `settingsFileModel.ts`. Older
     files without it still import.
9. **History and admin wording (T01B leftovers).**
   - The audit operation label for `revision.send`, in `otModel.ts`.
   - The owner's History shows a send's reason.
   - `OperationsStatus.tsx` (about line 84): a signed-not-sent revision reads "Not sent yet",
     not "Email not requested".
10. **Files.** As plan B3: `ReviewScreen.tsx`; `ReviewSignoff.tsx` becomes
    `SignoffDialog.tsx`; `ReviewEnvelope.tsx` becomes `SendCard.tsx`; `ReviewDays.tsx`,
    `TimesheetSheet.tsx` (ReviewSheet header and footer), `reviewModel.ts`,
    `ReviewStatus.tsx`, `api.ts` (types), `styles.css`.
11. **Style.** Reuse the tokens. A new value is a CSS custom property, and a colour also in
    both dark sets. Every new control has rest, hover (where the device can hover), active,
    focus-visible, disabled and, where it applies, checked states in both themes.

## Tests

- **Unit** (`tests/client/`): `reviewModel.test.ts` and `deliveryModel.test.ts` for the new
  states (signed, not sent, copy counts, reason required, imported); the settings-file key
  (`settingsFileModel.test.ts`), with and without it.
- **e2e** (`review.spec.ts`, `submission.spec.ts` and the specs found by the inventory), both
  projects:
  - the title has no submission id; the chips sit under the description;
  - the check card's "Back" below 480px, the full label above, the 16px gap;
  - line 1 hidden, not wrapped, when narrow; line 2 wraps by word;
  - one column at 1440;
  - **signature geometry** (item 4): per row the lines' y equal within 1px; employee and
    manager lines with equal x and width; the Date lines with equal x and width; the
    fractions equal the measured B11 values within 1% of the content width;
    button.right = line.right - 8 ±1; two rows at every tested width (1440, 768, 390, 320);
  - sign off with an image and without one; the signed footer shows image or name, the
    date and "Signed";
  - a server refusal shows "Not signed off" and signs nothing; a stale review reloads;
  - Send disabled before sign-off; a send with edited To, Cc, Subject, body and both switches
    reaches local capture with exactly those values and the matching PDF variant;
  - after a copy counts, "Send another copy..." requires the reason; a reason under 2
    characters is refused;
  - the Settings switch "Time rows on the PDF" persists and becomes the Send card default;
  - grantees see no Sign off or Send.
- **Accessibility:** the existing contrast and focus checks cover the new controls in both
  themes; 44px targets below 768px.
- **Evidence:** synthetic renders of the page at 1440 and 390, the Sign off dialog, and the
  Send card with the reason dialog (`-synthetic.png`, at most six), for comparison with
  B7-B10.
- **Mutants** (each must fail a test):
  1. Send enabled before sign-off;
  2. the client skips the reason dialog after a copy counts;
  3. line 1 wraps instead of hiding;
  4. the Sign off button's inset is off by 8px;
  5. the switches are not sent with the send.

## Docs (EN and VI)

- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: **only** the lines this slice makes false. These
  are the Review row, the line "On Review the checklist sits beside the paper from 1330px"
  (about line 44), any "Sign off & Submit" wording, and the Settings default "Time rows on
  PDF: On" if it is missing. Everything else in docs/04, docs/12 and the pilot packet is
  UX5-T06's.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. The inventory. Stop if needed.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory.
4. Run the e2e files you changed, each once.
5. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
   A worker crash is a failure.
6. The mutants.
7. Parity of the docs pair, then `validate_package.py --preflight` with the workflow
   Python. Write `<user>` in the evidence.
8. Privacy and whitespace checks (`git diff --check`). Synthetic data only.
9. `npm run verify` with `SMOKE_PORT` in 49720-49739, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
10. `npm run digest` LAST.

**Rules:** no `skip`, `fixme` or `.only`; no npm dependency change. List every changed
assertion with file:line and its reason; weaken nothing.

## Owned paths

- `src/client/`: the files in Scope item 10; the Settings submission form and
  `settingsFileModel.ts`; `otModel.ts`, the History send pieces and `OperationsStatus.tsx`
  for item 9; `api.ts`. Any other client file only as a call-site follow-up of a rename or
  type change, listed in Results with its reason.
- `src/server/`: **none.** A needed server change is a stop.
- `tests/client/`.
- `tests/e2e/`: the specs and helpers that drive Review, sign-off, send, the Settings
  submission form, the settings file, History's sends or the admin status wording. Change
  only the steps the redesign moves.
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, as limited above.
- this brief's Results section.
- `handoff/delivery/evidence/WP5-UX5-T03/`.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-T03`. Ports 49720-49739.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul`, NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change npm
  dependencies.
- Mail goes only to local capture or the loopback test sink. No real sending.
- The owner's reference image is not to be opened, copied or stored.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high). Attempt 1.

### Step 0: base (before any edit)

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-T03` (logs in `logs\`, env in `env.sh`). `node --version` v24.21.0.
- HEAD = b4c500456a69158571799f8f0d90f035fd7a0fa5. `git status --short`: only `handoff/` entries (ORCHESTRATION.json,
  WORKFLOW_REVISION_CHECKPOINT EN/VI, WP5-UX5-T02-FREEZE.md, the T02-FREEZE evidence folder, this brief).
- `npm run digest`: 1b4132739017e8f153cc32764b84a8a698b406e5ada027bb3d8d4f7ff701aca1 (862 files), exit 0, equal to the brief.

### Inventory (no stop: nothing outside the owned paths was needed)

- Routes exist: `GET /api/revisions/:id/send-draft`, `POST /api/revisions/:id/send`, `GET /api/revisions/:id/pdf?time&ot&disposition`,
  `GET /api/timesheets/:date/pdf-preview?time&ot` (src/server/routes/submission.ts), `show_time_on_pdf` on the settings route and schema
  (routes/settings.ts:65, http/schemas.ts:318, services/submissionSettings.ts). The settings file is applied by the client through
  `POST /api/settings/submission`, so no server import path is involved.
- Call sites of the removed components: `ReviewSignoff.tsx` and `ReviewEnvelope.tsx` were used only by `ReviewScreen.tsx`.
- No stop condition: the unsigned `pdf-preview` route and the server handling of `show_time_on_pdf` exist. `src/server/` was not touched.
- Deviations to report: (1) no `sender` in the review response, so "From" shows "the sender set on this server" until a revision
  exists, then the draft's address (a server change would be needed; not made). (2) Two empty scratch files in the task folder
  (`edit-settingsmodel.mjs`, `placeholder.txt`) came from a heredoc and a `/dev/null` redirect I used by mistake before I
  re-read the rules; no data was affected.

### Changes by area

- **Review page** (`ReviewScreen.tsx`, `ReviewDays.tsx`, `TimesheetSheet.tsx`, `reviewModel.ts`, `ReviewStatus.tsx`, `styles.css`):
  - Title "Review and sign off", description from real values in the reporting zone, no submission id, chips under it
    (period pill + status chips: Draft / Signed / Not sent yet / delivery state / Imported). One column; `.review-layout` and every
    rule that served it are gone.
  - Check card (16px padding, 12px compact below 768px via the existing `max-width: 767px` mechanism; "Back" below 480px, the
    accessible name stays full; text and button centred; gap 16px). `MODE_INTRO` is rewritten for the three modes.
  - Preview card: header bar with "Preview" and the same chips (their own data attribute), company line (one line; hidden, not
    wrapped, when its max-content width does not fit: `CompanyLine` measures a nowrap span with a `ResizeObserver`), the title (wraps
    by word), the fields (12px below, wrapping by group), the two week sheets, the footer, and the signature rows.
  - "What you sign" and its hint are gone; one muted zone note ends the page, using the saved reporting zone.
  - Status: `periodStatus` gets an optional `jobs` list; a manual revision without a send job reads "Signed" and, with one,
    "Submitted manually" (owner answer H-1 a). The link label "Review or correct" covers `signed`.
- **Signature rows** (`SignatureRows` in `TimesheetSheet.tsx`, `--sig-*` tokens in `styles.css`): see "Signature geometry".
- **Sign off dialog** (`SignoffDialog.tsx`, replaces `ReviewSignoff.tsx`): signer "(you)", the date on the PDF (today in the
  reporting zone from `/api/periods/current`), the OT total, the signature preview (same geometry), OT proposals, deficit choices,
  missing evidence with acknowledgement, reserved OT leave, the correction reason in correction mode, the "sends nothing" note.
  Blockers show inline and the first takes focus. A server refusal opens the `AlertDialog` "Not signed off" (choices kept, focus
  returns to the button); a stale review reloads and says so. Success closes the dialog and focuses the Send card.
  Image optional (F-5 b): "your saved image and your name", or "your name only" with a link to Settings.
- **Send card** (`SendCard.tsx`, replaces `ReviewEnvelope.tsx`; model in `deliveryModel.ts`): From (read-only), To, Cc, Subject,
  message, two live switches, "Reset to the Settings defaults", "PDF Preview" (a link that opens in a new tab: the unsigned
  preview before the sign-off, the revision PDF after it, with the current switches), "Save PDF" (after sign-off; downloads the
  variant), "Send" (disabled with "Sign off first" before; "Send another copy..." and the reason dialog once the send draft says a
  copy counts; a 422 `reason_required` opens the same dialog). One attempt key per attempt (`useAttemptKey`, signature =
  revision + form + reason); a 409 is said in words and nothing is retried; imported revisions get no Send card. Defaults before the
  sign-off come from the review payload and `GET /api/settings/submission`; after it from `GET /api/revisions/:id/send-draft`;
  a form the person edited is never overwritten by new defaults.
- **Settings**: switch "Time rows on the PDF" next to "OT rows on the PDF" (`SubmissionSettingsForm.tsx`, `settingsModel.ts`,
  `api.ts`). Settings file: optional key `show_time_on_pdf` in `settingsFileModel.ts` (written by every export; optional when
  reading; an older file leaves the saved value as it is; a non-boolean is refused; the comparison has a "Time rows" row).
- **History and admin wording**: `revision.send` ("Revision sent") and `deadline.send_signed` labels in `otModel.ts`; the owner's
  History already shows the audit event's reason (`data-reason`), now proved for a send. `OperationsStatus.tsx`: a revision
  without a send job reads "Not sent yet" (it read "Signed, not sent yet" after T01B; "Email not requested" no longer exists).
- **Other client files (call-site follow-ups)**: `App.tsx` loads `ReviewScreen` through the existing `Deferred` (lazy chunk) because
  the new page pushed the main chunk to 506.66 kB and the build must show no advisory (now 481.95 kB plus a 25.77 kB Review chunk);
  `DeliveryHistory.tsx` gives `downloadRevisionPdf` an optional `rows` argument (the Send card's Save PDF).
- **Docs**: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: the Review row, the paper sentence about the checklist and 1330px, and the
  Settings defaults rows (Time rows on PDF added). Nothing else (T06's).

### Signature geometry (item 4)

- Measured on the B11 page of `mockup.html` (765px wide at 1.25px per point, content 675px, margin 45px; `left` values of the four
  `.sl` lines): left inset 23.75px = 3.519%, signature line 185px = 27.407%, gap 300px = 44.444%, Date line 92.5px = 13.704%,
  right inset 73.75px = 10.926%.
- `src/server/pdf/layout.ts` (content 540pt): lines start 19pt in (3.519%), 148pt long (27.407%), Date line 74pt (13.704%) at x 443-517,
  59pt before the right edge (10.926%), gap 240pt (44.444%). Both sources agree (difference 0.000% of the content width, far under
  the 1% limit), so the screen uses the shared fractions; there was no difference to record.
- On screen: custom properties `--sig-inset: 3.519%`, `--sig-line: 27.407%`, `--sig-date: 13.704%`, `--sig-right: 10.926%` on
  `.review-signatures` (used by the Review footer and the dialog preview). Each row is a five-track grid (inset, line, flexible gap,
  Date line, right inset). The Sign off button is right-aligned at the end of its line with `--sig-button-inset: var(--space-2)` (8px).
- Narrow-width rule: the lines keep a minimum readable length (`--sig-line-min: 9rem` = 135px, `--sig-date-min: 5.5rem` = 82.5px)
  and stay in two rows at every width; the gap and then the right inset give way first, so nothing wraps and nothing scrolls.
  Measured by the e2e at 1440/768 (fractions within 1% of the B11 values) and at 390/320 (minimums, two rows, aligned lines).
- Tokens added (none is a colour, so no dark-set entries): `--send-side-width`, `--send-label-width`, `--signoff-dialog-width`,
  `--signoff-label-width`, and the `--sig-*` set above.

### Checks (actual results; logs in `D:\.claude-tmp\timesheet\WP5-UX5-T03\logs`, copies in the evidence folder)

- `npm run typecheck`, `npm run lint`: exit 0. `npm test` (vitest, full): 99 files, 2312 tests passed, 0 failed (client tests: 30 files).
  `npm run build`: exit 0, no chunk advisory.
- Changed e2e files, each run on both projects before the full run; the real-clock full e2e (`npx playwright test`, alone, one run):
  795 passed, 101 skipped (the existing project-specific skips), 0 failed, exit 0, 19.6 min (`21-e2e-full.txt`). No rerun was needed.
- Mutants, each built and run, then restored (`cmp` equal to the saved copies of the three files):
  1. Send enabled before sign-off (`sendCardState`): killed, `deliveryModel.test.ts` 1 failure and `review.spec.ts` 2 failures;
  2. skip the reason dialog after a copy counts (`SendCard.press`): killed, `submission.spec.ts` "nothing is posted without a valid reason";
  3. line 1 wraps instead of hiding (CSS): killed, `review.spec.ts` "line 1 is one line at 340px";
  4. Sign off inset off by 8px (`--sig-button-inset: 0px`): killed, `review.spec.ts` "Sign off sits 8px inside the end of its line at 1440px";
  5. the switches are not sent (`time_rows: true` constant): killed, `deliveryModel.test.ts` 1 failure and `submission.spec.ts` deep-equality of the request.
- Docs: `parity.mjs` on docs/04 EN/VI: headings 10/10, bullets 47/47, table rows 27/27. `validate_package.py --preflight` with the
  workflow Python: PASS, 122 translation pairs, 2337 local links.
- `git diff --check`: exit 0. The only addresses in the changes and the evidence are `@example.invalid`; mail is local capture only
  (privateServer, runner off). `<user>` stands for the account name in the copies of the logs.
- `npm run verify` with `SMOKE_PORT=49725`, `DATA_DIR` / `DATABASE_PATH` in the task folder: exit 0 (99 files, 2312 tests, SMOKE PASSED).
- No background task of mine is running.
- `npm run digest` (last command): `d23e3617d58fe540b42b28e13c4f8c4674b4eae106bdaea0ccf6b4cc76b03440` (862 files: 862 - 2 deleted +
  2 new). The script fails while a deleted file is still in the index, so I ran `git rm --cached` on the two deleted files
  (`ReviewSignoff.tsx`, `ReviewEnvelope.tsx`); that is the only index change, nothing else is staged and nothing was committed.

### Changed assertions (file:line in the new files; reason; nothing weakened)

- `tests/e2e/review.spec.ts` (rewritten for the new page; the old steps moved, none dropped silently):
  - the first test (about 205-396): the "What you sign" article is now "Timesheet preview"; the envelope, signature preview, missing
    evidence and the sign-off now live in the Send card and the dialog; the sign-off no longer sends (old lines 269-272 expected one
    send request and `data-sent`; now zero send requests and only a `render_pdf` job, old line 280 expected `['render_pdf', 'send_email']`);
    the status after a sign-off is "Signed" / "Not sent yet" (was "Submitted manually", old lines 273 and 287, H-1 a);
    `[data-total="credited"]` became `[data-ot-total]` (the OT totals list was dropped from the footer, as in B7);
  - the stale, finalized-elsewhere, replayed and refused-field tests: every step goes through the dialog (`openSignoff`,
    `confirmSignoff`); the correction needs only a reason (no "Send the email" radio, T03: signing never sends);
  - the no-image test (old 428-458): the image line moved into the dialog; the post-sign "Signed, not sent" heading is gone (a send is a
    separate act), and the empty recipient now shows as a field error in the Send card;
  - own-data test (old 497-509): `[data-envelope="to"] dd` became `#send-field-to`; `[data-signer]` is read in the dialog.
  - New tests: check card, Preview header (hide not wrap, word wrap), one column, signature geometry (and its source numbers),
    "Not signed off" alert, Send disabled before the sign-off, dialog tap targets on the phone.
- `tests/e2e/submission.spec.ts` (old 62-171): the first part signs without a send and then sends from the card with edited values;
  the History resend part (old 139-170) was replaced by the Send card's reason rule (the History resend stays covered by
  `history-settings.spec.ts`).
- `tests/e2e/controls.spec.ts:187-247`: the Review paper test now checks the Preview card (heading "Preview", no checklist, the Send card
  below it, padding read on `.preview-body`) instead of "What you sign" and the 1330px two-column switch (old 195-201, 221-223, 239).
- `tests/e2e/settings-transfer.spec.ts:140,143`: the exported key list and `toMatchObject` gain `show_time_on_pdf` (the export writes it).
- `tests/e2e/history-settings.spec.ts`: new test "Time rows on the PDF" (Settings switch persists and becomes the Send card default).
- `tests/e2e/sharing.spec.ts` (after the shared review-route check): a grantee sees no Sign off, Send, PDF Preview or Save PDF, and the
  shared mount answers 404 to send, send-draft and pdf-preview.
- `tests/client/reviewModel.test.ts`: removed `checklistSteps`, `sendAfterSignoff`, `buildSendBody`, `sendFailureText` tests (the
  functions are gone: the checklist moved into the dialog and sending into the Send card); `sendEmail` left `FormState`; the
  correction/late-review blockers lose the email choice (old 210-222); the request body adds `send_email: false` (old 252-261); new
  `signed` status, header and dialog helper tests.
- `tests/client/deliveryModel.test.ts`: new Send card tests (form, request, attempt key, field rules, button states, earlier copy,
  reason rule, failures, "Signed"/"Not sent yet").
- `tests/client/settingsModel.test.ts` (request gains `show_time_on_pdf: true`, new test), `settingsFileModel.test.ts` (key paths and
  request keys gain `show_time_on_pdf`; new test with and without the key), `otModel.test.ts` (new labels).

### Remaining scope and notes

- UX5-T04 (compact breakpoint, toolbar rules), UX5-T05/T06 and the rest of docs 04/12 and the pilot packet are not touched.
- The mockup shows "From" before the sign-off; the review response has no `sender` (see Deviations). The page says where it comes from.
- "PDF Preview" opens the PDF in a new tab: the server's `frame-ancestors 'none'` and `object-src 'none'` forbid framing it inline,
  and `src/server/` is not owned. If an in-page viewer is wanted, it needs a CSP decision.
- Evidence (5 synthetic renders, `handoff/delivery/evidence/WP5-UX5-T03/`): `review-1440`, `review-390`, `signoff-dialog-1440`,
  `review-signed-1440`, `send-card-reason-dialog`; plus the command logs.

Status: done
