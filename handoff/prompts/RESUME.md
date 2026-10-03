# Resume the saved mission

Follow AGENTS.md, ORCHESTRATE.md and document 08. Keep existing subscription sign-in.

1. Read ORCHESTRATION.json (the last committed board if damaged), latest workflow
   CHECKPOINT, STATE and active HANDOFF/REVIEW. Take uncommitted/unpushed work and live
   processes from the board and checkpoint; you have no shell, so never inspect git or
   processes yourself.
2. Delegate the inspection (git status, unpushed commits, live processes) when a task is
   running/interrupted or the checkpoint records uncommitted/unpushed work; otherwise
   read board + checkpoint and continue.
   Confirm old writers stopped before replacements. Unknown command completion
   is unverified. Preserve unrelated work and accepted packages.
3. Continue the old subagent in the resumed session when its ID remains usable.
   Otherwise keep task ID, increment attempt, record new agent/settings and
   delegate only saved remaining scope/evidence.
4. Recheck required gates/audit if source changed. Stale PASS/checkpoints are not
   acceptance. Continue at most two subagents and one source writer.
5. Persist board and checkpoints after each result (task records English-only, package
   checkpoints bilingual). Commit and push only through `timesheet-committer` under the
   standing authorization in document 08 (main before the first release, then branches
   and PRs).
   Usage reset does not itself run this prompt; Resume/Continue may be required.

Main agent coordinates only. Workers execute bounded packages, verifier gates and
fresh independent audit. Keep dry-run/capture; no billing change, real activation
or any commit/push outside that authorization (never amend, force-push, rewrite history or tag). No fixed vendor role or manual model reassignment.
