WP5-UX5-REGATE13 attempt 1 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Target d96df5daa25b44b156354bc96605e13e94e44396 (HEAD = origin/main, unchanged before and after). Previous a5cbc91e6965633a0f9d1dd7e912577321cc71e3.
Digest 6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb, 882 files, before and after, in the export form and the ls-tree form (01-digest-*.txt).
The repository form (npm run digest) fails with spawnSync git ENOBUFS, before and after: a note, not a gate failure (01-digest-npm-note.txt).
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge, 32 logical processors. Times UTC (the host clock reads 2026-10-29).
Scratch copies in <task>: export (git archive of the target, own npm ci), export-prev (git archive of a5cbc91, own npm ci), export-mut (a copy of export made after its build; the axe probe and the mutants ran there and were restored byte-equal).
The simulated clock is the FIX10 wrapper (shiftclock.mjs.txt); probe-now.mjs, zone.mjs and the control spec are the REGATE12 files. Ports 51650 (SMOKE_PORT).

Files
  00-*              head, non-handoff status before and after
  01-digest-*       digest before and after
  02-*, 03-*        npm ci, lint, typecheck, build (target and a5cbc91), verify (exit files hold the exits)
  04-e2e-*          real-clock FULL e2e, per-project counts in 04-e2e-project-counts.txt
  05-test-*         npm test three times
  10-census-*       host census results (process names and busy cores only; no command lines); 10-census-entry-1/2 are the entry samples
  11-*              validators
  17-*              the six simulated-clock sweeps: counts and the longest today.spec.ts test
  18-*              stress counts and the test lists
  20-*, 21-*, 22-*, 25-*  scope: name-status, diffstat, git diff --check, the FIX18 diff (src, tests, docs), package/lockfile diff
  50-*, 51-*        dist/ comparison of the a5cbc91 build and the target build (250 files each, 26 differing lines), the normalised comparison, index.html diff
  61-*, 62-*, 63-*, 64-*  the mutants: restored byte-equal, run summaries, the rebuild after restoring, tree diffs
  log-*             raw logs (log-axe-lines.txt holds the axe lines)
  *.sh.txt, *.mjs.txt, *.ts.txt  the scripts

Process notes (honest record)
  - Entry census: two samples, 0.59 and 1.02 busy cores in total (limit about 8), so the gate ran.
  - The in-run census files (10-census-*) were taken right after each Playwright run; they use two back-to-back samples about 1 s apart, so they are coarse.
  - No test failed in any gate run; no failure classification and no repeat was needed. The mutants M1, M2 and M3 failed their tests as intended; M6 passed (see the brief's Results).
  - The drift checks (log-digestw-series.txt) were waiting aids. Seven lines at 10:56Z printed a different hash with 74, 5 and 4 lines: two of my own waiting loops overlapped for a moment and shared temp files
    (digestw.sh then digestw2.sh with its own temp folder). Every non-overlapping check printed the target digest; the final digest ran alone.
  - Rule slips by me, nothing written by them: a few read-only "ls | head" and "grep | head" pipes, one "tail", and one "> /dev/null" on a census call.
  - The mutant lab (export-mut) was rebuilt after the last restore: its dist/ equals the target export's (63-dist-restored-vs-export.txt).
