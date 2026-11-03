# WP5-CALDEF-SMOKE dispatch brief (fix the smoke script's DST defect)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-SMOKE, package WP5, kind
  fix, attempt 1, depends on WP5-CALDEF-DOCS (done). You are the only source writer.
- **Why.** WP5-CALDEF-FIX found that `npm run verify` fails at some times of day: the smoke
  step stops with "No Monday found". `recentMonday()` in `scripts/smoke-built-server.mjs`
  steps back in multiples of 24 hours, so in the week after a daylight-saving change (here
  2026-11-01 in America/Los_Angeles) a step near midnight lands on the wrong calendar day.
  The unchanged a54061f fails the same way at the same instant. Evidence:
  `handoff/delivery/evidence/WP5-CALDEF-FIX/19a-npm-run-verify-before-midnight-smoke-defect.log`
  and `19c-smoke-on-a54061f-same-time.log`. The round's gate runs `npm run verify`, so a
  time-dependent failure there would fail the gate for a tooling reason.
- **Coordinator decision (board, 2026-11-03).** Fix it in this round. `scripts/` is workflow
  tooling (AGENTS rule 14) and never enters the image, but this fix is frozen with the
  round's code and so is covered by its gate and audit.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Size S,
  risk L, novelty no. Task record in English.
- **State.** The working tree holds the uncommitted WP5-CALDEF-FIX and WP5-CALDEF-DOCS
  changes and coordinator records under `handoff/`. Leave them alone. Do not stage or commit.

## Work

1. **Reproduce deterministically,** without waiting for a time of day: run the script's date
   logic at fixed instants, for example the reported one (2026-11-02 23:49
   America/Los_Angeles) and instants around both DST changes in the zone the smoke uses. If
   the script has no clock seam, test a copy of the function in a scratch file. Record the
   failing instants.
2. **Fix** with calendar-date arithmetic in the intended zone (step whole local dates, not 24
   hour multiples), keeping the script's behaviour otherwise identical. No deprecated API; no
   new dependency.
3. **Prove** the fixed logic at the same instants plus every hour across the two DST weeks of
   2026 in that zone (all find the right Monday), and run `npm run verify` once normally:
   exit 0, `SMOKE PASSED`.
4. Run `npm run lint` (exit 0; `.mjs` files are linted) and `git diff --check`.

## Writable paths

`scripts/smoke-built-server.mjs`; this brief's Results;
`handoff/delivery/evidence/WP5-CALDEF-SMOKE/`. If the fix needs any other path, stop and
report.

## Rules

Synthetic data only. Stop every process you start with the tool that started it; never kill
any process by PID (the owner's rule), and leave the existing port-3000 node process alone.
Never run a command that waits on stdin (a bare `cat`, `python -`, an unterminated heredoc):
the last two tasks each left one hanging. Do not change the system clock or time zone. Never
invent evidence.

## Results

(worker appends here: reproduction instants, the change, proof table, checks with exit
codes, `npm run digest` value and file count, `git status --short` outside `handoff/`,
slips)

### Worker results (attempt 1)

- Reproduction (fixed instants, LA wall time, no clock change): old `recentMonday()` throws
  "No Monday found" at 2026-11-02T23:49 (= 2026-11-03T07:49Z); across both DST weeks of 2026
  (hourly, 840 instants) the old code fails only at 2026-11-03T07:00Z; new code 0 mismatches
  against an independent oracle. Log: `dst-proof-log.txt`.
- Change: `recentMonday(now = Date.now())` now takes today's LA date and steps whole UTC
  calendar dates back (getUTCDay === 1). Nothing else changed.
- Checks: `npm run verify` exit 0 with SMOKE PASSED; `npm run lint` exit 0; `git diff --check`
  exit 0; `npm run digest` e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7
  (885 files, handoff/ excluded).
- Evidence (all .txt) in `handoff/delivery/evidence/WP5-CALDEF-SMOKE/`: dst-proof.mjs.txt,
  dst-proof-log.txt, old-smoke-HEAD.mjs.txt, npm-run-verify-log.txt, npm-run-lint-log.txt,
  git-diff-check-log.txt, npm-run-digest-log.txt, git-status-outside-handoff.txt (taken at the
  first, failed run; the tree outside handoff/ differs only by scripts/smoke-built-server.mjs
  from the prior state).
- Slip: my first verify and lint failed because I left dst-proof.mjs in the evidence folder and
  eslint parsed it; renamed to .txt per coordinator note and reran, all green. The proof
  script ran from the evidence folder (as .mjs) before the rename; reruns need a scratch copy.
