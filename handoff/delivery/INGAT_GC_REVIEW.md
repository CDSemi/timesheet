# Independent review: INGAT-GC (scheduled cleanup of old GHCR image versions)

[Tiếng Việt](INGAT_GC_REVIEW.vi.md) is the translation; English is authoritative.

- Package/date/reviewer and observable model/effort: follow-up "GHCR cleanup" of the side track "Ingat deployability"
  (not on the board); task INGAT-GC-AUDIT attempt 1; 2026-10-22 (America/Los_Angeles); timesheet-auditor, effort xhigh
  (fixed by the profile); self-reported model `claude-opus-5-5`.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: base HEAD
  `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5` (branch `claude/relaxed-lalande-8359f0`) plus 15 uncommitted files whose
  SHA-256 are listed in `handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt`; source digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56` (882 files, `handoff/` excluded). The status outside
  `handoff/` is exactly those 15 paths. The snapshot is uncommitted on purpose, so its identity rests on the hashes and
  the digest; nothing else is unpushed.
- Decision: **PASS**. No defect was found that lets the job delete a release, untagged, non-SHA-tagged, newest-20 or
  younger-than-30-days version, and every required gate ran and passed on this identity. The first live run is unrun by
  design (see below). Optional improvements O1-O9 are listed separately; none blocks acceptance.
- Scope actually inspected/executed:
  - Read in full: `scripts/ghcr-cleanup.ts`, `tests/integration/ghcr-cleanup.test.ts`, both fixtures,
    `.github/workflows/image-cleanup.yml`, ADR 0003 EN and VI; the diffs of ADR 0002, docs/07 and docs/11 (EN and VI)
    and both tsconfig files; `image.yml`, `ingat.toml`, `eslint.config.js`, `.gitattributes`. The PLAN, IMPL, FIX1,
    GATE and REGATE1 records were treated as claims and re-run, not trusted.
  - GitHub's public documentation (19 pages through `docs.github.com/api/article/body`, the OpenAPI description) and
    unauthenticated reads (repository, the two runs docs/07 names, `GET /versions`, `git ls-remote`).
  - Ingat, read-only: ADR-0026, ADR-0007, LIFECYCLE 4.2, 4.6, 4.7, 4.9, 4.10, 4.13, 5.6, ARCHITECTURE (image rows, R14),
    MANIFEST_SPEC release keys.
  - Deletion rule traced end to end. Tags: `git ls-remote --tags` of the public repository runs in each job right
    before the script, anonymously (`persist-credentials: false`, `GIT_TERMINAL_PROMPT=0`); a failure ends the step
    (`bash -e`); `taggedCommits` maps an annotated tag to its peeled commit, refuses any other line and a peeled line
    without its tag, and accepts an empty list. Versions: `listVersions` pages by 100 until a short page, refuses above
    3,000 and an empty package; `parseVersions` refuses any malformed entry and keeps a repeated id once (a page shift
    can only add or drop a version, never mark one; a dropped version is not deleted and only lowers the ranks of
    older ones). Selection, first match wins: untagged keep; any tag that is not `^[0-9a-f]{40}$` keep; any tag in the
    tagged-commit set keep; rank < keepNewest keep; age <= keepDays keep; else delete; a version dated more than a day
    ahead aborts; floors 10 / 7 are enforced in `assertOptions` for every path. `assertSafe` re-checks the tag rules,
    the rank and "not everything". Delete loop: oldest first, each id read again and kept if its digest or tags
    changed, any non-200 or non-204 throws and stops the run; no write without `--apply`, and `--apply` is refused
    offline. Workflow: `plan` (`packages: read`) always; `apply` (`packages: write`) after a successful `plan` for
    every schedule and for a dispatch only with `apply = true` (default false); inputs reach the script through `env`
    only; own concurrency group. Races: a publish adds a newest version the run never listed; a git tag pushed while
    an `apply` run is between its `git ls-remote` and a delete does not protect that version in that run (O6); runner
    clock ahead is bounded by the newest-20 floor, behind by more than a day aborts.
- Evidence table (command | result/exit | evidence; all under `handoff/delivery/evidence/INGAT-GC-AUDIT/`, scripts in
  `D:\.claude-tmp\timesheet\INGAT-GC-AUDIT`):

  | Command | Result / exit | Evidence |
  |---|---|---|
  | `id.sh first` (15 SHA-256, `source-digest.mjs`, status, HEAD) | 0; 15 OK; digest `e47e6344…ee56`; HEAD `70dce2a` | `id-first-*.txt` |
  | `export.sh`: `git archive HEAD`, 15 files by `cp`, `sha256sum -c`, `npm ci` (Node v24.21.0, npm 11.19.1) | 0; 15 OK; 161 packages | `export-hashes.txt`, `npm-version.txt`, `npm-ci.txt` |
  | `vitest run tests/integration/ghcr-cleanup.test.ts` | 0; 29 passed | `g1-vitest.txt` |
  | `npm run typecheck`; `npm run lint` | 0; 0 | `g2-typecheck.txt`, `g3-lint.txt` |
  | `npm test`; `npm run verify` | 0, 101 files / 2374 tests; 0, `SMOKE PASSED`; no "deprecat"/"warn" | `g4-test.txt`, `g5-verify.txt`, `deprecation-scan.txt` |
  | `dry.sh`: fixtures with `--now 2026-11-01T00:00:00Z`, defaults and `--keep-newest 10 --keep-days 7`; 11 refusals | 0, keep 35 delete 5; 0, keep 15 delete 25; 1 each, one `::error::` | `dry-*.txt`, `refuse-*.txt` |
  | `mut.mjs`: 17 own mutation probes on the export copy | 13 killed; 2 survive as test gaps (O4); 2 equivalent; restored, sha256 `4302a44f…` | `mut-summary.txt`, `mut-a*.txt` |
  | `lint-probe.mjs`: a deprecated `escape()` call appended to the export copy | lint 0 before, 1 with `@typescript-eslint/no-deprecated`; restored | `lint-coverage-probe.txt` |
  | `lsremote-probe.mts` on a real `git ls-remote --tags` (git/git, 1012 annotated tags) | 0; every peeled commit in the set, no tag object | `lsremote-real-probe.txt` |
  | actionlint 1.7.12 by digest, `--network none`, read-only, three workflows; SHA-pin check | 0, no finding; PASS 4 + 3 + 1 | `actionlint.txt`, `sha-pin-check.txt`, `uses-lines.txt` |
  | anonymous `git ls-remote` of setup-node v7.1.0, checkout v7.0.1 and `CDSemi/timesheet` tags | 0; `949feb24…`, `3d3c42e5…` equal the pins; no git tag | `public-repo.txt` |
  | GitHub docs and OpenAPI; unauthenticated `GET /repos/CDSemi/timesheet`, the two runs, `GET /versions` | 200; Organization, public; both runs `success` on `6173f07` | `api-facts.txt`, `public-runs.txt`, `public-repo.txt` |
  | parity on four pairs; `validate_package.py --preflight`; `git diff --check`; whitespace of the 7 new files | PARITY OK x4; PASS, 127 pairs; 0; none | `parity.txt`, `preflight.txt`, `diff-check.txt`, `trailing-ws-untracked.txt` |
  | `priv.sh track`: scratch repository with `.gitattributes`, 15 files plus 258 track files under `handoff/` | precommit PASS, 0 blocking, 0 warnings; `diff --cached --check` 0; no marker | `privacy-track*.txt` |
  | `id.sh last` | 0; 15 OK; digest unchanged; HEAD unchanged; status outside `handoff/` identical; new paths only the auditor's | `id-last-*.txt` |

- Findings (severity | file/function | reproduction | expected/actual | rule/AC | bounded fix): none. Each requirement
  was met: the owner's request (no release is deleted by the job; releases are deleted by hand), D1 (any git tag), D2
  (20 newest and 30 days, floors 10 / 7, no per-run cap: `--max-delete` is refused), D3 (the `apply` job runs for every
  schedule, a manual run is a dry run unless asked), D4 (no personal token or secret), the plan's safety design, and
  AGENTS rules (EN canonical with VI pairs, ADR 0003 for the new concept, no deprecated API under the lint, no claim of
  a live run or a deletion).
- Risks and optional improvements, separate from proven defects:
  - O1. ADR 0002 still says "nothing has run on GitHub" (line 3) and "no workflow run, no image pushed, no package
    created" (Facts, lines 55-57; VI likewise), while docs/07 now states, correctly, that both workflows succeeded on
    `6173f07` (verified: `public-runs.txt`). Pre-existing since the `6173f07` push and outside this package's edit
    scope (IMPL disclosed it); correct both lines EN and VI in the commit or the next record task.
  - O2. The tag duty is stated correctly ("tag any commit whose backups must stay restorable beyond 30 days"); a plainer
    form would say: tag each commit you deploy to the NAS, because its bundles are restored in its own image, and on
    DSM a Container Manager storage-driver change hides local images so recovery re-pulls the recorded digests (Ingat
    ARCHITECTURE R14), as does a new host.
  - O3. The script pins REST API version `2022-11-28`. GitHub lists it as supported until 2028-03-10 and sent no
    `Deprecation` header, so this is not a rule-11 defect today; after that date the run fails closed (410). Moving to
    `2026-03-10` needs no code change for these endpoints (no package-version entry in its breaking changes).
  - O4. Test gaps (code correct): removing the length check from `sameTags` (a version that lost a tag, or became
    untagged, after the listing would be deleted) and unanchoring `COMMIT_TAG` (a tag containing a 40-hex run, such as
    `sha256-<64 hex>.sig`, would count as a commit tag) leave every test passing. Add one test for each.
  - O5. `assertSafe` re-checks every rule except the age rule, while ADR 0003 says the second check "throws if a
    result breaks a rule". The age rule is covered by tests (probes a01, a02: 4 failures each). Either add the age check
    (it needs the clock and `keepDays`) or name the rules it re-checks.
  - O6. A git tag pushed during an `apply` run, after its `git ls-remote`, does not protect a version deleted in that
    run; only versions older than 30 days and outside the newest 20 are exposed, so a tag made within the documented
    deadline is never late; the 30-day restore remains.
  - O7. The listing with `packages: read` is as unverified as the delete (OpenAPI `enabledForGitHubApps: false`); the
    first scheduled run may fail at the plan job, and the same "Manage Actions access" check applies. Deletion with
    `GITHUB_TOKEN` is documented as public preview, subject to change; both fail closed.
  - O8. Dates: docs/07 and ADR 0003 give the first image as 2026-10-22, the project's local date; GitHub records the
    push at 2026-10-23T01:35Z, so with the UTC job the first possible deletion of that version is the 2026-11-22 03:17
    UTC run ("about 2026-11-21" stays conservative). Whether the private package held older versions before `6173f07`
    could not be observed; any such version is non-release by D1 and would be deleted by the first run (restorable for
    30 days), consistent with D3.
  - O9. Minor: an undeletable public version (more than 5,000 downloads) at the oldest end would stop every later run at
    the same place; docs/11 summarises the rule without the newest-20 part; ADR 0002 line 61 exceeds the file's wrap
    width.
  - Confirmed correct, for the record: the rules and their order, floors, the future-date and never-everything aborts,
    the parsers, paging, re-read, stop on the first failure, the dry-run default, `--apply` refused offline, per-job
    permissions, `persist-credentials: false`, inputs through `env`, `inputs` usable in workflow `env` and job `if`,
    SHA pins, own concurrency group, the docs/07 and docs/11 statements, the ADR 0003 V/C marks, EN/VI meaning.
- Required gates unrun/blocked and why (unrun by design, not passes): any run of `image-cleanup.yml` on GitHub; the
  live version list of the private package (presence of `metadata.container.tags`); whether `GITHUB_TOKEN` may list and
  delete (the package's "Manage Actions access" role); any deletion or restore; Ingat on the target host. No
  authenticated call, no `gh`, no write to GitHub or GHCR, nothing against the owner's NAS.
- Disposition of previous findings: INGAT-GC-GATE attempt 1 (the line-139 abort was reached by no test) is closed: the
  FIX1 tests are present and pass (29 tests); REGATE1 showed both internal checks killed, and this audit added 17
  different probes. The plan's cap and repository-variable gate are absent, as D2 and D3 require.
- Software readiness, owner permission and pilot result separately: software ready for commit by `timesheet-committer`
  under the owner's standing rules; committing to `main` activates the schedule, which can first delete around
  2026-11-22. Owner steps: confirm the package's "Manage Actions access" role, tag commits per the duty, read the first
  scheduled run. No live run or pilot result exists.
- One next action/prompt: the coordinator records PASS and dispatches `timesheet-committer` for the 15 files and the
  track's records (with O1 folded in if the owner wants it); O2-O9 can go to a later follow-up.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: INGAT-GC-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, self-reported); authors: the planner of INGAT-GC-PLAN, the worker of INGAT-GC-IMPL and the fix
  worker of INGAT-GC-FIX1 (all self-reported `claude-sonnet-5-5`); gates INGAT-GC-GATE and INGAT-GC-REGATE1
  (self-reported `claude-sonnet-5-5`).
- Fresh context; confirm reviewer did not author changes: fresh context; the auditor authored nothing in the snapshot
  and wrote only this review pair, the brief's Results, `handoff/delivery/evidence/INGAT-GC-AUDIT/` and the task folder.
- Source digest before/after; gate evidence for that snapshot: `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`
  and the 15 hashes, equal first (`id-first-*.txt`) and last (`id-last-*.txt`); gate evidence
  `handoff/delivery/evidence/INGAT-GC-REGATE1/` (Decision PASS on the same identity).
- New report path preserving previous review history: `handoff/delivery/INGAT_GC_REVIEW.md` and `.vi.md` (first review
  of this follow-up).
- Finding dispositions and next coordinator fix/recheck task: no open finding; optional O1-O9 for the coordinator.
