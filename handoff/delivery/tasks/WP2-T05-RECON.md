# WP2-T05-RECON dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T05-RECON; package WP2; kind diagnose;
  attempt 1. Reconcile an interrupted commit task; read-only.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy, record integrity), novelty no. Records in English.
- Read AGENTS.md from disk first, then [WP2-T05-FREEZE](WP2-T05-FREEZE.md) (the expected
  set and both attempt results) and [WP2-T05-PRIVSCAN](WP2-T05-PRIVSCAN.md).

## Why

Both committer attempts for WP2-T05-FREEZE were denied at `git add` by the auto-mode
classifier. The owner then committed and pushed the set manually from main, using the
commit-message text the coordinator prepared. The board needs the verified SHA, and the
commit needs the checks that the committer would have run.

## Hard limits

- Do not stage, commit, push, fetch into the working tree, reset, rebase or tag.
  `git add` was denied twice; do not attempt it in any form.
- Use read-only git commands only, for example `git rev-parse`, `git log`, `git show`,
  `git status --porcelain`, `git diff --name-status` and `git ls-remote origin
  refs/heads/main`.
- Write only this report and handoff/delivery/evidence/WP2-T05-RECON/.
- Do not record any author or committer name or email in the evidence. Record the SHA,
  the parent SHA, the subject and the date only.
- If any call is denied, stop and report it; do not retry or work around it.

## Checks (Node 24 on PATH; record `node --version`)

1. Identity:
   - HEAD SHA and branch;
   - the commits in `e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96..HEAD`. One commit is
     expected, with parent e92add0;
   - the remote main SHA from `git ls-remote`. Pushed means it equals HEAD.
2. Content:
   - compare the commit's `--name-status` list with the expected set in the WP2-T05-FREEZE
     brief, including the attempt-2 additions (the PRIVSCAN records);
   - report missing or extra paths;
   - confirm that no path outside that set was committed.
3. Message: the subject line and the presence of the `Task: WP2-T05-FREEZE` line.
4. Privacy over the committed files. Read the usage of scripts/precommit-check.mjs:
   - if it can scan a commit, a range or a list of files without staging, run it over the
     committed files;
   - otherwise run only its self-test and say that the committed-file scan was not
     possible.
5. Working tree: list `git status --porcelain`. The expected entries are the
   coordinator's later edits to handoff/delivery/ORCHESTRATION.json and
   WORKFLOW_REVISION_CHECKPOINT(.vi).md, plus this task's files. Report anything else.
6. Run `npm run digest`. It is expected to equal the WP2-T05 digest
   809215583bb42f398ba288f980dd680219d54b0433c8c977954450f7b5004ac0, because handoff/ is
   excluded.
7. Run the orchestration validator and check_recovery.py on the current board.

Evidence must be masked, LF and free of trailing whitespace, with a single final
newline. Append the results under Results.

Return at most 150 words, beginning with your self-reported model:
- HEAD and parent;
- pushed and the remote SHA;
- file count and any set differences;
- the subject;
- the privacy-scan result;
- the digest;
- validator and check_recovery exits;
- unexpected working-tree entries.

## Results

(Verifier appends here.)

### Attempt 1 result (verifier)

- Node v24.21.0. HEAD e768b71c2a5e522bdfece8617599992f8f4a0abc, parent e92add0; origin/main equals HEAD (pushed).
- The expected FREEZE commit does not exist. HEAD is the coordinator's "Record the WF-CAPS2 permission findings..." commit; no `Task: WP2-T05-FREEZE` line. It contains 23 modified tracked paths (src, tests, docs, handoff) and no new files.
- Still untracked: migration 0003, dayEntries.ts, two new tests, advisory review, 7 briefs, 6 evidence dirs. Committed tree therefore references files absent from git.
- Privacy scan of committed files not possible (index-only tool); self-test exit 0.
- Digest 809215583bb4...4ac0 (matches). Validator exit 0; check_recovery exit 0.
- Working tree: ORCHESTRATION.json modified plus the untracked set above; no other entries.
- Evidence: handoff/delivery/evidence/WP2-T05-RECON/recon.txt.
