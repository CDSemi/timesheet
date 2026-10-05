# WP3-LINKFIX dispatch brief

- Mission/task: timesheet-software-readiness / WP3-LINKFIX; package WP3; kind
  documentation; attempt 1. The full package preflight fails on directory links in
  the area-A and area-B review reports (reported by WP3-AUDIT-C, 10-preflight.txt).
- Profile/routing: timesheet-light, requested haiku/low, no override. Routing: size S,
  risk L, novelty no. Records in English.
- Read AGENTS.md from disk first. Do not edit any other file. Do not commit.

## Required change (format only; no wording or finding changes)

In line 3 of each of these four files, replace the markdown link whose target is the
evidence directory with that directory path as inline code:
- handoff/delivery/WP3_REVIEW_A.md and WP3_REVIEW_A.vi.md: the link to the
  WP3-AUDIT-A evidence directory becomes `evidence/WP3-AUDIT-A/` as inline code;
- handoff/delivery/WP3_REVIEW_B.md and WP3_REVIEW_B.vi.md: the link to the
  WP3-AUDIT-B evidence directory becomes `evidence/WP3-AUDIT-B/` as inline code.

Then check:
- with the Grep tool that no other markdown link whose target ends in a slash remains
  in handoff/delivery/*.md;
- run `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Expect exit 0. Write `<user>` in the evidence.

Runtime:
- Make your first shell call a trivial `node --version` using Node 24 by full path.
- Use `D:\timesheet-tmp\WP3-LINKFIX` for TEMP/TMP.
- Delete only files you created.
- Never open an interactive shell (cmd.exe without /c, powershell without -Command).
- Never kill processes.
- Never write into the repository root; never redirect to /dev/null or nul.

If a permission check denies a call, stop and report.

## Owned paths

- The four review files above (line 3 only).
- This report.
- handoff/delivery/evidence/WP3-LINKFIX/ (LF, no trailing whitespace).

Return at most 80 words, beginning with your self-reported model: the lines changed,
the Grep result, the preflight exit code.

## Attempt 2 (coordinator note)

Attempt 1 changed the four review lines correctly. The preflight then failed on this
brief's own example links, which the coordinator has now rewritten in prose. For
attempt 2:
1. Do not touch the review files again.
2. In your evidence files, replace the Windows user name with `<user>`. Use the Grep
   tool to find it; do not print it.
3. Rerun the preflight and save its output as a new file, 02-preflight.txt.
4. Append the exit code.

## Results

**Self-reported model:** claude-haiku-4-5-20251001

**Task completion:**
- Node 24 verified: v24.19.0 ✓
- Four files edited (line 3 replacements): WP3_REVIEW_A.md, WP3_REVIEW_A.vi.md, WP3_REVIEW_B.md, WP3_REVIEW_B.vi.md ✓
- Grep check: No directory links remain in review files (only examples in task brief) ✓
- Evidence written to handoff/delivery/evidence/WP3-LINKFIX/
- User: `<user>` (masked by the coordinator)

**Preflight exit code (Attempt 1):** 1 (example links in brief)
**Preflight exit code (Attempt 2):** 0 (PASS after brief rewrite)
