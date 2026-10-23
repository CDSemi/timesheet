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
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 files). All
  uncommitted, with the track's records under `handoff/`. No commits, nothing to push.
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
- Remaining required work/gates: none for the software change. Unrun by design and
  owner-side: both workflows on GitHub, the first GHCR push, package visibility, the
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
- Concrete blocker or usage stop: the first commit/push dispatch was refused by the
  client's permission check (relayed approval); resolved by the owner's direct
  confirmation in this session.
- Decisions/rules that must remain unchanged:
  - The requester forbids pushing; the standing commit authorization in docs/08 covers
    commits on `main` with a push after each one, so the changes stay uncommitted for the
    owner. The snapshot identity is HEAD plus the SHA-256 list.
  - The live `ORCHESTRATION.json` belongs to the main-checkout coordinator (round UX5).
    This track did not edit the board, STATE or NEXT_ACTION; register its tasks
    (INGAT-T0T8-PLAN, -IMPL, -GATE, -AUDIT, -FIX1, -REGATE1, -RECHECK1) when the branch
    is merged. Merging changes the source digest of `main`, so the main coordinator's
    next gate covers it.
  - The repository is public: no host values in tracked files; no runtime change without
    the owner.
  - Optional, not done: O1-O4 of the recheck (wording) and R2-R5, R8, R9 of the first
    review.
- Required inputs/artifacts for resumption: the task briefs and their Results, the two
  reviews.
- Next command or coherent action: wait for INGAT-T0T8-COMMIT; then INGAT-T0T8-CI.
- Matching active prompt: `handoff/prompts/ORCHESTRATE.md` (roles and gates), with the
  side-track deviations above.

## Orchestration recovery

- Mission/task IDs, dependency status: the seven review-chain tasks done;
  INGAT-T0T8-COMMIT blocked (attempt 1 was never started: the client's permission check
  refused the dispatch itself, reason "[Instruction Poisoning]", because the approval
  came relayed from another session, not typed by the owner here; nothing staged,
  committed or pushed). The owner then confirmed directly in this session (verbatim):
  "Tôi xác nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*)
  rồi push lên main của CDSemi/timesheet. Đây là repo công khai, và lần push này sẽ chạy
  workflow đẩy image lên GHCR." INGAT-T0T8-COMMIT running (attempt 1, fresh
  timesheet-committer, sonnet). INGAT-T0T8-CI pending.
- Coordinator/subagent session IDs, requested/actual settings and attempts: planner,
  workers and verifiers requested sonnet and self-reported claude-sonnet-5-5; both
  auditors requested opus and self-reported claude-opus-5-5; attempt 1 each.
- Owned files, task-local brief/results/evidence: `handoff/delivery/tasks/INGAT-T0T8-*.md`;
  `handoff/delivery/evidence/INGAT-T0T8-*/`; `INGAT_T0_T8_REVIEW.md`,
  `INGAT_T0_T8_RECHECK1.md` (each with `.vi.md`); task folders
  `D:\.claude-tmp\timesheet\INGAT-T0T8-*` (raw logs, outside the repository).
- Live processes or unknown command completion: none reported.
- Last verified source digest; outstanding verifier/audit and current verdict:
  `47e8036bdcfd…a033`; REGATE1 PASS, RECHECK1 PASS.
- Same-session agent continuation or replacement-task inputs: not needed.
- Usage/reset observed timestamp/timezone: not observable.
- One next task/action: wait for INGAT-T0T8-COMMIT; update this checkpoint after its result.
