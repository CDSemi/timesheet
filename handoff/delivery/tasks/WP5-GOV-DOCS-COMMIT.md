# WP5-GOV-DOCS-COMMIT dispatch brief (one documentation commit of the rule change, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-GOV-DOCS-COMMIT, package GOV, kind
  commit, attempt 1. It depends on WP5-GOV-DOCS-REVIEW.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (Markdown outside `handoff/`, and validators and records under
  `handoff/`; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes", and the owner's
  decisions of 2026-10-29 and 2026-11-02 (`owner_decisions` on the board). The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX20-FREEZE.md` (the rules in capitals,
  staging, no git configuration change), with the task folder
  `D:\.claude-tmp\timesheet\WP5-GOV-DOCS-COMMIT`.
- **The coordinator writes no file while you run.**
- **Confirmed at dispatch.** The coordinator fills in these lines from the REVIEW Results:
  - D_PRE: 4ac52e6b1296fa5753d00d12e5ba0868a06b1f0081d6ce25dbb563eeb44fe6e4 (882 files).
  - The net paths outside `handoff/`, eight modified:
    - `AGENTS.md`, `AGENTS.vi.md`
    - `docs/08_AI_WORKFLOW_AND_BUDGET.md`, `docs/08_AI_WORKFLOW_AND_BUDGET.vi.md`
    - `docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`
    - `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`
  - `check_recovery.py` must report 141 probes.
  - The board already carries `non_product_since_acceptance` and `current_source_digest` =
    D_PRE. `validate_orchestration.py` reads them.

## Addendum 1 (continuing after the stop)

The first run stopped at `check_recovery.py` with 60 paths staged and nothing committed.
WP5-GOV-DOCS-VALIDATOR fixed `synthetic()` (Addendum 2 of its brief), and WP5-GOV-DOCS-REVIEW
reread the fix. The working tree changed after your staging: `check_recovery.py`, the board,
STATE, the checkpoint pair, NEXT_ACTION pair, this brief, the two task briefs and their
evidence folders.

To continue:

- Stage again every staged path that changed, and any new evidence file. Step 2 ("the index
  must be empty") does not apply to this run.
- Then run steps 3, 4, 6 and 7 again in full, and steps 8 to 10.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 27567d122ab70c0997a4a31d77405662f428f585.
   - Run `git fetch origin`. origin/main must still be 27567d1.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly the paths
   confirmed above, and no untracked file. Anything else stops the commit.
4. **D_PRE.** Run `npm run digest`. It must equal the D_PRE confirmed above.
5. **Stage these:**
   - **the confirmed paths;**
   - **the validators:** `handoff/delivery/validate_orchestration.py` and
     `handoff/delivery/check_recovery.py`;
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the changed prompts, templates and WP5 documents, each with its `.vi.md`:**
     - `handoff/prompts/ORCHESTRATE.md`, `handoff/prompts/RESUME.md`;
     - `handoff/templates/TASK.md`, `handoff/templates/HANDOFF.md`;
     - `handoff/delivery/WP5_PILOT_PACKET.md`, `handoff/delivery/WP5_HANDOFF.md`;
   - **every changed or untracked brief** under `handoff/delivery/tasks/`. Expected:
     WP5-UX5-ACCEPT, and WP5-GOV-DOCS-PLAN, -VALIDATOR, -RULES, -REVIEW and -COMMIT. List
     them in `checks.txt`;
   - **every new or changed folder under `handoff/delivery/evidence/` since 27567d1,**
     staged as directories. Expected: `WP5-UX5-ACCEPT/`, `WP5-GOV-DOCS-PLAN/`,
     `WP5-GOV-DOCS-VALIDATOR/`, `WP5-GOV-DOCS-RULES/` and `WP5-GOV-DOCS-REVIEW/`.

   **Expected leftovers.** The four known untracked files stay out:
   - `WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `WP5-UX5-REGATE8/log-chain1.log`;
   - `WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears, list it and stop. List every staged path group in
   `checks.txt`, with a count.
6. **Run steps 6 to 9 of the FIX20-FREEZE brief:** owner process details, file types and
   names, the scans, and `node scripts/precommit-check.mjs`, with the same allowed edits.
7. **Run these checks, with the workflow Python for the validators:**
   - `validate_orchestration.py --non-product-staged`: PASS, and only the confirmed paths
     listed;
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (141 probes);
   - `validate_package.py --preflight`.

   Any failure stops the commit. If a validator stops on a board or brief issue, list every
   error you can see. Do not edit the board.
8. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
   from 27567d1. Record the remote SHA. It must equal HEAD.
9. **After the push:**
   - `validate_orchestration.py --non-product-range a54061f..HEAD`: PASS;
   - HEAD's digest, in the `git ls-tree` form and by `npm run digest`, must equal D_PRE.
10. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-GOV-DOCS-COMMIT/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

## Commit message (refine with the commit-message skill)

Subject: Let documentation and workflow tooling pass by review and fixes, with no gate or audit

- docs(agents): rule 14, by the owner's decisions of 2026-10-29 and 2026-11-02. Documentation
  (Markdown outside `src/`, `tests/`, `scripts/`, `assets/`, `.claude/` and `.agents/`,
  working rules included) and workflow tooling (the validators, `scripts/`, agent profiles,
  skills) get one review-and-fix by a fresh instance; a tool also runs its own checks. A
  change that alters product behaviour ships with its code task, which keeps the gate and
  audit. `.claude/settings.json` keeps the governance cycle.
- docs(08): the section "Documentation and workflow tooling", and the exceptions in the routing
  table, source identity, governance and commit points. docs(10): the owner decisions.
  docs(12): one rule for the accepted source and the release commit.
- chore(validators): `is_non_product`, the board record `non_product_since_acceptance`, the
  stale-PASS exception, `--non-product-range` and `--non-product-staged`, with new probes in
  `check_recovery.py`.
- docs(handoff): ORCHESTRATE, RESUME, the TASK and HANDOFF templates, the pilot packet, the WP5
  handoff, the board, the checkpoint (+ vi), STATE and NEXT_ACTION (+ vi), and the
  WP5-UX5-ACCEPT evidence.

Task: WP5-GOV-DOCS-RULES and WP5-GOV-DOCS-VALIDATOR, reviewed by WP5-GOV-DOCS-REVIEW
Gate: none (documentation and workflow tooling; validator probes and review, owner decisions of 2026-11-02)
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any unstaged or masked file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

Commit 5b2f28793e1def408e7a2c57df5054917450a1f2 on main, pushed (27567d12..5b2f2879, remote SHA = HEAD). D_PRE = HEAD digest = 4ac52e6b. 65 files staged. All checks exit 0 (check_recovery 141 probes; range PASS). Details: evidence/WP5-GOV-DOCS-COMMIT/checks.txt.
