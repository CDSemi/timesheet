# WF-IMPL-TOOLING dispatch brief

- Mission/task: timesheet-software-readiness / WF-IMPL-TOOLING; board package WP1
  (workflow revision); kind implement; attempt 1; depends on WF-REVIEW (done).
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override.
  Routing: size M, risk H (workflow-integrity validator logic), novelty no.
- Baseline: HEAD ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed (= origin/main). Preserve,
  do not edit: handoff/delivery/ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT*.md,
  handoff/delivery/tasks/WF-*.md and WF-REVIEW.vi.md (coordinator/other-task files).
- Inputs: design report handoff/delivery/tasks/WF-REVIEW.md (C5, D, E items 1, 2, 9,
  10, 11, 17); capability facts in ORCHESTRATION.json `auxiliary_lookups` WF-CAPS
  result. The coordinator decisions below override the report where they differ.
- Records: this brief and your results are English only (owner-delegated efficiency
  decision); do not create a .vi.md for task records.

## Coordinator decisions (binding)

1. Profiles = role + effort tier; the coordinator picks the model per dispatch.
   Frontmatter: coordinator inherit/medium; light sonnet/low; planner sonnet/high;
   worker sonnet/medium; worker-high sonnet/high; expert opus/xhigh (escalation tier);
   verifier sonnet/medium; auditor opus/xhigh; committer sonnet/medium (new).
   Per-dispatch models allowed: haiku, sonnet, opus. Not allowed: fable, best,
   opusplan (possible usage-credit billing / unclear subagent behaviour).
2. Only timesheet-committer commits/pushes. Pre-release: directly on main, push after
   every commit. After an owner-recorded first release (board `git.release_declared`
   true): side branches only; the owner merges PRs.
3. Task records (handoff/delivery/tasks/) are English only; human-facing docs stay
   bilingual.
4. Audited identity = (`reviewed_commit` when available, `source_digest`).
5. An S-size fix audit may include the gate (`gate_included: true`); package-final
   snapshots keep a separate verifier gate.
6. ORCHESTRATION.previous.json is retired (the last committed board is the recovery
   copy). Remove any requirement for it; do not delete the file yourself.
7. Permission rules in .claude/settings.json stay owner-controlled: add none.

## Owned (writable) paths

handoff/delivery/validate_orchestration.py; handoff/delivery/check_recovery.py (new);
handoff/delivery/validate_package.py (pair exemption only); scripts/precommit-check.mjs
(new); package.json (only to add an optional `precommit-check` script; lock file must
not change); .claude/agents/ (eight existing profiles + new timesheet-committer.md);
this report; handoff/delivery/evidence/WF-IMPL-TOOLING/. Everything else read-only
(docs, prompts, templates, AGENTS.md, settings.json, board/state, src/, tests/).

## Spec A: validate_orchestration.py

- KINDS add `commit`; expect nine profiles. Profile models {sonnet, opus, haiku,
  inherit}; efforts {low, medium, high, xhigh, max}. Coordinator: Agent present, Bash
  absent. Committer: Bash present, Agent absent. Others: Agent absent.
- Pending/running tasks: `requested_effort` must equal the profile effort.
  `requested_model` must equal the profile model, or be in {haiku, sonnet, opus} with
  `model_override_reason` in {size_risk, novelty, escalation, fallback_unavailable,
  owner}; the reason must be null/absent when the model equals the profile model.
- Optional `routing` {size: S|M|L|XL, risk: L|M|H, novelty: bool}: validate when
  present. `actual_source` in {self_reported, tool_result, unobserved} is required when
  `actual_model` is non-null.
- Audit strength: rank haiku 1 < sonnet 2 < opus 3. A task's model = family of
  `actual_model` when known (claude-opus-*, claude-sonnet-*, claude-haiku-* or alias),
  else `requested_model`. Every running/done audit must rank at least the highest
  author task in its package (kinds implement/fix, plus any task whose agent_id is in the
  audit's `author_agent_ids`) unless its `model_override_reason` is fallback_unavailable.
- Every audit must depend on a gate task or have `gate_included: true`.
- Gate/audit done: keep the digest rules; `freeze_commit`/`reviewed_commit` optional
  but 40-hex when present.
- Commit tasks: profile timesheet-committer; a running commit must be the only running
  task and no auxiliary lookup may be running; done requires `commit_sha` (40-hex),
  `pushed` (bool), `branch` (non-empty); if board `git.release_declared` is true,
  `branch` must not be `main`.
- Optional board `git` {branch: str, release_declared: bool, last_commit: 40-hex|null,
  unpushed: [40-hex]}. Optional `auxiliary_lookups`: running entries count toward
  `max_active_subagents` together with running tasks.
- Task reports: require only the English report for non-pending/non-cancelled tasks.
- Optional `coordinator_runtime`: when present it needs `requested_model` and
  `actual_model` keys.
- Keep every other existing rule. Output keeps application_acceptance_verified and
  claude_runtime_verified false.

## Spec B: check_recovery.py

Copy handoff/delivery/evidence/orchestration/check-recovery.py (leave that historical
copy untouched), adapt only probes affected by the bilingual/profile-count changes,
and add probes: valid override accepted; override without reason rejected; `fable`
rejected; effort differing from profile rejected; audit weaker than author rejected;
weaker audit with fallback_unavailable accepted; audit lacking gate dependency and
gate_included rejected; running commit beside another running task rejected; done
commit without 40-hex SHA rejected; commit on main after release_declared rejected;
running lookups exceeding the limit rejected; English-only report accepted. Synthetic
in-memory boards only; never touch the real board. Print PASS with the probe count.

## Spec C: validate_package.py

Exempt only handoff/delivery/tasks/ from the .md/.vi.md pair requirement. Existing
historical pairs there remain valid.

## Spec D: scripts/precommit-check.mjs

Node 24 ESM, no deprecated APIs, lint-clean, `execFileSync('git', ...)` without a shell.
Inspect the staged set (`git diff --cached --name-status -z`; staged blobs via
`git show :<path>`; added lines via `git diff --cached -U0`). Exit 1 on: `.env*`
except `.env.example`; paths under `data/`; `*.db`, `*.sqlite*`, `*-wal`, `*-shm`;
`*.pdf` or image files or paths containing `signature`, except synthetic files under
reference/fixtures/ or handoff/delivery/evidence/ (confirm the real synthetic
directories); `*.pem`, `*.key`, `*.p12`, `*.pfx`; `*.xls*`/`*.csv` except
reference/inputs/Timesheet_Rev8_2026.xlsx and synthetic fixture/example directories;
files over 5 MB; added lines with private-key headers; added password/secret/token/
api-key/SMTP-credential assignments with literal non-placeholder values; added email
addresses outside example.com/.org/.net, *.test, *.invalid, *.example, localhost.
Warn only (exit 0) on Windows user-profile paths. Mask secret values in output.
Provide `--self-test` that exercises every rule on built-in synthetic samples without
git. Keep it small and readable.

## Spec E: profiles

- Frontmatter per decision 1.
- Seven non-coordinator existing profiles: replace "Do not edit shared state, spawn
  agents, commit/push, change billing or activate production." with "Do not edit
  shared state, spawn agents, commit, push or rewrite git history (only
  timesheet-committer commits and pushes), change billing or activate production."
  Replace "bilingual task results/checkpoints" with "English task results/checkpoints
  (Vietnamese only in assigned human-facing documents)". First line becomes "Read
  AGENTS.md unless it is already in your context, then the delegated task brief and
  package prompt; read document 08 only as planner, verifier or auditor." Add: "Begin
  your returned result with 'Self-reported model: <model ID from your system context>'."
- Expert description: "Escalation tier for a bounded hard integrity problem: unclear
  root cause after one evidence-backed attempt, a recurring FIX REQUIRED, or
  demonstrated exceptional complexity."
- Auditor body adds: "Your model must not be weaker than the audited author's."
- Coordinator: replace "Select the smallest sufficient project profile." with "Route
  each dispatch by the document 08 rubric: the profile fixes role and effort; choose
  the model per dispatch and record any override reason. Only timesheet-committer
  commits and pushes." Keep the rest, including no shell.
- New timesheet-committer (tools Read, Glob, Grep, Bash, Write, Edit, Skill; sonnet;
  medium), concise body: run only the commit task in the brief, alone; confirm branch
  (main pre-release, never main after release_declared) and no merge/rebase in
  progress; `git status --porcelain=v1 -uall` must equal the brief's expected path set;
  unstage IDE auto-staged extras only with `git restore --staged -- <path>` and record
  it; any other unexpected path stops the task. Stage only listed paths with
  `git add -- <paths>` (listed removals with `git rm -- <path>`). Before committing run
  `node scripts/precommit-check.mjs`, `git diff --cached --check`, parse changed JSON,
  run `python handoff/delivery/validate_orchestration.py` when the board is staged, and
  read the staged diff for personal data; any failure means no commit. Commit with
  `git commit -F <message file in its evidence dir>` using the commit-message skill and
  the brief's Task/Gate/Audit/Digest body lines; attribution exactly as the client
  instructs. Push: `git fetch origin`, `git push --dry-run origin <branch>`,
  `git push origin <branch>`; auth/network failure: retry after 5 s and 30 s, then
  record push_blocker (commit stays local); non-fast-forward or hook/protection
  rejection: stop, no merge/rebase/force. Locks: retry index.lock/EBUSY after 5/15/30 s;
  remove a lock only if no git process runs and it is older than two minutes, and
  record it. Never: --amend, --force/-f/--force-with-lease, --no-verify, reset,
  rebase, clean, stash, tag, release, branch deletion, history rewrite, add -A/./-u,
  commit -a, git config changes, credentials in chat. Edit no content except its own
  report, evidence and message file. Report pre/post HEAD, commit SHA, pushed,
  remote SHA, branch, staged list, check exits and blockers, English only.

## Checks to run and record (evidence dir, actual exits)

1. `python handoff/delivery/validate_orchestration.py` on the real board: PASS. The
   board's pending tasks are pre-set to the post-revision efforts (verifier medium,
   auditor xhigh), so the old validator rejects it until your change lands. If the
   board still fails for a reason outside your owned paths, report it; do not edit it.
2. `python handoff/delivery/check_recovery.py`: PASS with count.
3. `python handoff/delivery/validate_package.py --preflight`; if system Python lacks
   IANA data, record where it stops (you may use a Python path recorded in
   handoff/delivery/evidence/orchestration/run-validation.ps1 if it still exists; do
   not install packages).
4. `node scripts/precommit-check.mjs --self-test`: PASS.
5. `npm run lint` with Node 24 and `git diff --check`.
6. No change under src/, tests/, package-lock.json.

Node 24: `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin\node.exe`;
npm as `node.exe "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"`; system Node 26 is
refused (engine-strict). In Git Bash prepend
`$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin` to
PATH. A .js/.mjs file outside tsconfigs and scripts/*.mjs breaks lint.

Return at most 300 words: files changed, checks with exit codes, deviations,
self-reported model.

## Results

(Worker appends here.)

### Attempt 1 results (worker-high, self-reported model claude-sonnet-5-5)

Files changed (all within owned paths; src/, tests/, package-lock.json untouched):
- handoff/delivery/validate_orchestration.py: Spec A (commit kind, nine profiles, model/effort override
  rules, routing/actual_source, audit strength rank, audit needs gate or gate_included, commit-task
  exclusivity/fields, board `git`, `auxiliary_lookups` counted toward the active limit, English-only
  reports, `coordinator_runtime` keys, optional 40-hex freeze/reviewed commit). Added: committer profile
  is only allowed for commit tasks and vice versa.
- handoff/delivery/check_recovery.py (new; historical copy untouched): 48 synthetic probes, PASS.
  Probes build an in-memory synthetic board (the live board now has a running task, so the historical
  probes keyed to its old task order no longer apply); the real board is only read for one acceptance probe.
  The `ORCHESTRATION.previous.json` probe was dropped (decision 6).
- handoff/delivery/validate_package.py: pair exemption for handoff/delivery/tasks/ only.
- scripts/precommit-check.mjs (new) with `--self-test`; package.json gains `precommit-check` script.
- .claude/agents/: eight profiles updated, timesheet-committer.md added.

Checks (evidence in handoff/delivery/evidence/WF-IMPL-TOOLING/, actual exits):
1. validate_orchestration.py on the real board: exit 0 PASS (9 profiles, 9 tasks).
2. check_recovery.py: exit 0 PASS, count 48.
3. validate_package.py --preflight: system Python 3.14 exit 1 (no tzdata, stops in times() after the
   pair/link checks); Python from run-validation.ps1 (codex runtime) exit 0 PASS (42 pairs, 494 links, 91 scenarios).
4. precommit-check.mjs --self-test: exit 0 (27 path, 24 line samples, all 12 rules); scratch-repo run with
   synthetic bad staged files exits 1 with masked output, and the script scans clean on itself.
5. npm run lint (Node 24.21.0): exit 0; git diff --check: exit 0.
6. No change under src/, tests/, package-lock.json.

Deviations / notes:
- Expert description is double-quoted in frontmatter: it contains ": " which is invalid in an unquoted YAML scalar.
- Planner/verifier/auditor body lines saying "bilingual task reports" now say English (decision 3); the
  auditor still writes bilingual REVIEW documents.
- Coordinator profile line wrap adjusted only.
- precommit-check: the `signature` path rule exempts source/text extensions (ts, tsx, js, mjs, md, sql, css,
  html) so future signature-related source files do not block commits; synthetic dirs allowed:
  reference/fixtures/, reference/examples/, handoff/delivery/evidence/ (media) and the first two for xls/csv.
- precommit-check cannot be tested against the real index without staging (not permitted here).

Open issues: none blocking. Profile changes may need a client restart to load (outside this task).
