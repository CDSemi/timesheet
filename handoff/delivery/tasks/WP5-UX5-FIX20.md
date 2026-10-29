# WP5-UX5-FIX20 dispatch brief (documentation fix for F-UX5RN-1)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX20, package WP5, kind fix,
  attempt 1.
  - It addresses WP5-UX5-AUDIT-RN (FIX REQUIRED on dc487c6 / 2072e3f2), and depends on
    WP5-UX5-REGATE15 (PASS on dc487c6).
  - Read `handoff/delivery/WP5_UX5_REVIEW_RN.md`: the finding, its expected text, the
    optional risks R-UX5RN-1..6 and the one next action.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size S, risk L, novelty no (docs/08 "Accepted finding naming file/fix/tests": the worker
  reproduces first). Task record in English; the documents keep their EN/VI pairs.
- **Baseline.**
  - HEAD should be `dc487c6114dd488121b1de1444e11cdacf5c237b` (WP5-UX5-RELNOTES-FREEZE,
    pushed), or a later commit that changes only `handoff/`.
  - Digest `2072e3f206ff2003a9c7563b23267da463eeae6373f3f4eb98e660137fefb99b`, 882 files.
  - Record HEAD and `npm run digest` before you edit. If anything outside `handoff/` differs
    from HEAD before you start, stop and report.
- **AGENTS.md on disk wins.** Read it first.

## What to change

1. **F-UX5RN-1 (required).** Line 3 of `DEVELOPMENT.md` and of `DEVELOPMENT.vi.md`.
   - Reproduce first: record the current line 3 of both files.
   - Make the status match the README's line 3 at HEAD:
     - WP1 to WP4 independently accepted;
     - WP5 software ready, independently accepted and re-accepted after UI change rounds 1
       to 5;
     - pilot pending, and the NAS NOT VERIFIED.
   - Add the WP5 handoff (`handoff/delivery/WP5_HANDOFF.md`, and the `.vi.md` link in the VI
     file) to the handoffs that line names.
   - Keep the rest of the line as it is. Change nothing else in DEVELOPMENT.
2. **R-UX5RN-1 (required by the finding's bounded fix).** `docs/12_RELEASE_NOTES.md` line 7,
   and its VI line.
   - Give one rule for the release: the release is the last WP5 freeze commit, gated and
     audited.
   - Say that after the package-final gate and audit of rounds 4 and 5 (WP5-UX5-REGATE14
     and WP5-UX5-AUDIT-INT3 on `0b45781`), the documentation was refreshed in
     documentation-only commits, each gated and audited again.
   - Its SHA, digest and file count are in the WP5 handoff and in the gate record.
   - Remove the wording that lets a reader take `0b45781` for the release: the opening "The
     release is the WP5 package-final freeze commit" together with the closing "The release
     is that commit".
   - Keep the rule that a document cannot hold the digest of its own tree, and the
     historical `8e99d2c` / `1e59ad31` sentence. Write no new digest.
3. **Optional wording items, folded in because the same files change:**
   - **R-UX5RN-2.** Restore the still-true context clause dropped from the round-5 drill
     line (docs/12 about line 119, EN and VI): the slices ran typecheck, lint, unit,
     integration, the full e2e and the built-server smoke. Do this without bringing back
     the old claim that the drill had not run.
   - **R-UX5RN-3.** In the drill carry-forward sentence, also name the Dockerfile and
     `vite.config.ts` as unchanged since `1fe5ad3`. Verify that with
     `git diff --stat 1fe5ad3 dc487c6 -- Dockerfile vite.config.ts` and record the output.
   - **R-UX5RN-5.** README step 3 (line 11): make the list of handoffs read naturally in EN.
     Add the missing comma between the WP2 and WP3 links in VI.
4. **Make no other change.** Do not touch the pilot packet, the WP5 handoff or any
   `handoff/` record except this brief's Results. ACCEPT-DOCS handles R-UX5RN-4 and
   R-UX5RN-6 later.

## Hard limits

- Change only:
  - `DEVELOPMENT.md` and `DEVELOPMENT.vi.md`;
  - `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`;
  - `README.md` and `README.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX20/` (masked LF `.txt`).
- No other path outside `handoff/` may change. Do not commit or push. Run no git command that
  changes the index, the working tree or any configuration.
- No markdown link to a file that does not exist. Keep every existing link.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -p`, NO `python -c`,
    NO `| node`, NO `| python`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`,
    `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO `sed -i`, NO
    `sleep` AS A WAIT.**
  - Use the Write, Edit, Read, Glob and Grep tools for files.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX20`. Set TEMP and TMP to it. Put Node 24
  first on PATH before any node or npm call. Do not run `npm ci` or `npm install`.
- Never write an email address other than the full synthetic `@example.invalid` form, and
  never write a profile path (write `<user>`).
- If a permission check denies a call, stop and report.

## Checks

1. Run `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`).
   It must exit 0.
2. Run `git status --porcelain` and `git diff --stat`, both outside `handoff/`. Only the six
   files above may differ, and only those you changed.
3. Run `npm run digest` after the edit. Record the new digest and the file count (expected
   882).
4. **EN/VI parity** of the three pairs: heading counts, and identical IDs, SHAs and links.
   Check that every link target in the six files exists.
5. **A repository search** of tracked markdown outside `handoff/`, `node_modules/` and
   `.claude/worktrees/` for any statement that a work package or UI round is still awaiting
   its gate or audit, or is not accepted. Record the hits. Expected: none after the fix.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the files changed, with one line per changed statement;
- the R-UX5RN-3 diff output;
- the preflight exit code;
- the diff scope;
- the digest before and after, with the file count;
- the parity result;
- the search result.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5. HEAD dc487c6; no change outside `handoff/` before the edit.
- Reproduced: DEVELOPMENT(.vi).md:3 said WP4 awaiting WP4-GATE, not accepted.
- DEVELOPMENT.md/.vi.md:3: README status plus WP5 handoff link.
- docs/12:7 EN/VI: one rule (last WP5 freeze commit, gated and audited); "The release is that commit" removed; docs-only commits plural.
- docs/12:119 EN/VI: slices-ran clause restored; Dockerfile and `vite.config.ts` named.
- README step 3: EN list comma fixed; VI comma added.
- R-UX5RN-3: `git diff --stat 1fe5ad3 dc487c6 -- Dockerfile vite.config.ts` empty, exit 0.
- Preflight exit 0. Diff scope: the six files only (8+/8-).
- Digest before 2072e3f2...fb99b, after 690fd8fd...1c4f, 882 files both (docs changed, no digest written).
- Parity: headings 9/9, 4/4, 11/11; new links exist; DEVELOPMENT link count differs by 1 in EN/VI as before.
- Stale-status search: no hits.
- Evidence: `handoff/delivery/evidence/WP5-UX5-FIX20/`.

Status: done
