# WP5-UX3-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-REGATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX3-FIX2-FREEZE.
- Scope: the package-final regate of UI change round 3 after the fix round.
  - WP5-UX3-GATE (attempt 1, on cecfceb / 29ac2594) FAILED for three reasons: the
    lifted-column test on Tuesdays and a mobile seed flake (409); keyboard focus clipped
    inside the week card at 768-899px; and three axe items.
  - WP5-UX3-FIX1 fixed them (freeze 9187f31, digest e4659145). The account-menu
    `target-size` item is justified in `handoff/delivery/tasks/WP5-UX3-FIX1.md`, not
    changed.
  - WP5-UX3-FIX2 fixed the read-only sweep's findings 1-11 and 13
    (`handoff/delivery/tasks/WP5-UX3-SWEEP.md`, `WP5-UX3-FIX2.md` with Addendum 1).
  - Frozen commits in order: T06 5c8355d, GOV 79b9a53 (accept 3968e15), T01 e2f3d74, T02
    aa64999, T03 7cd8c59, T04 83c32d2, T05 699b1b3, T05B 5c0dad8, T07 f8117a4, T08 1a33c57,
    T08B f89573b, T09 4b5403d, T10 cecfceb, FIX1 9187f31, then FIX2 (the target).
  - The previous accepted snapshot is a6437943403fc416240fd13a787a8c4748af3e84 (digest
    229df806; gate WP5-UX2-REGATE2; audit WP5-UX2-AUDIT2).
- Target: `freeze_commit` = TARGET_SHA = TARGET_SHA_PLACEHOLDER (the WP5-UX3-FIX2-FREEZE
  commit; HEAD = origin/main, or a later commit that changes only `handoff/`).
  - Expected digest of record: TARGET_DIGEST = TARGET_DIGEST_PLACEHOLDER
    (TARGET_FILES_PLACEHOLDER files).
  - Compute it on a clean export of the target and cross-check it with the `git ls-tree`
    form and `npm run digest`.
  - Uncommitted coordinator records under `handoff/` are expected.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX3-GATE.md`: the full item list, method, limits and
  evidence layout of attempt 1. This regate repeats every item of it on the new target;
  reuse its probes from `handoff/delivery/evidence/WP5-UX3-GATE/` (`zz-*.ts.txt`) and copy
  them into your task folder only.
- `handoff/delivery/tasks/WP5-UX3-FIX1.md`, `WP5-UX3-SWEEP.md` and `WP5-UX3-FIX2.md`
  (Results and Addendum 1) for the claims to verify.
- The round's owner and coordinator decisions on the board (2026-10-15/16), including the
  audit-focus list and its addendum.
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`
  (`shiftclock.mjs.txt`, `run-shift.sh.txt`, `sweep.sh.txt`). Copy them into your task
  folder; never add them to the repository.

## Gate items

1. **Every item of WP5-UX3-GATE (items 1 to 6), on the target.**
   - Same commands, instants, widths, states and thresholds as attempt 1.
   - Item 2 compares against a643794 again: `dist/server` and `dist/domain` must be
     byte-identical, and the `src/server src/domain migrations` diff must be empty.
   - Item 3's scope map now also covers FIX1 and FIX2.
     - FIX1: 11 paths, recorded in `WP5-UX3-FIX1.md`.
     - FIX2: the owned paths in `WP5-UX3-FIX2.md` and Addendum 1, including the docs/04
       pair.
     - Sample at least five of the FIX2 changed or moved assertions against the diff.
     - FIX2 removed five unit tests together with `quickBreaksRequest` and
       `confirmBreaksDraft`, and moved their oracles to `breakRowsModel.test.ts:179-221`.
       Say whether each removed test's proof is still held by the moved test or by an e2e
       test.
2. **The attempt-1 FAIL reasons, each closed.**
   - FULL suite on both projects at `2026-10-20T17:00:00Z` and at
     `2026-11-03T17:00:00Z`. Both are Tuesdays; `timesheet.spec.ts`'s lifted-column test
     must pass at both.
   - The five specs at `2026-11-28T18:00:00Z`, run twice; both runs must end with 0
     failed.
   - Keyboard focus inside the week card at 768, 800, 820, 860, 880 and 899px.
     - Tab to every Saturday and Sunday stop (date button and Category).
     - The ring must be fully inside the visible card each time.
   - axe: (a) and (b) of attempt 1 must be gone. (c) stays as justified: report it if it
     appears and say whether it matches the justification.
3. **The FIX2 behaviours.**
   - **Account menu by keyboard.** Choosing Profile, Settings or Administration puts focus
     on the new page's `h1`; the same page returns focus to the identity button. The phone
     More panel behaves the same. After a pointer press, no visible ring.
   - **Check out dialog.**
     - "Discard your changes?" appears on Cancel and on Escape only after a change.
     - It closes at once with no change.
     - Discard sends nothing.
     - Check out still shows no notice and no final confirmation.
   - **Day editor chip.** It says "in progress" for a day of the in-progress period opened
     through Open a day. Check this at the simulated instant `2026-10-26T16:00:00Z`.
   - **"category" wording** in the batch dialog, Overtime and the holiday import.
   - **Hover.** Every `.sheet-day` hover rule that paints sits inside
     `@media (hover: hover)`.
   - **Category select.** It is described by the default hint.
   - **docs.** docs/04, docs/10 and docs/12: EN/VI parity of the changed lines. The main
     chunk figure in docs/10 must equal the built main chunk of the target.

Decision: PASS / FAIL / NOT VERIFIED. NAS items stay NOT VERIFIED, as in earlier gates.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-REGATE`. Set TEMP and TMP to it.
- Ports: 48860-48899, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Compose project `ts-wp5-ux3regate`; non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux3regate`; it must be empty.
- axe-core 4.14.0 may be installed into the task folder only. Add nothing to
  `package.json` or the lockfile.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e` (NOT EVEN `node -e "1"`), NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO
  `head` OR `tail` (NO `head -0`, NO `head -c`, NO `tail -c`). NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/zero` OR `nul`, AND NEVER USE ONE AS AN ARGUMENT. NEVER
  `rm -r` OR `rm -rf` ANYTHING.**
  - Write scripts and files with the Write tool and run scripts by path.
  - List files with the Glob tool.
  - Redirect output to files in the task folder and read them with the Read tool.
  - Run python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    Write `<user>` in the evidence.
  - Put Node 24 first on PATH with
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
    The first shell call is `node --version`; it must print v24.x.
- **Create files only inside the task folder and the evidence folder.**
- Never stop a process you did not start, and never kill by PID.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only.
- Never edit source, docs, tests, the board or STATE.
- Leave nothing running. Before returning, confirm that none of your background tasks is
  still running.
- In your Results and evidence:
  - no email address except the full synthetic `@example.invalid` form;
  - no real profile path (use `<user>`);
  - probe-truncated addresses written as `<email>`.

## Output

- Results go in this file: the decision, gate notes, and every item with its commands,
  exit codes and counts. Include the simulated-clock table in the attempt-1 form.
- Evidence goes in `handoff/delivery/evidence/WP5-UX3-REGATE/`: masked LF `.txt` and at
  most 14 `-synthetic.png`. The screenshots use the attempt-1 set on the target. Add one
  Check out discard question at 1366 and one phone More panel with focus on the heading.
- Return at most 250 words, beginning with 'Self-reported model: ...'.

## Results
