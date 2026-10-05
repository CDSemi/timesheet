# WP3-T07B dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T07B; package WP3; kind implement;
  attempt 1; depends on WP3-DOC-FREEZE. Title: automatic submission presentation — note
  line, image option, no automatic indicator.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (what payroll receives; a schema migration; snapshot version), novelty
  no.
- **G-Q answers** (owner, 2026-10-04, verbatim "* G-Q1: b * G-Q2: a"; board
  `owner_decisions`):
  - G-Q1 (b): the image option remains the existing explicit, audited auto-image
    authorization; the change is that the signature-upload flow asks for it with the
    option pre-selected. If the server needs support for that (for example an optional
    `authorize_auto_image` flag on the upload that performs the same audited authorization
    in the same transaction), add it here with tests; the UI checkbox itself is T13. No
    authorization exists until the user confirms (schema default unchanged).
  - G-Q2 (a): one domain function returns "Submitted" for manual and automatic
    submissions, or the note text for an automatic submission whose note line is on; it
    replaces the hardcoded "Signed by employee" found by T10.
- Read AGENTS.md from disk first. Then read:
  - [WP3-REQ2](WP3-REQ2.md) items 2 and 3 (binding: the revised T07B scope, schema,
    validation, snapshot v2, renderer inputs, `{SignOffStatus}`, the tests that must
    change and the new tests), as amended by the G-Q answers;
  - the canonical documents as updated by WP3-DOC (docs/02 R-07, docs/04, docs/05, docs/06
    AC-07/AC-10, docs/10);
  - the results of WP3-T01, T03, T04, T07, T08 (PDF job input), T10 (automatic snapshot)
    and the T10 finding that the snapshot hardcodes "Signed by employee".
- Baseline: main at the WP3-DOC-FREEZE commit (the coordinator gives the SHA in the
  dispatch prompt). The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Use
  `D:\timesheet-tmp\WP3-T07B` for TEMP/TMP; delete only files you created; never remove
  folders recursively. If a shell call fails with ENOSPC, stop and report. Never write
  into the repository root. On Windows, never redirect to /dev/null or nul from a POSIX
  shell. Evidence scripts are stored as `*.mjs.txt` or `*.py.txt`. No user-profile path
  literals in source or tests.
- Synthetic data only (generated names, images and dates). Commit no PDF. Do not commit.

## Required changes (binding; details in WP3-REQ2 item 3)

1. Migration 0005 (`0005_automatic_presentation.ts`): `auto_note_enabled` (0/1, default 0)
   and `auto_note_text` (default "Automatic submission", 1–120 characters, one line);
   0001–0004 untouched.
2. Settings: validated note fields (NFC, trimmed, one line, no control characters, no
   braces), versioned with audit; the image option stays the existing audited auto-image
   authorization (default per G-Q1).
3. Snapshot v2 with `auto_note`; `{SignOffStatus}` from one domain function per G-Q2,
   used by the preview, manual and automatic snapshots; v1 payloads still render (note
   off).
4. Renderer and PDF job: inputs `signerName` (manual = stored `signer_name`, fixing the
   T07 defect; automatic = employee name) and `automaticSubmittedAt` (automatic = the
   revision's creation instant); no banner and no origin word anywhere; the signature
   block prints the name and the local date (reporting zone); the note line only for
   automatic revisions with the note on; the image on automatic revisions only when
   authorized; identical bytes for identical input.

## Owned (writable) paths

As listed in WP3-REQ2 item 3: `src/server/db/migrations/0005_automatic_presentation.ts`
(new), `src/server/db/migrations.ts`, `src/server/services/submissionSettings.ts`,
`src/server/routes/settings.ts`, `src/server/http/schemas.ts`, `src/domain/snapshot.ts`,
`src/domain/emailTemplate.ts` (the `{SignOffStatus}` text function only),
`src/server/services/reviewPayload.ts`, `src/server/services/finalization.ts` (only if
the automatic snapshot builder needs the new fields), `src/server/pdf/timesheetPdf.ts`,
`src/server/pdf/layout.ts`, `src/server/jobs/pdfJob.ts` (input mapping only),
`src/server/routes/signatures.ts` and `src/server/services/signatures.ts` (only for the
optional G-Q1 upload-time authorization) with `tests/integration/signatures.test.ts`, the
tests named there (migrations, submission-settings, review-payload, pdf-render, canonical,
email-template, jobs input mapping), this report and handoff/delivery/evidence/WP3-T07B/.

List any other minimal edit as a deviation.

## Checks

- The tests that must change and the new red-first tests listed in WP3-REQ2 item 3,
  including: an automatic PDF with the note off contains no "automatic", "pending" or
  note text and prints the name and the submission date; its extracted text equals the
  manual PDF's for the same snapshot, name and date (image aside); the note on shows
  custom Vietnamese text; the note is ignored on manual; the image only when authorized;
  the date across a DST-change week with the production zone functions; validation
  refusals; audit of a note change; the v4→v5 upgrade with rows. At least five mutation
  checks (the list in item 3), each caught (compute the mutation before opening a file
  for writing; restore byte-identical).
- Run `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`
  (exit 0, no deprecation line) and `npm run digest` as the **last** commands, after the
  final edit; if any file changes afterwards, run both again.
- Optionally render one synthetic automatic and one manual page to PNG for your own
  visual check; do not commit them. Record what you checked.
- Evidence masked, LF, free of trailing whitespace, single final newline.

Return at most 160 words, beginning with your self-reported model: the schema, settings,
snapshot and renderer changes, the `{SignOffStatus}` text, red/green and mutation counts,
verify exit and test count, digest, and deviations.

## Results

### Worker result (attempt 1, 2026-10-05)

- Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high, effort not observable). Baseline main at
  `da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d`, source digest `4d4c4863...8078f`; the working tree differed only in handoff/.
  Nothing was committed; no agent was spawned; no shared state was edited.
- Outcome: complete. `npm run verify` exit 0 (54 files, 1232 tests, smoke 28 PASS lines and SMOKE PASSED on schema v5, no warning line);
  source digest after the final edit `5e37ab987f5f542a18a1c544f3c0dc538fb77bbe27927650a9b5428e3a609bcf` (680 files,
  handoff/ excluded). Verify and digest were the last commands run on the repository after the final source edit; after
  them only evidence/brief text under handoff/ and the removal of my own temporary files changed.

#### What changed

- **Schema (migration 0005 `automatic_presentation`, 0001-0004 untouched, 0004 checksum now pinned in a test):**
  `submission_settings.auto_note_enabled INTEGER NOT NULL DEFAULT 0 CHECK (IN (0,1))` and
  `auto_note_text TEXT NOT NULL DEFAULT 'Automatic submission' CHECK (length BETWEEN 1 AND 120, no LF, no CR)`;
  `ALTER TABLE ADD COLUMN`, so existing versions read as "off, default text", no row is rewritten and the immutability
  triggers stay. `migrations.ts` lists it.
- **Settings:** `submissionSettings.ts` carries the two fields through every version (save, authorize, revoke), JSON
  `auto_note: {enabled, text}`, save body `auto_note_enabled` / `auto_note_text` (both optional, omitted keeps the current
  value), 422 `invalid_auto_note` from one domain check `checkAutoNoteText` (NFC, trimmed, 1-120 code points, no control,
  format, line/paragraph-separator character, no `{` or `}`); audit before/after now include the two fields and
  `auto_note_changed`; a note change is not a template change and does not move the auto-submit instant. Preview
  `sign_off` is now `manual | automatic` (default manual; the retired `signed` / `review_pending` are 422).
- **Image option (G-Q1 b):** unchanged control (the explicit, audited auto-image authorization, default off). Server
  support added: `POST /api/signatures?authorize_auto_image=true` stores the image and performs the same audited
  authorization in the same transaction (`saveSignatureAndAuthorizeAutoImage`, `authorizeAutoImageInTransaction`); the
  response is `{signature, settings}`. The flag is `true` or `false` once (anything else 422 `validation_error`); absent
  means no authorization. If no settings are saved yet the whole upload is refused (422 `submission_settings_required`;
  no attachment, audit event or file remains), because the authorization needs a settings version; the T13 UI should send
  the flag only when settings exist. The upload audit event itself is unchanged; the authorization is its own event.
- **Snapshot v2:** `SNAPSHOT_VERSION` 2 adds `auto_note: {enabled, text}` (typed optional: a v1 payload has none).
  `normalizeReviewSnapshot` reads v1 (adds nothing, so its stored hash stays valid; a v1 payload carrying a note is
  refused) and v2 (note required and validated); versions 0 and 3+ are refused. `autoNoteOf` gives "off" for v1.
- **`{SignOffStatus}` (G-Q2 a):** one domain function `signOffStatusText(origin, autoNote)` in `emailTemplate.ts`:
  `Submitted` for manual and automatic submissions, or the note text for an automatic submission whose note is on. Used
  by the preview, `buildReviewPayload` (new `origin` parameter, default `manual`; the manual path and late review use
  it) and the deadline snapshot (`finalizeAutomatically` passes `automatic`, the only change in `finalization.ts`). The
  hardcoded "Signed by employee" (`MANUAL_SIGN_OFF_STATUS`) is gone.
- **Renderer (`timesheetPdf.ts`; `layout.ts` needed no change):** inputs `signerName` and `automaticSubmittedAt` added.
  No banner, no origin word in the header ("Revision N") or the footer. The signature block always prints the signer
  name and the local date (reporting zone of the snapshot) of `signedAt` (manual) or `automaticSubmittedAt` (automatic).
  Note line only for automatic revisions with the note on, one line at the old banner position. Refusals: manual needs
  `signedAt`, an image and a name and no automatic instant; automatic needs `automaticSubmittedAt`, refuses `signedAt` and
  refuses an image unless `snapshot.auto_image.authorized`. Manual image is now required (WP3-REQ2 item 3).
- **PDF job (`pdfJob.ts`, input mapping only):** manual `signerName` = stored `signoffs.signer_name` (fixes the T07
  defect); automatic `signerName` = snapshot employee name and `automaticSubmittedAt` = the revision's `created_at`.

#### Tests (red first)

- Red before any source change: `01-red.txt` (95 of 492 tests failing across the changed suites; the canonical suite did
  not load in that run because of a string-escape slip in my new test, fixed before any source change) and
  `01b-red-canonical.txt` (3 new canonical tests red against the baseline `snapshot.ts`, restored byte-identical).
  Green: `02-green.txt` (17 files, 561 tests).
- New or changed tests: pdf-render (no indicator, equal text and items to the manual PDF, note on Vietnamese, note ignored
  on manual, v1 payload, image only when authorized, stored signer name, validation refusals, byte-identical output,
  six DST-boundary days around 2026-03-08 and 2026-11-01 with `startOfLocalDay` of the production zone functions, a
  non-LA zone, never the clock); migrations (v5, defaults, CHECK refusals, immutability, v4 to v5 upgrade with rows, 0004
  checksum pin); submission-settings (defaults, note save/keep/NFC/trim/120 characters, 13 refusals and wrong types,
  audit of a note change, carry through authorize/revoke, stale save, owner scoping, preview origins, retired values);
  review-payload (frozen note, manual "Submitted", automatic equals manual with the note off, note text in status,
  subject and bodies with the note on, escaping); canonical (v2, v1 read, note validation, hash sensitivity);
  email-template (`signOffStatusText`); signatures (upload consent: default off, one transaction with two audit
  events, move to a new image, rollback with no file, bad flag values, owner scoping, refused image); jobs (manual
  stored-name mapping, automatic creation-instant mapping at 22:30 Los Angeles on 09/29 while the UTC date is 09/30,
  image and note only when authorized and enabled, frozen status and subject).
- Mutations: `03-mutations.txt`, 19 of 19 caught, each restored byte-identical (banner restored, origin label in header
  and footer, note shown when off, image placed when unauthorized, date from the clock in the renderer and in the job,
  profile name instead of stored name, note for manual status, hardcoded "Signed by employee", deadline builder
  manual, braces allowed, limit 121, v1 gains a note, audit omits the note, no NFC/trim, upload authorizes by default,
  non-atomic authorization, schema default on).
- Visual check: no PDF-to-image tool exists on this host (no pdftoppm, mutool, Ghostscript, canvas), so no PNG was
  rendered; `04-layout-check.txt` reads one manual and two automatic PDFs back with pdfjs (text, order, image count; zero
  automatic/pending/review words, the signer name and `10/07/2026` in the same place for manual and automatic).

#### Deviations and observations

- No edit outside the owned paths. `finalization.ts`: one argument and one comment line. `layout.ts` unchanged.
- The renderer now refuses a manual revision without an image (WP3-REQ2); the T07 tests that rendered a manual PDF
  without one were adapted (the default manual fixture has an image; "no image" cases use an automatic revision).
- `tests/client/reviewModel.test.ts:73` (not owned) still has the fixture string `Signed by employee`; it is not asserted
  and typechecks, so it is left. The docs, the Vietnamese mirrors and `reference/examples/policy.example.json` are the
  doc worker's (the example's `{SignOffStatus}` text is unaffected by the code).
- The audit of a settings change now contains the user's note text (their own label, bounded to 120 characters, no
  address or template text); the file header says so.
- Temporary files: I created and removed only my own files under the task TEMP folder (scripts, raw logs, vitest cache);
  the empty folder remains. Evidence: `handoff/delivery/evidence/WP3-T07B/` (01-red, 01b-red-canonical, 02-green,
  03-mutations, 04-layout-check, 05-verify, 06-digest, mutate/sanitize/layout scripts as `.txt`).
- Commit description (for the committer): "Show automatic submissions without an automatic indicator: optional note line,
  authorized image only, one SignOffStatus text, snapshot v2 and migration 0005".
