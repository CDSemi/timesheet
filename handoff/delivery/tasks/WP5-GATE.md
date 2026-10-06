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

(Verifier appends here.)
