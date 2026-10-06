# WP5-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-ACCEPT; package WP5; kind commit;
  attempt 1; depends on WP5-ACCREC.
- This commit records the WP5 acceptance and changes no source. The accepted source is
  014bd47a8d906c944d2781eba4f2b91c5a532419, digest
  150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61 (779 files). It was
  accepted on:
  - WP5-REGATE (full gate, 9bcdd88) and WP5-REGATE2 (documentation delta, 014bd47);
  - the closing independent recheck WP5-RECHECK, PASS.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (many evidence files and probe sources), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  014bd47a8d906c944d2781eba4f2b91c5a532419. If either differs, stop and report.
- Push after the commit. Create no tag; the release declaration is an owner decision
  (D-14).
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be changed, staged or untracked. Any such path stops the
commit; report it. If anything is already staged before you start, report it first.

Digest: `node scripts/source-digest.mjs` (Node 24) on the working tree must equal
150420e7…. Also record the `git ls-tree` form of HEAD; it must match too.

## Handoff files to stage

Stage these paths explicitly. Each may be new or modified; report which.
- `handoff/delivery/WP5_RECHECK.md` and `.vi.md`;
- `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
- `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
- `handoff/delivery/STATE.json` and `handoff/delivery/ORCHESTRATION.json`;
- `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
- `handoff/NEXT_ACTION.md` and `.vi.md`;
- `handoff/delivery/tasks/`: `WP5-FIXD2-FREEZE.md`, `WP5-REGATE2.md`, `WP5-PKTID.md`,
  `WP5-RECHECK.md`, `WP5-ACCREC.md`, and this brief as it stands before you append
  results;
- every file in these folders under `handoff/delivery/evidence/`: `WP5-FIXD2-FREEZE/`,
  `WP5-REGATE2/`, `WP5-PKTID/`, `WP5-RECHECK/` and `WP5-ACCREC/`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-ACCEPT/` stay
unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`;
- `mail-capture` or `private-data` content.

**Secrets check:** use the Grep tool on the staged evidence for unmasked password,
token, secret or setup-key values. Record only the count, and never print a match.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-ACCEPT/checks.txt`.
1. `node --version`.
2. The working-tree digest and the `git ls-tree` digest of HEAD. Both must be
   150420e7….
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check. Record its file count.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line, re-stage it and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under the listed folders, replace each such token with `<email>` or `<user>` in
  that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record WP5 acceptance: software ready at 014bd47, pilot packet for owner review

- docs(handoff):
  - WP5-REGATE2 PASS on 014bd47, a documentation delta: the 230 `dist/` files are
    identical, verify 1759, AC-13 passes;
  - WP5-RECHECK PASS with no findings (+ vi), with evidence;
  - the pilot packet identity is refreshed (014bd47, 150420e7);
  - the WP5_HANDOFF acceptance record (+ vi);
  - STATE marks WP5 passed with its carried risks;
  - NEXT_ACTION and the checkpoint point to GOV-RECOVERY and the owner's pilot review.

Task: WP5-ACCEPT (WP5 acceptance record; no source change)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- new versus modified paths;
- the secrets Grep count;
- the check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
- Pre-HEAD 014bd47, commit dd0c7d1a9ddde1db1af46bc33a446f0e8c17e4fc, pushed yes, remote SHA same; 74 staged (60 new, 14 modified); secrets 0; all checks exit 0; no blockers.
