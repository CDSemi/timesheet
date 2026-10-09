# WP5-UX-CKPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-CKPT; package WP5; kind commit;
  attempt 1; depends on WP5-UX-PLAN (done).
- This is a checkpoint commit before a planned stop (the owner must answer E-1..E-7). It
  changes no source. It stores the owner-requested UI change round plan, its static
  mockup and synthetic screenshots, and the coordinator state.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L (handoff records and synthetic images only), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  fe67f9400e59ae7c10b9ac8871b4dea10b83860d. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-CKPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be changed, staged or untracked. Any such path stops the
commit; report it. If anything is already staged before you start, report it first.

Digest: `node scripts/source-digest.mjs` (Node 24) on the working tree must equal
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61. Also record the
`git ls-tree` form of HEAD; it must match too.

## Handoff files to stage

Stage these paths explicitly. Each may be new or modified; report which.
- `handoff/delivery/ORCHESTRATION.json`;
- `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
- `handoff/NEXT_ACTION.md` and `.vi.md`;
- `handoff/delivery/tasks/WP5-UX-PLAN.md`;
- this brief, `handoff/delivery/tasks/WP5-UX-CKPT.md`, as it stands before you append
  results;
- every file in `handoff/delivery/design/WP5-UX/`: `mockup.html` and exactly these eight
  synthetic screenshots: `current-timesheet-desktop-synthetic.png`,
  `current-timesheet-mobile-synthetic.png`, `current-day-editor-desktop-synthetic.png`,
  `mockup-a1-light-synthetic.png`, `mockup-a1-dark-synthetic.png`,
  `mockup-a2-light-synthetic.png`, `mockup-a3-light-synthetic.png`,
  `mockup-a4-light-synthetic.png`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX-CKPT/` stay
unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the eight listed above, or any image whose basename lacks
  `synthetic`;
- `mail-capture` or `private-data` content.

**Privacy check:** use the Grep tool on `mockup.html` and `WP5-UX-PLAN.md` for email
addresses outside `example.invalid`, user-profile paths and password, token, secret or
setup-key values. Record only the counts, and never print a match.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-CKPT/checks.txt`.
1. `node --version`.
2. The working-tree digest and the `git ls-tree` digest of HEAD. Both must be
   150420e7….
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  `WP5-UX-PLAN.md` or `mockup.html`, fix exactly those lines, re-stage the file and
  record the file name and line numbers.
- If the precommit check blocks a user-profile path or a non-synthetic email address in
  `WP5-UX-PLAN.md` or `mockup.html`, stop and report the file, line and rule (do not
  edit them; the coordinator routes the fix).

When to stop:
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add WP5 UX redesign plan and Excel-style timesheet mockup

- docs(handoff):
  - record the owner's 2026-10-08 UI redesign request as a WP5 change round before
    pilot activation;
  - WP5-UX-PLAN results: current UI diagnosis, Excel workbook layout map, design
    direction, owner decisions E-1..E-7, slicing WP5-UX-T01..T06, gate and audit plan;
  - static self-contained mockup (artboards A1-A7, synthetic data) and eight synthetic
    screenshots of the current UI and the mockup;
  - board, checkpoint (+ vi) and NEXT_ACTION (+ vi) point to the owner's E-1..E-7
    answers.

Task: WP5-UX-CKPT (checkpoint commit; no source change)
Digest: 150420e7 (unchanged)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Attempt 2 instructions (coordinator, 2026-10-08)

Attempt 1 stopped correctly on three unlisted paths. Decision:
- **Add to the stage list** (records of the done task GOV-RECOVERY-ACCEPT; the board
  already lists the evidence file):
  - `handoff/delivery/tasks/GOV-RECOVERY-ACCEPT.md`;
  - `handoff/delivery/evidence/GOV-RECOVERY-ACCEPT/commit-message.txt`.
- **Leave unstaged and out of the commit:** `handoff/delivery/WP5_PILOT_PACKET.vi.md`. Its
  change has an unknown origin (possibly the owner's own edit during pilot review).
  Do not stage, open, restore or edit it. Its presence as an unstaged modification is
  expected and does not stop the commit. Record it in your results as left unstaged.
- Stage this brief as it stands when attempt 2 starts (including the attempt-1 stop
  note). All other rules, checks and stop conditions are unchanged. Any other unlisted
  path still stops the commit.
- Add one line to the commit message body: "Include the GOV-RECOVERY-ACCEPT result
  record and its commit-message evidence."

## Results

STOPPED before staging (attempt 1). Node v24.21.0. HEAD = origin/main =
fe67f9400e59ae7c10b9ac8871b4dea10b83860d on main; no merge/rebase; nothing staged. No commit,
no push; post-HEAD unchanged.

Unlisted changed/untracked paths found (all under handoff/, not in the brief's stage list):
- ` M handoff/delivery/WP5_PILOT_PACKET.vi.md`
- ` M handoff/delivery/tasks/GOV-RECOVERY-ACCEPT.md`
- `?? handoff/delivery/evidence/GOV-RECOVERY-ACCEPT/commit-message.txt`

The brief says any other changed or untracked path stops the commit. The coordinator must
either add these to the stage list or tell the committer to leave them unstaged.
