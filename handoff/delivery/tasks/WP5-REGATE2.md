# WP5-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-REGATE2; package WP5; kind gate;
  attempt 1; depends on WP5-FIXD2-FREEZE.
- Scope: a docs-delta gate on the WP5-FIXD2 freeze. WP5-FIXD2 changed only status
  wording in documentation. WP5-REGATE ran the full gate on 9bcdd88. This gate proves
  three things:
  - the delta since 9bcdd88 is documentation only;
  - the application content is byte-identical;
  - the release still installs, builds and verifies cleanly.

  It then fixes the digest of record for the new freeze. A documentation-only delta
  does not need the drill and e2e repeated. State that in the results, with the
  evidence.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Target: `freeze_commit` is the WP5-FIXD2-FREEZE commit, given in the dispatch prompt.

## Gate items

1. Run `git diff --stat 9bcdd88 <freeze> -- . ':!handoff'`. The only changed paths
   may be the documentation files in the WP5-FIXD2 results. If any `src/`, `tests/`,
   `scripts/`, migration, `package*.json`, Dockerfile, Compose or example file
   changed, the gate fails.
2. Make a clean export of the freeze. Run `npm ci`; the lockfile must stay unchanged
   and no deprecation line may appear. Then `npm run lint` and `npm run verify`. Then
   `npm run build` twice, from this export and from a clean export of 9bcdd88.
   Compare the SHA-256 of every `dist/` file; they must be identical.
3. Run AC-13 once, alone.
4. Grep docs/05, 07, 11 and 12, README and the pilot packet, EN and VI, for any claim
   that the administrator status, screen or operations JSON shows the sending flag.
   The count must be 0. Also check that the WP5-REGATE fixed lines still hold.
5. Run `npm audit --omit=dev`, the precommit check, and `validate_package.py
   --preflight`, the orchestration validator and `check_recovery.py`. Run each Python
   script by its path with the workflow Python.
6. Compute the digest of record last: repository, `git ls-tree` form and the clean
   export must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-REGATE2`. Ports 47740–47759, with
  `SMOKE_PORT` in that range. No Docker.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-REGATE2/`. Decide PASS, FAIL or NOT VERIFIED. Leave
nothing running.

Return at most 150 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Freeze 014bd47a8d906c944d2781eba4f2b91c5a532419 (HEAD = origin/main before and after). Node v24.21.0
portable, Git Bash, codex-runtime Python for the three validators. Raw output `D:\.claude-tmp\timesheet\WP5-REGATE2`; evidence in
`handoff/delivery/evidence/WP5-REGATE2/`. DATA_DIR and DATABASE_PATH inside the task folder; SMOKE_PORT 47741/47742.

Digest of record `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61`, 779 files (handoff/ excluded): equal in three forms
(clean `git archive` export with `git hash-object --no-filters`, `git ls-tree` form, `npm run digest`); equals the committer's value.
Computed last; no non-handoff path differs between 014bd47 and HEAD.

| # | Item | Result |
|---|---|---|
| 1 | `git diff --stat 9bcdd88 014bd47 -- . ':!handoff'` | only `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (1 line each); no src, tests, scripts, migration, package*.json, Dockerfile, Compose or example change |
| 2 | clean exports of 014bd47 and 9bcdd88: `npm ci` exit 0 x2, lockfile hash unchanged, 0 deprecation lines (ci, lint, verify); lint exit 0; `npm run verify` exit 0 | 77 files, 1759 tests passed, SMOKE PASSED. `npm run build` exit 0 on both exports (the new export was built by verify and again alone); SHA-256 of all 230 `dist/` files identical (`cmp` of the sorted hash lists) |
| 3 | AC-13 alone (`vitest run tests/integration/ac13-two-week.test.ts`) | exit 0, 1 test passed |
| 4 | Grep of docs/05, 07, 11, 12, README, pilot packet, EN and VI for a claim that the status, screen or operations JSON shows the sending flag | 0 claims. Remaining flag mentions are negations ("the status has no field for the sending flag", docs/11 sections 12 and 13, EN and VI, and packet) or env-file checks. Old "sender mode and flag" wording: 0 hits in all docs. WP5-REGATE fixed lines hold: `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` present (docs/11 x3, packet x2, EN and VI); refusal sentence names `backup` and `restore` (line 310, EN and VI) |
| 5 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); precommit check exit 0 (nothing staged; `--self-test` exit 0, 12 rules; an attempt inside the git-less export exited 1 with "not a git repository", a tooling limit, not a finding); `validate_package.py --preflight`, `validate_orchestration.py`, `check_recovery.py` exit 0/0/0, all PASS | |
| 6 | Digest last | see above |

Drill and e2e not repeated: the delta since 9bcdd88 is two documentation lines outside handoff/, and the 230 dist files plus every non-docs
source file are byte-identical, so the WP5-REGATE drill (208 PASS) and e2e (145 passed) results carry over. NAS items remain NOT VERIFIED.

Cleanup: no server or Docker process spawned and left running; the smoke server stopped by its own script. Nothing committed or edited
outside this brief and the evidence folder. Failing items: none.
