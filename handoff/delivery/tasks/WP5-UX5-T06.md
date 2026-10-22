# WP5-UX5-T06 dispatch brief (docs/04, docs/12, the pilot packet and new samples)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T06, package WP5, kind
  documentation, attempt 1. It depends on WP5-UX5-T05B-FREEZE.
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size L, risk M, novelty no.
    - It is docs work with a clear contract: the round-5 changes are frozen and recorded.
    - It also regenerates the pilot samples with the same method as WP5-PILOT.
    - The pilot packet is what the owner reads before authorizing real sending, so it must
      be exact.
    - docs/08 row "Routine slice or docs with a clear contract".
  - Write the task record in English.
- **Sources (read them in full):**
  - the Results of every round-5 slice: `handoff/delivery/tasks/WP5-UX5-T01a.md`,
    `WP5-UX5-T01B.md`, `WP5-UX5-T02.md`, `WP5-UX5-T03.md`, `WP5-UX5-T04.md`,
    `WP5-UX5-T05A.md` and `WP5-UX5-T05B.md`;
  - the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`: section B (the rules that change,
    about lines 789-797), Addendum 1 "B, revised" B-A3 (the docs list, about lines
    1068-1080), and section E;
  - the owner decisions on the board for round 5:
    - Q0 a and Q2;
    - F-1 a, F-2 a, F-3 b, F-4 with the reason rule, F-5 b, F-6 a, F-7 a, F-8 a, F-9 b
      (Indie Flower, WP5-UX5-G-1) and F-10 a;
    - H-1 a;
    - the mockup notes;
  - the WP5-PILOT method: `handoff/delivery/tasks/WP5-PILOT.md` (Results) and its scripts,
    kept as text in `handoff/delivery/evidence/WP5-PILOT/` (`make-samples.mjs.txt`,
    `extract.mjs.txt`, `ready-check.mjs.txt`, `01-commands.txt`);
  - the current `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`,
    `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, and `docs/12_RELEASE_NOTES.md` and
    `.vi.md`.
- **AGENTS.md on disk wins.**
  - Rule 4: synthetic data only. The seed's synthetic signature is the only signature
    image; the owner's reference page is never opened or stored.
  - Rule 6: capture mode or dry-run only.
  - Rule 8: every canonical change goes with its `.vi.md`.
  - The operator-runbook translation rule.
- **Base.** The WP5-UX5-T05B-FREEZE commit on origin/main, with its digest. The coordinator
  writes both under "Base at dispatch" below before dispatch. Before you edit, record HEAD,
  `git status --short` and the digest.

## First: inventory, then stop if a path is missing

Before editing, list:
- every docs/04 line that still describes a round-5 behaviour as it was before round 5, or
  that no slice has updated. Plan B-A3 names, among others, the "Email and PDF" bullets:
  - the employee name, the image when saved, and the date;
  - the time and OT rows chosen per send, with the defaults in Settings.
- every docs/12 entry or known limit that round 5 changed. For example, "partial leave is
  not printed" (R-WA2) and the holiday-label ellipsis may no longer hold after UX5-T02.
  Check each against the frozen code; do not assume.
- every pilot-packet sentence that round 5 made false. For example:
  - "A change of recipients does not reach an existing revision";
  - "sign off and submit";
  - the samples and their provenance;
  - the settings checklist;
  - the owner decisions list.
- whether `docs/07_DEPLOYMENT_AND_OPERATIONS.md` or `docs/11_OPERATIONS_RUNBOOK.md` (with
  `.vi.md`) still says that a sign-off sends. If so, those lines are in scope.
- whether the WP5-PILOT sample scripts still run against the frozen code. List what must
  change, for example: sign off, then an explicit send through the send service; send
  records; PDF variants.

If a needed path is not in "Owned paths", stop and report before editing.

## Scope

1. **docs/04 (+ vi):** a final round-5 pass. Every line matches the frozen behaviour. Do
   not re-word what is already true.
2. **docs/12 (+ vi):** release notes for round 5, in the existing style:
   - the UI changes;
   - sign-off and send as separate acts;
   - the per-send envelope and PDF rows, with the reason for another copy;
   - the optional signature image;
   - the redesigned one-page PDF with the Indie Flower font;
   - the 480 / 768px layout;
   - the known limits as they now stand.
3. **The pilot packet (+ vi).** Rewrite only what round 5 changed:
   - **Section 2.**
     - Sender and recipients: To, Cc, Subject and body have Settings defaults and can be
       edited for each send.
     - Another copy needs a confirmation and a reason.
     - The capture self-test becomes "sign off, then send" one synthetic period.
     - The first-real-send notes, adjusted to the split.
   - **Section 3.** New samples from a clean `git archive` export of the T05B-FREEZE commit,
     made with the WP5-PILOT method:
     - `npm ci`, `build:server`;
     - the production services and job handlers;
     - fixed clocks, capture mode, synthetic users at `example.invalid`;
     - `PRODUCTION_SENDING_ENABLED` never set; nothing sent.

     Cover at least these samples:
     - S1: a manual sign-off, then a send of revision 1;
     - S2: a correction (revision 2) sent as another copy, with its reason;
     - S3 and S4: automatic submissions with the note line off and on;
     - S5: the deadline send of a signed revision (F-2 a);
     - S6: one send with the time rows off;
     - the notices N1-N4.

     Each sample has a message `.txt`, a page render `-synthetic.png` and the PDF text. Each
     PDF has one page, and its stored hash equals the captured attachment. Write the new
     provenance paragraph and "What the samples show", including the known limits. Keep
     the wording-approval checklist and add the reason-rule item.
   - **Section 4:** the settings checklist, with "Time rows on the PDF" and "OT rows on the
     PDF" as defaults.
   - **Section 8:** add the round-5 owner decisions to the table, each with "what it
     changed".
   - **Sections 10 and 11:** limits and the evidence index.
   - **Do not change** the release identity (commit, digest, image ID), the drill figures
     of section 5, or the identity rows of sections 6 and 7. The round-5 package gate
     produces them, and ACCEPT-DOCS refreshes them afterwards. Mark each such place with
     one line saying it is refreshed after the round-5 gate.
4. **docs/07 and docs/11 (+ vi):** only the lines the inventory found that still say a
   sign-off sends.

## Checks (in order; the digest is the LAST command)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. The inventory. Stop if needed.
3. Generate the samples in your task folder from the clean export. Record the commands,
   their exits and the hashes. Copy the sample files and the adapted scripts, as `.txt`,
   into the evidence folder.
4. Write the docs.
5. Run `parity.mjs` (as in WP5-PILOT) on every pair you touched, then
   `validate_package.py --preflight` with the workflow Python. Write `<user>` in the
   evidence.
6. `node scripts/precommit-check.mjs --self-test` if it exists, as in WP5-PILOT, and a
   privacy scan of the evidence: only `example.invalid` addresses, no profile path, and no
   real names, hosts or credentials.
7. `git diff --check`.
8. `npm run digest` LAST. It must equal the base digest: this task changes no source.

## Owned paths

- `docs/04_UX_AND_SETTINGS.md`, `docs/12_RELEASE_NOTES.md`, each with its `.vi.md`.
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `docs/11_OPERATIONS_RUNBOOK.md`, each with its
  `.vi.md`, only as limited in Scope item 4.
- `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`.
- `handoff/delivery/evidence/WP5-UX5-T06/`: samples, renders, text dumps, the scripts as
  `.txt`, and logs.
- this brief's Results section.
- No source, test, script or package file.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-T06` (the export and the build live
  there). Ports 49800-49819.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change npm
  dependencies in the repository. `npm ci` runs only in the export, in the task folder. Do
  not stage, unstage or commit anything.
- Mail goes only to capture. No real sending; `PRODUCTION_SENDING_ENABLED` is never set.
- Stop every server you start through its own handle. Before returning, make sure none of
  your background commands is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Base at dispatch

(written by the coordinator before dispatch)

## Results
