# WP5-UX5-REMOTE-RECON lookup brief (commits and a worktree made outside the mission)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-REMOTE-RECON,
  read-only. It must finish before any further freeze.
- **Profile and routing.** timesheet-verifier (effort medium); requested model sonnet.
  This is a reconciliation of state the mission did not make (docs/08 "reconcile an
  interruption").
- **Why.** The WP5-UX5-FIX2 worker (attempt 3) reported two things.
  - The local `origin/main` ref is 70dce2a, ahead of HEAD 2bce0ab. The new commits touch
    `.github`, docs, an `ingat.toml` and `handoff`, and were not made by the mission's
    committer.
  - An untracked checkout exists at `.claude/worktrees/relaxed-lalande-8359f0/`. A font in
    it makes `wordmarkAsset.test.ts` fail when `npm run verify` runs in the repository.

  The next freeze must not push on top of, or merge, work the coordinator does not know
  about.
- **Write only** this brief's Results section (short) and
  `handoff/delivery/evidence/WP5-UX5-REMOTE-RECON/` (masked LF `.txt`). **Change nothing
  else:**
  - no `git pull`, `merge`, `rebase`, `reset`, `checkout`, `switch`, `restore`, `stash`,
    `add`, `rm` or `commit`;
  - no change to any worktree or branch;
  - no deletion.

  `git fetch origin` is allowed; it only updates remote-tracking refs.

## Steps (Git Bash; redirect each output to a file in the task folder and read it with Read)

1. HEAD, `git rev-parse origin/main` before and after `git fetch origin`, and
   `git status --short --branch`.
2. **The commits** in `HEAD..origin/main`. For each one record:
   - the full SHA, the date and the subject;
   - `git show --name-status --format=` (the files);
   - whether its author identity equals the author identity of 2bce0ab (yes or no only).
     Do not write any email address; write `<email>`.
3. **The overlap.** Compare every path changed in `HEAD..origin/main` with every path in
   `git status --short` (the mission's uncommitted work). List each path in both. For each
   handoff file in both, say whether the remote change and the local change touch the same
   lines: run `git diff HEAD origin/main -- <path>` and `git diff -- <path>`, both
   redirected.
4. **What changed outside `handoff/`:** the diff stat, and a short description of each
   file. For `ingat.toml`, what it is, from its first 30 lines, with any secret-looking
   value masked. Also the `.github` files. Does any of it touch a governance path
   (AGENTS/CLAUDE, `.claude/`, `docs/08`, `handoff/prompts`, `handoff/templates`,
   `.agents`, `docs/agents`, the validators, `scripts/precommit-check.mjs`)?
5. **The worktree:**
   - `git worktree list --porcelain`;
   - for `.claude/worktrees/relaxed-lalande-8359f0`: its branch, its HEAD,
     `git -C <path> status --short` (counts and paths only), and whether its branch is
     pushed;
   - `git check-ignore -v .claude/worktrees/relaxed-lalande-8359f0` (is it ignored?);
   - whether the repository's `git status` lists it.
6. **Is something still using it?** List the processes whose command line contains
   `relaxed-lalande` (name, PID, start time, masked command line), for example with
   `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object
   CommandLine -like '*relaxed-lalande*' | Select-Object ProcessId, Name, CreationDate,
   CommandLine | Format-List"` redirected to a file. **Stop nothing.**
7. **The digest.** `npm run digest` (Node 24 first on PATH): record the full value and the
   file count. Say whether the digest script reads files under `.claude/worktrees` (read
   `scripts/source-digest.mjs`).
8. **Which tests scan the working directory** and would see the worktree: list them (for
   example `wordmarkAsset.test.ts`) with file:line.

## Results to write (short)

- The commits (SHA, date, subject, files, author same as 2bce0ab yes or no), and any
  governance path among them.
- The overlap with uncommitted work, and the conflict risk per path.
- The worktree: branch, HEAD, dirty or not, ignored or not, in use or not.
- The full digest, and whether the worktree affects it.
- Your summary of the options. **Do not choose one; the owner decides.** For example:
  - fast-forward HEAD to `origin/main` before the next freeze;
  - commit first and merge;
  - ignore `.claude/worktrees` for the scanning tests.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-REMOTE-RECON`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail` IN BASH, NO
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- No email address and no real profile path in the evidence (`<email>`, `<user>`).
- If a permission check denies a call, stop and report. Do not retry it another way.
- Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...'.

## Results

Evidence: handoff/delivery/evidence/WP5-UX5-REMOTE-RECON/ (s1..s8). Nothing but fetch run.

- **Commits** (fetch changed nothing; origin/main 70dce2a, main behind 2, no ahead). Author identity same as 2bce0ab: yes, both.
  - 6173f07 2026-10-22 ci(deploy): add the Ingat manifest and the GHCR image workflow. 203 files: `ingat.toml`, `.github/workflows/image.yml` and `ingat-validate.yml`, docs 07 and 11 (+vi), ADR 0002 (+vi), INGAT handoff/evidence/tasks.
  - 70dce2a 2026-10-22 docs(handoff): record the INGAT-T0T8 commit and CI runs. handoff only.
  - Governance paths (AGENTS/CLAUDE, .claude, docs/08, prompts, templates, .agents, docs/agents, scripts): none. ingat.toml is the Ingat deploy manifest (no secrets in first 30 lines).
- **Overlap** with uncommitted work: none, zero shared paths, so no conflict expected; a fast-forward would not touch the dirty files.
- **Worktree** `.claude/worktrees/relaxed-lalande-8359f0`: branch claude/relaxed-lalande-8359f0 (local only), HEAD 70dce2a (= origin/main), dirty (1 modified, 1 untracked handoff path, INGAT-T0T8-RECORD), ignored via .git/info/exclude, not in git status, no process uses it. It is a full copy of the repo, including font files.
- **Digest** 3ca01b9ce42da2ce48c6b6f53664b30ce7e8b9391130b57125a4787cf2d19f84 (870 files). Uses git ls-files with exclude-standard, so the ignored worktree does not affect it.
- **Scanning tests**: tests/client/wordmarkAsset.test.ts:135-140 (walks ROOT for fonts, sees the worktree); userWording.test.ts:46 and wordmarkAsset.test.ts:30 also use readdirSync.
- **Options (owner decides)**: fast-forward to origin/main before freeze; commit first, then merge; make the walking tests skip .claude/worktrees; remove the worktree (owner action).

Status: done
