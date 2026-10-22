# WP5-UX4-FIX3-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-FIX3-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-FIX3 (done).
- **What this commit freezes.**
  - The owner's answers R2 a (no grantee delete of a running session) and R5 b (no forced
    scrollbar track; the editor layout subtracts the classic scrollbar width).
  - An event-based hover settle helper.
  - docs 03, 04, 10 and 12 (+ vi).

  It is the last round-4 source commit. Round 4 is folded into round 5 (owner Q0 a).
- **Coordinator records it also carries:**
  - the FIX2-FREEZE results;
  - the REGATE2 record (stopped early);
  - the FIX3 record;
  - the round-5 plan and its design folder;
  - the evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  178f1cf8970086018e2e96e8340d911077a2d3ad.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-FIX3-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
    Several `git add` calls are fine.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (18 paths, all modified)

- **server:** `src/server/services/timesheetCommands.ts`.
- **client:**
  - `src/client/components/SessionList.tsx`, `src/client/DayEditor.tsx`;
  - `src/client/components/useEditorLayout.ts`, `src/client/components/editorLayoutModel.ts`;
  - `src/client/styles.css`.
- **tests:** `tests/integration/sharing.test.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/classic-scrollbar.spec.ts`, `tests/e2e/hover.spec.ts`.
- **docs:** `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/04_UX_AND_SETTINGS.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `docs/12_RELEASE_NOTES.md`, each with its `.vi.md`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- a migration;
- a `package.json` or lockfile change;
- anything under `scripts/`;
- the AGENTS or CLAUDE files, or `.claude/`;
- a `zz-*` probe under `tests/`;
- a font or other binary file;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
7af8e935f2c11f05b5c584a0a38da1170aa9826d752ee54434a4a8d2be434949 (850 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-FIX2-FREEZE.md`, which now has its Results.
- **New task records:**
  - `handoff/delivery/tasks/WP5-UX4-REGATE2.md`;
  - `handoff/delivery/tasks/WP5-UX4-FIX3.md`;
  - `handoff/delivery/tasks/WP5-UX5-PLAN.md`;
  - this brief, as it stands before you append results.
- **New design folder:** `handoff/delivery/design/WP5-UX5/`, holding `mockup.html` and 12
  `-synthetic.png` files.
- **New evidence folders:**
  - `handoff/delivery/evidence/WP5-UX4-FIX2-FREEZE/`;
  - `handoff/delivery/evidence/WP5-UX4-REGATE2/`;
  - `handoff/delivery/evidence/WP5-UX4-FIX3/`.

**Evidence and design folders.**
- Count each folder with Glob and record the counts.
- Every evidence name must end in `.txt` or `-synthetic.png`. In the design folder,
  `mockup.html` is also allowed.
- Any other name, including any `.json`, font file or other image type, stops the commit.

**The design folder must hold no personal data.** Grep `mockup.html` for `@`. Only
`@example.invalid` addresses are allowed. Any real person's name from the owner's
reference also stops the commit. The owner's reference image is not in the repository and
must not be.

**Key and PEM scan on the new evidence folders.**
- List every line containing `BEGIN`.
- **Allowed:** a header inside code text whose body is an interpolation such as `${b64}`,
  with no literal base64 line after it.
- **Stops the commit:**
  - a PEM header followed by literal base64 lines;
  - a base64 run of 200 or more characters;
  - any password, hash or session-token value.
- Record each hit and its classification in checks.txt. Report the file and line, but not
  the content.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX4-*.md` or `WP5-UX5-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX4-*/`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- An email other than `@example.invalid` stops the commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX4-FIX3-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (7af8e935…).
4. The Glob counts, the design-folder personal-data Grep, and the key and PEM scan.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test or docs file stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-FIX3: owner answers R2 and R5, hover settle

- fix(sharing): a grantee with an edit share can no longer delete the owner's running
  session (409 shared_clock_action, nothing written). The shared view offers no Delete on a
  running session. (Owner decision R2 a.)
- fix(ui): no forced scrollbar track. The Day editor layout decides on the window width
  minus the classic scrollbar width, measured once, so it neither loops nor depends on
  whether the page scrolls. (Owner decision R5 b.)
- test(e2e): the hover checks wait for the running transitions instead of polling with a
  timer.
- docs: docs/03, docs/04, docs/10 and docs/12 (+ vi).
- docs(handoff):
  - the FIX2-FREEZE results;
  - the REGATE2 record, stopped early and superseded;
  - the FIX3 record and evidence;
  - the round-5 plan (WP5-UX5-PLAN) with its mockup and renders;
  - the board and the checkpoint (+ vi).

Task: WP5-UX4-FIX3 (owner answers R2 a and R5 b; REGATE2 hover failure)
Gate: pending (round-5 package gate covers rounds 4 and 5, owner Q0 a)
Audit: pending (round-5 audits)
Digest: 7af8e935 (was 1c1c526f)

Save the final message as `handoff/delivery/evidence/WP5-UX4-FIX3-FREEZE/commit-message.txt`.
Leave it, checks.txt and this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group and per folder;
- any extra handoff paths staged;
- every check with its exit code;
- every scan hit with its classification;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results
