# WP5-UX4-T04 dispatch brief (server slice of round 4)

- Mission/task: timesheet-software-readiness / WP5-UX4-T04; package WP5; kind implement;
  attempt 1; depends on WP5-UX4-PLAN.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model opus, override `size_risk` (authentication, ledger and privacy; size M, risk H).
  Task record in English.
- Sources:
  - the plan `handoff/delivery/tasks/WP5-UX4-PLAN.md`: section C, the U4-11 note on the
    shared clock gap, and section E row UX4-T04;
  - the owner's answers on the board, `owner_decisions` 2026-10-20, verbatim: D-1..D-15
    and F-1..F-5;
  - the coordinator decision of 2026-10-20 that starts "Owner answers F-1 i".
- **AGENTS.md on disk wins** over any injected copy. Rules 7 and 8 apply: update a
  canonical rule and its translation when the owner changes it.
- Base: HEAD = origin/main = 18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0 (a handoff-only owner
  commit after the round-3 accept 1b96e9d), or a later commit that changes only `handoff/`.
  - Digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files).
  - Record HEAD, `git status --short` and the digest before you edit.
  - Uncommitted coordinator records under `handoff/` are expected; never touch them.

## Items

1. **D-9 b: self-service password change.**
   - Add `POST /api/auth/password` for the signed-in session user only. It must not be in
     the shared routes, and the origin check applies.
   - Body `{ current_password, new_password }`, validated with zod, max 256 characters.
   - Refusals:
     - wrong current password: 403 `current_password_incorrect`, never 401;
     - repeated wrong attempts: rate-limited per user and client address with the
       existing login limiter, giving 429 with Retry-After;
     - new password outside 12-256 characters: 422 `weak_password`;
     - new password equal to the current one: 422 `password_unchanged`.
   - In one transaction: write the new hash, revoke the user's other auth sessions and
     keep this one, and write an audit `auth.password_change` that contains no secret.
   - The administrator's temporary password (E-11) stays as it is.
   - UI: a "Change password" card on the Profile page with the current, new and confirm
     fields, the right `autocomplete` values, the confirm check in the browser, and a
     success notice. Profile is no longer read-only.
2. **D-5 a: an opening-balance correction may return the balance to 0.**
   - Only the correction may target 0; the first posting stays non-zero.
   - The posted delta is minus the current balance. When the balance is already 0, the
     result is `unchanged`.
   - The client form allows 0 in correction mode.
3. **D-10 per F-1 (i).**
   - The balance starts at 0, with no entry. Only the timesheet's owner sets it (the route
     is owner-only already). The first value is a POST; later values are PUT corrections,
     at any time.
   - A short reason stays required.
   - The evidence reference becomes optional.
     - A blank value is stored on the opening entry as the fixed text "not provided". That
       keeps the schema, so no migration is needed.
     - On a correction it is stored as null, as already allowed.
   - The as-of date defaults to the day it is set.
   - The client form and panel follow these rules.
4. **D-6 a: at most 20 uncommitted previews per person.**
   - Inside the write transaction, after the idempotency lookup (a re-upload of the same
     file still returns the existing batch) and before storing the file, count the owner's
     previews.
   - At 20, refuse with 409 `import_preview_limit`: "Commit or finish one of your 20 open
     previews first". Nothing is stored.
   - The import screen shows the message.
5. **D-15 per F-2 (b): exact per-date counts in the administrator's holiday-import
   preview.**
   - Restore the per-date counts, using the fields as before WP2-FIXA: see the plan,
     section C, D-15.
   - Write one audit event per preview, e.g. `calendar.holiday_preview` with the actor,
     the calendar, the date range and the number of dates with counts. It holds no names.
   - The admin screen shows the counts.
   - Flip the regression test "answers identically whether or not employees have day
     entries" into a test of the new behaviour.
6. **Shared clock guard: enforce the existing rule F-Q5.** A grantee with an edit share
   must not check in or out for the owner by another route. Through a share:
   - refuse an end on an open (running) session;
   - refuse a new open session;

   Both get 409 `shared_clock_action`. Owner actions are unchanged, and so are shared edits
   of ended sessions.
7. **Canonical rules (AGENTS rule 8), EN and VI.**
   - docs/03 line 48 (F-3): the opening balance per F-1 (i), with D-5 a.
   - docs/03 line 34: the explicit exception for the holiday-preview counts, with its
     audit event.
   - docs/10: one 2026-10-20 entry for F-1 i, F-2 b, D-5 a, D-6 a, D-9 b and the shared
     clock guard.
   - The other docs (07, 11, 12, the pilot packet) belong to UX4-T06; do not edit them.

## Tests

- New `tests/integration/password-change.test.ts`, covering:
  - success;
  - other sessions revoked while this one is kept;
  - a wrong current password giving 403, then 429;
  - weak and unchanged passwords giving 422;
  - unauthenticated 401;
  - a foreign origin giving 403;
  - no shared route;
  - an audit record and logs with no password or hash.
- `opening-balance.test.ts`:
  - evidence missing is accepted and stored as "not provided";
  - a correction to 0 posts one correction, the balance returns, and history is kept;
  - the first-post zero refusal stays.
- `workbook-import.test.ts`:
  - 20 previews, then the 21st refused with nothing stored;
  - a duplicate upload still returns 200;
  - another user is unaffected.
- `holiday-import.test.ts`: the counts and the audit event.
- `sharing.test.ts` or `sharing-matrix.test.ts`:
  - shared end on a running session: 409;
  - shared open session: 409;
  - owner allowed;
  - shared edit of an ended session allowed.
- e2e:
  - the Profile change-password card in `settings-routes.spec.ts`, or a new
    `profile.spec.ts`;
  - the import-limit message in `import.spec.ts`;
  - the holiday-preview counts in `admin.spec.ts`;
  - the opening-balance form (0 correction, no evidence) in the spec that covers it.
- Mutants, each applied alone and reverted. Show that a test fails for each:
  - the other-session revocation removed;
  - the rate-limit key ignored;
  - the quota check removed;
  - the zero target refused again;
  - the shared guard removed;
  - the preview audit event removed.

## Checks (in order; verify and the digest are the LAST commands)

1. Node 24 first on PATH; `node --version`.
2. Before any edit: HEAD, `git status --short`, `npm run digest`.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`
   (no chunk advisory; record the main chunk).
4. The FULL e2e on both projects on the real clock, alone, with its own output folder:
   0 failed, with per-project counts.
   - A failure whose trace shows `net::ERR_NO_BUFFER_SPACE` or another network or buffer
     error: rerun that test alone once and record both.
5. The drill `--wp3` is not required here. Run `npm run verify` instead; stage 6 is
   covered by the gate.
6. The mutant proofs.
7. EN/VI parity of docs/03 and docs/10, and `validate_package.py --preflight` with the
   workflow Python (write `<user>` in the evidence).
8. Privacy and whitespace:
   - Grep the changed files and the evidence for email addresses (only the full synthetic
     `@example.invalid` form) and profile paths.
   - Check for no trailing blanks and exactly one final newline.
9. `npm run verify` with `SMOKE_PORT` in 49350-49369 and `DATA_DIR`/`DATABASE_PATH` in the
   task folder.
10. `npm run digest` LAST.

List every changed or removed assertion with file:line and why it is not a weakening. The
flipped holiday-preview test is an owner-decided behaviour change: name it.
- No `skip`, `fixme` or `.only`.
- No migration.
- No change to the PDF, the CSP or any route other than those named.

## Owned paths

- Server:
  - `src/server/routes/auth.ts`, `routes/ot.ts`, `routes/imports.ts`, `routes/admin.ts`,
    `routes/api.ts` (shared guard only);
  - `src/server/auth/sessions.ts`, `auth/rateLimit.ts`, `auth/passwords.ts` (read; edit
    only if needed);
  - `src/server/http/schemas.ts`;
  - `src/server/services/ledger.ts`, `services/workbookImport.ts`,
    `services/holidayImport.ts`, `services/timesheetCommands.ts` (shared guard),
    `services/sharedActs.ts` (if the guard lives there), `services/audit.ts` (new event
    names only).
- Client: `src/client/ProfileScreen.tsx`, `src/client/api.ts`,
  `src/client/components/OpeningBalanceForm.tsx`, `OpeningBalancePanel.tsx`,
  `HolidayImport.tsx`, `src/client/ImportScreen.tsx`, `src/client/styles.css` (only the
  Profile card and the counts, small).
- Tests: `tests/integration/password-change.test.ts` (new), `opening-balance.test.ts`,
  `workbook-import.test.ts`, `holiday-import.test.ts`, `sharing.test.ts`,
  `sharing-matrix.test.ts`, `user-admin.test.ts` (if a shared helper changes),
  `tests/e2e/settings-routes.spec.ts` or new `tests/e2e/profile.spec.ts`,
  `tests/e2e/import.spec.ts`, `tests/e2e/admin.spec.ts`, and the e2e spec that covers the
  opening-balance form.
- Docs: `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.
- This brief's Results section.
- `handoff/delivery/evidence/WP5-UX4-T04/`: masked LF `.txt` only, plus at most four
  `-synthetic.png`.

If a change needs another path, stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-T04`. Ports 49350-49369.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS.**
  - Use the Write and Edit tools for files and Glob for listings.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`,
  never through the Program Files shim.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. Do not install or change dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.
- Write no markdown links in Results.

## Return

At most 220 words, beginning 'Self-reported model: ...'. Include:
- per item: the change;
- the files changed;
- the changed or flipped assertions;
- unit and full e2e counts per project;
- the mutant proofs;
- parity and preflight;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Addendum 1 (coordinator, 2026-10-20)

Your hand-back named three paths outside your owned set. The coordinator extends your owned
paths for exactly these:

1. **`tests/integration/ot-api.test.ts`.**
   - Add `'POST /api/auth/password',` to the reviewed list of state-changing routes, after
     `'POST /api/auth/logout',`.
   - Correct the comment at about line 511: the holiday preview now writes an audit event.
   - Change nothing else.
2. **`src/client/importModel.ts` and `tests/client/importModel.test.ts`.**
   - Move the opening-balance rules from the local overrides in `OpeningBalanceForm.tsx`
     into the shared helper:
     - evidence is optional;
     - 0 is allowed in a correction only;
     - the first value is non-zero.
   - Fix the messages, and remove the overrides from the form.
   - The unit tests pin the three rules.
   - Show that no assertion is weakened (file:line).
3. **`src/client/AdminScreen.tsx`.** The intro sentence that says the screen "never shows
   anyone's timesheet details" gets the F-2 (b) exception wording, matching docs/03 line 34:
   the holiday preview shows per-date counts, with no names, and every preview is audited.
   Update any assertion that pins the old sentence (value only).

Also record, in your Results, a one-line justification that refusing to reopen an ended
session through a share follows F-Q5 (it is a check-in by another route). The auditors will
judge it.

Then run, in this order:
- `npm run typecheck`, `npm run lint`, `npm test` (0 failed) and `npm run build`;
- `import.spec.ts`, `admin.spec.ts`, `admin-status.spec.ts`, `settings-routes.spec.ts` and
  `profile.spec.ts` on both projects (rerun rule for buffer errors as before);
- the privacy and whitespace check of the changed files;
- `npm run verify` (exit 0 required);
- `npm run digest` LAST.

Same runtime rules. Append "Addendum 1 results" with the files, the changed assertions, the
counts, the verify exit code, and the new digest and file count. Finish with "Status: done".

## Results

### Step 1-2: baseline (2026-10-20)

- `node --version`: v24.21.0 (portable Node 24 first on PATH).
- HEAD 18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0; `git status --short` shows only the
  coordinator's records under `handoff/` (ORCHESTRATION.json, the two
  WORKFLOW_REVISION_CHECKPOINT files, design/WP5-UX4/, the plan and this brief).
- `npm run digest` before any edit: 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6
  (833 files), exit 0. Matches the brief.

### Step 3: implementation checkpoint (2026-10-20)

- Items 1-7 implemented in owned paths (details in the final summary below).
- Path conflict found (not edited, reported): `tests/integration/ot-api.test.ts:501-530`, the
  reviewed allowlist of state-changing routes, must list `POST /api/auth/password`, and its
  comment at line 511 "preview writes nothing" is now stale. The file is not an owned path, so
  `npm test` fails that one inventory assertion until the allowlist line is added.
- Deviation inside owned paths: the client form rules (evidence optional, 0 allowed in a
  correction) are applied in `OpeningBalanceForm.tsx` around the shared helper in
  `src/client/importModel.ts`, which is not an owned path and keeps its old messages.

### Steps 3-4: checks so far (2026-10-20)

- typecheck exit 0; lint exit 0; build exit 0, no chunk advisory, main chunk
  `index-BRnK30lZ.js` 490.08 kB (Admin 32.10 kB, Import 24.77 kB).
- `npm test`: 2152 passed, 1 failed (95 files): the failure is the `ot-api.test.ts` route
  allowlist above (not an owned path), nothing else.
- Full e2e, real clock, alone, own output folder: 726 tests, 658 passed, 67 skipped
  (project-conditional, pre-existing), 1 failed. Desktop 332 passed / 30 skipped / 1 failed;
  mobile 326 passed / 37 skipped / 0 failed. The failure (theme.spec.ts:591, desktop, sign-in
  page never loaded) has `net::ERR_NO_BUFFER_SPACE` on `/assets/index-BRnK30lZ.js` in its trace;
  rerun alone once: 8 passed (that test's 8 cases), exit 0.

### Final summary (2026-10-20)

Items:
1. D-9 b: `POST /api/auth/password` in `routes/auth.ts` (requireUser, not in SHARED_ROUTES,
   origin check from the app middleware, zod body max 256). Wrong current password: 403
   `current_password_incorrect`, failure recorded on the login limiter under
   `password:<user id>` per client address, 429 `rate_limited` with Retry-After. New password
   outside 12-256: 422 `weak_password` (over 256 the zod contract answers 422
   `validation_error`); NFKC-equal to the current one: 422 `password_unchanged`. One IMMEDIATE
   transaction: conditional hash update (a hash changed meanwhile is 403), new
   `revokeOtherAuthSessions` (sessions.ts) keeps this session, audit `auth.password_change`
   with `{ sessions_revoked }` only. E-11 path untouched. Profile: "Change password" card
   (current-password / new-password autocomplete, hidden username, browser length and confirm
   checks, success notice focused); `.password-card` width rule in styles.css.
2. D-5 a: `correctOpeningBalance` accepts 0 (`assertOpeningMinutes(..., { allowZero })`); delta
   = target - current, `unchanged` at 0; first post still refuses 0. Form allows 0 in
   correction mode with a hint.
3. D-10 per F-1 (i): `evidence_ref` optional in both schemas; blank or absent stored as
   `OPENING_EVIDENCE_NOT_PROVIDED` = "not provided" on the opening entry, null on a correction;
   no migration. Form: evidence labelled optional, as-of date prefilled from the server's
   `today_local` (GET /api/periods/current), panel text updated.
4. D-6 a: `MAX_OPEN_PREVIEWS = 20`; `assertPreviewQuota` after the idempotency lookup and
   before the file is written, and again inside the write transaction (whose failure discards
   the file); 409 `import_preview_limit` with details `{ limit: 20 }`. ImportScreen words it.
5. D-15 per F-2 (b): per-date `default_labelled_entries`, `explicit_overrides_preserved` and
   `finalized_conflicts[].finalized_timesheets` restored as before WP2-FIXA; the preview runs
   in a transaction and writes `calendar.holiday_preview` (actor, owner null, entity calendar,
   after: calendar_id, year, effective_from, date_from, date_to, affected_dates,
   dates_with_counts; no names). HolidayImport.tsx shows the counts and an audit note.
6. Shared clock guard: `assertNoSharedClockAction` in timesheetCommands.ts; through a share,
   409 `shared_clock_action` for a new open session, an end on a running session, and (also)
   reopening an ended session (a check-in by another route; flagged as my reading of F-Q5).
   Shared start corrections that keep a session running, shared edits of ended sessions and
   all owner actions are unchanged. No change in routes/api.ts was needed.
7. docs/03 line 34 (exception) and line 48 (F-3 rewritten), docs/10 one 2026-10-20 entry, EN
   and VI (structure parity: +2/-2 lines in 03 and +11 in 10 on both sides).

Changed or flipped assertions (none weakened; each follows an owner decision):
- opening-balance.test.ts:167-187: "blank evidence" and "missing evidence" are no longer
  refusals (F-1 i) and the `evidence_required` code is gone; replaced by an over-long
  evidence refusal; zero first post still refused. Positive coverage in the new F-1 (i) and
  D-5 a tests.
- opening-balance.test.ts:263-266: the correction refusals blank evidence and 0 (now allowed)
  are replaced by fractional minutes and over-long evidence.
- holiday-import.test.ts:106-118: "no audit event" becomes exactly one preview audit event.
- holiday-import.test.ts:220-230: affected days now carry zero counts.
- holiday-import.test.ts:232-275: FLIPPED owner-decided test, formerly "answers identically
  whether or not employees have day entries on the affected dates (WP2-A-01)", now asserts the
  exact counts 2/0, 0/1, 0/0, no identities, and the two audit events.
- holiday-import.test.ts:277-290: finalized conflict carries `finalized_timesheets: 2`.
- holiday-import.test.ts:316: commit test counts +2 events (preview + commit), each operation
  checked separately.
- sharing-matrix.test.ts:97, 189, 320: the new self-only route in the inventory and in NEVER.
- settings-routes.spec.ts:142-151: "nothing on the page can be edited" becomes "the facts
  region is read only; the page has exactly the 3 password fields and 1 button" (D-9 b).
- import.spec.ts:305-313: as-of date now defaults to today; evidence no longer required.
New tests: password-change.test.ts (6), opening-balance F-1 (i) and D-5 a, workbook-import two
D-6 a tests, holiday refusal-writes-no-audit, sharing F-Q5 test, e2e profile.spec.ts, import
opening balance 0/no evidence and preview limit, admin holiday counts (private server).

Checks: typecheck 0, lint 0, build 0 (main chunk 490.08 kB, no advisory). `npm test` 2152
passed, 1 failed (ot-api allowlist, blocker below). Full e2e: desktop 332 passed / 30 skipped
/ 1 failed (ERR_NO_BUFFER_SPACE, rerun passed), mobile 326 / 37 / 0. Mutants M1-M6 (+M3b) each
fail at least one test, all reverted byte-identically (40-mutants.txt). Parity OK; preflight
(workflow Python 3.12.14, `<user>` profile) PASS, 118 translation pairs, 2319 links, 91
scenarios. Privacy and whitespace: 0 problems in 29 changed files and the evidence; no
skip/only/fixme added. Smoke alone (port 49350): SMOKE PASSED. `npm run verify` (SMOKE_PORT
49351): exit 1 at `npm test`, the same single ot-api failure. `npm run digest` LAST:
57f8f5db6ec4cad598b6f816bce9d9129d80d82775efe0e18c941538889037f3 (835 files).

Blocker and notes for the coordinator:
- BLOCKER: `tests/integration/ot-api.test.ts:503-530` (not owned) must add
  `'POST /api/auth/password',` after `'POST /api/auth/logout',`, and its comment at line 511
  ("preview writes nothing") should say the preview writes an audit event. Until then npm test
  and verify fail on that one assertion only.
- `src/client/importModel.ts` (not owned) still words evidence as required and zero as never
  recorded; the form overrides those two rules locally. A later slice may move the rules there.
- `src/client/AdminScreen.tsx` intro says the screen "never shows anyone's timesheet details";
  with the F-2 (b) counts this sentence needs the exception wording (T05/T06 path).
- Evidence: handoff/delivery/evidence/WP5-UX4-T04/ (00..99 .txt, 3 synthetic PNGs).

Status: done

### Addendum 1 results (2026-10-20)

Files:
1. `tests/integration/ot-api.test.ts`: line 519 adds `'POST /api/auth/password',` after
   logout; line 511 comment now says the preview writes one audit event (F-2 (b)). Nothing else.
2. `src/client/importModel.ts`: `parseSignedMinutes(input, { allowZero })` (0 only when
   allowed), new `OpeningMode` and `openingFormMinutes(form, mode)`;
   `openingFormProblems(form, { mode })` replaces `{ needsAsOfDate }`: `post` needs a non-zero
   value and an as-of date, `correct` may be 0 and has no date, evidence optional (length only).
   Messages: zero "Enter at least 1 minute; the opening balance is already 0 until you record a
   value."; `invalid_minutes` "... only a correction may set the opening balance to 0."; the
   dead `evidence_required` case is removed (no server code sends it after F-1 (i)).
   `OpeningBalanceForm.tsx`: the local `isZeroValue`/`formProblems` overrides are removed; it
   calls the shared helpers with its mode.
3. `src/client/AdminScreen.tsx`: intro adds "One exception: the holiday import preview shows,
   per changed date, how many employees' entries it affects, with no names, and every preview
   is recorded in the audit log." No assertion pinned the old sentence.

Changed assertions in `tests/client/importModel.test.ts` (none weakened):
- :279 zero message, value only (still an error for a first value).
- :336 "names every missing field": `evidence` leaves the list (owner decision F-1 (i)); the
  same test now pins that blank evidence passes in both modes and that a blank correction
  names only `reason`.
- :350-353 and :357-361 `{ needsAsOfDate }` becomes `{ mode }`, same expectations; added an
  empty as-of date refusal in `post` and both modes for the length limits, with the exact text.
- :371 `/non-zero/` becomes the exact new `invalid_minutes` text.
- :374 `evidence_required` now falls back to "server text (evidence_required)" (code retired).
- New :283 (0 only with allowZero; malformed values still refused with it) and :343 (first
  value non-zero, correction may be 0).

F-Q5 justification: through a share, setting `end: null` on an ended session creates a running
session for the owner exactly as a Check in would, so refusing it is the same F-Q5 rule ("never
Check in/out for the owner") applied to another route, not a new rule.

Checks: typecheck 0, lint 0, `npm test` 2155 passed / 0 failed (95 files), build 0 (main chunk
490.10 kB, no advisory). e2e import, admin, admin-status, settings-routes, profile: desktop 29
passed, mobile 29 passed, 0 failed, 0 skipped. Privacy and whitespace: 0 problems in 34 files,
no skip/only/fixme. `npm run verify` (SMOKE_PORT 49352): exit 0. `npm run digest` LAST:
6e9e3001fe1f1ed352f446be19cc07c152d4cb61aa7ab0dce145f1fc6e1f8f41 (835 files). Evidence:
A1-10, A1-30, A1-60, A1-90, A1-99 in handoff/delivery/evidence/WP5-UX4-T04/.

Status: done
