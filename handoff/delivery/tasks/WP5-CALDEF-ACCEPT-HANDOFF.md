# WP5-CALDEF-ACCEPT-HANDOFF dispatch brief (WP5 handoff: re-acceptance after the calendar-default round)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-ACCEPT-HANDOFF, package
  WP5, kind documentation, attempt 1. It depends on WP5-CALDEF-AUDIT (PASS).
- **Purpose.** Record the re-acceptance of WP5 after the R-UX5I2-3 round in the WP5 handoff.
  This is a handoff-only change: no file outside `handoff/` may change.
  - The last run of this kind is the section "Re-acceptance after UI change rounds 4 and 5
    (WP5-UX4, WP5-UX5)" in `handoff/delivery/WP5_HANDOFF.md`, written by
    `handoff/delivery/tasks/WP5-UX5-ACCEPT-HANDOFF.md`. Follow its pattern, shorter: this
    round is smaller.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override.
  - Routing: size M, risk L, novelty no.
  - It runs beside WP5-CALDEF-DOCFIX, which owns docs/03, docs/12, README and DEVELOPMENT.
    Do not touch those files, nor the pilot packet.
  - Task record in English; the handoff keeps its EN/VI pair.
- **AGENTS.md on disk wins.** Read it first.

## Accepted identity (verify each figure on the board or in the named record before you copy it)

- **Accepted commit:** `b810ba942c608e058bd8c146de6f076734c48bf2` (WP5-CALDEF-FIX2-FREEZE,
  pushed).
- **Source digest:** `59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a`, 885
  files, `handoff/` excluded. docs/12:7 says these values are recorded in this handoff, so
  write them in full.
- **Gate:** WP5-CALDEF-REGATE PASS on b810ba9 (scoped after a tests-only fix; `dist/`
  byte-identical to 300d61f). It carries forward the items of WP5-CALDEF-GATE on 300d61f,
  which failed on one item only.
- **Final audit:** WP5-CALDEF-AUDIT PASS (`handoff/delivery/WP5_CALDEF_REVIEW.md`), the
  current acceptance. It supersedes WP5-UX5-RECHECK-RN (PASS on a54061f / 690fd8fd).
- **In the accepted snapshot:** 5b2f287 (WP5-GOV-DOCS-COMMIT, 2026-11-02) lies between
  a54061f and b810ba9. It changed documentation and workflow tooling only: the owner's rule
  that these need a review and fixes, not a gate or audit (AGENTS rule 14). Name it in one
  line.
- **After the acceptance:** the documentation fixes of F-CALDEF-1 and F-CALDEF-2 and the
  release-document status lines (WP5-CALDEF-DOCFIX, reviewed by WP5-CALDEF-ACCEPT-REVIEW).
  They are committed with this record by WP5-CALDEF-ACCEPT under the board record
  `non_product_since_acceptance`. Their commit SHA and digest do not exist yet. Say where
  they are recorded (the board and the WP5-CALDEF-ACCEPT task record), not their values.

## What to change

1. **Add a section** "Re-acceptance after the calendar-default round (WP5-CALDEF, R-UX5I2-3)"
   to `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`, at the end.
   - Use this exact title. The release notes and the pilot packet point to it.
   - Source everything from the board `handoff/delivery/ORCHESTRATION.json`:
     - the tasks `WP5-CALDEF-*` and `WP5-GOV-DOCS-*`;
     - `owner_decisions`, `coordinator_decisions` and `runtime_observations` from 2026-10-29
       on;
     - the task records under `handoff/delivery/tasks/` and the reviews they name.
   - Cover:
     - **The owner's answer** of 2026-11-02 to R-UX5I2-3, in English. The verbatim text stays
       on the board.
     - **The owner's rule changes** of 2026-10-29 and 2026-11-02 (rule 14; the governance
       task graph WP5-GOV-DOCS-*; commit 5b2f287), in two or three lines.
     - **The plan and its review:** design A, MF1-MF4 and S1-S14 in short, and the
       coordinator decisions of 2026-11-02 and 2026-11-03 with their scope reading.
     - **The tasks, one line each,** with the freeze commits:
       - PLAN, PLAN-REVIEW, FIX, DOCS, SMOKE (the smoke script's DST defect), EVID and PATHS;
       - FREEZE 300d61f; GATE (FAIL on one item, and why); DIAG1;
       - FIX2 (tests only), PATHS2 and FIX2-FREEZE b810ba9;
       - REGATE (PASS) and AUDIT (PASS).
     - **What changed for people, in short:**
       - the Day editor notice with its two buttons;
       - the picker and "Change several days" refuse a changed default and offer "Reload
         period";
       - the optional field;
       - no schema change.

       Point to docs/12 for the full text.
     - **The audit:**
       - its findings F-CALDEF-1 and F-CALDEF-2 and how they were handled (AGENTS rule 14);
       - its 12 mutants in one line;
       - R-UX5I2-3 closed.
     - **The accepted identity,** as above.
     - **The optional backlog, by ID:**
       - R-CALDEF-1..4;
       - the 2.05:1 secondary-button boundary;
       - F2, the harness port race (with DIAG1's lock-file design);
       - the INT3 and RN items carried, as `WP5_CALDEF_REVIEW.md` "Risks and optional
         improvements" states them.
     - **The status:** the NAS still NOT VERIFIED, the pilot not authorized, no pilot
       result.
   - Keep the older sections unchanged as history.
2. **The opening paragraph, "Orchestration provenance" and the rounds 4 and 5 section.**
   - Wherever a sentence names a *current* acceptance or a next action that is now wrong
     (a54061f / 690fd8fd as current, R-UX5I2-3 as open or to be decided), do not rewrite the
     history.
   - Add one short clause that points to the new section as the current record.
3. **Keep EN/VI parity.** Put Vietnamese only in the `.vi.md`, and keep the same facts, IDs,
   SHAs and links in both.

## Hard limits

- Change only:
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-CALDEF-ACCEPT-HANDOFF/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint or the pilot packet. Never
  edit source, tests or docs outside `handoff/`. Do not commit or push. Run no git command
  that changes the index or the working tree.
- **Shell.** Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT
    IN `2>`), NO `rm -r`, NO `sed -i`, NO PID KILLS, NO GIT CONFIGURATION CHANGES.**
  - Use the Write, Edit, Glob and Grep tools.
- **Task folder:** `D:\.claude-tmp\timesheet\WP5-CALDEF-ACCEPT-HANDOFF`. Set TEMP and TMP to
  it. Put Node 24 first on PATH before any node call.
- **Private data.**
  - Never write an email address other than the full synthetic `@example.invalid` form.
  - Never write a profile path (use `<user>`).
  - Summarize the owner's words rather than copying personal data.
- No markdown link to a file that does not exist.
- If a permission check denies a call, stop and report.

## Checks

1. `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
   a scratch `tzdata` on `PYTHONPATH` outside the repository if needed) must exit 0. Write
   `<user>` in the evidence.
2. **EN/VI parity of the handoff:** section counts, and identical IDs, SHAs and links. Every
   link target exists.
3. **Spot-check every SHA you wrote** against the board's `commit_sha` or `freeze_commit`.
   Record the list in the evidence.
4. **No `npm run digest`.** The parallel DOCFIX changes files outside `handoff/`. Instead,
   `git status --short -- handoff/delivery/WP5_HANDOFF.md handoff/delivery/WP5_HANDOFF.vi.md`
   shows only your two files.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the section added and its item count;
- the clauses added to older text;
- the SHA spot-check result;
- the parity result;
- the preflight exit code.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- **Section added:** "Re-acceptance after the calendar-default round (WP5-CALDEF, R-UX5I2-3)" at the end of `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`: 10 top-level items, 35 sub-bullets, 27 links, same in both.
- **Clauses added to older text (6 each, EN and VI):** the opening paragraph; "Orchestration provenance" (current acceptance); the rounds 4 and 5 section intro ("was the current record"); its RECHECK-RN line ("was the current acceptance"); the R-UX5I2-3 owner-decision item (answered 2026-11-02, closed); its status line (next action superseded). History not rewritten.
- **SHA spot-check:** `300d61f`, `b810ba9`, `5b2f287`, `a54061f` and the digests `e24274b9…`, `59e2ec3f…` match the board (`commit_sha`, `freeze_commit`, `source_digest`, `current_source_digest`). Both full SHAs and both full digests are written in full.
- **Parity:** 8 sections each, 429 lines each; identical SHAs, IDs (50) and link targets (118 whole, 27 new); no missing link target.
- **Preflight:** `validate_package.py --preflight` exit 0 (PASS, 143 pairs, 2593 links). `git status --short` on the two files shows only them. `npm run digest` not run, by the brief.
- Evidence: `handoff/delivery/evidence/WP5-CALDEF-ACCEPT-HANDOFF/` (00-commands, 01-parity-sha-links, 02-preflight, 03-git-status).
- Slips (no effect): one empty heredoc (a scratch file), one `| head -0`.

Status: done
