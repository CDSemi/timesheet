# INGAT-GC-AUDIT dispatch brief (fresh independent audit of the GHCR cleanup)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-AUDIT, kind audit, attempt 1. It depends
  on INGAT-GC-GATE (PASS required; the coordinator fills in "Gate at dispatch"). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json`; do not edit the board,
  STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-auditor (effort xhigh), requested model opus, no
  override. Routing: size M, risk H (a scheduled job with delete power over the registry
  that Ingat restores from), novelty yes. Write the task record in English.
- **Author separation.** Authors: the planner of INGAT-GC-PLAN, the worker of
  INGAT-GC-IMPL and the fix worker of INGAT-GC-FIX1 (all self-reported
  claude-sonnet-5-5). You run in a fresh context and authored none of it. You fix
  nothing.

## Snapshot identity

Base commit = worktree HEAD; `handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt`
(15 paths); the source digest under "Gate at dispatch". Recompute first and last; a
difference means NOT VERIFIED.

## Requirements to audit against

1. The owner's request (2026-10-22, verbatim): "Thêm 1 job dọn định kỳ xóa các phiên bản
   cũ, nhưng chỉ xóa các bản ko phải bản release. các bản release nếu muốn xóa thì cần
   phải xóa bằng tay" (a periodic job deletes old versions, only non-release ones;
   release versions are deleted only by hand).
2. The owner's decisions (verbatim): "D1. theo đề xuất / D2. Giữ 20 bản mới nhất và mọi
   bản dưới 30 ngày, không giới hạn số lượng mỗi lần xoá / D3. Xóa thật luôn (nhưng theo
   quy tắc D2 thì làm gì có bản nào hơn 30 ngày để mà xóa)": any git tag marks a release;
   keep the newest 20 and everything younger than 30 days; no per-run cap; the schedule
   deletes from its first run. D4 open: no personal token.
3. The plan's safety design (`tasks/INGAT-GC-PLAN.md` sections 1-6) where the decisions
   did not change it: fail closed, floors, never delete everything, untagged and non-SHA
   tags kept, own concurrency group, least privilege, inputs through `env`, SHA pins.
4. This repository's rules (AGENTS.md: English canonical with `.vi.md` pairs, the ADR
   rule, rule 11 no deprecated APIs, no invented evidence, public repository).

## Audit (at least)

1. Identity check.
2. Trace the deletion rule end to end: the git tag listing (lightweight and annotated
   tags, peeled refs), the version listing and parsing (pagination, malformed answers),
   the selection, `assertSafe`, and the delete loop (re-read before delete, stop on the
   first non-204). Look for any path where a release, untagged, non-SHA-tagged, newest-20
   or younger-than-30-days version could be deleted, including races with a publish or a
   tag push, clock skew, and an empty or failed tag listing.
3. Check the GitHub API facts the code relies on against GitHub's public docs (endpoints,
   the container version shape, `GITHUB_TOKEN` package permissions for deletion, the
   30-day restore window, rate limits); mark each verified or not.
4. The workflow: triggers, schedule, permissions per job, concurrency, the `apply` gating
   per D3, the dry-run default for manual runs, `persist-credentials: false`, inputs via
   `env`, pinned SHAs (confirm with `git ls-remote`), actionlint pinned by digest.
5. Rerun, in your own clean export with `npm ci` (Node 24's npm; `DATA_DIR` and
   `DATABASE_PATH` in your task folder): the cleanup test, `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run verify`; the fixture dry runs; at least two
   mutation probes of your own choice beyond the gate's.
6. Ingat interplay: read Ingat's docs on image pulls for restore, drill and rollback
   (`D:\Dropbox\Work.LISA\LisaHQ\Ingat`, read-only) and judge whether the docs state the
   residual risk and the owner's duty (tag a commit whose backups must outlive 30 days)
   plainly and correctly.
7. Docs: ADR 0003 and the ADR 0002, docs/07 and docs/11 edits against the behaviour;
   EN/VI parity; `validate_package.py --preflight`; the stale "neither workflow has run"
   sentence corrected with true facts; no claim of a live run or deletion.
8. Privacy over the snapshot and the track's new `handoff/` files (precommit gate on a
   scratch repository).
9. Identity check again (last).

## Outputs

- `handoff/delivery/INGAT_GC_REVIEW.md` and `.vi.md` (REVIEW template); this brief's
  Results; `handoff/delivery/evidence/INGAT-GC-AUDIT/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-AUDIT`.
- Decision PASS / FIX REQUIRED / NOT VERIFIED; findings as severity | file | repro |
  expected/actual | rule | bounded fix; optional improvements kept separate; the first
  live run listed as unrun by design.

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
  in the repository. Do not edit the snapshot, stage, commit or push.
- Stop every server you start through its own handle; before returning, no background
  command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step; end each file you write with
  exactly one newline (no trailing blank lines); finish the brief with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the decision.

## Gate at dispatch

- INGAT-GC-GATE attempt 1: FAIL on item 6 only (the line-139 abort was not reached by any
  test). INGAT-GC-FIX1 exported `assertSafe` and added three tests.
- INGAT-GC-REGATE1 attempt 1: Decision PASS (self-reported claude-sonnet-5-5, full gate) on
  HEAD `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`, the 15 hashes of
  `evidence/INGAT-GC-FIX1/snapshot-sha256.txt` and digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`; identity equal first
  and last. Results in `handoff/delivery/tasks/INGAT-GC-REGATE1.md`.
- Since that gate, only coordinator files under `handoff/` changed (this brief and the
  checkpoint pair).

## Results

Auditor: timesheet-auditor, attempt 1. Self-reported model: claude-opus-5-5 (not weaker than
the authors' claude-sonnet-5-5). Evidence: `handoff/delivery/evidence/INGAT-GC-AUDIT/` (E/);
task folder `D:\.claude-tmp\timesheet\INGAT-GC-AUDIT` (scripts, export, scratch).

- Step 1, identity first (`id.sh first`, exit 0): Node v24.21.0; 15 hashes OK against
  `evidence/INGAT-GC-FIX1/snapshot-sha256.txt`; digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56` (882 files); HEAD
  `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5` on `claude/relaxed-lalande-8359f0`; status
  outside `handoff/` is exactly the 15 listed paths; no `node_modules` in the worktree
  (E/id-first-*).
- Step 2, clean export (`export.sh`, exit 0): `git archive HEAD` plus the 15 files copied
  per file, 15 hashes OK (E/export-hashes.txt); `npm ci` with Node v24.21.0 first on PATH
  running npm 11.19.1 (`C:\Program Files\nodejs\...\npm-cli.js`; Node 24's folder has no
  npm), exit 0 (E/npm-version.txt, E/npm-ci.txt; its "4 vulnerabilities" note concerns the
  unchanged lock file).
- Step 3, gate in the export (`gate.sh`, `DATA_DIR`/`DATABASE_PATH`/TEMP/TMP in the task
  folder): cleanup test exit 0, 29 passed; `npm run typecheck` exit 0; `npm run lint` exit 0;
  `npm test` exit 0, 101 files / 2374 tests; `npm run verify` exit 0, `SMOKE PASSED`; no
  "deprecat", "warn" or "experimental" in any output (E/g1..g5, E/deprecation-scan.txt).
- Step 4, fixture dry runs in the export (`dry.sh`, `--now 2026-11-01T00:00:00Z`): defaults keep 35, delete 5 (1010,
  1009, 1008, 1004, 1001), exit 0; `--keep-newest 10 --keep-days 7` keep 15, delete 25, exit 0 (equal to IMPL and both
  gates). Refusals, exit 1 with one `::error::` each: keep-newest 9, keep-days 6, `--apply` with `--versions-file`,
  `--max-delete`, no `--tags-file`, online without `GITHUB_TOKEN` (no network call), `--now` online, a negative value,
  an invalid owner, an empty versions file, a `fatal:` line as tag list (E/dry-*.txt, E/refuse-*.txt).
- Step 5, own mutation probes (`mut.mjs` on the export copy; 17 probes, none of the gates' seven): 13 killed (age
  boundary 4 fail, age rule 4, rank off-by-one 13 / with `assertSafe` 9, re-read bypass 1, non-204 continues 1, order
  not reversed 2, dry run deletes 1, peeled commit ignored 3, lone peeled accepted 1, token check 1, paging stops after
  a full page 1, `some` for `every` 4); 4 survive: `sameTags` without the length check and an unanchored `COMMIT_TAG`
  (test gaps, code correct), `state=active` dropped and the empty-package abort removed (equivalent: documented default
  and `assertSafe`). Script restored, sha256 `4302a44f...` (E/mut-summary.txt, E/mut-a*.txt). Lint coverage probe: a
  deprecated `escape()` call appended to the export copy fails `@typescript-eslint/no-deprecated`; restored
  (E/lint-coverage-probe.txt). Real `git ls-remote --tags` of git/git (1012 annotated tags) parses; every peeled commit
  is in the set, no tag object is (E/lsremote-real-probe.txt).
- Step 6, workflow (`chk.sh`): actionlint 1.7.12 by digest, `--network none`, read-only, three workflows: exit 0, no
  finding; SHA-pin check PASS (4 + 3 + 1); anonymous `git ls-remote`: setup-node v7.1.0 `949feb24...`, checkout v7.0.1
  `3d3c42e5...` equal the pins; parity OK x4; `--preflight` PASS (127 pairs); `git diff --check` exit 0; no trailing
  whitespace in the 7 new files (E/actionlint.txt, sha-pin-check.txt, parity.txt, preflight.txt, diff-check.txt,
  trailing-ws-untracked.txt, public-repo.txt).
- Step 7, GitHub facts against public docs and unauthenticated reads (E/api-facts.txt, E/public-runs.txt,
  E/public-repo.txt): endpoints, version shape, restore window, 5,000-download limit, `GITHUB_TOKEN` delete with the
  package admin role (public preview), rate limits, concurrency, schedule, default shell, visibility, Organization
  owner: verified; the live token answer is not verifiable here (first run). Both runs docs/07 names are `success` for
  `6173f07`. API version `2022-11-28` is supported until 2028-03-10 (no Deprecation header); `2026-03-10` exists.
- Step 8, Ingat interplay (read-only: ADR-0026, ADR-0007, LIFECYCLE 4.2, 4.6, 4.7, 4.9, 4.10, 4.13, 5.6, ARCHITECTURE
  image rows and R14, MANIFEST_SPEC release keys): the docs state correctly that the running service and the previous
  deployment use local images, that a drill, restore, rollback, new host or cross-host restore needs a pull once the local
  image is gone, that a deleted image cannot be pulled and a rebuild has another digest, and the owner's tag duty. Not
  stated: that on DSM a Container Manager storage-driver change hides local images and recovery re-pulls the recorded
  digests (ARCHITECTURE R14), so in practice every commit deployed to the NAS should be tagged (optional wording).
- Step 9, privacy (`priv.sh track`): scratch repository with the repository's `.gitattributes`, the 15 snapshot files,
  every untracked and modified file under `handoff/` of the track (273 files, per-file `cp` and `git add`):
  `precommit-check.mjs` PASS, 0 blocking, 0 warnings; `git diff --cached --check` exit 0; no profile path or personal
  address marker (E/privacy-track*.txt). A first run without `.gitattributes` flagged only CRLF in captured evidence
  logs, which the repository exempts (`handoff/delivery/evidence/** -whitespace`). One own evidence line with a profile
  path (`npm-version.txt`) was redacted before this run.
- Step 10, review written: `handoff/delivery/INGAT_GC_REVIEW.md` and `.vi.md` (parity OK, 16 table lines and 9
  optional items in each). Findings: none. Optional improvements O1-O9, the main ones: O1 ADR 0002 lines 3 and 55-57 still
  say nothing has run on GitHub (pre-existing, outside this package's edit scope); O2 say plainly "tag each commit you
  deploy to the NAS" and name Ingat ARCHITECTURE R14; O3 move the API version to `2026-03-10` before 2028-03-10; O4 two
  test gaps (`sameTags` length, `COMMIT_TAG` anchors); O5 `assertSafe` does not re-check the age rule although ADR 0003
  implies every rule.
- Step 11, identity last (`id.sh last`, exit 0): 15 hashes OK; digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56` unchanged; HEAD `70dce2a` unchanged; status outside
  `handoff/` identical to the first check; the full status differs only by the auditor's own files; no `node_modules`
  (E/id-last-*).
- Step 12, own outputs (`priv.sh own`: the review pair, this brief, 69 evidence files): precommit PASS, 0 blocking,
  0 warnings, `git diff --cached --check` exit 0, no marker (E/privacy-own*.txt); every file ends with exactly one
  newline (`eol-check.sh`).
- Unrun by design: any run of `image-cleanup.yml`, the live list, the token's list and delete permission, any deletion or
  restore, Ingat on the host. No authenticated GitHub call, no `gh`, no GitHub or GHCR write, nothing on the NAS, no npm
  install in the repository, nothing staged, committed or pushed; no background command left running.

Decision: PASS

Status: done
