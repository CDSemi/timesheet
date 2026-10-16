WP5-UX3-AUDIT-A evidence (area A audit of 7ce4e95a0c4477374e981132d93b11aedab2e384, digest 262138e0...bf0191, 833 files)
Masked LF text: <task> = the task folder under D:\.claude-tmp\timesheet, <repo> = the repository, <user> = the account
name, <regate-task> / <audit-b-task> = the other agents' task folders (read only). Scripts and probes are kept as *.txt.

Digest and identity
  01-digest-{export,lstree,npm}-{before,after}.txt, 01-head-*.txt, 01-nonhandoff-status-*.txt   three digest forms, first and last
  00-export.txt, 02-ci-exit.txt, 02-ci-exits.txt                                                 export and npm ci (three exports)
Mandatory checks (clean export "export")
  main-times.txt (timeline), 10-typecheck.txt, 11-lint.txt, 12-npmtest-{1,2}.txt, 13-build.txt, 14-ac13.txt,
  15-e2e-real.txt, 15-e2e-real-counts.txt (FULL e2e real clock, both projects)
Static and boundary
  20-cssscan.txt / 20-cssscan-a643794.txt (hover gating, theme-set parity, literals), 40-server-diff.txt, 41-fixround-stat.txt,
  60-parity-docs04.txt, 30-build-p.txt (probe export build), 31-shiftclock-sha.txt (FIX10 preload copy is byte-identical)
Item 11 (regate timeouts)
  70-item11-regate-traces.txt (long steps of the two regate failure traces; fill values left out), trace_actions.py.txt,
  50-durations-regate.txt (the regate's logs), 51-durations-mine.txt (mandatory run), 52-durations-item11.txt (four runs),
  log-i11-{single-1231,single-real,double-1231,double-real}.txt, playwright.rep.config.ts.txt, run-item11.sh.txt,
  run-shift.sh.txt, load-context.txt (load samples: node/msedge process counts, area-B folder activity, CPU)
Probes (export-p, Edge 155)
  obs-seam.txt (item 12), obs-shell.txt, obs-sheet.txt, obs-axe.txt, obs-name.txt, obs-coarse.txt, obs-tap.txt, obs-ring.txt,
  obs-signout.txt, obs-shots.txt, obs-adminwrap.txt; log-probe-*.txt; zz-a-*.spec.ts.txt, zz-alib.ts.txt, zz-png.ts.txt,
  playwright.audit.config.ts.txt, run-probes.sh.txt, probe-times.txt, probe-list.txt
  Note: the item-11 suites in export-p also ran these probes, so after the first block (18:47-19:00Z) every obs file has
  further appended blocks from those suites (simulated 2026-12-31 23:30-23:51 America/Los_Angeles, then the real clock).
Mutants (export-m)
  mut-summary.txt, mut-A*-{diff,unit,build,e2e}.txt, mut-restore-build.txt, mut-caught.txt, mutants.sh.txt
Other
  slips.txt (rule slips), chain-*.txt, collect.sh.txt, mask.mjs.txt, cssscan.mjs.txt, durations.mjs.txt, parity.mjs.txt,
  env.sh.txt, digest.sh.txt, load.sh.txt, run-main.sh.txt, ms-playwright.txt (no Playwright Firefox/WebKit, no Firefox)
Screenshots (16, synthetic data only)
  auditA-sheet-editor-1440-{light,dark}, auditA-account-menu-1440-{light,dark}, auditA-floating-panel-1280-light,
  auditA-lifted-run-1440-dark, auditA-phone-390-first-screen-light, auditA-phone-320-period-row-light,
  auditA-phone-390-editor-dark, auditA-seam-dpr2-run-1440-light, auditA-seam-dpr2-join-zoom6-1440-{light,dark},
  auditA-focus-date-under-pointer-light, auditA-focus-category-under-pointer-light (finding 01),
  auditA-signout-icon-gap-desktop (finding 04), auditA-admin-submissions-phone-390-light (finding 06)
