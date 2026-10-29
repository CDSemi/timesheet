WP5-UX5-REGATE14 attempt 1 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Target 0b457817ed29806a36fdd78cc22ac84a0cc2db9d (HEAD = origin/main, unchanged before and after). Previous d96df5daa25b44b156354bc96605e13e94e44396.
Digest 67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b, 882 files, before and after, in the export form, the ls-tree form and npm run digest (01-digest-*.txt).
npm run digest also exits 0 in a clean clone of the target (01-digest-npm-clean-clone.txt).
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge, 32 logical processors. Times UTC (host clock 2026-10-29).
Scratch copies in <task>: export (git archive of the target, own npm ci), export-prev (git archive of d96df5d, own npm ci), export-mut (a copy of export made after its build;
controls, mutants and the axe probe ran there, mutants restored byte-equal), clone/c1 (clean clone for npm run digest and the digest mutant). SMOKE_PORT 51770.
The simulated clock is the FIX10 wrapper (shiftclock.mjs.txt), controls in log-control-*.txt validated the preload before the runs.

Files
  00-*, 01-*        head, status, digest forms, clean clone
  02-*, 03-*, 05-*  npm ci, lint, typecheck, build (target and d96df5d), verify, npm test x3
  04-*              real-clock FULL e2e and per-project counts
  10-census-*       host census (process names and busy cores only; no command lines)
  11-*              validators
  17-*, 18-*        six sweeps and stress counts
  20-*, 21-*, 22-*, 25-*  scope: name-status, diffstat, diff --check, source/test/docs/scripts diffs, package/lockfile diff
  50-dist-normcmp, 51-*   dist/ comparison (250 files each; 26 differing lines, all under dist/client)
  50-mut-*          the ten FIX19 mutants, the unmutated build, the digest-fix mutant
  log-*             raw logs (log-axe-lines.txt holds the axe lines)
  99-slips.txt      rule slips

Process notes
  - Entry census 0.63 and 0.91 busy cores (limit about 8). The highest in-run census total was 1.86 busy cores. No failure occurred, so no failure classification or repeat was needed.
  - 50-dist-normcmp.txt marks the pairing index CSS -> index JS as REAL CONTENT CHANGE: that is a pairing artefact of the helper (both start with "index"); the CSS file is identical in both builds (it is absent from the hash diff).
