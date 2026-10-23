# Independent recheck review: INGAT-T0T8 (findings F1-F3 on the FIX1 snapshot)

[Tiếng Việt](INGAT_T0_T8_RECHECK1.vi.md) is the translation; English is authoritative. The first review,
[INGAT_T0_T8_REVIEW.md](INGAT_T0_T8_REVIEW.md), stays as it is.

- Package/date/reviewer and observable model/effort: side track "Ingat deployability", items T0 and T8 (not on the
  board); task INGAT-T0T8-RECHECK1 attempt 1, the recheck of INGAT-T0T8-AUDIT attempt 1 (FIX REQUIRED); 2026-10-22;
  timesheet-auditor, effort xhigh (fixed by the profile); self-reported model `claude-opus-5-5`.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: base HEAD
  `2bce0ab5842b80c710f23496d5173c122319e5c7` plus nine uncommitted files whose SHA-256 are listed in
  `handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` (all OK, first and last); source digest
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 files) first and last. Outside `handoff/` the
  changed paths are exactly the nine files; Dockerfile, `compose.example.yaml`, `.dockerignore`, `package*.json` and
  `src/` have no diff against HEAD. The snapshot is uncommitted on purpose (the brief), so the identity rests on these
  hashes and the digest, not on a freeze commit as document 08 normally asks. Nothing is unpushed beyond that.
- Decision: **PASS** (F1, F2 and F3 closed; the delta is comments, doc sentences and evidence masks only; every new
  sentence is true; no new defect). The items unrun by design below stay unrun; they are not passes.
- Scope actually inspected/executed:
  - The full delta: byte copies of all nine audited files (the first audit's scratch repository, `sha256sum -c` of the
    IMPL list OK) diffed against the worktree; the four F3 originals diffed against the masked files without printing
    a removed row; every track file under `handoff/` compared with the first audit's final copy.
  - Read in full: the six changed files, `ingat-validate.yml`, the Dockerfile; the parts of `src/server/index.ts`,
    `src/server/cli.ts` (header, `seed`, `main`) and docs/11 that the new comments cite; document 08.
  - Ingat (read-only, checkout `v0.1.0-16-g35be585`; the cited Python files equal tag `v0.1.0`): MANIFEST_SPEC (task
    `mode` row), ARCHITECTURE (CPU CFS rows), `ops/validate.py`, `ops/context.py`, `ops/instance.py`,
    `policy/compose_policy.py`, `adapters/compose.py`, the DSM 7.4.1 host file.
  - The owner's private draft only as input of an automatic token scan; nothing of it is quoted here.
  - Executed, all by the auditor: identity first and last; the delta and comment-only proofs (`tomllib`); a local build
    of the snapshot with the workflow's flags, `docker image inspect` and three entrypoint probes; the workflow triggers
    and `$GITHUB_SHA`, with GitHub's documentation fetched; `ingat validate` in the CI job's exact form on the worktree
    and on a clean export, plus one negative control; actionlint pinned by digest; the repository's privacy gate on a
    scratch repository of every track file, plus name, row-shape, marker and draft-token scans; EN/VI parity, the package
    preflight, `git diff --check`, line endings.
- Evidence table (command | result/exit | evidence, all under `handoff/delivery/evidence/INGAT-T0T8-RECHECK1/`):

  | Command | Result / exit | Evidence |
  |---|---|---|
  | `identity.sh first` (HEAD, status, nine SHA-256 of the FIX1 list, digest, diff of Dockerfile/Compose/`.dockerignore`/`package*.json`/`src`) | 0; equal to the brief | `identity-first.txt` |
  | Byte copies of the audited files, `sha256sum -c` of the IMPL list; `git diff --no-index` of the nine files | 9 OK; six files changed, `ingat-validate.yml` and docs/11 EN/VI identical | `copy-old.txt`, `r2-delta.txt` |
  | `python -I cmp.py`: `tomllib` data, comment-only lines, block-scalar position, F3 masks | PASS (one false FAIL of my first row regex on a `--format` row, refined and rerun) | `r2-cmp.txt`, `r2-f3own.txt` |
  | Track files under `handoff/` against the first audit's final copy | only F3 files, the first audit's last appends, the checkpoint pair and new task files; board, STATE, NEXT_ACTION unchanged | `r2-handoff-delta.txt` |
  | `docker build --platform linux/amd64 --provenance=false --sbom=false …`; `docker image inspect`; `docker run --rm --network none --read-only …` probes | 0; `["docker-entrypoint.sh"] ["node","dist/server/index.js"] 10001:10001`; argv passes unchanged | `r3-build.txt` |
  | Trace of each new sentence to code, spec and docs lines; Ingat files against `v0.1.0` | every sentence true; cited Python unchanged since `v0.1.0` | `r3-trace.txt`, `r3-ingat-version.txt` |
  | Triggers, `$GITHUB_SHA` uses, wording grep; `curl` GitHub docs; `git log --all --grep` skip instructions | push-only image job; "Tip commit pushed to the ref" (HTTP 200); 0 skip commits | `r4-f2.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user "$(id -u):$(id -g)" --volume <worktree>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf… validate /app`; also `--user 1001:118`; clean export | 0, 0, 0 "is valid" (first export attempt failed at my `tar` call, rerun) | `r5-validate.txt`, `r5b-export.txt` |
  | Negative control: one undeclared Compose variable | 1, names the variable | `r5b-export.txt` |
  | `docker run --rm --read-only --network none … rhysd/actionlint@sha256:b1934ee5… .github/workflows/*.yml` | 0, no errors (1.7.12) | `r5-validate.txt` |
  | Precommit gate on a scratch repository (nine files plus every track file); `privacy.py`; draft-token scan | PASS, 0 blocking; 0 removed names, 0 rows, 0 real marker or draft hit | `r6-privacy-pass*.txt`, `r6-scan-pass*.txt`, `r6-draftscan-pass*.txt` |
  | Parity (WP5-UX5-T06 script) on docs/07, ADR 0002, docs/11 and this pair; `validate_package.py --preflight`; `git diff --check`; `eol.py` | all OK / PASS / 0; LF only | `r7-docs-pass*.txt`, `r7-eol.txt` |
  | `identity.sh last` (2026-10-22T23:37:04Z, after cleanup) | 0; equal to the first check; new paths only this recheck's outputs under `handoff/` | `identity-last.txt` |

- Findings (severity | file/function | reproduction | expected/actual | rule/AC | bounded fix): none new. Previous findings
  are dispositioned below.
- Risks and optional improvements, separate from proven defects:
  - O1. `ingat.toml:14` says "one image per commit". Read as the release unit (images are keyed by commit, at most one
    each) it is true; read as "every commit has an image" it would repeat F2's imprecision. The ADR Consequences now
    state the tip-only behaviour. Optional wording: "images are per commit (the tip of each push)".
  - O2. "The tip commit of each push" holds unless the push's head commit carries a GitHub skip instruction such as
    `[skip ci]`; no commit of this repository uses one (`r4-f2.txt`).
  - O3. `ingat.toml:30` "development-only seed passwords that never run in production": the seed command is what never
    runs (`cli.ts:443` refuses with `NODE_ENV=production`); wording only.
  - O4. The `cli.ts` header describes every command but states exit codes only for `restore --keep-schema` and
    `outbound`; the migrate, bootstrap and backup exits live in the code (backup also in docs/11). The comment claims no
    more than that.
  - The first review's R2-R5, R8 and R9 stand unchanged (outside the fix scope); R1, R6 and R7 are addressed and true.
  - Record error outside the snapshot: `INGAT_T0_T8_CHECKPOINT.md` and `.vi.md` say FIX1 masked "ten" rows; it masked
    nine (6+1+1+1). The coordinator owns that file.
- Required gates unrun/blocked and why (unrun by design, not passes): both workflows on GitHub Actions; the GHCR push
  with `GITHUB_TOKEN`, package creation, linking and visibility; an anonymous pull from the target host and its Engine 24
  pull; Ingat `init`, `prepare`, `deploy`, `backup` and `verify --restore-test` on a real host; Node.js on kernel 4.4
  (S15); drill memory. The first audit's local task run, registry run and Node.js `BUILDING.md` check were not repeated:
  the behaviour they cover is unchanged (`tomllib` data equal, workflow equal apart from line 1). No owner credential was
  used; nothing ran against the owner's NAS; no image was pushed.
- Disposition of previous findings:
  - F1 closed. `ingat.toml:139` now says the image keeps the Node base image's `docker-entrypoint.sh`, which runs an argv
    starting with a program unchanged: my build inspects with that Entrypoint, the script `exec`s a first word found on
    PATH unchanged (`node -e` printed its own arguments; a first word `-e` got `node` prepended), and Ingat's `run` mode
    passes argv after the service name with the entrypoint kept. `ingat.toml:29-30` names the three groups correctly:
    the image Env holds NODE_ENV, HOST, PORT, DATABASE_PATH and DATA_DIR; STATIC_DIR is read by `src/server/index.ts:17`;
    the SEED_* passwords are read only by the `seed` command (`cli.ts:449-451`), which refuses in production.
  - F2 closed. The image workflow runs on `push` to `main` and builds only `$GITHUB_SHA`, which GitHub documents as the
    tip commit pushed; the validate workflow runs on push to `main` and pull requests. The header, docs/07 EN/VI and the
    ADR Consequences EN/VI say so; no "every commit" claim is left. The new sentence (a commit pushed with later ones gets
    no image; before the first release this repository pushes after every commit) matches the workflow and docs/08
    line 72.
  - F3 closed. Each of the four files has one changed block that replaces only `docker ps` rows (6, 1, 1, 1) with one
    mask line whose count equals the rows removed; none of the removed rows was a track container; none of the removed
    names occurs in any track file, and no other unrelated listing exists in the track's evidence, briefs or reports.
  - R1 true (`ops/validate.py:66` passes CFS as present; `compose_policy.py:130-135`; ARCHITECTURE asks for `cpus` only
    as params defaulting to no limit). R6 true (`ops/instance.py:131-133`, `ops/context.py:274-275` refuse only an unset
    subnet param). R7 true (docs/11 gives the backup, restore and outbound exits; the header describes all commands).
- Software readiness, owner permission and pilot result separately: with this PASS the T0/T8 software (manifest,
  workflows, docs) is ready at this identity, for a commit of exactly these nine files. Owner permission is still needed
  for every GitHub step (Actions, workflow permissions, package visibility, which cannot be undone) and for any NAS run.
  No pilot or S15 result exists.
- One next action/prompt: the coordinator records this PASS in the checkpoint pair (correcting "ten" to "nine") and
  hands the uncommitted snapshot to the owner as the checkpoint's rules say (the requester forbids pushing; any later
  commit must hold exactly these nine files, or the identity changes and this PASS no longer applies).

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: INGAT-T0T8-RECHECK1 attempt 1, timesheet-auditor
  (`claude-opus-5-5`, self-reported); authors: the planner of INGAT-T0T8-PLAN, the worker of INGAT-T0T8-IMPL and the fix
  worker of INGAT-T0T8-FIX1 (all self-reported `claude-sonnet-5-5`); gates INGAT-T0T8-GATE and INGAT-T0T8-REGATE1
  (self-reported `claude-sonnet-5-5`). The auditor's model is not weaker than the strongest author model.
- Fresh context; confirm reviewer did not author changes: fresh context, not the first auditor's; the auditor authored
  nothing in the snapshot and wrote only this review pair, the brief's Results,
  `handoff/delivery/evidence/INGAT-T0T8-RECHECK1/` and the task folder.
- Source digest before/after; gate evidence for that snapshot:
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` before and after, nine FIX1 hashes OK before and
  after (`identity-first.txt`, `identity-last.txt`); gate evidence `handoff/delivery/evidence/INGAT-T0T8-REGATE1/`
  (Decision PASS on the same identity), with `INGAT-T0T8-GATE` for the unchanged behaviour.
- New report path preserving previous review history: `handoff/delivery/INGAT_T0_T8_RECHECK1.md` and `.vi.md`; the first
  review `INGAT_T0_T8_REVIEW.md` and `.vi.md` and its evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task: F1, F2, F3 closed; no new finding; no further fix or
  recheck task is needed for this identity.
