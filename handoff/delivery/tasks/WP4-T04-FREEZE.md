# WP4-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T04-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T04.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (container build files), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  199e792c7dc401b5e7b3969a5d3dcdbf2c2c59fa. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T04-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell. Never kill processes by PID.
  - Run no docker command.
- The coordinator writes no file while you run.

## Expected working-tree set

Changed or new paths outside handoff/ may only be among these:
- `Dockerfile`, `.dockerignore`, `compose.example.yaml` and
  `scripts/container-drill.mjs` (all new);
- `package.json`, in its scripts section only. Confirm that the diff of
  `package.json` touches only `scripts`, without printing the file.

No change may touch `src/`, `.claude/`, docs/, the lock file or `.gitignore`, unless the
change is drill-only.

Use the Grep tool to confirm, without printing matches, that the Dockerfile and the
Compose example contain no secret value.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 6ec6549daeb7dd835f44898429e6ef239902e529b144f5b34e8688d880c29870.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T04.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T03-FREEZE/` and
    `handoff/delivery/evidence/WP4-T04/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T03-FREEZE.md` (its results).

Leave your appended results and your evidence in
`handoff/delivery/evidence/WP4-T04-FREEZE/` unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under evidence/;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- an image tarball;
- any `.env` file other than `.env.example`.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, remove exactly that line and re-stage it.

If the precommit check blocks an email address or the Windows user name in an evidence
log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun. A
block in a build or source file stops the commit.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add a pinned non-root container image, Compose example and container drill

- build(docker): multi-stage Dockerfile on node:24.21.0-trixie-slim pinned by its index
  digest. The runtime image holds only dist/, the production node_modules and
  package.json. It runs as UID/GID 10001 with a /data volume, a read-only root, a /tmp
  tmpfs, a HEALTHCHECK on /api/ready, NODE_ENV=production and OUTBOUND_MODE=capture.
- build(docker): .dockerignore keeps the template workbook, handoff, tests, .claude,
  .env* and docs out of the build context.
- docs(deploy): compose.example.yaml with a single service, a host-local /data mount, an
  env_file (mode 600), no public port, restart unless-stopped and a stop grace period.
- test(drill): scripts/container-drill.mjs stage 1. It builds, waits for health, checks
  the schema, checks persistence across a restart, checks the runtime user, and runs a
  forbidden-file scan.
- docs(handoff): the WP4-T03 freeze result, the WP4-T04 records, the board and the
  checkpoint (+ vi).

Task: WP4-T04-FREEZE

## Push and report

Push per the profile. Append these results:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the `package.json` scope check and the secret scan;
- the check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T04-FREEZE/` as `.txt` files only.
Return at most 150 words.

## Results

(Committer appends here.)
