# WP5-ASSESS-A dispatch brief

- Mission/task: timesheet-software-readiness / WP5-ASSESS-A; package WP5; kind audit;
  attempt 1; depends on WP4-REGATE4 (PASS, gate of the same freeze) and WP5-PLAN.
- Scope: the first WP5 step, a fresh independent assessment of the WP1–WP4 release
  candidate, area A: **integrated workflow, submission and privacy.**
- Profile/routing: timesheet-auditor (xhigh), model opus, override reason `size_risk`.
  docs/08 says an audit is never below the strongest author model. Routing: size L,
  risk H, novelty yes.
- Fresh context: you authored no WP1–WP5 change and ran none of the WP4 or WP5 audits.
  WP5-ASSESS-B runs at the same time in its own folder; share nothing with it.
- Language: the task record is in English. `WP5_REVIEW_A.md` and its `.vi.md` follow the
  REVIEW form.
- Target: `reviewed_commit` = 546cddaf6747aef85e8b6d9b7712de9e28f138bf, the WP4-REGATE4
  `freeze_commit`. Gate digest of record:
  26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files). HEAD is
  e7fe514, which changes only handoff/. Record HEAD and the digest before and after: in
  the repository, in the `git ls-tree` form and on your export.

## Read

- AGENTS.md, from disk.
- [WP5_REVIEW](../../prompts/WP5_REVIEW.md) and the documents it names: docs/02, docs/05,
  docs/06, docs/07 and docs/09.
- [WP5-PLAN](WP5-PLAN.md), sections A, B ("WP5-ASSESS-A" and the shared rules), F and
  G. The plan defines your scope and checks. It is not evidence, and its triage is not
  an audit.
- The WP1–WP4 acceptance records in `handoff/delivery/WP*_HANDOFF.md` and the carried
  risks in `handoff/delivery/STATE.json`. Inspect prior evidence; do not trust summaries.

## Scope

Follow WP5-PLAN section B, "WP5-ASSESS-A", items 1–7:
1. the integrated two-week workflow (AC-13);
2. historical correction;
3. approved partial OT use;
4. second-user isolation and shares;
5. the overdue and restart path, through `run-jobs --once --now`;
6. sender and channel faults (AC-14);
7. the overall verdict under the docs/06 block list.

Execute the checks yourself:
- a clean export, `npm ci`, `npm run verify` and `npm run test:e2e`;
- targeted suite re-runs;
- your own scenario probe over HTTP.

Use synthetic data and local capture only.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-ASSESS-A`. Ports 47700–47719 for your
  servers and `SMOKE_PORT`. No Docker.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Users use `example.invalid` addresses only.
- Render PDF pages as `*-synthetic.png` and view them.
- Follow every rule in WP5-PLAN section G. In particular:
  - **NEVER feed anything to python or node through stdin.**
  - Never pipe into head or tail.
  - Use Git Bash only, never cmd.exe, and never an interactive shell.
  - Stop only servers your probe spawned, through their own handle. Never kill by PID.
  - Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report.
- Do not fix anything, send real mail or set `PRODUCTION_SENDING_ENABLED`.

## Output

- `handoff/delivery/WP5_REVIEW_A.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-ASSESS-A/`:
  - probes saved as `*.mjs.txt`;
  - capture listings with `example.invalid` recipients and the PDF SHA-256;
  - renders only as `*-synthetic.png`;
  - the process listing at the end.
  - Run the precommit check over your evidence before hand-back.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately, each
  with file and function, reproduction, expected and actual results, rule or AC ID, and
  a bounded fix. Keep risks and optional improvements apart from defects.
- Separate software readiness, owner permission and the real pilot outcome.
- Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Attempt 2 (coordinator note): area-A delta recheck on the package-final freeze

Attempt 1 passed on 546cdda, digest 26fcc969. After it, these WP5 writers changed the
source:
- WP5-FIXB: docs/11, `.env.example` and a `compose.example.yaml` comment;
- WP5-AC13: the new `tests/integration/ac13-two-week.test.ts` and its helper;
- WP5-REL: docs/12, docs/11 and README.

So area A needs a digest-bound recheck.

Who runs it: a fresh opus auditor. The auditor must not be:
- a72a6550bd47db0ff;
- the WP5-ASSESS-B auditor;
- the WP5-FINAL-AUDIT auditor;
- a WP1–WP5 author.

Target: `reviewed_commit` = the WP5-GATE `freeze_commit`, given in the dispatch prompt.

Scope:
1. **Delta since 546cdda.** List every non-handoff path that changed. Confirm that
   no application source changed. Judge each docs change against the area-A rules:
   - docs/05 submission and notifications;
   - AC-14;
   - privacy;
   - the separation of readiness, permission and outcome.
2. **The AC-13 test.**
   - Check that `tests/integration/ac13-two-week.test.ts` asserts what attempt 1's
     probe showed: the 14 dates, OT 8:30, the ledger posting once, the restart with
     no blind resend, the correction, the double-spend refusal, isolation and the
     overdue path.
   - Check that it is deterministic.
   - Rerun it, and repeat one of its mutations in a scratch copy.
3. **Reruns.**
   - Rerun `npm ci`, `npm run verify` and `npm run test:e2e` on a clean export.
   - Rerun your own short probe for the attempt-1 items that the test does not
     cover: shares and revocation, sender and recipient faults, and secrets absent
     from logs, health and CLI output.
4. **Earlier conclusions.** Confirm attempt 1's conclusions still apply, and judge
   risks R-WA1..R-WA8 again.

Runtime: folder `D:\.claude-tmp\timesheet\WP5-ASSESS-A2`; ports 47700–47719; no
Docker. All the attempt-1 runtime rules apply. **Never feed anything to python or node
through stdin.**

Report: `handoff/delivery/WP5_REVIEW_A2.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-ASSESS-A2/`. Append "### Auditor result (attempt 2)" to
the Results section below.

## Results

(Auditor appends here.)

Self-reported model: claude-opus-5-5 (profile timesheet-auditor; requested opus/xhigh; effort not observable).
Status: done. Decision: **PASS** (area A). Report: `handoff/delivery/WP5_REVIEW_A.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-ASSESS-A/` (index `00-README.txt`).

### Baseline and digest binding

- `reviewed_commit` `546cddaf6747aef85e8b6d9b7712de9e28f138bf`. HEAD = `origin/main` = `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`;
  `git diff --stat 546cdda e7fe514 -- . ':!handoff'` empty.
- Digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 files) before (20:22 UTC) and after every run (20:58 UTC):
  repository `scripts/source-digest.mjs`, `git ls-tree` form of HEAD and of `546cdda`, and the `git archive 546cdda` export
  (no non-ignored change in the export after every run). Files `00-baseline.txt`, `99-digest-after.txt`.

### Commands (all on the clean export, Node v24.21.0 by full path, npm 11.18.0, Git Bash as npm script shell)

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | 161 packages, lockfile unchanged, no deprecation line |
| `npm run verify` (`SMOKE_PORT=47701`) | 0 | 76 files / 1,758 tests; build; SMOKE PASSED (41) |
| `npm run test:e2e` | 0 | 145 passed, 5 skipped |
| `vitest run` (18 integration suites + `tests/domain`) | 0 | 28 files / 747 tests |
| `node probe/ac13.mjs` (run of record 12; port 47702) | 0 | 77 PASS, 0 FAIL |
| `node probe/faults.mjs` (run of record 3; port 47703) | 0 | 12 PASS, 0 FAIL |
| `netstat -ano`, `ps -W` | 0 | no listener on 47700-47719; no process of this task left |

Earlier probe runs are kept and explained in `10-probe-run-history.txt` (probe defects fixed in the probe; one probe-side
keep-alive reset after synchronous `spawnSync` passes, retried once and recorded as `NET-1`).

### AC-13 run outcome

PASS. Pilot-shaped instance (production mode, https example.invalid origin, capture, bootstrap CLI and setup token), five
synthetic users. Alice's two-week period (confirmed and unknown breaks, flexible start, N boundaries 30/31/45/46, both Sundays,
Friday overnight, holiday, 4 h + 4 h leave, choose-mode deficit, clock and manual entries) reviewed and signed: total 8:30, ledger
posted once; restarts before and after the PDF, send once; correction (reason, r2, +30 only, r1 kept, no send on edit), resend,
injected uncertain outcome (no blind resend, explicit decision), frozen envelope; partial OT use with concurrent refusals; 28
swapped-id refusals for the second user and the administrator; shares and revocation; deadline runs (activation boundary,
downtime recovery oldest first, never-configured and before-account periods untouched, overdue once, automatic presentation with
image/note options, late review zero delta); sender/recipient faults visible and never "sent"; no secret in logs, health,
readiness or CLI output. PDFs rendered and viewed (`*-synthetic.png`).

### Findings

None.

### Risks (separate from defects; details in the report)

R-WA1 (Low) outcome-notice wording after downtime recovery; R-WA2 (Low) partial leave not visible on the PDF; R-WA3 (Low, carried
WP3 R8 extended) never-configured accounts, including the bootstrap administrator, get before-due reminders after activation;
R-WA4 (Info) a share change issues a new id; R-WA5 (Info) probe-side keep-alive reset; R-WA6 (Info, WP3 R1) long holiday label
ellipsis; R-WA7 (Info) the live runner path is covered by e2e and suites, not by the CLI-driven probe; R-WA8 (Info) days without
records print "Worked" on automatic PDFs (owner decision).

### Not covered here

Area B scope (reproducible release, restore, drill, image, `npm audit --omit=dev`, runbook); real SMTP; NAS; a process kill during
a live send (covered by failure injection and the `delivery-crash`/`jobs-restart` suites).

### Readiness, permission, pilot

Software readiness of area A: PASS at `546cdda` / `26fcc969…` (workstation, capture). Owner permission: none requested or given.
Pilot result: none.

### Files written

`handoff/delivery/WP5_REVIEW_A.md`, `handoff/delivery/WP5_REVIEW_A.vi.md`, this results section, and
`handoff/delivery/evidence/WP5-ASSESS-A/` (29 files including 4 renders). Nothing else in the repository was changed. Nothing is
left running.

### Precommit check

`scripts/precommit-check.mjs` over this task's files (report pair, this brief, the evidence folder), staged in a private git dir
outside the repository: run 1 BLOCK (2 findings: the probe line form "person.password = secret();", a run-time random value);
the probes were changed to `Object.assign` and re-run (AC-13 run 12, fault run 3, both all PASS); run 2 PASS (31 files, 0
findings); run 3, last, after this section was written, is recorded in `97-precommit.txt`.

### Next action

The coordinator records WP5-ASSESS-A as PASS at digest `26fcc969…`, waits for WP5-ASSESS-B, then follows WP5-PLAN section E;
R-WA1 to R-WA3 and R-WA8 go to the owner and the pilot packet.
