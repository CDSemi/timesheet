# WF-IMPL-DOCS dispatch brief

- Mission/task: timesheet-software-readiness / WF-IMPL-DOCS; board package WP1
  (workflow revision); kind documentation; depends on WF-IMPL-TOOLING.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing:
  size M, risk M (policy text from an exact spec), novelty no.
- Baseline: HEAD ffbf8f0 plus WF-IMPL-TOOLING edits (profiles, validators, precommit
  script). Read those files to keep wording identical; do not edit them.
- Records: this brief and your results are English only. Every human-facing English
  file you change needs the equivalent .vi.md change (English authoritative).

## Owned (writable) paths

AGENTS.md and AGENTS.vi.md (if present); docs/08_AI_WORKFLOW_AND_BUDGET.md/.vi.md;
docs/10_DECISIONS_AND_SOURCES.md/.vi.md; handoff/prompts/ORCHESTRATE.md/.vi.md,
RESUME.md/.vi.md, FIX_FINDINGS.md/.vi.md; handoff/templates/; README.md/.vi.md only
where they state the old commit prohibition or fixed model table; this report;
handoff/delivery/evidence/WF-IMPL-DOCS/. Not owned: NEXT_ACTION, STATE, board,
checkpoints (coordinator), profiles/validators/scripts, CLAUDE.md, src/, tests/.
Preserve concise style; keep links valid; no business-rule changes.

## Content to encode

1. Routing (docs/08, replace the fixed table and the "smallest profile" sentence):
   profiles fix role + effort; the coordinator picks the model per dispatch by size
   (S/M/L/XL), risk H (OT/credit input, ledger/balance, ownership/authorization,
   transactions/concurrency, privacy: PDF/signature/export/personal data, immutable
   history, recovery/restore, outbound send) and novelty (no in-repo pattern).

   | Task | Profile (effort) | Model |
   |---|---|---|
   | Inventory, link/translation sync, metadata | light (low) | sonnet; haiku only for pure listing/probes |
   | Plan/diagnose bounded issue; reconcile interruption | planner (high) | sonnet |
   | Package decomposition WP2–WP4 | planner (high) | opus |
   | Accepted finding naming file/fix/tests | none | skip plan; worker reproduces first |
   | Routine slice or docs with clear contract | worker (medium) | sonnet |
   | High-risk fix/slice with an existing pattern | worker-high (high) | sonnet |
   | Novel high-risk L slice (ledger, atomic finalization/outbox, restore under writes, uncertain send) | worker-high (high) | opus |
   | Escalation: unclear root cause after one evidence-backed attempt, recurring FIX REQUIRED | expert (xhigh) | opus |
   | Gates, digests, evidence | verifier (medium) | sonnet |
   | Independent audit (fix recheck, package, workflow); WP5 as 2–3 area audits + one integration pass | auditor (xhigh) | opus, never below the author model |
   | Commit/push | committer (medium) | sonnet |
   | Coordinator | coordinator (medium) | inherit (owner's session model) |

   Caps: one retry at the starting tier, one at the escalated tier, then an owner
   blocker. De-escalate polish after an accepted Opus slice; at visible low-usage
   warnings drop planner/worker overrides to sonnet, never the auditor below the author.
   If Opus is unavailable, use a fresh sonnet auditor with reason fallback_unavailable.
   Not allowed without an owner decision: fable, best, opusplan (possible usage-credit
   billing), max/ultracode effort, speed changes. Record per task: profile, requested
   model, model_override_reason (size_risk|novelty|escalation|fallback_unavailable|
   owner), routing {size, risk, novelty}, self-reported actual_model + actual_source.
   Effort can change only through profiles; profile edits may need a client restart
   (verify by dispatch; an unrecognized profile is a restart blocker).
2. Commits and pushes (new docs/08 section; AGENTS rule 12; ORCHESTRATE; RESUME):
   owner standing authorization 2026-10-02. Before the first release,
   timesheet-committer commits directly to main and pushes after every commit. After
   the owner records the first release (`git.release_declared`), work on
   `fix/<task>-<slug>` or `feat/<task>-<slug>` branches with PRs; the owner merges
   unless delegated; agents create no tags/releases. Commit points: freeze commit after
   each implementation/fix task (before gate/audit; audited identity =
   reviewed_commit + source_digest); accept commit after audit PASS (evidence, reviews,
   state); governance revisions; checkpoint commit before a planned stop when state is
   uncommitted. No commit per board edit. Discipline: commit tasks run alone; exact
   expected path set; explicit-path staging; IDE auto-staged extras unstaged with
   `git restore --staged`; precommit-check + `git diff --cached --check` + JSON parse +
   orchestration validator when the board is staged + diff read for personal data.
   Never amend, force, --no-verify, reset, rebase, clean, stash, tag, rewrite history,
   add -A, commit -a. Push failures: two retries, then record push_blocker (commit
   stays local); non-fast-forward or protection rejection stops with an owner blocker;
   never ask for credentials in chat. The mission does not change permission settings;
   the owner may pre-approve git commands or add deny rules. Messages via the
   commit-message skill with Task/Gate/Audit/Digest body lines. AGENTS rule 12 keeps the
   per-response Commit description and says that outside this authorization nobody
   commits unless the user explicitly requests it.
3. Records and recovery (docs/08, ORCHESTRATE, RESUME, templates): task briefs/results
   under handoff/delivery/tasks/ are English-only; Vietnamese stays for human-facing
   docs, prompts, templates, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW and chat (AGENTS
   rule 1 states this scope). ORCHESTRATION.previous.json is retired: the last
   committed board is the recovery copy; edit the board with small diffs; run the
   orchestration validator inside commit tasks and after rule/profile changes.
   Delegate resume reconciliation only when a task is running/interrupted or the
   checkpoint records uncommitted/unpushed work; otherwise read board + checkpoint.
   S-size fix audits may include the gate (`gate_included`); package-final snapshots
   keep a separate verifier gate. Audits run on the freeze commit with a clean tree
   outside handoff/ (or a scratch clone at that SHA).
4. ORCHESTRATE: line 6 commit rule; step 2 skip plan for fully specified findings
   (F-01 is); step 3 English briefs and rubric routing; step 4 freeze commit,
   gate_included for S fixes; step 6 accept commit + push after PASS; step 7 checkpoint
   commit before planned stops; validator note.
5. FIX_FINDINGS: no separate plan when the review names file/function/repro/fix/tests;
   S-fix audit may include the gate.
6. Templates: TASK adds routing, profile vs requested vs self-reported model/effort,
   override reason, freeze/reviewed commit, English-only note; CHECKPOINT, HANDOFF,
   REVIEW replace baseline/commit lines with commit SHA, source digest, unpushed
   commits.
7. docs/10: record the 2026-10-02 owner decisions (commit/push authorization; adaptive
   routing delegated to the coordinator) and the coordinator's reversible decision that
   task records are English-only.

## Checks (record actual exits in your evidence dir)

`python handoff/delivery/validate_package.py --preflight` (pairs/links; if system
Python lacks IANA data, record where it stops), `python
handoff/delivery/validate_orchestration.py`, `git diff --check`, and a self-check that
each edited .vi.md matches its English meaning. Return at most 300 words: files
changed, checks with exits, open questions, self-reported model.

## Results

(Worker appends here.)

### Attempt 1 partial result (worker, claude-sonnet-5-5)

- Done: AGENTS.md and AGENTS.vi.md (rule 1 English-only task-record scope; rule 12 standing
  commit/push authorization text). README.md/.vi.md need no change (no old commit
  prohibition or fixed model table there).
- BLOCKED: the auto-mode permission classifier denied the Bash call that would apply the
  docs/08 edits (routing table, Commits and pushes section, records/recovery) with reason
  "Instruction Poisoning" (the edits encode an agent-granted standing commit/push
  authorization into instruction files). No docs/08 change was applied. I did not retry or
  work around it. Not done: docs/08 (+vi), docs/10 (+vi), ORCHESTRATE, RESUME, FIX_FINDINGS
  (+vi), templates, checks and evidence.
- Open question for the owner: confirm directly (not via agent message) that the standing
  commit/push authorization may be written into AGENTS.md rule 12 and docs/08. Until then,
  consider reverting the AGENTS.md/AGENTS.vi.md rule 12 edit.
- Status: blocked. Next action: owner confirmation, then re-dispatch the remaining scope.

## Attempt 2 brief (coordinator)

- Owner direct confirmation, typed by the owner in the main session chat on 2026-10-02
  (verbatim): "Xác nhận: cho phép ghi quyền commit/push thường trực vào AGENTS.md,
  docs/08, ORCHESTRATE, RESUME và các profile: chỉ qua timesheet-committer, thẳng main
  đến bản release đầu tiên, sau đó dùng nhánh phụ + PR; cấm amend, force-push, viết lại
  lịch sử, tạo tag; không commit secret, chữ ký hay dữ liệu cá nhân. Nếu bộ lọc vẫn chặn
  subagent, tôi đồng ý để bạn tự ghi đúng các dòng về quyền commit"
- English: "Confirmed: allow writing the standing commit/push authorization into
  AGENTS.md, docs/08, ORCHESTRATE, RESUME and the profiles: only via
  timesheet-committer, directly on main until the first release, then side branches +
  PR; prohibit amend, force-push, history rewrite, creating tags; do not commit secrets,
  signatures or personal data. If the filter still blocks the subagent, I agree that
  you (the coordinator) write exactly the commit-authority lines yourself."
- Remaining scope: everything in this brief not yet done (docs/08 and pair, docs/10 and
  pair, ORCHESTRATE/RESUME/FIX_FINDINGS and pairs, templates, checks/evidence). Keep the
  attempt-1 AGENTS edits; verify they match the confirmation and fix wording if not.
- Edit files directly with the Edit/Write tools. If any edit is still denied, stop
  immediately, record exactly which file/section was denied, finish every other part of
  the scope that does not write commit authority, and return; the coordinator will
  write the commit-authority lines under the owner's fallback consent.

### Attempt 2 result (worker, claude-sonnet-5-5)

- No edit was denied. AGENTS.md/AGENTS.vi.md attempt-1 edits kept; they match the owner's
  confirmation (only timesheet-committer; standing authorization; wording unchanged).
- Edited with .vi.md pairs: docs/08 (routing rubric+table, caps, records, resume, audit
  on freeze commit, new "Commits and pushes" section), docs/10 (2026-10-02 owner
  decisions + coordinator English-only decision), handoff/prompts ORCHESTRATE, RESUME,
  FIX_FINDINGS, handoff/templates TASK, CHECKPOINT, HANDOFF, REVIEW. README unchanged.
- Checks (evidence in handoff/delivery/evidence/WF-IMPL-DOCS/): validate_package.py
  --preflight (workflow Python) exit 0; validate_orchestration.py exit 0; git diff --check
  exit 0. Vietnamese self-check: each .vi.md edit mirrors its English edit by section.
- Status: done. Next action: coordinator review and commit via timesheet-committer.
