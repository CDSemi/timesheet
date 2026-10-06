# WP5-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-GATE; package WP5; kind gate;
  attempt 1; depends on WP5-REL-FREEZE (the WP5 package-final freeze).
- Scope: the package-final WP5 gate. It covers AC-13, plus every required gate that is
  still open: a complete reproducible release, a verified restore, and no blocking
  integrity, privacy or submission defect, all on the freeze that WP5 will be accepted
  on.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` is the WP5-REL-FREEZE commit, given in the dispatch prompt.
  The digest of record is computed on a clean export and cross-checked with the
  `git ls-tree` form and the repository digest.

## Read

- AGENTS.md from disk first.
- [WP5-PLAN](WP5-PLAN.md), sections B, E and G.
- The WP4-REGATE4 brief and evidence, for the gate method used so far.
- The results of WP5-FIXB, WP5-AC13 and WP5-REL.

## Gate items

1. Make a clean export of the freeze. Run `npm ci`; the lockfile must stay unchanged
   and no deprecation line may appear. Then `npm run lint` and `npm run verify`.
2. Run `npm run test:e2e` on the installed Edge channel.
3. Run the AC-13 integrated test alone, three times
   (`tests/integration/ac13-two-week.test.ts`). Record each duration.
4. Run `npm run drill:container -- --work <task>/drill --project ts-wp5-gate --wp3 <task>/wp3`,
   stages 1–6, with `git archive 49651c8` prepared in `<task>/wp3`. Record the
   per-stage summary, the image ID and the forbidden-file scan.
5. Runbook fidelity for WP5-B-01 and WP5-B-02. Run `docker compose config` for each
   documented form in docs/11: the live instance, the restored instance and the
   rollback to the previous tag. Use synthetic placeholder values in a scratch
   project folder, and start no container from these configs. Check that docs/11
   section 4 keeps the protected env-file copy and the release identity.
6. For every env key named in docs/11 and docs/12, confirm by Grep that it exists in
   `.env.example` or `src/server/config.ts`.
7. Run `npm audit --omit=dev` and the precommit check, `validate_package.py --preflight`
   with the workflow Python, the orchestration validator and `check_recovery.py`.
8. Check the diff scope since 546cdda: only the WP5-FIXB, WP5-AC13 and WP5-REL paths,
   plus handoff records.
9. Compute the digest of record last.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-GATE`. Ports 47740–47759, with
  `SMOKE_PORT` in that range.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use Compose project `ts-wp5-gate` and non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-gate`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local capture only.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-GATE/`. Decide PASS, FAIL or NOT VERIFIED. NAS-specific
items stay NOT VERIFIED and do not fail the gate by themselves. Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 74d5bfec6700126da4105b5d97f5efe943f896f5 (HEAD = origin/main before and
after). Node v24.21.0 portable, Git Bash, Python from the codex runtime (the system Python 3.14 lacks tzdata and stops
validate_package at times()). Raw output `D:\.claude-tmp\timesheet\WP5-GATE`; masked LF evidence in
`handoff/delivery/evidence/WP5-GATE/`. DATA_DIR and DATABASE_PATH set inside the task folder; SMOKE_PORT 47741/47742.

Digest of record `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 files (handoff/ excluded): equal in
three forms (clean `git archive` export hashed with `git hash-object --no-filters`, `git ls-tree` form, `npm run digest`).
Equals the committer's claim; recomputed last, unchanged.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci` exit 0 (lockfile cmp identical); lint exit 0; `npm run verify` exit 0 | 77 files, 1759 tests passed, SMOKE PASSED; NODE_OPTIONS `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 2 | `npm run test:e2e` exit 0 | 145 passed, 5 skipped (4.6 min) |
| 3 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 4.08 s, 4.07 s, 4.13 s |
| 4 | drill, `--wp3` = `git archive 49651c8` + npm ci + build:server | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:0addd2000b42...9fd8` (110002055 B); forbidden-file scan PASS |
| 5 | `docker compose config` (live, restored, rollback; synthetic scratch project, no container) | exit 0 x3; live binds `<project>/data`, `timesheet:aaaaaaa`; restored: own project name `-restored`, restore dir; rollback: `-rollback`, previous tag, restore dir, `JOB_RUNNER: "off"` from the rollback env file. docs/11 section 4 step 3 keeps the protected env-file copy (mode 600) with the release commit, source digest and image ID |
| 6 | Env keys of docs/11 and 12 | All present in `.env.example` or `src/server/config.ts` (JOB_RUNNER read in `src/server/index.ts`, documented in `.env.example`). Not in either: TIMESHEET_DATA_DIR/IMAGE/PORT (Compose variables, in compose.example.yaml), NODE_IMAGE_DIGEST (Dockerfile ARG), SQLITE_BUSY, WP5_HANDOFF (not env keys) |
| 7 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight, validate_orchestration, check_recovery exit 0/0/0, all PASS; precommit `--self-test` PASS (12 rules); precommit over this evidence folder PASS (22 files, 0 findings) | |
| 8 | Diff scope 546cdda..74d5bfe, non-handoff | .env.example, compose.example.yaml, docs/11 and docs/12 (EN, VI), README (EN, VI), tests/integration/ac13-support.ts and ac13-two-week.test.ts: only WP5-FIXB, WP5-AC13, WP5-REL paths; rest handoff records |
| 9 | Digest last | see above |

Cleanup: drill image `ts-wp5-gate-timesheet:drill` removed by exact tag, project `ts-wp5-gate` down -v; `docker ps --all
--filter name=ts-wp5-gate` empty; no image, network or volume of the project remains; no listener on 47740-47759.

Limits: NAS target NOT VERIFIED (no owner access); sections 13-16 are owner NAS steps, unverified. Nothing committed, sent or
edited outside this brief and the evidence folder. Failing items: none.
