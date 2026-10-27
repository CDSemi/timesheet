WP5-UX5-RECHECK-A evidence index (auditor's own runs; masked LF text; placeholders: <task> = the auditor's task folder outside the
repository, <repo> = the repository, <user> = the user profile, <localappdata> = the local application data folder).

Target: reviewed_commit a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5, digest 4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f
(882 files, handoff/ excluded). Exports: <task>/export (clean, mandatory checks), <task>/export-probe (probes; its tests/e2e/fixtures.ts
port helper points at 49862-49889, nothing else changed), <task>/export-mut (mutants, each restored byte-identical).

00-*            HEAD, origin/main, branch, status outside handoff/ (before), start time.
01-digest-*     the digest in three forms (export with git hash-object --no-filters, git ls-tree, npm run digest), before and after.
02-*            npm ci (three exports) and the probe/mutant export builds.
03-*            typecheck, lint, npm test, build, AC-13 and their exits (clean export, one after another).
06-*            the real-clock FULL e2e (both projects, 2 workers), per-project counts, the area-A test lines, the logo durations.
07-*            npm audit (information for area B).
20-*            the changed paths f4049aa..a5533b5, the two commits, the PDF diffstat.
30-*            focus-outline contrast from the token values.
40-obs-*        probe observations, one JSON line each:
                  review / review-mobile  signed and reloaded Review (F-UX5A-1), FIX9 sweep, focus, name, arrows, resize, no extra stop;
                  ring                    FIX9 outline coverage per edge (finding F-UX5A2-1);
                  sheet                   "Change days" name 320-1440, Timesheet sideways sweep, "+1" range, paper, Save day fields,
                                          touch swipes/taps/long press (1024 touch), pen and mouse;
                  tap / tap2              a control tapped after an outside tap closed the drawer (tap: probe artefact, see 99-slips;
                                          tap2: correct), touchend listeners through the DevTools protocol;
                  classic / overlay       classic and overlay scrollbar probes;
                  axe / walk2             axe-core 4.14.0 scans and keyboard walks; settled drawer walk; name-mismatch nodes;
                  surface / surface3      the FIX10 PNG decoder against per-pixel screenshots and against the browser's decoder;
                  empty                   the unsigned line with and without `.rsig-content:empty` (mutant MA1);
                  MA5-impact / MF3-impact / MF3b-impact  what the surviving mutants do.
40-sum-axe.txt  summary of the axe scans and walks.  40-probe-exits.txt: every probe run with its exit.
41-log-*        the Playwright logs of the probe runs.
50-mut-*        the auditor's 17 mutants (log per mutant, summary, exits).
90-src-*        the probe specs.  91-*: the scripts (env, setup, digest, core, e2e, probe, mutants, masking, summaries).
99-slips.txt    rule slips and incidents.
ra-*-synthetic.png  screenshots of synthetic data: the signed footer (1100 light, 768 dark, 320 dark, mobile 390 light), the FIX9 card
                focus (900 light, 768 dark, manual dark on a light device, 768 scrolled), the 320px toolbar.
