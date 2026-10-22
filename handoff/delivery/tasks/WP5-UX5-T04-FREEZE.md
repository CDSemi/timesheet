# WP5-UX5-T04-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T04-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T04 (done).
- **What this commit freezes.** Round-5 slice T04:
  - the 480 / 768px breakpoint split, in range syntax (`layoutQueries.ts`, `useMedia.ts`);
  - the top-bar wordmark when it fits;
  - the period card's wide and narrow arrangements, and the range ladder;
  - the Review button style under H-1 a;
  - the compact 8px margins;
  - the docs/04 lines (+ vi).
- **Coordinator records it also carries:**
  - the T03-FREEZE results and evidence;
  - the T04 record and evidence;
  - the T04-PATHS lookup record;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  65def2f61b6cb82e8c23cb01c15e787d2d0b1c14.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T04-FREEZE`.
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

Nothing is staged (lookup WP5-UX5-T04-PATHS). Check this with
`git diff --cached --name-status` before you add anything. If anything is staged, stop and
report.

## Expected working-tree set outside handoff/ (25 paths: 20 modified, 5 new)

- **New (5):**
  - `src/client/components/layoutQueries.ts`, `src/client/components/useMedia.ts`
  - `tests/client/layoutQueries.test.ts`
  - `tests/e2e/periodCard.ts`, `tests/e2e/periodWindow.ts`
- **Modified (20):**
  - `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
  - `src/client/TimesheetScreen.tsx`, `src/client/styles.css`
  - `src/client/components/BarClock.tsx`, `src/client/components/ClockProvider.tsx`,
    `src/client/components/PeriodBar.tsx`, `src/client/components/ReviewDays.tsx`,
    `src/client/components/ReviewStatus.tsx`, `src/client/components/editorLayoutModel.ts`,
    `src/client/components/periodBarModel.ts`, `src/client/components/reviewModel.ts`
  - `tests/client/periodBarModel.test.ts`, `tests/client/reviewModel.test.ts`
  - `tests/e2e/controls.spec.ts`, `tests/e2e/logo.spec.ts`, `tests/e2e/review.spec.ts`,
    `tests/e2e/surfaces.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`

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
2ba69f6271c13b8541177c940f21d02f8c51bc1e36c1a6b8bbb3c0eb9749c355 (867 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T03-FREEZE.md` (its Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T03-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T04.md`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T04/`: sixteen `.txt` files and eight
    `-synthetic.png` files;
  - `handoff/delivery/tasks/WP5-UX5-T04-PATHS.md`;
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders and on the five new source and test files,
with the rule of `WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

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

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T04-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: empty.
4. The digest (2ba69f62…).
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

Subject: Freeze WP5-UX5-T04: 480px compact sheet, top-bar wordmark and period card

- feat(layout): two queries in range syntax.
  - `SHELL_QUERY` (768px) keeps the phone bar, the Day editor sheet, full-screen dialogs
    and the 44px rule.
  - `SHEET_QUERY` (480px) moves the compact sheet.
  - From 480 to 913px the week grid scrolls sideways in its card.
  - No media query uses min-width or max-width, so no fractional width falls between
    layouts.
- feat(shell): the company wordmark shows whenever the bar has room, without adding a row.
- feat(timesheet): the period card.
  - Wide: ">" and Today follow the range, and Review stays right.
  - Narrow: the range is centred between "<" and ">", with the buttons under the meta line.
  - The divider is kept in both.
  - The step gap is 20px.
  - The range shortens in steps and keeps its full accessible text.
- feat(review): "Review & sign off" is primary while an ended period still needs the
  person: a draft, an automatic revision to review, or a signed revision with no send.
- style: below 480px the card, the paper and the Review cards stand 8px from the edges.
- docs(ux): the docs/04 lines (+ vi).
- test: the breakpoint rules, a 1px sweep, the wordmark sweeps, the period-card
  arrangements, the ladder, Current period and the Review button table.
- docs(handoff): the T03-FREEZE results, the T04 record and evidence, the T04-PATHS lookup,
  the board and the checkpoint (+ vi).

Task: WP5-UX5-T04 (owner decisions F-6 a, F-2 a, H-1 a, B1; plan U5-01, U5-02, U5-08..U5-15, U5-22)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 2ba69f62 (was d23e3617)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T04-FREEZE/commit-message.txt`. Leave it, checks.txt and
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
