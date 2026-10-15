# WP5-UX3-GOV-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV-GATE; board package GOV; kind
  gate; attempt 1; depends on WP5-UX3-GOV-FREEZE (done).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: the WP5-UX3-GOV-FREEZE commit (board `WP5-UX3-GOV-FREEZE.commit_sha`). HEAD must
  equal it and nothing outside `handoff/` may differ from it. Writable: this report and
  `handoff/delivery/evidence/WP5-UX3-GOV-GATE/` only. Change no source, doc, governance or
  state file.
- Context: the owner asked on 2026-10-15 to stop enforcing the industrial style and use a
  modern style (board `owner_decisions`, U-01; mockup approved with changes, G-1 b).
  WP5-UX3-GOV replaced the AGENTS.md section "Unified Frontend & UI/UX Standards (Taste
  Skills Integration)" and its AGENTS.vi.md counterpart with the text of
  `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section B2.

## Checks (one command per step; record each exit code)

1. `node --version` (Node 24 first on PATH; must be v24.x). `git rev-parse HEAD` and
   `git status --porcelain=v1 -uall` (only `handoff/` paths may appear).
2. `npm run digest` before and after all other checks: both must equal the freeze digest
   a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files).
3. `python handoff/delivery/validate_orchestration.py` (workflow Python) exit 0.
4. `check_recovery.py` exit 0; report the probe count (expected 106).
5. `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence); report the scenario total.
6. `npm run verify` with `SMOKE_PORT` in 48560-48569 and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder: exit 0.
7. `git diff --check 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334..HEAD` exit 0, and the list of
   changed paths outside `handoff/` in that range (`git diff --name-only`): exactly
   `AGENTS.md` and `AGENTS.vi.md`. List every governance path (docs/08 "Governance
   scope") that changed in the range.
8. Wording, with `git grep -n` on the two files (names, line numbers and counts only in
   evidence):
   - forbidden (must be 0 matches): `Industrial`, `industrial`, `B2B`, `semiconductor
     hardware`, `công nghiệp`, `bán dẫn`, `transition: all`;
   - required: the EN heading `### Frontend and UI/UX standards` and the VI heading `###
     Tiêu chuẩn giao diện và UI/UX`, four numbered items in each, `src/client/styles.css`,
     `--transition`, `prefers-reduced-motion`, `WCAG 2.2 AA`;
   - the section text equals the B2 blocks (compare the file lines with the fenced blocks
     of the plan and report equal or the differing lines).

Decision: PASS / FAIL / NOT VERIFIED.

## Runtime

- Git Bash only; never `cmd.exe` or an interactive shell. **NEVER FEED ANYTHING TO PYTHON
  OR NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER
  PIPE INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`. NEVER `rm
  -rf`.** Redirect to a file in `D:\.claude-tmp\timesheet\WP5-UX3-GOV-GATE` and read it
  with the Read tool. Never kill processes by PID. Confirm before returning that nothing
  of yours is still running.
- Mask user paths as `<user>`; evidence LF `.txt` only with a single final newline.
- If a permission check denies a call, stop and report.

## Return

At most 150 words, beginning with 'Self-reported model: ...': HEAD, both digests, each
check with its exit code and counts, the changed paths, the wording result, the decision.

## Results
