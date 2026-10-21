# WP5-UX4-T01-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T01-FREEZE, package WP5, kind
  commit, attempt 1. It depends on WP5-UX4-T01 (done).
- **What this commit freezes.** The round-4 paper and controls slice:
  - the 32px title gap;
  - the paper wrapping the toolbar, both week sheets and the footer;
  - a stronger week header row and first column;
  - round switches, the select chevron and centred checkboxes;
  - the label "Show worked hours";
  - docs/04 (+ vi).
- **Coordinator records it also carries** (written since 5a68fba):
  - the T01 record and evidence;
  - the T04-FREEZE attempt-2 results;
  - the board;
  - the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes".
- **Branch.** main. The expected HEAD is origin/main =
  5a68fba65bac6723ed3e66f33048b722d34c4656.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-T01-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS (including `/dev/stdout`), NO `rm -r`.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    It has tzdata; other interpreters do not.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (16 paths: 15 modified, 1 new)

- **client:**
  - `src/client/styles.css`, `src/client/TimesheetScreen.tsx`, `src/client/ReviewScreen.tsx`;
  - `src/client/components/ReviewDays.tsx`, `ShowDetailsSwitch.tsx`,
    `SharingItemsFields.tsx`, `TimesheetSheet.tsx`.
- **e2e tests:**
  - `tests/e2e/surfaces.spec.ts`, `timesheet.spec.ts`, `day-editor.spec.ts`,
    `hover.spec.ts`, `focus-ring.spec.ts`, `shell.spec.ts`;
  - `controls.spec.ts` (new).
- **docs:** `docs/04_UX_AND_SETTINGS.md` and `.vi.md`.

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
1921c36f444c8161a963e5c36e1857d682080255b44a5539dc899b60730160e6 (836 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T01.md`, which now carries the results;
  - `handoff/delivery/tasks/WP5-UX4-T04-FREEZE.md`, which has the attempt-2 results.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T04-FREEZE/checks.txt` and `commit-message.txt`
    (untracked T04-FREEZE evidence; corrected by Addendum 1 below);
  - this brief, as it stands before you append results;
  - the folder `handoff/delivery/evidence/WP5-UX4-T01/`, with 12 files: 6 `.txt` and
    6 `-synthetic.png`.

Count the folder with Glob. Every evidence file name must end in `.txt` or
`-synthetic.png`.

**Other paths under `handoff/`.** If `git status` shows any other modified or untracked path
under `handoff/`, list it by name.
- You may also stage `handoff/delivery/STATE.json` or `handoff/NEXT_ACTION.md` / `.vi.md` if
  they appear.
- Any other unexpected path stops the commit.

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- Any other finding stops the commit.

## Checks before committing

Record every exit code in `handoff/delivery/evidence/WP5-UX4-T01-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (1921c36f…).
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

Subject: Freeze WP5-UX4-T01: paper timesheet, controls and title spacing

- feat(ui):
  - Timesheet and Review sit on one raised "paper": the toolbar, both week sheets and the
    footer, with layout, colours and the two signature rows unchanged;
  - the paper runs full-bleed on a phone.
- style(ui):
  - 32px gap under the page title from 768px;
  - a stronger week header row and first column (text contrast kept);
  - round switches;
  - a select chevron 12px from the edge;
  - checkboxes centred on their first text line, and WFH centred on the Category field.
- fix(ui): Review switches to two columns at 1330px with a wider page beside the checklist,
  because the week grid overflowed its card at 1280px.
- refactor(ui): "Show details" is renamed "Show worked hours".
- test(e2e): a new controls spec; the surfaces, timesheet, day-editor, hover, focus-ring and
  shell specs are updated with reasons.
- docs: docs/04 (+ vi).
- docs(handoff): the T01 record and evidence, the T04-FREEZE attempt-2 results, the board
  and the checkpoint (+ vi).

Task: WP5-UX4-T01 (U4-02, U4-03, U4-04, U4-08, U4-09, U4-10; owner answers F-5)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: 1921c36f (was 6e9e3001)

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

## Addendum 1 (coordinator, after the first stop)

- Attempt 1 stopped before staging on a brief error.
  - `handoff/delivery/evidence/WP5-UX4-T04-FREEZE/checks.txt` is untracked, not modified.
  - `commit-message.txt` in the same folder was not listed.
  - Both are records of the T04-FREEZE commit (5a68fba). The board now lists both as
    T04-FREEZE evidence.
- Stage both as new handoff files, together with every path listed above.
- Count `handoff/delivery/evidence/WP5-UX4-T04-FREEZE/` with Glob. Expect exactly those two
  `.txt` files.
- The rest of the brief is unchanged.
  - Recheck HEAD, origin/main, the 16 paths and the digest before `git add`.
  - Any other unexpected path still stops the commit.

## Results

### Manual commit by the owner (verified by WP5-UX4-T01-FREEZE-RECON)

- SHAs: HEAD = origin/main = 213bbdc8a013c96e7144d59dd5802e467572779d, ahead/behind 0/0. PASS
- Parent: 5a68fba65bac6723ed3e66f33048b722d34c4656; no other commit after it. PASS
- Message: matches commit-message.txt (only difference: a trailing blank line git strips). PASS
- Path set: exactly the 37 expected paths (16 outside handoff, 15 M + 1 A; 21 under handoff). PASS
- Leftovers: only ORCHESTRATION.json and the checkpoint pair (M). PASS
- Digests: working tree and HEAD ls-tree both 1921c36f444c8161a963e5c36e1857d682080255b44a5539dc899b60730160e6 (836 files). PASS
- Validators: validate_orchestration PASS on HEAD board copy and working tree; check_recovery PASS (106 probes) and validate_package --preflight PASS on the working tree only (cannot target a copy).
- Privacy scan: 0 Windows user-profile path hits in the committed files. PASS
- Evidence: handoff/delivery/evidence/WP5-UX4-T01-FREEZE/checks.txt
