# Independent review: INGAT-T0T8 (Ingat manifest and GHCR image, side track T0 and T8)

[Tiếng Việt](INGAT_T0_T8_REVIEW.vi.md) is the translation; English is authoritative.

- Package/date/reviewer and observable model/effort: side track "Ingat deployability", items T0 and T8 (not on the
  board); task INGAT-T0T8-AUDIT attempt 1; 2026-10-22; timesheet-auditor, effort xhigh (fixed by the profile);
  self-reported model `claude-opus-5-5`.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: base HEAD
  `2bce0ab5842b80c710f23496d5173c122319e5c7` plus nine uncommitted files whose SHA-256 are listed in
  `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt` (all OK, first and last); source digest
  `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` (875 files) first and last. No other path outside
  `handoff/` changed; Dockerfile, `compose.example.yaml` and `.dockerignore` have no diff against HEAD. The snapshot is
  uncommitted on purpose (the brief; the requester forbids pushing), so the identity rests on these hashes and the
  digest, not on a freeze commit as document 08 normally asks. Nothing is unpushed beyond that.
- Decision: **FIX REQUIRED** (three low-severity findings with bounded fixes; no behaviour defect found in the manifest
  or the workflows).
- Scope actually inspected/executed:
  - Read in full: the nine snapshot files; Dockerfile, `.dockerignore`, `compose.example.yaml`, `package.json`,
    `.env.example`; `src/server/config.ts`, `index.ts`, `cli.ts`, `app.ts` (health and readiness),
    `http/security.ts`, `http/clientAddress.ts`, `ops/backup.ts` and `ops/restore.ts` (the parts the tasks use).
  - Ingat (read-only): MANIFEST_SPEC §1-§7 and §11-§12; ARCHITECTURE §9.4, §9.5, §11.1-§11.4; ADR-0026; ROADMAP S15;
    the operator guide on `validate`; both Ingat workflows; and in `src/ingat` the files `model/manifest.py`,
    `model/templates.py`, `model/instance.py`, `ops/validate.py`, `ops/context.py`, `ops/deploy.py`, `ops/instance.py`,
    `ops/backup.py`, `ops/steps_build.py`, `core/steps.py` (obtain), `core/executor.py` (step types),
    `adapters/override.py` and `policy/compose_policy.py`. Their source at the Ingat checkout equals tag `v0.1.0`
    except one docstring.
  - The owner's private draft §11-§12, read only to judge the corrections; nothing of it is quoted here.
  - Executed, all by the auditor: `ingat validate` in the CI job's exact form plus three refusal probes, two limit
    probes and two synthetic instance files; every manifest task argv, the readiness probe argv and the live and ready
    routes against a local build of the snapshot with the Compose hardening; action pins via `git ls-remote`, the
    actions' runtimes, actionlint pinned by digest; the image workflow's own `run:` block twice against a throw-away
    local registry; a local `linux/amd64` build with the workflow's flags; Node.js `BUILDING.md` for v24.21.0 and v24.x;
    the repository's privacy gate on a scratch repository of every track file; EN/VI parity, the package preflight,
    the privacy self-test and `git diff --check`.
- Evidence table (command | result/exit | evidence, all under `handoff/delivery/evidence/INGAT-T0T8-AUDIT/`):

  | Command | Result / exit | Evidence |
  |---|---|---|
  | `identity.sh first` (HEAD, status, nine SHA-256, source digest, diff of Dockerfile/Compose/.dockerignore) | 0; equal to the brief | `identity-first.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user 1001:118 -v <worktree>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf… validate /app` | 0, "is valid" | `a2-validate.txt` |
  | Refusal probes on copies: forbidden key declared; port on 0.0.0.0; undeclared template param | 1, 1, 1 with the expected key paths | `a2-validate.txt` |
  | Limit probes: `cpus: "0.5"`; `log_snapshot` | 0, 0 (validate accepts what 0.1.0 refuses on the host) | `a2-validate.txt` |
  | Synthetic instance files: good; bad (ten errors) | 0; 1 | `a2-validate.txt` |
  | Task contract: 11 tasks, `ready` probe argv, `/api/health`, `/api/ready`, restore then start with the holds | every exit and JSON path as the manifest maps it | `a3-tasks.txt` |
  | Trace of every manifest element to `file:line` | see the table | `a3-trace.txt` |
  | `git ls-remote` of the three action tags; `action.yml` at the pinned SHAs | pins equal; newest of each line; all `node24`; no deprecation message | `a4-workflows.txt` |
  | actionlint 1.7.12 by digest (shellcheck 0.11.0 inside) on both workflows | 0, no errors | `a4-workflows.txt` |
  | The workflow's `run:` block against `registry:3` on loopback, run twice | 0 ("not found" branch: build, push, digest, label check); 0 ("already published", same digest, no build); tag = one OCI image manifest | `a4-workflows.txt` |
  | `docker buildx build --platform linux/amd64 --provenance=false --sbom=false --label … --load .` with the pinned BuildKit | 0; `linux/amd64 10001:10001 <HEAD> 0.1.0`, source label; Entrypoint `["docker-entrypoint.sh"]` | `a5-build.txt` |
  | `curl` Node.js `BUILDING.md` v24.21.0 and v24.x | 200; x64 glibc Tier 1 from kernel 4.18, "Older kernel versions may work" | `a6-s15.txt` |
  | Privacy gate on a scratch repository (nine files plus every track file under `handoff/`), marker greps | PASS, 0 blocking; marker hits read (F3) | `a7-privacy.txt` |
  | Parity on three pairs and docs/07 at HEAD; `validate_package.py --preflight`; `precommit-check --self-test`; `git diff --check` | all 0 / PASS | `a8-docs.txt` |
  | `identity.sh last` (2026-10-22T23:05:46Z) | 0; equal to the first check; new paths only the auditor's outputs under `handoff/` | `identity-last.txt` |

- Findings (severity | file/function | reproduction | expected/actual | rule/AC | bounded fix):
  - **F1 | Low | `ingat.toml:138` and `ingat.toml:29` (comments).** Reproduction: `docker image inspect` of the image
    built from the snapshot prints `Entrypoint=["docker-entrypoint.sh"]` (`a5-build.txt`); the Dockerfile sets no
    ENTRYPOINT, so the runtime stage inherits the Node base image's. `STATIC_DIR` is read by the production server
    (`src/server/index.ts:17`). Expected: the comments describe the image. Actual: line 138 says "The image has no
    ENTRYPOINT"; line 29 says every forbidden key is fixed by the image ENV block or read only by development commands,
    which `STATIC_DIR` is not. Behaviour is unaffected: the entrypoint script runs an argv that starts with a command
    unchanged (every task ran, `a3-tasks.txt`) and probes use `docker exec`. Rule: a public manifest's comments state
    facts (MANIFEST_SPEC §4, "the entrypoint stays"; AGENTS.md: keep implemented behaviour accurate). Fix: reword the
    two comments (for example "The image keeps the Node base image's docker-entrypoint.sh, which runs a task argv that
    starts with a program unchanged" and "Fixed by the image (Dockerfile ENV block), the static-root override
    STATIC_DIR, or read only by development commands"); re-run `validate`.
  - **F2 | Low | `.github/workflows/image.yml:1`, `docs/07_DEPLOYMENT_AND_OPERATIONS.md:9` and `.vi.md:9`,
    `docs/adr/0002-ingat-manifest-and-ghcr-image.md:59` and `.vi.md:57`.** Reproduction: the job builds only
    `$GITHUB_SHA` (`image.yml:40-47`), and GitHub documents `GITHUB_SHA` of a `push` run as the "Tip commit pushed to
    the ref" (one run per push; `a8-docs.txt`); `ingat-validate.yml:5-8` triggers on pushes to `main` and on pull
    requests. Expected: the docs say "the tip commit of every push to `main`" and "on every push to `main` and every pull
    request". Actual: "on every commit to main" (workflow header), "on every commit to `main`" and "checks it on every
    push" (docs/07 EN and VI), "Every `main` commit adds a GHCR package version" (ADR Consequences, EN and VI), while the
    ADR's own Decision says "on every push to `main`". Consequence: a commit pushed together with later ones gets no
    image, and Ingat's `prepare` for that commit fails at the pull. Rule: brief requirement 2 and audit item 8 (docs
    match behaviour); AGENTS.md (no claim beyond the behaviour). Fix: correct the wording in those five places and the
    workflow comment (no behaviour change), or, if the owner wants every commit deployable, a separate design decision.
  - **F3 | Low | track evidence under `handoff/`: `evidence/INGAT-T0T8-GATE/cleanup.txt:6-12`,
    `evidence/INGAT-T0T8-GATE/g5.txt.txt:32-33`, `evidence/INGAT-T0T8-IMPL/g5.txt:30-31`,
    `evidence/INGAT-T0T8-IMPL/ps.txt:1`.** Reproduction: the marker grep of `a7-privacy.txt` and a read of those lines.
    Expected: the track's own privacy rule ("everything under `handoff/` stays generic: no host values, real ports …",
    PLAN brief; audit item 7). Actual: `docker ps` listings of the development machine's unrelated containers, with the
    names of the owner's other projects, their published ports and a masked account fragment. Not a secret and not the
    target host; 31 committed evidence files of earlier packages already list such names, so this follows past practice
    but not this track's rule. Fix: before any commit, replace each unrelated row with a count ("N containers that are
    not this task's; names and ports omitted"); keep the rows of the task's own containers.
- Risks and optional improvements, separate from proven defects:
  - R1. CI cannot catch two classes that Ingat 0.1.0 refuses on the target host: `validate` checks the policy with CPU
    CFS assumed present (`ops/validate.py:66`), so a later non-zero `cpus` passes CI (`a2-validate.txt` L1), and it does
    not run `supported()` (L2, already in ADR 0002). Optional: name `cpus` in the ADR's facts, or add a CI guard.
  - R2. The app's exit-code contract: an uncaught error exits 1 (`src/server/cli.ts:482`), which the bootstrap and the
    outbound `--confirm` maps read as `refused` (nothing changed). The maps follow the documented contract and Ingat's own
    SQLite example; a distinct code is an app change outside this scope.
  - R3. The workflow's "not found" branch is proven on `registry:3` only; GHCR's error text for a never-published
    package is unverified. A different text fails closed (nothing pushed) but blocks the first publish until adjusted.
  - R4. The version step accepts only digits and dots; a pre-release `package.json` version fails the job (closed).
  - R5. The runner's buildx client is not pinned (BuildKit is), as in Ingat's own workflows.
  - R6. ADR 0002 says 0.1.x cannot run "a subnet param"; precisely, a subnet param left to allocation
    (`ops/instance.py:131-133`).
  - R7. `ingat.toml:139` says the exit maps are documented in docs/11; docs/11 documents the backup, restore and outbound
    exits, not migrate or bootstrap (the `cli.ts` header documents all).
  - R8. `[drill] min_free_memory = "512m"` is unmeasured; a drill refuses below it (`ops/backup.py:138-140`).
  - R9. Pre-existing app gaps, stated in the ADR: no read-only verify command; SMTP credentials are env-file secrets
    (no `*_FILE` support), so ARCHITECTURE §11.3 items 2 and 5 are met only partly.
  - Confirmed correct, for the record: every task argv and exit map; the readiness JSON paths; store owner, mode and
    shape; params and `[app_env]` rules against `config.ts`; holds, rollback env, side effects; the image user and
    labels; least-privilege permissions; full-SHA pins; the immutability and digest logic; attestations off; the
    validate job's lockdown flags; the S15 statement; no `cpus`; no host value in the nine files.
- Required gates unrun/blocked and why (unrun by design, not passes): both workflows on GitHub Actions; the GHCR push
  with `GITHUB_TOKEN`, package creation, linking and visibility; an anonymous pull from the target host and its
  Engine 24 pull of the OCI manifest; Ingat `init`, `prepare`, `deploy`, `backup` and `verify --restore-test` on a real
  host (traced in Ingat's source and exercised command by command locally instead); Node.js on kernel 4.4 (S15); drill
  memory. No owner credential was used; nothing ran against the owner's NAS; no image was pushed to a remote registry.
- Disposition of previous findings: the draft corrections of the plan (expect_labels, the GHCR image reference, the
  unused build keys, the forbidden list, `TRUSTED_PROXY_ADDRESSES` not required, the session-hours pattern,
  `log_snapshot` removed, the generic pause text, `operator = false` on the backup task) are all present and correct; no
  further draft error was found. The plan's fact sheet "no ENTRYPOINT" is wrong (the source of F1). The gate's PASS
  items were re-run here with the same results; its caveat (YAML parse only through actionlint) stands, and actionlint
  parsed both files.
- Software readiness, owner permission and pilot result separately: software readiness of T0/T8 is not accepted until
  F1-F3 are fixed and rechecked. Owner permission is still needed for every GitHub step (Actions, workflow permissions,
  package visibility, which cannot be undone) and for any NAS run. No pilot or S15 result exists.
- One next action/prompt: coordinator dispatches one bounded fix task (owned paths: `ingat.toml` comments at lines 29
  and 138, `.github/workflows/image.yml` line 1, the docs/07 paragraph EN and VI, the ADR 0002 Consequences line EN and
  VI, and the four evidence files of F3), then a gate on the new hashes and digest and a fresh recheck audit.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: INGAT-T0T8-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, self-reported); authors: the planner of INGAT-T0T8-PLAN and the worker of INGAT-T0T8-IMPL (both
  self-reported `claude-sonnet-5-5`); gate INGAT-T0T8-GATE (self-reported `claude-sonnet-5-5`).
- Fresh context; confirm reviewer did not author changes: fresh context; the auditor authored nothing in the snapshot and
  wrote only this review pair, the brief's Results, `handoff/delivery/evidence/INGAT-T0T8-AUDIT/` and the task folder.
- Source digest before/after; gate evidence for that snapshot: `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd`
  before and after, nine hashes OK before and after (`identity-first.txt`, `identity-last.txt`); gate evidence
  `handoff/delivery/evidence/INGAT-T0T8-GATE/` (Decision PASS on the same identity).
- New report path preserving previous review history: `handoff/delivery/INGAT_T0_T8_REVIEW.md` and `.vi.md` (first
  review of this track).
- Finding dispositions and next coordinator fix/recheck task: F1-F3 open; next a bounded fix task (for example
  INGAT-T0T8-FIX1), a gate on its new identity, then a fresh recheck audit (for example INGAT-T0T8-RECHECK1).
