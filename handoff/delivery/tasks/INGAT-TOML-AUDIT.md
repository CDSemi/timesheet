# INGAT-TOML-AUDIT dispatch brief (fresh independent audit of the structure of `ingat.toml`)

- **Task.** Side track "Ingat deployability", task INGAT-TOML-AUDIT, kind audit (structural
  review), attempt 1, no task dependency: it audits the accepted, committed `ingat.toml`
  (content of `6173f07777d3a972db77208390df86a5f7de1a11`, accepted by INGAT-T0T8-REGATE1 PASS
  and INGAT-T0T8-RECHECK1 PASS). Runs in the main checkout
  `D:\Dropbox\Work.CDSemi\timesheet` (not the worktree). Not on `ORCHESTRATION.json` (track
  convention; recorded in `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the
  board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-auditor (effort xhigh, fixed by the profile); requested
  model opus; model_override_reason none. Routing: size M, risk H (the manifest names the
  backup, restore and outbound commands; the repository is public), novelty no (the two
  earlier INGAT audits give the pattern). docs/08 row "Independent audit".
- **Author separation.** `ingat.toml` was authored by INGAT-T0T8-PLAN (planner, sonnet),
  INGAT-T0T8-IMPL (worker-high, sonnet) and INGAT-T0T8-FIX1 (worker, sonnet). You run in a
  fresh context and authored nothing in it. Your model must not be weaker than Sonnet; if it
  is, stop and report.
- **No source writer is active for this file.** You fix nothing and change no tracked file
  outside your owned paths. A verifier gate of the main mission (WP5-UX5-REGATE2) may still
  be running in this checkout from an earlier session: do not stop any process, do not run
  `npm`, builds or tests, do not use network ports. Allowed: read-only git, `docker run --rm`
  of the pinned Ingat image on copies in your task folder, reading files.

## The owner's question (verbatim, translated)

"Audit the structure of `ingat.toml`: is it bloated or redundant anywhere? Is everything lean
and easy to use?"

This is a structure, redundancy and usability audit, not a repeat of the correctness audit
(INGAT-T0T8-AUDIT and -RECHECK1 already traced every element to code). Correctness matters
here only where a simplification could change behaviour.

## Snapshot identity

- Record first and last: `git rev-parse HEAD`, `git status --short` (expect uncommitted
  mission files under `handoff/`; they are not yours), `sha256sum ingat.toml`, and the
  SHA-256 of `git show HEAD:ingat.toml` written to a file in your task folder. The working
  file must equal the HEAD blob, and both must be unchanged between the first and the last
  check; otherwise NOT VERIFIED.
- Local HEAD is expected to be `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45` (local, unpushed;
  `ingat.toml` unchanged since `6173f07`). Record what you see; a different HEAD is a fact
  to report, not a blocker, as long as `ingat.toml` equals the `6173f07` blob
  (`git show 6173f07:ingat.toml`).
- Ignore `.claude/worktrees/relaxed-lalande-8359f0/ingat.toml` (an old worktree copy); note
  in one line whether it differs from HEAD.

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (auditor part).
- `ingat.toml`; `.github/workflows/ingat-validate.yml` (the exact `docker run` of
  `validate`); `compose.example.yaml`; `Dockerfile` (ENV block, USER, CMD, HEALTHCHECK);
  `src/server/cli.ts` (header and the commands the tasks name); `src/server/app.ts`
  (`/api/health`, `/api/ready`); `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and
  `docs/11_OPERATIONS_RUNBOOK.md` (the Ingat paragraphs); `docs/adr/0002-ingat-manifest-and-ghcr-image.md`.
- Ingat (read-only; `D:\Dropbox\Work.LISA\LisaHQ\Ingat`; Glob if a path moved):
  `docs/app-developers/MANIFEST_SPEC.md` in full (which keys are required, which are
  optional, their defaults, §11 generic example); `docs/design/ARCHITECTURE.md` §11.3;
  `src/ingat/model/manifest.py` (the parsed model: required keys, defaults, accepted values;
  this is the authority on "is this value the default"), `src/ingat/ops/validate.py`,
  `ops/context.py`, `ops/deploy.py`, `ops/instance.py` and whatever else reads a manifest key
  (Grep each key name) to learn which keys Ingat 0.1.0 reads at all; Ingat's example and
  fixture manifests (Grep `manifest = 1` under `docs/`, `tests/`, `examples/`) for idiom and
  size; `README.md` and `docs/guide/` on how an operator sees tasks (`ingat task`,
  `ingat resume`).
- Earlier records as claims to test, not proof: `handoff/delivery/tasks/INGAT-T0T8-PLAN.md`
  §B and §C (why each key is there), `handoff/delivery/INGAT_T0_T8_REVIEW.md` (R2-R5, R8,
  R9) and `handoff/delivery/INGAT_T0_T8_RECHECK1.md` (O1-O4). Fold a known optional item
  into your findings only when it concerns the structure or wording of `ingat.toml`, and
  mark it "known (R/O id)", not new.
- You may read the owner's private draft (`_private/consumers/consumer-manifest-drafts.md`
  §11 in the Ingat folder) only to learn the intended shape; copy none of its text or host
  values into any output.

## Audit (at least)

1. Identity check (above).
2. **Key-by-key redundancy table.** For every key and table in `ingat.toml`: required /
   optional-with-default / optional-without-default (MANIFEST_SPEC and `model/manifest.py`
   with `file:line`); whether the written value equals Ingat 0.1.0's default (then it is
   redundant unless it documents an intent); whether 0.1.0 reads the key at all (a key the
   spec marks for a later milestone, or that no code path reads, is dead weight in the M1
   form; examples to check, not conclusions: `single_active`, `min_free_memory`,
   `online_backup`, `operator = false`, `mode = "run"`, `image = "candidate"`, the empty
   lists in `[restore]`, `[drill]` and `[backup] verify`, `idempotent`, `stdout` values,
   `timeout` values). Give keep / drop / merge for each, with the risk of dropping it
   (behaviour change, a later-milestone refusal, lost documentation).
3. **Duplication inside the file.** `probes.edge-live` against `smoke.live`; `smoke.ready`
   against `probes.ready` (http versus exec on the same route); the boilerplate repeated in
   eleven `[tasks.*]` tables (`service`, `mode`, `timeout`, `stdout`, `effect`); the six
   outbound tasks for three CLI commands (two previews, three confirms, one resume); the
   long `pause` and `restore_notice` strings. For each: does MANIFEST_SPEC offer a leaner
   expression (task defaults, inheritance, `args`, a shared stanza) in 0.1.0, and does the
   leaner form keep the same behaviour (for example the preview tasks that
   `restore_notice` names, the `clears_hold` task, the `allow_tasks` of the install pause)?
4. **Usability for the operator and the maintainer.** What the owner sees on the NAS:
   task names and their number, the `pause` text and `restore_notice` (length, order of
   steps, whether each named command exists and is right), error messages a wrong
   `instance.toml` would produce for the declared `[app_env.keys]`. What a maintainer sees:
   the header and inline comments (seven header lines, long inline remarks; which repeat
   docs/11, the spec or the Dockerfile and which carry a fact found nowhere else), section
   order against MANIFEST_SPEC §2 and the §11 example, grouping, alignment, line length
   (the probe `argv` line and the two notice strings), and whether a CLI change in
   `src/server/cli.ts` has one obvious place to update.
5. **Proof by a lean variant.** Write a lean variant in your task folder (never touch
   `ingat.toml`) that applies every drop/merge you rate as safe. Run the pinned `ingat
   validate` (`ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`)
   on the original and on the variant, exactly as the CI job runs it, on copies with
   `compose.example.yaml`. Then show the parsed models are equal where it matters: prefer a
   small Python file (written with the Write tool, run inside the pinned image if Ingat's
   package is importable there, else with the workflow Python against Ingat's source tree)
   that loads both files through Ingat's own parser and prints a sorted dump of every
   resolved field, then diff the two dumps; every remaining difference must be explained as
   intended. Record line counts and byte sizes of both. If a drop cannot be proven safe,
   keep it and say why.
6. Privacy of every file you write (no host values, profile paths masked as `<user>`, no
   private draft text, no personal data).
7. Identity check again (last).

## Decision and findings

- Decision: **PASS** (lean: no proven redundancy, duplication or usability defect), **FIX
  REQUIRED** (proven items, each with a bounded fix the owner can accept or decline) or
  **NOT VERIFIED**.
- Findings as `severity | key path (line) | evidence (spec section, Ingat source file:line,
  validate or diff log) | expected / actual | bounded fix`. Keep **optional improvements**
  (taste, wording, ordering) in a separate list from proven redundancy or behaviour-neutral
  simplifications; mark known items with their R/O id.
- Open with a plain-language headline for the owner (four to eight sentences): is the file
  bloated, where is it redundant, is it lean and easy to use, what a lean variant would
  look like (lines before/after) and what is deliberately verbose for a reason.
- List what stays untested (the target host, Ingat `init`/`deploy`/`backup`/`restore` on a
  real instance, later Ingat milestones) as unrun-by-design, not as passes.

## Outputs

- `handoff/delivery/INGAT_TOML_REVIEW.md` and `.vi.md` (REVIEW template in
  `handoff/templates/`; English canonical, Vietnamese translation for the owner).
- This brief's Results; `handoff/delivery/evidence/INGAT-TOML-AUDIT/` (masked logs, the key
  table, the lean variant and the model dumps as `.txt`, validate outputs); task folder
  `D:\.claude-tmp\timesheet\INGAT-TOML-AUDIT` (raw logs, copies, scripts).

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder. The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  Node is not needed; if you run it, Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON ON THIS MACHINE (NO `node -e`, NO `python -c`,
  NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`,
  NO PID KILLS, NO INTERACTIVE SHELLS (NO `docker run -it`), NO `sed -i` ON ANY REPOSITORY
  FILE.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob and Grep for searches. Redirect command output to files in the task folder and
    read them with Read.
- Never run anything against the owner's NAS or any remote host other than public
  GitHub/GHCR/Docker Hub reads. Never build or push an image.
- Do not edit `ingat.toml` or any tracked file outside your owned paths; do not stage,
  unstage, commit or push.
- Every container you start runs with `--rm` and exits by itself. Before returning, no
  container or background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action another
  way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the decision and the
line counts of the original and the lean variant.

## Results

(auditor appends here)

### Attempt 1 (auditor, fresh context; self-reported model claude-opus-5-5)

Author separation: this auditor authored nothing in `ingat.toml` (authors: sonnet planner/workers); Opus is not
weaker than Sonnet, so the audit-strength rule holds.

**Step 1, identity (first), 2026-10-23T04:44:08Z.** HEAD `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45` (as expected).
`git status --short`: only mission files under `handoff/` (9 modified, 2 untracked, none mine except this brief).
`sha256(ingat.toml)` = `7bf274a8c8da29c75c806e46bfa62489b4821d59fee08a5d81c70cced74a1104` = HEAD blob = `6173f07`
blob (written to the task folder and hashed). `git log -- ingat.toml`: only `6173f07`. The old worktree copy
`.claude/worktrees/relaxed-lalande-8359f0/ingat.toml` has the same hash (does not differ). Ingat source checkout:
HEAD `35be585`; `git diff v0.1.0..HEAD -- src/` touches only `model/words.py` and a host certification JSON, so
`model/manifest.py` and every planner equal v0.1.0. Pinned image present locally (ID = pinned digest, entrypoint
`python3 -I -m ingat`, Docker 28.5.1). Raw log: task folder `identity-first.txt`, `ingat-version-diff.txt`,
`image-inspect.txt`.

**Steps 2-3, reading and key table (done; `key-table.txt`).** Read MANIFEST_SPEC in full, `model/manifest.py`, `model/toml_read.py`,
`model/instance.py`, `ops/validate.py`, `ops/deploy.py`, `ops/lifecycle.py`, `ops/backup.py`, `ops/steps_build.py`,
`ops/context.py` (`supported`), `core/probes.py`, `core/tasks.py`, `adapters/override.py`, and greps of every key
name (done). Baseline run: pinned `ingat validate` on a copy (HEAD blobs of `ingat.toml` and `compose.example.yaml`, hashes
equal to HEAD) with the CI job's exact flags: exit 0, "the app's settings file (ingat.toml) is valid"
(`validate-orig.txt`). Model dump through Ingat's own parser inside the pinned image (`scripts/dump_model.py`, run
with `--entrypoint python3 -I`): ingat 0.1.0, parser in site-packages, 556 resolved fields (`dumps/orig.txt`).
Interim facts: schema 1 has no task defaults or inheritance (`service`, `mode`, `effect`, `timeout` are `req=True`,
`model/manifest.py:250-269`; unknown keys refused, `toml_read.py:137`); the parser defaults that equal written values
are only the five empty lists of `[restore]`/`[drill]` and `[backup] verify = []`; keys 0.1.0 never reads outside
parse/validate: `single_active`, `after_restore`, `restore_notice`, `[restore] activate`, `[rollback] env`,
`local_only` (the last is not marked Planned in the spec).

**Steps 4-5, usability probes and lean variants (done).** Script `scripts/run-all.sh` (written with Write, run with
`bash`), exit 0; outputs in the task folder `results/`. Every container `--rm`, `--network none`, read-only.
- `orig` (HEAD blob copy): validate exit 0. `lean` (5 empty lists of `[restore]`/`[drill]` and `[backup] verify = []`
  dropped; header 7 -> 4 lines; CI fact stated once; comments over 120 columns shortened): validate exit 0; model body
  identical to `orig` (diff exit 0, body SHA-256 `e831cb73...` for both, 556 fields). `lean-wrapped` (lean plus the
  probe `argv`, `pause` and `restore_notice` as TOML multi-line strings with line-ending backslashes): validate exit 0;
  model identical (same body hash). `optional` (lean-wrapped minus `[[smoke]] live`, plus operator wording in `pause`
  and `restore_notice` and a format comment for two keys): validate exit 0; model differs only in those three
  intended places (537 fields).
- Sizes: orig 257 lines / 11,261 bytes / max line 319 / 14 lines over 120; lean 249 / 10,938 / 319 / 3;
  lean-wrapped 258 / 10,986 / 119 / 0; optional 258 / 11,285 / 119 / 0.
- `probe-required` (a `[task_defaults]` table plus one task without `service`/`mode`/`effect`/`timeout`): exit 1 with
  `... is required` for all four and `task_defaults: unknown key`, so schema 1 has no task-default mechanism.
- Synthetic `instance-bad.toml` (example.invalid only) against the original: exit 1 with one line per key; pattern
  keys report only "does not match the manifest's pattern" (no hint of the format); `instance-good.toml`: exit 0.
- The 13 cited Ingat Python files have the same SHA-256 inside the pinned image and in the local checkout. Source
  digest (first) `59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad` (875 files, Node v24.21.0).

**Evidence written (done).** `handoff/delivery/evidence/INGAT-TOML-AUDIT/`: `key-table.txt`, `commands.txt`,
`identity.txt`, `results-summary.txt`, `model-dump-orig.txt`, `model-diff-optional.txt`, `lean-ingat.toml.txt`,
`lean-wrapped-ingat.toml.txt`, `optional-ingat.toml.txt`, `run-all.sh.txt`, `dump_model.py.txt`,
`instance-good.toml.txt`, `instance-bad.toml.txt`; each copy written with Write and checked byte-equal (`cmp` exit 0)
to its task-folder original.

**Decision: FIX REQUIRED (two Low findings, both behaviour-neutral; owner may accept or decline).** Review pair:
`handoff/delivery/INGAT_TOML_REVIEW.md` and `.vi.md`.
- Headline: the file is not bloated. It is the M1 form of MANIFEST_SPEC §11 in the same section order and the size of
  Ingat's own fx-lite fixture (257 vs 255 lines); the per-task boilerplate is required by schema 1. Lean variant: 249
  lines / 10,938 bytes (original 257 / 11,261), identical parsed model, validate exit 0.
- F1 Low: six empty lists equal the parser default (`ingat.toml:108, 111, 113, 114, 121, 122`;
  `model/manifest.py:215, 222, 224, 225, 231, 232`), five without a stated reason. Fix: drop them, keep the two
  reasons as header remarks.
- F2 Low: the header (lines 1-7) restates ADR 0002 and the CI/pull fact appears three times (lines 5-6, 17, 18); the
  parenthetical explains non-empty deploy lists, not the omission of empty ones. Fix: four-line header, one remark per
  `[compose]` key.
- Optional (O-A to O-J): wrap the three long values (model identical, widest line 119); `pause` should name
  `bootstrap-new-token` and the 60-minute token life; `restore_notice` the `--arg job=<id>` syntax (shown only from M2);
  format remarks for `APP_ORIGINS`/`PUBLIC_BASE_URL` (Ingat reports only "does not match the manifest's pattern");
  `[[smoke]] live` is behaviour-neutral to drop but kept for diagnosis and §11 parity; default-equal exit `0 = "ok"`,
  `operator = false`, `image`, `mode = "0700"` kept as explicit contract; later-milestone keys kept; `local_only` is not
  enforced by Ingat 0.1.0 (Ingat-side gap); no test binds task argv to `cli.ts`; outbound tasks are minimal.
  Known items O1, O3, O4 (RECHECK1) and R8 (first review) unchanged.

**Step 6, privacy (done).** Grep of the evidence for profile paths, account names, e-mail domains, IP addresses other
than the manifest's own loopback, NAS names and password values: none. The repository's own gate
`scripts/precommit-check.mjs` (Node v24.21.0) on a scratch git repository in the task folder holding copies of all 16
files this audit wrote under `handoff/`: "PASS: 16 staged file(s), 0 blocking finding(s), 0 warning(s)", self-test
PASS, `git diff --cached --check` exit 0 (`privacy-scan-1.txt`; the project repository was not staged). All files are
LF (`od -c`; an earlier `grep -c $'\r'` count was a false positive of MSYS grep).

**Step 7, identity (last), 2026-10-23T05:11:55Z.** HEAD `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`; `ingat.toml` and
the HEAD blob `7bf274a8...` (unchanged); `git diff --stat HEAD` of `ingat.toml`, `compose.example.yaml`, Dockerfile,
`src/`, `.github/` empty; source digest `59516a2d...` (unchanged, 875 files); status shows only the first check's
mission entries plus this audit's new paths; no container from the pinned Ingat image is running
(`identity-last.txt`, `identity.txt`). Privacy gate rerun on the final files (`privacy-scan-2.txt`): PASS, 16 files,
0 blocking, 0 warnings; only this closing paragraph was added afterwards.

Next action: the coordinator shows the owner F1 and F2 (lean variant, model-identical, `ingat.toml` only) and the
optional items; on acceptance, one bounded worker fix on `ingat.toml`, a gate (pinned validate plus model dump; body
SHA-256 `e831cb73169f2c09fefbb2f7e02470ea5fd2c997cd62ab3034eb344a37776356` unless optional model changes are chosen)
and a fresh recheck. No file outside the owned paths was changed; nothing was staged, committed or pushed.

Status: done
