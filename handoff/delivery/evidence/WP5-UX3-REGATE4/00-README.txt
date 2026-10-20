WP5-UX3-REGATE4 evidence (masked LF text). Target 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d, digest 95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f (833 files).
Index:
- scope-names / scope-stat / test-diff: item 1 scope proof (86294412..5c101c1 outside handoff/).
- cmp-dist, 51-*: item 1 build comparison (236 files per build, 0 hash differences).
- ci, lint, test, build, step1: item 2 install/lint/test/build.
- control-real / control-i2 / control-i4: item 3 preload control.
- full-real, full-real2, full-real3: item 2 real-clock full runs (1 unrelated failure each: fail1/fail2/fail3).
- surf-solo, flaky-hover-1..3, flaky-surf-1..3: the failing tests alone on the real clock (all pass).
- full-1101, full-1026: item 3 simulated-clock full runs (0 failed).
- solo-1101-0730, solo-1027-0900, solo-1027-0630: item 4 the fixed test alone.
- 70-mutantsB, mutB-0145, mutB-1200, mutBrest-0145: item 4 mutant M5b (valid run). 70-mutants-attempt1, mut-0145, mut-1200, mutrest-0145: first attempt, with a script error in the 12:00 case (the mutation was not applied there); kept for transparency, not used as proof.
- 11-*: item 5 validators. digest-before/after, 01-digest-*: digest checks. procs, nonhandoff-status-after: leftovers.
Slips: a solo-run regex that matched no test in the first pass (overwritten by the corrected rerun), one pipe into head -0 and one 'ls | head -0', plus 'tail -0' calls; no stdin feed to node or python.
