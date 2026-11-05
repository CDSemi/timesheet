# AI orchestration and subscription usage

## Authority and roles

The owner's 2026-10-02 request replaces the fixed Claude-implements / ChatGPT-reviews split and the earlier prohibition on selecting subagent models/effort and concurrency. Roles belong to tasks, not vendors. ChatGPT/Codex may perform any role if the owner chooses; manual vendor handoff is optional.

The main agent coordinates only: it delegates inspection, planning, diagnosis, implementation and fixes, and owns dependencies, assignments, status and recovery. It may write workflow records and the short checkpoint, not application source. Routine choices are authorized. Business exceptions, real deployment/sending and secrets remain with the owner. Commits and pushes happen only under the standing authorization in "Commits and pushes".

## Direct change policy

Owner decision, 2026-11-04 (verbatim on the board under `owner_decisions`; board field `change_policy` is `"direct"`): the rules and gates were too strict. The app must run soon. Work normally: the owner tests the running app when testing is needed and asks for a fix when one is needed.

1. **A change** is an owner request, or a fix the owner asks for. The coordinator sends it to one worker: `timesheet-worker`, or `timesheet-worker-high` for time, ledger, sign-off, ownership or concurrency. There is no planning phase unless the request is unclear or a failure needs diagnosis: the worker goes straight to the code of the requested function.
2. **Done means the change works as asked.** The worker proves the changed behaviour with tests aimed at that function (a unit, integration or e2e test of the feature, or a direct run) and keeps the quick suite green: `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. Results are real commands and exits in the task brief's Results section; never invented. **Risk-area tests:** when the change touches time, accounting dates, zones, sessions or breaks (`src/domain/`: dates, zones, instants, workday, breaks, periods, attendance; `src/server/services/`: dayEntries, timesheets, periods), the OT calculation or ledger (`src/domain/` overtime, deficit, ledger; services ledger, otEvidence, otLeave, revisionLedger), sign-off, revisions or corrections (services finalization, timesheetCommands, history, signatures), or submission and email sending (`src/server/jobs/`, `mail/`, `pdf/`; services deliveries, notifications, submissionSettings; `src/domain/` reminders, emailTemplate), the same worker also runs that area's specs in `tests/domain`, `tests/integration` and `tests/e2e`, plus `npm run verify` (smoke of the built server in capture mode), and records the commands and results. This stays inside the one worker task with no separate gate; a full e2e run, sweep, drill or audit still needs the owner's yes.
3. **No wording tests; documents match the current behaviour.** There are no test runs or scripted passes on the wording of documents, comments or messages: no EN/VI parity passes, link checks or stale-text searches. When a change alters a function or how it behaves, the same worker updates the documents that describe it (English and the matching `.vi.md`) in the same task, reads them against the code it changed (rules, fields, limits, flows, messages) and lists the documents checked and changed in its Results; a document that contradicts current behaviour is a defect fixed in that task. There is no separate review task; the coordinator reads the list before the commit. `validate_package.py --preflight` is not a required check for workers or the committer; it stays available as a tool.
4. **`timesheet-committer` commits and pushes**, keeping its privacy and secret scans, the precommit check, `validate_orchestration.py` and `check_recovery.py`.
5. **There is no** verifier gate, routine audit, freeze, regate, plan review or documentation review. No evidence folder is required: a short Results section in the task brief is enough. Source digests are no longer acceptance identities. When the coordinator judges an audit truly needed (for example a risky change to pay, OT, sign-off, sending or data loss) it asks the owner first and runs one only on the owner's yes; the same holds for a full e2e run, a sweep or a container drill.
6. **The owner tests the running app and asks for fixes.** A verifier or auditor runs only on the owner's yes; an auditor is a fresh instance that did not author the change.

Unchanged: ownership, privacy and the public repository (AGENTS rule 4); synthetic data and local mail capture, no credentials in chat (6); time semantics (7); owner business rules over inherited formulas (8); no deprecated APIs (11); committer-only commits (12); the frontend standards; one source writer at a time and at most two subagents; the coordinator role. Real sending, deployment and activation on the NAS are the owner's acts: agents never send real mail and never deploy, and the board keeps `stop_before`.

`validate_orchestration.py` follows the board's `change_policy`. With `"direct"` it skips only the acceptance checks: stale PASS, `non_product_since_acceptance`, the gate and audit structure of done audits (gate dependency, commit binding, digests, auditor separation and strength) and the digest match between gate and audit. It keeps the schema, statuses, profiles, concurrency and writers, ownership overlap, committer-only commits and the commit result, `stop_before`, prompt, report and listed evidence files, `next_task_id` and the WP1-WP5 phases in STATE. Without the field the old checks apply unchanged. `--non-product-range` and `--non-product-staged` remain as tools. Workflow tasks use package `GOV`, outside `authorized_scope`.

## Configuration and routing

`.claude/settings.json` selects `timesheet-coordinator`. Project definitions in `.claude/agents/` configure model aliases/effort; prose alone does not configure the client. These files do not change global settings, speed, authentication or billing.

Profiles fix role and effort; the coordinator picks the model per dispatch from the task rubric. Size: S/M/L/XL. Risk H: OT/credit input, ledger/balance, ownership/authorization, transactions/concurrency, privacy (PDF/signature/export/personal data), immutable history, recovery/restore, outbound send. Novelty: no in-repo pattern to follow.

| Task | Profile (effort) | Model |
|---|---|---|
| Owner request or requested fix | worker (medium) | sonnet |
| Same, touching time, ledger, sign-off, ownership or concurrency | worker-high (high) | sonnet; opus for a novel high-risk L slice |
| Unclear request or a failure that needs diagnosis | planner (high) | sonnet |
| Inventory, link/translation sync, metadata | light (low) | sonnet; haiku only for pure listing/probes |
| Unclear root cause after one evidence-backed attempt | expert (xhigh) | opus |
| Commit/push | committer (medium) | sonnet |
| Verification or independent audit, only on the owner's yes | verifier (medium) / auditor (xhigh) | sonnet / opus |
| Coordinator | coordinator (medium) | inherit (owner's session model) |

Caps: one retry at the starting tier, one at the escalated tier, then an owner blocker. At visible low-usage warnings drop planner/worker overrides to sonnet. Not allowed without an owner decision: fable, best, opusplan (possible usage-credit billing), max/ultracode effort, speed changes.

Record per task: profile, requested model, `model_override_reason` (size_risk|novelty|escalation|fallback_unavailable|owner), `routing` {size, risk, novelty}, and self-reported `actual_model` plus `actual_source`. Effort changes only through profiles; profile edits may need a client restart (verify by dispatch; an unrecognized profile is a restart blocker). A client restart also refreshes the AGENTS/CLAUDE context injected into agents; a long-running session can hold a stale copy, so every non-coordinator profile reads AGENTS.md from disk at task start.

Delegate read-only client/version/profile checks at startup. Record requested settings separately from actual observable settings; use null when not observable. Account/managed controls can override project settings. If Opus is unavailable under the subscription, use sonnet and record `fallback_unavailable`. If effort is unsupported, use a supported level and record the fallback. The coordinator may amend only project profile configuration for supported fallbacks before dispatch, recording the reason. Never switch to API billing. If delegation is unavailable, save a configuration blocker instead of implementing in the main context.

## Dispatch and ownership

Follow [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.md). Each brief includes task ID, the request, reading list, dependencies, exact writable paths, the Results section and next step. Workers execute only that task, not the coordinator mission. Only the coordinator writes ORCHESTRATION.json, STATE.json and NEXT_ACTION.

At most two subagents are active; only one writes source/configuration. Parallelize independent read-only analysis or disjoint report work. Serialize installs, migrations and builds using shared outputs/databases. No nested delegation; workers return escalation to the coordinator. Default: this checkout with explicit ownership. Never reset/clean unrelated work.

## Durable state and recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) is the durable task board. [STATE.json](../handoff/delivery/STATE.json) remains the package summary. Native task lists/chat are convenience views, not the sole record.

Store task ID/dependencies, kind/status, profile, requested/actual settings, agent/session IDs when observable, attempt, owned paths, prompt/report, decision and next action. Statuses: pending, running, interrupted, blocked, done, cancelled.

Before dispatch, save the brief and running status. Task briefs/results under `handoff/delivery/tasks/` are English-only; Vietnamese stays for human-facing docs, prompts, templates, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW and chat. ORCHESTRATION.previous.json is retired: the last committed board is the recovery copy; edit the board with small diffs and run `python handoff/delivery/validate_orchestration.py` inside commit tasks and after rule/profile changes. One coordinator writes shared state. Workers append their Results after each coherent edit/check and before returning, using [TASK](../handoff/templates/TASK.md). Reconcile actual outputs before updating state.

Checkpoint before long work, after results and before stopping, in a short [CHECKPOINT](../handoff/templates/CHECKPOINT.md): unfinished edits, uncertain command completion, live processes, owned paths and next action. Do not rely on getting a final turn after a hard limit.

On resume, read the board and checkpoint, then continue from the board's `next_task_id`. Delegate reconciliation only when a task is running/interrupted or the checkpoint records uncommitted/unpushed work. Previously running tasks become interrupted until process/session status is confirmed; do not launch another writer while one may still run. Otherwise retain task ID, increment attempt and delegate the saved remainder to a replacement. Do not assume uncertain commands passed.

If state is damaged, recover the last committed board and reconcile task reports, source and logs before dispatch. Observed files outrank stale narrative; report discrepancies.

## Commits and pushes

Owner standing authorization, 2026-10-02 (confirmed directly by the owner in the main session): only `timesheet-committer` commits and pushes, one commit task at a time.

- Before the first release, commit directly to `main` and push after every commit. After the owner records the first release (board `git.release_declared` true), work on `fix/<task>-<slug>` or `feat/<task>-<slug>` branches with pull requests; the owner merges unless delegated. Agents create no tags or releases.
- Commit points: after a worker returns a change that passed its quick checks; governance revisions; a checkpoint commit before a planned stop when state is uncommitted. No commit per board edit.
- Discipline: commit tasks run alone with the exact expected path set and explicit-path staging; IDE auto-staged extras are unstaged with `git restore --staged`. Run Node commands with the Node 24 runtime (the project requires `^24.11.0`; on the owner's Windows machine `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin`, prepended to PATH; the system Node 25/26 is refused) and record `node --version`. Before committing run `node scripts/precommit-check.mjs`, `git diff --cached --check`, JSON parsing of changed JSON, the orchestration validator when the board is staged, and read the diff for personal data. Never commit secrets, signature images or personal timesheet data.
- Evidence masking: the privacy check blocks concrete user-profile paths, unquoted YAML/INI secrets, secret-named values in the spaced app-password layout (four groups of four letters or digits, quoted or unquoted), and PDF/image/signature files whose basename lacks `synthetic` (`reference/fixtures/` and `reference/examples/` stay allowed); every non-synthetic email address is blocked except the exact commit-attribution address `noreply@anthropic.com`. For a `profile-path` finding in staged logs, the committer may replace only the account segment with `<user>`, re-stage, record each masked file and rerun all checks; it changes no other content and stops on any other finding.
- Never: amend, force-push, `--no-verify`, reset, rebase, clean, stash, tag, rewrite history, `add -A`, `commit -a`.
- Push failures: two retries, then record `push_blocker` (the commit stays local). A non-fast-forward or protection rejection stops with an owner blocker. Never ask for credentials in chat.
- The mission does not change permission settings; the owner may pre-approve git commands or add deny rules. Messages use the commit-message skill with a Task body line. Outside this authorization nobody commits unless the user explicitly requests it; every response after file changes still carries a `Commit description`.

## Subscription and limits

Existing context: Claude Max 20x (owner screenshot, 2026-09-30), ChatGPT Business standard seat and 2,500 reported reserve credits. Included subscription sign-in first; planned reserve spending remains zero. No extra usage/overage, API keys, purchased credits or account/workspace billing changes.

Subagents consume the same allowance; more agents do not multiply quota. Record remaining/reset values only when observable, with timestamp/timezone. Do not invent token budgets, reset times, quotas or completion dates. Reduce concurrency/checkpoint when usage is low; never evade a limit through another billing route.

After reset, Resume/Continue the same Claude session or open a new session with the same entry prompt. Durable recovery does not schedule an automatic wake-up or guarantee that a stopped client restarts itself. A manual Resume/Continue may be needed; the owner need not resend the business brief.

Capabilities checked 2026-10-02: [subagents](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [checkpoint limits](https://code.claude.com/docs/en/checkpointing). Native rewind does not replace task records or cover every shell/subagent edit. Local Claude integration and subscription availability still require a real client check.
