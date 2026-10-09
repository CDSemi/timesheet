# AI orchestration and subscription usage

## Authority and roles

The owner's 2026-10-02 request replaces the fixed Claude-implements / ChatGPT-reviews split and the earlier prohibition on selecting subagent models/effort and concurrency. Roles belong to tasks, not vendors. Default: one Claude Code mission from the current WP1 finding through WP5 software readiness. ChatGPT/Codex may perform any role if the owner chooses; manual vendor handoff is optional.

The main agent coordinates only: delegate inspection, planning, diagnosis, implementation, fixes, verification and fresh independent audit. It owns dependencies, assignments, evidence, status and recovery. It may write workflow records/consolidated handoffs, not application source or its own acceptance verdict. Routine choices and advancing after passed gates are authorized. Business exceptions, real deployment/sending and secrets remain with the owner. Prepare the pilot packet before requesting real activation. Commits and pushes happen only under the standing authorization in "Commits and pushes".

## Configuration and complexity routing

`.claude/settings.json` selects `timesheet-coordinator`. Project definitions in `.claude/agents/` configure model aliases/effort; prose alone does not configure the client. These files do not change global settings, speed, authentication or billing.

Profiles fix role and effort; the coordinator picks the model per dispatch from the task rubric, not the package number. Size: S/M/L/XL. Risk H: OT/credit input, ledger/balance, ownership/authorization, transactions/concurrency, privacy (PDF/signature/export/personal data), immutable history, recovery/restore, outbound send. Novelty: no in-repo pattern to follow.

| Task | Profile (effort) | Model |
|---|---|---|
| Inventory, link/translation sync, metadata | light (low) | sonnet; haiku only for pure listing/probes |
| Plan/diagnose a bounded issue; reconcile an interruption | planner (high) | sonnet |
| Package decomposition WP2–WP4 | planner (high) | opus |
| Accepted finding naming file/fix/tests | none | skip plan; worker reproduces first |
| Routine slice or docs with a clear contract | worker (medium) | sonnet |
| High-risk fix/slice with an existing pattern | worker-high (high) | sonnet |
| Novel high-risk L slice (ledger, atomic finalization/outbox, restore under writes, uncertain send) | worker-high (high) | opus |
| Escalation: unclear root cause after one evidence-backed attempt, recurring FIX REQUIRED | expert (xhigh) | opus |
| Gates, digests, evidence | verifier (medium) | sonnet |
| Independent audit (fix recheck, package, workflow); WP5 as 2–3 area audits plus one integration pass | auditor (xhigh) | opus, never below the strongest author model |
| Commit/push | committer (medium) | sonnet |
| Coordinator | coordinator (medium) | inherit (owner's session model) |

Caps: one retry at the starting tier, one at the escalated tier, then an owner blocker. De-escalate polish after an accepted Opus slice; at visible low-usage warnings drop planner/worker overrides to sonnet, never the auditor below the strongest author model. Not allowed without an owner decision: fable, best, opusplan (possible usage-credit billing), max/ultracode effort, speed changes. An auditor must be a different instance/context that did not author the reviewed change.

Audit strength (one rule, no bypass): an auditor's model is never weaker than the strongest author model of the reviewed snapshot, and `validate_orchestration.py` enforces it. Authors are the `agent_id` and `previous_agent_ids` of every task in the same package whose kind is not gate, audit or commit, plus the audit's `author_agent_ids`; the same set drives auditor separation. If the required model is unavailable, checkpoint and wait or raise an owner blocker. A Sonnet auditor (`timesheet-auditor` with model override sonnet, reason `fallback_unavailable`; effort stays the profile's xhigh) is valid only when no author used Opus.

Record per task: profile, requested model, `model_override_reason` (size_risk|novelty|escalation|fallback_unavailable|owner), `routing` {size, risk, novelty}, and self-reported `actual_model` plus `actual_source`. Effort changes only through profiles; profile edits may need a client restart (verify by dispatch; an unrecognized profile is a restart blocker). A client restart also refreshes the AGENTS/CLAUDE context injected into agents; a long-running session can hold a stale copy, so every non-coordinator profile reads AGENTS.md from disk at task start.

Delegate read-only client/version/profile checks at startup. Record requested settings separately from actual observable settings; use null when not observable. Verify the installed client recognizes `agent`, `model`, `effort`, `Agent` and profiles. Restart if the new agents directory has not loaded. Account/managed controls can override project settings. If Opus is unavailable under the subscription, apply the audit-strength rule above (wait or blocker; no weaker auditor when an author used Opus). If effort is unsupported, use a supported level and record the fallback. The coordinator may amend only project profile configuration for supported fallbacks before dispatch, recording the reason. Never switch to API billing. If delegation is unavailable, save a configuration blocker instead of implementing in the main context.

## Dispatch and ownership

Follow [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.md). Each brief includes task ID, package/prompt, canonical reading list, dependencies, baseline/digest, exact writable paths, output/evidence paths, rule/AC coverage and next step. Workers execute only that task, not the coordinator mission. Only the coordinator writes ORCHESTRATION.json, STATE.json and NEXT_ACTION.

At most two subagents are active; only one writes source/configuration. Parallelize independent read-only analysis or disjoint report/evidence work. Serialize installs, migrations, builds and gates using shared outputs/databases. Stop source writers before gate/audit. No nested delegation; workers return escalation to the coordinator. Default: this checkout with explicit ownership. A worktree must preserve the exact reviewed snapshot including required uncommitted files; do not use a default-branch checkout that loses them. Never reset/clean unrelated work.

## Durable state and recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) is the durable task board. [STATE.json](../handoff/delivery/STATE.json) remains the package acceptance summary. Native task lists/chat are convenience views, not the sole record.

Store task ID/dependencies, kind/status, profile, requested/actual settings, agent/session IDs when observable, attempt, owned paths, prompt/report/evidence, baseline/digests, decision and next action. Statuses: pending, running, interrupted, blocked, done, cancelled. Implementation done is not independent acceptance. An audit PASS requires independent current-source proof.

Before dispatch, save the brief and running status. Task briefs/results under `handoff/delivery/tasks/` are English-only; Vietnamese stays for human-facing docs, prompts, templates, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW and chat. ORCHESTRATION.previous.json is retired: the last committed board is the recovery copy; edit the board with small diffs and run `python handoff/delivery/validate_orchestration.py` inside commit tasks and after rule/profile changes. One coordinator writes shared state. Workers append durable results after each coherent edit/check and before returning, using [TASK](../handoff/templates/TASK.md). Reconcile actual outputs/evidence before updating state. Gate decisions are PASS / FAIL / NOT VERIFIED; successful package summaries use independent_review: passed. After acceptance, update STATE, NEXT_ACTION and bilingual HANDOFF together. New reviews use new paths; preserve historical evidence.

Checkpoint before long work, after results, before compaction, at visible usage warnings and before stopping. Record unfinished edits, uncertain command completion, live processes, owned paths, remaining gates and next action. Do not rely on getting a final turn after a hard limit.

On resume, delegate reconciliation only when a task is running/interrupted or the checkpoint records uncommitted/unpushed work; otherwise read the board and checkpoint. Previously running tasks become interrupted until process/session status is confirmed; do not launch another writer while one may still run. Continue a subagent by recorded ID in the resumed session if available. Otherwise retain task ID, increment attempt and delegate the saved remainder to a replacement. Do not repeat accepted packages or assume uncertain commands passed.

If state is damaged, recover the last committed board and reconcile task reports, source and logs before dispatch. Observed files/evidence outrank stale narrative; report discrepancies. Changed source identity invalidates an old audit pass.

## Gates and independent audit

Freeze source, delegate the required gate, save HANDOFF, then delegate fresh independent audit with WPn_REVIEW. Do not fork the implementer's reasoning into the auditor. Auditor inspects standards/spec, traces production behavior, independently runs mandatory checks/probes and records digest before/after. It cannot fix audited source. PASS / FIX REQUIRED / NOT VERIFIED require actual evidence, not the implementer's summary.

Audits run on the freeze commit with a clean tree outside `handoff/` (or a scratch clone at that SHA). A package-final snapshot is the snapshot whose audit PASS would accept the package, including a FIX REQUIRED recheck that unlocks the next package; it keeps a separate verifier gate. `gate_included` is only for intermediate S-size fixes. When an audit records `reviewed_commit` and its gate dependency records `freeze_commit`, the two must be equal (any package).

Governance scope: workflow tasks use package `GOV`, which is not part of `authorized_scope` (stays WP1–WP5). Running GOV tasks are exempt from the "running task outside active package" check; stale-PASS checks stay limited to the active package; a done GOV audit also needs `reviewed_commit` (40-hex) and a gate dependency whose `freeze_commit` equals it, so GOV audits never use `gate_included`; dependencies may cross packages. Governance paths: AGENTS.md, CLAUDE.md and their `.vi.md` pairs, this document and its pair, `handoff/prompts/`, `handoff/templates/`, `.claude/`, `.agents/`, `docs/agents/`, `handoff/delivery/validate_*.py`, `handoff/delivery/check_recovery.py`, `scripts/precommit-check.mjs`. Any change to them requires a GOV freeze commit, gate and fresh audit. A GOV PASS is identified by its reviewed commit (the source digest excludes `handoff/`) and is superseded only by a later governance change. NEXT_ACTION, STATE, the board, checkpoints and document 10 are state or records, not governance paths.

FIX REQUIRED creates bounded fixes followed by gate/audit on the new digest. A fix task may record the optional `addresses_audit` (the ID of the audit it answers, for traceability): it is allowed only on fix tasks, must name an existing audit that is done with FIX REQUIRED or NOT VERIFIED, and that audit must not also be a dependency, because a dependency means the audit passed. When a later accepted change replaces an audited snapshot, the old PASS stays as history: a done PASS audit may record the optional `superseded_by`, the ID of another audit of the same package that has no `superseded_by` itself and reviews a different digest. The superseded PASS still satisfies the dependency checks of tasks that used it, is exempt from the stale-PASS check and no longer counts as current acceptance; at `software_ready` every `superseded_by` target must be a done PASS audit. NOT VERIFIED blocks advancement until missing execution/source/evidence is resolved. WP1 needs F-01 fixed/rechecked; only PASS allows WP2. Repeat through WP4. WP5 starts with independent acceptance, then fixes/rechecks and concrete pilot preparation. Software readiness, owner permission and real pilot outcome are separate.

## Commits and pushes

Owner standing authorization, 2026-10-02 (confirmed directly by the owner in the main session): only `timesheet-committer` commits and pushes, one commit task at a time.

- Before the first release, commit directly to `main` and push after every commit. After the owner records the first release (board `git.release_declared` true), work on `fix/<task>-<slug>` or `feat/<task>-<slug>` branches with pull requests; the owner merges unless delegated. Agents create no tags or releases.
- Commit points: a freeze commit after each implementation/fix task (before gate/audit; the audited identity is reviewed_commit + source_digest); an accept commit after audit PASS (evidence, reviews, state); governance revisions; a checkpoint commit before a planned stop when state is uncommitted. No commit per board edit.
- Discipline: commit tasks run alone with the exact expected path set and explicit-path staging; IDE auto-staged extras are unstaged with `git restore --staged`. Run Node commands with the Node 24 runtime (the project requires `^24.11.0`; on the owner's Windows machine `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin`, prepended to PATH; the system Node 25/26 is refused) and record `node --version` in the commit evidence. Before committing run `node scripts/precommit-check.mjs`, `git diff --cached --check`, JSON parsing of changed JSON, the orchestration validator when the board is staged, and read the diff for personal data. Never commit secrets, signature images or personal timesheet data.
- Evidence masking: the privacy check blocks concrete user-profile paths, unquoted YAML/INI secrets, secret-named values in the spaced app-password layout (four groups of four letters or digits, quoted or unquoted), and PDF/image/signature files whose basename lacks `synthetic` (`reference/fixtures/` and `reference/examples/` stay allowed); every non-synthetic email address is blocked except the exact commit-attribution address `noreply@anthropic.com`. For a `profile-path` finding in staged evidence logs, the committer may replace only the account segment with `<user>`, re-stage, record each masked file and rerun all checks; it changes no other content and stops on any other finding.
- Never: amend, force-push, `--no-verify`, reset, rebase, clean, stash, tag, rewrite history, `add -A`, `commit -a`.
- Push failures: two retries, then record `push_blocker` (the commit stays local). A non-fast-forward or protection rejection stops with an owner blocker. Never ask for credentials in chat.
- The mission does not change permission settings; the owner may pre-approve git commands or add deny rules. Messages use the commit-message skill with Task/Gate/Audit/Digest body lines. Outside this authorization nobody commits unless the user explicitly requests it; every response after file changes still carries a `Commit description`.

## Subscription and limits

Existing context: Claude Max 20x (owner screenshot, 2026-09-30), ChatGPT Business standard seat and 2,500 reported reserve credits. Included subscription sign-in first; planned reserve spending remains zero. No extra usage/overage, API keys, purchased credits or account/workspace billing changes.

Subagents consume the same allowance; more agents do not multiply quota. Record remaining/reset values only when observable, with timestamp/timezone. Do not invent token budgets, reset times, quotas or completion dates. Reduce concurrency/checkpoint when usage is low; never evade a limit through another billing route.

After reset, Resume/Continue the same Claude session or open a new session with the same entry prompt. Durable recovery does not schedule an automatic wake-up or guarantee that a stopped client restarts itself. A manual Resume/Continue may be needed; the owner need not resend the business brief. The old 16–23-session estimate described the two-client workflow; estimate remaining work from accepted tasks instead.

Capabilities checked 2026-10-02: [subagents](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [checkpoint limits](https://code.claude.com/docs/en/checkpointing). Native rewind does not replace task records or cover every shell/subagent edit. Local Claude integration and subscription availability still require a real client check.
