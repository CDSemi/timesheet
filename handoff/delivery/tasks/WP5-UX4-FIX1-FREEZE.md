# WP5-UX4-FIX1-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-FIX1-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-FIX1 (done).
- **What this commit freezes.** The fixes for the round-4 gate:
  - SC 2.4.11 coverage on the visible part of a control;
  - deterministic tests for window days, Sundays, reachability, the lazy Settings card, the
    theme-switch contrast read and the midnight seed.
- **Coordinator records it also carries:**
  - the T06-FREEZE results and evidence;
  - the gate record and evidence;
  - the FIX1 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  a3042dd9c2f94dd2287ef04ed815db0fbf1838b6.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-FIX1-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `/dev/stdin`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (6 paths, all modified)

- `src/client/TimesheetScreen.tsx`
- `src/client/components/editorLayoutModel.ts`
- `tests/client/editorLayoutModel.test.ts`
- `tests/e2e/day-editor.spec.ts`
- `tests/e2e/keyboard-access.spec.ts`
- `tests/e2e/sharing.spec.ts`

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- a migration;
- a `package.json` or lockfile change;
- anything under `scripts/`;
- the AGENTS or CLAUDE files, or `.claude/`;
- any server path;
- any docs path;
- any other path, including a `zz-*.spec.ts` probe under `tests/`.

Recompute the digest with Node 24 immediately before `git add`. It must equal
b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda (849 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T06-FREEZE.md`, which now has its Results.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T06-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX4-GATE.md`;
  - the folder `handoff/delivery/evidence/WP5-UX4-GATE/`, 242 files: 228 `.txt` and
    14 `-synthetic.png`;
  - `handoff/delivery/tasks/WP5-UX4-FIX1.md`;
  - the folder `handoff/delivery/evidence/WP5-UX4-FIX1/`, 62 `.txt` files;
  - this brief, as it stands before you append results.

Count each folder with Glob. Every evidence file name must end in `.txt` or
`-synthetic.png`. If a count differs, report the actual count. Stage the folder only if every
name follows that rule and no other check fails.

**Key and PEM scan on the two new evidence folders.**
- Grep for `PRIVATE KEY`, for a PEM header followed by literal base64 lines, and for a base64
  run of 200 or more characters.
- Any hit stops the commit. Report the file and line, but not the content.

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
- An email other than `@example.invalid` in evidence stops the commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX4-FIX1-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (b3e9c962…).
4. The Glob counts, and the key and PEM scan.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source or test file stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-FIX1: round-4 gate fixes

- fix(ui): the Day editor drawer re-docks when the visible part of a focused control lies
  wholly under it (WCAG 2.2 SC 2.4.11).
  - The coverage check clips the control to the window, with a 1px tolerance, so a control
    resting 0.23px below the window at 1280x800 is no longer missed.
  - The check is now a pure, unit-tested function.
- test(e2e): a 1280x800 keyboard walk with long seeded content, docked right and left.
- test(e2e): deterministic date and timing:
  - the shared view on window days;
  - running-session minutes on non-working days;
  - drawer reachability by the pressed targets;
  - the Settings walk waits for the lazily loaded export and import card;
  - contrast reads wait for the theme transition;
  - the running-session seed across midnight.
- docs(handoff): the round-4 gate (FAIL) record and evidence, the FIX1 record and evidence,
  the T06-FREEZE results, the board and the checkpoint (+ vi).

Task: WP5-UX4-FIX1 (answers WP5-UX4-GATE FAIL)
Gate: pending (WP5-UX4-REGATE)
Audit: pending (round-4 audits)
Digest: b3e9c962 (was 104ca9c3)

Save the final message as `handoff/delivery/evidence/WP5-UX4-FIX1-FREEZE/commit-message.txt`.
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

- HEAD before a3042dd9c2f94dd2287ef04ed815db0fbf1838b6; after and commit SHA
  0ddfeada1b66c82b066b179e901184ca5d857793; pushed to origin/main, remote SHA identical.
- Digest before add and after commit: b3e9c962... (849 files), both equal.
- Staged 319: 6 source/test, 4 modified handoff, 3 task records (GATE, FIX1, this brief),
  242 GATE evidence, 62 FIX1 evidence, 2 T06-FREEZE evidence. No extra handoff paths.
- Checks: precommit 0, diff --check 0, JSON parse 0, validate_orchestration 0,
  check_recovery 0, validate_package --preflight 0, key/PEM scan 0 hits. Details in
  evidence/WP5-UX4-FIX1-FREEZE/checks.txt. No fixes, masking or stops.
