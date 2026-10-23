# INGAT-T0T8-RECHECK1 dispatch brief (fresh independent recheck of F1-F3 on the FIX1 snapshot)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-RECHECK1, kind
  audit (recheck), attempt 1. It depends on INGAT-T0T8-REGATE1 (PASS required; the
  coordinator fills in "Gate at dispatch"). It rechecks INGAT-T0T8-AUDIT attempt 1 (FIX
  REQUIRED, findings F1-F3). This snapshot would accept the track, so the recheck also
  confirms that nothing else changed since the audited snapshot. Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-auditor (effort xhigh, fixed by the profile);
  requested model opus; no override. Routing: size S, risk H (track-final recheck of a
  manifest that drives backup and restore, in a public repository), novelty no.
- **Author separation.** Authors of the snapshot: the planner (INGAT-T0T8-PLAN), the
  worker (INGAT-T0T8-IMPL) and the fix worker (INGAT-T0T8-FIX1), all self-reported
  claude-sonnet-5-5. You run in a fresh context and authored none of it. You are not the
  first auditor's context either; read its review as a record.
- **No source writer is active.** You fix nothing.

## Snapshot identity

- Audited snapshot: `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt`, digest
  `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd`; byte copies of its
  `ingat.toml` and `image.yml` are `handoff/delivery/evidence/INGAT-T0T8-PLAN/proposed-ingat.toml.txt`
  and `proposed-image.yml.txt` (check their hashes against the list).
- New snapshot: `handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` and the
  digest that FIX1 recorded last. Recompute first and last; a difference means NOT
  VERIFIED.

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (auditor part).
- `handoff/delivery/INGAT_T0_T8_REVIEW.md` (the findings and their bounded fixes; the
  optional R1, R6, R7 that the fix also addressed).
- `handoff/delivery/tasks/INGAT-T0T8-FIX1.md` and `INGAT-T0T8-REGATE1.md` with their
  evidence, as claims to test.
- The changed files themselves; this repository's code where a comment makes a claim
  (Dockerfile, `src/server/index.ts`, `src/server/cli.ts`, docs/11); Ingat's
  MANIFEST_SPEC and source where a sentence describes Ingat (read-only,
  `D:\Dropbox\Work.LISA\LisaHQ\Ingat`).

## Recheck (at least)

1. Identity check (above).
2. The full delta since the audited snapshot, by your own diff of the old copies (or the
   old hashes) against the new files: every changed line is a comment, a doc sentence or
   an evidence mask; `ingat.toml` data and `image.yml` behaviour are unchanged
   (`tomllib`; comment-stripped comparison); `ingat-validate.yml` and docs/11 unchanged.
3. F1, F2, F3 each closed, with the reproduction of the review rerun where possible
   (`docker image inspect` of a local build for F1; the workflow trigger and
   `$GITHUB_SHA` for F2; the evidence rows for F3). Each new sentence (the ADR
   Consequences sentence, R1, R6, R7) is true against code, spec and docs/08.
4. `ingat validate` exactly as the CI job runs it (pinned digest, read-only,
   `--network none`): exit 0; actionlint pinned by digest: exit 0.
5. Privacy over every track file under `handoff/`, including the gates' and the first
   audit's evidence (report, do not edit, anything left).
6. EN/VI alignment of the changed pairs (parity script), `validate_package.py
   --preflight`, `git diff --check`.
7. Identity check again (last).

## Outputs

- `handoff/delivery/INGAT_T0_T8_RECHECK1.md` and `.vi.md` (REVIEW template; a new path, the
  first review stays as it is).
- This brief's Results; `handoff/delivery/evidence/INGAT-T0T8-RECHECK1/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-RECHECK1`.
- Decision PASS / FIX REQUIRED / NOT VERIFIED with each finding's disposition. List the
  unrun-by-design items (GitHub runs, GHCR, package visibility, the target host, S15) as
  unrun, not as passes.

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON ON THIS MACHINE (NO `node -e`, NO `python -c`,
  NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`,
  NO PID KILLS, NO INTERACTIVE SHELLS (NO `docker run -it`).** `node -e` inside a
  container of the app image is allowed.
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Redirect output to files in the task folder and read them with Read.
- Never save a whole-machine `docker ps` listing in the evidence; filter by your own
  container names.
- Never run anything against the owner's NAS; never push an image. Do not edit the
  snapshot, stage, commit or push.
- Before returning, no container, builder or background command of yours is still
  running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the decision.

## Gate at dispatch

- INGAT-T0T8-REGATE1 attempt 1: Decision PASS (self-reported claude-sonnet-5-5, docs-delta
  form) on HEAD `2bce0ab5842b80c710f23496d5173c122319e5c7`, the nine hashes of
  `evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` and digest
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033`; identity equal first
  and last. Results in `handoff/delivery/tasks/INGAT-T0T8-REGATE1.md`. The verifier masked
  a profile path in its own evidence before its privacy rerun.
- Since that gate, only coordinator files under `handoff/` changed (this brief and the
  checkpoint pair).

## Results

(auditor appends here)

Auditor: timesheet-auditor, self-reported model `claude-opus-5-5` (fresh context; authored nothing in the snapshot;
authors self-reported `claude-sonnet-5-5`, so the audit-strength rule holds). Evidence:
`handoff/delivery/evidence/INGAT-T0T8-RECHECK1/`; scripts and raw output: `D:\.claude-tmp\timesheet\INGAT-T0T8-RECHECK1`.

1. Identity first (2026-10-22T23:16:03Z, `identity-first.txt`): HEAD `2bce0ab5842b80c710f23496d5173c122319e5c7`, the
   nine FIX1 hashes OK, digest `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 files); paths
   outside `handoff/` are exactly the nine files; no diff of Dockerfile, Compose, `.dockerignore`, `package*.json`, `src/`.
   The PLAN spares hash to the IMPL-list values of `ingat.toml` and `image.yml`. Equal to the brief.
2. Delta (`r2-delta.txt`, `r2-cmp.txt`): byte copies of all nine audited files (the first audit's scratch repository,
   `sha256sum -c` of the IMPL list OK) diffed against the worktree. Changed: `ingat.toml` lines 29-30 and 139-140 (comments),
   `image.yml` line 1 (header comment), docs/07 EN/VI line 9 (one sentence each), ADR EN/VI facts (R1, R6) and
   Consequences (F2 plus the new sentence). Unchanged: `ingat-validate.yml`, docs/11 EN/VI. `tomllib` data equal; both
   files equal with comment-only lines removed; the `image.yml` change is outside any block scalar. F3: each of the four
   files has one changed block that replaces only `docker ps` rows (6, 1, 1, 1) with one mask line whose N equals the rows
   removed; no removed row was a track container (`r2-f3own.txt`; rows never printed). My first row-shape regex missed the
   `--format` row of IMPL `ps.txt` (a false FAIL, kept in the raw output); refined and rerun: PASS.
3. F1-F3 reproductions and the new sentences (`r3-build.txt`, `r4-f2.txt`, `r3-trace.txt`).
   - F1 closed: my local build of the snapshot (`docker build --platform linux/amd64 --provenance=false --sbom=false`,
     exit 0) inspects as `["docker-entrypoint.sh"] ["node","dist/server/index.js"] 10001:10001`; the pinned base has the
     same Entrypoint; the script `exec`s an argv whose first word is a command on PATH unchanged (`node -e ...` printed its
     own args; a first word `-e` got `node` prepended). Ingat's `run` mode appends argv after the service and keeps the
     entrypoint (MANIFEST_SPEC table at line 152, `adapters/compose.py:125-127`). Image Env holds exactly NODE_ENV, HOST,
     PORT, DATABASE_PATH, DATA_DIR of the forbidden list (plus OUTBOUND_MODE, an allowed key); STATIC_DIR is read by
     `src/server/index.ts:17`; the SEED_* passwords are read only by `cli.ts` `seed` (449-451), which refuses in production
     (443).
   - F2 closed: `image.yml` triggers on `push` to `main` only and builds only `$GITHUB_SHA`; GitHub documents a push run's
     `GITHUB_SHA` as "Tip commit pushed to the ref" (fetched, HTTP 200); `ingat-validate.yml` triggers on push to `main`
     and `pull_request`. No "every commit" claim is left in the nine files; each remaining phrase reads true. The new ADR
     sentence matches docs/08 line 72 ("push after every commit").
   - F3 closed: see item 2 and item 5.
   - R1 true: `ops/validate.py:66` passes `True` for CPU CFS; `policy/compose_policy.py:130-135` refuses a non-zero `cpus`
     only without CFS; ADR context and Ingat's DSM 7.4.1 host file record no CFS; ARCHITECTURE.md line 599 asks for `cpus`
     only as params defaulting to no limit. R6 true: `ops/instance.py:131-133` and `ops/context.py:274-275` refuse only a
     subnet param left unset. R7 true: docs/11 lines 109, 138, 164, 171 and 211 give the backup, restore and outbound exits;
     the `cli.ts` header (28-61) describes every command (it states exits only for `restore --keep-schema` and `outbound`;
     the comment does not claim more).
4. `ingat validate` as the job runs it (`r5-validate.txt`, `r5b-export.txt`): pinned digest present locally (0.1.0,
   linux/amd64); worktree with `--user "$(id -u):$(id -g)"` exit 0 and with `1001:118` exit 0, "is valid"; a clean export
   (HEAD tree plus the nine files, hashes OK) exit 0. My first export attempt failed at `tar` (Git Bash read `D:` as a
   host; validate then exit 1 "compose.example.yaml does not exist"); rerun with `--force-local`: exit 0. Negative control
   (one undeclared Compose variable): exit 1 naming the variable. actionlint 1.7.12 pinned by digest on both workflows:
   exit 0.
5. Privacy, pass 1 (`r6-privacy-pass1.txt`, `r6-scan-pass1.txt`, `r6-draftscan-pass1.txt`): scratch repository of the
   nine files plus all 140 track files under `handoff/` (PLAN, IMPL, GATE, AUDIT, FIX1, REGATE1 evidence; seven briefs;
   review and checkpoint pairs), per-file `cp` and `git add`: precommit gate PASS, 149 staged, 0 blocking. Scans: the
   ten names/images of the rows FIX1 removed occur nowhere (0); no `docker ps` row of any container left; 0 private IPv4,
   0 profile paths, 0 addresses, 0 secret-like values; the 3 host/draft-marker hits are the briefs naming the private
   draft's path (no content; accepted as by the first audit) and the 7 LAN-DNS hits are search patterns and BuildKit's
   `source.local`. Host tokens extracted from the owner's private draft (IPv4, host paths, domains, address, ports): no
   real hit; every hit read is a false positive (`/api/ready`, `/api/health`, a JS method name, a UUID fragment).
   Handoff delta since the first audit's final copy (`r2-handoff-delta.txt`): only the four F3 files, the first audit's
   own last appends (before FIX1 started), the coordinator's checkpoint pair and new FIX1/REGATE1/RECHECK1 files; the
   board, STATE and NEXT_ACTION unchanged. Record error found: the checkpoint pair says "ten" masked rows; FIX1 masked
   nine (6+1+1+1).
6. Docs (`r7-docs-pass1.txt`, `r7-eol.txt`): parity (WP5-UX5-T06 script, byte copy) OK for docs/07, ADR 0002 and docs/11
   pairs; the changed EN/VI sentences read aligned; `validate_package.py --preflight` PASS (125 pairs); `git diff --check`
   exit 0; no trailing whitespace in the untracked files; all nine files LF only, final newline, no BOM. (The script's
   `grep -c $'\r'` line misreported every line as CR; superseded by the byte count of `eol.py`.)
   Pass 2 after writing every output (`r6-privacy-pass2.txt`, `r6-scan-pass2.txt`, `r6-draftscan-pass2.txt`,
   `r7-docs-pass2.txt`): 188 files staged, precommit PASS, 0 blocking; scans as in pass 1 (new hits only the LAN-DNS regex
   in `privacy.py.txt` and the words `source.local`, `/api/ready` in these Results); parity OK for this review pair and
   the first one; preflight PASS (126 pairs). `privacy.py.txt` is a redacted copy (host/draft pattern withheld, account
   segment replaced). Python-written outputs had CRLF; normalized to LF (`finish.txt`).
7. Cleanup and identity last (`finish.txt`, `identity-last.txt`, 2026-10-22T23:37:04Z): my image
   `ingat-t0t8-recheck1:local` removed; no container of mine left; no builder created; the four F3 originals and the scan
   detail files deleted from the task folder. Identity equal to the first check: HEAD 2bce0ab, nine FIX1 hashes OK,
   digest `47e8036b…a033` (875 files); new paths only this recheck's outputs under `handoff/`.

Findings: F1, F2, F3 closed; no new finding. Optional notes O1-O4 and one record error in the coordinator's checkpoint
pair ("ten" masked rows; nine is correct) are in `handoff/delivery/INGAT_T0_T8_RECHECK1.md`. Unrun by design, not
passes: both workflows on GitHub, the GHCR push and package visibility, the target host (pull, Ingat init/prepare/
deploy/backup/verify), S15 on kernel 4.4, drill memory. Nothing staged, committed or pushed; nothing ran against the NAS.

Decision: PASS

Status: done
