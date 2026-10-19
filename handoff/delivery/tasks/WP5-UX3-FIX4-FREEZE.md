# WP5-UX3-FIX4-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX4-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX4 (done).
- This commit freezes WP5-UX3-FIX4, the fixes for the WP5-UX3-AUDIT-A2 and -B2 findings.
- It also carries the coordinator records since ceb86b6:
  - the GOV2 freeze results;
  - the GOV2 gate and audit (accepting the AGENTS change);
  - REGATE2;
  - the rechecks A2 and B2 with their review pairs;
  - the FIX4 record;
  - the evidence of all of these;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main.
  - Expected HEAD = origin/main = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue. Otherwise stop and report.
  - Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe`, and never open an interactive shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN INTO A SCRATCH FILE), NO `| node`, NO `| python`, NO `node -e`, NO
    `python -c`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`. NEVER `rm -r`.**
  - Redirect output to a file in the task folder and read it with the Read tool.
  - Write files with the Write tool.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`,
    in the same shell call as your first `node --version`. It must print v24.x.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-FIX4-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (8 modified paths)

- `src/client/components/AppShell.tsx`, `src/client/styles.css` and
  `src/client/components/sessionModel.ts`.
- `tests/e2e/hover.spec.ts`, `tests/e2e/shell.spec.ts` and `tests/e2e/day-editor.spec.ts`.
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.

If the working tree differs from this set, do not commit: report the exact difference and
stop.

These always stop the commit:
- any path under `src/server/`, `src/domain/` or `scripts/`;
- AGENTS/CLAUDE files, `.claude/`, `package.json`, the lockfile or `vite.config.ts`;
- any other docs file;
- any deleted or untracked path outside `handoff/`.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
245e9459a06c7d36ceb780d5e0de379be74303081d1d93b24c5469c24eca3f90 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (8):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV2-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-REGATE2.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-A2.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-B2.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`.
- **New records (10):**
  - `handoff/delivery/tasks/WP5-UX3-GOV2-GATE.md` and `WP5-UX3-GOV2-AUDIT.md`;
  - `handoff/delivery/GOV_UX3_REVIEW2.md` and `.vi.md`;
  - `handoff/delivery/WP5_UX3_REVIEW_A2.md` and `.vi.md`;
  - `handoff/delivery/WP5_UX3_REVIEW_B2.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX4.md`;
  - this brief, as it stands before you append results.
- **New evidence folders (7),** each under `handoff/delivery/evidence/`:
  `WP5-UX3-GOV2-FREEZE/`, `WP5-UX3-GOV2-GATE/`, `WP5-UX3-GOV2-AUDIT/`, `WP5-UX3-REGATE2/`,
  `WP5-UX3-AUDIT-A2/`, `WP5-UX3-AUDIT-B2/` and `WP5-UX3-FIX4/`.

  Count each folder with Glob first and report the counts. Stage a folder only if every
  name ends in `.txt` or `-synthetic.png`. Probe copies such as `*.spec.ts.txt`, `*.sh.txt`
  and `*.py.txt` are allowed. Any other name stops the commit; report it.

Report the staged total per group. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-FIX4-FREEZE/` stay unstaged.

**Privacy.** The precommit check scans every staged file.
- A `profile-path` finding in an evidence log may be masked: replace only the account
  segment with `<user>`, re-stage, and record each file.
- Any other finding stops the commit and leaves the index staged: an email address that is
  not the full synthetic example.invalid form, a secret-like value, or a non-synthetic
  image. Report the file, line and rule.

**Other modified tracked handoff files.**
- Record their names.
- A line-ending-only change: leave it unstaged.
- A content change: stop.

**Any other changed or untracked path stops the commit.**

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every step
in `handoff/delivery/evidence/WP5-UX3-FIX4-FREEZE/checks.txt` (required).

1. `node --version`.
2. HEAD and origin/main.
3. The working-tree digest (245e9459…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`; record its file count.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:**
- Trailing whitespace or a blank line at EOF in a task or review record outside
  `evidence/`: fix exactly those lines, re-stage, and record the file.
- Any whitespace finding in a source, test or docs file, or in `evidence/`: stop and
  report.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-FIX4: round-3 recheck findings

- fix(client):
  - the phone More panel closes when keyboard focus leaves the tab bar, so no focused
    control hides behind it;
  - the Sign out entry lines up with the other account entries.
- test:
  - the focus ring under the pointer for button links and phone tabs;
  - the hover scan judges media by whether it can match on a touch device;
  - Tab past Sign out closes More;
  - the Check out removal note is absent on a plain Check out and when rows are kept;
  - "Confirm breaks" on a session ended today.
- docs: docs/10 main chunk figure (+ vi); a test-only comment on `suggestedRows`.
- docs(handoff):
  - the GOV2 gate and audit (AGENTS change accepted);
  - WP5-UX3-REGATE2;
  - the rechecks WP5-UX3-AUDIT-A2 and -B2 with review pairs;
  - the FIX4 record;
  - board and checkpoint (+ vi).

Task: WP5-UX3-FIX4 (WP5-UX3-AUDIT-A2 F-UX3A2-1..3, WP5-UX3-AUDIT-B2 F-UX3B2-1)
Gate: WP5-UX3-REGATE2 PASS on ceb86b6; WP5-UX3-REGATE3 next
Audit: WP5-UX3-AUDIT-A2 and -B2 FIX REQUIRED; rechecks pending
Digest: 245e9459 (was b35dddd5)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group and per evidence folder;
- every check with its exit code;
- any fix, masking or stop reason.

## Results
