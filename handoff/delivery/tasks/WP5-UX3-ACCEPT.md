# WP5-UX3-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-ACCEPT; package WP5; kind commit;
  attempt 1; depends on WP5-UX3-ACCEPT-DOCS (done) and WP5-UX3-AUDIT-INT (PASS).
- This is the accept commit of UI change round 3. WP5 is re-accepted on 8e55710 /
  507de97c (gate WP5-UX3-REGATE5 PASS, audit WP5-UX3-AUDIT-INT PASS). It is
  handoff-only: no file outside `handoff/` changes.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 8e557100d16b6b6eb86a48e00276835761aabfdf.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue. Otherwise stop.
  - Push after the commit. Create no tag.
- Runtime: the same as `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md` "Runtime", with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX3-ACCEPT`.
  - The capitalised rules still apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES
    INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS, NO `rm -r`.
- The coordinator writes no file while you run.

## Expected working-tree set

Nothing outside `handoff/` may be changed or untracked. If anything is, stop and report.

Recompute the digest with Node 24 before `git add`. It must equal
507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (12):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` and `.vi.md`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX6-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`.
- **New records (5):**
  - `handoff/delivery/tasks/WP5-UX3-REGATE5.md`;
  - `handoff/delivery/tasks/WP5-UX3-ACCEPT-DOCS.md`;
  - `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`;
  - this brief, as it stands before you append results.
- **New evidence folders (4),** each under `handoff/delivery/evidence/`:
  `WP5-UX3-FIX6-FREEZE/`, `WP5-UX3-REGATE5/`, `WP5-UX3-AUDIT-INT/` (`.txt` and 10
  `-synthetic.png`) and `WP5-UX3-ACCEPT-DOCS/`.

  Count each folder with Glob first. Stage a folder only if every name ends in `.txt` or
  `-synthetic.png`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX3-ACCEPT/` stay
unstaged. Write both `checks.txt` and `commit-message.txt` there.

**Rules carried over from the earlier freeze briefs:**
- A privacy `profile-path` finding in an evidence log may be masked: replace the account
  segment with `<user>`, then re-stage. Any other privacy finding stops the commit.
- Other modified tracked handoff files: a line-ending-only change stays unstaged; a content
  change stops the commit.
- Any other changed or untracked path stops the commit.

## Checks before committing

Record each exit code in `checks.txt`.

1. `node --version`.
2. HEAD and origin/main.
3. The digest (507de97c…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task or review record
outside `evidence/`.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept WP5 after UI change round 3 (8e55710)

- docs(handoff):
  - WP5-UX3-REGATE5 PASS on 8e55710 and its evidence;
  - WP5-UX3-AUDIT-INT PASS, its review pair and evidence (final recheck and integration,
    no finding);
  - the pilot packet identity refreshed to 8e55710 / 507de97c (server and domain builds
    byte-identical to a643794);
  - the WP5 handoff section "Re-acceptance after UI change round 3 (WP5-UX3)";
  - STATE, NEXT_ACTION (+ vi), the board and the checkpoint (+ vi).
- WP5 is re-accepted on 8e55710 / 507de97c. UI change round 3 is closed. The NAS is NOT
  VERIFIED; the pilot is not authorized.

Task: WP5-UX3-ACCEPT (re-accept after UI change round 3)
Gate: WP5-UX3-REGATE5 PASS on 8e55710 (NAS NOT VERIFIED)
Audit: WP5-UX3-AUDIT-INT PASS on 8e55710 / 507de97c
Digest: 507de97c (unchanged)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group;
- every check with its exit code;
- any fix, masking or stop reason.

## Results
