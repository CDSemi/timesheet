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

(Worker appends here.)
