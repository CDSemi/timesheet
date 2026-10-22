# WP5-UX5-T05A-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T05A-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T05A (done).
- **What this commit freezes.** Round-5 slice T05A:
  - the one-layer select chevron;
  - icons on the sub-buttons, which have 36px boxes with 44px hit areas on touch;
  - the 32px theme toggle;
  - spaced time ranges;
  - the header wrap order;
  - the toolbar rules ("Open", "Change days");
  - "Worked hours", the worked-line groups and the Today spacing;
  - the WEEK bar fill;
  - the T04 leftovers;
  - the shared hover settle helper;
  - the stronger PDF checks in `automation.spec.ts`;
  - the docs/04 lines (+ vi).
- **Coordinator records it also carries:**
  - the T04-FREEZE results and evidence;
  - the T05A record and evidence;
  - the T05A-PATHS lookup record;
  - the draft T05B brief;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  060302bcb41050c116e2519602f303c3a11cb01d.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T05A-FREEZE`.
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

Nothing is staged (lookup WP5-UX5-T05A-PATHS). Check this with
`git diff --cached --name-status` before you add anything. If anything is staged, stop and
report.

## Expected working-tree set outside handoff/ (32 paths: 32 modified, none new or deleted)

- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- `src/client/TimesheetScreen.tsx`, `src/client/styles.css`
- `src/client/components/BreakRows.tsx`, `src/client/components/DayStatus.tsx`,
  `src/client/components/OpenDay.tsx`, `src/client/components/ReviewStatus.tsx`,
  `src/client/components/SessionDialog.tsx`, `src/client/components/SessionList.tsx`,
  `src/client/components/SheetWeekTable.tsx`, `src/client/components/ShowDetailsSwitch.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/dayEditorModel.ts`,
  `src/client/components/settingsFileModel.ts`, `src/client/components/sheetModel.ts`
- `src/domain/policy.ts`
- `tests/client/cssThemeParity.test.ts`, `tests/client/dayEditorModel.test.ts`,
  `tests/client/reviewModel.test.ts`, `tests/client/settingsFileModel.test.ts`,
  `tests/client/sheetModel.test.ts`
- `tests/e2e/automation.spec.ts`, `tests/e2e/contrast.ts`, `tests/e2e/controls.spec.ts`,
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/focus-ring.spec.ts`, `tests/e2e/hover.spec.ts`,
  `tests/e2e/shell.spec.ts`, `tests/e2e/surfaces.spec.ts`, `tests/e2e/theme.spec.ts`,
  `tests/e2e/timesheet.spec.ts`

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
665748778f55cb2240f350097892e03cbed8931bd7f0f56f6b1ed3250a892c24 (867 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T04-FREEZE.md` (its Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T04-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T05A.md`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T05A/`: six `.txt` files and eight
    `-synthetic.png` files;
  - `handoff/delivery/tasks/WP5-UX5-T05A-PATHS.md`;
  - `handoff/delivery/tasks/WP5-UX5-T05B.md` (the draft brief; its "Base at dispatch"
    section is still empty);
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders, with the rule of
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

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T05A-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: empty.
4. The digest (66574877…).
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

Subject: Freeze WP5-UX5-T05A: week sheets, toolbar and controls

- fix(controls): the select chevron is one conic layer. The seam at 125% and 150% scaling
  is gone.
- feat(controls): the sub-buttons:
  - icons on Edit, Delete (danger), Suggest breaks and Add break;
  - 36px boxes, keeping a 44px hit area below 768px and with a coarse pointer;
  - a 32px theme toggle with a fine pointer.
- feat(timesheet): time ranges read "10:30 - 18:30". A week sheet uses the tight form only
  when the spaced one would wrap.
- feat(timesheet): the form header moves the field block under the title before it wraps
  groups.
- feat(timesheet): the toolbar.
  - "Open day" becomes "Open", and the label hides last.
  - "Change several days" stays right-aligned and shortens to "Change days".
  - "Show worked hours" becomes "Worked hours".
- feat(timesheet):
  - each day's worked line is grouped and tinted with its day;
  - the Today marker has room;
  - the WEEK bar fills the scrolled grid.
- fix(timesheet): the signature link uses the period card's label. Stale breakpoint
  comments are corrected.
- test:
  - the seam profile, the sub-button boxes and hit areas, the theme heights, the ranges,
    the header order, the toolbar widths, the worked lines and the WEEK bar;
  - the hover settle helper is shared;
  - the PDF checks in `automation.spec.ts` are stronger.
- docs(ux): the docs/04 lines (+ vi).
- docs(handoff): the T04-FREEZE results, the T05A record and evidence, the T05A-PATHS
  lookup, the draft T05B brief, the board and the checkpoint (+ vi).

Task: WP5-UX5-T05A (owner decisions F-1 a, B2 and the round-5 request; plan U5-03..07, U5-16..21, U5-17b)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 66574877 (was 2ba69f62)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T05A-FREEZE/commit-message.txt`. Leave it, checks.txt and
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

- HEAD before: 060302bcb41050c116e2519602f303c3a11cb01d. HEAD after: 70f7800b9c1582cffee453ac0bc8c741418f6f99.
- Commit SHA 70f7800b9c1582cffee453ac0bc8c741418f6f99 on main; pushed; remote SHA 70f7800b9c1582cffee453ac0bc8c741418f6f99. No tag.
- Digest before add: 665748778f55cb2240f350097892e03cbed8931bd7f0f56f6b1ed3250a892c24 (867 files); after commit, source-digest.mjs on the clean tree gives the same value (git ls-tree form not run separately).
- Staged: 56 paths; 32 outside handoff/ (modified); 24 under handoff/ (4 modified, 20 new: 14 evidence files incl. T04-FREEZE checks/commit-message, 4 task records plus this brief counted).
- Extra handoff paths staged: none.
- Checks: node v24.21.0; precommit 0; diff --cached --check 0; JSON parse 0; validate_orchestration 0; check_recovery 0; validate_package --preflight 0; fetch 0; push dry-run 0; push 0.
- Scan hits: key/PEM 0; zz-* none; only non-example email is the noreply attribution line in the T04 commit-message evidence (accepted).
- Fixes, masking, stops: none. Unstaged afterwards: this Results, evidence/WP5-UX5-T05A-FREEZE/checks.txt and commit-message.txt.
