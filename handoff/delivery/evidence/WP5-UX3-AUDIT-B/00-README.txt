WP5-UX3-AUDIT-B evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name).
Review pair: handoff/delivery/WP5_UX3_REVIEW_B.md and .vi.md. Target 7ce4e95a0c4477374e981132d93b11aedab2e384, digest 262138e0 (833 files).
Node v24.21.0 portable, Git Bash, Playwright on the installed Microsoft Edge, Vitest 5.0.2. Times are UTC unless stated.

Digest (three forms, before and after): 01-digest-export-*.txt, 01-digest-lstree-*.txt, 01-digest-npm-*.txt, 01-head-*.txt (HEAD and the count of
  non-handoff status lines).
Mandatory checks on the clean export: 10-main-exits.txt (summary), 10-typecheck.txt, 10-lint.txt, 10-npmtest-1.txt, 10-npmtest-2.txt, 10-build.txt,
  10-ac13.txt, 11-e2e-real.txt (FULL e2e both projects, real clock); 50-dst-exits.txt, 50-dst-20261101T0845.txt, 50-dst-20270314T1030.txt
  (day-editor.spec.ts under the FIX10 clock preload at two DST instants).
Scope facts: 20-diffstat-models.txt (a643794..target for sessionModel, dayEditorModel, server, domain, api.ts), 47-server-domain-api-diff-stat.txt
  (empty), 47-dist-compare.txt (own builds: dist/server and dist/domain byte-identical), 30-setup-exits.txt (scratch exports).
Request integrity (item 1): zz-audb-req.spec.ts.txt (probe), 40-req-base.jsonl.txt and 41-req-target.jsonl.txt (final runs: every write with its status,
  stored sessions, UI facts), compare_req.py.txt, 42-req-compare.txt (25 cases); run logs 40-req-base-run*.txt, 41-req-target-run*.txt;
  40-req-base-run1-notice-text.jsonl.txt is the first a643794 run whose probe waited for the wrong one-tap notice (probe error, three cases).
Confirmation, dialogs, share, reason, Check out discard (items 2, 5, FIX2-8): zz-audb-dialogs.spec.ts.txt, 43-dialogs-obs-run1.txt (D, P series),
  43-dialogs-obs-run2.txt (B, O, S, F series), 43-dialogs-run1.txt (three probe errors, fixed), 43-dialogs-run2.txt.
Pre-fill (item 3): zz-audb-prefill.spec.ts.txt, 44-prefill-obs.txt, 44-prefill-run-*.txt (FIX10 preload at 2026-10-27T06:58:00Z, two device zones).
Figures (item 4): zz-audb-figures.spec.ts.txt, 45-figures-base.jsonl.txt, 45-figures-target.jsonl.txt, compare_fig.py.txt, 46-figures-compare.txt;
  45-figures-base-run1-wrong-key.jsonl.txt (first run read a wrong key for unresolved items; kept).
Phone and partial-fit Confirm breaks (items 6, F-UX3B-2): zz-audb-phone.spec.ts.txt, 48-phone-obs.txt, 48-phone-run.txt.
Finding 12 (F-UX3B-1): 43-dialogs-obs-run2.txt F1-F4, zz-audb-f12b.spec.ts.txt, 49-f12b-obs.txt, 49-f12b-run.txt.
FIX1 seed (item 9): aaa-audb-seed.spec.ts.txt, run-fix1.sh.txt, fix1-mutants.json.txt, 61-fix1-exits.txt, 61-fix1-baseline.txt, 61-fix1-old-seed.txt,
  61-fix1-stale-accepted.txt.
FIX2 item 10: 62-fix2-dayEditorModel-test-diff.txt.
Mutants (item 7): mutants.json.txt, mutate.py.txt, run-mutants.sh.txt, 60-mutants.txt; M18 on both projects: run-m18-mobile.sh.txt, 63-m18.txt.
Package checks of the review pair: 70-preflight.txt, 71-preflight-final.txt (validate_package --preflight PASS), check_lf.py.txt (0 CR, 0 trailing blanks).
Scripts: env.sh.txt, digest.sh.txt, run-main.sh.txt, run-probe.sh.txt, run-shift.sh.txt, run-dst.sh.txt, setup-probes.sh.txt, mask_copy.py.txt,
  shiftclock.mjs.txt (FIX10 preload, byte-identical copy), probe-now.mjs.txt.
Screenshots (synthetic people only): audb-phone-390x844-same-day-rows-synthetic.png, audb-phone-390x844-overnight-chips-synthetic.png,
  audb-phone-390-chips-synthetic.png, audb-f12-checkout-saved-row-1366-synthetic.png, audb-f12-checkout-removed-1366-synthetic.png,
  audb-f12-card-after-1366-synthetic.png.
