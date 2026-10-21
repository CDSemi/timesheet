# WP5 UI change round 4, independent audit of area B (data, security, settings files, sessions and docs) on 0ddfead (WP5-UX4-AUDIT-B)

[Tiếng Việt](WP5_UX4_REVIEW_B.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 4 with the pilot-decision
  changes, after its failed gate, the fix round WP5-UX4-FIX1 and the passed regate WP5-UX4-REGATE; task WP5-UX4-AUDIT-B,
  attempt 1, area B only, 2026-10-21 from 15:00Z to about 15:50Z (08:00 to about 08:50 in America/Los_Angeles). Reviewer
  self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside).
  The strongest author model of the snapshot is also `claude-opus-5-5` (WP5-UX4-PLAN and WP5-UX4-T04; T01-T03, T05, T06,
  FIX1 and every freeze are sonnet), so the reviewer is not weaker. The area-A auditor ran its full e2e on the same machine
  at the same time.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `0ddfeada1b66c82b066b179e901184ca5d857793` (the WP5-UX4-FIX1 freeze, the WP5-UX4-REGATE `freeze_commit`); base of the
  round `8e557100d16b6b6eb86a48e00276835761aabfdf`. HEAD = 0ddfead before and after; `git status` outside `handoff/` empty
  before and after. Digest `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda`, 849 files, `handoff/`
  excluded, recorded first and last in three equal forms: `npm run digest` in the repository, the `git ls-tree` form, and a
  clean `git archive` export hashed with `git hash-object --no-filters` (sorted list byte-identical to the `ls-tree` list).
  Work ran in a scratch clone at the SHA (`npm ci` exit 0); auditor probes lived only in that clone.
- **Decision: FIX REQUIRED** (one Low finding, F-UX4B-1; no Medium or higher).
  - U4-11 business effects hold: the client body is `end: null`, `breaks_confirmed: false`, `expected_version`; my own
    docs/02 oracle gives the stored figures after a later Check out on a working day (R 555, eligible 75, credit 60, the
    midpoint rounds down) and on a Saturday (O 136, credit 150); E-1 is unaffected; future, overlap and stale refusals hold
    (section 2). The shared clock guard refuses a shared check in, check out and reopen with 409 `shared_clock_action`,
    also on a stale version; "Set an end instead" is absent in a shared view (section 2).
  - Zones (AGENTS rule 7): Today and Now read the dialog's input zone, never the device zone, at midnight and both DST
    edges, under two device zones (section 3).
  - D-9 b is implemented as specified, but the sign-in route can fill the password-change limiter bucket of another user
    (F-UX4B-1, section 4).
  - D-5 a and D-10 per F-1 (i), D-6 a and D-15 b per F-2 (b) match the owner's answers; the privacy exception stays within
    what the owner approved and nothing else is newly shown to administrators (sections 5-7).
  - The settings files hold only the allowlisted keys, write only through the existing owner-bound routes after one
    confirmation, and 41 hostile files neither write, hang nor pollute (section 8).
  - D-8: the classification and the pinning test hold (21 runs of `delivery.test.ts`, no crash). The 0xC0000005 crash is
    reproduced 10 of 10 without the trusted follow-up and is not closed in the code; it needs an in-process implicit-TLS
    server, so I judge it a test-harness risk with no evidence of production effect (section 9, R-UX4B-6).
  - Server boundary: exactly T04's eight server files, no migration, one new route (section 10).
  - Docs and the packet match the code and the owner's answers; 24 claim-check rows checked; EN/VI parity holds; the
    release identity is the accepted 8e55710 with the "round 4 in progress" sentence (section 11).
  - The mandatory checks pass (section 12). All 19 own mutants are caught; the `expected_seq` binding is caught only by the
    e2e import test, not by a unit test (section 13).

## 1. Scope actually inspected and executed

1. Read as claims, not proof: the board's `owner_decisions` of 2026-10-20 verbatim (the round-4 request, D-1..D-15 with the
   D-10 wording "OT đầu kỳ mặc định là 0, cho phép sửa bất cứ lúc nào, không cần bằng chứng", F-1..F-5) and the
   `coordinator_decisions` of 2026-10-20 (the shared clock guard, the Check out alert, the slicing); WP5-UX4-PLAN Results B
   and C; the records T03, T04 (with Addendum 1), T05, T06 (with Addendum 1), D8-DIAG, the gate, FIX1 and the regate; docs/01,
   02, 03, 05, 07, 10, 11, 12 and the pilot packet, EN and VI; docs/08 "Gates and independent audit".
2. Code read in full: every hunk of the eight server files changed since 8e55710 (`sessions.ts`, `schemas.ts`,
   `routes/admin.ts`, `routes/auth.ts`, `holidayImport.ts`, `ledger.ts`, `timesheetCommands.ts`, `workbookImport.ts`), plus
   `rateLimit.ts`, `passwords.ts`, `clientAddress.ts`, `validation.ts`, `shares.ts` (SHARED_ROUTES), the opening-balance and
   correction services, `previewImport`, the holiday plan, `smtpAdapter.ts`, `jobStore.ts`; the client
   `settingsFileModel.ts`, `SettingsTransfer*.tsx/.ts`, `CompanyCalendarFile.tsx`, `ProfileScreen.tsx`,
   `OpeningBalanceForm.tsx`, `OpeningBalancePanel.tsx`, `importModel.ts`, `ImportScreen.tsx`, `HolidayImport.tsx`,
   `AdminScreen.tsx`, `LocalTimeField.tsx`, `sessionModel.ts`, `SessionDialog.tsx`, the running request in
   `breakRowsModel.ts`, `dayEditorModel.ts`; the round-4 test changes of the area-B integration files.
3. Own probes (scratch clone, synthetic people at `example.invalid`; copies in the evidence as `*.ts.txt` and `*.mjs.txt`):
   `area-b-server.test.ts` (9 tests: U4-11 oracle on a working day and a Saturday, E-1, running refusals, extra shared-guard
   cases, the ledger, the holiday-preview audit, the limiter keys), `area-b-client.test.ts` (41 tests: hostile settings files,
   tick and request keys, equal groups, Now/Today under device zones Los Angeles and Tokyo), the D-8 crash probes, 20
   mutants.
4. Mandatory checks in the scratch clone of the target (section 12).

## 2. Running-session edit (U4-11) and the shared clock guard

- Body: `buildRunningRequest` (`breakRowsModel.ts:426-445`) sends `start`, `end: null`, `input_zone`, the listed rows,
  `breaks_confirmed: false` and `expected_version` to the unchanged `PUT /api/sessions/:id`; mutant M18 (confirmed true) is
  caught by 3 unit tests.
- Own oracle (docs/02 R-03, R-04; B=480, N=30, M=30; `40-probe-server.txt`):
  - Working day Tue 2026-09-29: open 09:00, start moved to 07:30 while running (200, `end_utc` null, day `incomplete`, credit
    null), Check out at 17:45 with the three default breaks confirmed: gross 615, excluded 60, R 555, E 75 > N, T 75,
    q 2, r 15, 2r = M so the midpoint rounds down: credit 60. Stored: `regular_minutes` 555, `eligible_minutes` 75,
    `credited_minutes` 60.
  - Saturday 2026-10-03: Check in at 10:30, start moved to 09:10, Check out at 11:26 with no breaks confirmed: O 136,
    T 136, q 4, r 16, 2r > M: credit 150. Stored: R 0, `nonworking_minutes` 136, eligible 136, credit 150
    (`day_class` `nonworking`, `unscheduled_weekday`). This also confirms FIX1's reading of the gate's Sunday failure: the
    product counts a non-working day's minutes as O.
  - E-1: after a running edit that saved one unconfirmed row, Check out without a list keeps that row and the day stays
    `incomplete_breaks`.
  - Refusals on a running edit: a start after now + 5 minutes is 422 `future_time`, an overlap 422
    `overlapping_user_intervals`, a wrong version 409 `stale_version`; the session is unchanged afterwards.
- Shared guard (`timesheetCommands.ts:450-459`, called at `:464` before the transaction and at `:502` inside it, before the
  version check): `sharing.test.ts` (30 passed) covers a shared open session, a shared end on a running session, a shared
  reopen (409 `shared_clock_action`, nothing written), the owner's same routes and shared edits that keep a session ended or
  running. My probe adds: a stale shared reopen is still 409 `shared_clock_action`; Clock in/out are not mounted under
  `/api/shared` (404); the owner may reopen; a view-only share cannot write (403 `grant_scope`). Mutants M01 (guard
  removed) and M02 (reopen allowed) are caught.
- The F-Q5 reading for the reopen case is right: a shared `end: null` on an ended session creates a running session, which
  is a Check in by another route. A grantee may still delete the owner's running session (R-UX4B-2).
- Client: "Set an end instead" is rendered only when `!shared` (`SessionDialog.tsx:669`, `shared={request !== ownRequest}`
  in `DayEditor.tsx`); `sharing.spec.ts:399` asserts it is absent for an edit grantee (passed on both projects), and mutant
  E19 (the button shown in a shared view) makes it fail.

## 3. Zones (AGENTS rule 7)

- `LocalTimeField` gets `zone = draft.zone.trim()` (`SessionDialog.tsx:331, :661, :684`), the dialog's input zone; the links
  are disabled while the zone is not a valid IANA name. `nowField` (`sessionModel.ts:85-89`) formats the device instant in
  that zone (`formatInZone`), `HH:MM` with seconds dropped (R-01 minute entry), no fold, no offset.
- Probe under device zone America/Los_Angeles and again under Asia/Tokyo (`TZPROBE` lines prove the zone of each run,
  `41-probe-client.txt`): midnight in Tokyo (14:59:59Z gives 10/20 23:59, 15:00:00Z gives 10/21 00:00); New York fall back
  (both 01:30 instants give 01:30 with no fold, and the domain then asks for the fold, as R-07 requires); spring forward
  (01:59 then 03:00, never a gap time); a saved instant from Now equals the device instant floored to the minute in Tokyo,
  Los Angeles, Lord Howe, Kathmandu and UTC. Mutant M17 (device-zone Now) is caught by 4 unit tests.
- Saved instants and accounting dates: the server resolves the local value in the saved input zone and checks the start
  against the accounting date in the reporting zone (`resolveSession`); the T03 e2e (Los Angeles device, Tokyo input zone,
  frozen clock) is in `day-editor.spec.ts` and passed in my run (section 12).

## 4. D-9 b, `POST /api/auth/password`

Verified (code and `password-change.test.ts` 6 passed, my probes, mutants M03-M07 caught): `requireUser`, no `/api/shared`
mount (404), origin check (foreign and missing origin 403); a wrong current password 403 `current_password_incorrect`, and
the client keeps the session and shows "The current password is not correct. Nothing was changed." (`ProfileScreen.tsx:12-26`);
5 wrong attempts per (client address, `password:<user id>`) in a 15-minute fixed window, then 429 with `Retry-After`; 12-256
characters (422 `weak_password`; over 256 the zod contract answers 422 `validation_error`); NFKC-equal new password 422
`password_unchanged`; one IMMEDIATE transaction with a conditional hash update, `revokeOtherAuthSessions` keeping this
session, and `auth.password_change` with `{ sessions_revoked }` only; no request logging exists and the test's console spy
sees no password or hash; the admin's temporary-password path (E-11, `users.ts:130`) is unchanged.

Rate-limit key and lock-out (`43-limiter.txt`):
- Another signed-in user cannot reach this key: the account part is the session user's id.
- The sign-in route can: it uses the typed email, only trimmed and lower-cased, as the account part of the same limiter
  (`auth.ts:39-41`), so five failed sign-ins with the email text `password:<victim id>` from the victim's client address
  fill the victim's password-change bucket. Reproduced: the victim's correct change then answers 429 `rate_limited` with
  `Retry-After: 900`. The user id is known to every grantee (it is the `/api/shared/:ownerId` path) and to administrators.
  This is F-UX4B-1.
- The per-address bucket (30 per window) is shared with sign-in by design: 30 wrong current passwords (a correct current
  password with a too-short new one resets only the account bucket) blocked an administrator's sign-in from the same
  address with 429. Unauthenticated sign-in attempts can do the same today, so this adds no new capability (R-UX4B-5).

## 5. D-5 a and D-10 per F-1 (i) (ledger)

`opening-balance.test.ts` 15 passed; own probe; mutant M08 caught. No entry means 0 (`opening_balance` null, posted 0); a first
value of 0 is 422 `invalid_minutes`; a first value without evidence is stored with `evidence_ref` "not provided"; a correction
to 0 posts one `correction` of minus the current value with `evidence_ref` null; a second correction to 0 is `unchanged` and
appends nothing (ledger rows: `opening_balance` 95, `correction` -95). Owner only: the routes are `ownerOnly` and not shared
(a shared read is 403/404); the administrator's own read is null and `GET /api/admin/users` carries no balance key. The ledger
stays append-only: an `UPDATE` and a `DELETE` on `ot_ledger` are refused by the database. Drill stage 6 sends a complete
opening balance that F-1 (i) still accepts and its script is unchanged since 8e55710; the gate's run (23 PASS in stage 6) is
a claim I did not repeat (Docker). docs/03 line 48 rewrites F-3 under AGENTS rule 8, with its VI line.

## 6. D-6 a (preview limit)

`assertPreviewQuota` (`workbookImport.ts:496-503`) runs after the idempotency lookup (`:521`) and again inside the write
transaction after the race lookup (`:542`), whose failure discards the stored file (`:570-572`). `workbook-import.test.ts`
(30 passed) covers 20 previews then 409 `import_preview_limit` with nothing stored (rows, files, audit events), a duplicate
200, another user unaffected, a commit freeing a place, and the in-transaction race. Mutants M09 (`>` for `>=`) and M10 (no
check in the transaction) are caught. The only way to clear a preview (commit it, every day may be skipped) is in docs/07,
docs/10, docs/11 section 10 step 2, docs/12 and the Import screen's message.

## 7. D-15 b per F-2 (b) (privacy exception)

- The restored code is the exact inverse of WP2-FIXA (`f79413b`): `default_labelled_entries` and
  `explicit_overrides_preserved` per changed date from unfinalized timesheets of users on the calendar, and
  `finalized_conflicts[].finalized_timesheets`; no other field, no identity (`affected_days` keys in my probe: `date`,
  `label_before`, `label_after` and the two counts).
- One `calendar.holiday_preview` event per preview inside an IMMEDIATE transaction (actor, `owner_user_id` null, after:
  calendar, year, effective date, date range, affected dates, dates with counts; no names, no CSV). A refusal that throws
  (404 calendar, 422 date, 403 for an employee) writes none; a preview with CSV issues still shows counts and is audited,
  which is right. Mutants M11 (event removed) and M12 (finalized entries counted) are caught.
- Written exception: docs/03 line 34 and the AdminScreen intro (`AdminScreen.tsx:89-92`), EN and VI docs.
- Nothing else is newly exposed to administrators: the only server change visible to them is this preview; the company file
  card reads the administrator's own `GET /api/calendar` and `GET /api/periods/current`.
- Judgement: within what the owner approved in F-2 (b) ("restore exact counts with a written exception and an audit
  event").

## 8. Settings export and import (U4-01; F-3 a, F-4 a)

- File contents: `ALLOWED_KEYS` per object (`settingsFileModel.ts:37-57`); the builders copy keys one by one; no signature,
  image authorization, credential, token, timesheet data or `apply_to_overdue_drafts` (unit allowlist tests, the e2e export
  test, mutants M13 and M14 caught).
- Ownership: personal writes go through `POST /api/policies` and `POST /api/settings/submission`, whose strict bodies have
  no owner field; the company card is rendered only on the administrators' screen and the server refuses an employee
  (e2e `settings-transfer.spec.ts:498`); no settings route is in SHARED_ROUTES.
- Writes: before the confirmation only reads and the policy preview (writes nothing) are sent for a personal file; a
  company file also sends holiday previews, each of which writes its F-2 (b) audit event (R-UX4B-7). Auto-submit is on only
  with its tick (`resolveAutoSubmit`; mutant M15 caught); `expected_seq` is the shown version; "applies from" defaults to the
  day after the in-progress period, the date field's minimum is the current period start, and the server's prospective
  boundary (R-07) refuses anything earlier, so earlier days keep their policy; equal groups write nothing (probe and unit tests); zone, payroll schedule and weekday differences
  refuse a company file; the holiday commit and each payroll exception are separate writes and a failure reports
  "Already written: ...".
- Hostile files (`41-probe-client.txt`): `__proto__` at the top and in `data`, `constructor.prototype`, `prototype`,
  forbidden keys, nesting 99,000 deep, 30,000 nested objects, a 190,000-character string, a file over 200,000 characters,
  wrong types, 1e400, fractions, 24:00 and 7:5, `exported_at` without Z, with an offset or impossible, other format or schema,
  wrong scope, non-JSON, a byte-order mark, a top-level array or null, control characters in a key, and nine hostile company
  files: every one refused in at most 11 ms, `Object.prototype` unpolluted. Duplicate keys: the last value wins and
  auto-submit still needs the tick.

## 9. D-8 (delivery) and the 0xC0000005 crash

- Classification (`smtpAdapter.ts:40-61`, `jobStore.ts:28-30, :294`): `ESOCKET` falls to failed_temporary
  `smtp_unavailable`; five attempts (retries after 1, 5, 15, 60 minutes), then intervention; `smtp_tls_failed` only for `ETLS`
  and `EREQUIRETLS`. The new test (`delivery.test.ts:430-447`) pins both modes. `delivery.test.ts` ran 21 times (once plus 20
  repeats): 27 of 27 each, exit 0, no worker crash (`30-integration.txt`).
- Crash judgement (`50-crash.txt`):
  - The test body without its trusted follow-up (auditor copy): implicit TLS crashed the vitest worker with exit code
    3221225477 (0xC0000005) in 10 of 10 runs; STARTTLS 0 of 10.
  - Plain Node, no vitest, with the production adapter and the test sink in one process: implicit TLS ends with a
    segmentation fault (exit 139) in 5 of 5 runs once the sink closes, also while the process is still running (during a 3 s
    wait); with the sink left open and an explicit exit, 0 of 5; STARTTLS 0 of 15.
  - Sink and client in two processes: 0 of 6 crashes on either side.
  - So the crash needs the implicit-TLS server and the failed client in the same Node process on this Windows host. In
    production the server is remote and only the client side runs, so I see no production effect; the shipped test avoids the
    crash only by its follow-up send. Latent test risk, not closed in the code (R-UX4B-6).

## 10. Server boundary

`git diff 8e55710..0ddfead -- src/server src/domain migrations scripts`: exactly the eight T04 files; no migration, no
`src/domain` or script change. Route registrations: one new `app.post('/password', requireUser(...))` in `routes/auth.ts`;
`routes/admin.ts` changes only the preview handler's body; `shares.ts` (SHARED_ROUTES) is unchanged. Every server hunk was
read (section 1).

## 11. Docs and the pilot packet

- The round-4 statements in docs/01, 03, 05, 07, 10, 11 and 12 and the packet's D-1..D-15 table match the code and the
  owner's words (D1.a D2.a D3.a D4.a D5.a D6.a D7.a D8.a D9.b D10.a with its wording D11.a D12.a D13.a D14.b D15.b; the
  D-14 (b) and D-8 options checked in WP5-PLAN section D).
- T06 claim-check rows checked at the target (`60-claim-check.txt`): 1-7, 9, 10, 12-16, 18-20, 30, 31, 34-38 (24 rows), all
  hold. Line numbers of the server rows still match, because only client files changed after T05.
- EN/VI parity (`61-parity.txt`): all nine touched pairs have equal headings, bullets, numbered items, table rows and fences;
  the changed lines carry the same code spans and decision ids; the only number differences are thousands separators and
  Vietnamese ordinals.
- Release identity: docs/12 keeps the pre-notes identity and adds "UI change round 4 is in progress; the identity is
  refreshed at re-acceptance"; the packet's section 0 and section 6 show the accepted 8e55710 / 507de97c (833 files), set by
  the round-3 accept commit 1b96e9d, not by T06, with the "UI change round 4 (WP5-UX4), in progress" paragraph.

## 12. Mandatory checks (scratch clone of the target; Node v24.21.0)

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0 | `10-checks.txt` |
| `npm run typecheck` | exit 0 | `10-checks.txt` |
| `npm run lint` | exit 0, no deprecation line | `10-checks.txt` |
| `npm test` (twice) | 97 files, 2226 passed, exit 0 each | `10-checks.txt` |
| `npm run build` | exit 0, main chunk 489.31 kB, no advisory | `10-checks.txt` |
| integration: password-change, opening-balance, workbook-import, holiday-import, sharing, sharing-matrix, clock-out-breaks, ot-api, delivery | 6, 15, 30, 30, 30, 26, 15, 25, 27 passed; exit 0 | `30-integration.txt` |
| `delivery.test.ts` x20 | 27 passed each, exit 0, no crash | `30-integration.txt` |
| AC-13 under Asia/Tokyo (`TZPROBE zone=Asia/Tokyo offsetMin=-540`) | 1 passed, exit 0 | `31-ac13-tokyo.txt` |
| e2e `settings-transfer`, `profile`, `import`, `admin`, `sharing`, `day-editor`, both projects, real clock (15:28Z-15:36Z, 2026-10-21; displayed period 10/12-10/25) | 284 tests: 239 passed, 45 skipped, 0 failed (desktop 138/4/0, mobile 101/41/0); exit 0; no rerun | `32-e2e.txt` |
| own probes | server 9 passed; client 41 passed under each device zone | `40-*.txt`, `41-*.txt` |

## 13. Test strength: own mutants

Each applied alone in the scratch clone, the named tests run, then restored with `git checkout` (`70-mutants.txt`):

| ID | Mutant | Result |
|---|---|---|
| M01 | shared clock guard removed | caught (sharing.test.ts) |
| M02 | reopen through a share allowed | caught (sharing.test.ts) |
| M03 | password limiter key not per user | caught (password-change) |
| M04 | wrong current password not recorded | caught |
| M05 | this session revoked too | caught (2 tests) |
| M06 | no other-session revocation | caught |
| M07 | "unchanged" without NFKC | caught |
| M08 | correction to 0 refused again | caught (opening-balance) |
| M09 | quota `>` instead of `>=` | caught (2 tests) |
| M10 | no quota check in the transaction | caught |
| M11 | holiday preview audit event removed | caught (4 tests) |
| M12 | finalized entries counted as open | caught |
| M13 | `apply_to_overdue_drafts` allowlisted | caught (settingsFileModel) |
| M14 | builder copies an extra key | caught (4 tests) |
| M15 | auto-submit tick ignored | caught (2 tests) |
| M16 | `expected_seq` always 0 | survives the unit suite (32 passed); caught by e2e `settings-transfer.spec.ts:157` (E16) |
| M17 | Now in the device zone | caught (4 tests) |
| M18 | running edit confirms breaks | caught (3 tests) |
| E19 | "Set an end instead" in a shared view | caught by e2e `sharing.spec.ts:399` |

M16/E16 and E19 are one mutant site each checked at two levels, so the count is 19 mutants. The two e2e checks rebuilt the
client per mutant, ran the spec on the desktop project and rebuilt the target client afterwards (its `dist/client` hashes equal
the target build's). Test-strength note: no unit test binds `expected_seq` to the shown version; only the e2e import into an
account with saved settings does.

## Findings

1. **F-UX4B-1, Low (D-9 b): failed sign-ins can lock another user out of the password change.**
   `src/server/routes/auth.ts:138` (`password:${user.id}` as the account part), `src/server/routes/auth.ts:39-41` (the sign-in
   account part is the typed email, only trimmed and lower-cased) and `src/server/auth/rateLimit.ts:36-41` (one key space
   `account:<address>:<account>` for both).
   - Reproduction (`43-limiter.txt`, probe "REPRO" in `area-b-server.test.ts.txt`): a victim is signed in; from the same
     client address, without any session, five `POST /api/auth/login` with email `password:<victim id>` and a wrong
     password (401 each); the victim's `POST /api/auth/password` with the correct current password and a valid new one then
     answers 429 `rate_limited`, `Retry-After: 900`. Repeating every 15 minutes keeps the victim locked out. The victim's id
     is the `/api/shared/:ownerId` path every grantee uses, and administrators see it.
   - Expected: the brief's requirement that the limiter cannot be used to lock someone else out; docs/03 and docs/10 say the
     password change is limited "per user and client address". A sign-in attempt must not reach a password-change bucket.
   - Reach: the attacker shares the victim's client address (an office NAT, or every client when the reverse proxy is not
     in `TRUSTED_PROXY_ADDRESSES`). Effect: the password change only; sign-in is unaffected.
   - Bounded fix: separate the key spaces (for example `login:<email>` for sign-in, or a second `LoginRateLimiter` instance
     for password changes), one integration test with the reproduction above, and, if the address bucket stays shared, one
     sentence in docs/03 (EN and VI).

## Risks and optional improvements (not proven defects)

- **R-UX4B-1** `PUT /api/sessions/:id` accepts `end: null` with `breaks_confirmed: true` (pre-existing contract; the client
  never sends it; Check out sets the value again, so no figure changes).
- **R-UX4B-2** An edit grantee may `DELETE` the owner's running session (200). Not a Check in or out, so F-Q5 is not broken
  literally, but it removes the owner's check-in; the owner may want it covered by the guard.
- **R-UX4B-3** Now during the repeated DST hour fills the time without a fold, so the dialog asks which 01:30 (R-07
  compliant); Now could pass the known offset.
- **R-UX4B-4** The password change keeps this session's token (other sessions are revoked); rotating it would follow common
  session-fixation advice.
- **R-UX4B-5** Password-change failures count on the per-address bucket shared with sign-in (30 per window): a signed-in
  user can block sign-in from its own client address for 15 minutes, as unauthenticated sign-in attempts already can.
- **R-UX4B-6** D-8 crash: an implicit-TLS certificate failure with the test sink in the same process crashes Node on this
  Windows host (10/10 vitest, 5/5 plain Node); the shipped test avoids it only by its follow-up send, and a future test of
  the same shape will crash the worker (visible as an unhandled error, exit 1). No evidence of production effect (0/6 with
  the server in another process).
- **R-UX4B-7** The company-file dialog previews again on each change of year or effective date, so a person who picks a
  date writes one `calendar.holiday_preview` event per change (approved behaviour, audit noise); its comment "Nothing is
  written before the one confirmation" means settings, not audit events.
- **R-UX4B-8** A settings file saved by an editor with a UTF-8 byte-order mark is refused as "not valid JSON".

## Required gates unrun or blocked

None of the mandatory area-B checks. Not repeated by this audit: the drill `--wp3` (Docker; the gate ran it on a3042dd, whose
`dist/server` the regate found byte-identical to the target), the full e2e (area A), the NAS (NOT VERIFIED by design).

## Disposition of previous findings

Area-B items of WP5-UX4-GATE: the U4-11 Sunday test (FIX1 item 3) is closed, and my own oracle confirms the product side
(section 2); the `sharing.spec.ts:399` window-day defect (FIX1 item 2) is closed: it passed in my real-clock run. No earlier
area-B review of round 4 exists.

## Software readiness, owner permission and pilot

Software readiness of round 4 waits for the fix of F-UX4B-1 (or a recorded coordinator or owner decision), a regate and a
fresh area-B recheck. Owner permission for the pilot and the pilot result are separate and not affected.

## One next action

Coordinator: dispatch one bounded server fix for F-UX4B-1 (`addresses_audit` WP5-UX4-AUDIT-B: separate the sign-in and
password-change limiter keys plus one integration test), its freeze, a targeted regate and a fresh area-B recheck.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX4-AUDIT-B attempt 1 (agent a58de82b7707ceff6 on the
  board); authors of the snapshot: PLAN a3f294195d4f4c99f, T01 a92d8e4a467bd6b4e, T02 af66795ab39964860, T03
  abd3f154777315616, T04 ac40529a094d001dc, T05 ac50555628a30054f, T06 aeb02a4427bbe14e5, FIX1 aaf0f2fdc628d8f2c and the
  freeze committers listed on the board.
- Fresh context; the reviewer authored no change of this snapshot and edited no source, test, docs, board or STATE file.
- Source digest before and after: `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda` (849 files), three
  forms (`00-digest-before.txt`, `90-digest-after.txt`); the regate's PASS is on the same snapshot.
- New report path; no earlier area-B review of round 4 existed; every earlier review file is unchanged.
- Finding dispositions and the next coordinator task: above.
- Rule slips (no product effect; `99-runtime.txt`): one sed command ended with a no-op `cat > /dev/null < /dev/null`; one
  read-only `grep ... | head -8` on my own evidence draft; and my first standalone crash pass (background task `bu6bo8uxa`)
  left one synthetic `node crash-standalone.mjs ... tls keep-sink` process waiting on its open loopback sink. I may not kill
  processes, so it is still running at hand-back: **the coordinator should stop background task `bu6bo8uxa`**. Probe
  corrections (not product findings) are listed in the same file. Nothing was fed to an interpreter through stdin, no
  recursive delete, no process killed.
