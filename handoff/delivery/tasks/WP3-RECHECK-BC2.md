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
