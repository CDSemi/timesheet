WP5-RECHECK evidence (closing independent WP5 recheck on the documentation fix freeze).
Reviewed commit 014bd47a8d906c944d2781eba4f2b91c5a532419 (WP5-REGATE2 freeze_commit; HEAD = origin/main). Source digest
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61 (779 files, handoff/ excluded) before and after, in the
repository, the git ls-tree form and the clean export. Delta base 74d5bfe (digest 0a64a75f...01ba).
Reviewer: WP5-RECHECK attempt 1, fresh timesheet-auditor subagent, self-reported claude-opus-5-5. Not the WP5-ASSESS-A
(attempts 1, 2), WP5-ASSESS-B or WP5-FINAL-AUDIT auditor; authored no WP1-WP5 change.

Masking: <task> = the audit task folder outside the repository; <export> = its clean git archive export of 014bd47;
<export-74d5bfe> = the export of 74d5bfe used for the dist comparison; <project> = the repository folder; <run> = the probe
run folder inside <task>; <user-home>/<user> = the Windows profile; <secret> = a run-time password, cookie value or setup
token. Every address is a synthetic example.invalid address. ANSI codes removed, LF line ends (checked: 0 CR, 0 ESC,
0 U+FFFD in every file). Script sources are stored as *.mjs.txt and env.sh.txt.
Runtime: Git Bash, portable Node v24.21.0 first on PATH, npm 11.18.0 run by Node 24 with npm_config_script_shell = Git
Bash (no cmd.exe). DATA_DIR and DATABASE_PATH inside <task> for every CLI and server run. Ports: SMOKE_PORT 47760, probe
server 47761. No Docker. Capture mode only; PRODUCTION_SENDING_ENABLED never set in any process (the only file line with
it is the grep-only synthetic file of 09-grep-flag-check.txt, never loaded); nothing sent, committed or pushed.

00-baseline.txt              HEAD, origin/main, unpushed count, digest before (script, ls-tree of HEAD, 014bd47, 9bcdd88,
                             74d5bfe), git status outside handoff/.
01-delta.txt                 git log, name-status and stat 74d5bfe..014bd47 outside handoff/, per-commit paths, count of
                             changed paths under src, tests, scripts, migrations, package files, Dockerfile, Compose, examples.
02-diff-docs11-en.txt/-vi.txt  the full docs/11 diff 74d5bfe..014bd47 (EN, VI).
03-export-digest-before.txt  the git archive export, tar hash, export digest and listing compared with the ls-tree listing.
04-npm-ci.txt                npm ci on the export (exit 0, lockfile unchanged).
05-verify.txt                SMOKE_PORT=47760 npm run verify (exit 0; 77 files / 1759 tests; SMOKE PASSED).
06-ac13.txt                  tests/integration/ac13-two-week.test.ts alone (exit 0).
07-dist-compare.txt          export of 74d5bfe: digest, npm ci, build; dist hash listings of both builds; identical.
07-dist-hashes.txt           the dist listing (sha256, bytes, path) of the 014bd47 build (= the 74d5bfe build).
08-probe-log.txt             probe run of record (run 1, the only run): 27 PASS, 0 FAIL. Built server in production mode,
                             capture, runner on; Edge headless; the documented console call verbatim from <export>/docs/11.
08-ops-capture-not-activated.txt  GET /api/admin/operations after the captured submission, before activation.
08-status-screen-text.txt    the text of the "Operations status" section of the administrator screen at the same moment.
08-alice-deliveries.txt      the owner's delivery record of the captured attempt (provider_response "captured").
08-reminder-alice.txt        the first reminder after activation (run-jobs at 2027-01-01T00:01Z): headers and decoded body.
08-refusal-table.txt         every CLI command with OUTBOUND_MODE=smtp and no flag: exit, flag message, value leak.
08-bootstrap-config.txt      the synthetic bootstrap file of the probe.
09-grep-flag-check.txt       the documented grep -c check on six synthetic env files (absent, deleted, false, set, quoted,
                             CRLF) and the Git Bash grep CR behaviour.
10-parity.txt                EN/VI structural parity of docs/11 and the packet, per section.
11-flag-grep.txt             grep of docs/05, 07, 11, 12, README and the packet (EN, VI) for flag claims and the old wording.
12-packet-identity.txt       identity tokens of the packet against the WP5-REGATE and WP5-REGATE2 records and evidence.
13-packet-pktid-diff-en.txt/-vi.txt  the uncommitted WP5-PKTID packet changes (git diff HEAD).
14-parity-report.txt         EN/VI structural parity of WP5_RECHECK.md and .vi.md.
95-hygiene.txt               CR, ESC and U+FFFD counts of every evidence file (crcount.mjs.txt).
96-preflight.txt            handoff/delivery/validate_package.py --preflight (workflow Python) after the reports were written.
97-precommit.txt             scripts/precommit-check.mjs over this task's files, staged in a private git dir outside the
                             repository.
98-process-listing.txt       no listener on 47760-47779 and no portable-Node process at the end.
99-digest-after.txt          HEAD and digest after the runs (repository, ls-tree, export; export listing unchanged).
99-digest-final.txt          HEAD and digest at the end, after the reports.
*.mjs.txt, env.sh.txt        probe, digest, dist-hash, parity, masking, hygiene and environment sources.
