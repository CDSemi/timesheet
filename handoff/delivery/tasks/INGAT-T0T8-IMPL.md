# INGAT-T0T8-IMPL dispatch brief (write ingat.toml, the two workflows, ADR 0002 and the doc lines)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-IMPL, kind
  implement, attempt 1. It depends on INGAT-T0T8-PLAN (done; coordinator accepted it as
  the plan). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H, novelty no.
    - Risk H: the manifest drives backup and restore of the app under Ingat
      (recovery/restore) and the files land in a public repository (privacy).
    - Novelty no: the plan gives the exact texts, validated with the pinned Ingat image.
    - docs/08 row "High-risk fix/slice with an existing pattern".
  - Write the task record in English.

## Source of truth

- The plan: `handoff/delivery/tasks/INGAT-T0T8-PLAN.md`, Results sections A-L. Read it in
  full. Section J is your task definition; this brief adds to it and wins where they
  differ.
- The exact texts: `handoff/delivery/evidence/INGAT-T0T8-PLAN/proposed-ingat.toml.txt`,
  `proposed-ingat-validate.yml.txt`, `proposed-image.yml.txt`. Copy them byte for byte
  (LF line endings). A deviation needs a recorded reason in Results.
- `AGENTS.md` from disk (rules 4, 8, 11, 12; the ADR rule in "Prime Directive"; the
  `.vi.md` rule).
- For the ADR shape: `docs/adr/0001-pdf-handwriting-font.md` and `.vi.md`.
- Ingat docs (read-only, `D:\Dropbox\Work.LISA\LisaHQ\Ingat`): only where the ADR cites
  them (MANIFEST_SPEC, ADR-0026). Write nothing there. Never copy text from its
  `_private/` folder.

## Scope

1. `ingat.toml` at the repository root (plan C).
2. `.github/workflows/ingat-validate.yml` (plan F) and `.github/workflows/image.yml`
   (plan E).
3. `docs/adr/0002-ingat-manifest-and-ghcr-image.md` and `.vi.md` (plan H item 1). It must
   also record, as facts for the owner:
   - the S15 finding of plan G (Node.js v24.21.0 on glibc; official support for a 4.4
     kernel: no, Tier 1 starts at 4.18; practical risk unverified; the runtime stays
     until the owner decides after Ingat's S15 spike);
   - that `expect_labels` binds only the revision label (plan E "Labels");
   - that Ingat pulls by the commit tag, then pins by image ID and records the
     repository digest (plan B row 7);
   - that nothing has run on GitHub or on the target host yet.
4. `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`: the one paragraph of plan H item 2.
5. `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: only the section 1 step 2 sentence of
   plan H item 3.

Keep the wording plain and short, in the existing style of each document. Do not add
host values (plan J criterion 5). Write "the target host" or "the NAS" (already used in
docs/07), never device, system or network details of the owner's machine.

## Owned paths

- `ingat.toml`, `.github/workflows/ingat-validate.yml`, `.github/workflows/image.yml` (new);
- `docs/adr/0002-ingat-manifest-and-ghcr-image.md`, `docs/adr/0002-ingat-manifest-and-ghcr-image.vi.md` (new);
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md`,
  `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md` (the limited lines);
- this brief's Results; `handoff/delivery/evidence/INGAT-T0T8-IMPL/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-IMPL`.
- Everything else stays byte-identical, in particular `Dockerfile`, `.dockerignore`,
  `compose.example.yaml`, `package.json`, `package-lock.json`, `src/`, `scripts/`,
  `tests/`, every other doc, and every file under `handoff/` except your own.
- If a needed change falls outside these paths, stop and report before editing.

## Checks (in order)

1. Before any edit: HEAD, `git status --short`, `git log -1 --format=%H main`,
   `git ls-remote https://github.com/CDSemi/timesheet.git refs/heads/main`, and
   `node scripts/source-digest.mjs` (Node 24). If HEAD differs from
   `2bce0ab5842b80c710f23496d5173c122319e5c7`, or `main` has moved and the move touches
   any path of plan A, stop and report.
2. Write the files.
3. Run the plan J gate commands G1, G1n, G2, G3, G4, G5 (steps 1-3 and 5-7 of the plan G
   list, against the locally built image, synthetic data only, every container `--rm`; the
   detached server of step 4 is optional and, if run, is stopped with `docker stop`),
   G6, G7 and G8.
   - G6: in the scratch repository use explicit `git add <path>` per file, not `git add -A`.
     Copy files with `cp` per file. The scratch repository lives in the task folder only.
   - Skip G9 (the verifier runs it).
4. Translation check on each pair you touched: `parity.mjs` as used in task WP5-UX5-T06
   (see `handoff/delivery/tasks/WP5-UX5-T06.md` and its evidence folder for the script) if
   it is available; otherwise compare headings, lists, tables and code spans by reading,
   and say so. Then `validate_package.py --preflight` with the workflow Python (it lives
   under `handoff/delivery/`; Glob for it).
5. `git diff --check`.
6. **LAST:** `node scripts/source-digest.mjs` again, then the snapshot identity: one line
   per changed or new file outside `handoff/`, `sha256sum <path>`, written to
   `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt` (paths relative to the
   repository root, sorted). No edit after this step.

Copy masked logs (`<user>` for the account segment of a profile path) into the evidence
folder; keep raw logs in the task folder.

## Do not claim

- No GitHub run, no GHCR push, no package visibility, no NAS run and no S15 result exists.
  The Results and the docs say so plainly.

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS (NO `docker run -it`).**
  - Note: the S15 probe commands of plan G use `node -e` and `node --input-type=module -e`
    INSIDE a container (`docker run ... <image> node -e ...`). That is allowed: it runs in
    the container, not on this machine, and reads no stdin. Prefer writing the probe
    script to a file in the task folder and mounting it read-only if quoting gets hard.
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Every app CLI or server run uses both `DATA_DIR`-style mounts inside the task folder;
  never touch `%LOCALAPPDATA%\timesheet-dev`. No npm install in the repository.
- Never run anything against the owner's NAS or any remote host other than public
  GitHub/GHCR/Docker Hub reads. Never push an image anywhere.
- Do not stage, unstage, commit or push in the repository.
- Before returning, make sure none of your background commands or containers is still
  running (`docker ps` in the evidence).
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...'.

## Base at dispatch

- HEAD = local `main` = remote `main` = `2bce0ab5842b80c710f23496d5173c122319e5c7` (plan K).
- Uncommitted at dispatch, all under `handoff/` and not yours to change: the track
  checkpoint pair, `tasks/INGAT-T0T8-PLAN.md`, `evidence/INGAT-T0T8-PLAN/`, this brief.

## Results

Worker: timesheet-worker-high, attempt 1; self-reported model `claude-sonnet-5-5`. Evidence: `handoff/delivery/evidence/INGAT-T0T8-IMPL/`
(`COMMANDS.txt` lists each command and exit). Raw logs: `D:\.claude-tmp\timesheet\INGAT-T0T8-IMPL`.

- Base check: HEAD = local `main` = remote `main` = `2bce0ab5842b80c710f23496d5173c122319e5c7`; no drift. Digest before edits:
  `709750910cb88422b1de35c38c85eac15c3eca63ee75e1ff26e11b75d6475bbf`.
- Written: `ingat.toml`, `.github/workflows/ingat-validate.yml`, `.github/workflows/image.yml` (`cmp` against the three plan
  texts: identical, LF, no deviation); `docs/adr/0002-ingat-manifest-and-ghcr-image.md` + `.vi.md` (status "proposed"; records
  the S15 finding, the revision-only `expect_labels`, pull by tag then pin by image ID and repository digest, and that nothing
  has run on GitHub or on the target host); one paragraph in `docs/07` (+ `.vi.md`); the section 1 step 2 sentence in
  `docs/11` (+ `.vi.md`). The docs/07 paragraph adds "neither workflow has run on GitHub yet" to the plan's text (criterion 6).
- Gates: G1 exit 0; G1n exit 1 (`compose.expect_labels: must bind {commit}`); G2 PASS; G3 exit 0 (no findings);
  G4 build exit 0, inspect `linux/amd64 10001:10001 <HEAD> 0.1.0 https://github.com/CDSemi/timesheet`; G5 steps 1-3, 5-7 all
  exit 0 on the local image (synthetic data; restore produced `timesheet.db` and `private-data`; step 4 not run); G6 PASS (9
  staged files in the scratch repository, 0 findings; marker grep no match); G7 self-test PASS; G8 only the owned paths
  changed; `git diff --check` clean. Two script attempts failed first on a Windows path translation (G2, G6) and were rerun
  with `cygpath -w`; both logs are kept. G9 skipped by brief.
- Translation: `parity.mjs` (WP5-UX5-T06 script) OK on all three pairs; the only code-span differences are translated
  placeholders. `validate_package.py --preflight`: PASS.
- Not claimed: no GitHub run, no GHCR push, no package visibility, no NAS run and no S15 result exists.
- Final source digest and the snapshot SHA-256 list are the last step: `final-digest.txt` and `snapshot-sha256.txt` in the
  evidence folder (no edit after them).

Status: done
