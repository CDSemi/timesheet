# WP3-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP3-ACCEPT; package WP3; kind commit;
  attempt 1; depends on WP3-ACCREC.
- This commit records the WP3 acceptance and changes no source. The accepted source is
  49651c8bb91d56bf6c6966405257537ec7ca474b, digest
  c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72. It was accepted on:
  - WP3-REGATE3 PASS;
  - the final audits WP3-RECHECK-A attempt 3 and WP3-RECHECK-BC3, both PASS.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M. The commit holds many evidence files, synthetic images and probe
  sources. Novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  49651c8bb91d56bf6c6966405257537ec7ca474b. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here. Make the
    first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP3-ACCEPT` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be staged.

There is one known exception, which is not staged: three untracked owner files under
`.claude/skills/readme-md/`:
- `SKILL.md`
- `references/markdown.md`
- `references/outlines.md`

The owner added them, and they go through the GOV-SKILL cycle after this commit (owner
decision H-Q3 (a)). Leave them untracked and unstaged, and do not touch them. Any other
changed or untracked path outside handoff/ stops the commit.

Digest:
- The committed tree's digest in the `git ls-tree` form must equal c31c300c…. Use the
  same method as WP3-REGATE3's `digest-lstree-*.txt` evidence, and record it.
- The working-tree `npm run digest` also counts the three skill files. Record its value,
  but do not use it as the check.

Handoff files to stage:
- New:
  - handoff/delivery/WP3_RECHECK_A3.md and .vi.md;
  - handoff/delivery/WP3_RECHECK_BC3.md and .vi.md;
  - handoff/delivery/tasks/: WP3-RECFIX.md, WP3-ACCEPT.md (this brief, staged before you
    append results), GOV-SKILL-FREEZE.md, GOV-SKILL-GATE.md and GOV-SKILL-AUDIT.md;
  - every file under these handoff/delivery/evidence/ directories: WP3-FIX3-FREEZE/,
    WP3-REGATE3/, WP3-RECFIX/, WP3-RECHECK-BC3/ and WP3-ACCREC/.
- Modified:
  - handoff/NEXT_ACTION.md and .vi.md;
  - handoff/delivery/STATE.json and handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/WP3_HANDOFF.md and .vi.md;
  - handoff/delivery/tasks/: WP3-FIX3-FREEZE.md, WP3-REGATE3.md, WP3-RECHECK-A.md,
    WP3-RECHECK-BC3.md and WP3-ACCREC.md.

Your appended results and your evidence in handoff/delivery/evidence/WP3-ACCEPT/ stay
unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under evidence/;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content.

PNG files are allowed only under the evidence directories listed above, and only when
named `*-synthetic.png`.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The ls-tree digest of HEAD. It must be c31c300c….
3. `git add` with the explicit paths, as its own command.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Also:
- View at least six staged images with the Read tool, from WP3-REGATE3/ and
  WP3-RECHECK-BC3/ if present, otherwise from any listed directory. Record how many.
- Use the Grep tool to confirm that no `.claude/` path is staged.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, remove exactly that line, re-stage it and record the file name.

If the precommit check masks a user-profile path in an evidence log, that is allowed. If
it blocks an email address or the Windows user name in an evidence log under the listed
directories, replace each such token with `<email>` or `<user>` in that evidence file
only, re-stage it and rerun the check. Count the tokens with the Grep tool and never
print them.

If any other check fails, do not commit; report the file, line and rule. If any call is
denied by a permission check, stop at once. Do not retry, split or rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs, probe sources, names or addresses through the shell. Keep evidence LF.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record WP3 acceptance: final gate and independent rechecks pass at 49651c8

- docs(handoff): WP3-REGATE3 PASS on 49651c8 (1420 tests, smoke 40, e2e 127 passed / 5
  skipped, races 20/20, migrations; the item 12 record gap fixed by WP3-RECFIX),
  digest c31c300c
- docs(handoff): final independent rechecks WP3_RECHECK_A3 and WP3_RECHECK_BC3, both
  PASS, with evidence (+ vi)
- docs(handoff): WP3_HANDOFF acceptance record (+ vi); STATE marks WP3 passed with
  carried risks; NEXT_ACTION and checkpoint point to the GOV-SKILL cycle and WP4
  planning; GOV-SKILL briefs

Task: WP3-ACCEPT (WP3 acceptance record; no source change)

## Push and report

Push per the profile. Append these results:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- the number of images viewed;
- the check exit codes;
- any blockers.

Write evidence to handoff/delivery/evidence/WP3-ACCEPT/ as `.txt` files only. Return at
most 150 words.

## Results

(Committer appends here.)
Self-reported model: claude-sonnet-5-5
- Node: v24.21.0 (portable). Pre-HEAD 49651c8bb91d56bf6c6966405257537ec7ca474b; post-HEAD b103923d7f412860b189f692cf23c11ee2915e86.
- Commit b103923d7f412860b189f692cf23c11ee2915e86, pushed to origin main, remote SHA identical.
- ls-tree digest c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72 (match); worktree npm run digest aab8b32cd69a8ba598dc91929290ec198107664e5bc42fb2616c7eb6da0a705d (724 files, recorded only). Staged: 92 files.
- Images viewed: 7. No .claude/ path staged. Masking: none needed. Unstaged extras: none.
- Exit codes: precommit 0, diff --check 0, JSON parse 0, validate_orchestration 0, check_recovery 0, preflight 0, push 0.
- Blockers: none. Evidence: handoff/delivery/evidence/WP3-ACCEPT/ (unstaged).
