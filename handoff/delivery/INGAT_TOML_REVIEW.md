# Independent review: structure of `ingat.toml` (INGAT-TOML-AUDIT)

[Tiếng Việt](INGAT_TOML_REVIEW.vi.md) is the translation; English is authoritative. The correctness reviews of the same
file, [INGAT_T0_T8_REVIEW.md](INGAT_T0_T8_REVIEW.md) and [INGAT_T0_T8_RECHECK1.md](INGAT_T0_T8_RECHECK1.md), stay as
they are.

**Headline for the owner.** `ingat.toml` is not bloated: it is the Ingat 0.1.x (M1) form of the SQLite pattern in
Ingat's MANIFEST_SPEC §11, with the same sections in the same order, and at 257 lines it is the size of Ingat's own
fixture for that pattern (255 lines). Almost every key is required by Ingat 0.1.0's parser, differs from its default
and is read by 0.1.0, or is a declared fact a later Ingat milestone reads; the repeated `service`/`mode`/`effect`/
`timeout` lines in the eleven tasks cannot be shortened, because schema 1 has no task defaults (proven: a
`[task_defaults]` table is refused as an unknown key). The real redundancy is small: six lines are empty lists that
equal Ingat's default, and the seven-line header repeats ADR 0002 and states the CI image fact a third time. A lean
variant without them has 249 lines instead of 257, passes the pinned `ingat validate`, and resolves to exactly the
same model (all 556 parsed fields equal). What is long on purpose: the outbound tasks (six tasks for three commands,
because a preview, a confirm and the hold-clearing step need different settings), the explicit exit maps and the
comments that carry facts found nowhere else. Usability for the operator is good; three lines of 197-319 characters
and two operator texts that omit a useful hint are optional polish, shown in validated variants.

- Package/date/reviewer and observable model/effort: side track "Ingat deployability" (not on the board); task
  INGAT-TOML-AUDIT attempt 1 (structural audit of the accepted manifest); 2026-10-23; timesheet-auditor, effort xhigh
  (fixed by the profile); self-reported model `claude-opus-5-5`.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: HEAD
  `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45` (local, as the brief expects); `ingat.toml` SHA-256
  `7bf274a8c8da29c75c806e46bfa62489b4821d59fee08a5d81c70cced74a1104`, equal to the HEAD blob and to the `6173f07`
  blob, first and last; source digest `59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad` (875 files,
  `handoff/` excluded) first and last. The working tree differs from HEAD only in mission files under `handoff/`. The
  old worktree copy `.claude/worktrees/relaxed-lalande-8359f0/ingat.toml` has the same hash.
- Decision: **FIX REQUIRED** (two Low findings, both behaviour-neutral: the resolved model stays identical; each fix is
  bounded and the owner may accept or decline it). Nothing here is a correctness or safety defect.
- Scope actually inspected/executed:
  - Read: `ingat.toml`, `.github/workflows/ingat-validate.yml`, `compose.example.yaml`, the Dockerfile, the
    `src/server/cli.ts` header, `/api/health` and `/api/ready` in `src/server/app.ts`, the Ingat paragraphs of docs/07
    and docs/11, ADR 0002, the earlier records named in the brief (claims only).
  - Ingat 0.1.0 (read-only): MANIFEST_SPEC in full; `model/manifest.py`, `model/toml_read.py`, `model/instance.py`,
    `ops/validate.py`, `ops/deploy.py`, `ops/lifecycle.py`, `ops/backup.py`, `ops/steps_build.py`, `ops/context.py`,
    `ops/status.py`, `core/probes.py`, `core/tasks.py`, `adapters/override.py`, the guide's command list, the
    fixture `fixtures/fx-lite/ingat.toml`; a grep of every manifest key over `src/`. The 13 cited files have the same
    SHA-256 inside the pinned image and in the checkout (`v0.1.0-16-g35be585`).
  - Executed: the pinned `ingat validate` in the CI job's exact form on copies of the original and of three variants,
    a negative probe, two synthetic instance files; a dump of every resolved field through Ingat's own parser inside
    the pinned image, and diffs of the dumps. The owner's private draft was not opened.
- Evidence table (command | result/exit | evidence, all under `handoff/delivery/evidence/INGAT-TOML-AUDIT/`):

  | Command | Result / exit | Evidence |
  |---|---|---|
  | `git rev-parse HEAD`, `git status --short`, `sha256sum` of the file, the HEAD and `6173f07` blobs and the worktree copy | 0; all `7bf274a8...` | `identity.txt` |
  | `node scripts/source-digest.mjs` (Node v24.21.0), first and last | 0; `59516a2d...` both times | `identity.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user "$(id -u):$(id -g)" --volume <copy>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf... validate /app` on `orig`, `lean`, `lean-wrapped`, `optional` | 0, 0, 0, 0 ("is valid") | `results-summary.txt` |
  | The same on `probe-required` (a `[task_defaults]` table; one task without `service`, `mode`, `effect`, `timeout`) | 1: four "is required", "task_defaults: unknown key" | `results-summary.txt`, `commands.txt` |
  | The same with `--instance` and a synthetic good / bad instance file | 0 / 1 (nine messages, one per key) | `results-summary.txt`, `instance-*.toml.txt` |
  | `docker run ... --entrypoint python3 <image> -I /scripts/dump_model.py /app/ingat.toml` for each variant; `diff` of the bodies | 0 each; `lean` and `lean-wrapped` identical to `orig` (body `e831cb73...`, 556 fields); `optional` differs only where intended | `model-dump-orig.txt`, `model-diff-optional.txt`, `dump_model.py.txt` |
  | Sizes (`wc`, `awk`) | orig 257 lines / 11,261 bytes / 14 lines over 120 columns (max 319); lean 249 / 10,938 / 3; lean-wrapped 258 / 10,986 / 0 (max 119); optional 258 / 11,285 / 0 | `results-summary.txt` |
  | `sha256sum` of 13 Ingat files inside the image (`--entrypoint sha256sum`) and in the checkout | 0; all equal | `identity.txt` |
  | `cmp` of every evidence copy against its task-folder original | 0 for all ten copies | `commands.txt` |

- Findings (severity | key path (line) | evidence | expected / actual | bounded fix):
  - **F1 Low | `[backup] verify = []` (108), `[restore] start = []` (111), `post = []` (113), `checks = []` (114),
    `[drill] checks = []` (121), `record = []` (122)** | each equals the parser default, an empty list
    (`model/manifest.py:215, 222, 224, 225, 231, 232`; `toml_read.py:57-62`); 0.1.0 iterates an empty list either
    way (`ops/steps_build.py:83`, `ops/backup.py:160-162, 173`); without them `ingat validate` exits 0 and the parsed
    model is identical (`results-summary.txt`) | expected: a key at its default is left out unless the file says why
    it is there, as the header itself does for the empty `[deploy]` lists; actual: six default lines, five without a
    stated reason (the reason, that the restore command checks hashes, integrity and schema itself, is only in the plan
    record) | fix: delete the six lines, move the `verify` remark to the `[backup]` header line and state the
    `[restore]` reason there (lean variant lines 108-114). Declining keeps parity with Ingat's fx-lite fixture, which
    writes these lists.
  - **F2 Low | header (1-7) and `[compose]` remarks (17-18)** | lines 3-6 restate ADR 0002 ("Facts for the owner": the
    M1 omissions; "Decision": CI build, pull by tag, revision label); the CI/pull fact appears three times (lines 5-6,
    17, 18); the parenthetical of lines 4-5 explains why *non-empty* deploy lists are refused, which does not explain
    why the *empty* ones are left out | expected: one statement per fact, next to the key it concerns; actual: three |
    fix: a four-line header that points to ADR 0002 and says that keys at their Ingat default are omitted, and one remark
    per `[compose]` key (lean variant lines 1-16).
- Risks and optional improvements, separate from proven defects:
  - O-A Line length. `pause` (99, 317 characters), `restore_notice` (136, 319) and the readiness `argv` (69, 197) are
    far wider than the rest of the file. TOML multi-line strings with a backslash at each line end give the identical
    value (`lean-wrapped`: model identical, widest line 119). Trade-off: whoever edits a wrapped line must keep the
    space before the backslash, or two words join.
  - O-B The `pause` text never mentions `bootstrap-new-token`, which the pause allows, nor the token's 60-minute life
    (`src/server/cli.ts:35-39`); the plan summary lists only the allowed task names (`cli/render.py:29`). Variant
    `optional` adds one sentence.
  - O-C `restore_notice` names the confirm tasks without their `--arg job=<id>` and ends with a bare `outbound-resume`.
    Ingat 0.1.0 never shows it (no live restore yet), so this matters from M2. Variant `optional` shows the syntax.
  - O-D A wrong value of a pattern key reports only "does not match the manifest's pattern" (`model/instance.py:231-232`;
    reproduced for `APP_ORIGINS`, `PUBLIC_BASE_URL`, `SESSION_TTL_HOURS`). A one-line format remark for `APP_ORIGINS`
    and `PUBLIC_BASE_URL` helps the operator (variant `optional`).
  - O-E `[[smoke]] live` (84-87) repeats `[probes.edge-live]` (same request, same expectation) and is covered by
    `[[smoke]] ready`, whose `/api/ready` also reads the database (`app.ts:57-64, 121-128`). In 0.1.0 every plan that
    runs the smoke checks has just passed `edge-live` (`core/probes.py:136-143`, `ops/deploy.py:432-437`,
    `ops/lifecycle.py:130-138`). Dropping it is behaviour-neutral (variant `optional`, validate exit 0) but loses the
    "live but not ready" diagnosis and parity with §11. Keep unless fewer lines matter more.
  - O-F Kept on purpose although 0.1.0 would behave the same without them: `0 = "ok"` in ten exit maps (an undeclared 0
    is already ok, `core/tasks.py:32-36`); `operator = false` and `image = "candidate"`/`"bundle"` on migrate, backup
    and restore (`ops/lifecycle.py:191` refuses them anyway; MANIFEST_SPEC §4 asks for `operator = false`);
    `mode = "0700"` (the planners fall back to 0700, `ops/deploy.py:270`, but the spec documents no default);
    `data_dir_writable = true` next to `status = "ready"` (implied by `app.ts:124`). They state the contract.
  - O-G Declared for later milestones, not read by 0.1.0 at run time: `single_active` (Planned M4), `after_restore`,
    `restore_notice`, `[restore] activate`, `[rollback] env`. Keep: they are validated now and needed then.
  - O-H `local_only = true` is read by no 0.1.0 code path, and MANIFEST_SPEC §2.4 does not mark it Planned, so 0.1.0
    does not refuse a non-local data directory. Not a manifest defect; worth an Ingat issue. Until then the local-disk
    rule of docs/11 and `compose.example.yaml` is the only guard.
  - O-I A CLI change has one obvious place (the tasks banner points to `src/server/cli.ts`), but the
    `node dist/server/cli.js` prefix repeats eleven times and cannot be factored in schema 1 (no argv variables; every
    param must be a Compose variable, `ops/validate.py:55`). Nothing tests that each task's argv is accepted by
    `cli.ts`; `ingat validate` checks structure only. Optional: a small unit test.
  - O-J The outbound tasks are minimal: two previews (different commands; `idempotent`, `expect`, exit 2 = ok), three
    confirms, one hold-clearing resume; `--all` and `--job <id>` cannot share one argv template because `args` fill
    values, they do not add or remove elements. Merging release-job and drop-job through an action argument is possible
    but would hide a destructive action behind a generic name: not recommended. `[[smoke]] ready` and
    `[probes.ready]` are not duplicates: the exec probe feeds `[schema]` and is the only readiness check in isolated
    drills, where http probes do not run (`core/probes.py:113-115`).
  - Known items, not new: O1 (`ingat.toml:14` wording), O3 (line 30 wording) and O4 (line 140 against the `cli.ts`
    header; the lean banner says "describes every command") from RECHECK1; R8 (`min_free_memory` unmeasured) from the
    first review.
- Required gates unrun/blocked and why (unrun by design, not passes): the target host; Ingat `init`, `prepare`,
  `deploy`, `backup`, `verify --restore-test`, task runs and the install pause on a real instance; later milestones
  (live restore and rollback from M2, `single_active` from M4). For the lean variants, identity of the parsed model
  stands in for run-time equality: Ingat plans from the parsed model, and only the recorded manifest hash differs. The
  `optional` variant's run-time effect (one smoke check fewer) is traced in code, not run.
- Disposition of previous findings: none for this file's structure; the earlier F1-F3 stay closed (RECHECK1), and the
  known items above are unchanged.
- Software readiness, owner permission and pilot result separately: the accepted manifest stays correct and usable as
  it is; F1 and F2 are small tidy-ups that do not block software readiness of the track. Owner permission is still
  needed for every GitHub and NAS step. No pilot result exists.
- One next action/prompt: the coordinator shows the owner F1 and F2 (the lean variant, a model-identical change of
  `ingat.toml` only) and O-A to O-D; if the owner accepts, one bounded worker task applies the chosen items to
  `ingat.toml`, then a gate re-runs the pinned `ingat validate` and the model dump (body SHA-256 must stay
  `e831cb73169f2c09fefbb2f7e02470ea5fd2c997cd62ab3034eb344a37776356` unless O-B to O-E are chosen), followed by a fresh
  recheck.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: INGAT-TOML-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, self-reported); authors of `ingat.toml`: INGAT-T0T8-PLAN (planner), INGAT-T0T8-IMPL
  (worker-high) and INGAT-T0T8-FIX1 (worker), all Sonnet per the brief. The auditor's model is not weaker than the
  strongest author model.
- Fresh context; confirm reviewer did not author changes: fresh context; the auditor authored nothing in `ingat.toml`
  and wrote only this review pair, the brief's Results, `handoff/delivery/evidence/INGAT-TOML-AUDIT/` and the task
  folder.
- Source digest before/after; gate evidence for that snapshot: `59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad`
  and `ingat.toml` `7bf274a8...` before and after (`identity.txt`); the accepted gate of this content is
  INGAT-T0T8-REGATE1 with INGAT-T0T8-RECHECK1 PASS.
- New report path preserving previous review history: `handoff/delivery/INGAT_TOML_REVIEW.md` and `.vi.md`; the
  INGAT_T0_T8 review, recheck and their evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task: F1 and F2 open (Low, owner's choice); optional items
  O-A to O-J for the owner; on acceptance, one fix task on `ingat.toml`, a gate and a fresh recheck.
