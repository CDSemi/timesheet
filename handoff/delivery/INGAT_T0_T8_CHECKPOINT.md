# Recoverable checkpoint: Ingat deployability (T0, T8)

English is canonical; the Vietnamese translation is [INGAT_T0_T8_CHECKPOINT.vi.md](INGAT_T0_T8_CHECKPOINT.vi.md).

- Active package and role: side track "Ingat deployability" (T0 `ingat.toml` + validate
  job, T8 image workflow to GHCR), requested by the Ingat session for Ingat's M1 exit
  gate. Coordinator: this session (timesheet-coordinator role, model claude-opus-5-5).
- Repository/archive path; commit SHA; source digest; uncommitted files; unpushed commits:
  worktree `.claude/worktrees/relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`, HEAD `2bce0ab5842b80c710f23496d5173c122319e5c7` (= `main`
  at the start). Accepted snapshot: the nine files in
  `evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt`, source digest
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 files).
  Committed as `6173f07777d3a972db77208390df86a5f7de1a11` and pushed to `main`
  (fast-forward); the later records follow in the INGAT-T0T8-RECORD commit.
- Completed scope:
  - INGAT-T0T8-PLAN done: the owner's draft fails `ingat validate` (no `expect_labels`);
    the other draft errors (local image tag instead of the GHCR name, `log_snapshot`,
    `TRUSTED_PROXY_ADDRESSES` required, a host path in the pause text, the forbidden list,
    the session-hours pattern, unused build keys) are corrected; Compose and Dockerfile
    unchanged; S15: Node.js v24.21.0 on glibc, official support for kernel 4.4 is no
    (Tier 1 from 4.18), practical risk unverified.
  - INGAT-T0T8-IMPL done: `ingat.toml`, `.github/workflows/ingat-validate.yml`,
    `.github/workflows/image.yml`, ADR 0002 EN/VI, one paragraph in docs/07 EN/VI, one
    sentence in docs/11 EN/VI.
  - INGAT-T0T8-GATE PASS; INGAT-T0T8-AUDIT FIX REQUIRED (F1-F3, low, wording and evidence);
    INGAT-T0T8-FIX1 done (comments, wording, nine unrelated evidence rows masked: the
    worker reported ten, the recheck counted nine); INGAT-T0T8-REGATE1 PASS;
    INGAT-T0T8-RECHECK1 PASS (fresh auditor, `INGAT_T0_T8_RECHECK1.md`).
  - The track is accepted on the identity above (gate and fresh recheck on the same
    snapshot).
- Last executed verification command/result: RECHECK1 `ingat validate` with
  `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`
  in the CI form on the worktree and on a clean export: exit 0, "the app's settings file
  (ingat.toml) is valid"; actionlint exit 0.
- In-progress edit and current file state: none.
- Remaining required work/gates: none for the software change. Both workflows have now
  run on GitHub and succeeded (see below). Still owner-side: package visibility, the
  target host, Ingat's S15 spike.
- Commit and push (2026-10-22): the requesting session lifted its no-push condition,
  relaying the owner's words "Đồng ý cho phiên timesheet commit và đẩy T0, T8 lên main
  của repo timesheet theo quy tắc của repo đó, rồi theo dõi CI build ảnh." Under the
  docs/08 standing rule, INGAT-T0T8-COMMIT (timesheet-committer, sonnet) commits on the
  worktree branch and pushes `HEAD:refs/heads/main` as a fast-forward (stop if
  `origin/main` moved). The main checkout is not touched; its local `main` stays behind
  `origin/main` and needs `git merge --ff-only origin/main` before its next commit. Then
  INGAT-T0T8-CI (verifier) watches both workflows and checks the GHCR tag, and a
  handoff-only record commit follows.
- Concrete blocker or usage stop: none open. The first commit/push dispatch was refused by
  the client's permission check (relayed approval); resolved by the owner's direct
  confirmation in this session.
- Decisions/rules that must remain unchanged:
  - Until the owner's direct confirmation, the changes stayed uncommitted (the requester
    had forbidden pushing). The audited snapshot identity was HEAD plus the SHA-256 list;
    the committer proved the committed nine files equal that list.
  - The live `ORCHESTRATION.json` belongs to the main-checkout coordinator (round UX5).
    This track did not edit the board, STATE or NEXT_ACTION; the main coordinator
    registers its tasks (INGAT-T0T8-PLAN, -IMPL, -GATE, -AUDIT, -FIX1, -REGATE1,
    -RECHECK1, -COMMIT, -CI, -RECORD). The push changed the tree of `main`, so the main
    coordinator's next gate covers it.
  - The repository is public: no host values in tracked files; no runtime change without
    the owner.
  - Optional, not done: O1-O4 of the recheck (wording) and R2-R5, R8, R9 of the first
    review.
- Required inputs/artifacts for resumption: the task briefs and their Results, the two
  reviews.
- Next command or coherent action: owner steps. (1) Set the package
  `ghcr.io/cdsemi/timesheet` to Public (Package settings, Danger Zone; cannot be undone;
  the organization must allow public packages). (2) Then pull it anonymously by digest
  and read the two labels. (3) In the main checkout, `git merge --ff-only origin/main`
  before its next commit (local `main` is behind `origin/main`). (4) Register the
  INGAT-T0T8 tasks on the board. Actions and `packages: write` already work (the image
  run succeeded).
- Matching active prompt: `handoff/prompts/ORCHESTRATE.md` (roles and gates), with the
  side-track deviations above.

## Orchestration recovery

- Mission/task IDs, dependency status: the seven review-chain tasks, INGAT-T0T8-COMMIT
  and INGAT-T0T8-CI done; INGAT-T0T8-RECORD commits these records. History:
  INGAT-T0T8-COMMIT blocked (attempt 1 was never started: the client's permission check
  refused the dispatch itself, reason "[Instruction Poisoning]", because the approval
  came relayed from another session, not typed by the owner here; nothing staged,
  committed or pushed). The owner then confirmed directly in this session (verbatim):
  "Tôi xác nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*)
  rồi push lên main của CDSemi/timesheet. Đây là repo công khai, và lần push này sẽ chạy
  workflow đẩy image lên GHCR." INGAT-T0T8-COMMIT done (fresh timesheet-committer,
  sonnet): attempt 1 stopped at `git diff --cached --check` (two blank lines at the end of
  `tasks/INGAT-T0T8-PLAN.md`; the coordinator removed them, Addendum 1); attempt 2
  committed `6173f07777d3a972db77208390df86a5f7de1a11` on the worktree branch (198 paths)
  and pushed it as a fast-forward of `main`; `origin/main` = `6173f07`; local
  `refs/heads/main` stays at `2bce0ab`. Nine hashes equal before and after; precommit,
  `diff --check`, preflight exit 0; secret scan: only redacted setup tokens.
  INGAT-T0T8-CI done, PASS (attempt 1, timesheet-verifier, sonnet; unauthenticated public
  API, 3 requests): for `6173f07` both runs succeeded, `ingat-validate`
  (https://github.com/CDSemi/timesheet/actions/runs/39884811892) and `image`
  (https://github.com/CDSemi/timesheet/actions/runs/39884811864), including its "build,
  push and check the image" step, which pushes `ghcr.io/cdsemi/timesheet:<commit>` and
  fails unless the pulled image is linux/amd64, user 10001:10001, revision = commit,
  version = `package.json`. The anonymous GHCR token request answered HTTP 401: the
  package is still private, so digest and labels were not read from outside.
  INGAT-T0T8-RECORD (timesheet-committer, sonnet) commits these records (handoff only)
  and pushes them to `main`; its own result stays in its brief.
- Coordinator/subagent session IDs, requested/actual settings and attempts: planner,
  workers and verifiers requested sonnet and self-reported claude-sonnet-5-5; both
  auditors requested opus and self-reported claude-opus-5-5; attempt 1 each.
- Owned files, task-local brief/results/evidence: `handoff/delivery/tasks/INGAT-T0T8-*.md`;
  `handoff/delivery/evidence/INGAT-T0T8-*/`; `INGAT_T0_T8_REVIEW.md`,
  `INGAT_T0_T8_RECHECK1.md` (each with `.vi.md`); task folders
  `D:\.claude-tmp\timesheet\INGAT-T0T8-*` (raw logs, outside the repository).
- Live processes or unknown command completion: none reported.
- Last verified source digest; outstanding verifier/audit and current verdict:
  `47e8036bdcfd…a033`; REGATE1 PASS, RECHECK1 PASS; CI PASS on `6173f07`.
- Same-session agent continuation or replacement-task inputs: not needed.
- Usage/reset observed timestamp/timezone: not observable.
- One next task/action: the owner sets the GHCR package to Public.

## Follow-up: GHCR cleanup (GC)

- Owner request (2026-10-22, this session, verbatim): "Thêm 1 job dọn định kỳ xóa các phiên
  bản cũ, nhưng chỉ xóa các bản ko phải bản release. các bản release nếu muốn xóa thì cần
  phải xóa bằng tay".
- Uncommitted at the start: the Results of `tasks/INGAT-T0T8-RECORD.md` and
  `evidence/INGAT-T0T8-RECORD/` (written after the record commit `70dce2a`).
- INGAT-GC-PLAN done (attempt 1, timesheet-planner, self-reported claude-sonnet-5-5;
  `tasks/INGAT-GC-PLAN.md`, `evidence/INGAT-GC-PLAN/`): a release = a commit with a git
  tag; a version is deleted only if all its tags are commit SHAs, none is a tagged commit,
  it is outside the newest 20 and older than 30 days; floors 10 / 7 days, at most 50
  deletions per run, oldest first; dry run by default; own concurrency group; script
  `scripts/ghcr-cleanup.ts` with offline tests; new ADR 0003. Not run: tsc, eslint, real
  vitest, any GitHub call. Residual risk: an untagged commit older than 30 days whose
  backups Ingat must still restore loses its registry image.
- Owner decisions (2026-10-22, this session, verbatim): "D1. theo đề xuất / D2. Giữ 20 bản
  mới nhất và mọi bản dưới 30 ngày, không giới hạn số lượng mỗi lần xoá / D3. Xóa thật
  luôn (nhưng theo quy tắc D2 thì làm gì có bản nào hơn 30 ngày để mà xóa) / yes, lên
  main". Meaning: D1 any git tag marks a release; D2 keep the newest 20 and everything
  younger than 30 days, no per-run deletion cap; D3 the schedule deletes from its first
  run (no `GHCR_CLEANUP_APPLY` gate); after an audit PASS, commit and push to `main`. D4
  stays open (only if the first live delete answers 403; no personal token meanwhile).
- INGAT-GC-IMPL done (attempt 1, timesheet-worker-high, self-reported claude-sonnet-5-5):
  15 files (`evidence/INGAT-GC-IMPL/snapshot-sha256.txt`), digest `1d004a9a…dfa0` (882
  files); worker reports 26 cleanup tests, typecheck, lint, `npm test`, `npm run verify`
  exit 0 in a clean export, five mutations caught, actionlint clean. Runtime slip: `ls`
  piped into `head` twice (listing only).
- INGAT-GC-GATE attempt 1 done, FAIL (self-reported claude-sonnet-5-5): every item passed
  on the unchanged identity except item 6: removing the "never delete every version"
  abort (`scripts/ghcr-cleanup.ts:139`, defence in depth unreachable through the floor)
  leaves all 26 tests passing.
- INGAT-GC-FIX1 running (attempt 1, timesheet-worker, requested model sonnet, no override;
  routing S/M/no; addresses_gate INGAT-GC-GATE): a direct test of that abort (and of the
  line-136 check if untested). Done (self-reported claude-sonnet-5-5): `assertSafe`
  exported, three tests added, all seven mutations now caught (worker report); digest
  `e47e6344…ee56`, list `evidence/INGAT-GC-FIX1/snapshot-sha256.txt`.
- INGAT-GC-REGATE1 done, PASS (attempt 1, timesheet-verifier, sonnet, full gate) on digest
  `e47e6344…ee56`: script delta only `export`; cleanup test 29, `npm test` 2374, verify
  smoke passed; all seven mutations caught; actionlint, pins, parity, preflight, privacy.
- INGAT-GC-AUDIT done, PASS (attempt 1, timesheet-auditor, self-reported claude-opus-5-5,
  fresh context; `INGAT_GC_REVIEW.md`): identity equal first and last; all checks rerun;
  17 own mutation probes (13 killed, 2 test gaps, 2 equivalent); no path deletes a
  protected version. Optional O1-O9 (for example ADR 0002 still says nothing has run on
  GitHub; a plainer tag duty citing Ingat; a newer API version; two test gaps;
  `assertSafe` does not re-check the age rule). The first live run is unrun by design.
- INGAT-GC-COMMIT done (attempt 1, timesheet-committer, self-reported claude-sonnet-5-5;
  the owner's "yes, lên main"): commit `782cddabae6260a87c600936daf0408eebb17f56` (286
  files: 15 source, 12 handoff files, 7 evidence folders), pushed to `main` as a
  fast-forward; `origin/main` = `782cdda`; the 15 hashes equal HEAD; digest unchanged
  `e47e6344…ee56`; every check exit 0. Its checks are in the untracked
  `evidence/INGAT-GC-COMMIT/checks.txt`.
- INGAT-GC-CI done, PASS (attempt 1, timesheet-light, self-reported claude-haiku-5-5; 7
  public API requests): `782cdda` ingat-validate run 39909592535 success, image run
  39909592540 success; `70dce2a` ingat-validate run 39885375736 success, image run
  39885375744 success; workflow `image-cleanup` (id 393702719) registered, state active.
  It has not run yet (schedule or manual dispatch only).
- INGAT-GC-RECORD done (timesheet-committer, sonnet): commit
  `01c4cdcb5abefad41ec9f8431752eab76f4d2c4a` (9 handoff paths), pushed to `main` as a
  fast-forward. Uncommitted: `evidence/INGAT-GC-RECORD/`.

## Synchronization with the main checkout (2026-10-23)

- Owner (this session): the timesheet project's agent reports commits out of step; the
  owner wants everything synchronized and pushed before either side continues, with the
  two agents coordinating.
- This side pushes nothing more until the procedure is agreed (`origin/main` stays at
  `01c4cdc` from this side).
- INGAT-SYNC-RECON done (attempt 1, timesheet-planner, self-reported claude-sonnet-5-5,
  read-only; `tasks/INGAT-SYNC-RECON.md`): local `main` `7aafa21` (WP5-UX5-FIX2, unpushed)
  is 1 ahead and 2 behind `origin/main` `01c4cdc`, diverged from `70dce2a`; no shared
  path; `git merge-tree` clean; no merge or rebase in progress. The main checkout's
  coordinator (session `95755b87…`) added two uncommitted sections to this checkpoint pair
  in the main checkout ("Structural audit of `ingat.toml`" and "Design review of the
  manifest format") at the same place where `782cdda`/`01c4cdc` added theirs, so its
  `git merge --ff-only origin/main` (its owner decision of 2026-10-23) cannot run.
- Proposed procedure (needs the owner's approval of one merge commit, which replaces the
  board's "ff-only, no merge commit" decision for this one synchronization):
  0. the other coordinator holds every git write and every edit of this pair in the main
     checkout until step 4;
  1. this side commits and pushes its remaining records (fast-forward);
  2. a verifier gates the exact merged tree (`git merge-tree` of the new `origin/main` and
     `7aafa21`, archived and run with `npm ci` and `npm run verify`);
  3. this side's committer makes the merge commit in the worktree (`git merge --no-ff
     refs/heads/main`), checks its tree equals the gated tree, and pushes it as a
     fast-forward of `origin/main`;
  4. the other coordinator saves its two sections, restores the pair, runs
     `git merge --ff-only origin/main`, re-adds its sections after this side's, commits
     its untracked INGAT review files and its board update (registering the INGAT tasks),
     and pushes.
- 2026-10-23: the owner relayed the hold; the other side is paused (owner, verbatim: "Bên
  kia hiện đang tạm dừng, ko chạy gì cả"). Step 1 INGAT-SYNC-RECORD (timesheet-committer,
  sonnet) commits these records as a fast-forward. Step 2 (a verifier gate on the merged
  tree) follows. Step 3, the merge commit, waits for the owner's explicit approval.
- Step 1 done: INGAT-SYNC-RECORD committed `db8793967b6967fbe0f62c6e97d9039ffe4f39fe` (15
  handoff paths) and pushed it as a fast-forward; `origin/main` = `db87939`. The committer
  noted the OS account name in `evidence/INGAT-SYNC-RECON/recon2.txt` (also present in 14
  earlier published files; the precommit passed): a privacy follow-up for the owner.
- Owner approval of step 3 (2026-10-23, this session, verbatim): "nếu ko có gì xung đột
  thì merge đi, nếu có xung đột thì bạn tự giải quyết nếu đc, nếu ko đc thì chỉ rõ để tôi
  hiểu mà biết đường quyết định" (if nothing conflicts, merge; if something conflicts,
  resolve it yourself if possible; if not, explain it clearly so I can decide).
- Step 2 INGAT-SYNC-GATE done, PASS (attempt 1, timesheet-verifier, sonnet): merged tree
  T = `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`, no conflict; typecheck, lint, `npm test`
  (2374/2374), `npm run verify`, pinned `ingat validate` and actionlint exit 0 on T.
- Step 3 INGAT-SYNC-MERGE attempt 1 stopped: `git merge` wrote the merged files into the
  working tree, then failed with "unable to write .git/worktrees/relaxed-lalande-8359f0/index"
  (exit 128). No `MERGE_HEAD`, HEAD still `db87939`, nothing committed or pushed, nothing
  cleaned or reset; the working tree holds the 7aafa21 files as unstaged changes.
- Step 3 attempt 2 running (fresh timesheet-committer, sonnet; brief Addendum 1): the merge
  commit M is built from the gated tree T with `git commit-tree` (parents `db87939`,
  `7aafa21`), checked through a temporary index outside Dropbox, then a record commit R on
  M, and R is pushed as a fast-forward. The worktree's own index and branch are left
  untouched (stale locally; everything it holds will be on `origin`).
- Attempt 2 done (self-reported claude-sonnet-5-5): M =
  `b8bae505cdd546b29c48389219dd263fd670662b` (tree T, parents `db87939`, `7aafa21`); R =
  `377554e024db1669e47fd19eeadaf9dccc672b3e` (records on M); first push HTTP 408, retry a
  fast-forward, exit 0; `origin/main` = R; `7aafa21` is an ancestor of R. Worktree left
  as it was (HEAD `db87939`, the failed merge's files unstaged).
- INGAT-SYNC-CHECK done, PASS (timesheet-light, self-reported claude-haiku-5-5; read-only):
  `origin/main` = ls-remote = R `377554e`; M tree T, parents `db87939`, `7aafa21`; R's only
  parent M; M..R = 24 paths, all under `handoff/delivery/`; `7aafa21` and `db87939` are
  ancestors of `origin/main`; the main checkout HEAD is still `7aafa21`.
- INGAT-SYNC-RECORD2 (timesheet-committer, sonnet) commits these last records on R with a
  temporary index and pushes them as a fast-forward. After it, this side pushes nothing
  more; its worktree is stale (HEAD `db87939`, the failed merge's files unstaged) and holds
  nothing that is not on `origin`, so the owner may remove it.
- Step 4, the other coordinator (relayed by the owner): save its two sections of this
  pair, restore the pair, `git fetch`, `git merge --ff-only origin/main`, re-add its
  sections, commit its untracked INGAT review files and its board update (register the
  INGAT tasks), push.
- INGAT-SYNC-RECORD2: attempt 1 stopped at the precommit check (the commit identity
  e-mail in `evidence/INGAT-SYNC-CHECK/02-M.txt` and `03-R.txt`); INGAT-SYNC-MASK replaced
  those lines. Attempt 2 (same agent) passed every check (19 paths, precommit PASS, tree
  `6ac74e7c…`) but the client's permission check denied the `commit-tree` and push call,
  reason "[PII Data Handling]". Nothing created or pushed. Not routed around; the agent is
  not resumed for the same action. `origin/main` stays `377554e`, which already holds the
  merge; only these last records are not on GitHub.
- Owner (2026-10-23, verbatim): "Tôi xác nhận cho commit và push các tệp hồ sơ
  handoff/delivery/**/INGAT-SYNC* và cặp INGAT_T0_T8_CHECKPOINT lên main; các dòng email đã
  được che." INGAT-SYNC-RECORD2 attempt 3 runs with a fresh committer (brief Addendum 2),
  while the other coordinator stays paused.
- Owner steps for the cleanup: none needed to start (the schedule deletes from its first
  run, and nothing is older than 30 days before about 2026-11-21). If the first scheduled
  run fails with 403, check the package's "Manage Actions access" role for
  `CDSemi/timesheet` (D4 stays open). The local `main` of the main checkout is now three
  commits behind `origin/main` (`git merge --ff-only origin/main` there).

## Structural audit of `ingat.toml` (2026-10-22, owner request)

- Request: the owner asked whether `ingat.toml` is bloated or redundant and whether it is
  lean and easy to use. This is a new structure/usability audit of the accepted file, not a
  repeat of the correctness audits.
- Coordinator: a new main-checkout session (`95755b87-cb43-4c64-80f8-8fddd1e9114b`), role
  timesheet-coordinator. The live board still records WP5-UX5-REGATE2 as running from the
  earlier session `b5de56d1…`; this audit is read-only on source and starts no writer.
- Task INGAT-TOML-AUDIT: kind audit, attempt 1, **running** (dispatched; agent
  `ad411eefc3b66eb73`, coordinator session above); timesheet-auditor (xhigh), requested
  opus, no override; routing size M, risk H, novelty
  no; author separation: the file's authors (PLAN, IMPL, FIX1) were sonnet; fresh context.
  Brief: `handoff/delivery/tasks/INGAT-TOML-AUDIT.md`. Outputs: `INGAT_TOML_REVIEW.md`
  (+ `.vi.md`), `evidence/INGAT-TOML-AUDIT/`, task folder
  `D:\.claude-tmp\timesheet\INGAT-TOML-AUDIT`.
- Identity under audit: the main checkout's `ingat.toml` at HEAD (expected local HEAD
  `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`, unpushed under the owner's push hold; the file
  equals the `6173f07` blob). The auditor records identity first and last.
- Not on the board (track convention). The INGAT-T0T8 tasks are still not registered on
  the board (owner step 4 above remains open).
- **Result (2026-10-23): INGAT-TOML-AUDIT done, attempt 1, self-reported claude-opus-5-5,
  decision FIX REQUIRED (two Low findings, both behaviour-neutral; the owner may accept or
  decline).** Identity first and last: HEAD `7aafa21…`, `ingat.toml` SHA-256
  `7bf274a8c8da29c75c806e46bfa62489b4821d59fee08a5d81c70cced74a1104` (= HEAD blob =
  `6173f07` blob), source digest `59516a2d…` (875 files). Review:
  `INGAT_TOML_REVIEW.md` (+ `.vi.md`); evidence `evidence/INGAT-TOML-AUDIT/` (13 files,
  each `cmp`-equal to its task-folder original); privacy gate on a scratch repository of
  all 16 written files: PASS.
  - Headline: not bloated; the M1 form of MANIFEST_SPEC §11 in the same section order, 257
    lines against Ingat's own fx-lite fixture at 255; schema 1 has no task defaults (a
    `[task_defaults]` table is refused), so the per-task boilerplate cannot be shortened.
  - F1 Low: six empty lists equal the parser default (`[backup] verify`, `[restore]
    start/post/checks`, `[drill] checks/record`). F2 Low: the header repeats ADR 0002 and
    the CI-image fact is stated three times. Lean variant (`lean-ingat.toml.txt`): 249
    lines / 10,938 bytes, pinned `ingat validate` exit 0, parsed model identical (556
    fields, body SHA-256 `e831cb73…`).
  - Optional O-A..O-J (wrapping the three long strings, operator hints in `pause` and
    `restore_notice`, format remarks, dropping `[[smoke]] live`, Ingat-side gap
    `local_only` unenforced in 0.1.0, no test binding task argv to `cli.ts`); known O1,
    O3, O4, R8 unchanged.
- Coordinator check: review, brief Results and evidence listing reconciled; nothing
  outside the auditor's owned paths changed; no stage, commit or push. Records uncommitted
  (push hold stays).
- Next action: owner decision on F1/F2 (and any optional item). Accept: one bounded
  worker fix on `ingat.toml` only, a freeze commit, a gate (pinned validate plus the model
  dump; body hash unchanged unless O-B..O-E are chosen) and a fresh recheck. Decline:
  record the decision here and close the audit without a source change. The owner has not
  answered yet (2026-10-23); the decision stays open.

## Design review of the manifest format (2026-10-23, owner clarification)

- The owner clarified: the question is about the design of the manifest format itself
  (Ingat's MANIFEST_SPEC: tables, keys, how tasks, probes and params are expressed), not
  about this file against the codebase — is the design optimal and easiest to use, or could
  it be designed better? Plus: what TOML is, how easy to learn, how widespread.
- Task INGAT-MANIFEST-DESIGN: kind plan (design review, no source change), attempt 1,
  **running** (dispatched; agent `ada2d126be04ca8e9`); timesheet-planner (high), requested opus,
  model_override_reason `novelty` (first format-design review; cross-tool judgment); routing
  size M, risk M, novelty yes. Brief: `handoff/delivery/tasks/INGAT-MANIFEST-DESIGN.md`.
  Outputs: `INGAT_MANIFEST_DESIGN_REVIEW.md` (+ `.vi.md`),
  `evidence/INGAT-MANIFEST-DESIGN/`, task folder
  `D:\.claude-tmp\timesheet\INGAT-MANIFEST-DESIGN`. It writes nothing in the Ingat
  repository and changes no manifest.
- **Result (2026-10-23): INGAT-MANIFEST-DESIGN done, attempt 1, self-reported
  claude-opus-5-5.** Review: `INGAT_MANIFEST_DESIGN_REVIEW.md` (+ `.vi.md`); evidence
  `evidence/INGAT-MANIFEST-DESIGN/` (10 files: the measured minimal, readiness and operable
  manifests, the proposed rewrite sketch, validate outputs, counts, comparables, the two
  scripts, `commands.txt`). Nothing staged or committed; no Ingat file touched.
  - Verdict: the format is close to the optimum for its job (safe backup, restore,
    rollback, drill of Compose apps) but not yet the easiest to use. Measured with the
    pinned validate: minimal valid manifest 26 lines (30 with readiness), operable form 72,
    this app 257 (11 commands with distinct contracts, 14 env keys, an outbound pause);
    the same data is 211 content lines in TOML, 280 in YAML, 509 in JSON, so TOML is not
    the cause.
  - Real gaps found (Ingat-side): a trap (`[backup] strategy` defaults to `"none"`, so a
    data app without `[backup]` validates green and is refused at its first data-changing
    update); no starter template, `init`, JSON Schema or did-you-mean; plumbing keys
    (`service`, `mode`, `timeout`) repeated per task; naming collisions
    (`clear_hold`/`clears_hold`, `record`, `activate`, `expect`/`expected`).
  - Proposals: P1-1..P1-4 (validation rule, messages, JSON Schema, docs; no schema change),
    P1-a possible today (= INGAT-TOML-AUDIT lean form, -8 lines), P2-a..P2-h (task
    defaults for transport keys only, inferred links, smoke by probe reference, install
    activate step, implied `operator`, renames, `validate --explain`; additive if decided
    before the M2 schema freeze), P3 taste or not recommended (inheritance, other format,
    one lifecycle table). Rewrite sketch with P1-a + P2-a..f: 218 lines (-15%), refused by
    0.1.0 as expected.
- Coordinator check: review, brief Results (Status: done) and evidence listing
  reconciled. Every proposal except P1-a is an Ingat-side decision for the owner; nothing
  in this repository changes until an Ingat release carries it.
- Next action: the owner reads the review; decides P1-a here (same decision as F1/F2
  above) and the Ingat-side items in the Ingat project.
