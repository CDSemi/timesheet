# WP5-UX5-FIX2-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX2-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX2 (done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk M (a fast-forward before the commit), novelty no.
- **Authority.** AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the
  owner's decisions of 2026-10-22, verbatim on the board ("A.a, B.A, C.b"):
  - **A a:** fast-forward local main to origin/main 70dce2a before this commit. The two
    commits between, 6173f07 and 70dce2a, are the owner's Ingat work; take them as they
    are;
  - **C b: no push.** Commit locally only. Do not run `git push` in any form.
- **What this commit freezes:**
  - the tests-only fix of the regate race: `expect.poll` on one round trip in
    `theme.spec.ts` and `shell.spec.ts`, plus a deterministic test;
  - the font walk in `wordmarkAsset.test.ts` skipping `.claude/` (owner decision B a).

  **Coordinator records it also carries:**
  - the FIX1-FREEZE results and evidence;
  - the REGATE (FAIL) record and evidence;
  - DIAG1;
  - the REMOTE-RECON lookup;
  - the FIX2 record and its path lookup;
  - the drafts of REGATE2 and audits A and B;
  - NEXT_ACTION, STATE, the board and the checkpoint pair.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO
    INTERACTIVE SHELLS.
  - Python checks use the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
    Node 24 goes first on PATH.
  - **Staging rule.** Name every path literally in plain `git add` calls of at most about
    20 paths. The four evidence folders below are staged as directory paths. Never use
    `--pathspec-from-file`, `xargs`, a list file, a glob, `-A` or `.`.
  - **If a permission check denies any call, stop at once and report the reason exactly.
    Do not retry it in another form.**
  - Keep this brief's Results short. Long listings go to `checks.txt`.
- **Leave the owner's worktree alone.** Never touch `.claude/worktrees/` or its branch
  `claude/relaxed-lalande-8359f0`.
- The coordinator writes no file while you run.

## Steps

1. Run `node --version`. HEAD must be 2bce0ab5842b80c710f23496d5173c122319e5c7.
2. Run `git fetch origin`; origin/main must be 70dce2a… (the full SHA as fetched). If
   origin/main is anything else, stop and report.
3. `git diff --cached --name-status` must be empty.
4. **The working tree outside `handoff/`** is exactly these 3 modified files; anything else
   stops the commit:
   - `tests/client/wordmarkAsset.test.ts`;
   - `tests/e2e/shell.spec.ts`;
   - `tests/e2e/theme.spec.ts`.
5. **The overlap check.** `git diff --name-only HEAD origin/main` against
   `git status --short`. Any shared path stops the commit.
6. **The fast-forward.** Run `git merge --ff-only origin/main`. It must succeed with HEAD =
   origin/main. If git refuses, stop and report; never merge any other way.
7. After the fast-forward:
   - `git status --short` outside `handoff/` still shows exactly the 3 files of step 4;
   - `git diff --stat` of those 3 files is unchanged from before the fast-forward (record
     both);
   - run `npm run digest` with Node 24 and record it as **D_PRE**.
8. **Stage:**
   - the 3 test files;
   - the 10 modified handoff files:
     - `handoff/NEXT_ACTION.md`, `handoff/NEXT_ACTION.vi.md`;
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md`, `.vi.md`;
     - `handoff/delivery/tasks/WP5-UX5-AUDIT-A.md`, `WP5-UX5-AUDIT-B.md`,
       `WP5-UX5-FIX1-FREEZE.md`, `WP5-UX5-REGATE.md`;
   - the four evidence folders, as directories:
     - `handoff/delivery/evidence/WP5-UX5-DIAG1/`;
     - `handoff/delivery/evidence/WP5-UX5-FIX1-FREEZE/`;
     - `handoff/delivery/evidence/WP5-UX5-REGATE/`;
     - `handoff/delivery/evidence/WP5-UX5-REMOTE-RECON/`;
   - the new task records:
     - `handoff/delivery/tasks/WP5-UX5-DIAG1.md`, `WP5-UX5-FIX2.md`,
       `WP5-UX5-FIX2-PATHS.md`, `WP5-UX5-REGATE2.md` (a draft), `WP5-UX5-REMOTE-RECON.md`;
     - this brief, as it stands before you add Results.

   If `git status` shows another path under `handoff/`, follow the usual rule:
   - stage it, and list it, only if it is a `tasks/WP5-UX5-*.md`, a `.txt` or
     `-synthetic.png` under `evidence/WP5-UX5-*/`, `STATE.json` or `NEXT_ACTION*`;
   - any other path stops the commit.
9. **Basenames.** Any staged basename that contains "signature" without "synthetic" is
   renamed with `git mv` to insert `-synthetic` before the extension. The regate's
   `evidence/WP5-UX5-REGATE/13-integ-signatures.txt` is one; list every rename.
10. **Scans.** Run the key and PEM scan (the rule of `WP5-UX4-FIX3-FREEZE.md`) on the new
    evidence folders. Any `zz-*` file under `src/`, `tests/`, `scripts/` or `docs/` stops
    the commit; `zz-*.txt` probe copies under `evidence/` are allowed.
11. Run `node scripts/precommit-check.mjs`.
    - A `profile-path` finding in an evidence log may be masked: replace the account part
      with `<user>`, then re-stage.
    - An evidence file over the size limit may be left out: unstage that one file with
      `git restore --staged -- <path>`, and list it.
    - An email other than `@example.invalid`, a Message-ID other than `@timesheet.invalid`,
      or any other finding stops the commit.
12. Run these checks:
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `validate_orchestration.py`;
    - `check_recovery.py` (106);
    - `validate_package.py --preflight`.
13. **Commit on main. Do not push.** Then compute the `git ls-tree` digest of HEAD. It must
    equal D_PRE.
14. Record each step with its exit code in
    `handoff/delivery/evidence/WP5-UX5-FIX2-FREEZE/checks.txt`. Save the final message as
    `commit-message.txt` in the same folder. Leave both, and this brief's Results,
    unstaged.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`, the basename renames of step 9, and the masking and unstaging of step 11.
Anything else that fails stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix the shell-bar test race and skip .claude/ in the font scan (WP5-UX5-FIX2)

- test(e2e): `theme.spec.ts` and `shell.spec.ts` read `--shell-bar-size` and the rendered
  bar in one round trip and poll until they match.
  - Background: a ResizeObserver writes the property one to a few frames after the bar
    resizes.
  - A deterministic test resizes the bar through CSSOM and waits for the property.
- test(client): the font walk in `wordmarkAsset.test.ts` skips `.claude/`, which holds
  tooling and local worktrees and never app assets. A stray font anywhere else still
  fails.
- docs(handoff):
  - the FIX1-FREEZE results;
  - the REGATE record (FAIL on one test race) and evidence;
  - the DIAG1 diagnosis;
  - the REMOTE-RECON lookup (two owner commits outside the mission, and a local
    worktree);
  - the FIX2 record and path lookup;
  - the REGATE2 and audit drafts;
  - NEXT_ACTION, STATE, the board and the checkpoint (+ vi).
- On top of the owner's 6173f07 and 70dce2a (fast-forward, owner decision A a). Not pushed
  (owner decision C b).

Task: WP5-UX5-FIX2 (WP5-UX5-REGATE finding; owner decisions A a, B a, C b)
Gate: WP5-UX5-REGATE FAIL on 2bce0ab; REGATE2 pending
Audit: pending (round-5 audits)
Digest: D_PRE (was 70975091 at 2bce0ab)

## Report

Append to this brief, briefly:
- HEAD before, after the fast-forward, and after the commit;
- the commit SHA, with `pushed: no`;
- D_PRE and the HEAD `ls-tree` digest;
- the staged counts per group;
- the renames;
- any masking or unstaging;
- every check with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- HEAD: 2bce0ab (before), 70dce2a (after fast-forward), 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 (after commit); pushed: no.
- D_PRE = HEAD digest = 59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad.
- Staged 213 files; one rename (13-integ-signatures.txt to 13-integ-signatures-synthetic.txt); no masking or unstaging.
- All checks exit 0. Details in evidence/WP5-UX5-FIX2-FREEZE/checks.txt.
