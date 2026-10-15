WP5-UX2-AUDIT2 evidence (independent recheck auditor, attempt 1; synthetic data only). Reviewed commit
a6437943403fc416240fd13a787a8c4748af3e84, digest 229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files,
handoff/ excluded). Node v24.21.0 portable, Git Bash, workflow Python 3.12 (user <user>). Paths masked: <task> = the task folder
outside the repository, <repo> = the working repository, <user> = the account segment of a profile path.
All runs used clean archives in the task folder: export/ (git archive of a643794: digest form 1, the mandatory checks, the
real-clock FULL e2e, the FULL e2e outside the window, the repository midnight test), px/ (a second archive plus the task-local
zz-audit2-*.spec.ts probes), mut/ (a third archive for the mutations; its digest is checked at the end) and old/ (git archive of
90b98ef for the dist comparison). Nothing was written into the repository except this folder, the review pair and the Results
section of the brief.

Digest, three forms, first and last; separation
  00-node.txt, 00-head.txt, 00-nonhandoff-status-before.txt (empty), 01-digest-before.txt, 01-digest-after.txt,
  00-head-after.txt, 00-nonhandoff-status-after.txt (empty)
  01-digest-mut-after.txt   the mutation copy after the last restore (its "form 1" line hashes mut/; forms 2 and 3 as usual)
  02-board-ux2.txt   the WP5-UX2 tasks on the board: kinds, models, agent IDs (author and auditor separation)
  board-models.txt, board-ux2-ids.txt, fr-head.txt   raw greps used while reading (board model lines, task IDs, the
  focus-ring spec header and the contrast helper exports)
Mandatory checks (export/)
  05-exits.txt (exit codes and deprecation-line counts), 05-ci.txt, 05-typecheck.txt, 05-lint.txt, 05-test.txt, 05-test2.txt,
  05-build.txt, 05-smoke.txt
  20-e2e-real.txt, 20-e2e-counts.txt, 20-e2e-fixtests.txt, 20-e2e-ringtests.txt, 20-e2e-observations.txt   FULL e2e, real clock
  21-ac13.txt   AC-13 once
Scope, boundary and carry-forward
  10-scope-stat.txt, 10-fix2-stat.txt, 10-commits.txt, 10-commit-paths.txt, 10-bound-stat.txt, 10-unchanged-areas.txt (empty)
  11-diff-full.txt (the whole non-handoff diff d1a20a7..a643794), 12-client-diff.txt, 12-styles-diff.txt, 12-shared-request.txt
  13-dist.txt, 13-dist-diff.txt, 13-config-diff-d1.txt (empty)   own builds of 90b98ef and a643794; configs unchanged since d1a20a7
  06-prep.txt   npm ci and build of px/, mut/ and old/
Code reads
  23-ariadisabled.txt, 23-opacity.txt, 23-focusvisible.txt, 23-tsx-opacity.txt (empty), 30-container.txt, 30-tokens.txt,
  31-device-clock-grep.txt, 31-event-listeners.txt, 32-check-strings.txt, 32-clock-ids.txt, 75-ringcalc.txt
Docs
  14-docs-diff.txt, 40-docs-lines.txt, 40-docs-parity.txt, 40-docs-inactive.txt
  42-preflight.txt   validate_package.py --preflight (workflow Python) with the review pair in place: PASS
Tests
  50-test-diff.txt, 50-test-numstat.txt, 50-test-removed-lines.txt, 50-test-added-skips.txt (empty), 51-expect-counts.txt
Simulated clock (FIX10 shiftclock.mjs, byte-identical copy; the browser is not shifted, so the device date stays real)
  61-control-1104.txt, 61-control-real.txt (also the response headers), 60-sweep-progress.txt
  62-midnight-own-1025.txt, 62-midnight-own-1030.txt, 62-midnight-own-1031.txt, 62-midnight-shared-kiritimati-1025.txt,
  62-midnight-edge-1025.txt (Next before midnight, a press on the active-looking Today after it)
  63-repo-midnight-1025.txt   the repository midnight test under the preload (crossing branch)
  64-full-1104-1500.txt, 64-full-counts.txt   FULL e2e, both projects, 2026-11-04 15:00 PST (outside the window)
Requests, accessibility, phone row (px/)
  65-probes-progress.txt, 69-reruns-progress.txt
  66-requests-real.txt (rerun with the corrected probe), 66-requests-1104-1500.txt, 66-requests-real-v1.txt (first version,
  stopped at its own over-strict expectation for a wrapping Tab walk)
  67-row-real.txt
  68-a11y-real.txt (rerun with the corrected ring sampler), 68-a11y-1104-1500.txt, 68-a11y-real-v1.txt (first version), 68-a11y-summary.txt
  70-axe-copy.txt, 70-axe-version.txt (axe-core 4.14.0, a byte copy from the first audit's task folder)
  Screenshots (synthetic data, the inactive Today with its focus ring): audit2-inactive-today-desktop-light-next-synthetic.png and
  audit2-inactive-today-mobile-dark-next-synthetic.png (window day, real clock, beside Current period),
  audit2-inactive-today-desktop-dark-landing-synthetic.png and audit2-inactive-today-mobile-light-landing-synthetic.png
  (outside the window, simulated 2026-11-04)
Mutations (mut/)
  72-dryrun.txt, 72-progress.txt, 72-<label>.txt per run (applied text, test output, restore check), 73-mutation-summary.txt
Scripts (task-local, stored as .txt)
  env.sh, digest.sh, mandatory.sh, prep.sh, cmpdist.sh, run-shift.sh, sweep.sh, probes.sh, reruns.sh, mutations.sh, mutrun.sh,
  mutate.py, parity.py, ringcalc.py, counts.py, a11ysum.py, mutsum.py, mask.py, board_extract.py, fill.py, collect.sh,
  probe-now.mjs, shiftclock.mjs, zz-audit2-control.spec.ts, zz-audit2-midnight.spec.ts, zz-audit2-requests.spec.ts,
  zz-audit2-row.spec.ts, zz-audit2-a11y.spec.ts
  99-collect.txt   the masking copy into this folder
