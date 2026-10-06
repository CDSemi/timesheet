# WP4-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-GATE; package WP4; kind gate;
  attempt 1; depends on WP4-T13-FREEZE (the package-final freeze).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (the package-final gate), novelty no. Records in English.
- Target: `freeze_commit` is the WP4-T13-FREEZE commit; the coordinator gives the SHA in
  the dispatch prompt.
  - Record HEAD and the source digest before and after. They must not change.
  - The digest of record is the one you compute on the clean export. Cross-check it
    with the `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-PLAN](WP4-PLAN.md), section E;
  - the WP4 gate lines in `handoff/prompts/WP4_IMPLEMENT.md` and
    [WP4_REVIEW](../../prompts/WP4_REVIEW.md);
  - docs/06 (AC-11, AC-12, AC-15 and the regressions AC-01, AC-03, AC-08, AC-16);
  - docs/07 and the new docs/11 runbook;
  - `handoff/delivery/WP4_HANDOFF.md`;
  - the WP4-T12 drill results in [WP4-T12](WP4-T12.md).
- Read-only for source, configuration, tests and governance files.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Call Node 24 by its full portable path, or put it first on PATH in Git Bash. Spawn
  children with `process.execPath`. Use the workflow Python for the validators. Keep
  shell calls in the foreground.
- Working folders:
  - Use `D:\.claude-tmp\timesheet\WP4-GATE` for TEMP/TMP, the clean export
    (`...\WP4-GATE\export`), the WP3 export (`git archive 49651c8`, `...\WP4-GATE\wp3`),
    drill work folders and all raw output.
  - Put only masked `.txt` copies and `*-synthetic.png` images in evidence.
  - Delete only files you created; never remove folders recursively.
- Docker:
  - Use the Compose project name `ts-wp4-gate`, and remove only that project, by name.
  - Never push, log in or prune. Publish ports on loopback only.
- Edge and mail: use the installed Edge channel, with no browser download. Capture mode
  only; never send real mail.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a call is denied by a permission check, stop and report. Do not retry or rephrase
  it.
- If a shell call fails with ENOSPC, stop and report.
- Write your results into this brief with the Edit tool.

## Gate items (record each command, exit code and result)

1. **Export and install.** Make a clean `git archive` export of the freeze outside
   Dropbox, using Node 24. Then run `npm ci`.
   - It must print no deprecation line.
   - Record the `npm audit` summary as information only.
2. **Verify.** Run `npm run verify` with
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation`.
   - It must exit 0 with no deprecation line.
   - Record the test count; WP4-T12 reported 75 files and 1710 tests.
   - Record the smoke PASS count, including `/api/ready`.
3. **End-to-end tests.** Run `npm run test:e2e` for desktop and mobile; all must pass.
   Record the counts. WP4-T11 reported 145 passed and 5 skipped.
4. **Drill.** Run `npm run drill:container -- --work <gate>\drill --project ts-wp4-gate
   --wp3 <gate>\wp3`.
   - It must exit 0 with `DRILL STAGES 1-6 PASSED`. Record the per-stage PASS counts.
   - Confirm stage 1's image boundary: the forbidden-file scan and the non-root user.
   - Confirm stage 3: the restored instance stays paused and sends nothing.
   - Confirm stage 5: the old binary refuses the upgraded database, and the paired
     restore runs with nothing sent.
   - Confirm stage 6: the import no-op and the single opening balance.
5. **Workbook.** Check each of the following, from tests or the drill, naming the test:
   - The tracked template hash is still
     `47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331`.
   - The preview's source SHA-256 equals `sha256` of the uploaded bytes.
   - The mapping version is 1.
   - The three README defects are flagged.
   - Unknown labels, duplicates and conflicts are reported.
   - Commit needs explicit decisions, and a second identical commit adds nothing.
   - The opening balance needs minutes, a date, a reason and evidence, and posts once.
   - Imported periods get no reminder, deadline action or send across a simulated
     deadline.
6. **Upgrade and rollback runbook.**
   - Drill stages 4–5 pass.
   - Every command in docs/11 maps to a drill step or is labelled an owner NAS step.
     Cross-check the WP4-T13 command map, and name any command that is unmapped and
     unlabelled.
7. **Migrations.** Run a fresh 1→13 migration and upgrades from:
   - a database created by the accepted WP3 source 49651c8 (schema 6);
   - a populated v12 database (the tests).

   For each, `integrity_check` must be ok, `foreign_key_check` empty, and a rerun must
   apply nothing.
8. **Races, 10 fresh-process rounds each.** Each round must give one winner and no
   duplicate. Run:
   - `ot-leave-concurrency`;
   - `finalization-concurrency`;
   - `deadline-race`;
   - the sharing revocation race;
   - the concurrent workbook-import commit;
   - the concurrent opening-balance post.
9. **Privacy and admin boundary.**
   - Every admin operations and users field is in its allowlist, including
     `not_set_up` and `retention`.
   - `/api/health` and `/api/ready` carry no personal data.
   - The manifest carries no personal data.
   - The import and opening-balance routes answer 404 to other users, administrators
     and share grantees.
   - The private import source is never served.
10. **NAS target.** Mark it NOT VERIFIED unless the owner supplied access; list the
    owner steps from docs/11. If you run an arm64 emulated build, label it emulation.
11. **Validators.**
    - `node scripts/precommit-check.mjs` on the export.
    - `validate_package.py --preflight`, `validate_orchestration.py` and
      `check_recovery.py`, run with the workflow Python
      `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
      Write `<user>` in the evidence.
    - Then run `npm run digest` last, together with the `git ls-tree` digest form.
12. **Diff scope** since the WP3 acceptance source 49651c8bb91d56bf6c6966405257537ec7ca474b.
    - List the changed paths by area.
    - Name every governance path changed. Expected: only the removal of
      `.claude/skills/readme-md/` (the GOV-SKILL-REMOVE cycle, audited PASS), besides
      handoff records.
13. **Mapping.** Every gate line of WP4_IMPLEMENT and WP4_REVIEW has a test, a drill
    step or a NOT VERIFIED label. Name any line without one.

## Output

- Write the results in this file, and masked LF evidence in
  `handoff/delivery/evidence/WP4-GATE/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.
- Leave no server, browser, container, runner or background process.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Target freeze 13a258db86b2f0b6388830e584e2cca5303f1f6c. Node v24.21.0 portable,
Git Bash, workflow Python (`C:\Users\<user>\.cache\codex-runtimes\...`). Raw output: `D:\.claude-tmp\timesheet\WP4-GATE`.
Masked LF evidence: `handoff/delivery/evidence/WP4-GATE/` (numbered by gate item; no images needed).

**Digest.** HEAD 13a258d before and after. Digest of record, computed on the clean export (`git archive 13a258d`, index of
the export), by `npm run digest` in the repository and by the `git ls-tree` form: all
`1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe` (774 files). Equals the committer claim. Taken before
and after the checks: unchanged. Repository status: only handoff files modified/untracked (the same set as at the start).

| # | Item | Command / exit | Result |
|---|---|---|---|
| 1 | Export, install | `git archive 13a258d`, `npm ci`: exit 0 | 169 packages, no deprecation line. `npm audit` (info): exit 1, 1 high (source-map-js GHSA-68fv-2mgg-jv7q), known npm advisory. |
| 2 | Verify | `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`: exit 0 | typecheck, lint, build clean; no deprecation line. 75 files, 1710 tests passed. Smoke: SMOKE PASSED, 41 PASS lines, 0 FAIL, including `/api/health` and `/api/ready` (200, allowlisted keys, schema 13 of 13). Independent `vitest run --reporter=verbose`: 75/1710 again, exit 0. |
| 3 | E2E | `npm run test:e2e`: exit 0 | 145 passed, 5 skipped (desktop and mobile), equals WP4-T11. |
| 4 | Drill | `node scripts/container-drill.mjs --work <gate>\drill --project ts-wp4-gate --wp3 <gate>\wp3`: exit 0 | `DRILL STAGES 1-6 PASSED`. Per stage PASS/FAIL: 1: 31/0, 2: 31/0, 3: 56/0, 4: 35/0, 5: 27/0, 6: 23/0. Stage 1: forbidden-file scan PASS (10612 paths), non-root `User=10001:10001`, running uid 10001, read-only root, production deps only. Stage 3: restored instance paused (reason restored), no job leased, nothing captured or sent while paused, held jobs go out only after explicit release, once each. Stage 5: previous build refuses the upgraded database (exit 1), restore without `--confirm` refused (exit 2), `--keep-schema --confirm` restores schema 6 with the send jobs held, runner on sent nothing, 26 tables equal. Stage 6: re-commit of the identical workbook answers 200 replayed and the eight table counts are unchanged; one `opening_balance` entry (a repeat is a 200 duplicate, a different value 409). The WP3 build needed `npm ci` and `npm run build:server` in the `wp3` export first (the drill requires `dist\server\cli.js`): both exit 0. Compose project removed by the drill (`no container of the project remains`); I also removed the image `ts-wp4-gate-timesheet:drill` by name. |
| 5 | Workbook | tests (all in the 1710 run) | Template hash 47ef42d5... : `workbook-reader` "tracked template (read only) > keeps the published SHA-256" and `workbook-import` asserts `sha256Hex(readTemplateBytes())`; also `git show HEAD:reference/inputs/Timesheet_Rev8_2026.xlsx | sha256sum` = 47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331. Preview SHA equals upload: workbook-import "preview > stores the source privately..." (`source_sha256: sha256Hex(bytes)`, `mapping_version: 1`); mapping version 1 also in workbook-reader (`mappingVersion` toBe 1). Three README defects: "previews the three support sheets and reports every README defect with cell provenance" and "detects the three inherited formula defects". Unknown label, duplicate payroll date, date on two sheets: workbook-reader "flags an unknown label...", "flags a duplicate payroll date...", "flags a date that appears on two payroll sheets..."; conflict: "red-first: a conflicting day without a decision refuses the commit and writes nothing". Decisions and idempotence: "asks for a decision on unclear days...", "an identical re-import changes no row count..."; drill stage 6 replay. Opening balance: "refuses zero minutes, a missing reason, missing evidence and a missing as-of date", "a double submission posts once", "concurrent posts from separate connections post once". Imported periods: workbook-import "no reminder, overdue record, deadline finalization or send across simulated deadlines", reminders "sends no reminder for an imported (unverified) period", deadline "never auto-submits an imported_unverified timesheet". |
| 6 | Runbook | drill stages 4-5 PASS; docs/11 cross-check | Every command and bash block of docs/11 maps to a drill stage in the WP4-T13 command map or is labelled owner NAS step, unverified (data-dir `mkdir/chown/chmod`, `bootstrap --new-token`, `outbound drop`, `imagetools inspect`, `JOB_RUNNER=off` rule, the section 11 `find`/`df` host alert, `--prune` by integration test). Unmapped and unlabelled commands: none. |
| 7 | Migrations | `vitest run migrations upgrade` exit 0 (61 tests); `cli.js migrate` with `DATABASE_PATH` | Fresh 1 to 13 (CLI): applied 1..13, `integrity_check` ok, `foreign_key_check` 0 rows, rerun applied nothing. Accepted WP3 source 49651c8 database (schema 6, created by the WP3 build `cli.js migrate`) upgraded by the current CLI: applied 7..13, integrity ok, fk 0, rerun applied nothing. The drill's upgraded WP3 database (stage 4) and the rolled-back schema 6 database: integrity ok, fk 0. Populated v12 upgrade: migrations test "red-first: upgrades a fully populated version 12 database ...", plus v1/v2/v3/v4/v5/v6/v11 upgrade tests; failure rollback and refusal of a newer schema tested. |
| 8 | Races, 10 fresh vitest processes each | `npx vitest run <file>` x10 each | All 60 runs exit 0, one winner and no duplicate asserted in each: ot-leave-concurrency (8 tests), finalization-concurrency (3), deadline-race (2), sharing "revocation race" (7), workbook-import "two concurrent identical commits" (1), opening-balance "concurrent posts" (1). Summary: `08-races-summary.txt`. |
| 9 | Privacy, admin boundary | tests | operations-status "returns exactly the allowlisted fields and none of the private content", the "not set up" flag tests and retention-result test; user-admin "lists account fields only"; smoke "lists the three accounts with account fields only" (incl. `not_set_up`). health.test "reports ready with exactly the allowlisted keys", "reveals no path, name, address or count of people", "reads nothing personal"; backup "writes a manifest and a status with exactly the allowed keys and nothing personal"; drill "manifest has exactly the allowed keys" and "no email address, name or host path". Import and opening-balance: workbook-import ownership tests (another user, administrator: 404; share grantee cannot import, read, commit) and opening-balance ownership tests (other user, admin, grantee with OT read and edit); drill stage 6 (404 for another user and the administrator, nothing written). Source never served: "preview > never serves the stored source: no source route, and nothing under the static root". |
| 10 | NAS target | none | NOT VERIFIED: no owner access supplied. Owner steps are listed in docs/11 section 2 (checklist), sections 1 steps 1, 3, 4, 6, 7, 11, plus the rollback step 5 and the `outbound drop`/`--new-token` commands. The arm64 image exists only as an emulation build from WP4-T04 (not rerun here, label: emulation). |
| 11 | Validators | see below | `node scripts/precommit-check.mjs` on the freeze delta since 49651c8 (temporary git dir outside the repository, 518 staged files): exit 0, `PASS: 518 staged file(s), 0 blocking finding(s)`; `--self-test` PASS (12 rules). Info: the same hook over the whole tree (3196 files) blocks 24 findings, all in pre-existing files (old handoff evidence with a profile path, six synthetic password literals in `tests/integration/auth.test.ts`); none is in the WP4 delta. `validate_package.py --preflight`: exit 0; `validate_orchestration.py`: exit 0; `check_recovery.py`: exit 0 (run on the export, workflow Python). `npm run digest` last: see Digest above. |
| 12 | Diff scope since 49651c8 | `git diff --name-status 49651c8 13a258d` | 518 paths: handoff/delivery 381 (+ NEXT_ACTION x2), src/server 47, tests/integration 29, src/client 25, tests/e2e 8, tests/support 3, tests/client 3, scripts 2 (container-drill.mjs added, smoke-built-server.mjs), docs 11 (EN+VI of 03, 07, 10, 11), root 10 (.dockerignore, .env.example, Dockerfile, compose.example.yaml, DEVELOPMENT, README EN+VI, package.json, package-lock.json). Governance paths: net none. `.claude/skills/readme-md/` was added (3bdffbe) and removed (a923351) inside the range, so it is absent at both ends; AGENTS.md, CLAUDE.md, `.agents/`, skills-lock.json, docs/06, 08, 09, prompts and templates are unchanged. Besides handoff records only the expected GOV-SKILL-REMOVE pair appears in history. |
| 13 | Mapping | WP4_IMPLEMENT and WP4_REVIEW gate line (identical): AC-11/12/15 clean install, migrations, restart persistence, backup under writes, isolated restore with file hashes/balances, identical re-import no-op, outbound paused after restore | Clean install: items 1-2 and drill stage 1. Migrations: item 7. Restart persistence: drill stage 1 (healthy again, schema and session unchanged, session persisted byte for byte). Backup under writes: stage 2 (63 writes during the backup window, point-in-time copy). Isolated restore with hashes and balances: stage 3 (11 files, 0 mismatched; balances equal). Identical re-import no-op: stage 6 and workbook-import tests. Outbound paused after restore: stage 3 and restore.test. No line without a test, drill step or label. |

**Flakes and reruns.** None; no test failed in any run, no rerun was needed.

**Incident to report.** My first fresh-migration probe ran `node dist/server/cli.js migrate` with only `DATA_DIR` set, so it used
the default developer database `C:\Users\<user>\AppData\Local\timesheet-dev\timesheet.db` instead of a task-local path: it
applied migrations 2..13 (that old dev database was at schema 1) and a second call applied nothing. This is the owner's local
development database (no production data, outside the repository); it is now at schema 13. I did not touch it again; every
later migration check used `DATABASE_PATH` under `<gate>\raw`. The owner may want to note it.

**Limits.** The Edge browser and the container ran only inside the e2e and drill commands; no server, browser, container,
runner or background process was left (compose project `ts-wp4-gate` gone, its image removed by name). Nothing was pushed, sent
or committed. NAS NOT VERIFIED (item 10). The temporary git directories `pcgit` and `pcgit2` and the exports remain under
`D:\.claude-tmp\timesheet\WP4-GATE` (not removed recursively).
