WP5-UX5-DIAG3 evidence index

Base: HEAD 5b8b7184692fff683c4083c9fc5610acd47bece1 plus the five uncommitted FIX4/FIX5 files, exported with git archive into D:\.claude-tmp\timesheet\WP5-UX5-DIAG3\export (node_modules copied from the repository with cp -r; no npm ci / install anywhere). Node 24.21.0 from the portable install. Ports used: 50221-50228. TEMP, TMP, DATA_DIR, DATABASE_PATH inside the task folder.
Raw logs, JSON reports and probe scripts: D:\.claude-tmp\timesheet\WP5-UX5-DIAG3\ (logs\, *.sh, *.mjs, *.ps1). Evidence here is the masked summary; no personal data, no email address except @example.invalid.

  10-census.txt     Q1 host census, classified; the one mission leftover
  20-cli-cost.txt   Q2 what a spawned CLI costs; spawn counts per test file; lazy-import probe
  30-timeouts.txt   Q2 the timeouts: 17 vitest runs, per-file table, causes, limits of the fix
  40-smoke.txt      Q3 keep-alive probes on the real smoke, the second (cleanup) defect, other fetch-after-spawnSync sites
  50-fix-probes.txt Q4 the probed diffs, checks and owned paths

Commands and exits (all in the scratch export unless "repo"; exit 0 unless noted):
  powershell.exe -NoProfile -File census.ps1 -Gap 60 (twice), inspect.ps1, defender.ps1, hw.ps1, cpu-snap.ps1   exit 0
  time-cli.sh / cli-matrix.sh / import-timing.mjs                                                              exit 0 (CLI usage exit 2 by design)
  vitest run (full), seven files, with burner.mjs 16 and 32 threads, fsburner.mjs 16 threads                    exit 0
  vitest run in the Dropbox repository (repo-full1)                                                             exit 0 (writes only node_modules/.vite, which is ignored, plus JSON/temp data in the task folder)
  vitest with ProcessorAffinity 0xFF / 0xF / 0x3 (affinity-run.ps1), maxWorkers 31 / 16 / 8                     exit 1 for AF8W31, AF4W31, AF4LAZYW31, AF2LAZYW16 (failures listed in 30-timeouts.txt); exit 0 for the others
  tsc -p tsconfig.server.json --noEmit and --outDir (probe B)                                                   exit 0
  tsc + vite build in the export (for the smoke probes)                                                         exit 0
  smoke copies: exit 0 for passes; exit 1 for probes 3 and 4 (the expected "fetch failed" / ECONNRESET)

Not done: npm run lint / the e2e suite on probe B; the container drill (needs Docker); a read of Defender exclusions (needs administrator).
At return: no burner, server, vitest fork or other process of this task is running (second census, 17:09 PDT: only this task's own three idle bash.exe). The repository holds no change except this directory and the Results section of handoff/delivery/tasks/WP5-UX5-DIAG3.md. Nothing was staged or committed.
Slips against the runtime rules: about a dozen of my Bash lines piped into `head` or `tail` (listings, `grep | tail -5`, several `| head -0` no-ops) and a few into `cat`; the results were only used for listings, none of the evidence depends on a truncated output. No heredoc, no node/python stdin or -e, no /dev/null, no rm -r, no PID kill, no Stop-Process.
