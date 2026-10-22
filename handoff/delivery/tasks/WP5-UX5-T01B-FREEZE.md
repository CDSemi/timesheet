# WP5-UX5-T01B-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T01B-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T01B (done).
- **What this commit freezes.** Round-5 slice T01B:
  - sign-off no longer sends;
  - each send is its own record, with an editable envelope, PDF switches and the owner's
    reason rule;
  - PDF variants;
  - migration `0015_sends`;
  - the deadline send and reminders (F-2 a);
  - transitional UI wiring;
  - docs 01, 03, 05, 06, 10 and DEVELOPMENT (+ vi).
- **Coordinator records it also carries:**
  - the T01A-FREEZE results and evidence;
  - the T01B record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size L, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is defined in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  c1b2cc4f31cc9a3957a04056a8dff413977b97b5.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T01B-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
    Several `git add` calls are fine. Write the path list to a file in your task folder
    first, and stage from it in batches.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## The expected set outside handoff/ (defined by rule)

The worker changed many files. Instead of a hand-written list, the set is defined by these
rules. Check every changed or untracked path outside `handoff/` against them, and record
the full list with the rule each path meets.

1. **New files: exactly three, no more.**
   - `src/server/db/migrations/0015_sends.ts`;
   - `tests/integration/sends.test.ts`;
   - `tests/support/sends.ts`.
2. **Modified files** may only be under these owned paths of WP5-UX5-T01B (board
   `owned_paths`):
   - server:
     - `src/server/db/migrations.ts`;
     - services: `finalization.ts`, `deliveries.ts`, `automation.ts`,
       `notifications.ts`, `operationsStatus.ts`, `submissionSettings.ts`;
     - jobs: `sendJob.ts`, `pdfJob.ts`;
     - `src/server/mail/message.ts`, `src/server/pdf/timesheetPdf.ts`;
     - routes: `submission.ts`, `shares.ts`, and the settings route file;
     - `src/server/http/schemas.ts`;
   - domain: `src/domain/snapshot.ts`, `src/domain/reminders.ts`;
   - client:
     - `src/client/api.ts`, `src/client/ReviewScreen.tsx`, `src/client/HistoryScreen.tsx`;
     - components: `ReviewSignoff.tsx`, `reviewModel.ts`, `DeliveryHistory.tsx`,
       `DeliveryConfirm.tsx`, `deliveryModel.ts`, `DeliveryRevision.tsx`,
       `DeliveryAttempts.tsx`, `OperationsStatus.tsx`;
   - scripts: `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs`;
   - tests: anything under `tests/integration/`, `tests/client/` or `tests/support/`, and
     these e2e specs: `review.spec.ts`, `submission.spec.ts`, `history-settings.spec.ts`,
     `automation.spec.ts`, `sharing.spec.ts`, `admin-status.spec.ts`;
   - docs: `docs/01_PRODUCT_REQUIREMENTS.md`, `docs/03_ARCHITECTURE_AND_DATA.md`,
     `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`, `docs/06_TEST_AND_ACCEPTANCE.md` and
     `docs/10_DECISIONS_AND_SOURCES.md`, each with its `.vi.md`; `DEVELOPMENT.md` and
     `DEVELOPMENT.vi.md`.
3. **Always stops the commit:**
   - a path that meets neither rule;
   - a deleted file;
   - `package.json` or a lockfile;
   - `scripts/precommit-check.mjs`;
   - the validators;
   - the AGENTS or CLAUDE files, or `.claude/`;
   - any migration other than the new `0015`, or a change to an existing migration file;
   - a font or other binary file;
   - a `zz-*` probe.

   Report the exact paths and stop.

Recompute the digest with Node 24 immediately before `git add`. It must equal
089cf86879b11cb8eedbb29aa5d8f0573815672ff691227fe3db73209c9811d1 (854 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T01a-FREEZE.md` (its Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T01a-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T01B.md`;
  - `handoff/delivery/evidence/WP5-UX5-T01B/` (`.txt` files);
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders, with the rule of
`WP5-UX4-FIX3-FREEZE.md`. Record the hits and their classification.

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
- An email other than `@example.invalid` or a `@timesheet.invalid` Message-ID stops the
  commit.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T01B-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (089cf868…).
4. The rule-based set check, with the full path list and the rule each path meets, and the
   key and PEM scan.
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

## Addendum 1 (coordinator, for attempt 2 by a fresh committer)

- **Why attempt 1 stopped.** It ran `git add --pathspec-from-file=<list>` for 96 paths. The
  permission check denied it with "[Credential Leakage]", because the staged paths were not
  visible in the command. Nothing was staged.
- **The owner decided** (2026-10-22, verbatim: "1 a, 2 a"; question 1 = option a): a fresh
  committer stages the same paths as **explicit arguments** in several plain `git add`
  calls. No list file is used.
- **The staging rule replaces the earlier one:**
  - **Never** use `--pathspec-from-file`, `xargs`, a list file, a glob, `git add -A`, `.`
    or a directory argument. The one exception: an evidence folder named in "Handoff files
    to stage" may be given as its directory path.
  - Name every path outside `handoff/` literally, at most about 20 paths per `git add`
    call, grouped by directory: server, domain, client, scripts, docs, then tests.
  - Each call is its own command, not chained with others.
- **If any `git add` call is denied:**
  - stop at once;
  - unstage nothing further;
  - report the exact denial text and the calls that succeeded.
  - The owner will then commit manually. Do not retry in another form.
- Everything else in the brief is unchanged: the rule-based set check, the scans, the
  digest, all checks, and the commit message. Write the results under "### Attempt 2", with
  one line on the attempt-1 stop.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX5-T01B: sign off and send are separate acts

- feat(signoff): sign-off, corrections and late reviews create the signed revision and its
  PDF only. Nothing is sent by signing.
- feat(sends): each send is its own immutable record.
  - It carries To, Cc, subject, body and the Time and OT row switches.
  - It is idempotent by request key.
  - The send job builds the email from that record.
- feat(sends): once a copy of a period has been accepted or is uncertain, another send needs
  a confirmation and a typed reason. The reason is 2-500 characters, audited and never put
  in the email. (Owner rule F-4.)
- feat(pdf): up to four stored PDF variants per revision (Time and OT rows on or off), with
  a "Time rows on the PDF" default in Settings. (Owner decision F-3 b.)
- feat(automation): at the deadline, with auto-submit on, a signed but unsent period is
  sent; with auto-submit off, it is marked overdue. Reminders stop at the first send.
  (Owner decision F-2 a.)
- feat(db): migration 0015 adds the PDF variants, the send records with a backfill for
  existing sends, and the new Settings column.
- feat(ui): the Review page signs off, then sends with the defaults, until the Send card
  arrives; History resends with a reason.
- test: a new sends suite, a v14 upgrade test, and adapted integration, fixture and e2e
  tests; five mutants caught.
- docs: docs/01 (FR-11), 03, 05, 06, 10 and DEVELOPMENT (+ vi).
- docs(handoff): the T01A-FREEZE results, the T01B record and evidence, the board and the
  checkpoint (+ vi).

Task: WP5-UX5-T01B (owner decisions F-2 a, F-3 b, F-4; round-5 plan B-A1, B-A2, B-A4)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 089cf868 (was 783a63f8)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T01B-FREEZE/commit-message.txt`. Leave it, checks.txt
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

### Attempt 2

- Attempt 1 stopped: `git add --pathspec-from-file` was denied ("[Credential Leakage]"); nothing staged.
- HEAD before c1b2cc4f31cc9a3957a04056a8dff413977b97b5; after and commit SHA
  9917ae8443f46cc3fc2dce79214176ff04bc01ba; pushed yes; remote SHA the same; branch main.
- Digest before add and after commit: 089cf86879b11cb8eedbb29aa5d8f0573815672ff691227fe3db73209c9811d1 (854 files).
- Staged 96: 16 server, 2 domain, 11 client, 2 scripts, 12 docs, 36 tests (incl. 3 new files: 0015_sends.ts in server, sends.test.ts, support/sends.ts), 17 evidence T01B, 2 evidence T01a-FREEZE, handoff records 7 (incl. this brief). No extra handoff paths.
- Checks (all exit 0): precommit, diff --cached --check, JSON parse, validate_orchestration, check_recovery (106), validate_package --preflight; details in evidence/WP5-UX5-T01B-FREEZE/checks.txt.
- Scan: one BEGIN line (T01a-FREEZE/checks.txt:7, prose, benign); no base64 runs.
- No masking, no fixes, no stops. One empty heredoc to a scratch file was run by mistake (file deleted).
