WP5-UX2-FIX1 evidence (masked LF text; every log is a plain copy of a task-folder log, ANSI codes removed, the user-profile folder name and
e-mail addresses masked). No screenshots.

base.txt                    node version, HEAD, git status --short and the base digest (before any edit)
repro-midnight-1025.txt     finding 01 on the base build, simulated clock 2026-10-25 23:59:20 America/Los_Angeles (both projects fail)
repro-ring.txt              finding 03 on the base build, real clock: opacity 0.6, painted ring 2.70-2.73 (light), 3.16-3.34 (dark)
ring-after.txt              the focus-ring spec after the fix: 30 passed, 2 skipped (inactive Today 6.09-6.11 light, 6.40-6.79 dark)
mut-a..e-*.txt, mut-restored.txt   wording test mutation run (five reverted strings, then restored)
mut-guard-e2e.txt           e2e mutation: the old press guard restored -> the midnight e2e fails (both projects)
mut-vis-e2e.txt             e2e mutation: the visibilitychange listener removed -> the refresh e2e fails (own and shared view)
typecheck.txt lint.txt test.txt build-final.txt   the checks (exit 0; npm test 89 files, 1882 tests)
e2e-full1.txt               the FULL e2e on both projects on the real clock: 448 passed, 0 failed, 42 skipped
final-mid-1025.txt final-mid-1031.txt   the midnight e2e under the preload at 2026-10-25 and 2026-10-31 23:59:20 America/Los_Angeles
final-today-1026-0030.txt final-today-1017-1000.txt   today.spec.ts under the preload at 2026-10-26 00:30 and 2026-10-17 10:00
preflight.txt               validate_package.py --preflight (PASS)
docs-parity.txt             the four changed docs lines (330px in EN and VI) and the numstat
src-diff.txt                git diff of the three changed client source files
unit-targeted.txt           the three client unit files run alone after the edit
verify.txt digest-final.txt npm run verify (exit 0, SMOKE PASSED) and npm run digest
