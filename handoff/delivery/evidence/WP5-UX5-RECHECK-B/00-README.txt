WP5-UX5-RECHECK-B evidence (auditor: timesheet-auditor, fresh context, self-reported model claude-opus-5-5).
Target: a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5, source digest 4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f (882 files).
All runs used two clean git-archive exports of the target in the task folder (<task>/export: the mandatory checks and the
real-clock e2e; <task>/probe: probes and mutants), Node 24.21.0, synthetic data, capture mode only, PRODUCTION_SENDING_ENABLED
never set, DATA_DIR and DATABASE_PATH inside the task folder, servers on ports 49890-49897 only. Paths are masked as <task>,
<repo> and <user>. Probe scripts are stored as *.mjs.txt / *.ts.txt / *.sh.txt; no password literal is stored (the HTTP probe
draws random per-run passwords and never prints them).

Files:
00-digest-before.txt / 00-digest-after.txt   digest in three forms (npm digest, git ls-tree of HEAD and of the target, raw export blobs)
01-author-models.txt                         WP5-UX4/UX5 tasks with model and agent id (board, read-only)
02-change-scope.txt                          server, domain and script files changed since f4049aa and since 94accda
10-chain1-exits.txt / 10-chain1-summary.txt  typecheck, lint, build, npm test, 19 area-B integration files, AC-13 under Asia/Tokyo
11-e2e-*                                     real-clock full e2e, both projects
20-docs-*                                    docs diffs, greps, UI strings, board H-1 record, EN/VI parity
30-pdf-probe-*                               the PDF matrix probe (F-UX5B-3) and its script
40-sends-probe-*                             the option-A harness probe (job states, uncertain path, deadline, retry timing) and its script
50-http-*                                    the two-process HTTP probe (option A, race, restore and release) and its script
60-mutants-*                                 own mutants, the AUDIT-B M11 and M12b, and the script
61-mut-*                                     selected mutant logs (failing assertions, full-suite survivors, admin-status e2e runs,
                                             the P4x mini probe and its control run on the target)
62-*                                         the three exports' digests after the probes and mutants (equal to the target, no extra file)
70-drill-fetch-sites.txt                     the four drill edits, node --check
80-client-resend-jobs.txt                    which jobs the Resend button sees (R-UX5B2-2)
81-send-before-pdf-coverage.txt              the integration tests that cover a send claimed before its PDF
90-*                                         the task's shell and node scripts (env, setup, chain, e2e, probes, mutants, digest, mask, parity)
