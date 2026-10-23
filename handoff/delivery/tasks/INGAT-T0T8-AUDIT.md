# INGAT-T0T8-AUDIT dispatch brief (fresh independent audit of the T0/T8 snapshot)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-AUDIT, kind audit,
  attempt 1. It depends on INGAT-T0T8-GATE (PASS required; the coordinator fills in the
  gate result under "Gate at dispatch" before dispatch). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-auditor (effort xhigh, fixed by the profile);
  requested model opus; no override. Routing: size M, risk H, novelty yes (first CI and
  first Ingat manifest in this repository). docs/08 row "Independent audit".
- **Author separation.** The authors of the snapshot are the planner of INGAT-T0T8-PLAN
  and the worker of INGAT-T0T8-IMPL (both self-reported claude-sonnet-5-5). You run in a
  fresh context and authored nothing in it. Your model must not be weaker than Sonnet; if
  it is, stop and report.
- **No source writer is active during this audit.** You fix nothing.

## Snapshot identity

Uncommitted on purpose (the requester forbids pushing; see the checkpoint): base commit =
worktree HEAD; the nine files listed in
`handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt`; source digest
`79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` (875 files). Recompute
the hashes, the digest and `git status --short` first and last. A difference, or any other
changed path outside `handoff/`, means NOT VERIFIED for this snapshot.

## What the change must do (requirements to audit against)

The request (from the Ingat session, for the owner):

1. **T0:** an `ingat.toml` at the repository root that follows Ingat's
   `docs/app-developers/MANIFEST_SPEC.md` (§2 keys, §11 the generic example for this kind
   of app) and the onboarding checklist of `docs/design/ARCHITECTURE.md` §11.3 (Ingat at
   `D:\Dropbox\Work.LISA\LisaHQ\Ingat`, read-only). Every task, command, probe, store and
   param must match this repository's real code: CLI commands, backup and restore
   commands, readiness route, environment variables, data paths, Compose files. A CI job
   runs `ingat validate` on it with the public Ingat image pinned by digest
   `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`.
2. **T8:** a CI workflow that builds the app image for `linux/amd64` on each release
   commit and publishes it to GHCR (public), tagged by commit, with the OCI labels
   `org.opencontainers.image.version` and `org.opencontainers.image.revision`. The
   manifest pulls it and checks the labels per Ingat ADR-0026
   (`docs/design/adr/0026-app-images-built-in-app-ci.md`: `expect_labels`, `{commit}` for
   build services).
3. **Constraints:** the repository is public, so `ingat.toml` and every changed file stay
   generic (no real ports, subnets, hostnames, URLs other than the public repository and
   registry names, host paths, user names; secrets only as file secrets or generated
   values). The target host kernel has no CPU CFS quota, so Compose must not set a
   non-zero `cpus` there (a limit, if any, is a param that defaults to no limit). The
   target kernel is 4.4: the snapshot must state plainly which Node.js version the image
   runs and whether that line supports a 4.4 kernel, without changing the runtime. Every
   action is pinned by a full SHA, like Ingat's own workflows. This repository's own
   rules apply (AGENTS.md: English canonical with `.vi.md` pairs, the ADR rule for a new
   dependency or concept, no deprecated APIs or options, no invented evidence).
4. Use the manifest form from before Ingat's fixed-subnet Compose change (that is a later
   Ingat M2 item).

## Reading list

- `AGENTS.md` from disk; `docs/08_AI_WORKFLOW_AND_BUDGET.md` (auditor part).
- The snapshot files themselves, then this repository's code they describe (Dockerfile,
  `.dockerignore`, `compose.example.yaml`, `package.json`, `src/server/` config, CLI,
  routes, backup, restore; docs/07 and docs/11).
- Ingat: MANIFEST_SPEC, ARCHITECTURE §9.5 and §11.3, ADR-0026, ROADMAP spike S15, the
  operator guide on `validate`, Ingat's `.github/workflows/`, and Ingat's source where a
  claim depends on behaviour (for example `src/ingat/model/manifest.py`,
  `ops/validate.py`, `ops/context.py`, `core/steps.py`, `adapters/override.py`).
- The plan, IMPL and GATE records under `handoff/delivery/tasks/INGAT-T0T8-*.md` and their
  evidence, as claims to test, not as proof. Do not adopt the planner's reasoning: check
  each claim against the code and the spec yourself.
- You may read the owner's private draft (`_private/consumers/consumer-manifest-drafts.md`
  §11 in the Ingat folder) to judge whether every draft error was found and corrected; do
  not copy any of its text or any host value into your outputs.

## Audit (at least)

1. Identity check (above).
2. Rerun `ingat validate` with the pinned digest, exactly as the CI job runs it; plus at
   least one negative probe of your own choice that the manifest should refuse.
3. Trace each manifest element to code with `file:line`: every task's argv and exit map,
   mounts and the image user; the probes and the readiness JSON paths; the store
   (owner, mode, path); the params; `[app_env]` keys, patterns, required, secret,
   forbidden and owner-gated flags against the real config parsing; backup, restore,
   rollback, drill, holds and side effects against the real commands. Look for anything
   missing that the spec or the §11.3 checklist requires, and for anything Ingat 0.1.0
   would refuse at `init` or `deploy` although `validate` accepts it.
4. Workflows: triggers, permissions (least privilege), SHA pins (verify against the
   public action repositories), the build flags and labels, the tag scheme and
   immutability logic, the digest computation, attestations, shell correctness of the
   `run:` blocks, the lockdown flags of the validate job, and deprecated inputs or
   options (AGENTS rule 11). Run actionlint (pinned by digest) yourself.
5. A local `linux/amd64` build with the workflow's flags (`--load`) and an inspect of the
   labels and user; you may reuse the gate's method but run it yourself.
6. The S15 statement: confirm the Node.js version in the image and the official kernel
   floor from the Node.js 24 `BUILDING.md` yourself; check that the ADR states it plainly
   and that nothing claims a result on kernel 4.4.
7. Privacy: every changed file and every new file under `handoff/` for this track
   (briefs, evidence, checkpoint) for host values, private draft text, personal data,
   profile paths and secrets; run the repository's precommit privacy gate on a scratch
   repository holding them.
8. Docs: ADR 0002 and the docs/07 and docs/11 lines against the behaviour; EN/VI
   alignment (parity script) and `validate_package.py --preflight`; no claim of an
   unrun GitHub run, push, visibility change or NAS result.
9. Scope: nothing outside the nine files changed outside `handoff/`; Dockerfile and
   Compose byte-identical to HEAD.
10. Identity check again (last).

## Outputs

- `handoff/delivery/INGAT_T0_T8_REVIEW.md` and `.vi.md` (REVIEW template in
  `handoff/templates/`; Vietnamese for the human-facing review, English canonical).
- This brief's Results; `handoff/delivery/evidence/INGAT-T0T8-AUDIT/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-AUDIT`.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED, with findings as severity | file | repro |
  expected/actual | rule | bounded fix. Keep optional improvements separate from proven
  defects. List what stays untested (GitHub runs, GHCR, package visibility, the target
  host, S15) as unrun-by-design, not as passes.

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
- Never run anything against the owner's NAS or a remote host other than public
  GitHub/GHCR/Docker Hub/nodejs.org reads. Never push an image to a remote registry.
- Do not edit any snapshot file, stage, unstage, commit or push.
- Before returning: no container, buildx builder or background command of yours is still
  running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the decision.

## Gate at dispatch

- INGAT-T0T8-GATE attempt 1: Decision PASS (self-reported claude-sonnet-5-5), on HEAD
  `2bce0ab5842b80c710f23496d5173c122319e5c7`, the nine listed hashes and digest
  `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd`; identity equal first
  and last. Results in `handoff/delivery/tasks/INGAT-T0T8-GATE.md`, evidence in
  `handoff/delivery/evidence/INGAT-T0T8-GATE/`. Caveat recorded by the gate: no PyYAML in
  the workflow Python, so the YAML parse rests on actionlint. G9 (local registry run of
  the image workflow script) ran.
- Since the gate, only coordinator files under `handoff/` changed (this brief and the
  checkpoint pair).

## Results

Auditor: timesheet-auditor, attempt 1; self-reported model `claude-opus-5-5` (not weaker than the authors'
`claude-sonnet-5-5`); fresh context, authored nothing in the snapshot. Evidence: `handoff/delivery/evidence/INGAT-T0T8-AUDIT/`;
raw logs: `D:\.claude-tmp\timesheet\INGAT-T0T8-AUDIT`.

Progress (updated after each step):

1. Identity first (2026-10-22T22:36:52Z, `identity-first.txt`): HEAD `2bce0ab5842b80c710f23496d5173c122319e5c7`; the nine
   listed SHA-256 OK (exit 0); digest `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` (875 files);
   outside `handoff/` only the nine snapshot files changed; Dockerfile, `compose.example.yaml`, `.dockerignore` have no diff
   against HEAD. Matches the brief.
2. `ingat validate` as the CI job runs it (pinned digest, read-only, no network, uid 1001): exit 0. Refusal probes on
   task-folder copies: forbidden key declared (exit 1), port on 0.0.0.0 (exit 1), undeclared template param (exit 1);
   synthetic good instance exit 0, bad instance exit 1 with ten key-path messages. Limit probes: `cpus: "0.5"` and
   `log_snapshot` both pass `validate` (exit 0) although 0.1.0 refuses them on the target host (`a2-validate.txt`).
3. Task contract on the locally built image with the Compose hardening (`a3-tasks.txt`): every task argv gives the exit
   its manifest map expects (migrate 0 twice; bootstrap 1/0/1/0; backup 0 with one stage entry, refused 2; previews 2 with
   `outcome = confirmation_required`, usage error 2 with no JSON; release/drop of an unknown job 1; release-all 0; resume 0;
   restore 0 into the empty generation, 2 into a non-empty one); the `ready` probe argv (byte-equal to the manifest) prints
   the expected JSON and exits 0; `/api/health` and `/api/ready` answer 200 over a loopback port; the restored copy starts
   with the holds and reports the `restored` pause.
4. Workflows (`a4-workflows.txt`): the three pins equal `git ls-remote` of the tags named in the comments, each the newest
   release of its major, all `node24`, no deprecation message; actionlint 1.7.12 (digest = tag index, shellcheck 0.11.0
   present): 0 errors. The workflow's own `run:` block (extracted from `image.yml`) against a loopback `registry:3`:
   run 1 exit 0 ("not found" branch, build, push, digest = sha256 of the raw manifest, label check passed), run 2 exit 0
   ("already published", no build, same digest); the tag is one OCI image manifest (attestations off). Permissions,
   triggers and the validate job's lockdown flags read and confirmed.
5. Local build with the workflow flags on a docker-container builder with the pinned BuildKit (`a5-build.txt`): exit 0;
   `linux/amd64 10001:10001 <HEAD> 0.1.0`, source label set; **Entrypoint `["docker-entrypoint.sh"]`** (inherited from
   the Node base), which contradicts the manifest comment "The image has no ENTRYPOINT" (finding F1).
6. S15: the image runs Node.js v24.21.0 x64 on glibc 2.41 (Debian 13.7); Node.js `BUILDING.md` at v24.21.0 and v24.x
   lists GNU/Linux x64 glibc Tier 1 at kernel >= 4.18 with "Older kernel versions may work" (`a6-s15.txt`). The ADR states
   it plainly; nothing claims a 4.4 result.
   Runtime-rule note: one `sed -i` renamed the synthetic instance in two task-folder files (no snapshot or repository file).
7. Privacy (`a7-privacy.txt`): the repository's gate on a scratch repository of the nine files plus every track file under
   `handoff/` (per-file `cp` and `git add`): PASS, 0 blocking, 0 warnings. Marker greps: no private address, profile path,
   e-mail or host path of the target; but four GATE/IMPL evidence files list the development machine's unrelated
   containers with project names and ports (finding F3). No private draft text in any file.
8. Docs (`a8-docs.txt`): parity OK on the ADR, docs/07 and docs/11 pairs; preflight PASS; self-test PASS; `git diff
   --check` clean; no claim of an unrun GitHub run, push, visibility change, NAS or S15 result. Wording mismatches with the
   trigger behaviour in the workflow header, docs/07 and the ADR (finding F2).
9. Scope: only the nine files changed outside `handoff/`; Dockerfile and Compose byte-identical to HEAD (identity).
10. Trace of every manifest element (`a3-trace.txt`): no behaviour defect; nothing that Ingat 0.1.0 would refuse at
    `init` or `deploy` for this manifest beyond the documented owner-gated (class D) change and the drill memory floor.
11. Identity last (2026-10-22T23:05:46Z, `identity-last.txt`): HEAD, the nine hashes and the digest equal to the first
    check; new paths only the auditor's outputs under `handoff/`. Cleanup: the audit's images, containers, volumes and
    builders removed; no background command runs.

Not run by design (not passes): GitHub Actions runs, the GHCR push with `GITHUB_TOKEN` and its first-run error text,
package creation and visibility, the target host (pull, Engine 24, kernel 4.4/S15, drill memory), Ingat `init`/`deploy`/
`backup`/`verify --restore-test` on a real host (traced in source and run command by command locally instead).

Decision: **FIX REQUIRED** (F1 manifest comments: "no ENTRYPOINT" and the STATIC_DIR reason; F2 "every commit"/"every
push" wording; F3 unrelated container listings in track evidence; all Low, each with a bounded fix). Review:
`handoff/delivery/INGAT_T0_T8_REVIEW.md` and `.vi.md`. Final privacy pass over all 128 track files (including every
output of this audit): PASS, no new marker hit. Next action: one bounded fix task for F1-F3, a gate on the new identity,
then a fresh recheck audit.

Status: done
