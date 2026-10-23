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
- INGAT-GC-COMMIT running (attempt 1, timesheet-committer, sonnet; the owner's "yes, lên
  main"): commit on the worktree branch, push `HEAD:refs/heads/main` as a fast-forward.
