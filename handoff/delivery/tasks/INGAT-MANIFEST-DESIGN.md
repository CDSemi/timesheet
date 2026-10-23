# INGAT-MANIFEST-DESIGN dispatch brief (design review of the Ingat manifest format, using this app as the case)

- **Task.** Side track "Ingat deployability", task INGAT-MANIFEST-DESIGN, kind plan (design
  review; no source change), attempt 1, no task dependency. Runs in the main checkout
  `D:\Dropbox\Work.CDSemi\timesheet`. Not on `ORCHESTRATION.json` (track convention; recorded
  in `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model opus; model_override_reason `novelty` (the first review of a configuration format's
  design in this repository: judgment across several comparable tools, no in-repo pattern).
  Routing: size M, risk M (the subject is the backup/restore/outbound manifest, but this task
  changes no source and no manifest), novelty yes. docs/08 row "Plan/diagnose a bounded
  issue", model raised for novelty.
- **What this is not.** INGAT-TOML-AUDIT (done, `handoff/delivery/INGAT_TOML_REVIEW.md`)
  already checked that `ingat.toml` matches this app's code and Ingat 0.1.0's defaults. Do
  not repeat that. This task judges the **design of the manifest format itself**, as Ingat's
  MANIFEST_SPEC defines it, with this app's `ingat.toml` as the worked example.

## The owner's question (verbatim, translated)

"I mean the design of the `ingat.toml` file, not a comparison with the current codebase. Is
the current design already the most optimal and easiest to use, or could it be designed
better and made easier to use? Also: what standard is `.toml`, is it easy to learn and is it
popular?"

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (planner part).
- This repository: `ingat.toml`; `handoff/delivery/INGAT_TOML_REVIEW.md` (facts you may
  reuse: schema 1 has no task defaults, the parser's defaults, which keys 0.1.0 reads;
  cite it, do not re-derive); `handoff/delivery/evidence/INGAT-TOML-AUDIT/key-table.txt`;
  `.github/workflows/ingat-validate.yml` (the pinned `validate` command); `compose.example.yaml`.
- Ingat (read-only; `D:\Dropbox\Work.LISA\LisaHQ\Ingat`; Glob if a path moved):
  `docs/app-developers/MANIFEST_SPEC.md` in full; `docs/design/ARCHITECTURE.md` (the
  manifest, Compose policy, onboarding checklist, the reasons behind holds, side effects,
  drills, generations); every ADR under `docs/design/adr/` that decides a manifest concept
  (Grep for `manifest`, `task`, `probe`, `hold`, `side_effect`, `schema`, `TOML`);
  `docs/design/ROADMAP.md` (what later milestones add to the manifest); the operator guide
  under `docs/guide/` and `README.md` (how an app developer is told to write a manifest;
  whether an `init`/scaffold command, a JSON Schema or editor support exists);
  `src/ingat/model/manifest.py` and `model/toml_read.py` (the parsed model: required keys,
  defaults, accepted values, error messages); `fixtures/` (every example manifest; sizes).
- Public comparables (read from memory, or `curl` public documentation into your task folder
  and cite the URL): Fly.io `fly.toml`; Kamal `config/deploy.yml`; Docker Compose (healthcheck,
  secrets, volumes, `depends_on` conditions); Nomad job specification (task, template,
  service checks); systemd unit files (defaults, `ExecStartPre`, `Restart=`); Heroku
  `Procfile`/`app.json` release phase; Render `render.yaml`; Cloud Native Buildpacks
  `project.toml`; `Cargo.toml` and `pyproject.toml` as TOML idiom. Use each only for the
  concern it expresses well (health checks, release commands, secrets, volumes, operator
  tasks, defaults, minimal form).
- You may read the owner's private draft (`_private/consumers/consumer-manifest-drafts.md`)
  only to see how a first-time author approached the format; copy none of its text or host
  values into any output.

## Deliverables (Results section below, plus the review pair and evidence)

A. **Minimal form, measured.** The smallest manifest Ingat 0.1.0 accepts for a one-container
   app with one bind store and one readiness route: write it in your task folder, run the
   pinned `ingat validate` on it (with a copy of `compose.example.yaml` or a minimal Compose
   file) until it passes, and report the number of tables, keys and lines a developer must
   write before the first green `validate`, and which of them a tool could have inferred.
   Then the same for the "operable" form (backup, restore, one operator task). Compare with
   the minimal `fly.toml` and Kamal configs (line and concept counts, with sources).
B. **Concept inventory.** Every distinct top-level table and every key a developer must
   learn (count them from MANIFEST_SPEC); group them by concern (identity, build/image,
   params, environment, stores, services, probes, lifecycle steps, backup/restore/rollback/
   drill, holds/side effects, tasks). For each group: is the vocabulary intuitive and
   consistent (for example `effect`, `stdout`, `image = "candidate" | "bundle"`,
   `operator`, `tool_managed`, `owner_gated`, `holds`, `side_effects`, `clears_hold`,
   `reopens_writes`, `online_backup`, `local_only`, `expect` versus `expected`, kebab task
   names versus snake_case keys)? Which concepts are front-loaded although a simple app never
   needs them?
C. **Repetition and composition.** Judge the design choices behind the repetition
   INGAT-TOML-AUDIT proved unavoidable in schema 1: no task defaults, no inheritance, `args`
   that only fill values, the argv prefix repeated per task, `probes` versus `smoke` versus
   `[[install]] wait`, `[[install]]`/`[[activate]]` as arrays of tables. For each: what a
   leaner design would look like (task defaults per service, a `cli` entry per service with
   `subcommand` tasks, named check references, a single lifecycle table), what it would save
   on this app's manifest, and what it would cost in explicitness or safety for a tool
   whose job is backup, restore and rollback.
D. **Structure and mental model.** The order and grouping of sections in MANIFEST_SPEC §2
   against the way a developer thinks (declare → run → operate) and the way an operator
   reads (what happens at install, deploy, backup, restore); whether lifecycle sections could
   sit under one table; whether the file reads top-down as a story.
E. **Errors and tooling.** Reproduce three or four wrong manifests (a missing required key, a
   misspelt key, a wrong enum value, a bad task reference) through the pinned `validate` and
   judge the messages: do they name the key path, the allowed values, the fix? Is there
   scaffolding (`init`), a JSON Schema, editor completion, a `--explain`? What comparable
   tools offer here.
F. **Format choice.** TOML against YAML, JSON, HCL, KDL and CUE for this kind of manifest:
   what TOML does well here (comments, types, literal strings for regexes, no indentation
   traps) and where it hurts (deep nesting, inline tables on one line, long strings, no
   references or anchors, no templating); whether the observed verbosity comes from TOML or
   from the schema; a short, sourced answer to "what is TOML, how easy to learn, how
   widespread" (spec version and date from toml.io; adopters such as Cargo, pyproject/PEP
   518 and 621, Python `tomllib` since 3.11, Hugo, Netlify, Fly.io, Buildpacks; name only
   adopters you can source).
G. **Proposals, prioritized.** P1 (clear win, low risk) / P2 (worth it, needs an Ingat
   decision) / P3 (taste). For each: the schema change; whether it is additive within schema
   1 or needs schema 2; backward compatibility; the effect on this app's manifest (rewrite
   `ingat.toml` in the proposed form in your task folder, keep it as evidence `.txt`, count
   lines and concepts; it will not validate against 0.1.0 and need not); the safety
   trade-off; which comparable tool does it this way. Mark each proposal as "Ingat-side
   change" (the owner decides in the Ingat project) or "possible today".
H. **Honest verdict.** Is the current design already near the optimum for its purpose, or
   not? What is verbose on purpose and should stay? What cannot be judged from one app?
   Six to ten plain sentences for the owner, first in the review.

## Rules

- Change no source, no manifest, no file in the Ingat repository (you write nothing there;
  never write this app's name into any file there). Everything you write goes to your owned
  paths.
- Privacy: the repository is public; no host values, no private draft text, no personal
  data; profile paths in evidence masked as `<user>`.
- Facts carry a source: `file:line` for repository and Ingat files, a URL for public
  documentation, "from memory, unverified" otherwise. Keep opinion and fact visibly apart.
- No claim that a proposal "works" unless you ran it; proposals that 0.1.0 cannot parse are
  design sketches and say so.

## Outputs

- `handoff/delivery/INGAT_MANIFEST_DESIGN_REVIEW.md` and `.vi.md` (human-facing: English
  canonical, Vietnamese translation; headings H, A..G in that order; tables where they help).
- This brief's Results (English); `handoff/delivery/evidence/INGAT-MANIFEST-DESIGN/` (the
  minimal manifests, validate outputs, the error probes, the rewritten manifest sketches,
  `commands.txt`); task folder `D:\.claude-tmp\timesheet\INGAT-MANIFEST-DESIGN` (raw logs,
  downloads, copies).

## Runtime

- Use Git Bash only. `export MSYS_NO_PATHCONV=1` for Docker mounts. Set TEMP and TMP inside
  the task folder. The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON ON THIS MACHINE (NO `node -e`, NO `python -c`,
  NO `node -`, NO `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`,
  NO PID KILLS, NO INTERACTIVE SHELLS (NO `docker run -it`), NO `sed -i` ON ANY REPOSITORY
  FILE.** Use the Write and Edit tools to create files; never write a file through the
  shell. Use Glob and Grep for searches. Redirect command output to files in the task folder
  and read them with Read.
- Docker: only `docker run --rm` of the pinned Ingat image
  `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`
  on copies in your task folder, in the CI job's form. No builds, no pushes, no ports, no
  `npm`, no tests. A verifier of the main mission may be running in this checkout: do not
  stop any process.
- Never run anything against the owner's NAS or any remote host other than public
  documentation reads. Do not stage, commit or push.
- If a permission check denies a call, stop and report. Do not retry the same action another
  way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the verdict (H) in two
sentences and the line counts of the minimal form, the operable form and the proposed
rewrite.

## Results

(planner appends here)

### Step 1 (2026-10-22): reading and setup

- Self-reported model: claude-opus-5-5 (timesheet-planner profile).
- Read from disk: AGENTS.md, docs/08 (planner rows), this brief, `ingat.toml` (HEAD `7aafa21`),
  `INGAT_TOML_REVIEW.md`, `evidence/INGAT-TOML-AUDIT/key-table.txt`, `ingat-validate.yml`,
  `compose.example.yaml`; Ingat (read-only) MANIFEST_SPEC.md in full, `model/manifest.py`, `model/toml_read.py`.
- Created the task folder `D:\.claude-tmp\timesheet\INGAT-MANIFEST-DESIGN` and the evidence folder. Nothing written in
  the Ingat repository.
- Next: ARCHITECTURE/ADR/ROADMAP/guide reading, then the validate measurements (A, E).

### Step 2 (2026-10-22): measurements (A, E) and downloads

- Read: ARCHITECTURE §11.3, ADR 0009, 0015, 0018, 0031, ADR index, ROADMAP guardrails/status, guide pages (no
  scaffold command, no JSON Schema, no editor support exist: Grep of README and `docs/guide/`; `cli/commands.py:409-519`
  lists every command).
- Pinned `ingat validate` (CI form, `validate.sh`) on task-folder copies: `min1` exit 1 (env_file and port refused by the
  Compose policy), `min2` exit 0 (26 lines), `min3` exit 0 (30 lines, adds the readiness probe), `operable` exit 0
  (72 lines). Error probes: `err-missing`, `err-typo`, `err-enum`, `err-taskref`, `err-syntax` all exit 1 with the
  messages kept in `results/validate-err-*.txt`.
- Traced, not run: `[backup] strategy` defaults to `"none"` (`model/manifest.py:213`), so a manifest with a bind store
  and no `[backup]` validates, but the first data-changing update is refused at plan time (`ops/deploy.py:232-234`) and
  `status` says the app "keeps no data" (`ops/status.py:498-499`).
- Counts (`scripts/count.py`, Python 3.12 `tomllib`): see `results/counts.txt`.
- Public docs fetched (29 pages, all HTTP 200, `downloads/fetch-log.txt`), converted to text in `text/`.

### Step 3 (2026-10-22): comparables and TOML facts extracted

- TOML: v1.0.0 published 2021-01-11 (toml.io/en/v1.0.0), v1.1.0 published 2025-12-18 (toml.io/en/v1.1.0; GitHub
  release 2025-12-24) and allows newlines and trailing commas in inline tables; Python `tomllib` added in 3.11 with
  TOML 1.0.0, TOML 1.1.0 from 3.15 (docs.python.org/3/library/tomllib.html). Ingat runs Python 3.13 (ADR-0004), and
  `err-syntax` (a two-line inline table) is refused, as TOML 1.0 requires.
- PEP 518 format rationale, PEP 680 adopters, Cargo `workspace = true` inheritance, Fly (`fly launch` generates
  fly.toml; JSON Schema in SchemaStore; `release_command`; `[[http_service.checks]]`; `[mounts]`), Kamal (`kamal init`,
  unknown keys refused, YAML anchors with `x-`, `aliases`, default healthcheck `/up`), Compose anchors/extensions,
  Nomad (check `interval` and `timeout` required), Heroku release phase, Render (`preDeployCommand`,
  `healthCheckPath`, disks), Buildpacks `project.toml`, Taplo/SchemaStore: extracted with line references in `text/`.
- The owner's private draft was not opened (optional by the brief; avoids any private text in outputs).

### Step 4 (2026-10-22): rewrite sketch, counts and evidence

- Proposed sketch `rewrite/ingat.toml` (= evidence `proposed-ingat.toml.txt`): 218 lines, 163 leaf keys, against 257
  and 205 today (-15% lines, -20% keys); the pinned validate refuses it as expected (exit 1: unknown `task_defaults`,
  `smoke[0].probe`, `install[1].activate`, the omitted required keys, and the `requires_ingat` bump).
- Format check: the same data as indented JSON is 509 lines, as block YAML 280 lines (comments lost); TOML 211
  content lines.
- Evidence written to `handoff/delivery/evidence/INGAT-MANIFEST-DESIGN/`: `commands.txt`, `validate-results.txt`,
  `counts.txt`, `comparables-min.txt`, `minimal-validate-ingat.toml.txt`, `minimal-ingat.toml.txt`,
  `operable-ingat.toml.txt`, `proposed-ingat.toml.txt`, `count.py.txt`, `convert.py.txt`; every copy equals its
  task-folder original (`cmp` exit 0).
- Next: the review pair `INGAT_MANIFEST_DESIGN_REVIEW.md` / `.vi.md`.

### Step 5 (2026-10-22): English review written

- `handoff/delivery/INGAT_MANIFEST_DESIGN_REVIEW.md` (headings H, A-G; facts sourced, opinions marked). Identity
  re-checked: `ingat.toml` SHA-256 `7bf274a8...`, unchanged against HEAD `7aafa21`; Ingat checkout `v0.1.0-16-g35be585`,
  clean (`commands.txt` step 0).
- Next: the Vietnamese translation, then the final Results.

### Final result (2026-10-22)

- Self-reported model: claude-opus-5-5 (timesheet-planner, effort high per profile).
- Outputs: `handoff/delivery/INGAT_MANIFEST_DESIGN_REVIEW.md` and `.vi.md` (H, A-G); evidence in
  `handoff/delivery/evidence/INGAT-MANIFEST-DESIGN/` (`commands.txt`, `validate-results.txt`, `counts.txt`,
  `comparables-min.txt`, `minimal-validate-ingat.toml.txt`, `minimal-ingat.toml.txt`, `operable-ingat.toml.txt`,
  `proposed-ingat.toml.txt`, `count.py.txt`, `convert.py.txt`); raw logs, downloads and variant folders in
  `D:\.claude-tmp\timesheet\INGAT-MANIFEST-DESIGN`.
- Verdict (H): the format is near the optimum for safe backup/restore/rollback/drill of Compose apps, but not the easiest
  to use; its length is mostly a deliberate safety contract plus this app's real surface, not TOML. Real gaps: the
  `[backup] strategy = "none"` default validates a data app green that the first update then refuses, no starter
  template/JSON Schema/did-you-mean, and transport repetition that task defaults would remove.
- Measured line counts: minimal form 26 lines (30 with the readiness probe), operable form 72, today's manifest 257,
  proposed rewrite sketch 218 (does not validate on 0.1.0, by design). TOML 211 content lines vs 280 YAML / 509 JSON.
- Commands and exits: pinned validate on 10 variants (min2, min3, operable exit 0; min1, five error probes and the
  rewrite exit 1 as intended); all evidence copies `cmp` exit 0; `ingat.toml` SHA-256 `7bf274a8...` before and after;
  the Ingat checkout `git status --short` empty at the end; the main checkout gained only this task's owned paths.
- Not done / limits: no Ingat change and no proposal run on a modified Ingat; Fly and Kamal sketches not run; HCL, KDL,
  CUE facts from memory; the owner's private draft not opened.
- Follow-up (only if the owner decides; Ingat-side work belongs to the Ingat project and is out of this repository's
  scope): (1) Ingat P1-1 validation rule for stores without `[backup]` (S, risk M: may refuse an existing manifest;
  check: the fixtures and both consumers' manifests still validate); (2) Ingat P1-2/P1-3 messages and JSON Schema (M,
  risk L; check: probe set of `validate-results.txt` gives the improved messages); (3) Ingat P2-a..h decided before the
  M2 freeze by ADR (M, risk M); (4) in this repository, the lean variant of INGAT-TOML-AUDIT F1/F2 (P1-a) as one worker
  task owning `ingat.toml` only, gate: pinned validate plus model-dump identity (S, risk L).
- No commit, no stage, no push; ORCHESTRATION.json, STATE.json, NEXT_ACTION, `ingat.toml` and all source untouched.

Status: done
