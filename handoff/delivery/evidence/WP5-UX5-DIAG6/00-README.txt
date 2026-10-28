WP5-UX5-DIAG6 evidence index (masked LF text; <task> = the task folder, <repo> = the repository).

Method. Scratch exports in <task>: export (git archive of HEAD 0f52300 plus FIX12's five test files, own npm ci, digest
bf7ec3f7c47ec97f84d51c9bb18d14945b8e303dcd2b732acee7cbb55d73653f, 882 files; digest-export.txt), export-head (HEAD only; digest-export-head.txt) and
export-apply (a fresh copy of the FIX12 tree for git apply --check). Probes ran in export only. The repository was not changed outside this folder and the brief's Results.

Logs
  log-kbd-*, log-esc-*           Playwright runs of the two flaky tests (baseline: single, repeat 1 worker, repeat many workers, burner).
  log-*-p-*, diag-*-jsonl.txt    page-side event records of the probes (probe-kbd.ts.txt, probe-esc.ts.txt; analysed by analyze.mjs.txt, listed by showrun.mjs.txt).
  an-*.txt, run-*.txt            analysis tables and the event list of single runs (the frame/event record).
  log-kbd-dly-*, log-esc-dly-*   the REAL tests (original, then fixed) under the late-lookup / CPU-throttle models (delay-snippet.ts.txt, throttle-snippet.ts.txt).
  gap-*-table.txt, log-gap-*     how long the unsaved-edit flag lags behind a keystroke (original product, then fixed).
  log-*-fix-*, log-new-*         the proposed fixes: repeat 60, the new test, the burner runs.
  mutant-exits.txt, log-mut-*    mutants against the fixed tests.
  log-census-*, log-sweep-fixed  the repeat census and the sweep-instant run.
  proposed.patch.txt, patch-check.txt   the patch and its git apply --check against a fresh copy of the FIX12 tree.
Scripts: *.sh.txt, *.mjs.txt, *.ts.txt (probe and snippet sources).
Hosts: census-start.txt / census-end.txt (read-only process census), load-*.txt (CPU load and busiest processes).
