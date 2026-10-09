WP5-UX-FIX5 evidence (masked LF text; screenshots use synthetic data only)

Base: HEAD = origin/main = a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb, source digest
0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 files) before any edit.
Node v24.21.0 (portable, first on PATH). Edge (Playwright channel msedge). Paths under the user
profile are written as <user>; e-mail addresses as <email>.

00-base-node-head-digest.txt   node --version, HEAD, origin/main, digest before editing, git status
02-repro-B3-01-failing-at-base.txt   the two new WP5-UX-B3-01 e2e tests on the base client (build
                               first): 2 failed - at 1024px the review is not focused and not on
                               top ("focus": false, "onTop": false)
03-fixed-targeted-desktop.txt  after the DayEditor fix: the two new tests plus the existing side-panel,
                               WP5-UX-B-02 and label-picker tests, desktop: 7 passed
04-checks-summary.txt          typecheck / lint / npm test / npm run test:e2e exit codes (all 0)
04a..04d                       the raw logs of those four commands; 04e-counts.txt per-project counts
05-selfcheck-resize-desktop.txt  the mandatory self-check: 1280 -> 1024 -> 768 -> 1280 for (a) the
                               editor alone, (b) the label review open, (c) the leave validation
                               alert showing; dialog state, focus and Escape order after each step,
                               POST/PUT/DELETE requests (none) and the stored values afterwards
05a-probe-phone-measurements.txt  phone probe lines in run order:
                               - 8 "equal|note wNNN" lines with the BASE tokens (9.5rem / 15.25rem)
                               - two "info" lines (two clip runs): glyph widths in the field font (10/09/2026 76.39px,
                                 mm/dd/yyyy 84.23px); the visual clip thresholds came from the
                                 clip-NNN screenshots in the task folder (value: clipped at 117px,
                                 whole at 118px; placeholder: clipped at 125px, whole at 126px)
                               - 8 "equal|note wNNN" lines with the NEW tokens (8.5rem / 14.25rem)
                               - "o5demo" and four "o5mut" lines: the new O-5 checks against a
                                 589bcff-like rule set (no min-width, no wrap) applied through the
                                 CSSOM; the old scrollWidth check passes everywhere, the new checks
                                 FAIL at 360 (placeholder 124.2 < 125.7) and 320 (value 104.75 <
                                 117.9; placeholder 115.9 < 125.7)
                               - then the "selfcheck" lines (the same as 05-...)
05b..05d                       the probe run logs; 05e the temporary probe spec (removed from
                               tests/e2e before the final checks)
06-docs-parity.txt             docs/04 line 55 EN and VI after the change, git diff -U0
06a-preflight.txt              validate_package.py --preflight with the workflow Python
07-sensitive-grep.txt          user-profile path / e-mail counts over the changed files and evidence
08-verify.txt                  npm run verify (SMOKE_PORT, DATA_DIR, DATABASE_PATH in the task folder)
09-digest-final.txt            npm run digest, run last

First day row bottom on a 390/375/360/320 x 844 phone (field empty; tab bar top 788):
                 zone equal            zone note
width   base 9.5rem  new 8.5rem   base 9.5rem  new 8.5rem
390        659.0       659.0         758.0       758.0
375        728.4       676.4         827.4       775.4
360        728.4       728.4         827.4       827.4
320        791.2       791.2         924.9       924.9
Field width with 2026-10-09 typed, new tokens: 390 146.2 (button beside), 375 131.2 (button
beside; was 235.0 with the button below), 360 220.0, 320 180.0 (button below).

Screenshots:
fix5-review-on-top-w1024-synthetic.png        e2e: 1280 -> 1024 with the review open (review on top)
fix5-open-day-w375-zone-note-synthetic.png    new tokens: full date, button beside the field at 375
fix5-open-day-w320-zone-note-synthetic.png    new tokens: full date, button below at 320
fix5-o5-mutation-clipped-w320-synthetic.png   mutation only: "10/09/2" clipped while the old
                                              scrollWidth check still passed
