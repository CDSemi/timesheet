WP5-UX5-FIX11 evidence (the worker's own; masked LF text; synthetic data and capture mode only)

Base: a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5 (HEAD = origin/main); no status line outside handoff/ at the start.
Task folder: <task> (D:\.claude-tmp\timesheet\WP5-UX5-FIX11), ports 50620-50659 (the e2e and axe harness pick their own free
loopback ports; the smoke used SMOKE_PORT=50631).

01  process census before the work (read-only inline query)
10  F-UX5B2-1 reproduced on HEAD: the new restore.test.ts case fails (the held job of revision 1 is releasable, blocker null)
11  F-UX5A2-1 reproduced on HEAD: the new e2e check fails (right and bottom edges not painted)
12  the three changed integration files on the fix: 119 passed
13  the two new/changed e2e tests on the fix: 2 passed
20-26 mutants: G2, P4, MA1, MA8a (ring invisible), MA8b (ring layer below the columns), MA9, R2 (succeeded not counted)
30-32 ring coverage probe (every pixel of each edge's band, 900 and 768px, light and dark, scrolled start, middle and end)
40-42 axe-core 4.14.0 probe (loaded from the task folder)
50  EN/VI parity of the four changed document pairs
6x  repository checks, the FULL e2e, the container drill and the digest (files named in the brief's Results)
ring-768-light-synthetic.png, ring-768-dark-synthetic.png  the focus ring of the first Review week card, scrolled, at 768px
