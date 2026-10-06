# WP4-T12A dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T12A; package WP4; kind implement;
  attempt 1; depends on WP4-T08-FREEZE.
- Title: operations drill stages 4–5, covering upgrade and rollback.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Effort stays at
  the profile's level, high. Routing: size M, risk H, not novel (it builds on T04–T06).
  Records in English.
- Why a split: the coordinator split WP4-T12 (see the board's `coordinator_decisions`).
  - This task does stages 4–5 now.
  - Stage 6, the import no-op, comes later in WP4-T12, after T09–T11. WP4-T12 also reruns
    the whole drill, so later migrations are covered.
- Read AGENTS.md from disk first. Then read:
  - [WP4-PLAN](WP4-PLAN.md): observation O1, the task entry "WP4-T12", section E item 4,
    and section D;
  - docs/07 line 32 (verify a backup before upgrade, migrate once, restore the paired
    DB/files, never resend accepted mail automatically) and lines 26–30;
  - docs/06 "Operations evidence";
  - `src/server/db/migrations.ts` and `src/server/index.ts`;
  - `src/server/cli.ts`, `src/server/ops/backup.ts`, `manifest.ts` and `restore.ts`;
  - `scripts/container-drill.mjs` (stages 1–3, from T04–T06), the Dockerfile and the
    Compose file.
- Baseline: main at dd1422fbd8de53791e6fa9d6b8d8741f1f484488. The working tree differs
  only in handoff/.

## Runtime

- Call Node 24 by its full portable path; plain `node` resolves v26. Make the first
  shell call a trivial `node --version`, and stop on ENOSPC.
- Use `D:\.claude-tmp\timesheet\WP4-T12A` for:
  - TEMP/TMP;
  - the WP3 build export;
  - scratch clones, backups and restore targets;
  - all raw output.
- Put only masked `.txt` copies in evidence.
- Export the accepted WP3 build into the task folder with `git archive 49651c8`, then run
  `npm ci` there. Never check out another commit in the repository.
- Run mutation checks only in a scratch clone.
- Docker:
  - Use the Compose project name `ts-wp4-t12a`, and remove only that project, by name.
  - Never push, log in, or prune.
  - Publish ports on loopback only.
- Delete only files you created, never inside the repository. Never remove folders
  recursively.
- Never open an interactive shell (no `cmd.exe /c` from Git Bash). Never kill processes
  by PID.
- Never write into the repository root. Never redirect to /dev/null or nul.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Do not commit.

## Required changes

1. **Drill stage 4: upgrade.**
   1. Build a schema-v6 database with the WP3 build: `cli.js migrate`, then `cli.js seed`
      with synthetic data only. Add a few synthetic files.
   2. Take and verify a pre-upgrade backup with a manifest. This is the paired backup.
      - Use the current build's backup without migrating the source DB.
      - If the current backup tool refuses an older schema or migrates it first, make the
        smallest change that lets it back up an older schema read-only. List it as a
        change.
   3. Mount the v6 data into the current image and start it. Migrations must run exactly
      once, up to the latest schema.
      - Never pin the target number. Derive it from the migration list, because T07B,
        T09 and T10 will add migrations.
   4. A restart must apply nothing.
   5. Check `integrity_check` (ok) and `foreign_key_check` (empty). Representative OT
      balances and revision counts must equal the pre-upgrade values.
2. **Drill stage 5: rollback.**
   1. The WP3 build's `cli.js migrate`, run against the upgraded DB, must refuse (O1).
      Record the refusal and the exit code.
   2. Restore the paired pre-upgrade backup into an empty target. Never write into the
      live data directory.
   3. Start the WP3 build on the restored data.
   4. Check health, the counts and the balances.
   - **Safety rule:** docs/07:32 and AC-08 still apply. No accepted or queued mail from
     the backup may be sent automatically after the rollback, and the drill uses capture
     only.
     - The v6 schema has no outbound pause, because migration 0010 is newer.
     - Inspect how the WP3 build decides to send. Activation, the runner and the
       transport are the likely places.
     - Choose the minimal safe approach, for example:
       - a restore mode for older schemas that refuses unless the operator confirms;
       - and/or a documented start of the old build with sending disabled until
         reconciliation.
     - Prove the approach with the drill: no send attempt appears after the old build
       starts.
     - If no safe approach fits the owned paths, finish stage 4 and the refusal step,
       then stop and report the options. Do not invent new business behaviour silently.
3. **Test `tests/integration/upgrade.test.ts`** (new).
   - An in-process upgrade of a populated older-schema DB must keep every row, FK and
     trigger.
   - A rerun must apply nothing.
   - A DB at a newer schema than the binary must be refused.
   - Build the old-schema DB with the project's own migrations up to version 6, if
     `migrate()` allows a target. Otherwise build it from a fixture that the test
     generates. Never use the real workbook or private data.

## Owned (writable) paths

- `scripts/container-drill.mjs` (stages 4–5 and their flags).
- `package.json`, scripts only, if a script needs a new flag.
- New `tests/integration/upgrade.test.ts`.
- Only for the backup or older-schema restore safety in steps 1.2 and 2:
  `src/server/ops/backup.ts`, `src/server/ops/restore.ts` and `src/server/cli.ts`, with
  tests in `tests/integration/restore.test.ts` or `tests/integration/backup.test.ts`.
- This report and `handoff/delivery/evidence/WP4-T12A/`.

List any other minimal edit as a deviation. Do not touch the client, migrations, `.claude/`
or docs/.

## Checks

- Red-first, saving the red output:
  - the upgrade test against a stub or missing behaviour;
  - and, if you change backup or restore, a test for that change.
- Mutation in a scratch clone: make `migrate()` accept a newer schema. The newer-schema
  refusal test must fail.
  - If you change backup or restore, also run one mutation that removes your safety
    check.
- The drill: run stages 1–5 green on Docker Desktop. Record per-stage PASS lines and
  counts only.
- Last commands, after the final edit:
  1. `npm run verify` (with `--trace-deprecation --pending-deprecation`; 0 deprecation
     lines);
  2. then `npm run digest`.
  If any file changes after those, run them again.
- Evidence:
  - masked (`<email>`, `<user>`), LF and `.txt` only;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 170 words, beginning with your self-reported model:
- the upgrade and rollback design, including the rollback send-safety approach;
- the tests (red→green) and the mutation results;
- the result of drill stages 1–5;
- the verify exit code and the test count;
- the digest;
- every changed path;
- deviations.

## Results

Self-reported model: claude-sonnet-5-5. Baseline: dd1422fbd8de53791e6fa9d6b8d8741f1f484488 (working tree
differs only by this task). Node 24.21.0 (portable). Raw output: `D:\.claude-tmp\timesheet\WP4-T12A`.
Masked evidence: `handoff/delivery/evidence/WP4-T12A/` (01-10, LF, `.txt`).

### Design

- **Upgrade (stage 4).** The previous build is the accepted WP3 source (`git archive 49651c8` into
  `<task tmp>\wp3`, `npm ci`, `npm run build:server`; the repository was never checked out at another
  commit). The drill takes it with the new flag `--wp3 <dir>` (stages 4-5 only run with it). The
  previous build creates schema 6 (`cli.js migrate`, `seed`; its server with `JOB_RUNNER=off` records
  sessions, a second signature file and two signed-off periods, so two PDF and two send jobs are
  queued). The CURRENT image's backup tool takes the paired backup of that older schema unchanged
  (no backup.ts change was needed; `recordStatus` already skips a schema without the status columns).
  The data is mounted into the current image; the target schema is read from `/api/ready`
  (`expected`), never pinned. Checks: migrations 7..latest applied once in one transaction (one
  `applied_at`), restart applies nothing (rows identical), `cli.js migrate` applies nothing,
  integrity ok, FK empty, every pre-upgrade row of 26 tables unchanged, OT balances, revision counts
  and the API view equal.
- **Rollback (stage 5).** The previous build's `cli.js migrate` on the upgraded DB refuses (exit
  code 1, "newer than this application", nothing changed; O1). The paired backup is restored by the
  new `cli.js restore --keep-schema [--confirm]` into an empty host directory (never the live one).
  `keepSchema` skips the migration. A schema older than migration 10 has no pause columns and no
  `preparing`->`uncertain` transition, so the restore **refuses (exit 2,
  `unpaused_schema_unconfirmed`) unless `--confirm`**, then does what that schema allows: every
  queued or leased outbound job moves to `intervention` (`reconcile_after_restore`; the old runner
  never claims it), every `sending` attempt becomes `uncertain`, a system audit event is written, the
  JSON on stdout reports `outbound.paused: false`, and stderr warns to start the old build with
  `JOB_RUNNER=off` until reconciliation. A backup that already has the pause behaves as before.
  Proof: the WP3 build started on the restored data in production mode with its runner ON in capture
  mode: health ok, balances and revisions equal, PDFs rendered, 0 delivery attempts, nothing
  captured, held jobs untouched. A control (the same backup as a plain file copy, no hold) sends the
  queued mail at once, so the proof is not vacuous.
- **Residual limits (stated, not hidden).** With no pause column the restored schema cannot block
  jobs created later (a reminder or deadline scan after the rollback, or an operator action); the
  hold covers only what the backup already contained. Options if the owner wants more: (a) `--confirm`
  also clears the automation activation instant (an audited business-state change, not done here);
  (b) keep `JOB_RUNNER=off` until reconciled (printed warning). Held jobs can only be released by the
  current build's `outbound release`, which the old build lacks, so a long rollback needs a second
  upgrade to reconcile. On Windows the drill stops the old server by terminating its own child
  process, then reads the database in place.

### Tests (red -> green) and mutation

- `tests/integration/upgrade.test.ts` (new, 10 tests): populated schema-6 DB (own migrations 1-6,
  seed, real finalization service) upgraded in process; every row of every v6 table, FK, trigger and
  index kept, immutability still enforced, balances and revision counts equal, rerun applies nothing,
  older binary and a newer-schema DB refused with nothing changed, a failing migration rolls back and
  a retry succeeds. Red: against a stubbed fixture (`01-...`): fixture import throws, 9 of 10 not run
  (1 passed, 9 skipped). Green: 10/10.
- `tests/integration/restore.test.ts` (+6 tests, rollback restore): red before the change (`02-...`:
  3 failed - no refusal, wrong pause, CLI usage error), green after.
- Mutation in a scratch clone (restored byte for byte, `cmp` identical): `migrate()` accepts a newer
  schema -> 3 tests fail (`04-...`, two new, one existing); removing the confirmation check -> 2 fail
  (`05-...`); removing the job hold -> 5 fail (`06-...`).
- The older-schema backup test (`backs up the old schema read-only`) passed without a backup change.

### Drill

`npm run drill:container -- --work <task tmp>\drill --project ts-wp4-t12a --wp3 <task tmp>\wp3`:
exit 0, `DRILL STAGES 1-5 PASSED`, 165 PASS, 0 FAIL (`07-...`). Stage 4: schema 6 -> 10 of 10, 4
migrations in one transaction, 1 ledger entry (600 min), 2 revisions equal. Stage 5: refusal exit
code 1; rollback restore held 2 send jobs; restored counts (3 users, 2 revisions, 1 ledger entry,
2 files, 6 sessions) equal the pre-upgrade values. Compose project `ts-wp4-t12a` removed by name
(`down -v`); no push, login or prune.

### Final commands (after the last edit)

- `npm run verify` with `--trace-deprecation --pending-deprecation`: exit 0, 70 files / 1589 tests,
  smoke passed, 0 deprecation lines (`08-verify.txt`).
- `npm run digest`: `e6bb47fde0ad7960b9bf7fab5a02fc169f399224eb38a61d6b9ce7866d746bdd` (753 files,
  handoff/ excluded) (`09-digest.txt`).
- Precommit check on a temporary index over the changed files and evidence 01-07: PASS, 0 findings
  (`10-precommit-check.txt`; the real index was not touched). Evidence 08 and 09 are masked output
  written afterwards.

### Changed paths

`scripts/container-drill.mjs`, `src/server/ops/restore.ts`, `src/server/cli.ts`,
`tests/integration/restore.test.ts`, new `tests/integration/upgrade.test.ts`, new
`tests/support/schemaV6.ts`, this brief, `handoff/delivery/evidence/WP4-T12A/`.
Not changed: `package.json` (the new flag passes through `drill:container --`), `backup.ts`, docs,
client, migrations.

### Deviations

1. New helper `tests/support/schemaV6.ts` (outside the owned list): the shared schema-6 fixture for
   the upgrade and rollback tests (a copy in each test file would drift).
2. `restore.ts` exports `schemaHasOutboundPause`; `restoreSummaryJson().outbound.paused` is now a
   boolean (was the constant `true`) and `RestoreResult.pause` may be null (rollback mode only).
3. Stages 4-5 are skipped with an INFO line when `--wp3` is absent (final label `STAGES 1-3`);
   WP4-T12 and the gate must pass `--wp3`. The docs (runbook) are not updated here; the flag is
   documented in the script header.
4. The restore warning text and the `--keep-schema` runbook step are English-only strings in the CLI;
   no Vietnamese pair exists for them.

Commit description: Add drill stages 4-5 (upgrade, rollback), a rollback restore mode that holds backed-up sends, and an upgrade test
