WP5-UX3-AUDIT-B2 evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name).
Review pair: handoff/delivery/WP5_UX3_REVIEW_B2.md and .vi.md. Target ceb86b6b18bd0e8fabd93f47672cd87f3899b92f, digest b35dddd5 (833 files).
Node v24.21.0 portable, Git Bash, Playwright on the installed Microsoft Edge, Vitest 5.0.2. Times are UTC unless stated.
The area-A recheck WP5-UX3-AUDIT-A2 ran on the same host at the same time (90-load.txt).

Digest (three forms, before and after): 01-digest-export-*.txt, 01-digest-lstree-*.txt, 01-digest-npm-*.txt, 01-head-*.txt (HEAD, origin/main,
  the count of non-handoff status lines, time).
Mandatory checks on the clean export: 10-main-exits.txt (summary), 10-typecheck.txt, 10-lint.txt, 10-npmtest-1.txt, 10-npmtest-2.txt, 10-build.txt,
  10-ac13.txt, 11-e2e-real.txt (FULL e2e both projects, real clock); 50-dst-exits.txt and 50-dst-*.txt (day-editor.spec.ts under the FIX10 clock
  preload at 2026-11-01T08:45:00Z and 2027-03-14T10:30:00Z, both projects); 52-preload-sha.txt (the preload is a byte copy of the FIX10 file).
Scope facts: 20-fix3-diffstat.txt and 20-fix3-diff-src.txt (git diff 7ce4e95..a78ada5), 21-server-domain-a643794-a78ada5-diff.txt and
  21-server-domain-7ce4e95-target-diff.txt (both empty), 21-a78ada5-target-stat.txt (only AGENTS.md and AGENTS.vi.md outside handoff/),
  22-quickbreaks-usage-7ce4e95.txt (where quickBreaksOf was used before its removal), 23-dist-compare.txt (dist/server and dist/domain of 7ce4e95
  and the target byte-identical), 24-docs-parity.txt (EN/VI tokens of docs/04 lines 65, 66, 70, docs/10 lines 101, 238, 245, docs/12 line 71),
  25-src-stat-7ce4e95-target.txt, 25-unchanged-files-stat.txt, 30-setup-exits.txt (exports, npm ci, builds).
Probes (task-local, synthetic people on example.invalid, copies as *.spec.ts.txt): 40-probe-exits.txt (every probe run with its exit code).
  Request matrix of the first pass, both builds: zz-audb2-req.spec.ts.txt, obs-req-base.jsonl.txt, obs-req-target.jsonl.txt, compare_req.py.txt,
    43-req-compare.txt, run logs 40-req-*-run.txt.
  F-UX3B-1 (12 Check out starting cases, both projects, both builds): zz-audb2-checkout.spec.ts.txt, obs-checkout-*.jsonl.txt,
    summarize_probe.py.txt, 44-checkout-desktop-compare.txt, 44-checkout-mobile-compare.txt, run logs 41-checkout-*-run.txt.
  F-UX3B-2 (16 "Confirm breaks" cases, pinning against the pre-fill, when the button appears): zz-audb2-confirm.spec.ts.txt,
    obs-confirm-base.jsonl.txt, obs-confirm-target.jsonl.txt, 45-confirm-compare.txt, run logs 42-confirm-*-run*.txt;
    obs-confirm-base-run1-calendar-missing.jsonl.txt and 42-confirm-base-run1.txt are the first 7ce4e95 run, whose two DST cases used
    2025-11-02 (no calendar version, calendar_missing; probe correction, replaced by Sydney 2026-04-05 on both builds).
Mutants: mutants.json.txt, mutate.py.txt, run-mutants.sh.txt, 60-mutants.txt (each mutant: client build, full unit suite, day-editor.spec.ts
  desktop), run-survivor.sh.txt, run-after-mutants.sh.txt, 61-survivors.txt and 61-*-e2e-both.txt (each survivor again on both projects
  with every spec that opens the Check out or the session dialog), then the probe on the mutated build to show the mutant is live:
  61-M6a-probe-run.txt with obs-checkout-mut-M6a-desktop.jsonl.txt, 61-M5b-probe-run.txt with obs-confirm-mut-M5b.jsonl.txt.
Scripts: env.sh.txt, digest.sh.txt, setup.sh.txt, run-main.sh.txt, run-probe.sh.txt, run-probes.sh.txt, run-shift.sh.txt, run-dst.sh.txt,
  cmp_dist.py.txt, parity.py.txt, mask_copy.py.txt, shiftclock.mjs.txt (FIX10 preload), probe-now.mjs.txt.
Rule slips: 96-slips.txt. Package checks: 97-preflight-draft.txt and 97-preflight-final.txt (validate_package --preflight with the
  workflow Python stops at the parallel area-A draft WP5_UX3_REVIEW_A2, first "Broken link", then "Different IDs"; not this pair),
  97-pair-check.txt (the same link, character, translation and ID checks applied to WP5_UX3_REVIEW_B2.md and .vi.md: all OK, with
  pair_check.py.txt), 98-check-evidence.txt (LF, no trailing blanks, one final newline, no e-mail other than example.invalid, no profile
  name or path, over every evidence .txt, the review pair and the brief).
Screenshots (8, synthetic people only): audb2-checkout-removed-all-{base,target}-{1280,390}-synthetic.png (every saved row removed, box
  unticked: 7ce4e95 without the note, the target with it), audb2-confirm-breaks-0900-1400-{base,target}-synthetic.png ("Confirm breaks" on
  09:00-14:00: 7ce4e95 lists none, the target lists 11:00 and 13:00); audb2-checkout-removed-all-mut-M6a-1280-synthetic.png and
  audb2-confirm-breaks-0900-1400-mut-M5b-synthetic.png were taken by the live probes on the mutated builds (same states; the mutants change
  other states, see 46-M6a-live-compare.txt and 47-M5b-live-compare.txt).
Live-probe comparisons: 46-M6a-live-compare.txt (checkout probe, desktop) and 47-M5b-live-compare.txt (confirm probe): in these two files
  the lines labelled "base" are the unmutated target build and the lines labelled "target" are the mutated build (the script's labels).
