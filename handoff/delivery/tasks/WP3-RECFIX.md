# WP3-RECFIX dispatch brief

- Mission/task: timesheet-software-readiness / WP3-RECFIX; package WP3; kind
  documentation; attempt 1.
- Why: WP3-REGATE3 item 12 failed on the live tree. The cause is
  `validate_package.py --preflight` reporting "Missing translation" for the untracked
  evidence file `handoff/delivery/evidence/WP3-FIX3-FREEZE/result.md`. The WP3-FIX3-FREEZE
  committer wrote that file with a `.md` extension instead of `.txt`, and every `.md`
  under handoff needs a `.vi.md` pair.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first. Do not commit.

## Hard limits

- Change only that one file's name. Do not edit its content, any other file, source,
  tests, documents, the board or any review.
- Delete nothing. Rename with one literal-path command:
  `Move-Item -LiteralPath '<repo>\handoff\delivery\evidence\WP3-FIX3-FREEZE\result.md'
  -Destination '<repo>\handoff\delivery\evidence\WP3-FIX3-FREEZE\result.txt'`, where
  `<repo>` is `D:\Dropbox\Work.CDSemi\timesheet`. Run it through `powershell -NoProfile
  -Command`. Do not use a wildcard, a variable or recursion.
- Never open an interactive shell. Never kill processes.
- If the destination already exists, or the move is refused, or a permission check
  denies a call, stop at once and report. Do not retry or work around it.
- Never write into the repository root. Never redirect to /dev/null or nul.

## Steps

1. Make the first shell call a trivial `node --version` with Node 24 by its full
   portable path.
2. Confirm that `result.md` exists and `result.txt` does not. Read no content.
3. Run the single rename command above.
4. With the Grep tool, confirm the renamed file has no CR characters and no unmasked
   email address or Windows user name. Count only; never print matches.
5. Run `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   in the project folder. Record its exit code and summary line. Write `<user>` in the
   evidence.

Write evidence to handoff/delivery/evidence/WP3-RECFIX/rename.txt: masked, LF, no
trailing whitespace, single final newline. Append the results here.

Return at most 80 words, beginning with your self-reported model:
- the rename exit code;
- the Grep counts;
- the preflight exit code and summary;
- any blocker.

## Results

(Light worker appends here.)

Rename exit 0. Grep counts CR/email/user name: 0/0/0. Preflight exit 0, scenario_total 91. No blocker. Evidence: handoff/delivery/evidence/WP3-RECFIX/rename.txt
