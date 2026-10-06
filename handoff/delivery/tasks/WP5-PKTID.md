# WP5-PKTID dispatch brief

- Mission/task: timesheet-software-readiness / WP5-PKTID; package WP5; kind
  documentation (handoff only); attempt 1; depends on WP5-REGATE2 (PASS).
- Scope: refresh the release identity in the pilot packet to the regated freeze.
  Nothing else changes. The source digest stays the same.
- The release commit and digest come from WP5-REGATE2. The development-machine image ID
  comes from WP5-REGATE, because WP5-REGATE2 builds no image and its delta is
  documentation only. Say so in the packet.
- Profile/routing: timesheet-light, requested sonnet/low, no override. Routing: size S,
  risk L, novelty no. Records in English; the packet stays bilingual (EN
  authoritative, VI matching).

## Required edits

In `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`, sections 0 and 6 only:
- release commit: the WP5-REGATE2 `freeze_commit`, given in the dispatch prompt;
- source digest: the WP5-REGATE2 digest of record;
- image ID: the WP5-REGATE drill image ID, labelled as the development-machine build of
  9bcdd88 (documentation-only delta to the release commit). Keep the existing rule
  that the operator records the image ID built on the NAS (R-B5-1, R-F3);
- any sentence that names the earlier freeze (74d5bfe) or the earlier gate as the
  current release.

Read the values from `handoff/delivery/tasks/WP5-REGATE2.md`,
`handoff/delivery/tasks/WP5-REGATE.md` and their evidence. Do not copy them from this
brief. Do not edit any other section.

## Checks

- EN/VI parity of sections 0 and 6.
- Grep both files: none of `74d5bfe`, `0a64a75f`, `9bcdd88` or `1b8ceae4` may appear
  as the current release commit or digest. A history mention is allowed if it is
  labelled as earlier, and the image-build note may name 9bcdd88.
- Run the precommit check over the two files.
- Run `validate_package.py --preflight` by its script path with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- The digest before and after must be identical.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\WP5-PKTID`. Never redirect to /dev/null
  or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report.
- Owned paths:
  - the two packet files;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-PKTID/`, with masked LF `.txt` only.

  Write with the Edit tool. Do not commit.

Return at most 100 words, beginning with your self-reported model.

## Results

(Worker appends here.)
