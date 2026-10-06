WP5-ASSESS-A evidence (WP5 first step, fresh independent assessment, area A: integrated workflow, submission and privacy).
Reviewed commit 546cddaf6747aef85e8b6d9b7712de9e28f138bf (WP4-REGATE4 freeze_commit); HEAD e7fe514 (handoff-only); source digest
26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files, handoff/ excluded) before and after.
Reviewer: WP5-ASSESS-A attempt-1 subagent (timesheet-auditor), self-reported claude-opus-5-5.

Masking: <task> = the audit task folder outside Dropbox; <project> = the repository folder; <user> = the Windows account name;
<secret> = a run-time password, cookie value or setup token. Every address is a synthetic example.invalid address (Message-IDs use
timesheet.invalid). ANSI codes removed, LF line ends. Probe sources are stored as *.mjs.txt; PDF renders as *-synthetic.png.
Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0, npm_config_script_shell = Git Bash (no cmd.exe). Every CLI and
server run set DATA_DIR and DATABASE_PATH inside <task>. Ports: SMOKE_PORT 47701, scenario server 47702, fault server 47703. No Docker.
Capture mode only; PRODUCTION_SENDING_ENABLED never set; nothing was sent, committed, pushed or deployed.

00-baseline.txt              HEAD, origin/main, empty non-handoff diff, digest before (script, ls-tree of HEAD and 546cdda, export),
                             git status, tool versions; export command.
01-npm-ci.txt                npm ci on the export (exit 0, 161 packages, no deprecation line).
02-verify.txt                npm run verify (exit 0; 76 files / 1758 tests; build; smoke 41 PASS).
03-e2e.txt                   npm run test:e2e (exit 0; 145 passed, 5 skipped).
04-targeted.txt              vitest run of 18 integration suites and tests/domain (exit 0; 28 files / 747 tests).
10-probe-run-history.txt     every probe run (AC-13 runs 1-12, fault runs 1-3) with the cause of each failed run.
10-ac13-probe-log.txt        AC-13 scenario probe, run of record (run 12): every request, CLI pass and check (77 PASS, 0 FAIL).
11-faults-probe-log.txt      sender/channel fault probe, run of record (run 3): 12 PASS, 0 FAIL.
12-capture-listing.txt       run 12 capture folders: envelope (from/to), headers, subject, decoded body, PDF SHA-256 per attempt.
                             The entry without metadata is the empty folder created by the failure injection (AC08-4).
13-notices-reminders.txt     run 12 outcome notices, overdue warnings and the P2 before-due reminders.
14-admin-and-faults.txt      run 12 admin submissions/operations JSON; fault instance admin views and Gina/Hugo deliveries.
15-pdf-text.txt              pdfjs-dist text of Alice r1 and r2 (manual), Carol P1 (automatic, image) and Frank P2 (automatic, note).
16-records.txt               run 12 Alice review payload, ledger after sign-off, r1 deliveries, history; Carol P1 finalization.
17-logs.txt                  run 12 server log (three starts) and CLI outputs; fault-instance server and CLI output.
18-runs-config.txt           run 12 run-jobs instants and summaries; the synthetic bootstrap configuration.
19-timesheet.txt             run 12 Alice P1 timesheet view (per-day calculations).
*-synthetic.png              PDF page renders of run 12 (alice-r1-manual, alice-r2-correction, carol-p1-automatic,
                             frank-p2-automatic-note), viewed by the reviewer.
ac13.mjs.txt, lib.mjs.txt, faults.mjs.txt, mask.mjs.txt, env.sh.txt   probe, helper, masking and environment sources.
97-precommit.txt             scripts/precommit-check.mjs over this task's files (private git dir outside the repository).
98-process-listing.txt       netstat (no listener on 47700-47719) and node processes at the end (none of this task).
99-digest-after.txt          HEAD and digest after (repository script, ls-tree of HEAD and 546cdda, export); git status.
