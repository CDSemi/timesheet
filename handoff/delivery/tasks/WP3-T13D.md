# WP3-T13D dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13D; package WP3; kind implement;
  attempt 1; depends on WP3-T12-FREEZE. Runs before WP3-DOC/T07B/T13 by coordinator
  decision: it implements the owner's F-3 and F-Q3 decisions (the admin boundary) and
  does not depend on the pending G-Q1/G-Q2.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (the admin privacy boundary; a field allowlist), novelty no.
- Read AGENTS.md from disk first, including the whole UI standards section. Load the
  design skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` with the Skill tool before any UI or CSS edit; AGENTS.md and
  the E-8 tokens win. Then read:
  - the board `owner_decisions` of 2026-10-04 (F-3: the admin sees everything except each
    person's timesheet details; F-Q3 (b): the admin also sees recipient addresses, not
    templates or message content);
  - [WP3-REQ](WP3-REQ.md) section A, the "Definition of 'timesheet details' (F-3)"
    (around line 358) and the D/E rows for T13D, as amended by [WP3-REQ2](WP3-REQ2.md)
    item 4 (the T13D row and the "Admin status" matrix row) — binding;
  - observation O8 in WP3-REQ (the admin router is pinned by
    tests/integration/isolation.test.ts) and the WP2 privacy precedents WP2-A-01 and A3-01
    in [WP2_HANDOFF](../WP2_HANDOFF.md);
  - the results of WP3-T08 (heartbeat), T09 (delivery attempts, redaction), T10
    (activation route) and T11.
- Baseline: main at 8e2c2bf288030a48ee4a58fe9a9d86b3df01e818 (the WP3-T12-FREEZE commit).
  The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Use
  `D:\timesheet-tmp\WP3-T13D` for TEMP/TMP; delete only files you created; never remove
  folders recursively. If a shell call fails with ENOSPC, stop and report. Never write
  into the repository root. On Windows, never redirect to /dev/null or nul from a POSIX
  shell. Evidence scripts are stored as `*.mjs.txt` or `*.py.txt`. No user-profile path
  literals in source or tests.
- Synthetic data only; the e2e runs on the installed Edge channel. Do not commit.

## Required changes (binding)

1. **Operations status service** (`src/server/services/operationsStatus.ts`) with an
   explicit column allowlist: system status (sender configured, outbound mode, runner
   heartbeat, activation instant, job and delivery totals by state) and per-person,
   per-period submission and delivery status (person, period, revision number, origin as
   the system records it, review state, PDF state, delivery state and redacted fault
   code, recipient addresses of the effective settings and of frozen envelopes per
   F-Q3 (b)). Never: day entries, sessions, breaks, leave, minutes, notes, OT ledger
   lines, review snapshots, PDFs, signature images, templates, subject or body, Message-ID,
   raw provider responses, audit payloads (A3-01: `refreshed_pay_period` never appears).
   Nothing derived from day entries or sessions (WP2-A-01 stays).
2. **Admin routes** (`src/server/routes/admin.ts`): read-only, admin-only status routes
   (for example `GET /api/admin/operations` and `GET /api/admin/submissions`), write-free;
   non-admins get 403; the activation route from T10 stays.
3. **Admin UI** (`src/client/AdminScreen.tsx`, `components/OperationsStatus.tsx`,
   `api.ts`, `styles.css`): a status panel and a per-person submission/delivery table;
   token-only CSS (only `@media` conditions literal), the 4px radius token, the shared
   `--transition`, accessible and mobile-first.
4. **isolation.test.ts** changes deliberately (WP3-REQ D): the exact admin route list adds
   the new routes; the admin path regex still refuses timesheet/day/session/ledger/leave/
   history/evidence/export/policy names; the `admin.ts` import scan allows
   `services/operationsStatus.ts`.

## Owned (writable) paths

- src/server/services/operationsStatus.ts (new) and src/server/routes/admin.ts.
- src/client/AdminScreen.tsx, src/client/components/OperationsStatus.tsx (new),
  src/client/api.ts and src/client/styles.css.
- tests/integration/operations-status.test.ts (new), tests/integration/isolation.test.ts
  and tests/e2e/admin-status.spec.ts (new).
- This report and handoff/delivery/evidence/WP3-T13D/.

List any other minimal edit as a deviation.

## Checks

- Red-first tests for: every field of every admin response is in the allowlist (a test
  serializes each response for a seeded period and searches it for that period's notes,
  minutes, session instants, subject/body text, template text, Message-ID and
  `refreshed_pay_period`: none found); recipient addresses appear (F-Q3 (b)); non-admin
  403; the routes write nothing; the isolation inventory updated. At least two mutation
  checks, each caught (compute the mutation before opening a file for writing; restore
  byte-identical).
- `tests/e2e/admin-status.spec.ts` on both projects with synthetic screenshots
  `admin-status-*-synthetic.png` in the evidence directory; view them and record what you
  checked. A literal scan of styles.css against the T12 baseline: zero new raw literals.
- Run `npm run test:e2e`, then `npm run verify` with
  `NODE_OPTIONS=--trace-deprecation --pending-deprecation` (exit 0, no deprecation line)
  and `npm run digest` as the **last** commands, after the final edit; rerun verify and
  digest if any file changes afterwards.
- Evidence masked, LF, free of trailing whitespace, single final newline.

Return at most 160 words, beginning with your self-reported model: the allowlist, the
routes, the UI, the leak test, isolation changes, e2e and screenshots, literal scan,
red/green and mutation counts, verify exit and test count, digest, and deviations.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, attempt 1). Baseline 8e2c2bf; evidence in
`handoff/delivery/evidence/WP3-T13D/` (01-red .. 07-digest, mutate/mask/literal scripts as `*.txt`).

**Allowlist (service, no row is spread).** System: sender configured flag and outbound mode (read from the
same environment parser as the runner; never the address), runner heartbeat instant and state
(never/running/stale; stale after 8 runner passes = 120 s; the opaque instance id is dropped), activation
(instant, recorded_at, recorded_by as the existing route), job totals (5 states) and delivery-attempt totals
(6 states). Per latest revision of each timesheet: user_id, display_name, payroll date, period start/end, due
instant, revision no, origin, review state, finalized_at, send_requested, PDF state and redacted fault code,
delivery state, attempt count, accepted_at, redacted fault code, decision_required, send job state and fault
code, recipient addresses (to/cc) of the effective settings and of the latest frozen envelope (F-Q3 (b)).
Fault codes keep only a leading lowercase code or `smtp_<reply>`, else `unclassified`. Never read: day
entries, sessions, breaks, leave, notes, calculations, policies, OT ledger, review payloads, PDFs, signatures,
templates, subject/body, Message-ID, provider responses, audit payloads (`refreshed_pay_period`), anything
derived from entries or sessions (WP2-A-01).

**Routes.** `GET /api/admin/operations`, `GET /api/admin/submissions?limit=` (1..500, default 100; 422
`invalid_limit`), read-only under the existing `requireAdmin` (401/403). T10 activation routes unchanged.
Rows exist only for periods that have a revision: a draft is not listed, because a draft row would itself
reveal that the person has entries.

**UI.** `OperationsStatus.tsx` (panel plus per-person table, own load/refresh, empty/loading/error states,
text with every colour, sr-only caption, collapses to labelled blocks below 768px), mounted in `AdminScreen`
whose hint and doc comment now state the F-3 boundary. CSS is token-only: literal scan 0 declarations with
literals (baseline 0), no custom property or @media condition added.

**Tests.** `operations-status.test.ts` 14 tests: access (401/403, write methods refused, limit), system
status, per-person rows with own recipients (two persons), accepted/uncertain/failed-PDF rows, exact key-path
allowlist of both responses, leak scan of note, session instant, subject/body marker and rendered text,
Message-ID, storage key, hashes, ids, `refreshed_pay_period` (an audit row containing it was created first),
DB fingerprint unchanged by the reads, fault redaction. Red: 13 failed / 18 passed of 31 before the routes
(2 of the new tests pass without routes by construction); green 31/31. Mutations: 8 of 8 caught, each
restored byte-identical (01..03). `isolation.test.ts` changed deliberately: the exact admin route list gains
the two routes, an exact reviewed import list for `admin.ts` (including `operationsStatus.ts`), and a new
test that the service is read-only with no private table names; the path regex is unchanged.

**e2e.** `admin-status.spec.ts` (2 tests x desktop/mobile) passes on Edge: real pipeline (signed period, PDF
ready, delivery `Failed` with `sender_missing` because MAIL_FROM is unset), recipients, no note/subject text
on the page, no write on refresh, no sideways scroll on mobile, employee gets 403. Whole `npm run test:e2e`:
97 passed, 3 skipped (the pre-existing desktop skips of the mobile-only specs). Screenshots viewed
(`admin-status-{panel,table,}-{desktop,mobile}-synthetic.png`): the panel facts and counts, the table row
with badges, the fault code and both recipient lines, the mobile block layout and the full desktop page; text
readable, nothing clipped, counts wrap into 3 columns on the phone.

**Gates.** `npm run verify` (NODE_OPTIONS=--trace-deprecation --pending-deprecation) exit 0, 53 files / 1150
tests, smoke passed, 0 deprecation lines; `npm run digest` last: 321cc6a04ec23a92e6aa7e30c153d12db870002bf053cf3fc2b5655d3d0ae862
(678 files, handoff/ excluded). No source file changed after them.

**Deviations / notes for the coordinator.** (1) No edit outside the owned paths. (2) `AppDeps` carries no
delivery configuration and `app.ts`/`types.ts` are not owned, so the sender flag and mode are read from
`process.env` through `loadDeliveryConfig` (with DATA_DIR/PUBLIC_BASE_URL fixed so an unrelated value cannot
hide them) at request time; a later task may pass the loaded `DeliveryConfig` into `adminRoutes` instead.
(3) The e2e shows `Failed` (sender_missing), not `Delivered`, because the fixture cannot set MAIL_FROM
without affecting other specs; the spec accepts either final state and checks the UI against the API.
(4) Not shown by design: drafts/overdue lifecycle (derived from entries or audit payloads), settings flags
and sharing grants (not in this brief; sharing arrives with T13B/T13C). (5) Scratch files remain in
the T13D temp folder under D:/timesheet-tmp (not removed; no recursive deletion).
