# WP5-UX5-RECHECK-RN dispatch brief (recheck of F-UX5RN-1 after FIX20)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RECHECK-RN, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE16 (PASS required).
  - It rechecks WP5-UX5-AUDIT-RN (FIX REQUIRED on dc487c6 / 2072e3f2, finding F-UX5RN-1).
  - **Your PASS supersedes AUDIT-INT3** (PASS on 0b45781 / 67aa715c) as the current
    acceptance of WP5. The release is then the FIX20 freeze commit.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size S, risk M (the release identity and the status the owner relies on),
    novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_RECHECK_RN.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task and none of their audits; the
  agent IDs are on the board. Treat every report and every earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE16 on the board.
  - TARGET_DIGEST = REGATE16's `source_digest`.
  - HEAD may be a later commit that changes only `handoff/`.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
  - Target confirmation:
    - TARGET_SHA = a54061f6afc1fda00d4ee2cca4553a5916af24ec, the FIX20-FREEZE commit,
      pushed. REGATE16 passed on it.
    - TARGET_DIGEST = 690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f
      (882 files).
    - FIX20's paths: `DEVELOPMENT.md`, `DEVELOPMENT.vi.md`, `README.md`, `README.vi.md`,
      `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`.
    - Uncommitted `handoff/` files are expected: the coordinator's records, and the Results
      and evidence of FIX20-FREEZE and REGATE16.
- **AGENTS.md on disk wins.**
- Never touch `.claude/worktrees/` or its branch.

## Read

- `handoff/delivery/WP5_UX5_REVIEW_RN.md` (+ `.vi.md`): the finding, the optional risks and
  section 6.
- `handoff/delivery/tasks/WP5-UX5-FIX20.md` and `WP5-UX5-REGATE16.md`, with their evidence.
- `DEVELOPMENT.md`, `README.md`, `docs/12_RELEASE_NOTES.md` and their `.vi.md` pairs, at the
  target and at dc487c6.
- The board `handoff/delivery/ORCHESTRATION.json` (read only).

## Scope

1. **Identity and scope.**
   - `git diff --name-status dc487c6..TARGET -- . ':!handoff'` lists exactly FIX20's
     paths.
   - Clean builds of both commits give an identical `dist/`.
   - So the verdicts of AUDIT-INT3 on the product and of AUDIT-RN on the samples carry
     forward. Confirm this, or say why not.
2. **F-UX5RN-1.**
   - DEVELOPMENT line 3 (EN/VI) states the accepted status, matches the README, and names
     the WP5 handoff.
   - No tracked document outside `handoff/` still states that a package or round awaits its
     gate or audit, or is not accepted. Run your own search.
3. **The other FIX20 changes.** For each one, check that it is accurate against the board,
   the records and the repository, and that nothing true was lost:
   - R-UX5RN-1: one release rule in docs/12:7, with no reading that makes `0b45781` the
     release and no digest of its own tree;
   - R-UX5RN-2: the restored clause;
   - R-UX5RN-3: the Dockerfile and `vite.config.ts` unchanged since `1fe5ad3`;
   - R-UX5RN-5: README step 3.
4. **AUDIT-RN's other verdicts still hold at the target:**
   - every changed statement of RELNOTES;
   - no limit lost;
   - consistency with docs/04, 05, 10, 11, the pilot packet and the WP5 handoff;
   - EN/VI and the links.

   Name the diff you checked.
5. **Forward references for ACCEPT-DOCS (R-UX5RN-4).** List each sentence at the target that
   ACCEPT-DOCS must make true:
   - the WP5 handoff records the release SHA, digest and count;
   - the WP5 handoff has a section for rounds 4 and 5;
   - the pilot packet names the release.

   Confirm that section 6 of AUDIT-RN's review is still the complete list for pilot packet
   section 3, or update it.
6. **Mandatory checks yourself,** in a clean export of the target:
   - typecheck, lint and build (no advisory);
   - `npm test` (2,397);
   - the `dist/` comparison with dc487c6.

   No e2e run is required while `dist/` is identical.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-RN`. Ports 51970-52009, if any are
  needed.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
  times only. Never write the command line of a process the mission did not start.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR
  `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>`. NO `rm -r` OR `rm -rf`, NO `sed -i`, NO FIFO WAITER SCRIPTS, NO `git init`, NO
  `sleep`, `ping` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS.**
  - Write probes as files in the task folder and run them by path.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or
  `npm install` in the repository.
- Never kill processes by PID. Leave nothing running.
- **Files.**
  - Create files only in the task folder, the evidence folder and the review pair.
  - Every file ends with exactly one newline.
  - Evidence names end in `.txt` only.
- Use synthetic data only. No email address except the full synthetic `@example.invalid`
  form. No password literal. Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-RECHECK-RN/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Give the disposition of F-UX5RN-1 and of R-UX5RN-1..6.
  - Number each new finding (F-UX5RN2-n), with its severity, file:line, the evidence and the
    expected text.
  - List the forward references and the pilot packet statements for ACCEPT-DOCS.
- Return at most 200 words, beginning with your self-reported model.

## Results

Self-reported model: claude-opus-5-5 (board agent a099171a27b8df25c; not weaker than the strongest author model, claude-opus-5-5).
**Decision: PASS.** Review pair `handoff/delivery/WP5_UX5_RECHECK_RN.md` (+ `.vi.md`); evidence
`handoff/delivery/evidence/WP5-UX5-RECHECK-RN/` (index `00-README.txt`).

- **Identity.** HEAD = local origin/main = remote main = a54061f6afc1fda00d4ee2cca4553a5916af24ec at 18:27:58Z and 18:41:28Z; no
  status outside `handoff/`. Digest 690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f (882 files) before and after in the
  export, ls-tree and `npm run digest` forms, and in a clean clone.
- **Scope 1.** dc487c6..a54061f outside `handoff/` is exactly FIX20's six files (8+/8-), `--check` 0, nothing read by source, tests or
  build; clean builds 250 files each, every SHA-256 equal. AUDIT-INT3's product verdict and AUDIT-RN's sample verdict carry forward.
- **F-UX5RN-1: closed.** DEVELOPMENT:3 EN/VI equals README:3's status and names the WP5 handoff; own search (58 project Markdown files)
  finds no stale package or round status.
- **R-UX5RN-1, -2, -3, -5: done and accurate. R-UX5RN-4, -6: open for ACCEPT-DOCS.** No new finding. Optional: R-UX5RN2-1 (docs/12:7
  omits DEVELOPMENT), R-UX5RN2-2 (docs/11:34 pointer, pre-existing), R-UX5RN2-3 (docs/10 decision-time wording).
- **Scope 4.** Diff checked: 0b45781..a54061f outside `handoff/`; every statement holds, no limit lost, EN/VI and 199 links fine.
- **Scope 5.** Forward references and pilot packet statements (section 3 per AUDIT-RN section 6 plus the dc487c6 note; items 6-13
  outside it) are in review section 5.
- **Mandatory.** typecheck 0, lint 0, build 0 (no advisory or deprecation), `npm test` 0 with 101 files / 2,397 tests; `dist/`
  identical to dc487c6. Preflight PASS (142 pairs). Nothing left running. Slips: three, none touching the repository (`99-slips.txt`).

Status: done
