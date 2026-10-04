# WP2-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-GATE; package WP2; kind gate; attempt 1;
  depends on WP2-T13-FREEZE. This is the package-final gate.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Read AGENTS.md from disk first (rules 4, 5 and 11). Then read:
  - [WP2-PLAN](WP2-PLAN.md) section D;
  - handoff/prompts/WP2_REVIEW.md;
  - handoff/delivery/WP2_HANDOFF.md;
  - the T09A harness notes in [WP2-T09A](WP2-T09A.md).
- Target: `freeze_commit` = the WP2-T13-FREEZE commit, which the coordinator gives at
  dispatch. Record HEAD, origin/main and the source digest before and after.
- Do not edit source, commit or push.

## Environment

- Work in a `git archive` clean export of the freeze commit, in a temp directory outside
  Dropbox. Delete it afterwards.
- Disk space:
  - WP2-T13 found the B: temp drive full once. Check free space first, and use a temp
    directory on a drive with room, such as the C: user temp.
  - If leftover directories from this project's e2e harness fill the temp drive, you may
    delete them. Take their prefixes or locations from tests/e2e/fixtures.ts and
    playwright.config.ts, and delete only directories that no process is using. List
    every path you remove and its size.
  - Delete nothing else. Never delete anything under B:\Temp\claude.
- Call the Node 24 portable binary by its full path; bare `node` may resolve to v26.
  Record `node --version`.
- The e2e harness uses the installed Edge (channel msedge). Download no browser.
- Privacy hygiene:
  - write command output to evidence files;
  - do not echo CSV content, seeding code or test bodies into the transcript;
  - use only synthetic data.

## Steps (record each command, exit code and counts)

1. Run `npm ci`. Then run
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation npm run verify`. Expect exit 0
   with no deprecation warning.
2. Run `npm test -- --reporter=verbose`. Record the counts per file, including:
   - LG-01…LG-08 and LG-10;
   - the LG-09 zero-delta check;
   - DF-01…DF-16.
3. Run the OT-leave concurrency test at least 20 times. LG-07 needs exactly one winner in
   every run, and the consume/cancel/reverse races must leave no duplicate deltas.
4. Migrations:
   - a fresh database;
   - a database created and populated with the code at `f32978f` (WP1 schema), then
     upgraded through every WP2 migration. Run `integrity_check` and
     `foreign_key_check`, and confirm the rows are preserved.
5. Run `npm run test:e2e` on both projects (desktop 1280×800 and mobile 390×844) against
   the built server, a fresh temp database and the synthetic seed. Confirm that these
   flows are covered and pass:
   - sign-in and the two-week view;
   - manual entry with break confirmation (09:00–18:00 gives R 480, credit 0);
   - Clock in and out with version;
   - batch category with a conflict;
   - partial leave 240/240;
   - permission, reserve 480, partial use, cancel and reverse;
   - insufficient balance;
   - evidence CSV download;
   - holiday CSV preview with error rows, then commit;
   - user deactivation revoking the session;
   - a second employee's ID or URL swap giving 404;
   - an admin unable to open employee data.
   Map each flow to its spec and test name. A missing flow is a gate finding.
6. Copy one screenshot per flow into handoff/delivery/evidence/WP2-GATE/ as
   `*-synthetic.png`. Save the exported CSV as `evidence-export-synthetic.csv.txt`.
   Confirm that only reserved-domain emails appear, using Grep with masked output.
7. Run `npm run digest` and cross-check it with `git ls-tree`. Record the digest as the
   WP2 identity.
8. Run the orchestration validator, check_recovery.py, and `validate_package.py
   --preflight` with the workflow Python.

## Verdict

- PASS only if every step passes.
- FAIL if any step fails. Give the step, the evidence file and the failing output.
- NOT VERIFIED if a step could not run, with the reason.

Append the results here. Evidence goes in handoff/delivery/evidence/WP2-GATE/ (masked,
LF, free of trailing whitespace, single final newline).

Return at most 250 words, beginning with your self-reported model:
- freeze commit and digest;
- each step's exit and counts;
- the flow map summary;
- the verdict.

## Results

(Verifier appends here.)
