# WP5-UX5-ACCEPT-PACKET dispatch brief (pilot packet refresh after UI change rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-ACCEPT-PACKET, package WP5,
  kind documentation, attempt 1. It depends on WP5-UX5-RECHECK-RN (PASS).
- **Purpose.** Bring the pilot packet up to the WP5 release accepted after UI change rounds 4
  and 5. The packet is what the owner reviews before authorizing the pilot. This is a
  handoff-only change: no file outside `handoff/` may change.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override.
  - Routing: size M, risk M (the release identity and the samples the owner relies on),
    novelty no.
  - It runs beside WP5-UX5-ACCEPT-HANDOFF, which owns `WP5_HANDOFF.md` and `.vi.md`. Do not
    touch those files.
  - Task record in English; the packet keeps its EN/VI pair.
- **AGENTS.md on disk wins.** Read it first.

## Accepted identity (verify each figure on the board or in the named record before you copy it)

- **Release commit:** `a54061f6afc1fda00d4ee2cca4553a5916af24ec` (WP5-UX5-FIX20-FREEZE,
  pushed).
- **Source digest:** `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882
  files, `handoff/` excluded.
- **Gate:** WP5-UX5-REGATE16 PASS. It is scoped and documentation-only:
  - `dist/` is byte-identical to dc487c6 and to 0b45781;
  - `npm test` ran 2,397 tests.
- **Gate items carried forward on identical builds:**
  - **WP5-UX5-REGATE15** (dc487c6): the samples and the ready check.
  - **WP5-UX5-REGATE14** (0b45781, the package-final runtime gate):
    - real-clock FULL e2e: desktop 484 passed / 36 skipped / 0 failed, mobile 408 / 112 / 0;
    - six simulated-clock sweeps, 0 failed;
    - stress, mutants and axe.
  - **The container drill and `npm audit` of WP5-UX5-REGATE11** (1fe5ad3): 209 PASS /
    0 FAIL, schema 15. That gate failed on an unrelated e2e timeout, which FIX17 fixed.
    `dist/server`, `dist/domain`, the Dockerfile and `vite.config.ts` are unchanged since
    1fe5ad3.
- **Final audit:** WP5-UX5-RECHECK-RN PASS (`handoff/delivery/WP5_UX5_RECHECK_RN.md`).
  - It carries the product verdict of WP5-UX5-AUDIT-INT3 (PASS on 0b45781 / 67aa715c,
    `WP5_UX5_REVIEW_INT3.md`), and supersedes it.
  - Before that, the acceptance was WP5-UX3-AUDIT-INT on `8e55710` / `507de97c…`.
- **Documentation-only commits after the product acceptance:**
  - **dc487c6** (WP5-UX5-RELNOTES-FREEZE): README and docs/12. Gated by REGATE15; AUDIT-RN
    returned FIX REQUIRED with F-UX5RN-1.
  - **a54061f** (WP5-UX5-FIX20-FREEZE): DEVELOPMENT, docs/12 and README. Gated by REGATE16;
    RECHECK-RN passed.
- **Reference image ID.** Find out whether REGATE11's drill recorded an image ID (its task
  record and evidence).
  - If it did, give it labelled as the 1fe5ad3 drill build. That build's server and domain
    bundles are identical to the release; its client bundle is not.
  - If it did not, say so.
  - Either way, the owner records the NAS-built image ID.

## What to change in `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`

Work from the two review lists, in this order:
- `handoff/delivery/WP5_UX5_REVIEW_RN.md` section 6: section 3 of the packet;
- `handoff/delivery/WP5_UX5_RECHECK_RN.md` section 5: items 1 to 13.

1. **Section 0.**
   - Bring the release identity table up to date with the identity above.
   - Replace the paragraph "Release identity: refreshed after the round-5 gate…" with the
     refreshed facts.
   - Rewrite the "round 4, in progress" and "round 5, in progress" paragraphs as completed
     rounds:
     - what changed, in short;
     - the gates and audits;
     - a link to the WP5 handoff section "Re-acceptance after UI change rounds 4 and 5
       (WP5-UX4, WP5-UX5)". The parallel task writes that section; use this exact title.
   - Point the evidence sentence to `evidence/WP5-UX5-REGATE15/samples/`.
2. **Section 1:** the ready check, from REGATE15's `44-ready-check.txt` on dc487c6.
3. **Section 2:** "eleven messages captured from …", now from REGATE15.
4. **Section 3:** every item of AUDIT-RN section 6, with RECHECK-RN's note.
   - The samples come from dc487c6. dc487c6 differs from the release only in six Markdown
     files and builds byte-identically, so the samples represent the release without being
     regenerated.
   - New file names, numbers and SHA-256 values.
   - The folder `evidence/WP5-UX5-REGATE15/samples/`.
   - R-UX5RN-6: the hashes and some Date headers are values of that run and change from run
     to run (the submission ID). Do not quote Date times as product facts.
   - Remove the "freeze of the round-5 slices … regenerated from the release commit"
     sentence.
   - Keep every statement that RECHECK-RN and AUDIT-RN found still true.
5. **Section 5, restore proof:** the round-5 drill of REGATE11 on 1fe5ad3 (209 checks, schema
   15), carried forward by REGATE12 to REGATE16. Take the stage figures from REGATE11's
   evidence. Keep the NAS form blank.
6. **Section 6:** the rollback card identity rows.
7. **Section 7, and sections 8 and 10:** every "refreshed after the round-5 gate
   (ACCEPT-DOCS)" and "waits for it" sentence, and section 10's two untrue lines (RECHECK-RN
   section 5 items 12 and 13).
8. **Section 8, a new open owner decision: R-UX5I2-3.**
   - The problem: a calendar default has no version. If an administrator imports a holiday
     while a person's Day editor is open on that day, a later "Save day fields" can record
     "Worked" over the new Holiday default. That changes the day's required time.
   - Source: `WP5_UX5_REVIEW_INT3.md`, "Risks", R-UX5I2-3.
   - The options, as the review gives them:
     - keep and document;
     - send the category only when the person changed it;
     - refuse the save when the default changed since the load.
   - Say it is best decided before the pilot.
   - No recommendation is required; if you give one, label it as a suggestion.
   - Keep D-1..D-15, the round-5 decisions and section 9 (unsigned) unchanged.
9. **Section 10 or a fitting place: the pilot device checks** that are NOT VERIFIED here:
   - R-A2-1 and R-A2-2;
   - UX4-A 8;
   - classic scrollbars in other browsers (docs/12);
   - the owner's own look at the PDF samples against B11.

   Take them from `WP5_UX5_REVIEW_INT3.md`, "Optional backlog" item 5.
10. **Section 11:** the evidence index.

## Hard limits

- Change only:
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-ACCEPT-PACKET/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint or the WP5 handoff. Never edit
  source, tests or docs outside `handoff/`. Do not commit or push. Run no git command that
  changes the index or the working tree.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO
    `rm -r`, NO `sed -i`.**
  - Use the Write, Edit, Glob and Grep tools.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-ACCEPT-PACKET`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node call.
- Never write an email address other than the full synthetic `@example.invalid` form, and
  never write a profile path (use `<user>`). Placeholders stay placeholders.
- No markdown link to a file that does not exist, except the link to the WP5 handoff section
  title above.
- If a permission check denies a call, stop and report.

## Checks

1. `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`)
   must exit 0. Write `<user>` in the evidence.
2. **EN/VI parity of the packet:** section counts, and identical IDs, SHAs, hashes and links.
   Every link target exists.
3. **Search the packet** for `8e55710`, `507de97c`, `69d6340`, `WP5-UX5-T06`, "in progress"
   and "refreshed after". Each remaining hit must be history, and say so.
4. **`npm run digest`** must still be 690fd8fd…, which shows nothing outside `handoff/`
   changed.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the sections changed;
- the reference image answer;
- the parity result;
- the search result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5

- Sections changed (EN and VI): 0 (identity table, both round paragraphs, evidence sentence), 1, 2, 3 (provenance, table, folder), 5 (REGATE11 drill figures), 6, 7, 8 (stale lines plus the new open decision R-UX5I2-3), 10 (stale lines, device checks, backlog), 11.
- Reference image: REGATE11's drill log records `sha256:47a183b1202aafcce6596ecbd66555519a550c5d3e9e080ffbda5a3bbbcf2b92`, 110,195,889 bytes. It is given as the 1fe5ad3 drill build; image removal is not recorded.
- Parity: 12 sections, 10 subsections, 156 table rows, 37 empty boxes and the 64-hex, 40-hex and 7-hex values, IDs, sample file names, evidence paths and link targets are equal. 0 missing links.
- Search: `8e55710`, `507de97c`, `69d6340`, `WP5-UX5-T06` and "in progress" remain only as history. "refreshed after" has no hit.
- Preflight exit 0 (142 pairs, 2,442 links).
- Digest `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882 files, unchanged.
- Evidence: `handoff/delivery/evidence/WP5-UX5-ACCEPT-PACKET/`. Nothing was committed.

Status: done
