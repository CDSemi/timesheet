# WP5-UX5-AUDIT-RN dispatch brief (audit of the release-notes refresh and the regenerated pilot samples)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-RN, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE15 (PASS required).
  - WP5-UX5-AUDIT-INT3 (PASS on 0b45781 / 67aa715c) re-accepted WP5 after UI change rounds 4
    and 5.
  - WP5-UX5-RELNOTES then changed four documentation files, which moved the source digest.
  - Your PASS supersedes AUDIT-INT3 as the current acceptance. The release is then the
    RELNOTES freeze commit.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size S, risk M (the release identity the owner relies on, and the samples the
    owner approves wording from), novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_RN.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task and none of their audits; the
  agent IDs are on the board. Treat every report and every earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE15 on the board.
  - TARGET_DIGEST = REGATE15's `source_digest`.
  - HEAD may be a later commit that changes only `handoff/`.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
  - Target confirmation: (filled in at dispatch)
- **AGENTS.md on disk wins.**
- Never touch `.claude/worktrees/` or its branch.

## Read

- `README.md`, `docs/12_RELEASE_NOTES.md` and their `.vi.md` pairs, at the target and at
  0b45781.
- `handoff/delivery/tasks/WP5-UX5-RELNOTES.md` and `WP5-UX5-REGATE15.md`, with their
  evidence.
- `handoff/delivery/WP5_UX5_REVIEW_INT3.md`: the acceptance this audit carries forward.
- The board `handoff/delivery/ORCHESTRATION.json` (read only): the WP5 gates and audits
  that the changed statements name.
- `handoff/delivery/WP5_PILOT_PACKET.md` section 3 and `handoff/delivery/evidence/WP5-UX5-T06/`.

## Scope

1. **Identity and scope.**
   - `git diff --name-status 0b45781..TARGET -- . ':!handoff'` lists exactly the four
     documentation files.
   - Clean builds of both commits give an identical `dist/`.
   - So AUDIT-INT3's verdict on the product carries forward. Confirm this, or say why not.
2. **Accuracy of every changed statement** in the four files, checked against the board,
   the task records, the reviews and the code. Cover at least:
   - the release identity: no digest of its own tree, the right gate and audit IDs and
     commits, and the rule that the release is the documentation-only commit;
   - each round's accepting gate and audit;
   - the drill sentence: which gate ran it, on which commit, its result, and the
     carry-forward argument;
   - the README status claims: WP1 to WP4 accepted, WP5 software ready, pilot pending, NAS
     NOT VERIFIED, no deployment or real email;
   - the next step and the reading list.
3. **Nothing lost.** Every known limit and carried risk that is still true stays, and no
   sentence that is still true was dropped. Diff the four files against 0b45781 line by
   line.
4. **Consistency.** The changed lines do not contradict docs/04, docs/05, docs/10, docs/11,
   the pilot packet or the WP5 handoff.
5. **EN/VI.** Both pairs have the same facts, IDs, SHAs and links, and the Vietnamese says
   the same thing. Every link resolves.
6. **The regenerated pilot samples** (REGATE15 item 5).
   - They come from the target, by the T06 recipe with only the recorded changes.
   - They are synthetic only, and capture mode was used.
   - Every difference from the T06 samples is explained by a named commit.
   - The renders show what section 3 of the pilot packet says they show.

   List any statement of section 3 that the new samples make untrue. ACCEPT-DOCS updates
   that section next.
7. **Mandatory checks yourself,** in a clean export of the target: typecheck, lint, build
   (no advisory), `npm test` (2,397) and the `dist/` comparison with 0b45781. No e2e run is
   required while `dist/` is identical.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-RN`. Ports 51890-51929.
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
  - Evidence names end in `.txt` or `-synthetic.png` only, with at most 12 screenshots.
- Use synthetic data and local mail capture only. No email address except the full
  synthetic `@example.invalid` form. No password literal. Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-RN/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each finding (F-UX5RN-n), with its severity, file:line, the evidence and the
    expected text.
  - List the statements of pilot packet section 3 that ACCEPT-DOCS must change.
- Return at most 200 words, beginning with your self-reported model.

## Results
