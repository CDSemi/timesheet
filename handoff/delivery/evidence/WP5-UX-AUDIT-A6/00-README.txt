WP5-UX-AUDIT-A6 evidence index (area A recheck of WP5 on bf954c0b371ad9a5fe461a603c5d476ea210e66c)

Auditor: self-reported model claude-opus-5-5 (board agent ae28cb6041639f3c1); fresh context; authored nothing in this
round and ran no gate, sweep or earlier audit of it. The strongest author model of the snapshot is claude-opus-5-5
(WP5-UX-PLAN, T02, T04, FIX5, and FIX7 = agent ac4684761796f0e78); FIX2, FIX3, FIX4 and FIX6 ran on claude-sonnet-5-5.
Masking: <task> = the task folder, <project> = the repository, <user-home> = the user profile, <scratch> = the
harness scratch folder, <email> = any address outside the full synthetic example.invalid form. All text is LF
(38-evidence-check.txt).
Data: synthetic accounts on example.invalid only; UUIDs are ids of throwaway test databases. No screenshot was taken
by this audit (the mandatory e2e wrote their own *-synthetic.png into <task>/shots; they are not copied here).
Runtime: Node v24.21.0 portable first on PATH; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in <task>. The e2e fixtures
start each built server on a free loopback port chosen by the OS (the harness's own choice, as in earlier gates and
audits); I started no server of my own. Every Playwright run had its own output folder (<task>/tmp/...); runs were
sequential. Nothing is left running.

Digest of record b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files, handoff/ excluded)
  00-digest.txt               first commands: ls-tree of bf954c0 and HEAD, npm run digest, clean git-archive export
                              hashed with git hash-object --no-filters, path/blob list equal to ls-tree
  00-digest-after.txt         at the end: export re-hashed and unchanged, ls-tree of HEAD, npm run digest, no change
                              outside handoff/
Mandatory checks (clean git-archive export of bf954c0)
  01-npm-ci.txt 02-npm-test.txt 03-build.txt 07-typecheck-lint.txt 06-npm-audit.txt
  04-e2e.txt 04b-e2e-per-spec.txt   day-editor, sharing, isolation, review, submission, timesheet, import, pdf-visual,
                                    focus-ring, keyboard-access on both projects (JSON report counted per spec)
  05-ac13.txt                       AC-13 once
Delta proof (5e104e1..bf954c0) and the business boundary since 014bd47
  10-delta.txt                commits, non-handoff paths per commit, forbidden paths, boundary since 014bd47, the
                              whole round's name-status 014bd47..bf954c0
  10c-diff-fix7-client.txt 10d-diff-fix7-tests.txt 10e-diff-docs.txt   the full FIX7 diff of src/client, tests, docs
  11b-dist-server.txt         built dist/server and dist/domain hashed for bf954c0, 5e104e1 and 014bd47
  12a-css-rules.txt           declaration-level CSS diff 5e104e1 -> bf954c0 (css-rules.mjs, the A5 script)
  12b-day-name-probe.txt      unit sweep: day-button names vs accounting dates, 1095 dates x 10 display zones under
                              8 device zones (day-name-probe.ts)
  12c-tests-delta.txt         every removed/added test line of FIX7 with expect and test counts; fixtures.ts unchanged
  13-callsites.txt 14-body-builders.txt 16-client-arith.txt (A4/A5 scripts reused unchanged) 16b-client-arith-diff.txt
Builds for comparison
  20-ex5e1-build.txt 20-ex014-build.txt
Own probes (sources: common.ts.txt, probe.*.config.ts.txt, lib-*.ts.txt, *.spec.ts.txt, package.json.txt)
  30-probe-bf9-main.txt       the A5 probes adapted to bf954c0 (day button by data-day + new name): bodies, A-01 leave,
                              AC-04, R-07 with the zone-note due time, privacy, AC-16/AC-01; 18 passed (3 layouts)
  30b-probe-bf9-bodies-rerun.txt   the bodies probe again with the 014bd47 probe's notes text (see 36a); 3 passed
  31-probe-bf9-delta.txt      delta probes on bf954c0: days (data-day), dialogs, switcher, sticky; 14 passed, 1 failed
                              (the mobile sticky run: 2 programmatic-focus rows of the date field at 320 px, explained
                              by 34-*)
  32-probe-5e1-delta.txt      the same delta probes on 5e104e1; 14 passed, 1 failed on a probe defect (selector list
                              not scoped on the phone), rerun in 32b-probe-5e1-days-rerun.txt (3 passed)
  33-probe-014-baseline.txt   014bd47 baselines: the A5 bodies probe (unchanged) and the Settings/Import steps; 4 passed
  34-probe-datefield-bf9.txt 34-probe-datefield-5e1.txt 34b-datefield-summary.txt
                              the Open a day date field reached with real Tab and Shift+Tab from half under and fully
                              under the sticky bar: bf954c0 25/25 points visible in every width; 5e104e1 half or
                              entirely hidden
  35-sticky-counts.txt        sticky probe per build and width (43 controls, 129 focus checks, 43 trial clicks each)
  36-compare.txt              bf954c0 vs 5e104e1 (days, switcher, dialogs, sticky) and vs 014bd47 (bodies, Settings and
                              Import steps): missing=0 mismatches=0
  36a-compare-run1.txt        the first comparison, kept: 2 artefacts (my notes text, JSON key order), fixed by
                              30b and sorted-key comparison
  37-summary.txt              per-layout facts of the A5-method probes (summary.mjs)
  38-evidence-check.txt       CR and sensitive-content check of this folder
  *.json.txt                  raw probe results
Scripts
  *.sh.txt (env, digest before/after, checks, e2e, reference builds, static, dist, day-name, tests delta, probes,
  follow-up, copy) and *.mjs.txt / *.ts.txt (analysis scripts and the day-name sweep)
