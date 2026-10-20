WP5-UX3-REGATE3 evidence index (masked LF .txt only; no screenshots were taken)

Target 86294412ce15e221f6e0fbc782f0b52a332352be, digest 245e9459a06c7d36ceb780d5e0de379be74303081d1d93b24c5469c24eca3f90 (833 files).
Workflow Python and the browser profile live under <user>. Task folder: <task>.

Naming
- NN-*.txt           numbered command outputs (digest, ci, lint, verify, e2e, AC-13, drill, config, validators, scope, docs, mutants)
- log-*.txt          raw run logs (master*-progress, sweep-*, control-*, probe-*, solo-*, drill, cfg, keys, rest, cmp-dist)
- obs2-*.txt         probe observations (audit, fix4 incl. the rerun, a11y-scan, phone)
- *.sh.txt, *.mjs.txt, zz-*.ts.txt   scripts and task-local probes (never part of the repository)

Key files
- 01-digest-*, 01-head-*, 87-*        digest forms (export, ls-tree, npm run digest) and git state before and after
- 04-e2e*.txt                         FULL e2e on the real clock (651 passed, 67 skipped, 0 failed)
- log-sweep-full-1026.txt, log-sweep-full-1101.txt, log-control-*.txt   reduced simulated-clock sweep (1101 has the one failure)
- log-solo-*.txt                      the failing test repeated alone at four instants
- 70-mutants.txt, log-mut-*.txt       FIX4 mutants (scratch copy export-mut only)
- obs2-fix4.txt, log-probe-fix4*.txt  More panel, Sign out alignment and contrast, ring under the pointer, 44px, note, Confirm breaks today
- obs2-audit.txt, obs2-a11y-scan.txt, obs2-phone.txt, axe-*.txt   audit probe, axe 4.14.0 scans, first screen and 44px
- 20-22-*, 24-*, 30-*                 boundary, scope, assertions, docs/chunk
