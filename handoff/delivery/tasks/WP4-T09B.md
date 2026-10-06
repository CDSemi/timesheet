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
- Baseline: main at a67978722f76f28d791a9ed23aa59a642f8122c3, the WP4-T09-FREEZE
  commit (digest 65f38459…, 760 files). The working tree differs only in handoff/.

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

### Worker result (attempt 1)

- Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high; effort not observable here).
- Baseline: main at a67978722f76f28d791a9ed23aa59a642f8122c3. Node v24.21.0 (portable, first on PATH in Git Bash; first
  shell call was `node --version`). npm scripts ran with `npm_config_script_shell` set to Git Bash (no cmd.exe).
  Raw output: `D:\.claude-tmp\timesheet\WP4-T09B`. Evidence (masked, LF): `handoff/delivery/evidence/WP4-T09B/01..06`.
- **Backup.** `manifest.ts` gains `referencedFilesSql(hasImports)`: the attachments rows, plus when the `imports` table
  exists `SELECT storage_key, 'import' AS kind, source_sha256 AS sha256, size_bytes FROM imports`, ordered by storage
  key. `backup.ts` reads this list from the COPY (table existence checked, so a schema older than 12 still backs up
  attachments only, as in WP4-T12A), copies each file, hashes the copy and compares hash and size with the row, with
  the same fault codes as attachments (`file_missing`, `file_size_mismatch`, `file_hash_mismatch`). A storage key that is
  not in the file-store alphabet is `integrity_check_failed`. The manifest `BackupFileKind` gains the value `import`; the
  key allowlist `MANIFEST_KEY_PATHS` is unchanged (only the value of `files[].kind` is new): a source is listed by its
  opaque key, kind, hash and size, no name, email or path. `files_verified` counts it. `manifestSummary` and the CLI
  output are unchanged (their `files` count includes the sources; `signatures` and `pdfs` do not).
- **Restore.** `restore.ts` accepts kind `import`, verifies each listed source in the backup folder (hash and size) before
  any write and again after its copy, exactly like attachments. `inspectCopy` compares the copy's rows (the same
  `referencedFilesSql`) with the manifest, so every `imports` row has its source file with a matching hash.
- **Compatibility cases (how the code behaves).**
  1. Manifest from before this change (no import sources) and a database without `imports` rows: restores (schema 12 with
     an empty `imports`, and a schema 11 backup with no table, which then migrates to 12). Tested.
  2. The same manifest but the database has `imports` rows: refused, `attachments_mismatch`, nothing remains in the target.
     Tested. (The manifest cannot vouch for the sources, so they would be lost.)
  3. A manifest that lists an `import` source the database does not refer to as one: refused, `attachments_mismatch`.
  4. A tampered, resized or missing source in the backup folder: `file_hash_mismatch`, `file_size_mismatch`, `file_missing`.
  5. A backup taken after this change is refused by an older restore tool (`manifest_invalid`: unknown `kind` value).
     No such tool is deployed, so this is accepted rather than versioned.
- **Prune.** `prune.ts` never reads file kinds; unchanged. A new test shows a folder with a kind `import` source and file
  is still a tool folder: expired ones are removed whole, the newest stays with its source.
- **Doc comment.** `unless` in `security.ts` now names the two exceptions (signature upload and workbook import upload);
  no code changed there (diff is comment lines only).
- **Tests (red to green).** Red on a scratch clone of the baseline with only the final tests copied in
  (`01-red-first.txt`): 6 failed, 51 passed. The failing ones are the backup copy and manifest test, the backup tamper
  test, the restore of the sources, the restore tamper test, the legacy-manifest refusal and the forged-kind refusal.
  The tests that must pass on the baseline too (allowlist, older schema 11 backup, schema 11 and empty-imports restore,
  prune) pass there by design. Green on the working tree: 3 files, 57 passed (`02-green.txt`).
  Coverage: backup after a committed import (plus a preview batch) restores the sources with matching hash and size;
  tampered, resized and missing sources fail the backup and the restore; the manifest allowlist holds and holds nothing
  personal; a schema 11 backup works.
- **Mutation** (scratch clone with the change; `03-mutation.txt`): `referencedFilesSql(hasTable('imports'))` replaced by
  `referencedFilesSql(false)` in `backup.ts` (skip the import keys): 4 tests fail, 53 pass; file restored, `cmp` identical.
- **Verify** (`npm run verify`, NODE_OPTIONS `--trace-deprecation --pending-deprecation`): exit 0, 73 test files, 1655
  tests passed, build and smoke passed, no deprecation output (`04-verify.txt`). Then `npm run digest`: exit 0,
  `b8db09bdb3380f3d9536427881504bdaaa69adb8a0aba56266eb0f3bafad55bc` (760 files, handoff/ excluded). No source file
  changed after verify.
- **Precommit check** on a temporary index: see `06-precommit.txt`.
- **Changed paths:** `src/server/ops/backup.ts`, `src/server/ops/manifest.ts`, `src/server/ops/restore.ts`,
  `src/server/http/security.ts` (comment only), `tests/integration/backup.test.ts`, `tests/integration/restore.test.ts`,
  `tests/integration/backup-prune.test.ts`, this brief and `handoff/delivery/evidence/WP4-T09B/`. Not changed: `prune.ts`,
  `tests/support/concurrency.ts` (the writer loop does not commit imports; the import tests are separate), `scripts/container-drill.mjs`
  (it seeds no imports, so its file-count assertions are unchanged; its line comparing manifest files with attachment
  rows would need the same schema-aware list once a drill commits an import. The drill needs Docker and was not run).
- **Deviations:** none. Order note: the source change was written before the red run; the red run was therefore made on a
  scratch clone of the baseline with only the final tests added, which is the same evidence.
