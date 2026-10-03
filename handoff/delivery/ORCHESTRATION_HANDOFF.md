# Orchestration workflow handoff

Based on [HANDOFF](../templates/HANDOFF.md). Date: 2026-10-02 America/Los_Angeles.

- Scope: owner's workflow redesign only. Vendor-neutral roles, coordinator main agent,
  project subagent profiles, single entry prompt, durable task state and recovery.
- Baseline: HEAD 1a25275b7c87bcef1e9099d7adba8f2eb763d698 before edits; left uncommitted.
  Application source, dependencies, business rules, prior handoffs/reviews/evidence preserved.
- Settings: current editing client's model/effort unobservable. Claude project settings
  are requested configuration, not proof of actual runtime/model/billing activation.
- Records: [board](ORCHESTRATION.json), valid initial ORCHESTRATION.previous.json,
  [first task brief](tasks/WP1-F01-PLAN.md), [entry](../NEXT_ACTION.md),
  [workflow](../../docs/08_AI_WORKFLOW_AND_BUDGET.md), ORCHESTRATE/RESUME,
  TASK/CHECKPOINT/HANDOFF/REVIEW templates and validate_orchestration.py.
- Application status: WP1 FIX REQUIRED, F-01 unresolved; WP2 not started. No task dispatched.
  Planner confirms bounded fix; worker fixes, verifier gates, independent auditor rechecks.
  WP1 PASS is required before WP2; mission may then proceed through WP5 software readiness.
- Verification: documentation, configuration, recovery probes and lint passed; see table.
  No application acceptance is claimed. No application tests/build/smoke rerun for this
  workflow-only change; the 91 reference checks below are documentation preflight, not
  execution of the production calculation engine.
- Changed groups: AGENTS/CLAUDE/README and docs 06/08/09/10 in both languages; NEXT_ACTION,
  all package implementation/review/fix/resume prompts and templates; STATE and durable
  boards; eight project profiles/settings; initial plan brief; workflow validator/evidence.
- Required checks:

| Executable command | Environment | Exit / observed result | Evidence |
|---|---|---|---|
| python handoff/delivery/validate_package.py --preflight | Bundled Python, existing IANA database | 0, PASS; 42 bilingual pairs, 494 local links, 91 reference scenarios | [documentation.txt](evidence/orchestration/documentation.txt) |
| python handoff/delivery/validate_orchestration.py | Bundled Python | 0, PASS; 8 profiles, 4 pending tasks, no active agents | [workflow.txt](evidence/orchestration/workflow.txt) |
| python handoff/delivery/evidence/orchestration/check-recovery.py | Bundled Python, synthetic in-memory boards | 0, PASS; 22 checks; real board unchanged, no Claude dispatch | [recovery.txt](evidence/orchestration/recovery.txt) |
| npm run lint | Bundled Node 24.19.0, npm 11.19.1; trace/pending deprecation enabled | 0; no warnings/errors | [lint.txt](evidence/orchestration/lint.txt) |
| git diff --check | Current checkout | 0; no whitespace errors | [repository.txt](evidence/orchestration/repository.txt) |

Exact commands for Python/log capture are in [run-validation.ps1](evidence/orchestration/run-validation.ps1).
The lint log records the installed npm CLI path used after the system npm wrapper failed.
Repository evidence verifies no diff to src/, tests/, dependencies or application scripts.
Recovery probes reject self-audit, stale PASS, failed gates, cycles, shared-state writes,
overlapping writers and WP2 advancement past unresolved WP1; these are metadata checks,
not proof that Claude permissions or runtime scheduling are enforced.

- Runtime limitation: Claude executable/client dispatch is unavailable in this environment.
  Local startup must check profile loading, supported aliases/effort, sign-in and overrides.
  No quota values or reset time observed; no automatic reset scheduler configured.
- Production: no real sending/deployment, secrets, billing changes or git mutation.
- Remaining scope: run the configured mission; complete F-01/gates/audit, then later packages.
  Actual pilot activation and one real period remain owner-controlled.
- One next action: open Claude Code in this checkout, restart if profiles are not loaded,
  paste the single prompt in NEXT_ACTION and let the coordinator inspect/reconcile first.
