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
- WF-FREEZE done: commit fd77a8717da9a1b2ea9ce13520d59b9df60f4716 pushed to origin/main
  (60 paths; precommit 0 blocking, 12 user-profile-path warnings). WF-GATE running on it.
- WF-GATE PASS on fd77a87: source digest
  03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b (before = after);
  verify 174 tests, preflight 91 scenarios, precommit probes block six bad inputs.
  WF-AUDIT (fresh auditor, opus/xhigh profile) running on the same commit/digest.
- WF-AUDIT (opus) FIX REQUIRED on fd77a87: 3 Medium (audit-strength contradiction,
  governance tasks going stale under WP1, precommit gaps) and 7 Low; report
  [WORKFLOW_REVIEW](WORKFLOW_REVIEW.md). WF-FIX1 (worker-high) running with binding
  decisions, including a GOV package for governance work.
- WF-FIX1 done (author-reported checks pass; exact `noreply@anthropic.com` allowlist
  added by coordinator decision). WF-* tasks relabelled to package GOV; WP1-F01 chain
  re-planned (FIX → FREEZE → GATE → AUDIT → ACCEPT, English task records).
  WF-FREEZE2 (committer) running.
- WF-FREEZE2 done: commit c219d79a2c202861b719473cdffb0efb59f14290 pushed (79 files,
  Node 24, precommit 0 findings). WF-GATE2 running on it.
- WF-GATE2 PASS on c219d79: digest
  d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2 (before = after);
  67 probes, verify 174 tests, auditor probes now blocked. WF-AUDIT2 (fresh) running.
- WF-AUDIT2 (fresh opus) FIX REQUIRED, Low only: all Medium fixed; open WF-A-10 residual
  wording, WF-R-01 (GOV gate/audit commit binding), WF-R-02 (spaced secrets); report
  [WORKFLOW_RECHECK](WORKFLOW_RECHECK.md). Coordinator fixed its own board lag (WF-GATE2
  done), NEXT_ACTION wording and marked the gate decision superseded.
- WF-FIX2 running: worker-high escalated to opus (caps; next FIX REQUIRED on GOV becomes
  an owner blocker). Then WF-FREEZE3 (mask WF-GATE2 system-python log), WF-GATE3, fresh
  WF-AUDIT3.
- WF-FIX2 done (opus; author-reported: validator 0, 81 probes, spaced secrets blocked,
  prompt wording fixed). WF-FREEZE3 running (masks WF-GATE2 system-python log paths).
- Next action: record the WF-FREEZE3 SHA; WF-GATE3; fresh WF-AUDIT3 (opus).

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); recovery copy = board in ffbf8f0
  (`git show HEAD:handoff/delivery/ORCHESTRATION.json`) plus this checkpoint.
- If interrupted: mark the running task interrupted, inspect its report/evidence and
  owned paths, confirm no writer still runs, then redispatch the remainder with the next
  attempt number. Board pending efforts are pre-set for the revised profiles.
- No usage/reset values observed.
