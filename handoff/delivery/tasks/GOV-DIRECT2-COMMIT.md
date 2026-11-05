# GOV-DIRECT2-COMMIT dispatch brief (commit the risk-area test rule, then push)

- **Task.** Mission timesheet-software-readiness, task GOV-DIRECT2-COMMIT, package GOV, kind
  commit, attempt 1. It depends on GOV-DIRECT2.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L.
- **Authority.** AGENTS.md rule 12 and document 08, "Commits and pushes"; push to main. No
  tag, amend, force-push or history rewrite.
- **Runtime and checks.** As in `handoff/delivery/tasks/GOV-DIRECT-COMMIT.md`: literal-path
  staging, the scans, `node scripts/precommit-check.mjs`, `git diff --cached --check`, a JSON
  parse of ORCHESTRATION.json and STATE.json, `validate_orchestration.py` and
  `check_recovery.py`. Task folder: `D:\.claude-tmp\timesheet\GOV-DIRECT2-COMMIT`.
- **The coordinator writes no file while you run.**

## Steps

1. HEAD = origin/main = 23e653e24e42e2c9f49a40c6d3b278e509c9cf2b after `git fetch origin`.
   Otherwise stop. `git diff --cached` must be empty.
2. **Expected changes** (`git status --short --untracked-files=all`):
   - **GOV-DIRECT2:**
     - `AGENTS.md` and `AGENTS.vi.md`;
     - `docs/08_AI_WORKFLOW_AND_BUDGET.md` and `.vi.md`;
     - `.claude/agents/timesheet-worker.md` and `timesheet-worker-high.md`;
     - `handoff/prompts/ORCHESTRATE.md` and `.vi.md`.
   - **Records:**
     - `handoff/delivery/ORCHESTRATION.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.
   - **Briefs:**
     - `handoff/delivery/tasks/GOV-DIRECT-COMMIT.md` (its Results);
     - `GOV-DIRECT2.md`;
     - this brief.
   - **Evidence:** `handoff/delivery/evidence/GOV-DIRECT-COMMIT/`.
   - **The four known leftovers stay out.**

   Any other path stops the commit; list it.
3. **Stage, scan and check** as above. Any failure stops the commit; do not edit the board.
4. **Commit on main and push.** The push must fast-forward from 23e653e. The remote SHA must
   equal HEAD.
5. **Write the outputs.** Write `checks.txt` and `commit-message.txt` in
   `handoff/delivery/evidence/GOV-DIRECT2-COMMIT/`, and a short Results section here. Leave
   them unstaged.

## Commit message (refine with the commit-message skill)

Subject: Let workers test risk areas themselves under the direct change policy

- docs(agents, 08), chore(agents), docs(handoff): a change to time, OT or the ledger,
  sign-off or sending also runs that area's unit, integration and e2e specs and
  `npm run verify` in the same worker task. There is no separate gate; a full e2e run, a
  sweep, a drill or an audit still needs the owner's yes (owner decision 2026-11-04).

Task: GOV-DIRECT2

## Report

Return at most 60 words, beginning 'Self-reported model: ...', with the full commit SHA, the
staged count and the check exit codes.

## Results
