# Single-prompt resumable mission

Act as main coordinator under AGENTS.md and document 08. Delegate substantive work;
do not implement, diagnose or audit personally. Run WP1–WP5 through verified software
readiness and a concrete pilot packet. Stop before real deployment/sending.
No commit/amend/push or billing changes.

1. Read NEXT_ACTION, STATE.json, ORCHESTRATION.json (last valid previous copy if
   damaged), latest workflow checkpoint and relevant HANDOFF/REVIEW. Delegate actual
   checkout, uncommitted work, client/profile and evidence inspection. Confirm no
   previous writer is still active before redispatch.
2. Reconcile state. WP1 is FIX REQUIRED, F-01 unresolved; WP2 not started. Plan the
   bounded F-01 fix using FIX_FINDINGS and WP1_REVIEW; do not restart WP1 implementation.
   Historical review evidence applies to its original baseline, not a new digest.
3. Delegate the bounded plan. Register task IDs/dependencies and exact owned paths.
   Select profiles by complexity/risk. Save bilingual dispatch briefs and board
   running status BEFORE invocation. At most two subagents, one source writer;
   no writer during gates/audit. Persist results after every coherent step.
4. Delegate implementation/fixes, verifier gates, then fresh independent WPn_REVIEW.
   Freeze a complete snapshot and record digest before/after. Auditors cannot have
   authored the audited change. New review paths preserve historical evidence.
5. After every result, reconcile files/evidence, persist board/checkpoint and give
   concise Vietnamese progress. FIX REQUIRED creates bounded fix + gate + audit
   again; NOT VERIFIED resolves missing proof before advancement. Never force PASS.
6. Gate and audit PASS on current digest allow STATE/NEXT_ACTION and bilingual
   HANDOFF update. Create next package's plan/tasks and proceed automatically.
   Workers' WPn_IMPLEMENT prompts stay bounded to their package. WP5 starts with
   independent acceptance of WP1–WP4, then fixes/rechecks and pilot preparation.
7. Checkpoint before long tasks, compaction, visible usage warnings and stops.
   Resume observed files/evidence, not memory alone. Continue the recorded agent
   if available; otherwise keep task ID, increment attempt, delegate saved remainder.
   Unknown command completion is unverified; interruption is never completion.
8. Finish with software readiness, unresolved gates/setup, concrete pilot packet
   and one owner action. Real activation/receipt/one real period remain separately pending.

Use TASK, CHECKPOINT, HANDOFF and REVIEW templates in handoff/templates/.
Only the coordinator writes shared state; workers write assigned outputs/evidence.
Delegate `python handoff/delivery/validate_orchestration.py` and documentation preflight
after state/contract changes. Validators do not certify application acceptance.
