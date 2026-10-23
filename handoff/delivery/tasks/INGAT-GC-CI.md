# INGAT-GC-CI dispatch brief (read the GitHub runs of the last two pushes)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-CI, kind gate (observation), attempt 1.
  It depends on INGAT-GC-COMMIT (done: `782cddabae6260a87c600936daf0408eebb17f56` pushed to
  `main`). Not on `ORCHESTRATION.json`; do not edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-light (effort low), requested model haiku, override
  reason none needed beyond docs/08 row "haiku only for pure listing/probes": this task
  only reads public API answers. Routing: size S, risk L, novelty no. English record.

## What to read (unauthenticated public GitHub REST API; at most 15 requests in all)

Send `User-Agent: timesheet-ci-probe` and `Accept: application/vnd.github+json`; use
`curl -sS -o <file> -w '%{http_code}'`.

1. `GET https://api.github.com/repos/CDSemi/timesheet/actions/runs?head_sha=782cddabae6260a87c600936daf0408eebb17f56`
   and the same for `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`. Expect `ingat-validate` and
   `image` for each. If a run is not `completed`, wait 90 s with `sleep 90` and read again,
   at most 10 times in all.
2. For each run, `GET …/actions/runs/<id>/jobs`: job and step names and conclusions.
3. For a failed job only: `GET https://api.github.com/repos/CDSemi/timesheet/check-runs/<job_id>/annotations`.
4. `GET https://api.github.com/repos/CDSemi/timesheet/actions/workflows`: confirm that a
   workflow for `.github/workflows/image-cleanup.yml` is listed and its `state`.

## Output

- This brief's Results: a table per commit (workflow, run id, `html_url`, status,
  conclusion, the step that failed if any) and the image-cleanup workflow line. Save the
  answers trimmed to those fields under `handoff/delivery/evidence/INGAT-GC-CI/` (no
  actor, author, e-mail or avatar fields). Raw answers stay in the task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-CI`.
- One line `Decision: PASS | FAIL | NOT VERIFIED` (PASS = all four runs succeeded), then
  "Status: done" and exactly one newline.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. To read JSON fields, write a
  small script file with the Write tool and run it with the workflow Python `-I`:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null` OR `nul`, NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.** Use the Write and Edit tools to create files.
- No credential, no `gh`, no write to GitHub or GHCR, no GitHub setting change, nothing
  against the owner's NAS, no repository file outside your owned paths, no staging or
  committing.
- If a permission check denies a call, stop and report.

Return at most 100 words, beginning 'Self-reported model: ...', with the Decision and the
four run conclusions.

## Results

Requests used: 7 of 15 (public API, no credential, read-only). Trimmed answers: `handoff/delivery/evidence/INGAT-GC-CI/ci-answers-trimmed.json`.

| Commit | Workflow | Run id | html_url | Status | Conclusion | Failed step |
|---|---|---|---|---|---|---|
| 782cddab | ingat-validate | 39909592535 | https://github.com/CDSemi/timesheet/actions/runs/39909592535 | completed | success | none |
| 782cddab | image | 39909592540 | https://github.com/CDSemi/timesheet/actions/runs/39909592540 | completed | success | none |
| 70dce2ac | ingat-validate | 39885375736 | https://github.com/CDSemi/timesheet/actions/runs/39885375736 | completed | success | none |
| 70dce2ac | image | 39885375744 | https://github.com/CDSemi/timesheet/actions/runs/39885375744 | completed | success | none |

Jobs: `validate` (ingat-validate) and `publish` (image) succeeded for both commits. No failed job, so no annotations were requested.

Image-cleanup: workflow `image-cleanup` (`.github/workflows/image-cleanup.yml`, id 393702719) is registered with state `active`.

Decision: PASS

Status: done
