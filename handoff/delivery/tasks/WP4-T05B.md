# WP4-T05B dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T05B; package WP4; kind implement;
  attempt 1; depends on WP4-T07B-FREEZE.
- Title: backup pruning (owner decision F-5).
- Owner decision: F-5, 2026-10-05, quoted verbatim in the board's `owner_decisions`. The
  canonical rule is docs/07:26:
  - pruning keeps 7 daily, 4 weekly and 6 monthly backups;
  - it acts only on folders that the backup tool created;
  - the copy on a separate device is an owner setup step, not application code.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Effort stays at
  the profile's level, high.
  - Routing: size S, risk H. The code deletes folders on the host, so a wrong selection
    loses backups.
  - Not novel. Records in English.
- Read AGENTS.md from disk first. Then read:
  - the WP4-T05 results in [WP4-T05](WP4-T05.md): the folder name
    `timesheet-backup-<UTC>-<8 hex>`, the hidden staging folder `.partial-<name>`, the
    manifest and the exit codes;
  - docs/07 lines 20–40;
  - AGENTS.md rule 7: UTC instants, accounting dates and reporting zones are different
    values;
  - `src/server/ops/backup.ts`, `src/server/ops/manifest.ts`, `src/server/cli.ts` and
    `tests/integration/backup.test.ts`.
- Baseline: main at 641ca109d9c9fca9bba020ae45e6f089c3f4c6ee, the WP4-T07B-FREEZE
  commit (digest 7fe65713…, 754 files). The working tree differs only in handoff/.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Call Node 24 by its full portable path, or put it first on PATH in Git Bash. Make the
  first shell call a trivial `node --version`, and stop on ENOSPC.
- Use `D:\.claude-tmp\timesheet\WP4-T05B` for TEMP/TMP, scratch clones, every test
  backup folder and all raw output. Put only masked `.txt` copies in evidence.
- Run mutation checks only in a scratch clone.
- Never kill processes by PID. Run no docker command. Never write into the repository
  root. Never redirect to /dev/null or nul.
- Keep shell calls in the foreground.
- In your shell work, delete only files you created, never inside the repository, and
  never remove folders recursively. The product code may remove a backup folder; your
  shell may not.
- Write task records with the Edit tool.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Do not commit.

## Required changes

1. **Selection** (a pure function, unit-tested).
   - A folder is a candidate only if all of these hold:
     - it is a direct child of the backup target;
     - its name matches the tool pattern exactly;
     - it contains a `manifest.json` that parses, with the tool's keys;
     - the manifest instant agrees with the name.
   - Everything else is never touched: other folders or files, `.partial-*` staging
     folders, symlinks, and folders with a bad or missing manifest. Report those only as
     counts.
   - Keep the newest backup of each of the last 7 UTC days, of each of the last 4 ISO
     weeks, and of each of the last 6 calendar months. Use UTC from the manifest
     instant, never the device zone.
   - Always keep the newest backup overall. A failed or partial backup never counts as
     a kept generation.
   - The clock is injected. Tests must not depend on the season or on wall time.
2. **CLI.**
   - Add `cli.js backup --to <dir> --prune`. It prunes only after the new backup has
     succeeded and been verified; a failed backup prunes nothing.
   - Add a dry run, for example `cli.js backup prune --in <dir> --dry-run`. It prints
     the counts to keep and to remove, with no paths of people.
   - Remove the WP4-T05 refusal of `--prune`.
   - Deletion must stay inside the target. Resolve real paths, and refuse if a
     candidate resolves outside the target.
   - Print counts only. Exit codes follow the WP4-T05 pattern: 0, 1, or 2 for usage
     or refusal.
3. **Status.** If the last prune result fits the existing `operations_state` and status
   allowlist pattern without a migration, record its counts. Otherwise skip it and say
   so; do not add a migration for this.

## Owned (writable) paths

- `src/server/ops/backup.ts`, or a new `src/server/ops/prune.ts`.
- `src/server/cli.ts`.
- `src/server/services/operationsStatus.ts`, only for item 3.
- `tests/integration/backup.test.ts`, or a new `tests/integration/backup-prune.test.ts`.
- This report and `handoff/delivery/evidence/WP4-T05B/`.

List any other minimal edit as a deviation. Do not touch the client, migrations,
`.claude/` or docs/.

## Checks

- Red-first tests, saving the red output:
  - The retention selection over a synthetic calendar spanning more than 7 months keeps
    exactly the expected 7/4/6 set, including a month and an ISO-week boundary and a
    year change.
  - The newest backup is always kept.
  - Foreign folders, `.partial-*` folders, a folder with a tampered or missing manifest,
    a symlink and a plain file are never removed.
  - A candidate resolving outside the target is refused.
  - `--prune` after a failed backup removes nothing.
  - The dry run removes nothing.
- Mutation, in a scratch clone: drop the manifest check, so that any folder matching
  the name is a candidate. A test must fail.
- Last commands, after the final edit:
  1. `npm run verify`, with `--trace-deprecation --pending-deprecation`;
  2. then `npm run digest`.

  Rerun them if any file changes afterwards.
- Evidence:
  - masked (`<email>`, `<user>`), LF;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 140 words, beginning with your self-reported model:
- the selection rule;
- the CLI and its safety checks;
- the tests (red→green) and the mutation result;
- the verify exit code and test count;
- the digest;
- every changed path;
- deviations.

## Results

Self-reported model: claude-sonnet-5-5. Attempt 1, node v24.21.0 portable, no commit.

- Selection (`selectRetention`, pure, `src/server/ops/prune.ts`): from the clock, keep the newest backup of each of the
  last 7 UTC days, 4 ISO weeks (Mon-Sun; index `floor((day+3)/7)`, no year skip) and 6 UTC months, plus the newest
  overall. A candidate is a real direct-child folder named exactly `timesheet-backup-<UTC>-<8 hex>` with a
  `manifest.json` that parses, has the tool's format/version/keys only (MANIFEST_KEY_PATHS) and `created_at` equal to
  the name instant. Everything else (foreign, `.partial-*`, link, file, bad/missing manifest) is only counted.
- CLI: `backup --to <dir> --prune` (prune only after createBackup returned; the new backup is `requiredName`, run
  refused if it is not found); `backup prune --in <dir> --dry-run` (the only standalone prune; without `--dry-run` exit
  2). Safety: target real path; every removal's real path must be a direct child (relative === name) or the whole run is
  refused (exit 2) before the first removal; lstat re-check; folder emptied with manifest last. Counts only. Exit 0/1/2.
  The old `--prune` refusal is removed.
- Tests (`tests/integration/backup-prune.test.ts`, 12): red first = module missing (exit 1); green 21 tests with
  backup.test.ts. Calendar Mar-Oct 2026 keeps exactly 13 (month and ISO-week boundary), a 2026-W53/2027-W01 and
  year-change case, UTC midnight edge, newest always kept, foreign/partial/tampered/missing/extra-key manifest,
  link and file untouched, outside-target refusal, new-backup-missing refusal, dry run, failed backup prunes nothing.
- Mutation (scratch clone, manifest check dropped): 1 failed / 11 passed, the on-disk safety test fails.
- Verify (`--trace-deprecation --pending-deprecation`): exit 0, 72 files, 1625 tests, smoke passed, no deprecation
  output. Digest: 57be84423792186c4bd8d8de9bcbd7e22d12e41b27e1d983fd90834e3c84b7ed (756 files). Precommit check on a
  temporary index: PASS, 11 staged files, 0 findings; `git diff --cached --check` exit 0.
- Item 3 (status): skipped. Recording the last prune result needs new operations_state columns, i.e. a migration;
  `operationsStatus.ts` is unchanged.
- Changed paths: src/server/ops/prune.ts (new), src/server/cli.ts, src/server/ops/backup.ts (one comment line),
  tests/integration/backup-prune.test.ts (new), tests/integration/backup.test.ts (the `--prune` exit-2 assertion
  replaced by two usage refusals), handoff/delivery/evidence/WP4-T05B/*.txt, this brief.
- Deviations: none beyond the above; the backup.ts comment edit is inside an owned file. Note: the retention windows
  are calendar windows from the clock, so after a long gap in backups only the newest one survives.

Commit description: Prune old backups with a 7 daily, 4 weekly, 6 monthly retention rule and a dry run.
