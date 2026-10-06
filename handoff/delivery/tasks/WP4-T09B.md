# WP4-T09B dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T09B; package WP4; kind implement;
  attempt 1; depends on WP4-T09-FREEZE.
- Title: back up and restore the private workbook import sources.
- Why: WP4-T09 reported a gap in its follow-ups.
  - Backup and restore (`ops/backup.ts`, `restore.ts`) copy only the files referenced
    by `attachments`.
  - Import sources (`imports.storage_key`) are therefore not backed up, and a restored
    instance keeps `imports` rows whose source file is missing.
  - This breaks AC-11: a consistent backup restores the DB, the files and their hashes.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Effort stays at
  the profile's level, high. Routing: size S, risk H (backup and restore integrity), not
  novel; it extends WP4-T05/T06. Records in English.
- Read AGENTS.md from disk first. Then read:
  - the results of [WP4-T05](WP4-T05.md), [WP4-T06](WP4-T06.md), [WP4-T12A](WP4-T12A.md)
    (backups of an older schema must still work) and [WP4-T09](WP4-T09.md) (the
    `imports` table and the file-store write order);
  - docs/07 lines 20–40;
  - `src/server/ops/backup.ts`, `manifest.ts`, `restore.ts` and `prune.ts`;
  - `src/server/db/migrations/0012_imports.ts`;
  - `tests/integration/backup.test.ts` and `restore.test.ts`;
  - `scripts/container-drill.mjs`, stages 2–3.
- Baseline: the WP4-T09-FREEZE commit; the coordinator gives the SHA in the dispatch
  prompt. The working tree differs only in handoff/.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Call Node 24 by its full portable path, or put it first on PATH in Git Bash. Make the
  first shell call a trivial `node --version`, and stop on ENOSPC. Keep shell calls in
  the foreground.
- Use `D:\.claude-tmp\timesheet\WP4-T09B` for TEMP/TMP, scratch clones, backup and
  restore targets, and all raw output. Put only masked `.txt` copies in evidence.
- Run mutation checks only in a scratch clone.
- Delete only files you created, never inside the repository. Never remove folders
  recursively.
- Never kill processes by PID. Run no docker command. Never write into the repository
  root. Never redirect to /dev/null or nul.
- Write task records with the Edit tool.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Do not commit.

## Required changes

1. **Backup.**
   - The referenced storage keys are read from the copy. They are the keys in
     `attachments` plus `imports.storage_key`, when the `imports` table exists. Stay
     schema-aware, so an older schema without `imports` still backs up as in WP4-T12A.
   - Copy each import source and hash the copy. Compare the hash and size with the
     recorded `source_sha256` and `size_bytes`.
   - The manifest lists them with hash and size only: no names, emails or paths of
     people. Keep its key allowlist test exact.
2. **Restore.**
   - Verify and copy import sources the same way as attachments.
   - In the restored data, every `imports` row has its source file, with a matching
     hash.
   - A manifest from before this change, without import sources, must still restore
     when the backed-up DB has no `imports` rows. If it has `imports` rows but no
     sources, refuse it. Report how your code handles each case.
3. **Prune.** A backup folder with import sources remains a tool folder for pruning.
   Confirm with the existing prune tests, or add one.
4. **Doc comment.** Update the `unless` doc comment in `src/server/http/security.ts`,
   which still says "the one route-scoped exception". There are now two: the signature
   upload and the workbook import. Change no code there.

## Owned (writable) paths

- `src/server/ops/backup.ts`, `manifest.ts`, `restore.ts` and `prune.ts` (only if
  needed).
- `src/server/http/security.ts` (the comment only).
- Tests: `tests/integration/backup.test.ts`, `restore.test.ts` and
  `backup-prune.test.ts`, plus `tests/support/concurrency.ts` if the writer loop should
  also commit imports.
- `scripts/container-drill.mjs`, only if a stage asserts the file counts that this
  change alters.
- This report and `handoff/delivery/evidence/WP4-T09B/`.

List any other minimal edit as a deviation. Do not touch migrations, the import service,
the client, `.claude/` or docs/.

## Checks

- Red-first tests, saving the red output:
  - A backup taken after a committed import restores the source with a matching hash
    and size.
  - A tampered or missing import source fails the backup or the restore, as attachments
    do.
  - The manifest key allowlist holds.
  - Backing up an older schema without `imports` still works.
- Mutation, in a scratch clone: skip the import keys in the backup. A test must fail.
- Last commands, after the final edit:
  1. `npm run verify` (with `--trace-deprecation --pending-deprecation`);
  2. then `npm run digest`.

  If any file changes afterwards, run them again.
- Evidence:
  - masked (`<email>`, `<user>`), LF;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 130 words, beginning with your self-reported model:
- the backup and restore change;
- the compatibility cases;
- the tests (red→green) and the mutation result;
- the verify exit code and test count;
- the digest;
- every changed path;
- deviations.

## Results

(Worker appends here.)
