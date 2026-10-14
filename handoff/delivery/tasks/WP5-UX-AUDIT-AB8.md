# WP5-UX-AUDIT-AB8 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-AB8; package WP5; kind
  audit; attempt 1; depends on WP5-UX-REGATE7 (must be PASS before dispatch).
- This is one combined delta recheck of **area A and area B** on the final snapshot. The
  coordinator decided on one audit because the delta is tests only and the client and
  server bundles are byte-identical to 255ba17 (see WP5-UX-REGATE7). It also saves
  subscription usage after the weekly limit stopped two parallel audits.
- Background:
  - On 255ba17 (digest b07727b2), WP5-UX-AUDIT-B7 closed B6-01 and found every area-B
    product item passing.
  - WP5-UX-AUDIT-A7 found that FIX8 changes no area-A behaviour.
  - Both audits found one test-only defect, WP5-UX-B7-01 = WP5-UX-A7-01. The isolation
    and shell specs seeded a day outside the displayed period on the 4 days ending on
    each payroll date. The mandatory AC-01 isolation flows then failed before their
    assertions ran.
  - WP5-UX-FIX9 changed only tests: the specs now seed from the displayed period,
    through a new pure helper and an additive fixture method, and a new deterministic
    domain test covers the rule.
- `reviewed_commit` = 3670a6c3c22ddcf75138927ed60f4cd9bf02078d (the WP5-UX-REGATE7
  `freeze_commit`). HEAD = origin/main, unless only handoff/ changed since. Digest of
  record: 58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files).
  Audit a clean export (or a scratch clone) at 3670a6c. Record the digest FIRST and
  again at the end.
- Your PASS would accept WP5 in both areas. It would supersede WP5-UX-AUDIT-A6 and the
  older audits that point to A6 (`superseded_by`). The earlier whole-snapshot
  conclusions of B6/B7 (area B) and A6/A7 (area A) carry forward only if you prove that
  the product is unchanged since 255ba17.
- Severity rule: a finding blocks only if it is a defect against:
  - the owner's request;
  - the approved direction;
  - docs/04 or docs/06 as shipped;
  - AGENTS.md rules;
  - WCAG 2.2 AA;
  - an acceptance criterion (AC-01 included).

  Put polish under "Risks and optional improvements". Report every blocking defect in
  this pass.
- Profile/routing: timesheet-auditor (xhigh), model opus. It must never be weaker than
  the strongest author of the snapshot (claude-opus-5-5). Routing: size S, risk M,
  novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English. `handoff/delivery/WP5_UX_REVIEW_AB8.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk.
- docs/06: line 30 (deterministic clocks) and AC-01.
- `src/domain/periods.ts` (`currentPayPeriod`).
- The findings rows in `handoff/delivery/WP5_UX_REVIEW_B7.md` and
  `handoff/delivery/WP5_UX_REVIEW_A7.md`.
- The Results of WP5-UX-FIX9 and WP5-UX-REGATE7, with their evidence.
- The diff `255ba17..3670a6c` outside handoff/.

## Scope

1. **Product unchanged.** Build 255ba17 and 3670a6c from clean exports. Compare the
   client bundle and `dist/server` byte for byte. Confirm that the diff outside
   handoff/ touches only `tests/`. If anything in the product differs, the
   carry-forward fails; report it.
2. **Test-strength proof (area B).**
   - In `tests/e2e/fixtures.ts`, only additions are allowed (no existing helper
     changed).
   - In `isolation.spec.ts` and `shell.spec.ts`, every changed line must only replace
     the seed source. No assertion may be removed or weakened, and no `skip`, `fixme`
     or `.only` may be added.
   - The edge case (a displayed period without a past normal workday) must fail
     clearly, never skip silently.
3. **Seed rule (areas A and B).**
   - Derive the displayed-period rule from `currentPayPeriod` yourself.
   - Check that `tests/domain/e2eSeedSelection.test.ts` really covers every day of at
     least two periods. That includes the due Tuesday at 16:59 and 17:00
     America/Los_Angeles and the payroll date.
   - Check that the test fails when the old `pastFreeWorkdays()[0]` choice is restored
     (scratch copy only).
   - Check that the helper the specs use is the one the test proves (no duplicated
     logic that could drift).
4. **AC-01 evidence (area A).** Run `isolation.spec.ts` and `shell.spec.ts` on both
   projects, inside the window if today (America/Los_Angeles) is still on or before
   2026-10-16; otherwise record that you ran outside it. Show that the isolation
   assertions are reached and pass:
   - hash swap;
   - id swap;
   - admin screens;
   - the second employee.
5. **Mandatory checks at 3670a6c:**
   - typecheck, lint and `npm test`;
   - the FULL e2e on both projects;
   - AC-13 once.
6. **Carried items.** Confirm that R-B7-1..R-B7-4 and the A7 risks are unchanged and
   remain non-blocking. They stay as backlog for the pilot fix round.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-AB8`. Set TEMP and TMP to it.
- Ports 48500-48519 for anything you start.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- No Docker.
- Give each Playwright run its own output folder, and give probe actions a short
  timeout.
- Use Git Bash only. Never use cmd.exe, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  - Put Node 24 first on PATH (with `cygpath -u`) before any node call. Make the first
    shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.** Never write on
  `D:\` or in the repository root.
- Never stop a process you did not start. Never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Use synthetic data and local
  capture only. Leave nothing running.
- In the review, Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_AB8.md` and `handoff/delivery/WP5_UX_REVIEW_AB8.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/`. Save
  scripts as `*.mjs.txt`, `*.py.txt` or `*.ts.txt`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately (ID,
  severity, file:line, evidence, required fix). Give the dispositions of B7-01 and
  A7-01.

Return at most 160 words, beginning with your self-reported model. Include:
- the decision;
- the bundle comparison;
- the test-strength result;
- the seed-rule result;
- the AC-01 run and whether it was inside the window;
- the dispositions;
- the mandatory check counts;
- the digests;
- the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (not weaker than the strongest author of the snapshot). Fresh context; no change authored.
Review: `handoff/delivery/WP5_UX_REVIEW_AB8.md` and `.vi.md`. Evidence: `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/` (index
`00-README.txt`).

- Digest `58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd` (795 files). It was recorded first (02:04:02Z) and last
  (03:10:50Z), each time in three equal forms. HEAD = origin/main = dc70ba6, with no non-handoff difference from 3670a6c. The clean
  export is unchanged after all runs.
- Product unchanged: the diff `255ba17..3670a6c` outside handoff/ is 5 test paths. `dist/` of both clean exports is byte-identical
  (230 files: 180 server, 46 domain, 4 client; client `index-ZRY_mcb_.js` sha256 `74d87ee4...`), twice. The A7 and B7 product
  conclusions carry forward.
- Test strength: PASS.
  - `fixtures.ts` is 12/0, additive only.
  - Each spec replaces only the seed source (3 lines out, 2 in). The only `expect(` removed is the precondition, now the helper's
    throw.
  - 0 skip/fixme/only added.
  - The edge case throws a named error, outside any try/catch.
- Seed rule: PASS.
  - Derived independently over 730 days: the displayed period is the earliest payroll date on or after today (date only). The window
    where it differs from the in-progress period is P-4..P. The old choice is off-page on P-3..P, at any hour.
  - The unit test covers 4 periods at 00:30, 16:59, 17:00 and 23:59, and the old choice fails it (M1 2/4, M1b 3/4).
  - The specs use the same helper module.
  - The session filter is untested (M6 survives, R-AB8-1).
- AC-01, inside the window on the real clock (2026-10-13 19:12 PDT): 13 passed, 1 skipped. The hash swap, id swap, admin screens and
  second-employee assertion lines were all reached and passed on both projects. The 255ba17 specs fail 6/6 at the same time. In the 7
  simulated full runs, the isolation tests pass as well.
- Mandatory checks:
  - typecheck 0, lint 0;
  - `npm test` 83 files / 1827 tests;
  - AC-13 1/1;
  - FULL e2e exit 1: 207 passed, 3 failed, 26 skipped (desktop 101/2/15, mobile 106/1/11).
- Findings (all Low, tests only, older than FIX9, blocking under the B7-01 rule):
  - AB8-01: `automation.spec.ts:118` and `pdf-visual.spec.ts:187` fail after the due time of the displayed period, up to the payroll
    date. This was reproduced on the real clock, on both snapshots.
  - AB8-02 (free-day pool, 2026-11-28 to 11-30), AB8-03 (holiday import over New Year, 2026-12-26 to 12-31) and AB8-04 (default import
    year, every 1 Jan to 30 Sep). These were reproduced under a simulated clock that the controls validate.
- Dispositions: B7-01 = A7-01 closed; B6-01 stays closed. The carried risks are unchanged and non-blocking.
- Process notes are in `00-README.txt`. No Docker. No port in 48500-48519 was bound. Nothing is left running.

Status: done
