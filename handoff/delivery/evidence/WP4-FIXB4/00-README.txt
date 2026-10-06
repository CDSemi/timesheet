# WP4-FIXB4 evidence (expert; fix of WP4-RECHECK-B3 finding WP4-RB3-01; baseline 972ccda)

Host: the reference host of the budget, Windows 11 x64 developer workstation, Node v24.21.0 (portable, by full path),
one process per measurement. Synthetic data only; packages, databases and files under the task folder (<task>), never
the repository. Paths are masked (<task>, <project>, <user>) and e-mail addresses (<email>); LF; .txt only.

What changed (working tree, uncommitted):
- inflate: one native zlib inflateRawSync call per parsed entry, output buffer sized from the declared size and
  maxOutputLength at the cap (stops as soon as the real output passes it); size and CRC still checked on the real output.
- decode: parts over 512 KiB are decoded in steps and joined (Node returns longer decoded text as an external string,
  which the scanner read about 2x slower: a cost step at about 1 MB a part); kept attribute values are noted while the
  tag is scanned and only the last occurrence of each kept name is decoded, once; short values are decoded by
  concatenation; an address already in canonical form is used as written.
- ceilings: 2 MiB upload (route and reader), 1 MiB of XML a part, 3 MiB a package, 100 000 markup openings a package
  (others unchanged); client text "2 MiB"; budget comment (xlsxReader.ts) and docs/07, docs/11 (EN, VI).
- tests: the reader ceilings and the route/client limits pinned to the documented values (red-first), an incompressible
  upload over 2 MiB refused, a mid-size incompressible package at the ceilings bounded; limit-sized tests re-sized.

Derived bound (06), coefficients measured here (05): time <= 40 ms + 14.8 ns x X + 339 ns x O, memory <= 15 MiB +
13.3 B x X + 428 B x O (X XML bytes, O openings; attributes priced at zero). At the ceilings: about 121 ms and +95 MiB,
24 % and 63 % of the 500 ms / 150 MiB budget. At the old ceilings the memory bound was about +182 MiB.

Files:
00-README.txt              this index
01-baseline.txt            baseline, exports and their identity
02-red-first.txt           new tests against the unchanged limits (5 failures)
03-green.txt               the three test files after the change (125/125) and the new tests verbose
04-root-causes.txt         inflate old vs new; the cost step at about 1 MB a part and its fix; stepped decoding is exact
05-coefficients.txt        per-unit costs, 61 families (the bound's input) and the superseded runs
06-bound.txt               the bound at the chosen and other ceilings, with the worst mixes
07-worst-constructions.txt the worst constructions at the ceilings, before/after, repeats, the whole service call
08-earlier-families.txt    every earlier probe family before/after, at their own sizes and rebuilt at the ceilings
08-raw-*.txt               the raw outputs summarized in 08
09-http.txt                over HTTP with /api/health polled, before/after
10-retained.txt            retained memory after a full GC (no pinning)
11-differential.txt        benign differential against WP4-T09 and the correctness probe
12-code-same.txt           the probed code is the final code
13-e2e.txt, 14-verify.txt, 15-digest.txt  the last three commands, in this order (final run, then the first run
                           before two test comment lines were corrected)
16-incidents.txt           rule breaches, superseded work, deviations
17-precommit.txt           privacy check of this evidence and the changed files on a temporary index
probe-*.mjs.txt            every probe used (masked copies; .txt so lint does not parse them)
