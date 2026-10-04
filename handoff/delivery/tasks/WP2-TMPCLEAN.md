# WP2-TMPCLEAN dispatch brief

- Mission/task: timesheet-software-readiness / WP2-TMPCLEAN; package WP2; kind diagnose;
  attempt 1. Bounded housekeeping before the two package-final audits.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first.

## Why

WP2-GATE found the B: temp drive with about 12 MB free. That drive also holds this
session's agent state, under B:\Temp\claude. The two audits that follow are large. This
project's e2e harness writes to the OS temp directory:
- `timesheet-e2e-*`: per-worker temp databases created by `mkdtemp`, removed on teardown
  unless a run was interrupted;
- `timesheet-e2e-screenshots`;
- `timesheet-e2e-output`: Playwright output and traces.
Other agents may also have left `timesheet`- or `wp2`-prefixed export directories.

## Hard limits

- **Never touch anything under B:\Temp\claude.**
- Delete only directories that match one of these, in the OS temp directory or in
  C:\Users\<user>\AppData\Local\Temp:
  - `timesheet-e2e-*`;
  - `timesheet-e2e-screenshots`;
  - `timesheet-e2e-output`;
  - an empty `wp2gate` directory.
  Each one must be unused (no running process holds it).
- Delete nothing else, even if it is large. Report other large consumers instead, as
  path and size only, without reading their contents.
- Do not touch the repository, Dropbox, the npm cache or any other user files.
- If a deletion is refused or a call is denied, stop and report; do not retry or work
  around it.

## Steps

1. Record free space on B: and C:, and the OS temp path (`os.tmpdir()` with Node 24, called
   by full path).
2. List the matching directories with their sizes, and confirm that each is unused.
3. Delete the matching unused directories. Record each path and size.
4. Record free space on B: and C: again.
5. List the ten largest top-level entries of the B: temp directory, excluding
   B:\Temp\claude, as path and size only.

Write the evidence to handoff/delivery/evidence/WP2-TMPCLEAN/space.txt (masked: show
`<user>` in place of the account name; LF). Append the results here.

Return at most 120 words, beginning with your self-reported model:
- free space before and after on B: and C:;
- what was deleted, with sizes;
- other large consumers (path and size only).

## Results

(Light worker appends here.)

See evidence/WP2-TMPCLEAN/space.txt. B: free 535 MB -> 548 MB (not 12 MB at start); freed ~13 MB; wp2gate left (non-empty).
