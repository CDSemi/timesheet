# WP5-UX3-FIX3-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX3-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX3 (done).
- This commit freezes WP5-UX3-FIX3, the fixes for the WP5-UX3-AUDIT-A and WP5-UX3-AUDIT-B
  findings.
- It also carries the coordinator records since 7ce4e95:
  - the FIX2-FREEZE results and evidence;
  - the WP5-UX3-REGATE record and evidence;
  - the two area audits with their review pairs and evidence;
  - the FIX3 record and evidence;
  - the retargeted audit briefs;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk L (a large evidence set), novelty no. Records in English.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main.
  - Expected HEAD = origin/main = 7ce4e95a0c4477374e981132d93b11aedab2e384.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue. Otherwise stop and report.
  - Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`, NOT EVEN INTO A SCRATCH FILE), NO `| node`, NO `| python`, NO
    `node -e`, NO `python -c`. NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`,
    `head -n 0` OR `head -c`). NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`.
    NEVER `rm -r` OR `rm -rf`.**
  - Redirect output to a file in the task folder and read it with the Read tool.
  - Write files with the Write tool.
  - To check Node, run `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob), in the same shell call as your first `node --version`. It must print v24.x.
  - Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-FIX3-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (20 modified paths)

- `src/client/styles.css`.
- `src/client/components/`: `breakRowsModel.ts`, `ClockOutDialog.tsx`, `SessionDialog.tsx`,
  `dayEditorModel.ts`, `dayModel.ts`.
- `tests/client/`: `breakRowsModel.test.ts`, `dayEditorModel.test.ts`, `dayModel.test.ts`.
- `tests/e2e/`: `hover.spec.ts`, `shell.spec.ts`, `admin-status.spec.ts`,
  `day-editor.spec.ts`, `theme.spec.ts`.
- `docs/`: `04_UX_AND_SETTINGS.md` and `.vi.md`, `10_DECISIONS_AND_SOURCES.md` and `.vi.md`,
  `12_RELEASE_NOTES.md` and `.vi.md`.

If the working tree differs from this set, do not commit: report the exact difference and
stop.

These always stop the commit:
- any path under `src/server/`, `src/domain/` or `scripts/`;
- any other `docs/` file;
- AGENTS/CLAUDE files, `.claude/`, `package.json`, the lockfile or `vite.config.ts`;
- any deleted or untracked path outside `handoff/`.

If anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
d1d903cfb148d1bcc74131af3e1aeebed0f1892143e0ede3950ddee335b839ca (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (8):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX2-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-REGATE.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-A.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-B.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`.
- **New records (6):**
  - `handoff/delivery/tasks/WP5-UX3-FIX3.md`;
  - `handoff/delivery/WP5_UX3_REVIEW_A.md` and `.vi.md`;
  - `handoff/delivery/WP5_UX3_REVIEW_B.md` and `.vi.md`;
  - this brief, as it stands before you append results.
- **New evidence folders (5),** each under `handoff/delivery/evidence/`:
  - `WP5-UX3-FIX2-FREEZE/`;
  - `WP5-UX3-REGATE/`;
  - `WP5-UX3-AUDIT-A/`;
  - `WP5-UX3-AUDIT-B/`;
  - `WP5-UX3-FIX3/`.

  Count each folder with the Glob tool first and report the counts. Stage a folder only if
  every name ends in `.txt` or `-synthetic.png`. Probe copies such as `zz-*.spec.ts.txt` or
  `*.sh.txt` are text evidence and allowed. Any other name stops the commit; report it.

Report the staged total per group. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-FIX3-FREEZE/` stay unstaged.

**Privacy for the large evidence set.** The precommit check scans every staged file.
- A `profile-path` finding in an evidence log may be masked as your profile allows: replace
  only the account segment with `<user>`, re-stage, and record each file.
- Any other finding stops the commit and leaves the index staged: an email address that is
  not the full synthetic example.invalid form, a secret-like value, or a non-synthetic
  image. Report the file, line and rule.

**Other modified tracked handoff files.**
- Record `git diff --stat` and the `--ignore-cr-at-eol --ignore-space-at-eol` stat (names
  and counts only).
- A line-ending-only change: leave it unstaged and continue.
- A content change: stop.

**Any other changed or untracked path stops the commit**, for example:
- a file named `nul`;
- any `.raw`, `.log`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf` or database file;
- any image not ending in `-synthetic.png`;
- any `.md` under `evidence/`.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every step
in `handoff/delivery/evidence/WP5-UX3-FIX3-FREEZE/checks.txt` (required).

1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (d1d903cf…, 833 files).
4. `git add` with the explicit paths, as its own command and with no redirect. Folders may
   be given as explicit folder paths.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file in the task folder.
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (d1d903cf…).

**Allowed fixes:**
- Trailing whitespace or a blank line at EOF in a task or review record outside
  `evidence/`: fix exactly those lines, re-stage, and record the file.
- A whitespace finding in a source, test or docs file, or inside `evidence/`: do not fix
  it. Stop and report the file and line, leaving the index staged.

If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-FIX3: round-3 audit findings

- fix(client):
  - the keyboard focus ring stays visible under the pointer on the sheet's date button,
    Category picker, phone day button and button links;
  - every hover look is gated to devices that can hover;
  - the identity button is 44px high with a coarse pointer;
  - the Sign out entry has the icon gap and alignment of the other entries;
  - the phone Administration delivery badge and fault code wrap inside the card;
  - Check out sends the empty unconfirmed list when every saved break row was removed, with
    a note in the dialog;
  - "Confirm breaks" lists the suggested breaks that lie inside the session;
  - the batch stale-version alert says "categories".
- test:
  - the focus ring under the pointer;
  - a stylesheet-wide hover gating scan and a phone tap check;
  - coarse-pointer bar heights;
  - Sign out spacing;
  - More-panel Escape focus return;
  - phone Administration overflow;
  - the Check out removal and the "Confirm breaks" rows;
  - the theme contrast test survives a host stall without weaker assertions.
- docs:
  - docs/04 (frame contrast limit under the scrim, Check out removal);
  - docs/10 (E-1 Check out removal, "Confirm breaks");
  - docs/12 (Check out refusals) (+ vi).
- docs(handoff):
  - the WP5-UX3-REGATE record and evidence;
  - the WP5-UX3-AUDIT-A and -B records, review pairs and evidence;
  - the FIX3 record and evidence;
  - audit briefs, board and checkpoint (+ vi).

Task: WP5-UX3-FIX3 (WP5-UX3-AUDIT-A F-UX3A-01..06, WP5-UX3-AUDIT-B F-UX3B-1..2)
Gate: WP5-UX3-REGATE PASS on 7ce4e95; WP5-UX3-REGATE2 next
Audit: WP5-UX3-AUDIT-A and -B FIX REQUIRED on 7ce4e95; rechecks pending
Digest: d1d903cf (was 262138e0)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group and per evidence folder;
- other modified handoff files;
- every check with its exit code;
- any fix, masking or stop reason.

## Results
