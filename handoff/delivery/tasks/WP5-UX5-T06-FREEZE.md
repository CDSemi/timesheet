# WP5-UX5-T06-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T06-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T06 (done).
- **What this commit freezes.** Round-5 slice T06, the docs:
  - docs/04, docs/11 and docs/12 (EN and VI);
  - the pilot packet (EN and VI);
  - the new synthetic email and PDF samples, made from a clean export of 69d6340.

  This is the package-final source snapshot for the round-5 gate.
- **Coordinator records it also carries:**
  - the T05B-FREEZE results and evidence;
  - the T06 record and evidence;
  - the T06-PATHS lookup record;
  - the draft gate brief;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  69d63400486a977f10e022deea85026c6751b687.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T06-FREEZE`.
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

Nothing is staged (lookup WP5-UX5-T06-PATHS). Check this with
`git diff --cached --name-status` before you add anything. If anything is staged, stop and
report.

## Expected working-tree set outside handoff/ (6 paths, all modified)

- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md`
- `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- any path under `src/`, `tests/`, `scripts/` or `assets/`;
- `package.json` or a lockfile;
- the validators;
- the AGENTS or CLAUDE files, `.claude/`, `docs/08` or `handoff/prompts/`;
- a binary outside `handoff/`;
- a `zz-*` probe anywhere;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
318b3370450db99a96194249d4d9d7ae985a10a133f10994ba4acf219453635c (868 files). After the
commit, compute the digest of HEAD's tree with `git ls-tree`; it must equal the same value.

## Handoff files to stage

- **Modified (7):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T05B-FREEZE.md` (its Results);
  - `handoff/delivery/tasks/WP5-UX5-T06.md` (Addendum 1 and Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T05B-FREEZE/checks.txt` and `commit-message.txt`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T06/`: 37 files, which are 31 `.txt`
    files and six `-synthetic.png` renders;
  - `handoff/delivery/tasks/WP5-UX5-T06-PATHS.md`;
  - `handoff/delivery/tasks/WP5-UX5-GATE.md` (the draft brief; its "Target at dispatch"
    section is still empty);
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders, with the rule of
`WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

**Sample messages.** The `msg-*.txt` files hold synthetic headers. Their addresses are at
`example.invalid`, and their Message-IDs are at `timesheet.invalid`. The same form was
committed with WP5-PILOT. If the precommit check flags any other domain, stop and report.

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

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T06-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: empty.
4. The digest (318b3370…).
5. The set comparison, a `zz-*` search under `src/`, `tests/` and `docs/`, and the scans.
6. `git add` with the explicit paths.
7. `node scripts/precommit-check.mjs`.
8. `git diff --cached --check`.
9. A JSON parse of ORCHESTRATION.json and STATE.json.
10. `validate_orchestration.py`.
11. `check_recovery.py` (106 probes).
12. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
13. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a docs file, the packet or evidence stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX5-T06: round-5 docs, pilot packet and new samples

- docs(ux): docs/04 (+ vi) — the History row, the settings-file key, and "Email and PDF" for
  separate sign-off and send and the redesigned PDF.
- docs(release): docs/12 (+ vi).
  - The round-5 entry.
  - Two known limits corrected from the code: partial leave is now printed, and a long
    holiday label shrinks and wraps before it is cut.
- docs(runbook): docs/11 (+ vi), section 13. The self-test signs off, then sends, and the
  envelope is chosen for each send.
- docs(pilot): the pilot packet (+ vi).
  - Recipients and the reason for another copy.
  - The capture self-test.
  - Samples S1-S6 and N1-N5, made from a clean export of 69d6340 in capture mode.
  - The two PDF defaults in the settings checklist.
  - The round-5 owner decisions, including Q1 and Q2.
  - Release identity and drill figures are marked for a refresh after the round-5 gate.
- docs(handoff):
  - the T05B-FREEZE results;
  - the T06 record, Addendum 1 and evidence;
  - the T06-PATHS lookup;
  - the draft round-5 gate brief;
  - the board and the checkpoint (+ vi).

Task: WP5-UX5-T06 (owner decisions Q0 a, Q1, Q2, F-1..F-10, H-1 a; plan B-A3 docs list)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 318b3370 (was a5dcb5a6; docs only)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T06-FREEZE/commit-message.txt`. Leave it, checks.txt and
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

- HEAD before: 69d63400486a977f10e022deea85026c6751b687; after:
  e2bf1aab4ef65d496de6672c7986e27db04ddb39 (also origin/main; pushed; no tag).
- Digest before add and from `git ls-tree` of HEAD:
  318b3370450db99a96194249d4d9d7ae985a10a133f10994ba4acf219453635c (868 files).
- Staged: 55 paths (6 docs modified; 7 handoff modified; 42 handoff new). No extra handoff paths.
- Checks (all exit 0): node v24.21.0, precommit-check, diff --cached --check, JSON parse,
  validate_orchestration.py, check_recovery.py, validate_package.py --preflight, fetch,
  push dry-run, push.
- Scans: zz-* none; BEGIN/PEM hits 0.
- No fix, masking or stop. Details: evidence/WP5-UX5-T06-FREEZE/checks.txt.
