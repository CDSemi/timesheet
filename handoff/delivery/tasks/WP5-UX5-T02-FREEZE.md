# WP5-UX5-T02-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T02-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-T02 (done).
- **What this commit freezes.** Round-5 slice T02:
  - the PDF redesign, one page in all four variants;
  - the Indie Flower handwriting font (SIL OFL 1.1) as an asset, with ADR 0001;
  - the shared brand paths;
  - the Dockerfile and `.dockerignore` lines;
  - docs/03 (+ vi).
- **Coordinator records it also carries:**
  - the T01B-FREEZE results and evidence;
  - the T02 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". The owner
  approved the font (WP5-UX5-G-1, Indie Flower). Every path you may stage is listed here as
  dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  9917ae8443f46cc3fc2dce79214176ff04bc01ba.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T02-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - **Staging rule:**
    - Name every path literally as an argument of plain `git add` calls, at most about 20
      per call. Each call is its own command.
    - Never use `--pathspec-from-file`, `xargs`, a list file, a glob, `git add -A` or `.`.
    - The exception: an evidence folder named below may be given as its directory path.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (24 paths: 16 modified, 8 new)

- **New (8):**
  - `assets/pdf-fonts/IndieFlower-Regular.ttf`. This is the **only font or binary file
    allowed**. Check that its size is 108,196 bytes and its SHA-256 begins `ccc94b22` and
    ends `0a94`, matching `assets/pdf-fonts/README.md`.
  - `assets/pdf-fonts/OFL.txt`, `assets/pdf-fonts/README.md`, `assets/pdf-fonts/README.vi.md`.
  - `docs/adr/0001-pdf-handwriting-font.md` and `docs/adr/0001-pdf-handwriting-font.vi.md`.
  - `src/domain/brand.ts`.
  - `tests/integration/pdf-layout.test.ts`.
- **Modified (16):**
  - `.dockerignore`: exactly one added line, `!assets/pdf-fonts/`. Check with
    `git diff -- .dockerignore`.
  - `Dockerfile`.
  - `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`.
  - `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs`.
  - `src/client/components/BrandWordmark.tsx`.
  - `src/server/pdf/fonts.ts`, `src/server/pdf/layout.ts`, `src/server/pdf/timesheetPdf.ts`.
  - `tests/client/wordmarkAsset.test.ts`.
  - `tests/e2e/pdf-visual.spec.ts`, `tests/e2e/automation.spec.ts`.
  - `tests/integration/jobs.test.ts`, `tests/integration/sends.test.ts`,
    `tests/integration/pdf-render.test.ts`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop.

Any of these also stops the commit:
- `package.json` or a lockfile;
- `scripts/precommit-check.mjs`;
- the validators;
- the AGENTS or CLAUDE files, or `.claude/`;
- a migration;
- a second font file or any other binary;
- a `zz-*` probe;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
0f0467ab2985896131a969835f3e9c0dd23c7ad18e6e5f2bf9403f8cac977652 (862 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX5-T01B-FREEZE.md` (its Results).
- **New:**
  - `handoff/delivery/evidence/WP5-UX5-T01B-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX5-T02.md`;
  - the folder `handoff/delivery/evidence/WP5-UX5-T02/`: `.txt` files and four
    `-synthetic.png` files;
  - this brief, as it stands before you append results.

**Key and PEM scan** on the new evidence folders and on `assets/pdf-fonts/OFL.txt` and the
READMEs, with the rule of `WP5-UX4-FIX3-FREEZE.md`. Record the hits and their
classification. The licence text is expected to contain URLs and the font author's name;
those are not personal data.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX5-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX5-*/`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- An email other than `@example.invalid` stops the commit, except the font licence's own
  contact lines in `OFL.txt`. Record those lines.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX5-T02-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (0f0467ab…).
4. The set comparison, the font size and hash, the `.dockerignore` diff, and the scans.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test, script, asset text or docs file stops
the commit; report it.

## Addendum 1 (coordinator, for attempt 2 by the same committer)

- **Attempt 1** stopped at `git diff --cached --check`, on trailing whitespace in
  `assets/pdf-fonts/OFL.txt:21`. The 61 paths stay staged.
- **The author fixed it** (WP5-UX5-T02 Addendum 3):
  - `OFL.txt` has its trailing whitespace removed; the wording is unchanged;
  - `assets/pdf-fonts/README.md` and `README.vi.md` note it;
  - `docs/adr/0001-pdf-handwriting-font.md` and `.vi.md` say the same;
  - the font file and its SHA-256 are unchanged.
- **The new expected digest** is
  1b4132739017e8f153cc32764b84a8a698b406e5ada027bb3d8d4f7ff701aca1 (862 files). It replaces
  0f0467ab everywhere in this brief, including the commit message's "Digest:" line.
- **The path set is unchanged** (24 outside handoff).
- **Re-stage with explicit plain `git add`:**
  - the five changed asset and ADR files;
  - `handoff/delivery/tasks/WP5-UX5-T02.md`;
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair.
- **Then rerun every check** from step 3, including `git diff --cached --check`, the scans
  and the validators. Commit and push. Write the results under "### Attempt 2".

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX5-T02: redesigned one-page timesheet PDF with a handwriting font

- feat(pdf): the timesheet PDF follows the workbook layout:
  - a header with the C&D logo and wordmark, and "Revision n" with the submission id;
  - the company and form titles;
  - indented Employee, Payroll Date and Period fields;
  - two week tables with small-caps day names, tinted non-working days, and time and OT
    rows;
  - the overtime total;
  - two signature rows;
  - a copyright and "Internal use by C&D only" footer.

  Every variant fits one page.
- feat(pdf): day categories are written in Indie Flower (SIL OFL 1.1), embedded as a subset,
  with DejaVu Serif Italic for any character the font lacks.
- chore(assets): add `assets/pdf-fonts` (the font, `OFL.txt` and a README with source, version
  and SHA-256). The image build copies it.
- refactor(brand): the wordmark paths move to a shared module used by the app and the PDF.
- docs: ADR 0001 (+ vi) and docs/03 (+ vi).
- test: a layout suite; the PDF render, jobs, sends, wordmark, PDF-visual and automation
  tests follow the new layout.
- docs(handoff): the T01B-FREEZE results, the T02 record and evidence, the board and the
  checkpoint (+ vi).

Task: WP5-UX5-T02 (owner decisions F-8 a, F-9 b, F-10 a, Q2; WP5-UX5-G-1 font approval)
Gate: pending (round-5 package gate covers rounds 4 and 5)
Audit: pending (round-5 audits)
Digest: 0f0467ab (was 089cf868)

Save the final message as
`handoff/delivery/evidence/WP5-UX5-T02-FREEZE/commit-message.txt`. Leave it, checks.txt and
this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- every scan hit with its classification;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- STOPPED at check 7: `git diff --cached --check` exit 2, `assets/pdf-fonts/OFL.txt:21` trailing whitespace (asset text file, not an allowed fix). No commit, no push. HEAD = origin/main = 9917ae84. Digest 0f0467ab (862 files) matched. 61 paths staged (24 outside handoff, 37 handoff). Details: evidence/WP5-UX5-T02-FREEZE/checks.txt.

### Attempt 2

- HEAD before 9917ae84, after b4c500456a69158571799f8f0d90f035fd7a0fa5; pushed, origin/main = b4c50045.
- Digest before add and post-commit ls-tree: 1b4132739017e8f153cc32764b84a8a698b406e5ada027bb3d8d4f7ff701aca1 (862 files).
- Staged 61: 24 outside handoff, 37 handoff (no extra handoff paths beyond the listed set). The committed brief is the attempt-1 staged copy.
- All checks exit 0 (cached --check, precommit, JSON, validate_orchestration, check_recovery 106, preflight). Scans: 0 hits. No masking, no fixes by committer.
