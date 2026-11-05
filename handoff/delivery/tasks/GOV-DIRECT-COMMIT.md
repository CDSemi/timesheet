# GOV-DIRECT-COMMIT dispatch brief (commit the direct change policy, then push)

- **Task.** Mission timesheet-software-readiness, task GOV-DIRECT-COMMIT, package GOV, kind
  commit, attempt 1. It depends on GOV-DIRECT.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (rules, prompts, profiles, validators and handoff records; no
  product code; no merge expected).
- **Authority.** AGENTS.md rule 12 and document 08, "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-CALDEF-FIX2-FREEZE.md` ("Runtime": the rules
  in capitals, staging with literal paths, the workflow Python, no git configuration change).
  Task folder: `D:\.claude-tmp\timesheet\GOV-DIRECT-COMMIT`.
- **The rule you commit is already on disk.** Under it (AGENTS rule 14) you keep:
  - your privacy and secret scans;
  - `node scripts/precommit-check.mjs`;
  - `validate_orchestration.py` and `check_recovery.py`.

  `validate_package.py --preflight` and the `--non-product-*` checks are no longer required;
  run them only as information if you like.
- **The coordinator writes no file while you run.**

## Steps

1. **Starting point.**
   - `node --version` must print v24.x.
   - HEAD must be 6126afef47d4aff3e8ad079209f16aceda0b298d.
   - After `git fetch origin`, origin/main must be 6126afe.

   Otherwise stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **List every changed or untracked path** with
   `git status --short --untracked-files=all`. These groups are expected:
   - **GOV-DIRECT:**
     - `AGENTS.md` and `AGENTS.vi.md`;
     - `docs/06_*`, `docs/08_*`, `docs/09_*` and `docs/12_*` (`.md` and `.vi.md`);
     - `handoff/prompts/*` (ORCHESTRATE, RESUME and FIX_FINDINGS, each with `.vi.md`);
     - `handoff/templates/*` (TASK and CHECKPOINT, each with `.vi.md`);
     - `.claude/agents/*.md`;
     - `handoff/delivery/validate_orchestration.py` and `handoff/delivery/check_recovery.py`.
   - **Records:**
     - `handoff/delivery/ORCHESTRATION.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - `handoff/delivery/STATE.json` if it changed.
   - **Briefs:** `handoff/delivery/tasks/WP5-CALDEF-CKPT.md` (its Results),
     `handoff/delivery/tasks/GOV-DIRECT.md` and this brief.
   - **Evidence:** the folder `handoff/delivery/evidence/WP5-CALDEF-CKPT/`.
   - **The four known leftovers stay out** (see the WP5-CALDEF-ACCEPT brief).

   Any path outside these groups stops the commit; list it. In particular, nothing under
   `src/`, `tests/`, `scripts/`, `assets/`, the package files or `.claude/settings.json` may
   have changed.
4. **Stage the expected paths** with literal paths, at most about 20 per call. List every
   staged path in `checks.txt`, with a count per group.
5. **Run steps 6 to 9 of the WP5-CALDEF-FIX2-FREEZE brief** over the staged files, with the
   same allowed edits:
   - file types and names;
   - the key and PEM scan, and the email and Message-ID scan;
   - `node scripts/precommit-check.mjs`.
6. **Run these checks:**
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (193 probes expected).

   Any failure stops the commit. Do not edit the board; list every error.
7. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
   from 6126afe. Record the remote SHA. It must equal HEAD.
8. **Write the outputs.**
   - Write `checks.txt` and `commit-message.txt` in
     `handoff/delivery/evidence/GOV-DIRECT-COMMIT/`.
   - Write a short Results section here.
   - Leave all of these unstaged.

## Commit message (refine with the commit-message skill)

Subject: Adopt the owner's direct change policy: no gates, freezes or routine audits

- docs(agents): rules 2, 5, 9, 13 and 14, by the owner's decision of 2026-11-04.
  - A change is an owner request. One worker goes straight to the code and proves it works
    as asked.
  - It keeps lint, typecheck, `npm test` and build green, and keeps the documents of the
    changed behaviour matching it (EN and VI), with no wording test runs.
  - The committer commits and pushes; the owner tests.
  - There is no gate, freeze, regate or review. An audit, full e2e run, sweep or drill runs
    only on the owner's yes.
- docs(08): the "Direct change policy" section and a simpler routing table.
- docs(06, 09, 12): the statements that tied a change to gates and audits.
- docs(handoff): the prompts, templates, board, checkpoint and NEXT_ACTION (+ vi).
- chore(agents): the profile text that made gates, audits or reviews mandatory.
- chore(validators): with the board's `change_policy` set to `"direct"`, the
  acceptance-only checks are off; every other check stays. `check_recovery.py` gains probes
  for both modes.

Task: GOV-DIRECT (owner decision 2026-11-04)

## Report

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA, the
staged count, any masked or unstaged file, and every check's exit code.

## Results

- HEAD before 6126afef47d4aff3e8ad079209f16aceda0b298d; after 23e653e24e42e2c9f49a40c6d3b278e509c9cf2b.
- Pushed to origin main (fast-forward); remote SHA equals HEAD.
- Staged 39 paths; nothing masked, converted or unstaged. All checks exit 0 (193 probes).
  Details in evidence/GOV-DIRECT-COMMIT/checks.txt.
