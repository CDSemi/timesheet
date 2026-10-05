# WP3-T14-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T14-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T14.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (seed, harness, capture code, synthetic screenshots and PDF renders,
  evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  8ad2e4f42ab6f5ec25f66cf3069c2178de536bd2. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T14-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- src/server/seed.ts, src/server/cli.ts, src/server/mail/captureAdapter.ts,
  scripts/smoke-built-server.mjs, playwright.config.ts;
- tests/integration/delivery.test.ts, tests/e2e/fixtures.ts,
  tests/e2e/submission.spec.ts, tests/e2e/automation.spec.ts (new),
  tests/e2e/pdf-visual.spec.ts (new), tests/e2e/assets/pdf-view.html (new), and the
  reported deviation tests/e2e/history-settings.spec.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
677b914268406543b542a5bbb2491e46266ae1bf5e2d950239a259778329b20c; a different value stops
the commit.

Handoff files:
- new: handoff/delivery/tasks/WP3-T14-FREEZE.md and WP3-GATE.md; every file under
  handoff/delivery/evidence/WP3-T14/, including the synthetic screenshots, the five
  `pdf-*-synthetic.png` renders and the `*.mjs.txt` script;
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: WP3-T13C-FREEZE.md, WP3-T14.md and WP3-T15.md; every file
  under handoff/delivery/evidence/WP3-T13C-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T14-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any Playwright output outside the evidence directory, any `.pdf` or `.eml`,
a database, `mail-capture` or `private-data` content, any `.csv` file and any other
source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command); the
precommit check; `git diff --cached --check`; JSON parse of ORCHESTRATION.json; the
orchestration validator; check_recovery.py; `validate_package.py --preflight` with the
workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence). View all five PDF renders and at least three UI
screenshots with the Read tool and record how many; they must show synthetic data only.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed. If it
blocks an email address in a WP3-T14 evidence log, you may replace each such token with
`<email>` in that evidence file only (count with the Grep tool, never print addresses),
record it, re-stage and rerun; a block in a source or test file stops the commit. Do not
print diffs, test bodies, probe sources, names, addresses or CSV content through the
shell. If any other check fails, do not commit; report the file, line and rule. If any
call is denied by a permission check, stop at once; do not retry, split or rephrase it.
Never write into the repository root; on Windows never redirect to /dev/null or nul from
a POSIX shell. Keep your evidence LF, free of trailing whitespace, single final newline.
Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add WP3 end-to-end flows, smoke checks and visual PDF evidence

- test(e2e): sign-off and conflict, automatic submission on/off with an empty period,
  note line and auto-image matrix, resend and uncertain decision, admin boundary; a
  private server fixture with a capture sender
- test(smoke): GET safety by DB snapshot, sign-off 409, private PDF 404, capture check,
  shared-route 404
- fix(mail): no attachment file in captures of attachment-less messages
- test(pdf): page renders in Edge for manual and automatic PDFs (OT on both Sundays,
  Vietnamese and long labels, note and image on/off)
- docs(handoff): WP3-T13C freeze result, WP3-T14 record, evidence, renders and gate
  mapping, WP3-GATE brief, WP3-T15 note, board and checkpoint (+ vi)

Task: WP3-T14-FREEZE

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count, images viewed; check exits; blockers. Evidence in
handoff/delivery/evidence/WP3-T14-FREEZE/. Return at most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 left 42 paths staged and stopped at preflight. The cause was a broken link in
handoff/delivery/tasks/WP3-GATE.md to the WP3 HANDOFF, which does not exist yet. The
coordinator replaced the link with a plain code path. Do not edit WP3-GATE.md yourself.

For attempt 2:
1. Confirm that HEAD and origin/main are still 8ad2e4f.
2. Confirm that the working tree still matches the expected set.
3. Recompute the digest; it must still be 677b9142….
4. Re-stage WP3-GATE.md, this brief, ORCHESTRATION.json and your evidence-free set (the
   same explicit paths).
5. Rerun every check, one command per step.

You need not view the images again; cite the attempt 1 count. Record attempt 2 in your
evidence as a new file (02-checks.txt).

## Results

(Committer appends here.)

- Attempt 1: no commit. Preflight failed: broken link in tasks/WP3-GATE.md -> ../WP3_HANDOFF.md (exit 1). Other checks passed. See evidence/WP3-T14-FREEZE/01-checks.txt.
- Attempt 2: committed and pushed b083739bb8f1d7e8b932c8d5463bfb271ac5b1e5 to origin/main (pre-HEAD 8ad2e4f). Digest 677b9142...; 42 staged; all checks exit 0 (node by full path v24.21.0). See evidence/WP3-T14-FREEZE/02-checks.txt.
