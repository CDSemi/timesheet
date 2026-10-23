# INGAT-T0T8-REGATE1 dispatch brief (verifier gate on the FIX1 snapshot, docs-delta form)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-REGATE1, kind gate,
  attempt 1. It depends on INGAT-T0T8-FIX1 (done). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium, fixed by the profile);
  requested model sonnet; no override. Routing: size S, risk L, novelty no. docs/08 row
  "Gates, digests, evidence". Write the task record in English.
- **Form.** FIX1 changes only comments, doc wording and evidence masking. This is the
  reduced "docs-delta" gate: scope of the delta, comment-only proof, the checks the
  changed files affect, and identity. The full gate INGAT-T0T8-GATE (PASS) stays the
  evidence for the unchanged behaviour. No source writer is active.

## Snapshot identity

- Audited snapshot (before FIX1): `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt`,
  digest `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd`.
- New snapshot: `handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` and the
  digest the FIX1 Results record last:
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033`.
- First and last command: recompute the new list's hashes, the digest and
  `git status --short`; compare. Any difference, or a changed path outside `handoff/`
  that is not in the new list, is a FAIL.

## Gate (run each; record command | exit | result)

1. Identity check (above).
2. Delta scope: compare the two snapshot lists. Only `ingat.toml`, `.github/workflows/image.yml`,
   docs/07 EN/VI and ADR 0002 EN/VI may differ; `.github/workflows/ingat-validate.yml`,
   docs/11 EN/VI must keep their audited hashes; Dockerfile, `.dockerignore`,
   `compose.example.yaml`, `package.json` unchanged at HEAD.
3. Comment-only proof, done by you: the audited copies of `ingat.toml` and `image.yml` are
   byte-identical to `handoff/delivery/evidence/INGAT-T0T8-PLAN/proposed-ingat.toml.txt`
   and `proposed-image.yml.txt` (confirm with the audited hashes first). Write your own
   script file (workflow Python `-I`): `tomllib` data of old and new `ingat.toml` equal;
   old and new `image.yml` equal once comment-only lines and trailing `#` comments are
   removed. Print the textual diff of the comment lines into the evidence.
4. `ingat validate` exactly as the CI job runs it, pinned
   `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`,
   read-only, `--network none`: exit 0. Save the full command and output verbatim.
5. actionlint pinned by digest (as in INGAT-T0T8-GATE) on both workflows: exit 0. The
   SHA-pin check script of the plan on `.github/workflows`: PASS.
6. Findings closed in the text: F1 (the entrypoint and the `STATIC_DIR` comment now match
   `docker image inspect` and `src/server/index.ts:17`), F2 (no "every commit" claim left
   in the changed files; `Grep` the nine files for "every commit" and "every push" and
   read each hit), F3 (the four evidence files hold no unrelated container row; `Grep`
   every `handoff/delivery/evidence/INGAT-T0T8-*` folder for `docker ps` header lines and
   read the rows under them; report any unrelated row, including in AUDIT evidence).
7. Parity (the WP5-UX5-T06 script) on the docs/07 and ADR 0002 pairs;
   `validate_package.py --preflight` with the workflow Python; `git diff --check`.
8. Privacy: the precommit gate on a scratch repository in the task folder holding the nine
   snapshot files and every track file under `handoff/` (per-file `cp`, per-file
   `git add`).
9. Identity check again (last).

Decision: PASS only if every item passed and the identity is unchanged.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-T0T8-REGATE1/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-REGATE1`. Nothing else.

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
- Never save a whole-machine `docker ps` listing in the evidence; filter by your own
  container names.
- Never run anything against the owner's NAS; never push an image. Do not stage, commit or
  push in the repository.
- Before returning, no container or background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step. Record one line
  `Decision: PASS | FAIL | NOT VERIFIED`, then "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...', with the Decision.

## Results

Evidence: `handoff/delivery/evidence/INGAT-T0T8-REGATE1/`. Scripts: `D:\.claude-tmp\timesheet\INGAT-T0T8-REGATE1`.

1. Identity first and last (`identity-first.txt`, `identity-last.txt`): HEAD 2bce0ab, nine FIX1 hashes OK, digest
   `47e8036b...a033` (875 files) both times; no changed path outside `handoff/` beyond the nine files. PASS.
2. Delta scope: only image.yml, ingat.toml, docs/07 EN/VI, ADR EN/VI differ from the IMPL list; ingat-validate.yml and
   docs/11 EN/VI keep their audited hashes; Dockerfile, .dockerignore, compose.example.yaml, package.json not in git
   status. PASS.
3. Comment-only proof (`g3-comment-only.txt`, exit 0): audited copies equal the IMPL hashes; non-comment content
   equal; tomllib data equal; diff shows comment lines only. PASS.
4. `ingat validate` as CI runs it, pinned digest, read-only, no network: exit 0 (`g4-validate.txt`, command verbatim). PASS.
5. actionlint 1.7.12 by digest on both workflows exit 0; SHA-pin check PASS (`g5-actionlint-sha.txt`). PASS.
6. F1 closed (ingat.toml lines 29 and 139 match Dockerfile CMD-only and `index.ts:17` STATIC_DIR; docker-entrypoint.sh from
   FIX1 inspect). F2: remaining "every push/commit" hits are accurate (validate every push/PR; ADR push-after-every-commit
   sentence). F3: only three header lines remain, each followed by masked count lines or own rows; ps.txt is one mask
   line; no AUDIT hit (`g6-text.txt`). PASS.
7. Parity both pairs OK; preflight PASS (`g7-docs-rerun.txt`; first preflight run used a wrong working directory of mine,
   rerun from repo root); `git diff --check` exit 0. PASS.
8. Privacy gate on scratch repo with nine files and 139 track files: PASS, 148 staged, 0 blocking (`g8-privacy.txt`);
   a first run blocked on a profile path in my own evidence, which I masked and then reran. PASS.

Decision: PASS

Status: done
