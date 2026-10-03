# Workflow revision checkpoint

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Date: 2026-10-02.

- Active package and role: board package WP1, phase workflow-revision-implement;
  coordinator. Actual model claude-opus-5-5 (owner choice; profile requests
  sonnet/medium); effort not observable. Session 44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: HEAD ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed = origin/main. The
  previous orchestration redesign is already committed and pushed in ffbf8f0 (never
  independently audited). Uncommitted: board, this checkpoint, WF task briefs/reports.
- Owner decisions 2026-10-02: adaptive model/effort routing chosen by the coordinator;
  autonomous commit/push directly on main until the first release, branches after.
- Coordinator decisions (board `coordinator_decisions`): hybrid routing (profile =
  role + effort, model per dispatch with reason; expert/auditor opus/xhigh, verifier
  sonnet/medium, coordinator inherit; no fable/best/opusplan); timesheet-committer as
  sole committer with freeze/accept commits and push after each; English-only task
  records; WP1-F01-PLAN cancelled; S-fix audits may include the gate.
- Completed: WF-REVIEW (planner, report A–F); WF-CAPS (documentation lookup);
  WF-IMPL-TOOLING (validators, 48 recovery probes, precommit script, nine profiles;
  author-reported checks pass).
- BLOCKED: WF-IMPL-DOCS attempt 1 edited AGENTS.md/.vi.md rules 1 and 12, then the
  client's auto-mode permission classifier denied writing the standing commit/push
  authorization into docs/08 ("Instruction Poisoning"). Task stopped; no workaround.
  Waiting for the owner's direct chat confirmation (board `pending_owner_question`).
  No task is running; no commit has been made.
- Remaining: WF-IMPL-DOCS → WF-GATE → WF-AUDIT (fresh; cumulative 1a25275..current) →
  committer accept commit + push (restart first if new profiles are not recognized) →
  WP1-F01-FIX → freeze commit → audit (gate included) → accept commit.
- Unchanged: WP1 FIX REQUIRED, F-01 unresolved, WP2 not started; no real sending,
  deployment, billing, global-setting or permission-setting changes.
- Owner confirmed directly in chat (verbatim in board `owner_decisions`), with fallback
  consent for the coordinator to write the commit-authority lines if still blocked.
  WF-IMPL-DOCS attempt 2 is running (single writer).
- WF-IMPL-DOCS attempt 2 done (no denial; author checks exit 0). WF-FREEZE (committer)
  running: freeze commit of revision v2 on main plus push; then WF-GATE, WF-AUDIT.
- Next action: record the freeze SHA/push result; dispatch WF-GATE on that SHA.

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); recovery copy = board in ffbf8f0
  (`git show HEAD:handoff/delivery/ORCHESTRATION.json`) plus this checkpoint.
- If interrupted: mark the running task interrupted, inspect its report/evidence and
  owned paths, confirm no writer still runs, then redispatch the remainder with the next
  attempt number. Board pending efforts are pre-set for the revised profiles.
- No usage/reset values observed.
