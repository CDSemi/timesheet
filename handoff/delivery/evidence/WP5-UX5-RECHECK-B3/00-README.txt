WP5-UX5-RECHECK-B3 evidence (auditor's own runs; masked LF text; synthetic data, capture and stub adapters only).
Task folder <task> (outside the repository). Target a5cbc91e6965633a0f9d1dd7e912577321cc71e3 (WP5-UX5-FIX17-FREEZE, REGATE12's
freeze_commit); base be2afa2e3c43514581ed62fd145c15eeef13b534. Node v24.21.0 portable, npm 11.18.0. Ports 51421-51428 (HTTP probe).
Three clean exports of the target: export (mandatory checks and e2e), probe (probes), mut (mutants); npm ci in each.

00-digest-before.txt / 00-digest-after.txt   digest in three forms (npm run digest, git ls-tree of HEAD and of the target, clean exports)
01-author-models.txt                          board: WP5-UX4 / WP5-UX5 tasks, kinds, models, agent ids; no other task with this agent id
02-*                                          change scope be2afa2..target outside handoff/, the src/docs diff, the integration-test diff,
                                              the FIX17 diffstat (tests/e2e only)
03-census-*.txt                               read-only host census (process names, ids, percent of one core only): start, before the
                                              e2e, during the e2e, end
10-*                                          setup and the mandatory chain in the export: typecheck, lint, build, npm test once,
                                              21 area-B integration files once, AC-13 once under Asia/Tokyo
11-*                                          real-clock FULL e2e, both projects, one run
20-*                                          who writes the cancelled job state (code, history, the original drop guard) and the docs lines
21-*                                          EN/VI parity of docs 02, 05, 11, 12 and their line counts at base and target
22-drill-release-grep.txt                     REGATE11's drill stage 3 lines and the drill script's release lines; src/scripts diff since 1fe5ad3
23-diff-e2e-fix17.txt                         FIX17's e2e diff (read for loosening; area A)
24-stale-predicate-grep.txt                   where the old state list text still appears (R-UX5B4-4: the comment at restore.test.ts:616)
40-*                                          RECHECK-B2's in-process restore probe, unmodified (cmp equal), on the target: 12 cases
41-*                                          this recheck's own in-process probe: run 1 (X1-X5, source -run1) and run 2 after the e2e
                                              (X1-X5 unchanged plus X6, source -run2); the N5p and N10p mutant runs used the run-1 source
42-*                                          RECHECK-B2's in-process midnight and DST probe, unmodified, on the target
50-*                                          RECHECK-B2's HTTP and CLI probe, unmodified (cmp equal), on the built probe export: sections A-D
60-*, 61-*                                    mutants: the script, the summary, per-mutant logs, the first failing assertions, observations
90-*                                          the scripts used (env, setup, chain, probes, e2e, digest, mask, parity, board, collect)
99-leftover-check.txt                         nothing of this task left running
