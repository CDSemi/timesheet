# WP2-FIXB3-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIXB3-FREEZE; package WP2; kind
  commit; attempt 1; depends on WP2-FIXB3.
- This is the new package-final freeze after the third fix round. WP2-GATE4 and the final
  rechecks review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: images and probe sources), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a3d1b6555c352afa68b3d61ddc67f0c596742698. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

Modified source and tests (and nothing else outside handoff/):
- src/client/styles.css.
- tests/client/zoneOracle.ts and tests/client/zoneOracle.test.ts.

New handoff files:
- handoff/delivery/WP2_RECHECK_A3.md and .vi.md; handoff/delivery/WP2_RECHECK_B3.md and
  .vi.md.
- handoff/delivery/tasks/: WP2-FIXB3.md, WP2-FIXB3-FREEZE.md, WP2-GATE4.md and
  WP2-AUDIT-B4.md.
- Every file under these handoff/delivery/evidence/ directories, including
  subdirectories:
  - WP2-FIXB2-FREEZE/ and WP2-GATE3/;
  - WP2-AUDIT-A2-a2/ and WP2-AUDIT-B3/;
  - WP2-FIXB3/.

Modified handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-FIXB2-FREEZE.md, WP2-GATE3.md, WP2-AUDIT-A2.md and
  WP2-AUDIT-B3.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-FIXB3-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any Playwright output, any `.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- `git add` with the explicit paths, as its own command (the listed evidence directories
  are allowed);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else.

Privacy hygiene: the precommit script is the privacy scan.
- Do not print diffs, test bodies, probe sources, seeding code or CSV content through
  the shell.
- For any extra check, use the Grep tool and report masked values only.
- View at least six representative new screenshots with the Read tool, and record how
  many.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. Keep your text evidence LF, free of trailing
whitespace and ending in a single final newline. Stop any background process you started
before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Tokenize every WP2 style literal and make the zone oracle throw on DST folds

- style(ui): all 67 WP2-introduced literal occurrences become :root custom properties;
  computed values are identical across 20 screens (WP2-B3-01)
- test: zoneOracle instantOfWallTime throws on DST folds and gaps, as documented; fold
  and gap unit cases (WP2-B3-02)
- docs(handoff): second-fix freeze evidence, GATE3 PASS, area A attempt-2 PASS and area B3
  recheck reports (+ vi), GATE4 and B4 briefs

Task: WP2-FIXB3-FREEZE (package-final freeze after the third fix round; WP2-GATE4 and the
final rechecks follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-FIXB3-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
