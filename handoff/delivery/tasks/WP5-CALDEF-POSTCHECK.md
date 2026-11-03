# WP5-CALDEF-POSTCHECK lookup brief (read-only validator run on the software_ready board)

- **Lookup.** Mission timesheet-software-readiness, auxiliary lookup WP5-CALDEF-POSTCHECK,
  attempt 1. Read-only.
- **Profile and routing.** timesheet-light, requested haiku (a command run and a listing).
- **Why.** The accept commit 9aba1e7 (WP5-CALDEF-ACCEPT) passed every validator on the
  staged board. After it, the coordinator recorded the commit and set the board to
  `software_ready` with `next_task_id` null. Those last edits are uncommitted. This lookup
  checks that the final board and STATE still validate.

## Steps

1. **Git state.**
   - `git rev-parse HEAD origin/main`: both must be 9aba1e70e6461fc5d1183ec71270aad9d4df1b25.
   - `git status --short --untracked-files=all`: record it. Expect only handoff records:
     - the board, STATE, the checkpoint pair and NEXT_ACTION pair;
     - the WP5-CALDEF-ACCEPT brief and its evidence;
     - this brief;
     - the four known leftovers.

     Nothing may appear outside `handoff/`.
2. **Validators.** Run these with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
   a scratch `tzdata` on `PYTHONPATH` outside the repository if `validate_package.py` needs
   one):
   - `python handoff/delivery/validate_orchestration.py`;
   - `python handoff/delivery/validate_orchestration.py --non-product-range b810ba9..HEAD`;
   - `python handoff/delivery/check_recovery.py` (141 probes);
   - `python handoff/delivery/validate_package.py --preflight`.

   Record each exit code and the last lines of each output.
3. **Digest.** Run `npm run digest`, with Node 24 first on PATH. It must be
   52ec1fc748fa1e8eabd63d628abee9c1c77666a24ebf250ef66c26d1dd96dc07 (885 files).

## Limits

- **Read-only.** Change no file except this brief's Results. Create no evidence folder.
  Write scratch files only in `D:\.claude-tmp\timesheet\WP5-CALDEF-POSTCHECK`.
- **Git.** Do not stage, commit or push. Change no git configuration.
- **Shell.** Use Git Bash. NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
  `python -c`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout` OR `nul`
  REDIRECTS, NO `rm -r`, NO `sed -i`.
- **If a validator fails,** report every error line verbatim. Do not fix anything.
- **If a permission check denies a call,** stop and report it.

## Return

Return at most 100 words, beginning with "Self-reported model: ...". Include:
- HEAD and origin/main;
- the git status groups;
- each validator's exit code and summary;
- the digest.

Append the same to Results.

## Results

Self-reported model: claude-haiku-5-5

- HEAD = origin/main = 9aba1e70e6461fc5d1183ec71270aad9d4df1b25.
- Git status, all under `handoff/`, nothing else: modified NEXT_ACTION pair, ORCHESTRATION.json, STATE.json, WORKFLOW_REVISION_CHECKPOINT pair, tasks/WP5-CALDEF-ACCEPT.md. Untracked: WP5-CALDEF-ACCEPT evidence files, WP5-UX5-DIAG6/REGATE7/REGATE8 leftovers, tasks/WP5-CALDEF-POSTCHECK.md.
- validate_orchestration.py: exit 0, PASS (9 profiles, 582 tasks, 0 active).
- validate_orchestration.py --non-product-range b810ba9..HEAD: exit 0, PASS, no product paths.
- check_recovery.py: exit 0, PASS, 141 probes, board not modified.
- validate_package.py --preflight: exit 0, PASS (143 pairs, 2629 links, 91 scenarios).
- npm run digest (Node 24.21.0): exit 0, 52ec1fc748fa1e8eabd63d628abee9c1c77666a24ebf250ef66c26d1dd96dc07 (885 files), matches.
