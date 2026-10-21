# WP5-UX4-AUDIT-B dispatch brief (area B: data, security, settings files, sessions, docs)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-AUDIT-B, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX4-REGATE (PASS).
  - Run in a fresh context. It runs in parallel with WP5-UX4-AUDIT-A, which uses other ports
    and other folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override. Routing:
  size L, risk H (authentication, ledger, privacy, settings file content), novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX4_REVIEW_B.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 task; their agent IDs are on the board. Treat
  every worker, planner, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = 0ddfeada1b66c82b066b179e901184ca5d857793.
  - TARGET_DIGEST = b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda
    (849 files).
  - The base is the last accepted snapshot, 8e557100d16b6b6eb86a48e00276835761aabfdf.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Rules 4, 6, 7 and 8 matter here.

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- The owner's words: board `owner_decisions` of 2026-10-20 (the request; D-1..D-15; F-1..F-5;
  the D-10 wording), verbatim, and `coordinator_decisions` of 2026-10-20 (the shared clock
  guard; the Check out alert).
- The plan `handoff/delivery/tasks/WP5-UX4-PLAN.md`, Results B and C.
- The slice records `WP5-UX4-T04.md` (with Addendum 1), `T03.md`, `T05.md`, `T06.md`
  (with Addendum 1) and `WP5-UX4-D8-DIAG.md`; the gate, FIX1 and regate records; and their
  evidence.
- docs/01, 02, 03, 05, 07, 10, 11 and 12, EN and VI; the pilot packet
  `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`.

## Scope (area B)

1. **Running-session edit (U4-11), business effects.**
   - The PUT body: `end: null`, `breaks_confirmed: false`, `expected_version`.
   - Worked minutes and OT after a later Check out, on a working day and a non-working day.
     Use your own oracle against docs/02.
   - E-1 (Check out replaces saved rows only when a list is sent) is unaffected.
   - Overlap, future and stale refusals.
   - A shared editor:
     - cannot check the owner in or out, end a running session, or reopen an ended one
       (409 `shared_clock_action`; F-Q5);
     - the client hides "Set an end instead" in a shared view;
     - the server still refuses if the client is bypassed.
2. **Zones (AGENTS rule 7).**
   - Today/Now use the dialog's input zone, never the device zone.
   - `nowField` at the DST edges and across midnight.
   - Saved instants and accounting dates are correct for an input zone that differs from
     the device zone.
3. **D-9 b, `POST /api/auth/password`:**
   - session user only, and absent from `SHARED_ROUTES`;
   - the origin check;
   - 403 `current_password_incorrect`, not 401, and how the client handles it;
   - the rate-limit key and window, and whether the limiter can be used to lock someone
     else out;
   - length rules, and the "unchanged" rule;
   - other sessions revoked, this one kept;
   - the audit record without the password, its hash or the session token;
   - logs free of secrets;
   - the admin temporary password (E-11) is unchanged.
4. **D-5 a and D-10 / F-1 i (ledger):**
   - default 0 with no entry; the first value is non-zero;
   - evidence optional ("not provided" stored on the opening entry, null on a correction);
   - a correction to 0 posts one correction; "unchanged" posts nothing;
   - owner only; an administrator never sees a personal balance;
   - the ledger stays append-only;
   - drill stage 6 still holds;
   - docs/03 F-3 rewritten under AGENTS rule 8, with its translation.
5. **D-6 a (preview limit):**
   - the count inside the write transaction, after the idempotency lookup;
   - at 20 previews, 409 `import_preview_limit` and nothing stored;
   - a duplicate upload still returns 200;
   - other users are unaffected;
   - the only way to clear a preview is documented.
6. **D-15 b / F-2 b (privacy exception):**
   - the restored per-date counts, and exactly which fields: `default_labelled_entries`,
     `explicit_overrides_preserved`, `finalized_timesheets`;
   - no names or identities;
   - one `calendar.holiday_preview` audit event per preview, and none when refused;
   - the written exception in docs/03 and the AdminScreen intro;
   - nothing else newly exposed to administrators.

   Judge whether the implementation stays within what the owner approved.
7. **Settings export and import (U4-01; F-3 a, F-4 a):**
   - **File contents:**
     - an allowlist per scope;
     - no signature, image authorization, credential, token or timesheet data;
     - `apply_to_overdue_drafts` never sent.
   - **Ownership:**
     - a personal file writes only the signed-in person's settings;
     - company controls are for administrators only, and the server refuses an employee;
     - nothing is reachable through a share.
   - **Writes:**
     - no write before the one confirmation;
     - auto-submit only by its tick;
     - `expected_seq` stale handling;
     - the policy "applies from" semantics against R-07 (earlier days keep their policy);
     - equal groups write nothing;
     - the company-file refusals (zone, payroll schedule, weekdays);
     - the non-atomic holiday and payroll-exception writes, and their partial-result
       report.
   - **Robustness of the parser against hostile files:**
     - `__proto__`, `constructor` and `prototype` keys, and prototype pollution;
     - deep nesting;
     - huge files and long strings;
     - wrong types; duplicate keys;
     - invalid dates and times;
     - a non-JSON file.

     None may write, hang the tab or pollute objects.
8. **D-8 (delivery):**
   - the certificate-failure classification: `ESOCKET` is temporary `smtp_unavailable`,
     with five attempts; `smtp_tls_failed` only when STARTTLS is refused;
   - the new pinning test.
   - Repeat `tests/integration/delivery.test.ts` at least 20 times. Judge the vitest worker
     crash (0xC0000005) that T06 and D8-DIAG saw before the trusted follow-up was added:
     latent risk or closed?
9. **Server boundary.** Since 8e55710, only T04's eight server files changed, there is no
   migration and the route table changed by `POST /api/auth/password` only. Read every
   server diff hunk.
10. **Docs and the pilot packet.**
    - Every round-4 statement in docs/01, 03, 05, 07, 10, 11 and 12 and in the packet's D-1
      to D-15 answer table must match the code and the owner's answers. The T06 claim-check
      table is a claim: check at least fifteen rows yourself.
    - EN/VI parity of each touched pair.
    - The release identity is still the accepted one, with the "round 4 in progress"
      sentence.
11. **Test strength.** Write at least eight mutants of your own on area-B behaviour, for
    example:
    - the shared clock guard;
    - the reopen case;
    - the password rate-limit key;
    - other-session revocation;
    - the zero correction;
    - the preview count;
    - the holiday audit event;
    - an allowlist key;
    - the auto-submit tick;
    - `expected_seq`;
    - the device-zone mutant for Now.

    Say whether the suite catches each.
12. **Mandatory checks yourself:**
    - typecheck, lint, `npm test` twice, build;
    - the integration files named above;
    - AC-13 once, under `Asia/Tokyo`;
    - the e2e specs `settings-transfer`, `profile`, `import`, `admin`, `sharing` and
      `day-editor` on both projects, on the real clock.

    You need not run the full e2e: area A runs it. A failure whose trace shows a network or
    buffer error may be rerun once; record both runs.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-AUDIT-B`. Ports 49530-49559.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `node -e`, NO
  `| node`, NO `| python`. NEVER PIPE INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin` OR `nul`. NEVER `rm -r`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Never kill processes by PID, and leave nothing running.
- Put Node 24 first on PATH for every node or npm call.
- Create files only in the task folder, the evidence folder and the review pair.
- Use synthetic data only.
  - No email address except the full synthetic `@example.invalid` form.
  - Write `<user>` for profile paths.
  - Put no password, hash, token or exported settings file (`.json`) in evidence. Describe
    file contents by key names only.
  - Screenshots end in `-synthetic.png`, at most 8.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX4-AUDIT-B/`: masked LF `.txt` and
  `-synthetic.png`.
- The decision: PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each finding, with its severity, file:line, reproduction and expected result.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

Self-reported model: claude-opus-5-5 (equal to the strongest author model of the snapshot: PLAN and T04). Fresh context; no
WP5-UX4 change authored. 2026-10-21, 15:00Z to about 15:50Z.

- **Target.** `reviewed_commit` 0ddfeada1b66c82b066b179e901184ca5d857793; HEAD = 0ddfead before and after; `git status`
  outside `handoff/` empty before and after. Digest b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda (849
  files) before and after in three equal forms (`npm run digest`, `git ls-tree`, clean `git archive` export with
  `git hash-object --no-filters`). Work in a scratch clone at the SHA in the task folder.
- **Decision: FIX REQUIRED.** One Low finding:
  - F-UX4B-1, Low: `src/server/routes/auth.ts:138` and `:39-41`, `src/server/auth/rateLimit.ts:36-41`. Five failed sign-ins
    with the email text `password:<victim id>` from the victim's client address make the victim's correct password change
    answer 429 `rate_limited` (`Retry-After: 900`). Expected: a sign-in attempt cannot reach a password-change bucket
    (separate key spaces). Reproduction in `evidence/WP5-UX4-AUDIT-B/43-limiter.txt` and `area-b-server.test.ts.txt`.
- **Optional risks.** R-UX4B-1..8 in the review (open session accepts `breaks_confirmed: true`; a grantee may delete a running
  session; Now in the repeated DST hour asks for the fold; the session token is not rotated; the shared per-address bucket; the
  D-8 in-process implicit-TLS crash is reproducible 10/10 without the follow-up send, test-only on this evidence; audit noise
  of company-file previews; a BOM file is refused).
- **Checks run.** typecheck 0, lint 0, `npm test` x2 (97 files, 2226 passed each), build 0 (main 489.31 kB); nine area-B
  integration files green; `delivery.test.ts` 21 runs green, no crash; AC-13 under Asia/Tokyo green (TZPROBE -540); e2e
  settings-transfer, profile, import, admin, sharing, day-editor on both projects, real clock: 239 passed, 45 skipped, 0
  failed, no rerun; own probes 9 + 41 tests green; 19 own mutants all caught (`expected_seq` only by e2e).
- **Docs.** 24 T06 claim-check rows hold; parity of the nine touched pairs holds; release identity is the accepted 8e55710
  with the round-4-in-progress sentence.
- **Files written.** This Results section; `handoff/delivery/WP5_UX4_REVIEW_B.md` and `.vi.md`;
  `handoff/delivery/evidence/WP5-UX4-AUDIT-B/` (36 masked LF `.txt`, no `.json`, no password, no PNG).
- **Leftover (needs the coordinator).** Background task `bu6bo8uxa` holds one synthetic
  `node crash-standalone.mjs ... tls keep-sink` process waiting on its loopback sink (my script lacked an explicit exit; I may
  not kill processes). Please TaskStop `bu6bo8uxa`. Slips: one no-op `/dev/null` redirect and one read-only pipe into `head`
  (`99-runtime.txt`).
- **Next action.** Bounded server fix for F-UX4B-1 (`addresses_audit` WP5-UX4-AUDIT-B) with one integration test, its freeze,
  a targeted regate and a fresh area-B recheck.

Status: done (decision FIX REQUIRED)
