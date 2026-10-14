# WP5-UX-AUDIT-AB9 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-AB9; package WP5; kind
  audit; attempt 1; depends on WP5-UX-REGATE8 (must be PASS before dispatch).
- This is one combined delta recheck of **area A and area B** on the final snapshot,
  following the same coordinator decision as AB8: the delta is tests only, and REGATE8
  compares the bundles.
- Background:
  - WP5-UX-AUDIT-AB8 (3670a6c, digest 58b0deee) confirmed that the product is
    byte-identical to 255ba17. It found the test strength and the FIX9 seed rule
    correct, AC-01 passing, and B7-01 = A7-01 closed.
  - With a validated simulated clock, it found four more test-only calendar defects,
    WP5-UX-AB8-01..AB8-04.
  - WP5-UX-FIX10 changed 8 test files to fix them. When the displayed due has passed,
    the deadline tests record a later deadline through the payroll-exception path. The
    seeded days are released. The import dates fall after the displayed period. The
    import year follows the client's default rule. FIX10 also ran a 14-run sweep itself.
- `reviewed_commit` = 90b98efc395c3894a21a909b6d361eadc6fc2bd9, the WP5-UX-REGATE8
  `freeze_commit`. HEAD = origin/main, unless only handoff/ changed since. Digest of
  record: 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files).
  Audit a clean export (or a scratch clone) at 90b98ef. Record the digest FIRST and again
  at the end.
- Your PASS would accept WP5 in both areas. It would supersede WP5-UX-AUDIT-A6 and the
  older audits that point to A6 (`superseded_by`). The earlier whole-snapshot conclusions
  (B6/B7 area B, A6/A7 area A, AB8 for FIX9) carry forward only if you prove that the
  product is unchanged since 255ba17.
- Severity rule (unchanged from AB8). A finding blocks only if it is a defect against:
  - the owner's request;
  - the approved direction;
  - docs/04, docs/05 or docs/06 as shipped;
  - AGENTS.md rules;
  - WCAG 2.2 AA;
  - an acceptance criterion.

  Put polish under "Risks and optional improvements". Report every blocking defect in
  this pass, including any further calendar dependence that your own sweep shows.
- Profile/routing: timesheet-auditor (xhigh), model opus. It must never be weaker than
  the strongest author of the snapshot (claude-opus-5-5). Routing: size S, risk M,
  novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English. `handoff/delivery/WP5_UX_REVIEW_AB9.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk.
- docs/05 line 26 (activation), and docs/06 line 30 (deterministic clocks), AC-01,
  AC-06/07/10 and the automation criteria.
- `handoff/delivery/WP5_UX_REVIEW_AB8.md`: its findings and how the simulated clock was
  validated.
- The Results of WP5-UX-FIX10 and WP5-UX-REGATE8, with their evidence.
- The diff `3670a6c..90b98ef` outside handoff/.

## Scope

1. **Product unchanged.** Build 3670a6c and 90b98ef from clean exports and compare the
   client bundle and `dist/server` byte for byte. Also confirm that the diff outside
   handoff/ touches only `tests/`.
2. **Test-strength proof (area B).**
   - In `fixtures.ts`, only additive changes are allowed, plus a widened import line.
   - Read every changed line in the five specs and the two helpers.
   - No assertion may be removed or weakened, no `skip`, `fixme` or `.only` may be
     added, and no test may pass vacuously.
   - The edge cases must fail clearly.
3. **AB8-01 semantics (areas A and B).** Judge whether recording a later deadline through
   the payroll-exception path still tests what `automation.spec.ts:118` and
   `pdf-visual.spec.ts:187` are meant to test:
   - the deadline automation;
   - the docs/05 line 26 activation rule;
   - the automatic revision and its PDF.

   The setup must use a supported admin path. It must not hide a product defect that the
   original scenario would have caught. Check that the setup asserts its own
   preconditions.
4. **AB8-02..04.**
   - The seeded days are released on every path, including failure.
   - Per-worker demand stays within the minimum free-day pool.
   - The holiday-import dates cannot touch a finalized day.
   - The expected import year equals the client's `defaultImportYear` rule, for every
     date of the year.
5. **Your own simulated-clock sweep.**
   - Reuse the validated preload (from the AB8 or FIX10 evidence) in your task folder.
   - Run one validation control first.
   - Then run the FULL suite on both projects at no fewer than six instants of your own
     choice. Include:
     - a due Tuesday after 18:00;
     - a payroll date;
     - 2026-11-30;
     - 2026-12-31;
     - a date in 2027 other than those FIX10 or REGATE8 used.
   - Every run must have 0 failed. A network or buffer error gets one recorded rerun.
6. **Mandatory checks at 90b98ef:**
   - typecheck, lint and `npm test`;
   - the FULL e2e on both projects on the real clock;
   - AC-13 once;
   - AC-01 (the isolation spec) with all isolation groups reached.
7. **Carried items.** Confirm that R-AB8-1..R-AB8-4, R-B7-1..R-B7-4 and the A7 and B6
   risks are unchanged and non-blocking. They stay as backlog for the pilot fix round.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-AB9`. Set TEMP and TMP to it.
- Ports 48560-48579 for anything you start.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- No Docker.
- Give each Playwright run its own output folder, and run them sequentially. Give probe
  actions a short timeout.
- Use Git Bash only. Never use cmd.exe, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  - Put Node 24 first on PATH (with `cygpath -u`) before any node call. The first shell
    call is `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.** Never write on
  `D:\` or in the repository root.
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Use synthetic data and local
  capture only. Leave nothing running.
- In the review, Results and evidence:
  - write no email address other than the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_AB9.md` and `handoff/delivery/WP5_UX_REVIEW_AB9.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-AUDIT-AB9/`. Save
  scripts as `*.mjs.txt`, `*.py.txt` or `*.ts.txt`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately (ID,
  severity, file:line, evidence, required fix). Give the dispositions of AB8-01..AB8-04.

Return at most 160 words, beginning with your self-reported model. Include:
- the decision;
- the bundle comparison;
- the test-strength result;
- the AB8-01 semantics judgement;
- the sweep summary;
- the dispositions;
- the mandatory check counts;
- the digests;
- the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: PASS

Self-reported model: claude-opus-5-5 (profile timesheet-auditor; fresh context; authored nothing in this round; not weaker than the
strongest author, claude-opus-5-5). Reviewed commit 90b98efc395c3894a21a909b6d361eadc6fc2bd9; HEAD = origin/main = 90b98ef before and after.
Review pair `handoff/delivery/WP5_UX_REVIEW_AB9.md` and `.vi.md`; evidence `handoff/delivery/evidence/WP5-UX-AUDIT-AB9/` (index `00-README.txt`).

- Digest 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files): recorded first (06:20:41Z) and last (07:54:27Z), each
  time in three equal forms (script, ls-tree 90b98ef, ls-tree HEAD). The clean export list equals the ls-tree list before and after (`01-`, `90-`).
- Product unchanged: the diff outside handoff/ is exactly the 8 test paths, and the `dist/` of 3670a6c, 90b98ef and 255ba17 is
  byte-identical (230 files, cmp 0, diff -r 0; client `index-ZRY_mcb_.js` 74d87ee4…). The A7, B7 and AB8 conclusions carry forward (`04-`).
- Test strength: no assertion is removed or weakened; fixtures.ts removes only its import line; no skip, fixme or only is added. The edge
  cases fail clearly: M1-M5 and M7 are caught; M6 survives (R-AB9-1) (`03-`, `07-`).
- AB8-01 semantics:
  - the setup uses a supported admin route (a payroll exception with a due override, the shape that payroll-exceptions.test.ts uses);
  - the period and the payroll date are unchanged, and the setup asserts its preconditions;
  - the tests still prove the deadline automation, the docs/05 line 26 activation rule and the automatic revision and PDF;
  - no product defect is hidden;
  - the derivation found 0 mismatches over 8230 and over 83115 instants (`06-`).
- AB8-01 to AB8-04 are all closed (dispositions in the review):
  - the smallest free-day pool is 3 (2026-11-28..30), and mutation M8 brings AB8-02 back;
  - the import dates show 0 problems over 823 days;
  - the default year equals the client's rule on every day.
- Sweep. The preload is validated: the control spec shows the server reporting the simulated today_local, and 3670a6c fails the three
  AB8-01 tests at 18:30 and passes at 13:00.
  - 8 full runs on both projects, each 210 passed / 0 failed / 26 skipped (desktop 103/0/15, mobile 107/0/11), at these instants
    (Los Angeles time): Tue 2026-11-24 18:30, Fri 2026-12-11 16:00 (payroll date), Mon 2026-11-30 15:00, Thu 2026-12-31 18:00,
    Mon 2027-03-15 10:00, Tue 2027-09-14 18:30, Fri 2027-10-01 10:00 and Tue 2028-02-29 18:30.
  - Two one-worker runs, at 2027-09-14 18:30 and 2027-03-15 10:00, give 210/0/26 each.
  - No network or buffer error occurred, and no rerun was needed (`11-`).
- Mandatory checks (`05-`, `09-`, `10-`):
  - typecheck 0, lint 0, npm test 83 files / 1831 tests;
  - the FULL e2e on the real clock, 2026-10-13 23:36-23:42 PDT (inside the AB8-01 window): exit 0, 210 passed / 0 failed / 26 skipped;
  - AC-13 1/1;
  - AC-01: 13 passed / 1 skipped, with every isolation line reached on both projects;
  - npm audit --omit=dev 0.
- Findings: none blocking.
  - Risks R-AB9-1 to R-AB9-6. R-AB9-6: an early manual sign-off of the period in progress shows as a non-current History row until P+1.
    This is pre-existing WP3 code, which I judge non-blocking; the probe is in `12-`.
  - The carried R-AB8-1..4, R-B7-1..4 and the A7 and B6 risks are unchanged and non-blocking.
- Process notes:
  - I read a file twice with `tail` (no pipe).
  - The e2e fixtures use OS-assigned ports.
  - Nothing is left running.
  - I did not edit source, tests, docs, the board or STATE.

Status: done
