# WP2-INFRA1 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-INFRA1; package WP2; kind
  documentation (repository configuration one-liner); attempt 1.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first, then `.gitattributes` and docs/08 "Commits and pushes"
  (committer check `git diff --cached --check`).

## Problem (observed)

Committers save verbatim logs as evidence under handoff/delivery/evidence/. Some of those
logs record the output of a failing `git diff --check`, or diff context lines, and so
contain trailing whitespace or blank lines at EOF. Each later commit that stages such a
log is blocked. This already blocked WP1-F01-FREEZE, GOV-E8-ACCEPT, WP2-T03-FREEZE and
WP2-T04-FREEZE.

## Coordinator decision (binding)

Evidence logs are verbatim tool output, not source. Add one line at the end of
`.gitattributes`:

    handoff/delivery/evidence/** -whitespace

The line turns off git whitespace-error detection for evidence files only. It must not
change eol/text/binary handling. The precommit privacy check keeps scanning evidence
content.

## Owned (writable) paths

`.gitattributes`; this report; handoff/delivery/evidence/WP2-INFRA1/ (LF, no trailing
whitespace). Do not touch the git index: WP2-T04-FREEZE has 33 paths staged. Do not edit
any other file.

## Checks (read-only; record exits)

1. `git check-attr whitespace -- handoff/delivery/evidence/WP2-T03-FREEZE/diff-check.txt`.
   It must report `unset`.
2. `git check-attr text eol -- handoff/delivery/evidence/WP2-T03-FREEZE/diff-check.txt
   src/server/app.ts`. The output must equal its output before your edit; record both
   runs.
3. `git diff --cached --check`, read-only against the current index. Exit 0 is expected
   now that the attribute applies; record the result whatever it is.
4. `git diff --check -- .gitattributes`.

Return at most 100 words, beginning with your self-reported model: the line added and
each check's exit/output.

## Results

(Worker appends here.)

Added to `.gitattributes`: `handoff/delivery/evidence/** -whitespace`.
Evidence: handoff/delivery/evidence/WP2-INFRA1/.

1. check-attr whitespace on WP2-T03-FREEZE/diff-check.txt: `whitespace: unset`, exit 0.
2. check-attr text eol before and after the edit: identical (`text: auto`, `eol: lf`
   for both files), exit 0 both.
3. `git diff --cached --check`: no output, exit 0.
4. `git diff --check -- .gitattributes`: no output, exit 0.
