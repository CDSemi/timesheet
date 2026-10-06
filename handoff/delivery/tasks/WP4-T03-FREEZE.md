# WP4-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T03-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T03.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (authentication bootstrap source, synthetic screenshots), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  37f1be240f6f8931105cb9af0ae6fa56f2dfb333. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T03-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell. Never kill processes by PID.
- The coordinator will not write any file while you run. If the working tree changes
  under you, stop and report.

## Expected working-tree set

Outside handoff/, changed or new paths may only be among these:
- `src/server/db/migrations/0008_bootstrap.ts` (new) and `src/server/db/migrations.ts`;
- `src/server/services/bootstrap.ts` (new);
- `src/server/cli.ts`, `src/server/routes/auth.ts` and `src/server/http/schemas.ts`;
- `src/client/SetupScreen.tsx` (new), `src/client/App.tsx` and `src/client/api.ts`;
- `tests/integration/bootstrap.test.ts` (new), `tests/integration/sharing-matrix.test.ts`,
  `tests/integration/migrations.test.ts` and `tests/integration/ot-api.test.ts`;
- `tests/e2e/setup.spec.ts` (new).

No change may touch `.claude/`, docs/, `package.json` or the lock file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 8a316cc074f67b3a48aa6fc9443e8c7add5a02b26f1672879699784b8d92043f.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T03.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T02-FREEZE/` and `WP4-T03/`,
    including the two `*-synthetic.png` screenshots.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T02-FREEZE.md` (its results).

Leave your appended results and your evidence in
`handoff/delivery/evidence/WP4-T03-FREEZE/` unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under `evidence/`;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content.

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

View the two screenshots with the Read tool. They must show synthetic data only and no
token value.

Use the Grep tool, without printing matches, to confirm that no file staged under
`tests/` or `evidence/` contains a literal setup-token value.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an
  evidence log, replace it with `<email>` or `<user>` in that file only, then re-stage
  and rerun.

When to stop:
- A block in a source or test file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add production bootstrap with an expiring one-time admin setup

- feat(bootstrap): migration 0008 and a bootstrap service; the CLI `bootstrap --config`
  creates the company calendar and default policy once and issues a single-use setup
  token. The token is stored only as a hash, expires after 60 minutes and is printed
  once to the operator. `--new-token` replaces an expired, unused token.
- feat(auth): GET /api/auth/setup reports whether setup is open and never consumes the
  token. POST /api/auth/bootstrap creates the first administrator, answers every
  refusal with one generic 403, and is closed for good once an administrator exists.
  It is audited as a system event.
- feat(client): Setup screen behind an App gate (E-8 tokens), with synthetic desktop and
  mobile screenshots.
- docs(handoff): WP4-T02 freeze result, WP4-T03 brief and records, board and checkpoint
  (+ vi).

Task: WP4-T03-FREEZE

## Push and report

Push per the profile. Then append these results to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and staged count;
- the screenshot and token scans;
- the check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T03-FREEZE/` as `.txt` files only.
Return at most 150 words.

## Results

(Committer appends here.)
