# WP5-CALDEF-ACCEPT-PACKET dispatch brief (pilot packet refresh after the calendar-default round)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-ACCEPT-PACKET, package WP5,
  kind documentation, attempt 1. It depends on WP5-CALDEF-AUDIT (PASS).
- **Purpose.** Bring the pilot packet up to the WP5 acceptance after the R-UX5I2-3 round. The
  owner reviews the packet before authorizing the pilot. This is a handoff-only change: no
  file outside `handoff/` may change.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override.
  - Routing: size M, risk M (the release identity and the open decisions the owner relies
    on), novelty no.
  - Other tasks own the WP5 handoff (`WP5_HANDOFF.md`, `.vi.md`) and docs/03, docs/12,
    README and DEVELOPMENT. Read them, but do not touch them.
  - Task record in English; the packet keeps its EN/VI pair.
- **AGENTS.md on disk wins.** Read it first.

## Accepted identity (verify each figure on the board or in the named record before you copy it)

- **Accepted commit:** `b810ba942c608e058bd8c146de6f076734c48bf2` (WP5-CALDEF-FIX2-FREEZE,
  pushed).
- **Source digest:** `59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a`, 885
  files, `handoff/` excluded.
- **Gate:** WP5-CALDEF-REGATE PASS on b810ba9. It is scoped:
  - only `tests/e2e/classic-scrollbar.spec.ts` differs from 300d61f outside `handoff/`;
  - `dist/` is byte-identical to 300d61f;
  - `npm audit --omit=dev` found 0 vulnerabilities;
  - `npm test` ran 2,425 tests;
  - real-clock FULL e2e: desktop 508/37/0, mobile 429/116/0;
  - six sweeps, 0 failed.
- **Carried forward from WP5-CALDEF-GATE on 300d61f** (FAIL on one pre-existing, date-dependent
  test that WP5-CALDEF-FIX2 fixed): the container drill (209 PASS / 0 FAIL), the round's
  mutants, axe and the other items. Take the drill's stage figures, and its image ID if one
  was recorded, from WP5-CALDEF-GATE's evidence.
- **Final audit:** WP5-CALDEF-AUDIT PASS (`handoff/delivery/WP5_CALDEF_REVIEW.md`).
  - It supersedes WP5-UX5-RECHECK-RN (a54061f / 690fd8fd) as the current acceptance.
  - It closes R-UX5I2-3.
- **Release commit.** Follow the release rule of docs/12:7 and document 08 ("Release"): the
  release commit is the accepted commit, or the latest later commit that changes only
  documentation or workflow tooling, proven with
  `python handoff/delivery/validate_orchestration.py --non-product-range b810ba9..<release>`.
  - 5b2f287 (2026-11-02, documentation and workflow tooling) is inside the accepted snapshot.
  - The documentation fixes after this acceptance (WP5-CALDEF-DOCFIX: docs/03, docs/12,
    README, DEVELOPMENT) are committed by WP5-CALDEF-ACCEPT. That commit does not exist yet.
  - Do not write its SHA or digest. Say that the board record `non_product_since_acceptance`
    and the WP5-CALDEF-ACCEPT task record hold them.
- **WP5 handoff section:** "Re-acceptance after the calendar-default round (WP5-CALDEF,
  R-UX5I2-3)". Link to it by this exact title.

## What to change in `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`

1. **Section 0.**
   - The release identity table and its paragraph: the identity above.
   - Add a short paragraph for the calendar-default round:
     - what changed for people;
     - the gates and the audit;
     - the link to the new handoff section.
   - Keep the rounds 4 and 5 paragraphs as history.
2. **Samples and the ready check (sections 1 to 3).**
   - They come from WP5-UX5-REGATE15 on dc487c6. Find out whether any WP5-CALDEF task
     regenerated them.
   - If none did, state the provenance truthfully. The round changed `dist/server` in five
     modules (errors, schemas, dayEntries, timesheetCommands, timesheets) and the client.
     The PDF, the mail and the send jobs are byte-identical: WP5-CALDEF-AUDIT section 7 and
     `evidence/WP5-CALDEF-AUDIT/45-dist-compare-a54061f-target.txt`.
   - Keep the samples. Do not claim more than that evidence shows.
   - If a sample or the ready check depends on a module that changed, say so and report it.
     Do not regenerate anything.
3. **Section 5, restore proof.** Use WP5-CALDEF-GATE's drill on 300d61f (`dist/` identical to
   b810ba9), with its stage figures from that evidence, if it is complete. Otherwise keep
   REGATE11 and say why. Keep the NAS form blank.
4. **Section 6:** the rollback card identity rows.
5. **Section 8.** R-UX5I2-3 is no longer open.
   - Say that the owner decided it on 2026-11-02, that it is built and accepted, and what
     people see, in short (point to docs/12 for the full text).
   - Keep D-1..D-15, the round-5 decisions and section 9 (unsigned) unchanged.
   - Add the items the owner was informed of, from `WP5_CALDEF_REVIEW.md`. Neither is an open
     blocker:
     - R-CALDEF-3: the picker and the batch answer in three steps, a coordinator decision the
       owner may veto (docs/10);
     - R-CALDEF-4: the optional field, the accepted residual risk.
   - Add the app-wide design question: the secondary-button boundary is 2.05:1 in the light
     theme.
6. **Section 10.**
   - Keep the pilot device checks.
   - Add the round's optional backlog by ID: R-CALDEF-1..4, the 2.05:1 boundary and F2, the
     e2e harness port race.
   - Remove or mark as history every line that still calls R-UX5I2-3 open.
7. **Section 11, the evidence index:** WP5-CALDEF-GATE, -REGATE and -AUDIT, and the review
   pair.
8. **Every other sentence** that presents a54061f / 690fd8fd, WP5-UX5-RECHECK-RN or
   WP5-UX5-REGATE16 as current: make it current, or mark it as history.

## Hard limits

- **Change only:**
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-CALDEF-ACCEPT-PACKET/` (masked LF `.txt`).
- **Do not change** the board, STATE, NEXT_ACTION, the checkpoint, the WP5 handoff or any
  file outside `handoff/`.
- **Git.** Do not commit or push. Run no git command that changes the index or the working
  tree.
- **Shell.** Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT
    IN `2>`), NO `rm -r`, NO `sed -i`, NO PID KILLS, NO GIT CONFIGURATION CHANGES.**
  - Use the Write, Edit, Glob and Grep tools.
- **Task folder:** `D:\.claude-tmp\timesheet\WP5-CALDEF-ACCEPT-PACKET`. Set TEMP and TMP to it.
  Put Node 24 first on PATH before any node call.
- **Private data.** Never write an email address other than the full synthetic
  `@example.invalid` form, and never write a profile path (use `<user>`). Placeholders stay
  placeholders.
- **Links.** No markdown link to a file that does not exist.
- If a permission check denies a call, stop and report.

## Checks

1. **Preflight.** `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
   a scratch `tzdata` on `PYTHONPATH` outside the repository if needed) must exit 0. Write
   `<user>` in the evidence.
2. **EN/VI parity of the packet:** section counts, and identical IDs, SHAs, hashes and links.
   Every link target exists. The handoff section title resolves to a heading in
   `WP5_HANDOFF.md`.
3. **Search the packet** for `a54061f`, `690fd8f`, `RECHECK-RN`, `REGATE16`, `R-UX5I2-3`,
   "open owner decision", "not answered" and "in progress". Each remaining hit must be
   history and say so.
4. **Git status.**
   `git status --short -- handoff/delivery/WP5_PILOT_PACKET.md handoff/delivery/WP5_PILOT_PACKET.vi.md`
   shows only your two files. No digest check: another task changes docs outside `handoff/`.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the sections changed;
- the sample provenance answer;
- the drill source used;
- the parity result;
- the search result;
- the preflight exit code.

Append the same to Results, ending with "Status: done".

## Addendum 1 (2026-11-03, after WP5-CALDEF-SAMPLES)

Your finding about the sample generator led the coordinator to regenerate the samples.
WP5-CALDEF-SAMPLES (verifier) PASSED on a clean export of b810ba9. Read its Results in
`handoff/delivery/tasks/WP5-CALDEF-SAMPLES.md`, its evidence in
`handoff/delivery/evidence/WP5-CALDEF-SAMPLES/` (index `00-README.txt`, comparison
`samples/samples-compare.txt`, index `samples/sample-index.txt`, ready check
`44-ready-check.txt`), and its record on the board.

1. **Sections 1 to 3, and section 11.**
   - Make the packet cite the samples and the ready check of WP5-CALDEF-SAMPLES, regenerated
     from the accepted b810ba9: new folder, file names, numbers and SHA-256 values from its
     `sample-index.txt`.
   - Replace the provenance paragraph that says the samples come from dc487c6 and were not
     re-run.
   - Keep REGATE15 as history: these samples equal REGATE15's in subjects, recipients,
     decoded bodies and PDF text, once the per-run submission ID is normalised.
2. **The comparison, in one or two sentences:**
   - 11 messages and 6 PDFs, `pdf_hash_ok` true;
   - identical content once the submission ID is normalised;
   - the PDF hashes differ by the submission ID and run-to-run byte variance;
   - five Date headers differ by send time;
   - the verifier's caveat on the 06:36 notice time.

   Keep R-UX5RN-6: hashes and Date times are values of a run, not product facts.
3. **Run the checks again:**
   - parity;
   - the search, adding `dc487c6` and "not re-run": each remaining hit is history;
   - preflight;
   - git status of your two files.

   This time also check that the handoff heading exists in `WP5_HANDOFF.vi.md`.
4. The same hard limits apply. Append an "Addendum 1 results" paragraph to Results, ending
   with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5

- **Sections changed** (`WP5_PILOT_PACKET.md` and `.vi.md`): 0 (identity table, paragraphs, new
  calendar-default paragraph, rounds 4 and 5 kept as history), 1 and 2 (provenance wording), 3
  (new provenance paragraph), 5 (drill), 6, 7, 8 (R-UX5I2-3 closed; R-CALDEF-3, R-CALDEF-4 and the
  2.05:1 boundary added), 10, 11. D-1..D-15, the round-5 decisions, section 4 and section 9 are
  unchanged.
- **Sample provenance:** no WP5-CALDEF task regenerated the samples or the ready check. They stay
  from `dc487c6` (WP5-UX5-REGATE15). Reported: the generator imports `timesheetCommands` and calls
  only `createSession` and `updateSession`; the round's hunks there are in the day-entry save path
  (`10-timesheetcommands-hunks.txt`). The sign-offs also pass through `effectiveCategory` in
  `timesheets`, which the round refactored (`11-other-modules-hunks.txt`). The packet says so, cites
  the audit's byte-identical PDF, mail and send jobs, and claims no re-run.
- **Drill source:** WP5-CALDEF-GATE on `300d61f` (209 PASS / 0 FAIL, stages 33/32/57/35/27/23,
  image `sha256:742d2a26…df89`, 110,197,841 bytes), with that run's figures. The REGATE11 drill is
  kept as history.
- **Parity:** `20-parity-links-search.txt`: ## 12/12, ### 10/10, table rows 156/156, boxes 36/36
  (0 ticked), 64-hex, 40-hex, 7-hex, IDs and evidence paths identical, 0 missing links (71 each),
  0 missing backticked evidence paths. The handoff heading "Re-acceptance after the calendar-default
  round (WP5-CALDEF, R-UX5I2-3)" exists in `WP5_HANDOFF.md` (true at the time of the check; the
  `.vi.md` heading was not verified; the packet cites the English title in both languages, as for
  the earlier rounds).
- **Search:** every remaining hit for `a54061f`, `690fd8f`, `RECHECK-RN`, `REGATE16`, `R-UX5I2-3`
  is marked as history, supersession or closure. "in progress" hits are the UI pill. No "open owner
  decision" or "not answered" remains.
- **Preflight:** `validate_package.py --preflight` exit 0 (PASS, 143 translation pairs, 2,621 local
  links), `30-preflight.txt`, `31-preflight-exit.txt`.
- **Git status:** only the two packet files show as modified (`40-git-status.txt`).
- **Slips:** I wrote a few scratch files into `D:\.claude-tmp\timesheet\` (parent of the task
  folder) before moving to the task folder; and one command used `cat`/`wc` with `/dev/stdout`.
  No repository file was affected.
- No commit, stage or push.

Status: done

### Addendum 1 results

Self-reported model: claude-sonnet-5-5

- **Changed (both languages):** sections 0 (release-identity paragraph, evidence paragraph), 1
  (ready check now `WP5-CALDEF-SAMPLES/44-ready-check.txt`), 2 (one sentence), 3 (generation
  paragraph, provenance, new "Comparison with WP5-UX5-REGATE15" paragraph replacing the "not re-run"
  one, sample table file names and SHA-256 values from `sample-index.txt` and
  `samples-compare.txt`, folder path), 10 and 11. REGATE15 and the `dc487c6` samples are kept as
  history. Message numbering changed (S1 msg-03, S3 msg-08, S4 msg-06, N1/N2 msg-01/02, N3/N4
  msg-10/09, N5 msg-05); the table follows it.
- **Comparison stated:** 11 messages, 6 PDFs, `pdf_hash_ok` true; content identical once the submission
  ID is normalised; PDF hashes differ by submission ID and run-to-run variance; five Date headers differ
  by send time; the verifier's 06:36 caveat; R-UX5RN-6 kept (hashes and Date times are run values).
- **Parity:** ## 12/12, ### 10/10, rows 156/156, boxes 36/36, SHA/ID/evidence-path sets identical, 74
  links each, 0 missing, 0 missing evidence paths (`50-addendum1-parity-links-search.txt`).
- **Search** (now also `dc487c6`, "not re-run", "not regenerated"): no hit says the samples were not
  re-run; every remaining `dc487c6`, `a54061f`, `690fd8f`, `RECHECK-RN`, `REGATE15/16` hit is history
  or the comparison.
- **Handoff heading:** exists in `WP5_HANDOFF.md`. In `WP5_HANDOFF.vi.md` it is the Vietnamese "Nghiệm
  thu lại sau vòng mặc định lịch (WP5-CALDEF, R-UX5I2-3)"; the VI packet now cites that title
  (`54-addendum1-vi-heading.txt`, both true). The English title did not resolve there.
- **Preflight:** exit 0 (`51-`, `52-addendum1-preflight*.txt`). **Git status:** only the two packet files.
- **Slips:** a first `sed` rewrite of my check script (to a new file, not in place) produced a broken
  script; I discarded it and used a separate check. No `/dev/stdout`. Scratch stayed in the task
  folder.

Status: done
