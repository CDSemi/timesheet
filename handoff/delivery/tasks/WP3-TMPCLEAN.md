# WP3-TMPCLEAN dispatch brief

- Mission/task: timesheet-software-readiness / WP3-TMPCLEAN; package WP3; kind diagnose;
  attempt 1. Bounded housekeeping before the WP3-T04 freeze.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first.

## Why

The WP3-T04 worker found the B: scratch drive with about 448 KB free, with about 7.8 GB
under B:\Temp\claude that belongs to Claude sessions (this one and others). That folder
also holds this session's agent state. This project's tests and e2e harness create
temporary directories in the OS temp directory, which are normally removed on teardown
unless a run was interrupted or the disk filled.

## Hard limits

- **Never touch anything under B:\Temp\claude**, not even to list its subfolders beyond
  one total size.
- Delete only directories that this repository's own code creates:
  - first find the prefixes read-only: grep `tests/`, `scripts/` and `playwright.config.ts`
    for `mkdtemp`, `tmpdir` and temp-directory name prefixes, and list them;
  - also the known e2e names `timesheet-e2e-*`, `timesheet-e2e-screenshots` and
    `timesheet-e2e-output`;
  - only in the OS temp directory or in C:\Users\<user>\AppData\Local\Temp;
  - each one must be unused (no running process holds it).
- Delete nothing else, even if it is large. Report other large consumers as path and size
  only, without reading their contents.
- Do not touch the repository, Dropbox, the npm cache or any other user files.
- If a deletion is refused or a call is denied, stop and report; do not retry or work
  around it.

## Steps

1. Record free space on B: and C:, and the OS temp path (`os.tmpdir()` with Node 24,
   called by full path).
2. List the project prefixes found in step "Hard limits" and the matching directories with
   their sizes; confirm each is unused.
3. Delete the matching unused directories. Record each path and size.
4. Record free space on B: and C: again, and the total size of B:\Temp\claude (one
   number).
5. List the ten largest top-level entries of the B: temp directory, excluding
   B:\Temp\claude, as path and size only.

Write the evidence to handoff/delivery/evidence/WP3-TMPCLEAN/space.txt (masked: show
`<user>` in place of the account name; LF, no trailing whitespace, single final newline).
Never write into the repository root; on Windows never redirect to /dev/null or nul from a
POSIX shell. Append the results here.

Return at most 120 words, beginning with your self-reported model:
- free space before and after on B: and C:;
- the prefixes found, and what was deleted, with sizes;
- the B:\Temp\claude total and other large consumers (path and size only).

## Results

(Light worker appends here.)

Results: deleted 28 repo temp dirs (about 14.9 MB); B: free 229376 -> 22052864 bytes. Evidence: evidence/WP3-TMPCLEAN/space.txt
