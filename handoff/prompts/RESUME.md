# Resume the saved mission

Follow AGENTS.md, ORCHESTRATE.md and document 08. Keep existing subscription sign-in.

1. Read ORCHESTRATION.json (the last committed board if damaged) and the latest workflow
   CHECKPOINT. Take uncommitted/unpushed work and live processes from the board and
   checkpoint; you have no shell, so never inspect git or processes yourself.
2. Delegate the inspection (git status, unpushed commits, live processes) when a task is
   running/interrupted or the checkpoint records uncommitted/unpushed work; otherwise
   read board + checkpoint and continue from the board's `next_task_id`.
   Confirm old writers stopped before replacements. Unknown command completion
   is unverified. Preserve unrelated work.
3. Continue the old subagent in the resumed session when its ID remains usable.
   Otherwise keep task ID, increment attempt, record new agent/settings and
   delegate only the saved remaining scope.
4. Under the direct change policy (document 08) a returned change goes to the committer,
   then to the owner for testing; no gate or audit is rerun. Continue at most two
   subagents and one source writer.
5. Persist board and a short checkpoint after each result (task records English-only,
   checkpoints bilingual). Commit and push only through `timesheet-committer` under the
   standing authorization in document 08 (main before the first release, then branches
   and PRs).
   Usage reset does not itself run this prompt; Resume/Continue may be required.

Main agent coordinates only. Workers execute bounded changes; a verifier or auditor runs
only on the owner's yes. Keep dry-run/capture; no billing change, real activation
or any commit/push outside that authorization (never amend, force-push, rewrite history or tag). No fixed vendor role or manual model reassignment.
