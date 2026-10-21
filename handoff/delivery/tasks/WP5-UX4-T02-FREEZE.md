# WP5-UX4-T02-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T02-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-T02 (done, after Addendum 1).
- **What this commit freezes.** The round-4 Day editor slice:
  - the non-modal edge drawer from 768px;
  - switch and unselect by day button;
  - one discard guard on every route that moves or closes the open day;
  - square edge corners;
  - the content-based beside/floating rule (1330px) that replaces the 1360px literal;
  - a deterministic Confirm-breaks test;
  - docs/04 and docs/10 (+ vi).
- **Coordinator records it also carries:**
  - the T01-FREEZE recon result (the owner's manual commit 213bbdc);
  - the T02 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  213bbdc8a013c96e7144d59dd5802e467572779d.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-T02-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS (including `/dev/stdout`), NO `rm -r`, NO
    INTERACTIVE SHELLS.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (16 paths: 13 modified, 3 new)

- **client, modified:**
  - `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/styles.css`;
  - `src/client/components/DayFieldsForm.tsx`, `SheetWeekTable.tsx`, `TimesheetSheet.tsx`.
- **client, new:** `src/client/components/editorLayoutModel.ts` and
  `src/client/components/useEditorLayout.ts`.
- **unit test, new:** `tests/client/editorLayoutModel.test.ts`.
- **e2e, modified:** `tests/e2e/day-editor.spec.ts`, `timesheet.spec.ts`, `today.spec.ts`.
- **docs, modified:** `docs/04_UX_AND_SETTINGS.md` and `.vi.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.

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
04e16199ea66d3144fcb34ad4a7716c929b45f22fac0fd7b350450d271a80918 (839 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T01-FREEZE.md` (the recon's Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T01-FREEZE/checks.txt` (the recon's checks);
  - `handoff/delivery/tasks/WP5-UX4-T02.md`;
  - this brief, as it stands before you append results;
  - the folder `handoff/delivery/evidence/WP5-UX4-T02/`, 26 files: 20 `.txt` and
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

Record each exit code in `handoff/delivery/evidence/WP5-UX4-T02-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (04e16199…).
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

Subject: Freeze WP5-UX4-T02: Day editor as a non-modal edge drawer with a discard guard

- feat(ui): from 768px the Day editor is a non-modal drawer flush with the window edge
  (no backdrop, no inert page).
  - Pressing another day or column switches it; pressing the open day closes it, keeping
    focus and announcing "Day editor closed".
  - A focused control is never wholly hidden: the drawer re-docks (WCAG 2.2 SC 2.4.11).
- feat(ui): one "Discard your changes?" guard covers every route that moves or closes the
  open day:
  - a day button or column, unselect, Open a day;
  - Today, Previous/Next period, Current period;
  - Close and Escape.
  It asks only when something is unsaved.
- style(ui): the drawer's edge-side corners are square and its sheet-side corners keep
  12px; in beside mode the drawer pushes the page.
- feat(ui): the beside or floating choice comes from a pure layout model and the sheet's
  minimum width. It switches at 1330px (1345px with a classic scrollbar) and replaces the
  fixed 1360px value.
- test: editorLayout unit tests; e2e for switch, unselect, the guard on each route, corners
  and the layout sweep. The Confirm-breaks test is now deterministic, with pinned 0 s and
  17 s starts.
- docs: docs/04 and docs/10 (+ vi). The new docs/10 entry supersedes the 2026-10-15
  modal floating-panel decision.
- docs(handoff): the T01-FREEZE recon of the owner's commit 213bbdc, the T02 record and
  evidence, the board and the checkpoint (+ vi).

Task: WP5-UX4-T02 (U4-05, U4-06, U4-07; owner round-4 request, F-5 mockup approval)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: 04e16199 (was 1921c36f)

Save the final message as `handoff/delivery/evidence/WP5-UX4-T02-FREEZE/commit-message.txt`.
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

- HEAD before: 213bbdc8a013c96e7144d59dd5802e467572779d; after: b7cc06352687d1bc8cd6953b284915584a21e4fd.
- Commit b7cc063; pushed: yes (213bbdc..b7cc063); remote SHA b7cc06352687d1bc8cd6953b284915584a21e4fd.
- Digest before add and ls-tree digest of new HEAD: both 04e16199ea66d3144fcb34ad4a7716c929b45f22fac0fd7b350450d271a80918 (839 files).
- Staged 49: 16 outside handoff (13 modified, 3 new); handoff 33 (ORCHESTRATION.json, checkpoint pair, T01-FREEZE brief, T01-FREEZE checks.txt, T02.md, this brief, 26 T02 evidence files).
- Extra handoff paths staged: none.
- Checks: node v24.21.0; precommit-check 0; diff --check 2 then 0 after fix; JSON parse 0; validate_orchestration 0; check_recovery 0 (106); validate_package --preflight 0. Details in evidence/WP5-UX4-T02-FREEZE/checks.txt.
- Fix: removed one trailing space at WP5-UX4-T01-FREEZE.md line 175 (allowed). No masking, no stop.
- Deviation: JSON parse used `node -e` with a read-only script (runtime rule says no `node -e`); no other effect.
