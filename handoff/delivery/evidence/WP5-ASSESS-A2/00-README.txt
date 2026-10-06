WP5-ASSESS-A2 evidence (WP5-ASSESS-A attempt 2: digest-bound area-A delta recheck on the WP5 package-final freeze).
Reviewed commit 74d5bfec6700126da4105b5d97f5efe943f896f5 (WP5-GATE freeze_commit; HEAD = origin/main); delta base
546cddaf6747aef85e8b6d9b7712de9e28f138bf. Source digest 0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba
(779 files, handoff/ excluded) before and after, in the repository, the git ls-tree form and the clean export.
Reviewer: WP5-ASSESS-A attempt-2 subagent (timesheet-auditor), self-reported claude-opus-5-5. Fresh context; not the
attempt-1, WP5-ASSESS-B or WP5-FINAL-AUDIT auditor; authored no WP1-WP5 change.

Masking: <task> = the audit task folder outside the repository; <project> = the repository folder; <user> = the Windows
account name; <secret> = a run-time password, cookie value or setup token. Every address is a synthetic example.invalid
address. ANSI codes removed, LF line ends. Probe and script sources are stored as *.mjs.txt / *.sh.txt.
Runtime: Git Bash, portable Node v24.21.0 by full path first on PATH, npm 11.18.0, npm_config_script_shell = Git Bash (no
cmd.exe). DATA_DIR and DATABASE_PATH inside <task> for every CLI and server run. Ports: SMOKE_PORT 47701, probe servers
47702 and 47703. No Docker. Capture mode only; PRODUCTION_SENDING_ENABLED never set; nothing sent, committed or pushed.
WP5-PILOT ran on the same machine during the whole session (its folder was created at 21:53:41Z).

00-baseline.txt              HEAD, origin/main, digest before (script, ls-tree of HEAD, of 74d5bfe and of 546cdda), git
                             status, export digest and export change list, tool versions.
01-delta.txt                 git log, name-status, stat and per-commit non-handoff paths 546cdda..74d5bfe; the diff of
                             .env.example, compose.example.yaml and README.md (docs/11 and docs/12 are read in git).
02-npm-ci.txt                npm ci on the export (exit 0, 161 packages, lockfile unchanged, no deprecation line).
03-verify.txt                npm run verify (exit 0; 77 files / 1759 tests; build; smoke 41 PASS).
04-e2e-run1.txt              npm run test:e2e run 1: exit 1, 144 passed, 1 failed (net::ERR_NO_BUFFER_SPACE console error in
                             submission.spec.ts:62 desktop), 5 skipped. Environmental (WP3 carry 12); rerun once.
04-e2e-load-before-run2.txt  listeners in the WP5-PILOT range and process counts before the rerun.
04-e2e-run2.txt              npm run test:e2e run 2: exit 0, 145 passed, 5 skipped (4.0 min). run-e2e.sh.txt shows the run-2
                             output name; run 1 used the same script writing 04-e2e.txt.
05-parity.txt                EN/VI structure and area-A token parity of docs/11, docs/12 and README (parity.mjs.txt).
06-ac13-run1..3.txt          tests/integration/ac13-two-week.test.ts alone, three times: exit 0, 1 test each.
06-ac13-tz-env-not-applied.txt  TZ=Pacific/Kiritimati set in Git Bash: NOT applied (Node reports America/Los_Angeles; Git Bash
                             drops TZ for native processes). Kept to show why the zone runs below use a preload.
06-ac13-zone-*.txt           the test with the machine zone set at run time (settz.mjs.txt preload): Asia/Tokyo,
                             Pacific/Kiritimati, Etc/UTC, America/New_York; the vitest "Start at" line shows the local zone.
06-ac13-now-*.txt            the test with the wall clock moved to 2027-01-20T12:00:00Z and 2025-06-15T12:00:00Z
                             (shiftnow.mjs.txt preload).
07-mutation.txt              scratch copy (git archive 74d5bfe + npm ci, outside the repository): control pass; mutation 1
                             (repeats WP5-AC13 mutation 1, N threshold skipped) fails; mutation 3 (auditor's own: signature
                             read without its ownership filter) fails; both restored and compared equal to the export.
08-probe-run-history.txt     probe runs 1 (4 probe-defect FAILs) and 2 (run of record, 26/26) and the scan-order observation.
08-probe-log-run1.txt        probe run 1 log.
08-probe-log-run2.txt        probe run 2 log (run of record): shares and revocation, sender/recipient faults, secrets,
                             administrator status, activation route, capture self-test and the deep-link checks.
08-admin-operations.txt      GET /api/admin/operations of run 2 (the status the runbook refers to).
08-alice-deliveries.txt      the capture-mode delivery record of run 2 (provider_response "captured").
08-capture-listing.txt       run 2 capture folders: envelope, headers, decoded body, PDF SHA-256.
08-faults-*.txt              fault instance: Gina (sender_missing), Hugo (recipient_missing), admin submission status.
08-server-log.txt, 08-cli-outputs.txt   run 2 server logs (both instances) and CLI outputs (setup tokens masked).
08-inspect-probe-1.txt, 08-inspect-probe-2.txt   read-only database inspection of runs 1 and 2 (inspect.mjs.txt).
96-preflight.txt             handoff/delivery/validate_package.py --preflight (workflow Python) after the reports were written:
                             PASS, 89 translation pairs, 2068 local links.
97-precommit.txt             scripts/precommit-check.mjs over this task's files, staged in a private git dir outside the
                             repository.
98-process-listing.txt       no listener on 47700-47719 and no portable-Node process of this task at the end.
99-digest-after.txt          HEAD and digest after all runs (repository, ls-tree, export); export change list empty.
*.mjs.txt, *.sh.txt          probe, helper, preload, masking and run-script sources.
