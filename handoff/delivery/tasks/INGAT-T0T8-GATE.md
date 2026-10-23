# INGAT-T0T8-GATE dispatch brief (verifier gate on the T0/T8 snapshot)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-GATE, kind gate,
  attempt 1. It depends on INGAT-T0T8-IMPL (done). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium, fixed by the profile);
  requested model sonnet; no override. Routing: size M, risk H, novelty no. docs/08 row
  "Gates, digests, evidence". Write the task record in English.
- **No source writer is active during this gate.** You edit no source.

## Snapshot identity

The changes are uncommitted on purpose (the requester forbids pushing; see the
checkpoint). The snapshot is:

- base commit: the worktree HEAD (`2bce0ab5842b80c710f23496d5173c122319e5c7` unless the
  IMPL Results say otherwise);
- the SHA-256 list the worker wrote last:
  `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt`;
- the source digest the worker recorded last (`node scripts/source-digest.mjs`):
  `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` (875 files,
  `handoff/delivery/evidence/INGAT-T0T8-IMPL/final-digest.txt`).

First and last command of this gate: recompute the SHA-256 of every path in that list,
list `git status --short` and compare. Any extra changed path outside `handoff/`, or any
hash or digest that differs, is a FAIL (record it; do not fix it).

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (verifier part).
- `handoff/delivery/tasks/INGAT-T0T8-PLAN.md` Results: J (gate commands G1-G9), E, F, G.
- `handoff/delivery/tasks/INGAT-T0T8-IMPL.md` (brief and Results), to know what the worker
  ran. A reported result is not proof: rerun every gate yourself.

## Gate (run each, save the output, record command | exit | result)

1. Identity check (above).
2. G1: `ingat validate` exactly as the CI job runs it, on the worktree mounted read-only,
   with `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`.
   Expect exit 0. Save the full command and output verbatim (the requester asked for both).
3. G1n: the same on a copy in the task folder with `expect_labels` removed (edit the copy
   with the Edit tool). Expect exit 1 and the `must bind {commit}` message.
4. G2: every `uses:` in `.github/workflows/*.yml` pinned by a 40-hex SHA with a version
   comment (the plan's `check-workflows.py` copied to the task folder, run with the
   workflow Python `-I`). Also confirm each SHA with `git ls-remote` of the action's
   public repository for the tag in the comment.
5. YAML parse: parse both workflow files with a YAML parser (for example PyYAML if the
   workflow Python has it, or the actionlint run below) and record the result.
6. G3: actionlint, image pinned by digest as in plan J, read-only, `--network none`.
7. G4: local `linux/amd64` build of the app image with the three labels, same flags as
   `image.yml` but `--load`; `docker image inspect` the OS/arch, user and labels. Expect
   `linux/amd64 10001:10001 <HEAD SHA> <package.json version> https://github.com/CDSemi/timesheet`.
8. G5: the S15 command list of plan G, steps 1-3 and 5-7 (step 4 optional, stopped with
   `docker stop`), against the image of step 7, synthetic data in the task folder only.
   This proves the commands, not kernel 4.4.
9. G9: the workflow's lookup/build/digest/verify script against a throw-away local
   registry, as plan J describes: `registry:3` pinned by
   `sha256:01cd312e67026f06f5d89c3e133a4a9adc7cb9eeb9b1194e0b2954dfd770efd2`, started
   detached with `--rm` on a loopback port of 127.0.0.1 in 49820-49829 and stopped with
   `docker stop`; a `docker-container` buildx builder with `--driver-opt network=host`
   (remove the builder afterwards with `docker buildx rm`). Write the script as a file in
   the task folder, with the workflow's `run:` lines and only `IMAGE`, `GITHUB_SHA`,
   `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, `RUNNER_TEMP` and `GITHUB_STEP_SUMMARY` set
   by you. Run it twice: the first run must take the "not found" branch, build, push,
   compute the digest and pass the label check; the second run must say the tag is
   already published and must not rebuild. Also record the exact error text that
   `imagetools inspect --raw` prints for a missing tag in that registry. If any piece
   cannot run here, record NOT VERIFIED for G9 with the reason; do not improvise another
   method.
10. G6: the privacy gate on a scratch repository in the task folder holding only the
    changed files (copy with `cp` per file; `git add <path>` per file, never `-A`), then
    `node <repo>/scripts/precommit-check.mjs` there; plus the plan's marker grep over
    the changed files. Read every hit.
11. G7: `node scripts/precommit-check.mjs --self-test` and `node scripts/source-digest.mjs`
    in the worktree.
12. Translation and links: the parity script the worker used (or the WP5-UX5-T06 one) on
    each touched pair, and `validate_package.py --preflight` with the workflow Python.
13. `git diff --check`.
14. Identity check again (last).

Decision: PASS only if every mandatory item (1-8, 10-14) passed and the identity is
unchanged; G9 may be NOT VERIFIED without blocking a PASS, but say so. Otherwise FAIL or
NOT VERIFIED with the failing item.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-T0T8-GATE/` (masked logs);
  task folder `D:\.claude-tmp\timesheet\INGAT-T0T8-GATE` (raw logs, copies, scratch
  repository, build context state).
- Nothing else. No source, doc or workflow edit.

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON ON THIS MACHINE (NO `node -e`, NO `python -c`,
  NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`,
  NO PID KILLS, NO INTERACTIVE SHELLS (NO `docker run -it`).** `node -e` inside a
  container of the app image is allowed (it runs there and reads no stdin).
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Redirect output to files in the task folder and read them with Read.
- Never run anything against the owner's NAS or a remote host other than public
  GitHub/GHCR/Docker Hub reads. Never push to any remote registry; the only push is to
  the local throw-away registry of G9.
- Do not stage, unstage, commit or push in the repository.
- Before returning: `docker ps -a` and `docker buildx ls` in the evidence show nothing of
  yours still running; no background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step. Record the decision as one
  line `Decision: PASS | FAIL | NOT VERIFIED`, then "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...'.

## Results

Verifier: timesheet-verifier, attempt 1; self-reported model `claude-sonnet-5-5`. Evidence (masked):
`handoff/delivery/evidence/INGAT-T0T8-GATE/` (each `gN.txt` holds the command and exit; scripts kept as `.sh.txt`). Raw: `D:\.claude-tmp\timesheet\INGAT-T0T8-GATE`.
Docker Engine 28.5.1; no PyYAML in the workflow Python.

| # | Item | Exit | Result |
|---|---|---|---|
| 1 | Identity first (`identity-first.txt`) | 0 | HEAD 2bce0ab...; 9 listed hashes OK; digest `79ca6562...cd7` (875 files) equals the worker's; only owned paths changed outside `handoff/` |
| 2 | G1 `ingat validate` (pinned digest b5db73bf..., read-only, --network none, uid 1001) | 0 | `/app: the app's settings file (ingat.toml) is valid` |
| 3 | G1n copy without `expect_labels` | 1 | `compose.expect_labels: must bind {commit}: build_services are pulled` |
| 4 | G2 `check-workflows.py` (`python -I`) | 0 | PASS, 4 `uses:` lines; `git ls-remote` v7.0.1 -> 3d3c42e5..., v4.4.1 -> f87e5991..., v4.6.0 -> dbcb8138... all match, exit 0 |
| 5 | YAML parse | 1 (PyYAML absent) | parser not available; syntax covered by actionlint (item 6, which parses both files) |
| 6 | G3 actionlint 1.7.12 (digest b1934ee5..., ro, no network) | 0 | no findings |
| 7 | G4 build `linux/amd64`, `--load` | 0 | inspect: `linux/amd64 10001:10001 2bce0ab5842b80c710f23496d5173c122319e5c7 0.1.0 https://github.com/CDSemi/timesheet` |
| 8 | G5 S15 steps 1-3, 5-7 on the local image | all 0 | node v24.21.0; better-sqlite3 sqlite 3.53.4; migrate version 15; bootstrap ok (token redacted); backup succeeded; restore restored; `private-data` + `timesheet.db`. Step 4 not run. Proves commands, not kernel 4.4 |
| 9 | G9 local registry (`registry:3`@01cd312e..., 127.0.0.1:49820), builder `network=host` | run1 0, run2 0 | Missing tag error text: `ERROR: localhost:49820/timesheet:<sha>: not found` (exit 1). Run 1: not-found branch, build, push, digest `sha256:8276d028...d8f7`, label check passed. Run 2: "is already published: it is not rebuilt or moved", no build, same digest. Script is the workflow `run:` body, `diff` identical (`wf-run-extracted.sh`). Extra setting: `BUILDX_BUILDER=ingat-gate-builder` (replaces setup-buildx). Registry stopped with `docker stop`, builder removed; `cleanup.txt` shows `docker ps -a` and `buildx ls` hold nothing of mine |
| 10 | G6 scratch repo, 9 files, per-file `git add` | 0 | `PASS: 9 staged file(s), 0 blocking finding(s), 0 warning(s)`; marker grep no hits |
| 11 | G7 `precommit-check --self-test`; `source-digest` | 0, 0 | PASS 35/74/12; digest unchanged |
| 12 | parity (WP5-UX5-T06 script) on docs/07, docs/11, ADR 0002 pairs; `validate_package.py --preflight` | 0 | all PARITY OK (docs/07 link EN 0 / VI 1 exists at HEAD, not from this change); preflight PASS |
| 13 | `git diff --check` | 0 | clean; no trailing whitespace or CR in the five new files |
| 14 | Identity last (`identity-last.txt`) | 0 | hashes and digest identical. One new untracked file appeared under `handoff/` (`tasks/INGAT-T0T8-AUDIT.md`, the coordinator's); nothing outside `handoff/` changed |

Not run / not claimed: GitHub Actions run, GHCR push, package visibility, target-host (kernel 4.4) behaviour, S15 step 4.

Decision: PASS

Status: done
