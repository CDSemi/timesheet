WP5-UX5-AUDIT-INT evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name)

Target a5cbc91e6965633a0f9d1dd7e912577321cc71e3 (WP5-UX5-FIX17-FREEZE, REGATE12's freeze_commit), HEAD = origin/main before and after.
Digest 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf, 882 files, before and after in three forms (01-digest-*.txt).
Node v24.21.0 (portable), npm 11.18.0, Git Bash, Playwright 1.63.0 on Microsoft Edge, 32 logical processors. Times are UTC.
Exports in <task>: export (git archive of the target, own npm ci; the mandatory checks), export-probe (the same archive and its own build;
my zz-int-*.spec.ts files and a port helper that keeps the harness on 51470-51489 added), export-mut (the same archive; one mutant applied,
restored byte-equal and rebuilt).

Files
  00-*                head and non-handoff status (before and after), node version, start time, this index
  01-*                the digest before and after (export form, git ls-tree form, npm run digest); 01-author-models.txt is the board extract
                      of the WP5-UX4/UX5 tasks with their models and agent ids
  02-*                npm ci of the exports, the probe build
  03-*                typecheck, lint, build, npm test, AC-13 under America/Los_Angeles, Asia/Tokyo, America/New_York; 03-core-exits.txt
  04-e2e-*            the real-clock FULL e2e, desktop and mobile; 04-e2e-counts.txt
  08-seven-*          the seven-file run at 2026-10-27T06:58:30Z through the FIX10 wrapper; 08-seven-counts.txt
  10-census-*         host census (process names and busy cores only; inline Get-Counter samples); 10-census-end.txt is the last one
  12-, 13-            the longest logo, import and crossing test durations
  20- to 23-          diffs: be2afa2..target (the area-A carry-forward), each earlier reviewed commit to the target
  30- to 33-          greps: recorded-risk status, every second page or context in the e2e specs, tracked images, cancelled-state writers
  40-, 41-, 42-, 43-, 44-  the cross-area probes: observations (40-obs-restore.txt, 41-obs-midnight.txt, 42-obs-theme.txt,
                      43-obs-shared-run2.txt and -run6.txt, 44-obs-clock-editor.txt and -run1.txt), logs (41-log-*.txt), exits
                      (40-probe-exits*.txt); 44-error-context-clock-editor-note.txt is Playwright's page snapshot at the refused save
                      (F-UX5I-1); files named *-run1-probe-defect.txt and the shared runs 3-5 are kept probe defects (see the review)
  50-, 51-            the test-design mutant (the page's focus and visibility refresh removed): exits, logs, restore checks
                      (50-mut-exits.txt; ctl-* is the unmutated control, mf-* the mutant runs)
  60-docs-parity.txt  EN/VI structure of docs 02, 03, 04, 05, 10, 11, 12
  90-*                the scripts and probe sources (*.sh.txt, *.mjs.txt, *.ts.txt, *.json.txt)
  99-slips.txt        my rule slips; 99-process-counts-end.txt process-name counts at the end
