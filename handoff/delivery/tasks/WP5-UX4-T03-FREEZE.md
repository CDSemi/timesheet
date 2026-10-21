# WP5-UX4-T03-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T03-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-T03 (done).
- **What this commit freezes.** The round-4 session dialog slice:
  - edit the start of a running session (client only);
  - the zone first;
  - the "Today" and "Now" links in the input zone;
  - aligned break rows;
  - save errors in their own alert dialog, in the session and Check out dialogs;
  - docs/04 and docs/10 (+ vi).
- **Coordinator records it also carries:**
  - the T02-FREEZE results and evidence;
  - the T03 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  b7cc06352687d1bc8cd6953b284915584a21e4fd.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-T03-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (including
    `/dev/stdout`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (21 paths: 20 modified, 1 new)

- **client components:**
  - modified: `src/client/components/SessionDialog.tsx`, `ClockOutDialog.tsx`,
    `LocalTimeField.tsx`, `BreakRows.tsx`, `sessionModel.ts`, `breakRowsModel.ts`,
    `dayEditorModel.ts`, `sheetModel.ts`;
  - new: `src/client/components/AlertDialog.tsx`.
- **client, other:** `src/client/DayEditor.tsx`, `src/client/styles.css`.
- **unit tests:** `tests/client/sessionModel.test.ts`, `breakRowsModel.test.ts`,
  `dayEditorModel.test.ts`.
- **integration:** `tests/integration/clock-out-breaks.test.ts`.
- **e2e:** `tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts`.
- **docs:** `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
  `.vi.md`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- a migration;
- a `package.json` or lockfile change;
- anything under `scripts/`;
- the AGENTS or CLAUDE files, or `.claude/`;
- any server path;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
e3c7016ba45e0d5e9085071c87258cecdbd6c0a6827b144b6b7cbbaa542129d3 (840 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T02-FREEZE.md`, which now has its Results.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T02-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX4-T03.md`;
  - this brief, as it stands before you append results;
  - the folder `handoff/delivery/evidence/WP5-UX4-T03/`, 18 files: 12 `.txt` and
    6 `-synthetic.png`.

Count the folder with Glob. Every evidence file name must end in `.txt` or
`-synthetic.png`.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX4-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX4-*/`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX4-T03-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (e3c7016b…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test or docs file stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-T03: running-session edit, session dialog and save alerts

- feat(ui): the start of a running session can be edited.
  - The dialog shows "No end yet: this session is running" with "Set an end instead",
    which is hidden in a shared view.
  - Saving keeps the session open and leaves breaks to be confirmed at Check out.
  - The session card says "Checked in" while the session runs.
- feat(ui): in the session dialog, the input zone comes first. "Today" and "Now" links sit
  right-aligned under each date and time; they use the dialog's input zone, never the
  device zone.
- fix(ui): break rows use fixed column slots, so new, suggested and saved rows line up; the
  time slot no longer clips "12:00:00 AM".
- feat(ui): a failed save opens an alert dialog, "This session was not saved", in the
  session and Check out dialogs; focus then returns to the first marked row or Save.
- test: unit tests for zones and DST, an integration oracle (start edit then Check out),
  e2e for each item, and the alert in both dialogs.
- docs: docs/04 and docs/10 (+ vi).
- docs(handoff): the T02-FREEZE results, the T03 record and evidence, the board and the
  checkpoint (+ vi).

Task: WP5-UX4-T03 (U4-11 to U4-15; owner round-4 request and F-5: Today/Now right-aligned)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: e3c7016b (was 04e16199)

Save the final message as `handoff/delivery/evidence/WP5-UX4-T03-FREEZE/commit-message.txt`.
Leave it, checks.txt and this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- Pre-HEAD b7cc06352687d1bc8cd6953b284915584a21e4fd (= origin/main). Post-HEAD / commit
  cda9c5172b06d3651e94e75ff30e9b1edfae382e, pushed to main, remote SHA identical.
- Digest before add and on the new HEAD via git ls-tree:
  e3c7016ba45e0d5e9085071c87258cecdbd6c0a6827b144b6b7cbbaa542129d3 (840 files).
- Staged 47: 21 outside handoff, 4 modified handoff records, 2 T02-FREEZE evidence files,
  2 task records (T03 and this brief), 18 T03 evidence files (12 .txt, 6 -synthetic.png).
  No extra handoff paths.
- Checks, all exit 0: node v24.21.0; precommit-check PASS (47 files, 0 findings);
  diff --cached --check; JSON parse; validate_orchestration PASS; check_recovery PASS (106);
  validate_package --preflight PASS; ls-tree digest matches.
- No masking, no whitespace fix, no stop. Evidence in evidence/WP5-UX4-T03-FREEZE/ (unstaged).
