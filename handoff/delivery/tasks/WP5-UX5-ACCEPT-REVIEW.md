# WP5-UX5-ACCEPT-REVIEW dispatch brief (documentation review of the pilot packet and the WP5 handoff)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-ACCEPT-REVIEW, package WP5,
  kind documentation, attempt 1. It depends on WP5-UX5-ACCEPT-PACKET and
  WP5-UX5-ACCEPT-HANDOFF.
- **Why.** Owner decision 2026-10-29: documentation needs no test, gate or audit. It needs a
  review, and fixes, so that it is up to date and its content does not drift. This is that
  review for the two documents the owner reads before the pilot.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size M, risk M, novelty no.
  - You did not write either document. Treat both as claims to check.
  - Task record in English.
- **AGENTS.md on disk wins.** Read it first.

## Review

Check `handoff/delivery/WP5_PILOT_PACKET.md` and `handoff/delivery/WP5_HANDOFF.md`, each with
its `.vi.md`, for the following:

1. **Facts against the sources.** Check every SHA, digest, file count, gate result, audit
   decision, finding ID, test count, sample hash and file name the two documents state for
   UI change rounds 4 and 5 and the release. The sources are:
   - the board `handoff/delivery/ORCHESTRATION.json` (read only);
   - the task records under `handoff/delivery/tasks/WP5-UX5-*.md`;
   - the reviews `WP5_UX5_REVIEW_INT3.md`, `WP5_UX5_REVIEW_RN.md` and
     `WP5_UX5_RECHECK_RN.md`;
   - the evidence they name, including `evidence/WP5-UX5-REGATE15/samples/sample-index.txt`.
2. **The packet and the handoff against each other.** They must state the same:
   - release identity;
   - gates and audits;
   - backlog IDs;
   - open owner decision R-UX5I2-3;
   - pilot device checks.

   Check also that the packet's link to the handoff section "Re-acceptance after UI change
   rounds 4 and 5 (WP5-UX4, WP5-UX5)" resolves to a heading that exists.
3. **The documents against the release documents.** Check against `docs/12_RELEASE_NOTES.md`
   (line 7 and the round limits), `README.md` and `DEVELOPMENT.md` at HEAD. Nothing may
   contradict them. The forward references listed in `WP5_UX5_RECHECK_RN.md` section 5,
   items 1 to 5, must now be true.
4. **Nothing stale.** No sentence presents an earlier identity, the T06 samples, or "in
   progress" or "refreshed after the round-5 gate" as current.
5. **EN/VI.** The same facts, IDs, SHAs, hashes and links, with Vietnamese that says the
   same thing. Every link target exists.
6. **No private data.** Placeholders stay placeholders. There are no real addresses, host
   names or personal data, and no email address except `@example.invalid`.

**Fix** every discrepancy you find, in these four files only, with the smallest edit. Record
each fix (file, line, before, after, source) in the evidence. If a fix would need a change
outside these four files, do not make it; report it.

## Hard limits

- Change only:
  - the four files above;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-ACCEPT-REVIEW/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION or the checkpoint. Never edit source, tests or
  docs outside `handoff/`. Do not commit or push. Run no git command that changes the index
  or the working tree.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO
    `rm -r`, NO `sed -i`.**
  - Use the Write, Edit, Glob and Grep tools.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-ACCEPT-REVIEW`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node call.
- Never write a profile path (use `<user>`).
- If a permission check denies a call, stop and report.

## Checks

1. `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`)
   must exit 0.
2. `npm run digest` must still be 690fd8fd…, which shows nothing outside `handoff/` changed.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the number of facts checked;
- each discrepancy found and fixed;
- anything reported but not fixed;
- the parity result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5. About 120 facts checked against the board, task records, reviews and REGATE15 samples. Fixed 3 drifts in WP5_HANDOFF.md and .vi.md: (1) the pilot-packet bullet still called ACCEPT-PACKET a parallel task that does not edit the packet; (2) R-UX5RN-4 disposition still future tense; (3) the R-UX5I2-3 options were numbered 1-3, now lettered a-c as in the packet. The packet needed no edit. Reported, not fixed: the REGATE11 drill stage figures (33/32/57/35/27/23) sum to 207, though the source log says 209. EN/VI parity holds, links resolve, no private data. Preflight exit 0. Digest 690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f (882 files). Evidence: handoff/delivery/evidence/WP5-UX5-ACCEPT-REVIEW/01-review.txt.

Status: done

Follow-up: drill 209 = 207 stage checks + 2 cleanup checks after stage 6 (log lines 231-232); packet line 189 EN/VI reworded. Status: done
