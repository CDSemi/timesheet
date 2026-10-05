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

- **Digest note.** The project folder holds 3 untracked files under
  `.claude/skills/readme-md/`. No task created them, and they are not in the freeze.
  Compute the digest in your clone, and cross-check it with `git ls-tree` on the freeze.
  Do not touch those files.
- **Two records.** Append the WP3-RECHECK-A attempt 3 result block to both this file and
  [WP3-RECHECK-A](WP3-RECHECK-A.md) (under its Results, as "attempt 3").

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

### Auditor result - WP3-RECHECK-BC3 attempt 1 (timesheet-auditor; self-reported model claude-opus-5-5; 2026-10-05)

Decision: **PASS**. No finding. Report: [WP3_RECHECK_BC3](../WP3_RECHECK_BC3.md) (+ [.vi.md](../WP3_RECHECK_BC3.vi.md)). Evidence: `handoff/delivery/evidence/WP3-RECHECK-BC3/` (masked `<email>`/`<user>`/`<host>`, LF; probes `*.mjs.txt`, scripts `*.sh.txt`); command log [00-commands.txt](../evidence/WP3-RECHECK-BC3/00-commands.txt). Fresh context (agent `a4e5c209ddf7091f5`); authored nothing in WP3; none of the earlier WP3 auditors; no source edited. Node v24.21.0 by full path; clones `D:\.claude-tmp\timesheet\WP3-RECHECK-BC3\repo` and `\mut` at `49651c8`; capture mode only; `PRODUCTION_SENDING_ENABLED` never set.

- HEAD and digest (first two commands after `node --version`, and at the end): `49651c8bb91d56bf6c6966405257537ec7ca474b`, `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` = regate digest; the same in the clone by `scripts/source-digest.mjs` (721 files) and `git ls-tree`.
- WP3-RBC2-01: **fixed**. Whole suite at the freeze: clean 1420 passed; M4 exit 1 (the F-4 test `deadline.test.ts:271`); M5 exit 1 (`:796`); M5b exit 1 (`:796`, `:809`). With the 2d72d35 test file the same mutations pass (40/40), so the round-3 tests restored the coverage.
- Guard sweep: `inactive_user`, `before_activation`, `not_due` now covered (1 new test fails each); `finalized` covered (2 fail); extra: `overdue_recorded` covered (3); `before_account` alone uncovered, covered as a pair with the candidate clamp (M6b fails 3); `not_active` (`automation.ts:191`) alone uncovered (M4b passes), covered as a pair with `:343-344` (M4).
- Test quality: meaningful (persisted outcomes, each killed by its own guard's mutation), deterministic (5 repeated runs, 44/44), no assertion removed (expect calls 235 -> 250, tests 1416 -> 1420).
- B/C regression smoke: `npm ci` 0; verify (trace/pending deprecation) 0: 62 files / 1420 tests, smoke 40 PASS, 0 deprecation lines; e2e (Edge) 0: 127 passed, 5 skipped; H1 50 PASS; H2 10 PASS; my H3 (activation cleared mid-scan) 4 PASS, and it catches M4b.
- Risks (no finding): R1 Low, pre-existing: no test for the in-loop activation recheck `automation.ts:191` (optional fourth sweep test with a TEMP trigger clearing the activation); R2-R4 Info (redundant creation guards; scan-level return equivalent mutant; past activation instant in the `before_activation` test).
- Process deviations: one accidental interactive `cmd.exe` (Git Bash turned `/c` into a path), left as background task `b16y9jy1f` waiting on stdin, not killed (no PID kills); the coordinator may stop that task. HTTP probe run 1 stopped on a client ECONNRESET under load; run 3 passed.
- Precommit privacy check on a temporary index: [21-privacy.txt](../evidence/WP3-RECHECK-BC3/21-privacy.txt). Preflight: [20-preflight.txt](../evidence/WP3-RECHECK-BC3/20-preflight.txt). No server, browser or runner process of this task left (checked; see 00-commands.txt).

### Auditor result - WP3-RECHECK-A attempt 3 (timesheet-auditor; self-reported model claude-opus-5-5; 2026-10-05)

Decision: **PASS**. No finding. Report: [WP3_RECHECK_A3](../WP3_RECHECK_A3.md) (+ [.vi.md](../WP3_RECHECK_A3.vi.md)). Same agent, clones, HEAD and digest as above.

- Item 5: the diff `2d72d35..49651c8` outside handoff/ is one path, `tests/integration/deadline.test.ts`; no change under `src/`, `docs/`, `scripts/` or configuration ([17-delta.txt](../evidence/WP3-RECHECK-BC3/17-delta.txt)).
- Item 6: race probe 20 rounds x 4 OS processes, twice: manual 11 / deadline 9 / failed 0, then 9 / 11 / 0; HTTP probe 84 PASS (run 3); hint probe 12 PASS.
- Item 7: the attempt 2 conclusions carry over unchanged (production code byte-identical; rerun results equal to attempt 2). Crash, PDF, H-Q1 differential and migration probes not rerun (outside the attempt 3 scope; their code unchanged; no migration added).
