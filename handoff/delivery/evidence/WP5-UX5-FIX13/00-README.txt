WP5-UX5-FIX13 evidence index (masked LF text; <task> = D:\.claude-tmp\timesheet\WP5-UX5-FIX13, <repo> = the repository).

Method. Scratch exports in <task>, each with its own npm ci: export-orig (git archive of HEAD 0f52300 plus FIX12's five working-tree files; the original
product), export (the same plus the three FIX13 files copied from the repository after git apply; the proof export), export-digest (clean export, no node_modules).
The patch is WP5-UX5-DIAG6/proposed.patch.txt, applied once with git apply (after git apply --check) to the repository working tree.
Logs stay in <task>/logs; this folder keeps the scripts and the result summary (10-results.txt).

Scripts (run in this order)
  env.sh.txt, census.sh.txt     environment; read-only process census (out/census-*.txt)
  start.sh.txt                  step 1: HEAD, status and diff stat outside handoff/, digest
  setup.sh.txt                  scratch export + npm ci (export-orig; then export with "apply")
  repro.sh.txt                  step 2: reproduction on the original product (late lookup 300 ms; 4x CPU throttle; the new test alone)
  prove1.sh.txt, gap.sh.txt     step 4: repeat 60 at 2 and 6 workers, the two models, the flag-lag matrix on the fixed product
  prove2.sh.txt, restore.sh.txt, mutate.mjs.txt, burn.mjs.txt    load run under the self-stopping burner, five mutants, byte-equal restore
  repocheck.sh.txt              lint, typecheck, build with the dist/ comparison, verify (smoke port 50820), git diff --check
  prove3.sh.txt, run-pw.sh.txt  npm test in the export, real-clock FULL e2e per project, one sweep-instant run (FIX10 shiftclock.mjs unchanged)
  digest.sh.txt, digest-export.sh.txt   step 5, last: clean export, digest in the repository form and the export form
  delay-snippet.ts.txt, throttle-snippet.ts.txt   DIAG6's scratch models, appended to scratch copies of the specs only
  waitfor.mjs.txt               read-only bounded wait used as a Bash background task (exit notice)
Results: 10-results.txt.
