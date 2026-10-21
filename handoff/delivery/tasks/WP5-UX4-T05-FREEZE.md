# WP5-UX4-T05-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T05-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-T05 (done).
- **What this commit freezes.** The round-4 settings export and import slice:
  - a personal settings file, and a company-calendar file for administrators;
  - a fixed allowlist of keys;
  - a "Now / In the file" preview, then one confirmation;
  - auto-submit switched on only by its own tick;
  - the transfer code in a lazy chunk;
  - docs/04 and docs/10 (+ vi).
- **Coordinator records it also carries:**
  - the T03-FREEZE results and evidence;
  - the T05 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  cda9c5172b06d3651e94e75ff30e9b1edfae382e.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-T05-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (17 paths: 8 modified, 9 new)

- **New client components:**
  - `src/client/components/settingsFileModel.ts`;
  - `src/client/components/SettingsTransfer.tsx`, `SettingsTransferLoader.tsx`,
    `SettingsTransferPersonal.tsx`, `SettingsTransferDialog.tsx`, `SettingsTransferFile.ts`;
  - `src/client/components/CompanyCalendarFile.tsx`.
- **New tests:** `tests/client/settingsFileModel.test.ts` and
  `tests/e2e/settings-transfer.spec.ts`.
- **Modified client:** `src/client/SettingsScreen.tsx`, `src/client/AdminScreen.tsx`,
  `src/client/api.ts`, `src/client/styles.css`.
- **Modified docs:** `docs/04_UX_AND_SETTINGS.md` and `.vi.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- a migration;
- a `package.json` or lockfile change;
- anything under `scripts/`;
- the AGENTS or CLAUDE files, or `.claude/`;
- any server path;
- a `.json` file outside `handoff/delivery/` (no exported settings file may be committed);
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
b472767737b0ab9486466f258ab75bc0402a17eff01199cd9a3e167b8afba076 (849 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T03-FREEZE.md`, which now has its Results.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T03-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX4-T05.md`;
  - this brief, as it stands before you append results;
  - the folder `handoff/delivery/evidence/WP5-UX4-T05/`, 27 files: 21 `.txt` and
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

Record each exit code in `handoff/delivery/evidence/WP5-UX4-T05-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (b4727677…).
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

Subject: Freeze WP5-UX4-T05: settings export and import

- feat(settings): export and import your personal settings as a JSON file:
  - the work policy;
  - the submission settings;
  - the theme.
  The file never holds the signature, the image authorization, credentials or timesheet
  data, and unknown keys or versions are refused.
- feat(settings): an import always shows a "Now / In the file" comparison and writes only
  after one confirmation.
  - Each group becomes a new version.
  - The policy applies from a chosen date.
  - Automatic submission is switched on only by its own tick.
- feat(admin): administrators export and import a company-calendar file: holidays,
  closures and payroll exceptions. It goes through the existing preview and commit, and
  is refused when the zone, payroll schedule or working weekdays differ.
- perf(client): the transfer code loads lazily; the main chunk is 489 kB, down from
  499 kB.
- test: allowlist, refusal and comparison unit tests; e2e for export, import, the tick,
  refusals, the company file and the employee view.
- docs: docs/04 and docs/10 (+ vi).
- docs(handoff): the T03-FREEZE results, the T05 record and evidence, the board and the
  checkpoint (+ vi).

Task: WP5-UX4-T05 (U4-01; owner answers F-3 a, F-4 a)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: b4727677 (was e3c7016b)

Save the final message as `handoff/delivery/evidence/WP5-UX4-T05-FREEZE/commit-message.txt`.
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
