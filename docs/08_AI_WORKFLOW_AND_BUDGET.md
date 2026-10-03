# AI orchestration and subscription usage

## Authority and roles

The owner's 2026-10-02 request replaces the fixed Claude-implements / ChatGPT-reviews split and the earlier prohibition on selecting subagent models/effort and concurrency. Roles belong to tasks, not vendors. Default: one Claude Code mission from the current WP1 finding through WP5 software readiness. ChatGPT/Codex may perform any role if the owner chooses; manual vendor handoff is optional.

The main agent coordinates only: delegate inspection, planning, diagnosis, implementation, fixes, verification and fresh independent audit. It owns dependencies, assignments, evidence, status and recovery. It may write workflow records/consolidated handoffs, not application source or its own acceptance verdict. Routine choices and advancing after passed gates are authorized. Business exceptions, real deployment/sending and secrets remain with the owner. Prepare the pilot packet before requesting real activation. No unauthorized commits/amendments/pushes.

## Configuration and complexity routing

`.claude/settings.json` selects `timesheet-coordinator`. Project definitions in `.claude/agents/` configure model aliases/effort; prose alone does not configure the client. These files do not change global settings, speed, authentication or billing.

| Profile | Model / effort | Assignment |
|---|---|---|
| timesheet-coordinator | sonnet / medium | Dispatch, dependencies, state and Vietnamese updates |
| timesheet-light | sonnet / low | Explicit documentation, translation and inventory |
| timesheet-planner | sonnet / high | Inspect, decompose, diagnose and assess risk |
| timesheet-worker | sonnet / medium | Routine implementation with clear contracts |
| timesheet-worker-high | sonnet / high | Time/OT, ownership, transactions, sign-off, concurrency, recovery |
| timesheet-expert | opus / high | Bounded hard issue after two failed reproducible attempts, or demonstrated exceptional complexity |
| timesheet-verifier | sonnet / high | Required gates, source identity and interruption reconciliation |
| timesheet-auditor | opus / high | Fresh independent standards/spec audit and recheck |

Choose the smallest sufficient supported profile by task complexity/risk, not package number. An auditor may use the same model family as an implementer; it must be a different instance/context that did not author the reviewed change. No automatic max effort or accelerated speed.

Delegate read-only client/version/profile checks at startup. Record requested settings separately from actual observable settings; use null when not observable. Verify the installed client recognizes `agent`, `model`, `effort`, `Agent` and profiles. Restart if the new agents directory has not loaded. Account/managed controls can override project settings. If Opus is unavailable under the subscription, use a fresh Sonnet/high auditor. If effort is unsupported, use a supported level and record the fallback. The coordinator may amend only project profile configuration for supported fallbacks before dispatch, recording the reason. Never switch to API billing. If delegation is unavailable, save a configuration blocker instead of implementing in the main context.

## Dispatch and ownership

Follow [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.md). Each brief includes task ID, package/prompt, canonical reading list, dependencies, baseline/digest, exact writable paths, output/evidence paths, rule/AC coverage and next step. Workers execute only that task, not the coordinator mission. Only the coordinator writes ORCHESTRATION.json, STATE.json and NEXT_ACTION.

At most two subagents are active; only one writes source/configuration. Parallelize independent read-only analysis or disjoint report/evidence work. Serialize installs, migrations, builds and gates using shared outputs/databases. Stop source writers before gate/audit. No nested delegation; workers return escalation to the coordinator. Default: this checkout with explicit ownership. A worktree must preserve the exact reviewed snapshot including required uncommitted files; do not use a default-branch checkout that loses them. Never reset/clean unrelated work.

## Durable state and recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) is the durable task board. [STATE.json](../handoff/delivery/STATE.json) remains the package acceptance summary. Native task lists/chat are convenience views, not the sole record.

Store task ID/dependencies, kind/status, profile, requested/actual settings, agent/session IDs when observable, attempt, owned paths, prompt/report/evidence, baseline/digests, decision and next action. Statuses: pending, running, interrupted, blocked, done, cancelled. Implementation done is not independent acceptance. An audit PASS requires independent current-source proof.

Before dispatch, save the bilingual brief and running status. Before replacing a valid board, save its contents as ORCHESTRATION.previous.json. Have a subagent validate the replacement. One coordinator writes shared state. Workers append durable bilingual results after each coherent edit/check and before returning, using [TASK](../handoff/templates/TASK.md). Reconcile actual outputs/evidence before updating state. Gate decisions are PASS / FAIL / NOT VERIFIED; successful package summaries use independent_review: passed. After acceptance, update STATE, NEXT_ACTION and bilingual HANDOFF together. New reviews use new paths; preserve historical evidence.

Checkpoint before long work, after results, before compaction, at visible usage warnings and before stopping. Record unfinished edits, uncertain command completion, live processes, owned paths, remaining gates and next action. Do not rely on getting a final turn after a hard limit.

On resume, delegate reconciliation of board/backup, checkpoint and actual checkout first. Previously running tasks become interrupted until process/session status is confirmed; do not launch another writer while one may still run. Continue a subagent by recorded ID in the resumed session if available. Otherwise retain task ID, increment attempt and delegate the saved remainder to a replacement. Do not repeat accepted packages or assume uncertain commands passed.

If state is damaged, recover the last valid previous board and reconcile task reports, source and logs before dispatch. Observed files/evidence outrank stale narrative; report discrepancies. Changed source identity invalidates an old audit pass.

## Gates and independent audit

Freeze source, delegate the required gate, save HANDOFF, then delegate fresh independent audit with WPn_REVIEW. Do not fork the implementer's reasoning into the auditor. Auditor inspects standards/spec, traces production behavior, independently runs mandatory checks/probes and records digest before/after. It cannot fix audited source. PASS / FIX REQUIRED / NOT VERIFIED require actual evidence, not the implementer's summary.

FIX REQUIRED creates bounded fixes followed by gate/audit on the new digest. NOT VERIFIED blocks advancement until missing execution/source/evidence is resolved. WP1 needs F-01 fixed/rechecked; only PASS allows WP2. Repeat through WP4. WP5 starts with independent acceptance, then fixes/rechecks and concrete pilot preparation. Software readiness, owner permission and real pilot outcome are separate.

## Subscription and limits

Existing context: Claude Max 20x (owner screenshot, 2026-09-30), ChatGPT Business standard seat and 2,500 reported reserve credits. Included subscription sign-in first; planned reserve spending remains zero. No extra usage/overage, API keys, purchased credits or account/workspace billing changes.

Subagents consume the same allowance; more agents do not multiply quota. Record remaining/reset values only when observable, with timestamp/timezone. Do not invent token budgets, reset times, quotas or completion dates. Reduce concurrency/checkpoint when usage is low; never evade a limit through another billing route.

After reset, Resume/Continue the same Claude session or open a new session with the same entry prompt. Durable recovery does not schedule an automatic wake-up or guarantee that a stopped client restarts itself. A manual Resume/Continue may be needed; the owner need not resend the business brief. The old 16–23-session estimate described the two-client workflow; estimate remaining work from accepted tasks instead.

Capabilities checked 2026-10-02: [subagents](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [checkpoint limits](https://code.claude.com/docs/en/checkpointing). Native rewind does not replace task records or cover every shell/subagent edit. Local Claude integration and subscription availability still require a real client check.
