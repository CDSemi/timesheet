# WP5-UX5-RELNOTES dispatch brief (release notes and README status after rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RELNOTES, package WP5, kind
  documentation, attempt 1.
  - It depends on WP5-UX5-AUDIT-INT3 (PASS on 0b45781 / 67aa715c), which re-accepted WP5
    after UI change rounds 4 and 5.
  - **Why.** `docs/12_RELEASE_NOTES.md` still says rounds 4 and 5 are in progress and await
    their gate and audits (line 7 and the "UI change round 5" limits), and `README.md` still
    says WP4 awaits its gate and is not accepted (lines 3, 12 and 54). Both files are inside
    the source digest (only `handoff/` is excluded). So this is a documentation-only source
    change. It is frozen, gated and audited again before the pilot packet names the release.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size S, risk L, novelty no (docs/08 "Routine slice or docs with a clear contract"). Task
  record in English; the documents keep their EN/VI pairs.
- **Baseline.** HEAD should be `0b457817ed29806a36fdd78cc22ac84a0cc2db9d` (WP5-UX5-FIX19-FREEZE,
  pushed) or a later commit that changes only `handoff/`. Digest
  `67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b`, 882 files. Record HEAD
  and `npm run digest` before you edit. If anything outside `handoff/` differs from HEAD
  before you start, stop and report.
- **AGENTS.md on disk wins.** Read it first.

## Read

- `AGENTS.md`; `docs/12_RELEASE_NOTES.md` and `.vi.md`; `README.md` and `README.vi.md`.
- `handoff/delivery/WP5_UX5_REVIEW_INT3.md`: the acceptance, the "Optional backlog for the
  WP5 handoff" and "Software readiness" sections.
- The board `handoff/delivery/ORCHESTRATION.json` (read only): the tasks `WP5-UX5-REGATE11`
  to `WP5-UX5-REGATE14` and `WP5-UX5-AUDIT-INT3`. Take every figure you write from the board
  or from the task records and evidence it names, never from this brief.

## What to change

1. **`docs/12_RELEASE_NOTES.md`**
   - **Line 7, release identity.** Keep the rule that a document cannot hold the digest of
     the tree that holds it, and keep the historical `8e99d2c` / `1e59ad31` sentence.
     Replace the "rounds 4 and 5 are in progress … refreshed … at re-acceptance" clause with
     the facts:
     - rounds 4 and 5 passed their package-final gate (WP5-UX5-REGATE14) and integration
       audit (WP5-UX5-AUDIT-INT3) on `0b45781`;
     - these notes and the README status were then refreshed in a documentation-only commit,
       which was gated and audited again;
     - the release is that commit, and its SHA, digest and file count are recorded in the
       WP5 handoff and in the gate record.

     Write no digest of the new tree anywhere.
   - **Statements that a gate, an audit or a re-acceptance of a round is still to come.**
     Examples are line 20 (round 1, "needs its own gate and fresh independent audit") and
     line 119 ("The container drill was not run for round 5 by its slices … belong to the
     package-final gate"). Rewrite each such statement as what happened, naming the
     accepting gate and audit IDs from the board.
     - For the drill, state which gate ran it last, on which commit and with what result.
       Say that `dist/server` and `dist/domain` stayed identical from that commit to
       `0b45781`, so the later gates carried it forward. Verify every part from the gate
       records.
     - Keep every known limit that is still true. Do not remove a limit because a round was
       accepted.
   - **Line 120, samples.** Make it point to the pilot packet section 3 for the samples and
     their provenance, without claiming which commit they represent.
   - Header line 3 ("The pilot has not run and nothing is authorized") stays.
2. **`README.md`**
   - Bring the repository status (line 3), the start step 4 (line 12) and the closing
     paragraph (line 54) up to date:
     - WP1 to WP4 are independently accepted;
     - WP5 is software ready: independently accepted, and re-accepted after UI change rounds
       1 to 5;
     - the pilot is pending and the NAS is NOT VERIFIED;
     - no production deployment or real email has occurred;
     - the next step is the owner's review of the pilot packet
       (`handoff/delivery/WP5_PILOT_PACKET.md`).
   - Add the WP5 handoff to the reading list in step 3 (line 11).
   - Change nothing else. Keep "Original documentation revision" as it is.
3. **The `.vi.md` pairs** of both files get the same facts, IDs, SHAs and links, in
   Vietnamese.
4. **Read-only question for the next task** (answer in Results; change nothing for it).
   - The pilot samples were regenerated from the round-5 freeze commit `69d6340` (see
     `handoff/delivery/WP5_PILOT_PACKET.md` section 3 and
     `handoff/delivery/evidence/WP5-UX5-T06/`).
   - Find which source paths render the PDF and the email: the PDF module, the email
     templates and builders, the PDF fonts and assets, and anything they import that
     shapes output.
   - Report `git diff --stat 69d6340 0b45781 -- <those paths>`. Say whether the samples
     still represent `0b45781` byte for byte or only in layout, or not at all. Name each
     commit that changed a rendering path.
   - Also report the recipe that regenerated the samples in WP5-UX5-T06, as its record
     describes it.

## Hard limits

- Change only:
  - `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`;
  - `README.md` and `README.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-RELNOTES/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint, the pilot packet or the WP5
  handoff; the coordinator and the next task own them.
- No other path outside `handoff/` may change. Do not commit or push. Run no git command that
  changes the index, the working tree or any configuration.
- No markdown link to a file that does not exist. Keep every existing link.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -p`, NO `python -c`,
    NO `| node`, NO `| python`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`,
    `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO `sed -i`, NO
    `sleep` AS A WAIT.**
  - Use the Write, Edit, Read, Glob and Grep tools for files.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-RELNOTES`. Set TEMP and TMP to it. Put Node 24
  first on PATH before any node or npm call. Do not run `npm ci` or `npm install`.
- Never write an email address other than the full synthetic `@example.invalid` form, and
  never write a profile path (write `<user>`). Evidence names end in `.txt`.
- If a permission check denies a call, stop and report.

## Checks

1. Run `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`).
   It must exit 0.
2. Run `git status --porcelain` and `git diff --stat`, both outside `handoff/`. Exactly the
   four files above may differ.
3. Run `npm run digest` after the edit. Record the new digest and file count (expected 882
   files).
4. EN/VI parity of both pairs: heading counts, and identical IDs, SHAs and links. Check that
   every link target in the four files exists.
5. Search `tests/` and `scripts/` for any reader of `README` or `12_RELEASE_NOTES`. If one
   exists, run that test file and record the result.

## Return

Return at most 200 words, beginning with "Self-reported model: ...". Include:
- the files changed, with one line per changed statement;
- the drill sentence, with its source;
- the preflight exit code;
- the diff-scope result;
- the digest before and after, with the file count;
- the parity result;
- the answer to item 4 (rendering paths, the diff stat, whether the samples represent
  `0b45781`, and the T06 recipe).

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5

Files changed: `README.md`, `README.vi.md`, `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`; this Results. Scratch: `D:\.claude-tmp\timesheet\WP5-UX5-RELNOTES` (no evidence folder needed).

Statements changed (EN and VI alike):
- README: line 3 status (WP1 to WP4 accepted; WP5 software ready, re-accepted after rounds 1 to 5; pilot pending; NAS NOT VERIFIED); step 3 gains the WP5 handoff; step 4 (next step is the owner's review of the pilot packet); closing paragraph (no deployment or real email kept).
- Notes line 7: rounds 4 and 5 passed WP5-UX5-REGATE14 and WP5-UX5-AUDIT-INT3 on 0b45781; docs-only refresh commit gated and audited again; release is that commit; no new digest written. `8e99d2c` / `1e59ad31` sentence kept.
- Notes rounds 1 to 5 "still needs a gate" clauses now name: round 1 WP5-UX-REGATE8 + WP5-UX-AUDIT-AB9; round 2 WP5-UX2-REGATE2 + WP5-UX2-AUDIT2; round 3 WP5-UX3-REGATE5 + WP5-UX3-AUDIT-INT; rounds 4 and 5 WP5-UX5-REGATE14 + WP5-UX5-AUDIT-INT3 (superseding RECHECK-A2 and RECHECK-B3). All limits kept.
- Drill sentence (source: board gate_notes of REGATE11, 12, 13, 14; AUDIT-INT3 section 5): last run by WP5-UX5-REGATE11 on 1fe5ad3, `drill --wp3` 209 PASS / 0 FAIL, although that gate failed on an unrelated e2e timeout; REGATE12, 13, 14 showed dist/server and dist/domain identical to 0b45781 and carried it forward.
- Samples line points to pilot packet section 3 only.

Checks: preflight exit 0 (140 pairs, 2410 links). Diff outside handoff/: exactly the four files. Digest before 67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b, after 2072e3f206ff2003a9c7563b23267da463eeae6373f3f4eb98e660137fefb99b, 882 files both (HEAD 0b45781). Parity OK for both pairs (notes: h2 5/5, h3 5/5, 51/51 links; README: 3/3, 35 vs 36 links, the extra is the VI back-link line that was already there). No test or script reads README or 12_RELEASE_NOTES (the two README hits are other files).

Item 4 (read-only). Render paths: `src/server/pdf/{timesheetPdf,layout,fonts}.ts`, `assets/pdf-fonts/*`, `src/domain/{emailTemplate,brand,snapshot,format,dates,zones,instants,canonical}.ts`, `src/server/mail/*`, `src/server/jobs/pdfJob.ts`, package.json and lockfile. `git diff --stat 69d6340 0b45781` over them: package-lock.json 26, package.json 4, `src/server/pdf/timesheetPdf.ts` 20; 3 files, +32/-18. Commits: 94accda9 (drawCategory: leave line when a day has both holiday and leave) and f4049aa7 (nodemailer 10.0.14 to 10.1.4, zod 4.6.5 to 4.6.6). `deliveries.ts`, `restore.ts` (1fe5ad30, 0f52300c) changed but do not render. The samples have no holiday label and no leave day and drawCategory is stated unchanged for one-of-two cases, so the PDFs very probably match in content and layout; byte equality is not proven (not regenerated). Email bytes use a newer nodemailer and random boundaries/Message-IDs, so only content, not bytes, can match. T06 recipe: clean `git archive 69d6340` export, `npm ci` (Node 24), `npm run build:server`, `node make-samples.mjs` (built dist services, fixed clocks, capture mode, example.invalid users, 11 messages, 6 PDFs), `node extract.mjs` (PDF text, Edge renders), ready-check on port 49800; scripts in `evidence/WP5-UX5-T06/*.mjs.txt`, commands in `01-commands.txt`.

Status: done
