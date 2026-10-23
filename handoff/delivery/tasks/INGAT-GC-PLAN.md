# INGAT-GC-PLAN dispatch brief (design a scheduled GHCR cleanup that never deletes release images)

- **Task.** Side track "Ingat deployability", follow-up "GHCR cleanup" (GC), task
  INGAT-GC-PLAN, kind plan, attempt 1. It depends on the accepted and pushed T0/T8 change
  (`6173f07`, records `70dce2a`). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Not on `ORCHESTRATION.json` (see
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not edit the board, STATE or
  NEXT_ACTION.
- **Profile and routing.** timesheet-planner (effort high), requested model sonnet, no
  override. Routing: size M, risk H, novelty yes.
  - Risk H: a scheduled job with write access deletes registry content; deleting the
    image that the target host runs, or that an Ingat restore needs, harms recovery.
  - Novelty: no cleanup or GitHub API automation exists in this repository yet.
  - Write the task record in English.

## The owner's request (2026-10-22, in the owner's words, this session)

"Thêm 1 job dọn định kỳ xóa các phiên bản cũ, nhưng chỉ xóa các bản ko phải bản release.
các bản release nếu muốn xóa thì cần phải xóa bằng tay" (Add one periodic cleanup job that
deletes old versions, but deletes only versions that are not release versions; release
versions, if they are to be deleted, must be deleted by hand.)

Context: `.github/workflows/image.yml` publishes `ghcr.io/cdsemi/timesheet:<full commit
SHA>` for the tip commit of every push to `main` (no path filter), so a package version is
added for almost every commit. The package is private for now; the owner will make it
public. There is no release yet: `git.release_declared` is false on the board, no git tag
exists, docs/08 says agents create no tags or releases, and `ingat.toml` uses
`release = "commit"`.

## Questions the plan must answer, with evidence

1. **What a "release version" is, in a form the job can test.** Today every image has
   only its commit-SHA tag. List the workable definitions (for example: the image of a
   commit that a git tag matching a pattern points to; a GitHub Release; an extra GHCR
   tag such as `vX.Y.Z` added at release time; a manual `keep-*` tag), with what each
   needs from the owner and from the workflows, and recommend one. It must be impossible
   for the job to delete a release version, including when the release tag is created
   after the image was published.
2. **"Old".** Options for the non-release versions to keep (newest N, younger than D days,
   both), with a recommended default and a hard floor so the job can never delete
   everything.
3. **The image the target host runs and Ingat's needs.** Read Ingat's docs
   (`D:\Dropbox\Work.LISA\LisaHQ\Ingat`, read-only: ADR-0026, MANIFEST_SPEC on images,
   LIFECYCLE on restore, drill, rollback and image pinning, ARCHITECTURE on image
   retention or pruning on the host). Does Ingat need to pull an old commit's image again
   (restore of an older bundle "in the bundle's own release image", rollback, a drill, a
   new host)? Does it keep pinned images locally? State what can break when an old
   non-release tag is deleted, and how the design protects the deployed and recent
   commits (for example a large enough N, or a protection the owner can set by hand).
4. **Mechanics and permissions.** How to list and delete versions of an organization's
   container package from a workflow: the REST endpoints, what a container version's
   `name` and `metadata.container.tags` hold, whether `GITHUB_TOKEN` with
   `packages: write` may delete versions of a package published by this repository's
   workflow (and what the owner must set if not), whether deleted versions can be
   restored and for how long, rate limits, and pagination. Prefer what the runner already
   has (`gh api` or `curl` with `GITHUB_TOKEN`) over a third-party action; if an action
   is better (for example `actions/delete-package-versions`), say exactly how it would
   match tags and pin it by full SHA like the other workflows. Cite GitHub's docs (fetch
   public pages with `curl` into the task folder) and mark each claim verified or to
   check.
5. **Safety.** Default dry-run for manual runs (`workflow_dispatch` with an input), a
   schedule, least-privilege permissions per job, a concurrency group with the image
   workflow so a cleanup never races a publish, a clear log of kept and deleted versions
   with the reason, failure on any unexpected API answer (fail closed), and no deletion
   of an untagged version that a tagged one might need (none should exist with
   attestations off; say how the job treats them).
6. **Testability.** The selection logic (which versions to delete) must be testable
   offline. Propose where it lives (for example a small Node script under `scripts/`
   with a unit test that runs in this repository's existing test runner, or a pure
   function the workflow calls), the fixture shape, and the gate commands: unit tests,
   actionlint pinned by digest, SHA-pin check, a dry-run against a fixture, and the
   repository's own checks (`npm run lint`, the verify script if it covers `scripts/`).
   Check `package.json` scripts and the test layout first; follow the repository's style
   and AGENTS rule 11 (no deprecated APIs).
7. **Docs.** What ADR 0002 (Consequences mention every commit adds a version and there is
   no cleanup) and docs/07 need; whether a new ADR is warranted or ADR 0002 gets an
   amendment; EN and VI.
8. **Owner decisions.** List only the decisions that block a correct implementation, each
   with options and a recommended default, phrased so the owner can answer in one line.

## Deliverables

- Results below: facts with sources; options and recommendations for 1-3 and 5; the
  mechanics of 4; the exact proposed workflow text (and script and test, if any) as
  `.txt` files in the evidence folder; the implementation task for one worker (owned
  paths, acceptance criteria, gate commands); owner decisions (8).
- Base check: HEAD, `git status --short`, `git fetch origin`, `git rev-parse origin/main`,
  `git log --oneline HEAD..origin/main` (the main checkout's coordinator may have pushed).

## Allowed and forbidden actions

- Allowed: read-only git; `curl` of public GitHub docs and public, unauthenticated GitHub
  API reads (stay under 30 requests); actionlint pinned by digest
  (`rhysd/actionlint@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`)
  on copies in the task folder; running a proposed script against fixtures in the task
  folder with Node 24.
- Forbidden: any authenticated GitHub call, any `gh` command using the owner's sign-in,
  any delete or write to GitHub or GHCR, any change to GitHub settings, anything against
  the owner's NAS, editing repository files outside your owned paths, staging, committing
  or pushing.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-GC-PLAN/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-PLAN`.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  `export MSYS_NO_PATHCONV=1` for Docker mounts.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Redirect output to files in the task folder and read them with Read.
- The repository is public: no host values, no tokens, no personal data in the evidence.
- Before returning, no container or background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step; end the file with exactly one
  newline after "Status: done" (no trailing blank lines).

Return at most 150 words, beginning 'Self-reported model: ...', listing the owner decisions.

## Results

Planner: timesheet-planner, requested sonnet, attempt 1. Self-reported model: claude-sonnet-5-5.
Evidence folder: `handoff/delivery/evidence/INGAT-GC-PLAN/` (E/ below). Task folder: `D:\.claude-tmp\timesheet\INGAT-GC-PLAN`.

### 0. Base check and what was and was not done

- HEAD `70dce2a`; `git fetch origin` ran; `origin/main` = `70dce2a`; `git log HEAD..origin/main` empty (E/base-check.txt).
  The worktree has the uncommitted INGAT-T0T8-RECORD files and this brief only.
- Observation: the repository is public, has no git tag, and anonymous `git ls-remote --tags` returns an empty list with
  exit 0 (E/sources.txt items 8-10). 16 unauthenticated requests were made (limit 30).
- Not done, by rule: no authenticated call, no `gh`, no write to GitHub or GHCR, nothing on the NAS, no staging.
  The listing of the real package versions was therefore NOT observed (the package is private): the response shape
  below comes from GitHub's OpenAPI description and docs, not from a live answer. This is marked "to check" where it matters.
- Not run here: `npm run typecheck`, `npm run lint`, the real vitest (no `node_modules` in the worktree). The proposed test
  ran under Node's built-in runner with a 60-line stand-in for `vitest`, and a mutation of the script was caught (see 6).
  The worker must run the real gate.

### 1. What a "release version" is

Observation. Every image has exactly one tag, the full commit SHA (`image.yml`); the package has no other tag; no git tag
exists; `ingat.toml` has `release = "commit"`; docs/08 says agents create no tags or releases.

Options (all must make deletion impossible, including a release created after the image was published):

| Definition | Needs from the owner | Needs from workflows | Created after publication |
|---|---|---|---|
| A. The commit has a git tag (any name, or a pattern) | `git tag <name> <sha>` + `git push origin <name>` by hand | none; the cleanup reads the tag list when it runs | protected, as long as the tag exists before the version is deleted |
| B. A GitHub Release | creates a tag (publishing a Release creates one) | none | same as A, it is a tag |
| C. An extra GHCR tag `vX.Y.Z` on the image | a release workflow or `docker buildx imagetools create` by hand with a write token | a new workflow with `packages: write` on `push: tags` | protected (the tag is on the version) |
| D. A manual `keep-*` GHCR tag | docker CLI plus a token with write:packages, by hand | none | protected |

Recommendation: A as the definition, plus a free structural rule that covers C and D: a version with any tag that is not a
full lowercase 40-hex SHA is never deleted. So a release is "a commit with a git tag"; an image the owner tagged by hand in
GHCR is kept too. Why A: it needs no change to `image.yml`, the owner's release act (a tag) already exists in the owner's
vocabulary, the tag list is read at cleanup time (so a later tag protects an image that already exists), and `ls-remote`
returns the peeled commit for annotated tags. Limit that cannot be removed: a tag created after the version was deleted
cannot bring it back; the hard floor in 2 and the 30-day restore window (4) are the only cover. Recommended pattern: any tag
(fail-safe: a tag of any name protects its commit); docs/08 already forbids agent tags.

Decision rule implemented (E/ghcr-cleanup.ts.txt, `selectVersions`), first match wins:
untagged -> keep; any tag that is not a lowercase commit SHA -> keep; a tag in the tagged-commit set -> keep;
rank < keepNewest -> keep; age <= keepDays -> keep; otherwise delete. A version is deleted only if ALL its tags are commit
SHAs and none is tagged. A second function (`assertSafe`) re-checks the result and throws on any violation.

### 2. "Old", and the hard floor

Observation: 182 commits on `main` since 2026-09-30 and 35 since 2026-10-15, so about 5 to 8 per day; one version per
push tip (at most that). Newest N alone: N=20 is about 3 to 4 days. Age alone: 30 days is about 150-240 versions.
Options: newest N only (cheap, but tiny time window); younger than D days only (a quiet month could leave one version, and
nothing stops a run that finds zero recent ones from deleting all); both. Recommendation: keep a version if it is among
the newest 20 OR younger than 30 days (delete only when old by both). Defaults: `keepNewest=20`, `keepDays=30`,
`maxDelete=50` per run, oldest first, so a backlog drains over days and a bug cannot empty the package in one run.

Hard floor, enforced in code and not overridable by input or variable: `keepNewest >= 10`, `keepDays >= 7`,
`1 <= maxDelete <= 100`, a version dated more than a day in the future aborts the run, an empty package aborts, and a plan
that would delete every version aborts. Boundary: a version exactly `keepDays` days old is kept.

### 3. The image the target host runs, and Ingat's needs (from Ingat's own documents)

Facts, with sources:
- Ingat pulls the image by tag `ghcr.io/cdsemi/timesheet:<commit>` in `prepare`, pins it by image ID and records the
  repository digest (ADR-0026 Decision; LIFECYCLE 4.2).
- It keeps images locally and removes none before M3; from M3 only `prune --images` (class D, host scope) removes ledger
  images with no reference from a retained deployment or a pinned bundle (ADR-0007; LIFECYCLE 4.13; F11 keeps the images of the
  current and previous deployment and of pinned pre-change bundles). The running service uses the local image ID with
  `pull_policy: never` (ADR-0007), so the registry is not needed to keep running.
- It does pull an old image again: "A recorded candidate whose images are gone (for example after a manual image prune) is
  pulled again by its recorded digests" (LIFECYCLE 4.2); a drill needs "the bundle's recorded release images present ... a
  missing one refuses `missing-image`, and `prepare` of that release pulls it again by its recorded digest" (4.9); a restore
  "always runs in the bundle's own release" image (4.10); M1-M2 rollback is `deploy <older-ref>` (4.6), which prepares the
  older commit and pulls it if absent; a cross-host restore (M4) "runs the exact bytes" pulled by digest (ADR-0026
  Consequences).
- Bundle retention is calendar based (examples in MANIFEST_SPEC: `keep_monthly` up to 12), so a retained bundle can be
  months old and its release image is needed to restore or drill it.

What breaks when an old non-release version is deleted from GHCR: (a) a drill, restore or rollback to a bundle or commit
whose image is no longer on the host (after a manual `docker image prune`, an M3 `prune --images`, a disk or engine
replacement) fails at the pull with "manifest unknown"; (b) a new host or an M4 cross-host restore cannot get the bytes;
(c) a workflow re-run of an old commit rebuilds the tag under a different digest, so a recorded digest still cannot be pulled.
The running service and the immediately previous deployment keep working (local images). Observation vs assumption: the
Ingat behaviour above is read from its documents; no Ingat 0.1.x run was observed.

Protection built in: 20 newest and 30 days cover the commits that are deployed and rolled back in normal use (deploying a
tip commit, one step back); the owner's tag rule covers the rest: a commit whose backups must stay restorable beyond
30 days must be tagged (any git tag) before the 30 days pass. This is a manual duty and is the main residual risk; it goes in
docs/07 and docs/11. The job cannot see which commit the NAS runs (it must not: the host is private), so there is no
automatic "deployed" protection.

### 4. Mechanics and permissions (V = verified in the fetched docs; C = to check on the first real run)

- List: `GET /orgs/{org}/packages/container/{package}/versions?state=active&per_page=100&page=N`; `per_page` max 100,
  default 30, `page` default 1, `state` active|deleted (V: OpenAPI line 32036 ff.; E/sources.txt item 6). There is no total
  count; the script pages until a short page (cap 30 pages) and fails above that.
- Version object: `id` (integer), `name` (for a container version the manifest digest, e.g. `sha256:...`; V by the
  documented example), `created_at`, `metadata.package_type = "container"`, `metadata.container.tags` (array of strings; V by
  the schema, line 107506). The documented list example shows no `container` object, so the real answer for this private
  package is C. The parser fails closed when `tags` is not a list of strings.
- Get one: `GET .../versions/{id}`. Delete: `DELETE .../versions/{id}` -> 204 (V). Restore: `POST .../versions/{id}/restore`
  -> 204. A deleted version can be restored within 30 days if its package namespace and version are still free (V: docs
  "Delete & restore a package"; OpenAPI line 32154). Deleting a version of a PUBLIC package with more than 5,000 downloads is
  refused (V); the script stops on the resulting non-204 (fail closed).
- Token. Docs: "you can use a GITHUB_TOKEN in a GitHub Actions workflow to delete or restore packages using the REST API.
  The token must have admin permission to the package. If your workflow publishes a package, the admin role is granted by
  default to the repository where the workflow is stored" (V: deleting-and-restoring page; stated as public preview).
  `image.yml` publishes the package from this repository (and sets `org.opencontainers.image.source`), so the repository should
  already hold admin on the package: C, owner can read it in Package settings -> "Manage Actions access". The OpenAPI entry
  for these endpoints says `enabledForGitHubApps: false`, which is in tension with the docs for `GITHUB_TOKEN`: C at the
  first live run. The endpoint docs also require organization admin for a human user; for the workflow only the package role
  is documented. The workflow requests `packages: read` (plan) and `packages: write` (apply); `image.yml` shows
  `packages: write` already works in this organization.
- If `GITHUB_TOKEN` is refused with 403 on DELETE: the only documented fallback is a classic personal access token with
  `read:packages` + `delete:packages` stored as an environment secret; that is a long-lived credential and is not proposed
  unless the first live run needs it (owner decision D4 below).
- Rate limit: `GITHUB_TOKEN` is 1,000 requests per hour per repository (V). A run uses at most 30 list pages + 2 requests
  per deletion; with the default cap 50 that is about 10 pages worst case for 1,000 versions and under 110 calls per job.
  Deletes are sequential, never parallel, so secondary limits are not approached; any non-2xx stops the run.
- Pagination race: a push during listing can shift pages, so a version can appear twice (the script keeps it once) or be
  skipped (never deleted: safe). Rank is computed on the snapshot; a version published later is newer than all of them, so
  the snapshot can only over-keep.
- Action alternative `actions/delete-package-versions` (E/sources.txt item 7): rejected. Its keep rules are `min-versions-to-keep`,
  `ignore-versions` (a regex on the version name, which for containers is the digest, not the tag), `delete-only-untagged-versions`
  and `delete-only-pre-release-versions`; it cannot express "keep every version whose tag is a tagged commit" without a
  prior script that builds the regex, it has no dry run, and its selection cannot be unit tested offline. If used anyway, pin it
  by the full commit SHA of its latest release and pass `package-type: container`, `package-name: timesheet`, `token`,
  `ignore-versions` built from the tag list; this plan does not recommend it.
- Chosen: Node's built-in `fetch` with `GITHUB_TOKEN` (no `gh`, no third-party action). Node needs `actions/setup-node`
  (the runner image's default Node is not guaranteed to be 24): pinned `949feb2413d6458794dcd2491c4babbbce0c15c1` (v7.1.0,
  resolved from the public API; the same method returns the existing checkout pin).

### 5. Safety

Implemented in E/image-cleanup.yml.txt and E/ghcr-cleanup.ts.txt:
- Dry run by default: `workflow_dispatch` input `apply` defaults to false; the `plan` job (`packages: read`) always runs and
  prints every KEEP/DELETE line with its reason and a step summary; the `apply` job (`packages: write`) runs only for a manual
  run with `apply = true`, or for the schedule when the repository variable `GHCR_CLEANUP_APPLY` is `true` (unset = the
  schedule only plans). `--apply` is refused together with the offline `--versions-file` mode.
- Schedule: daily 03:17 UTC, from the default branch only (a GitHub rule; public repositories also pause schedules after 60
  days without repository activity: V, not a risk while commits continue).
- Least privilege: workflow `contents: read`; per job as above; checkout with `persist-credentials: false`; inputs reach the
  script only through `env`, never inline in `run`; all actions pinned by full SHA; `timeout-minutes`.
- Concurrency: the cleanup has its own group `image-cleanup` (`cancel-in-progress: false`). It deliberately does NOT share a
  group with `image.yml`: GitHub keeps at most one pending run per group and cancels the older pending run (V: concurrency
  docs), which would silently drop the image of an intermediate push. The brief's goal is met without sharing: a publish
  adds a version that is among the newest (never deletable), the cleanup deletes only ids it listed, and each id is read
  again just before its delete (a version whose tags changed is skipped). The newer `queue: max` property exists (V) but needs
  an `image.yml` change and was not verified with actionlint; not proposed.
- Fail closed: a non-200 list, a non-204 delete, a redirect, a timeout (30 s), a malformed version entry, a missing
  `metadata.container.tags`, an unreadable tag list line, a missing `--tags-file`, a missing token, an empty package, more
  than 3,000 versions, or an option outside the limits all end the run with exit 1 and `::error::` before any further delete.
  A missing or empty tag list from a failed `git ls-remote` stops the step (bash `-e`); an empty list from a repository with
  no tag is legal.
- Untagged versions: never deleted (kept with reason `untagged`). With attestations off none should exist
  (`image.yml` comment); if attestations are switched on later, untagged child manifests belong to a tagged index and must
  not be deleted separately; that later change needs its own decision.
- Logging: one line per version (`KEEP`/`DELETE`/`DELETED`/`SKIPPED`, id, creation time, tags, reason), a plan line, a summary
  with the restore endpoint when something was deleted.

### 6. Testability

Existing layout (observed): vitest `include: tests/**/*.test.ts`, forks pool; tests in `tests/{client,domain,e2e,integration,support}`;
`npm run verify` = typecheck + lint + test + build + smoke; `scripts/*.mjs` are standalone and not unit tested (the lint
config lists `scripts/*.mjs` under `allowDefaultProject`, which allows 8 files; 6 are used). Node 24.21.0 runs `.ts`
directly without a warning (E/node24-type-stripping-probe.txt), and `dev:server` already relies on it.

Design: one TypeScript file `scripts/ghcr-cleanup.ts` with pure functions (`selectVersions`, `taggedCommits`, `parseVersions`,
`assertOptions`) and a thin I/O shell (`run(argv, env, deps)` with an injected `fetch`, file reader and clock, plus an
`import.meta.url` guard for the command line). Test `tests/integration/ghcr-cleanup.test.ts` (22 cases) covers: the exact
deletion set, release protection (also for an annotated tag, and for a tag created after publication), non-SHA tags
(`v1.0.0`, `latest`, `keep-nas`, uppercase, 39 characters), untagged, boundaries of age and rank, floor and ceiling
refusal, never everything, the cap and its oldest-first order, a future date, a 200-round seeded property check that no
deleted version is untagged, multi-tagged, tagged or in the newest N, the `ls-remote` parser (lightweight, annotated, empty,
CRLF, garbage), the API parser (seven malformed shapes), and `run` against a fake GitHub (two pages, dry run makes no write,
`--apply` deletes exactly the planned ids oldest first, changed tags are skipped, the first 403 stops the run, missing
token / tags file / empty package / below-floor option fail, offline plan with a fixed clock).

Evidence from this plan (honest scope):
- E/unit-test-run-with-shim.txt: 22 of 22 pass under `node --test` with a local stand-in for `vitest` (only `node:assert`
  based `toBe/toEqual/toHaveLength/toContain/toThrow/rejects`); NOT a vitest run.
- E/unit-test-run-mutation-release-rule-removed.txt: with the release line deleted from a copy of the script, 3 tests fail
  (the test suite detects it; the independent `assertSafe` also throws).
- E/dryrun-fixture-floor-options.txt (`--keep-newest 10 --keep-days 7`): keep 15, delete 25, exit 0.
  E/dryrun-fixture-defaults.txt (defaults, fixed `--now 2026-11-01T00:00:00Z`): keep 35, delete 5, exit 0.
  E/dryrun-refuse-below-floor.txt (`--keep-newest 9`): exit 1. E/dryrun-refuse-apply-offline.txt: exit 1.
  Fixture: E/versions.fixture.json.txt (40 synthetic versions: lightweight- and annotated-tagged commits, a `keep-nas` tag,
  a `v1.0.0` version, one untagged) and E/tags.fixture.txt; generator E/gen-fixture.ts.txt.
- E/actionlint.txt: `rhysd/actionlint@sha256:b1934ee5...5667` (v1.7.12) on the proposed workflow: exit 0.
- SHA-pin check: the four `uses:` lines are `actions/checkout@3d3c42e5...` and `actions/setup-node@949feb24...`, full 40-hex.
- Not run: tsc, eslint, real vitest, anything on GitHub. The proposed TypeScript was written for `erasableSyntaxOnly`,
  `verbatimModuleSyntax`, `noUncheckedIndexedAccess` and no deprecated API, but is unchecked by the compiler.

Gate commands for the worker and verifier (Git Bash, Node 24 first on PATH):
1. `node --version` (v24.x).
2. `npx vitest run tests/integration/ghcr-cleanup.test.ts`, then `npm test`.
3. `npm run typecheck`, `npm run lint` (must pass with `scripts/ghcr-cleanup.ts` included; see the task), `npm run verify`.
4. actionlint pinned by digest on `.github/workflows/image-cleanup.yml` and on the two existing workflows (exit 0 each).
5. SHA-pin check: every `uses:` line in `.github/workflows/*.yml` ends in `@<40 hex>`.
6. Dry run on the fixtures with `node scripts/ghcr-cleanup.ts --owner CDSemi --tags-file <tags> --versions-file <versions> --now 2026-11-01T00:00:00Z`
   (expected counts above, floor options and defaults) and the two refusals.
7. Mutation checks by the verifier or auditor on a copy: remove the release rule, the untagged rule, the non-SHA-tag rule,
   the future-date check and the floor, and show a test fails for each.
8. `node scripts/precommit-check.mjs` and `git diff --cached --check` at commit time (committer).

### 7. Docs

- New ADR `docs/adr/0003-ghcr-image-cleanup.md` (+ `.vi.md`): a new concept (release version = commit with a git tag, plus
  non-SHA tags), a job with delete power and a rule that nothing deletes by hand-less judgement: this is the "ADR before a
  new concept" case. Content: context (a version per push tip; ADR 0002 left retention open), decision (the rules in 1-2, the two
  jobs, own concurrency group, GITHUB_TOKEN, variable gate), consequences (the tag-before-30-days duty; deleted version
  restorable 30 days; Ingat cannot pull a deleted old image; untagged never deleted; first live run unverified), alternatives
  (the action, GHCR tags, shared concurrency, count only, age only).
- ADR 0002 (EN + VI): replace "a retention job is a later decision" in Consequences with a pointer to ADR 0003; no other change.
- docs/07 (EN + VI): one paragraph after the Ingat paragraph: the workflow name, rules, the "tag the commit you must keep" duty,
  the rollout steps (dry run, check package Actions access, apply with `max_delete=1`, set `GHCR_CLEANUP_APPLY`), the restore
  endpoint and the 30 days. The current docs/07 sentence "neither workflow has run on GitHub yet" is already stale
  (both ran; see the T0/T8 checkpoint); the worker should correct it in the same paragraph.
- docs/11 (EN + VI): one sentence in section 1 step 2, where the CI-published tag is named: images older than 30 days are
  deleted from GHCR unless their commit has a git tag.
- Operator runbooks get a `.vi.md` beside them (AGENTS.md); the worker also checks `docs/10_DECISIONS_AND_SOURCES` and
  README/DEVELOPMENT for a script or ADR index to update (grep `adr/0002` and `source-digest`).

### 8. Owner decisions (answer in one line each)

- D1 Release = a commit with a git tag. Any tag name (recommended), or only names matching `v*`?
- D2 Keep the newest 20 versions and everything younger than 30 days, delete at most 50 per run? (recommended; floors 10 / 7 days stay fixed.)
- D3 Rollout: the schedule only plans until you set the repository variable `GHCR_CLEANUP_APPLY=true` after reading the first dry
  run and one manual apply with `max_delete=1` (recommended), or delete from the first scheduled run?
- D4 (only if the first live delete answers 403): allow a classic token with `read:packages` + `delete:packages` as an
  environment secret, or keep deletion manual? Recommended default: keep manual; not needed to start.
Not decisions, but owner steps: confirm in the package settings that `CDSemi/timesheet` has the Admin role under "Manage
Actions access"; tag the commit you deploy when its backups must outlive 30 days.

### 9. Implementation task INGAT-GC-IMPL (one worker; proposed, depends on the answers D1-D3)

- Profile: worker-high (risk H: a job with delete power), then gate (verifier), fresh opus audit, then timesheet-committer.
  Size M (about 270 lines of script, 300 of test, one workflow, two ADR files, four doc edits plus Vietnamese).
- Start from the proposed files in E/ (copy, rename without `.txt`), then adapt to D1-D3 (D1 "v*": change
  `taggedCommits` consumers to filter names; D3 "from the first run": drop the variable test in the `apply` job `if`).
- Owned paths (create or edit only these):
  `scripts/ghcr-cleanup.ts`; `tests/integration/ghcr-cleanup.test.ts`; `tests/integration/fixtures/ghcr-cleanup/versions.json`
  and `tags.txt` (from the E/ fixtures; the offline test and the dry-run gate read them);
  `.github/workflows/image-cleanup.yml`; `tsconfig.json` and `tsconfig.test.json` (add `scripts/ghcr-cleanup.ts` to `include`
  so typecheck and the type-aware lint see it); `docs/adr/0003-ghcr-image-cleanup.md` and `.vi.md`;
  `docs/adr/0002-ingat-manifest-and-ghcr-image.md` and `.vi.md`; `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`;
  `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`; its own task record and `handoff/delivery/evidence/INGAT-GC-IMPL/`.
  Not to be touched: `image.yml`, `ingat-validate.yml`, `ingat.toml`, `Dockerfile`, `compose.example.yaml`, `src/**`,
  `ORCHESTRATION.json`, STATE, NEXT_ACTION, any other test.
- Acceptance criteria:
  AC1 No version is deleted unless all its tags are lowercase commit SHAs, none of them is the commit of a git tag, it is
  not among the newest `keepNewest`, and it is older than `keepDays`; test per rule plus the property test.
  AC2 Release safety: a tag created after the image was published protects it on the next run (test with a later tag list).
  AC3 Floors and caps enforced in code (10 / 7 / 1-100); nothing deletes everything; deletion is oldest first.
  AC4 Dry run default: `plan` job `packages: read`, no write call in a dry run (test), `apply` only for dispatch `apply=true`
  or schedule + variable (or per D3).
  AC5 Fail closed on every unexpected answer listed in 5, with a test each; one `::error::` and exit 1.
  AC6 Workflow: own concurrency group, per-job permissions, `persist-credentials: false`, inputs via `env`, actions pinned by
  full SHA, actionlint exit 0.
  AC7 Offline testability: the selection runs without network from the saved fixtures, with the expected counts above.
  AC8 `npm run typecheck`, `npm run lint` (no-deprecated) and `npm run verify` pass; no deprecation warning.
  AC9 Docs EN and VI aligned (ADR 0003, ADR 0002 edit, docs/07, docs/11); every GitHub claim is marked verified or to check;
  the stale "neither workflow has run" sentence is corrected.
  AC10 No GitHub write, no authenticated call and no `gh` is used by the worker; the first live run is an owner step and is
  reported as not done.
- Checks: the gate commands in 6. Rollout after the commit (owner, not the worker): run the workflow manually with
  `apply=false`, read the plan and the step summary; check the package's Manage Actions access; run once with `apply=true`
  and `max_delete=1`; verify one version disappeared and the image of the newest commit still pulls; then set
  `GHCR_CLEANUP_APPLY=true`. A verifier can read the run conclusions through the public API, as INGAT-T0T8-CI did.
- Complexity and risk rationale: the logic is one pure function with an independent invariant check; the network code is
  about 40 lines with a single failure mode (throw); there is no new dependency and no change to the publish path. The risk is
  the first live delete (unverified token behaviour), contained by the plan-first rollout, the `max_delete` cap and the
  30-day restore window.

Status: done
