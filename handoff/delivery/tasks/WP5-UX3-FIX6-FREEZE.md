# WP5-UX3-FIX6-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX6-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX6 (done).
- This commit freezes the one-line test fix WP5-UX3-FIX6 and the coordinator records since
  5c101c1:
  - the FIX5-FREEZE results and evidence;
  - WP5-UX3-REGATE4;
  - the WP5-UX3-DIAG1 diagnosis;
  - the FIX6 record;
  - the AUDIT-INT brief;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d.
  Push after the commit; create no tag.
- Runtime: the same as `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md` "Runtime", with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX6-FREEZE`.
  - The capitalised rules still apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES
    INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS, NO `rm -r`.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (1 modified path)

`tests/e2e/hover.spec.ts` only. Any other path outside `handoff/` stops the commit.

Recompute the digest with Node 24 immediately before `git add`. It must equal
507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (5):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX5-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`.
- **New records (4):**
  - `handoff/delivery/tasks/WP5-UX3-REGATE4.md`;
  - `handoff/delivery/tasks/WP5-UX3-DIAG1.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX6.md`;
  - this brief, as it stands before you append results.
- **New evidence folders (4),** each under `handoff/delivery/evidence/`:
  `WP5-UX3-FIX5-FREEZE/`, `WP5-UX3-REGATE4/`, `WP5-UX3-DIAG1/` and `WP5-UX3-FIX6/`.

  Count each folder with Glob first. Stage a folder only if every name ends in `.txt` or
  `-synthetic.png`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX3-FIX6-FREEZE/`
stay unstaged.

**Rules carried over from the earlier freeze briefs:**
- A privacy `profile-path` finding in an evidence log may be masked: replace the account
  segment with `<user>`, then re-stage. Any other privacy finding stops the commit.
- Any other changed or untracked path stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX3-FIX6-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (507de97c…).
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

Subject: Freeze WP5-UX3-FIX6: fix a layout-swap race in a hover test

- test: the phone day-button check in the focus-ring-under-pointer test uses the
  phone-table-only class, so it cannot catch the desktop button before the media-query
  layout swap.
- docs(handoff):
  - the FIX5 freeze results;
  - WP5-UX3-REGATE4 (FAIL on item 2) and the WP5-UX3-DIAG1 diagnosis (two host buffer
    errors, one test race) with their evidence;
  - the FIX6 record;
  - the AUDIT-INT brief;
  - board and checkpoint (+ vi).

Task: WP5-UX3-FIX6 (WP5-UX3-DIAG1 failure 2)
Gate: WP5-UX3-REGATE4 FAIL on 5c101c1; WP5-UX3-REGATE5 next
Audit: WP5-UX3-AUDIT-INT pending
Digest: 507de97c (was 95323f2d)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts;
- every check with its exit code;
- any fix, masking or stop reason.

## Results

STOPPED, no commit. Pre-HEAD = origin/main = 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d; post-HEAD unchanged; not pushed.
- Digest 507de97c (833 files) matched before add; 88 paths staged (stay staged).
- precommit-check exit 0; diff --cached --check exit 0; JSON parse exit 0.
- validate_orchestration.py exit 1: "Gate/audit lacks digest/execution evidence: WP5-UX3-REGATE4"
  (validator line 305: the REGATE4 board entry needs a 64-hex source_digest and evidence).
- check_recovery, validate_package, commit and ls-tree digest not run.
- No fix, no masking. Details: evidence/WP5-UX3-FIX6-FREEZE/checks.txt.

### Attempt 2

Pre-HEAD 5c101c1; commit 8e557100d16b6b6eb86a48e00276835761aabfdf; pushed (5c101c1..8e55710
on main); remote SHA 8e557100d16b6b6eb86a48e00276835761aabfdf.
- Digest before add and ls-tree digest of HEAD: 507de97c (833 files) both.
- 88 paths staged (the brief, with the attempt-1 Results, was staged; attempt 2 text is not).
- Exits: precommit 0, diff --cached --check 0, JSON parse 0, validate_orchestration 0,
  check_recovery 0 (106 probes), validate_package --preflight 0, commit 0, push 0.
- No fix, no masking.
