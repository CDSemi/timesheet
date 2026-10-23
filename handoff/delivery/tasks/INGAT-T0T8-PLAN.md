# INGAT-T0T8-PLAN dispatch brief (verify the Ingat manifest draft and design T0/T8)

- **Task.** Side track "Ingat deployability" (items T0 and T8), task INGAT-T0T8-PLAN, kind
  plan, attempt 1, no dependencies. This track runs in the worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0` on branch
  `claude/relaxed-lalande-8359f0`. It is not registered on `ORCHESTRATION.json`: the live
  board belongs to the main-checkout coordinator (round UX5). Do not edit the board, STATE
  or NEXT_ACTION.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size M, risk H, novelty yes.
    - Risk H: the manifest names the backup and restore commands (recovery/restore), the
      repository is public (privacy), and T8 publishes an image.
    - Novelty: the first CI workflow and the first Ingat manifest in this repository; the
      external Ingat spec gives the pattern.
    - docs/08 row "Plan/diagnose a bounded issue".
  - Write the task record in English.

## Goal

Ingat (a CLI that deploys, updates, backs up, verifies and restores Docker Compose apps on
one host) will install a test instance of this app on the owner's NAS. This repository
needs two changes, which a later worker task implements from your plan:

- **T0:** an `ingat.toml` at the repository root, and a CI job that runs `ingat validate`
  on it with the public Ingat image pinned by digest:
  `ghcr.io/lisahq/ingat:0.1.0` =
  `sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`.
- **T8:** a CI workflow that builds the app image for `linux/amd64` on each release
  commit and publishes it to GHCR (public), tagged by commit, with the OCI labels
  `org.opencontainers.image.version` and `org.opencontainers.image.revision`. The
  manifest then pulls it by digest and checks those labels (`expect_labels`, `{commit}`
  for build services), as Ingat's ADR-0026 says.

Your job: establish the facts, check the owner's draft against this repository's real
code, and write a plan precise enough that a worker can implement it without guessing.
You change no source.

## Reading list (read in full unless a section is named)

This repository (base = the worktree HEAD):
- `AGENTS.md` (from disk), `docs/08_AI_WORKFLOW_AND_BUDGET.md` (planner part).
- `package.json`, `Dockerfile`, `.dockerignore`, `compose.example.yaml`.
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md`, `docs/11_OPERATIONS_RUNBOOK.md` (the parts on
  the image, Compose, environment, data paths, backup, restore, health and readiness).
- The server and CLI code that implements what the manifest will name: the CLI entry
  point and its commands (migrate, backup, restore, verify, first-admin or setup step,
  whatever exists), the environment and configuration parsing (required and optional
  variables, secret variables and any `*_FILE` support), the data paths (database, PDFs,
  signatures, backups), the health and readiness routes, the listening port, and the
  container user. Find them with Glob/Grep; cite `file:line` for every fact.

Ingat (read-only; `D:\Dropbox\Work.LISA\LisaHQ\Ingat`; if a path below moved, Glob for the
file name):
- `docs/app-developers/MANIFEST_SPEC.md`: §2 (keys) and §11 (the generic example that
  mirrors this kind of app), plus every section on params, CPU limits, secrets, probes,
  tasks, stores, `expect_labels`, build services and `{commit}`.
- `docs/design/ARCHITECTURE.md` §11.3 (onboarding checklist) and §9.5 (Compose policy).
- `docs/design/adr/0026-app-images-built-in-app-ci.md`.
- `docs/design/ROADMAP.md`: spike S15 (Node.js on kernel 4.4) and the M1 exit gate.
- How `ingat validate` is invoked (MANIFEST_SPEC, the operator guide under `docs/guide/`,
  `README.md`).
- `.github/workflows/*.yml`: how actions are pinned by SHA, and the SHAs of any action
  this repository will also use.
- The owner's private draft, `_private/consumers/consumer-manifest-drafts.md` §11. Use the
  variant from BEFORE the fixed-subnet Compose change (the fixed subnet is item T1, later
  in Ingat's M2).

## Privacy rules (this repository is public)

- `ingat.toml`, the workflows, docs and everything under `handoff/` stay generic: no
  host values (real ports, subnets, hostnames, URLs other than the public GitHub/GHCR
  names of this repository and of Ingat, paths on the target host, user names), and
  secrets only as file secrets or generated values.
- Do not copy private draft text, the owner's private plan or host facts into tracked
  files. Describe draft errors by key and by code fact. Write "the target host" (Linux
  kernel 4.4, no CPU CFS quota) instead of device or system details.
- Do not write this app's name into any file of the Ingat repository (you write nothing
  there at all).

## Deliverables (Results section below, plus evidence)

A. **Fact sheet.** Each fact with `file:line`: Dockerfile stages, base image and the Node.js
   version it runs, libc (glibc or musl), container user, listening port, entrypoint and
   command; environment variables (required, optional, secret, `*_FILE`); data paths;
   health and readiness routes and what they check; every CLI command the manifest could
   name, with its exact invocation inside the container, its exit codes and whether it
   needs the app stopped; Compose services, volumes and any `cpus`/resource limits.
B. **Draft check.** A table: each task, command, probe, store and param of draft §11 →
   correct / wrong / missing → the correction and its evidence. Include anything the
   draft lacks that MANIFEST_SPEC §2 or ARCHITECTURE §11.3 requires.
C. **Proposed `ingat.toml`**, full text, generic, with a short mapping to MANIFEST_SPEC §2
   and each ARCHITECTURE §11.3 checklist item. The CPU limit is a param that defaults to
   no limit (the target host kernel has no CPU CFS quota; Compose must not set a non-zero
   `cpus` there). Secrets as file secrets or generated values only.
D. **Compose.** Which Compose file Ingat uses (the existing example or a new one); every
   change it needs (image by digest from the manifest, no fixed subnet, no default CPU
   limit, volumes for the data paths). Keep `compose.example.yaml` working for its current
   readers, or say why it must change.
E. **T8 design.** Workflow file name; triggers (what a "release commit" is in this
   repository before the first release; `git.release_declared` is false and commits go to
   `main`); steps; every action pinned by a full commit SHA with the version in a comment
   (take SHAs from Ingat's workflows for the same action; for another action, give the
   SHA from `git ls-remote` of its public repository and show the command); permissions
   (least privilege, `packages: write` only in the publish job); image name
   `ghcr.io/cdsemi/timesheet`; tag scheme per ADR-0026 (`{commit}`); the two OCI labels
   and their values (where the version comes from); `org.opencontainers.image.source` if
   needed to link the package; whether buildx provenance/SBOM attestations turn the push
   into an index and whether Ingat's digest pin and `expect_labels` handle that (follow
   ADR-0026); how the job prints the pushed digest for the manifest.
F. **T0 design.** Workflow file and job; the exact `docker run` of the pinned Ingat image
   that runs `validate` on the checkout (mounts, working directory, arguments, read-only),
   what `validate` needs to find (Compose file, env, params), triggers (push and pull
   request), permissions (`contents: read`).
G. **S15 kernel finding.** The Node.js version the image runs; the minimum Linux kernel
   that Node.js release line officially supports for that libc, with the source (the
   public `BUILDING.md` of that release line; you may fetch it with `curl` into the task
   folder); a plain answer to "does it support a 4.4 kernel": official support yes/no, and
   the practical risk; what Ingat's S15 spike must run on the host to settle it. Do not
   propose a runtime change; the owner decides that.
H. **Docs.** Whether docs/07 (and its `.vi.md`) or another doc must describe the manifest
   and the image workflow; if so, the minimal lines. No new doc unless needed.
I. **Owner steps on GitHub**: Actions enabled, workflow permissions, package visibility
   (first push creates a private package?), linking the package to the repository,
   organization package settings. Mark each as verified (with source) or to-check.
J. **Implementation task** for one worker: exact owned paths, acceptance criteria, and the
   exact gate commands (Git Bash on Windows, `MSYS_NO_PATHCONV=1` for Docker mounts):
   `ingat validate` with the pinned digest; YAML parsing of each workflow; a check that
   every `uses:` is pinned by a 40-hex SHA; an optional `actionlint` run (name the image
   and pin it by digest if you propose it); a local `linux/amd64` build of the app image
   with the two labels and a `docker image inspect` of them; the privacy scan; the
   repository's own checks that apply to these files.
K. **Base drift.** `git log --oneline HEAD..main` and `git diff --stat HEAD main` limited to
   the paths in A. Flag any change on `main` that affects the manifest (the worktree base
   may be behind `main`).
L. **Owner questions**, only those that block a correct implementation.

## Allowed and forbidden actions

- Allowed: read-only git (`status`, `log`, `diff`, `show`, `ls-files`, `ls-remote` of
  public action repositories); `docker pull` of the pinned Ingat image and `docker run`
  of it on copies in your task folder (for example to see what `validate` reports for the
  draft); `docker pull`/`docker run` of the Dockerfile's base image to read `node
  --version` and the libc; `curl` of public documentation into the task folder.
- Forbidden: anything against the owner's NAS or any remote host other than public
  GitHub/GHCR/Docker Hub/nodejs.org reads; building or pushing this app's image; editing
  any file outside your owned paths; staging, committing or pushing.

## Owned paths

- this brief's Results section;
- `handoff/delivery/evidence/INGAT-T0T8-PLAN/` (masked logs, the proposed files as
  `.txt`);
- task folder `D:\.claude-tmp\timesheet\INGAT-T0T8-PLAN` (raw logs, copies, downloads).

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS (NO `docker run -it`).**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Node 24 first on PATH if you run Node:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Evidence copies write `<user>` for the account segment of any profile path.
- Every container you start runs with `--rm` and exits by itself. Before returning, make
  sure none of your background commands is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...'.

## Base at dispatch

- Worktree branch `claude/relaxed-lalande-8359f0`; record HEAD, `git status --short` and
  `git log -1 --format=%H main` before reading code. At dispatch the only uncommitted
  files are this brief and the track checkpoint (`handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`
  and `.vi.md`).

## Results

Planner: timesheet-planner, attempt 1; self-reported model `claude-sonnet-5-5` (requested sonnet, no override).
Evidence folder: `handoff/delivery/evidence/INGAT-T0T8-PLAN/` (every claim below names the file; `COMMANDS.txt` lists
each command and its exit). Raw logs and downloads: `D:\.claude-tmp\timesheet\INGAT-T0T8-PLAN`.
Base at dispatch: branch `claude/relaxed-lalande-8359f0`, HEAD `2bce0ab5842b80c710f23496d5173c122319e5c7`, equal to
`main` locally and to `refs/heads/main` on the remote (`lsremote-main.txt`); `git status --short` showed only this brief
and the track checkpoint pair.

Summary of the findings that change the owner's draft (details in B):

1. The draft fails `ingat validate` as written: `compose.expect_labels: must bind {commit}` (reproduced, exit 1).
2. The draft's image param points at a local tag, which Ingat would try to pull from Docker Hub; it must be the GHCR
   name that T8 publishes.
3. `log_snapshot` is refused at `init`/`deploy` by Ingat 0.1.0 (M1), but `ingat validate` does not catch it, so the
   CI job cannot protect against it; the proposal omits it.
4. `TRUSTED_PROXY_ADDRESSES` must not be `required` in the M1 form (the address is only known after the first
   install), and its pattern, `STATIC_DIR` and one seed variable need fixing.
5. A host path appears in the draft's pause text; the proposal uses `INGAT_ROOT/inbox/`.
6. No change to `compose.example.yaml`, `Dockerfile` or any source file is needed. The Compose file has no `cpus`.
7. S15: official Node.js support for kernel 4.4 is **no** (Tier 1 starts at kernel 4.18); see G.
8. Base drift: none (K). No question blocks the implementation (L).

## A. Fact sheet (file:line in this repository at the base HEAD)

### A1 Image (Dockerfile, `.dockerignore`, package.json)

| Fact | Value | Source |
|---|---|---|
| Stages | `base` (WORKDIR /app), `build` (`npm ci`, `tsc` server with `--sourceMap false`, Vite client with `BUILD_SOURCEMAPS=off`), `prod-deps` (`npm ci --omit=dev --ignore-scripts`), `runtime` | Dockerfile:11-13, 18-24, 27-29, 33-58 |
| Base image | `node:24.21.0-trixie-slim` pinned by the multi-arch index digest `sha256:8ec5d7557396cfe32d21c3f9c13072355ceab22b584578ca4bb28af31120cffe` | Dockerfile:3-9, 11; `.nvmrc`; package.json:8 (`engines.node ^24.11.0`) |
| Node.js that runs | **v24.21.0** (observed: `process.version`), x64, V8 13.6, N-API 10 | `probe-node-image.txt` |
| libc | **glibc** (Debian 13 trixie; observed runtime glibc 2.41, Node compiled against 2.28), not musl | `probe-node-image.txt`; Dockerfile:3 |
| Native module | `better-sqlite3` 13.0.3 prebuilt N-API binding for glibc, no compiler in the image; the Dockerfile names `bookworm-slim` as the fallback if the prebuild ever fails to load | Dockerfile:7-8; package.json (dependencies) |
| Container user | uid/gid **10001:10001**; `USER 10001:10001`; `/data` created mode 0700 owned by 10001 | Dockerfile:41-43, 49 |
| Fixed environment | `NODE_ENV=production`, `OUTBOUND_MODE=capture`, `HOST=0.0.0.0`, `PORT=3000`, `DATABASE_PATH=/data/timesheet.db`, `DATA_DIR=/data/private-data` | Dockerfile:34-39 |
| Listening port | **3000** (`EXPOSE 3000`; `PORT` default 3000) | Dockerfile:37, 53; src/server/config.ts:52 |
| Entrypoint and command | no `ENTRYPOINT`; `CMD ["node","dist/server/index.js"]`; `STOPSIGNAL SIGTERM`; `VOLUME /data`; WORKDIR `/app` | Dockerfile:12, 52, 57, 58 |
| Image health check | `node -e fetch(.../api/ready)`, interval 15s, timeout 5s, start-period 20s, retries 3 (no `start_interval`, so it works on Engine 24) | Dockerfile:55-56 |
| Image contents | `dist/`, production `node_modules`, `assets/pdf-fonts`, `package.json` only; the context is an allow-list, so `ingat.toml`, `.github/`, docs and handoff never enter the image | Dockerfile:44-48; `.dockerignore:1-10` |
| Version for the label | `package.json` `"version": "0.1.0"` (line 3) | package.json:3 |
| Line endings | `* text=auto eol=lf`, so `git archive` of `ingat.toml` equals `git show` bytes on every checkout | `.gitattributes:1-2` |

### A2 Environment variables (all read in `src/server`; there is no `*_FILE` convention: the only `_FILE` hits are font constants in `pdf/fonts.ts`)

| Variable | Status | Source |
|---|---|---|
| `NODE_ENV` | fixed by the image to `production`; production makes the next four required | Dockerfile:34; config.ts:51-61, 112, 126 |
| `HOST`, `PORT` | fixed by the image (`0.0.0.0`, `3000`) | Dockerfile:36-37; config.ts:52, 65 |
| `DATABASE_PATH`, `DATA_DIR` | fixed by the image; required absolute in production; `DATA_DIR` must not sit under a path segment starting with "dropbox" | Dockerfile:38-39; config.ts:59-61, 110-121 |
| `APP_ORIGINS` | **required** in production; comma-separated bare origins (no path) | config.ts:39-48, 53-58 |
| `PUBLIC_BASE_URL` | **required** in production; absolute `https` URL without credentials, query or fragment | config.ts:123-141 |
| `COOKIE_SECURE` | optional (`true`/other; default `true` in production) | config.ts:69 |
| `SESSION_TTL_HOURS` | optional, positive number, default 168 | config.ts:62-63 |
| `TRUSTED_PROXY_ADDRESSES` | optional; comma-separated exact IPs; unset/empty trusts no proxy | config.ts:72; http/clientAddress.ts:46-56 |
| `MAIL_FROM` | optional for start (null sender), but every send and every capture fails with `sender_missing` without it | config.ts:146-152; mail/message.ts:104 |
| `OUTBOUND_MODE` | `capture` (default, image sets it) or `smtp`; `smtp` needs `PRODUCTION_SENDING_ENABLED=true` exactly | config.ts:180-188 |
| `PRODUCTION_SENDING_ENABLED` | owner-only flag | config.ts:174-188 |
| `SMTP_HOST` (required in smtp mode), `SMTP_PORT` (default 587), `SMTP_SECURITY` (`starttls` default, or `tls`) | read only in smtp mode | config.ts:157-172 |
| `SMTP_USER`, `SMTP_PASSWORD` | **secret**, both or neither, held as `SecretValue`; read only in smtp mode; env variables only (no `_FILE`) | config.ts:81-103, 167-170 |
| `JOB_RUNNER` | `off` disables the in-process runner | index.ts:44-47 |
| `STATIC_DIR` | redirects the static root (must never be set in an instance) | index.ts:17 |
| `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD`, `SEED_EMPLOYEE2_PASSWORD` | development `seed` only; `seed` refuses `NODE_ENV=production` | cli.ts:443, 449-451 |

### A3 Data paths

- SQLite database `/data/timesheet.db` plus `-wal`/`-shm` (WAL, busy timeout 5000 ms): db/database.ts:14, 17.
- Private files (PDFs, signatures, import sources, evidence) `/data/private-data`; outbound capture `…/mail-capture/<attempt>/`: mail/captureAdapter.ts:19.
- Backups go wherever `backup --to <dir>` points, outside `DATA_DIR` (runbook uses `/data/backups`; under Ingat the stage `/out`): ops/backup.ts:172-191; docs/11 §4.
- `restore --to <dir>` writes `<dir>/timesheet.db` and `<dir>/private-data`, the same shape as `/data`: cli.ts:47-50, ops/restore.ts. A `generation:data` mount at `/restore` therefore yields a store-shaped generation.
- A bind-mounted `/data` must belong to 10001:10001, mode 0700: Dockerfile:40-43; compose.example.yaml:9-11.

### A4 Health and readiness (src/server/app.ts)

- `GET /api/health` (115-118): 200 `{"status":"ok"}` after `SELECT 1`; no personal data.
- `GET /api/ready` (119-129): 200 `{"status":"ready","schema":{"expected":N,"actual":N},"data_dir_writable":true}` only when the applied schema equals the latest migration **and** the data directory is writable; otherwise 503 with `"status":"not_ready"`.
- GET requests need no `Origin` header (the origin check is for non-safe methods only): http/security.ts:12-22. No `Host` check exists. Both routes also work from `127.0.0.1` over a published port, as Ingat's `http` probes use.

### A5 CLI commands (all run as `node dist/server/cli.js <command>` from `/app`; no ENTRYPOINT, so a task `argv` starts with `node`; `<cli>` of docs/11:33)

| Command | Effect and app state | Exit codes | Source |
|---|---|---|---|
| `migrate` | applies pending migrations (`BEGIN EXCLUSIVE`, one transaction), prints `{"database","applied","version"}`; safe with the app running, but the first open of a brand-new database should be alone (SQLITE_BUSY) | 0; any throw exits 1 | cli.ts:437-441; db/migrations.ts:78, 94; docs/11 §16.1 |
| `seed` | development only, refuses production | 1 in production | cli.ts:442-472 |
| `run-jobs --once --now <instant>` | development/test only, refuses production | 1 production, 2 usage, 0 | cli.ts:83-108 |
| `bootstrap --config <file>` / `--new-token` | validates the owner's calendar/policy JSON (max 256 KiB), creates the calendar once, prints a single-use 60-minute setup token **to stdout once**; runs while the app runs | 0; 1 refusal (`BootstrapError`); 2 usage | cli.ts:110-163 |
| `backup --to <dir> [--prune]` | online SQLite backup + referenced private files + `manifest.json` into one new folder `timesheet-backup-<UTC>-<8hex>` under `<dir>` (outside `DATA_DIR`); records its outcome in `operations_state`; allowed while the app runs; prints one JSON line | 0 succeeded; 1 failed; 2 refused or usage | cli.ts:223-268; ops/backup.ts:359-413 |
| `backup prune --in <dir> --dry-run` | counts only | 0; 2 refused | cli.ts:229-237 |
| `restore --from <backup> --to <empty dir> [--keep-schema [--confirm]]` | isolated restore; never opens the live database; verifies hashes, integrity, schema (refuses a newer one), pauses outbound; the target must be empty and outside the live data | 0; 1 failed check; 2 refused or usage | cli.ts:270-336; ops/restore.ts:239-262 |
| `outbound resume` / `release` / `drop` | without `--confirm` prints JSON `{"outcome":"confirmation_required",…}` and **exits 2**; with `--confirm` acts (audited). Runs `migrate` first. Works with the app running | preview 2; confirm 0 or 1 (refused); usage 2 | cli.ts:338-425 |
| any other word | usage | 2 | cli.ts:473-475 |

### A6 Compose (`compose.example.yaml`)

One service `timesheet` (13); `build: .` (14); `image: ${TIMESHEET_IMAGE:-timesheet:local}` (15); `env_file: ${TIMESHEET_ENV_FILE:-./timesheet.env}` (19-20); one bind volume `${TIMESHEET_DATA_DIR:-./data}:/data` (23); `127.0.0.1:${TIMESHEET_PORT:-3000}:3000` (27); `restart: unless-stopped`, `init`, `stop_grace_period: 45s` (28-31); `read_only: true` with `/tmp` tmpfs 64m (32-34); `no-new-privileges`, `cap_drop: [ALL]` (35-38). It has no named volume, no network, no `container_name`, **no `cpus` and no memory limit**, and no `healthcheck` override. The runbook's drill and `docker compose up --build` use this file unchanged (docs/11:22, scripts/container-drill.mjs:110).

## B. Draft check (owner's private draft §11, form before the fixed-subnet change; checked by key and by code fact, the draft text is not copied)

Method: the draft's pre-fixed-subnet form (`files`/`build_files` = `compose.example.yaml`, no subnet param) was written
into the task folder and run through the pinned `ingat validate`, then compared key by key with the code. Ingat
sources read: `src/ingat/ops/validate.py`, `ops/context.py` (`supported`, `source`), `model/manifest.py`,
`adapters/override.py`, `core/steps.py` (`obtain`), `ops/steps_build.py` (`task_uid`), `ops/deploy.py`.

Verdict key: OK = correct as drafted; FIX = wrong or incomplete (correction given); MISSING = absent but required;
NOTE = correct, with a remark.

| # | Draft element | Verdict | Correction and evidence |
|---|---|---|---|
| 1 | `manifest`, `app`, `requires_ingat = ">=0.1,<1"` | OK | satisfied by 0.1.0 (`validate-proposed-final.txt`) |
| 2 | `[source] kind = "git"`, `release = "commit"` | OK | `{release}` equals `{commit}` for commit releases (Ingat `ops/context.py:154`); there is no release tag yet |
| 3 | `[compose] files` (pre-fixed-subnet: `compose.example.yaml`) | OK | validates; `build: .` is reset by Ingat's override (`adapters/override.py:73-74`), so the file needs no change |
| 4 | `build_files`, `build_env` | FIX (remove) | `build_files` only feeds the raw-text checks of the Compose files (`ops/context.py:169`) and `build_env` is unused while images come from CI (ADR-0026); the draft's `build_env` value is a local tag nothing pulls. Omitted: smaller, still valid |
| 5 | `build_services = ["timesheet"]` | OK | the service exists (`compose.example.yaml:13`) |
| 6 | `[compose] expect_labels` | **MISSING** | required when `build_services` is set and must contain `{commit}` (MANIFEST_SPEC §2.1; `model/manifest.py:356-357`). Reproduced: `compose.expect_labels: must bind {commit}: build_services are pulled`, exit 1 (`validate-draft-pre-t1.txt`). Proposed: `org.opencontainers.image.revision = "{commit}"` (`validate-draft-pre-t1-b.txt` passes once it is added) |
| 7 | `TIMESHEET_IMAGE = template "timesheet:{commit}"` | **FIX** | Ingat pulls exactly the rendered reference unless it is a `sha256:` ID (`core/steps.py:286-288`); `timesheet:<sha>` resolves to a Docker Hub library name that does not exist. Must be the T8 name `ghcr.io/cdsemi/timesheet:{commit}`. Note: ADR-0026 pulls by this tag and then pins by image ID and records the repository digest (`steps.py:303-310`); it does not pull "by digest" |
| 8 | `TIMESHEET_ENV_FILE` (env_file), `TIMESHEET_DATA_DIR` (store), `TIMESHEET_PORT` (port) | OK | Compose variables with non-empty defaults may be declared (MANIFEST_SPEC §2.2); validate passes |
| 9 | `TIMESHEET_SUBNET` param | n/a here | belongs to the later fixed-subnet item; absent in this form (an unset `subnet` param is refused in M1: `ops/context.py:275`) |
| 10 | `[app_env] forbidden` | FIX | lacks `STATIC_DIR` (index.ts:17) and `SEED_EMPLOYEE2_PASSWORD` (cli.ts:451). The cited `Dockerfile:34-39` is right; `cli.ts:31` is a usage comment, the code is cli.ts:442-452. Undeclared keys are refused anyway, so this is documentation, but a declared-forbidden key gives a clearer refusal (`validate-instance-bad.txt` shows `STATIC_DIR: forbidden`) |
| 11 | `APP_ORIGINS`, `PUBLIC_BASE_URL` `required` | OK + pattern | production refuses to start without them (config.ts:53, 126). Added patterns (origins without a path; https only, config.ts:139) so a wrong value is refused by Ingat before it reaches the container |
| 12 | `MAIL_FROM` `required` | NOTE | stricter than the code (optional at start, config.ts:146-152) but right in practice: without it no send or capture works (message.ts:104) and runbook §1.5 names it. Kept required |
| 13 | `TRUSTED_PROXY_ADDRESSES` `required = true` | **FIX** | optional in code (config.ts:72) and in `.env.example`; in the M1 form its value is only known after the first install (the draft says so itself), so `required` would block `init`. Made optional with an exact-IP-list pattern (`http/clientAddress.ts:46-56`; CIDR is rejected by the app) |
| 14 | `COOKIE_SECURE`, `JOB_RUNNER`, `OUTBOUND_MODE`, `PRODUCTION_SENDING_ENABLED`, `SMTP_*` | OK | values and gates match config.ts:62-72, 156-188 and index.ts:44-47; the env file overrides the image's `OUTBOUND_MODE` (Compose precedence). `SMTP_USER`/`SMTP_PASSWORD` as `secret = true` is the right fit: the app has no `*_FILE` support, and Ingat renders env-file secrets into the 0600 `app.env` (ARCHITECTURE §9.4). In M1 changing an owner-gated key is refused (`ops/deploy.py:471-479`), so no secret exists in the first test instance |
| 15 | `SESSION_TTL_HOURS` pattern `^[0-9]{1,4}$` | FIX | allows `0`, which the app refuses (`config.ts:63`); now `^[1-9][0-9]{0,3}$` |
| 16 | `[stores.data]` (bind, `10001:10001`, `0700`, `local_only`, `online_backup`) | OK | Dockerfile:41-43, 49; backup uses SQLite's online backup API (ops/backup.ts:233-235) |
| 17 | `[services] writers` | OK | one container holds web app, job runner and SQLite (index.ts:44-62) |
| 18 | `[services] log_snapshot` | **FIX (remove)** | Ingat 0.1.0 refuses it at `init` and at `prepare`/`deploy` (`ops/context.py:201,207`; `ops/instance.py:64`; `ops/deploy.py:154`), while `ingat validate` accepts it (`validate-draft-pre-t1-b.txt`). MANIFEST_SPEC §11 says the M1 form has none. Add back at M2 |
| 19 | `[schema]` probe `ready`, `schema.expected` / `schema.actual`, `migrates_on_start = true` | OK | the readiness JSON has exactly those paths (app.ts:126); the server migrates at start (index.ts:30); the draft's cite `index.ts:30` is correct |
| 20 | `[probes.ready]` (`exec`, `node -e fetch`, `expect {status="ready", data_dir_writable=true}`) | OK | same pattern as the image health check (Dockerfile:55-56); `data_dir_writable` is the real key (app.ts:126); the image has no `wget`/`curl`, so `node` is correct; port 3000 is fixed by the image |
| 21 | `[probes.edge-live]`, `[[smoke]]` live/ready | OK | `/api/health` and `/api/ready` bodies match (app.ts:115-129) |
| 22 | `[[activate]]` / `[[install]]` migrate, start, pause | OK | the explicit one-off migrate matches docs/11 §16.1; `allow_tasks` name existing tasks |
| 23 | pause text | **FIX** | contains a host path of the target machine; the proposal says `INGAT_ROOT/inbox/` like the Ingat examples (privacy: no host values in a public repository) |
| 24 | `[deploy] baseline/prechecks/postchecks = []` | NOTE | empty lists are fine, but non-empty ones are refused in M1 (`ops/context.py:203`); the Ingat fixture omits them. Omitted |
| 25 | `[backup] strategy = "tasks"`, `steps = ["backup"]`, `verify = []`, no `payload` | OK | `payload` is optional: the rule is "exactly one top-level entry" (LIFECYCLE §4.7), and `createBackup` renames one staging folder into place (ops/backup.ts:364-400). `verify = []` is the known gap: there is no read-only verify command (ARCHITECTURE §11.3 item 2 "recommended") |
| 26 | `[restore]` (`steps = ["restore"]`, `activate = true`, `checks = []`) | OK | restore's own checks (hash, integrity, schema) run inside the command (ops/restore.ts:673-693). `--keep-schema` cannot be expressed; it is not needed when the restore runs in the bundle's own release image (MANIFEST_SPEC §2.7), but the later rollback item should confirm this |
| 27 | `[rollback] env`, `[drill]`, `[holds.timesheet]`, `[side_effects]` | OK | `JOB_RUNNER=off` and `OUTBOUND_MODE=capture` are real, declared keys; restore pauses outbound and holds queued sends (cli.ts:47-50; ops/restore.ts). `min_free_memory = "512m"` is not measured anywhere in this repository: kept as a labelled guess |
| 28 | `tasks.migrate` (`node dist/server/cli.js migrate`, `image=candidate`, `exit {0=ok}`) | OK | cli.ts:437-441; no ENTRYPOINT so `argv` starts with `node` |
| 29 | `tasks.backup` (`backup --to /out`, mount `stage`, exit 0/1/2, `stdout=json`) | OK | exit codes cli.ts:244-247; one JSON line (cli.ts:250-258); the container user comes from the image (`ops/steps_build.py:23`: task user, else service user, else image `Config.User`), and the image sets `10001:10001`, so no `user` key is needed (the Ingat fixture needs one only because its tool image has no USER) |
| 30 | `tasks.restore` (`--from /in/{bundle.payload} --to /restore`, mounts bundle and `generation:data`, exit 0/1/2) | OK | exit codes cli.ts:329-335; target must be empty and not contain the live paths (ops/restore.ts:250-256), true for a fresh generation with `/data` bound to the placeholder |
| 31 | `tasks.bootstrap-config` / `bootstrap-new-token` (terminal, `max_input_bytes = 262144`, exit 0/1/2) | OK | args and limit match cli.ts:111-118 |
| 32 | `tasks.outbound-held` / `-status` (`expect outcome="confirmation_required"`, `exit {2="ok"}`, app-write, idempotent) | OK | the draft's cite `cli.ts:369-396` is right; the preview migrates first and exits 2 also for a usage error (cli.ts:371-396), which is why `expect` is needed |
| 33 | `tasks.outbound-release-job/-release-all/-drop-job/-resume` | OK | argv parsed as drafted (cli.ts:347-360); job ids are UUIDs (jobs/jobStore.ts:175), matching `^[A-Za-z0-9-]{1,64}$` |
| 34 | `[source]` / `[compose]` generic of host values | OK | no host value remains in the proposal |
| 35 | Required by MANIFEST_SPEC §2 / ARCHITECTURE §11.3 but absent from the draft | MISSING | (a) `expect_labels` (row 6); (b) a read-only `verify` command and its task (app gap, recorded, not invented); (c) `ingat validate` in app CI on a pinned digest from the first commit (T0); (d) image publication with OCI version and revision labels (T8); (e) the S15 canary on the target kernel (G) |

## C. Proposed `ingat.toml` (repository root; generic; byte-identical copy: `evidence/INGAT-T0T8-PLAN/proposed-ingat.toml.txt`)

Validated with the pinned image against `compose.example.yaml` unchanged: exit 0 (`validate-proposed-final.txt`,
also with the locked-down `docker run` of F); with a good instance file exit 0, with a bad one exit 1 and seven
messages (`validate-instance-*.txt`).

```toml
# ingat.toml - Timesheet app manifest (Ingat manifest schema 1). Ingat reads it from the exact commit it deploys.
#
# This is the form for Ingat 0.1.x (support milestone M1): one runtime Compose file, no subnet param, no log_snapshot and
# no empty [deploy] check lists (0.1.x parses them but refuses to plan an app that uses log_snapshot or non-empty
# prechecks, postchecks or baseline). The image is built and published by this repository's CI (see
# .github/workflows/image.yml) and pulled by tag; the revision label binds the tag to the commit.
# Host values (ports, URLs, addresses, paths, secrets) never appear here: they live in the host's instance.toml.
manifest = 1
app = "timesheet"
requires_ingat = ">=0.1,<1"

[source]
kind = "git"
release = "commit"                            # one image per commit; there is no release tag yet

[compose]
files = ["compose.example.yaml"]              # `build: .` in it is reset by Ingat's override; the image is pulled instead
build_services = ["timesheet"]                # the image is produced by this repository's CI
expect_labels = { "org.opencontainers.image.revision" = "{commit}" }

[params]
TIMESHEET_IMAGE    = { kind = "template", value = "ghcr.io/cdsemi/timesheet:{commit}" }
TIMESHEET_ENV_FILE = { kind = "env_file" }
TIMESHEET_DATA_DIR = { kind = "store", store = "data" }
TIMESHEET_PORT     = { kind = "port" }

[app_env]
param = "TIMESHEET_ENV_FILE"
# Fixed by the image (Dockerfile ENV block), or read only by development commands that never run in production.
forbidden = ["NODE_ENV", "HOST", "PORT", "DATABASE_PATH", "DATA_DIR", "STATIC_DIR",
             "SEED_ADMIN_PASSWORD", "SEED_EMPLOYEE_PASSWORD", "SEED_EMPLOYEE2_PASSWORD"]

[app_env.keys]
APP_ORIGINS                = { required = true, pattern = '^https?://[^\s,/?#]+(,https?://[^\s,/?#]+)*$' }
PUBLIC_BASE_URL            = { required = true, pattern = '^https://[^\s?#]+$' }
MAIL_FROM                  = { required = true }   # the app starts without it, but no send or capture works without a sender
TRUSTED_PROXY_ADDRESSES    = { pattern = '^[0-9A-Fa-f:.]+(,[0-9A-Fa-f:.]+)*$' }   # exact IPs only; unset trusts no proxy
COOKIE_SECURE              = { allowed = ["true", "false"] }
SESSION_TTL_HOURS          = { pattern = '^[1-9][0-9]{0,3}$' }
OUTBOUND_MODE              = { default = "capture", allowed = ["capture", "smtp"], owner_gated = true }
PRODUCTION_SENDING_ENABLED = { allowed = ["true"], owner_gated = true }   # real sending needs both owner-gated keys
SMTP_HOST                  = { pattern = '^[A-Za-z0-9.-]{1,253}$' }
SMTP_PORT                  = { pattern = '^[0-9]{1,5}$' }
SMTP_SECURITY              = { allowed = ["starttls", "tls"] }
SMTP_USER                  = { secret = true }
SMTP_PASSWORD              = { secret = true }
JOB_RUNNER                 = { allowed = ["off"], tool_managed = true }

[stores.data]
kind = "bind"
param = "TIMESHEET_DATA_DIR"
owner = "10001:10001"                         # the image user
mode = "0700"
local_only = true                             # SQLite WAL: never a remote share or a synchronized folder
online_backup = true                          # the backup command uses SQLite's online backup

[services]
writers = ["timesheet"]                       # web app, in-process job runner and the SQLite store in one container

[schema]
probe = "ready"
expected = "schema.expected"
actual = "schema.actual"
migrates_on_start = true                      # the server applies pending migrations at start

[probes.ready]                                # readiness: schema current and the data directory writable
exec = "timesheet"
argv = ["node", "-e", "fetch('http://127.0.0.1:3000/api/ready',{signal:AbortSignal.timeout(4000)}).then(async r=>{process.stdout.write(await r.text());process.exit(r.ok?0:1)},()=>process.exit(1))"]
expect = { json = { status = "ready", data_dir_writable = true } }
stable = "5s"
timeout = "120s"

[probes.edge-live]
http = { port_param = "TIMESHEET_PORT", path = "/api/health" }
expect = { status = 200, json = { status = "ok" } }
timeout = "30s"

[[activate]]
services = ["timesheet"]
wait = ["ready", "edge-live"]
reopens_writes = true

[[smoke]]
name = "live"
http = { port_param = "TIMESHEET_PORT", path = "/api/health" }
expect = { status = 200, json = { status = "ok" } }
[[smoke]]
name = "ready"
http = { port_param = "TIMESHEET_PORT", path = "/api/ready" }
expect = { status = 200, json = { status = "ready", data_dir_writable = true } }

[[install]]
task = "migrate"                              # once and alone: concurrent first opens of a new database can fail with SQLITE_BUSY
[[install]]
start = ["timesheet"]
wait = ["ready", "edge-live"]
[[install]]
pause = "Copy the owner's bootstrap file into the Ingat inbox (INGAT_ROOT/inbox/), run `ingat task {instance} bootstrap-config --input config=<file>` (it prints the single-use setup token to the terminal that runs it and never records it), create the administrator in the browser, then run `ingat resume {instance}`."
allow_tasks = ["bootstrap-config", "bootstrap-new-token"]

[deploy]
migrate = "migrate"                           # explicit one-off before the start, so the start applies nothing

[backup]
strategy = "tasks"
steps = ["backup"]
verify = []                                   # hash-only until the app has a read-only verify command

[restore]
start = []
steps = ["restore"]
post = []
checks = []
activate = true                               # start the app on the new generation in isolation and wait for `ready`

[rollback]
env = { JOB_RUNNER = "off" }                  # a schema older than the outbound pause cannot hold jobs

[drill]                                       # throwaway secrets; SMTP credentials and owner-gated keys are dropped in isolation
checks = []
record = []
activate = true
min_free_memory = "512m"                      # not measured yet

[holds.timesheet]
OUTBOUND_MODE = "capture"
JOB_RUNNER = "off"

[side_effects]
kind = "outbound"
restore_via_app = true
after_restore = "held"
clear_hold = "outbound-resume"
single_active = true                          # Planned M4: never two queues on one data lineage
restore_notice = "Outbound delivery is paused (reason: restored) and queued sends are held. List them with `ingat task {instance} outbound-held`, check the mailbox, then use outbound-release-job / outbound-release-all / outbound-drop-job, check `ingat task {instance} outbound-status`, and finally run outbound-resume."

# ---------------------------------------------------------------- tasks (all `run`: a second SQLite process is safe under WAL)
# The image has no ENTRYPOINT, so a task argv replaces the service command and starts with the program.
# The exit map of each task follows its command in src/server/cli.ts (documented in docs/11_OPERATIONS_RUNBOOK.md).
[tasks.migrate]
service = "timesheet"
mode = "run"
image = "candidate"
argv = ["node", "dist/server/cli.js", "migrate"]
effect = "data"
idempotent = true                             # exclusive lock, one transaction; a re-run applies nothing
exit = { 0 = "ok" }                           # any other exit is unknown (data effect)
operator = false
timeout = "15m"

[tasks.backup]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "backup", "--to", "/out"]
mounts = { "/out" = "stage" }                 # outside the data directory, as the command requires
effect = "app-write"                          # records its outcome in the app's own operations_state; scratch as a backup step
idempotent = true                             # required for a non-read backup task; a redo writes into a fresh stage
stdout = "json"
exit = { 0 = "ok", 1 = "failed", 2 = "refused" }
operator = false                              # it mounts the stage, which exists only inside a backup
timeout = "60m"

[tasks.restore]                               # runs only in the isolated project: internal network, read-only root
service = "timesheet"
mode = "run"
image = "bundle"
argv = ["node", "dist/server/cli.js", "restore", "--from", "/in/{bundle.payload}", "--to", "/restore"]
mounts = { "/in" = "bundle", "/restore" = "generation:data" }
effect = "data"
exit = { 0 = "ok", 1 = "failed", 2 = "refused" }
operator = false
timeout = "60m"

[tasks.bootstrap-config]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "bootstrap", "--config", "/in/{input.config}"]
mounts = { "/in" = "input:config" }
max_input_bytes = 262144                      # the command's own 256 KiB limit
stdout = "terminal"                           # prints the single-use setup token; never recorded
effect = "app-write"
exit = { 0 = "ok", 1 = "refused", 2 = "refused" }
timeout = "5m"

[tasks.bootstrap-new-token]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "bootstrap", "--new-token"]
stdout = "terminal"
effect = "app-write"
exit = { 0 = "ok", 1 = "refused", 2 = "refused" }
timeout = "2m"

# Outbound reconciliation after a restore. The preview (no --confirm) prints JSON with outcome "confirmation_required"
# and exits 2; it also runs the app's migration first and exits 2 for a usage error, so the preview tasks are app-write
# and idempotent, and `expect` tells a preview from a usage error. The confirm commands (--confirm last) are separate tasks.
[tasks.outbound-held]                         # lists held jobs: ids, kinds, attempts, blockers; no person
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "release"]
effect = "app-write"
idempotent = true
stdout = "record"
expect = { json = { outcome = "confirmation_required" } }
exit = { 2 = "ok" }
timeout = "2m"

[tasks.outbound-status]                       # the pause and the counts `outbound-resume` would release
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "resume"]
effect = "app-write"
idempotent = true
stdout = "record"
expect = { json = { outcome = "confirmation_required" } }
exit = { 2 = "ok" }
timeout = "2m"

[tasks.outbound-release-job]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "release", "--job", "{arg.job}", "--confirm"]
args = { job = '^[A-Za-z0-9-]{1,64}$' }
effect = "app-write"
stdout = "record"
exit = { 0 = "ok", 1 = "refused" }
timeout = "2m"

[tasks.outbound-release-all]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "release", "--all", "--confirm"]
effect = "app-write"
stdout = "record"
exit = { 0 = "ok", 1 = "refused" }
timeout = "2m"

[tasks.outbound-drop-job]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "drop", "--job", "{arg.job}", "--confirm"]
args = { job = '^[A-Za-z0-9-]{1,64}$' }
effect = "app-write"
stdout = "record"
exit = { 0 = "ok", 1 = "refused" }
timeout = "2m"

[tasks.outbound-resume]
service = "timesheet"
mode = "run"
argv = ["node", "dist/server/cli.js", "outbound", "resume", "--confirm"]
clears_hold = true
effect = "app-write"
stdout = "record"
exit = { 0 = "ok", 1 = "refused" }            # 1: a delivery attempt still awaits its decision
timeout = "2m"
```

### Mapping to MANIFEST_SPEC §2 and ARCHITECTURE §11.3

| Spec item | Where in the proposal |
|---|---|
| §2.1 top level, `[source]`, `[compose]` (`files`, `build_services`, `expect_labels` with `{commit}`) | lines 1-19 of the file; `build_files` / `build_env` deliberately absent (unused, B row 4) |
| §2.2 `[params]` | `TIMESHEET_IMAGE` (template, GHCR name), `TIMESHEET_ENV_FILE`, `TIMESHEET_DATA_DIR`, `TIMESHEET_PORT`. **CPU limit:** `compose.example.yaml` has no `cpus` and no memory limit, so there is no param to default; nothing in the manifest can make Compose send a non-zero `cpus` to the target host (no CFS quota). If a limit is ever added it must be an `optional` param whose unset state sends nothing (ARCHITECTURE §11.3 item 1; §9.5 capability refusal) |
| §2.3 `[app_env]`, secrets | `SMTP_USER`, `SMTP_PASSWORD` are `secret = true` env-file secrets (ARCHITECTURE §9.4); there are no `[secrets.*]` and no generated values because the app has no session secret (`.env.example` header). No secret is needed in the first test instance (real sending is an owner-gated, M2+ change) |
| §2.4 `[stores]`, `[services]` | one bind store `data`, one writer |
| §2.5 `[schema]` | probe-based, `migrates_on_start = true` |
| §2.6 activation, smoke, install, deploy | `[[activate]]`, two `[[smoke]]`, three `[[install]]` steps, `[deploy] migrate` |
| §2.7 backup, restore, rollback, drill, holds, side effects | all present; `verify = []` |
| §4 tasks, §5 probes | 11 tasks, 2 probes |
| §11.3 item 1 Compose files | stable service name `timesheet`; loopback port from a `port` param; no named volumes; no `container_name`, host network, privileged, devices or socket; no `start_interval` |
| item 2 data commands | `backup`, `restore`, `migrate` exist; the schema read is the readiness JSON; **`verify` does not exist** (gap, recommended only) |
| item 3 exit-code contract | cli.ts header and docs/11 §4, §6, §7; the `exit` maps encode it |
| item 4 readiness | `/api/ready` (schema current and data directory writable); no separate data service, so no TCP store probe |
| item 5 secrets and side effects | env secrets only for SMTP; `OUTBOUND_MODE` / `PRODUCTION_SENDING_ENABLED` owner-gated; holds; pause after restore |
| item 6 images | T8 (E); S15 canary (G) |
| item 7 `ingat.toml` + `validate` on a pinned digest | T0 (F) |
| item 8 host values outside the repository | none present; ports, URLs, addresses and paths go to `instance.toml` on the host |

## D. Compose

- **File Ingat uses:** the existing `compose.example.yaml`, unchanged, listed in `[compose] files`. Proof: the pinned
  `ingat validate` passes on the proposal with this file (including the isolated-model policy: read-only root, loopback
  port from a `port` param, no named volume). Ingat's override replaces `build: .` with a reset and pins the image by ID
  with `pull_policy: never` (`adapters/override.py:70-74`), so the `build:` key and the
  `${TIMESHEET_IMAGE:-timesheet:local}` default stay harmless for Ingat while the runbook's
  `docker compose up --build` keeps working for its current readers (docs/11 §1, `scripts/container-drill.mjs:110`).
- **Changes needed:** none. Specifically: image comes from the manifest param (`TIMESHEET_IMAGE` renders the GHCR
  reference; Ingat pins the pulled image by ID and records the repository digest); volumes already cover the data
  paths (`/data` carries the database and `private-data`); there is no network and therefore no fixed subnet; there
  is no `cpus` or memory limit, so no default CPU limit exists to remove and none may be added without an `optional`
  param.
- **Not in scope, recorded for later:** the fixed-subnet runtime Compose file (a separate Ingat item, needed before
  `TRUSTED_PROXY_ADDRESSES` can be stable across a network recreate; M1 form sets it after the first install and
  survives only while the default network is not recreated). When it is added, `log_snapshot` and a `subnet` param
  return with it and this file's `files` entry changes in the same change.

## E. T8 design: image workflow (`.github/workflows/image.yml`)

Exact text (byte-identical copy: `evidence/INGAT-T0T8-PLAN/proposed-image.yml.txt`):

```yaml
# Builds the application image for linux/amd64 on every commit to main and publishes it to GHCR, tagged by the full
# commit SHA. Ingat pulls ghcr.io/cdsemi/timesheet:<commit> and accepts it only when the revision label equals that
# commit (ingat.toml: compose.expect_labels). A tag that already exists is never rebuilt or moved. Provenance and SBOM
# attestations are off, so the tag names one plain image manifest.
name: image

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    permissions:
      contents: read
      packages: write # the image push to ghcr.io
    env:
      IMAGE: ghcr.io/cdsemi/timesheet
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      # BuildKit is pinned by digest (the same pin as the Ingat repository's own workflows).
      - uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1
        with:
          driver-opts: image=moby/buildkit:v0.33.1@sha256:cec9f139f45e93c5c69c60f8b07cfad9f43f4ef6b6a6cd917527fea5ff2e3dea
      - uses: docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4.6.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: build, push and check the image
        run: |
          version=$(sed -n 's/^  "version": "\([0-9][0-9.]*\)",$/\1/p' package.json)
          test -n "$version"
          if docker buildx imagetools inspect --raw "$IMAGE:$GITHUB_SHA" > "$RUNNER_TEMP/manifest.json" 2> "$RUNNER_TEMP/inspect.err"; then
            echo "$IMAGE:$GITHUB_SHA is already published: it is not rebuilt or moved"
          elif grep -q 'not found' "$RUNNER_TEMP/inspect.err"; then
            docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
              --label "org.opencontainers.image.version=$version" \
              --label "org.opencontainers.image.revision=$GITHUB_SHA" \
              --label "org.opencontainers.image.source=$GITHUB_SERVER_URL/$GITHUB_REPOSITORY" \
              --tag "$IMAGE:$GITHUB_SHA" --push .
            docker buildx imagetools inspect --raw "$IMAGE:$GITHUB_SHA" > "$RUNNER_TEMP/manifest.json"
          else
            cat "$RUNNER_TEMP/inspect.err" >&2
            exit 1
          fi
          digest="sha256:$(sha256sum "$RUNNER_TEMP/manifest.json" | cut -d' ' -f1)"
          docker pull --quiet "$IMAGE@$digest"
          got=$(docker image inspect --format '{{.Os}}/{{.Architecture}} {{.Config.User}} {{index .Config.Labels "org.opencontainers.image.revision"}} {{index .Config.Labels "org.opencontainers.image.version"}}' "$IMAGE@$digest")
          want="linux/amd64 10001:10001 $GITHUB_SHA $version"
          [ "$got" = "$want" ] || { echo "the published image does not match: got [$got], want [$want]" >&2; exit 1; }
          {
            echo "### Application image"
            echo
            echo "- Tag: \`$IMAGE:$GITHUB_SHA\`"
            echo "- Digest: \`$IMAGE@$digest\`"
            echo "- Version label: \`$version\`"
          } >> "$GITHUB_STEP_SUMMARY"
          echo "$IMAGE@$digest"
```

Design decisions and their evidence:

| Topic | Decision | Basis |
|---|---|---|
| File name | `.github/workflows/image.yml`, one job `publish` | the repository has no `.github` yet (`git ls-files .github` empty) |
| Trigger | `push` to `main` only | `git.release_declared` is false and commits go to `main` (owner standing rule); a "release commit" is therefore every commit on `main`. No path filter: Ingat deploys an exact commit, so a docs-only commit must also have an image. No `pull_request` trigger: the job needs `packages: write` and a PR build adds nothing the local gate does not prove. No `concurrency` group: a group would drop intermediate pending runs and leave commits without an image. When the first release tag exists, revisit (tag trigger, `release = "tag"` in the manifest) |
| Steps | checkout, buildx (BuildKit pinned by digest), login, one script step (look up, build only if "not found", verify, print) | mirrors the Ingat repository's own `release.yml`; no extra action (no `build-push-action`, no `metadata-action`) |
| Action pins | `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1` v7.0.1; `docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069` v4.4.1; `docker/login-action@dbcb813823bdd20940b903addbd779551569679f` v4.6.0 | taken from the Ingat workflows (`ci.yml:33,86`, `release.yml:38,80,83`) and re-verified: `git ls-remote https://github.com/actions/checkout.git refs/tags/v7.0.1` -> 3d3c42e5…; `…docker/setup-buildx-action.git refs/tags/v4.4.1` -> f87e5991…; `…docker/login-action.git refs/tags/v4.6.0` -> dbcb8138… (`lsremote-actions.txt`; lightweight tags, so the tag SHA is the commit SHA) |
| Permissions | top level `contents: read`; the single job adds `packages: write` | least privilege; no other job exists. `persist-credentials: false` so the checkout token is not left in `.git` |
| Image name and tag | `ghcr.io/cdsemi/timesheet:<full 40-hex commit>` | ADR-0026 (`{commit}` in a `template` param); no `latest`, no short SHA, no moving tag. Matches `TIMESHEET_IMAGE` in `ingat.toml` |
| Immutability | an existing tag is never rebuilt or moved; any lookup error other than "not found" fails the job | a re-run must not change the bytes behind a tag Ingat may already have pinned. `imagetools inspect --raw` on a missing tag exits 1 with `not found` (observed on another GHCR tag, `raw-test.txt`); the exact wording for a never-published package is **to check on the first run** (a different message fails closed, nothing is pushed) |
| Labels | `org.opencontainers.image.revision` = `$GITHUB_SHA` (full commit); `org.opencontainers.image.version` = `package.json` `version` (now `0.1.0`); `org.opencontainers.image.source` = `https://github.com/CDSemi/timesheet` | revision is what `expect_labels` binds (`{commit}`); version is informational (single source: package.json:3); `source` links the package to the repository (GitHub docs, `ghcr-working-excerpt.txt`). Set with `--label` at build time, so the Dockerfile and the local build path are unchanged. Only the revision can be bound: with `release = "commit"`, `{release}` equals the commit, so a semver `version` cannot be an `expect_labels` value |
| Platform | `--platform linux/amd64` only | the target host is x86-64; no QEMU; Ingat's arm64 lane is irrelevant here |
| Attestations | `--provenance=false --sbom=false` | **Any attestation makes the pushed tag an OCI index (image manifest + attestation manifest); buildx adds a minimal provenance attestation by default when it pushes (general buildx behaviour, not run here, which is why the flags are explicit).** Ingat's own image is such an index: `docker buildx imagetools inspect ghcr.io/lisahq/ingat:0.1.0` lists two `unknown/unknown` attestation manifests (`imagetools` output reproduced in the task folder). Ingat handles either shape: it pulls the reference, inspects the pulled image's `Config.Labels` and `Id`, and records the `RepoDigests` entry of that repository (`core/steps.py:286-312`), so `expect_labels` and the pin work for an index or a single manifest. The only open question is whether Engine 24 on the target host pulls an index with attestation manifests cleanly; that is unverified, and nothing consumes the attestations today, so the first version turns them off. Turning them on later is a one-flag change |
| Digest output | the script computes the manifest digest as `sha256` of `imagetools inspect --raw` (equals the tag's digest: verified on the Ingat image, `raw-test.txt`), pulls `IMAGE@digest`, checks `linux/amd64`, `Config.User = 10001:10001` (what Ingat's `task_uid` reads), both labels, then prints `ghcr.io/cdsemi/timesheet@sha256:…` and writes it to the job summary. `--format '{{.Manifest.Digest}}'` does **not** work in the current buildx (prints the default text): do not use it |
| Build cache | none | simplest; each push builds from the pinned base. A GHA cache can be added later; not needed for a single-user project |
| Cleanup | none in this change | every `main` commit adds a GHCR package version (public package storage is free); a retention job is a later, separate decision |

## F. T0 design: `ingat validate` job (`.github/workflows/ingat-validate.yml`)

Exact text (byte-identical copy: `evidence/INGAT-T0T8-PLAN/proposed-ingat-validate.yml.txt`):

```yaml
# Validates ingat.toml with the public Ingat tool image, pinned by digest. The check is offline and read-only: it never
# touches a Docker daemon of the runner beyond starting this one container, and it changes nothing.
name: ingat-validate

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    env:
      # ghcr.io/lisahq/ingat:0.1.0 pinned by digest. Bump the digest and this comment together, after reading the
      # Ingat release notes (manifest keys can change before schema 1 is frozen).
      INGAT_IMAGE: ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - name: ingat validate
        run: |
          docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges \
            --user "$(id -u):$(id -g)" --volume "$GITHUB_WORKSPACE:/app:ro" \
            "$INGAT_IMAGE" validate /app
```

- **Image:** `ghcr.io/lisahq/ingat:0.1.0` = `sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`
  (pulled anonymously, exit 0; it is an index with `linux/amd64` and `linux/arm64`; its labels give version `0.1.0`
  and revision `9e531a015d3e25ae9230e3add5de7ee13a5ba609`, `ingat-inspect.txt`). The ENTRYPOINT is
  `python3 -I -m ingat`, so the arguments after the image are the Ingat command.
- **What `validate` needs:** a repository directory holding `ingat.toml` and every Compose file named in
  `compose.files`; nothing else. It runs offline (`--network none` works), needs no Docker socket and no environment
  (the bundled Compose renders client-side; undeclared params with no default get sample values:
  `ops/validate.py:41-67`), and writes nothing (`--read-only` and a `:ro` mount work; a non-root uid works). It reads
  `[params]`, the Compose model and every task; an instance file is optional (`--instance <file>`) and is not part of the
  repository.
- **Exit codes:** 0 valid; 1 invalid app (messages one per line); 2 usage (for example the directory does not exist)
  (`validate-*.txt`). The job fails on any non-zero exit.
- **Triggers:** `push` to `main` and `pull_request`; `permissions: contents: read`. No secrets, no write scopes.
- **Limit that matters:** `validate` does not run Ingat's `supported()` check, so features a given Ingat release cannot
  yet run (such as `log_snapshot` in 0.1.0) pass CI and fail at `init`/`deploy` (`validate-draft-pre-t1-b.txt`). The
  header comment of `ingat.toml` says so; bumping the pinned image is the moment to revisit it.
- **Why the lockdown flags:** the job runs a third-party image on a runner that holds this repository's checkout; the flags
  cost nothing (tested: `validate-locked-down.txt`) and remove network, writes and capabilities.

## G. S15 finding: Node.js on a Linux 4.4 kernel

Observations (evidence in the folder):

- The image runs **Node.js v24.21.0** (x64) on **glibc** (Debian 13, runtime glibc 2.41, Node compiled against glibc
  2.28): `probe-node-image.txt`, Dockerfile:3-11.
- Official support, Node.js 24 line, `BUILDING.md` (v24.x branch and tag v24.21.0 read; the platform table is the same
  in both): GNU/Linux x64 with glibc is **Tier 1 at "kernel >= 4.18, glibc >= 2.28"**; the footnote reads "Older kernel
  versions may work. However, official Node.js release binaries are built on RHEL 8 systems with kernel 4.18."
  The only x64 row with a lower kernel is musl, "kernel >= 3.10, musl >= 1.1.19", marked **Experimental**; the image is
  glibc, so it does not apply to it (`node-v24.x-BUILDING-excerpt.txt`, `node-v24.21.0-BUILDING-excerpt.txt`; source
  `https://raw.githubusercontent.com/nodejs/node/v24.x/BUILDING.md`).
- The ELF "ABI tag" of the `node` binary and of `libc.so.6` in the image both say **kernel >= 3.2.0** (read from the
  GNU ABI-tag note by `probe.mjs`; this is the loader's refusal threshold, not a support statement).

Answer to "does the Node.js release line support a 4.4 kernel": **Official support: no.** 4.4 is below the 4.18 floor of
Tier 1, and the project says only that older kernels "may work". **Practical risk: unknown, not high on the evidence
available, and unverified.** The loader will not refuse (ABI tag 3.2.0); what could fail is run-time use of system
calls or kernel behaviour newer than 4.4 (glibc 2.41 and libuv probe several newer calls such as `clone3`, `statx`,
`close_range`, `faccessat2` and fall back on `ENOSYS`; a container security profile that answers `EPERM` instead would
break such a fallback). That sentence is general knowledge, not something observed here. Nothing was run on a 4.4
kernel. I do not propose a runtime change: the Dockerfile already names `bookworm-slim` as its own fallback for a
different reason (Dockerfile:7-8), and any base change is the owner's decision after S15.

What Ingat's S15 spike must run on the target host (container-only, synthetic data, the image from T8 or a
`docker save` tarball loaded there; no build on the host; run exactly as Compose runs the service, so the default
seccomp profile, `--read-only`, `--cap-drop ALL`, `--security-opt no-new-privileges` and the `/tmp` tmpfs are all in
force). `<image>` is the T8 image, `<data>` a new empty host directory owned by 10001:10001 mode 0700:

```bash
uname -r; docker version --format '{{.Server.Version}}'                       # record kernel and Engine
RUN="docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /tmp:size=64m,mode=1777"
$RUN <image> node --version                                                    # 1. loader and runtime start
$RUN <image> node --input-type=module -e "const { default: D } = await import('better-sqlite3'); const d = new D(':memory:'); console.log(d.prepare('select sqlite_version() as v').get())"   # 2. native module loads
ENVS="-e NODE_ENV=production -e APP_ORIGINS=https://app.example.invalid -e PUBLIC_BASE_URL=https://app.example.invalid -e MAIL_FROM=app@example.invalid"
$RUN $ENVS -v <data>:/data <image> node dist/server/cli.js migrate             # 3. WAL on the bind mount; exit 0, JSON with applied/version
# 4. start the server in the foreground-style container, ask readiness from a second container, stop it with SIGTERM:
docker run -d --rm --name s15 --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /tmp:size=64m,mode=1777 $ENVS -v <data>:/data <image>
docker exec s15 node -e "fetch('http://127.0.0.1:3000/api/ready').then(async r=>{console.log(r.status, await r.text());process.exit(r.ok?0:1)})"   # expect 200 {"status":"ready",...}
$RUN $ENVS -v <data>:/data -v <bootstrap-dir>:/in:ro <image> node dist/server/cli.js bootstrap --config /in/bootstrap.json    # 5. synthetic calendar file (reference/examples)
$RUN $ENVS -v <data>:/data -v <out>:/out <image> node dist/server/cli.js backup --to /out   # 6. online backup while the server runs; exit 0
docker stop s15                                                                # SIGTERM; the container must exit by itself
$RUN $ENVS -v <out>:/in:ro -v <restore>:/restore <image> node dist/server/cli.js restore --from /in/<backup-folder> --to /restore   # 7. isolated restore into an empty directory; exit 0
```

- Pass: every command exits 0 as stated, `/api/ready` answers 200, the restored directory holds `timesheet.db` and
  `private-data`. Any `Operation not permitted`, `ENOSYS`, `SIGILL`, `SIGSYS` or `Illegal instruction`, or a `better-sqlite3`
  load error, is an S15 failure for this image and is recorded with `uname -r`.
- Not covered by this list (and needing a synthetic submission through the HTTP API): PDF rendering and the mail
  capture. The repository's drill (`npm run drill:container`, `scripts/container-drill.mjs`) covers both but needs
  Node 24 and Docker on the machine that runs it, which the target host does not have; it can be pointed at a scratch
  daemon on a 4.4 host only by the owner.
- CPU level: a `SIGILL` at step 1 would point to a CPU baseline problem, not the kernel. The x86-64 level that the Node.js
  24 binary assumes was not checked here (to check).
- The implementation gate of J runs steps 1-3 and 5-7 of this list against the locally built image on the developer
  machine, only to prove that the commands themselves are right (the 4.4 result belongs to Ingat's spike on the host).

## H. Docs

New or changed documentation is small; the decisions it records are new (a registry and an external deployment tool),
so AGENTS.md ("no concept or dependency without an ADR and a named consumer need") asks for an ADR; the named consumer
is the owner's Ingat deployment (the Ingat session's M1 exit gate).

1. **New** `docs/adr/0002-ingat-manifest-and-ghcr-image.md` and its `.vi.md` (the same shape as ADR 0001): context
   (owner wants the app deployed and updated by Ingat on a kernel-4.4 host; Ingat never builds images, ADR-0026 of the
   Ingat repository), decision (root `ingat.toml` validated in CI with a digest-pinned Ingat image; a workflow that
   publishes `ghcr.io/cdsemi/timesheet:<commit>` for `linux/amd64` with the OCI version, revision and source labels;
   no attestations; Compose example unchanged), consequences (a package version per `main` commit; the first public
   package is irreversible; Ingat 0.1.x cannot run `log_snapshot`; S15 is open), alternatives (build on the host;
   attestations on; a PR build job).
2. **`docs/07_DEPLOYMENT_AND_OPERATIONS.md`** and `.vi.md`, one paragraph after the "Verify actual NAS CPU architecture"
   paragraph of "Initial deployment": "Ingat, the owner's deployment tool, installs and updates the app from the
   `ingat.toml` at the repository root; `.github/workflows/ingat-validate.yml` checks it on every push with a
   digest-pinned Ingat image. `.github/workflows/image.yml` builds the image for linux/amd64 on every commit to `main`
   and publishes `ghcr.io/cdsemi/timesheet:<commit>` with the OCI version, revision and source labels; Ingat accepts the
   pulled image only when its revision label equals the commit. Nothing here has run on the NAS (ADR 0002). The Compose
   example and the build-from-export path stay valid."
3. **`docs/11_OPERATIONS_RUNBOOK.md`** and `.vi.md`, section 1 step 2: replace the sentence "No registry is used: build
   the image from a clean export of the release commit placed in `<project-dir>`." with "Without Ingat, build the image
   from a clean export of the release commit placed in `<project-dir>`; the CI-published tag
   `ghcr.io/cdsemi/timesheet:<release-commit>` (docs/07) is what Ingat pulls and is not exercised by the drill." The line
   was true until now and would otherwise contradict T8. Keep the `[Drill stage 1]` label on the build part only.
4. No change to `docs/12_RELEASE_NOTES.md`, `README`, `DEVELOPMENT.md` or `.env.example`.
5. English is canonical; the worker adds the Vietnamese translations in the same change (`.vi.md`), keeping the
   English/Vietnamese pair aligned (AGENTS.md operating contract).

## I. Owner steps on GitHub (nothing was changed or read with credentials; V = verified with a source, C = to check)

| # | Step | Status |
|---|---|---|
| 1 | The repository is public and owned by the organization `CDSemi` (default branch `main`) | V: `repo-api-summary.txt` (unauthenticated API read) |
| 2 | Actions are enabled for the repository and the organization allows `actions/*` and `docker/*` actions (the workflows use only those, each by full SHA) | C: needs repository admin (Settings, Actions, General); an organization allow-list or "selected actions" policy can block them |
| 3 | Workflow permissions: the workflows declare `permissions` themselves, so the repository default (read-only or read/write) does not need to change; `packages: write` is requested only in the `publish` job | C: confirm the organization does not forbid elevating `GITHUB_TOKEN` (Settings, Actions, General, Workflow permissions) |
| 4 | The first push by the workflow creates the package `ghcr.io/cdsemi/timesheet`, **private** by default | V: GitHub docs, `pkg-access-visibility-excerpt.txt` ("When you first publish a package, the default visibility is private") |
| 5 | Making it **public** (Package settings, Danger Zone, Change visibility) is needed so the target host can pull anonymously; it cannot be undone | V: same excerpt ("Once you make a package public, you cannot make it private again"). C: the organization must allow public packages (Organization settings, Packages, Package creation) |
| 6 | Linking the package to the repository: publishing from a workflow in this repository with `GITHUB_TOKEN` links it automatically, and the `org.opencontainers.image.source` label does the same for a push by other means | V: `ghcr-working-excerpt.txt` |
| 7 | Caveat to rule out before the first run: if a package named `cdsemi/timesheet` was already pushed by hand and is not linked to the repository, `GITHUB_TOKEN` cannot push to it; then give the repository "Manage Actions access" to that package | V: `ghcr-working-excerpt.txt`, `pkg-access-actions-excerpt.txt`. C: whether such a package exists (an anonymous token request for it is denied, which fits both "absent" and "private": `ghcr-anonymous-token-*.txt`) |
| 8 | Organization setting "Inherit access from source repository" for new packages (default on) decides whether repository permissions apply to the package | V: documented default (`pkg-access.md` lines 95-104 in the task folder). C: current organization setting |
| 9 | After the first successful run: pull the digest anonymously from a machine that is not logged in (`docker logout ghcr.io; docker pull ghcr.io/cdsemi/timesheet@<digest>`) and read the two labels with `docker image inspect` | C: owner step; also the proof that step 5 worked |
| 10 | Branch protection or required checks for the two new workflows, if wanted | C: optional; the workflows are not set as required checks by this change |

## J. Implementation task (for one worker; to be registered by the coordinator as INGAT-T0T8-IMPL after this plan is accepted)

- **Kind, size, risk:** implement; size S-M; risk M (public repository, CI that cannot be proven on GitHub before the
  owner pushes, new external dependency pinned by digest). Suggested profile: timesheet-worker, effort medium; then
  INGAT-T0T8-GATE (verifier) and a fresh INGAT-T0T8-AUDIT (auditor who did not author it). Dependency: this plan accepted.
- **Owned paths (create or edit only these):**
  - `ingat.toml` (new, root)
  - `.github/workflows/ingat-validate.yml` (new)
  - `.github/workflows/image.yml` (new)
  - `docs/adr/0002-ingat-manifest-and-ghcr-image.md` and `docs/adr/0002-ingat-manifest-and-ghcr-image.vi.md` (new)
  - `docs/07_DEPLOYMENT_AND_OPERATIONS.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md` (one paragraph each)
  - `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md` (section 1 step 2 only)
  - the IMPL brief's Results and `handoff/delivery/evidence/INGAT-T0T8-IMPL/`; task folder `D:\.claude-tmp\timesheet\INGAT-T0T8-IMPL`
  - **Not owned (must stay byte-identical):** `Dockerfile`, `.dockerignore`, `compose.example.yaml`, `package.json`,
    `package-lock.json`, `src/**`, `scripts/**`, `tests/**`, every other doc, `ORCHESTRATION.json`, STATE, NEXT_ACTION.
- **Acceptance criteria:**
  1. `ingat.toml`, `ingat-validate.yml` and `image.yml` are exactly the texts of C, F and E (LF line endings; the copies
     in `evidence/INGAT-T0T8-PLAN/proposed-*.txt` are the source of truth). A deviation needs a recorded reason.
  2. `git diff --stat` and `git status --short` show only the owned paths; `compose.example.yaml` and the Dockerfile are untouched.
  3. Every gate command below passes and its output is saved in the evidence folder.
  4. Every `uses:` is a 40-hex SHA with a `# vX.Y.Z` comment; no `uses:` of a local or moving reference.
  5. No host value in any changed file: no real port, subnet, host name, URL other than `github.com/CDSemi/timesheet`,
     `ghcr.io/cdsemi/timesheet`, `ghcr.io/lisahq/ingat`; no path of the target host; no e-mail address; no secret.
  6. The docs and the ADR say that nothing ran on the NAS and that the workflows have not run on GitHub until the owner
     pushes; the IMPL Results must not claim a successful GitHub run, a published image or a working S15.
  7. The Vietnamese files are aligned with the English ones (same headings, same facts).
- **Gate commands** (Git Bash on Windows; `REPO` = the worktree; `TASK` = the task folder):

```bash
export MSYS_NO_PATHCONV=1
export TEMP="$TASK/tmp" TMP="$TASK/tmp"
export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"
PY="$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"
INGAT=ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb
AL=rhysd/actionlint@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667   # actionlint 1.7.12 (index digest)

# G1 ingat validate, exactly the job's command (expect exit 0)
docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user 1001:1001 \
  --volume "$(cygpath -w "$REPO"):/app:ro" "$INGAT" validate /app
# G1n negative control on a copy in $TASK/neg without expect_labels (edit the copy with the Edit tool): expect exit 1
# G2 every uses: pinned by a 40-hex SHA with a version comment (script = evidence/.../check-workflows.py.txt copied to $TASK/check-workflows.py; expect exit 0)
"$PY" -I "$TASK/check-workflows.py" "$REPO/.github/workflows"
# G3 workflow syntax and schema (YAML parse, expressions, shellcheck of the run blocks; expect exit 0)
docker run --rm --read-only --network none -v "$(cygpath -w "$REPO"):/repo:ro" -w /repo "$AL" \
  .github/workflows/image.yml .github/workflows/ingat-validate.yml
# G4 local linux/amd64 build with the two labels (+ source) and inspect (same flags as the workflow; --load instead of --push)
cd "$REPO"
SHA=$(git rev-parse HEAD)
VER=$(sed -n 's/^  "version": "\([0-9][0-9.]*\)",$/\1/p' package.json)
docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
  --label "org.opencontainers.image.version=$VER" --label "org.opencontainers.image.revision=$SHA" \
  --label "org.opencontainers.image.source=https://github.com/CDSemi/timesheet" \
  --tag ingat-t0t8-gate:local --load .
docker image inspect --format '{{.Os}}/{{.Architecture}} {{.Config.User}} {{index .Config.Labels "org.opencontainers.image.revision"}} {{index .Config.Labels "org.opencontainers.image.version"}} {{index .Config.Labels "org.opencontainers.image.source"}}' ingat-t0t8-gate:local
#     expect: linux/amd64 10001:10001 <SHA> 0.1.0 https://github.com/CDSemi/timesheet
# G5 the S15 command list of G steps 1-3 and 5-7 against ingat-t0t8-gate:local (only proves the commands; synthetic data; every container --rm)
# G6 privacy: a scratch repository holding only the changed files, then the repository's own staged-set gate and a marker grep
mkdir -p "$TASK/scratch" && cd "$TASK/scratch" && git init -q . && cp -r <changed files with their paths> . && git add -A \
  && node "$REPO/scripts/precommit-check.mjs"                                  # expect PASS, 0 blocking findings
grep -rnE '(^|[^0-9])(10|192\.168|172\.(1[6-9]|2[0-9]|3[01]))\.[0-9]+\.[0-9]+|/volume[0-9]|\.local\b|\.lan\b|@[a-z0-9-]+\.[a-z]' <changed files>   # expect only reviewed, justified hits (none expected)
# G7 repository checks that apply: the privacy gate's own self-test and the source digest
cd "$REPO" && node scripts/precommit-check.mjs --self-test && node scripts/source-digest.mjs
# G8 scope: nothing else changed
git status --short; git diff --stat
```

  Optional G9 (needs a detached `--rm` registry container stopped with `docker stop`; skip if the runtime rules of the
  worker forbid it): push the same build to a throw-away local registry (`registry:3` by digest
  `sha256:01cd312e67026f06f5d89c3e133a4a9adc7cb9eeb9b1194e0b2954dfd770efd2`) from a `docker-container` builder with
  `--driver-opt network=host`, then run the workflow's lookup/digest/verify script lines against
  `localhost:<port>/timesheet:<sha>` to prove the `not found` branch, the digest computation and the label check.
  Report it as optional evidence; the plan did not run it.
- **Evidence the worker must not invent:** state plainly that the GitHub runs, the GHCR push, the package visibility and
  S15 are untested; list them as "owner steps" (I) and "Ingat spike" (G).
- **Checkpoint:** the worker saves its Results after each coherent step and ends with `Status: done`.

## K. Base drift

`git log --oneline HEAD..main` is empty and `git diff --stat HEAD main` (whole tree and the paths of A: Dockerfile,
`.dockerignore`, `compose.example.yaml`, package files, `.npmrc`, `.nvmrc`, docs 07 and 11 with their translations,
`src/server`, `scripts`, `.github`, `ingat.toml`) is empty: HEAD, local `main` and `refs/heads/main` on the remote are
all `2bce0ab5842b80c710f23496d5173c122319e5c7` (`base-drift.txt`, `base-drift-origin.txt`, `lsremote-main.txt`). Nothing on
`main` affects the manifest. Re-run both commands (and `git ls-remote` of `main`) when the worker starts, because the
main-checkout coordinator keeps committing.

## L. Owner questions

None blocks a correct implementation. Defaults taken in this plan (each reversible, none changes business behaviour):

1. Publish an image for **every** commit on `main` (needed because Ingat deploys an exact commit); no path filter.
2. Attestations (provenance, SBOM) **off** in the first version (target Engine 24 pull behaviour with attestation
   manifests is unverified); one flag turns them on later.
3. `org.opencontainers.image.version` = `package.json` version (`0.1.0`); only the revision label is bound by Ingat.
4. Reuse `compose.example.yaml` unchanged; a runtime Compose file (and the fixed subnet) is the later Ingat item.
5. Add ADR 0002 (AGENTS.md requires one for a new dependency and registry).
6. `min_free_memory = "512m"` is an unmeasured guess carried from the draft; the owner or the first drill sets the real value.

Facts the owner should know, no decision needed: in Ingat 0.1.x real sending cannot be enabled through Ingat (a changed
owner-gated key is refused, `ops/deploy.py:471-479`), so the first test instance runs in capture mode; the draft's
`verify` gap (no read-only verify command in the app) remains; S15 is unresolved and is the only item that could force a
runtime decision.

Status: done
