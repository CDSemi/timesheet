# WP5-UX5-T01B dispatch brief (sign off without sending; sends as their own records)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T01B, package WP5, kind
  implement, attempt 1. It depends on WP5-UX5-T01A-FREEZE (done, c1b2cc4).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model **opus**, override `size_risk`.
  - Routing: size L, risk H, novelty yes.
  - This is a "Novel high-risk slice" in the docs/08 sense: atomic finalization and the
    outbox, an uncertain send, a new data model and a migration.
  - Write the task record in English.
- **Sources (read them in full):**
  - the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`:
    - B1, today's flow;
    - B2, the split: state machine, deadline and reminders per F-2 a, auto-submit;
    - **Addendum 1:** B-A1 (signed data versus sends; migration; routes; jobs; automatic
      paths; reminders), B-A2 (the owner's reason rule), B-A4 (re-checks) and E revised
      (the T01b row);
  - the owner's answers, verbatim on the board (`owner_decisions` 2026-10-21):
    - F-2 a;
    - F-3 b: per-send PDF switches, with Settings defaults;
    - F-4: the envelope is editable per send. After a copy was sent, another needs a
      confirmation and a typed reason.
- **AGENTS.md on disk wins.** Rules 4, 6 (local mail capture or dry-run only, no real
  sending), 7, 8 and 11.
- **Base.** HEAD = origin/main = c1b2cc4f31cc9a3957a04056a8dff413977b97b5, or a later commit
  that changes only `handoff/`. The digest is
  783a63f80184da809ca55c4a88f6743bbc049ef2ce28d58237864df1902ee27b (851 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Scope

1. **Sign-off no longer sends.**
   - `POST /api/timesheets/:date/signoff` creates the signed revision, the sign-off and the
     ledger postings, and enqueues only the PDF job: no send job, `send_requested 0`.
   - Corrections and late reviews sign the same way and never send by themselves.
2. **Sends are their own immutable records** (B-A1). Migration **`0015`** (T01A froze
   `0014`):
   - `revision_files` gains a `variant` and the unique key `(revision_id, kind, variant)`.
     Existing rows are mapped as B-A1 says.
   - The new `revision_sends` table, with the fields and triggers of B-A1.
   - `submission_settings` gains `show_time_on_pdf` (default 1).
   - Upgrade test: a populated v14 database with signed, automatic, corrected and sent
     revisions. Rows are kept, variants derived and triggers intact; a fresh build gives
     the same schema.
3. **Routes** (owner only; none on the shared allowlist):
   - `GET /api/revisions/:id/send-draft`: the Send card defaults and `copy_sent_before`.
   - `POST /api/revisions/:id/send` with `{ request_key, to, cc, subject, body_text,
     time_rows, ot_rows, reason? }`:
     - idempotent by `request_key`: the same body replays; a different body gives 409;
     - refused while an attempt is open or uncertain without a decision, or a send job is
       waiting (409);
     - one transaction for the send row, the send job, the variant PDF job when it is not
       stored yet, and the audit `revision.send`.
   - `GET /api/revisions/:id/pdf?time&ot[&disposition=inline]`: the stored variant, or a
     render on request (the `pdfJob` path: no network, atomic file write). On the shared
     mount the query is ignored, as B-A1 says.
   - `GET /api/timesheets/:date/pdf-preview?time&ot`: an unsigned preview that writes
     nothing, as B2 says.
   - The old `/resend` becomes this send with the previous send's values. History's resend
     uses it.
4. **The owner's reason rule** (B-A2):
   - **When a copy counts.** It counts as sent once any attempt of a send was `accepted` or
     `uncertain`. A send whose attempts all ended `failed_permanent` does not count.
   - **Reason required.** When a copy counts, another send requires `reason`: 2-500
     characters after trimming, NFC, no control characters except line feeds. Otherwise
     422 `reason_required`.
   - **The resend decision on an uncertain attempt** also requires the reason.
   - **Where the reason goes.** It is stored on the send and written to the audit event.
     It is not in the email.
   - **Concurrency.** The check runs inside the send transaction; two concurrent sends
     cannot both skip it.
5. **Jobs:**
   - The send job builds the message from its `revision_sends` row: envelope, subject, body
     and the PDF variant. It no longer uses `snapshot.recipients`.
   - It waits for its variant PDF.
   - Per-attempt envelope freezing is unchanged.
6. **Deadline and reminders** (F-2 a, B2 and B-A1):
   - A period counts as submitted once its current revision has a send.
   - Before-due reminders continue until then; when signed, the text is "signed, not sent
     yet".
   - **The deadline scan:**
     - an unfinalized eligible draft with auto-submit on is finalized automatically and
       sent, as today, through a `revision_sends` row with origin `deadline`;
     - a signed-not-sent revision with auto-submit on gets a deadline send of the signed
       revision (origin `deadline`, Settings envelope and switches, no reason; audit
       `deadline.send_signed`);
     - with auto-submit off, the overdue record and warning.
7. **The PDF time rows.** The renderer prints or omits the time rows and the OT rows per
   variant. Change only that switch in `timesheetPdf.ts`; UX5-T02 owns the layout. Every
   variant must stay one page.
8. **Keep the current UI working until UX5-T03.**
   - The current Review "Sign off & Submit" signs off, then sends with the send-draft
     defaults: the minimal client wiring in `ReviewScreen.tsx` / `ReviewSignoff.tsx` /
     `reviewModel.ts` / `api.ts`.
   - History's resend uses the new route, and asks for the reason when one is required.
   - A visible user flow must not break. UX5-T03 builds the real Send card.
9. **docs/01 FR-11** (left over from T01A): it still says manual sign-off requires the
   image. Align it with F-5 b, EN and VI (AGENTS rule 8).

## Tests

- **Integration:**
  - sign-off enqueues no send;
  - send idempotency, the 409 cases, and `reason_required` with the counting rules
    (accepted, uncertain, failed_permanent);
  - two concurrent sends;
  - the resend decision on an uncertain attempt needs the reason;
  - variant rendering: all four variants, each one page; stored once and reused;
  - the shared PDF route ignores the query and never renders;
  - the send job builds from its row;
  - deadline: a draft is finalized and sent; a signed-not-sent revision is sent with auto
    on and warned with auto off;
  - reminders stop at the first send;
  - the migration upgrade;
  - the route inventory gains the new routes, and the shared allowlist is unchanged except
    for the PDF query rule.
- **e2e:**
  - the current Review sign-off still ends with a delivered message in local capture;
  - History's resend asks for a reason after a copy counts.
- **The drill and smoke scripts** follow: sign off, then send. They are not governance
  paths; `scripts/precommit-check.mjs` stays untouched.
- **Mutants:**
  1. sign-off enqueues the send again;
  2. the reason check is skipped;
  3. a `failed_permanent`-only send counts as sent;
  4. the send job reads `snapshot.recipients`;
  5. the shared PDF route honours the query.

## Docs (EN and VI, the same structure)

- **docs/01:** FR-11.
- **docs/03:** records (sends, PDF variants, the Settings switch) and the API boundary.
- **docs/05:** "Manual path" (sign off and send are separate acts), "Durable delivery",
  "Corrections and resends", "Deadline and recovery", "Reminders".
- **docs/06:** AC-06 (wording), AC-07 (auto-send of a signed revision), AC-10 (the time
  rows optional), AC-14 (per-send envelope).
- **docs/10:** one 2026-10-21 entry for F-2 a, F-3 b and F-4, with the reason rule.
- **DEVELOPMENT.md and `.vi.md`:** the migration list.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory.
3. Run every integration file you touched, each once, and `delivery.test.ts` five times.
   A vitest worker crash is a failure.
4. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
5. The mutants.
6. EN/VI parity of every docs pair you touched, then `validate_package.py --preflight` with
   the workflow Python
   `"$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"`.
   Write `<user>` in the evidence.
7. Privacy and whitespace checks.
   - Synthetic data only.
   - Local mail capture only; no real SMTP host.
   - No email in evidence except `@example.invalid`.
8. `npm run verify` with `SMOKE_PORT` in 49680-49699, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
9. `npm run digest` LAST.

**Rules:** no `skip`, `fixme` or `.only`; no dependency change. List every changed assertion
with file:line and its reason.

## Owned paths

- server:
  - `src/server/db/migrations/` (new `0015_*`) and `src/server/db/migrations.ts`;
  - services: `finalization.ts`, `deliveries.ts`, `automation.ts`, `notifications.ts`;
  - jobs: `sendJob.ts`, `pdfJob.ts`;
  - `src/server/mail/message.ts`, `src/server/pdf/timesheetPdf.ts` (the row switches
    only);
  - routes: `submission.ts`, `shares.ts`, `routes/settings*` (only the
    `show_time_on_pdf` field);
  - `src/server/http/schemas.ts`.
- domain: `src/domain/snapshot.ts`, `src/domain/reminders.ts`.
- client (transitional wiring only): `src/client/api.ts`, `src/client/ReviewScreen.tsx`,
  `src/client/components/ReviewSignoff.tsx`, `src/client/components/reviewModel.ts`,
  `src/client/HistoryScreen.tsx`, and any `src/client/components/History*.tsx`.
- scripts: `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs`.
- tests: `tests/integration/`, `tests/client/`, and `tests/e2e/review.spec.ts`,
  `submission.spec.ts`, `history-settings.spec.ts`, `automation.spec.ts`,
  `sharing.spec.ts`.
- docs: `docs/01_PRODUCT_REQUIREMENTS.md`, `docs/03_ARCHITECTURE_AND_DATA.md`,
  `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`, `docs/06_TEST_AND_ACCEPTANCE.md` and
  `docs/10_DECISIONS_AND_SOURCES.md`, each with its `.vi.md`; `DEVELOPMENT.md` and
  `DEVELOPMENT.vi.md`.
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX5-T01B/`

If a change needs any other path, stop and report before editing it, as T01A did.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-T01B`. Ports 49680-49699.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul`, NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm through that Node.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change
  dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

## Addendum 1 (coordinator, after the scope stop)

Your stop is accepted; nothing was edited. Decisions:

1. **Owned paths added:**
   - `src/client/components/DeliveryHistory.tsx`, `DeliveryConfirm.tsx` and
     `deliveryModel.ts`: History's resend, the uncertain-attempt decision, and the reason
     field and its error texts;
   - `src/client/components/DeliveryRevision.tsx` and `DeliveryAttempts.tsx`, only if
     labels must change; say why;
   - `src/server/services/operationsStatus.ts`: one admin row per revision, not per PDF
     variant;
   - `src/client/components/OperationsStatus.tsx`: the wording for "signed, not sent yet"
     instead of "Email not requested";
   - `src/server/services/submissionSettings.ts`: reading and writing `show_time_on_pdf`;
   - `tests/e2e/admin-status.spec.ts`: these tests sign off over HTTP; they now call the
     send route.
2. **Your migration addition is approved.** `0015` creates a `revision_sends` row for every
   existing send job, so a revision sent before the upgrade counts as sent. The deadline
   scan must never send it again, and the reason rule must count it.
   - Map existing jobs to `send_no`, `origin` and the envelope from the snapshot.
   - Cover it in the upgrade test, including a pre-upgrade sent revision that the deadline
     scan then skips.
3. Everything else in the brief is unchanged. Stop again, before editing, if one more path
   is needed.

## Addendum 2 (coordinator, after the second scope stop)

- **Owned path added:** `tests/support/`, the shared test fixtures. Adapt fixtures only so
  that they fit the split. The first case is `tests/support/schemaV6.ts`: it inserts the
  version-6 send jobs itself (`revision:<id>:send_email:initial`) for both revisions, as a
  version-6 sign-off wrote them.
- **List every fixture you change in Results.** Do not weaken what a fixture sets up.
- Start implementing now. Stop again only for a path outside `src/`, `tests/`, the two
  scripts and the listed docs.

## Return

At most 250 words, beginning 'Self-reported model: ...'. Include:
- the changes by area;
- the migration and its test;
- the routes;
- the reason rule as built;
- the transitional UI wiring;
- the files changed;
- the changed assertions;
- unit, integration and full e2e counts per project;
- the mutants;
- parity and preflight;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Results

### Step 0: base (before any edit)

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-T01B`; logs in `logs\`.
- `node --version` v24.21.0. HEAD = origin/main = c1b2cc4f31cc9a3957a04056a8dff413977b97b5.
- `git status --short`: only `handoff/` entries (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT
  EN/VI, WP5-UX5-T01a-FREEZE.md, the T01a-FREEZE evidence folder, this brief). Exit 0.
- `npm run digest`: 783a63f80184da809ca55c4a88f6743bbc049ef2ce28d58237864df1902ee27b (851 files),
  exit 0, equal to the brief.
- Copies of both outputs: `handoff/delivery/evidence/WP5-UX5-T01B/00-base.txt` and `00-digest.txt`.

Self-reported model: claude-opus-5-5 (timesheet-worker-high). Attempt 1.

Status: attempt 1 STOPPED on scope before any edit (stop-and-report rule). Nothing under `src/`,
`tests/`, `scripts/` or `docs/` was edited; only this Results section and the evidence folder were
written.

### Blocker: the owned paths miss the files that carry History's resend, the admin status join and the admin e2e

I read the plan (B1, B2, Addendum 1 B-A1, B-A2, B-A4, E revised), the owner's answers on the board, and
the finalization, delivery, job, message, migration, route, settings and client code. The server part
fits the owned paths. These paths are needed in addition:

1. **History's resend lives in `Delivery*` files, not `History*.tsx`** (required by scope item 8 and the
   e2e "History's resend asks for a reason"). No file matches `src/client/components/History*.tsx`;
   `HistoryScreen.tsx` only mounts `DeliveryHistory`.
   - `src/client/components/DeliveryHistory.tsx`: line 221 posts `/api/revisions/:id/resend`, line 223
     posts the uncertain-attempt decision. Both must switch to the new send route and pass `reason`.
   - `src/client/components/DeliveryConfirm.tsx`: the inline confirmation has no text field; the
     required "Reason for sending another copy" (2-500 characters) goes here.
   - `src/client/components/deliveryModel.ts`: `resendState` (240-249), `confirmationFor` (276-305) and
     `resendFailureText`/`decisionFailureText` need the "copy counts" state, the reason and the
     `reason_required` text.
   - `src/client/components/DeliveryRevision.tsx` and `DeliveryAttempts.tsx`: only if the button labels
     change ("Send another copy..."); can stay unchanged otherwise.
   - Without these, the uncertain "Resend the PDF" decision always fails: an uncertain attempt makes the
     copy count, so B-A2 requires a reason the current UI cannot send. That breaks a visible flow.
2. **`src/server/services/operationsStatus.ts` line 385** (correctness): `LEFT JOIN revision_files f ON
   ... f.kind = 'pdf'` returns one admin row per stored PDF variant once a revision has more than one
   (the new unique key is `(revision_id, kind, variant)`), duplicating the person's row and shifting the
   LIMIT. The join must pick one variant (the sign-off default, or an aggregate). The same file reads
   `send_requested` (lines 379, 420, 463), whose meaning changes for new sign-offs (0).
3. **`tests/e2e/admin-status.spec.ts`** (required for a 0-failed full e2e): both tests sign off over
   HTTP (lines 121-126 and 261-266) and poll up to 150 s for a final delivery state. After the split no
   send is enqueued, so both time out unless they POST `/api/revisions/:id/send` after the sign-off.

Recommended, not strictly required:

4. **`src/server/services/submissionSettings.ts`**: `appendVersion` (INSERT at 276-281), `SettingsRow`,
   `fromRow`, `carry`, `submissionSettingsJson` and `SaveSettingsInput` do not know `show_time_on_pdf`.
   Without this file the new column always keeps its default 1, the brief's `routes/settings*` grant for
   the field cannot be used (the route only calls the service), and T03 must add it. The send-draft and
   the deadline send can still read the column with their own query.
5. **`src/client/components/OperationsStatus.tsx` line 84**: a signed-not-sent revision (now
   `send_requested 0`) shows "Email not requested" to the administrator; "Not sent yet" would match the
   new flow. Wording only; can wait for T03/T06.

### Recommended resolution

- Add to the owned paths: `src/client/components/DeliveryHistory.tsx`, `DeliveryConfirm.tsx`,
  `deliveryModel.ts` (plus `DeliveryRevision.tsx` and `DeliveryAttempts.tsx` for labels),
  `src/server/services/operationsStatus.ts` and `tests/e2e/admin-status.spec.ts`. Preferably also
  `src/server/services/submissionSettings.ts` and `src/client/components/OperationsStatus.tsx`.
- The server design is settled and ready to implement:
  - `0015_sends.ts`: `revision_files` rebuilt (twelve-step, as 0013/0014) with `variant` in
    `t1o1|t1o0|t0o1|t0o0`, existing rows `t1o1`, or `t1o0` when the snapshot has `show_ot_on_pdf = false`
    (`json_extract(payload_json, '$.show_ot_on_pdf')`), unique `(revision_id, kind, variant)`, its four
    triggers recreated (identity also freezes `variant`); new `revision_sends` with B-A1's fields,
    `UNIQUE (revision_id, send_no)`, `UNIQUE (request_key)`, composite owner FKs, no-update/no-delete
    triggers; `submission_settings.show_time_on_pdf INTEGER NOT NULL DEFAULT 1 CHECK (0/1)`. Every
    existing `send_email` job gets one backfilled send row (envelope, subject and bodies from its
    snapshot's `recipients`, `send_no` by job creation order, `request_key` `migrated:<job id>`, the
    derived variant, no reason). Without it a v14 revision already sent would count as "not sent" and
    the deadline scan would send it again; with it the send job needs no `snapshot.recipients` path.
  - Sign-off, correction and late review enqueue only `render_pdf` (variant from Settings and the
    snapshot) with `send_requested 0`; `send_email` in the correction and late-review bodies stays
    accepted and is not acted on (the transitional client sends afterwards when the person chose yes).
  - `POST /api/revisions/:id/send` in one IMMEDIATE transaction: idempotency by `request_key` (same body
    200 replay, other body 409), 409 when an attempt is open/uncertain-undecided or a send job waits, the
    B-A2 count (`accepted` or `uncertain` attempt of any revision of the period) inside the transaction,
    422 `reason_required`, then the send row, `send:<id>` job, variant PDF job if missing, audit
    `revision.send` with the reason. `/resend` and the uncertain "resend" decision call the same service
    with the previous send's values (the decision takes `reason`).
  - The send job loads its `revision_sends` row, waits for the variant PDF, and builds the message and
    the frozen envelope from the row (`message.ts` gains a source that takes envelope, subject and bodies).
  - Deadline: draft -> `finalizeAutomatically` plus a `deadline` send row; signed-not-sent with auto on ->
    a `deadline` send (audit `deadline.send_signed`); auto off -> the overdue record. Reminders count a
    period as submitted once its current revision has a send row.

Evidence: the baseline above only. No command beyond `node --version`, `git rev-parse`, `git status
--short`, `npm run digest` and the evidence copy was run; nothing was built, tested or verified.

### Attempt 1 after Addendum 1: second scope stop (before any edit)

Addendum 1 read. Before editing I traced every caller of `signOffTimesheet`, the send job, the
revision files and `send_requested` outside the owned paths. One more required path:

- **`tests/support/schemaV6.ts`** (required; shared fixture of `restore.test.ts` and
  `upgrade.test.ts`). `buildSchemaV6` signs off two periods with the real
  `signOffTimesheet` on a version-6 database (lines 70-79). Then it looks up the sign-off's
  `send_email` job and throws "Send job of the signed-off revision missing" when there is none
  (lines 85-86). After the split, sign-off enqueues no send job (scope item 1, mutant 1). The
  fixture must then insert the WP3-era send job itself, with the same columns and business key
  `revision:<id>:send_email:initial` that a v6 sign-off wrote. Version 6 has no `revision_sends`,
  so a direct `INSERT INTO jobs` in the fixture is the faithful way. The `queued` revision needs the
  same. Without this, every test that builds the v6 fixture fails before it starts.

Checked and not needed: `tests/support/concurrency.ts` only signs off and renders PDFs. In
`tests/e2e/fixtures.ts`, `drainJobsFrom` runs at +0, 2, 4, 10, 12 and 14 minutes, which covers the
send job's one-minute `pdf_not_ready` retry. `src/server/ops/restore.ts` keys only on job kind
and attempts. `pdf-visual.spec.ts` signs off and reads the stored PDF, with no send expected.

Request: add `tests/support/schemaV6.ts` to the owned paths. Nothing else was edited.

### Attempt 1 after Addendum 2: implementation (in progress)

- Server, data, PDF and client changes written (see the final summary below). `npm run typecheck`:
  server and client compile; only `tests/integration/delivery.test.ts` (old `buildMessage` source) failed.
- First full `npx vitest run` (log `logs\13-vitest-first.txt`): 86 failed, 2122 passed, 25 skipped
  (the 25 skips are pre-existing). All failures are the expected fallout of the split: sign-off no longer
  sends, migration 15 changes the latest version, revision files carry a variant, and the route
  inventory has new routes. The tests are being adapted next.
- Fixture changed: `tests/support/schemaV6.ts` inserts the version-6 initial send job
  (`revision:<id>:send_email:initial`, payload `{revision_id}`) for both signed revisions, as a WP3
  sign-off wrote it. Nothing it sets up is weakened.
- Tests adapted, new `tests/integration/sends.test.ts` (16 tests), migration 0015 tests in
  `migrations.test.ts`. Full `npx vitest run` (log `logs\29-vitest-full.txt`): 98 files, 2260 passed,
  0 failed, 0 skipped, exit 0. Typecheck, lint, build: exit 0, no chunk advisory
  (`logs\33-summary.txt`). Smoke on port 49693 (49681 is taken by another process): SMOKE PASSED
  (`logs\34-smoke.txt`).
- Docs EN/VI edited: docs/01 FR-11, docs/03, docs/05, docs/06, docs/10, DEVELOPMENT.

### Changes by area

- **Data, migration `0015_sends`** (`src/server/db/migrations/0015_sends.ts`, registered in
  `migrations.ts`):
  - `revision_files` is rebuilt with `variant` (`t1o1|t1o0|t0o1|t0o0`) and the unique key
    `(revision_id, kind, variant)`. Existing rows get `t1o0` when their snapshot hid the OT rows,
    else `t1o1`. Rowids are kept and the four triggers recreated; the identity trigger now also
    freezes `variant`.
  - New `revision_sends` table (B-A1 fields; the reason is 2-500 characters or null, deadline sends
    carry no actor and no reason) with three triggers: no-update, no-delete, and the job must be a
    `send_email` job of the same revision. Unique keys `(revision_id, send_no)`, `(user_id,
    request_key)` and `job_id`.
  - Backfill: one record for every existing `send_email` job (`send_no` in job order, `deadline`
    origin for an automatic revision's initial job, envelope, subject and bodies from the snapshot,
    `request_key` `migrated:<job id>`).
  - `submission_settings.show_time_on_pdf` is added (default 1).
- **Services:**
  - `deliveries.ts` holds the send records. It provides the draft defaults from the current
    Settings, the send (idempotent by request key; 409 rules; the reason rule inside the
    transaction; one transaction for the record, the `send:<id>` job, the variant PDF job and the
    `revision.send` audit) and `/resend` (the previous send's values). It also provides the
    uncertain decision (reason required), `sendSignedAtDeadline` (audit `deadline.send_signed`) and
    `periodHasSend`.
  - `finalization.ts`: sign-off, corrections and late review enqueue only the PDF and store
    `send_requested 0`. `send_email` is accepted and not acted on. `finalizeAutomatically` writes a
    `deadline` send record.
  - `automation.ts`: a signed revision never sent is treated like a draft (switch on: deadline send;
    off: overdue). A period with a send is skipped.
  - `notifications.ts` + `domain/reminders.ts`: a period is submitted once it has a send. The
    before-due and overdue notices of a signed period say "signed, not sent yet".
  - `operationsStatus.ts`: one admin row per revision (its first PDF row; no snapshot is read).
  - `submissionSettings.ts`: `show_time_on_pdf` is read, written and carried. Its column is written
    only when off, so the seed and the old-schema fixtures still work.
- **Jobs and mail:**
  - `pdfJob.ts` renders per variant. A job without a variant renders the sign-off default.
    `renderRevisionPdf` is shared with the owner route.
  - `sendJob.ts` loads its send record by job id and waits for that variant's PDF. It builds the
    message from the record and freezes `send_id` in the envelope; an older envelope still matches.
  - `message.ts` builds from a `SendContent`, never from the snapshot.
  - `timesheetPdf.ts`: only the optional `rows` switch, `{ time, ot }`.
- **Routes:**
  - `GET /api/revisions/:id/send-draft`, `POST /api/revisions/:id/send` and
    `GET /api/timesheets/:payrollDate/pdf-preview` are new. `/resend` and the decision route now take
    a reason.
  - `GET /revisions/:id/pdf?time&ot&disposition` renders on request for the owner. The shared mount
    (`sharedPdf`) ignores the query and never renders.
  - The revision list reads the default variant's PDF state. `show_time_on_pdf` is added to the
    settings route and schema. The shared allowlist is unchanged.
- **Client, transitional:**
  - `ReviewScreen`/`reviewModel` sign off, then GET send-draft and POST send with its defaults. The
    send failure is shown in words, and the heading is "Signed, not sent" when the send was
    refused.
  - The late review asks for a reason when sending (`ReviewSignoff`). A correction reuses its
    reason. `deliveryStatus` says "Not sent yet" without a send job.
  - History (`DeliveryHistory`, `DeliveryConfirm`, `deliveryModel`) resends through the draft and
    `POST /send`. Once a copy counts it asks for a reason, also for the uncertain resend.
  - `DeliveryRevision` changed only to pass `copySent` and the reason into the confirmation it
    builds; labels are unchanged. `DeliveryAttempts` is unchanged.
  - `OperationsStatus`: "Signed, not sent yet" / "Not sent yet".
- **Scripts:**
  - The smoke script sends after the sign-off, with 2 new checks.
  - The drill's `signOffPeriod` sends when the build did not queue a send itself; it saves
    example.invalid recipients once if none are set. The drill's migration list includes 0015.
- **Fixtures (tests/support):**
  - `schemaV6.ts`: the version-6 send jobs.
  - New `sends.ts`: `sendWithDefaults`.
  - `concurrency.ts`: a new `send` race operation. No existing operation changed.

### The reason rule as built

A copy counts once any attempt of any revision of the period was `accepted` or `uncertain`. When a
copy counts, a send (and the uncertain "resend" decision) needs a reason: NFC, CRLF to LF, trimmed,
2-500 code points, no control characters except a line feed. A missing reason is 422
`reason_required` and a malformed one is 422 `invalid_reason`; nothing is written in either case.
The reason is stored on the send, on the `revision.send`/`revision.resend`/`delivery.decision`
audit event (reason field) and never in the email. The check runs inside the IMMEDIATE send
transaction. Deadline sends never need one.

### Changed assertions (file:line in the new file; reason)

- Sign-off no longer sends:
  - `finalization.test.ts:198-244, 270, 331, 336`, `finalization-concurrency.test.ts:176`: jobs are
    PDF only, `send_requested` false and the PDF job payload carries `variant`.
  - `corrections.test.ts:285-303, 685-695`: `send_email` true/false enqueues PDF only.
  - `jobs.test.ts:285, 313`: the file has `variant`; no send job.
  - `jobs-restart.test.ts:245, 287-301`: no send job, CLI claims 3.
  - `review.spec.ts:278-280, 449-457` and `reviewModel.test.ts:344-353`: "Not sent yet" replaces
    "Email not requested", and the name-only account without recipients now shows "Signed, not sent".
- Sends are records:
  - `delivery.test.ts:332, 347, 350-351, 367-368, 450-451`: the message and envelope are compared
    with the send record.
  - `delivery.test.ts:417-420`: the duplicate key is `send:<id>`.
  - `delivery.test.ts:583-612`: the resend decision needs a reason; the response has `send`/`job`
    and no attempt is created at request time.
  - `delivery.test.ts:707-708`: the builder takes `send`.
  - `delivery.test.ts:890`: a second copy needs a reason.
  - `corrections.test.ts:807-842`: the resend is a send record; the reason is needed and no
    `preparing` attempt is created at request time.
  - `corrections.test.ts:888`: `envelope_changed` details are `fields`, no `new_revision_required`.
  - `corrections.test.ts:899-916`: no `pdf_not_ready` refusal; a reason is needed for the correction.
  - `restore.test.ts:381`: the new job is found by kind.
  - `restore.test.ts:481-483`: the held job is refused as `superseded_by_later_send` (an attempt is
    created only when the job runs).
- Owner PDF route: `pdf-download.test.ts:191-221` renders on request (200) instead of 409.
- Latest schema 15:
  - `migrations.test.ts:124, 160, 283, 309, 321, 338, 531, 537, 563, 1921, 1947`.
  - `job-retention.test.ts:312-334`, `workbook-import.test.ts:159-216`, `restore.test.ts:1281`.
  - `migrations.test.ts:1837, 1895, 2112, 2178, 2200`: the 0013/0014 tests stop at `UP_TO_14`.
  - `migrations.test.ts:2081`: the v13 fixture writes a version-13 automatic revision instead of
    calling today's `finalizeAutomatically`.
- Reminders, per F-2 a: `reminders.test.ts:398-440, 475-495` stop at the first send. A signed
  period gets "signed, not sent yet".
- Route inventory: `sharing-matrix.test.ts:327`, `ot-api.test.ts:542` add the three new routes.
- Deadline race: `deadline-race.test.ts:174-179`. The next tick sends a manually signed period.
- History e2e: `submission.spec.ts:139-166`, `history-settings.spec.ts:334-344, 407-410`. The
  reason is asked for after a counted copy and on the uncertain resend.
- Scripts: `smoke-built-server.mjs:384-407` and `container-drill.mjs:786, 1196` (send step,
  migration list).

### Checks (actual results; logs in `D:\.claude-tmp\timesheet\WP5-UX5-T01B\logs`, copies in the evidence folder)

- `npm run typecheck`, `npm run lint`, `npm run build`: exit 0. The build shows no chunk advisory.
- `npx vitest run` (full): 98 files, 2260 tests passed, 0 failed, 0 skipped.
- Every touched integration file once (22 files, `upgrade.test.ts` included): 475 passed, exit 0.
  `delivery.test.ts` five times: 27/27 each run, exit 0. No worker crash.
- Full e2e (`npm run test:e2e`, alone, real clock, both projects, one run): 779 passed, 101 skipped,
  0 failed, exit 0, 16.7 min. Desktop: 407 passed, 33 skipped. Mobile: 372 passed, 68 skipped. The
  skips are the existing project-specific skips; this change adds no `skip`, `fixme` or `.only`.
- Mutants, each run then restored; `cmp` confirms the four files are back byte for byte:
  1. sign-off enqueues the send again: killed, 14 failures (`sends`, `finalization`);
  2. the reason check is skipped: killed, 6 failures (`sends`, `corrections`);
  3. a `failed_permanent`-only send counts as sent: killed, 2 failures (`sends`, `delivery`);
  4. the send job reads `snapshot.recipients`: killed, 1 failure (`sends`);
  5. the shared PDF route honours the query: killed, 1 failure (`sends`).
- EN/VI parity of docs 01, 03, 05, 06, 10 and DEVELOPMENT: headings, bullets, table rows and AC/FR
  ids are equal (`parity.mjs`). `validate_package.py --preflight` with the workflow Python 3.12.14
  (`<user>`): PASS, 120 translation pairs, 2337 local links.
- Privacy and whitespace: `git diff --check` clean, no trailing whitespace in the new files. The
  only addresses in the changes and the evidence are `@example.invalid` (and `@timesheet.invalid`
  Message-IDs). Mail is local capture or the loopback test sink only.
- The container drill was edited but not run (it needs Docker and the previous build).

### Deviations and notes

- **"Submitted" means the period has a send on any revision**, not "its current revision has a
  send". With the literal rule, a correction or late review made after a sent copy would be sent
  automatically by the next deadline scan, and its reminders would restart. That contradicts
  "corrections never send by themselves" and B-A1's "automatic paths run only when no copy counts".
  Documented in docs/05 and docs/10. The owner can reverse it.
- The "sign-off default variant" is time rows on plus the snapshot's OT switch, the variant every
  pre-split PDF printed. Settings `show_time_on_pdf` sets the defaults of a send (the draft and the
  deadline sends). The sign-off's own PDF does not use it.
- `submissionSettings` writes the new column only when it is off. The synthetic seed and the
  old-schema fixtures call the service on schemas before 0015.
- Admin status picks a revision's first PDF row, because the admin service may not read snapshots
  (`isolation.test.ts` column allowlist).
- The audit operation label for `revision.send` and the History display of the reason belong to
  T03 (`otModel.ts` is not owned). docs/04 and the pilot packet still describe "Sign off & Submit"
  as one act (T06).
- Smoke port 49693: 49681 is held by another process on this host.
- Two earlier scope stops are recorded above.

### Final commands

- `npm run verify` with `SMOKE_PORT=49693` and `DATA_DIR`/`DATABASE_PATH` in the task folder: exit 0.
  The tests passed (98 files, 2261 tests; one more than the earlier full run, the PDF variant test
  added since), and the build and smoke passed (`logs\60-verify.txt`).
- `npm run digest` (last command): 089cf86879b11cb8eedbb29aa5d8f0573815672ff691227fe3db73209c9811d1
  (854 files, handoff/ excluded), exit 0.
- No background task is running. Nothing committed.

Status: done
