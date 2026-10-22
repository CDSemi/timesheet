# WP5-UX5-T03-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T03-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T03 (done).
- **What this commit freezes.** Round-5 slice T03:
  - the Review and sign off page, in one column;
  - the Sign off dialog (`SignoffDialog.tsx`, replacing `ReviewSignoff.tsx`);
  - the Send card (`SendCard.tsx`, replacing `ReviewEnvelope.tsx`), with the per-send
    envelope, the two PDF switches and the reason dialog;
  - the Settings switch "Time rows on the PDF" and the settings-file key
    `show_time_on_pdf`;
  - the History and admin wording;
  - the docs/04 Review lines (+ vi).
- **Coordinator records it also carries:**
  - the T02-FREEZE results and evidence;
  - the T03 record and evidence;
  - the T03-PATHS lookup record;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed here as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  b4c500456a69158571799f8f0d90f035fd7a0fa5.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T03-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`, NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO
    NULL-DEVICE REDIRECTS (`/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`),
    NO `rm -r`, NO INTERACTIVE SHELLS.
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

The T03 worker ran `git rm --cached` on the two deleted files so that the digest script
runs. They are **already staged as deletions**; nothing else is staged (lookup
WP5-UX5-T03-PATHS). Check this with `git diff --cached --name-status` before you add
anything. If anything else is staged, stop and report.

## Expected working-tree set outside handoff/ (32 paths: 28 modified, 2 new, 2 deleted)

- **Deleted (2, already staged):**
  - `src/client/components/ReviewEnvelope.tsx`
  - `src/client/components/ReviewSignoff.tsx`
- **New (2):**
  - `src/client/components/SendCard.tsx`
  - `src/client/components/SignoffDialog.tsx`
- **Modified (28):**
  - `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
  - `src/client/App.tsx`, `src/client/ReviewScreen.tsx`, `src/client/api.ts`,
    `src/client/styles.css`
  - `src/client/components/DeliveryHistory.tsx`, `src/client/components/OperationsStatus.tsx`,
    `src/client/components/ReviewDays.tsx`, `src/client/components/ReviewStatus.tsx`,
    `src/client/components/SubmissionSettingsForm.tsx`,
    `src/client/components/TimesheetSheet.tsx`, `src/client/components/deliveryModel.ts`,
    `src/client/components/otModel.ts`, `src/client/components/reviewModel.ts`,
    `src/client/components/settingsFileModel.ts`, `src/client/components/settingsModel.ts`
  - `tests/client/deliveryModel.test.ts`, `tests/client/otModel.test.ts`,
    `tests/client/reviewModel.test.ts`, `tests/client/settingsFileModel.test.ts`,
    `tests/client/settingsModel.test.ts`
  - `tests/e2e/controls.spec.ts`, `tests/e2e/history-settings.spec.ts`,
    `tests/e2e/review.spec.ts`, `tests/e2e/settings-transfer.spec.ts`,
    `tests/e2e/sharing.spec.ts`, `tests/e2e/submission.spec.ts`

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
- a `zz-*` probe;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
d23e3617d58fe540b42b28e13c4f8c4674b4eae106bdaea0ccf6b4cc76b03440 (862 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T02-FREEZE.md` (its Addendum 1 and Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T02-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T03.md`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T03/`: ten `.txt` files and five
    `-synthetic.png` files;
  - `handoff/delivery/tasks/WP5-UX5-T03-PATHS.md`;
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders and on the two new source files, with the
rule of `WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

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

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T03-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. `git diff --cached --name-status`: exactly the two staged deletions.
4. The digest (d23e3617…).
5. The set comparison and the scans.
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

Subject: Freeze WP5-UX5-T03: Review page with a Sign off dialog and a Send card

- feat(review): "Review and sign off" in one column:
  - the title without the submission id, with chips under it;
  - a check card with "Back to the timesheet" ("Back" below 480px);
  - a Preview card whose company line hides rather than wraps;
  - a muted note on the reporting zone.
- feat(review): the Sign off dialog holds the checks (OT proposals, deficit choices, missing
  evidence, reserved OT leave). It signs with the image and name, or the name only, and
  sends nothing. A refusal shows "Not signed off".
- feat(review): the Send card:
  - To, Cc, Subject and body are editable for each send;
  - the switches "Time rows on the PDF" and "OT rows on the PDF";
  - "PDF Preview" and "Save PDF";
  - Send is disabled until sign-off;
  - "Send another copy..." asks for a reason once a copy counts as sent.
- feat(review): the signature rows take the PDF's insets and proportions.
- feat(settings): the "Time rows on the PDF" default, and the settings-file key
  `show_time_on_pdf`.
- feat(history): the labels "Revision sent" and the deadline send; admin status reads "Not
  sent yet".
- perf(client): the Review page loads as its own chunk.
- docs(ux): the docs/04 Review and Settings lines (+ vi).
- test: Review, submission, controls, sharing, settings transfer, History settings and the
  client models follow the new page.
- docs(handoff): the T02-FREEZE results, the T03 record and evidence, the T03-PATHS lookup,
  the board and the checkpoint (+ vi).

Task: WP5-UX5-T03 (owner decisions F-3 b, F-4, F-5 b, H-1 a; plan B3 and Addendum 3b)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: d23e3617 (was 1b413273)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T03-FREEZE/commit-message.txt`. Leave it, checks.txt and
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
