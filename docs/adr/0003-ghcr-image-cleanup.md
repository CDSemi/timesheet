# ADR 0003: a scheduled cleanup of old GHCR image versions

Status: proposed (side track "Ingat deployability", follow-up GHCR cleanup; the script, its tests and the workflow are
written and checked offline; the workflow has not run on GitHub and nothing has been deleted).

## Context

- `.github/workflows/image.yml` publishes `ghcr.io/cdsemi/timesheet:<full commit SHA>` for the tip commit of every push to
  `main` (ADR 0002), so the package gains about five to eight versions a day. ADR 0002 left retention open.
- Ingat pulls an image by its commit tag in `prepare`, pins the pulled image and keeps it on the host. It pulls an old
  image again only when the local copy is gone (a manual or later `prune --images`, a replaced disk or engine), for a drill,
  a restore in the bundle's own release image, a rollback to an older commit, a new host or a cross-host restore. The
  running service uses the local image and does not need the registry (Ingat ADR-0007, ADR-0026, LIFECYCLE; read from
  Ingat's documents, not observed on a run).
- No git tag exists yet and `git.release_declared` is false; agents create no tags or releases (docs/08).
- Owner request (2026-10-22): a periodic job deletes old versions, but only versions that are not release versions;
  release versions are deleted by hand. Owner decisions (2026-10-22): any git tag marks a release; keep the newest 20
  versions and every version younger than 30 days, with no limit on the number deleted per run; the schedule deletes
  from its first run.

## Decision

- **A release is a commit with a git tag**, of any name. The job reads the tag list (`git ls-remote --tags`; an annotated
  tag is resolved to its commit) every time it runs, so a tag created after the image was published protects that image
  from then on. In addition, a version carrying any tag that is not a lowercase 40-hex commit SHA (for example a `v1.0.0`
  or a `keep-nas` tag added by hand in GHCR) is never deleted.
- **Old** means old by both measures: a version is deleted only when it is not among the newest `keep-newest` = 20
  (by creation time) and is older than `keep-days` = 30 days (a version exactly 30 days old is kept). Fixed floors, not
  overridable by an input or a variable: `keep-newest >= 10` and `keep-days >= 7`. A version dated more than a day in the
  future, an empty package, and a plan that would delete every version end the run with exit 1 before anything is
  deleted. Deletion goes oldest first. There is **no per-run deletion cap**; the floors, the rules above and the
  never-everything check are the limits.
- **Untagged versions are never deleted.** With attestations off none should exist; if they are switched on later, untagged
  child manifests belong to a tagged index and must not be deleted on their own. That later change needs its own decision.
- **Selection is pure and tested offline.** `scripts/ghcr-cleanup.ts` holds the rules as pure functions (`selectVersions`,
  `taggedCommits`, `parseVersions`), a second independent invariant check that throws if a result breaks a rule, and a thin
  network shell using Node's `fetch` with `GITHUB_TOKEN`; no third-party action and no `gh`. Node 24 runs the `.ts` file
  directly. `tests/integration/ghcr-cleanup.test.ts` runs the rules on synthetic histories and on the saved fixtures in
  `tests/integration/fixtures/ghcr-cleanup/`, and the shell against a fake GitHub.
- **Workflow `.github/workflows/image-cleanup.yml`**: daily at 03:17 UTC and `workflow_dispatch`. A `plan` job
  (`packages: read`) always runs and prints one KEEP or DELETE line per version with its reason. An `apply` job
  (`packages: write`) runs after it for every scheduled run, and for a manual run only when its `apply` input is true; a
  manual run is a dry run by default. `--apply` is refused together with the offline `--versions-file` mode. Workflow
  permission is `contents: read`; checkout does not persist credentials; inputs reach the script only through `env`;
  every action is pinned by a full commit SHA. The group `image-cleanup` serialises cleanups and is deliberately not shared
  with `image.yml`: GitHub keeps one pending run per group and cancels the older pending one, which would drop the image
  of an intermediate push. A publish adds a version that is among the newest (never deletable), the job deletes only ids
  it listed, and it reads each id again just before the delete (a version whose digest or tags changed is skipped).
- **Fail closed.** A non-200 list, a non-204 delete, a redirect, a 30 s timeout, a malformed version entry, a missing
  `metadata.container.tags`, an unreadable tag list line, a missing token, more than 3,000 versions or an option below a
  floor ends the run with an `::error::` line and exit 1 before any further delete. An empty tag list from a repository
  without tags is legal; a failed `git ls-remote` stops the step.
- **No personal access token and no secret.** The job uses the run's `GITHUB_TOKEN`. If GitHub refuses it with 403, the
  run fails and deletes nothing; deletion stays manual until the owner decides otherwise (see Consequences).

## Facts and open checks

Marked V (read in GitHub's public documentation or OpenAPI description) or C (to check on the first real run).

- V: `GET /orgs/{org}/packages/container/{package}/versions` takes `state`, `per_page` (at most 100) and `page`; there is
  no total count, so the script pages until a short page.
- V: `DELETE .../versions/{id}` answers 204; `POST .../versions/{id}/restore` answers 204. A deleted version can be
  restored within 30 days if its package name and version are still free. Deleting a version of a public package with more
  than 5,000 downloads is refused.
- V: the documentation says a `GITHUB_TOKEN` can delete or restore package versions when it has admin permission to the
  package, and that the repository whose workflow publishes a package gets the admin role by default.
- V: `GITHUB_TOKEN` is limited to 1,000 requests per hour per repository; a run makes at most 30 list calls and two calls
  per deletion, one after the other.
- C: the real answer for this private package has not been seen, including that `metadata.container.tags` is present
  (the parser fails closed if it is not).
- C: whether the token is allowed to delete. The OpenAPI entry of the endpoints marks them as not enabled for GitHub Apps,
  which is in tension with the documentation above. The owner can read the package role in the package settings under
  "Manage Actions access" (the repository `CDSemi/timesheet` needs the Admin role).
- Not done: no authenticated GitHub call, no deletion, no run of this workflow and no check on the target host.

## Consequences

- **Duty for the owner:** a commit whose backups must stay restorable beyond 30 days must get a git tag before its image
  is 30 days old (`git tag <name> <sha>` and `git push origin <name>`). A tag created after a version was deleted cannot
  bring it back; the only cover then is the 30-day restore endpoint above.
- The 20 newest and the 30 days cover the commits normally deployed and rolled back. The job cannot see which commit the
  target host runs and must not; there is no automatic "deployed" protection.
- After a deletion, anything that must pull the old image again (a drill, a restore or a rollback whose image is gone from
  the host, a new host, a cross-host restore) fails with "manifest unknown". The running service and the previous
  deployment keep working from local images. A workflow re-run of an old commit rebuilds the tag under a different digest,
  so a recorded digest still cannot be pulled.
- The first image was published on 2026-10-22, so no version is older than 30 days before about 2026-11-21: the first
  scheduled runs plan nothing to delete. From then on each run can delete all eligible versions in one go.
- If the first real delete answers 403, the run fails and nothing is deleted. The owner checks the package's "Manage
  Actions access" role for this repository; a classic personal access token with `read:packages` and `delete:packages`
  stored as an environment secret is the only documented fallback and is not adopted here (a long-lived credential).
- Making the package public cannot be undone (ADR 0002); a public package version with more than 5,000 downloads cannot be
  deleted by this job and the run would fail.

## Alternatives considered

- **`actions/delete-package-versions`:** rejected. Its keep rules are `min-versions-to-keep`, a regex on the version name
  (for a container the digest, not the tag), `delete-only-untagged-versions` and `delete-only-pre-release-versions`; it
  cannot express "keep every version whose commit has a git tag" without a script that builds the regex, it has no dry run,
  and its selection cannot be unit tested offline.
- **A GitHub Release, an extra GHCR `vX.Y.Z` tag or a `keep-*` tag as the only release signal:** a Release is a git tag
  anyway; the GHCR tags need a release workflow or a write token by hand. They are honoured as a free structural rule (any
  non-commit tag keeps the version) but are not required.
- **Only tags matching `v*`:** rejected by the owner; any tag is the fail-safe reading.
- **Newest N only, or age only:** rejected. A count alone is a window of three to four days; an age alone could delete
  everything in a quiet month.
- **A per-run deletion cap, and a repository variable that keeps the schedule in dry-run until switched on:** proposed in
  the plan and declined by the owner; the floors and the checks above replace them.
- **Sharing the concurrency group with `image.yml`:** rejected, see Decision.
