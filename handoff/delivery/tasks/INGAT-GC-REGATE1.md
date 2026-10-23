# INGAT-GC-REGATE1 dispatch brief (verifier gate on the GC-FIX1 snapshot)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-REGATE1, kind gate, attempt 1. It depends
  on INGAT-GC-FIX1 (done), which answers INGAT-GC-GATE attempt 1 (FAIL, item 6). This is
  the package-final snapshot of the cleanup, so it is a full gate, not a delta gate.
  Worktree `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`.
  Not on `ORCHESTRATION.json`; do not edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium), requested model sonnet, no
  override. Routing: size M, risk H, novelty no. Write the task record in English.
- **No source writer is active.** You edit no source.

## Snapshot identity

- Base commit: worktree HEAD (expected `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`).
- `handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt` and the digest the FIX1
  Results record last (see "Snapshot at dispatch").
- Earlier snapshot for the delta: `handoff/delivery/evidence/INGAT-GC-IMPL/snapshot-sha256.txt`.

## Gate

Run every item of `handoff/delivery/tasks/INGAT-GC-GATE.md` ("Gate", items 1-10) on the
new snapshot, with these changes:
- item 2 adds the delta: only `tests/integration/ghcr-cleanup.test.ts` and, if FIX1 says
  so, `scripts/ghcr-cleanup.ts` differ from the IMPL list; for the script, show that the
  diff against the IMPL version is only `export` keyword(s) (the IMPL version is not in
  git: take it from FIX1's pre-edit copy in its task folder only after checking its hash
  against the IMPL list, or reconstruct it by removing the added keywords and checking
  the hash);
- item 6 covers seven mutations: the six of the first gate (release rule, untagged rule,
  non-SHA-tag rule, future-date check, floors, the line-139 "every version would be
  deleted" abort) and the line-136 "must not be deleted" check; at least one test fails
  for each.

Decision: PASS only if every item passed and the identity is unchanged.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-GC-REGATE1/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-REGATE1`. Nothing else.

## Runtime

The Runtime section of `handoff/delivery/tasks/INGAT-GC-GATE.md` applies unchanged, with
this task folder. In capitals again: **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES
INTO `head` OR `tail` (ALSO NOT FOR `ls`), NO `/dev/null` OR `nul`, NO `rm -r`, NO PID
KILLS, NO INTERACTIVE SHELLS.** No GitHub write, no `gh`, nothing against the owner's NAS,
no npm install in the repository, no staging, committing or pushing. End the file with
exactly one newline after "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...', with the Decision.

## Snapshot at dispatch

- INGAT-GC-FIX1 attempt 1 done (self-reported claude-sonnet-5-5): exported `assertSafe`
  (one `export` keyword) and added three crafted-list tests; 15 paths in
  `evidence/INGAT-GC-FIX1/snapshot-sha256.txt`; final source digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`. Its pre-edit copies
  are in `D:\.claude-tmp\timesheet\INGAT-GC-FIX1` (check their hashes against the IMPL list
  before use).

## Results

Verifier: timesheet-verifier, attempt 1. Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/INGAT-GC-REGATE1/`;
task folder `D:\.claude-tmp\timesheet\INGAT-GC-REGATE1`. Node v24.21.0 first on PATH; npm 11.19.1 (system, run by Node 24).

| # | Check | Exit | Result |
|---|---|---|---|
| 1 | Identity first: 15 hashes against FIX1 list, digest, status, HEAD | 0 | 15 OK; digest `e47e6344...ee56` (882 files); HEAD `70dce2a`; no node_modules in worktree |
| 2 | Scope and delta | 0 | `image.yml`, `ingat-validate.yml`, `ingat.toml`, `Dockerfile`, `compose.example.yaml`, `package*.json`, `src/**` empty diff vs HEAD. IMPL vs FIX1 lists differ in exactly 2 paths: the script and the test. FIX1 pre copies hash-equal to IMPL (`80b55372...`, `ab74b205...`); script diff vs pre = one line, `export` added to `assertSafe`; test +41 lines |
| 3 | Clean export, 15 hashes OK, `npm ci`, cleanup test, typecheck, lint, `npm test`, `npm run verify` | 0 each | 29 tests; 101 files / 2374 tests; `SMOKE PASSED`; no "deprecat" in any output |
| 4 | Owner decisions | n/a | Script delta is only `export`; workflow and docs hashes unchanged from the first gate, where read and confirmed; tests assert defaults 20/30, floors 10/7, no cap, no PAT |
| 5 | Dry runs `--now 2026-11-01T00:00:00Z` and refusals | 0 / 1 | Defaults keep 35 delete 5; floor options keep 15 delete 25 (equal to first gate); refusals exit 1: keep-newest 9, keep-days 6, `--apply` with file, `--max-delete` |
| 6 | Seven mutations on the export copy | 1 each | Release rule: 5 fail; untagged: 4; non-SHA tag: 4; future date: 1; floors 1/1: 3; line-139 abort removed: 1 fail (`assertSafe refuses a list in which every version is marked for deletion`); line-136 throw removed: 1 fail (`assertSafe refuses a deletion that breaks a protection rule, each rule on its own`); no-op control: 13 fail. Script restored, sha256 `4302a44f...` equals snapshot |
| 7 | actionlint 1.7.12 digest-pinned, `--network none`; SHA pins; `git ls-remote` | 0 | No finding; pin check PASS (4+3+1); setup-node v7.1.0 `949feb24...`, checkout v7.0.1 `3d3c42e5...` equal the pins |
| 8 | Parity x4, `--preflight`, `git diff --check` | 0 | PARITY OK x4; preflight PASS, 127 pairs; diff --check clean |
| 9 | Privacy gate on scratch repo | 0 | PASS, 182 staged, 0 blocking, 0 warnings; `diff --cached --check` flags only other tasks' evidence logs under `handoff/`, none outside it |
| 10 | Identity last | 0 | 15 hashes OK; digest unchanged; HEAD unchanged; status differs from first only by this task's own evidence files |

The first gate's finding (line 139 not covered) is closed: both internal checks are now caught by a test. No gh, no GitHub write,
nothing staged, committed or pushed; no background command left running.

Decision: PASS

Status: done
