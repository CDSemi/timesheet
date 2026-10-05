# WP3-FIX-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIX-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-FIXB and WP3-FIXC. This is the WP3 fix-round freeze:
  WP3-REGATE and the rechecks review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M. The commit is large: fix-round source, the three audit reports and
  their evidence, synthetic screenshots and renders. Novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a1cd566e59253d19f53cfd5b3a81fd27a7e9a056. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path for every node/npm step; plain `node`
    resolves v26 here.
  - Make the first shell call a trivial `node --version` with that path. If it fails
    with ENOSPC or "temp filesystem … is full", stop at once and report.
  - Use `D:\timesheet-tmp\WP3-FIX-FREEZE` for TEMP/TMP. Delete only files you created;
    never remove folders recursively.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.

## Expected working-tree set

Outside handoff/, changed or new paths may only be among these:
- Source:
  - src/server/services/automation.ts, src/server/jobs/runner.ts;
  - src/server/services/history.ts, src/server/routes/submission.ts,
    src/server/types.ts;
  - src/server/services/sharedActs.ts (new);
  - src/client/HistoryScreen.tsx, src/client/ReviewScreen.tsx, src/client/api.ts,
    src/client/styles.css;
  - src/client/components/otModel.ts, src/client/components/sharingModel.ts;
  - src/client/components/granteeChangesModel.ts (new).
- Tests:
  - tests/integration/: deadline.test.ts, delivery.test.ts, delivery-crash.test.ts,
    history.test.ts;
  - tests/integration/review-grantee-changes.test.ts (new);
  - tests/client/: otModel.test.ts, sharingModel.test.ts, reviewModel.test.ts;
  - tests/client/granteeChangesModel.test.ts (new);
  - tests/e2e/sharing.spec.ts.

No migration, package.json, lock file or governance path may change.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add` and
record it. The WP3-FIXC worker reported
eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410; a different value stops
the commit.

Handoff files:
- New:
  - handoff/delivery/WP3_REVIEW_A.md, WP3_REVIEW_B.md, WP3_REVIEW_C.md and their
    `.vi.md` files;
  - handoff/delivery/tasks/: WP3-LINKFIX.md, WP3-FIXB.md, WP3-FIXC.md,
    WP3-FIX-FREEZE.md, WP3-REGATE.md, WP3-RECHECK-A.md and WP3-RECHECK-BC.md;
  - every file under handoff/delivery/evidence/: WP3-GATE/, WP3-AUDIT-A/,
    WP3-AUDIT-B/, WP3-AUDIT-C/, WP3-LINKFIX/, WP3-FIXB/ and WP3-FIXC/.
- Modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/WP3_HANDOFF.md and .vi.md (fix-round sections);
  - handoff/delivery/tasks/: WP3-T15-FREEZE.md, WP3-GATE.md, WP3-AUDIT-A.md,
    WP3-AUDIT-B.md and WP3-AUDIT-C.md (results).

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-FIX-FREEZE/ and
the results you append to this brief after the commit. Do not stage them.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- Playwright or test output outside the evidence directories;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content;
- any other source, test, configuration or governance file.

PNG files are allowed only under the evidence directories listed above, and only when
named `*-synthetic.png`.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths (its own command).
4. The precommit check.
5. `git diff --cached --check`.
6. A JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight`, run with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Images: view with the Read tool the two WP3-FIXC screenshots and at least four other
staged images, with at least one from each audit directory that has images. Record how
many you viewed; they must show synthetic data only.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line, re-stage it and record the file name.
- If the precommit check masks a user-profile path in an evidence log, that is allowed.
- If it blocks an email address or the Windows user name in an evidence log under the
  directories listed above, replace each such token with `<email>` or `<user>` in that
  evidence file only. Count with the Grep tool and never print the values. Record it,
  re-stage and rerun.

Stops:
- A block in a source, test, review or HANDOFF file stops the commit.
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once; do not retry, split or
  rephrase it.

Shell and output rules:
- Do not print diffs, test bodies, probe sources, names or addresses through the shell.
- Never write into the repository root. On Windows, never redirect to /dev/null or nul,
  including `2>/dev/null`.
- Keep your evidence LF, free of trailing whitespace, with a single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix WP3 audit findings B-01..03 and C-01..03 and record the audits

- fix(automation): automatic submission starts at account creation; deadlines before
  it are skipped (WP3-B-01)
- fix(jobs): recover interrupted sends in every runner pass, so a crash during the final
  attempt becomes uncertain with the owner decision (WP3-B-02)
- fix(history): plain operation names with an "Other change" fallback, system events
  badged automatic (WP3-B-03); attribution only for shared-route operations by a
  non-owner, "Downloaded by" for PDF downloads (WP3-C-02)
- feat(review): owner-only "N day(s) last changed by <name>" hint from the audit,
  outside the snapshot hash and PDF (WP3-C-01)
- docs(types): AppEnv comment (WP3-C-03)
- docs(handoff): WP3 gate result, area audits A, B and C with evidence, link fix,
  fix-round records, regate and recheck briefs, HANDOFF fix-round sections, board and
  checkpoint (+ vi)

Task: WP3-FIX-FREEZE

## Push and report

Push per the profile. Append to this brief:
- the HEAD before and after;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest, the staged count and the number of images viewed;
- the exit code of each check;
- any blockers.

Write your evidence to handoff/delivery/evidence/WP3-FIX-FREEZE/. Return at most 150
words.

## Attempt 2 (coordinator note)

Attempt 1 left 177 paths staged. It stopped because `validate_orchestration.py` (line
287) requires a done audit's `decision` to be exactly a verdict. The coordinator had
written prose there for WP3-AUDIT-A, -B and -C. The board now records the bare verdicts,
with the details in `findings`.

For attempt 2:
1. Confirm that HEAD and origin/main are still a1cd566.
2. Confirm that the working tree still matches the expected set.
3. Recompute the digest; it must still be eeb417d3….
4. Re-stage the same explicit paths. ORCHESTRATION.json and this brief changed since
   attempt 1.
5. Rerun every check, one command per step.
6. View the images.
7. Record attempt 2 in a new evidence file, 02-checks.txt.

## Attempt 3 (coordinator note)

Attempt 2 stopped on the validator: "Dependency audit not PASS: WP3-LINKFIX". The
coordinator had listed the non-PASS audits as dependencies of WP3-LINKFIX; it now
depends on WP3-GATE instead. The coordinator has also checked the remaining validator
rules against the board.

Repeat the attempt 2 steps: re-stage the same explicit paths and rerun every check.
Record the result in a new evidence file, 03-checks.txt.

## Results

(Committer appends here.)

### Committer result (attempt 1): NOT COMMITTED (stopped on a failed check)

- HEAD before = origin/main = a1cd566e59253d19f53cfd5b3a81fd27a7e9a056; HEAD after: unchanged (no commit, no push).
- Node: v24.21.0 (portable, full path). Digest eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410 (matches).
- Staged count: 177 (explicit paths; the 177 staged files stay staged for the retry).
- Exit codes: git add 0; precommit 0 (PASS, 0 findings); diff --cached --check 0; JSON parse 0;
  validate_orchestration.py 1; check_recovery.py 1; validate_package.py --preflight 0.
- Blocker: validate_orchestration.py (and check_recovery.py, which runs it) fails with
  "Audit verdict missing: WP3-AUDIT-A" (validate_orchestration.py line 287: a done audit task needs
  a decision of PASS, FIX REQUIRED or NOT VERIFIED). The board ORCHESTRATION.json needs a
  correction by the coordinator; the committer may not edit it.
- Images not viewed (stopped before that step). No masking done.
- Evidence: handoff/delivery/evidence/WP3-FIX-FREEZE/.

### Committer result (attempt 2): NOT COMMITTED (stopped on a failed check)

- HEAD before = after = origin/main = a1cd566e59253d19f53cfd5b3a81fd27a7e9a056; no commit, no push.
- Digest eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410 (match); staged 177.
- precommit 0; diff --check 0; JSON parse 0; validate_orchestration.py 1.
- Blocker: validator says "Dependency audit not PASS: WP3-LINKFIX" (board task WP3-LINKFIX is a
  dependency of a done/staged task but its recorded decision is not PASS). Coordinator must fix the board.
- check_recovery, preflight and images not run. No masking. Evidence: evidence/WP3-FIX-FREEZE/02-checks.txt.
