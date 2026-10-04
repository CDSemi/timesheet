# WP2-T11-RECON dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T11-RECON; package WP2; kind diagnose;
  attempt 1. A read-only check of the owner's manual WP2-T11-FREEZE commit.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy, record integrity), novelty no. Records in English.
- Read AGENTS.md from disk first. Then read the expected set and the attempt-1 result in
  [WP2-T11-FREEZE](WP2-T11-FREEZE.md), including the WP2-T13.md addition.
- The WP2-T05 recheck in [WP2-T05-RECON2](WP2-T05-RECON2.md) shows the format to follow.

## Why

The committer's staging call was denied by the auto-mode classifier. The owner then
committed and pushed the set from the IDE. Before committing, the owner was asked to run
`git add -A` and `node scripts/precommit-check.mjs`. The board needs the verified SHA,
and the checks the committer would have run.

## Hard limits

- Do not stage, commit, push, fetch into the working tree, reset, rebase or tag. Never
  attempt `git add` in any form.
- Use read-only git commands only: `rev-parse`, `log`, `show`,
  `diff --name-status`, `ls-tree`, `ls-files`, `status --porcelain` and
  `ls-remote origin refs/heads/main`.
- Record no author or committer name or email in the evidence.
- Do not print the bodies of test files, CSV samples or seeding code in commands. For any
  content check, use the Grep tool, and report only file:line and a masked value: at most
  the first four characters followed by "…".
- Write only this report and handoff/delivery/evidence/WP2-T11-RECON/.
- If any call is denied, stop and report it; do not retry or work around it.

## Checks (Node 24 by full path; record `node --version`)

1. Identity:
   - HEAD and its parent;
   - the commits in `26fa7c9f5a2dda1c2b9ab73122934ede04cf186f..HEAD` (one is expected);
   - whether the remote main equals HEAD (pushed).
2. Content:
   - compare the commit's `--name-status` list with the expected set and report missing
     or extra paths;
   - confirm with `ls-tree` that the HEAD tree has src/client/OtScreen.tsx,
     src/client/HistoryScreen.tsx and tests/e2e/ot-leave.spec.ts;
   - confirm that no `.csv` file, Playwright output or server file was committed.
3. Message: the subject and the `Task: WP2-T11-FREEZE` line. Confirm that the commit is
   not an amend: its parent is 26fa7c9.
4. Leftovers:
   - `git ls-files --others --exclude-standard` should list only this task's own files;
   - `git status --porcelain` should list only coordinator edits made after the commit
     (handoff/delivery/ORCHESTRATION.json and WORKFLOW_REVISION_CHECKPOINT(.vi).md).
   - Report anything else.
5. Privacy, read-only, Grep tool only, over the files the commit added or changed. Look
   for:
   - credential-like values;
   - emails outside reserved domains;
   - user-profile paths;
   - personal names other than the synthetic personas.
   Classify each hit as synthetic, digest/SHA, allowlisted or potentially real, and apply
   the precommit rules by hand.
6. Run `npm run digest`. It is expected to be
   afe8e004f215e0b9c2200ecec54053b0db85cc8de877095d93fbf82faba3e8ba.
7. Run the orchestration validator and check_recovery.py.

Evidence must be masked, LF and free of trailing whitespace, with a single final
newline. Append the results under Results.

Return at most 150 words, beginning with your self-reported model:
- full HEAD and parent;
- pushed;
- set differences;
- the three files present;
- subject;
- leftovers;
- privacy result;
- digest;
- validator and check_recovery exits.

## Results

- HEAD 55d3bb808836a0217de45470f5b743f9e5b9a667, parent 26fa7c9 (not an amend); one commit in range; remote main equals HEAD (pushed).
- Set differences: none missing, none extra. The three files are present in the HEAD tree. No .csv, Playwright output or server file.
- Subject and Task: WP2-T11-FREEZE line confirmed.
- Leftovers: untracked only this brief; modified ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT(.vi).md and tasks/WP2-T12.md (the last is an extra post-commit edit).
- Privacy: no hits needing action (fixtures.ts:76-77 are example.invalid).
- Node v24.21.0; digest afe8e004... before and after (matches); validator exit 0; check_recovery exit 0.
- Evidence: handoff/delivery/evidence/WP2-T11-RECON/checks.txt.
