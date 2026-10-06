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

## Attempt 2 (coordinator note)

Attempt 1 refreshed sections 0 and 6. Two follow-ups:

1. Sections 3 and 5 still name 74d5bfe and the WP5-GATE image `0addd2000…`. Those
   facts are historical, and they stay true:
   - the samples were generated from 74d5bfe;
   - the development-machine restore proof comes from WP5-GATE on 74d5bfe.

   Do not replace those values. Add one labelled sentence to section 3 and one to
   section 5, in EN and VI. Each sentence says where its facts were produced (74d5bfe,
   WP5-GATE). It also says that the delta from 74d5bfe to the release commit 014bd47 is
   documentation only. All 230 `dist/` files are byte-identical between 9bcdd88 and
   014bd47 (WP5-REGATE2), and WP5-REGATE passed the drill again on 9bcdd88. Cite the
   board task names, not file links.
2. Your "conflict" note is not a conflict. In WP5-REGATE row 4, `git archive 49651c8`
   is the `--wp3` old-version tree for the upgrade stage. The drill image is built
   from the clean export of the freeze, 9bcdd88. Keep the section 0 and 6 wording as
   "development-machine build of 9bcdd88". Do not change it.

Run the same checks again. For the precommit check, stage nothing; run it on the two
packet files with its file-list or self-check mode. If it has no such mode, record that
it inspected 0 files. Append "### Attempt 2 results".

## Results

Sections 0 and 6 of both packet files now name freeze 014bd47a, digest 150420e7...33e61 (779 files) and the WP5-REGATE drill image sha256:bd17d061...49 (dev machine, 9bcdd88). Digest after = record; precommit-check exit 0 (0 staged files); validate_package --preflight exit 0. Evidence: handoff/delivery/evidence/WP5-PKTID/. Open: WP5-REGATE row 4 records the drill source as `git archive 49651c8`, not 9bcdd88. Sections 3 and 5 still name 74d5bfe and the old image 0addd2000 (out of scope).

### Attempt 2 results

Added one labelled provenance sentence to sections 3 and 5 in EN and VI (74d5bfe, WP5-GATE; documentation-only delta to 014bd47; 230 dist files byte-identical, WP5-REGATE2; WP5-REGATE drill re-passed on 9bcdd88). Sections 0 and 6 untouched; the 49651c8 note above is withdrawn (it is the --wp3 old-version tree). Digest unchanged (150420e7...); precommit exit 0, inspected 0 files (nothing staged); preflight exit 0. Remaining 74d5bfe/0addd2000 mentions are labelled history. Evidence 04-06 in evidence/WP5-PKTID/.
