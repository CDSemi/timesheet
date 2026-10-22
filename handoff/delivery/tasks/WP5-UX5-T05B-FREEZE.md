# WP5-UX5-T05B-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T05B-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T05B (done).
- **What this commit freezes.** Round-5 slice T05B, the Day editor:
  - the square desktop drawer;
  - a press outside closes it, with the discard guard;
  - the Partial leave sub-dialog (`LeaveDialog.tsx`);
  - the phone sheet's fixed Save, without Figures;
  - the docs/04 lines (+ vi).
- **Coordinator records it also carries:**
  - the T05A-FREEZE results and evidence;
  - the T05B record and evidence;
  - the T05B-PATHS lookup record;
  - the draft T06 brief;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  70f7800b9c1582cffee453ac0bc8c741418f6f99.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T05B-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`, NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO
    NULL-DEVICE REDIRECTS (`/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`,
    ALSO NOT IN `2>`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - **Staging rule:**
    - Name every path literally as an argument of plain `git add` calls, at most about 20
      per call. Each call is its own command.
    - Never use `--pathspec-from-file`, `xargs`, a list file, a glob, `git add -A` or `.`.
    - The exception: an evidence folder named below may be given as its directory path.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Index state at dispatch

Nothing is staged (lookup WP5-UX5-T05B-PATHS). Check this with
`git diff --cached --name-status` before you add anything. If anything is staged, stop and
report.

## Expected working-tree set outside handoff/ (12 paths: 11 modified, 1 new)

- **New (1):** `src/client/components/LeaveDialog.tsx`
- **Modified (11):**
  - `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
  - `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/styles.css`
  - `src/client/components/DayFieldsForm.tsx`, `src/client/components/leaveInputModel.ts`
  - `tests/client/leaveInputModel.test.ts`
  - `tests/e2e/controls.spec.ts`, `tests/e2e/day-editor.spec.ts`,
    `tests/e2e/focus-ring.spec.ts`

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- `package.json` or a lockfile;
- `scripts/precommit-check.mjs`;
- the validators;
- the AGENTS or CLAUDE files, or `.claude/`;
- any path under `src/server/`;
- a migration;
- a font or any other binary outside `handoff/`;
- a `zz-*` probe anywhere;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
a5dcb5a6e575b8ceae9fb79cc453b33898eb1202bdece5a5d9cbce03ad25b2db (868 files). **After the
commit, compute the digest of HEAD's tree with `git ls-tree`, as the WP5-UX5-T04-FREEZE
committer did.** It must equal the same value. A working-tree recomputation does not
replace this check.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T05A-FREEZE.md` (its Results);
  - `handoff/delivery/tasks/WP5-UX5-T05B.md` (the base and the Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T05A-FREEZE/checks.txt` and `commit-message.txt`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T05B/`: four `-synthetic.png` files;
  - `handoff/delivery/tasks/WP5-UX5-T05B-PATHS.md`;
  - `handoff/delivery/tasks/WP5-UX5-T06.md` (the draft brief; its "Base at dispatch"
    section is still empty);
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders and on `LeaveDialog.tsx`, with the rule of
`WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX5-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX5-*/`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- An email other than `@example.invalid` stops the commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T05B-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: empty.
4. The digest (a5dcb5a6…).
5. The set comparison, a `zz-*` search under `src/` and `tests/`, and the scans.
6. `git add` with the explicit paths.
7. `node scripts/precommit-check.mjs`.
8. `git diff --cached --check`.
9. A JSON parse of ORCHESTRATION.json and STATE.json.
10. `validate_orchestration.py`.
11. `check_recovery.py` (106 probes).
12. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
13. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test or docs file stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX5-T05B: Day editor closes on an outside press, partial-leave dialog

- feat(day-editor): the desktop drawer has square corners; the phone sheet keeps its top
  corners.
- feat(day-editor): a press outside the day columns, the drawer and dialogs closes the
  editor.
  - With unsaved changes it asks "Discard your changes?" first.
  - Buttons, links and fields keep their own action, so Today still moves the editor.
  - On a phone, a tap on the backdrop closes the sheet.
  - Focus returns to the day button.
- feat(day-editor): Partial leave opens in its own dialog.
  - Done changes only the draft; "Save day fields" saves it.
  - Cancel restores the draft, and Escape closes only the dialog.
  - Notes stay in the editor.
- feat(day-editor): on a phone, Day figures are not shown, and "Save day fields" stays
  fixed at the bottom of the sheet.
- docs(ux): the docs/04 Day editor lines (+ vi).
- test:
  - outside presses, the discard guard and controls;
  - the Partial leave dialog;
  - the phone foot and the absence of Figures;
  - the square drawer;
  - the leave summary helper.
- docs(handoff): the T05A-FREEZE results, the T05B record and evidence, the T05B-PATHS
  lookup, the draft T06 brief, the board and the checkpoint (+ vi).

Task: WP5-UX5-T05B (owner decisions F-7 a, B5 and the round-5 request; plan U5-23..U5-26)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: a5dcb5a6 (was 66574877)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T05B-FREEZE/commit-message.txt`. Leave it, checks.txt and
this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- every scan hit with its classification;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results
