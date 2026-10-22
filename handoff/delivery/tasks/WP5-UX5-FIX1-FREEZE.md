# WP5-UX5-FIX1-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX1-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX1 (done).
- **What this commit freezes.** The fixes for the round-5 gate:
  - the drill's sign-off body for the previous build;
  - four date- and DST-independent tests;
  - `TableWrap.tsx`, which makes overflowing tables named, focusable regions on History,
    OT, shared OT, Import preview, Operations status and the settings-transfer dialog;
  - a new `history-a11y.spec.ts`.
- **Coordinator records it also carries:**
  - the T06-FREEZE results and evidence;
  - the WP5-UX5-GATE record (FAIL) and its evidence;
  - the FIX1 record and evidence;
  - the FIX1-PATHS lookup brief;
  - the draft briefs for the regate and the two audits;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  e2bf1aab4ef65d496de6672c7986e27db04ddb39.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX1-FREEZE`.
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
    - The exception: the three evidence folders named below are staged as directory paths.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
  - Keep your own Results in this brief short: counts, checks, exceptions. Long listings go
    to `checks.txt`.
- The coordinator writes no file while you run.

## Index state at dispatch

Nothing is staged (lookup WP5-UX5-FIX1-PATHS). Check this with
`git diff --cached --name-status` before you add anything. If anything is staged, stop and
report.

## Expected working-tree set outside handoff/ (13 paths: 11 modified, 2 new)

- **New (2):** `src/client/components/TableWrap.tsx`, `tests/e2e/history-a11y.spec.ts`
- **Modified (11):**
  - `scripts/container-drill.mjs`
  - `src/client/HistoryScreen.tsx`, `src/client/OtScreen.tsx`, `src/client/styles.css`
  - `src/client/components/ImportPreview.tsx`, `src/client/components/OperationsStatus.tsx`,
    `src/client/components/SettingsTransferDialog.tsx`, `src/client/components/SharingOt.tsx`
  - `tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- any path under `src/server/` or `src/domain/`;
- `package.json` or a lockfile;
- `scripts/precommit-check.mjs` or the validators;
- the AGENTS or CLAUDE files, `.claude/`, `docs/08` or `handoff/prompts/`;
- a binary outside `handoff/`;
- a `zz-*` file under `src/`, `tests/`, `scripts/` or `docs/`;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
709750910cb88422b1de35c38c85eac15c3eca63ee75e1ff26e11b75d6475bbf (870 files). After the
commit, compute the digest of HEAD's tree with `git ls-tree`; it must equal the same value.

## Handoff files to stage

- **Modified (5):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-GATE.md` (Target and Results);
  - `handoff/delivery/tasks/WP5-UX5-T06-FREEZE.md` (Results).
- **New evidence folders,** staged as directories:
  - `handoff/delivery/evidence/WP5-UX5-GATE/` (251 files);
  - `handoff/delivery/evidence/WP5-UX5-FIX1/` (86 files);
  - `handoff/delivery/evidence/WP5-UX5-T06-FREEZE/` (`checks.txt`, `commit-message.txt`).

  Together these are 339 files. Every binary in them ends in `-synthetic.png` (15 in the
  gate folder). The `zz-*.txt` files there are text copies of the verifiers' probe
  scripts, kept as evidence as in earlier gates. They are allowed under `evidence/`.
- **New task records (6):**
  - `handoff/delivery/tasks/WP5-UX5-FIX1.md`;
  - `handoff/delivery/tasks/WP5-UX5-FIX1-PATHS.md`. It has no Results, because a permission
    check refused the lookup's write; the board records why;
  - `handoff/delivery/tasks/WP5-UX5-REGATE.md` (draft; its "Target at dispatch" is still
    empty);
  - `handoff/delivery/tasks/WP5-UX5-AUDIT-A.md` and `WP5-UX5-AUDIT-B.md` (drafts);
  - this brief, as it stands before you append results.

**Key and PEM scan** on the three new evidence folders and the two new source files, with
the rule of `WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

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
- An email other than `@example.invalid`, or a Message-ID other than `@timesheet.invalid`,
  stops the commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX5-FIX1-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: empty.
4. The digest (70975091…).
5. The set comparison, a `zz-*` search under `src/`, `tests/`, `scripts/` and `docs/`, and
   the scans.
6. `git add` with the explicit paths and the three folders.
7. `node scripts/precommit-check.mjs`.
8. `git diff --cached --check`.
9. A JSON parse of ORCHESTRATION.json and STATE.json.
10. `validate_orchestration.py`.
11. `check_recovery.py` (106 probes).
12. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
13. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test, script or evidence file stops the
commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix WP5-UX5 gate findings: drill sign-off, date-proof tests, focusable tables

- fix(drill): the container drill sends `signer_name` only when it signs off on the
  previous WP3 build. The upgrade stages now run on a database that holds signed revisions
  and queued sends.
- test(e2e): four tests no longer depend on the date or on DST.
  - The Day editor's outside press targets an uncovered point.
  - The period-card arrangement and the short Review label follow the measured T04
    thresholds.
  - The late-end range uses a session that crosses midnight in both seasons.
- fix(a11y): `TableWrap` makes each table that overflows sideways a named, focusable region
  with the shared focus ring (WCAG 2.1.1). It is used by History, OT, shared OT, Import
  preview, Operations status and the settings-transfer dialog.
- test(e2e): `history-a11y.spec.ts`.
- docs(handoff):
  - the T06-FREEZE results;
  - the round-5 gate record (FAIL) and evidence;
  - the FIX1 record and evidence;
  - the FIX1-PATHS brief;
  - the draft regate and audit briefs;
  - the board and the checkpoint (+ vi).

Task: WP5-UX5-FIX1 (WP5-UX5-GATE findings 1-3)
Gate: WP5-UX5-GATE FAIL on e2bf1aa; regate pending
Audit: pending (round-5 audits)
Digest: 70975091 (was 318b3370)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-FIX1-FREEZE/commit-message.txt`. Leave it, checks.txt and
this brief's Results unstaged after the commit.

## Push and report

Append to this brief, briefly:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- scan hits and their classification;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results
