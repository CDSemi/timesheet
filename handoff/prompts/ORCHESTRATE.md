# Single-prompt resumable mission

Act as main coordinator under AGENTS.md and document 08. Delegate substantive work;
do not implement, diagnose or audit personally. Run WP1–WP5 through verified software
readiness and a concrete pilot packet. Stop before real deployment/sending.
No billing changes. Commits and pushes only through `timesheet-committer` under the owner's standing authorization (document 08, "Commits and pushes"): directly on main until the first release, then side branches and PRs; never amend, force-push, rewrite history or tag.

1. Read NEXT_ACTION, STATE.json, ORCHESTRATION.json (the last committed board if
   damaged), latest workflow checkpoint and relevant HANDOFF/REVIEW. Delegate
   checkout, uncommitted-work, client/profile and evidence inspection only when a task
   is running/interrupted or the checkpoint records uncommitted/unpushed work. Confirm
   no previous writer is still active before redispatch.
2. Reconcile state. WP1 is FIX REQUIRED, F-01 unresolved; WP2 not started. F-01 is fully
   specified (file, function, repro, fix, tests), so skip a separate plan: a worker
   reproduces first, using FIX_FINDINGS and WP1_REVIEW; do not restart WP1 implementation.
   Historical review evidence applies to its original baseline, not a new digest.
3. Delegate a bounded plan only when the work is not fully specified. Register task
   IDs/dependencies and exact owned paths. Select profile, model and effort by the
   document 08 rubric (size, risk, novelty) and record routing. Briefs and results under
   `handoff/delivery/tasks/` are English-only. Save the brief and board running status
   BEFORE invocation. At most two subagents, one source writer; no writer during
   gates/audit. Persist results after every coherent step.
4. Delegate implementation/fixes, then a freeze commit (before gate/audit; audited
   identity is reviewed_commit + source_digest), verifier gates, then fresh independent
   WPn_REVIEW on a clean tree. Only an intermediate S-size fix audit may include the
   gate (`gate_included`); package-final snapshots, including a FIX REQUIRED recheck
   that unlocks the next package, and GOV audits keep a separate verifier gate
   (document 08). Record digest before/after. Auditors cannot have authored the
   audited change. New review paths preserve historical evidence.
5. After every result, reconcile files/evidence, persist board/checkpoint and give
   concise Vietnamese progress. FIX REQUIRED creates bounded fix + gate + audit
   again; NOT VERIFIED resolves missing proof before advancement. Never force PASS.
6. Gate and audit PASS on current digest allow an accept commit and push (evidence,
   reviews, state) and the STATE/NEXT_ACTION and bilingual HANDOFF update. Create next package's plan/tasks and proceed automatically.
   Workers' WPn_IMPLEMENT prompts stay bounded to their package. WP5 starts with
   independent acceptance of WP1–WP4, then fixes/rechecks and pilot preparation.
7. Checkpoint before long tasks, compaction, visible usage warnings and stops; make a
   checkpoint commit before a planned stop when state is uncommitted.
   Resume observed files/evidence, not memory alone. Continue the recorded agent
   if available; otherwise keep task ID, increment attempt, delegate saved remainder.
   Unknown command completion is unverified; interruption is never completion.
8. Finish with software readiness, unresolved gates/setup, concrete pilot packet
   and one owner action. Real activation/receipt/one real period remain separately pending.

Use TASK, CHECKPOINT, HANDOFF and REVIEW templates in handoff/templates/.
Only the coordinator writes shared state; workers write assigned outputs/evidence.
Delegate `python handoff/delivery/validate_orchestration.py` and documentation preflight
after state/contract changes and inside commit tasks. Validators do not certify
application acceptance. ORCHESTRATION.previous.json is retired; edit the board with
small diffs.
