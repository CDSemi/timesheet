WP5-UX5-REGATE12 attempt 2 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Attempt 1 stopped at the entry census (00-entry-census.txt, kept). Attempt 2 raised the limit to about 8 busy cores of non-mission load (Addendum 1).
Target a5cbc91e6965633a0f9d1dd7e912577321cc71e3 (HEAD = origin/main, unchanged). Previous 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2.
Digest 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf, 882 files, before and after, in three forms (export, ls-tree, npm run digest): 01-digest-*.txt.
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge, 32 logical processors. Times UTC (the host clock reads 2026-10-29). Scratch copies in <task>: export (git archive of the
target, own npm ci), export-prev (git archive of 1fe5ad3, own npm ci), export-mut (a copy of export made after its build; every control and mutant ran there and was restored byte-equal).
The simulated clock is the FIX10 wrapper (shiftclock.mjs.txt, byte-identical to the WP5-UX-FIX10 file); probe-now.mjs, zone.mjs and the control spec are the REGATE11 files.

Files
  00-*              head, non-handoff status before and after
  01-digest-*       digest before and after (the "mid" files are drift checks taken while waiting, see notes)
  02-*, 03-*        npm ci, lint, typecheck, build (target and 1fe5ad3), verify (exit files hold the exits)
  04-e2e-*          real-clock FULL e2e, per-project counts in 04-e2e-project-counts.txt
  05-test-*         npm test once
  10-census-*       host census results (process names and busy cores only; no command lines), 10-census-final-procs.txt counts of process names
  11-*              validators
  17-*              the six simulated-clock sweeps: counts, longest logo.spec.ts test, the crossing test duration
  18-stress-counts.txt  the stress runs; log-stress-*.txt the logs
  20-*, 21-*, 22-*, 25-*  scope: name-status, diffstat, carry-forward diff (src + fixtures.ts: 0 lines), the FIX17 diff, git diff --check, package/lockfile diff
  51-*              dist/ comparison of the 1fe5ad3 build and the target build (250 files each, 0 differing lines), and the target before and after verify
  61-*, 62-*, 63-*, 64-*  the three mutants: byte-equal checks, applies, the product-mutant build and restore build, dist/ equal to the base, tree diffs after restoring
  log-*             raw logs
  *.sh.txt, *.mjs.txt, *.ts.txt  the scripts

Process notes (honest record)
  - Entry census of attempt 2: two samples gave 21 and 19 percent of 32 logical processors, 6.7 and 6.1 busy cores in total, of which one foreign process
    accounted for 3.3 and 2.4 cores (00-entry-census-a2.txt); both under the new limit of 8, so the gate ran.
    The in-run census files (10-census-*) were taken right after each Playwright run; they use two back-to-back samples about 1 s apart, so they are coarse.
  - No test failed in any gate run, so no failure classification and no repeat was needed.
  - The intermediate digest drift checks ran while waiting. Two of them (log-digest-mid-series.txt, log-digestw-series.txt) printed a different hash with 279 and 794 lines: two of my
    own waiting loops overlapped and shared temp files. Every non-overlapping check printed the target digest; the final "after" digest ran alone.
  - Rule slips by me, nothing written by them: several "ls | head", "cat | head", "tail" and "grep | head" read-only pipes, and one "> /dev/null" on a tail of a counts file.
  - The two-tab import tests under the burner use a 300 s burner; the Playwright runs ended inside it (burnrun lines in the logs). The burner ends by itself.
