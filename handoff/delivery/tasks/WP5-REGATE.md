# WP5-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-REGATE; package WP5; kind gate;
  attempt 1; depends on WP5-FIXD-FREEZE.
- Scope: rerun the WP5 package-final gate on the documentation fix freeze. WP5-FIXD
  changed only docs/11 (EN and VI) sections 13–16 outside handoff/, plus the pilot
  packet.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` is the WP5-FIXD-FREEZE commit, given in the dispatch prompt.
  Compute the digest of record on a clean export, and cross-check it with the
  `git ls-tree` form and the repository digest.

## Read

- AGENTS.md from disk first.
- [WP5-GATE](WP5-GATE.md), its gate items, results and evidence. You rerun that
  method.
- The WP5-FIXD results, and the findings it addresses in
  [WP5_REVIEW_FINAL](../WP5_REVIEW_FINAL.md) and [WP5_REVIEW_A2](../WP5_REVIEW_A2.md).

## Gate items

1. Rerun WP5-GATE items 1–9 on the new freeze, with the same runtime limits:
   - clean export, `npm ci`, lint and verify;
   - e2e;
   - AC-13 three times;
   - the drill `--wp3`;
   - the docs/11 compose config forms;
   - env keys, audit and validators;
   - the digest last.
2. **AC-13 under real time zones (R-A2-3).** Git Bash drops a `TZ` variable set on the
   command line. Write a small wrapper script file in the task folder that sets
   `process.env.TZ` before the test runner starts. Alternatively, launch vitest
   through Node with the zone set in the child environment, and check that it took
   effect. Run the AC-13 test under `Asia/Tokyo` and `America/New_York`. Record the
   zone the test process reports, which must not be the machine zone, and the
   result.
3. **Fixed lines.** Grep docs/11 (EN and VI) and the packet:
   - no claim that the status shows a sending "flag";
   - the `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` check is present
     in section 13 and section 14;
   - the refusal sentence names the server, `backup` and `restore`;
   - no deep-link check remains in the capture self-test;
   - a first-reminder link check exists;
   - packet section 8 describes a fix round before activation.
4. Check the diff scope since 74d5bfe: only docs/11 (EN and VI) outside handoff/.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-REGATE`. Ports 47740–47759, with
  `SMOKE_PORT` in that range.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use Compose project `ts-wp5-regate` and non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-regate`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Call
  python only as the workflow Python running a named script by path.
- Never pipe into head or tail. Stop only processes you spawned, through their own
  handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local capture only.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-REGATE/`, with wrapper scripts saved as `*.mjs.txt`.
Record the drill image ID; the packet identity refresh uses it. Decide PASS, FAIL or
NOT VERIFIED. NAS items stay NOT VERIFIED. Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 9bcdd88faf782be4f16c139e29d07d279d2609e3 (HEAD = origin/main before and after).
Node v24.21.0 portable, Git Bash, codex-runtime Python for the three validators. Raw output `D:\.claude-tmp\timesheet\WP5-REGATE`;
masked LF evidence in `handoff/delivery/evidence/WP5-REGATE/`. DATA_DIR and DATABASE_PATH inside the task folder; SMOKE_PORT 47741.

Digest of record `1b8ceae441a1f41a51086303cc12b8e06ddfe9fc405cf2d5bb01baba12896af7`, 779 files (handoff/ excluded): equal in three
forms (clean `git archive` export with `git hash-object --no-filters`, `git ls-tree` form, `npm run digest`); equals the committer's
value; recomputed last, unchanged.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci` exit 0 (lockfile identical); lint exit 0; `npm run verify` exit 0 | 77 files, 1759 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 2 | `npm run test:e2e` exit 0 | 145 passed, 5 skipped (4.0 min) |
| 3 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 3.00 s, 2.91 s, 2.97 s |
| 3b | AC-13 under real zones (R-A2-3), wrapper `run-tz.mjs.txt` sets TZ in the vitest child env; a probe test in the same run printed the zone the process saw. Machine zone America/Los_Angeles | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 tests passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 tests passed, exit 0 |
| 4 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server) | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:bd17d06185d205fb08bf90ee4de0d25190b7f3bf6b32f01151c9de99b7455f49` (110002055 B); forbidden-file scan PASS |
| 5 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3; live `ts-wp5-regate`, `<task>/cfgproj/data`; restored `-restored` + restore dir; rollback `-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"` |
| 6 | env keys of docs/11 and 12 | all in `.env.example` or `config.ts` (JOB_RUNNER in `index.ts`); TIMESHEET_DATA_DIR/IMAGE/PORT in `compose.example.yaml`, NODE_IMAGE_DIGEST in `Dockerfile`; SQLITE_BUSY, WP5_HANDOFF are not env keys |
| 7 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight, validate_orchestration, check_recovery: exit 0/0/0, all PASS; precommit self-test PASS (12 rules); precommit over this evidence folder PASS (29 files, 0 findings) | |
| 8 | Scope 74d5bfe..9bcdd88 outside handoff/ | only `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (195 further paths are under handoff/) |
| 9 | Digest last | see above |

Fixed lines (Grep, `14-fixed-lines.txt`): status-flag claim gone from sections 13 and 14 and the packet (13 step 2 says the status
has no field for the sending flag); `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` present in section 13 (steps 2, 4) and
section 14 (step 4), EN and VI, and in the packet; refusal sentence names the server, `backup` and `restore` (EN line 310, VI line 310);
capture self-test: the old "deep link in a captured message" check is replaced by manually opening `https://<nas-host>/#/review/<payroll-date>`
(the fix A2-02 recommended; the text says a captured submission holds no link), and a first-reminder link check exists (section 13 step 7,
line 335, EN and VI); packet section 8 describes a fix round before activation (EN and VI).

Observation (Low, not one of the A2/FINAL finding lines, unchanged since 74d5bfe): docs/11 section 11 line 274 (VI 274) still says the
administrator screen shows "the sender mode and flag". The product shows sender configured and outbound mode only. Wording fix for the
coordinator; it does not change the decision.

Cleanup: drill image `ts-wp5-regate-timesheet:drill` removed by exact tag, project `ts-wp5-regate` down -v; `docker ps --all --filter
name=ts-wp5-regate` empty; no image, network or volume of the project remains; no listener on 47740-47759. Nothing committed, sent or
edited outside this brief and the evidence folder. NAS target NOT VERIFIED (owner steps, sections 13-16). Failing items: none.
