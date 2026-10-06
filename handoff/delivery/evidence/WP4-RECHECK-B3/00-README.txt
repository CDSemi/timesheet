WP4-RECHECK-B3 evidence (independent area-B recheck after fix round 3). Masked, LF, text only; no workbook or binary.
Reviewed commit 972ccda6409a7521a008c55c35a5b5cf416daf1e, digest 635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b
(775 files) before and after. Runtime: Node v24.21.0 by full path, npm 11.18.0 with script-shell = Git Bash, Git Bash only;
exports of 972ccda (<task>/export) and 13a258d (<task>/t09) made with `git archive`; DATA_DIR and DATABASE_PATH under <task>
for every CLI, test and server run; OUTBOUND_MODE=capture, JOB_RUNNER=off. Packages built only under <task>/pkgs.

Files
  01-baseline.txt          HEAD, source-digest.mjs, ls-tree form, status (before)
  02-npm-ci.txt            npm ci on the 972ccda export (exit 0)
  03-t09-npm-ci.txt        npm ci on the 13a258d export (exit 0)
  04-verify.txt            NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify (exit 0)
  05-suites.txt            vitest run workbook-reader, workbook-import, opening-balance, sharing-matrix --reporter=verbose (exit 0)
  10-b2-catalogue.txt      the WP4-RECHECK-B2 catalogue rebuilt verbatim (E7, E7b-d, Y7-Y9 and the rest): node b2-cost.mjs
  11-fixb3-search.txt      the WP4-FIXB3 search at the final limits: pkgs-B (SEARCH_PART_BYTES=2097152 SEARCH_PARTS=4) and
                           pkgs-Bp (SEARCH_PART_BYTES=4194304 SEARCH_PARTS=2), SEARCH_OPENINGS=150000, via run-cost.mjs
  12-rcb3-run1.txt         auditor's own catalogue round 1 (groups A, K, F, C, M): run-cost.mjs with rcb3-cases.mjs
  13-rcb3-run2.txt         auditor's own catalogue round 2 (A2, F2, C2, X): run-cost.mjs with rcb3-cases2.mjs
  14-phase-F2.txt          phase breakdown (phase.mjs) of F2-rand100 and two compressible controls
  15-repeats.txt           five fresh-process repeats of F2-rand100-d2-wide and A2-rand13amp-wide
  16-http.txt              built server over HTTP with back-to-back /api/health polling (http.mjs)
  17-differential.txt      972ccda against the accepted WP4-T09 reader (13a258d): diff-build, diff-dump, diff-compare, diff-rules
  18-correct.txt           decode-once, kept-attribute cap, R-B2-1 and R-B2-2 (correct.mjs)
  99-digest-after.txt      HEAD, digest and ls-tree form after; export blobs equal to the commit
  probe-*.mjs.txt          the auditor's probes; probe-top.sh.txt the log summarizer

Earlier probes reused verbatim (copied byte for byte into <task>/probes, sha256 equal to the tracked evidence):
  b2-cases.mjs = evidence/WP4-RECHECK-B2/probe-b2-cases.mjs.txt  7eb2763dcad03f0b5f43772a80c5cc369fbde354ea93cdb3e981b4694fc8bb43
  b2-cost.mjs  = evidence/WP4-RECHECK-B2/probe-b2-cost.mjs.txt   258424cc817f9d145aadcf0962364f7a809885933d707be0be7a2350d9de9d0b
  search.mjs   = evidence/WP4-FIXB3/probe-search.mjs.txt         fbc0dd993b0e3db63fe168cb9a0b494fcf1eb894247af2597b63c16373387f01

Measurement: one fresh child process per case and run; maxRSS (process.resourceUsage) before and after one synchronous
previewWorkbook (reader + mapping), the measure the earlier probes used; the HTTP probe measures the whole request and the
health stall. Flags: OVER-TARGET above 350 ms or +105 MiB (the 70 % target of the WP4-FIXB3 brief), OVER-BUDGET above
500 ms or +150 MiB (the budget in docs/07 and xlsxReader.ts). The "stats" column of 12/13 is the builder's own count of
XML bytes (every part read counts), markup openings and attributes, and the upload size; "inside the counted limits"
means every package limit is respected. Two round-2 builders (C2-children-f/v) miscounted and produced a part over 4 MiB;
the reader refused them (part_too_large in 3 ms); they are not in-limit shapes and are not counted.
