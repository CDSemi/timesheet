# WP5-FIXB-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXB-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-FIXB.
- This commit freezes the WP5 runbook fix (WP5-B-01, WP5-B-02). It also carries the WP5
  plan, both assessment reports and the WP4-ACCEPT results.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (many evidence files, synthetic renders, probe sources), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  e7fe5144dc62f5047c79dd5ef69d973f60dfd14d. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin.** Never pipe into head or
    tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-FIXB-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these, all from WP5-FIXB:
- `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`;
- `.env.example`;
- `compose.example.yaml`. The only change here is one comment; confirm this with
  `git diff --stat` and a Grep of the changed lines, without printing the file.

Any other changed or untracked path outside handoff/ stops the commit. In particular,
nothing under `src/`, `tests/`, `scripts/`, migrations, `.claude/`, `reference/`,
`package.json`, `package-lock.json`, AGENTS.md or CLAUDE.md may change.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
ed604d0c33b144e7fb214d05d4060494542fb21a9e69cd5b61c40097685f692a (775 files).

## Handoff files to stage

New files:
- `handoff/delivery/WP5_REVIEW_A.md`, `WP5_REVIEW_A.vi.md`, `WP5_REVIEW_B.md` and
  `WP5_REVIEW_B.vi.md`;
- `handoff/delivery/tasks/WP5-PLAN.md`, `WP5-ASSESS-A.md`, `WP5-ASSESS-B.md` and
  `WP5-FIXB.md`;
- this brief, as it stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`: `WP4-ACCEPT/`,
  `WP5-PLAN/`, `WP5-ASSESS-A/`, `WP5-ASSESS-B/` and `WP5-FIXB/`.

Modified files:
- `handoff/delivery/tasks/WP4-ACCEPT.md`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- `handoff/NEXT_ACTION.md` and `.vi.md`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-FIXB-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` file under `evidence/`;
- `mail-capture` or `private-data` content.

PNG files are allowed only under `evidence/WP5-ASSESS-A/` and only when named
`*-synthetic.png`. View each staged PNG with the Read tool and record how many you
viewed. Each must show synthetic data only.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-FIXB-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace each such token with `<email>` or `<user>` in that file only, then
  re-stage and rerun. Count the tokens with the Grep tool and never print them.

When to stop:
- A block in a docs or example file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, probe sources, names or addresses. Keep evidence LF and `.txt`
only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix the runbook Compose binding and keep the env file with off-device backups

- docs(ops) (WP5-B-01): docs/11 (+ vi) defines `<image>` and the TIMESHEET_* Compose
  variables. The restored instance binds the restore folder under its own project.
  Releases use per-release image tags with the image ID recorded, and the rollback
  starts the previous tag. The `.env.example` header and a `compose.example.yaml`
  comment are aligned.
- docs(ops) (WP5-B-02): a protected env-file copy and the release identity are kept
  with the separate-device backup, with a checklist line; a backup is taken after a
  restore's reconciliation.
- docs(handoff):
  - the WP5 plan;
  - WP5-ASSESS-A PASS (AC-13 integrated run) and WP5-ASSESS-B FIX REQUIRED, with
    evidence (+ vi);
  - the WP4-ACCEPT results;
  - board, STATE, NEXT_ACTION and checkpoint (+ vi).

Task: WP5-FIXB-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the number of PNGs viewed;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Attempt 2 (coordinator note)

Attempt 1 stopped correctly. The validator reported "Override reason without override:
WP5-ASSESS-A". Opus is the auditor profile's own model, so a pending audit that requests
opus must have no override reason. The coordinator set it to null and added this task's
attempt record; the board has no other change.

For attempt 2:
1. Confirm HEAD and origin/main are still e7fe514, and the digest is still ed604d0c….
2. Re-stage these by explicit path in one `git add`, and keep the 105 staged paths:
   - `handoff/delivery/ORCHESTRATION.json`;
   - this brief, before you append results.
3. Rerun checks 4 to 9, one command each, then commit and push.

## Attempt 3 (coordinator note)

Attempt 2 stopped correctly. The validator reported "Audit needs a gate dependency or
gate_included: WP5-ASSESS-A". Every audit, pending ones included, must name a gate.
The pending WP5-ASSESS-A attempt 2 now depends on WP4-REGATE4 as a placeholder gate,
together with this task. Its `reviewed_commit` stays null, and the coordinator replaces
the gate when it dispatches that audit. The coordinator also checked the full
validator rule set against the board before this retry.

For attempt 3, repeat the attempt-2 steps:
1. Confirm HEAD = origin/main = e7fe514 and digest ed604d0c.
2. Re-stage `handoff/delivery/ORCHESTRATION.json` and this brief, before you append
   results.
3. Rerun checks 4 to 9, then commit and push.

## Results

Attempt 1 (committer, claude-sonnet-5-5): NO COMMIT, blocked by the orchestration validator.

- HEAD = origin/main = e7fe5144dc62f5047c79dd5ef69d973f60dfd14d (pre; unchanged). Branch main, no merge/rebase.
- node --version v24.21.0 (full path; PATH prepend picked v26, so the full path was used). Exit 0.
- Digest ed604d0c...692a, 775 files, matches. Staged 105 files (20 listed + 85 evidence). PNGs viewed: 4, all synthetic.
- Scope: outside handoff/ only the 4 allowed paths; compose.example.yaml has 3 added lines, all comments.
- precommit 0 (PASS, 0 findings); git diff --cached --check 0; JSON parse 0.
- validate_orchestration.py exit 1: ValueError "Override reason without override: WP5-ASSESS-A" (board
  task WP5-ASSESS-A has an override reason but no override). check_recovery/validate_package not run.
- Files stay staged; nothing committed or pushed. Coordinator must fix the board, then redispatch.

### Attempt 2 results

- HEAD = origin/main = e7fe514; digest ed604d0c matches. Re-staged ORCHESTRATION.json and this brief (the brief
  already held attempt 1 results when staged); 105 paths staged.
- precommit 0, diff --cached --check 0, JSON parse 0.
- validate_orchestration.py exit 1: ValueError "Audit needs a gate dependency or gate_included: WP5-ASSESS-A".
  check_recovery/validate_package not run. NO COMMIT, nothing pushed. Board needs another fix.
