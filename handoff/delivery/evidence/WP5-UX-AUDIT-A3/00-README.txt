WP5-UX-AUDIT-A3 evidence index (area A recheck of WP5 on a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb)

Auditor: self-reported model claude-opus-5-5; fresh context; authored nothing in the redesign round.
Masking: <task> = the task folder, <project> = the repository, <user-home> = the user profile,
<scratch> = the harness scratch folder. All text is LF (crcount: 87 .txt files, 0 CR bytes).
Data: synthetic accounts on example.invalid only; screenshots show synthetic names only.
Runtime: Node v24.21.0 portable first on PATH; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in <task>.
The e2e fixtures start each built server on a free loopback port chosen by the OS (the harness's own
choice, as in earlier gates); I started no other server and used no port in 48080-48099.

Digest
  00-digest.txt               before (ls-tree a2ea7a4 and HEAD, first command) and after (clean export
                              hashed with git hash-object --no-filters, ls-tree, scripts/source-digest.mjs)
Mandatory checks (clean git-archive export of a2ea7a4)
  01-npm-ci.txt  02-npm-test.txt  03-build.txt  04-e2e.txt  05-ac13.txt  06-npm-audit.txt
  07-typecheck-lint.txt
Delta proof (589bcff..a2ea7a4) and the business boundary since 014bd47
  10-delta.txt                full diff outside handoff/ (5 files)
  11-boundary.txt             src/server, src/domain, api.ts, pdf, package and config diffs
  12-delta-proof.txt          DayEditor.tsx comment-only (emitted JS and token stream identical); CSS rule
                              diff with the hide/move/clip/block property check; spec pure insertion
  13-callsites.txt            client API call sites 014bd47 vs a2ea7a4 (65 endpoints each)
  14-body-builders.txt        request-body builders 014bd47 vs a2ea7a4
  14-variable-calls.txt       every api()/request() call line at both commits
  15-client-files.txt  16-client-arith.txt   client files changed since 014bd47; arithmetic scan
  17-review-diff.txt          ReviewScreen and reviewModel since 014bd47
Builds for comparison
  20-export014-build.txt  21-export589-build.txt
Own probes (sources: common.ts.txt, probe.config.ts.txt, probe-a3-*.spec.ts.txt, probe014*.txt, probe589*.txt)
  30-probe-a2ea7a4-run1.txt   first attempt: the probe config failed to load (no "type": "module" in the
                              task folder); fixed by package.json.txt; no test ran
  30-probe-a2ea7a4-run2.txt   24 tests: 19 passed, 4 skipped by design, 1 failed (phone, 320x640: a
                              measurement artefact, see 32a and 35)
  31-probe-014bd47-run1.txt   same config failure; 31-probe-014bd47-run2.txt: 4 passed
  32-probe-phone-run3.txt     phone probe rerun with a centred measurement: 1 passed (a first rerun
                              command used a wrong CLI argument and ran nothing; overwritten by this log)
  32a-phone-summary-run2-failed.txt  32b-phone-summary-a2ea7a4.txt   per-size phone tables
  33-probe-phone-589bcff.txt  33b-phone-summary-589bcff.txt   the same phone probe on 589bcff (information)
  34-phone-compare.txt        589bcff vs a2ea7a4 per size and control: 0 regressions
  35-sticky-bar-artefact.txt  the 320x640 artefact exists equally at 589bcff (sticky app bar)
  36-compare-014bd47.txt      leave, clock, sign-off and batch bodies a2ea7a4 vs 014bd47: 0 mismatches
  37-probe-bodies-a2ea7a4.txt  38-probe-bodies-014bd47.txt   body probes with the batch step (3 + 2 passed)
  39-shots-run.txt            two synthetic screenshots (a3-*-synthetic.png)
  *.json.txt                  probe results (leave, ac04, r2, sharing, r07, privacy, bodies, phone-controls)
Scripts
  env.sh.txt lstree-digest.sh.txt exdigest.sh.txt delta-proof.mjs.txt callsites.mjs.txt
  body-builders.mjs.txt client-arith.mjs.txt compare.mjs.txt phone-summary.mjs.txt phone-compare.mjs.txt
  topaligned.mjs.txt mask.mjs.txt package.json.txt
Runtime slips
  90-slips.txt                one pipe into head (listing only); one stray file D:\canedit.txt (30 lines
                              of public source) created by a redirect outside the task folder, left for
                              the owner to delete
