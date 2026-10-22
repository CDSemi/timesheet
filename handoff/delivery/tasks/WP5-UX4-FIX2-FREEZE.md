# WP5-UX4-FIX2-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-FIX2-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-FIX2 (done).
- **What this commit freezes.** The fixes for the round-4 area audits:
  - the classic-scrollbar layout loop;
  - Escape and Current-period focus;
  - docs/04;
  - separate sign-in and password-change limiter keys;
  - the style cleanups.
- **Coordinator records it also carries:**
  - the FIX1-FREEZE results and evidence;
  - the regate record and evidence;
  - both audits: the records, the review pairs and the evidence;
  - the FIX2 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  0ddfeada1b66c82b066b179e901184ca5d857793.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-FIX2-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `/dev/stdin`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
    Several `git add` calls are fine.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (18 paths: 17 modified, 1 new)

- **client:**
  - `src/client/styles.css`, `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`;
  - `src/client/components/PeriodBar.tsx`.
- **server:** `src/server/routes/auth.ts`.
- **tests:**
  - `tests/e2e/classic-scrollbar.spec.ts` (new);
  - `tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`;
  - `tests/integration/password-change.test.ts`;
  - `tests/client/cssThemeParity.test.ts`.
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
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0 (850 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-FIX1-FREEZE.md`, which now has its Results.
- **New task records:**
  - `handoff/delivery/tasks/WP5-UX4-REGATE.md`;
  - `handoff/delivery/tasks/WP5-UX4-AUDIT-A.md`;
  - `handoff/delivery/tasks/WP5-UX4-AUDIT-B.md`;
  - `handoff/delivery/tasks/WP5-UX4-FIX2.md`;
  - this brief, as it stands before you append results.
- **New review pairs:** `handoff/delivery/WP5_UX4_REVIEW_A.md` and `.vi.md`, and
  `handoff/delivery/WP5_UX4_REVIEW_B.md` and `.vi.md`.
- **New evidence folders:**
  - `handoff/delivery/evidence/WP5-UX4-FIX1-FREEZE/`;
  - `handoff/delivery/evidence/WP5-UX4-REGATE/`;
  - `handoff/delivery/evidence/WP5-UX4-AUDIT-A/`;
  - `handoff/delivery/evidence/WP5-UX4-AUDIT-B/`;
  - `handoff/delivery/evidence/WP5-UX4-FIX2/`.

**Evidence folders.**
- Count each folder with Glob and record the counts.
- Every name must end in `.txt` or `-synthetic.png`. Any other name, including any `.json`,
  stops the commit.

**Key and PEM scan on the five new evidence folders.**
- List every line that contains `BEGIN` with its file and line.
- A hit is **allowed** only when it is a header inside code text whose body is an
  interpolation such as `${b64}`, with no literal base64 line after it. Example: the known
  `BEGIN CERTIFICATE` template literal.
- These **stop** the commit:
  - a PEM header followed by literal base64 lines;
  - any base64 run of 200 or more characters;
  - any password, hash or session token value.
- Record each hit and its classification in checks.txt. Report the file and line, but not
  the content.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX4-*.md`;
  - `handoff/delivery/WP5_UX4_REVIEW_*.md`;
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

Record each exit code in `handoff/delivery/evidence/WP5-UX4-FIX2-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (1c1c526f…).
4. The Glob counts, and the key and PEM scan.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record or review file
outside `evidence/`. A whitespace finding in a source, test or docs file stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-FIX2: round-4 audit fixes

- fix(ui): the Day editor no longer flips between beside and floating with a classic
  scrollbar.
  - The root always reserves its vertical scrollbar track (`overflow-y: scroll`), so the
    measured width no longer depends on the layout it decides.
  - A new e2e spec runs with a real classic scrollbar.
- fix(ui): Escape from a sheet control with unsaved edits now shows "Discard your changes?"
  instead of cancelling it at once.
- fix(ui): "Current period" then "Keep editing" returns focus to the button pressed.
- fix(auth): sign-in attempts can no longer exhaust another user's password-change limit;
  the sign-in limiter keys are namespaced (`login:<email>`).
- style: a token for the transfer table's row-header width; the unused `--scrim-side` and a
  stale elevation comment are removed.
- docs: docs/03, docs/04, docs/10 and docs/12 (+ vi).
- docs(handoff):
  - the regate (PASS);
  - the area audits A and B (FIX REQUIRED) with their reviews and evidence;
  - the FIX1-FREEZE and FIX2 records;
  - the board and the checkpoint (+ vi).

Task: WP5-UX4-FIX2 (answers WP5-UX4-AUDIT-A F-UX4A-1..4 and WP5-UX4-AUDIT-B F-UX4B-1)
Gate: pending (WP5-UX4-REGATE2)
Audit: pending (WP5-UX4-AUDIT-A2, WP5-UX4-AUDIT-B2, then WP5-UX4-AUDIT-INT)
Digest: 1c1c526f (was b3e9c962)

Save the final message as `handoff/delivery/evidence/WP5-UX4-FIX2-FREEZE/commit-message.txt`.
Leave it, checks.txt and this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group and per evidence folder;
- any extra handoff paths staged;
- every check with its exit code;
- every key or PEM hit with its classification;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- HEAD before 0ddfeada1b66c82b066b179e901184ca5d857793; after 178f1cf8970086018e2e96e8340d911077a2d3ad (commit SHA). Pushed: yes; remote SHA 178f1cf8970086018e2e96e8340d911077a2d3ad.
- Digest before and after: 1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0 (850 files).
- Staged 352: 18 outside handoff; evidence FIX1-FREEZE 2, REGATE 88, AUDIT-A 159, AUDIT-B 36, FIX2 36; the rest are handoff records. No extra handoff paths.
- Checks: all exit 0 (precommit, diff --check, JSON parse, validate_orchestration, check_recovery 106, validate_package --preflight). Key/PEM scan: no hits. No fix, masking or stop. One stray null-device redirect in a no-op command.
