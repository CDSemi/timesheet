# INGAT-T0T8-FIX1 dispatch brief (fix audit findings F1-F3; wording and evidence only)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-FIX1, kind fix,
  attempt 1. It answers INGAT-T0T8-AUDIT attempt 1 (FIX REQUIRED; `addresses_audit`
  INGAT-T0T8-AUDIT). It depends on the snapshot of INGAT-T0T8-IMPL (gate INGAT-T0T8-GATE
  PASS). Worktree `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`,
  branch `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile);
  requested model sonnet; no override. Routing: size S, risk L, novelty no: comment,
  wording and evidence-masking edits named by the audit, no behaviour change. docs/08 row
  "Accepted finding naming file/fix/tests" (skip a plan; check each finding first).
  Write the task record in English.

## Source of truth

- `handoff/delivery/INGAT_T0_T8_REVIEW.md`, "Findings" F1, F2, F3 and the optional R1, R6,
  R7 quoted below. Read the review in full.
- `AGENTS.md` from disk (English canonical, `.vi.md` pairs aligned in the same change).

## Scope (no behaviour change; no other line changes)

1. **F1, `ingat.toml` comments.** First confirm with `docker image inspect` of a local build
   (or of the gate's image `ingat-t0t8-gate:local` if it still exists) that `Entrypoint`
   is `["docker-entrypoint.sh"]`. Then:
   - line about "The image has no ENTRYPOINT" (about line 138): state that the image
     keeps the Node base image's `docker-entrypoint.sh`, which runs a task argv that
     starts with a program unchanged;
   - the `[app_env] forbidden` comment (about line 29): name the three groups correctly
     (fixed by the image ENV block; the static-root override `STATIC_DIR`, which the
     production server reads; development-only seed passwords).
   - **R7** (same file, about line 139): the exit maps are documented in the `cli.ts`
     header (all commands) and in docs/11 for backup, restore and outbound; say so.
   - Only comment lines change. Every key and value stays byte-identical.
2. **F2, "every commit" wording.** The image workflow builds the tip commit of each push
   to `main` (`$GITHUB_SHA`); the validate workflow runs on every push to `main` and every
   pull request. Correct the wording, with no behaviour change, in:
   - `.github/workflows/image.yml` header comment (line 1 and any other header line that
     says "every commit");
   - `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`, the Ingat paragraph (about
     line 9);
   - `docs/adr/0002-ingat-manifest-and-ghcr-image.md` (Consequences, about line 59) and
     `.vi.md` (about line 57).
   Add one sentence in the ADR Consequences (EN and VI): a commit pushed together with
   later commits gets no image, so Ingat can deploy only a commit that was the tip of a
   push; before the first release this repository pushes after every commit (docs/08).
   Only lines that say "every commit"/"every push" and this one new sentence change.
3. **R1 and R6, ADR facts (EN and VI), one sentence each.**
   - R1: `ingat validate` checks the Compose policy with CPU CFS assumed present, so a
     later non-zero `cpus` would pass CI although the target host refuses it; any CPU
     limit must stay an optional param that sends nothing when unset.
   - R6: where the ADR says Ingat 0.1.x cannot run "a subnet param", make it precise: a
     subnet param left to allocation.
4. **F3, evidence masking.** In exactly these four files, replace every `docker ps` row that
   is not a container of the task itself with one line
   `[N containers that are not this task's; names and ports omitted]` (N = the number of
   rows removed); keep the header and the task's own rows:
   - `handoff/delivery/evidence/INGAT-T0T8-GATE/cleanup.txt` (about lines 6-12);
   - `handoff/delivery/evidence/INGAT-T0T8-GATE/g5.txt.txt` (about lines 32-33);
   - `handoff/delivery/evidence/INGAT-T0T8-IMPL/g5.txt` (about lines 30-31);
   - `handoff/delivery/evidence/INGAT-T0T8-IMPL/ps.txt` (line 1 and any other row).
   Then Grep all of `handoff/delivery/evidence/INGAT-T0T8-*` and the track briefs for any
   other `docker ps` listing of unrelated containers, and report each hit (mask it only
   if it is in the PLAN, IMPL or GATE evidence folders; do not edit AUDIT evidence or the
   review: they belong to the auditor; report those instead). Never print a removed row
   into your own evidence or Results.

## Owned paths

- `ingat.toml` (comment lines only), `.github/workflows/image.yml` (header comment only);
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md` (the Ingat paragraph only);
- `docs/adr/0002-ingat-manifest-and-ghcr-image.md` and `.vi.md`;
- the four F3 evidence files, and other PLAN/IMPL/GATE evidence files only for the
  masking of scope item 4;
- this brief's Results; `handoff/delivery/evidence/INGAT-T0T8-FIX1/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-FIX1`.
- Not owned: `.github/workflows/ingat-validate.yml`, docs/11, every other file.

## Checks (in order)

1. Before any edit: identity of the audited snapshot (HEAD, `git status --short`, the nine
   hashes in `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt`, `node
   scripts/source-digest.mjs` = `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd`).
   Stop and report on a difference.
2. Edits.
3. `ingat validate` exactly as the CI job runs it (pinned digest
   `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`,
   read-only, `--network none`): exit 0.
4. A proof that only comments changed in `ingat.toml` and `image.yml`. The files are
   untracked, so in check 1 (before editing) copy both to the task folder with `cp` and
   confirm the copies' SHA-256 equal the snapshot list (the plan's
   `evidence/INGAT-T0T8-PLAN/proposed-ingat.toml.txt` and `proposed-image.yml.txt` are
   byte-identical spares). After editing, a script file run with the workflow Python
   `-I` compares old and new with comment-only lines and trailing `#` comments removed
   and reports no difference; for `ingat.toml` it also parses both with `tomllib` and
   reports equal data.
5. actionlint pinned by digest on both workflows (as in the plan J G3): exit 0.
6. Parity (the WP5-UX5-T06 script) on the docs/07 and ADR pairs;
   `validate_package.py --preflight` with the workflow Python; `git diff --check`.
7. Privacy: the precommit gate on a scratch repository in the task folder holding the
   nine snapshot files and the four F3 files (per-file `cp`, per-file `git add`), and a
   Grep over the track's evidence folders for `docker ps` header lines, reporting what
   remains.
8. **LAST:** `node scripts/source-digest.mjs`, then the new snapshot list
   `handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` (same format as the
   IMPL one: every changed or new file outside `handoff/`, sorted). No edit after this.

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS (NO `docker run -it`).**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Redirect output to files in the task folder and read them with Read.
- Do not save a `docker ps` listing of the whole machine into the evidence; filter by your
  own container names (`docker ps -a --filter name=<yours>`).
- Never run anything against the owner's NAS; never push an image. Do not stage, commit or
  push in the repository.
- Before returning, no container or background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Evidence: `handoff/delivery/evidence/INGAT-T0T8-FIX1/`.

1. Identity before edit: HEAD 2bce0ab, nine hashes OK, digest 79ca6562... (`identity-first.txt`); originals of
   `ingat.toml` and `image.yml` copied to the task folder, SHA-256 equal to the snapshot list. Entrypoint of
   `ingat-t0t8-gate:local` is `["docker-entrypoint.sh"]` (confirmed).
2. Edited: F1 (two comments plus R7), F2 (image.yml header, docs/07 EN+VI, ADR EN+VI plus new sentence), R1, R6 (ADR
   EN+VI), F3 (6+1+1+1 unrelated rows masked in the four files).
3. `ingat validate` (pinned digest, read-only, no network): exit 0 (`c3-validate.txt`).
4. Comment-only proof: non-comment lines equal for both files; `tomllib` data equal; exit 0 (`c4-comments-only.txt`).
5. actionlint by digest on both workflows: exit 0 (`c5-actionlint.txt`).
6. Parity docs/07 and ADR pairs OK; preflight PASS; `git diff --check` 0 (`c6-docs.txt`).
7. Privacy: precommit gate PASS (13 files, 0 blocking); no unrelated container names remain in the track's
   PLAN/IMPL/GATE/AUDIT evidence, briefs or reports; remaining `docker ps` header lines are the three masked files
   (header kept, own rows only) (`c7-privacy.txt`). No AUDIT-folder hit to report.
8. Last: digest `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 files), new list in
   `snapshot-sha256.txt`. Nothing staged or committed; no container left running.

Status: done
