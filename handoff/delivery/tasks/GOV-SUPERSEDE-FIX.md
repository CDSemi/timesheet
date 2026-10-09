# GOV-SUPERSEDE-FIX dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SUPERSEDE-FIX; package GOV; kind fix;
  attempt 1; depends on WP5-UX-FIX1-FREEZE (done, 4def605).
- Why: the owner-requested UI redesign changed WP5 source after WP5 was accepted. The
  validator requires every done PASS audit of the active package to match
  `current_source_digest` (stale-PASS check) and allows a done task to depend only on a
  done PASS audit. WP5-RECHECK is the only WP5 PASS audit (digest 150420e7) and the done
  WP5-ACCREC depends on it. When WP5-UX-GATE records the new digest, WP5-RECHECK can
  neither stay a plain done PASS (stale) nor be reset or cancelled (breaks WP5-ACCREC).
  docs/08 already says "Changed source identity invalidates an old audit pass"; the board
  needs a way to record that an old PASS is historical and superseded by a later audit.
  Coordinator decision recorded on the board (`coordinator_decisions`, 2026-10-08).
- Second item, same GOV cycle: across this mission, agents slipped ten times on the
  brief-only runtime rule (heredocs and pipes feeding scripts to python or node through
  stdin, and pipes into head or tail). Put the rule into the agent profiles so that it
  applies without relying on each brief.
- Profile/routing: timesheet-worker-high (effort high), requested model sonnet, no
  override. Routing: size M, risk M (the validator gates audit integrity), novelty no
  (existing validator patterns such as `addresses_audit` and the check_recovery probe
  suite). Task record in English. Governance paths change, so a GOV freeze, a verifier
  gate and a fresh independent audit follow.
- Base: HEAD = origin/main = 4def605d6bffd71b789214a03202a3122939406e; source digest
  2565b1e82d4aa5f8d55f71feb45b7180b35e169ea3f4376a2a96db8271f63444. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first.
- docs/08_AI_WORKFLOW_AND_BUDGET.md (sections "Durable state and recovery", "Gates and
  independent audit") and its VI pair.
- `handoff/delivery/validate_orchestration.py` (whole file: `validate_audits`,
  `validate_addresses`, the stale-PASS check in `validate`, `visit`, the software_ready
  block) and `handoff/delivery/check_recovery.py` (the probe suite and how it builds
  synthetic boards).
- The board (read-only): the `coordinator_decisions` entry about `superseded_by`, and
  the tasks WP5-RECHECK and WP5-ACCREC.
- `.claude/agents/timesheet-*.md` (nine profiles).

## Required change A: `superseded_by` on audits

Add an optional audit field `superseded_by` (string task ID) with these rules, enforced
in `validate_orchestration.py`:
1. Allowed only on tasks of kind `audit` that are `done` with decision `PASS`.
2. It names an existing task of kind `audit` in the same package, not the task itself,
   and that target has no `superseded_by` of its own (no chains).
3. A superseded done PASS audit is exempt from the stale-PASS check
   (`reviewed_digest == current_source_digest`), but it still counts as a PASS for
   dependency checks (`visit`), so tasks that depended on it stay valid.
4. If the target has a `reviewed_digest`, it must differ from the superseded audit's
   `reviewed_digest`.
5. When the board status is `software_ready`, every `superseded_by` target must be
   `done` with decision `PASS`.
6. All other rules stay as they are (author separation, audit strength, gate binding,
   GOV rules, commit rules).

Add probes to `check_recovery.py` for each rule: at least one accepted case (a superseded
PASS with a stale digest beside a current PASS target) and one rejected case per rule
(field on a non-audit or non-PASS task, unknown target, other package, self, chain, equal
digests, software_ready with a pending or non-PASS target), plus a case showing that
without `superseded_by` the stale PASS is still rejected. The real board must still pass.

docs/08 (+ `.vi.md`): one or two sentences in "Durable state and recovery" or "Gates and
independent audit" describing `superseded_by` (when a later accepted change replaces an
audited snapshot, the old PASS stays as history with `superseded_by` naming the
re-audit; it no longer counts as current acceptance).

## Required change B: runtime rule in the profiles

In each non-coordinator profile body (`timesheet-auditor`, `-committer`, `-expert`,
`-light`, `-planner`, `-verifier`, `-worker`, `-worker-high`), add one short line, for
example: "Never feed a script to python or node through stdin (no heredocs, no `| node`,
`| python`, `node -` or `python -`): write a file and run it. Never pipe output into
head or tail: redirect to a file and read it." Do not change any frontmatter field
(name, description, tools, model, effort) and do not touch `timesheet-coordinator.md`.
The validator must still parse all nine profiles.

docs/08 (+ `.vi.md`): if docs/08 lists runtime rules for agents, add the same rule there
in one sentence; otherwise skip.

## Owned paths

- `handoff/delivery/validate_orchestration.py`
- `handoff/delivery/check_recovery.py`
- `docs/08_AI_WORKFLOW_AND_BUDGET.md`, `docs/08_AI_WORKFLOW_AND_BUDGET.vi.md`
- `.claude/agents/timesheet-auditor.md`, `timesheet-committer.md`, `timesheet-expert.md`,
  `timesheet-light.md`, `timesheet-planner.md`, `timesheet-verifier.md`,
  `timesheet-worker.md`, `timesheet-worker-high.md` (all under `.claude/agents/`)
- this brief's Results section
- `handoff/delivery/evidence/GOV-SUPERSEDE-FIX/` (masked LF `.txt` only; any probe script
  stored as `*.py.txt`)

Read-only: everything else, including the board. Do not edit ORCHESTRATION.json or
STATE.json; the coordinator records `superseded_by` on the board later.

## Checks (verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. Reproduce first: a small synthetic-board probe (in the task folder) that shows the
   current validator rejects a stale PASS beside a newer PASS audit; record it.
3. `check_recovery.py` with the workflow Python (all probes, old and new), and
   `validate_orchestration.py` on the real board: both exit 0. Record the probe count
   before and after.
4. `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
5. EN/VI parity of the docs/08 change.
6. `npm run verify` with `SMOKE_PORT` in 47880-47889 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
7. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
8. Copy masked logs of steps 2-4, 6 and 7 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.
  NEVER PIPE OUTPUT INTO `head` OR `tail`.** Use the Write and Edit tools for files;
  run Python only on script files you wrote, with the workflow Python above.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\GOV-SUPERSEDE-FIX`: set TEMP and TMP to it. Raw
  logs stay there; copy only masked logs into the evidence folder.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call (for example on a profile edit), stop at once and
  report; do not retry or rephrase.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or push.

## Return

At most 150 words, beginning with 'Self-reported model: ...': files changed, the rules
implemented, probe counts before and after, validator on the real board, preflight and
verify exit codes, the final digest, the evidence files, the background-task
confirmation, and any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, attempt 1).

Base: HEAD 4def605d6bffd71b789214a03202a3122939406e (evidence/base-head.txt). Node v24.21.0.
Workflow Python: `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
Evidence folder: `handoff/delivery/evidence/GOV-SUPERSEDE-FIX/` (masked LF `.txt`).

### Reproduction (before)
`repro_superseded.py.txt` (synthetic board: stale done PASS audit S-AUDIT1 beside current PASS
S-AUDIT2): without the field REJECTED "Stale PASS"; with `superseded_by: S-AUDIT2` still REJECTED
"Stale PASS" (repro-before.txt). After the fix: without the field REJECTED, with the field
ACCEPTED (repro-after.txt).

### Change A: `superseded_by` (validate_orchestration.py)
New `validate_superseded(tasks, by_id, software_ready)`; the stale-PASS check now skips a done PASS
audit that has `superseded_by`. Rules: (1) only audit kind, only done + PASS; (2) target is another
existing audit of the same package, not itself (string), and has no `superseded_by` (no chains);
(3) exempt from stale-PASS, still a PASS for `visit` dependency checks (unchanged code); (4) target
`reviewed_digest`, when present, must differ; (5) at board status `software_ready` every target must be
done + PASS; (6) all other rules unchanged.

### check_recovery.py probes
19 new probes: count 87 -> 106 (exit 0 both; recovery-before/after.txt). Accepted: superseded stale PASS
beside current PASS target; target pending; target non-PASS (before software_ready); software_ready with
done PASS target. Rejected: stale PASS without the field; stale PASS target; field on non-audit; on gate;
on non-PASS audit; on unfinished audit; unknown, gate, non-string and self targets; other-package
target; chain; equal digests; software_ready with pending and with non-PASS target.
Real board: `validate_orchestration.py` exit 0 before and after (282 tasks, 9 profiles).

### Change B: profile runtime line
One 3-line "Runtime:" paragraph (no stdin-fed scripts, no `| node`/`| python`/`node -`/`python -`,
no pipes into head or tail) added to the eight non-coordinator profiles; no frontmatter change;
`timesheet-coordinator.md` untouched; all nine profiles parse (validator PASS).

### docs/08 (+ .vi.md)
One sentence pair added to "Gates and independent audit" (after the `addresses_audit` sentence), EN
and VI with the same content. docs/08 has no list of agent runtime rules, so the runtime rule was not
added there (brief: skip).

### Checks
- `validate_package.py --preflight`: exit 0 (92 translation pairs; preflight.txt).
- `npm run verify` (SMOKE_PORT=47881, DATA_DIR/DATABASE_PATH in the task folder): exit 0 (verify.txt).
- `npm run digest` (last): `3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9`
  (789 files, handoff/ excluded) (digest.txt). It differs from the base digest 2565b1e8... because
  `.claude/` and `docs/` are inside the digest scope and changed.
- No file outside the owned paths was edited; ORCHESTRATION.json, STATE.json and the coordinator
  profile untouched. No background task of mine is running.

### Deviation
One slip: a single `ls ... | head -3` (directory listing, not fed to python or node) while locating the
preflight script; no other pipe into head or tail was used.

Status: done
