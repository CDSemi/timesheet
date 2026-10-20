# WP5-UX3-FIX5-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX5-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX5 (done).
- This commit freezes the test-only WP5-UX3-FIX5 and the coordinator records since 8629441:
  - the FIX4-FREEZE results and evidence;
  - the WP5-UX3-REGATE3 record and evidence;
  - the FIX5 record and evidence;
  - the rewritten AUDIT-INT brief;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main.
  - Expected HEAD = origin/main = 86294412ce15e221f6e0fbc782f0b52a332352be.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue. Otherwise stop.
  - Push after the commit. Create no tag.
- Runtime: the same as `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md` "Runtime", with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX5-FREEZE`.
  - The capitalised rules still apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES
    INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS, NO `rm -r`.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (1 modified path)

`tests/e2e/day-editor.spec.ts` only. Any other path outside `handoff/` stops the commit.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (5):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`.
- **New records (3):**
  - `handoff/delivery/tasks/WP5-UX3-REGATE3.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX5.md`;
  - this brief, as it stands before you append results.
- **New evidence folders (3),** each under `handoff/delivery/evidence/`:
  `WP5-UX3-FIX4-FREEZE/`, `WP5-UX3-REGATE3/` and `WP5-UX3-FIX5/`.

  Count each folder with Glob first. Stage a folder only if every name ends in `.txt` or
  `-synthetic.png`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX3-FIX5-FREEZE/`
stay unstaged.

**Rules carried over from the earlier freeze briefs:**
- A privacy `profile-path` finding in an evidence log may be masked: replace the account
  segment with `<user>`, then re-stage. Any other privacy finding stops the commit.
- Other modified tracked handoff files: a line-ending-only change stays unstaged; a content
  change stops the commit.
- Any other changed or untracked path stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX3-FIX5-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The working-tree digest (95323f2d…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in the spec or in `evidence/`: stop and report.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-FIX5: make the Confirm-breaks-today test hour-independent

- test: the "Confirm breaks" test for a session ended today uses its own synthetic person in
  a reporting zone where it is midday now, and asserts the session lies on the server's
  today. It passes at any hour on both projects and still catches a past-day gate.
- docs(handoff):
  - the FIX4 freeze results;
  - WP5-UX3-REGATE3 (FAIL on this test only) and its evidence;
  - the FIX5 record and evidence;
  - the AUDIT-INT brief;
  - board and checkpoint (+ vi).

Task: WP5-UX3-FIX5 (WP5-UX3-REGATE3 item 4)
Gate: WP5-UX3-REGATE3 FAIL on 8629441; WP5-UX3-REGATE4 next
Audit: WP5-UX3-AUDIT-INT pending
Digest: 95323f2d (was 245e9459)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group and per evidence folder;
- every check with its exit code;
- any fix, masking or stop reason.

## Results

- Pre-HEAD 86294412ce15e221f6e0fbc782f0b52a332352be (= origin/main). Commit and post-HEAD
  5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d, pushed to main, remote SHA identical.
- Digest before add and on the new HEAD via git ls-tree: 95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f (833 files).
- Staged 260: 1 outside handoff, 5 modified records, 3 new records (incl. this brief), 251
  evidence files. Evidence folders: FIX4-FREEZE 2, REGATE3 227, FIX5 22. All names .txt.
- Checks, all exit 0: node v24.21.0; precommit-check PASS (260 files, 0 findings);
  diff --cached --check; JSON parse; validate_orchestration PASS; check_recovery PASS;
  validate_package --preflight PASS; ls-tree digest matches.
- No masking, no whitespace fix, no stop. Evidence in evidence/WP5-UX3-FIX5-FREEZE/ (unstaged).
