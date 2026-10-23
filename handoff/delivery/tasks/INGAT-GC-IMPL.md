# INGAT-GC-IMPL dispatch brief (implement the scheduled GHCR cleanup)

- **Task.** Side track "Ingat deployability", follow-up GHCR cleanup, task INGAT-GC-IMPL,
  kind implement, attempt 1. It depends on INGAT-GC-PLAN (done) and the owner's decisions
  below. Worktree `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`,
  branch `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-worker-high (effort high), requested model sonnet, no
  override. Routing: size M, risk H (a scheduled job deletes registry content), novelty no
  (the plan gives the design and draft files). docs/08 row "High-risk fix/slice with an
  existing pattern". Write the task record in English.

## Source of truth

- The plan `handoff/delivery/tasks/INGAT-GC-PLAN.md` (Results 0-9; section 9 is your task
  definition) and its draft files in `handoff/delivery/evidence/INGAT-GC-PLAN/`
  (`ghcr-cleanup.ts.txt`, the test, the workflow `image-cleanup.yml.txt`, the fixtures).
  This brief wins where they differ.
- `AGENTS.md` from disk (rules 4, 8, 11, 12; the ADR rule; `.vi.md` pairs).
- The owner's decisions (2026-10-22, verbatim): "D1. theo đề xuất / D2. Giữ 20 bản mới
  nhất và mọi bản dưới 30 ngày, không giới hạn số lượng mỗi lần xoá / D3. Xóa thật luôn
  (nhưng theo quy tắc D2 thì làm gì có bản nào hơn 30 ngày để mà xóa)".

## Changes against the plan, from the decisions

1. **D1 (as proposed):** any git tag name marks its commit as a release; a version with
   any tag that is not a lowercase 40-hex commit SHA is never deleted; untagged versions
   are never deleted.
2. **D2:** `keepNewest = 20`, `keepDays = 30`, and **no per-run deletion cap**: remove the
   `maxDelete` option, its default, its 1-100 limit, its input and its tests. Keep the
   fixed floors (`keepNewest >= 10`, `keepDays >= 7`), the "never delete every version"
   abort, the future-date abort, the empty-package abort, the oldest-first order and
   `assertSafe`. Recompute the expected fixture counts and update the tests to match.
3. **D3:** the scheduled run deletes from its first run: remove the `GHCR_CLEANUP_APPLY`
   repository-variable gate; the `apply` job runs for every scheduled run, after the
   `plan` job. A manual `workflow_dispatch` keeps an `apply` input that defaults to
   `false` (a manual run is a dry run unless asked); say so in the docs.
4. **D4 stays open:** no personal access token, no secret. If `GITHUB_TOKEN` is refused
   (403), the run fails closed and the docs tell the owner what to check (the package's
   "Manage Actions access" role for this repository).
5. **docs/07 (EN and VI):** correct the stale sentence "neither workflow has run on
   GitHub yet": both ran successfully on commit `6173f07` (validate run 39884811892, image
   run 39884811864). Describe the cleanup rules, the duty to tag a commit whose backups
   must outlive 30 days, the 30-day restore window, and that nothing older than 30 days
   exists before about 2026-11-21 (first image 2026-10-22). No rollout-variable steps.

Everything else follows plan section 9: owned paths, AC1-AC10 (AC3 without the cap, AC4
per D3), the ADR 0003 pair, the ADR 0002 Consequences pointer, the docs/11 sentence.

## Owned paths

- `scripts/ghcr-cleanup.ts`; `tests/integration/ghcr-cleanup.test.ts`;
  `tests/integration/fixtures/ghcr-cleanup/versions.json` and `tags.txt`;
- `.github/workflows/image-cleanup.yml`;
- `tsconfig.json` and `tsconfig.test.json` (only to include `scripts/ghcr-cleanup.ts`), and
  the lint configuration only if the type-aware lint needs the new file listed;
- `docs/adr/0003-ghcr-image-cleanup.md` and `.vi.md`; `docs/adr/0002-ingat-manifest-and-ghcr-image.md`
  and `.vi.md` (the Consequences pointer); `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and
  `.vi.md`; `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (one sentence); an ADR or script
  index in `docs/10_DECISIONS_AND_SOURCES*`, README or DEVELOPMENT only if one lists ADRs
  or scripts (report what you found);
- this brief's Results; `handoff/delivery/evidence/INGAT-GC-IMPL/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-IMPL`.
- Not owned (byte-identical): `image.yml`, `ingat-validate.yml`, `ingat.toml`,
  `Dockerfile`, `compose.example.yaml`, `package.json`, `package-lock.json`, `src/**`, any
  other test or script, every file under `handoff/` except your own.
- If a needed change falls outside these paths, stop and report before editing.

## Checks (in order)

1. Before any edit: HEAD, `git status --short`, `git fetch origin`,
   `git rev-parse origin/main`, `git log --oneline HEAD..origin/main`, and
   `node scripts/source-digest.mjs`. HEAD and `origin/main` are expected at
   `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`; if `origin/main` moved, stop and report.
2. Write the files.
3. **Gate in a clean export** (the worktree has no `node_modules`; never install in the
   repository): `git archive HEAD` into the task folder, copy your changed and new files
   into it with `cp` per file, then `npm ci` there with Node 24's own npm (put Node 24
   first on PATH; the system npm shim on Node 26 is refused by engine-strict). Set
   `DATA_DIR` and `DATABASE_PATH` inside the task folder for every run. In the export run:
   `npx vitest run tests/integration/ghcr-cleanup.test.ts`, `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run verify`. Record each exit. No deprecation warning
   may appear (AGENTS rule 11).
4. In the export: the dry runs on the fixtures with a fixed `--now` (the defaults and the
   floor options), and the refusals (below-floor option, `--apply` with
   `--versions-file`). Record the counts.
5. Mutation checks on a copy in the task folder: remove, one at a time, the release rule,
   the untagged rule, the non-SHA-tag rule, the future-date check and the floor; show at
   least one test fails for each.
6. actionlint pinned by digest
   (`rhysd/actionlint@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`,
   read-only, `--network none`) on all three workflows; the SHA-pin check (the plan's
   `check-workflows.py`) on `.github/workflows`; confirm the `actions/setup-node` SHA with
   `git ls-remote` of its public repository.
7. Parity (the WP5-UX5-T06 script) on every pair you touched;
   `validate_package.py --preflight` with the workflow Python; `git diff --check`.
8. Privacy: the precommit gate on a scratch repository holding your changed files
   (per-file `cp`, per-file `git add`).
9. **LAST:** `node scripts/source-digest.mjs`, then the snapshot list
   `handoff/delivery/evidence/INGAT-GC-IMPL/snapshot-sha256.txt` (every changed or new
   file outside `handoff/`, sorted, paths relative to the root). No edit after this.

## Do not claim

- No live GitHub call, no deletion and no run of the new workflow has happened. Results
  and docs say so.

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
  no write to GitHub or GHCR, nothing against the owner's NAS. Do not stage, commit or
  push in the repository.
- Stop every server you start through its own handle; before returning, no background
  command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step; end the file with exactly one
  newline after "Status: done" (no trailing blank lines).

Return at most 150 words, beginning 'Self-reported model: ...'.

## Base at dispatch

- HEAD = `origin/main` = `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5` (plan section 0).
- Uncommitted at dispatch, all under `handoff/` and not yours: the checkpoint pair, the
  Results of `tasks/INGAT-T0T8-RECORD.md`, `evidence/INGAT-T0T8-RECORD/`,
  `tasks/INGAT-GC-PLAN.md`, `evidence/INGAT-GC-PLAN/`, this brief.

## Results

Worker: timesheet-worker-high, requested sonnet, attempt 1. Self-reported model: claude-sonnet-5-5.
Evidence folder: `handoff/delivery/evidence/INGAT-GC-IMPL/` (E/ below). Task folder: `D:\.claude-tmp\timesheet\INGAT-GC-IMPL`.

### 1. Base (check 1)

- HEAD = `origin/main` = `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`; `git fetch origin` ran; `git log HEAD..origin/main` empty;
  Node v24.21.0; source digest before editing `47e8036b...a033` (E/base-check.txt).

### 2. Files written (15, all inside the owned paths)

- New: `scripts/ghcr-cleanup.ts`, `tests/integration/ghcr-cleanup.test.ts`,
  `tests/integration/fixtures/ghcr-cleanup/versions.json` and `tags.txt` (copied unchanged from the plan fixtures),
  `.github/workflows/image-cleanup.yml`, `docs/adr/0003-ghcr-image-cleanup.md` and `.vi.md`.
- Edited: `tsconfig.json` and `tsconfig.test.json` (`scripts/ghcr-cleanup.ts` added to `include`; `eslint.config.js` needed no
  change: the type-aware lint reads `tsconfig.json`), ADR 0002 EN and VI (Consequences pointer to ADR 0003),
  `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md` (stale sentence corrected with the run ids; new cleanup paragraph),
  `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (one clause in section 1 step 2).
- Adapted from the plan drafts per the decisions: D1 any git tag marks a release (unchanged rule, no `v*` filter); D2 `maxDelete`
  removed (option, default, 1-100 limit, input, `--max-delete`, cap block, tests), floors 10 / 7 days kept, `assertSafe` kept
  with the never-everything check, defaults 20 / 30; D3 no `GHCR_CLEANUP_APPLY` gate: the `apply` job runs for every
  `schedule` run and for `workflow_dispatch` only with `apply = true` (default false); D4 no token, no secret, 403 fails closed
  and the ADR and docs/07 name the "Manage Actions access" check.
- Index search (brief rule): no ADR index exists. `DEVELOPMENT.md` / `.vi.md` have a file table (line 99 area) that lists
  neither workflows nor `precommit-check.mjs`, so it was not edited; `docs/10_*`, README have no ADR or script list to update.
- Not edited and noted: ADR 0002 line 3 and "Facts for the owner" still say nothing has run on GitHub (stale since the first
  runs on `6173f07`); the brief limits ADR 0002 to the Consequences pointer, so a later record task may correct them.

### 3. Gate in a clean export (check 3)

`git archive HEAD` extracted into `export/` of the task folder, the 15 files copied in per file, `npm ci` there. The system
`npm` shim on PATH ran Node 26 and was refused by engine-strict (first attempt, exit 1, EBADENGINE); Node 24.21.0 has no bundled
npm here, so npm 11.19.1 from the system install was run by `node` (Node 24 first on PATH): `node ".../npm-cli.js" ci` exit 0
(E/npm-ci.txt). TEMP, TMP, DATA_DIR, DATABASE_PATH inside the task folder. Final run after the last file edit:

| Command | Exit | Result | Evidence |
|---|---|---|---|
| `node node_modules/vitest/vitest.mjs run tests/integration/ghcr-cleanup.test.ts` | 0 | 1 file, 26 tests passed | E/g1-vitest-ghcr-cleanup.txt |
| `npm run typecheck` | 0 | `scripts/ghcr-cleanup.ts` is in the `tsconfig.test.json` file list | E/g2-typecheck.txt, E/tsconfig-test-listfiles.txt |
| `npm run lint` | 0 | no finding | E/g3-lint.txt |
| `npm test` | 0 | 101 files, 2371 tests passed | E/g4-npm-test.txt |
| `npm run verify` | 0 | typecheck, lint, 2371 tests, build, `SMOKE PASSED` | E/g5-npm-run-verify.txt |

No deprecation warning in any output. (An earlier identical run before one test-title rename gave the same results; the rename was
followed by the full re-run recorded here.)

### 4. Dry runs on the fixtures (check 4), `--now 2026-11-01T00:00:00Z`, exports of `node scripts/ghcr-cleanup.ts`

- Defaults (20 / 30): keep 35, delete 5 (ids 1010, 1009, 1008, 1004, 1001; 1002 lightweight tag, 1003 annotated tag, 1005
  `keep-nas`, 1006 untagged, 1007 `v1.0.0` kept), exit 0 (E/dryrun-defaults.txt). Unchanged from the plan because the plan cap (50)
  never bound on 40 versions.
- `--keep-newest 10 --keep-days 7`: keep 15, delete 25, exit 0 (E/dryrun-floor-options.txt).
- Refusals, exit 1 each with one `::error::` line: `--keep-newest 9`, `--keep-days 6`, `--apply` with `--versions-file`,
  `--max-delete 5` (unknown option) (E/refuse-*.txt).

### 5. Mutation checks (check 5), one at a time on a copy of the script placed in the export, original restored (byte-identical, `cmp` 0)

| Mutation | Tests failing | Evidence |
|---|---|---|
| release rule removed | 5 of 26 | E/mutation-1.txt |
| untagged rule removed | 4 of 26 | E/mutation-2.txt |
| non-SHA-tag rule removed | 4 of 26 | E/mutation-3.txt |
| future-date check removed | 1 of 26 ("refuses a version dated in the future") | E/mutation-4.txt |
| floors lowered to 1 / 1 | 3 of 26 | E/mutation-5.txt |

### 6. Workflow checks (check 6)

- actionlint `rhysd/actionlint@sha256:b1934ee5...5667` (v1.7.12), read-only, `--network none`, on `image-cleanup.yml`,
  `image.yml`, `ingat-validate.yml`: exit 0, no finding (E/actionlint.txt).
- SHA-pin check (`check-workflows.py` from INGAT-T0T8-IMPL) on `.github/workflows`: PASS, 4 + 3 + 1 `uses:` lines (E/sha-pin-check.txt).
- Public `git ls-remote` (unauthenticated read): `actions/setup-node` `v7.1.0` = `949feb24...15c1` and `actions/checkout` `v7.0.1` =
  `3d3c42e5...90b1`, both equal to the pins in the workflow (E/ls-remote-pins.txt).

### 7. Parity, preflight, whitespace (check 7)

- Parity script on ADR 0003, ADR 0002, docs/07, docs/11 pairs: PARITY OK each (E/parity.txt; the "in EN not in VI" code-span lines
  are the translated placeholders `<tên>`).
- `validate_package.py --preflight` (workflow Python): PASS, 127 translation pairs (E/validate-package-preflight.txt).
- `git diff --check` exit 0 (tracked edits); no trailing whitespace in the new files (E/diff-check.txt, E/trailing-whitespace-untracked.txt).

### 8. Privacy (check 8)

Scratch repository, per-file `cp` and `git add` of the 15 files, `node scripts/precommit-check.mjs`: PASS, 15 staged files, 0
blocking findings, 0 warnings, exit 0; `git diff --cached --check` exit 0 (E/privacy.txt).

### 9. Not done and caveats

- No live GitHub call beyond the public `git ls-remote` of two action repositories, no `gh`, no authenticated call, no write to
  GitHub or GHCR, no run of the new workflow, no deletion, nothing on the NAS. Whether `GITHUB_TOKEN` may delete versions is
  unverified (ADR 0003, marked C). Nothing was staged or committed in the repository.
- Process deviation, disclosed: two early listing commands piped `ls` into `head` (a directory listing only; no result depended on
  it) before I stopped doing so; every later command redirected to a file.
- The first image is from 2026-10-22, so no version can be older than 30 days before about 2026-11-21: the first scheduled runs
  plan no deletion.
- The final source digest and the snapshot list are written as the last step: E/final-digest.txt and E/snapshot-sha256.txt.

Status: done
