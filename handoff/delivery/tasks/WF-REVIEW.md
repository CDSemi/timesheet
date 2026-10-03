# WF-REVIEW dispatch brief

- Mission/task: timesheet-software-readiness / WF-REVIEW; board package WP1 (workflow
  revision, not application work); kind plan; attempt 1; dependencies none.
- Owner request, 2026-10-02 chat (Vietnamese, paraphrased): (1) check end-to-end
  practicality and efficiency of the automated AI workflow; (2) judge whether the
  model/effort table is too low for the actual complexity; (3) choose between a fixed
  table and coordinator selection per actual task, maximizing accuracy and efficiency
  without wasting tokens; (4) autonomous commit and push are now authorized during work,
  directly on the main branch while pre-release; after the first release, use side
  branches for fixes/upgrades.
- Profile: timesheet-planner, requested sonnet/high; actual model/effort not observable.
- Baseline: HEAD 1a25275b7c87bcef1e9099d7adba8f2eb763d698 plus the uncommitted
  orchestration redesign (validated by its author, never independently audited).
- Read as needed: AGENTS.md, CLAUDE.md, docs/08 (EN), handoff/prompts/ORCHESTRATE.md,
  RESUME.md, FIX_FINDINGS.md, handoff/NEXT_ACTION.md, handoff/templates/*.md (EN),
  .claude/settings.json, .claude/agents/*.md, handoff/delivery/validate_orchestration.py,
  handoff/delivery/evidence/orchestration/check-recovery.py, ORCHESTRATION.json,
  STATE.json, ORCHESTRATION_HANDOFF.md, WP1_REVIEW.md (F-01), WP1_HANDOFF.md,
  docs/06, docs/09 and WP2–WP5 IMPLEMENT/REVIEW prompts (only to size the work).
  Open .vi.md files only to list the paired edits they need.
- Coordinator-observed facts: the coordinator's Agent tool accepts a per-dispatch `model`
  override (enum sonnet, opus, haiku, fable) that takes precedence over profile
  frontmatter; it has no per-dispatch effort parameter, so effort comes only from a
  profile's frontmatter. The main session actually runs claude-opus-5-5 (owner choice)
  while its profile requests sonnet/medium. The validator requires pending/running task
  model/effort to equal profile frontmatter, exactly eight profiles, kinds
  plan/diagnose/implement/fix/gate/audit/documentation; every non-coordinator profile
  prompt forbids commit/push. A separate read-only documentation lookup is checking
  effort levels per model (xhigh/max), the meaning of `fable`, whether profile edits load
  without restart, and subscription usage weighting of Opus versus Sonnet. Keep the
  design robust to those unknowns and mark dependent choices as conditional.

## Required output (report only)

A. End-to-end practicality/efficiency findings: bottlenecks, failure modes and token
   waste (bilingual internal briefs/results, coordinator-without-shell overhead for
   validation/commits, escalation thresholds, re-audit cycles, digest handling,
   recovery overhead). Give severity and file:line evidence.
B. Workload sizing: classify the F-01 fix and WP2–WP5 task types by size and risk with
   short rationale from the roadmap/prompts.
C. Routing: say which roles are under- or over-powered. Recommend a policy (for example
   profiles as effort tiers plus coordinator per-dispatch model override driven by a
   size × risk rubric), escalation/de-escalation triggers, planner strength for package
   plans versus bounded fix plans, audit/acceptance strength, translation/inventory
   tier, coordinator model. Give one table: task type × size × risk → profile, model,
   effort, rationale. State how requested/actual overrides are recorded and what the
   validator must accept.
D. Commit/push design: pre-release direct commits to main; who commits (coordinator has
   no shell), when (task boundary, gate, audit), explicit-path staging, pre-commit
   privacy check (no secrets, signatures, private PDFs, personal data), no
   amend/force/history rewrite/--no-verify/tags/releases, push-failure handling,
   Dropbox/Windows lock handling, interaction with frozen snapshot and digest (consider
   commit SHA plus clean tree as audited identity), committing coordinator-written state,
   commit-message convention, post-first-release branch/PR policy. Decide whether the
   existing uncommitted redesign should be committed separately or with this revision,
   given that it was never independently audited.
E. Exact change list: every file (EN plus .vi.md pair, profiles, validator, recovery
   probes, templates, NEXT_ACTION entry prompt, STATE fields) with the specific change,
   minimal set first; flag anything needing a client restart.
F. Risks/unknowns and what the gate and the independent audit must verify.

- Writable: this report and WF-REVIEW.vi.md only; append results below the brief in
  both languages. All other paths read-only. No commits, no source/config edits.
- Allowed read-only commands: git status/log/diff, `claude --version` if available,
  read-only validators. Quote key outputs inline; save no evidence elsewhere.
- Return to coordinator: concise summary (at most 400 words) and report path.

## Results

### Reviewer note

Reviewer: timesheet-planner profile, requested sonnet/high; self-reported model
claude-sonnet-5-5 (from the session system prompt, not independently verifiable); effort not
observable. Read-only review; no repository file other than this report and its translation
was written. Observations are separated from recommendations. Items that depend on the
pending WF-CAPS lookup are tagged **[C-n]** and must be resolved before implementation:

- **C-1** which effort levels each model accepts (xhigh/max for Opus and Sonnet);
- **C-2** meaning/availability of the `fable` alias;
- **C-3** whether edits to `.claude/agents/*.md` and `.claude/settings.json` load without a client restart;
- **C-4** relative subscription usage weighting of Opus versus Sonnet;
- **C-5** permission-rule syntax for denying git subcommands, and whether a background subagent's Bash call can stall on a permission prompt;
- **C-6** whether the Agent tool result reports the model actually used.

Key observed facts:

- `git rev-parse HEAD` = `ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed` ("Configure resumable Claude subagent orchestration", 2026-10-02 17:36 -0700); `git status -sb` = `## main...origin/main`, and `origin/main` is the same SHA, so that commit is **already pushed**. `git show --stat ffbf8f0` shows it contains the profiles, settings, validator, prompts, templates and docs rewrite. `git status --short` now lists only `M handoff/delivery/ORCHESTRATION.json` and the untracked WF-REVIEW/checkpoint files. The "uncommitted orchestration redesign" in this task's brief therefore **no longer exists**; it was committed and pushed after the brief's baseline `1a25275`.
- `claude --version` -> `2.1.285 (Claude Code)` (ORCHESTRATION_HANDOFF.md says the executable was unavailable; stale).
- `python handoff/delivery/validate_orchestration.py` -> `{"status":"PASS","profiles":8,"tasks":5,"active_tasks":1,"application_acceptance_verified":false,"claude_runtime_verified":false}`.
- `.git/hooks` has no non-sample hook; `commit.gpgsign` unset; remote `origin https://github.com/CDSemi/timesheet.git`; no permission rules exist (`.claude/settings.json` is only `{"agent":"timesheet-coordinator"}`; `~/.claude/settings.json` holds only a theme).
- Size: 6,796 TS lines in `src/` + `tests/`; 647 tracked files; 174 passing tests (WP1_REVIEW.md:28); `timesheetCommands.ts` is 458 lines.

## A. Practicality and efficiency findings

Severity: H = blocks the new requirements or wastes a large share of tokens/time; M = recurring cost or correctness gap; L = minor.

| # | Sev | Finding (observation) | Evidence | Consequence / recommendation |
|---|---|---|---|---|
| A1 | H | **Stale baseline.** Board, brief, checkpoint and handoff describe HEAD `1a25275` plus an uncommitted redesign; the redesign is already pushed commit `ffbf8f0`. | ORCHESTRATION.json `baseline_commit` on all 5 tasks; WF-REVIEW.md:13; WORKFLOW_REVISION_CHECKPOINT.md ("HEAD 1a25275... plus the uncommitted redesign"); ORCHESTRATION_HANDOFF.md:4 ("left uncommitted"); `git log` | Wrong audit baselines would be recorded. Reset `baseline_commit` for pending tasks; the never-audited redesign must be covered by WF-AUDIT as the cumulative diff `1a25275..HEAD` (D5). |
| A2 | H | **Validator blocks the per-dispatch model override.** Pending/running tasks must have `requested_model/effort` equal to profile frontmatter, so a coordinator passing `model: opus` to a sonnet profile cannot record it truthfully. No field separates profile default, dispatch request and self-reported actual; `coordinator_runtime` is free text, unvalidated. | validate_orchestration.py:101-103; ORCHESTRATION.json `coordinator_runtime` | A fixed table cannot express the rubric policy in C. Change validator and board schema (E item 10, 13). |
| A3 | H | **No coordinator shell => every state change tends to cost a validator subagent plus whole-file copies.** Rules require a subagent to validate each replacement board and a saved `ORCHESTRATION.previous.json` before replacing; a copy means the coordinator Writes the entire file (7.4 KB now with 5 tasks; roughly five tasks per package projects to tens of KB). | docs/08:40; ORCHESTRATE.md:38-39; check-recovery.py:41 | Cost grows with board size and dispatch count. Make git the recovery copy (`git show HEAD:handoff/delivery/ORCHESTRATION.json`), edit the board with small Edit diffs, and run the validator **inside the commit task** (pre-commit) and after rule/profile changes, not after every update. |
| A4 | M-H | **Bilingual brief and result for every task, authored by the coordinator before dispatch.** Validator requires both languages for any task not pending/cancelled. WF-REVIEW EN+VI = 4,971 + 5,330 bytes for one brief. docs/09:63 only says "human-facing requirements/operations stay bilingual". | docs/08:40; ORCHESTRATE.md:15-16; validate_orchestration.py:115-116; AGENTS.md rule 1 | Roughly doubles coordinator output (Opus in practice). Proposal (owner confirmation needed because AGENTS rule 1 says keep matching translations): task briefs/results are agent-facing working records, English only; Vietnamese stays mandatory for CHECKPOINT, HANDOFF, REVIEW, owner-facing docs and chat. Fallback if rejected: keep pairs but have `timesheet-light` (sonnet/low) write the VI after the result instead of the coordinator before dispatch. |
| A5 | M-H | **Planner task duplicates an already-specified fix.** WP1_REVIEW F-01 gives file, function, lines 425-450, exact repro F-01A/F-01B, bounded fix (mirror `updateSession`: replace old break rows with the submitted set, keep audit/rollback) and the regression list. WP1-F01-PLAN would re-derive it (planner/high + bilingual brief + validator + commit). | WP1_REVIEW.md:68-78; ORCHESTRATE.md:14-15; tasks/WP1-F01-PLAN.md | Allow skipping `plan` when an accepted finding names file/function/repro/fix/tests; the worker-high prompt already reproduces before fixing. Cancel WP1-F01-PLAN (`cancelled` needs no report in the validator). |
| A6 | M | **Gate then audit repeat the same suite.** Verifier runs typecheck/lint/test/builds/smoke/digest/probes; the auditor must independently run mandatory checks and record digest before/after; the worker also ran them. Cost is mostly agent overhead, not command output. | docs/08:50; validate_orchestration.py:161-163 | Keep the verifier gate for package-final snapshots; for S fixes let the audit task embed the gate (`gate_included`) and relax :161 (tier 2). |
| A7 | M | **Machine-specific tooling.** Runners hard-code another vendor's runtime cache for Node and Python; system Node is v26.10.0 (outside `engines ^24.11.0`) and default npm failed. Every verifier/auditor must rediscover this; the runners break if that cache is cleaned. | run-gates.ps1:3-5; run-validation.ps1:3; WP1_REVIEW.md:19; `node --version` = v26.10.0 | One reusable gate runner with a Node 24 locator and PATH python fallback (python on PATH is 3.14). Tier 2. |
| A8 | M | **No attempt cap or de-escalation.** `expert` is "after two failed reproducible attempts"; FIX REQUIRED -> fix -> gate -> audit loops are bounded only in prose; each repeat costs a full cycle. | docs/08:22,52 | Add caps (C4). |
| A9 | M | **Digest vs commits.** `scripts/source-digest.mjs` hashes git blob IDs of every non-`handoff/` file, including untracked non-ignored files, and documents that after a commit it equals the HEAD-tree formula. Profiles/docs/AGENTS edits therefore change the source digest (correct), junk untracked files also change it, and the coordinator cannot compute it. | scripts/source-digest.mjs:1-12; docs/08:32 (worktree must keep uncommitted files) | Use (commit SHA + clean tree + digest) as audited identity (D6). |
| A10 | M | **Commit rules conflict with the new owner decision in six documents and all seven shell profiles.** | AGENTS.md:14 (rule 12); docs/08:7; ORCHESTRATE.md:6; RESUME.md:20; NEXT_ACTION.md:22; profile lines 12-14; commit-message skill ("authorizes no version-control mutation") | Listed in E. No subagent may lawfully commit until profiles change. |
| A11 | L-M | **Redundant reads per dispatch.** CLAUDE.md imports `@AGENTS.md`, so AGENTS.md is already in context, yet profiles say "Read AGENTS.md, document 08...". Document 08 is 63 dense lines. | CLAUDE.md line 3; profiles line 9 | Profile line 9: read the task brief; document 08 only for planner/verifier/auditor/committer. |
| A12 | L-M | **Recovery dispatch is unconditional.** Each resume delegates reconciliation even when no task is running/interrupted. | docs/08:44; RESUME.md:2 | Delegate only when a task is `running`/`interrupted` or git state is dirty/unpushed; otherwise read board + checkpoint directly. |
| A13 | L | **Subagents can self-report model** (system prompt names the model ID); `actual_model` is null on WF-REVIEW although cheaply observable. Effort is not self-reportable. | ORCHESTRATION.json task WF-REVIEW | Require a first result line "Self-reported model/effort"; board records `actual_source`. |
| A14 | L | `auxiliary_lookups` (WF-CAPS) is outside the validator and the max-two-active count; currently 2 active, so unenforced rather than violated. | ORCHESTRATION.json; validate_orchestration.py:169-170 | Validate/count it (tier 3). |
| A15 | L | Public repo; evidence runners contain a Windows account path (existing, not new). | run-gates.ps1:3 | Privacy script warns (not blocks) on `C:\Users\<name>`. |

Not found problematic: concurrency rule (max two, one writer, exclusive gate/audit) matches the validator; profile prompts forbid nested delegation; the coordinator tool list correctly lacks Bash.

## B. Workload sizing

Size S = one file/function; M = a few files / one vertical slice; L = multi-module slice with new schema/services; XL = multi-slice, cross-cutting. Risk H = OT/credit input, ledger/balance, ownership/authorization, transactions/concurrency, privacy (PDF/signature/export/personal data), immutable history, recovery, outbound send. No token or duration numbers are claimed (none observable).

| Unit | Size | Risk | Rationale (roadmap/prompt evidence) |
|---|---|---|---|
| WP1 F-01 fix (`clockOut`, timesheetCommands.ts:425-450) | S | H (changes OT input; IMMEDIATE transaction; before/after audit) | One function; the pattern exists in `updateSession`; two reproductions + empty/unknown confirmation + rollback tests in `tests/integration`. Plan already in WP1_REVIEW.md:68. |
| WP1 F-01 gate | S | M | Existing commands (typecheck, lint, 174 tests, builds, smoke, digest) + probes; mechanical. |
| WP1 F-01 recheck audit | S scope, unlocks WP2 | H | Reproduce F-01A/B and re-run the gate on the new digest; a scoped brief keeps it small. |
| Workflow revision (WF-IMPL) | M | M-H (governs everything; validator logic) | About 20 EN+VI pairs, validator + probes, one new profile; no application source. |
| WP2 editor/settings/calendar, holiday CSV | M x2-3 | M (CSV is untrusted input) | docs/09 WP2 checkpoint 1; builds on WP1 services. |
| WP2 user administration and ownership | M | H | AC-01; "admin is not blanket private-data access". |
| WP2 ledger schema/services (reservations, deltas, partial consume/cancel/reverse) | L | H, novel | Transactional, concurrent reservations; no in-repo pattern. |
| WP2 leave/WFH/categories, history/audit, evidence CSV | M x2 | M-H (export privacy) | docs/09 WP2 checkpoint 2. |
| WP2 browser-flow gate | M | M | New tooling; "existing HTML smoke is not browser-flow evidence" (WP1_REVIEW.md:91). |
| WP3 snapshots/hash, sign-off, atomic ledger/outbox finalization | L-XL | H, novel | Immutable snapshots; one transaction across ledger and outbox. |
| WP3 PDF (pdf-lib) and private signature files | M-L | H (privacy) | Visual evidence incl. both Sundays; signatures never public. |
| WP3 jobs/reminders/deadline automation/adapters/uncertain SMTP | L | H | Deadline/manual race, duplicate jobs, interrupted or uncertain send. |
| WP3 integration/visual checks | M | M | docs/09 checkpoint 3 "only if needed". |
| WP4 Docker/Compose, backup/restore under writes | L | H | Restore with file hashes/balances; NAS architecture may be unverifiable (marked unverified by contract). |
| WP4 workbook preview/commit (provenance, idempotency) | M-L | H (data integrity; real workbooks hold personal data) | Source-cell provenance; identical re-import is a no-op. |
| WP4 runbook/config examples | S-M | L | Documentation. |
| WP5 fresh acceptance audit of WP1-WP4 | XL as one task | H | One auditor reading the whole code base exceeds useful context: partition into 2-3 area audits plus an integration pass. |
| WP5 accepted fixes | S-M each, count unknown | by finding | Depends on audit results. |
| WP5 pilot packet / release notes | M | M | Bilingual docs; needs owner values (URL, recipients); no secrets, no real send. |
| Per-package gate/audit (WP2-WP4) | M-L each | H | Mandatory; each may produce a FIX REQUIRED loop. |

WP5 efficiency: once each package audit records its commit (D6), WP5 can scope deep review to `git diff <audited_commit>..HEAD -- . ':!handoff'` plus cross-package paths (AC-13) while still re-executing the full command suite on the current digest, which keeps the "independent current-source proof" rule.

## C. Routing

### C1. Observations on the current fixed table

- **Under-powered for novel high-risk build work:** WP2 ledger, WP3 atomic finalization/outbox/uncertain send and WP4 restore-under-writes all map to `worker-high` = sonnet/high, with Opus only after two failed reproducible attempts. For known-hard novel work, two failures (each followed by gate/audit cost) is the expensive path. The repository has no per-model quality evidence (one P2 defect survived 174 passing tests, which shows tests can mirror the implementation, not which model is better), so this is a risk-based judgement, conditional on **[C-4]**.
- **Under-powered:** the package decomposition planner for WP2-WP4 (sonnet/high); a wrong slice boundary multiplies rework, planning is read-only and once per package.
- **Over-powered:** `timesheet-verifier` (high) for mechanical command execution, since the auditor re-runs the suite anyway; `timesheet-expert` now overlaps "worker-high + model opus" because a per-dispatch model override exists.
- **Appropriate:** `light` (sonnet/low) for inventory and status translation; `worker` (sonnet/medium) for contract work; `auditor` opus/high.
- **Coordinator:** actually claude-opus-5-5 while its profile requests sonnet/medium; the profile frontmatter evidently does not bind the main session. It is the longest-lived context so its weight matters most for usage **[C-4]**; its job is dispatch and JSON integrity, so medium effort is adequate.
- **Fixed table vs per-task selection:** effort can only come from the profile; model can be overridden per dispatch. The practical optimum is a **hybrid**: profiles are *role + effort tier* (fixed, validator-checkable), and the coordinator picks the *model* per dispatch from a size x risk x novelty rubric, defaulting to the profile's model.

### C2. Rubric

Size S/M/L (section B). Risk H when any of: OT/credit input, ledger/balance, ownership/authorization, transaction/concurrency, privacy, immutable history, recovery/restore, outbound send. Novelty N = no in-repo pattern to mirror. Start at the cheapest sufficient row; move up only on a trigger (C4), not on perceived importance.

### C3. Table (task type x size x risk -> profile, model, effort, rationale)

| Task type | Size | Risk / novelty | Profile | Model | Effort | Rationale |
|---|---|---|---|---|---|---|
| Inventory, link/translation sync, status/handoff VI | any | L | timesheet-light | sonnet | low | Mechanical; auditor spot-checks meaning. `haiku` only for pure file listing, never translation, and only if available. |
| Plan from an accepted finding already naming file/fix/tests | S | any | none | n/a | n/a | Skip (A5); the worker confirms scope first. |
| Plan/diagnose bounded issue with reproducer | S-M | M-H | timesheet-planner | sonnet | high | Read-only; the reproducer bounds the work. |
| Package decomposition (WP2, WP3, WP4) | L-XL | H | timesheet-planner | **opus** | high | Slice errors compound; one dispatch per package. |
| Reconcile an interrupted/uncertain task | any | M | timesheet-planner | sonnet | high | Judgement over evidence, read-only. |
| Implement routine slice with clear contract (UI view, CSV preview, config) | S-M | L-M | timesheet-worker | sonnet | medium | Clear contract; tests give feedback. |
| Implement/fix, H risk, existing pattern (F-01, ownership checks, audit rows) | S-M | H, not novel | timesheet-worker-high | sonnet | high | Pattern exists; reproduce first. |
| Implement novel H slice (ledger services, atomic finalization/outbox, restore under writes, send uncertainty) | L | H + N | timesheet-worker-high | **opus** | high | Avoids paying for two failed Sonnet cycles; one writer keeps cost serial and bounded. |
| Second failed attempt, or unclear root cause after one evidence-backed attempt | S-M | H | timesheet-expert | opus | high | Redefine expert as the escalation tier, not "after two failures". |
| Gate, S fix or routine slice | S-M | M | timesheet-verifier | sonnet | **medium** | Mechanical; the audit re-executes. Lowering effort edits frontmatter (restart [C-3]). |
| Gate, package-final snapshot | L | H | timesheet-verifier | sonnet | medium | Model to opus only if probe output needs judgement. |
| Independent audit: package acceptance (WP1-WP4), workflow/rules audit | M-L | H | timesheet-auditor | opus | high | Never weaker than the author model. xhigh only through a new profile if **[C-1]** confirms and **[C-4]** allows. |
| Independent audit: S fix recheck | S | H | timesheet-auditor | opus | high | Scoped brief keeps cost small; this unlocks WP2. |
| WP5 acceptance audit | XL | H | timesheet-auditor, 2-3 area audits + 1 integration pass | opus | high | Partition to fit context; each fresh. |
| Commit/push | n/a | M (privacy) | **timesheet-committer (new)** | sonnet | medium | Mechanical but privacy-sensitive; the deterministic script reduces judgement. |
| Pilot packet / release notes | M | M | timesheet-worker | sonnet | medium | Documentation with owner placeholders; auditor reviews. |

### C4. Escalation / de-escalation triggers and caps

Escalate model (same effort tier) when: (1) one failed reproducible attempt with an unclear root cause; (2) a FIX REQUIRED finding recurs after one fix; (3) the task is H+N before dispatch; (4) the author used opus, so the auditor must be opus; (5) an audit finds an integrity defect the author's tier missed. Escalate effort only through a profile (needs **[C-1]**, restart). De-escalate: (a) S fix with existing pattern to sonnet/medium; (b) verifier stays sonnet/medium; (c) after an Opus slice is accepted, polish/test additions return to sonnet; (d) if usage warnings show low allowance **[C-4]**, planner/worker drop from opus to sonnet but the independent auditor never goes below the author model; if Opus is unavailable use a fresh sonnet/high auditor and record the fallback (docs/08:26). Cap: one retry at the starting tier, one at the escalated tier, then an owner blocker.

Coordinator model: keep the owner's choice; set the profile `model: inherit` (already an accepted alias) so request and actual cannot diverge, and record actual per session. If **[C-4]** shows heavy Opus weighting, the owner may prefer a sonnet/medium coordinator with Opus on planner/worker/auditor only; that is a cost choice, not a correctness one, because the coordinator authors neither source nor verdicts.

### C5. Recording and validating overrides

New board task fields: `profile_model`, `profile_effort` (copied from frontmatter); `requested_model` (the value actually passed to Agent; equals `profile_model` without override); `requested_effort` (must equal `profile_effort`); `model_override_reason` (required iff requested differs: `size_risk`, `novelty`, `escalation`, `fallback_unavailable`, `owner`); `routing` `{size, risk, novelty}`; `actual_model` (self-reported first result line, or tool result if **[C-6]**); `actual_effort` (null unless observable); `actual_source` (`self_reported|tool_result|unobserved`). `actual != requested` sets `model_mismatch: true` with a note.

Validator must accept: an override with reason; effort equal to the profile's only; `requested_model` in `sonnet|opus|haiku` (add `fable` only after **[C-2]**); null actual when `unobserved`. It must reject: an override without reason; any effort differing from the profile; an audit whose model rank (opus > sonnet > haiku; `requested_model`, or `actual_model` prefix when known) is lower than the highest author task model in the package, unless `fallback_unavailable` is recorded; an audit PASS whose recorded `actual_model` is below the author's. `coordinator_runtime` should require `actual_model`.

## D. Commit and push design

Owner decision (2026-10-02, in `owner_decisions`): autonomous commit and push authorized during development directly on `main` until the first release; side branches afterwards.

**D1. Who commits.** The coordinator has no Bash, so a delegated role must. Add one profile `timesheet-committer` (sonnet/medium; tools Read, Glob, Grep, Bash, Write, Edit, Skill; no Agent) and task kind `commit`. The other seven profiles keep "do not commit/push" (reworded: only the committer commits). Rejected: each worker committing its own work (spreads the privacy gate over seven prompts and lets coordinator-owned state or unaudited mixtures be committed); a coordinator shell (violates AGENTS rule 13 / docs/08:7).

**D2. When.** (1) *Freeze commit* after an implementation/fix task ends and before its gate (local; this is the audited snapshot). (2) *Accept commit* after gate and audit PASS (board, STATE, HANDOFF/REVIEW, evidence), followed by **push** (also before any planned stop). (3) Governance revisions follow the same two steps. No commit per board edit (token waste); uncommitted coordinator state is protected by Dropbox and lands at the next milestone. Estimate: about two commit dispatches per bounded fix and 5-8 per package, so dozens in total.

**D3. Explicit-path staging.** The commit brief lists exact paths (task `owned_paths` plus shared state touched). The committer requires `git status --porcelain=v1` to equal the expected set; any extra tracked or untracked path stops the task with a blocker. Stage with `git add -- <path>...` only (never `-A`, `.`, `-u`, `-p`, `commit -a`); commit with `-F <message file>`.

**D4. Privacy check (deterministic).** New `scripts/precommit-check.mjs` (Node, no deprecated APIs) over the staged set; non-zero exit blocks. Blocks: `.env*` (except `.env.example`), `data/`, `*.db|*.sqlite*|-wal|-shm`, `*.pdf` outside synthetic fixtures, image files or any path containing `signature`, `*.pem|*.key`, `.xls*|.csv` other than the tracked sanitized template and synthetic fixtures, oversized files, added lines with private-key headers, password/token/secret assignments with values, SMTP credentials, non-synthetic email domains (allow `example.*`, `.test`, `.invalid`); warns on `C:\Users\<name>`. The committer also reads the staged diff for personal timesheet data, runs `git diff --cached --check`, parses changed `.json`, and runs `python handoff/delivery/validate_orchestration.py` when the board is in the set (this replaces separate validator dispatches, A3).

**D5. The existing redesign.** Moot: it is commit `ffbf8f0` and already on `origin/main` (published, so it also cannot be amended; consistent with the no-amend rule). Uncommitted now: the board update, workflow checkpoint and WF-REVIEW files. Recommendation: do not bundle them with the revision. Order: (i) after the client restart, a *freeze commit* of the revision (rules, profiles, validator, probes, templates, board, checkpoint), local only; (ii) WF-GATE and WF-AUDIT run on that SHA; (iii) accept commit and push after PASS. WF-AUDIT reviews the cumulative diff `1a25275..HEAD` so one audit covers the never-audited redesign and the revision; fixes after FIX REQUIRED are new commits on `main`.

**D6. Audited identity.** Use `(reviewed_commit, source_digest)`. `source_digest` remains the equality test (line-ending normalized, `handoff/` excluded, equals the HEAD-tree formula after commit); `reviewed_commit` is the freeze commit the gate/audit started from. Preconditions: `git status --porcelain` shows nothing outside `handoff/`; HEAD equals the freeze commit (or tree digest equal); digest before equals after. Evidence and state commits after an audit touch only `handoff/`, so digest and PASS stay valid; any non-`handoff/` change yields a new digest and voids the PASS (existing `Stale PASS` rule, validate_orchestration.py:142). Audits may run in a scratch clone at the SHA to avoid Dropbox contention. New fields: `freeze_commit` (gate), `reviewed_commit` (audit), `commit_sha` and `pushed` (commit task), board `git` `{branch, release_declared, unpushed}`.

**D7. Prohibitions and enforcement.** Never: `--amend`, `--force`/`-f`/`--force-with-lease`, `--no-verify`, `reset`, `rebase`, `clean`, `stash`, `tag`, release creation, branch deletion, history rewrite, `add -A`. Enforce by profile text and by `permissions.deny` rules in `.claude/settings.json` if **[C-5]** confirms the syntax (settings edit may need a restart **[C-3]**). The `git-guardrails-claude-code` skill in `.agents/skills` blocks all pushes; do not install it as-is.

**D8. Push failure.** Before each push: `git fetch` and `git push --dry-run origin main`. Authentication/network: two retries (5 s, 30 s), then record `push_blocker`, add the commit to `git.unpushed`, continue locally, retry at the next accept/stop; never request credentials in chat (owner action: sign in once through the existing credential manager). Non-fast-forward: stop, no merge/rebase/force, owner blocker. Hook or branch-protection rejection: blocker. A package may advance on a local accept commit but the final report must list unpushed commits.

**D9. Dropbox/Windows locks.** Commit tasks run exclusively (no other running task) because `git status` refreshes the index and contends for `.git/index.lock`. On `Unable to create '.git/index.lock'` or EBUSY: retry three times (5/15/30 s). Remove a lock only if no git process is running and the lock is older than two minutes, and record it; otherwise blocker. Report any `*conflicted copy*` file under `.git` and stop.

**D10. Message convention.** Existing style (imperative subject, `- type(scope): ...` bullets as in `ffbf8f0`) via the `commit-message` skill. Body adds `Task: <id>`, and for accept commits `Gate: <task> PASS`, `Audit: <task> PASS`, `Digest: <sha256>`. Attribution trailer exactly as the harness attribution reminder specifies at commit time; never invent one. AGENTS rule 12 changes to cite the standing authorization; the skill's "preparing a message authorizes nothing" stays.

**D11. After first release.** "First release" = an owner decision recorded as `release_declared: true` in `owner_decisions` (not inferred from WP5; the real pilot stays owner-controlled). Afterwards: no direct commits to `main`; work on `fix/<task-id>-<slug>` or `feat/...`; gate/audit on the branch SHA; merge by the owner (or a later owner-delegated rule) through a PR with `gh`; no tags or releases by agents. Validator: if `release_declared`, committer tasks require `branch != main`.

## E. Exact change list

Every English file edit needs the matching `.vi.md` edit; profiles, validator, scripts and JSON have no pair. WF-IMPL is a single writer (suggested worker-high, sonnet/high).

**Tier 1 (required before the first delegated commit)**

1. `.claude/agents/timesheet-committer.md` (new): sonnet/medium; tools `Read, Glob, Grep, Bash, Write, Edit, Skill`; prompt: commit/push only explicit paths from the brief, run the privacy script, forbid amend/force/--no-verify/reset/rebase/clean/stash/tag, serialized, report SHA and exit codes, push pre-flight, never touch STATE/NEXT_ACTION. **Restart [C-3].**
2. `.claude/agents/timesheet-{auditor,expert,light,planner,verifier,worker,worker-high}.md` lines 12-14: "Do not edit shared state, spawn agents, commit/push" -> "...; only timesheet-committer commits or pushes". Line 9: drop "AGENTS.md". **Restart [C-3].**
3. `AGENTS.md` rule 12 (+vi): replace "Leave changes uncommitted by default; NEVER create/amend/push ... unless the user explicitly requests" with the standing owner authorization (committer role, `main` until first release, side branches after, never amend/force/no-verify/tag, privacy gate); keep the per-response `Commit description`.
4. `docs/08_AI_WORKFLOW_AND_BUDGET.md` (+vi): line 7; profile table (add committer, verifier medium, redefine expert); line 24 (replace fixed-table sentence with the C2-C4 rubric, caps, override recording); line 26 fallbacks; line 32 worktree sentence -> identity by (commit, digest); line 40 previous-board copy via git and English-only task records; new section "Commits and pushes" (D1-D11).
5. `docs/10_DECISIONS_AND_SOURCES.md` (+vi): record the 2026-10-02 owner decision (commit/push authorization) and the hybrid routing decision.
6. `handoff/prompts/ORCHESTRATE.md` (+vi): line 6 ("No commit/amend/push"); step 3 (plan optional for accepted findings); step 4 (freeze commit before gate); step 6 (accept commit + push); line 38 (validator inside commit tasks and after rule changes).
7. `handoff/prompts/RESUME.md` (+vi): line 20 and step 2 (reconcile unpushed commits and index.lock).
8. `handoff/NEXT_ACTION.md` (+vi): line 22 ("leave changes uncommitted") and "Current route" lines 27-31 (no F-01 planner; freeze commit; routing); mention restart and baseline.
9. `scripts/precommit-check.mjs` (new): D4 checks; `npm run lint` must pass (project memory notes an `.mjs` lint trap).
10. `handoff/delivery/validate_orchestration.py`: `KINDS += commit` (:14); nine profiles (:63); kind `commit` -> `timesheet-committer`, exclusive of every other running task (:169-175), `commit_sha` 40-hex and `pushed` boolean when done; replace :101-103 with the C5 override rules; model-rank audit check near :135-138; `reviewed_commit`/`freeze_commit` for done gate/audit (:129); `release_declared` -> committer `branch != main`; coordinator `actual_model` presence; English-only requirement for non-documentation kinds at :115-116 (if the owner approves A4).
11. `handoff/delivery/evidence/orchestration/check-recovery.py`: probes for override with reason accepted, without reason rejected, effort override rejected, weaker auditor rejected, commit exclusivity, bad commit SHA rejected; update the count (currently 22). `run-validation.ps1` line 3: PATH `python` fallback.
12. Templates `handoff/templates/TASK.md` (+vi): routing (size/risk/novelty), profile vs requested vs self-reported model/effort, freeze/reviewed commit, English-only note. `CHECKPOINT.md`, `HANDOFF.md`, `REVIEW.md` (+vi): replace the "baseline/commit" lines with commit SHA, source digest, unpushed commits (CHECKPOINT:4,23; HANDOFF:7,27; REVIEW:4,21).
13. `handoff/delivery/ORCHESTRATION.json` (coordinator): `baseline_commit` -> `ffbf8f0`; new `git` object; new tasks WF-IMPL -> WF-COMMIT (freeze) -> WF-GATE -> WF-AUDIT -> WF-COMMIT2 (accept + push); WP1-F01-PLAN `cancelled`, WP1-F01-FIX `depends_on` repointed to the accept commit; routing/override fields on every task. Fix the stale baseline text in ORCHESTRATION_HANDOFF.md:4 (+vi) and WORKFLOW_REVISION_CHECKPOINT.md (+vi). `handoff/delivery/STATE.json`: `workflow_revision` -> `2026-10-02-orchestration-v2`, `model_policy` -> `task_size_risk_rubric`, add `git_policy`.

**Tier 2 (efficiency; fold into WF-IMPL if small)**

14. Shared gate runner `scripts/run-gates.ps1` (or Node) with a Node 24 locator and digest; stop pointing at the historical hard-coded paths.
15. Retire `ORCHESTRATION.previous.json` in favour of `git show HEAD:...` (validator, check-recovery.py:41, docs/08:40, ORCHESTRATE/RESUME) after the first committer task has run once.
16. Audit `gate_included` for S fixes (validator :161).
17. `timesheet-verifier.md` effort high -> medium; `timesheet-coordinator.md` `model: inherit`.
18. `.claude/settings.json` `permissions.deny` for dangerous git subcommands and `permissions.allow` for the committer's git subcommands, after **[C-5]**.

**Tier 3 (optional/conditional):** xhigh auditor profile after **[C-1]/[C-4]**; `fable` after **[C-2]**; count `auxiliary_lookups` toward the active limit (A14).

**Restart flags:** items 1, 2, 17, 18 (profile files, coordinator profile, settings) need a new client session if **[C-3]** says agents load only at startup. Sequence: WF-IMPL -> owner runs `claude --continue` (board and checkpoint restore state) -> freeze commit -> WF-GATE -> WF-AUDIT -> accept commit + push -> resume WP1 F-01.

## F. Risks, unknowns, and verification

Risks/unknowns:

1. **[C-3]** If the committer profile is not loaded, the first commit cannot be delegated; fallback: the owner makes the single bootstrap commit manually.
2. **[C-5]** Subagent Bash permission prompts could stall unattended runs; unverified whether git write commands are auto-allowed. WF-GATE must include a dry run (`git push --dry-run`, a `git commit` in a scratch clone).
3. **[C-4]/[C-1]** Usage weighting and effort levels may change the C3 table (opus rows, xhigh); re-check against the lookup before WF-IMPL.
4. English-only task records (A4) conflict with AGENTS rule 1 as written; owner confirmation or the fallback is needed.
5. Freeze-before-audit puts unaudited commits on local `main` (pre-release, owner-authorized); acceptable because push waits for PASS; a hard limit before PASS leaves unpushed commits.
6. A self-reported model is not proof; account/managed controls may override.
7. The privacy script is heuristic and cannot recognise personal data in prose; the committer's diff read and the audit remain necessary.
8. WF-REVIEW is itself unaudited and rests on read-only inspection; the proposed validator rules were not executed.
9. No quota/reset values were observed; no token-cost estimate is claimed.

WF-GATE (verifier) must verify with actual output: validator and recovery probes pass on the revised board and fail on each new negative case; `validate_package.py --preflight` (pairs, links, 91 scenarios); `git diff --check`; `npm run lint`; `precommit-check.mjs` blocks synthetic bad inputs (fake `.env`, `signature.png`, fake PDF, fake key line) and passes clean paths in a scratch clone; committer dry run (`git push --dry-run`, clean-tree and index.lock probes); `claude --version` and the profile list show nine profiles and the committer loads; no change under `src/`, `tests/` or dependencies.

WF-AUDIT (fresh opus/high; not WF-IMPL, not WF-REVIEW) must verify: the cumulative diff `1a25275..HEAD`; amend/force/--no-verify/tag prohibitions appear consistently in profiles, AGENTS, doc 08 and settings rules; no profile other than the committer can commit; override recording cannot hide a weaker auditor (negative probe); the coordinator still has no shell and writes shared state only as documented; EN/VI pairs equivalent for each edited human-facing file; no secrets or personal data in the diff; baseline and identity fields are consistent; no application acceptance claim changed (STATE keeps WP1 FIX REQUIRED); the WP1-F01 chain still requires fix -> gate -> fresh audit on a new digest.

One next action for the coordinator: reconcile this report with the WF-CAPS result (C-1 to C-6), ask the owner the single question in A4, then save the WF-IMPL brief (worker-high, sonnet/high) covering items 1-13.
