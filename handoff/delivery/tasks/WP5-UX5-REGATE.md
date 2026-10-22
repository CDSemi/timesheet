# WP5-UX5-REGATE dispatch brief (regate after WP5-UX5-FIX1)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX1-FREEZE.
- **Scope.** A targeted regate of the round-4 and round-5 package after the gate's three
  findings were fixed:
  1. the drill sign-off body for the previous build;
  2. four date- or DST-dependent tests;
  3. History scroll regions.
  - The previous gate: WP5-UX5-GATE on e2bf1aa / 318b3370, FAIL. Its record and evidence
    are `handoff/delivery/tasks/WP5-UX5-GATE.md` and
    `handoff/delivery/evidence/WP5-UX5-GATE/`.
  - The last accepted snapshot is still BASE_SHA = 8e557100d16b6b6eb86a48e00276835761aabfdf.
- **Target.** Written under "Target at dispatch" below.
  - Compute the digest on a clean export, and cross-check it with the `git ls-tree` form
    and `npm run digest`, before and after every check.
  - Uncommitted coordinator records under `handoff/` are expected.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk H (the package-final snapshot), novelty no. Write the records in
  English.
- **AGENTS.md on disk wins.**

## Read

- AGENTS.md from disk.
- `handoff/delivery/tasks/WP5-UX5-GATE.md` (method, items, results) and
  `handoff/delivery/tasks/WP5-UX5-FIX1.md` (Results: what changed, the reproductions and
  the proofs claimed).
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`.
  Copy them into your task folder; never add them to the repository.
- The axe method of `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md`. Load the engine from a
  temporary folder; add no dependency.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --stat e2bf1aa..TARGET` outside `handoff/` lists exactly the paths FIX1
     recorded. Flag any other path.
   - Clean builds of e2bf1aa and the target: `dist/server` and `dist/domain` must be
     byte-identical, because FIX1 touched no server or domain code. Record the `dist/client`
     differences and map them to FIX1's client files.
   - On the basis of that byte identity, the gate's server and data items carry forward.
     Say so explicitly. They are:
     - item 2, the boundary and the route table;
     - item 4, data, sends and PDF;
     - the integration files.
2. **Core.**
   - `npm ci`;
   - lint with deprecation tracing;
   - `npm run verify`;
   - **`npm test` three times.** A vitest worker crash in any run is a FAIL;
   - the build with no chunk advisory; record the main chunk;
   - the validators, including check_recovery (106) and the precommit self-test;
   - `npm audit --omit=dev`;
   - AC-13 once.
3. **The drill `--wp3`**, in full, with Compose project `ts-wp5-ux5regate`.
   - Every stage passes with 0 FAIL.
   - Stage 4 shows the previous build signing two periods (not 422), and the pre-upgrade
     facts with revisions and queued send jobs. The upgrade is then exercised on data.
   - Stage 1 still embeds the Indie Flower subset.
   - Clean up by exact tag and project name; `docker ps --all --filter
     name=ts-wp5-ux5regate` is empty.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. Record the
   Los Angeles time and the period shown. It must have 0 failed.
5. **The simulated-clock sweep**, with the same instants and scopes as the gate:
   - FULL at `2026-10-26T16:00:00Z`, `2026-11-01T08:45:00Z` and `2027-03-14T10:30:00Z`;
   - the seven specs at `2026-10-27T06:58:30Z`, `2026-12-31T23:30:00-08:00` and
     `2027-01-01T08:30:00Z`.

   Validate the preload with one control first. Every run ends with 0 failed. A run that
   fails only with a network or buffer error is rerun once, as the full run or the same spec
   set, and both runs are recorded. Any other failure is reported as is. Record the table.
6. **Accessibility.**
   - A real axe scan, in light and dark, of:
     - History with a send (the gate's finding 3);
     - every other screen that has a `.table-wrap` (Administration, Import, and any FIX1
       lists);
     - Timesheet at 1440 and 390;
     - Review at 1440.

     Every scan must have 0 violations.
   - A keyboard check: each overflowing `.table-wrap` takes focus with the shared ring, has
     a name, and scrolls with the arrow keys. The tab order around it stays sensible.
   - The contrast of the region focus ring, in both themes.
7. **The four fixed tests.** Read the changes against the gate's diagnosis. Is each test
   still testing what it should, with no weaker assertion? Run each one once more on the
   real clock.
8. **Screenshots.** At most 4 `-synthetic.png`: History with a focused region, light and
   dark; one Administration or Import table with a focused region; one drill-free page of
   your choice.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-REGATE`. Set TEMP and TMP to it.
- Ports: 49940-49979, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>`.**
  - Write scripts with the Write tool and run them by path.
  - Run Python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    Write `<user>` in the evidence.
  - Put Node 24 first on PATH before any node call. The first shell call is
    `node --version`, and it must print v24.x.
- Create files only inside the task folder and the evidence folder. Probes run in a scratch
  copy, never in the gate export.
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
  set.
- Never edit source, docs, tests, the board or STATE.
- Leave nothing running. Before returning, make sure none of your background commands is
  still running.
- In your Results and evidence: no email address except the full synthetic
  `@example.invalid` form, and no real profile path (use `<user>`).

## Output

- **Results** go in this file: the decision, the gate notes, and every item with its
  commands, exit codes and counts.
- **Evidence** goes in `handoff/delivery/evidence/WP5-UX5-REGATE/`: masked LF `.txt` files
  and at most 4 `-synthetic.png` files.
- **Return** at most 200 words, beginning with 'Self-reported model: ...'.

## Target at dispatch

(written by the coordinator before dispatch)

## Results
