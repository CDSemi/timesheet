WP5-UX2-AUDIT evidence (independent auditor, attempt 1; synthetic data only). Reviewed commit d1a20a7f0112fa00171fe4b1d6035427855f12b6,
digest 20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files, handoff/ excluded). Node v24.21.0 portable, Git Bash, workflow
Python (user <user>). Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.
All runs used clean exports in the task folder: export/ (git archive of d1a20a7; digest form 1, the mandatory checks and the real-clock e2e),
mut/ (a second archive of d1a20a7 for probes and e2e mutations; its digest is checked equal before and after), mut2/ (unit-level mutations) and
old/ (git archive of 90b98ef for the build diff and the header and axe baselines). Nothing was written into the repository except this folder,
the two review files and the Results section of the brief.

Digest, three forms, first and last
  01-digest-before.txt, 01-digest-after.txt   export form, git ls-tree d1a20a7 form, npm run digest in the repository; non-handoff status
Mandatory checks (export/)
  00-node.txt, 02-ci-exit.txt, 05-typecheck/lint/test/build/smoke.txt, 05-exits.txt (exit codes and deprecation-line counts), 05-test-2.txt
  20-e2e-real.txt, 20-e2e-exit.txt, 20-e2e-window.txt, 20-e2e-observations.txt   FULL e2e on both projects, real clock
  21-ac13.txt   AC-13 once; 21-ac13-tokyo.txt once more with TZ=Asia/Tokyo set
  42-preflight-*.txt   validate_package.py --preflight on the repository with the review pair in place
Scope and server delta
  10-scope-stat.txt, 10-bound-stat.txt, 10-fonts.txt, 10-rasters-nonsynthetic.txt, 11-server-src-diff.txt
  15-round-commits.txt, 15-round-commits-paths.txt (the ten freezes and their non-handoff paths)
  13-old-build.txt, 13-old-exits.txt, 13-dist-diff.txt   own clean builds of 90b98ef and d1a20a7, dist/server, dist/domain, dist/client
  12-*.txt   client diffs read for the review; 30-css-index.txt; 31-device-clock-grep.txt (empty: no Date/now in src/client); 32-rename-src.txt;
  33-client-clock-strings.txt (empty: no visible "Clock" string left in src/client)
Docs
  14-*.txt (EN/VI diffs), 40-docs-parity.txt (structure and literal-token parity of the six changed pairs), 41-docs-clock-grep.txt
Test strength
  50-test-numstat.txt, 50-test-removed-lines.txt, 50-test-added-skips.txt, 50-focus-ring-diff.txt, 51-expect-counts.txt (no file lost expect( or tests),
  52-vitest-90b98ef.txt and 52-vitest-d1a20a7-scratch.txt (83 files / 1831 tests before, 88 / 1878 after)
  72-unit-*.txt   unit-level mutations (mut2/); 70-mut-*.txt, 73-mutation-summary.txt and 73-mutations-detail.txt   e2e-level mutations
  (mut/; each applied by mutate.py, rebuilt, run, then restored from the reviewed commit; mut/ digest checked after every restore);
  76-chain.txt (the order of the chained runs)
Simulated clock (FIX10 shiftclock.mjs, byte-identical copy; browser not shifted, so the device date is the real date)
  60-mut-setup.txt, 61-control-*.txt (validation), 62-probe-*.txt (own probes), 62-probe-midnight-1025.txt (the midnight reproduction),
  64-sweep-*.txt (today.spec and timesheet.spec at the first window day, today.spec at P 23:45)
Accessibility
  70-axe-install.txt (axe-core installed in the task folder only), 71-a11y-*.txt (axe, keyboard walks, inactive-Today ring, review-label fit),
  74-axe-base-*.txt (the same axe scan on 90b98ef and d1a20a7), 75-ringcalc.txt (expected ring contrast at opacity 0.6),
  77-axe375-old.txt and 77-axe375-new.txt (follow-up of the target-size result with an overlay open, both builds, no share)
  Note: 71-a11y-real.txt is the first a11y run; its walk tests timed out on my own aria-disabled click (a probe error), only its first axe
  lines and its ring lines are used. 71-a11y-2.txt and 71-a11y-2-summary.txt are the corrected run.
Screenshots (synthetic data only): audit-today-bar-phone-away-w390/w320-synthetic.png, audit-today-bar-away-w768-synthetic.png (from the real-clock
  e2e run), audit-brand-fidelity-synthetic.png
Brand and privacy
  80-fidelity.txt, audit-brand-fidelity-synthetic.png (owner images re-rendered next to the shipped SVG logo and wordmark paths)
  81-headers-new.txt, 81-headers-old.txt (CSP, content types, caching of / , /theme-init.js, /cd-logo.svg and the assets)
Scripts: *.sh.txt, *.mjs.txt, *.py.txt, zz-audit-*.spec.ts.txt (task-local specs, never added to the repository).
