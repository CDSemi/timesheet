# INGAT-T0T8-CI dispatch brief (watch the first GitHub runs and check the GHCR tag)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-CI, kind gate
  (observation), attempt 1. It depends on INGAT-T0T8-COMMIT (done: commit
  `6173f07777d3a972db77208390df86a5f7de1a11` pushed to `main` of `CDSemi/timesheet`).
  Not on `ORCHESTRATION.json` (see `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`); do not
  edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium), requested model sonnet, no
  override. Routing: size S, risk L, novelty no. docs/08 row "Gates, digests, evidence".
  Write the task record in English.
- **Authority.** The owner asked for the push and for CI to be watched (quoted in the
  checkpoint). This task only reads public endpoints. It changes no GitHub setting, uses
  no credential and no signed-in tool (no `gh`, no `docker login`/`logout`, no token of
  the owner), and pushes nothing.

## What to observe

The push to `main` should start two workflow runs for head SHA
`6173f07777d3a972db77208390df86a5f7de1a11`: `ingat-validate` (`.github/workflows/ingat-validate.yml`)
and `image` (`.github/workflows/image.yml`). Read both files first so you know the job and
step names.

1. **Runs.** Unauthenticated GitHub REST API (public repository; about 60 requests per hour
   per address, so poll at most once every 60-90 s and stay under 45 requests in all):
   - `GET https://api.github.com/repos/CDSemi/timesheet/actions/runs?head_sha=<sha>`
     until both runs have `status` `completed`, or 45 minutes pass;
   - then for each run `GET …/actions/runs/<run_id>/jobs`: job and step names,
     `conclusion`, start and end times;
   - for any failed job, `GET https://api.github.com/repos/CDSemi/timesheet/check-runs/<job_id>/annotations`
     (the error lines; logs themselves need a sign-in and are out of scope).
   - If no run appears within 10 minutes, record that (Actions may be disabled or need
     approval) and also `GET https://api.github.com/repos/CDSemi/timesheet/actions/workflows`.
2. **GHCR tag.** Anonymous registry reads only, after the `image` run completes:
   - `GET https://ghcr.io/token?scope=repository:cdsemi/timesheet:pull` (record only the
     HTTP status and whether a token came back; never write a token value anywhere);
   - if a token came back, in the same script use it for
     `HEAD https://ghcr.io/v2/cdsemi/timesheet/manifests/6173f07777d3a972db77208390df86a5f7de1a11`
     with the OCI and Docker manifest `Accept` types, and record the HTTP status and the
     `Docker-Content-Digest` header; if that succeeds, also fetch the manifest and its
     config blob and record `os`, `architecture`, `config.User` and the labels
     `org.opencontainers.image.revision`, `org.opencontainers.image.version`,
     `org.opencontainers.image.source`.
   - A denied anonymous token or a 401/403/404 is the expected sign of a still-private
     package; report it as such, not as a failure of the workflow.
3. **Interpretation.** Say plainly: commit SHA; each run's conclusion and URL
   (`html_url`); for `image`, whether its "build, push and check the image" step
   succeeded (that step pushes the tag and fails unless the pulled image is
   `linux/amd64`, user `10001:10001`, revision = the commit and version = `package.json`);
   whether the tag is anonymously readable; and the owner steps still open (package
   visibility to Public, Actions permissions) as observed, not guessed.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-T0T8-CI/` (API responses trimmed
  to the fields above, as `.json` or `.txt`, no tokens); task folder
  `D:\.claude-tmp\timesheet\INGAT-T0T8-CI` (raw responses, scripts, the poll log).
- Nothing else. No source, doc or workflow edit. Do not stage, commit or push.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. Use `curl -sS` with
  `-o <file>` and `-w '%{http_code}'`; send a `User-Agent` header (the GitHub API requires
  one) and `Accept: application/vnd.github+json`.
- Polling: write one poll script with the Write tool (a bounded loop with `sleep` that
  appends one line per poll to a log in the task folder and exits by itself after both
  runs complete or the time limit), run it with the Bash tool in the background, then read
  the log with Read. Do not start a second poller while one runs.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - To read JSON fields, write a small script file and run it with the workflow Python
    `-I`: `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never run anything against the owner's NAS. Never use a credential.
- Before returning, no background command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step. Record one line
  `Decision: PASS | FAIL | NOT VERIFIED` (PASS = both runs succeeded), then
  "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the Decision, both run
conclusions and URLs, and the GHCR finding.

## Results

Self-reported model: claude-sonnet-5-5.

Commit: `6173f07777d3a972db77208390df86a5f7de1a11` on `CDSemi/timesheet` main.

Commands (Git Bash, no credential): `bash /d/.claude-tmp/timesheet/INGAT-T0T8-CI/poll.sh`
(background, exit 0, log `D:\.claude-tmp\timesheet\INGAT-T0T8-CI\poll.log`). Both runs were
already completed at the first poll (HTTP 200), so no waiting was needed. API requests
used: 3 (runs, 2x jobs); no failed job, so no annotations call; Actions was enabled.

| Workflow | Conclusion | URL |
| --- | --- | --- |
| ingat-validate (job validate, step "ingat validate" success, 01:35:12-01:35:18Z) | success | https://github.com/CDSemi/timesheet/actions/runs/39884811892 |
| image (job publish, step "build, push and check the image" success, 01:35:29-01:36:00Z) | success | https://github.com/CDSemi/timesheet/actions/runs/39884811864 |

The image step succeeded, so it pushed the tag and its in-step check passed
(linux/amd64, user 10001:10001, revision = commit, version = package.json); this is the
workflow's own check, not a separate observation of mine.

GHCR anonymous read: `GET https://ghcr.io/token?scope=repository:cdsemi/timesheet:pull`
returned HTTP 401 and no token, so the manifest, digest, platform, user and labels could
not be read. This is the expected sign of a still-private package (owner step still open:
set the package visibility to Public). Actions permissions: packages write worked.

Evidence: `handoff/delivery/evidence/INGAT-T0T8-CI/` (runs.json, jobs-*.json). Source not
edited; nothing staged or committed.

Decision: PASS

Status: done
