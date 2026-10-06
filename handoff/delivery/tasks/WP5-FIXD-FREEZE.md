# WP5-FIXD-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXD-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-FIXD.
- This commit freezes the WP5 documentation fix round (WP5-F-01, WP5-F-02, WP5-A2-01
  and WP5-A2-02). It also carries:
  - the WP5-GATE results;
  - the pilot packet;
  - the WP5-ASSESS-A attempt-2 and WP5-FINAL-AUDIT reviews.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (many evidence files, synthetic renders and audit probes), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  74d5bfec6700126da4105b5d97f5efe943f896f5. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-FIXD-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be `docs/11_OPERATIONS_RUNBOOK.md` and
`.vi.md`, from WP5-FIXD. Any other changed or untracked path outside handoff/ stops the
commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
1b8ceae441a1f41a51086303cc12b8e06ddfe9fc405cf2d5bb01baba12896af7 (779 files).

## Handoff files to stage

New files:
- `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
- `handoff/delivery/WP5_REVIEW_A2.md`, `WP5_REVIEW_A2.vi.md`, `WP5_REVIEW_FINAL.md`
  and `WP5_REVIEW_FINAL.vi.md`;
- `handoff/delivery/tasks/WP5-FIXD.md`;
- this brief, as it stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`: `WP5-REL-FREEZE/`,
  `WP5-GATE/`, `WP5-PILOT/`, `WP5-ASSESS-A2/`, `WP5-FINAL-AUDIT/` and `WP5-FIXD/`.

Modified files:
- `handoff/delivery/tasks/WP5-REL-FREEZE.md`, `WP5-GATE.md`, `WP5-PILOT.md`,
  `WP5-ASSESS-A.md` and `WP5-FINAL-AUDIT.md`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-FIXD-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` file under `evidence/`.

PNG files are allowed only under the listed evidence folders, and only when named
`*-synthetic.png`. View each staged PNG with the Read tool and record how many you
viewed. Each must show synthetic data only.

**Secrets check.** The WP5-FINAL-AUDIT evidence includes `b01-*.txt` files. Those
files record a synthetic env file and a bootstrap response. Use the Grep tool on them,
and on every staged evidence file, for unmasked password, token, secret or setup-key
values. Record only the count, and never print a match. If any value is not masked or
clearly synthetic, stop and report the file name.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-FIXD-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check. Record its file count.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace each such token with `<email>` or `<user>` in that file only, then
  re-stage and rerun. Count the tokens with the Grep tool and never print them.

When to stop:
- A block in a docs file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Correct the pilot runbook status checks and deep-link test

- docs(ops) (WP5-F-01, WP5-A2-01, WP5-A2-02): docs/11 (+ vi) sections 13–16 now:
  - name the status facts the screen shows;
  - check the sending flag in the env file without printing values;
  - name the server, `backup` and `restore` as the parts that refuse to start;
  - replace the capture self-test deep-link check with a direct link check, and check
    the first reminder link;
  - add notes for root on DSM, the browser paste guard, the zone display, and an
    inspection-only restored instance on the capture env copy.
- docs(handoff):
  - WP5-GATE PASS on 74d5bfe;
  - the pilot packet (+ vi) with synthetic samples; WP5-F-02 corrected;
  - WP5_REVIEW_A2 and WP5_REVIEW_FINAL (+ vi), both FIX REQUIRED, with evidence;
  - board, STATE and checkpoint (+ vi).

Task: WP5-FIXD-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the number of PNGs viewed;
- the secrets Grep count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
