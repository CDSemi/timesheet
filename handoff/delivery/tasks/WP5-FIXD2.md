# WP5-FIXD2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXD2; package WP5; kind fix;
  attempt 1; addresses audit WP5-FINAL-AUDIT. This is the remainder of WP5-F-01.
- Scope: WP5-REGATE observed that docs/11 section 11, line 274, still says the
  administrator screen shows "the sender mode and flag". This is the same class as
  WP5-F-01. The product shows only whether the sender is configured and the outbound
  mode. Fix that sentence. Then sweep the other docs for the same class of claim,
  and fix each one found.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size S,
  risk L, novelty no. The task record is in English. Canonical docs are EN, with a
  matching VI translation.
- Base: HEAD = origin/main = 9bcdd88faf782be4f16c139e29d07d279d2609e3. The source
  digest is 1b8ceae441a1f41a51086303cc12b8e06ddfe9fc405cf2d5bb01baba12896af7. Record
  HEAD and the digest before you start.
- Read AGENTS.md from disk first, then the WP5-REGATE results (the observation), and
  WP5-F-01 in `handoff/delivery/WP5_REVIEW_FINAL.md`. Check the status facts in
  `src/server/services/operationsStatus.ts` and
  `src/client/components/OperationsStatus.tsx`; read them, do not change them.

## Required work

1. docs/11 EN and VI, section 11: describe what the administrator status shows
   ("Sender address" configured or not, and "Outbound mode"), not a flag.
2. Grep these files, EN and VI, for any other claim that the administrator status,
   the screen or the operations JSON shows the sending flag or
   `PRODUCTION_SENDING_ENABLED`:
   - docs/05, docs/07, docs/11 and docs/12;
   - README;
   - `handoff/delivery/WP5_PILOT_PACKET.md`.

   Fix each such claim the same way, and list every hit and its fix. A sentence that
   correctly says the flag lives in the env file is not a hit.
3. Change nothing else: no application source, test, Compose or example change.

## Checks

- EN/VI parity of the changed sentences.
- The Grep from step 2 shows no remaining claim.
- `npm run verify`, with `SMOKE_PORT` in 47790–47799 and `DATA_DIR` and
  `DATABASE_PATH` set inside the task folder.
- The precommit check. Then run `validate_package.py --preflight` by its script path
  with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- `npm run digest` last.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\WP5-FIXD2`. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  anything recursively. Never write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Owned paths:
  - docs/05, docs/07, docs/11 and docs/12 (EN and VI);
  - `README.md` and `README.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`. Leave sections 0 and 6
    untouched; WP5-PKTID owns them;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-FIXD2/`, with masked LF `.txt` only.

  Write with the Edit tool. Do not commit.

Return at most 120 words, beginning with your self-reported model: the hits and fixes,
parity, the verify, precommit and preflight exit codes, and the final digest.

## Results

Base HEAD 9bcdd88f, base digest 1b8ceae4...96af7 (recorded before edits).

Hits and fixes (Grep of docs/05, 07, 11, 12, README, pilot packet, EN and VI):
- docs/11 EN and VI, section 12 (the brief's "section 11"), line 274: "sender mode and
  flag" replaced by "whether a sender address is configured ("Sender address") and the
  outbound mode ("Outbound mode"; never the sending flag, which lives only in
  `<env-file>`)". VI matches. This was the only hit.
- No hits in docs/05, 07, 12, README (the "flag is never set in development" sentence
  is correct) or the pilot packet (its status lines already say the status has no flag
  field). Other flag mentions are env-file statements, not hits.

Checks: EN/VI parity of the changed sentence yes. verify exit 0, precommit-check exit
0, preflight exit 0. Final digest after edits:
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.
Evidence: handoff/delivery/evidence/WP5-FIXD2/results.txt. Nothing committed.
