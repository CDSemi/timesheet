WP5-CALDEF-SAMPLES evidence index (synthetic data, capture mode only, PRODUCTION_SENDING_ENABLED never set)
Target: b810ba942c608e058bd8c146de6f076734c48bf2, digest 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
Task folder (outside the repository): D:\.claude-tmp\timesheet\WP5-CALDEF-SAMPLES, ports 52330-52369 (only 52330 used).

00-head.txt, 00-status.txt, 00-head-after.txt, 00-status-after.txt  HEAD and origin/main; status outside handoff/ (the eight uncommitted documentation files)
00-node.txt, 01-archive.txt        Node v24.21.0; clean git archive export exit 0
01-digest-export-before.txt / -after.txt  scripts/source-digest.mjs on the export (git init + git add in the export only): equals the target, before and after
02-ci.txt, 02-exits.txt, 03-build-server.txt  npm ci and npm run build:server (both exit 0)
make-samples.mjs.txt, extract.mjs.txt, ready-check.mjs.txt, compare.mjs.txt  script copies
41-script-diffs.txt                diff of each copy against WP5-UX5-REGATE15's copy (label line, port only)
42-make-samples.txt, 43-extract.txt, 44-ready-check.txt, 42-exits.txt  run output and exits (all 0)
45-compare-run.txt, samples/samples-compare.txt  comparison with WP5-UX5-REGATE15
60-commits.txt, 61-diffstat-server.txt, 62-diffstat-pdf-mail-jobs.txt  commits dc487c6..b810ba9; server diff; the pdf, mail, jobs, reviewPayload and deliveries paths are unchanged (empty stat)
samples/                           11 msg-*.txt, 6 pdf-text-*.txt, sample-index.txt, 6 pilot-*-p1-synthetic.png (each viewed after it was made)
