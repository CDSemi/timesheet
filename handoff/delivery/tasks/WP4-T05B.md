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
- Baseline: the WP4-T07B-FREEZE commit; the coordinator gives the SHA in the dispatch
  prompt. The working tree differs only in handoff/.

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

(Worker appends here.)
