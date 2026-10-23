# ADR 0002: an Ingat manifest and a GHCR application image

Status: proposed (side track "Ingat deployability", items T0 and T8; nothing has run on GitHub or on the target host yet).

## Context

- The owner wants the app installed, updated, backed up, verified and restored by Ingat, a command-line tool that manages
  Docker Compose apps on one host. Ingat never builds images: the app's own CI builds and publishes them (Ingat ADR-0026),
  and the app describes itself to Ingat in a manifest at the repository root (Ingat MANIFEST_SPEC).
- Until now this repository had no manifest, no registry image and no CI workflow. Docs/11 built the image from a clean
  export of the release commit, and `compose.example.yaml` has `build: .`.
- The target host (the NAS) runs a Linux 4.4 kernel with no CPU CFS quota. `compose.example.yaml` sets no `cpus` or memory
  limit, so nothing in the manifest sends a non-zero `cpus` there.
- Commits go to `main` and `git.release_declared` is false, so there is no release tag yet.

## Decision

- Add `ingat.toml` at the repository root (manifest schema 1, `requires_ingat = ">=0.1,<1"`, `release = "commit"`). It
  lists `compose.example.yaml` unchanged, the parameters, the environment rules, the data store, the readiness and live
  probes, install, backup, restore, rollback, drill and outbound-hold sections, and eleven tasks that run
  `node dist/server/cli.js` commands. It holds no host value: ports, URLs, addresses, paths and secrets belong to the
  host's own instance file. SMTP credentials are env-file secrets (the app has no `*_FILE` support); the first test
  instance runs in capture mode.
- Add `.github/workflows/ingat-validate.yml`: on every push to `main` and every pull request, run `ingat validate` with
  the public Ingat image `ghcr.io/lisahq/ingat:0.1.0` pinned by digest
  (`sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`), read-only, without network, with
  `contents: read` only.
- Add `.github/workflows/image.yml`: on every push to `main`, build the image for `linux/amd64` and publish
  `ghcr.io/cdsemi/timesheet:<full commit SHA>` with the OCI labels `org.opencontainers.image.version` (the
  `package.json` version), `org.opencontainers.image.revision` (the commit) and `org.opencontainers.image.source`. A tag that
  exists is never rebuilt or moved. Provenance and SBOM attestations are off, so a tag names one plain image manifest.
  The job reads the pushed image back and fails unless platform, user and both labels match, then prints
  `ghcr.io/cdsemi/timesheet@sha256:...`. Every action is pinned by a full commit SHA; `packages: write` is requested
  only by the publish job.
- The Dockerfile, `compose.example.yaml` and every source file stay unchanged. The build-from-export path of docs/11
  stays valid.

## Facts for the owner

- `expect_labels` binds only the revision label (`{commit}`). With `release = "commit"`, `{release}` equals the commit,
  so the semver `version` label is informational and cannot be bound.
- Ingat pulls `ghcr.io/cdsemi/timesheet:<commit>` by tag, then pins the pulled image by its image ID and records the
  repository digest. It does not pull by a digest written in the manifest.
- Ingat 0.1.x cannot run `log_snapshot`, non-empty deploy prechecks, postchecks or baseline, or a subnet param left to
  allocation. The manifest omits them. `ingat validate` does not detect them, so CI cannot protect against that class of
  error; revisit when the pinned Ingat image changes. `ingat validate` also checks the Compose policy with CPU CFS assumed
  present, so a later non-zero `cpus` would pass CI although the target host refuses it; any CPU limit must stay an
  optional param that sends nothing when unset. A fixed-subnet Compose file is a later Ingat item, and
  `TRUSTED_PROXY_ADDRESSES` is set after the first install until then.
- The manifest has `verify = []` because the app has no read-only verify command; `min_free_memory` is an unmeasured guess.
- Spike S15 (Node.js on a 4.4 kernel): the image runs Node.js v24.21.0 on glibc (Debian 13). Its release line lists
  GNU/Linux x64 with glibc as Tier 1 from kernel 4.18 (`BUILDING.md`, v24.x). Official support for a 4.4 kernel: no.
  Practical risk: unverified. Nothing was run on a 4.4 kernel. The runtime stays as it is until the owner decides, after
  Ingat's S15 spike runs the image on the target host.
- Nothing has run on GitHub or on the target host: no workflow run, no image pushed, no package created or made public,
  no NAS run and no S15 result exist. They are owner steps (Actions enabled, workflow permissions, package visibility
  and link to the repository) and Ingat's spike.

## Consequences

- The tip commit of each push to `main` adds a GHCR package version; a retention job is a later decision. A commit pushed
  together with later commits gets no image, so Ingat can deploy only a commit that was the tip of a push; before the
  first release this repository pushes after every commit (docs/08).
- The first push creates a private package; making it public, which the target host needs to pull anonymously, cannot be
  undone. The owner does this after reading the first run.
- A published tag is not rebuilt, so a bad image is fixed by a new commit, not by a re-run.
- Bumping the pinned Ingat image is a deliberate change of the digest and its comment in the workflow; manifest keys can
  change before schema 1 is frozen.
- Attestations can be switched on later with one flag, once an Engine 24 host is shown to pull an index cleanly.

## Alternatives considered

- **Build the image on the host:** rejected; Ingat never builds images (Ingat ADR-0026).
- **Attestations on:** rejected for now; the target Engine's pull of an index with attestation manifests is unverified
  and nothing consumes them.
- **A pull request build job:** rejected; it needs `packages: write` and adds nothing the local build does not prove.
- **Publish only on release tags:** deferred; no release tag exists yet. Revisit with `release = "tag"` when one does.
- **A runtime base image change for the 4.4 kernel:** not proposed; the owner decides after S15.
