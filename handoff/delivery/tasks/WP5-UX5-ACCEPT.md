# WP5-UX5-ACCEPT dispatch brief (commit the WP5 re-acceptance records after UI change rounds 4 and 5, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-ACCEPT, package WP5, kind
  commit, attempt 1. It depends on WP5-UX5-ACCEPT-PACKET, WP5-UX5-ACCEPT-HANDOFF,
  WP5-UX5-ACCEPT-REVIEW and WP5-UX5-RECHECK-RN.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (handoff records only; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX20-FREEZE.md` (the rules in capitals,
  staging, no git configuration change), with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-ACCEPT`.
- **The coordinator writes no file while you run.**
- **This is a handoff-only commit.** Nothing outside `handoff/` may be staged or changed.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be a54061f6afc1fda00d4ee2cca4553a5916af24ec.
   - Run `git fetch origin`. origin/main must still be a54061f.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty. `git status --short` must show no path
   outside `handoff/`.
3. **D_PRE.** Run `npm run digest`. It must be
   690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f (882 files).
4. **Stage these:**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the pilot packet and the WP5 handoff,** each with its `.vi.md`;
   - **the review pair** `handoff/delivery/WP5_UX5_RECHECK_RN.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected: FIX20-FREEZE, REGATE16, RECHECK-RN, ACCEPT-PACKET, ACCEPT-HANDOFF,
     ACCEPT-REVIEW and ACCEPT;
   - **every new or changed folder under `handoff/delivery/evidence/` since a54061f,**
     staged as directories. Expected: `WP5-UX5-FIX20-FREEZE/`, `WP5-UX5-REGATE16/`,
     `WP5-UX5-RECHECK-RN/`, `WP5-UX5-ACCEPT-PACKET/`, `WP5-UX5-ACCEPT-HANDOFF/` and
     `WP5-UX5-ACCEPT-REVIEW/`.

   **Expected leftovers.** The four known untracked files stay out:
   - `WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `WP5-UX5-REGATE8/log-chain1.log`;
   - `WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears, list it and stop.
5. **Run steps 6 to 10 of the FIX20-FREEZE brief:**
   - owner process details;
   - file types and names;
   - the key, PEM, email and Message-ID scans;
   - `node scripts/precommit-check.mjs`, with the same allowed edits;
   - `git diff --cached --check`, the JSON parse, `validate_orchestration.py`,
     `check_recovery.py` (106) and `validate_package.py --preflight`.

   Any other failure stops the commit.
6. **Commit on main, then run `git push origin main`.** The push must fast-forward the
   remote from a54061f. Record the remote SHA. It must equal HEAD.
7. **The digest of the new HEAD,** in the ls-tree form and by `npm run digest`, must still
   be 690fd8fd. The release commit stays a54061f.
8. **Write the outputs.**
   - Write `checks.txt` and `commit-message.txt` in
     `handoff/delivery/evidence/WP5-UX5-ACCEPT/`.
   - Write a short Results section here.
   - Leave all of these unstaged.

## Commit message (refine with the commit-message skill)

Subject: Record the WP5 re-acceptance after UI change rounds 4 and 5 on a54061f

- docs(handoff): WP5-UX5-RECHECK-RN PASS on a54061f / 690fd8fd (882 files) with its review
  pair. It carries AUDIT-INT3's product verdict on a byte-identical build, and supersedes
  AUDIT-INT3 as the current acceptance.
- docs(handoff): the pilot packet names the release, the samples regenerated from dc487c6
  (byte-identical build), the REGATE11 drill, and the open owner decision R-UX5I2-3.
- docs(handoff): the WP5 handoff gains "Re-acceptance after UI change rounds 4 and 5
  (WP5-UX4, WP5-UX5)", with the history, the identity and the optional backlog.
- docs(handoff): REGATE16 (PASS), FIX20-FREEZE evidence, the board, the checkpoint (+ vi),
  STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-ACCEPT
Gate: WP5-UX5-REGATE16 PASS on a54061f
Audit: WP5-UX5-RECHECK-RN PASS on a54061f / 690fd8fd
Digest: 690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- the digest before and after;
- the staged counts per group;
- any unstaged or masked file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results
