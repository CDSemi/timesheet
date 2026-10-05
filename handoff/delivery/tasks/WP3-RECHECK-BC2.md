# WP3-RECHECK-BC2 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-RECHECK-BC2; package WP3; kind audit;
  attempt 1; depends on WP3-REGATE2 (PASS). It is a fresh recheck of fix round 2, which
  addresses the WP3-RECHECK-BC findings and implements the owner decision H-Q1 (a). It
  includes regression checks for areas B and C.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context. The task record is in English. `WP3_RECHECK_BC2.md`
  and its `.vi.md` are bilingual and follow handoff/templates/REVIEW.md.
- Author separation: you authored nothing in WP3, fix rounds included. The author agent
  IDs are on the board. Treat every fix report, HANDOFF line and gate result as a claim.
  You may reuse the probe sources in handoff/delivery/evidence/WP3-RECHECK-BC/ as a
  starting point; run everything yourself.
- Target: `reviewed_commit` = the WP3-REGATE2 `freeze_commit`. The coordinator gives the
  SHA and the regate digest in the dispatch prompt.
  - The pre-round-2 freeze is 2f2520e1ab80ff55938b70cd469f0bfe888e04a2.
  - Record HEAD and the source digest as your first two commands after
    `node --version`, and again at the end. The digest must equal the regate digest.
- WP3-RECHECK-A (attempt 2) runs at the same time in its own clone. Do not share files or
  processes with it, and use distinct ports.
- Environment:
  - Execute only in your own scratch clone(s) under
    `D:\.claude-tmp\timesheet\WP3-RECHECK-BC2`, outside Dropbox. Write raw command output
    only there, and put only masked copies in the evidence directory.
  - Delete only files you created; never remove folders recursively.
  - Use Node 24 by full path; plain `node` resolves v26.
  - Never open an interactive shell, and never kill processes by PID.
  - Do not edit source. Use capture mode only. Use the installed Edge channel.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
- If a permission check denies a call, stop that line of work and report it; do not
  retry or rephrase it.
- Read AGENTS.md from disk first. Then read:
  - [WP3_RECHECK_BC](../WP3_RECHECK_BC.md) and [WP3-FIX2](WP3-FIX2.md), including its
    binding decisions;
  - the board `owner_decisions` entry dated 2026-10-05 (H-Q1);
  - docs/05 and docs/10 as changed;
  - handoff/prompts/WP3_REVIEW.md;
  - the WP3-REGATE2 results.

## Scope

1. Reproduce each of the following on 2f2520e and on the new freeze with your own probe,
   and report its disposition: fixed, partly fixed or not fixed.
   - **WP3-RBC-01:** every actor-less event (for example the automatic OT credit) is a
     system event in the server response and in the client wording.
   - **WP3-RBC-02:** a grantee edit made before the period start is counted when there is
     no owner finalization. Counting after an owner finalization is unchanged.
   - **The send handler's `sending` branch:** the direct test is meaningful.
2. **H-Q1 (a).**
   - A never-configured account is never auto-finalized and has no delivery, across
     several deadlines.
   - Saving settings mid-period starts automation without reaching periods that were
     already due, except through the explicit overdue choice. That choice is still
     clamped by account creation.
   - Turning auto-submit off behaves as before.
   - The admin operations status and the screens make no claim that contradicts this.
   - Check every test, seed or e2e change made for H-Q1. It must not weaken coverage.
3. **Canonical documents.**
   - docs/05 and docs/10 (EN and VI) state the account-creation and setup bounds and the
     H-Q1 decision, faithfully and in parity.
   - D-09 is unchanged.
4. **Regressions in area B.** Check jobs and uncertain sends, the activation bound, F-1
   for configured accounts, the note and image matrix, GET safety, and UI tokens.
5. **Regressions in area C.** Check the authorization matrix, the revocation race,
   attribution, and the hint (owner-only, outside the hash).
6. **New code.** Check for deprecated APIs, hard-coded CSS values and unbounded queries.

## Output

- handoff/delivery/WP3_RECHECK_BC2.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP3-RECHECK-BC2/:
  - masked (`<email>`, `<user>`), LF;
  - probes stored as `*.mjs.txt` / `*.py.txt`;
  - screenshots named `*-synthetic.png`.
- Link only to files, never to directories.
- Run the precommit privacy check over your outputs on a temporary index.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED, with each disposition.
- New findings: an ID (WP3-RBC2-nn), a severity, file:line, a reproduction and the
  required change.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result - attempt 1 (timesheet-auditor; self-reported model claude-opus-5-5; 2026-10-05)

Decision: **FIX REQUIRED** (one Low finding, WP3-RBC2-01). Report: [WP3_RECHECK_BC2](../WP3_RECHECK_BC2.md) and its `.vi.md`. Evidence: `evidence/WP3-RECHECK-BC2/` (masked, LF), starting at [00-commands.txt](../evidence/WP3-RECHECK-BC2/00-commands.txt).

- Identity: HEAD `2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714` and digest `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` (721 files) before and after, in the project folder and the scratch clone; equal to the regate digest.
- Scope 1: WP3-RBC-01 fixed (probe B3 25/25 at the freeze, 10 FAIL at `2f2520e`; Edge desktop and mobile). WP3-RBC-02 fixed (probe C1 91/91, 2 FAIL at `2f2520e`; Edge). The `sending`-branch test is meaningful: three mutations of the branch each fail only that test.
- Scope 2: H-Q1 (a) behaves as decided (probe H1 50/50 at the freeze, 25 FAIL at `2f2520e`): never-configured accounts get nothing across eight deadlines; a mid-period save reaches no earlier period; the overdue choice still works and stays clamped by creation; switching off is unchanged; no screen or status claims otherwise. Test changes: one defect, WP3-RBC2-01.
- Scope 3: docs/05 and docs/10 state both bounds and H-Q1 in EN and VI in parity; D-09 unchanged.
- Scopes 4-5: no regression in area B or C (B2, B4, B5, B6, C1 sections 1-10, C2, U2, e2e 127 passed / 5 skipped, 5 race rounds).
- Scope 6: no deprecated API, no CSS change; the hint read is now unbounded in time (35.5 ms at 50 000 rows; risk R1).
- WP3-RBC2-01 (Low): `tests/integration/deadline.test.ts:271` and `:786` still use a never-configured account, so the F-4 activation guard of the deadline scan and the imported-period exclusion lost their only tests (the off half of `:786` saves the off switch after the deadline it checks, so it proves nothing in either commit). Mutations removing either guard (M4, M5, M5b) pass all 1416 tests at the freeze and fail at `2f2520e`; probe H2 catches them. Required change: save auto-submit on in both tests (for example `configuredUser()`), save the off switch before the deadline in the off half, and confirm M4, M5 and M5b fail again.
- Preflight (project folder, workflow Python): exit 0, 67 pairs, 1358 links. Guard sweep: no other weakened guard.
- Leftovers: no server, browser or runner process; scratch files only under `D:\.claude-tmp\timesheet\WP3-RECHECK-BC2`.
