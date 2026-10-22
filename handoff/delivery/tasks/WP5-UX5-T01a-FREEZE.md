# WP5-UX5-T01a-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T01a-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T01a (done).
- **What this commit freezes.** Round-5 slice T01a:
  - the signer comes from the account (`signer_name` is accepted and ignored);
  - the signature image is optional;
  - migration `0014_signoff_optional_image`;
  - docs 03, 04, 05, 06 and 10, and DEVELOPMENT (+ vi).
- **Coordinator records it also carries:**
  - the FIX3-FREEZE results and evidence;
  - the round-5 plan Addenda 2, 3 and 3b with the re-rendered mockup;
  - the T01a record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  57c41e8e43fb6e10df654294361818e59bff86ca.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T01a-FREEZE`.
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

## Expected working-tree set outside handoff/ (39 paths: 38 modified, 1 new)

- **server (7):**
  - new: `src/server/db/migrations/0014_signoff_optional_image.ts`;
  - modified: `src/server/db/migrations.ts`, `src/server/services/finalization.ts`,
    `src/server/jobs/pdfJob.ts`, `src/server/pdf/timesheetPdf.ts`,
    `src/server/http/schemas.ts`, `src/server/routes/submission.ts`.
- **client (4):** `src/client/components/reviewModel.ts`, `ReviewSignoff.tsx`,
  `ReviewEnvelope.tsx`, and `src/client/ReviewScreen.tsx`.
- **scripts (2):** `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs`. These
  are not governance paths. `scripts/precommit-check.mjs` must be unchanged.
- **docs (12):**
  - `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/04_UX_AND_SETTINGS.md`,
    `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`, `docs/06_TEST_AND_ACCEPTANCE.md` and
    `docs/10_DECISIONS_AND_SOURCES.md`, each with its `.vi.md`;
  - `DEVELOPMENT.md` and `DEVELOPMENT.vi.md`.
- **tests (14):**
  - `tests/client/reviewModel.test.ts`;
  - integration: `finalization.test.ts`, `corrections.test.ts`, `ac13-two-week.test.ts`,
    `finalization-concurrency.test.ts`, `jobs.test.ts`, `pdf-render.test.ts`,
    `migrations.test.ts`, `job-retention.test.ts`, `workbook-import.test.ts`,
    `restore.test.ts`;
  - e2e: `review.spec.ts`, `submission.spec.ts`, `history-settings.spec.ts`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop. One exception: if exactly one listed path is unchanged, or one more test file under
`tests/` is changed, report it and stop anyway. The coordinator then corrects the list.

Any of these also stops the commit:
- a `package.json` or lockfile change;
- `scripts/precommit-check.mjs`;
- the AGENTS or CLAUDE files, or `.claude/`;
- the validators;
- a `zz-*` probe;
- a font or other binary file;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
783a63f80184da809ca55c4a88f6743bbc049ef2ce28d58237864df1902ee27b (851 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md` (its Results);
  - `handoff/delivery/tasks/WP5-UX5-PLAN.md` (Addenda 2, 3 and 3b);
  - the files in `handoff/delivery/design/WP5-UX5/` that were re-rendered: `mockup.html`
    and the affected `-synthetic.png`.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-FIX3-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T01a.md`;
  - `handoff/delivery/evidence/WP5-UX5-T01a/` (`.txt` files);
  - this brief, as it stands before you append results.

**Design folder.**
- Every name is `mockup.html` or ends in `-synthetic.png`. Grep `mockup.html` for `@`; only
  `@example.invalid` is allowed.
- No file there may contain or be a copy of the owner's reference image. That image is not
  in the repository and must not be.

**Key and PEM scan** on the new evidence folders, with the rule of
`WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification in checks.txt.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX4-*.md` or `WP5-UX5-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX4-*/` or
    `WP5-UX5-*/`;
  - a file under `handoff/delivery/design/WP5-UX5/` that follows the design-folder rule;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- An email other than `@example.invalid` stops the commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T01a-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (783a63f8…).
4. The set comparison, the design-folder Grep, and the key and PEM scan.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test, script or docs file stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX5-T01a: sign as the account holder, signature image optional

- feat(signoff): the signer is the signed-in account holder.
  - The typed name is gone. `signer_name` is still accepted in the request but ignored.
  - The sign-off records the account's display name.
- feat(signoff): the signature image is optional (owner decision F-5 b).
  - With a saved image, the sign-off records the image and the name; without one, the name
    only.
  - A changed image after the review still gives 409.
- feat(db): migration 0014 rebuilds `signoffs` with a nullable image column, keeping its
  triggers and immutability.
- feat(pdf): a sign-off without an image prints the name only.
- feat(ui): the Review sign-off shows "You sign as <name>", and a Settings link when no
  image is saved.
- test: a v13-to-v14 migration test; name-only and with-image sign-off, PDF and job tests;
  the e2e follows.
- chore(scripts): the smoke and drill scripts no longer send a typed name.
- docs: docs/03, 04, 05, 06 (AC-06), 10 and DEVELOPMENT (+ vi).
- docs(handoff):
  - the FIX3-FREEZE results;
  - the round-5 plan Addenda 2, 3 and 3b with the re-rendered mockup;
  - the T01a record;
  - the board and the checkpoint (+ vi).

Task: WP5-UX5-T01a (owner decision F-5 b; round-5 plan B-A3)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 783a63f8 (was 7af8e935)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T01a-FREEZE/commit-message.txt`. Leave it, checks.txt
and this brief's Results unstaged after the commit.

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

STOPPED, no commit (attempt 1). HEAD = origin/main = 57c41e8e43fb6e10df654294361818e59bff86ca
before; unchanged. Digest 783a63f8... (851 files) matched. 60 files staged (39 outside handoff,
21 handoff); no extra handoff paths. precommit 0, diff --check 0, validate_package --preflight 0.
FAILED: validate_orchestration.py and check_recovery.py exit 1, ValueError "Invalid task ID": the
validator regex `[A-Z0-9-]+` rejects the lowercase `a` in the board task ID WP5-UX5-T01a. Needs a
coordinator decision (rename the task ID or change the validator). Files remain staged. See
evidence/WP5-UX5-T01a-FREEZE/checks.txt.

### Attempt 2

Attempt 1 stopped on the lowercase task ID; the coordinator renamed the board IDs and I re-staged
ORCHESTRATION.json and the checkpoint pair. HEAD before = origin/main = 57c41e8; commit
c1b2cc4f31cc9a3957a04056a8dff413977b97b5, pushed, remote SHA = same. Digest before add and after
commit (clean tree) 783a63f8... (851 files). Staged: 60 files (39 outside handoff, 21 handoff);
no extra handoff paths. Checks all exit 0: precommit (60 files, 0 findings), diff --cached --check,
JSON parse (ORCHESTRATION, STATE), validate_orchestration, check_recovery, validate_package
--preflight, fetch, push --dry-run, push. No masking. Slips: one stray `python -c "x"` with a
/dev/null redirect (no effect), and the brief (with the attempt-1 note) was staged; this
Attempt 2 text and checks.txt are unstaged.
