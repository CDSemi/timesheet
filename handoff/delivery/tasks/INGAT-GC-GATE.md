# INGAT-GC-GATE dispatch brief (verifier gate on the GHCR cleanup snapshot)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-GATE, kind gate, attempt 1. It depends on
  INGAT-GC-IMPL (done). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json`; do not edit the board,
  STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium), requested model sonnet, no
  override. Routing: size M, risk H, novelty no. Write the task record in English.
- **No source writer is active during this gate.** You edit no source.

## Snapshot identity

- Base commit: the worktree HEAD (expected `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`).
- `handoff/delivery/evidence/INGAT-GC-IMPL/snapshot-sha256.txt` and the source digest the
  IMPL Results record last (the coordinator copies it under "Snapshot at dispatch").
- First and last: recompute the hashes, the digest and `git status --short`; any
  difference, or a changed path outside `handoff/` that is not in the list, is a FAIL.

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (verifier part).
- `handoff/delivery/tasks/INGAT-GC-PLAN.md` (sections 5, 6, 9) and
  `handoff/delivery/tasks/INGAT-GC-IMPL.md` (the owner's decisions and the changes they
  make; the worker's Results as claims to rerun, not proof).

## Gate (run each; record command | exit | result)

1. Identity check.
2. Scope: only the IMPL owned paths changed outside `handoff/`; `image.yml`,
   `ingat-validate.yml`, `ingat.toml`, `Dockerfile`, `compose.example.yaml`,
   `package.json`, `package-lock.json`, `src/**` byte-identical to HEAD.
3. A clean export in the task folder (`git archive HEAD`, then the snapshot files copied in
   with `cp` per file, their hashes checked), `npm ci` there with Node 24's own npm,
   `DATA_DIR` and `DATABASE_PATH` inside the task folder. In the export:
   `npx vitest run tests/integration/ghcr-cleanup.test.ts`, `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run verify`. Every exit 0, no deprecation warning.
4. The owner's decisions in the code and workflow, checked by reading and by test or dry
   run: any git tag protects its commit; non-SHA-tagged and untagged versions are never
   deleted; `keepNewest` 20 and `keepDays` 30 by default; floors 10 / 7 enforced; no
   per-run cap; the schedule's `apply` job has no repository-variable gate; a manual
   dispatch defaults to dry run; no personal token or secret is referenced.
5. Dry runs on the committed fixtures with a fixed `--now` (defaults and floor options)
   and the refusals; compare with the counts the IMPL Results report.
6. Your own mutation checks on a copy: remove, one at a time, the release rule, the
   untagged rule, the non-SHA-tag rule, the future-date check, the floor and the "never
   delete everything" abort; at least one test must fail for each.
7. actionlint pinned by digest on all three workflows (read-only, `--network none`); the
   SHA-pin check; `git ls-remote` confirms every action SHA for the tag in its comment.
8. Parity on every touched pair; `validate_package.py --preflight`; `git diff --check`.
9. Privacy: the precommit gate on a scratch repository holding the snapshot files and the
   track's new files under `handoff/` (per-file `cp`, per-file `git add`).
10. Identity check again (last).

Decision: PASS only if every item passed and the identity is unchanged.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-GC-GATE/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-GATE`. Nothing else.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  `export MSYS_NO_PATHCONV=1` for Docker mounts.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Redirect output to files in the task folder and read them with Read.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. No authenticated GitHub call, no `gh`,
  no write to GitHub or GHCR, nothing against the owner's NAS. Never install npm packages
  in the repository. Do not stage, commit or push.
- Stop every server you start through its own handle; before returning, no background
  command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step; record one line
  `Decision: PASS | FAIL | NOT VERIFIED`, then "Status: done" followed by exactly one
  newline.

Return at most 120 words, beginning 'Self-reported model: ...', with the Decision.

## Snapshot at dispatch

- INGAT-GC-IMPL attempt 1 done (self-reported claude-sonnet-5-5): 15 files in
  `evidence/INGAT-GC-IMPL/snapshot-sha256.txt`; final source digest
  `1d004a9aafc7d424253b4b1c8faa38f2937d3f9d36b2427c24c93e223607dfa0` (882 files,
  `evidence/INGAT-GC-IMPL/final-digest.txt`); base HEAD `70dce2a`.
- Worker notes to weigh: it ran the system npm 11.19.1 under Node 24 for `npm ci` (Node 24's
  folder has no bundled npm); it piped `ls` into `head` twice (a runtime-rule slip,
  listing only). Use the same Node 24 runtime; record which npm you use.

## Results

Verifier: timesheet-verifier, attempt 1. Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/INGAT-GC-GATE/`
(E/); task folder `D:\.claude-tmp\timesheet\INGAT-GC-GATE` (export, scratch, scripts). Node v24.21.0 first on PATH; npm 11.x from
`C:\Program Files\nodejs` run by Node 24 (Node 24's folder has no bundled npm; E/npm-version.txt).

| # | Check | Exit | Result |
|---|---|---|---|
| 1 | Identity first: 15 hashes (`sha256sum -c`), digest, status outside handoff, HEAD | 0 | 15 OK; digest `1d004a9a...dfa0` (882 files); status identical to IMPL list (needs `-uall`); HEAD `70dce2a` (E/id-first-*) |
| 2 | Scope: `image.yml`, `ingat-validate.yml`, `ingat.toml`, `Dockerfile`, `compose.example.yaml`, `package.json`, `package-lock.json`, `src/**` | 0 | `git diff HEAD` empty for each; only the 15 owned files changed outside `handoff/` |
| 3 | Clean export (`git archive HEAD` + per-file cp, 15 hashes OK), `npm ci`, vitest cleanup test, typecheck, lint, `npm test`, `npm run verify` | 0 each | 26 tests; 101 files / 2371 tests; verify build + `SMOKE PASSED`; no "deprecat" in any output (E/g1..g5, npm-ci.txt) |
| 4 | Owner decisions by reading code and workflow | n/a | Met: any git tag protects its commit (`taggedCommits`, line 119); untagged and non-SHA-tagged kept (lines 117-118); defaults 20 / 30; floors 10 / 7 in `assertOptions`; no `maxDelete` or `--max-delete` (refused as unknown option); `apply` job `if` has no variable gate (schedule, or dispatch with `inputs.apply`); dispatch `apply` default false; only `secrets.GITHUB_TOKEN`, no PAT |
| 5 | Fixture dry runs `--now 2026-11-01T00:00:00Z` | 0 / 1 | Defaults keep 35 delete 5 (1010, 1009, 1008, 1004, 1001); floor options keep 15 delete 25; both equal the IMPL counts. Refusals exit 1 with one `::error::`: keep-newest 9, keep-days 6, `--apply` with `--versions-file`, `--max-delete` |
| 6 | Mutations on the export copy (script restored, sha256 `80b55372...` equals snapshot) | see right | Release rule removed: 5 tests fail; untagged rule: 4; non-SHA-tag rule: 4; future-date check: 1; floors set to 1 / 1: 3; **"never delete every version" abort (line 139) removed: 0 fail, 26 pass, exit 0** (E/mutation-*.txt) |
| 7 | actionlint 1.7.12 by digest, `--network none`, read-only, all three workflows; SHA-pin check; `git ls-remote` | 0 | No finding; SHA pin PASS (4 + 3 + 1 uses); `setup-node` v7.1.0 = `949feb24...15c1`, `checkout` v7.0.1 = `3d3c42e5...90b1`, equal to the pins |
| 8 | Parity (ADR 0003, ADR 0002, docs/07, docs/11 pairs), `validate_package.py --preflight`, `git diff --check` | 0 | PARITY OK x4 (the EN-not-in-VI code spans are translated placeholders; docs/07 VI has its one pre-existing translation link); preflight PASS, 127 pairs; diff --check clean |
| 9 | Privacy: scratch repo, per-file cp and git add of the 15 files plus the untracked files under `handoff/` | 0 | `precommit-check.mjs` PASS, 106 staged, 0 blocking, 0 warnings. `diff --cached --check` is clean for the 15 non-handoff files; it flags trailing whitespace only in other tasks' captured evidence logs under `handoff/` (not in scope) |
| 10 | Identity last | 0 | 15 hashes OK, digest unchanged, status outside handoff identical, HEAD `70dce2a`; no `node_modules` in the worktree (E/id-last-*) |

Finding (blocks PASS under brief item 6): mutating out `if (deleted >= decisions.length) throw ...` in `assertSafe` leaves all 26
tests passing. The line is defence in depth that the floor (`rank < keepNewest`, keepNewest >= 10) already makes unreachable, so it
is probably an equivalent mutant, but no test proves it, and the brief requires one failing test per mutation. Smallest fix: a test
that calls the exported checks in a way that reaches the abort, or an explicit record that the line is unreachable by design (the
empty-package abort is tested). No other defect found. No live GitHub call beyond public `git ls-remote`, no `gh`, nothing staged,
committed or pushed; no background command left running.

Decision: FAIL

Status: done
