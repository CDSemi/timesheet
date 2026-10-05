# WP3-TMPMOVE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-TMPMOVE; package WP3; kind diagnose;
  attempt 1. This is bounded housekeeping requested directly by the owner on 2026-10-05:
  move the temporary work folder from `D:\timesheet-tmp\<task>` to
  `D:\.claude-tmp\timesheet\<task>`.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first. No other agent is running, so nothing uses the old
  folder.

## Hard limits

- Touch only `D:\timesheet-tmp` and `D:\.claude-tmp`. Never touch the repository,
  Dropbox, `B:\Temp\claude`, the npm cache or any other user files.
- Delete nothing.
- Move by literal paths only: no wildcard, no variable expansion, no recursion flag.
- Never open an interactive shell (cmd.exe without /c, powershell without -Command or
  -File). Never kill processes.
- If a move is refused, a file is locked or a call is denied by a permission check, stop
  at once and report. Do not retry, force or work around it.
- Never write into the repository root. Never redirect to /dev/null or nul, including
  `2>/dev/null`.

## Steps

1. Make the first shell call a trivial `node --version`, using Node 24 by its full
   portable path.
2. Record two facts: whether `D:\timesheet-tmp` exists and its top-level entries (name
   and size only), and whether `D:\.claude-tmp` and `D:\.claude-tmp\timesheet` exist.
   Read no file contents.
3. Move the folder, depending on what step 2 found:
   - If `D:\.claude-tmp\timesheet` does not exist, create `D:\.claude-tmp` if it is
     missing. Then move the whole folder in one command:
     `Move-Item -LiteralPath 'D:\timesheet-tmp' -Destination 'D:\.claude-tmp\timesheet'`.
     This is the same volume, so the move is a rename.
   - If `D:\.claude-tmp\timesheet` already exists, move each top-level entry of
     `D:\timesheet-tmp` into it, one `Move-Item -LiteralPath` command per entry. Stop
     if a name already exists at the destination.
4. Verify:
   - `D:\.claude-tmp\timesheet\WP3-FIX2\mask.py` exists;
   - `D:\timesheet-tmp` no longer exists. If an empty `D:\timesheet-tmp` remains, leave
     it and report it.
5. Record the top-level entries of `D:\.claude-tmp\timesheet`, name and size only.

Write the evidence to handoff/delivery/evidence/WP3-TMPMOVE/move.txt. Mask it by showing
`<user>` in place of the account name. Use LF line endings, no trailing whitespace and a
single final newline. Append the results here.

Return at most 100 words, beginning with your self-reported model:
- what existed before;
- the move commands and their exit codes;
- the verification;
- any blocker.

## Results

(Light worker appends here.)

Moved `D:\timesheet-tmp` to `D:\.claude-tmp\timesheet` (46 dirs; path escapes corrected
by the coordinator); both commands exit 0; mask.py exists; old folder gone. Evidence: handoff/delivery/evidence/WP3-TMPMOVE/move.txt
