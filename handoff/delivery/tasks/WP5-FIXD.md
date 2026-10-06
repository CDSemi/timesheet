# WP5-FIXD dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXD; package WP5; kind fix;
  attempt 1; addresses audit WP5-FINAL-AUDIT (FIX REQUIRED). It also fixes the
  WP5-ASSESS-A attempt-2 findings, which touch the same runbook lines.
- Scope: one bounded documentation fix. It covers:
  - WP5-F-01 and WP5-F-02 in [WP5_REVIEW_FINAL](../WP5_REVIEW_FINAL.md);
  - WP5-A2-01 and WP5-A2-02 in [WP5_REVIEW_A2](../WP5_REVIEW_A2.md);
  - the small runbook risks listed below.

  No application source, test, Compose or example change.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size S,
  risk M (activation and deactivation instructions), novelty no. The task record is in
  English. Canonical docs are EN, with a matching VI translation.
- Base: HEAD = origin/main = 74d5bfec6700126da4105b5d97f5efe943f896f5. The source
  digest is 0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba. Record
  HEAD and the digest before you start.
- Follow [FIX_FINDINGS](../../prompts/FIX_FINDINGS.md). Read AGENTS.md from disk first,
  then both reviews' "Findings" and "Risks" sections, and their evidence:
  - `17-check-live.txt`, `18-activation-browser-run2.txt` and `19-env-reread.txt` in
    `evidence/WP5-FINAL-AUDIT/`;
  - `08-admin-operations.txt` and `08-probe-log-run2.txt` in `evidence/WP5-ASSESS-A2/`.

## Required changes

In `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`, sections 13–16 only, and in
`handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`:

1. **WP5-F-01 and WP5-A2-01, the sending-flag checks.**
   - Wherever a check says the administrator status shows "the flag off" or "the flag
     on", name what the screen actually shows: "Outbound mode: Capture only (nothing
     leaves the server)" or "SMTP (real sending)", and the activation state.
   - Check the flag in `<env-file>` itself without printing values, for example with
     `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>`, which prints 0 or 1.
     At deactivation it must print 0.
   - Correct the refusal sentence. The server refuses to start in SMTP mode without
     the flag, and so do the CLI commands that read the mail settings (`backup`,
     `restore`). Other commands do not.
   - Apply the same corrections to packet section 2 (capture-mode self-test) and
     section 6, step 1.
2. **WP5-A2-02, the deep-link check.**
   - Replace the self-test bullet. Open `https://<nas-host>/#/review/<payroll-date>`;
     it must ask for sign-in and then open the review.
   - Add a check of the first reminder's link after the activation instant is set,
     in section 13 step 5 or 7.
3. **WP5-F-02, packet section 8.**
   - Say that an answer differing from the current default for D-3, D-5, D-6 or D-8
     causes a fix round (fix, freeze, gate, independent audit) before activation.
   - Say that the release identity in sections 0 and 6 is then refreshed.
4. **Small risks, in the same sections only:**
   - R-A2-1: correct the wording about a send captured after deactivation.
   - R-A2-2 and R-F1: for an inspection-only restored instance, point
     `TIMESHEET_ENV_FILE` at the protected capture-mode copy kept in section 13.
   - R-F4: state once that the data, backup and Docker commands need root (`sudo -i`)
     on DSM.
   - R-F5: say that the status shows the activation instant in the browser's zone,
     without a zone label.
   - R-F6: say that the browser may ask the operator to type "allow pasting" before
     a pasted line runs.
5. Do not edit packet sections 0 and 6 for the release identity (commit, digest, image
   ID). A later handoff-only task refreshes them after the new freeze and gate. Leave
   R-F2 (promoting restored data) for the backlog.

## Checks

- EN/VI parity for docs/11 and the packet.
- Grep: no remaining "flag off" or "flag on" claim about the status, and no deep-link
  check left in the capture self-test.
- `npm run verify`, with `SMOKE_PORT` in 47790–47799 and `DATA_DIR` and
  `DATABASE_PATH` set inside the task folder.
- The precommit check, then `validate_package.py --preflight`. Run the preflight by
  its script path with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Do not call python in any other way.
- `npm run digest` last. Rerun it if any file changes afterwards.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\WP5-FIXD` for TEMP/TMP and raw output.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  anything recursively. Never write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Owned paths:
  - `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-FIXD/`, with masked LF `.txt` only.

  Do not commit.

Return at most 150 words, beginning with your self-reported model: the changed lines by
finding, parity and Grep results, verify, precommit and preflight exit codes, and the
final digest.

## Results

Self-reported model: claude-sonnet-5-5. Base HEAD 74d5bfec6700126da4105b5d97f5efe943f896f5; base digest 0a64a75f…01ba.

Changed (docs/11 EN+VI sections 13-16; packet EN+VI sections 1, 2, 6, 8; no section 0/6 identity edit):
- F-01 / A2-01: s13 step 2 bullet 1, step 4 bullets 2-3, s14 step 4 and packet s2 box 1, s6 step 1 now name "Outbound mode: Capture only (nothing leaves the server)" / "SMTP (real sending)", the activation state, and `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` (0 or 1; 0 at deactivation). Refusal sentence: server, plus `backup` and `restore`, not other commands.
- A2-02: s13 step 2 deep-link bullet replaced by opening `https://<nas-host>/#/review/<payroll-date>`; new s13 step 7 bullet checks the first reminder's link; packet s1 deep-link box matched.
- F-02: packet s8 now says a differing D-3/D-5/D-6/D-8 answer causes a fix round before activation and the identity in sections 0 and 6 is refreshed.
- R-A2-1 (s14 step 2), R-A2-2 and R-F1 (s15 step 5), R-F4 and R-F6 (s13 intro), R-F5 (s13 step 5).

Checks: parity by grep counts EN=VI (docs/11: 22 headings, 76 steps, 63 bullets, 33 table rows, 13 boxes; packet: 21, 6, 49, 128, 35). Grep for flag off/on, cờ tắt/bật and a deep link in the capture self-test: no match. verify exit 0 (SMOKE_PORT 47790, DATA_DIR and DATABASE_PATH in the task folder), precommit exit 0 (0 staged files), preflight exit 0. Evidence: evidence/WP5-FIXD/. Final digest (run last): 1b8ceae441a1f41a51086303cc12b8e06ddfe9fc405cf2d5bb01baba12896af7, 779 files (only docs/11 EN and VI changed outside handoff/).
