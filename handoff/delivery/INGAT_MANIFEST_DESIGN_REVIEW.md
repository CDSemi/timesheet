# Design review: the Ingat manifest format, with `ingat.toml` as the worked example (INGAT-MANIFEST-DESIGN)

[Tiếng Việt](INGAT_MANIFEST_DESIGN_REVIEW.vi.md) is the translation; English is authoritative.

- Task: side track "Ingat deployability", INGAT-MANIFEST-DESIGN attempt 1 (design review, no source change);
  2026-10-22; timesheet-planner, effort high; self-reported model `claude-opus-5-5`.
- Reviewed: Ingat's MANIFEST_SPEC (the format), with this repository's `ingat.toml` (HEAD `7aafa21`, SHA-256
  `7bf274a8...`, unchanged against HEAD) as the example. Ingat sources and docs are read from the local checkout
  `v0.1.0-16-g35be585` (clean); measurements use the pinned Ingat 0.1.0 image (`sha256:b5db73be...`), whose cited
  Python files INGAT-TOML-AUDIT proved equal to the checkout.
- Not repeated here: whether `ingat.toml` matches this app's code (INGAT-TOML-AUDIT,
  [INGAT_TOML_REVIEW.md](INGAT_TOML_REVIEW.md)). This review judges the format.
- How to read it: **Fact** lines carry a source (`file:line` in Ingat as `SPEC` = `docs/app-developers/MANIFEST_SPEC.md`,
  `m.py` = `src/ingat/model/manifest.py`; a URL; or an evidence file under
  [evidence/INGAT-MANIFEST-DESIGN/](evidence/INGAT-MANIFEST-DESIGN/commands.txt)). **Opinion** lines are marked as such.
  "From memory, unverified" marks the few facts not checked against a source in this task.

## H. Verdict

1. **Opinion.** The format is close to the optimum for its job (back up, restore, roll back and drill any Compose app
   safely, with no host values in the repository), but it is not yet the easiest to use: most of its length is
   deliberate, and the real problems are a validation trap, weak tooling and some repetition of plumbing.
2. **Fact.** A one-container app with a bind store and a readiness route passes the pinned `ingat validate` in 26 lines
   (30 with the readiness probe); adding backup, restore and one operator task gives 72 lines; this app's manifest is 257
   lines because it declares 11 commands with different safety contracts, 14 environment keys and an outbound-mail
   pause (`validate-results.txt`, `counts.txt`).
3. **Fact and opinion.** TOML is not the cause of the length: the same data is 280 lines as block YAML and 509 as JSON
   (`counts.txt`); TOML is the right format here, as for Cargo, pyproject and Fly, and a developer learns the five
   constructs the manifest uses in an hour or two (opinion).
4. **Opinion.** Verbose on purpose, and should stay: a per-task `effect`, `idempotent`, `exit` map and `stdout`, the
   declared holds and owner-gated keys, and the refusal of unknown keys; these lines are the safety contract an operator
   relies on during a restore.
5. **Fact.** The trap: `[backup] strategy` defaults to `"none"` (`m.py:213`), so a data app that forgets `[backup]`
   validates green, its first data-changing update is refused at plan time (`ops/deploy.py:232-234`), and `status`
   reports that the app "keeps no data" (`ops/status.py:498-499`). Fly.io takes the opposite default: daily volume
   snapshots are on unless disabled (fly.io/docs/reference/configuration, `scheduled_snapshots`).
6. **Fact.** There is no starter template, no `init` for manifests, no JSON Schema, no editor completion and no "did you
   mean" (Grep of the Ingat README, guide and `cli/commands.py:409-443`; probes in section E), while Fly and Kamal
   generate their file and Fly's schema gives editor hints.
7. **Opinion.** The fixes in P1 need no schema change; task defaults and a few inferred links (P2) shorten this manifest
   from 257 to 218 lines (-15%) without hiding any safety key, and they are cheap only before the M2 schema freeze
   (`docs/design/ROADMAP.md:149`), after which they need schema 2.
8. **Opinion.** What one app cannot settle: whether defaults pay off across multi-service apps (the spec's PostgreSQL
   example suggests yes for `service`/`mode`, perhaps for exit maps), how quickly third-party developers learn the
   vocabulary, and how many apps the planned data providers will serve with 46-70-line manifests instead (ADR-0031:40).

## A. Minimal form, measured

**Fact.** Each form was written in the task folder beside a byte-identical copy of `compose.example.yaml` and run
through the pinned `validate` in the CI job's exact form (`commands.txt`, `validate-results.txt`, `counts.txt`).

| Form | Adds | Lines | Headers | Leaf keys | Key paths | `validate` |
|---|---|---:|---:|---:|---:|---|
| first attempt (`min1`) | identity, source, compose, store param, store, writer, activation | 24 | 6 | 13 | — | exit 1 (Compose policy) |
| minimal (`minimal-validate-ingat.toml.txt`) | + `env_file` and `port` params | **26** | 6 | 15 | 13 | exit 0 |
| minimal with readiness (`minimal-ingat.toml.txt`) | + http probe, activation wait | **30** | 7 | 18 | 16 | exit 0 |
| operable (`operable-ingat.toml.txt`) | + image param, app env (2 required keys), store owner, `[backup]`, `[restore]`, tasks backup, restore, bootstrap-new-token | **72** | 14 | 48 | 32 | exit 0 |
| this app (`ingat.toml`) | everything | 257 | 34 | 205 | 88 | exit 0 (CI) |
| Fly.io `fly.toml` sketch, same scope plus a migration | — | 15 | 4 | 7 | — | not run |
| Kamal `config/deploy.yml` sketch, same scope plus a migration | — | 20 | — | 11 | — | not run |

(`min1` stays in the task folder; its output is in `validate-results.txt`. The Fly and Kamal sketches and their sources
are in `comparables-min.txt`.)

- **Fact.** The first attempt failed on the Compose policy, not on the manifest: `env_file[0] ... is outside the
  instance's ... rendered env file` and `127.0.0.1:3000 refused: only 127.0.0.1 and a port param value`. A developer
  must learn three param kinds (`store`, `env_file`, `port`) before the first green run.
- **Opinion, from facts.** Of the 15 leaf keys of the minimal form, 9 could be derived by a scaffold from the Compose
  file and the single-service case: the four param leaves (validate already reads `compose config --variables` and
  checks every bind source, env file and published port: SPEC:203-205), the store's `kind` and `param`, `writers` (the
  only service that mounts the store), and the activation group's `services` and `reopens_writes`. The other six
  (`manifest`, `app`, `requires_ingat`, `source.kind`, `source.release`, `compose.files`) are choices.
- **Fact.** Green is not the same as deployable. The minimal forms have no `[backup]` (the trap of H5), no store
  `owner` (new generations would not belong to the image user: INGAT-TOML-AUDIT `key-table.txt` line 35), and no image
  param, so `prepare` would pull the Compose default `timesheet:local` (SPEC:51; traced, not run).
- **Fact and opinion.** At the same scope Ingat needs about twice the lines of Fly or Kamal. Reasons (opinion): Ingat
  types every Compose variable instead of owning the runtime, names roles and activation groups explicitly, keeps host
  values out of the file (Kamal's file holds server addresses), and declares backup and restore itself (Fly's volume
  snapshots are a platform feature, Kamal has no backup concept). For what Ingat promises, 2x at the minimum is fair;
  the gap that matters is the operable form, where the trap and the missing tooling cost more than the line count.

## B. Concept inventory

**Fact.** Counted from SPEC §2-§5 and `m.py:74-304` (my count): 20 tables (plus the planned `[data.<name>]`), about
129 keys, 19 template variables (SPEC:131-143), and about 18 closed value sets (for example 10 param kinds, `m.py:20`).
This app uses 22 top-level names and 88 distinct key paths (`counts.txt`), so a "simple" one-container app touches 19
of the 20 tables.

| Concern | Keys in the spec | Used here | Vocabulary (opinion unless sourced) |
|---|---:|---:|---|
| Identity (`manifest`, `app`, `requires_ingat`, `exclusive_environments`) | 4 | 3 | Clear. |
| Build and image (`[source]`, `[compose]`) | 9 | 5 | Clear; `build_files` and `build_env` are "unused while app images are built in the app's CI" (SPEC:50, 52) yet sit in the first table a reader meets. |
| Params | 8 keys, 10 kinds | 3 keys, 4 kinds | Good kind names; the store link is written twice (here and in `[stores]`). |
| Environment and secrets | 11 | 9 | `forbidden`, `owner_gated`, `tool_managed`, `secret` read well. |
| Stores and roles | 13 | 7 | `online_backup` good; `local_only` is parsed but not enforced in 0.1.0 (INGAT_TOML_REVIEW O-H). |
| Schema | 5 | 4 | `expected` is a JSON path, `expect` elsewhere is an expectation. |
| Probes and smoke | 19 | 9 | Three probe kinds are clear; a smoke check is an http probe plus a name (SPEC:182). |
| Lifecycle steps (`[[activate]]`, `[[install]]`, `[deploy]`) | 14 | 9 | An install step's kind is chosen by which key is present (SPEC:109). |
| Backup, restore, rollback, drill | 19 | 13 | `checks`/`record` are task lists here, other things elsewhere. |
| Holds and side effects | 7 | 7 | `holds` is a good word; `clear_hold` collides with `clears_hold`. |
| Tasks | 20 | 15 | `effect` values undefined in the table; `operator` reads like a person. |
| Templates | 19 variables | 5 | Closed set, checked per context: a strength. |

Naming findings (**Fact**: where both names exist; **Opinion**: the risk):

1. `side_effects.clear_hold` names a task (SPEC:121); `tasks.<n>.clears_hold` is a boolean (SPEC:167). One letter apart,
   different types: the most error-prone pair in the schema.
2. `record` is a stdout mode ("stored 0600", SPEC:158) and the `[drill] record` task list ("recorded, findings
   allowed", SPEC:119).
3. `activate` is an array of tables (SPEC:107) and a boolean in `[restore]` and `[drill]` (SPEC:117, 119); `start` is a
   service list in `[[install]]` and in `[restore]`.
4. `expect` (probe and task expectations, SPEC:165, 182), `expected` (schema path, SPEC:103) and `expect_labels`
   (SPEC:53): three meanings, one root.
5. Case: keys are snake_case, task and probe names kebab-case, values kebab-case (`app-write`, `generation:data`), and
   one key is kebab-case: `pre-change` in `[backup.naming]` (SPEC:116).
6. `effect`: the task table says only "Effect on instance data" (SPEC:161); the difference between `app-write` and
   `data`, which decides whether a backup task must be idempotent (SPEC:172), is defined elsewhere.
7. `operator = false` means "only operations may run it", not a person (SPEC:168).

Front-loaded for a simple app (**Fact**): SPEC:5 tells a newcomer to start from the closest example, and the
one-container example (§11, SPEC:701-961) is the full SQLite pattern with holds, side effects, an install pause and six
outbound tasks; ADR-0031:11 itself says "a one-container manifest costs about 255 lines". The examples also write keys
at their defaults (`baseline = []`, `prechecks = []`, `postchecks = []`, `verify = []`, `start = []`, `post = []`,
`checks = []`, `record = []`: SPEC:803-826). **Opinion:** a stateless app needs 12 top-level names (fx-web, 39 lines) and
a data app 14 (the operable form), so the documentation, not the schema, front-loads most concepts.

## C. Repetition and composition

INGAT-TOML-AUDIT proved the repetition unavoidable in schema 1. Here is the design behind it (**Fact** column 1,
**Opinion** columns 2-5; savings counted on this app's manifest, `proposed-ingat.toml.txt`).

| Schema 1 choice | Leaner design | Saves here | Cost in explicitness or safety | Verdict |
|---|---|---:|---|---|
| Every task must write `service`, `mode`, `effect`, `timeout` (`m.py:250-269`), while probes have defaults (`stable` 0s, `interval` 2s, `timeout` 60s: SPEC:182) | `[task_defaults]` for transport keys only: `service`, `mode`, `timeout`. Comparable: Cargo's explicit `key.workspace = true` inheritance (doc.rust-lang.org/cargo/reference/workspaces.html); Compose and Kamal YAML anchors with `x-` blocks | 25 lines (22 `service`/`mode` lines, 7 `timeout = "2m"` lines, minus 4) | Low: the default is written in the file; `effect`, `idempotent`, `exit`, `stdout`, `image`, `observe` stay per task. A too-short default timeout turns a data task's kill into `unknown` (SPEC:170), so the default must never be built in | Worth it (P2-a) |
| No inheritance between tasks | `extends = "<task>"` | about the same as defaults | High: a confirm task could silently inherit a preview's `exit = { 2 = "ok" }` and `expect` | Do not |
| `args` only fill values (INGAT_TOML_REVIEW O-J) | optional or variadic arguments | at most one task | The argv shape is no longer fixed; drifts toward the expression language ADR-0009:19 rejected | Keep |
| The argv prefix `node dist/server/cli.js` repeats 11 times (O-I) | a per-service `cli` prefix; or, possible today, a Compose task-only service in a profile whose `entrypoint` is the CLI (SPEC:99, 152; fx-pg does this, SPEC:477-481) | 0 lines, about 330 characters | One more concept; the argv in the file is no longer what runs; today's variant moves the repetition into Compose | Taste (P3-1) |
| `[[smoke]] live` repeats `[probes.edge-live]`; `[[install]]` start+wait repeats `[[activate]]` | `[[smoke]] probe = "<http probe>"`; `[[install]] activate = true` | 2 + 1 | None | Worth it (P2-d, P2-e) |
| `[[install]]` and `[[activate]]` are arrays of tables | one `[lifecycle]` table | 0 (headers move) | In TOML 1.0 an inline table must stay on one line (SPEC:33; `err-syntax`), so ordered steps would be harder to write | Keep |
| The store link is written twice: `[params] X = { kind = "store", store = "data" }` and `[stores.data] param = "X"`, and the validator checks they agree (`m.py:377, 396-398`) | write it once, on the param | 1 | None: the check already exists | P2-b |
| `[app_env] param` repeats which param is the `env_file` (`m.py:358`) | infer it when exactly one `env_file` param exists | 1 | None | P2-c |
| Tasks the tool already refuses to run by hand "declare `operator = false`" (SPEC:168) | imply it from `image` and the mounts | 3 | None at run time (`ops/lifecycle.py:191` refuses anyway, per INGAT-TOML-AUDIT); a reader loses one explicit hint | P2-f |

**Opinion.** For a backup and restore tool the line between "plumbing" and "contract" is the right test: defaults are
safe for which container a task runs in, how, and how long; they are unsafe for what the task does to data, whether it
may repeat, what its exit codes mean and where its output goes. The proposals keep that line.

## D. Structure and mental model

- **Fact.** SPEC §2 runs: identity, source, Compose → params → secrets and app env → stores and roles → schema →
  activation, smoke, install, deploy → backup, restore, rollback, drill, holds, side effects; tasks (§4) and probes (§5)
  are defined after the sections that reference them, and every example puts the tasks last (SPEC:37-182, §8, §11).
- **Opinion.** That is the developer's order (declare → run → operate), and the file reads top-down as a story whose
  "functions" (tasks and probes) are defined at the end. It is less good for the operator's question "what happens at
  install, deploy, backup, restore?": the answer is spread over `[[install]]`, `[deploy]`, `[[activate]]`, `[[smoke]]`,
  `[backup]`, `[restore]`, the tasks and the probes.
- **Opinion.** Putting the lifecycle sections under one table would add a nesting level, save no line, and collide with
  the planned data providers, which synthesize `[backup]`, `[restore]` and `[drill]` as whole tables (ADR-0031:18, 21).
  The better fix is a view, not a new layout: one table in the spec, "operation → keys it reads, in order", and a
  `validate --explain` that prints each operation's resolved steps with defaults applied (P2-h).

## E. Errors and tooling

**Fact.** Five broken copies of the operable form, run through the pinned `validate` (`validate-results.txt`):

| Probe | Message | Key path | Allowed values or fix | Opinion |
|---|---|---|---|---|
| missing `effect` | `tasks.backup.effect: is required` | yes | no | Good; could add "one of: read, app-write, data". |
| misspelt `idempotant` | `tasks.backup.idempotant: unknown key` and `backup.steps: task 'backup' must be idempotent (scratch)` | yes | no | No "did you mean `idempotent`"; the second line is a consequence and uses the internal word "scratch". |
| `effect = "write"`, `timeout = "60 min"` | `must be one of: read, app-write, data`; `'60 min' is not a duration such as 15s, 2m or 1h` | yes | yes | Exemplary. |
| unknown probe, task, arg | `names an unknown probe 'redy'`; `names an unknown task 'bakup'`; `{arg.user} names an undeclared arg` | yes | no | Would gain from "known: ready" or "did you mean". |
| two-line inline table | `Invalid initial character for a key part (at line 34, column 40)` | no | no | The raw TOML 1.0 parser message; no hint that inline tables must fit on one line. |
| Compose policy (`min1`) | `sample: services.timesheet.env_file[0]: /app/timesheet.env is outside ...`; `sample--t1: ...` | Compose path | no | Says what is refused, not which manifest key to add; `sample` and `sample--t1` are internal model names. |

- **Fact, strengths.** Every error is collected in one run (`model/toml_read.py:133-138`), each names its dotted key
  path (`toml_read.py:32-37`), unknown keys are refused at every level (SPEC:33), and enum and duration errors show
  the allowed form. Kamal refuses unknown keys too (kamal-deploy.org/docs/configuration/overview).
- **Fact, gaps.** Semantic errors carry no line number: `tomllib` returns a plain dict and gives positions only for
  syntax errors (docs.python.org/3/library/tomllib.html). The rewrite probe also shows consequential pairs
  (`app_env.param: is required` followed by `app_env.param: must name an env_file param`).
- **Fact, tooling.** Ingat has no manifest scaffold (`ingat init` registers an instance, `cli/commands.py:415`), no
  JSON Schema (none in the repository; no `ingat.toml` entry in the SchemaStore catalog,
  schemastore.org/api/json/catalog.json), no editor completion and no `--explain`. Comparables: `fly launch` creates
  `fly.toml` and Fly's docs point to the Even Better TOML extension "for automatic fly.toml validation and hints"
  (fly.io/docs/reference/configuration); `kamal init` creates `config/deploy.yml` (kamal-deploy.org/docs/installation);
  SchemaStore lists schemas for `fly.toml`, `Cargo.toml`, `pyproject.toml` and `hugo.toml`, which Taplo-based editors
  use for completion and hover docs (taplo.tamasfe.dev/configuration/developing-schemas.html).
- **Fact.** ADR-0031:30 rejected a manifest generator ("about 700 core lines for what a lint script or the web view
  can do"). **Opinion:** a JSON Schema plus a 30-line starter example gives most of a generator's benefit at a fraction
  of the cost.

## F. Format choice

**What TOML is (Fact).** TOML, "Tom's Obvious Minimal Language", by Tom Preston-Werner, "aims to be a minimal
configuration file format that's easy to read due to obvious semantics" and "maps unambiguously to a hash table"
(toml.io/en). Version 1.0.0 was published on 2021-01-11 (toml.io/en/v1.0.0) and 1.1.0 on 2025-12-18
(toml.io/en/v1.1.0; GitHub release 2025-12-24). 1.1.0 allows newlines and trailing commas in inline tables
(github.com/toml-lang/toml/releases).

**How easy to learn (Fact, then opinion).** The whole language fits on the toml.io home page tour: key/value pairs,
four string forms, numbers, booleans, dates, arrays, tables, inline tables and arrays of tables. PEP 518 chose it
because it is "human-usable (unlike JSON)", "flexible enough (unlike configparser)" and "not overly complex (unlike
YAML)" (peps.python.org/pep-0518). *Opinion:* `ingat.toml` uses five constructs (`key = value`, basic and literal
strings, lists, `[table]` and `[[array]]`, one-line `{ inline tables }`); a developer who has seen a `Cargo.toml` or
`pyproject.toml` reads it at once, and anyone else learns it in an hour or two. The hard part of `ingat.toml` is
Ingat's vocabulary (section B), not TOML.

**How widespread (Fact).** Implementations in more than 40 languages (toml.io/en); Python's standard library has
`tomllib` since 3.11 (TOML 1.0.0; TOML 1.1.0 from 3.15: docs.python.org/3/library/tomllib.html; PEP 680); every Rust
package has a `Cargo.toml` (doc.rust-lang.org/cargo/reference/manifest.html); Python projects declare metadata in
`pyproject.toml` (PEP 518, PEP 621); black, mypy, pytest, tox, pylint and isort read TOML configuration and TOML
libraries had about 2,000 reverse dependencies on PyPI when PEP 680 was written (peps.python.org/pep-0680); Hugo reads
`hugo.toml` first (gohugo.io/configuration/introduction), Netlify uses `netlify.toml`
(docs.netlify.com/build/configure-builds/file-based-configuration), Fly.io `fly.toml`, Cloud Native Buildpacks
`project.toml` (buildpacks.io/docs/reference/config/project-descriptor). YAML is more common in container tooling:
this repository's own Compose file and GitHub workflows are YAML. No sourced ranking of TOML against YAML was found.

| Format | Good here | Hurts here | Source |
|---|---|---|---|
| **TOML** (chosen, ADR-0009) | Comments; explicit types (strings are always quoted, so no implicit `off` → false); literal strings for regexes (`'^[0-9]{1,5}$'`); no indentation; a standard-library parser, so no dependency in Ingat's pinned image; the format of Cargo, pyproject, Fly | One-line inline tables in TOML 1.0 (`err-syntax`); `[[x]]` headers for each array entry; deep paths as `[a.b.c]`; no references, anchors or templating; long strings need `"""` with line-end backslashes | toml.io; ADR-0009:15, 19; `validate-results.txt` |
| YAML | Comments; anchors and `x-` blocks remove repetition (Compose, Kamal); familiar from Compose | Implicit typing (ADR-0009's reason); significant indentation; a large spec (PEP 518: "86 pages") | docs.docker.com/reference/compose-file/fragments; kamal-deploy.org/docs/configuration/anchors; PEP 518 |
| JSON | Universal; easy JSON Schema | No comments; regexes need doubled backslashes; 509 lines for this data | `counts.txt` |
| HCL (Nomad, Terraform) | Labelled blocks (`task "backup" { }`), variables and locals | An expression language (rejected by ADR-0009:19); a Go-centred parser | From memory, unverified |
| KDL | Compact node syntax, comments | Small ecosystem; no Python standard-library parser | From memory, unverified |
| CUE | Schemas, defaults and constraints in the language | A new language with unification semantics to learn; a Go tool | From memory, unverified |

**Fact.** The same manifest is 211 content lines in TOML, 280 lines as block YAML and 509 as JSON (comments dropped,
`counts.txt`). **Opinion.** The verbosity comes from the schema's number of facts (205 leaf keys), not from TOML; the
only real format gap is the lack of anchors, and in-schema task defaults close it in a way TOML users already know from
Cargo. Switching format would cost a migration and gain nothing measurable. TOML 1.1 multi-line inline tables become
usable only when Ingat's image moves to a Python with TOML 1.1 support (3.15; Ingat pins 3.13 per ADR-0004).

## G. Proposals, prioritized

P1 = clear win, low risk, no schema change. P2 = worth it, needs an Ingat decision; additive in schema 1 if decided
before the M2 freeze (ROADMAP.md:149), otherwise schema 2. P3 = taste or not recommended. Every proposal is an
**Ingat-side change** unless marked **possible today**.

| ID | Change | Schema | Compatibility | Effect on this manifest | Safety | Comparable |
|---|---|---|---|---|---|---|
| P1-1 | `validate` refuses (or warns about) stores without an explicit `[backup] strategy`; message names the plan-time refusal | none (validation rule) | breaks only manifests with stores and no `[backup]` (none known) | 0 lines | Better: closes the trap of H5 | Fly snapshots volumes by default |
| P1-2 | Better messages: "did you mean" for keys and names, list known probes/tasks, drop consequential errors, hint for one-line inline tables, Compose policy messages that name the manifest key to add and hide internal model names | none | none | 0 | Neutral | Kamal refuses unknown keys; did-you-mean is common in CLIs (from memory, unverified) |
| P1-3 | Publish a JSON Schema for `ingat.toml` (generated from the dataclasses) in SchemaStore | none | none | 0 | Neutral | `fly.toml`, `Cargo.toml`, `pyproject.toml`, `hugo.toml` in SchemaStore |
| P1-4 | Docs: a 30-line "start here" example and the 72-line operable example before §11; one-line definitions of each closed value (`effect`, `stdout`, `image`, `operator`); an "operation → keys read" table; drop default-valued keys from the examples | none | none | 0 | Neutral | `kamal init` output; Fly docs |
| P1-a | **Possible today:** the lean form of INGAT-TOML-AUDIT (drop six default lines, shorten the header) | none | model-identical (proved there) | -8 lines | None | — |
| P2-a | `[task_defaults]` with `service`, `mode`, `timeout` only | additive | old manifests unchanged; a manifest using it needs the new `requires_ingat` | -25 lines | Low (see C) | Cargo workspace inheritance; YAML anchors |
| P2-b | Store link written once, on the param | additive (store `param` optional when derivable) | unchanged | -1 | None | — |
| P2-c | `[app_env] param` optional with exactly one `env_file` param | additive | unchanged | -1 | None | — |
| P2-d | `[[smoke]] probe = "<http probe>"` | additive | unchanged | -2 | None | Fly's `[[http_service.checks]]` sit under their service |
| P2-e | `[[install]] activate = true` step | additive | unchanged | -1 | None | — |
| P2-f | `operator = false` implied by `image` or stage/bundle/generation mounts | additive (spec wording) | unchanged | -3 | None at run time | — |
| P2-g | Rename the colliding names (`clear_hold`/`clears_hold`, `[drill] record`, kebab key `pre-change`) | rename: needs both consumers and the fixtures updated before the freeze, or aliases | breaking without aliases | 0 | Fewer mistakes | — |
| P2-h | `validate --explain`: print each operation's resolved steps and every task with defaults applied | none | none | 0 | Better review of P2-a | `fly config show` prints the resolved config (fly.io/docs/reference/configuration) |
| P3-1 | Per-service `cli` argv prefix (or, **possible today**, a profile service with the CLI as entrypoint) | additive | unchanged | 0 lines, about 330 characters | Argv no longer verbatim | Kamal `aliases`; fx-pg's entrypoint services |
| P3-2 | One `[lifecycle]` table | schema 2 | breaking | 0 | Neutral | — (collides with ADR-0031) |
| P3-3 | Task inheritance (`extends`) | additive | unchanged | about -25 | Worse: hidden `effect`/`exit` | — (not recommended) |
| P3-4 | Another format (YAML, HCL, CUE, KDL) | schema 2 | breaking | none measurable | Worse for YAML typing | — (not recommended) |
| P3-5 | Wrap long inline tables with TOML 1.1 | none | needs Python 3.15 in Ingat and a `requires_ingat` bump | cosmetic | Neutral | toml.io v1.1.0 |
| P3-6 | `ingat manifest init` scaffold from Compose | new command | none | 0 | Neutral | `fly launch`, `kamal init`; ADR-0031:30 rejected a 700-line generator |

**The rewritten manifest (design sketch, `proposed-ingat.toml.txt`).** P1-a plus P2-a to P2-f applied to this app:
**218 lines** (257 today, 249 lean), 172 content lines (211), 163 leaf keys (205), 80 key paths (88). It is valid TOML
(the counter parsed it) but **not** a valid schema 1 manifest: the pinned `validate` refuses it with exit 1
(`task_defaults: unknown key`, `smoke[0].probe: unknown key`, `install[1].activate: unknown key`, 34 "is required"
lines for the omitted task, smoke and link keys, and the `requires_ingat` bump), as expected for a sketch. What did not shrink:
the 14 app-env keys, the six outbound tasks (one per distinct command contract), the exit maps, holds and side effects,
the comments that carry facts. **Opinion:** that remainder is the app's real operational surface, which is why the
best achievable saving is about 15%, not 50%.

**What was not done.** No Ingat file was changed; no proposal was run against a modified Ingat; Fly and Kamal sketches
were not deployed; the owner's private draft was not opened; HCL, KDL and CUE facts are from memory. Evidence:
[evidence/INGAT-MANIFEST-DESIGN/](evidence/INGAT-MANIFEST-DESIGN/commands.txt) (`commands.txt`, `validate-results.txt`,
`counts.txt`, `comparables-min.txt`, the three measured manifests, `proposed-ingat.toml.txt`, `count.py.txt`,
`convert.py.txt`).

**One next action.** The owner decides in the Ingat project whether to take P1-1 to P1-4 now and P2-a to P2-h before
the M2 schema freeze; nothing in this repository changes until such a decision lands in an Ingat release.
