WP5-UX-AUDIT-A7 evidence index (area A delta recheck of WP5 on 255ba17d6bf891c0ff779d4a4f518e0d2998cee8, attempt 2)

Auditor: self-reported model claude-opus-5-5 (board agent a20d8532cf4870e3a); fresh context; authored nothing in this
round and ran no gate or earlier audit of it. The strongest author model of the snapshot is claude-opus-5-5
(WP5-UX-PLAN, T02, T04, FIX5, FIX7); the delta WP5-UX-FIX8 ran on claude-sonnet-5-5 (agent a1879ebe9ac6923de).
Attempt 1 (agent adb1361e72d2ebd96) wrote nothing in the repository; its task folder was ignored.
Masking: <task> = the task folder, <project> = the repository, <user-home> = the user profile, <scratch> = the
harness scratch folder, <email> = any address outside the full synthetic example.invalid form (none occurred). All text
is LF (38-evidence-check.txt).
Data: synthetic accounts on example.invalid only; UUIDs are ids of throwaway test databases. No screenshot was taken by
this audit (the mandatory e2e wrote their own *-synthetic.png into <task>/shots; they are not copied here).
Runtime: Node v24.21.0 portable first on PATH; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in <task>. The e2e fixtures
start each built server on a free loopback port chosen by the OS (the harness's own choice, as in earlier gates and
audits); I started no server of my own, so no port of 48440-48459 was bound (SMOKE_PORT 48440 was set; smoke was not
run). Every Playwright run had its own output folder; runs were sequential. Nothing is left running.

Decision: FIX REQUIRED (WP5-UX-A7-01, Low, tests only, older than FIX8). See handoff/delivery/WP5_UX_REVIEW_A7.md.

Digest of record b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files, handoff/ excluded)
  00-digest.txt               first commands: ls-tree of 255ba17, HEAD and origin/main, npm run digest, clean
                              git-archive export hashed with git hash-object --no-filters, path/blob list equal to ls-tree
  00-digest-after.txt         at the end: export re-hashed and unchanged, ls-tree of HEAD, npm run digest, no change
                              outside handoff/
Mandatory checks (clean git-archive export of 255ba17)
  01-npm-ci.txt 02-npm-test.txt 03-build.txt 07-typecheck-lint.txt 06-npm-audit.txt
  04-e2e.txt 04b-e2e-per-spec.txt   sharing, isolation, day-editor, timesheet, review, submission, pdf-visual on both
                                    projects (JSON report counted per spec): 103 passed, 17 skipped, 4 failed (isolation)
  05-ac13.txt                       AC-13 once
Isolation follow-up (finding WP5-UX-A7-01)
  40-d255-periods.txt, periods7-255ba17.json.txt   today, the displayed and the in-progress period, the seed date
  04c-isolation-bf9-now.txt         the unchanged spec of the bf954c0 build now: the same 4 failures (older than FIX8)
  04e-shell-255-now.txt             the unchanged shell.spec.ts of 255ba17 now: :67 fails for the same seed date
  04f-isolation-variant-255.txt     the auditor's copy with the seed date from displayedPeriodFreeWorkdays(): 6 passed
  04g-isolation-variant-diff.txt    the exact difference of that copy from tests/e2e/isolation.spec.ts
  04d-isolation-255-again.txt       the unchanged spec of 255ba17 again: the same 4 failures
Delta proof (bf954c0..255ba17) and the business boundary since 014bd47
  10-delta.txt 10b-diff-fix8.txt    commits, paths, numstat, forbidden paths, removed lines, test/expect counts,
                                    boundary since 014bd47, the round's path list compared with the list at bf954c0
  11b-dist.txt 11c-client-js-diff.txt   built server/domain/client hashed for 255ba17, bf954c0 and 014bd47; the client JS
                                    compared byte by byte
  12a-css-rules.txt                 declaration-level CSS diff bf954c0 -> 255ba17 (css-rules.mjs, the A5/A6 script)
  13-callsites.txt 14-body-builders.txt 16-client-arith.txt   (A4-A6 scripts reused unchanged)
Builds for comparison
  20-exbf9-build.txt 20-ex014-build.txt
Own probes (sources: common.ts.txt, probe.*.config.ts.txt, delta.*.config.ts.txt, lib-*.ts.txt, *.spec.ts.txt,
package.json.txt)
  30-probe-255-main.txt             the A6 probes pointed at 255ba17: bodies, A-01 leave, AC-04, R-07 with the zone-note
                                    due time, privacy, AC-16/AC-01; 18 passed (3 layouts)
  33-probe-014-baseline.txt         014bd47 body baseline; 2 passed
  34-probe-255-settings.txt 34-probe-014-settings.txt   the A6 Settings probe (sharing grant, change, end, leave;
                                    import; opening balance) on 255ba17 (3 passed) and 014bd47 (2 passed)
  41-*-css.txt                      computed layout per width on both builds (css7-*.json.txt)
  42-*-switcher.txt                 the switcher by keyboard, touch and pointer at 390 and 320, zone note shown and
                                    not, with AC-16 and isolation, on both builds (switcher7-*.json.txt)
  43-*-sticky.txt                   sticky bars, pointer and touch trials and keyboard walks with and without a
                                    received share, on both builds (sticky7-*.json.txt)
  36-compare.txt                    255ba17 vs 014bd47 (bodies, Settings) and vs bf954c0 (switcher, sticky, layout):
                                    missing=0 mismatches=0
  37-summary.txt                    per-layout facts of the A6-method probes (summary7.mjs)
  38-evidence-check.txt             CR and sensitive-content check of this folder, the review pair and the brief
  *.json.txt                        raw probe results
Scripts
  *.sh.txt (env, digest before/after, checks, e2e, reference builds, delta, static, probes, delta probes, isolation
  follow-up, Settings, queue, copy) and *.mjs.txt (analysis scripts)
