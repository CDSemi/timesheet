WP5-CALDEF-GATE attempt 1 evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name)

Target 300d61f055a859857aa8eb3845ed21f4560e82fa (HEAD = origin/main before and after). Previous accepted source a54061f; documentation-only 5b2f287 between them.
Digest e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7, 885 files, before and after, in the export form, the ls-tree form and npm run digest
(01-digest-*.txt; also in a clean clone of the target and the clone/export source trees byte-identical: 01-digest-npm-clean-clone.txt, 01-export-vs-clone.txt).
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge, 32 logical processors. Times UTC (host clock 2026-11-03).
Scratch copies in <task>: export (git archive of the target, own npm ci), export-prev (git archive of a54061f, own npm ci), export-mut (a copy of export made after its
build; controls, probes, axe and the 36 mutants ran there, restored byte-equal and rebuilt), clone/c1 (clean clone), wp3 (accepted WP3 build for the drill).
The simulated clock is the FIX10 wrapper (shiftclock.mjs); controls in log-control-*.txt validated the preload before the runs.

Process notes (deviations from the brief, all recorded)
  - master2.sh started the drill, chain2, sweep, stress, probes and muts in one background run. After the drill (no polling is allowed) the later stages were moved
    aside (*.keep.sh) and run by the verifier in the foreground in slices that end inside the tool's 10 minutes (stage.sh, stress2.sh, mutb.sh, prep.sh, probes.keep.sh).
    log-chain2-stdout.txt, log-sweep-stdout.txt, log-stress-stdout.txt, log-probes-stdout.txt and log-muts-stdout2.txt therefore only say that the moved script was not found.
  - Full runs were split with --shard=1/2 and 2/2 (Playwright puts every desktop test in shard 1 and every mobile test in shard 2 when both projects run; the real-clock
    desktop run was split into two shards of one project). Per-project counts are the sums, in 17-run-counts.txt.
  - The calendar-default stress runs use --fully-parallel (as the fix's own stress did): without it one spec file runs on one worker only. Each run is split in two shards.
  - Entry census 1.50 busy cores (second sample: the end-of-stage censuses, highest 6.14 in 10-census-c-full-mobile.txt, limit about 8).

Files
  00-*, 01-*        head, status, digest forms, clean clone
  02-*, 03-*, 05-*  npm ci, npm audit, lint, typecheck, build (target and a54061f), verify, npm test x3
  11-*              validators
  17-run-counts.txt per-project counts of every Playwright run (full real clock, six sweeps, stress, diagnostics)
  20-*, 21-*, 22-*, 25-*  scope: name-status, diffstat, diff --check, source/test/docs/scripts diffs, package/lockfile/migration check
  50-*, 51-*        dist/ comparison (50-dist-compare, 50-mapcheck, 50-chunkdiff, 50-chunkcanon), 61-* mutation restore proof
  60-*              smoke DST proof
  70-*              diff review (item 7)
  80-*, 81-*        EN/VI parity and the docs/03 and docs/04 spot check
  mut-*             one log per mutant and the summary
  obs-*             INT3 administrator probe observations
  log-*             raw logs (drill.txt, axe-lines.txt, run-*.txt, fail-*.txt)
