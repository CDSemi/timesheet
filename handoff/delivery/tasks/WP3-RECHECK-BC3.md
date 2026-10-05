# WP3-RECHECK-BC3 dispatch brief (also WP3-RECHECK-A attempt 3)

- Mission/task: timesheet-software-readiness. This one fresh audit fills two board
  records on the fix-round-3 freeze:
  - **WP3-RECHECK-BC3** (kind audit, attempt 1) rechecks WP3-RBC2-01;
  - **WP3-RECHECK-A attempt 3** rebinds area A to the new digest.

  The validator requires every WP3 PASS to match the current digest, and round 3
  changed tests only. Both records depend on WP3-REGATE3 (PASS).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context; the task record is in English. Write two reports,
  each bilingual and following handoff/templates/REVIEW.md:
  - `WP3_RECHECK_BC3.md` and its `.vi.md`;
  - `WP3_RECHECK_A3.md` and its `.vi.md`.
- Author separation:
  - You authored nothing in WP3, including all fix rounds. You are none of the earlier
    WP3 auditors. The author and auditor agent IDs are on the board.
  - Treat every report, HANDOFF line and gate result as a claim.
  - You may reuse the probe sources in handoff/delivery/evidence/WP3-RECHECK-BC2/ and
    WP3-RECHECK-A2/ as a starting point, but run everything yourself.
- Target: `reviewed_commit` = the WP3-REGATE3 `freeze_commit`. The coordinator gives the
  SHA and the regate digest in the dispatch prompt.
  - The previous freeze is 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714.
  - Record HEAD and the source digest as your first two commands after
    `node --version`, and again at the end. The digest must equal the regate digest.
- Environment:
  - Execute only in your own scratch clones under
    `D:\.claude-tmp\timesheet\WP3-RECHECK-BC3`, outside Dropbox.
  - Write raw output only there. Put only masked copies in the evidence directory.
  - Delete only files you created, never inside the repository. Never remove folders
    recursively.
  - Use Node 24 by full path; plain `node` resolves v26.
  - Never open an interactive shell. Never kill processes by PID.
  - Do not edit source. Use capture mode only. Use the installed Edge channel.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
- If a permission check denies a call, stop that line of work and report it. Do not
  retry or rephrase it.
- Read AGENTS.md from disk first. Then read:
  - [WP3_RECHECK_BC2](../WP3_RECHECK_BC2.md) and its evidence;
  - [WP3-FIX3](WP3-FIX3.md) and the WP3-REGATE3 results;
  - [WP3_RECHECK_A](../WP3_RECHECK_A.md) and `WP3_RECHECK_A2.md`;
  - handoff/prompts/WP3_REVIEW.md.

## Scope

### WP3-RECHECK-BC3

1. **WP3-RBC2-01.** The restored tests exercise:
   - the F-4 scan guard (`automation.ts:191`, `:343-344`);
   - the imported-period exclusion (`automation.ts:204`);
   - the "off" switch saved before the deadline.

   Rerun mutations M4, M5 and M5b in a scratch clone. Each must fail the suite at the
   new freeze. Report the disposition.
2. **Guard sweep.** Rerun the sweep for the `inactive_user`, `before_activation`,
   `not_due` and `finalized` skips. Report which skips are now covered and which remain
   uncovered.
3. **Test quality.** Judge whether the round-3 tests are meaningful and not mirrors of
   the implementation, and whether any earlier assertion was weakened.
4. **Regression smoke for areas B and C.** Run verify and e2e, plus the H1 (setup bound)
   and H2 (guards) probes.

### WP3-RECHECK-A attempt 3

5. Confirm that the diff 2d72d35..freeze touches only test files and handoff records,
   with no change under src/, docs/, scripts/ or configuration.
6. Rerun the area-A race probe (20 rounds, multi-process), the HTTP probe and the hint
   probe on the new freeze.
7. State whether the attempt 2 conclusions carry over unchanged.

## Output

- handoff/delivery/WP3_RECHECK_BC3.md and .vi.md.
- handoff/delivery/WP3_RECHECK_A3.md and .vi.md.
- Results in this file, with one block per record.
- Evidence in handoff/delivery/evidence/WP3-RECHECK-BC3/:
  - masked (`<email>`, `<user>`), LF;
  - probes stored as `*.mjs.txt`;
  - images named `*-synthetic.png`.
- Link only to files.
- Run the precommit privacy check over your outputs on a temporary index.
- Give one verdict per record: PASS, FIX REQUIRED or NOT VERIFIED.
- For each finding give an ID (WP3-RBC3-nn or WP3-RA3-nn), a severity, file:line, a
  reproduction and the required change.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model:
- both verdicts;
- HEAD and digest before and after;
- the mutation and sweep results;
- the area-A delta and the probe reruns;
- any findings;
- risks.

## Results

(Auditor appends here.)
