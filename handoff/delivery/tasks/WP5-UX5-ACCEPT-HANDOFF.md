# WP5-UX5-ACCEPT-HANDOFF dispatch brief (WP5 handoff: re-acceptance after UI change rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-ACCEPT-HANDOFF, package WP5,
  kind documentation, attempt 1. It depends on WP5-UX5-RECHECK-RN (PASS).
- **Purpose.** Record the re-acceptance of WP5 after UI change rounds 4 and 5 in the WP5
  handoff. This is a handoff-only change: no file outside `handoff/` may change.
  - The previous run of this kind is the section "Re-acceptance after UI change round 3
    (WP5-UX3)" in `handoff/delivery/WP5_HANDOFF.md`, written by
    `handoff/delivery/tasks/WP5-UX3-ACCEPT-DOCS.md`. Follow its pattern.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override.
  - Routing: size L (two rounds of history), risk L, novelty no.
  - It runs beside WP5-UX5-ACCEPT-PACKET, which owns `WP5_PILOT_PACKET.md` and `.vi.md`. Do
    not touch those files.
  - Task record in English; the handoff keeps its EN/VI pair.
- **AGENTS.md on disk wins.** Read it first.

## Accepted identity (verify each figure on the board or in the named record before you copy it)

- **Release commit:** `a54061f6afc1fda00d4ee2cca4553a5916af24ec` (WP5-UX5-FIX20-FREEZE,
  pushed).
- **Source digest:** `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882
  files, `handoff/` excluded. docs/12:7 says these three values are recorded here, so write
  them in full.
- **Gate:** WP5-UX5-REGATE16 PASS (scoped, documentation only; `dist/` byte-identical to
  dc487c6 and 0b45781; `npm test` 2,397).
- **Carried forward on identical builds:**
  - REGATE15: the samples and the ready check;
  - REGATE14: the package-final runtime gate on 0b45781;
  - REGATE11: the drill (209 PASS / 0 FAIL on 1fe5ad3) and `npm audit`.
- **Final audit:** WP5-UX5-RECHECK-RN PASS (`WP5_UX5_RECHECK_RN.md`), the current acceptance.
  - It carries the product verdict of WP5-UX5-AUDIT-INT3 (PASS on 0b45781 / 67aa715c,
    `WP5_UX5_REVIEW_INT3.md`) and supersedes it.
  - The previous acceptance was WP5-UX3-AUDIT-INT on 8e55710 / 507de97c.
- **Documentation-only commits after the product acceptance.** Name both and what each
  changed (this also answers R-UX5RN2-1):
  - **dc487c6** (WP5-UX5-RELNOTES-FREEZE): README and docs/12, EN and VI. Gated by
    REGATE15, which also regenerated the pilot samples. AUDIT-RN returned FIX REQUIRED with
    F-UX5RN-1.
  - **a54061f** (WP5-UX5-FIX20-FREEZE): DEVELOPMENT, docs/12 and README, EN and VI. Gated by
    REGATE16; RECHECK-RN passed.

## What to change

1. **Add a section** "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)" to
   `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`, after the round-3 section.
   - Use this exact title. The parallel packet task links to it.
   - Source everything from the board `handoff/delivery/ORCHESTRATION.json`: the tasks
     `WP5-UX4-*` and `WP5-UX5-*`, `owner_decisions`, `coordinator_decisions` and
     `runtime_observations` from 2026-10-20 on, and the reviews they name.
   - Cover:
     - **The owner's requests.**
       - Round 4 (2026-10-20) and round 5 (2026-10-21), as an English summary. The
         verbatim text stays on the board.
       - The answers to D-1..D-15 on 2026-10-20, F-1..F-10, Q0 (a: one package-final gate
         for both rounds), H-1, and any other recorded answer.
     - **The plans, and the governance changes** of the rounds, if any.
     - **The slices,** one line each, with their freeze commits.
     - **The fix rounds, FIX1 to FIX20,** one line each, with the freeze commit and the
       finding or gate failure each answered. Also the diagnoses DIAG1 to DIAG10 and the
       dependency pin DEPS1.
     - **The gates,** each with its result in one line: GATE, then REGATE to REGATE16.
       Include the load rule that REGATE12 introduced (an entry limit of about 8 busy
       cores, and starvation timeouts classified as NOT VERIFIED). Say that the rule is
       not canonical yet (R-UX5I-3).
     - **The audits,** each with its decision and its findings by ID: AUDIT-A, AUDIT-B,
       RECHECK-A, RECHECK-B, RECHECK-A2, RECHECK-B2, RECHECK-B3, AUDIT-INT, AUDIT-INT2,
       AUDIT-INT3, AUDIT-RN and RECHECK-RN. Add any WP5-UX4 audits on the board.
     - **The pauses and restarts:**
       - two owner restarts on 2026-10-22;
       - the usage pause on 2026-10-23;
       - the resume on 2026-10-26.
     - **The accepted identity,** as above.
     - **The optional backlog, by ID:**
       - the seven groups of `WP5_UX5_REVIEW_INT3.md` "Optional backlog for the WP5
         handoff";
       - R-UX5RN2-1..3 (`WP5_UX5_RECHECK_RN.md`);
       - the dispositions of R-UX5RN-1..6.
     - **The owner decision best taken before the pilot:** R-UX5I2-3, a calendar default
       with no version. Name the three options of the review.
     - **The pilot device checks NOT VERIFIED here** (backlog item 5).
     - **The status:** the NAS still NOT VERIFIED, the pilot not authorized, and no pilot
       result.
   - Keep the older sections unchanged as history.
2. **The opening paragraph and "Orchestration provenance".** If a sentence there names a
   *current* acceptance or a next action that is now wrong, do not rewrite the history.
   Add one short clause that points to the new section as the current record. The opening
   paragraph already says that the record at the end wins.
3. **Keep EN/VI parity.** Put Vietnamese only in the `.vi.md`, and keep the same facts, IDs,
   SHAs and links in both.

## Hard limits

- Change only:
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-ACCEPT-HANDOFF/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint or the pilot packet. Never
  edit source, tests or docs outside `handoff/`. Do not commit or push. Run no git command
  that changes the index or the working tree.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO
    `rm -r`, NO `sed -i`.**
  - Use the Write, Edit, Glob and Grep tools.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-ACCEPT-HANDOFF`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node call.
- Never write an email address other than the full synthetic `@example.invalid` form, and
  never write a profile path (use `<user>`).
- Do not write the owner's request text verbatim if it holds personal data; summarize.
- No markdown link to a file that does not exist.
- If a permission check denies a call, stop and report.

## Checks

1. `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`)
   must exit 0. Write `<user>` in the evidence.
2. **EN/VI parity of the handoff:** section counts, and identical IDs, SHAs and links. Every
   link target exists.
3. **Spot-check every SHA you wrote** against the board's `commit_sha` or `freeze_commit`.
   Record the list in the evidence.
4. **`npm run digest`** must still be 690fd8fd…, which shows nothing outside `handoff/`
   changed.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the section added and its subsection count;
- the SHA spot-check result;
- the parity result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- **Section added:** "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)" at the end of `WP5_HANDOFF.md` and `.vi.md`, with 14 bold-labelled items (112 lines each). The opening paragraph and two "Orchestration provenance" bullets gained one clause each that points to the new section; older sections are unchanged.
- **SHA spot-check:** all 34 short SHAs written in the section match a board `commit_sha` or `freeze_commit`; the full release commit and digest match the brief (list in `evidence/WP5-UX5-ACCEPT-HANDOFF/01-checks.txt`).
- **Parity:** EN and VI have 7 headings each, 14 items, 112 lines, 40 identical SHA-like values, 176 identical IDs and 32 equal links; all link targets exist.
- **Preflight:** `validate_package.py --preflight` exit 0 (PASS; 142 pairs).
- **Digest:** `npm run digest` exit 0, `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f` (882 files), unchanged.
- **Not done by design:** the board, STATE, NEXT_ACTION, checkpoint and pilot packet were not touched; nothing committed.

Status: done
